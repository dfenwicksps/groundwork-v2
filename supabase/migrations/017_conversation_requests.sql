-- ============================================================
-- Migration 017 — Ask by link
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The conversation steps (Who Was I?, What They Care About, Where We Come
-- From, How They Chose) ask a student to put a few questions to someone else.
-- Instead of having the conversation, a student can make a private link and
-- send it themselves (text, email, WhatsApp). The person answers on a page
-- that needs no account, and the answers come back into the step.
--
-- The app never sends anything and never stores the other person's contact
-- details: only the label the student typed ("Grandma") and the name the
-- person chose to sign with.
--
-- Access: the student manages their own rows through RLS. Someone holding a
-- link gets no table access at all, only the two functions below, which act
-- on the one row whose token they hold.

create table if not exists public.conversation_requests (
  id uuid primary key default gen_random_uuid(),
  -- 244 random bits, hex. Unguessable, and the only thing a link carries.
  token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  user_id uuid references public.users(id) on delete cascade not null,
  mission_id int not null,
  activity_id text not null,
  -- How the student introduced themselves ("Sam") and who it's for ("Grandma").
  from_name text not null check (char_length(from_name) between 1 and 40),
  for_label text not null check (char_length(for_label) between 1 and 40),
  -- The questions as the student saw them, so the link reads the same even if
  -- the wording in the app changes later.
  questions jsonb not null check (jsonb_typeof(questions) = 'array'),
  answers jsonb,
  responder_name text,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '30 days') not null,
  answered_at timestamptz,
  -- When the student first saw the answers; unseen ones are flagged on Home.
  seen_at timestamptz
);

create index if not exists conversation_requests_user_activity_idx
  on public.conversation_requests (user_id, activity_id, created_at desc);

alter table public.conversation_requests enable row level security;

drop policy if exists "Users can manage own conversation requests" on public.conversation_requests;
create policy "Users can manage own conversation requests"
  on public.conversation_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- What the answer page shows. Nothing about the student beyond the name they
-- chose to give, and nothing at all once the link has expired or been used.
create or replace function public.get_conversation_request(p_token text)
returns table (
  from_name text,
  for_label text,
  questions jsonb,
  activity_id text,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.from_name,
    r.for_label,
    case when r.answered_at is null and r.expires_at > now() then r.questions else '[]'::jsonb end,
    r.activity_id,
    case
      when r.answered_at is not null then 'answered'
      when r.expires_at <= now() then 'expired'
      else 'open'
    end
  from public.conversation_requests r
  where r.token = p_token;
$$;

-- Saves the answers, once. Returns 'ok', or why not: 'not_found', 'answered',
-- 'expired' or 'invalid'.
create or replace function public.answer_conversation_request(
  p_token text,
  p_answers jsonb,
  p_responder text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.conversation_requests%rowtype;
  a jsonb;
begin
  select * into r from public.conversation_requests where token = p_token for update;
  if not found then return 'not_found'; end if;
  if r.answered_at is not null then return 'answered'; end if;
  if r.expires_at <= now() then return 'expired'; end if;

  if p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) <> jsonb_array_length(r.questions)
     or char_length(coalesce(p_responder, '')) > 60 then
    return 'invalid';
  end if;
  for a in select * from jsonb_array_elements(p_answers) loop
    if jsonb_typeof(a) <> 'string' or char_length(a #>> '{}') > 3000 then
      return 'invalid';
    end if;
  end loop;
  -- At least one real answer: something other than spaces, tabs or newlines.
  if not exists (
    select 1 from jsonb_array_elements_text(p_answers) t where t ~ '\S'
  ) then
    return 'invalid';
  end if;

  update public.conversation_requests
     set answers = p_answers,
         responder_name = nullif(btrim(p_responder, E' \t\r\n'), ''),
         answered_at = now()
   where id = r.id;
  return 'ok';
end;
$$;

revoke all on function public.get_conversation_request(text) from public;
revoke all on function public.answer_conversation_request(text, jsonb, text) from public;
grant execute on function public.get_conversation_request(text) to anon, authenticated;
grant execute on function public.answer_conversation_request(text, jsonb, text) to anon, authenticated;
