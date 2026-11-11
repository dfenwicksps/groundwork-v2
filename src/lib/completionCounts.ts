// ─── Completion counts ────────────────────────────────────────────────────────
// Totals of how many students finish each mission step and program week, so
// it's possible to see where the app loses people. Built from progress the app
// already keeps (supabase/migrations/015_completion_counts.sql); nothing new is
// collected, and nothing a student wrote is involved. The privacy page
// describes them under "What we count".
//
// The privacy policy promises notice in the app before a change that matters
// takes effect, so the counts were announced first (a card on Home) and may
// only be read from two weeks later. scripts/completion-report.ts enforces it.

/** When the counts were announced in the app and on the privacy page. */
export const COUNTS_ANNOUNCED = "2026-10-06";

/** The first day the totals may be read. */
export const COUNTS_START = "2026-10-20";

/** Any count below this is shown as "fewer than 5", so a small group can't be picked out. */
export const SMALL_COUNT = 5;

export function shownCount(n: number): string {
  return n > 0 && n < SMALL_COUNT ? `fewer than ${SMALL_COUNT}` : String(n);
}

// ─── Story totals ─────────────────────────────────────────────────────────────
// How many students open, finish and reflect on each story
// (supabase/migrations/021_story_counts.sql), so the multimedia review's
// question, whether the stories earn their place, can be answered with data.
// Announced the same way as the step counts: a card on Home and the privacy
// page, then two weeks before anything is read.
//
// If this ships later than STORY_COUNTS_ANNOUNCED, move both dates so the
// notice has been live for two weeks before STORY_COUNTS_START.

/** When story totals were announced in the app and on the privacy page. */
export const STORY_COUNTS_ANNOUNCED = "2026-11-03";

/** The first day story totals may be read. */
export const STORY_COUNTS_START = "2026-11-17";
