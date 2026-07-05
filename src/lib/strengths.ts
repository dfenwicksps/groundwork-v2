// ─── VIA-24 Character Strengths ───────────────────────────────────────────────
// Grounded in Peterson & Seligman's "Character Strengths and Virtues" handbook
// (the six-virtue classification) and Niemiec's "Character Strengths
// Interventions" (signature-strengths framing). The one-liners are teen-friendly
// paraphrases of the handbook's consensual definitions.

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
  { key: "creativity", name: "Creativity", virtue: "Wisdom", emoji: "💡", short: "Coming up with new, original ways to do things or see things." },
  { key: "curiosity", name: "Curiosity", virtue: "Wisdom", emoji: "🔍", short: "Wanting to explore, ask questions, and find out how things work." },
  { key: "judgment", name: "Judgment", virtue: "Wisdom", emoji: "⚖️", short: "Thinking things through from all sides before deciding." },
  { key: "love-of-learning", name: "Love of Learning", virtue: "Wisdom", emoji: "📚", short: "Genuinely enjoying getting better at things and learning new stuff." },
  { key: "perspective", name: "Perspective", virtue: "Wisdom", emoji: "🧭", short: "Seeing the bigger picture and giving advice that actually helps." },
  // Courage
  { key: "bravery", name: "Bravery", virtue: "Courage", emoji: "🦁", short: "Doing the right or hard thing even when it's scary." },
  { key: "perseverance", name: "Perseverance", virtue: "Courage", emoji: "🧗", short: "Finishing what you start, even when it gets boring or hard." },
  { key: "honesty", name: "Honesty", virtue: "Courage", emoji: "🎯", short: "Being real — telling the truth and living as your true self." },
  { key: "zest", name: "Zest", virtue: "Courage", emoji: "⚡", short: "Bringing energy and excitement to life; doing things wholeheartedly." },
  // Humanity
  { key: "love", name: "Love", virtue: "Humanity", emoji: "❤️", short: "Valuing close relationships and letting people be close to you." },
  { key: "kindness", name: "Kindness", virtue: "Humanity", emoji: "🤝", short: "Helping and looking after others, even when nobody asked." },
  { key: "social-intelligence", name: "Social Intelligence", virtue: "Humanity", emoji: "🫂", short: "Reading how people feel and knowing what to do in the moment." },
  // Justice
  { key: "teamwork", name: "Teamwork", virtue: "Justice", emoji: "🧩", short: "Pulling your weight for the group and being loyal to it." },
  { key: "fairness", name: "Fairness", virtue: "Justice", emoji: "⚱️", short: "Treating everyone equally and giving people a fair go." },
  { key: "leadership", name: "Leadership", virtue: "Justice", emoji: "🚩", short: "Helping a group get organised and get things done together." },
  // Temperance
  { key: "forgiveness", name: "Forgiveness", virtue: "Temperance", emoji: "🕊️", short: "Letting go of grudges and giving people second chances." },
  { key: "humility", name: "Humility", virtue: "Temperance", emoji: "🌱", short: "Letting your actions speak; not needing to be the centre of attention." },
  { key: "prudence", name: "Prudence", virtue: "Temperance", emoji: "🛡️", short: "Thinking before you act; not doing things you'll regret." },
  { key: "self-regulation", name: "Self-Regulation", virtue: "Temperance", emoji: "🧘", short: "Managing your feelings, habits, and impulses." },
  // Transcendence
  { key: "appreciation", name: "Appreciation of Beauty", virtue: "Transcendence", emoji: "🌅", short: "Noticing and being moved by beauty, skill, and excellence around you." },
  { key: "gratitude", name: "Gratitude", virtue: "Transcendence", emoji: "🙏", short: "Noticing the good things and being thankful for them." },
  { key: "hope", name: "Hope", virtue: "Transcendence", emoji: "🌈", short: "Expecting the best and believing you can make it happen." },
  { key: "humor", name: "Humour", virtue: "Transcendence", emoji: "😄", short: "Bringing lightness and laughter; helping people smile." },
  { key: "spirituality", name: "Spirituality", virtue: "Transcendence", emoji: "✨", short: "Having beliefs about meaning and purpose that give life shape." },
];

export const STRENGTH_BY_KEY: Record<string, CharacterStrength> = Object.fromEntries(
  VIA_STRENGTHS.map((s) => [s.key, s])
);

export function strengthName(key: string): string {
  return STRENGTH_BY_KEY[key]?.name ?? key;
}

// ─── The 12-scenario assessment ───────────────────────────────────────────────
// Each scenario has 4 options mapped to 4 distinct strengths. Across all 12,
// every strength appears exactly twice (12 × 4 = 48 slots ÷ 24 = 2 each).

export interface StrengthScenario {
  scenario: string;
  options: { text: string; strength: string }[];
}

export const STRENGTH_SCENARIOS: StrengthScenario[] = [
  {
    scenario:
      "A group project lands in your lap and it's a mess — no plan, deadline looming, everyone talking over each other. What are you most likely to do?",
    options: [
      { text: "Take charge and get everyone organised", strength: "leadership" },
      { text: "Come up with a totally different way to tackle it", strength: "creativity" },
      { text: "Just put my head down and grind through my part", strength: "perseverance" },
      { text: "Make sure the quiet people get a fair say", strength: "fairness" },
    ],
  },
  {
    scenario:
      "It's a free weekend with zero plans. Which version of the day sounds most like you?",
    options: [
      { text: "Down a rabbit hole learning something new", strength: "love-of-learning" },
      { text: "Making or building something", strength: "creativity" },
      { text: "Hanging out one-on-one with someone I'm close to", strength: "love" },
      { text: "Outside, active, chasing a bit of a thrill", strength: "zest" },
    ],
  },
  {
    scenario:
      "A friend messages you at midnight, clearly falling apart about something. What comes most naturally?",
    options: [
      { text: "I just get it — I can feel what they're feeling", strength: "social-intelligence" },
      { text: "I'd rather just be there for them than try to fix it", strength: "love" },
      { text: "I remind them it won't always feel this bad", strength: "hope" },
      { text: "I help them see the situation more clearly", strength: "perspective" },
    ],
  },
  {
    scenario:
      "You get away with something — a teacher forgot to collect the homework you didn't do. What actually happens in your head?",
    options: [
      { text: "I'd probably own up anyway — feels wrong not to", strength: "honesty" },
      { text: "I think ahead about how this could bite me later", strength: "prudence" },
      { text: "I feel weirdly grateful and don't push my luck", strength: "gratitude" },
      { text: "I quietly get the work done anyway", strength: "self-regulation" },
    ],
  },
  {
    scenario:
      "Someone in your group did something that really annoyed you last week. Today they act like nothing happened. You're most likely to…",
    options: [
      { text: "Let it go — holding grudges isn't worth it", strength: "forgiveness" },
      { text: "Keep the team working smoothly despite it", strength: "teamwork" },
      { text: "Stay calm and not let it get to me", strength: "self-regulation" },
      { text: "Try to understand why they did it", strength: "judgment" },
    ],
  },
  {
    scenario:
      "A new kid joins and clearly knows no one. Across the week, what's the move that feels most like you?",
    options: [
      { text: "Go over and make them feel welcome", strength: "kindness" },
      { text: "Read whether they want space or company first", strength: "social-intelligence" },
      { text: "Pull them into the group so they belong", strength: "teamwork" },
      { text: "Crack a joke to break the ice", strength: "humor" },
    ],
  },
  {
    scenario:
      "There's a chance to try something new in front of people, and you might be genuinely bad at it. What wins?",
    options: [
      { text: "I go for it even though it's nerve-wracking", strength: "bravery" },
      { text: "I'm too curious about it not to try", strength: "curiosity" },
      { text: "I throw myself in fully, all-in", strength: "zest" },
      { text: "I weigh it up carefully before committing", strength: "prudence" },
    ],
  },
  {
    scenario:
      "You watch someone do something incredible — a performance, a play, a piece of art, a comeback. What's your reaction?",
    options: [
      { text: "I get chills — real skill and beauty move me", strength: "appreciation" },
      { text: "I want to learn how they did it", strength: "love-of-learning" },
      { text: "I hype them up and celebrate them", strength: "kindness" },
      { text: "It makes me feel part of something bigger than myself", strength: "spirituality" },
    ],
  },
  {
    scenario:
      "You see someone being treated unfairly — left out, blamed for something, picked on. What's your first instinct?",
    options: [
      { text: "Step in even if it's risky", strength: "bravery" },
      { text: "It bothers me deeply — everyone deserves fair treatment", strength: "fairness" },
      { text: "Afterwards I'd honestly name that it wasn't right", strength: "honesty" },
      { text: "Speak up and rally others to do something", strength: "leadership" },
    ],
  },
  {
    scenario:
      "You've set yourself a goal that's going to take months of unglamorous effort. Be honest about what you're like…",
    options: [
      { text: "I keep showing up long after the excitement fades", strength: "perseverance" },
      { text: "I forgive my own slip-ups and just keep going", strength: "forgiveness" },
      { text: "I stay positive that it'll work out", strength: "hope" },
      { text: "I don't need credit — I just want it done well", strength: "humility" },
    ],
  },
  {
    scenario:
      "Things have been genuinely good lately. When you notice that, what do you do with it?",
    options: [
      { text: "I actually stop and feel thankful for it", strength: "gratitude" },
      { text: "I think about what it all means, bigger picture", strength: "spirituality" },
      { text: "I soak up the little beautiful moments", strength: "appreciation" },
      { text: "I share the good mood around and make people laugh", strength: "humor" },
    ],
  },
  {
    scenario:
      "A big claim is going round your group chat and everyone's just believing it. What's your move?",
    options: [
      { text: "I question it and check if it's actually true", strength: "judgment" },
      { text: "I get curious and go find out for myself", strength: "curiosity" },
      { text: "I stay humble about what I actually know for sure", strength: "humility" },
      { text: "I try to see it from the other person's angle", strength: "perspective" },
    ],
  },
];

// Sanity guard (dev only): every strength should appear exactly twice.
if (process.env.NODE_ENV !== "production") {
  const counts: Record<string, number> = {};
  for (const sc of STRENGTH_SCENARIOS)
    for (const o of sc.options) counts[o.strength] = (counts[o.strength] || 0) + 1;
  const off = VIA_STRENGTHS.filter((s) => counts[s.key] !== 2).map((s) => s.key);
  if (off.length) console.warn("[strengths] uneven scenario coverage:", off, counts);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface StrengthResult {
  scores: Record<string, number>;
  ranking: string[]; // high → low, all 24 keys
}

/**
 * Score = (2 × times chosen "most like me") − (1 × times chosen "least like me").
 * Ranked high→low; ties broken by canonical VIA order so results are stable.
 */
export function scoreAssessment(most: string[], least: string[]): StrengthResult {
  const scores: Record<string, number> = {};
  for (const s of VIA_STRENGTHS) scores[s.key] = 0;
  for (const k of most) if (k in scores) scores[k] += 2;
  for (const k of least) if (k in scores) scores[k] -= 1;

  const order = new Map(VIA_STRENGTHS.map((s, i) => [s.key, i]));
  const ranking = [...VIA_STRENGTHS.map((s) => s.key)].sort((a, b) => {
    const diff = scores[b] - scores[a];
    return diff !== 0 ? diff : (order.get(a)! - order.get(b)!);
  });
  return { scores, ranking };
}

export function topStrengths(ranking: string[], n = 5): string[] {
  return ranking.slice(0, n);
}

export function bottomStrengths(ranking: string[], n = 5): string[] {
  return ranking.slice(-n).reverse(); // lowest first
}
