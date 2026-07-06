// ─── Moral compass: how you tend to decide ────────────────────────────────────
// Eight forced-choice dilemmas diagnosing a student's dominant moral
// decision-making pattern. Four styles, loosely drawn from moral foundations
// and ethics-of-care research, worded for teenagers. Every scenario offers all
// four styles; picks are tallied and the top style becomes the profile.

export type MoralStyle = "care" | "fairness" | "loyalty" | "principle";

export interface MoralStyleInfo {
  key: MoralStyle;
  name: string;
  emoji: string;
  /** How this style decides */
  how: string;
  /** Its genuine superpower */
  strength: string;
  /** Golden-mean warning — what overuse looks like */
  watchOut: string;
}

export const MORAL_STYLES: Record<MoralStyle, MoralStyleInfo> = {
  care: {
    key: "care",
    name: "Care-led",
    emoji: "💗",
    how: "You decide by asking who could get hurt and who needs protecting. People come before rules.",
    strength: "You notice the human cost of decisions that others treat as abstract. People feel safe around you.",
    watchOut: "Watch that protecting everyone's feelings doesn't stop hard-but-necessary truths being said — and that you don't carry everyone else's weight.",
  },
  fairness: {
    key: "fairness",
    name: "Fairness-led",
    emoji: "⚖️",
    how: "You decide by asking what's equal and what everyone would accept if the roles were reversed.",
    strength: "You're the one who keeps things honest when a group starts bending rules for its favourites.",
    watchOut: "Watch that the scoreboard doesn't become rigid — sometimes people need grace more than they need exactly equal treatment.",
  },
  loyalty: {
    key: "loyalty",
    name: "Loyalty-led",
    emoji: "🤝",
    how: "You decide by standing with your people. Being someone others can count on is non-negotiable for you.",
    strength: "You're the friend people want in their corner — steady when it costs you something.",
    watchOut: "Watch that standing by your people doesn't slide into defending things you know are wrong. Real loyalty sometimes says the hard thing.",
  },
  principle: {
    key: "principle",
    name: "Principle-led",
    emoji: "🧭",
    how: "You decide by rules you hold no matter the situation — truth, duty, right and wrong.",
    strength: "People know exactly where you stand, and your consistency earns a rare kind of trust.",
    watchOut: "Watch that the rule doesn't blind you to the human in front of you — principles serve people, not the other way round.",
  },
};

export interface MoralScenario {
  scenario: string;
  options: { text: string; style: MoralStyle }[];
}

// Each scenario carries one option per style, in shuffled display order.
export const MORAL_SCENARIOS: MoralScenario[] = [
  {
    scenario:
      "Your friend cheated on a test — and the teacher just blamed the wrong kid for it. What's your gut move?",
    options: [
      { text: "The wrong kid can't take the fall. I'd speak up.", style: "fairness" },
      { text: "Talk to my friend privately — they need to fix this themselves", style: "care" },
      { text: "Cheating's wrong and the truth matters. I'd tell it straight.", style: "principle" },
      { text: "I'd protect my friend — I'm not throwing them under the bus", style: "loyalty" },
    ],
  },
  {
    scenario:
      "The group chat is roasting someone who isn't there — and it's getting nasty. You…",
    options: [
      { text: "Say it to the chat: they can't even defend themselves", style: "fairness" },
      { text: "Change the subject, then check on the person quietly", style: "care" },
      { text: "It's my group and I don't police banter — I stay out of it", style: "loyalty" },
      { text: "Leave the chat. I won't be part of it, full stop.", style: "principle" },
    ],
  },
  {
    scenario:
      "You're captain and must drop one player for the final: your best mate (out of form) or a newer kid (playing better).",
    options: [
      { text: "My mate stays. Years of showing up counts for something.", style: "loyalty" },
      { text: "Form picks the team — same rule for everyone, mate or not", style: "fairness" },
      { text: "The selection criteria exist for a reason. Follow them.", style: "principle" },
      { text: "Talk to both first — how I do this matters more than the call", style: "care" },
    ],
  },
  {
    scenario:
      "You find $50 near the canteen. Earlier you saw a younger kid in tears about losing their money. But your best mate, standing right there, is broke and hungry.",
    options: [
      { text: "Find the younger kid — that money is probably theirs and they're gutted", style: "care" },
      { text: "Hand it to the office. Not mine, not my call.", style: "principle" },
      { text: "Ask around properly so it gets back to whoever actually lost it", style: "fairness" },
      { text: "Honestly? My mate eats today. Sort the rest after.", style: "loyalty" },
    ],
  },
  {
    scenario:
      "A teacher clearly marks their favourites easier. It's cost one quiet kid in particular. You…",
    options: [
      { text: "Collect the evidence and raise the pattern — favourites shouldn't exist", style: "fairness" },
      { text: "Back the quiet kid — help them feel less alone in it first", style: "care" },
      { text: "Take it through the proper channels, calmly and by the book", style: "principle" },
      { text: "Warn my friends how this teacher works so they don't get burned", style: "loyalty" },
    ],
  },
  {
    scenario:
      "Your team wins the game — because the ref missed an obvious foul by your side. Afterwards…",
    options: [
      { text: "I'd own it — say it out loud, even offer the replay", style: "principle" },
      { text: "A win's a win and this is my team. We take it.", style: "loyalty" },
      { text: "Check the kid who got fouled is actually okay", style: "care" },
      { text: "It should've been called. I'd want it called against us too.", style: "fairness" },
    ],
  },
  {
    scenario:
      "Your friend's new relationship is clearly bad for them. Everyone sees it. They're happy — for now. You…",
    options: [
      { text: "Tell them gently what I see — because I care what happens to them", style: "care" },
      { text: "Back their choice in public no matter what I think privately", style: "loyalty" },
      { text: "Say the truth once, clearly, then respect their call", style: "principle" },
      { text: "Hear their partner's side properly before judging anyone", style: "fairness" },
    ],
  },
  {
    scenario:
      "Someone offers you photos of tomorrow's exam. Nobody would ever know. You…",
    options: [
      { text: "Refuse — it's cheating, and that's the whole answer", style: "principle" },
      { text: "Refuse — everyone else studied for real; it's not fair on them", style: "fairness" },
      { text: "Refuse, but I'm not dobbing in the mate who offered", style: "loyalty" },
      { text: "Refuse — and ask them what's going on that they'd risk this", style: "care" },
    ],
  },
];

export interface MoralResult {
  scores: Record<MoralStyle, number>;
  primary: MoralStyle;
  /** Close second, when within 1 pick of the primary */
  secondary: MoralStyle | null;
}

const STYLE_ORDER: MoralStyle[] = ["care", "fairness", "loyalty", "principle"];

export function scoreMoral(picks: MoralStyle[]): MoralResult {
  const scores: Record<MoralStyle, number> = {
    care: 0,
    fairness: 0,
    loyalty: 0,
    principle: 0,
  };
  for (const p of picks) scores[p] += 1;
  const sorted = [...STYLE_ORDER].sort(
    (a, b) => scores[b] - scores[a] || STYLE_ORDER.indexOf(a) - STYLE_ORDER.indexOf(b)
  );
  const primary = sorted[0];
  const secondary =
    scores[sorted[1]] > 0 && scores[primary] - scores[sorted[1]] <= 1
      ? sorted[1]
      : null;
  return { scores, primary, secondary };
}
