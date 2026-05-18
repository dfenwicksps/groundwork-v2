import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getActivity, getMission } from "@/lib/missions";
import ActivityClient from "./ActivityClient";

export const dynamic = 'force-dynamic';

export default async function ActivityPage({
  params,
}: {
  params: { id: string; activityId: string };
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const missionId = parseInt(params.id);
  const mission = getMission(missionId);
  const activity = getActivity(missionId, params.activityId);

  if (!mission || !activity) notFound();

  // Check if already completed
  const { data: _existing } = await supabase
    .from("mission_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("mission_id", missionId)
    .eq("activity_id", params.activityId)
    .single();
  const existing = _existing as { id: string } | null;

  // Get existing journal entry if any
  const { data: _existingEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("mission_id", missionId)
    .eq("activity_id", params.activityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const existingEntry = _existingEntry as import("@/types/database").JournalEntry | null;

  // Get existing challenge if any
  const { data: _existingChallenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("mission_id", missionId)
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();
  const existingChallenge = _existingChallenge as import("@/types/database").Challenge | null;

  // Fetch paired story if this activity has one
  let pairedStory: { id: string; title: string; teaser: string } | null = null;
  if (activity.storyBefore !== undefined) {
    const { data: missionStories } = await supabase
      .from("stories")
      .select("id, title, teaser")
      .eq("mission_id", missionId);
    const storiesArr = missionStories as Array<{ id: string; title: string; teaser: string }> | null;
    if (storiesArr && storiesArr[activity.storyBefore]) {
      pairedStory = storiesArr[activity.storyBefore];
    }
  }

  return (
    <ActivityClient
      mission={mission}
      activity={activity}
      userId={user.id}
      isCompleted={!!existing}
      existingEntry={existingEntry || null}
      existingChallenge={existingChallenge || null}
      pairedStory={pairedStory}
    />
  );
}
