-- The three-phase identity journey (see src/lib/phase.ts).
-- A single global phase per student: 1 = first pass (tap only), 2 = review &
-- add detail, 3 = deepen. phase_meta holds the unlock timestamps and the set of
-- anchor activities revisited in Phase 2. Both default so existing students
-- simply start at Phase 1; the app degrades gracefully if this hasn't run.

alter table public.users add column if not exists journey_phase int not null default 1;
alter table public.users add column if not exists phase_meta jsonb;
