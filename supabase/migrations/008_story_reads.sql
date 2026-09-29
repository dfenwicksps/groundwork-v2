-- ============================================================
-- Migration 008 — Story engagement (read + actioned)
-- Run in Supabase → SQL Editor → New Query.
-- Safe to run on an existing database (idempotent).
-- ============================================================

-- Stories had no per-user state at all: nothing recorded that a student had
-- read one, and the "Write about this" links carried a ?prompt= param that the
-- activity page never consumed. This table gives each (user, story) pair two
-- independent timestamps:
--   read_at     — the student got to the end of the story (scrolled to the
--                 reflection prompts, or finished the animated telling)
--   actioned_at — the student followed one of the story's reflection prompts
--                 into the journal
-- The stories list shows the same green tick the missions list uses once both
-- are set.
create table if not exists public.story_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  read_at timestamptz,
  actioned_at timestamptz,
  unique(user_id, story_id)
);

alter table public.story_reads enable row level security;

-- story_reads: own rows only
drop policy if exists "Users can manage own story reads" on public.story_reads;
create policy "Users can manage own story reads"
  on public.story_reads for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
