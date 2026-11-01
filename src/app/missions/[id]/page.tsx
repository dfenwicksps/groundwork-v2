import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getMission } from "@/lib/missions";
import { getLifeStage } from "@/lib/lifeStageServer";
import { missionForStage } from "@/lib/stageContent";
import { loadMissionCard } from "@/lib/missionCardsServer";
import type { IdentityCard } from "@/lib/identityCard";
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

  // Every mission builds a card as it goes (lib/identityCard.ts): Who I Am,
  // Purpose, Connection, then Direction.
  const identityCard: IdentityCard | null = await loadMissionCard(supabase, user.id, missionId, lifeStage);

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
