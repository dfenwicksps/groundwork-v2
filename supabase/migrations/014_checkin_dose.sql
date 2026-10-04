-- ============================================================
-- Migration 014 — Check-in context and dose
-- Run in Supabase → SQL Editor → New Query, after 013.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Two things that make the check-in evaluable (see src/lib/checkin.ts):
--   context  'onboarding' when the start check-in was taken before any
--            mission (a clean baseline), 'home' when it was taken later.
--   dose     how much of the app the student had used when they answered:
--            required mission steps, missions and program weeks done, whether
--            they'd written a Character Code, and days since joining. Change
--            can then be read against use.
-- Both are written by the server (/api/checkin), not the browser.
alter table public.outcome_checkins
  add column if not exists context text;

alter table public.outcome_checkins
  drop constraint if exists outcome_checkins_context_check;

alter table public.outcome_checkins
  add constraint outcome_checkins_context_check
  check (context is null or context in ('onboarding', 'home'));

alter table public.outcome_checkins
  add column if not exists dose jsonb;
