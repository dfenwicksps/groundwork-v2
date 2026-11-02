import { hasLeftSchool, type LifeStage } from "./lifeStage";

// ─── The check-in: is any of this working? ────────────────────────────────────
// A short set of questions, once near the start and once ten weeks later, so a
// student can see what moved and so the app can one day show whether it helps.
// Without something like this, nothing the app does can be shown to change
// anything.
//
// Two item sets exist, and a student always answers their end check-in in the
// same set as their start, so a start is never compared with an end it didn't
// share questions with. New starts use CURRENT_SET.
//
// v2 (November 2026, current) — the five outcomes Groundwork is built to
// develop (docs/evidence/self-outcomes-map.md, checkin-v2-draft.md):
//   clarity     self-concept clarity (construct of Campbell et al., 1996)
//   esteem      global self-esteem (Rosenberg; Harter's global self-worth)
//   confidence  the everyday sense of backing yourself; no validated scale
//               exists, so the pilot checks it against efficacy and esteem
//   efficacy    "how sure are you that you could…", three areas (Bandura's
//               method; areas inspired by the SEQ-C, Muris, 2001)
//   mattering   being noticed, counted on and adding value (Rosenberg &
//               McCullough, 1981; Prilleltensky, 2020)
// Clarity keeps v1's c1 and c2 word for word, so those two items can be
// compared across sets one by one (never as area scores: v1 averaged three).
//
// v1 (interim, until November 2026) — clarity, direction (U-MICS construct)
// and purpose (Damon; Claremont Purpose Scale construct), three items each.
// Kept so students who started on it finish on it.
//
// IMPORTANT: every item is Groundwork's own wording, written to a construct.
// None is a validated scale, and results from them are not evidence in the way
// validated-scale results would be. The validated scales are run outside the
// app, by a research partner, and used to check these items
// (docs/evidence/evidence-plan.md). The wording deliberately avoids a clinical
// register: no item names a construct, no harsh negative items, and mattering
// has no reverse item because "nobody would notice me" is too close to risk
// language for a self-guided app.
//
// How it's designed to be evaluable:
//   - The start check-in is taken during onboarding, before any mission, so it
//     is a real baseline. It comes after the one-minute onboarding story, so
//     that much of the app has been seen. Taken later (from Home, after skipping), it is
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
// them in totals needs ethics review, a consent flow (usually with a parent or
// carer's consent too; the ethics committee decides), and an updated privacy
// page first. The plan for that is in docs/evidence/evidence-plan.md.

export type Construct =
  | "clarity"
  | "esteem"
  | "confidence"
  | "efficacy"
  | "mattering"
  // v1 only
  | "direction"
  | "purpose";
export type Wave = "start" | "end";

/** Which response scale an item is answered on. */
export type ScaleKind = "like" | "sure";

export const SCALES: Record<ScaleKind, string[]> = {
  like: ["Not like me", "A bit like me", "Somewhat like me", "Quite like me", "Very like me"],
  sure: ["Not at all sure", "A bit sure", "Fairly sure", "Very sure", "Completely sure"],
};

/** The original scale, kept for anything that still imports it. */
export const SCALE = SCALES.like;

export interface ConstructInfo {
  key: Construct;
  name: string;
  blurb: string;
}

export interface CheckinItem {
  key: string;
  construct: Construct;
  text: string;
  /** Wording for students who have left school, when it differs */
  textLeftSchool?: string;
  /** Agreeing means less of the construct, so the score is flipped */
  reverse?: boolean;
  /** Defaults to "like" */
  scale?: ScaleKind;
}

export interface ItemSet {
  id: string;
  constructs: ConstructInfo[];
  /** In the order they're shown: no two from the same area side by side */
  items: CheckinItem[];
}

const V1: ItemSet = {
  id: "groundwork-interim-v1",
  constructs: [
    { key: "clarity", name: "Knowing who you are", blurb: "How clear and steady your sense of yourself feels" },
    { key: "direction", name: "Having a direction", blurb: "Whether you've thought it through and have a way you're heading" },
    { key: "purpose", name: "Something bigger than you", blurb: "Caring about something beyond yourself, and acting on it" },
  ],
  items: [
    { key: "c1", construct: "clarity", text: "I could describe who I am to someone in a few honest sentences." },
    { key: "d1", construct: "direction", text: "I have a direction I'm heading in, even if the details might change." },
    { key: "p1", construct: "purpose", text: "There's something I care about that's bigger than just me." },
    { key: "c2", construct: "clarity", text: "My sense of who I am changes a lot depending on who I'm with.", reverse: true },
    { key: "d2", construct: "direction", text: "I've properly thought about what I want, rather than just going along with things." },
    { key: "p2", construct: "purpose", text: "I'm doing things now that move me towards what matters to me." },
    { key: "c3", construct: "clarity", text: "I know what I value, even when the people around me don't share it." },
    { key: "d3", construct: "direction", text: "I'm not sure the path I'm on is really mine.", reverse: true },
    { key: "p3", construct: "purpose", text: "I know what kind of difference I want to make." },
  ],
};

const V2: ItemSet = {
  id: "groundwork-interim-v2",
  constructs: [
    { key: "clarity", name: "Knowing who you are", blurb: "How clear and steady your sense of yourself feels" },
    { key: "esteem", name: "Liking who you are", blurb: "How you feel about yourself overall" },
    { key: "confidence", name: "Backing yourself", blurb: "How ready you are to have a go" },
    { key: "efficacy", name: "Knowing you can", blurb: "How sure you are you could handle specific hard things" },
    { key: "mattering", name: "Mattering to people", blurb: "Feeling noticed, counted on and useful to others" },
  ],
  items: [
    { key: "c1", construct: "clarity", text: "I could describe who I am to someone in a few honest sentences." },
    { key: "e1", construct: "esteem", text: "On the whole, I like the person I am." },
    {
      key: "s1",
      construct: "efficacy",
      scale: "sure",
      text: "How sure are you that you could keep going with schoolwork that's hard, when you'd rather stop?",
      textLeftSchool: "How sure are you that you could keep going with study or work that's hard, when you'd rather stop?",
    },
    { key: "m1", construct: "mattering", text: "There are people who notice how I'm going." },
    { key: "f1", construct: "confidence", text: "I'm usually willing to have a go, even when I'm not sure it'll work." },
    { key: "c2", construct: "clarity", text: "My sense of who I am changes a lot depending on who I'm with.", reverse: true },
    {
      key: "s3",
      construct: "efficacy",
      scale: "sure",
      text: "How sure are you that you could calm yourself down after something's really upset you?",
    },
    { key: "e3", construct: "esteem", text: "I often wish I was someone else.", reverse: true },
    { key: "m2", construct: "mattering", text: "Someone counts on me for something." },
    { key: "f3", construct: "confidence", text: "I hold back from trying things in case I look silly.", reverse: true },
    {
      key: "s5",
      construct: "efficacy",
      scale: "sure",
      text: "How sure are you that you could stick at practising something difficult until you're noticeably better at it?",
    },
    { key: "m3", construct: "mattering", text: "Some people are better off because of things I do." },
  ],
};

export const ITEM_SETS: Record<string, ItemSet> = { [V1.id]: V1, [V2.id]: V2 };

/** The set every new start check-in uses. */
export const CURRENT_SET = V2.id;

/** Kept for older imports: the id new check-ins are saved under. */
export const ITEM_SET = CURRENT_SET;

/** A set by id; an unknown or missing id falls back to the current set. */
export function itemSet(id: string | null | undefined): ItemSet {
  return (id && ITEM_SETS[id]) || ITEM_SETS[CURRENT_SET];
}

/** The set a wave should be answered in: the end always follows its start. */
export function setForWave(wave: Wave, startSetId: string | null | undefined): ItemSet {
  return wave === "end" ? itemSet(startSetId) : itemSet(CURRENT_SET);
}

export function itemText(item: CheckinItem, stage: LifeStage): string {
  return hasLeftSchool(stage) && item.textLeftSchool ? item.textLeftSchool : item.text;
}

export function scaleFor(item: CheckinItem): string[] {
  return SCALES[item.scale ?? "like"];
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "twelve", for copy like "Twelve quick questions". */
export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export type Answers = Record<string, number>;
export type Scores = Partial<Record<Construct, number>>;

export function complete(set: ItemSet, answers: Answers): boolean {
  return set.items.every((i) => answers[i.key] >= 1 && answers[i.key] <= 5);
}

/** Mean per construct on the 1–5 scale, reverse items flipped, to one decimal. */
export function score(set: ItemSet, answers: Answers): Scores {
  const out: Scores = {};
  for (const { key } of set.constructs) {
    const items = set.items.filter((i) => i.construct === key);
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
