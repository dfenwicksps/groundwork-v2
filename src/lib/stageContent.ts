// ─── Mission steps, worded for where the student is ──────────────────────────
// The missions are written once, for a student at school. Most of them fit a
// 20-year-old as they stand: belonging, values and purpose don't depend on
// being in Year 9. A few don't. They're set in a classroom or an assembly, or
// they picture a fixed age the student may already have passed. This swaps in
// versions of just those lines, so nobody who has left school is asked who
// they are "in class", or told to imagine being the age they already are.
//
// Only wording changes, never the shape: the same number of questions in the
// same order, so saved entries, recall and the journal read the same whatever
// stage a student was at when they wrote them.

import type { Activity } from "./missions";
import { futureSelfAge, hasLeftSchool, type LifeStage } from "./lifeStage";

/** Lines replaced for students who have left school, by activity id. */
interface StageLines {
  prompt?: string;
  warmUp?: string;
  /** Replacements by index; the rest stay as written. */
  scenarios?: Record<number, string>;
  starterOptions?: Record<number, string[]>;
}

const LEFT_SCHOOL: Record<string, StageLines> = {
  "mask-check": {
    prompt:
      "Think about who you are at work or study, at home, and with your closest friends. Where do you feel most like yourself? Where do you feel like you're performing?",
    scenarios: {
      0: "Same joke, three rooms. Something funny pops into your head. With your closest friends you'd say it one way. At work, or in a tutorial, you'd say a watered-down version, or read the room and not bother. At a family dinner you might not say it at all.",
    },
  },
  "what-matters": {
    scenarios: {
      1: "A talk, a podcast, a guest lecture. Most people are half-listening, but something about this person has actually got you — and a week later, you still remember them.",
    },
  },
  "contribution-map": {
    scenarios: {
      0: "Your workplace, club or uni group is running a big fundraiser for a cause. At the first meeting, jobs get handed out — posters, speeches, budgets, the group chat, the actual event. You look at the list, and one job quietly has your name on it.",
    },
  },
  "the-other-side": {
    scenarios: {
      0: "After a shift or a lecture, you notice someone stayed back to help with the exact kind of thing you care about — no audience, no credit. You'd never really talked to them before.",
    },
    starterOptions: {
      0: [
        "A friend who cares more than they let on",
        "A family member who's quietly been doing this for years",
        "A boss, lecturer or coach who lights up about it",
        "Someone at work or uni I've never properly talked to",
        "Honestly — I haven't found anyone yet, and I'd like to",
      ],
    },
  },
  "commitment-statement": {
    scenarios: {
      0: "There's a wall of causes in a café, a library or a uni corridor, each with one sentence and a name signed under it. Yours is going up where people you know will read it.",
    },
  },
};

/** Moves the Future Self's age with the student (see futureSelfAge). */
function atAge(text: string | undefined, age: number): string | undefined {
  return text && age !== 21 ? text.replace(/\b21\b/g, String(age)) : text;
}

function withLines(activity: Activity, lines: StageLines | undefined): Activity {
  if (!lines) return activity;
  return {
    ...activity,
    prompt: lines.prompt ?? activity.prompt,
    warmUp: lines.warmUp ?? activity.warmUp,
    scenarios: activity.scenarios?.map((s, i) => lines.scenarios?.[i] ?? s),
    starterOptions: activity.starterOptions?.map((o, i) => lines.starterOptions?.[i] ?? o),
  };
}

/** The activity as this student should see it. */
export function activityForStage(activity: Activity, stage: LifeStage): Activity {
  let a = hasLeftSchool(stage) ? withLines(activity, LEFT_SCHOOL[activity.id]) : activity;

  const age = futureSelfAge(stage);
  if (a.id === "future-self") {
    a = {
      ...a,
      prompt: atAge(a.prompt, age)!,
      scenarios: a.scenarios?.map((s) => atAge(s, age)!),
      scaffoldingSteps: a.scaffoldingSteps?.map((s) => atAge(s, age)!),
      whyItMatters: atAge(a.whyItMatters, age),
    };
  } else if (a.id === "where-ive-come-from") {
    // Its wrap-up hands over to the Future Self by name.
    a = { ...a, wrapUp: atAge(a.wrapUp, age) };
  }
  return a;
}

/** A sentence starter or hint for the Future Self, at the student's age. */
export function futureSelfLine(text: string, stage: LifeStage): string {
  const age = futureSelfAge(stage);
  if (age === 21) return text;
  // "between 15 and 21" is a school student's span; anyone else starts now.
  return text.replace(/between 15 and 21/, `between now and ${age}`).replace(/\b21\b/g, String(age));
}
