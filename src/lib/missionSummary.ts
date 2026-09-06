// ─── What the missions identified ─────────────────────────────────────────────
// Once all four missions are done there is no "active mission" left, but the
// dashboard kept showing the last one as active with "All 5 steps done" — a
// card inviting a student to continue something they had finished. What belongs
// in that space is the answer the four missions produced.
//
// One row per mission, in mission order, so the summary is legibly the shape of
// the work rather than an arbitrary selection:
//
//   Mission 1  strengths and values — the compass, as chips
//   Mission 2  the thing in the world they said they care about
//   Mission 3  where they said they're most themselves
//   Mission 4  the thread, which that step is written to state in one sentence
//
// Every row is optional. A student can complete a mission having skipped past a
// prompt, and a summary that renders half of what it has is better than one
// that renders nothing.

import { answerAt } from "./journal";

export interface MissionSummary {
  /** VIA strength keys, top five */
  strengths: string[];
  values: string[];
  /** Mission 2 — the problem or cause they named */
  cares: string;
  /** Mission 3 — where they're most themselves */
  belongs: string;
  /** Mission 4 — the through-line, in their own sentence */
  thread: string;
}

/** True when there is enough here to be worth showing at all. */
export function hasSummary(s: MissionSummary): boolean {
  return (
    s.strengths.length > 0 ||
    s.values.length > 0 ||
    !!s.cares ||
    !!s.belongs ||
    !!s.thread
  );
}

export function buildMissionSummary(input: {
  ranking: string[] | null | undefined;
  valuesResponse: string | null | undefined;
  whatMatters: string | null | undefined;
  belonging: string | null | undefined;
  throughLine: string | null | undefined;
}): MissionSummary {
  return {
    strengths: (input.ranking ?? []).slice(0, 5),
    values: (input.valuesResponse ?? "")
      .split("\n")
      .map((l) => l.split(":")[0].trim())
      .filter(Boolean)
      .slice(0, 5),
    // Step 1 of What Matters is "a problem in the world that actually bothers
    // you" — the most quotable line in the mission.
    cares: answerAt(2, "what-matters", input.whatMatters, 0),
    // Step 1 of Where You Belong is the people they're most themselves around.
    belongs: answerAt(3, "belonging", input.belonging, 0),
    // The Through-Line's last step exists to state the thread in one sentence.
    thread: answerAt(4, "the-through-line", input.throughLine, 3),
  };
}
