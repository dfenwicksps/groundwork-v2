-- ============================================================
-- Migration 002 — VIA-24 character strengths profile
-- Run in Supabase → SQL Editor → New Query on project dirlmfopqazpqwieelip
-- Safe to run on an existing database (idempotent).
-- ============================================================

create table if not exists public.strength_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  scores jsonb not null,
  ranking text[] not null,
  taken_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Raw per-scenario picks so a retake can pre-fill previous answers
alter table public.strength_profiles add column if not exists answers jsonb;

alter table public.strength_profiles enable row level security;

drop policy if exists "Users can manage own strength profile" on public.strength_profiles;
create policy "Users can manage own strength profile"
  on public.strength_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
