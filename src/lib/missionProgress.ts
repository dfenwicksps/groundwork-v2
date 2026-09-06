import { MISSIONS } from "./missions";

/**
 * How many of the four missions are fully complete.
 *
 * The spine holds the ten-week program back until this reaches four — the
 * missions are the foundation, the program is where what they surfaced gets
 * grown and embedded. Locked activities don't count towards a mission's total,
 * matching how the dashboard's mission cards already measure progress.
 */
export function missionsCompleted(
  progress: { mission_id: number; activity_id: string }[]
): number {
  return MISSIONS.filter((m) => {
    const total = m.activities.filter((a) => !a.locked).length;
    if (!total) return false;
    const done = new Set(
      progress
        .filter((p) => p.mission_id === m.id)
        .map((p) => p.activity_id)
    ).size;
    return done >= total;
  }).length;
}
