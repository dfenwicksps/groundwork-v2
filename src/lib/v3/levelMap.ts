// ─── The map: four names, seven levels, 25 selves ────────────────────────────
// David's structure for v3 (docs/v3/DECISIONS.md D50, D52, D53): the seven
// levels are the one structure of the program, grouped under the four names
// the missions used to carry. Every mission step and program week lives in a
// level (docs/v3/level-map.md).
//
// The levels are a map, not a ladder (D3). Students see names, never numbers
// (D52): `level` below is for sorting and for matching the master file, and
// must not be shown to a student. Nothing here is locked, counted or ranked.
//
// For the first working version this is data in code. The selves' names and
// one-liners are copied from the master file and a test keeps them equal to it
// (levelMap.test.ts); the same test checks every step and week is placed once.

import { MISSIONS } from "@/lib/missions";
import { PROGRAM_WEEKS } from "@/lib/program";

export type GroupKey = "identity" | "connection" | "purpose" | "meaning";

export interface MapSelf {
  key: string;
  name: string;
  short: string;
}

export interface MapLevel {
  /** For sorting only. Never shown to a student. */
  level: number;
  key: string;
  name: string;
  selves: MapSelf[];
  /** Mission step ids and "week-N", in the order they're offered. */
  pieces: string[];
}

export interface MapGroup {
  key: GroupKey;
  name: string;
  question: string;
  levels: MapLevel[];
}

export const LEVEL_MAP: MapGroup[] = [
  {
    key: "identity",
    name: "Identity",
    question: "Who am I?",
    levels: [
      {
        level: 1,
        key: "know-myself",
        name: "Know myself",
        selves: [
          { key: "self-awareness", name: "Self-awareness", short: "Noticing what's going on inside me, as it happens." },
          { key: "self-reflection", name: "Self-reflection", short: "Looking at yourself with curiosity, and coming out with something." },
          { key: "self-concept", name: "Self-concept", short: "The description of you — no scores attached." },
          { key: "self-image", name: "Self-image", short: "The picture in your head of how you come across." },
          { key: "social-self", name: "Social self", short: "Who I am with others, and how I think they see me." },
        ],
        pieces: [
          "chapters-so-far", "strengths-mapping", "values-clarifier", "mask-check", "identity-letter",
          "weekly-challenge", "conversation-who-i-was", "parts-of-you", "conversation-family-story",
          "culture-and-heritage", "week-8", "week-9",
        ],
      },
    ],
  },
  {
    key: "connection",
    name: "Connection",
    question: "Where do I belong?",
    levels: [
      {
        level: 2,
        key: "value-myself",
        name: "Value myself",
        selves: [
          { key: "self-esteem", name: "Self-esteem", short: "How much you rate yourself — and it moves." },
          { key: "self-worth", name: "Self-worth", short: "That you count — regardless of how the week went." },
          { key: "mattering", name: "Mattering", short: "That people notice you, and count on you for something." },
          { key: "self-respect", name: "Self-respect", short: "Standing by my values and boundaries." },
          { key: "self-compassion", name: "Self-compassion", short: "Being kind to myself when I mess up." },
        ],
        pieces: [
          "belonging", "fitting-in-vs-belonging", "across-the-gap", "people-who-shaped-you",
          "connection-challenge", "week-2", "week-3",
        ],
      },
    ],
  },
  {
    key: "purpose",
    name: "Purpose",
    question: "What do I care about?",
    levels: [
      {
        level: 3,
        key: "manage-myself",
        name: "Manage myself",
        selves: [
          { key: "self-regulation", name: "Self-regulation", short: "The gap you can hold between feeling it and doing it." },
          { key: "self-discipline", name: "Self-discipline", short: "Doing what matters, even when it's hard or boring." },
          { key: "self-motivation", name: "Self-motivation", short: "Finding my own reasons to start and keep going." },
        ],
        pieces: ["what-matters", "conversation-what-matters", "week-5", "week-7"],
      },
      {
        level: 4,
        key: "believe-in-myself",
        name: "Believe in myself",
        selves: [
          { key: "self-efficacy", name: "Self-efficacy", short: "Believing you can do the specific thing in front of you." },
          { key: "self-confidence", name: "Self-confidence", short: "Feeling sure enough of yourself to have a go." },
          { key: "self-trust", name: "Self-trust", short: "Backing my judgement and keeping promises to myself." },
        ],
        pieces: ["contribution-map", "the-other-side", "purpose-challenge", "week-4"],
      },
      {
        level: 5,
        key: "direct-myself",
        name: "Direct myself",
        selves: [
          { key: "autonomy", name: "Autonomy", short: "Making choices that are truly my own." },
          { key: "self-advocacy", name: "Self-advocacy", short: "Speaking up for what I need and believe." },
          { key: "self-authorship", name: "Self-authorship", short: "Writing my own story, not borrowing someone else's." },
        ],
        pieces: ["commitment-statement", "where-ive-come-from", "week-6"],
      },
    ],
  },
  {
    key: "meaning",
    name: "Meaning",
    question: "What kind of life do I want?",
    levels: [
      {
        level: 6,
        key: "imagine-myself",
        name: "Imagine myself",
        selves: [
          { key: "actual-self", name: "Actual self", short: "Who I am right now." },
          { key: "ideal-self", name: "Ideal self", short: "Who I hope to become." },
          { key: "ought-self", name: "Ought self", short: "Who others expect me to be." },
          { key: "feared-self", name: "Feared self", short: "Who I don't want to become." },
          { key: "possible-selves", name: "Possible selves", short: "All the futures I can imagine." },
        ],
        pieces: ["digital-self", "future-self", "meaning-letter", "conversation-path", "week-1"],
      },
      {
        level: 7,
        key: "authentic-self",
        name: "Authentic self",
        selves: [
          { key: "authentic-self", name: "Authentic self", short: "When who I am, what I value and how I act line up." },
        ],
        pieces: ["the-through-line", "meaning-challenge", "week-10"],
      },
    ],
  },
];

export interface MapPiece {
  id: string;
  title: string;
  /** Where it came from, as a short tag: the old mission's name, or "Week 4". */
  from: string;
  href: string;
  /** An optional step the student can skip. */
  optional: boolean;
}

/** Every mission step and program week the app has, by the id the map uses. */
export function allPieces(): Record<string, MapPiece> {
  const out: Record<string, MapPiece> = {};
  for (const m of MISSIONS) {
    for (const a of m.activities) {
      out[a.id] = {
        id: a.id,
        title: a.title,
        from: m.title,
        href: `/missions/${m.id}/activities/${a.id}`,
        optional: /^Optional/.test(a.subtitle),
      };
    }
  }
  for (const w of PROGRAM_WEEKS) {
    out[`week-${w.week}`] = {
      id: `week-${w.week}`,
      title: w.title,
      from: `Week ${w.week}`,
      href: `/program/${w.week}`,
      optional: false,
    };
  }
  return out;
}

/** The levels in map order, each with its group. */
export function allLevels(): { group: MapGroup; level: MapLevel }[] {
  const out: { group: MapGroup; level: MapLevel }[] = [];
  for (const group of LEVEL_MAP) for (const level of group.levels) out.push({ group, level });
  return out;
}
