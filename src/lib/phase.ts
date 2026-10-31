// ─── The three-phase journey ──────────────────────────────────────────────────
// Groundwork builds a student's self-portrait in three deepening passes rather
// than asking for open-ended reflection cold:
//
//   Phase 1 — First pass:  tap/click answers only. A fast, complete first picture.
//   Phase 2 — Review:      go back over those answers, change them, add detail
//                          in your own words — a more accurate picture.
//   Phase 3 — Deepen:      reflect, modify and add freely — the richest, most
//                          detailed account of who this person is.
//
// Phase is a single GLOBAL state for the whole journey (stored on users), and it
// AUTO-UNLOCKS in sequence (see lib/phaseServer.ts for the earn rules). The phase
// sets the DEFAULT writing depth by mapping onto the existing scaffold Tier
// (lib/scaffold.ts) — a student can always choose to go deeper within an
// activity, so the phase is a floor, never a ceiling.

import type { Tier } from "./scaffold";

export type Phase = 1 | 2 | 3;

/** Shape of users.phase_meta (jsonb). All fields optional / tolerant. */
export interface PhaseMeta {
  /** When the student first reached each phase (ISO strings). */
  phase2_at?: string;
  phase3_at?: string;
  /** Anchor activity ids the student has revisited while in Phase 2. */
  reviewed?: string[];
}

/** The missions whose first pass must be complete to unlock Phase 2. */
export const CORE_MISSION_IDS = [1, 2, 3, 4];

/**
 * The handful of identity anchors Phase 2 asks the student to revisit. Once all
 * of these have been reopened and re-saved in Phase 2, Phase 3 unlocks. These
 * are the same artefacts the Me page treats as the core of the portrait.
 */
export const ANCHOR_ACTIVITY_IDS = [
  "strengths-mapping",
  "values-clarifier",
  "commitment-statement",
  "future-self",
];

/**
 * Where each anchor lives, for the Phase 2 checklist. Without it Phase 2 was a
 * banner saying "review your answers" with one link, and no way to see which
 * reviews were done or what was left before Phase 3.
 */
export const ANCHOR_LINKS: Record<string, { label: string; href: string }> = {
  "strengths-mapping": { label: "Your strengths", href: "/missions/1/activities/strengths-mapping" },
  "values-clarifier": { label: "Your values", href: "/missions/1/activities/values-clarifier" },
  "commitment-statement": { label: "What you're committing to", href: "/missions/2/activities/commitment-statement" },
  "future-self": { label: "Your future self", href: "/missions/4/activities/future-self" },
};

/** The default writing depth for each phase. */
export function phaseToTier(phase: Phase): Tier {
  if (phase >= 3) return "open";
  if (phase === 2) return "extended";
  return "quick";
}

export interface PhaseInfo {
  phase: Phase;
  /** Short name shown on the banner */
  name: string;
  /** One line: what this phase is for */
  blurb: string;
  /** The call to action for the phase the student is currently in */
  cta: string;
}

export const PHASE_INFO: Record<Phase, PhaseInfo> = {
  1: {
    phase: 1,
    name: "First pass",
    blurb: "Tap your way through to build a fast first picture of yourself.",
    cta: "Finish your first pass",
  },
  2: {
    phase: 2,
    name: "Review & add",
    blurb: "Go back over your answers, change what's shifted, and add detail in your own words.",
    cta: "Review your answers",
  },
  3: {
    phase: 3,
    name: "Deepen",
    blurb: "Reflect, modify and add freely — build the richest picture of who you are.",
    cta: "Go deeper",
  },
};

/**
 * Work out the phase a student has earned from their progress signals. Pure, so
 * it's easy to test and the same rule runs on every page. The result is clamped
 * to never go backwards from `stored`.
 *
 *  1 → 2: the first pass of the core missions is complete.
 *  2 → 3: every anchor has been revisited (recorded in phase_meta.reviewed),
 *         which can only happen once the student is in Phase 2.
 */
export function earnedPhase(
  stored: Phase,
  signals: { firstPassComplete: boolean; reviewedAnchors: Iterable<string> }
): Phase {
  const reviewed = new Set(signals.reviewedAnchors);
  const allAnchorsReviewed = ANCHOR_ACTIVITY_IDS.every((id) => reviewed.has(id));

  let earned: Phase = 1;
  if (signals.firstPassComplete) earned = 2;
  // Only a student already in Phase 2 can have reviewed anchors, so this gate is
  // naturally reached after 1 → 2.
  if (stored >= 2 && allAnchorsReviewed) earned = 3;

  return (Math.max(stored, earned) as Phase);
}

export function parsePhase(v: unknown): Phase {
  return v === 2 || v === 3 ? v : 1;
}
