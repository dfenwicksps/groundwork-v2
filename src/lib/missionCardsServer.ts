import type { LifeStage } from "./lifeStage";
import {
  buildIdentityCard,
  buildPurposeCard,
  buildConnectionCard,
  buildDirectionCard,
  IDENTITY_CARD_SOURCES,
  PURPOSE_CARD_SOURCES,
  CONNECTION_CARD_SOURCES,
  DIRECTION_CARD_SOURCES,
  type IdentityCard,
} from "./identityCard";

/** The entries each mission's card reads (lib/identityCard.ts). */
export const CARD_SOURCES: Record<number, string[]> = {
  1: IDENTITY_CARD_SOURCES,
  2: PURPOSE_CARD_SOURCES,
  3: CONNECTION_CARD_SOURCES,
  4: DIRECTION_CARD_SOURCES,
};

/**
 * One mission's card, built from this student's latest entries and challenge.
 * Used by the mission page, and by Mission 4's Through-Line, which shows the
 * first three cards so the student reads them instead of recalling them.
 */
export async function loadMissionCard(
  supabase: any,
  userId: string,
  missionId: number,
  stage: LifeStage
): Promise<IdentityCard | null> {
  const sources = CARD_SOURCES[missionId];
  if (!sources) return null;
  const db = supabase as any;
  const [{ data: profile }, { data: entries }, { data: challenge }] = await Promise.all([
    missionId === 1
      ? db.from("strength_profiles").select("ranking").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    db
      .from("journal_entries")
      .select("activity_id, response, created_at")
      .eq("user_id", userId)
      .in("activity_id", sources)
      .order("created_at", { ascending: false }),
    db
      .from("challenges")
      .select("completed_at, debrief_response")
      .eq("user_id", userId)
      .eq("mission_id", missionId)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  // Newest first, so the first row seen for each activity is its latest entry.
  const responses: Record<string, string> = {};
  for (const e of (entries ?? []) as { activity_id: string; response: string }[]) {
    if (!(e.activity_id in responses)) responses[e.activity_id] = e.response;
  }
  const c = {
    accepted: !!challenge,
    debriefed: !!(challenge as { debrief_response?: string | null } | null)?.debrief_response,
  };
  if (missionId === 1)
    return buildIdentityCard({ ranking: (profile as { ranking?: string[] } | null)?.ranking, responses, challenge: c, stage });
  if (missionId === 2) return buildPurposeCard({ responses, challenge: c, stage });
  if (missionId === 3) return buildConnectionCard({ responses, challenge: c, stage });
  return buildDirectionCard({ responses, challenge: c, stage });
}
