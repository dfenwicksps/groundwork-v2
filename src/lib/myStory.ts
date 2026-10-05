import { getActivity } from "./missions";
import { splitScaffoldedResponse, clarifierValues, LEFT_OUT_ANSWER } from "./journal";
import { itemsIn } from "./inheritance";
import { responseToCode, responseToStory, CHARACTER_CODE_ACTIVITY_ID, type LifeStory } from "./program";
import { parseNextChapter, NEXT_CHAPTER_ACTIVITY_ID } from "./nextChapter";

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
