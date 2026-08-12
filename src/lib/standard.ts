// ─── The Standard: three questions you hold yourself to ───────────────────────
// Everything else in the app looks inward — what my strengths are, how I decide,
// what my patterns look like. These three look outward: what am I actually
// putting into the rooms I'm in? They aren't scored and they aren't a test. The
// student answers the same three questions again and again over months, and the
// value is in reading their own answers back.

export type StandardKey = "safer" | "value" | "trust";

export interface StandardQuestion {
  key: StandardKey;
  /** The question itself — asked verbatim, every time */
  question: string;
  /** Short label for history rows and chips */
  short: string;
  emoji: string;
  /** What the question is actually asking, in plain English */
  meaning: string;
  /** Concrete openers — a blank box is the enemy of an honest answer */
  examples: string[];
  /**
   * The honest counterweight. Asked on its own, each question invites a
   * flattering answer; this is the version that keeps it a mirror.
   */
  harder: string;
  placeholder: string;
}

export const STANDARD_QUESTIONS: StandardQuestion[] = [
  {
    key: "safer",
    question: "How am I making others feel safer and stronger?",
    short: "Safer and stronger",
    emoji: "🛡️",
    meaning:
      "This isn't asking whether you're nice. It's asking whether people leave a conversation with you feeling steadier than they arrived — and more capable, not more dependent on you.",
    examples: [
      "Someone was on their own and I made room without making it a thing",
      "I backed someone in a group chat when staying quiet was easier",
      "I told a mate something true that was hard to hear — and stayed kind doing it",
      "I noticed someone was off and actually asked",
    ],
    harder:
      "Now the harder half: who feels less safe around me? Everyone has someone. Naming them honestly is the whole point of this question.",
    placeholder:
      "Think of one real person and one real moment this week. What did you actually do?",
  },
  {
    key: "value",
    question: "How am I adding more value than I am consuming?",
    short: "Value added",
    emoji: "⚖️",
    meaning:
      "Every room you're in — a family, a team, a classroom, a group chat — takes effort to keep running. Someone is always doing that work. This asks whether you're one of them, or whether you're living off someone else's.",
    examples: [
      "I cleaned up something I didn't make a mess of",
      "I helped someone catch up without being asked or thanked",
      "I actually prepared, instead of coasting on other people's work",
      "I put something into the group chat instead of just taking from it",
    ],
    harder:
      "And the other side: where am I coasting? Which room am I currently taking more from than I put in?",
    placeholder:
      "Pick one room you're in. What did you put in this week, and what did you take out?",
  },
  {
    key: "trust",
    question: "How am I being someone people can trust?",
    short: "Trustworthy",
    emoji: "🤝",
    meaning:
      "Trust isn't built in big dramatic moments. It's built in whether your word matches what you do when nobody is checking, and whether you're the same person in every room.",
    examples: [
      "I did the thing I said I'd do, on time, without a reminder",
      "Something private stayed private, even when repeating it would've been interesting",
      "I was the same person in two very different rooms this week",
      "I owned a mistake before anyone found it",
    ],
    harder:
      "The honest check: where did my word and my actions come apart recently? Small gaps count — they're the ones that add up.",
    placeholder:
      "Where did you keep your word this week? Where did it slip? Both are worth writing.",
  },
];

export const STANDARD_BY_KEY: Record<StandardKey, StandardQuestion> =
  Object.fromEntries(STANDARD_QUESTIONS.map((q) => [q.key, q])) as Record<
    StandardKey,
    StandardQuestion
  >;

export type StandardAnswers = Partial<Record<StandardKey, string>>;

export interface StandardCheckin {
  id: string;
  answers: StandardAnswers;
  created_at: string;
  updated_at: string;
}

/** Answers are free text — a check-in counts once any one question is answered. */
export function answeredCount(answers: StandardAnswers): number {
  return STANDARD_QUESTIONS.filter((q) => (answers[q.key] || "").trim()).length;
}

export function isComplete(answers: StandardAnswers): boolean {
  return answeredCount(answers) === STANDARD_QUESTIONS.length;
}

/** Strips empties so a partial check-in doesn't store blank keys. */
export function cleanAnswers(answers: StandardAnswers): StandardAnswers {
  const out: StandardAnswers = {};
  for (const q of STANDARD_QUESTIONS) {
    const v = (answers[q.key] || "").trim();
    if (v) out[q.key] = v;
  }
  return out;
}

/**
 * Coerces whatever came back from the `answers` jsonb column into known keys.
 * Anything unrecognised is dropped rather than rendered.
 */
export function parseAnswers(raw: unknown): StandardAnswers {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  const out: StandardAnswers = {};
  for (const q of STANDARD_QUESTIONS) {
    const v = src[q.key];
    if (typeof v === "string" && v.trim()) out[q.key] = v.trim();
  }
  return out;
}

/** Readable copy written to the journal so check-ins show up alongside everything else. */
export function standardToResponse(answers: StandardAnswers): string {
  return STANDARD_QUESTIONS.filter((q) => answers[q.key])
    .map((q) => `${q.question}\n${answers[q.key]}`)
    .join("\n\n");
}

/**
 * Gentle cadence, never a streak. The app's stated position is "a record, not a
 * scoreboard", so a gap produces an invitation — never a warning or a lost run.
 */
export function cadenceNote(lastCheckinIso: string | null): string | null {
  if (!lastCheckinIso) return null;
  const days = Math.floor(
    (Date.now() - new Date(lastCheckinIso).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 2) return null;
  if (days < 7) return "It's been a few days — worth another honest look?";
  if (days < 30) return `It's been ${Math.floor(days / 7)} week${days < 14 ? "" : "s"}. Your answers change more than you'd think.`;
  return "It's been a while. No catching up needed — just answer them as they are today.";
}
