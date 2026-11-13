// ─── The self-check ──────────────────────────────────────────────────────────
// 25 short statements, one per self (D30), on a five-point scale from "Not like
// me" to "Very like me". It suggests where a student might start. It is not a
// test: it gives no score, label or ranking, and only the student sees it
// (spec section 6; docs/v3/visibility.md V-T2, V-SH7).
//
// THE STATEMENTS BELOW ARE DRAFTS. Seven are the spec's examples; the rest were
// drafted with them for David to approve. Before any student answers them:
// David approves the wording, a counsellor reviews the "Value myself" items,
// and they are piloted with about 30 students (spec section 6, "Before
// release"). ITEM_SET names the wording so a later set is never compared with
// this one item for item.
//
// Rules the wording keeps (tested in selfCheck.test.ts):
//   - written fresh for Groundwork: no item from a published scale;
//   - every statement is phrased so that "Very like me" is the steady end;
//   - the "Value myself" statements are positive. None asks about being
//     worthless, a burden, unnoticed or wanting to disappear.

import { allLevels, type MapLevel, type MapSelf } from "./levelMap";

export const ITEM_SET = "draft-1";

export const SCALE = ["Not like me", "A little like me", "Somewhat like me", "Mostly like me", "Very like me"] as const;

/** One statement per self, keyed by the self. */
export const STATEMENTS: Record<string, string> = {
  // Know myself
  "self-awareness": "When I'm upset, I can usually name what I'm actually feeling.",
  "self-reflection": "After something goes well or badly, I think about why.",
  "self-concept": "I could describe what I'm like to someone who's never met me.",
  "self-image": "I've got a fair idea of how I come across to other people.",
  "social-self": "I notice how I change depending on who I'm with.",
  // Value myself
  "self-esteem": "Most days, I'm okay with being me.",
  "self-worth": "Even after a rough week, I still feel like I count.",
  "mattering": "There are people who are glad when I turn up.",
  "self-respect": "I stick to what matters to me, even when it would be easier to let it go.",
  "self-compassion": "When I mess up, I talk to myself the way I'd talk to a friend.",
  // Manage myself
  "self-regulation": "When I feel a big reaction coming, I can usually pause before I act.",
  "self-discipline": "I can keep going on something boring when it matters to me.",
  "self-motivation": "I can find my own reasons to get started, without someone pushing me.",
  // Believe in myself
  "self-efficacy": "When something's hard, I can usually work out a way to get better at it.",
  "self-confidence": "I'll have a go at something new even if I'm not sure how it'll turn out.",
  "self-trust": "When I promise myself I'll do something, I usually do it.",
  // Direct myself
  "autonomy": "A lot of what I do each week, I'd choose to do anyway.",
  "self-advocacy": "I can say what I need to a teacher, even when it's awkward.",
  "self-authorship": "I've thought about what I believe, and haven't just taken on what others think.",
  // Imagine myself
  "actual-self": "I can be honest with myself about where I'm at right now.",
  "ideal-self": "I can picture a version of me in five years that I'd like to be.",
  "ought-self": "I can tell the difference between what I want and what others expect of me.",
  "feared-self": "I know the kind of person I'd rather not turn into.",
  "possible-selves": "I can imagine more than one future that could suit me.",
  // Authentic self
  "authentic-self": "I act much the same way whoever I'm with.",
};

export type Answers = Record<string, number>;

/** What is stored in self_checks.suggested. Level ids are for the class pattern; nothing here is a score. */
export interface Suggested {
  steady: number[];
  levels: number[];
  selves: string[];
}

export function allAnswered(answers: Answers): boolean {
  return Object.keys(STATEMENTS).every((k) => {
    const v = answers[k];
    return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
  });
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** A level counts as steady only when its answers sit on the "like me" side. */
const STEADY_FROM = 3.5;
/** When every level is within this of every other, there is no pattern to point at. */
const FLAT_WITHIN = 0.5;

/**
 * Where a student might start. Spec section 6, rule 3, adapted for one
 * statement per self (D30): the two levels with the most "like me" answers are
 * "already steady"; the two with the fewest suggest a self each, the one whose
 * statement was least like them. Ties go to the earlier level on the map, and
 * a result with no real difference between levels suggests nothing.
 */
export function suggest(answers: Answers): Suggested {
  const levels = allLevels().map(({ level }) => ({
    level,
    avg: mean(level.selves.map((s) => answers[s.key] ?? 3)),
  }));
  const avgs = levels.map((l) => l.avg);
  if (Math.max.apply(null, avgs) - Math.min.apply(null, avgs) < FLAT_WITHIN) {
    return { steady: [], levels: [], selves: [] };
  }

  // Array.prototype.sort is stable, so equal levels keep map order.
  const high = levels.slice().sort((a, b) => b.avg - a.avg);
  const low = levels.slice().sort((a, b) => a.avg - b.avg);

  const explore = low.slice(0, 2);
  const exploreIds = explore.map((l) => l.level.level);
  const steady = high
    .slice(0, 2)
    .filter((l) => l.avg >= STEADY_FROM && exploreIds.indexOf(l.level.level) === -1)
    .map((l) => l.level.level);

  const selves: string[] = [];
  for (const { level } of explore) {
    const lowest = level.selves.slice().sort((a, b) => (answers[a.key] ?? 3) - (answers[b.key] ?? 3))[0];
    if (lowest) selves.push(lowest.key);
  }
  // A third, when the least-steady level has a clear second.
  const first = explore[0].level;
  const rest = first.selves
    .filter((s) => selves.indexOf(s.key) === -1)
    .sort((a, b) => (answers[a.key] ?? 3) - (answers[b.key] ?? 3));
  if (rest[0] && (answers[rest[0].key] ?? 3) <= 2) selves.push(rest[0].key);

  return { steady: steady.sort((a, b) => a - b), levels: exploreIds.sort((a, b) => a - b), selves };
}

export interface ResultWords {
  steady: MapLevel[];
  explore: { level: MapLevel; self: MapSelf }[];
  /** True when the answers were much the same everywhere. */
  flat: boolean;
}

/** The stored suggestion as things the screen can name. Words only. */
export function resultWords(s: Suggested): ResultWords {
  const levels = allLevels().map((l) => l.level);
  const steady = levels.filter((l) => (s.steady ?? []).indexOf(l.level) !== -1);
  const explore: ResultWords["explore"] = [];
  for (const key of s.selves ?? []) {
    for (const level of levels) {
      const self = level.selves.filter((x) => x.key === key)[0];
      if (self) explore.push({ level, self });
    }
  }
  return { steady, explore, flat: steady.length === 0 && explore.length === 0 };
}

/** Parse self_checks.suggested from the database, tolerating anything. */
export function parseSuggested(raw: unknown): Suggested {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const nums = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "number") : []) as number[];
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []) as string[];
  return { steady: nums(o.steady), levels: nums(o.levels), selves: strs(o.selves) };
}

/** Spec section 6, rule 5: once a term. Ten weeks stands in for a term. */
export const RETAKE_AFTER_DAYS = 70;

export function retakeFrom(takenAt: string): Date {
  return new Date(new Date(takenAt).getTime() + RETAKE_AFTER_DAYS * 24 * 60 * 60 * 1000);
}

export function canRetake(takenAt: string, now: Date): boolean {
  return now.getTime() >= retakeFrom(takenAt).getTime();
}
