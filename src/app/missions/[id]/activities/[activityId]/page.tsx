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

  // Inner compass — surface the user's strengths + values from the first two
  // Mission 1 steps inside the Mask Check (which tests them) and the Identity
  // Letter (which is written from them).
  let compass: { strengths: string[]; values: string[] } | null = null;
  if (
    missionId === 1 &&
    (params.activityId === "mask-check" || params.activityId === "identity-letter")
  ) {
    const { data: compassRaw } = await supabase
      .from("journal_entries")
      .select("activity_id, response")
      .eq("user_id", user.id)
      .eq("mission_id", 1)
      .in("activity_id", ["strengths-mapping", "values-clarifier"])
      .order("created_at", { ascending: false });
    const rows = (compassRaw || []) as { activity_id: string; response: string }[];
    const strengthsRow = rows.find((r) => r.activity_id === "strengths-mapping");
    const valuesRow = rows.find((r) => r.activity_id === "values-clarifier");

    const strengths: string[] = [];
    if (strengthsRow) {
      const qs = getActivity(1, "strengths-mapping")?.scaffoldingSteps || [];
      if (qs.length > 1) {
        qs.forEach((q, i) => {
          const header = `${i + 1}. ${q}`;
          const start = strengthsRow.response.indexOf(header);
          if (start === -1) return;
          const from = start + header.length;
          let end = strengthsRow.response.length;
          if (i + 1 < qs.length) {
            const n = strengthsRow.response.indexOf(`${i + 2}. ${qs[i + 1]}`, from);
            if (n !== -1) end = n;
          }
          const ans = strengthsRow.response.slice(from, end).trim();
          if (ans) strengths.push(ans.length > 90 ? `${ans.slice(0, 87)}…` : ans);
        });
      } else if (strengthsRow.response.trim()) {
        strengths.push(strengthsRow.response.trim().slice(0, 90));
      }
    }
    const values: string[] = valuesRow
      ? valuesRow.response
          .split("\n")
          .map((l) => l.split(":")[0].trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];
    if (strengths.length || values.length) compass = { strengths, values };
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
    />
  );
}
