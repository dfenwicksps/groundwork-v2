// ─── VIA-24 Character Strengths ───────────────────────────────────────────────
// Grounded in Peterson & Seligman's "Character Strengths and Virtues" handbook
// (the six-virtue classification) and Niemiec's "Character Strengths
// Interventions" (signature-strengths framing). The one-liners are teen-friendly
// paraphrases of the handbook's consensual definitions.

import { type LifeStage } from "./lifeStage";

export type Virtue =
  | "Wisdom"
  | "Courage"
  | "Humanity"
  | "Justice"
  | "Temperance"
  | "Transcendence";

export interface CharacterStrength {
  key: string;
  name: string;
  virtue: Virtue;
  /** Teen-friendly one-line definition */
  short: string;
  /** 1-3 word plain-English gloss, shown next to hard names (e.g. Prudence) */
  plain: string;
  emoji: string;
}

export const VIRTUE_ORDER: Virtue[] = [
  "Wisdom",
  "Courage",
  "Humanity",
  "Justice",
  "Temperance",
  "Transcendence",
];

// Canonical order — also used to break score ties deterministically.
export const VIA_STRENGTHS: CharacterStrength[] = [
  // Wisdom & Knowledge
  { key: "creativity", name: "Creativity", virtue: "Wisdom", plain: "new ideas", emoji: "💡", short: "Coming up with new, original ways to do things or see things." },
  { key: "curiosity", name: "Curiosity", virtue: "Wisdom", plain: "wanting to know", emoji: "🔍", short: "Wanting to explore, ask questions, and find out how things work." },
  { key: "judgment", name: "Judgment", virtue: "Wisdom", plain: "clear thinking", emoji: "⚖️", short: "Thinking things through from all sides before deciding." },
  { key: "love-of-learning", name: "Love of Learning", virtue: "Wisdom", plain: "loves learning", emoji: "📚", short: "Genuinely enjoying getting better at things and learning new stuff." },
  { key: "perspective", name: "Perspective", virtue: "Wisdom", plain: "wise advice", emoji: "🧭", short: "Seeing the bigger picture and giving advice that actually helps." },
  // Courage
  { key: "bravery", name: "Bravery", virtue: "Courage", plain: "facing fear", emoji: "🦁", short: "Doing the right or hard thing even when it's scary." },
  { key: "perseverance", name: "Perseverance", virtue: "Courage", plain: "not giving up", emoji: "🧗", short: "Finishing what you start, even when it gets boring or hard." },
  { key: "honesty", name: "Honesty", virtue: "Courage", plain: "being real", emoji: "🎯", short: "Being real — telling the truth and living as your true self." },
  { key: "zest", name: "Zest", virtue: "Courage", plain: "energy for life", emoji: "⚡", short: "Bringing energy and excitement to life; doing things wholeheartedly." },
  // Humanity
  { key: "love", name: "Love", virtue: "Humanity", plain: "close bonds", emoji: "❤️", short: "Valuing close relationships and letting people be close to you." },
  { key: "kindness", name: "Kindness", virtue: "Humanity", plain: "helping others", emoji: "🤝", short: "Helping and looking after others, even when nobody asked." },
  { key: "social-intelligence", name: "Social Intelligence", virtue: "Humanity", plain: "reading people", emoji: "🫂", short: "Reading how people feel and knowing what to do in the moment." },
  // Justice
  { key: "teamwork", name: "Teamwork", virtue: "Justice", plain: "team player", emoji: "🧩", short: "Pulling your weight for the group and being loyal to it." },
  { key: "fairness", name: "Fairness", virtue: "Justice", plain: "treating people equally", emoji: "⚱️", short: "Treating everyone equally and giving people a fair go." },
  { key: "leadership", name: "Leadership", virtue: "Justice", plain: "leading others", emoji: "🚩", short: "Helping a group get organised and get things done together." },
  // Temperance
  { key: "forgiveness", name: "Forgiveness", virtue: "Temperance", plain: "letting go", emoji: "🕊️", short: "Letting go of grudges and giving people second chances." },
  { key: "humility", name: "Humility", virtue: "Temperance", plain: "modesty", emoji: "🌱", short: "Letting your actions speak; not needing to be the centre of attention." },
  { key: "prudence", name: "Prudence", virtue: "Temperance", plain: "careful choices", emoji: "🛡️", short: "Thinking before you act; not doing things you'll regret." },
  { key: "self-regulation", name: "Self-Regulation", virtue: "Temperance", plain: "self-control", emoji: "🧘", short: "Managing your feelings, habits, and impulses." },
  // Transcendence
  { key: "appreciation", name: "Appreciation of Beauty", virtue: "Transcendence", plain: "noticing beauty", emoji: "🌅", short: "Noticing and being moved by beauty, skill, and excellence around you." },
  { key: "gratitude", name: "Gratitude", virtue: "Transcendence", plain: "being thankful", emoji: "🙏", short: "Noticing the good things and being thankful for them." },
  { key: "hope", name: "Hope", virtue: "Transcendence", plain: "staying positive", emoji: "🌈", short: "Expecting the best and believing you can make it happen." },
  { key: "humor", name: "Humour", virtue: "Transcendence", plain: "making people laugh", emoji: "😄", short: "Bringing lightness and laughter; helping people smile." },
  { key: "spirituality", name: "Spirituality", virtue: "Transcendence", plain: "meaning & purpose", emoji: "✨", short: "Having beliefs about meaning and purpose that give life shape." },
];

export const STRENGTH_BY_KEY: Record<string, CharacterStrength> = Object.fromEntries(
  VIA_STRENGTHS.map((s) => [s.key, s])
);

export function strengthName(key: string): string {
  return STRENGTH_BY_KEY[key]?.name ?? key;
}

// ─── The 18-scenario assessment ───────────────────────────────────────────────
// Each scenario has 4 options mapped to 4 distinct strengths. Across all 18,
// every strength appears exactly three times (18 × 4 = 72 slots ÷ 24 = 3 each).
//
// Three appearances rather than two is a measurement decision, not padding. At
// two, a strength could only score in {-2,0,2,4}, most strengths scored exactly
// 0, and the ranking was decided largely by the tie-break rather than by the
// student's answers — see TIEBREAK_ORDER below.
//
// Age relevance (scenariosFor): each scenario is reworded for the student's life
// stage so it's set in their actual world. The base text is the Year 10–11
// ("middle") version; the `variants` map supplies distinct wording for the other
// four stages:
//   • junior → Year 7–9: class, friends, home, teams — simplest stakes
//   • senior → Year 12: exams, leadership, licences, decisions that count
//   • leaver → uni / TAFE / apprenticeship / first full-time job / gap year
//   • adult  → workplace, flatmates, rent and bills, independent adult life
// A variant only ever rewrites the *wording* — the strength behind each option is
// fixed, so scoring and the three-appearance invariant are identical across all
// ages, and a saved profile reads the same whatever stage the student is on.
// Option overrides are keyed by the option's strength and only given where the
// base wording names something stage-specific; everything else carries over.

/** Stage-specific rewording of one scenario. `options` is keyed by strength. */
export interface ScenarioVariant {
  scenario: string;
  options?: Record<string, string>;
}

export interface StrengthScenario {
  scenario: string; // base = Year 10–11 ("middle"); the neutral fallback
  options: { text: string; strength: string }[];
  /** Distinct wording per life stage; a missing stage falls back to the base. */
  variants?: Partial<Record<LifeStage, ScenarioVariant>>;
}

// Distinct stances: within a scenario, each option is a different *move* — not
// the same move reworded. Where two strengths sit close together (Love of
// Learning and Perseverance, Judgment and Curiosity, Bravery and Zest), the
// options pull them apart by what you'd actually do or feel: enjoying not
// knowing vs refusing to quit, checking a claim vs being fascinated by it,
// doing it scared vs doing it excited.
export const STRENGTH_SCENARIOS: StrengthScenario[] = [
  {
    scenario:
      "A group assignment lands on your table and it's chaos — no plan, the due date's close, everyone talking over each other. What are you most likely to do?",
    options: [
      { text: "Step up, split the work and give everyone a job", strength: "leadership" },
      { text: "Pitch a completely different angle no one's thought of", strength: "creativity" },
      { text: "Say little, start on my part, and just grind it out", strength: "perseverance" },
      { text: "Make sure the quieter people actually get heard", strength: "fairness" },
    ],
    variants: {
      junior: {
        scenario:
          "You get put in a group for a class task and it's chaos — no plan, everyone talking at once. What do you do?",
        options: {
          leadership: "Help sort out who does what",
          creativity: "Suggest a fun, different way to do it",
          perseverance: "Quietly start on my bit and keep going",
          fairness: "Make sure everyone gets a turn to talk",
        },
      },
      senior: {
        scenario:
          "A big group assessment drops near the end of term — no plan, marks that count, everyone talking over each other. What are you most likely to do?",
        options: {
          leadership: "Take the lead, divide it up and set deadlines",
          creativity: "Pitch a sharper angle no one's considered",
        },
      },
      leaver: {
        scenario:
          "A group task lands in your tutorial or your first job — no plan, deadline close, everyone talking over each other. What do you do?",
        options: {
          creativity: "Pitch a completely different approach no one's tried",
        },
      },
      adult: {
        scenario:
          "A project lands on your team at work and it's a mess — no plan, deadline close, everyone talking over each other. What's your move?",
        options: {
          leadership: "Step up, divide it and give everyone a clear job",
          creativity: "Pitch a completely different approach no one's tried",
          perseverance: "Say little, start on my piece and grind it out",
        },
      },
    },
  },
  {
    scenario: "A free weekend, zero plans. Which version of the day is most you?",
    options: [
      { text: "Deep-diving a topic until I actually get it", strength: "love-of-learning" },
      { text: "Making or building something of my own", strength: "creativity" },
      { text: "A slow one-on-one with someone I'm close to", strength: "love" },
      { text: "Outdoors and moving, chasing a bit of a thrill", strength: "zest" },
    ],
    variants: {
      junior: {
        scenario: "A whole weekend with nothing you have to do. Which one's most you?",
        options: {
          "love-of-learning": "Finding out everything about something I'm into",
          creativity: "Making, drawing or building something",
          love: "Hanging out with one person I'm really close to",
          zest: "Outside, running around, doing something exciting",
        },
      },
      senior: {
        scenario:
          "A rare weekend with no study and no shift. Which version of the day is most you?",
      },
      leaver: {
        scenario:
          "A weekend off between classes and work. Which version of the day is most you?",
      },
      adult: {
        scenario: "A rare weekend off, nothing booked. Which version of the day is most you?",
      },
    },
  },
  {
    scenario:
      "A friend messages you late at night, clearly falling apart. What comes most naturally?",
    options: [
      { text: "Work out whether they want advice or just someone to listen", strength: "social-intelligence" },
      { text: "Drop everything and stay with them as long as it takes", strength: "love" },
      { text: "Remind them it won't feel like this forever", strength: "hope" },
      { text: "Help them think through what to actually do next", strength: "perspective" },
    ],
    variants: {
      junior: {
        scenario: "A friend texts you at night, really upset about something. What do you do first?",
        options: {
          "social-intelligence": "Figure out if they want help or just want to vent",
          love: "Keep talking to them for as long as they need",
          hope: "Tell them it'll be okay soon",
          perspective: "Help them work out what to do about it",
        },
      },
      senior: {
        scenario:
          "A mate messages you at midnight, stressed out of their mind about exams and everything else. What comes most naturally?",
      },
      leaver: {
        scenario:
          "A friend messages you late, clearly falling apart — study, money, a breakup. What comes most naturally?",
      },
      adult: {
        scenario:
          "A close friend calls you late, clearly falling apart. What comes most naturally?",
      },
    },
  },
  {
    scenario:
      "You got away with it — no one checked the work you didn't actually do. What really goes through your head?",
    options: [
      { text: "I'd rather own up than sit on it", strength: "honesty" },
      { text: "I keep quiet, but think about how it could come back on me", strength: "prudence" },
      { text: "It's not fair on the people who actually did the work", strength: "fairness" },
      { text: "I say nothing, but make myself go back and do it properly", strength: "self-regulation" },
    ],
    variants: {
      junior: {
        scenario: "You forgot your homework but the teacher never checked. What's going through your head?",
        options: {
          honesty: "I'd probably tell the teacher anyway",
          prudence: "I worry it'll catch up with me later",
          fairness: "It's not fair on everyone who did theirs",
          "self-regulation": "I make myself do it properly tonight",
        },
      },
      senior: {
        scenario:
          "You skipped the prep for an assessment task and no one checked. What really goes through your head?",
      },
      leaver: {
        scenario:
          "You got away with it — no one checked an assignment task you quietly skipped. What really goes through your head?",
      },
      adult: {
        scenario:
          "You got away with it — no one noticed a task you quietly skipped at work. What really goes through your head?",
      },
    },
  },
  {
    scenario:
      "Someone in your circle did something that really annoyed you last week. Today they're acting like nothing happened. You're most likely to…",
    options: [
      { text: "Let it go for real — I don't hold grudges", strength: "forgiveness" },
      { text: "Keep it out of the group so nobody has to pick sides", strength: "teamwork" },
      { text: "Ask myself whether I played a part in it too", strength: "humility" },
      { text: "Get the full story before I decide how I feel", strength: "judgment" },
    ],
    variants: {
      junior: {
        scenario:
          "A friend did something last week that annoyed you. Today they act totally normal. You…",
        options: {
          forgiveness: "Let it go — it's not worth staying mad",
          teamwork: "Act normal so the rest of the group isn't awkward",
          humility: "Wonder if I did something to cause it",
          judgment: "Try to find out what really happened first",
        },
      },
      senior: {
        scenario:
          "Someone in your year did something that really got to you last week. Today they're acting like nothing happened. You…",
      },
      leaver: {
        scenario:
          "Someone in your course or crew did something that annoyed you last week. Today they're acting like nothing happened. You…",
      },
      adult: {
        scenario:
          "A colleague did something that really annoyed you last week. Today they're acting like nothing happened. You…",
        options: {
          teamwork: "Keep it out of the team so nobody has to pick sides",
        },
      },
    },
  },
  {
    scenario: "Someone new joins and clearly knows nobody. Over the week, what's most like you?",
    options: [
      { text: "Check in with them one-on-one and offer to show them around", strength: "kindness" },
      { text: "Watch first to see if they want company or space", strength: "social-intelligence" },
      { text: "Pull them into my group's plans so they've got a crew", strength: "teamwork" },
      { text: "Crack a joke to break the ice", strength: "humor" },
    ],
    variants: {
      junior: {
        scenario: "A new kid joins your class and doesn't know anyone. What's most like you?",
        options: {
          kindness: "Go and say hi and offer to show them around",
          "social-intelligence": "Watch to see if they want company or want to be left alone",
          teamwork: "Ask them to sit with my friends at lunch",
          humor: "Make them laugh so it's less awkward",
        },
      },
      senior: {
        scenario:
          "A new student joins your year group partway through and knows nobody. Over the week, what's most like you?",
      },
      leaver: {
        scenario:
          "Someone new joins your course or your team and knows nobody. Over the week, what's most like you?",
      },
      adult: {
        scenario: "A new starter joins your workplace and knows nobody. Over the week, what's most like you?",
        options: {
          teamwork: "Bring them along to the team's lunches and drinks",
        },
      },
    },
  },
  {
    scenario:
      "There's a chance to try something new in front of people — and you might be genuinely bad at it. What wins?",
    options: [
      { text: "I'm nervous, but I make myself do it anyway", strength: "bravery" },
      { text: "I ask a heap of questions first — I want to know how it works", strength: "curiosity" },
      { text: "I'm excited and jump straight in", strength: "zest" },
      { text: "I watch someone else go first, then decide", strength: "prudence" },
    ],
    variants: {
      junior: {
        scenario:
          "There's a chance to try something new in front of the class, and you might be bad at it. What wins?",
        options: {
          bravery: "I'm scared, but I do it anyway",
          curiosity: "I ask lots of questions about it first",
          zest: "I'm excited and go first",
          prudence: "I watch someone else have a go first",
        },
      },
      senior: {
        scenario:
          "There's a chance to put your hand up for something new in front of your year — and you might flop. What wins?",
      },
      leaver: {
        scenario:
          "There's a chance to try something new in front of a room of people you barely know — and you might be bad at it. What wins?",
      },
      adult: {
        scenario:
          "There's a chance to try something new in front of colleagues — and you might be genuinely bad at it. What wins?",
      },
    },
  },
  {
    scenario:
      "You watch someone pull off something incredible — a performance, a big play, a piece of art. Your reaction?",
    options: [
      { text: "I just stand there amazed — real skill gives me chills", strength: "appreciation" },
      { text: "I go and look up how they learned to do that", strength: "love-of-learning" },
      { text: "I find them afterwards and tell them how good it was", strength: "kindness" },
      { text: "It makes me feel part of something bigger than me", strength: "spirituality" },
    ],
    variants: {
      junior: {
        scenario:
          "You watch someone your age pull off something amazing — a goal, a dance, a drawing. Your reaction?",
        options: {
          appreciation: "I'm just amazed — it gives me goosebumps",
          "love-of-learning": "I want to find out how they learned it",
          kindness: "I go and tell them how good it was",
          spirituality: "It makes me feel like part of something big",
        },
      },
      senior: {
        scenario:
          "You watch someone absolutely nail a performance, a game or a major work. Your reaction?",
      },
      leaver: {
        scenario:
          "You watch someone pull off something incredible — a gig, a game, a piece of work in your course. Your reaction?",
      },
      adult: {
        scenario:
          "You watch someone pull off something genuinely brilliant — on stage, on the field, in their craft. Your reaction?",
      },
    },
  },
  {
    scenario:
      "You see someone getting a raw deal — left out, blamed for something, picked on. First instinct?",
    options: [
      { text: "Step in right then, even if it turns on me", strength: "bravery" },
      { text: "Make sure their side gets heard before anyone's judged", strength: "fairness" },
      { text: "Tell someone in charge exactly what I saw", strength: "honesty" },
      { text: "Get a few others together so it stops for good", strength: "leadership" },
    ],
    variants: {
      junior: {
        scenario:
          "You see a kid getting picked on, or blamed for something they didn't do. First instinct?",
        options: {
          bravery: "Stick up for them, even if they turn on me",
          fairness: "Say they should get a chance to explain",
          honesty: "Tell a teacher exactly what I saw",
          leadership: "Get my friends to help stop it",
        },
      },
      senior: {
        scenario:
          "You see someone in your year getting a raw deal — left out, blamed, singled out. First instinct?",
      },
      leaver: {
        scenario:
          "You see someone getting a raw deal — shut out, blamed, talked over — in your course or at work. First instinct?",
      },
      adult: {
        scenario:
          "You see someone at work getting a raw deal — blamed for something, talked over, pushed out. First instinct?",
        options: {
          honesty: "Tell a manager exactly what I saw",
        },
      },
    },
  },
  {
    scenario:
      "You've set a goal that'll take months of boring, unglamorous work. Be honest — what are you actually like?",
    options: [
      { text: "When I hit a setback, I get back up and keep going", strength: "perseverance" },
      { text: "I set a routine and say no to distractions", strength: "self-regulation" },
      { text: "I picture how it'll feel when I get there", strength: "hope" },
      { text: "I work away quietly — I don't need anyone to notice", strength: "humility" },
    ],
    variants: {
      junior: {
        scenario:
          "You set a goal that'll take months — getting good at a sport, an instrument, a game. Be honest, what are you like?",
        options: {
          perseverance: "If I mess up, I try again",
          "self-regulation": "I practise even when I'd rather be on my phone",
          hope: "I imagine how good it'll feel when I can do it",
          humility: "I just practise — I don't need people to see",
        },
      },
      senior: {
        scenario:
          "You've set a goal that'll take months of grind — your ATAR, a portfolio, a big tryout. Be honest, what are you like?",
      },
      leaver: {
        scenario:
          "You've set a goal that'll take months of unglamorous work — passing first year, finishing a qualification. Be honest, what are you like?",
      },
      adult: {
        scenario:
          "You've set a goal that'll take months of grind — a fitness target, a qualification, saving for something big. Be honest, what are you like?",
      },
    },
  },
  {
    scenario: "Life's been genuinely good lately. When you notice that, what do you do with it?",
    options: [
      { text: "Thank the people who helped make it good", strength: "gratitude" },
      { text: "Feel like things are happening for a reason", strength: "spirituality" },
      { text: "Notice the small stuff — a song, the light, a good meal", strength: "appreciation" },
      { text: "Joke around more and spread the good mood", strength: "humor" },
    ],
    variants: {
      junior: {
        scenario: "Things have been really good lately. When you notice that, what do you do?",
        options: {
          gratitude: "Say thanks to the people who made it good",
          spirituality: "Feel like it's all happening for a reason",
          appreciation: "Notice little things, like a song or a nice day",
          humor: "Muck around more and make people laugh",
        },
      },
      senior: {
        scenario:
          "Despite Year 12, life's been genuinely good lately. When you notice that, what do you do with it?",
      },
      leaver: {
        scenario:
          "Life after school has been genuinely good lately. When you notice that, what do you do with it?",
      },
      adult: {
        scenario:
          "Life's been genuinely good lately — work, people, the lot. When you notice that, what do you do with it?",
      },
    },
  },
  {
    scenario: "A big claim is flying round the group chat and everyone's just believing it. Your move?",
    options: [
      { text: "Check where it came from before I believe or share it", strength: "judgment" },
      { text: "Get fascinated and want the whole story behind it", strength: "curiosity" },
      { text: "Admit I don't know enough to have an opinion", strength: "humility" },
      { text: "Think about how it lands for the people it's about", strength: "perspective" },
    ],
    variants: {
      junior: {
        scenario:
          "A wild rumour is going round the class group chat and everyone's just believing it. Your move?",
        options: {
          judgment: "Check if it's actually true before I believe it",
          curiosity: "Want to know the whole story",
          humility: "Say I don't really know",
          perspective: "Think about how the person it's about would feel",
        },
      },
      senior: {
        scenario:
          "A big claim about your school or year is flying round the group chat and everyone's believing it. Your move?",
      },
      leaver: {
        scenario:
          "A big claim is going round your course chat or your feed and everyone's believing it. Your move?",
      },
      adult: {
        scenario:
          "A big claim is doing the rounds — a group chat, a work Slack, your feed — and everyone's just believing it. Your move?",
      },
    },
  },
  {
    scenario: "You and someone close have properly fallen out. A week's gone by. Your instinct?",
    options: [
      { text: "Let it go — I'm not keeping score", strength: "forgiveness" },
      { text: "Tell them straight what actually hurt", strength: "honesty" },
      { text: "Think about what was going on for them at the time", strength: "social-intelligence" },
      { text: "Message first — they matter more than being right", strength: "love" },
    ],
    variants: {
      junior: {
        scenario: "You and a close friend have had a big falling-out. A week's gone by. Your instinct?",
        options: {
          forgiveness: "Forget about it and move on",
          honesty: "Tell them what upset me",
          "social-intelligence": "Think about why they acted like that",
          love: "Message them first — the friendship matters more",
        },
      },
      senior: {
        scenario:
          "You and a close friend have properly fallen out, right in the middle of exam season. A week's gone by. Your instinct?",
      },
      leaver: {
        scenario:
          "You and someone close — a school friend, a flatmate, a partner — have properly fallen out. A week's gone by. Your instinct?",
      },
      adult: {
        scenario:
          "You and someone close — a partner, a mate — have properly fallen out. A week's gone by. Your instinct?",
      },
    },
  },
  {
    scenario:
      "Something you'd been looking forward to collapses at the last minute. Honest reaction?",
    options: [
      { text: "Focus on what's still good right now", strength: "gratitude" },
      { text: "Tell myself something better is coming", strength: "hope" },
      { text: "Laugh about it — it'll make a good story", strength: "humor" },
      { text: "Make new plans straight away and get out there", strength: "zest" },
    ],
    variants: {
      junior: {
        scenario:
          "Something you'd been really looking forward to gets cancelled last minute. Honest reaction?",
        options: {
          gratitude: "Think about the good stuff I've still got",
          hope: "Tell myself there'll be another chance",
          humor: "Turn it into a joke",
          zest: "Find something else fun to do straight away",
        },
      },
      senior: {
        scenario:
          "Formal, schoolies, a trip with mates — something you'd been looking forward to falls through at the last minute. Honest reaction?",
      },
      leaver: {
        scenario:
          "A trip, a gig, a night you'd been looking forward to falls through at the last minute. Honest reaction?",
      },
      adult: {
        scenario:
          "Plans you'd been looking forward to fall through at the last minute. Honest reaction?",
      },
    },
  },
  {
    scenario:
      "You hit something you genuinely don't get — a subject, a skill, a problem that won't budge. Your move?",
    options: [
      { text: "Enjoy it — not getting it yet is the interesting part", strength: "love-of-learning" },
      { text: "Wander off into the bits that fascinate me, even off-topic", strength: "curiosity" },
      { text: "Go back step by step to find where I went wrong", strength: "judgment" },
      { text: "Hate it, but refuse to stop until I get it", strength: "perseverance" },
    ],
    variants: {
      junior: {
        scenario: "You hit a topic in class you just don't get. What's your move?",
        options: {
          "love-of-learning": "I kind of like it — it's a puzzle",
          curiosity: "I get distracted by the interesting bits",
          judgment: "Go back over it to find where I got lost",
          perseverance: "Keep trying, even though it's annoying",
        },
      },
      senior: {
        scenario:
          "You hit a topic you genuinely don't get, right when the exam's coming. What's your move?",
      },
      leaver: {
        scenario:
          "You hit something at uni, TAFE or work you genuinely don't get — a concept, a system, a problem that won't budge. Your move?",
      },
      adult: {
        scenario:
          "You hit something at work you genuinely don't get — a system, a skill, a problem that won't budge. Your move?",
      },
    },
  },
  {
    scenario:
      "Your group's trying to organise something and it's all loose — half-decided, nobody committing. Where do you land?",
    options: [
      { text: "Do my bit well so nobody's waiting on me", strength: "teamwork" },
      { text: "Get people to decide and get moving", strength: "leadership" },
      { text: "Check nobody's quietly being left out", strength: "kindness" },
      { text: "Think ahead to what could go wrong", strength: "prudence" },
    ],
    variants: {
      junior: {
        scenario:
          "You and your friends are trying to plan something and no one's deciding anything. Where do you land?",
        options: {
          teamwork: "Do my part so the plan works",
          leadership: "Get everyone to just decide",
          kindness: "Make sure nobody's left out",
          prudence: "Think about what could go wrong",
        },
      },
      senior: {
        scenario:
          "You're pulling together a formal, a fundraiser or an event and it's all loose — half-decided, nobody committing. Where do you land?",
      },
      leaver: {
        scenario:
          "A group of you is organising something — a trip, an event, a share house — and it's all loose. Where do you land?",
      },
      adult: {
        scenario:
          "Your team's organising something and it's all loose — half-decided, nobody committing. Where do you land?",
      },
    },
  },
  {
    scenario:
      "An hour entirely to yourself — no phone, nothing you have to do. Where does your head actually go?",
    options: [
      { text: "Sorting out what actually matters in my life right now", strength: "perspective" },
      { text: "Big questions — why we're here, what it all means", strength: "spirituality" },
      { text: "Noticing things around me I usually walk past", strength: "appreciation" },
      { text: "Dreaming up something to make", strength: "creativity" },
    ],
    variants: {
      junior: {
        scenario:
          "An hour on your own — no phone, nothing you have to do. Where does your head go?",
        options: {
          perspective: "Thinking about what's really important to me",
          spirituality: "Wondering about big questions, like why we're here",
          appreciation: "Noticing stuff around me I don't normally see",
          creativity: "Coming up with ideas for something to make",
        },
      },
      senior: {
        scenario:
          "An hour entirely to yourself in the middle of Year 12 — no phone, no study. Where does your head actually go?",
      },
      leaver: {
        scenario:
          "An hour entirely to yourself — no phone, no classes, no shift. Where does your head actually go?",
      },
      adult: {
        scenario:
          "An hour entirely to yourself — no phone, no jobs to do. Where does your head actually go?",
      },
    },
  },
  {
    scenario: "Someone let you down badly, and now they're asking for another chance. What do you do?",
    options: [
      { text: "Give them the chance — everyone stuffs up", strength: "forgiveness" },
      { text: "Think about all the times they did come through", strength: "gratitude" },
      { text: "Say how much it hurt to their face, scary as that is", strength: "bravery" },
      { text: "Wait until I've calmed down before I answer", strength: "self-regulation" },
    ],
    variants: {
      junior: {
        scenario: "A friend let you down badly, and now they're asking for another chance. What do you do?",
        options: {
          forgiveness: "Give them another chance — everyone makes mistakes",
          gratitude: "Remember the times they were a good friend",
          bravery: "Tell them how much it hurt, even though it's scary",
          "self-regulation": "Wait until I'm not angry before I answer",
        },
      },
      senior: {
        scenario:
          "A close mate let you down badly in a big week, and now they're asking for another chance. What do you do?",
      },
      leaver: {
        scenario:
          "Someone let you down badly — a friend, a flatmate, a partner — and now they're asking for another chance. What do you do?",
      },
      adult: {
        scenario:
          "Someone let you down badly — a friend, a partner, a colleague — and now they're asking for another chance. What do you do?",
      },
    },
  },
];

/** The scenarios as this student should see them, reworded for their life stage. */
export function scenariosFor(stage: LifeStage): StrengthScenario[] {
  return STRENGTH_SCENARIOS.map((sc) => {
    const v = sc.variants?.[stage];
    if (!v) return { scenario: sc.scenario, options: sc.options };
    return {
      scenario: v.scenario,
      options: sc.options.map((o) => ({ ...o, text: v.options?.[o.strength] ?? o.text })),
    };
  });
}

// Sanity guard (dev only): every strength should appear exactly three times, and
// every variant override should name a strength the scenario actually uses.
if (process.env.NODE_ENV !== "production") {
  const counts: Record<string, number> = {};
  for (const sc of STRENGTH_SCENARIOS)
    for (const o of sc.options) counts[o.strength] = (counts[o.strength] || 0) + 1;
  const off = VIA_STRENGTHS.filter((s) => counts[s.key] !== 3).map((s) => s.key);
  if (off.length) console.warn("[strengths] uneven scenario coverage:", off, counts);

  for (const sc of STRENGTH_SCENARIOS) {
    const keys = new Set(sc.options.map((o) => o.strength));
    for (const v of Object.values(sc.variants ?? {})) {
      if (!v?.options) continue;
      const bad = Object.keys(v.options).filter((k) => !keys.has(k));
      if (bad.length) console.warn("[strengths] variant overrides unknown strength:", bad, sc.scenario);
    }
  }
}

// ─── Tie-breaking ─────────────────────────────────────────────────────────────
// Ties are inevitable: 18 scenarios yield 18 "most" picks for 24 strengths, so
// some strengths are never chosen and score equally. What matters is that the
// tie-break isn't systematically unfair.
//
// Breaking ties by VIA_STRENGTHS order looked neutral but wasn't: that array is
// grouped by virtue, so every Wisdom strength outranked every Transcendence one
// on a tie. Measured on random answers, Bravery reached the top five 47% of the
// time and Hope 5% — the ranking was reporting array position, not character.
//
// This order interleaves the six virtues instead, so no virtue is advantaged.
// It stays fixed, so a given set of answers always produces the same ranking.
const TIEBREAK_ORDER: string[] = [
  "creativity", "bravery", "love", "teamwork", "forgiveness", "appreciation",
  "curiosity", "perseverance", "kindness", "fairness", "humility", "gratitude",
  "judgment", "honesty", "social-intelligence", "leadership", "prudence", "hope",
  "love-of-learning", "zest", "perspective", "self-regulation", "humor", "spirituality",
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface StrengthResult {
  scores: Record<string, number>;
  ranking: string[]; // high → low, all 24 keys
}

/**
 * Score = (2 × times chosen "most like me") − (1 × times chosen "least like me").
 * Ranked high→low; ties broken by TIEBREAK_ORDER, which interleaves the six
 * virtues so no virtue is systematically favoured, and is fixed so the same
 * answers always give the same ranking.
 */
export function scoreAssessment(most: string[], least: string[]): StrengthResult {
  const scores: Record<string, number> = {};
  const mostCount: Record<string, number> = {};
  const leastCount: Record<string, number> = {};
  for (const s of VIA_STRENGTHS) {
    scores[s.key] = 0;
    mostCount[s.key] = 0;
    leastCount[s.key] = 0;
  }
  for (const k of most) if (k in scores) { scores[k] += 2; mostCount[k] += 1; }
  for (const k of least) if (k in scores) { scores[k] -= 1; leastCount[k] += 1; }

  const order = new Map(TIEBREAK_ORDER.map((k, i) => [k, i]));
  const ranking = [...VIA_STRENGTHS.map((s) => s.key)].sort((a, b) => {
    // 1. Score.
    const byScore = scores[b] - scores[a];
    if (byScore !== 0) return byScore;
    // 2. Equal scores can hide different histories — "never picked" and "picked
    //    once but rejected twice" both land on 0. Prefer the one the student
    //    actually chose, then the one they rejected less. This is real evidence,
    //    so it is used before falling back to a fixed order.
    const byMost = mostCount[b] - mostCount[a];
    if (byMost !== 0) return byMost;
    const byLeast = leastCount[a] - leastCount[b];
    if (byLeast !== 0) return byLeast;
    // 3. No evidence either way — a fixed, virtue-interleaved order.
    return order.get(a)! - order.get(b)!;
  });
  return { scores, ranking };
}

export function topStrengths(ranking: string[], n = 5): string[] {
  return ranking.slice(0, n);
}

export function bottomStrengths(ranking: string[], n = 5): string[] {
  return ranking.slice(-n).reverse(); // lowest first
}
