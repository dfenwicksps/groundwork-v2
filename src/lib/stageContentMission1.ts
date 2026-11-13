// ─── Mission 1, worded for each life stage ────────────────────────────────────
// Mission 1 is the first thing every student does, so it's where a mismatch
// costs most: a 23-year-old asked who they are "in class", or a Year 7 handed
// a paragraph about "three layers of identity", tends not to reach step two.
//
// The base text in missions.ts is the Year 10–11 ("middle") version. Each map
// here rewords only what needs it for one stage. As in stageContent.ts, the
// shape never changes: same steps, same number of questions, same order, so a
// saved entry reads the same whatever stage it was written at.
//
// Leavers and adults first take LEFT_SCHOOL_M1 (anything that just needs to
// stop assuming school), then their own map on top.

import type { StageLines } from "./stageContent";

const JUNIOR_CHALLENGE =
  "Pick ONE small experiment for this week:\n\n• Say what you really think, once — in class or with friends, where you'd usually stay quiet.\n• Show someone a hidden part — something you make, like or care about that you usually keep to yourself.\n• Use a strength on purpose — use the thing you're good at somewhere new.\n• Have a 'good day' hour — do the thing that makes you happiest and notice how it feels.\n\nPick one. Keep it small. See what happens.";

const LEFT_SCHOOL_CHALLENGE =
  "Pick ONE small experiment for this week — whichever one made you go 'ugh, maybe':\n\n• Say the toned-down thing at full volume once — voice an opinion at work, uni or home where you'd normally stay quiet.\n• Let one person see a hidden part — show someone a thing you make, think, or care about that you usually keep private.\n• Use a strength on purpose — put the thing you're naturally good at to use in a situation that isn't asking for it.\n• Spend an hour on the 'good day' version of you — do the thing that energises you, guilt-free, and pay attention to how it feels.\n\nPick one. Keep it small. Just notice what happens.";

/** Year 7–9: shorter sentences, everyday words, the nearest examples. */
export const JUNIOR_M1: Record<string, StageLines> = {
  "chapters-so-far": {
    intro:
      "Before working out who you are now, a quick look at how you got here. Life comes in chapters: a new school, a move, a new friend, a new obsession. Naming them takes two minutes, and you can skip either question.",
    steps: {
      0: "If your life so far were a book, what would the chapters be called? Two or three short titles is plenty.",
    },
    starterOptions: {
      0: [
        "Little Kid Me → Primary School → High School Now",
        "Before the Move → The New Place → Settling In",
        "The Lego Years → The Sport Years → Now",
        "Shy at First → Making Friends → More Me Now",
        "Family Changes → Getting Used to It → Okay Now",
      ],
      1: [
        "New School, New Everything — still getting used to high school",
        "Finding My Friends — working out who I click with",
        "Into Everything — trying lots of stuff",
        "Big Feelings — a lot going on inside",
        "Pretty Chill — things are good right now",
      ],
    },
  },
  "strengths-mapping": {
    intro:
      "This step finds your strengths: the things you're naturally good at as a person, like being kind, brave or funny. You'll see 18 quick situations. Your answers do the work.",
    warmUp:
      "For each one, tap the answer MOST like you, then tap Least on the one LEAST like you. It moves on by itself. Go with your gut. No wrong answers, and nobody else sees this. About 8 minutes.",
  },
  "values-clarifier": {
    intro:
      "Values are the things that matter most to you, like fairness, family or having fun. Read the situations first and notice which ones bug you or excite you. That feeling is a clue to what you value.",
    prompt:
      "Read the situations below and notice which ones pull at you. Then pick the five values that feel most true for you, not the ones you think you should pick.",
    scenarios: {
      0: "You find out a friend has been saying something untrue about another friend. Saying something might make things awkward, but staying quiet feels wrong too. What's the part of you that won't let it go?",
      1: "Two free Saturdays. One: at home doing something you love, on your own. Two: out with friends, busy all day. Which one feels like a better day — and what does that tell you?",
      2: "Someone you look up to promises to do something with you, then forgets and never mentions it. Which part bugs you most — that it's unfair, that you can't trust them, or that you weren't taken seriously?",
      3: "You get the chance to try something new in front of the class, and you might be bad at it. Part of you wants to hide. Part of you is curious. Which part usually wins?",
    },
  },
  "mask-check": {
    intro:
      "You've found your strengths and values. Now: where do they get to show? Everyone acts a bit differently at school, at home and with friends. That's normal, not fake. This step looks at where you can be fully you, and where you hold back.",
    warmUp:
      "This isn't about catching yourself being fake. Everyone changes a bit depending on who's around. We're just looking for where the difference is biggest.",
    prompt:
      "Think about who you are at school, at home and with your closest friends. Where do you feel most like yourself? Where do you feel like you're putting on an act?",
    scenarios: {
      1: "There's a part of you that mostly comes out when you're on your own — something you like, make or think about that hardly anyone knows. Not a big secret, just private.",
      2: "You're about to send something in the group chat. Then you delete it or change it, because of how people might react. That little edit is you holding back.",
    },
    steps: {
      0: "Pick two places, like school and home. How are you different in each — louder, quieter, sillier, more careful?",
      1: "What's one part of you that stays mostly hidden? You don't have to explain it — just say it's there and where it comes out.",
      2: "Think of a time you held something back, like that deleted message. What were you worried would happen? Does holding back make anything harder?",
      3: "What's different about that place or person? What would help you feel a bit more like that somewhere else?",
    },
    starterOptions: {
      0: [
        "I'm louder and sillier with my friends",
        "I'm quieter in class",
        "I act more grown-up around adults",
        "I don't say what I really think, to avoid drama",
        "I'm pretty much the same everywhere",
      ],
      2: [
        "People laughing at me",
        "Looking like I'm trying too hard",
        "Being called weird",
        "Getting in trouble or letting someone down",
        "Not sure — I just do it",
      ],
    },
  },
  "identity-letter": {
    intro:
      "You've found your strengths, your values and where you can be yourself. This letter pulls it together: you, writing to yourself about who you are right now.",
    scenarios: {
      0: "A new kid has just joined your class and knows nothing about you. You get one chat to tell them who you really are.",
      1: "It's a bad day, a year from now. Future-you opens this letter looking for something to feel better. What do they need to hear?",
    },
    steps: {
      0: "What would you want that new kid to know about you first — what you're like and what you care about, not your marks?",
    },
  },
  "weekly-challenge": {
    intro:
      "So far you've been noticing things about yourself. This step is one small experiment: try one thing you found out, once, this week. It doesn't have to go well. Just see what happens.",
    prompt: JUNIOR_CHALLENGE,
  },
  "conversation-who-i-was": {
    intro:
      "Part of who you are comes from the stories other people tell about you. Ask someone who knew you when you were little — a parent, grandparent, or older brother or sister — a few questions. Then come back and write up what they said.",
    interviewQuestions: {
      0: "What was I like when I was really little, before I started school?",
    },
  },
};

/** Year 12: the end of school is in sight and everyone's asking what's next. */
export const SENIOR_M1: Record<string, StageLines> = {
  "chapters-so-far": {
    intro:
      "Before mapping who you are now, a quick look at how you got here. You're near the end of a big chapter, so it's a good moment to name the ones before it: a move, a new school, someone arriving or leaving. Two minutes. You'll come back to this later, in Where You've Come From, and either question can be left out.",
    starterOptions: {
      1: [
        "The Final Stretch — exams, deadlines and decisions",
        "Nearly Out — school's ending and next year is coming",
        "Holding It Together — juggling study, work and friends",
        "Working Out What's Next — lots of options, no clear answer",
        "Last Year with These People — making the most of it",
      ],
    },
  },
  "mask-check": {
    scenarios: {
      0: "Same joke, three rooms. Something funny pops into your head. With your closest friends you'd say it one way. In class or at your part-time job you'd tone it down. At a family dinner you might not say it at all.",
    },
    starterOptions: {
      0: [
        "I get louder and more myself with close friends",
        "I go quieter and more careful in some rooms",
        "I act more sorted about next year than I feel",
        "I hide my real opinions to keep the peace",
        "Honestly, I'm pretty much the same everywhere",
      ],
    },
  },
  "identity-letter": {
    scenarios: {
      1: "It's a hard day next year — a new place, new people, nothing familiar. Future-you is reading this letter looking for something to hold onto. They need a reminder of something true about who you are right now.",
    },
  },
};

/** Anyone past school: stop assuming a classroom. */
export const LEFT_SCHOOL_M1: Record<string, StageLines> = {
  "values-clarifier": {
    scenarios: {
      3: "You're offered the chance to do something new that you might be bad at, in front of people you barely know — a new course, a new job, a new group. Part of you wants to say no. Part of you is curious. Which part usually wins — and how do you feel about that?",
    },
  },
  "mask-check": {
    starterOptions: {
      0: [
        "I'm more myself with friends than at work or uni",
        "I go quiet and careful around new people",
        "I act more sorted than I feel",
        "I hide my real opinions to keep the peace",
        "Honestly, I'm pretty much the same everywhere",
      ],
    },
  },
  "identity-letter": {
    scenarios: {
      0: "Someone new — a flatmate, a colleague, someone in your course — knows nothing about you. Not your results, not your job, not your socials. You get one conversation to tell them who you actually are.",
    },
    steps: {
      0: "What would you want that new person to understand about you first — your personality, your quirks, what actually matters to you, not your job or your results?",
    },
  },
  "weekly-challenge": {
    prompt: LEFT_SCHOOL_CHALLENGE,
  },
  "conversation-who-i-was": {
    alternative:
      "Nobody who knew you then that you can ask, or you'd rather not? Go through old photos, videos, school reports or birthday cards instead, or ask a friend who's known you since school. Answer the questions from what you find.",
    interviewQuestions: {
      0: "What was I like as a little kid — and then as a teenager?",
    },
  },
};

/** Just left school: uni, TAFE, an apprenticeship, a first job or a gap year. */
export const LEAVER_M1: Record<string, StageLines> = {
  "chapters-so-far": {
    intro:
      "Before mapping who you are now, a quick look at how you got here. Leaving school is a chapter break, and so is a move, a new course or job, or someone arriving or leaving. Naming them takes two minutes. You'll come back to this later, in Where You've Come From, and either question can be left out.",
    starterOptions: {
      0: [
        "Childhood → High School → Leaving Home",
        "School Me → The Gap Year → Now",
        "The Small Town → The Big Move → Finding My Feet",
        "Year 12 Stress → The First Job → Working It Out",
        "Who Everyone Expected → Starting Over → Becoming Me",
      ],
      1: [
        "Starting Over — new course, job or city",
        "Figuring It Out — free for the first time and not sure what to do with it",
        "Finding My People — school friends drifting, new ones forming",
        "Making It Work — study, work and money all at once",
        "The In-Between — not where I was, not where I'm going yet",
      ],
    },
  },
  "identity-letter": {
    scenarios: {
      1: "It's a hard day a year from now — a deadline, a bill, a lonely week. Future-you is reading this letter looking for something to hold onto. They need a reminder of something true about who you are right now.",
    },
  },
};

/** A few years out of school: work, rent, relationships, a life of their own. */
export const ADULT_M1: Record<string, StageLines> = {
  "chapters-so-far": {
    intro:
      "Before mapping who you are now, a quick look at how you got here. A few years out of school there are more chapters than you might think: moves, courses, jobs, relationships, people arriving or leaving. Naming them takes two minutes. You'll come back to this later, in Where You've Come From, and either question can be left out.",
    starterOptions: {
      0: [
        "School → Study → The First Real Job",
        "Home → Moving Out → Building My Own Life",
        "The Plan → The Plan Changing → Making a New One",
        "Growing Up There → Moving Away → Making It Here",
        "Together → On My Own → Working Out Me",
      ],
      1: [
        "Building Something — work or study finally taking shape",
        "Starting Again — new job, city or relationship",
        "Holding Steady — busy, settled and mostly okay",
        "Questioning It — wondering if this is the life I want",
        "Growing Up for Real — rent, work and looking after myself",
      ],
    },
  },
  "mask-check": {
    starterOptions: {
      2: [
        "Being judged or not taken seriously",
        "Looking unprofessional",
        "Being seen as 'too much' or 'too intense'",
        "Letting people down or disappointing them",
        "Not really sure — it's just a habit",
      ],
    },
  },
  "identity-letter": {
    scenarios: {
      1: "It's a hard day a year from now — work's rough, money's tight or a relationship's wobbling. Future-you is reading this letter looking for something to hold onto. They need a reminder of something true about who you are right now.",
    },
  },
  "conversation-who-i-was": {
    intro:
      "Part of who you are comes from the stories other people tell about you. This step is a conversation: ask someone who knew you as a kid, like a parent, grandparent, sibling or old family friend, a few questions. Then come back and write up what you heard.",
  },
};

/** The mission card's description, by stage. Middle uses missions.ts as written. */
export const MISSION_DESCRIPTIONS: Partial<Record<string, Record<number, string>>> = {
  junior: {
    1: "By the end of this mission you'll have your top 5 strengths, your 5 most important values, and a private letter to yourself. Every step adds a piece to your Who I Am card. Seven short steps. No right answers.",
  },
  senior: {
    1: "By the end of this mission you'll have your top 5 strengths, your 5 core values, and a private letter about who you are right now — handy when everyone's asking what you're doing next year. Every step adds a piece to your Who I Am card. Seven short steps, about an hour in all.",
  },
  leaver: {
    1: "By the end of this mission you'll have your top 5 strengths, your 5 core values, and a private letter about who you are now that school's behind you. Every step adds a piece to your Who I Am card. Seven short steps, about an hour in all, spread over a week. No right answers.",
  },
  adult: {
    1: "By the end of this mission you'll have your top 5 strengths, your 5 core values, and a private letter about who you are at this point in your life. Every step adds a piece to your Who I Am card. Seven short steps, about an hour in all, spread over a week. No right answers.",
  },
};
