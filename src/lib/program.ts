// ─── The 10-Week Character Program ────────────────────────────────────────────
// The missions are a library: self-paced content a student can explore in any
// order. This is the opposite — a cadence. Ten weeks, one focus each, each with
// a practical challenge that has to be lived rather than written about.
//
// The synthesis it encodes: identity is the starting point, character is the
// practice, contribution is the evidence. Work out who you want to be → name
// what that person values → practise behaviours consistent with those values →
// reflect on your impact on other people → repeat until it's just who you are.
//
// Where the app already has a tool for a week's work, that week links to it
// rather than duplicating it — the program supplies the sequence and the
// challenge, not a second copy of the strengths assessment.

/** The five questions a student returns to every week (see WEEKLY_FIVE). */
export type Strand = "identity" | "values" | "discipline" | "contribution" | "impact";

export type ChallengeKind =
  /** Repeats every day of the week — tracked on a 7-day grid */
  | "daily"
  /** A fixed number of sessions across the week, not tied to specific days */
  | "sessions"
  /** One thing, made once, that stands for the whole week */
  | "single";

export interface ProgramWeek {
  week: number;
  /** The week's question — used as its title */
  title: string;
  /** The developmental point of the week, for adults reading over a shoulder */
  focus: string;
  /** Teen-voiced framing: why this one matters */
  intro: string;
  /** The questions to sit with — not necessarily written down */
  questions: string[];
  challenge: {
    title: string;
    description: string;
    kind: ChallengeKind;
    /** For "daily" (7) and "sessions" (n) — how many ticks complete it */
    target?: number;
    /** Label for one unit of the challenge, e.g. "day", "session" */
    unit?: string;
    /**
     * Weeks 4 and 5 require the student to name their own commitment
     * (the promise, the hill) before the tracking means anything.
     */
    commitmentPrompt?: string;
  };
  /** An existing part of the app that already does this week's inner work */
  link?: { href: string; label: string; note: string };
  /** Which of the weekly five this week deepens */
  strand: Strand | "all";
  emoji: string;
}

export const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    week: 1,
    emoji: "🧭",
    strand: "identity",
    title: "Who am I becoming?",
    focus:
      "Identity is something to explore rather than something other people simply assign to you.",
    intro:
      "Most people never choose their character — they inherit it from whoever was around. This week you get the choice back. Not who you are right now: who you're heading towards.",
    questions: [
      "What kind of person do I want to become?",
      "What qualities do I admire in other people — and why those ones?",
      "What do I never want to become?",
    ],
    challenge: {
      title: "Five qualities at 25",
      description:
        "Choose five character qualities you'd want people to use when describing you at 25. Not achievements, not a job — qualities. Write them somewhere you'll see them.",
      kind: "single",
    },
    link: {
      href: "/missions/1/activities/strengths-mapping",
      label: "Strengths Mapping",
      note: "Start from where you actually are — rank all 24 character strengths first.",
    },
  },
  {
    week: 2,
    emoji: "⚖️",
    strand: "values",
    title: "What do I stand for?",
    focus: "Move from vague preferences to values and ethical standards.",
    intro:
      "Saying you value honesty is easy and costs nothing. A value only counts once you can name the behaviour that proves it — and once you've paid something for it.",
    questions: [
      "What matters enough that I would defend it?",
      "What do I actually believe about honesty, fairness, courage, loyalty, kindness and responsibility?",
      "Which of my values have I never once been tested on?",
    ],
    challenge: {
      title: "Five values, five behaviours",
      description:
        "Pick five core values. Next to each, write one specific behaviour that demonstrates it — something someone watching could observe. A value without a behaviour is a preference.",
      kind: "single",
    },
    link: {
      href: "/missions/1/activities/values-clarifier",
      label: "Values Clarifier",
      note: "Choose your five here — then come back and write the behaviour for each.",
    },
  },
  {
    week: 3,
    emoji: "🪑",
    strand: "contribution",
    title: "Am I a contributor?",
    focus: "The surplus-value, chair-stacking mentality: contribute more than you consume.",
    intro:
      "Every room you walk into is being held up by someone. The chairs get stacked, the mess gets cleaned, the thing gets organised — and someone is doing it. This week you find out whether you're one of them.",
    questions: [
      "Do I mostly ask 'what am I getting?' or 'what can I contribute?'",
      "What needs doing around me that nobody has asked me to do?",
      "Which room am I currently taking more from than I put in?",
    ],
    challenge: {
      title: "One unnoticed contribution a day",
      description:
        "Every day this week, do one useful thing nobody asked you to do — and tell nobody. No posting it, no mentioning it, no collecting credit. The moment you cash it in for recognition, it stops being contribution and starts being trade.",
      kind: "daily",
      target: 7,
      unit: "day",
    },
    link: {
      href: "/me#standard",
      label: "The Standard — question 2",
      note: "'How am I adding more value than I am consuming?' — this week is that question, lived.",
    },
  },
  {
    week: 4,
    emoji: "🤝",
    strand: "values",
    title: "Can people trust me?",
    focus: "Character becomes visible through reliability and integrity.",
    intro:
      "Trust isn't built in dramatic moments. It's built in whether small, boring promises get kept when nobody would notice if they weren't. Reliability is character you can see from the outside.",
    questions: [
      "Do I keep promises — including the small ones?",
      "Am I the same person privately and publicly?",
      "What happens when doing the right thing costs me socially?",
    ],
    challenge: {
      title: "One promise, kept every day",
      description:
        "Make one small promise and keep it every single day this week. Exercise, study, arriving on time, helping someone. Small and kept beats ambitious and dropped — the size doesn't matter, the keeping does.",
      kind: "daily",
      target: 7,
      unit: "day",
      commitmentPrompt:
        "Write the promise you're making. Be specific enough that at the end of a day you'd know for certain whether you kept it.",
    },
    link: {
      href: "/me#standard",
      label: "The Standard — question 3",
      note: "'How am I being someone people can trust?' — this week is the evidence for it.",
    },
  },
  {
    week: 5,
    emoji: "🧗",
    strand: "discipline",
    title: "Do I do hard things?",
    focus: "Character develops along the path of resistance.",
    intro:
      "Comfort is the default and it's very good at disguising itself as a reasonable decision. This week is about picking one hill — something that matters and is genuinely hard — and going at it on the days you don't feel like it.",
    questions: [
      "What difficulty am I avoiding right now?",
      "Where am I choosing comfort and calling it something else?",
      "What would I attempt if I weren't worried about being bad at it in front of people?",
    ],
    challenge: {
      title: "Choose your hill",
      description:
        "Pick one personal hill — fitness, study, a skill, an instrument, a conversation you've been dodging, volunteering. Work on it four times this week. Not perfectly. Consistently.",
      kind: "sessions",
      target: 4,
      unit: "session",
      commitmentPrompt:
        "Name your hill, and what one session of work on it actually looks like.",
    },
    link: {
      href: "/me#practice",
      label: "Strength in action",
      note: "The practice loop is built for exactly this — a record of the reps, never a streak.",
    },
  },
  {
    week: 6,
    emoji: "🧠",
    strand: "values",
    title: "What guides my choices?",
    focus: "Moral wisdom rather than simple rule-following.",
    intro:
      "Rules run out. Real situations are messy, fast, and usually have your friends in them. What you need isn't a longer list of rules — it's a way of thinking that works when the rule doesn't cover it.",
    questions: [
      "What would I do if my friends were humiliating somebody?",
      "What if everyone else thought something harmful was funny?",
      "What principles would guide me when there's no rule to follow?",
    ],
    challenge: {
      title: "One dilemma a day, three questions",
      description:
        "Each day, take one real situation — from your life, the news, a show, a group chat — and run it through three questions: What could happen? Who could be harmed? What would a trustworthy person do?",
      kind: "daily",
      target: 7,
      unit: "day",
    },
    link: {
      href: "/me#moral",
      label: "Moral Compass",
      note: "Find out how you already decide — care, fairness, loyalty or principle — before practising.",
    },
  },
  {
    week: 7,
    emoji: "🛑",
    strand: "discipline",
    title: "Can I manage myself?",
    focus: "Connecting self-control with identity rather than willpower.",
    intro:
      "Willpower runs out; identity doesn't. 'I'm trying not to react' is a fight you'll lose eventually. 'I'm the kind of person who stops before reacting' is a description you start living up to.",
    questions: [
      "What actually triggers me?",
      "Which choices do I regret when I'm angry, tired or under pressure?",
      "Who am I when nobody is controlling me?",
    ],
    challenge: {
      title: "Three identity statements",
      description:
        "Write three statements that begin 'I'm the kind of person who…'. Keeps my word. Stops before reacting. Looks after my body. Make them yours, make them true-ish, and say them like facts rather than goals.",
      kind: "single",
    },
  },
  {
    week: 8,
    emoji: "👥",
    strand: "identity",
    title: "Who is shaping me?",
    focus: "Character develops socially, through peers and adults.",
    intro:
      "You're an average of the people you spend time with, and that happens whether you're paying attention or not. This week you pay attention — and then you choose on purpose.",
    questions: [
      "Who makes me better after I've spent time with them?",
      "Who pulls me towards versions of myself I don't respect?",
      "Which adults model the person I actually want to become?",
    ],
    challenge: {
      title: "Three peers, two adults",
      description:
        "Name three peers who lift you and two adults worth learning from. Then spend deliberate time with them this week — not accidental time. Send the message, take the lift, ask the question.",
      kind: "single",
    },
    link: {
      href: "/support",
      label: "Support Circle",
      note: "Add the adults here, with conversation scaffolds for the first awkward approach.",
    },
  },
  {
    week: 9,
    emoji: "🌿",
    strand: "identity",
    title: "Do I leave room for inner work?",
    focus: "Identity requires reflection rather than constant external stimulation.",
    intro:
      "You can't hear yourself think if you never stop the input. And if you've never been alone with your own thoughts, it's worth asking whose thoughts you've been having.",
    questions: [
      "When am I actually alone with my thoughts?",
      "Whose opinions are shaping what I believe?",
      "Are my values mine, or copied from an algorithm, an influencer or a friendship group?",
    ],
    challenge: {
      title: "Three screen-free half hours",
      description:
        "Three times this week, take 30 minutes with no screen. Walk, sit outside, journal, or just think. Boredom is not the failure state here — it's the point. Something starts happening around minute twelve.",
      kind: "sessions",
      target: 3,
      unit: "session",
    },
    link: {
      href: "/missions/4/activities/digital-self",
      label: "The Digital Self",
      note: "Looks at the gap between who you are online and who you are the rest of the time.",
    },
  },
  {
    week: 10,
    emoji: "📜",
    strand: "all",
    title: "What will my character code be?",
    focus:
      "Integrating values, contribution, courage, self-control and purpose into one artefact.",
    intro:
      "Nine weeks of evidence about who you are and who you're becoming. This week you write it down as commitments — not aspirations, not vibes. The kind of thing you could be held to.",
    questions: [
      "Who am I?",
      "What do I stand for?",
      "What do I contribute?",
      "How do I respond when life is difficult?",
      "What do people experience when I enter a room?",
    ],
    challenge: {
      title: "Write your Character Code",
      description:
        "Five to seven commitments to guide the next year. Written as things you do, not things you'd like to be. This is the artefact the whole program has been building towards.",
      kind: "single",
    },
  },
];

export const WEEK_BY_NUMBER: Record<number, ProgramWeek> = Object.fromEntries(
  PROGRAM_WEEKS.map((w) => [w.week, w])
);

// ─── The weekly five ──────────────────────────────────────────────────────────
// The whole program compressed into five questions a student can return to
// every week, forever, after the ten weeks are done. The Standard's three-part
// test lives inside these: contribution is question 4, impact is question 5,
// and trust runs through question 2.

export interface WeeklyQuestion {
  key: Strand;
  name: string;
  question: string;
  emoji: string;
  /** Plain-English gloss so the question can't be answered on autopilot */
  meaning: string;
  placeholder: string;
}

export const WEEKLY_FIVE: WeeklyQuestion[] = [
  {
    key: "identity",
    name: "Identity",
    emoji: "🧭",
    question: "Who am I becoming?",
    meaning:
      "Not who you are today — the direction. One week doesn't change much, but ten of these in a row show you a line.",
    placeholder: "Which way did this week move you? Towards or away?",
  },
  {
    key: "values",
    name: "Values",
    emoji: "⚖️",
    question: "What do I stand for?",
    meaning:
      "A value you were never tested on this week is just a preference. Where did one of yours actually cost you something?",
    placeholder: "What did you hold to this week — and what did holding it cost?",
  },
  {
    key: "discipline",
    name: "Discipline",
    emoji: "🧗",
    question: "What hard thing am I willing to do because it matters?",
    meaning:
      "Not the hard thing you should do. The one you actually did, on a day you didn't want to.",
    placeholder: "What did you do this week that comfort was arguing against?",
  },
  {
    key: "contribution",
    name: "Contribution",
    emoji: "🪑",
    question: "What am I giving rather than merely consuming?",
    meaning:
      "Every room takes effort to keep running. Were you one of the people doing that, or living off someone who was?",
    placeholder: "What did you put in this week that nobody asked you for?",
  },
  {
    key: "impact",
    name: "Impact",
    emoji: "🛡️",
    question:
      "Are people safer, stronger or better because I am in their lives?",
    meaning:
      "The one question the whole thing comes down to. Answer it about specific people, not people in general.",
    placeholder: "Name one person. Were they better off for you being there this week?",
  },
];

export const WEEKLY_BY_KEY: Record<Strand, WeeklyQuestion> = Object.fromEntries(
  WEEKLY_FIVE.map((q) => [q.key, q])
) as Record<Strand, WeeklyQuestion>;

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface WeekProgress {
  week: number;
  /** Ticked units — day indices 0-6 for "daily", or 0..n-1 for "sessions" */
  days: number[];
  /** The student's own promise / hill, where the week asks for one */
  commitment: string | null;
  reflection: string | null;
  completed_at: string | null;
  started_at: string;
}

export function parseDays(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  // Deduplicated — a repeated index would otherwise inflate the tick count and
  // could complete a week the student only half did.
  return Array.from(
    new Set(
      raw.filter(
        (d): d is number =>
          typeof d === "number" && Number.isInteger(d) && d >= 0 && d < 7
      )
    )
  ).sort((a, b) => a - b);
}

/**
 * A week counts as done when its challenge target is met and it's been
 * reflected on. "single" weeks have nothing to tick — making one thing once is
 * the challenge — so for those the reflection alone completes the week.
 */
export function isWeekComplete(w: ProgramWeek, p: WeekProgress | undefined): boolean {
  if (!p) return false;
  if (p.completed_at) return true;
  if (!p.reflection?.trim()) return false;
  if (w.challenge.kind === "single") return true;
  return p.days.length >= (w.challenge.target ?? 1);
}

/**
 * The week to point the student at: the first not-yet-complete week, so the
 * program never nags about a week they skipped — it just keeps offering the
 * next thing. Returns 10 once everything is done.
 */
export function currentWeek(progress: Record<number, WeekProgress>): number {
  for (const w of PROGRAM_WEEKS) {
    if (!isWeekComplete(w, progress[w.week])) return w.week;
  }
  return PROGRAM_WEEKS.length;
}

export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Character Code ───────────────────────────────────────────────────────────
// Stored as a milestone journal entry (the commitment-statement pattern) rather
// than its own table — it belongs in the journal, and writing it again simply
// supersedes the previous version.

export const CHARACTER_CODE_ACTIVITY_ID = "character-code";
export const CODE_MIN = 5;
export const CODE_MAX = 7;

export function codeToResponse(commitments: string[]): string {
  return commitments
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");
}

export function responseToCode(response: string | null | undefined): string[] {
  if (!response) return [];
  return response
    .split("\n")
    .map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}
