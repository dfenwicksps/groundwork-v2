-- ============================================================
-- Migration 004 — The Standard (recurring three-question check-in)
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- One row per check-in — history is the point, so nothing is overwritten.
-- `answers` is keyed by StandardKey ('safer' | 'value' | 'trust'), which keeps
-- the question set changeable without a schema migration each time.
create table if not exists public.standard_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- History is always read newest-first for one user.
create index if not exists standard_checkins_user_created_idx
  on public.standard_checkins (user_id, created_at desc);

alter table public.standard_checkins enable row level security;

drop policy if exists "Users can manage own standard checkins" on public.standard_checkins;
create policy "Users can manage own standard checkins"
  on public.standard_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
