import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getActivity, getMission } from "@/lib/missions";
import { topStrengths, bottomStrengths, strengthName } from "@/lib/strengths";
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

  // Inner compass — inject the user's own VIA signature strengths (top-5),
  // growth edges (bottom-5), and chosen values into any step that references
  // them. Driven by the activity's referencesStrengths / referencesValues flags
  // so it works across all four missions.
  let compass: { strengths: string[]; values: string[]; growthEdges: string[] } | null = null;
  if (activity.referencesStrengths || activity.referencesValues) {
    let strengths: string[] = [];
    let growthEdges: string[] = [];
    if (activity.referencesStrengths) {
      const { data: profileRaw } = await supabase
        .from("strength_profiles")
        .select("ranking")
        .eq("user_id", user.id)
        .single();
      const ranking = (profileRaw as { ranking: string[] } | null)?.ranking || [];
      strengths = topStrengths(ranking, 5).map(strengthName);
      growthEdges = bottomStrengths(ranking, 5).map(strengthName);
    }

    let values: string[] = [];
    if (activity.referencesValues) {
      const { data: valuesRaw } = await supabase
        .from("journal_entries")
        .select("response")
        .eq("user_id", user.id)
        .eq("activity_id", "values-clarifier")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      const resp = (valuesRaw as { response: string } | null)?.response || "";
      values = resp
        .split("\n")
        .map((l) => l.split(":")[0].trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    if (strengths.length || values.length || growthEdges.length) {
      compass = { strengths, values, growthEdges };
    }
  }

  // Saved VIA profile — lets a retake pre-fill the user's previous answers.
  let strengthProfile: {
    ranking: string[];
    answers: { most: (string | null)[]; least: (string | null)[] } | null;
  } | null = null;
  if (activity.type === "strengths_assessment") {
    const { data: spRaw } = await supabase
      .from("strength_profiles")
      .select("ranking, answers")
      .eq("user_id", user.id)
      .single();
    const sp = spRaw as {
      ranking: string[];
      answers: { most: (string | null)[]; least: (string | null)[] } | null;
    } | null;
    if (sp?.ranking?.length) {
      strengthProfile = { ranking: sp.ranking, answers: sp.answers ?? null };
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
      compass={compass}
      strengthProfile={strengthProfile}
    />
  );
}
