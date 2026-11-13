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
  /** The level's own question, from the master file. */
  question: string;
  /** Accent colour and band colour, from the master file. */
  colour: string;
  band: string;
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
        question: "Who am I, really?",
        colour: "#0B7A6E",
        band: "#D5F5EF",
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
        question: "Do I rate who I am?",
        colour: "#C2185B",
        band: "#FDE1EC",
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
        question: "Can I steer myself?",
        colour: "#C2410C",
        band: "#FFE8D6",
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
        question: "Can I actually do this?",
        colour: "#6D28D9",
        band: "#EDE4FF",
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
        question: "Where am I heading?",
        colour: "#1D4ED8",
        band: "#DCE8FF",
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
        question: "Who could I be?",
        colour: "#1B1640",
        band: "#E6E3F7",
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
        question: "Am I being the real me?",
        colour: "#1B1640",
        band: "#FFD23F",
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
  /** What kind of thing it is, in a word or two. */
  kind: string;
  /** How long it takes, where the content says. */
  time: string | null;
  /** One line about it. */
  blurb: string;
}

/** A list of options isn't a description; fall back to the introduction for those. */
function blurbFor(prompt: string | undefined, intro: string | undefined): string {
  const fromPrompt = firstSentence(prompt);
  if (fromPrompt && !/[•\n]|:$/.test(fromPrompt)) return fromPrompt;
  return firstSentence(intro);
}

const KIND: Record<string, string> = {
  journal: "Write",
  values_picker: "Choose",
  challenge: "Try it",
  milestone_letter: "Letter",
  strengths_assessment: "Quick taps",
};

/** The first sentence that stands on its own: v2's intros often open by pointing back at a mission. */
function firstSentence(text: string | undefined): string {
  if (!text) return "";
  const parts = text.match(/[^.?!]+[.?!]+/g) || [text];
  for (const part of parts) {
    if (!/\bMissions? \d|\bmissions?\b|\bstep\b/i.test(part)) return part.trim();
  }
  return "";
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
        kind: /^conversation-/.test(a.id) ? "Talk to someone" : KIND[a.type] ?? "Write",
        time: a.timeEstimate ?? null,
        // The prompt says what the step asks, and stands alone; v2's intros lean
        // on the order the missions used to run in.
        blurb: blurbFor(a.prompt, a.intro),
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
      kind: "Week challenge",
      time: null,
      blurb: w.challenge.title,
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

/** One level by its address key ("know-myself"), with its group. */
export function findLevel(key: string): { group: MapGroup; level: MapLevel } | undefined {
  return allLevels().filter((l) => l.level.key === key)[0];
}

/** The level a self sits in. */
export function levelOfSelf(selfKey: string): { group: MapGroup; level: MapLevel } | undefined {
  return allLevels().filter((l) => l.level.selves.some((s) => s.key === selfKey))[0];
}

/** Every piece id in map order. */
export function piecesInOrder(): string[] {
  const out: string[] = [];
  for (const { level } of allLevels()) for (const id of level.pieces) out.push(id);
  return out;
}

/**
 * A suggestion for Home, never a requirement: the first piece the student
 * hasn't done, skipping optional ones, starting with the levels their
 * self-check suggested. Null when there's nothing left.
 * Everything else stays open (D3).
 */
export function suggestNext(doneIds: string[], preferLevels: number[] = []): MapPiece | null {
  const pieces = allPieces();
  // The levels the self-check pointed at come first, then the rest of the map.
  const preferred: string[] = [];
  for (const { level } of allLevels()) {
    if (preferLevels.indexOf(level.level) !== -1) for (const id of level.pieces) preferred.push(id);
  }
  for (const id of preferred.concat(piecesInOrder())) {
    const p = pieces[id];
    if (p && !p.optional && doneIds.indexOf(id) === -1) return p;
  }
  return null;
}
