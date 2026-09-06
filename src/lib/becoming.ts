// ─── "Who I'm becoming" ───────────────────────────────────────────────────────
// One artefact, two doors.
//
// The app used to ask the same question twice, in two vocabularies. Program
// week 1 asked for "five character qualities you'd want people to use when
// describing you at 25" — free text, kept nowhere. The profile's "Who I'm
// becoming" asked for "one or two qualities to focus on this term" — chosen
// from eight Boosts. A student who did both met two different lists and two
// different answers to the same question, and neither knew about the other.
//
// They are now one thing, in the VIA-24 vocabulary the rest of the app already
// speaks:
//
//   qualities — the five you want to be described by at 25 (the direction)
//   focus     — the one or two of those five you're working on now (the work)
//
// Using VIA-24 for both is what makes the artefact worth having: the same 24
// strengths come out of Mission 1's Strengths Mapping, so the five you want can
// be set directly against the five you already lead with, and every quality
// already has a concrete weekly practice action (STRENGTH_ACTIONS).

import { STRENGTH_BY_KEY, strengthName } from "./strengths";
import { STRENGTH_TO_BOOST, STRENGTH_ACTIONS } from "./boosts";

/**
 * Stored as a journal entry, the way values-clarifier and character-code are.
 * The id is inherited from the old profile-only section so existing choices
 * migrate rather than being orphaned — see parseBecoming.
 */
export const BECOMING_ACTIVITY_ID = "focus-qualities";

export const QUALITIES_COUNT = 5;
export const FOCUS_MAX = 2;

export interface Becoming {
  /** VIA keys — the five wanted at 25 */
  qualities: string[];
  /** VIA keys — the one or two being worked on now; always a subset of qualities */
  focus: string[];
}

export const EMPTY_BECOMING: Becoming = { qualities: [], focus: [] };

/**
 * Boost key → VIA key, for reading entries written before the merge. Derived
 * from STRENGTH_TO_BOOST rather than restated, so the two can't drift.
 */
export const BOOST_TO_STRENGTH: Record<string, string> = Object.fromEntries(
  Object.entries(STRENGTH_TO_BOOST).map(([strength, boost]) => [boost, strength])
);

/** Accepts a VIA key, or a Boost key from before the merge. */
export function toStrengthKey(key: string): string | null {
  if (STRENGTH_BY_KEY[key]) return key;
  const mapped = BOOST_TO_STRENGTH[key];
  return mapped && STRENGTH_BY_KEY[mapped] ? mapped : null;
}

function readKeyLine(response: string, prefix: string): string[] {
  const line = response
    .split("\n")
    .find((l) => l.trim().startsWith(`${prefix}:`));
  if (!line) return [];
  return line
    .trim()
    .slice(prefix.length + 1)
    .split(",")
    .map((k) => toStrengthKey(k.trim()))
    .filter((k): k is string => !!k);
}

/**
 * Reads both the current format and the pre-merge one.
 *
 * Before the merge the entry held only `keys:` — one or two *Boost* keys, with
 * no five-at-25 at all. Those are read as the focus and mapped to their nearest
 * VIA strength, so a student who had chosen Courage and Empathy keeps Bravery
 * and Social Intelligence rather than losing their choice. They're seeded into
 * `qualities` too, because a focus has to be a subset of the five and asking
 * them to re-pick from scratch would throw away a real decision.
 */
export function parseBecoming(response: string | null | undefined): Becoming {
  if (!response) return EMPTY_BECOMING;

  const qualities = dedupe(readKeyLine(response, "qualities"));
  const focus = dedupe(readKeyLine(response, "focus"));
  if (qualities.length || focus.length) {
    return {
      qualities,
      // A focus outside the five is meaningless — drop rather than display it.
      focus: focus.filter((k) => qualities.includes(k)).slice(0, FOCUS_MAX),
    };
  }

  const legacy = dedupe(readKeyLine(response, "keys")).slice(0, FOCUS_MAX);
  return { qualities: legacy, focus: legacy };
}

export function serialiseBecoming(b: Becoming): string {
  const focus = b.focus.filter((k) => b.qualities.includes(k)).slice(0, FOCUS_MAX);
  // Two human-readable lines first: this entry shows up in the journal, and a
  // student reading it back should meet sentences, not key-value pairs.
  const lines = [
    `Who I'm becoming at 25: ${b.qualities.map(strengthName).join(", ")}`,
  ];
  if (focus.length) {
    lines.push(`Working on right now: ${focus.map(strengthName).join(" + ")}`);
  }
  lines.push(`qualities:${b.qualities.join(",")}`);
  lines.push(`focus:${focus.join(",")}`);
  return lines.join("\n");
}

function dedupe(keys: string[]): string[] {
  return Array.from(new Set(keys));
}

/** The growth plan for one quality: what it means, and one thing to do. */
export function practiceFor(key: string): { inPractice: string; action: string } {
  return {
    inPractice: STRENGTH_BY_KEY[key]?.short ?? "",
    action:
      STRENGTH_ACTIONS[key] ?? "Use this strength in a new way this week.",
  };
}

/**
 * The deeper Boost guide behind a quality, where one exists. Eight of the 24
 * have one; the rest have their practice action and definition, which is what
 * the other sixteen were always going to get.
 */
export function boostKeyFor(key: string): string | undefined {
  return STRENGTH_TO_BOOST[key];
}
