-- ============================================================
-- Migration 003 — Goals, strength practice log, moral compass
-- Run in Supabase → SQL Editor → New Query on project dirlmfopqazpqwieelip
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Practical goals (WOOP-lite: wish → outcome → obstacle → plan)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  domain text not null check (domain in ('school','life','future')),
  wish text not null,
  outcome text,
  obstacle text,
  plan text,
  linked_value text,
  linked_strength text,
  status text not null default 'active' check (status in ('active','done','archived')),
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  reflection text
);

-- Strength-in-action practice log (non-streak: a record, not a scoreboard)
create table if not exists public.practice_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  strength_key text not null,
  action text not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  reflection text
);

-- Moral decision-making profile (one row per user; retake overwrites)
create table if not exists public.moral_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  style_scores jsonb not null,
  primary_style text not null,
  secondary_style text,
  taken_at timestamptz default now() not null
);

-- raw per-question picks so a retake pre-fills previous answers
alter table public.moral_profiles add column if not exists answers jsonb;

alter table public.goals enable row level security;
alter table public.practice_log enable row level security;
alter table public.moral_profiles enable row level security;

drop policy if exists "Users can manage own goals" on public.goals;
create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own practice log" on public.practice_log;
create policy "Users can manage own practice log"
  on public.practice_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own moral profile" on public.moral_profiles;
create policy "Users can manage own moral profile"
  on public.moral_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
