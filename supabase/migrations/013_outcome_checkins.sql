-- ============================================================
-- Migration 013 — Outcome check-ins
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Nine questions a student answers near the start and again near the end
-- (src/lib/checkin.ts), so they can see what moved and so it can be shown,
-- in aggregate, whether Groundwork helps.
--
-- `item_set` records which wording the answers were given to. The first set is
-- Groundwork's own interim items; validated scales, once licensed, go in as a
-- new set and are never averaged together with it.
create table if not exists public.outcome_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  wave text not null check (wave in ('start', 'end')),
  item_set text not null,
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  life_stage text,
  created_at timestamptz default now() not null
);

create index if not exists outcome_checkins_user_created_idx
  on public.outcome_checkins (user_id, created_at desc);

alter table public.outcome_checkins enable row level security;

drop policy if exists "Users can manage own outcome checkins" on public.outcome_checkins;
create policy "Users can manage own outcome checkins"
  on public.outcome_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
