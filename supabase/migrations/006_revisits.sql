-- ============================================================
-- Migration 006 — Longitudinal revisits
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Until now a revisit was linked to its original only by naming convention
-- ("{activity_id}-revisit"), which allowed exactly one revisit per activity and
-- conflated two attempts at the same activity. An explicit parent makes the
-- chain real: an entry can be revisited again and again, and each revisit knows
-- precisely which entry it is looking back at.
alter table public.journal_entries
  add column if not exists revisit_of uuid references public.journal_entries(id) on delete cascade;

create index if not exists journal_entries_revisit_of_idx
  on public.journal_entries (revisit_of, created_at);

-- Backfill the existing convention-based revisits so nobody loses their history.
-- Each "-revisit" entry is linked to that user's most recent matching entry
-- written before it — so where an activity was retaken, the revisit attaches to
-- the attempt it actually followed.
--
-- Written as a correlated subquery in SET rather than UPDATE ... FROM LATERAL:
-- the update target cannot be referenced from a LATERAL item in FROM, which
-- fails with "invalid reference to FROM-clause entry".
--
-- Rows with no matching original are simply left null. The `revisit_of is null`
-- guard makes re-running safe — already-linked rows are never rewritten.
update public.journal_entries r
set revisit_of = (
  select o.id
  from public.journal_entries o
  where o.user_id = r.user_id
    and o.activity_id = left(r.activity_id, length(r.activity_id) - length('-revisit'))
    and o.created_at < r.created_at
  order by o.created_at desc
  limit 1
)
where r.revisit_of is null
  and r.activity_id like '%-revisit';
