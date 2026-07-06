// ─── Habit Check: how you currently respond in real situations ────────────────
// Character isn't just what you believe — it's what you repeatedly practise.
// Eight honest self-audit questions surface current patterns and point each
// "work on" pattern at the quality (Boost) that builds it.

export type HabitAnswer = "usually" | "sometimes" | "rarely";

export interface HabitQuestion {
  id: string;
  question: string;
  /** Short label used in results ("Standing up for others") */
  label: string;
  /** true = answering "usually" is the growth signal (the habit works against you) */
  reverse: boolean;
  /** Boost key suggested when this shows up as a growth pattern */
  quality: string;
}

export const HABIT_QUESTIONS: HabitQuestion[] = [
  {
    id: "hard-convos",
    question: "Do you avoid difficult conversations?",
    label: "Facing hard conversations",
    reverse: true,
    quality: "courage",
  },
  {
    id: "stand-up",
    question: "Do you stand up for others?",
    label: "Standing up for others",
    reverse: false,
    quality: "courage",
  },
  {
    id: "give-up",
    question: "Do you give up quickly when something gets hard?",
    label: "Sticking with hard things",
    reverse: true,
    quality: "resilience",
  },
  {
    id: "different-person",
    question: "Do you act like a different person around different groups?",
    label: "Being the same person in every room",
    reverse: true,
    quality: "vulnerability",
  },
  {
    id: "own-mistakes",
    question: "Do you own it when you make a mistake?",
    label: "Owning mistakes",
    reverse: false,
    quality: "vulnerability",
  },
  {
    id: "free-kindness",
    question: "Do you show kindness when there's nothing in it for you?",
    label: "Kindness with no reward",
    reverse: false,
    quality: "kindness",
  },
  {
    id: "costly-values",
    question: "Do you follow your values even when it costs you something?",
    label: "Living your values under pressure",
    reverse: false,
    quality: "self-belief",
  },
  {
    id: "read-room",
    question: "Do you notice how the people around you are actually feeling?",
    label: "Reading how others feel",
    reverse: false,
    quality: "empathy",
  },
];

export interface HabitResult {
  /** Patterns already working for the student (short labels) */
  keeps: string[];
  /** Patterns to work on, each pointing at a quality to build */
  grows: { label: string; quality: string }[];
  /** "Sometimes" answers — soft spots worth watching */
  sometimes: string[];
}

export function scoreHabits(answers: Record<string, HabitAnswer>): HabitResult {
  const keeps: string[] = [];
  const grows: { label: string; quality: string }[] = [];
  const sometimes: string[] = [];
  for (const q of HABIT_QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    if (a === "sometimes") {
      sometimes.push(q.label);
      continue;
    }
    const isKeep = q.reverse ? a === "rarely" : a === "usually";
    if (isKeep) keeps.push(q.label);
    else grows.push({ label: q.label, quality: q.quality });
  }
  return { keeps, grows, sometimes };
}

// ── Journal-entry (de)serialisation — the audit is stored as a readable
// journal entry (same pattern as the values clarifier), no schema change.

export function habitsToResponse(
  answers: Record<string, HabitAnswer>,
  result: HabitResult
): string {
  const lines: string[] = [];
  if (result.keeps.length) lines.push(`Working for me: ${result.keeps.join("; ")}`);
  if (result.grows.length)
    lines.push(
      `Working on: ${result.grows.map((g) => `${g.label} (${g.quality})`).join("; ")}`
    );
  if (result.sometimes.length) lines.push(`Sometimes: ${result.sometimes.join("; ")}`);
  lines.push(
    `answers:${HABIT_QUESTIONS.map((q) => `${q.id}=${answers[q.id] ?? ""}`).join(",")}`
  );
  return lines.join("\n");
}

export function responseToHabits(
  response: string
): { answers: Record<string, HabitAnswer>; result: HabitResult } | null {
  const ansLine = response
    .split("\n")
    .find((l) => l.startsWith("answers:"));
  if (!ansLine) return null;
  const answers: Record<string, HabitAnswer> = {};
  for (const pair of ansLine.slice("answers:".length).split(",")) {
    const [id, a] = pair.split("=");
    if (id && (a === "usually" || a === "sometimes" || a === "rarely")) {
      answers[id] = a;
    }
  }
  if (Object.keys(answers).length === 0) return null;
  return { answers, result: scoreHabits(answers) };
}
