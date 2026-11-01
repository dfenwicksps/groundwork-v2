// ─── Mission 2, worded for each life stage ────────────────────────────────────
// Same rules as stageContentMission1.ts: missions.ts is the Year 10–11
// version, each map rewords only what needs it, and the shape never changes
// (same steps, same number of questions, same order), so saved entries, the
// Purpose card and recall read the same at any stage.
//
// Two things are specific to this mission:
//
// - Year 7–9 explore rather than commit. Identity research (Marcia) puts
//   exploration before commitment, and a 12-year-old's "I stand for…" picked
//   from a list is a weak commitment. So for them Step 4 becomes "What I Want
//   to Explore": still the milestone, still four questions, now about what
//   they want to find out and try.
// - Past Year 11, purpose is tied up with what comes next: a course, a job,
//   volunteering, how the week is spent. Step 3's last question asks where
//   they'd find their people there, instead of an abstract community.

import type { StageLines } from "./stageContent";

const PATHWAY_NOTE = "\n\nPick one. Keep it small. Doing it matters more than doing it well.";

/** Year 7–9: a way in through what they love, and exploring instead of committing. */
export const JUNIOR_M2: Record<string, StageLines> = {
  "what-matters": {
    intro:
      "Mission 1 was about you. This one is about the world around you: what you care about. It could be a problem that bugs you, or something you love doing so much you forget the time. Lots of people your age don't have a 'cause' yet. That's fine. Start with what you love.",
    warmUp:
      "Think of the last time something really bugged you, or the last time you were so into something you forgot the time. Either one is a good place to start.",
    scenarios: {
      2: "Imagine it's your last day of Year 12. A friend asks what you're proud of from your school years. You get to say one thing.",
    },
    steps: {
      2: "When you think about the next few years, what's one thing you'd be proud to have done, even a small one?",
      3: "Look back at your answers. Does anything show up more than once? If nothing joins up yet, that's normal. Pick the one you like best, or leave this out.",
    },
    skippableSteps: [3],
    starterOptions: {
      0: [
        "People being treated unfairly",
        "Animals or the environment",
        "Kids being bullied or left out",
        "Making things — art, music, games, videos",
        "Sport, or getting better at something",
        "Finding out how things work",
      ],
      3: [
        "Making things fair",
        "Looking after people, animals or places",
        "Making or building things",
        "Helping people feel included",
        "I'm still working it out",
      ],
    },
  },
  "contribution-map": {
    intro:
      "Now: what could you bring to it? Look at your strengths and values from Mission 1. Not sure? That's a real answer too.",
    scenarios: {
      0: "Your class is running a fundraiser. Jobs get handed out: posters, a speech, counting the money, the group chat, running the stall. One job has your name on it.",
    },
    steps: {
      3: "What's one tiny thing you could actually do about it this month?",
    },
  },
  "the-other-side": {
    steps: {
      1: "Is there a group, club or team about this? What do you know about it?",
    },
  },
  "commitment-statement": {
    title: "What I Want to Explore",
    // An entry written as a commitment statement before this existed (or
    // before moving down a stage) doesn't answer these questions.
    retiredQuestions: [
      "Name what you care about as clearly and specifically as you can. Not 'I care about the environment' — something more particular to you.",
    ],
    intro:
      "You've named what you care about, what you could bring, and who else cares. Now, instead of promising anything, name what you want to find out more about. At your age, exploring is the right move: trying things is how you find out what really fits.",
    warmUp:
      "This isn't a promise. It's a note to yourself about what you're curious to try. It can change any time.",
    prompt:
      "Write down what you want to explore: the thing you care about, and what you'd like to find out or try next.",
    scenarios: {
      0: "There's a wall at school where everyone pins up one thing they want to try this year. Yours is going up.",
      1: "A friend asks you, 'Why are you into that?' They actually want to know.",
      2: "Someone says it's boring or pointless. Picture yourself shrugging and staying curious anyway.",
      3: "A year from now, you find this note. What do you hope you found out?",
    },
    steps: {
      0: "What's the thing you want to explore? Say it as clearly as you can.",
      1: "Which of your strengths or values from Mission 1 make you curious about it?",
      2: "What's one thing you'd like to try, find out, or ask someone about it this year?",
      3: "Why does it matter to you right now?",
    },
    starterOptions: {
      0: [
        "I want to find out how to make things fairer",
        "I want to explore looking after animals or the environment",
        "I want to try making things — art, music, games or videos",
        "I want to get better at a sport or skill I love",
        "I want to find out how things work",
      ],
      1: [
        "I'm curious, so I want to know more",
        "I'm kind, and this is about people",
        "I'm creative, and this lets me make things",
        "I'm determined, and I like a challenge",
        "Fairness matters to me",
      ],
      2: [
        "Join a club, team or group about it",
        "Ask someone who knows a lot about it",
        "Watch or read something about it",
        "Try it once and see how it feels",
        "Make something about it",
      ],
      3: [
        "It's fun and I lose track of time",
        "It bugs me and I want it to change",
        "It's something I'm good at",
        "Someone I care about is part of it",
        "I'm not sure yet — it just pulls at me",
      ],
    },
    wrapUp:
      "That's what you want to explore, in your own words. It's on your Purpose card now, and it's allowed to change: trying things is how you find out. Next: one small step this week.",
    whyItMatters:
      "Researchers who study how young people work out who they are find that exploring comes before committing, and that's healthy. Trying things, asking questions and changing your mind are how people your age find what really fits them.",
  },
  "purpose-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Do the tiny thing you planned in Step 2.\n• Find out one thing — watch, read or ask about what you care about.\n• Tell one person why you're into it.\n• Have a go once — try it, join in, or help with one small job." +
      PATHWAY_NOTE,
  },
};

/** Year 12: what they care about, next to what they're choosing for next year. */
export const SENIOR_M2: Record<string, StageLines> = {
  "what-matters": {
    scenarios: {
      2: "It's next year. School's done, and someone at your new course, job or club asks what you're about. You get to say one thing that makes you quietly proud.",
    },
  },
  "the-other-side": {
    steps: {
      3: "Where could you find people who care about this next year: a course, a job, an apprenticeship, a volunteer group, a club? What would your place there be?",
    },
    starterOptions: {
      3: [
        "A uni or TAFE course connected to it",
        "A job or apprenticeship that does this",
        "A volunteer group or charity",
        "A club, team or community group",
        "Not sure yet — and I want to find out",
      ],
    },
  },
  "purpose-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Do the tiny first step you planned in Step 2.\n• Look up one course, job or volunteer role connected to what you care about.\n• Talk to one person about it — tell them why it matters to you.\n• Show up once — go to one thing connected to it, or help with one task." +
      PATHWAY_NOTE,
  },
};

/** Anyone past school: no classroom, and "someone you look up to" rather than "an adult". */
export const LEFT_SCHOOL_M2: Record<string, StageLines> = {
  "what-matters": {
    scenarios: {
      2: "A few years from now, you run into an old friend. They ask what you've been up to, and you get to say one thing that makes you quietly proud.",
    },
  },
  "purpose-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Do the tiny first step you planned in Step 2.\n• Look up one volunteer role, course or job connected to what you care about.\n• Talk to one person about it — tell them why it matters to you.\n• Show up once — go to one thing connected to it, or give it one hour of a skill you already have." +
      PATHWAY_NOTE,
  },
  "conversation-what-matters": {
    intro:
      "Purpose is easier to find once you've seen what it looks like in someone else's life. Find someone you look up to — a parent, grandparent, boss, colleague, lecturer, coach or neighbour — and ask what they care about and how they came to care about it. Then come back and write up what you heard.",
    alternative:
      "Nobody you can ask? A mentor, manager, lecturer or community leader counts. Or find an interview, video or article where someone talks about a cause they've spent years on, and answer the questions from that.",
    prompt:
      "Ask someone you look up to what they care about and how it started, then write up what you heard.",
  },
};

export const LEAVER_M2: Record<string, StageLines> = {
  "the-other-side": {
    steps: {
      3: "Where could you find people who care about this now: in your course, at work, in a volunteer group or a club? What would your place there be?",
    },
    starterOptions: {
      3: [
        "In my course, or a different one",
        "At work, or in a job I'd like next",
        "A volunteer group or charity",
        "A club, team or community group",
        "Not sure yet — and I want to find out",
      ],
    },
  },
};

export const ADULT_M2: Record<string, StageLines> = {
  "the-other-side": {
    steps: {
      3: "Could this show up in your work, a change of job, more study, volunteering or how you spend your weekends? Where would you fit?",
    },
    starterOptions: {
      3: [
        "In my current job, if I look for it",
        "In a different job, or more study",
        "Volunteering a few hours a month",
        "A club, group or community",
        "Not sure yet — and I want to find out",
      ],
    },
  },
};

/** The mission card's description, by stage. Middle uses missions.ts as written. */
export const MISSION2_DESCRIPTIONS: Partial<Record<string, string>> = {
  junior:
    "By the end of this mission you'll have the thing you care about most, what you could bring to it, and what you want to explore next. Every step adds a piece to your Purpose card. Six short steps. You don't need a big cause: something you love doing counts.",
  senior:
    "By the end of this mission you'll have the thing you care about, what you can bring to it, and one sentence that says it, handy while you're choosing what comes after school. Every step adds a piece to your Purpose card. Six short steps, about an hour in all.",
  leaver:
    "By the end of this mission you'll have the thing you care about, what you can bring to it, and one sentence that says it, now that school's behind you. Every step adds a piece to your Purpose card. Six short steps, about an hour in all, spread over a week.",
  adult:
    "By the end of this mission you'll have the thing you care about, what you can bring to it, one sentence that says it, and where it could fit in your work and your week. Every step adds a piece to your Purpose card. Six short steps, about an hour in all.",
};
