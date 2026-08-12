-- ============================================================
-- Migration 005 — The 10-Week Character Program + the weekly five
-- Run in Supabase → SQL Editor → New Query. Requires 004.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The weekly five reuses the check-in table from 004 rather than duplicating
-- it: same shape (jsonb answers, kept history), different question set.
-- 'standard' = the three-part test, 'weekly' = the weekly five.
alter table public.standard_checkins
  add column if not exists set text not null default 'standard';

drop index if exists standard_checkins_user_created_idx;
create index if not exists standard_checkins_user_set_created_idx
  on public.standard_checkins (user_id, set, created_at desc);

-- One row per user per program week. A week is only created once the student
-- actually starts it, so an absent row means "not started" rather than "failed".
create table if not exists public.program_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  week int not null check (week between 1 and 10),
  -- Ticked units: day indices 0-6 for daily challenges, 0..n-1 for session ones
  days jsonb not null default '[]'::jsonb,
  -- The student's own promise (week 4) or hill (week 5)
  commitment text,
  reflection text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  unique (user_id, week)
);

create index if not exists program_progress_user_week_idx
  on public.program_progress (user_id, week);

alter table public.program_progress enable row level security;

drop policy if exists "Users can manage own program progress" on public.program_progress;
create policy "Users can manage own program progress"
  on public.program_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
