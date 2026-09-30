-- ============================================================
-- Migration 012 — Life stage on the account
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- "What year are you in?" only offered Year 7-9, 10-11 and 12, so everyone
-- aged roughly 18 to 23 — a third of Groundwork's audience — had no answer that
-- fitted. It also lived only in a cookie, so it was lost on a new phone.
--
-- The question is now "Where are you at right now?" with two post-school
-- stages added. The school stages keep their old values, so existing cookies
-- mean what they always did; the app copies a cookie-only choice onto the
-- account on the student's next visit.
alter table public.users
  add column if not exists life_stage text;

alter table public.users
  drop constraint if exists users_life_stage_check;

alter table public.users
  add constraint users_life_stage_check
  check (life_stage is null or life_stage in ('junior', 'middle', 'senior', 'leaver', 'adult'));
