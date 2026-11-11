-- ============================================================
-- Migration 020 — Small steps, and checking back on them
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- After a reflection a student can name one small thing they'll do, and when
-- (src/lib/smallSteps.ts). Until now it was only a line on the end of the
-- journal entry that nothing read again. Kept here, it can be followed up:
-- Home asks "Did you do it?" once it's due, and done steps are listed on the
-- Me page. The entry keeps its text copy as before.
--
-- One step per entry: changing it replaces it (unique entry_id).
create table if not exists public.small_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  entry_id uuid references public.journal_entries(id) on delete cascade,
  source_kind text not null check (source_kind in ('activity', 'week', 'weekly', 'next')),
  source_key text not null,
  source_label text,
  step text not null,
  when_label text,
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'done', 'dropped')),
  snoozes int not null default 0,
  done_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint small_steps_entry_unique unique (entry_id)
);

create index if not exists small_steps_user_due_idx
  on public.small_steps (user_id, status, due_at);

alter table public.small_steps enable row level security;

drop policy if exists "Users can manage own small steps" on public.small_steps;
create policy "Users can manage own small steps"
  on public.small_steps for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
