import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { MISSIONS } from "@/lib/missions";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch user profile
  const { data: _profileRaw } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = _profileRaw as import("@/types/database").UserProfile | null;

  if (!profile?.onboarding_complete) {
    redirect("/onboarding");
  }

  // Fetch mission progress
  const { data: progress } = await supabase
    .from("mission_progress")
    .select("*")
    .eq("user_id", user.id);

  // Fetch active challenge
  const { data: _challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();
  const challenge = _challenge as import("@/types/database").Challenge | null;

  // Fetch recent journal entries (last 3, titles only)
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select("id, mission_id, activity_id, prompt, created_at, is_milestone")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch support circle
  const { data: supportCircle } = await supabase
    .from("support_circle")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: true });

  // Find the oldest journal entry eligible for a revisit prompt:
  // missions 1–2, written 14+ days ago, not itself a revisit/debrief
  const revisitCutoff = new Date();
  revisitCutoff.setDate(revisitCutoff.getDate() - 14);

  type RevisitCandidate = { id: string; mission_id: number; activity_id: string; prompt: string; response: string; created_at: string };

  const { data: revisitCandidatesRaw } = await (supabase as any)
    .from("journal_entries")
    .select("id, mission_id, activity_id, prompt, response, created_at")
    .eq("user_id", user.id)
    .in("mission_id", [1, 2])
    .lt("created_at", revisitCutoff.toISOString())
    .order("created_at", { ascending: true });
  const revisitCandidates = (revisitCandidatesRaw || []) as RevisitCandidate[];

  const { data: existingRevisitsRaw } = await (supabase as any)
    .from("journal_entries")
    .select("activity_id")
    .eq("user_id", user.id)
    .like("activity_id", "%-revisit");
  const existingRevisits = (existingRevisitsRaw || []) as { activity_id: string }[];

  const revisitedIds = new Set(
    existingRevisits.map((r) => r.activity_id.replace(/-revisit$/, ""))
  );

  const revisitEntry = revisitCandidates.find(
    (e) =>
      !e.activity_id.endsWith("-revisit") &&
      !e.activity_id.endsWith("-debrief") &&
      !revisitedIds.has(e.activity_id)
  ) || null;

  // Compute nudge eligibility — only when no revisit card is already showing.
  // Triggers when: last activity completion was 10+ days ago, OR account is
  // 7+ days old with zero completions. Never shows alongside the revisit card.
  type NudgeActivity = { missionId: number; activityId: string; title: string; sentenceStarter?: string };
  let nudgeActivity: NudgeActivity | null = null;

  if (!revisitEntry) {
    const progressRows = (progress || []) as import("@/types/database").MissionProgress[];
    const now = new Date();
    const accountAgeDays =
      (now.getTime() - new Date(profile.created_at).getTime()) /
      (1000 * 60 * 60 * 24);

    const lastCompletion = progressRows.length
      ? progressRows
          .map((p) => new Date(p.completed_at).getTime())
          .reduce((a, b) => Math.max(a, b), 0)
      : null;

    const daysSinceLast = lastCompletion
      ? (now.getTime() - lastCompletion) / (1000 * 60 * 60 * 24)
      : accountAgeDays;

    if (daysSinceLast >= 10) {
      const activeMissionData = MISSIONS.find(
        (m) => m.id === profile.active_mission
      );
      const completedIds = new Set(progressRows.map((p) => p.activity_id));
      const next = activeMissionData?.activities.find(
        (a) => !a.locked && !completedIds.has(a.id)
      );
      if (next) {
        nudgeActivity = {
          missionId: profile.active_mission,
          activityId: next.id,
          title: next.title,
        };
      }
    }
  }

  return (
    <DashboardClient
      profile={profile}
      progress={progress || []}
      challenge={challenge || null}
      recentEntries={recentEntries || []}
      supportCircle={supportCircle || []}
      revisitEntry={revisitEntry || null}
      nudgeActivity={nudgeActivity}
    />
  );
}
