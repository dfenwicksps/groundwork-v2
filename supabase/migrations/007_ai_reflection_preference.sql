-- ============================================================
-- Adds the user-facing privacy preference promised in /privacy:
-- the ability to stop reflections ever being sent to the
-- follow-up-question service. Safe to re-run.
-- ============================================================

alter table public.users
  add column if not exists ai_reflections_enabled boolean default true not null;

comment on column public.users.ai_reflections_enabled is
  'When false, /api/reflect refuses to send this user''s journal text off-platform.';
