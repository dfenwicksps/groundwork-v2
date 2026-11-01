// ─── Mission steps, worded for where the student is ──────────────────────────
// The missions are written once, for a student at school. Most of them fit a
// 20-year-old as they stand: belonging, values and purpose don't depend on
// being in Year 9. A few don't. They're set in a classroom or an assembly, or
// they picture a fixed age the student may already have passed. This swaps in
// versions of just those lines, so nobody who has left school is asked who
// they are "in class", or told to imagine being the age they already are.
//
// Year 7–9 get their own versions too, for a different reason: not the
// setting but the demand. Finding one theme across your whole life is a skill
// that mostly arrives in late adolescence (Habermas & Bluck, 2000), and a
// future nine years off is too far to picture concretely. So the youngest
// students get a nearer future and a more concrete version of the thread,
// which they can leave out.
//
// Only wording changes, never the shape: the same number of questions in the
// same order, so saved entries, recall and the journal read the same whatever
// stage a student was at when they wrote them. (Which questions can be left
// out may change; that doesn't affect how an entry reads.)

import type { Activity, Mission } from "./missions";
import { futureSelfAge, type LifeStage } from "./lifeStage";
import {
  JUNIOR_M1,
  SENIOR_M1,
  LEFT_SCHOOL_M1,
  LEAVER_M1,
  ADULT_M1,
  MISSION_DESCRIPTIONS,
} from "./stageContentMission1";
import {
  JUNIOR_M2,
  SENIOR_M2,
  LEFT_SCHOOL_M2,
  LEAVER_M2,
  ADULT_M2,
  MISSION2_DESCRIPTIONS,
} from "./stageContentMission2";

/** Lines replaced for one life stage, by activity id. */
export interface StageLines {
  /** A step whose purpose changes at a stage (Year 7–9's "What I Want to Explore") */
  title?: string;
  whyItMatters?: string;
  prompt?: string;
  warmUp?: string;
  intro?: string;
  wrapUp?: string;
  alternative?: string;
  /** Replacements by index, like steps */
  interviewQuestions?: Record<number, string>;
  /** Replacements by index for the questions themselves */
  steps?: Record<number, string>;
  skippableSteps?: number[];
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

const JUNIOR: Record<string, StageLines> = {
  "future-self": {
    starterOptions: {
      0: [
        "In Year 10 or 11, doing subjects I actually picked",
        "Known for something I'm properly into",
        "With a part-time job and some money of my own",
        "Surrounded by a small crew of real friends",
        "Honestly can't picture it \u2014 and maybe that's okay",
      ],
      2: [
        "The friends I have now \u2014 the real ones",
        "Being close to my family",
        "The thing I do that isn't for marks",
        "A place I love going to",
        "Having people I can turn up to unannounced",
      ],
    },
  },
  "the-through-line": {
    steps: {
      3: "Look back at those three answers. Is there one thing that shows up in more than one \u2014 a strength, something you care about, a kind of person you're drawn to? Say it in one sentence. If nothing joins up yet, that's normal at your age: write the closest one, or leave it out. My story will ask again next year.",
    },
    skippableSteps: [3],
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
    title: lines.title ?? activity.title,
    whyItMatters: lines.whyItMatters ?? activity.whyItMatters,
    prompt: lines.prompt ?? activity.prompt,
    warmUp: lines.warmUp ?? activity.warmUp,
    intro: lines.intro ?? activity.intro,
    wrapUp: lines.wrapUp ?? activity.wrapUp,
    alternative: lines.alternative ?? activity.alternative,
    interviewQuestions: activity.interviewQuestions?.map((q, i) => lines.interviewQuestions?.[i] ?? q),
    scaffoldingSteps: activity.scaffoldingSteps?.map((s, i) => lines.steps?.[i] ?? s),
    skippableSteps: lines.skippableSteps
      ? Array.from(new Set([...(activity.skippableSteps ?? []), ...lines.skippableSteps]))
      : activity.skippableSteps,
    scenarios: activity.scenarios?.map((s, i) => lines.scenarios?.[i] ?? s),
    starterOptions: activity.starterOptions?.map((o, i) => lines.starterOptions?.[i] ?? o),
  };
}

/** The activity as this student should see it. */
export function activityForStage(activity: Activity, stage: LifeStage): Activity {
  const id = activity.id;
  // Applied in order, later layers winning: what anyone past school needs, then
  // the stage's own lines. Middle (Year 10–11) reads missions.ts as written.
  const layers: (StageLines | undefined)[] =
    stage === "leaver"
      ? [LEFT_SCHOOL[id], LEFT_SCHOOL_M1[id], LEFT_SCHOOL_M2[id], LEAVER_M1[id], LEAVER_M2[id]]
      : stage === "adult"
        ? [LEFT_SCHOOL[id], LEFT_SCHOOL_M1[id], LEFT_SCHOOL_M2[id], ADULT_M1[id], ADULT_M2[id]]
        : stage === "junior"
          ? [JUNIOR[id], JUNIOR_M1[id], JUNIOR_M2[id]]
          : stage === "senior"
            ? [SENIOR_M1[id], SENIOR_M2[id]]
            : [];
  let a = layers.reduce<Activity>((acc, lines) => withLines(acc, lines), activity);

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
  return text
    .replace(/between 15 and 21/, `between now and ${age}`)
    .replace(/for six years/, "for a few years")
    .replace(/\b21\b/g, String(age));
}

/**
 * Steps a stage doesn't see at all. Parts of Who You Are asks about beliefs,
 * gender and sexuality; for Year 7–9 (12 to 15) that's a conversation for
 * families and school wellbeing staff, not a self-guided app, so the step is
 * hidden rather than reworded. It's optional and never counts towards a
 * mission, so hiding it changes nothing about progress. Anything a student
 * already wrote there stays theirs, in the Journal.
 */
const HIDDEN_BY_STAGE: Partial<Record<LifeStage, string[]>> = {
  junior: ["parts-of-you"],
};

export function hiddenForStage(activityId: string, stage: LifeStage): boolean {
  return !!HIDDEN_BY_STAGE[stage]?.includes(activityId);
}

/** The mission as this student should see it: its description, and every step. */
export function missionForStage(mission: Mission, stage: LifeStage): Mission {
  return {
    ...mission,
    description:
      (mission.id === 2 ? MISSION2_DESCRIPTIONS[stage] : MISSION_DESCRIPTIONS[stage]?.[mission.id]) ??
      mission.description,
    activities: mission.activities
      .filter((a) => !hiddenForStage(a.id, stage))
      .map((a) => activityForStage(a, stage)),
  };
}
