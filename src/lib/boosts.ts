// ─── Boosts: guidance for building specific character qualities ───────────────
// Short, practical guides for the qualities the programme promises to develop:
// courage, vulnerability, resilience, self-belief, self-efficacy, empathy,
// compassion, kindness. Exercises adapted from the character-strengths
// intervention literature (Niemiec, Character Strengths Interventions).

export interface Boost {
  key: string;
  name: string;
  emoji: string;
  /** What it actually is — myth-busting, teen-voiced */
  what: string;
  /** One-line "what it means in practice" (used in the growth plan) */
  inPractice: string;
  /** One concrete exercise to build it this week */
  exercise: string;
}

export const BOOSTS: Boost[] = [
  {
    key: "courage",
    inPractice: "Doing what is right even when it feels uncomfortable.",
    name: "Courage",
    emoji: "🦁",
    what: "Courage isn't the absence of fear — it's acting while the fear is still there. People who look fearless are usually just practised: they've done the scary thing enough times that their body trusts them to survive it.",
    exercise: "Pick one thing you've been avoiding because of what people might think. Name the fear in one sentence, name what avoiding it costs you, then do the 10-second version of it (send the message, raise the hand, sign up). Courage grows by reps, not by waiting to feel ready.",
  },
  {
    key: "vulnerability",
    inPractice: "Being honest about feelings, mistakes, needs and hopes.",
    name: "Vulnerability",
    emoji: "🫶",
    what: "Vulnerability is letting yourself be seen without armour — saying the true thing when you can't control how it lands. It feels like weakness from the inside and looks like courage from the outside. It's also the only door to being genuinely known.",
    exercise: "Choose one safe person. Share one real thing this week you'd normally keep behind the mask — a worry, an interest, something you're proud of but never say. Notice that the connection afterwards is worth more than the ten seconds of exposure cost.",
  },
  {
    key: "resilience",
    inPractice: "Recovering after setbacks and continuing with purpose.",
    name: "Resilience",
    emoji: "🧗",
    what: "Resilience isn't bouncing back instantly or pretending it doesn't hurt. It's feeling the hit fully, and then finding the next move anyway. It's a skill you build from evidence — every hard thing you've already survived is proof in the bank.",
    exercise: "Write down one hard thing you've already come through. What was the one thing that actually got you through it — a person, a habit, a way of thinking? That's your comeback tool. Name it, so next time you can reach for it on purpose.",
  },
  {
    key: "self-belief",
    inPractice: "Trusting that you have something valuable to offer.",
    name: "Self-belief",
    emoji: "🌟",
    what: "Confidence isn't a personality type — it follows evidence. People who believe in themselves are usually just people who keep track of their own wins while everyone else forgets theirs.",
    exercise: "Start a wins log. Three times a week, write one small thing you did well — held your temper, spoke up, finished something. Before your next hard moment, read the log. You're not hyping yourself up; you're reviewing the data.",
  },
  {
    key: "self-efficacy",
    inPractice: "Believing your actions can make a difference.",
    name: "Self-efficacy",
    emoji: "💪",
    what: "Self-efficacy is the belief that your actions actually change outcomes — that effort in means results out. Psychologists find it's built mostly one way: mastery experiences. Small, real wins at things that used to be hard.",
    exercise: "Pick one skill you care about. Do a focused 15-minute rep of it four times this week — same skill, four sessions. On day seven, compare where you started. The point isn't the skill. It's catching yourself getting better because you chose to.",
  },
  {
    key: "empathy",
    inPractice: "Understanding how others may feel.",
    name: "Empathy",
    emoji: "🫂",
    what: "Empathy is feeling with someone — not fixing them, not relating everything back to your own story. Most people listen to reply. Empathy is listening to understand, and letting the other person feel understood before anything else happens.",
    exercise: "In one conversation this week, give zero advice. Only ask questions and reflect back what you hear ('that sounds exhausting', 'so you felt left out?'). Watch what happens when someone feels heard instead of managed.",
  },
  {
    key: "compassion",
    inPractice: "Caring about another person's struggle — and acting on it.",
    name: "Compassion",
    emoji: "💗",
    what: "Compassion is empathy plus action — being moved by someone's struggle and doing something about it. And it includes you: self-compassion isn't letting yourself off the hook, it's talking to yourself like someone worth helping.",
    exercise: "Twice this week, when you catch the harsh inner voice ('I'm so stupid', 'I always ruin it'), stop and say exactly what you'd say to your best mate in the same situation. Same words. Out loud if you can. It feels weird and it works.",
  },
  {
    key: "kindness",
    inPractice: "Taking action to support, include or encourage others.",
    name: "Kindness",
    emoji: "🤝",
    what: "Kindness is deliberate warmth — strongest when it costs you something and nobody's watching. Research is blunt about this one: doing kind things reliably raises the mood of the person doing them, not just the receiver.",
    exercise: "One unrequested act of kindness a day for five days — the text you didn't have to send, the seat you gave up, the compliment said out loud. Anonymous ones count double. At the end of the five days, notice who felt better: them or you.",
  },
];

export const BOOST_BY_KEY: Record<string, Boost> = Object.fromEntries(
  BOOSTS.map((b) => [b.key, b])
);

// Where a VIA strength has a natural boost, link them (used from growth edges).
export const STRENGTH_TO_BOOST: Record<string, string> = {
  bravery: "courage",
  perseverance: "resilience",
  hope: "self-belief",
  kindness: "kindness",
  love: "vulnerability",
  "social-intelligence": "empathy",
  forgiveness: "compassion",
  "self-regulation": "self-efficacy",
};

// ─── Strength-in-action: one concrete weekly practice per VIA strength ────────
// The classic evidence-based intervention is "use a signature strength in a new
// way"; these give every strength a ready-made new way.

export const STRENGTH_ACTIONS: Record<string, string> = {
  creativity: "Make one thing this week that didn't exist before — a meme, a playlist, a design, a fix for something annoying.",
  curiosity: "Ask one genuine question a day that you don't know the answer to — then actually chase one of them down.",
  judgment: "Pick one opinion you hold strongly and argue the other side for two minutes — out loud or on paper.",
  "love-of-learning": "Spend 20 minutes, twice this week, learning something nobody assigned you.",
  perspective: "Next time a friend vents, ask 'what matters most here?' before giving any advice.",
  bravery: "Do one thing this week you'd normally avoid because of what people might think.",
  perseverance: "Pick the task you keep dodging and do just the first 10 minutes of it today. Repeat tomorrow.",
  honesty: "Say one true thing this week that you'd usually soften or skip entirely.",
  zest: "Do one ordinary thing at full energy — walk faster, sing louder, actually celebrate the small win.",
  love: "Tell one person, specifically, what they mean to you. Not just 'thanks' — the real sentence.",
  kindness: "Do one unrequested favour a day. Small counts. Anonymous counts double.",
  "social-intelligence": "Once a day, silently name the feeling you think someone's having — then check if you were right.",
  teamwork: "In your next group task, take the job nobody wants — without announcing it.",
  fairness: "Notice one situation this week where someone's being left out, and even it up.",
  leadership: "Organise one small thing this week — the study session, the plan, the game. Start to finish.",
  forgiveness: "Pick one small grudge and consciously put it down. Write one line about why it's not worth carrying.",
  humility: "Let someone else take the credit once this week. Watch what it does — to them and to you.",
  prudence: "Before one decision this week, wait 24 hours. See if the answer changes.",
  "self-regulation": "Pick one trigger — an app, a snack, a comeback — and delay it 10 minutes every time it calls.",
  appreciation: "Once a day, stop for one genuinely beautiful or skilful thing. Photograph it or write one line.",
  gratitude: "Three nights this week, write down three specific good things from the day. Specific beats big.",
  hope: "Write the best realistic version of your next month — then one concrete step toward it this week.",
  humor: "Find and share one thing a day that makes someone actually laugh out loud.",
  spirituality: "Take 10 quiet minutes this week — no phone — to ask: what is this week actually for?",
};
