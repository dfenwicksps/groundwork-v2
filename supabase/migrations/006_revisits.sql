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
-- For each "-revisit" entry, link it to that user's most recent matching entry
-- written before it.
update public.journal_entries r
set revisit_of = o.id
from lateral (
  select o.id
  from public.journal_entries o
  where o.user_id = r.user_id
    and o.activity_id = left(r.activity_id, length(r.activity_id) - length('-revisit'))
    and o.created_at < r.created_at
  order by o.created_at desc
  limit 1
) o
where r.revisit_of is null
  and r.activity_id like '%-revisit';
