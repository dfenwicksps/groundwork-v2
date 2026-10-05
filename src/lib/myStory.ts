import { getActivity } from "./missions";
import { splitScaffoldedResponse, clarifierValues, LEFT_OUT_ANSWER } from "./journal";
import { itemsIn } from "./inheritance";
import { responseToCode, responseToStory, CHARACTER_CODE_ACTIVITY_ID, type LifeStory } from "./program";
import { parseNextChapter, NEXT_CHAPTER_ACTIVITY_ID } from "./nextChapter";
import type { Scaffold } from "./scaffold";

// ─── My story ─────────────────────────────────────────────────────────────────
// Identity, in the research the app is built on, is one evolving story: where
// I've come from, who I am, where I'm going. The app collects those pieces
// across missions, weeks and tools, but no screen ever showed them together.
// This assembles them, from the student's latest saved answers, into the three
// parts of that story. It reads only; every piece links back to where it's
// written, and writing a newer answer there updates the story.
//
// Deliberately left out: Parts of Who You Are (beliefs, gender, sexuality) and
// Culture and Heritage.
// This page is built to be printed or shown to someone, and those answers
// should never end up on it by default.

/** The entries the story is assembled from. */
export const STORY_SOURCES = [
  "chapters-so-far",
  "where-ive-come-from",
  "conversation-family-story",
  "the-through-line",
  "future-self",
  "meaning-letter",
  "values-clarifier",
  NEXT_CHAPTER_ACTIVITY_ID,
  CHARACTER_CODE_ACTIVITY_ID,
] as const;

export interface StoryEntry {
  activity_id: string;
  mission_id: number;
  response: string;
  created_at: string;
}

export interface MyStory {
  /** The Character Code's one sentence, the story's headline */
  sentence: LifeStory | null;
  codeWrittenAt: string | null;
  past: {
    chapters: string | null;
    chaptersFrom: "mission-4" | "mission-1" | null;
    currentChapter: string | null;
    turningPoint: string | null;
    keeping: string[];
    reworking: string[];
    leaving: string[];
    reworkingNote: string | null;
    familyStory: string | null;
  };
  present: {
    strengths: string[];
    values: string[];
    thread: string | null;
  };
  future: {
    tuesday: string | null;
    direction: string | null;
    hopingFor: string | null;
    commitments: string[];
  };
}

/** Answer `index` of an entry, or null when it's missing or was left out. */
function answer(entry: StoryEntry | undefined, index: number): string | null {
  if (!entry) return null;
  const questions = getActivity(entry.mission_id, entry.activity_id)?.scaffoldingSteps;
  if (!questions?.length) return null;
  const a = splitScaffoldedResponse(entry.response, questions)[index]?.trim();
  return a && a !== LEFT_OUT_ANSWER ? a : null;
}

/**
 * @param latest the newest entry for each STORY_SOURCES activity
 * @param strengths the student's top strengths, by name
 */
export function assembleStory(latest: Map<string, StoryEntry>, strengths: string[]): MyStory {
  const m1 = latest.get("chapters-so-far");
  const m4 = latest.get("where-ive-come-from");
  const sort = answer(m4, 2);
  const code = latest.get(CHARACTER_CODE_ACTIVITY_ID);
  const plan = latest.get(NEXT_CHAPTER_ACTIVITY_ID);
  const m4Chapters = answer(m4, 0);

  return {
    sentence: responseToStory(code?.response),
    codeWrittenAt: code?.created_at ?? null,
    past: {
      // Mission 4 asks the chapters again, with Mission 1's in view, so it's the newer telling.
      chapters: m4Chapters ?? answer(m1, 0),
      chaptersFrom: m4Chapters ? "mission-4" : answer(m1, 0) ? "mission-1" : null,
      currentChapter: answer(m1, 1),
      turningPoint: answer(m4, 1),
      keeping: itemsIn(sort, "keep"),
      reworking: itemsIn(sort, "rework"),
      leaving: itemsIn(sort, "leave"),
      reworkingNote: answer(m4, 3),
      familyStory: answer(latest.get("conversation-family-story"), 0),
    },
    present: {
      strengths,
      values: clarifierValues(latest.get("values-clarifier")?.response),
      thread: answer(latest.get("the-through-line"), 3),
    },
    future: {
      tuesday: answer(latest.get("future-self"), 0),
      direction: answer(latest.get("meaning-letter"), 0),
      hopingFor: plan ? parseNextChapter(plan.response).hoping || null : null,
      commitments: responseToCode(code?.response),
    },
  };
}

/** A story is due for a new version a year after the Character Code was written. */
export function storyDueForRenewal(codeWrittenAt: string | null, now = new Date()): boolean {
  if (!codeWrittenAt) return false;
  return now.getTime() - new Date(codeWrittenAt).getTime() >= 365 * 86_400_000;
}

// ─── In my own words ──────────────────────────────────────────────────────────
// Everything above is assembled: the student's answers, laid side by side. The
// joining is left to the reader. But the research finding the page rests on is
// about the joining itself: linking what happened to who you are and where
// you're going, in your own words ("autobiographical reasoning"; Habermas &
// Bluck, 2000; McAdams), is what builds a steady sense of self. So once there
// are enough pieces, the page asks the student to tell it in one paragraph,
// and again each year with last year's in view, so the versions read as one
// story changing over time.

export const STORY_PARAGRAPH_ACTIVITY_ID = "story-paragraph";

export const STORY_PARAGRAPH_PROMPT =
  "My story in a paragraph: where I've come from, what changed me, who I am now, and where I'm heading";

/** A version of the paragraph, as saved. */
export interface StoryParagraph {
  id: string;
  response: string;
  created_at: string;
}

/** A new version is asked for once a year; until then, the current one can be edited. */
export const PARAGRAPH_RENEW_DAYS = 365;

export function paragraphDue(latest: StoryParagraph | null, now = new Date()): boolean {
  if (!latest) return true;
  return now.getTime() - new Date(latest.created_at).getTime() >= PARAGRAPH_RENEW_DAYS * 86_400_000;
}

/** Enough of the story to join up: something from the past, and something from now or ahead. */
export function readyForParagraph(story: MyStory): boolean {
  const past = !!(story.past.chapters || story.past.turningPoint);
  const later = !!(story.present.thread || story.future.tuesday || story.future.direction || story.sentence);
  return past && later;
}

/** Words in a paragraph, for the "a paragraph, not a sentence" nudge. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const PARAGRAPH_MIN_WORDS = 30;

/** The joining words are the point: each stem links one part to the next. */
const PARAGRAPH_STEMS = [
  "I grew up",
  "Then something changed:",
  "Since then, I've",
  "That's part of why I",
  "So now I'm heading towards",
];

// Offered at every tier: a paragraph has no complete answers to tap, so Quick
// gets the same openings as Extended.
export const STORY_PARAGRAPH_SCAFFOLD: Scaffold = {
  quick: PARAGRAPH_STEMS.map((s) => `${s} `),
  stems: PARAGRAPH_STEMS,
  stuck: [
    "Go in order: where you started, a moment that shifted things, who that's made you, where it's pointing.",
    "Use joining words — because, since then, that's why, so. They're what turn a list into a story.",
    "Read your pieces above and pick one from each part. You don't have to use them all.",
    "It's allowed to change next year. This is this year's version, not the final one.",
  ],
};
