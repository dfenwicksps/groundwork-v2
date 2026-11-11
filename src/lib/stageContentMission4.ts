// ─── Mission 4, worded for each life stage ────────────────────────────────────
// Same rules as the other stageContentMission files: missions.ts is the
// Year 10–11 version, each map rewords only what needs it, and the shape never
// changes. Mission 4 already moved the Future Self's age and softened the
// thread for Year 7–9 (stageContent.ts); this adds the rest.
//
// - Year 7–9: most social media apps don't allow under-16s to hold accounts in
//   Australia (from December 2025), so Digital Self is about what they do use:
//   group chats, games, video, messaging. The letter is a direction to explore,
//   as Mission 2's milestone is for them, not a decision priced up.
// - Year 12 and past school: Digital Self adds what someone reviewing an
//   application, a boss or a landlord would find. The conversation asks
//   "someone you look up to" rather than "an adult".

import type { StageLines } from "./stageContent";

const NOTE = "\n\nPick one. Keep it small. Notice what it feels like to do it on purpose rather than by accident.";

export const JUNIOR_M4: Record<string, StageLines> = {
  "digital-self": {
    intro:
      "Before picturing the future, a look at who you are online. Under 16, most social media apps don't allow accounts, but you're still online: group chats, games, YouTube, messaging. There's a version of you there too. This step looks at how much of it you chose.",
    scenarios: {
      0: "Pick the place you spend most screen time — a group chat, a game, YouTube. Imagine someone who only knows you from there.",
      2: "There's probably a message you've sent in a group chat or a game that you'd never have said to someone's face.",
    },
    steps: {
      0: "Pick one place you spend time online — a group chat, a game, a video app. How are you there? Is it different from how you are face to face?",
      1: "Look at what gets suggested to you — videos, games, music. What does it say about you? Is it right?",
      2: "Have you ever said something online you wouldn't say in person? What made it easier?",
      3: "Where online do you feel most like yourself? Where are you putting on an act?",
    },
    starterOptions: {
      0: [
        "Pretty much me, just in text",
        "Funnier and louder in the group chat",
        "Quieter — I mostly watch",
        "A different character in games",
        "I'm not online much",
      ],
      1: [
        "Pretty right, honestly",
        "It shows what I used to like",
        "It's mostly stuff I watch when I'm bored",
        "It's what everyone else watches",
        "It knows me a bit too well",
      ],
      2: [
        "Braver — I say things I wouldn't face to face",
        "Meaner than I mean to be",
        "More honest about how I feel",
        "More positive than I really am",
        "Not really — I'm the same",
      ],
      3: [
        "The group chat with my close friends",
        "Gaming with my friends",
        "Nowhere — online's mostly an act",
        "Face to face is realest for me",
        "A bit of all of them",
      ],
    },
  },
  "meaning-letter": {
    intro:
      "You've found your thread. This letter is about where you'd like it to take you over the next few years. Not a plan or a promise: a direction you can change.",
    warmUp:
      "One day in a year or two, you'll feel stuck or unsure what to do. You're writing to that day.",
    prompt:
      "Write a letter to your future self about what you want more of in your life, and why.",
    scenarios: {
      0: "You're not writing a plan. You're picking a direction, like heading north on a map: the exact roads can change.",
      1: "Saying yes to one thing usually means a bit less of something else.",
      2: "Picture the people you want around you in a few years.",
      3: "There'll be a day when you forget why this mattered. This last part is for that day.",
    },
    steps: {
      0: "What do you want more of in your life over the next few years? Say it as a direction, like 'more making things' or 'more time with people who get me'.",
      1: "What might you need to do a bit less of to head that way?",
      2: "Who do you want to keep close along the way?",
      3: "Why does it matter to you? Write it down for a day when you forget.",
    },
    starterOptions: {
      0: [
        "More making things — art, music, games, videos",
        "More time with people who get me",
        "Getting really good at one thing",
        "More time outside or moving",
        "Helping people or animals",
      ],
      1: [
        "Less time scrolling",
        "Less worrying what everyone thinks",
        "Less of things I only do because others do",
        "Less staying up too late",
        "Less saying yes to everything",
      ],
      2: [
        "My closest friends",
        "My family",
        "A teacher or coach who backs me",
        "My team or club",
        "Whoever I meet who gets me",
      ],
      3: [
        "Because it makes me feel like me",
        "Because I'm happier when I do it",
        "Because someone believed I could",
        "Because I'd regret not trying",
        "I'm not sure yet — it just matters",
      ],
    },
    wrapUp:
      "That's the direction you want to head in, in your own words. It's on your Direction card now, and it can change as you try things. Next: one small step this week.",
    whyItMatters:
      "People who feel connected to who they'll be in a few years tend to make choices their future self is glad of, and writing to that future you is one way to build the connection. At your age it's a direction, not a decision: trying things is how you find out.",
  },
  "meaning-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Start the one thing you wrote in Future Self.\n• Do one thing from your letter, on purpose.\n• Skip one thing that gets in the way, just this week.\n• Tell someone what you're aiming for." +
      NOTE,
  },
};

export const SENIOR_M4: Record<string, StageLines> = {
  "digital-self": {
    steps: {
      3: "If someone reviewing an application — a uni, an employer, a scholarship — searched for you, what would they find? Which version of you online feels most real, and which is a performance?",
    },
    starterOptions: {
      3: [
        "Not much — I keep a low profile",
        "Old posts I'd rather they didn't see",
        "Mostly the real me, and I'm fine with that",
        "The group-chat me is still the realest",
        "I should probably tidy things up",
      ],
    },
  },
};

/** Anyone past school: a work presence, and "someone you look up to". */
export const LEFT_SCHOOL_M4: Record<string, StageLines> = {
  "digital-self": {
    scenarios: {
      0: "Pick the place you spend most screen time — a group chat, a work chat, a platform, a game. Now imagine someone who only knows you from there — that's the only you they've ever met.",
    },
    steps: {
      3: "If a future boss, client or landlord searched for you, what would they find? Which version of you online feels most real, and which is a performance?",
    },
    starterOptions: {
      3: [
        "Not much — I keep a low profile",
        "A work profile that's polished but accurate",
        "Old posts I'd rather they didn't see",
        "The group-chat me is still the realest",
        "I should probably tidy it up",
      ],
    },
  },
  "conversation-path": {
    intro:
      "Most people didn't follow a straight line to where they are. Ask someone you look up to — a parent, a boss, a colleague, a lecturer, someone whose work interests you — how they ended up doing what they do. Then come back and write up what you heard.",
    alternative:
      "Nobody you can ask? A mentor, manager, lecturer or careers adviser counts. Or find an interview, video or podcast where someone talks about how they got into work that interests you, and answer the questions from that.",
    prompt:
      "Ask someone you look up to how they ended up doing what they do, then write up what you heard.",
  },
};

/** The mission card's description, by stage. Middle uses missions.ts as written. */
export const MISSION4_DESCRIPTIONS: Partial<Record<string, string>> = {
  junior:
    "By the end of this mission you'll have the thread through everything you've found, an ordinary day a few years from now, and a letter about the direction you want to head in. Every step adds a piece to your Direction card, and the finished card opens My Story. Seven short steps.",
  senior:
    "By the end of this mission you'll have the thread through everything you've found, an ordinary day a few years on, and a letter about the life you want to build, handy while you're choosing what comes after school. Every step adds a piece to your Direction card, and the finished card opens My Story.",
  leaver:
    "By the end of this mission you'll have the thread through everything you've found, an ordinary day a few years on, and a letter about the life you want to build now that school's behind you. Every step adds a piece to your Direction card, and the finished card opens My Story.",
  adult:
    "By the end of this mission you'll have the thread through everything you've found, an ordinary day a few years on, and a letter about the life you want to build from here. Every step adds a piece to your Direction card, and the finished card opens My Story.",
};
