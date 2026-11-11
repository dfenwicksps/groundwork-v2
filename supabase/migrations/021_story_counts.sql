-- ============================================================
-- Migration 021 — Story opens, and story totals
-- Run in Supabase → SQL Editor → New Query, after 015 and 008.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- The multimedia review (docs/evidence/multimedia-review.md) asks whether the
-- stories earn their place. The app already records, per student, when a story
-- is finished (read_at) and reflected on (actioned_at). This adds when it was
-- opened (the latest time), so totals can show where students drop off: opened → finished
-- → reflected.
alter table public.story_reads
  add column if not exists opened_at timestamptz;

-- Totals only, like the step counts (015): how many students opened, finished
-- and reflected on each story. Nothing here can say who did what, and none of
-- it touches what anyone wrote. The privacy page describes these counts
-- ("What we count"); scripts/completion-report.ts reads them, hides any count
-- under five, and won't show them before STORY_COUNTS_START
-- (src/lib/completionCounts.ts).
--
-- A finish or reflection with no opened_at (recorded before this migration)
-- still counts as opened: the student can't have finished it unopened.
create or replace view public.story_engagement_counts as
  select
    s.id as story_id,
    s.mission_id,
    s.title,
    count(r.user_id) filter (
      where r.opened_at is not null or r.read_at is not null or r.actioned_at is not null
    )::int as opened,
    count(r.user_id) filter (where r.read_at is not null)::int as finished,
    count(r.user_id) filter (where r.actioned_at is not null)::int as reflected
  from public.stories s
  left join public.story_reads r on r.story_id = s.id
  group by s.id, s.mission_id, s.title;

-- Views run with their owner's rights, so only the server's service role may
-- read the totals; nobody signed in to the app can.
revoke all on public.story_engagement_counts from anon, authenticated;
grant select on public.story_engagement_counts to service_role;
