// ─── One small step, and checking back on it ─────────────────────────────────
// After a reflection, the student can name one small thing they'll do because
// of it. It used to be the same three generic options everywhere, saved on the
// end of the entry and never read again, so it asked for a commitment and
// then forgot it.
//
// Now it follows what the research on following through says works:
//   - Specific beats general, so the options are written for each step and week.
//   - Deciding when in advance (an if-then plan) roughly doubles follow-through
//     (Gollwitzer & Sheeran, 2006), so the student picks when.
//   - Checking back on progress, especially when it's recorded, improves
//     follow-through (Harkin et al., 2016: d = 0.40 across 138 experiments).
//     So Home asks "Did you do it?" once it's due, and done steps are kept on
//     the Me page.
//   - A done step is also a small mastery experience, the main source of
//     self-efficacy (Bandura), and the Me list is the wins log the self-belief
//     boost already recommends.
//
// Steps are stored in small_steps (migration 020). The entry keeps its text
// copy too (withSmallStep), so older entries and pages read as before.

export type StepSource =
  | { kind: "activity"; key: string; label: string }
  | { kind: "week"; key: string; label: string }
  | { kind: "weekly"; key: string; label: string }
  | { kind: "next"; key: string; label: string };

export const GENERIC_STEPS = [
  "Tell one person one thing I wrote here",
  "Do one small thing differently this week",
  "Notice when this comes up, and jot it down",
];

/** Written for each mission step: what doing something about it looks like. */
const ACTIVITY_STEPS: Record<string, string[]> = {
  "chapters-so-far": [
    "Tell someone the title of the chapter I'm in",
    "Do one thing this week that fits the chapter I want next",
    "Ask someone how they'd title this year of mine",
  ],
  "strengths-mapping": [
    "Use my top strength on purpose once this week",
    "Tell someone which strength surprised me",
    "Notice a moment my top strength helped someone",
  ],
  "values-clarifier": [
    "Make one choice this week because of my top value",
    "Tell someone one value I picked, and why",
    "Notice one time I acted against a value, and what pulled me",
  ],
  "mask-check": [
    "Be a little more myself once in the room where I hold back",
    "Spend some time with someone I can be fully me around",
    "Notice the moment I switch into the other version of me",
  ],
  "identity-letter": [
    "Reread my letter on a day that's going badly",
    "Do one thing the letter says I care about",
    "Say one kind thing to myself that I wrote in it",
  ],
  "weekly-challenge": [
    "Try the experiment once more, a bit differently",
    "Tell someone how the experiment went",
    "Notice what made it easier or harder",
  ],
  "conversation-who-i-was": [
    "Thank the person I talked to",
    "Ask someone else the same question",
    "Do one thing the younger me would have loved",
  ],
  "parts-of-you": [
    "Read or watch one thing about a part I'm still working out, just for me",
    "Give myself a week off deciding anything about it",
    "Notice where I feel most at ease being myself",
  ],
  "what-matters": [
    "Spend 20 minutes on the thing that pulls at me",
    "Find one person or group who cares about it too",
    "Notice when it comes up in the news or around me",
  ],
  "contribution-map": [
    "Do one small thing for the cause I picked, using my strength",
    "Ask someone involved what help they actually need",
    "Look up one place near me where I could help",
  ],
  "the-other-side": [
    "Find out one more thing about the person I chose",
    "Tell a friend about them and why they matter to me",
    "Follow or contact one group doing this work",
  ],
  "commitment-statement": [
    "Do the first thing my statement says I'll do",
    "Tell one person what I'll do (not who I'll be) and check back with them",
    "Put my statement somewhere I'll see it",
  ],
  "purpose-challenge": [
    "Do the challenge once more",
    "Tell someone what I did and how it felt",
    "Notice who else is doing something similar",
  ],
  "conversation-what-matters": [
    "Thank the person I talked to",
    "Ask them one follow-up question",
    "Do one thing they said mattered to them",
  ],
  belonging: [
    "Spend more time in the place I really belong",
    "Make one person feel they belong, once this week",
    "Notice where I'm fitting in rather than belonging",
  ],
  "fitting-in-vs-belonging": [
    "Do the one thing I decided about the room that costs me",
    "Invite someone in who's on the edge of a group",
    "Notice when I change myself to fit, and whether I need to",
  ],
  "across-the-gap": [
    "Have one more conversation with someone different from me",
    "Ask them a question I'd normally assume the answer to",
    "Notice one thing we have in common",
  ],
  "people-who-shaped-you": [
    "Thank one person who shaped me",
    "Tell someone a story about one of them",
    "Do one thing they taught me, on purpose",
  ],
  "connection-challenge": [
    "Do the challenge once more",
    "Check in with the person it involved",
    "Notice how it changed the way we get on",
  ],
  "conversation-family-story": [
    "Write down the story before I forget it",
    "Ask one more question about it",
    "Share it with someone else in the family",
  ],
  "culture-and-heritage": [
    "Learn one more thing about where I come from, just for me",
    "Ask a family member about one tradition",
    "Notice a moment I feel connected to it",
  ],
  "where-ive-come-from": [
    "Do one thing I want to keep from how I was raised",
    "Try the reworked version of one thing, once",
    "Notice one thing I've let go of, and how that feels",
  ],
  "digital-self": [
    "Mute or unfollow one thing that pulls me off course",
    "Post or share one thing that's really me, or nothing at all",
    "Notice how I feel after scrolling, once a day",
  ],
  "future-self": [
    "Do one thing this week the person in my ordinary Tuesday would do",
    "Find out one fact about the path I pictured",
    "Tell someone about the day I pictured",
  ],
  "the-through-line": [
    "Write my thread somewhere I'll see it",
    "Make one choice this week that follows the thread",
    "Tell someone what I found runs through everything",
  ],
  "meaning-letter": [
    "Do the first small step towards the life in my letter",
    "Talk to someone who's living part of it",
    "Set a reminder to reread the letter in three months",
  ],
  "meaning-challenge": [
    "Do the challenge once more",
    "Tell someone what I chose and what it cost",
    "Notice whether the choice still feels right",
  ],
  "conversation-path": [
    "Thank the person I talked to",
    "Follow up on one thing they suggested",
    "Ask someone else how they chose",
  ],
};

/** Written for each program week's reflection. */
const WEEK_STEPS: Record<number, string[]> = {
  1: [
    "Act like one of my five qualities once, on purpose",
    "Ask someone which of my five they already see in me",
    "Notice one moment I wasn't who I want to be, without judging it",
  ],
  2: [
    "Do the behaviour for my top value one more time",
    "Swap one value's behaviour for one I'll actually do",
    "Tell someone one of my values and its behaviour",
  ],
  3: [
    "Do one more unnoticed thing, and still tell nobody",
    "Notice someone else's unnoticed contribution and thank them",
    "Give in one room where I mostly take",
  ],
  4: [
    "Keep the same promise for three more days",
    "Make a promise to someone else, and keep it",
    "Notice when I'm tempted to say yes and not mean it",
  ],
  5: [
    "Do one more session on my hill",
    "Tell someone what I can do now that I couldn't on day one",
    "Pick the next step up on the same hill",
  ],
  6: [
    "Use the three questions on one real choice",
    "Talk a dilemma through with someone I trust",
    "Notice a choice I made on autopilot",
  ],
  7: [
    "Live one identity statement on purpose, once",
    "Rewrite the statement that felt least true",
    "Notice what reliably shrinks my gap before reacting",
  ],
  8: [
    "Spend time with one person who brings out my best",
    "Have one honest conversation with an adult I trust",
    "Notice who I copy without meaning to",
  ],
  9: [
    "Have one more screen-free half hour",
    "Do nothing for ten minutes and let my mind wander",
    "Notice the urge to reach for my phone, and wait",
  ],
  10: [
    "Put my Character Code somewhere I'll see it",
    "Do one thing from my Code this week, on purpose",
    "Read my Code to someone I trust",
  ],
};

const WEEKLY_FIVE_STEPS = [
  "Do the one thing my answers point to",
  "Tell someone how this week actually went",
  "Pick one question to watch for next week",
];

export function stepOptions(source: StepSource): string[] {
  if (source.kind === "activity") return ACTIVITY_STEPS[source.key] ?? GENERIC_STEPS;
  if (source.kind === "week") return WEEK_STEPS[Number(source.key)] ?? GENERIC_STEPS;
  if (source.kind === "weekly") return WEEKLY_FIVE_STEPS;
  return GENERIC_STEPS;
}

// ─── When ─────────────────────────────────────────────────────────────────────

export type StepWhen = "today" | "tomorrow" | "weekend" | "week";

export const WHEN_OPTIONS: { key: StepWhen; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "weekend", label: "This weekend" },
  { key: "week", label: "This week" },
];

export function whenLabel(when: StepWhen | null | undefined): string {
  return WHEN_OPTIONS.find((w) => w.key === when)?.label ?? "";
}

/**
 * When Home asks "Did you do it?": the morning after the chosen day, so the
 * question comes once there's been a chance, not before.
 */
export function dueFor(when: StepWhen, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(7, 0, 0, 0);
  const add = (n: number) => d.setDate(d.getDate() + n);
  if (when === "today") add(1);
  else if (when === "tomorrow") add(2);
  else if (when === "weekend") {
    // The Monday after the coming weekend (or after this one, if it's Sat/Sun).
    const day = d.getDay(); // 0 Sun … 6 Sat
    add(day === 0 ? 1 : 8 - day);
  } else add(6);
  return d;
}

/** "Not yet" puts it off this many days. After two, Home offers to let it go. */
export const SNOOZE_DAYS = 3;
export const SNOOZES_BEFORE_LET_GO = 2;

export interface SmallStepRow {
  id: string;
  step: string;
  when_label: string | null;
  source_label: string | null;
  status: "open" | "done" | "dropped";
  due_at: string;
  snoozes: number;
  done_at: string | null;
  created_at: string;
}

/** The step as saved on the entry's text copy: "This weekend: Tell someone…". */
export function stepWithWhen(step: string, when: StepWhen | null): string {
  const label = whenLabel(when);
  return label ? `${label}: ${step}` : step;
}
