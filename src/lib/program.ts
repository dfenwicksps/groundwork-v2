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
// The program follows the four missions rather than running beside them: the
// missions are the foundation, these ten weeks are where what was found there
// gets grown and embedded. See src/lib/spine.ts.
//
// So where a week's material already exists, the week *shows* it rather than
// linking to it. Week 1 displays the strengths Mission 1 mapped and asks which
// five you want at 25; week 2 lays out the values Mission 1 chose and asks for
// the behaviour that proves each. A link would be a detour for anyone who had
// already done the work — which, in this order, is everyone. `link` is kept
// only for genuinely different tools a week points into (see `source` vs
// `link` on ProgramWeek).

/** The five questions a student returns to every week (see WEEKLY_FIVE). */
export type Strand = "identity" | "values" | "discipline" | "contribution" | "impact";

export type ChallengeKind =
  /** Repeats every day of the week — tracked on a 7-day grid */
  | "daily"
  /** A fixed number of sessions across the week, not tied to specific days */
  | "sessions"
  /** One thing, made once, that stands for the whole week */
  | "single";

/**
 * The thing a week asks the student to name and keep. Each kind is a different
 * shape of answer, and each is stored in program_progress.commitment (see
 * WeekProgress.commitment) so no new table is needed.
 */
export type Artefact =
  /** Week 1 — five character qualities chosen from the VIA 24 */
  | { kind: "qualities"; count: number; heading: string; blurb: string }
  /** Week 2 — the student's five values, each with an observable behaviour */
  | { kind: "value-behaviours"; heading: string; blurb: string }
  /** Weeks 7 and 8 — a fixed number of free-text lines */
  | { kind: "lines"; count: number; heading: string; blurb: string; placeholders: string[] };

/**
 * The saved thing a week is built on.
 *
 * "strengths" and "values" are structured (the VIA ranking, the five chosen
 * values), so the week can render them as chips. "entry" is a student's own
 * prose from a mission step — recalled as an excerpt, because the point is to
 * show them what they already worked out rather than ask them again.
 */
export type WeekSource = {
  /** Where to go when there's nothing saved yet */
  href: string;
  label: string;
  /** Why the week needs it — shown only when it's missing */
  whyNeeded: string;
  /**
   * True when the week cannot be finished without it.
   *
   * This is what makes the missions get done. With the program gated only on
   * Mission 1, nine of the ten weeks could be completed having touched no other
   * mission — the "do this first" card was a suggestion the student could walk
   * past. Marking the weeks that are genuinely built on a mission means all
   * four still get finished, but each arrives at the point its material is
   * needed rather than as four hours of writing before anything is lived.
   */
  required?: boolean;
  /** How this week uses it — shown under the recalled material */
  soWhat: string;
} & (
  | { kind: "strengths" }
  | { kind: "values" }
  | {
      kind: "entry";
      /** journal_entries.activity_id to read back */
      activityId: string;
      /** Which mission it came from, for the card's eyebrow */
      missionId: number;
      /** What to call the recalled writing */
      recallLabel: string;
    }
);

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
  /**
   * Where this week's raw material already exists in the app. Unlike `link` —
   * which is a suggestion — a source is something the week is *built on*: the
   * week reads the student's saved answer and shows it, and only falls back to
   * sending them to make it when there's nothing there yet.
   *
   * This is what stops the program repeating the missions, and what makes the
   * missions load-bearing rather than merely available. Missions 2-4 used to
   * produce twelve journal entries that nothing in the app ever read again.
   */
  source?: WeekSource;
  /**
   * What a "single" week actually makes. Without this, weeks 1, 2, 7 and 8 end
   * with "write them somewhere you'll see them" — the app telling the student
   * to keep the artefact outside the app, which then makes week 10's
   * "look back at your week 1 five qualities" a promise nothing can keep.
   */
  artefact?: Artefact;
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
        "Choose five character qualities you'd want people to use when describing you at 25. Not achievements, not a job — qualities. Then look at the gap between those five and the five you actually lead with today, and pick one or two to actually work on. That gap is the whole point of the next nine weeks.",
      kind: "single",
    },
    source: {
      kind: "strengths",
      href: "/missions/1/activities/strengths-mapping",
      label: "Strengths Mapping",
      whyNeeded:
        "This week compares who you're becoming with who you already are — so it needs the second half first. Eight minutes, in Mission 1.",
      soWhat:
        "This is who you already are. This week asks a different question — who you want to be at 25 — and the difference between the two lists is the work.",
    },
    // Week 1's artefact is not the week's own — it is the shared "Who I'm
    // becoming" record, which also renders on the profile under Grow. The
    // heading and blurb live with the component; these are here so week 10 can
    // label the readback. See src/lib/becoming.ts.
    artefact: {
      kind: "qualities",
      count: 5,
      heading: "Who I'm becoming — five qualities at 25",
      blurb:
        "Pick the five you'd want someone to reach for when describing you at 25. Not the ones you already have — the ones you'd want to be true.",
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
        "Take your five values and put one specific behaviour next to each — something a person watching you for a week could actually observe. A value without a behaviour is a preference.",
      kind: "single",
    },
    source: {
      kind: "values",
      href: "/missions/1/activities/values-clarifier",
      label: "Values Clarifier",
      whyNeeded:
        "This week attaches a behaviour to each of your values, so you need the five values first. About eight minutes, in Mission 1.",
      soWhat:
        "You named these in Mission 1. This week is the harder half: proving each one with a behaviour someone could watch you do.",
    },
    artefact: {
      kind: "value-behaviours",
      heading: "Five values, five behaviours",
      blurb:
        "These are the five you chose in Mission 1. For each one, write the behaviour that proves it — observable, specific, this week.",
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
    source: {
      kind: "entry",
      activityId: "what-matters",
      missionId: 2,
      recallLabel: "What you said matters to you",
      href: "/missions/2/activities/what-matters",
      label: "What Matters",
      required: true,
      whyNeeded:
        "Contributing is hollow if you've never named what you actually care about. Mission 2 starts there — about ten minutes.",
      soWhat:
        "Contribution isn't only tidying up. Some of what you put in this week should point at that — the thing you'd want to be different.",
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
    source: {
      kind: "entry",
      activityId: "across-the-gap",
      missionId: 3,
      recallLabel: "What connection across a real difference taught you",
      href: "/missions/3/activities/across-the-gap",
      label: "Across the Gap",
      required: true,
      whyNeeded:
        "The hardest dilemmas are the ones where the other person isn't like you. Mission 3 has you sit with exactly that — about ten minutes, and this week leans on it.",
      soWhat:
        "Holding someone else's view without needing to agree is the skill underneath every dilemma this week. You've already practised it once.",
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
        "Write three statements that begin \u201cI\u2019m the kind of person who\u2026\u201d. Keeps my word. Stops before reacting. Looks after my body. Make them yours, make them true-ish, and say them like facts rather than goals.",
      kind: "single",
    },
    artefact: {
      kind: "lines",
      count: 3,
      heading: "Three identity statements",
      blurb:
        "Each one starts \u201cI\u2019m the kind of person who\u2026\u201d. Write them as descriptions, not goals \u2014 that\u2019s the whole mechanism.",
      placeholders: [
        "I\u2019m the kind of person who keeps their word.",
        "I\u2019m the kind of person who stops before reacting.",
        "I\u2019m the kind of person who looks after their body.",
      ],
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
    artefact: {
      kind: "lines",
      count: 5,
      heading: "Three peers, two adults",
      blurb:
        "Naming them is the step most people skip. Write the five, then the week is just spending time with people you\u2019ve already chosen.",
      placeholders: [
        "Peer 1 — who lifts you",
        "Peer 2 — who lifts you",
        "Peer 3 — who lifts you",
        "Adult 1 — worth learning from",
        "Adult 2 — worth learning from",
      ],
    },
    source: {
      kind: "entry",
      activityId: "people-who-shaped-you",
      missionId: 3,
      recallLabel: "The people who shaped you",
      href: "/missions/3/activities/people-who-shaped-you",
      label: "The People Who Shaped You",
      whyNeeded:
        "You've already written about who made you who you are — this week builds on that rather than starting the list again. It's the Mission 3 milestone.",
      soWhat:
        "Those are the people who already shaped you. This week is the forward-looking version: who you're choosing to be shaped by from here.",
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
    source: {
      kind: "entry",
      activityId: "digital-self",
      missionId: 4,
      recallLabel: "The gap you found between online you and offline you",
      href: "/missions/4/activities/digital-self",
      label: "The Digital Self",
      required: true,
      whyNeeded:
        "This week takes the input away for three half-hours. Mission 4 already asked what the input is doing to you — worth having that answer first.",
      soWhat:
        "That's what you noticed with the screens on. This week is the same question with them off — and the two answers are worth comparing.",
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

/**
 * The mission writing week 10 draws on, on top of the program's own artefacts.
 *
 * The Character Code is meant to be written from evidence. The program supplies
 * the behavioural half (weeks 1, 2, 7 and 8); these two supply the half the
 * weeks never ask for — what the student said they stand for, and the thread
 * they found running through all four missions.
 */
export const CAPSTONE_SOURCES: {
  activityId: string;
  missionId: number;
  label: string;
  note: string;
  href: string;
}[] = [
  {
    activityId: "commitment-statement",
    missionId: 2,
    label: "What you said you stand for",
    note: "Mission 2 · Commitment Statement",
    href: "/missions/2/activities/commitment-statement",
  },
  {
    activityId: "the-through-line",
    missionId: 4,
    label: "The thread you found",
    note: "Mission 4 · The Through-Line",
    href: "/missions/4/activities/the-through-line",
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
  /**
   * Where this question's foundation was built.
   *
   * The weekly five is the part that outlives the program — a student answers
   * these forever. But four of the five were first worked out in a mission, and
   * nothing said so, which left the missions looking like a finished thing you
   * walk away from rather than the ground the weekly questions stand on.
   *
   * Discipline has no `href` on purpose: no mission builds it. It's made of
   * reps, which is what the weeks are for, and pretending otherwise would be
   * the kind of tidy-looking mapping that teaches a student something false.
   */
  foundation: { href?: string; label: string; note: string };
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
    foundation: {
      href: "/missions/1/activities/strengths-mapping",
      label: "Mission 1 · Strengths Mapping",
      note: "Where you mapped who you already are.",
    },
  },
  {
    key: "values",
    name: "Values",
    emoji: "⚖️",
    question: "What do I stand for?",
    meaning:
      "A value you were never tested on this week is just a preference. Where did one of yours actually cost you something?",
    placeholder: "What did you hold to this week — and what did holding it cost?",
    foundation: {
      href: "/missions/1/activities/values-clarifier",
      label: "Mission 1 · Values Clarifier",
      note: "The five you chose to steer by.",
    },
  },
  {
    key: "discipline",
    name: "Discipline",
    emoji: "🧗",
    question: "What hard thing am I willing to do because it matters?",
    meaning:
      "Not the hard thing you should do. The one you actually did, on a day you didn't want to.",
    placeholder: "What did you do this week that comfort was arguing against?",
    foundation: {
      label: "No mission builds this one",
      note: "It's made of reps rather than insight, so weeks 5 and 7 are where it gets built.",
    },
  },
  {
    key: "contribution",
    name: "Contribution",
    emoji: "🪑",
    question: "What am I giving rather than merely consuming?",
    meaning:
      "Every room takes effort to keep running. Were you one of the people doing that, or living off someone who was?",
    placeholder: "What did you put in this week that nobody asked you for?",
    foundation: {
      href: "/missions/2/activities/contribution-map",
      label: "Mission 2 · The Contribution Map",
      note: "Where your strengths met the thing you care about.",
    },
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
    foundation: {
      href: "/missions/3/activities/people-who-shaped-you",
      label: "Mission 3 · The People Who Shaped You",
      note: "You wrote about who shaped you. This is the same question pointed outward.",
    },
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
  /**
   * Whatever this week asked the student to name, one item per line: the
   * promise (week 4), the hill (week 5), or the week's artefact — five
   * qualities, five "value: behaviour" pairs, or three/five free lines.
   * One column rather than one per shape, so no week needs a migration.
   */
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
  // A week that makes something isn't done until the thing exists. Reflecting
  // on an artefact you never made is the exact failure this program is for.
  if (w.artefact && !artefactComplete(w, p)) return false;
  if (w.challenge.kind === "single") return true;
  return p.days.length >= (w.challenge.target ?? 1);
}

// ─── Artefacts ────────────────────────────────────────────────────────────────
// Stored one item per line in program_progress.commitment. Value-behaviour
// pairs use "Value: behaviour", matching how the Values Clarifier already
// writes its journal entry, so the two are readable by the same parser.

export function linesToCommitment(items: string[]): string {
  return items.map((i) => i.trim()).filter(Boolean).join("\n");
}

export function commitmentToLines(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split("\n").map((l) => l.trim()).filter(Boolean);
}

/** "Courage: I said the unpopular thing in class" → { value, behaviour } */
export function commitmentToPairs(
  raw: string | null | undefined
): { value: string; behaviour: string }[] {
  return commitmentToLines(raw).map((line) => {
    const i = line.indexOf(":");
    if (i === -1) return { value: line, behaviour: "" };
    return { value: line.slice(0, i).trim(), behaviour: line.slice(i + 1).trim() };
  });
}

export function pairsToCommitment(
  pairs: { value: string; behaviour: string }[]
): string {
  return pairs
    .filter((p) => p.value.trim())
    .map((p) => `${p.value.trim()}: ${p.behaviour.trim()}`)
    .join("\n");
}

/** How many items this week's artefact needs before it counts as made. */
export function artefactTarget(w: ProgramWeek): number {
  if (!w.artefact) return 0;
  if (w.artefact.kind === "value-behaviours") return 5;
  return w.artefact.count;
}

export function artefactComplete(
  w: ProgramWeek,
  p: WeekProgress | undefined
): boolean {
  if (!w.artefact) return true;
  const lines = commitmentToLines(p?.commitment);
  if (w.artefact.kind === "value-behaviours") {
    // A value with no behaviour beside it is the preference the week is
    // arguing against, so an empty right-hand side doesn't count.
    return (
      lines.length >= 5 &&
      commitmentToPairs(p?.commitment).filter((x) => x.behaviour).length >= 5
    );
  }
  return lines.length >= artefactTarget(w);
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

// ─── Scaffolds ────────────────────────────────────────────────────────────────
// Kept as lookup maps rather than fields on the week objects, so the content
// above stays readable as content and the scaffolding stays readable as
// scaffolding. See src/lib/scaffold.ts for what the three tiers mean.

import type { Scaffold } from "./scaffold";
import type { YearLevel } from "./yearLevel";

/** The weekly five — the prompts a student answers most often, so scaffolded hardest. */
export const WEEKLY_SCAFFOLDS: Record<Strand, Scaffold> = {
  identity: {
    quick: [
      "Closer to the person I want to be",
      "Drifted a bit this week, honestly",
      "Same as last week — no real movement",
      "Better in one area, worse in another",
    ],
    stems: [
      "This week moved me towards",
      "The version of me that showed up most was",
      "One thing I'd want different next week is",
    ],
    stuck: [
      "Compare this week to the same week a month ago, not to some ideal version of you.",
      "Direction matters more than distance — which way were you pointing?",
      "If a friend described you this week in one word, what would it be?",
    ],
  },
  values: {
    quick: [
      "I told the truth when a lie was easier",
      "I stayed loyal to someone when it cost me",
      "I backed down when I shouldn't have",
      "Nothing really tested me this week",
    ],
    stems: [
      "The value I actually held to was",
      "Holding it cost me",
      "Somewhere I let a value slide was",
    ],
    stuck: [
      "A value you were never tested on this week is just a preference.",
      "Think of a moment you felt uncomfortable — that's usually a value being pushed.",
      "What did you refuse to do this week, and why?",
    ],
  },
  discipline: {
    quick: [
      "I trained when I didn't want to",
      "I studied instead of scrolling",
      "I had the conversation I'd been avoiding",
      "I picked comfort most days, honestly",
    ],
    stems: [
      "The hard thing I did anyway was",
      "Comfort was arguing that",
      "The day I nearly didn't was",
    ],
    stuck: [
      "It only counts if you didn't feel like it at the time.",
      "What did you avoid this week? That's usually the real answer.",
      "Small and done beats big and imagined.",
    ],
  },
  contribution: {
    quick: [
      "I cleaned up something I didn't mess up",
      "I helped someone catch up quietly",
      "I organised something nobody asked me to",
      "I took more than I gave this week",
    ],
    stems: [
      "What I put in this week was",
      "Nobody noticed that I",
      "The room I took the most from was",
    ],
    stuck: [
      "If you told someone about it, it was trade, not contribution.",
      "Who did the invisible work in your house this week?",
      "What needed doing that you walked past?",
    ],
  },
  impact: {
    quick: [
      "Someone told me I'd helped them",
      "I was there when someone needed it",
      "I made someone's week harder",
      "I'm not sure I registered either way",
    ],
    stems: [
      "The person I most affected this week was",
      "They'd probably say I was",
      "Someone who's worse off for me being around is",
    ],
    stuck: [
      "Answer about one named person, not people in general.",
      "Ask someone directly — it's less weird than it sounds.",
      "Being neutral is also an answer worth writing down.",
    ],
  },
};

/** End-of-week reflections, one per week. */
export const WEEK_REFLECTION_SCAFFOLDS: Record<number, Scaffold> = {
  1: {
    quick: [
      "Picking five was harder than I expected",
      "I noticed I chose qualities I don't actually have yet",
      "Most of mine were about how I treat people",
      "I copied a couple from someone I admire",
    ],
    stems: [
      "The quality I most want people to use about me is",
      "The one I'd struggle to justify right now is",
      "Choosing these made me realise",
    ],
    stuck: [
      "Look at your five. Which one would someone who knows you dispute?",
      "Did you pick qualities you have, or qualities you want? Both are fine — but which?",
      "Was there one you nearly wrote down and didn't? Why not?",
    ],
  },
  2: {
    quick: [
      "Writing the behaviour was much harder than naming the value",
      "One of my values had no behaviour I could point to",
      "I realised two of mine were basically the same thing",
      "These are genuinely mine, not borrowed",
    ],
    stems: [
      "The value I found hardest to attach a behaviour to was",
      "That probably means",
      "The one I'd actually defend is",
    ],
    stuck: [
      "If someone watched you for a week, which value would they spot without being told?",
      "A value you can't name a behaviour for isn't a value yet.",
      "Which of yours has cost you something recently?",
    ],
  },
  3: {
    quick: [
      "Not telling anyone was the hardest part",
      "I noticed how much I usually want credit",
      "Some days I couldn't find anything to do",
      "It got easier to spot things by the end",
    ],
    stems: [
      "The contribution nobody noticed was",
      "Not saying anything about it felt",
      "By the end of the week I started noticing",
    ],
    stuck: [
      "Did you nearly mention one of them to someone? What stopped you?",
      "Which room did you find easiest to contribute to, and which hardest?",
      "Was it the doing or the silence that was difficult?",
    ],
  },
  4: {
    quick: [
      "I kept it most days but not all",
      "Keeping it was easy — remembering wasn't",
      "I picked something too ambitious",
      "Nobody noticed, which was the point",
    ],
    stems: [
      "The day I nearly broke it was",
      "What made keeping it hard was",
      "What this tells me about my word is",
    ],
    stuck: [
      "On the days you kept it, what made it possible? Repeat that.",
      "Was the promise too big, or was the problem remembering it?",
      "If someone else had been relying on this promise, would you have kept it more?",
    ],
  },
  5: {
    quick: [
      "Four sessions was harder than I thought",
      "The first one was the hardest to start",
      "I enjoyed it more than I expected",
      "I only managed a couple, honestly",
    ],
    stems: [
      "The session I nearly skipped was",
      "What got me started anyway was",
      "The hill got easier when",
    ],
    stuck: [
      "What was the actual barrier — time, energy, or not wanting to be bad at it?",
      "Did the hard part change across the week?",
      "Would you pick the same hill again?",
    ],
  },
  6: {
    quick: [
      "The three questions made decisions slower but clearer",
      "I noticed how often I decide on instinct",
      "Some situations didn't fit the questions",
      "The 'who could be harmed' one changed my answer most",
    ],
    stems: [
      "The dilemma that stuck with me was",
      "Running it through the questions changed",
      "Where I found the questions didn't help was",
    ],
    stuck: [
      "Which of the three questions did you skip most often?",
      "Was there a situation where the right answer was obvious but hard?",
      "Did any of your answers surprise you?",
    ],
  },
  7: {
    quick: [
      "Saying them as facts felt uncomfortable",
      "One of mine is clearly aspirational",
      "This felt more useful than goal-setting",
      "I'm not sure I believe them yet",
    ],
    stems: [
      "The statement I found hardest to write was",
      "Saying it like a fact rather than a goal felt",
      "The one I'd most like to be true is",
    ],
    stuck: [
      "Which of your three would someone who knows you agree with already?",
      "Identity beats willpower — which of these could replace a rule you keep breaking?",
      "Is there one you avoided writing?",
    ],
  },
  8: {
    quick: [
      "I hadn't realised how much time I spend with people who drain me",
      "Reaching out to the adults was awkward",
      "My three peers were obvious immediately",
      "I couldn't think of two adults",
    ],
    stems: [
      "The person who lifts me most is",
      "The time I spent deliberately this week was",
      "What I noticed about who I'm around is",
    ],
    stuck: [
      "Who do you feel better after seeing, and who do you feel worse after?",
      "Deliberate time is different from accidental time — which was yours?",
      "If you couldn't name two adults, what does that tell you?",
    ],
  },
  9: {
    quick: [
      "The first ten minutes were unbearable",
      "I had thoughts I'd been avoiding",
      "It was easier than I expected",
      "I only managed one properly",
    ],
    stems: [
      "What came up when the noise stopped was",
      "The hardest part of being unstimulated was",
      "What I noticed about whose ideas I've been having is",
    ],
    stuck: [
      "Something usually surfaces around minute twelve. What surfaced for you?",
      "Were the thoughts yours, or things you'd absorbed from a feed?",
      "Did you reach for your phone? What was the pull?",
    ],
  },
  10: {
    quick: [],
    stems: [],
    stuck: [
      "Look back at your week 1 five qualities. How much has changed?",
      "Each commitment should be something you could be held to next month.",
      "Present tense, not future — 'I do', not 'I will try to'.",
    ],
  },
};

/**
 * Weeks 4 and 5 ask the student to name their own promise or hill first.
 *
 * The examples are year-aware because this is where register matters most: a
 * promise is meant to be small, boring and yours, so an 18-year-old offered
 * "make my bed every morning" reads the whole exercise as written for children
 * — and a 14-year-old offered "be on time to every shift" has no shift.
 * Everything else about the week is identical.
 */
const COMMITMENT_QUICK: Record<number, Record<"younger" | "senior", string[]>> = {
  4: {
    younger: [
      "Make my bed every morning",
      "Be out the door by 7:40 with my bag packed",
      "Twenty minutes of study before any screen",
      "Message one person back properly each day",
    ],
    senior: [
      "On time to every class and shift, no exceptions",
      "Do the reading before the class, not after it",
      "Reply properly to messages the same day",
      "Phone charging outside my room overnight",
    ],
  },
  5: {
    younger: [
      "Get properly fit — three runs a week",
      "Learn a song on an instrument I've neglected",
      "Catch up the subject I've fallen behind in",
      "Volunteer somewhere regularly",
    ],
    senior: [
      "Get properly fit before the year runs away from me",
      "Rebuild the subject I've quietly given up on",
      "Learn the thing I keep saying I'll learn after exams",
      "Volunteer or work somewhere that isn't about me",
    ],
  },
};

const COMMITMENT_REST: Record<number, Omit<Scaffold, "quick">> = {
  4: {
    stems: ["Every day this week I will", "I'll know I kept it because"],
    stuck: [
      "Small and kept beats ambitious and dropped.",
      "Could you tell at the end of a day whether you'd done it? If not, it's too vague.",
      "Pick something that only depends on you.",
    ],
  },
  5: {
    stems: ["My hill is", "One session of work on it looks like"],
    stuck: [
      "Pick something that matters to you, not something that sounds impressive.",
      "Define one session concretely — 'do some study' isn't a session.",
      "What have you been avoiding because you'd be bad at it at first?",
    ],
  },
};

export function commitmentScaffold(
  week: number,
  year: YearLevel = "middle"
): Scaffold | undefined {
  const rest = COMMITMENT_REST[week];
  if (!rest) return undefined;
  const quick = COMMITMENT_QUICK[week];
  return {
    ...rest,
    quick: quick ? quick[year === "senior" ? "senior" : "younger"] : undefined,
  };
}

/**
 * Weeks 7 and 8 write lines rather than a promise, so they get their own
 * scaffolds — the app's rule is that no box is ever blank, and these two were
 * the last places a student met one.
 */
export const ARTEFACT_SCAFFOLDS: Record<number, Scaffold> = {
  7: {
    quick: [
      "I\u2019m the kind of person who keeps their word, even on small things.",
      "I\u2019m the kind of person who stops before reacting.",
      "I\u2019m the kind of person who finishes what they start.",
      "I\u2019m the kind of person who tells the truth when it\u2019s awkward.",
      "I\u2019m the kind of person who looks after their body.",
    ],
    stems: ["I\u2019m the kind of person who", "I don\u2019t", "When it\u2019s hard, I"],
    stuck: [
      "Say it as a fact, not a goal. \u201cI\u2019m trying to\u201d is a fight; \u201cI\u2019m the kind of person who\u201d is a description you live up to.",
      "Pick a rule you keep breaking, and write the identity that would make the rule unnecessary.",
      "True-ish is fine \u2014 it only has to be more true than false right now.",
    ],
  },
  8: {
    quick: [
      "A friend who makes me want to try harder",
      "Someone who tells me the truth even when it\u2019s awkward",
      "The person I\u2019m calmest around",
      "A coach or teacher who takes me seriously",
      "A family member who\u2019s further down the road than me",
    ],
    stems: ["Someone who lifts me is", "I feel better after", "An adult worth learning from is"],
    stuck: [
      "Who do you feel better after seeing? Start there rather than with who you see most.",
      "The two adults don\u2019t have to be impressive \u2014 just people whose character you\u2019d take.",
      "If you can\u2019t fill five, write the ones you have. The gap is the finding.",
    ],
  },
};

/** The week 10 capstone — commitments in the present tense. */
export const CHARACTER_CODE_SCAFFOLD: Scaffold = {
  quick: [
    "I keep my word, including the small promises.",
    "I leave rooms better than I found them.",
    "I say the true thing kindly, rather than the easy thing.",
    "I do the hard rep on the days I don't feel like it.",
    "I don't laugh at things that make someone smaller.",
    "I ask for help before it becomes a crisis.",
  ],
  stems: ["I am someone who", "I don't", "When it's hard, I"],
  stuck: [
    "Write what you do, not what you'd like to be.",
    "Pull one straight from your week 2 values and their behaviours.",
    "If you couldn't be held to it, it's a wish rather than a commitment.",
  ],
};
