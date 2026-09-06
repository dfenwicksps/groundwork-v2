import type { YearLevel } from "./yearLevel";

// ─── The spine ────────────────────────────────────────────────────────────────
// Groundwork carries two bodies of work: the Missions (a library, explored in
// any order) and the 10-Week Program (a cadence, walked in sequence). Presented
// as peers they compete — two tracks both saying "start here", with nothing
// telling a student which is theirs.
//
// The spine picks one to lead with. It never hides anything: both tracks stay
// fully reachable from the nav. It only decides what the dashboard offers
// first, because the first card is the only one some students will ever read.
//
// Year level no longer decides *which track* leads — the missions do, until
// they're finished (see below). What it still decides is whether the
// near-future work sits above the program once they are: a Year 12 arrives
// with questions about next year, and a ten-week character cadence is not the
// answer to those, so pathways and goals are surfaced first for seniors.
//
// ─── The rule that overrides year level: Mission 1 comes first ───────────────
//
// Mission 1 is the foundation and the program cannot start without it: week 1
// sets the qualities you want at 25 against the strengths it mapped, and week 2
// attaches a behaviour to each of the five values it chose. Neither week works
// without that material, so Mission 1 gates the program.
//
// Missions 2, 3 and 4 do NOT gate it — they gate the weeks that are actually
// built on them (see `required` on ProgramWeek.sources):
//
//   Mission 1  →  weeks 1-2      strengths and values
//   Mission 2  →  week 3         what you care about
//   Mission 3  →  week 6         holding a view that isn't yours
//   Mission 4  →  week 9         what the input is doing to you
//
// All four still get finished. The difference is when. Requiring all four up
// front puts roughly four hours of reflective writing in front of the first
// lived challenge, and the challenges are what actually change behaviour — so
// front-loading delays every behavioural mechanism in the app at the age most
// likely to abandon it. Staging them means a student starts living the work
// after one mission, and meets each later mission at the point its material is
// needed, which also happens to be when it will stick.
//
// This is a gate, not a lock: every week stays readable, and only finishing a
// week that genuinely depends on a mission requires that mission.

export type SpineLead = "program" | "mission";

/** The four missions, and how many of them are finished. */
export const MISSION_COUNT = 4;

export interface Spine {
  /** Which track the dashboard offers first */
  lead: SpineLead;
  /** Show the "next year" pointer (pathways/goals) above the program */
  futureFirst: boolean;
  /** One line explaining the offer, in the student's register */
  programBlurb: string;
  /**
   * True while any mission is outstanding, so the lead is the missions by
   * design rather than by year level. Surfaces as different copy: "finish the
   * foundation first" rather than "this one's yours".
   */
  missionsFirst: boolean;
  /** How many of the four are done — shown wherever the program is held back */
  missionsDone: number;
  /** The order, in one sentence — shown wherever the app explains itself. */
  orderLine: string;
}

/**
 * @param year          the student's year level, from onboarding
 * @param missionsDone  how many of the four missions are fully complete.
 *                      Defaults to MISSION_COUNT so callers that genuinely
 *                      can't know (the nav, which only reads a cookie) keep
 *                      their old behaviour instead of nagging on every screen.
 */
export function spineFor(
  year: YearLevel,
  missionsDone: number = MISSION_COUNT,
  /** Mission 1 specifically — the program's only hard prerequisite. */
  foundationDone: boolean = missionsDone >= 1
): Spine {
  const done = Math.max(0, Math.min(MISSION_COUNT, missionsDone));
  const futureFirst = year === "senior";

  if (!foundationDone) {
    return {
      lead: "mission",
      futureFirst,
      missionsFirst: true,
      missionsDone: done,
      programBlurb:
        "Ten weeks of putting it into practice — it opens once Mission 1 has mapped your strengths and values.",
      orderLine:
        "Mission 1 first — weeks 1 and 2 are made from the strengths and values it maps. After that the weeks run every week, and missions 2 to 4 arrive as the weeks that need them come up.",
    };
  }

  // Foundation laid. The program is now the only track still moving, so it
  // leads regardless of year level; the year level still decides whether the
  // next-year work sits above it.
  const left = MISSION_COUNT - done;
  return {
    lead: "program",
    futureFirst,
    missionsFirst: false,
    missionsDone: done,
    programBlurb:
      year === "senior"
        ? "Ten weeks of character work — slower than the rest of the app, and the part that outlasts school."
        : "Ten weeks — one question each, and one thing to actually do.",
    orderLine:
      left === 0
        ? "All four missions are done. The ten weeks are what turns what you found in them into habit — one week at a time, then the weekly five for good."
        : `Mission 1 is done, so the weeks are open. The other ${left} mission${left === 1 ? "" : "s"} aren't homework — each one unlocks the week that's built on it, when you get there.`,
  };
}
