import { MISSIONS, requiredSteps } from "./missions";
import {
  CORE_MISSION_IDS,
  earnedPhase,
  parsePhase,
  type Phase,
  type PhaseMeta,
} from "./phase";

/**
 * Resolve the student's current journey phase for a server-rendered page, and
 * persist any phase they've newly earned so the unlock is sticky.
 *
 * Phase is global state on users.journey_phase (+ phase_meta jsonb). If those
 * columns don't exist yet (migration 005 not run), the read errors and we fall
 * back to Phase 1 for everyone — exactly today's behaviour — so nothing breaks
 * before the migration, the same graceful degradation the Me page uses for
 * goals/practice.
 */
export async function resolvePhase(supabase: any, userId: string): Promise<Phase> {
  const { data, error } = await supabase
    .from("users")
    .select("journey_phase, phase_meta")
    .eq("id", userId)
    .maybeSingle();

  // Column missing / unmigrated → everyone is Phase 1, no writes.
  if (error) return 1;

  const stored = parsePhase(data?.journey_phase);
  const meta: PhaseMeta = (data?.phase_meta as PhaseMeta) ?? {};

  // First pass = every required activity of the core missions is done once.
  const { data: progressRows } = await supabase
    .from("mission_progress")
    .select("mission_id, activity_id")
    .eq("user_id", userId);
  const done = new Set(
    (progressRows ?? []).map(
      (r: { mission_id: number; activity_id: string }) => `${r.mission_id}:${r.activity_id}`
    )
  );
  const firstPassComplete = CORE_MISSION_IDS.every((id) => {
    const mission = MISSIONS.find((m) => m.id === id);
    if (!mission) return true; // a core id with no mission can't block progress
    return requiredSteps(mission).every((a) => done.has(`${id}:${a.id}`));
  });

  const earned = earnedPhase(stored, {
    firstPassComplete,
    reviewedAnchors: meta.reviewed ?? [],
  });

  if (earned > stored) {
    const now = new Date().toISOString();
    const nextMeta: PhaseMeta = { ...meta };
    if (earned >= 2 && !nextMeta.phase2_at) nextMeta.phase2_at = now;
    if (earned >= 3 && !nextMeta.phase3_at) nextMeta.phase3_at = now;
    await supabase
      .from("users")
      .update({ journey_phase: earned, phase_meta: nextMeta })
      .eq("id", userId);
    return earned;
  }

  return stored;
}
