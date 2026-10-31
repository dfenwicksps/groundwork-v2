// ─── VIA-24 Character Strengths ───────────────────────────────────────────────
// Grounded in Peterson & Seligman's "Character Strengths and Virtues" handbook
// (the six-virtue classification) and Niemiec's "Character Strengths
// Interventions" (signature-strengths framing). The one-liners are teen-friendly
// paraphrases of the handbook's consensual definitions.

import { hasLeftSchool, type LifeStage } from "./lifeStage";

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
// Age relevance (scenariosFor):
//   • junior  → Year 7–9: class, friends, home — younger framing
//   • base    → Year 10–12: school, bigger decisions, more at stake
//   • leftSchool → leaver/adult: work, uni, flatting, independent life
// A variant only ever rewrites the *wording* — the strength behind each option
// is fixed, so scoring and the three-appearance invariant are identical across
// all ages. Option overrides are keyed by the option's strength and only given
// where the base wording names something age-specific; everything else carries
// over unchanged.

/** Age-specific rewording of one scenario. `options` is keyed by strength. */
export interface ScenarioVariant {
  scenario: string;
  options?: Record<string, string>;
}

export interface StrengthScenario {
  scenario: string;
  options: { text: string; strength: string }[];
  /** Year 7–9 framing */
  junior?: ScenarioVariant;
  /** Left-school (leaver / adult) framing */
  leftSchool?: ScenarioVariant;
}

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
    leftSchool: {
      scenario:
        "A project lands on your team and it's a mess — no plan, deadline close, everyone talking over each other. What are you most likely to do?",
      options: {
        creativity: "Pitch a completely different approach no one's tried",
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
    junior: {
      scenario: "A whole weekend with nothing you have to do. Which one's most you?",
    },
    leftSchool: {
      scenario: "A rare weekend off, nothing booked. Which version of the day is most you?",
    },
  },
  {
    scenario:
      "A friend messages you late at night, clearly falling apart. What comes most naturally?",
    options: [
      { text: "I read what they actually need before saying anything", strength: "social-intelligence" },
      { text: "I drop everything and just stay with them", strength: "love" },
      { text: "I remind them this feeling won't last forever", strength: "hope" },
      { text: "I help them step back and see it more clearly", strength: "perspective" },
    ],
    junior: {
      scenario: "A friend texts you at night, really upset about something. What do you do first?",
    },
  },
  {
    scenario:
      "You got away with it — no one checked the work you didn't actually do. What really goes through your head?",
    options: [
      { text: "I'd probably own up — it just feels wrong not to", strength: "honesty" },
      { text: "I think ahead to how this could come back on me", strength: "prudence" },
      { text: "It's not fair on everyone who did do it", strength: "fairness" },
      { text: "I quietly go back and do it properly anyway", strength: "self-regulation" },
    ],
    junior: {
      scenario: "You forgot your homework but the teacher never checked. What's going through your head?",
      options: {
        honesty: "I'd probably admit it anyway",
        prudence: "I think about what happens if this catches up with me",
        fairness: "It's not fair on everyone who did theirs",
        "self-regulation": "I quietly do it properly later anyway",
      },
    },
    leftSchool: {
      scenario:
        "You got away with it — no one noticed a task you quietly skipped at work. What really goes through your head?",
    },
  },
  {
    scenario:
      "Someone in your circle did something that really annoyed you last week. Today they're acting like nothing happened. You're most likely to…",
    options: [
      { text: "Let it drop — grudges aren't worth the energy", strength: "forgiveness" },
      { text: "Keep things running smoothly for everyone else's sake", strength: "teamwork" },
      { text: "Consider I might've read the whole thing wrong", strength: "humility" },
      { text: "Try to work out why they actually did it", strength: "judgment" },
    ],
    junior: {
      scenario:
        "A friend did something last week that annoyed you. Today they act totally normal. You…",
    },
  },
  {
    scenario: "Someone new joins and clearly knows nobody. Over the week, what's most like you?",
    options: [
      { text: "Go out of my way to make them feel welcome", strength: "kindness" },
      { text: "Clock whether they want company or space first", strength: "social-intelligence" },
      { text: "Fold them into the group so they belong", strength: "teamwork" },
      { text: "Crack a joke to melt the awkwardness", strength: "humor" },
    ],
    junior: {
      scenario: "A new kid joins your class and doesn't know anyone. What's most like you?",
    },
    leftSchool: {
      scenario: "A new starter joins your workplace and knows nobody. Over the week, what's most like you?",
    },
  },
  {
    scenario:
      "There's a chance to try something new in front of people — and you might be genuinely bad at it. What wins?",
    options: [
      { text: "I do it anyway, nerves and all", strength: "bravery" },
      { text: "I'm too intrigued by it not to try", strength: "curiosity" },
      { text: "I throw myself in all-in, no half measures", strength: "zest" },
      { text: "I weigh it up properly before I commit", strength: "prudence" },
    ],
    junior: {
      scenario:
        "There's a chance to try something new in front of the class, and you might be bad at it. What wins?",
    },
  },
  {
    scenario:
      "You watch someone pull off something incredible — a performance, a big play, a piece of art. Your reaction?",
    options: [
      { text: "I get chills — real skill genuinely moves me", strength: "appreciation" },
      { text: "I want to pull apart exactly how they did it", strength: "love-of-learning" },
      { text: "I hype them up and make sure they know they're seen", strength: "kindness" },
      { text: "It makes me feel part of something bigger", strength: "spirituality" },
    ],
  },
  {
    scenario:
      "You see someone getting a raw deal — left out, blamed for something, picked on. First instinct?",
    options: [
      { text: "Step in, even if it puts me in the firing line", strength: "bravery" },
      { text: "It eats at me — everyone deserves a fair go", strength: "fairness" },
      { text: "Afterwards, I'd name plainly that it wasn't right", strength: "honesty" },
      { text: "Rally a few others so it actually changes", strength: "leadership" },
    ],
    junior: {
      scenario:
        "You see a kid getting picked on, or blamed for something they didn't do. First instinct?",
    },
  },
  {
    scenario:
      "You've set a goal that'll take months of boring, unglamorous work. Be honest — what are you actually like?",
    options: [
      { text: "I keep turning up long after the buzz wears off", strength: "perseverance" },
      { text: "I hold the routine even when I don't feel like it", strength: "self-regulation" },
      { text: "I stay convinced it'll pay off in the end", strength: "hope" },
      { text: "I don't need the credit, I just want it done right", strength: "humility" },
    ],
  },
  {
    scenario: "Life's been genuinely good lately. When you notice that, what do you do with it?",
    options: [
      { text: "Actually pause and feel thankful for it", strength: "gratitude" },
      { text: "Wonder what it all means, bigger picture", strength: "spirituality" },
      { text: "Soak up the small, beautiful moments", strength: "appreciation" },
      { text: "Spread the good mood and make people laugh", strength: "humor" },
    ],
  },
  {
    scenario: "A big claim is flying round the group chat and everyone's just believing it. Your move?",
    options: [
      { text: "Question it and check whether it's actually true", strength: "judgment" },
      { text: "Go dig into it myself to find out", strength: "curiosity" },
      { text: "Stay honest about what I don't actually know", strength: "humility" },
      { text: "Try to see it from the other side's angle", strength: "perspective" },
    ],
  },
  {
    scenario: "You and someone close have properly fallen out. A week's gone by. Your instinct?",
    options: [
      { text: "Let it go and move on — I don't cling to it", strength: "forgiveness" },
      { text: "Say plainly what actually hurt me", strength: "honesty" },
      { text: "Work out what was really going on under it for them", strength: "social-intelligence" },
      { text: "Reach out first — the person matters more than being right", strength: "love" },
    ],
  },
  {
    scenario:
      "Something you'd been looking forward to collapses at the last minute. Honest reaction?",
    options: [
      { text: "Notice what I've still got going for me", strength: "gratitude" },
      { text: "Back myself that the next thing'll come good", strength: "hope" },
      { text: "End up laughing about it and making it a story", strength: "humor" },
      { text: "Pivot fast and throw myself at the next thing", strength: "zest" },
    ],
  },
  {
    scenario:
      "You hit something you genuinely don't get — a subject, a skill, a problem that won't budge. Your move?",
    options: [
      { text: "Stay with it because I want to truly understand it", strength: "love-of-learning" },
      { text: "Chase the parts that fascinate me, even off-track", strength: "curiosity" },
      { text: "Break it down and find where my thinking slipped", strength: "judgment" },
      { text: "Keep chipping at it until it finally cracks", strength: "perseverance" },
    ],
    junior: {
      scenario: "You hit a topic in class you just don't get. What's your move?",
    },
    leftSchool: {
      scenario:
        "You hit something at work you genuinely don't get — a system, a skill, a problem that won't budge. Your move?",
    },
  },
  {
    scenario:
      "Your group's trying to organise something and it's all loose — half-decided, nobody committing. Where do you land?",
    options: [
      { text: "Nailing my own bit so the whole thing holds up", strength: "teamwork" },
      { text: "Getting people decided and moving", strength: "leadership" },
      { text: "Checking nobody's quietly being left out", strength: "kindness" },
      { text: "Thinking ahead to what could go wrong", strength: "prudence" },
    ],
    junior: {
      scenario:
        "You and your friends are trying to plan something and no one's deciding anything. Where do you land?",
    },
  },
  {
    scenario:
      "An hour entirely to yourself — no phone, nothing you have to do. Where does your head actually go?",
    options: [
      { text: "Zooming out on what actually matters right now", strength: "perspective" },
      { text: "Bigger questions — meaning, and where I fit", strength: "spirituality" },
      { text: "Noticing things I usually walk straight past", strength: "appreciation" },
      { text: "Ideas start arriving and I want to make something", strength: "creativity" },
    ],
  },
  {
    scenario: "Someone let you down badly, and now they're asking for another chance. What do you do?",
    options: [
      { text: "Give them the second chance — people mess up", strength: "forgiveness" },
      { text: "Remember the times they did come through for me", strength: "gratitude" },
      { text: "Tell them straight how it landed, awkward as it is", strength: "bravery" },
      { text: "Sit with it instead of reacting while I'm angry", strength: "self-regulation" },
    ],
  },
];

/** The scenarios as this student should see them, reworded for their life stage. */
export function scenariosFor(stage: LifeStage): StrengthScenario[] {
  return STRENGTH_SCENARIOS.map((sc) => {
    const v = stage === "junior" ? sc.junior : hasLeftSchool(stage) ? sc.leftSchool : null;
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
    for (const v of [sc.junior, sc.leftSchool]) {
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
