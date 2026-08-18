// ─── Scaffolding tiers ────────────────────────────────────────────────────────
// A blank box is the single biggest reason a reflection goes unfinished — most
// sharply at 14, where the barrier is rarely unwillingness and almost always
// not knowing how to start a sentence about yourself.
//
// The three tiers differ by how much structure the student gets, not by how
// much they're expected to write:
//
//   quick     — tap a complete answer someone else has worded
//   extended  — complete a sentence someone else has started
//   open      — a blank box
//
// The tier is a floor, never a ceiling: a Quick answer lands in the same
// editable textarea as everything else, so a student who taps an option can
// immediately keep typing. Nothing a student writes is ever discarded by
// tapping — options and stems insert, they don't replace.

export type Tier = "quick" | "extended" | "open";

export const TIERS: { key: Tier; label: string; blurb: string }[] = [
  {
    key: "quick",
    label: "Quick",
    blurb: "Tap an answer that fits. No writing needed — you can still edit it after.",
  },
  {
    key: "extended",
    label: "Extended",
    blurb: "Start with a half-written sentence and finish it in your own words.",
  },
  {
    key: "open",
    label: "Open",
    blurb: "A blank box. Write it however you want.",
  },
];

const KEY = "groundwork_scaffold_tier";
/** The old two-mode key this replaces — migrated on first read, never written. */
const LEGACY_KEY = "groundwork_learning_mode";
export const TIER_EVENT = "groundwork:tier";

export function readTier(): Tier {
  if (typeof window === "undefined") return "quick";
  const stored = localStorage.getItem(KEY);
  if (stored === "quick" || stored === "extended" || stored === "open") return stored;
  // Carry across anyone who already chose a mode under the old system, so
  // upgrading doesn't silently reset them to the most scaffolded tier.
  return localStorage.getItem(LEGACY_KEY) === "advanced" ? "open" : "quick";
}

export function writeTier(tier: Tier): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, tier);
  window.dispatchEvent(new CustomEvent(TIER_EVENT, { detail: tier }));
}

// ─── The content shape ────────────────────────────────────────────────────────

export interface Scaffold {
  /** Complete answers, in a teen's own register — tapped, then editable. */
  quick?: string[];
  /** Sentence openings the student finishes. Trailing space is added on insert. */
  stems?: string[];
  /**
   * "Stuck? try this" — angles into the question, never answers to it. A hint
   * that hands over an answer removes the thinking the question exists to cause.
   */
  stuck?: string[];
}

/**
 * Insert scaffold text into whatever the student has already written, rather
 * than overwriting it. Tapping a second option after typing appends instead of
 * destroying the first attempt.
 */
export function insertText(current: string, addition: string): string {
  const base = current.trimEnd();
  if (!base) return addition;
  // A finished sentence starts a new line; an unfinished one continues inline.
  return /[.!?]$/.test(base) ? `${base}\n${addition}` : `${base} ${addition}`;
}

/** True when this scaffold has anything to offer at the given tier. */
export function hasTierContent(s: Scaffold | undefined, tier: Tier): boolean {
  if (!s) return false;
  if (tier === "quick") return !!s.quick?.length;
  if (tier === "extended") return !!s.stems?.length;
  return false;
}
