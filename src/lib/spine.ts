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
// ─── One rule overrides all three: the missions come first ───────────────────
//
// The four missions are the foundation; the ten weeks are where what was
// learned in them gets grown and embedded. So the missions are completed
// first, and the program is the practice layer that follows.
//
// This isn't only a philosophical ordering — the program is already built on
// mission output. Week 1 sets the qualities you want at 25 against the
// strengths Mission 1 mapped; week 2 attaches a behaviour to each of the five
// values Mission 1 chose; week 6 reads the moral compass; week 9 points at
// Mission 4's Digital Self. Run the weeks first and half of them are a
// worksheet with an errand attached.
//
// It used to be a live contradiction rather than a theory: juniors were told
// "Start here → the program", and the program's week 1 immediately sent them
// into Mission 1 to take an eight-minute assessment. The "start here" track's
// first step was the other track.
//
// So the order the app now teaches, everywhere it speaks about order:
//
//   Missions 1-4  →  the ten weeks  →  the weekly five, indefinitely
//
// Nothing is hard-locked: a student who wants to read week 5 today still can,
// and the year-level reasoning above still shapes everything else. The spine
// only decides what gets offered first, and while missions are outstanding the
// answer is the same for everyone.

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
  missionsDone: number = MISSION_COUNT
): Spine {
  const done = Math.max(0, Math.min(MISSION_COUNT, missionsDone));
  const futureFirst = year === "senior";

  if (done < MISSION_COUNT) {
    const left = MISSION_COUNT - done;
    return {
      lead: "mission",
      futureFirst,
      missionsFirst: true,
      missionsDone: done,
      programBlurb:
        left === MISSION_COUNT
          ? "Ten weeks of putting it into practice — it opens once the four missions are done."
          : `Ten weeks of putting it into practice. ${left} mission${left === 1 ? "" : "s"} to go first.`,
      orderLine:
        "The four missions first — they're the foundation. Then the ten-week program takes what you found there and grows it into habit.",
    };
  }

  // Foundation laid. The program is now the only track still moving, so it
  // leads regardless of year level; the year level still decides whether the
  // next-year work sits above it.
  return {
    lead: "program",
    futureFirst,
    missionsFirst: false,
    missionsDone: done,
    programBlurb:
      year === "senior"
        ? "All four missions done. Ten weeks of character work now — slower than the rest of the app, and the part that outlasts school."
        : "All four missions done. Now the ten weeks — one question each, and one thing to actually do.",
    orderLine:
      "All four missions are done. The ten weeks are what turns what you found in them into habit — one week at a time, then the weekly five for good.",
  };
}
