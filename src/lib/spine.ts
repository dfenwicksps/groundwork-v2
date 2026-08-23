import type { YearLevel } from "./yearLevel";

// ─── The spine ────────────────────────────────────────────────────────────────
// Groundwork carries two bodies of work: the Missions (a library, explored in
// any order) and the 10-Week Program (a cadence, walked in sequence). Presented
// as peers they compete — two tracks both saying "start here", with nothing
// telling a student which is theirs.
//
// The spine picks one to lead with, using the year level captured at
// onboarding. It never hides anything: both tracks stay fully reachable from
// the nav. It only decides what the dashboard offers first, because the first
// card is the only one some students will ever read.
//
// The reasoning, by age:
//
//   junior (7–9)   The program leads. Concrete, weekly, behavioural — "do one
//                  unnoticed thing a day" lands at 14 in a way that
//                  "examine the gap between your inner and public self" does
//                  not. Missions become the depth a week points into.
//
//   middle (10–11) Missions lead, program second. This is the age the mission
//                  content was written for, and the balance already worked.
//
//   senior (12)    Missions lead, but the near-future work (pathways, goals)
//                  is surfaced above the character program — a Year 12 arrives
//                  with questions about next year, and a ten-week character
//                  cadence is not the answer to those.

export type SpineLead = "program" | "mission";

export interface Spine {
  /** Which track the dashboard offers first */
  lead: SpineLead;
  /** Show the "next year" pointer (pathways/goals) above the program */
  futureFirst: boolean;
  /** One line explaining the offer, in the student's register */
  programBlurb: string;
}

export function spineFor(year: YearLevel): Spine {
  if (year === "junior") {
    return {
      lead: "program",
      futureFirst: false,
      programBlurb:
        "One question a week, and one thing to actually do. This is the part that builds the habit.",
    };
  }
  if (year === "senior") {
    return {
      lead: "mission",
      futureFirst: true,
      programBlurb:
        "Ten weeks of character work. Slower than the rest of the app, and the part that outlasts school.",
    };
  }
  return {
    lead: "mission",
    futureFirst: false,
    programBlurb:
      "Ten weeks, one focus each. Each week has a question to sit with and something to actually do.",
  };
}
