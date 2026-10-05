import { MISSIONS, missionFinished, type ProgressRow } from "./missions";

/**
 * How many of the four missions are fully complete.
 *
 * The spine holds the ten-week program back until this reaches four — the
 * missions are the foundation, the program is where what they surfaced gets
 * grown and embedded. Locked activities don't count towards a mission's total,
 * matching how the dashboard's mission cards already measure progress. A
 * mission finished before its conversation counted stays finished (see
 * missionFinished).
 */
/** Whether one specific mission is finished. */
export function missionComplete(progress: ProgressRow[], missionId: number): boolean {
  const m = MISSIONS.find((x) => x.id === missionId);
  return !!m && missionFinished(m, progress);
}

export function missionsCompleted(progress: ProgressRow[]): number {
  return MISSIONS.filter((m) => missionFinished(m, progress)).length;
}
