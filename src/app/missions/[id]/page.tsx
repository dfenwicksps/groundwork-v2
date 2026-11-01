import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getMission } from "@/lib/missions";
import { getLifeStage } from "@/lib/lifeStageServer";
import { missionForStage } from "@/lib/stageContent";
import {
  buildIdentityCard,
  buildPurposeCard,
  buildConnectionCard,
  IDENTITY_CARD_SOURCES,
  PURPOSE_CARD_SOURCES,
  CONNECTION_CARD_SOURCES,
  type IdentityCard,
} from "@/lib/identityCard";
import MissionDetailClient from "./MissionDetailClient";

export const dynamic = 'force-dynamic';

export default async function MissionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const missionId = parseInt(params.id);
  const baseMission = getMission(missionId);
  if (!baseMission) notFound();
  // Description and steps worded for where the student is; see lib/stageContent.ts.
  const lifeStage = await getLifeStage(supabase, user.id);
  const mission = missionForStage(baseMission, lifeStage);

  // Get progress for this mission
  const { data: progress } = await supabase
    .from("mission_progress")
    .select("activity_id")
    .eq("user_id", user.id)
    .eq("mission_id", missionId);

  // Get stories for this mission
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, teaser, tags")
    .eq("mission_id", missionId);


  const completedActivities = new Set((progress as Array<{ activity_id: string }> | null)?.map((p) => p.activity_id) || []);

  // Missions 1–3 build a card as they go (lib/identityCard.ts): Who I Am,
  // the Purpose card, then the Connection card.
  const CARD_SOURCES: Record<number, string[]> = {
    1: IDENTITY_CARD_SOURCES,
    2: PURPOSE_CARD_SOURCES,
    3: CONNECTION_CARD_SOURCES,
  };
  let identityCard: IdentityCard | null = null;
  if (CARD_SOURCES[missionId]) {
    const db = supabase as any;
    const [{ data: profile }, { data: entries }, { data: challenge }] = await Promise.all([
      db.from("strength_profiles").select("ranking").eq("user_id", user.id).maybeSingle(),
      db
        .from("journal_entries")
        .select("activity_id, response, created_at")
        .eq("user_id", user.id)
        .in("activity_id", CARD_SOURCES[missionId])
        .order("created_at", { ascending: false }),
      db
        .from("challenges")
        .select("completed_at, debrief_response")
        .eq("user_id", user.id)
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
    const challengeState = {
      accepted: !!challenge,
      debriefed: !!(challenge as { debrief_response?: string | null } | null)?.debrief_response,
    };
    identityCard =
      missionId === 1
        ? buildIdentityCard({
            ranking: (profile as { ranking?: string[] } | null)?.ranking,
            responses,
            challenge: challengeState,
            stage: lifeStage,
          })
        : missionId === 2
          ? buildPurposeCard({ responses, challenge: challengeState, stage: lifeStage })
          : buildConnectionCard({ responses, challenge: challengeState, stage: lifeStage });
  }

  return (
    <MissionDetailClient
      mission={mission}
      userId={user.id}
      completedActivities={completedActivities}
      stories={stories || []}
      identityCard={identityCard}
    />
  );
}
