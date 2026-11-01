// ─── Mission 3, worded for each life stage ────────────────────────────────────
// Same rules as stageContentMission1.ts and stageContentMission2.ts:
// missions.ts is the Year 10–11 version, each map rewords only what needs it,
// and the shape never changes (same steps, same number of questions, same
// order), so saved entries, the Connection card and recall read the same.
//
// What changes most by stage here is where belonging is found, and whether it
// is about to move:
//
// - Year 7–9: friendships shift a lot around the move into high school, and
//   the abstract questions ("the quieter cost of being a slightly different
//   version of yourself") need plainer words.
// - Year 12: friends are about to scatter, so "where will I belong next year"
//   is the live question.
// - Past school: belonging has to be built from scratch, in a course, a
//   workplace, a share house or a new city. The first years after school are
//   when a lot of people feel loneliest, so the mission says so plainly.

import type { StageLines } from "./stageContent";

const NOTE = "\n\nIf reaching out feels big right now, the message counts. Notice what it costs and what it gives.";

export const JUNIOR_M3: Record<string, StageLines> = {
  belonging: {
    intro:
      "Missions 1 and 2 were mostly about you. This one is about the people around you. This step looks for the places where you can just be yourself. If nowhere comes to mind yet, that's an honest answer. Lots of people are still finding their people, especially after starting high school.",
    steps: {
      2: "Is there somewhere you feel like you don't quite fit, or are you still finding your people? What's that like?",
      3: "What's the difference between just hanging out with people and really belonging?",
    },
  },
  "fitting-in-vs-belonging": {
    steps: {
      0: "Think of the group where you change yourself most to fit in. What's hard about that?",
      1: "What do you want to do about it: keep going, change one thing, or spend more time somewhere else?",
      2: "Is there a group you want to be part of, or are you still finding your people? What would it feel like to really belong there?",
      3: "Now flip it. Who in your class, team or group might feel left out? What's one thing you could do so they feel included?",
    },
    starterOptions: {
      3: [
        "A new kid — I could ask them to sit with us",
        "Someone quiet — I could ask what they think",
        "A friend who's been left out — I could check in",
        "A younger kid — I could help them out",
        "I'm not sure — I'll start noticing",
      ],
    },
  },
  "across-the-gap": {
    steps: {
      2: "What have you learned from them that your friends couldn't teach you?",
      3: "Is there someone you find really hard to get along with right now? What's one small thing you could try?",
    },
  },
  "people-who-shaped-you": {
    warmUp:
      "Think about who you were a few years ago, and who you are now. Some of the ways you've changed came from specific people. Who were they? Just the ones who really left something in you.",
    steps: {
      0: "Name two or three people who have taught you something important about how to be. What did each one give you?",
      2: "Has anyone changed you through something hard, in a way you didn't choose? You can leave this one out.",
      3: "Looking at these people together, what do they say about who you're becoming?",
    },
  },
  "connection-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Try the small thing you wrote in Step 3.\n• Message a friend you haven't talked to in a while.\n• Include someone who's on their own: sit with them, or ask them to join in.\n• Ask someone a real question about themselves, and listen." +
      NOTE,
  },
};

export const SENIOR_M3: Record<string, StageLines> = {
  belonging: {
    scenarios: {
      2: "Year 12 is nearly over, and the group you've been part of for years is about to scatter: different courses, jobs, cities.",
    },
    steps: {
      2: "Your friends are about to go different ways after Year 12. Where do you think you'll find your people next year, and what feels uncertain about that?",
    },
    starterOptions: {
      2: [
        "Uni or TAFE — I'll have to start again",
        "A job or apprenticeship crew",
        "I'll keep my school friends, I hope",
        "A team, club or group I already know",
        "Honestly, it worries me a bit",
      ],
    },
  },
};

/** Anyone past school: workplaces, courses, share houses, not classrooms. */
export const LEFT_SCHOOL_M3: Record<string, StageLines> = {
  belonging: {
    scenarios: {
      2: "Now the opposite: there's a workplace, a tutorial, a group chat where you're technically included — but you're always slightly on guard, slightly editing.",
    },
    starterOptions: {
      0: [
        "A few friends from school I've kept",
        "Flatmates or a share house that works",
        "A team, club or group I've joined since",
        "People from work I'd actually call friends",
        "Honestly, nowhere fully yet — I'm still looking",
      ],
    },
  },
  "fitting-in-vs-belonging": {
    starterOptions: {
      3: [
        "Someone new at work — I could invite them along",
        "Someone quiet in my course — I could ask what they think",
        "A friend who's drifted — I could check in",
        "A flatmate who keeps to themselves — I could ask them to join something",
        "I'm not sure — I want to start noticing",
      ],
    },
  },
  "connection-challenge": {
    prompt:
      "Pick ONE for this week:\n\n• Take the small step you wrote in Step 3, toward someone across the gap.\n• Message one person you've drifted from since school.\n• Make room for someone on the edge: a new starter, a quiet one in your course, a flatmate.\n• Say yes to one invitation, or make one yourself." +
      NOTE,
  },
};

export const LEAVER_M3: Record<string, StageLines> = {
  belonging: {
    intro:
      "Missions 1 and 2 were mostly about you. This one turns to the people around you. The first years after school are when a lot of people feel loneliest: school friends drift, and new ones take time. If you're still finding your people, you're far from the only one. This step looks for where you feel most yourself now.",
    steps: {
      2: "Since leaving school, where have you found your people, and where are you still looking? What's that been like?",
    },
    starterOptions: {
      2: [
        "My course — it's slowly coming together",
        "Work — the crew I'm on shifts with",
        "A club, team or group I joined",
        "I've mostly kept my school friends",
        "Honestly, it's been lonelier than I expected",
      ],
    },
  },
};

export const ADULT_M3: Record<string, StageLines> = {
  belonging: {
    intro:
      "Missions 1 and 2 were mostly about you. This one turns to the people around you. A few years out of school, belonging takes more effort: friends move, work takes over, and new friendships don't just happen. This step looks for where you feel most yourself now.",
    steps: {
      2: "Where are you still looking for your people, or where has belonging changed since you were younger? What's that like?",
    },
    starterOptions: {
      2: [
        "Friendships take more effort now",
        "Work is where I see people most",
        "A partner is most of my belonging right now",
        "I've built a chosen family",
        "Honestly, it's lonelier than I'd like",
      ],
    },
  },
};

/** The mission card's description, by stage. Middle uses missions.ts as written. */
export const MISSION3_DESCRIPTIONS: Partial<Record<string, string>> = {
  junior:
    "By the end of this mission you'll have where you belong, someone you get on with even though you're different, and the people who've shaped you. Every step adds a piece to your Connection card. Six short steps. Still finding your people? Lots of people are.",
  senior:
    "By the end of this mission you'll have where you belong and why, someone you connect with across a real difference, the people who shaped you, and a plan for belonging after Year 12. Every step adds a piece to your Connection card. Six short steps, about an hour in all.",
  leaver:
    "By the end of this mission you'll have where you belong now that school's behind you, someone you connect with across a real difference, and the people who shaped you. Every step adds a piece to your Connection card. Six short steps, about an hour in all. If you're still finding your people, you're far from the only one.",
  adult:
    "By the end of this mission you'll have where you belong now, someone you connect with across a real difference, and the people who shaped you. Every step adds a piece to your Connection card. Six short steps, about an hour in all, spread over a week.",
};
