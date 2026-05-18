import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getMission } from "@/lib/missions";
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
  const mission = getMission(missionId);
  if (!mission) notFound();

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

  return (
    <MissionDetailClient
      mission={mission}
      completedActivities={completedActivities}
      stories={stories || []}
    />
  );
}
