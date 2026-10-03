import { hasLeftSchool, type LifeStage } from "./lifeStage";

// ─── Your next chapter ────────────────────────────────────────────────────────
// For a Year 12, or someone a year or two out of school, the live identity
// question is concrete: uni or TAFE, which course, which job, whether to move
// out. The rest of the app kept saying "not a job"; pathways and goals sat on
// the Me tab outside any guided flow, and nothing helped a student weigh the
// options or go and find out.
//
// This is that guided flow, built from the possible-selves research:
//   - picture the version of next year you're hoping for, and the version
//     you'd rather avoid. Holding both, rather than only the hoped-for one,
//     is what predicts students actually moving (Oyserman & Markus, 1990);
//   - attach a concrete step to each. A future self with no strategy linked
//     to it barely changes behaviour (Oyserman, Bybee & Terry, 2006);
//   - go and gather information from someone already doing it. Committing
//     to a path without exploring it is the premature commitment identity
//     research calls foreclosure.
//
// Saved as one journal entry of labelled lines, so it reads properly in the
// journal and needs no new table. The conversation's debrief is added to the
// same entry when it has happened.

export const NEXT_CHAPTER_ACTIVITY_ID = "next-chapter";

const SCHOOL_OPTIONS = [
  "Choosing subjects for next year",
  "Uni",
  "TAFE",
  "An apprenticeship or traineeship",
  "Straight into work",
  "A gap year",
  "No idea yet, honestly",
];

const LEFT_SCHOOL_OPTIONS = [
  "Starting or changing a course",
  "A first proper job",
  "Changing jobs",
  "An apprenticeship or traineeship",
  "Moving out",
  "Time off or travel",
  "No idea yet, honestly",
];

export function optionsFor(stage: LifeStage): string[] {
  if (hasLeftSchool(stage)) return LEFT_SCHOOL_OPTIONS;
  // Year 12s have already chosen their last subjects.
  return stage === "senior" ? SCHOOL_OPTIONS.filter((o) => !o.startsWith("Choosing subjects")) : SCHOOL_OPTIONS;
}

export const OPTIONS_MAX = 3;

export const TALK_QUESTIONS = [
  "What does an ordinary day actually look like?",
  "What surprised you once you started?",
  "What do you wish you'd known before you chose it?",
  "What's the hard part nobody mentions?",
  "What kind of person does well at it?",
  "If you were me, what would you do in the next six months?",
];

export const QUESTIONS_MAX = 3;

export const WHO_SUGGESTIONS = [
  "My school's careers adviser",
  "Someone at an open day or info night",
  "A family friend who does it",
  "Someone a year or two ahead of me",
];

export const TALK_BY = [
  { days: 7, label: "In the next week" },
  { days: 14, label: "In the next fortnight" },
  { days: 30, label: "This month" },
];

export const OUTCOMES = ["More sure", "Less sure", "Changed my mind", "About the same"];

export interface NextChapter {
  options: string[];
  hoping: string;
  firstStep: string;
  avoiding: string;
  headOff: string;
  who: string;
  questions: string[];
  /** ISO date (yyyy-mm-dd) the conversation is planned by */
  talkBy: string;
  foundOut: string;
  leftMe: string;
}

export const EMPTY_NEXT_CHAPTER: NextChapter = {
  options: [],
  hoping: "",
  firstStep: "",
  avoiding: "",
  headOff: "",
  who: "",
  questions: [],
  talkBy: "",
  foundOut: "",
  leftMe: "",
};

/** The label each field is saved under; the order is the order they're written. */
const FIELDS: { key: keyof NextChapter; label: string; list?: boolean }[] = [
  { key: "options", label: "On the table", list: true },
  { key: "hoping", label: "Hoping for" },
  { key: "firstStep", label: "First step" },
  { key: "avoiding", label: "Rather avoid" },
  { key: "headOff", label: "Heading it off" },
  { key: "who", label: "Talking to" },
  { key: "questions", label: "Asking", list: true },
  { key: "talkBy", label: "Talk by" },
  { key: "foundOut", label: "Found out" },
  { key: "leftMe", label: "Left me" },
];

/** One line per field; free text is flattened so each field stays on its line. */
export function nextChapterToText(n: NextChapter): string {
  const flat = (s: string) => s.replace(/\s*\n+\s*/g, " ").trim();
  return FIELDS.flatMap(({ key, label, list }) => {
    const value = list
      ? (n[key] as string[]).map((v) => flat(v).replace(/;/g, ",")).filter(Boolean).join("; ")
      : flat(n[key] as string);
    return value ? [`${label}: ${value}`] : [];
  }).join("\n");
}

export function parseNextChapter(text: string | null | undefined): NextChapter {
  const n: NextChapter = { ...EMPTY_NEXT_CHAPTER, options: [], questions: [] };
  if (!text) return n;
  const fields = n as unknown as Record<keyof NextChapter, string | string[]>;
  for (const line of text.split("\n")) {
    const field = FIELDS.find(({ label }) => line.startsWith(`${label}:`));
    if (!field) continue;
    const value = line.slice(field.label.length + 1).trim();
    fields[field.key] = field.list
      ? value.split(";").map((s) => s.trim()).filter(Boolean)
      : value;
  }
  return n;
}

/** Everything the plan needs before it can be saved. The debrief comes later. */
export function planComplete(n: NextChapter): boolean {
  const filled = (s: string) => s.trim().length >= 3;
  return (
    n.options.length > 0 &&
    filled(n.hoping) &&
    filled(n.firstStep) &&
    filled(n.avoiding) &&
    filled(n.headOff) &&
    filled(n.who) &&
    n.questions.length > 0 &&
    !!n.talkBy
  );
}

/** yyyy-mm-dd in local time (toISOString would give tomorrow's date some evenings). */
export function localDate(d: Date = new Date()): string {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** yyyy-mm-dd, `days` from `from`. */
export function dateIn(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

/** The conversation was planned, hasn't been written up, and its date has come. */
export function talkDue(n: NextChapter, now: Date = new Date()): boolean {
  if (!n.talkBy || n.foundOut) return false;
  return localDate(now) >= n.talkBy;
}

/**
 * Who they're asking, said back to them: "My cousin" becomes "your cousin",
 * so "Did you talk to your cousin?" rather than "Did you talk to My cousin?".
 */
export function whoToYou(who: string): string {
  return who.trim().replace(/^my\b/i, "your");
}

/** "Fri 17 Oct", for a yyyy-mm-dd date. */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}
