// ─── Showing class patterns ──────────────────────────────────────────────────
// class_patterns() hides any figure that could point at a few students and
// returns null in its place (docs/v3/visibility.md, section 4). The screen
// shows a dash for a hidden figure and nothing more: not "fewer than 5", which
// would itself say something about a small group (V-K9).

export interface PatternRow {
  section: string;
  key: string;
  students: number | null;
  out_of: number | null;
}

export const HIDDEN = "–";

export function shownClassCount(n: number | null | undefined): string {
  return n === null || n === undefined ? HIDDEN : String(n);
}

const LEVEL_NAMES: Record<string, string> = {
  "level-1": "Know myself",
  "level-2": "Value myself",
  "level-3": "Manage myself",
  "level-4": "Believe in myself",
  "level-5": "Direct myself",
  "level-6": "Imagine myself",
  "level-7": "Authentic self",
};

/** A plain label for one row of class_patterns(). */
export function patternLabel(row: PatternRow): string {
  if (row.section === "class" && row.key === "members") return "Students in the class";
  if (row.section === "class" && row.key === "too_small") return "This class is too small to report on";
  if (row.section === "self_check" && row.key === "taken") return "Have taken the self-check";
  if (row.section === "self_check" && LEVEL_NAMES[row.key]) return `Suggested to start in ${LEVEL_NAMES[row.key]}`;
  if (row.section === "focus") {
    const [item, what] = row.key.split(":");
    const verb = what === "opened" ? "opened" : what === "accepted" ? "accepted the challenge for" : "finished";
    return `Have ${verb} the class focus (${item})`;
  }
  return `${row.section}: ${row.key}`;
}
