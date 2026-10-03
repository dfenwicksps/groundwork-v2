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

/** How long after the start check-in the end one is offered, at the earliest. */
export const MIN_DAYS_BETWEEN = 28;

/**
 * The end check-in is offered once a student has done the work it's meant to
 * measure (all four missions, or the Character Code that closes the ten weeks),
 * and at least four weeks after they started.
 */
export function endDue(args: {
  startAt: string | null;
  endDone: boolean;
  missionsDone: number;
  codeWritten: boolean;
  now?: Date;
}): boolean {
  const { startAt, endDone, missionsDone, codeWritten, now = new Date() } = args;
  if (!startAt || endDone) return false;
  if (missionsDone < 4 && !codeWritten) return false;
  const days = (now.getTime() - new Date(startAt).getTime()) / 86_400_000;
  return days >= MIN_DAYS_BETWEEN;
}
