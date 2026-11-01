-- ============================================================
-- Migration 018 — Look (light / dark / bold) on the account
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The Look setting first lived only in the browser, so it was lost on a new
-- phone or laptop. It now lives on the account and the browser keeps a copy,
-- which is what lets the look apply before first paint. A browser-only choice
-- is copied onto the account on the student's next visit.
--
-- null = no choice made: follow the phone's light/dark setting.
alter table public.users
  add column if not exists theme text;

alter table public.users
  drop constraint if exists users_theme_check;

alter table public.users
  add constraint users_theme_check
  check (theme is null or theme in ('light', 'dark', 'bold'));
