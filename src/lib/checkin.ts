// ─── The check-in: is any of this working? ────────────────────────────────────
// Nine questions, once near the start and once near the end, so a student can
// see what moved and so the app can one day show whether it helps. Without
// something like this, nothing the app does can be shown to change anything.
//
// Three things are measured, three questions each, matching the outcomes the
// identity research says matter:
//   clarity    how clear and steady a student's sense of themselves is
//              (the construct of the Self-Concept Clarity Scale, Campbell et
//              al. 1996)
//   direction  having explored and committed to a direction of your own
//              (commitment and in-depth exploration, as in the U-MICS, Crocetti
//              et al. 2008)
//   purpose    something meaningful to you that reaches beyond you
//              (purpose as defined by Damon et al. 2003; the Claremont Purpose
//              Scale, Bronk et al. 2018)
//
// IMPORTANT: these items are Groundwork's own wording, written to the same
// constructs. They are NOT the validated scales, and results from them are not
// evidence in the way validated-scale results would be. To use the real scales,
// get permission from their authors, add the items as a new ITEM_SET and bump
// the id: answers are stored with the set they were given under, so the two
// are never mixed.
//
// How it's designed to be evaluable:
//   - The start check-in is taken during onboarding, before any mission, so it
//     is a real baseline. Taken later (from Home, after skipping), it is
//     marked context "home" and its dose records how much was already done.
//   - The end check-in is offered at a fixed time after the start, to every
//     student, finished or not. Offering it only to finishers would compare
//     the people most likely to have changed anyway.
//   - Every check-in stores a dose snapshot (see Dose), so change can be read
//     against how much of the app a student actually used. Without a
//     comparison group, the dose-response pattern is the closest the data can
//     come to separating the app from ordinary growing up.
//
// BEFORE ANY AGGREGATE ANALYSIS: answers are currently shown back to the
// student and used for nothing else, and the privacy page says so. Counting
// them in totals needs ethics review, a consent flow (with a parent or carer's
// consent for under-16s), and an updated privacy page first.

export const ITEM_SET = "groundwork-interim-v1";

export type Construct = "clarity" | "direction" | "purpose";
export type Wave = "start" | "end";

export const CONSTRUCTS: { key: Construct; name: string; blurb: string }[] = [
  { key: "clarity", name: "Knowing who you are", blurb: "How clear and steady your sense of yourself feels" },
  { key: "direction", name: "Having a direction", blurb: "Whether you've thought it through and have a way you're heading" },
  { key: "purpose", name: "Something bigger than you", blurb: "Caring about something beyond yourself, and acting on it" },
];

export interface CheckinItem {
  key: string;
  construct: Construct;
  text: string;
  /** Agreeing means less of the construct, so the score is flipped */
  reverse?: boolean;
}

export const CHECKIN_ITEMS: CheckinItem[] = [
  { key: "c1", construct: "clarity", text: "I could describe who I am to someone in a few honest sentences." },
  { key: "d1", construct: "direction", text: "I have a direction I'm heading in, even if the details might change." },
  { key: "p1", construct: "purpose", text: "There's something I care about that's bigger than just me." },
  { key: "c2", construct: "clarity", text: "My sense of who I am changes a lot depending on who I'm with.", reverse: true },
  { key: "d2", construct: "direction", text: "I've properly thought about what I want, rather than just going along with things." },
  { key: "p2", construct: "purpose", text: "I'm doing things now that move me towards what matters to me." },
  { key: "c3", construct: "clarity", text: "I know what I value, even when the people around me don't share it." },
  { key: "d3", construct: "direction", text: "I'm not sure the path I'm on is really mine.", reverse: true },
  { key: "p3", construct: "purpose", text: "I know what kind of difference I want to make." },
];

export const SCALE = [
  "Not like me",
  "A bit like me",
  "Somewhat like me",
  "Quite like me",
  "Very like me",
];

export type Answers = Record<string, number>;
export type Scores = Record<Construct, number>;

export function complete(answers: Answers): boolean {
  return CHECKIN_ITEMS.every((i) => answers[i.key] >= 1 && answers[i.key] <= 5);
}

/** Mean per construct on the 1–5 scale, reverse items flipped, to one decimal. */
export function score(answers: Answers): Scores {
  const out = {} as Scores;
  for (const { key } of CONSTRUCTS) {
    const items = CHECKIN_ITEMS.filter((i) => i.construct === key);
    const total = items.reduce((sum, i) => {
      const a = answers[i.key];
      return sum + (i.reverse ? 6 - a : a);
    }, 0);
    out[key] = Math.round((total / items.length) * 10) / 10;
  }
  return out;
}

/** Where a check-in was taken: during onboarding (a clean baseline) or later. */
export type CheckinContext = "onboarding" | "home";

/**
 * How much of the app a student had used when they answered. Stored with every
 * check-in so change can be read against use.
 */
export interface Dose {
  /** Required mission steps done, across all four missions */
  requiredStepsDone: number;
  missionsDone: number;
  /** Program weeks completed */
  weeksDone: number;
  codeWritten: boolean;
  daysSinceJoined: number | null;
}

/**
 * The end check-in opens this long after the start, for everyone. Ten weeks
 * matches the program, so a student who starts the weeks straight away is
 * asked again around the time they finish them.
 */
export const DAYS_TO_FOLLOW_UP = 70;

export function endDue(args: { startAt: string | null; endDone: boolean; now?: Date }): boolean {
  const { startAt, endDone, now = new Date() } = args;
  if (!startAt || endDone) return false;
  const days = (now.getTime() - new Date(startAt).getTime()) / 86_400_000;
  return days >= DAYS_TO_FOLLOW_UP;
}

/** The date the end check-in opens, for telling a student when to expect it. */
export function followUpDate(startAt: string): Date {
  return new Date(new Date(startAt).getTime() + DAYS_TO_FOLLOW_UP * 86_400_000);
}
