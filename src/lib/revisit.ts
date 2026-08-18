import type { Scaffold } from "./scaffold";

// ─── Longitudinal revisits ────────────────────────────────────────────────────
// The app's most defensible intervention: no comparison to other people, no
// score, no advice. A student reads what they wrote months ago and answers one
// question — has this changed? Growth becomes something they observe in their
// own words rather than something the app asserts.
//
// The mechanism is a chain. An entry can be revisited again and again, each
// revisit linked to the original by `revisit_of`, so a milestone written at 14
// can be reopened at 15 and again at 16 and read as one arc.

export interface RevisitEntry {
  id: string;
  mission_id: number;
  activity_id: string;
  prompt: string;
  response: string;
  created_at: string;
  is_milestone?: boolean;
  revisit_of?: string | null;
}

/** A milestone plus every revisit of it, oldest first. */
export interface RevisitChain {
  original: RevisitEntry;
  revisits: RevisitEntry[];
}

/**
 * How long before an entry may be revisited again. Long enough that something
 * can actually have changed — revisiting weekly produces "same as last week"
 * and teaches the student the exercise is empty.
 */
export const MIN_DAYS_BETWEEN_REVISITS = 14;

export function daysBetween(a: string | Date, b: string | Date): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86_400_000);
}

/**
 * Human phrasing for the gap between two entries — "3 weeks later" reads
 * better than a date diff. For distance from *now*, use agoLabel instead:
 * "you wrote this a year later" is nonsense.
 */
export function elapsedLabel(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "1 day later";
  if (days < 14) return `${days} days later`;
  if (days < 60) return `${Math.round(days / 7)} weeks later`;
  if (days < 365) return `${Math.round(days / 30)} months later`;
  const years = days / 365;
  return years < 1.5 ? "a year later" : `${Math.round(years)} years later`;
}

/** Distance from now — "a year ago", "3 weeks ago". */
export function agoLabel(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  const years = days / 365;
  return years < 1.5 ? "about a year ago" : `${Math.round(years)} years ago`;
}

export interface Eligibility {
  ok: boolean;
  /** Days until it becomes eligible, when ok is false */
  waitDays?: number;
  /** Days since the most recent entry in the chain */
  sinceDays: number;
}

/**
 * Eligibility runs from the most recent link in the chain, not the original —
 * otherwise a year-old milestone could be revisited twice in one afternoon.
 */
export function revisitEligibility(
  chain: RevisitChain,
  now: Date = new Date()
): Eligibility {
  const mostRecent =
    chain.revisits.length > 0
      ? chain.revisits[chain.revisits.length - 1].created_at
      : chain.original.created_at;
  const sinceDays = daysBetween(mostRecent, now);
  if (sinceDays >= MIN_DAYS_BETWEEN_REVISITS) return { ok: true, sinceDays };
  return {
    ok: false,
    waitDays: MIN_DAYS_BETWEEN_REVISITS - sinceDays,
    sinceDays,
  };
}

/** Builds the chain from a flat result set (the original plus its revisits). */
export function buildChain(
  original: RevisitEntry,
  all: RevisitEntry[]
): RevisitChain {
  const revisits = all
    .filter((e) => e.revisit_of === original.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  return { original, revisits };
}

// ─── The questions ────────────────────────────────────────────────────────────
// A fortnight and a year apart are different questions. At two weeks the honest
// answer is usually "nothing has changed", and asking "how have you grown?"
// invites invention. Later, the distance is real and can be asked about
// directly.

export function revisitPrompts(sinceDays: number, isSecondOrLater: boolean): string[] {
  if (sinceDays < 45) {
    return [
      "Does this still feel true? Has anything actually tested it since you wrote it?",
      "Can you think of one moment where this showed up in real life — or where it didn't?",
      "Would you keep it as it is, adjust it, or let it go?",
    ];
  }
  if (sinceDays < 200) {
    return [
      "Reading it back — does it sound like you, or like someone you used to be?",
      "What has actually happened since then that this didn't see coming?",
      "Which part would you defend, and which part would you take back?",
    ];
  }
  return [
    isSecondOrLater
      ? "You've read this back before. What's different about reading it this time?"
      : "This is a long way back now. What's the first thing you notice?",
    "What did the person who wrote this not know yet?",
    "If you wrote it fresh today, what would be missing from the old one?",
  ];
}

export function revisitScaffold(sinceDays: number): Scaffold {
  const near = sinceDays < 45;
  return {
    quick: near
      ? [
          "Still true — nothing has really tested it yet",
          "It got tested, and it held",
          "It got tested, and it didn't hold",
          "I'd word it differently now",
        ]
      : [
          "I'd answer this completely differently now",
          "Mostly the same, but I'd say it more clearly",
          "I can't believe I wrote that",
          "Still true — it's just more obvious to me now",
        ],
    stems: near
      ? [
          "Since writing this, what tested it was",
          "It still holds because",
          "The part I'd adjust is",
        ]
      : [
          "Reading this back, what stands out is",
          "What's changed since then is",
          "What I'd tell the version of me who wrote this is",
        ],
    stuck: [
      "You're comparing two versions of yourself — what moved?",
      "Is there anything you'd defend, and anything you'd take back?",
      "What did past you not know yet?",
      "'Nothing has changed' is a real answer. Say why, and it's still worth writing.",
    ],
  };
}

/** Revisits are stored as journal entries with this suffix, linked by revisit_of. */
export function revisitActivityId(originalActivityId: string): string {
  return `${originalActivityId}-revisit`;
}

export function isRevisitEntry(activityId: string): boolean {
  return activityId.endsWith("-revisit");
}
