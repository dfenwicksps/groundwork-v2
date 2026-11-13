// ─── May this entry be sent for an AI follow-up? ─────────────────────────────
// The server's answer, decided before anything leaves the database
// (docs/v3/visibility.md V-C4, V-C5). The activity screen already avoids
// asking for private steps; this is the check that holds if a request is made
// anyway.
//
// Sent: a mission step that isn't marked keepFromAi, written by a student who
// hasn't switched follow-ups off, at a school that hasn't either.
// Never sent: private steps, weekly reflections, the Character Code, Next
// Chapter, My Story, or any entry the server can't identify.

import { entryGroup, isSensitiveActivity } from "@/lib/missions";

export interface AiGateInput {
  /** users.ai_reflections_enabled; null when the profile row couldn't be read. */
  userEnabled: boolean | null;
  /** The entry as stored, read back by its owner; null when it wasn't found. */
  entry: { activity_id: string; mission_id: number } | null;
  /** settings of every school the student has a current class in. */
  schoolSettings: ({ ai_enabled?: unknown } | null)[];
}

export function mayReflect(input: AiGateInput): boolean {
  if (input.userEnabled === false) return false;
  if (!input.entry) return false;
  const { activity_id, mission_id } = input.entry;
  if (isSensitiveActivity(activity_id)) return false;
  // Only mission steps. "weeks" and "me" entries are never sent.
  if (typeof entryGroup(activity_id, mission_id) !== "number") return false;
  // One school with the switch off is enough.
  for (const s of input.schoolSettings) {
    if (s && s.ai_enabled === false) return false;
  }
  return true;
}
