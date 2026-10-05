-- ============================================================
-- Migration 015 — Completion counts
-- Run in Supabase → SQL Editor → New Query, after 014.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Totals only: how many students have signed up, finished each mission step,
-- and started and finished each program week. Nothing here can say who did
-- what, and none of it touches anything a student wrote. The privacy page
-- describes these counts ("What we count"), and scripts/completion-report.ts
-- reads them, hiding any count under five.
--
-- They're built from progress the app already keeps (mission_progress,
-- program_progress, users), so nothing new is collected.

create or replace view public.signup_counts as
  select
    count(*)::int as students,
    count(*) filter (where onboarding_complete)::int as onboarded
  from public.users;

create or replace view public.step_completion_counts as
  select
    mission_id,
    activity_id,
    count(distinct user_id)::int as students
  from public.mission_progress
  group by mission_id, activity_id;

create or replace view public.week_completion_counts as
  select
    week,
    count(*)::int as started,
    count(*) filter (where completed_at is not null)::int as finished
  from public.program_progress
  group by week;

-- Views run with their owner's rights, so they see past the per-student row
-- security on the tables underneath. That's what makes the totals possible,
-- and it's why nobody signed in to the app may read them: only the server's
-- service role can.
revoke all on public.signup_counts from anon, authenticated;
revoke all on public.step_completion_counts from anon, authenticated;
revoke all on public.week_completion_counts from anon, authenticated;

grant select on public.signup_counts to service_role;
grant select on public.step_completion_counts to service_role;
grant select on public.week_completion_counts to service_role;
