// ─── Being hard on yourself ──────────────────────────────────────────────────
// Reflection helps until it turns into going round in circles. Research on
// rumination (Luyckx and colleagues' "ruminative exploration" in identity
// work) finds that repeatedly turning over the same harsh verdicts on yourself
// predicts anxiety and low mood rather than insight. A reflective app can feed
// that without meaning to.
//
// This notices a pattern, not a moment: several recent entries that read as a
// verdict on the self ("I'm useless", "nobody cares about me"), not one bad
// day. It runs on the device, the same way the crisis phrase check does, and
// nothing is saved, flagged or sent anywhere. All it changes is a card on the
// screen suggesting a different move. Anything that sounds like risk is the
// crisis check's job (lib/help.ts), which takes priority.

const PATTERNS: RegExp[] = [
  /\bi(?:'m| am)\s+(?:so\s+|just\s+|such\s+)?(?:useless|worthless|stupid|pathetic|a failure|a loser|a burden|a disappointment|not good enough|never good enough|broken|unlovable|disgusting|trash|garbage|a waste of space|a joke|a mess)\b/i,
  /\bi hate (?:myself|me|who i am|everything about me)\b/i,
  /\b(?:nobody|no one|no-one) (?:likes|cares about|wants|would miss|gets) me\b/i,
  /\beveryone (?:hates|is sick of|would be better off without) me\b/i,
  /\bi (?:always|never stop|keep) (?:mess|screw|stuff)(?:ing)? (?:it |things |everything )?up\b/i,
  /\bi ruin everything\b/i,
  /\bi can'?t do anything right\b/i,
  /\bthere'?s something wrong with me\b/i,
  /\bwhat'?s the point (?:of me|of trying|of anything)\b/i,
  /\bnothing (?:ever )?(?:changes|gets better|works out) for me\b/i,
];

export function soundsHardOnSelf(text: string | null | undefined): boolean {
  if (!text) return false;
  return PATTERNS.some((p) => p.test(text));
}

/** Out of the most recent entries (newest first, including the one just written), how many it takes. */
export const PATTERN_THRESHOLD = 3;

/**
 * True when the entry just written reads as hard on the self and so do enough
 * of the recent ones around it. `recent` is newest first and includes it.
 */
export function hardOnSelfLately(justWritten: string, recent: string[]): boolean {
  if (!soundsHardOnSelf(justWritten)) return false;
  return recent.filter(soundsHardOnSelf).length >= PATTERN_THRESHOLD;
}

/**
 * Reads the student's last few journal entries, on their device, to see
 * whether the one just written is part of a run of being hard on themselves.
 * Every writing surface keeps a journal copy, so this sees all of them; pass
 * `justWritten` exactly as that copy was saved. Never saved or sent.
 */
export async function hardOnSelfRecently(
  db: any,
  userId: string,
  justWritten: string
): Promise<boolean> {
  if (!soundsHardOnSelf(justWritten)) return false;
  const { data } = await db
    .from("journal_entries")
    .select("response")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);
  const recent = ((data || []) as { response: string | null }[]).map((r) => r.response || "");
  // An entry updated in place (Next Chapter's debrief) can be older than the
  // last six; it still counts as the one just written.
  if (!recent.includes(justWritten)) recent.unshift(justWritten);
  return hardOnSelfLately(justWritten, recent.slice(0, 6));
}
