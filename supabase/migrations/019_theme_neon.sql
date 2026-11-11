-- ============================================================
-- Migration 019 — Add the Neon look
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- A fourth look, 'neon' (cyberpunk: electric cyan and magenta on a violet
-- night sky), joins light, dark and bold. Until this runs, picking Neon still
-- works on the device; saving it to the account fails and ThemeSync retries.
alter table public.users
  drop constraint if exists users_theme_check;

alter table public.users
  add constraint users_theme_check
  check (theme is null or theme in ('light', 'dark', 'bold', 'neon'));
