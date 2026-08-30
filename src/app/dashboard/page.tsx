import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";
import { parseYearLevel, YEAR_COOKIE } from "@/lib/yearLevel";
import { spineFor } from "@/lib/spine";
import { parseDays, currentWeek, isWeekComplete, PROGRAM_WEEKS, type WeekProgress } from "@/lib/program";
import { MIN_DAYS_BETWEEN_REVISITS, daysBetween } from "@/lib/revisit";
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

  // Pick an entry worth reopening. Milestones first — they're the writing with
  // the most distance in it — then anything else old enough. Eligibility runs
  // from the most recent look at a chain, so an entry can come round again
  // months later rather than being spent after one revisit.
  const revisitCutoff = new Date();
  revisitCutoff.setDate(revisitCutoff.getDate() - MIN_DAYS_BETWEEN_REVISITS);

  type RevisitCandidate = {
    id: string;
    mission_id: number;
    activity_id: string;
    prompt: string;
    response: string;
    created_at: string;
    is_milestone?: boolean;
    revisit_of?: string | null;
  };

  const { data: revisitCandidatesRaw } = await (supabase as any)
    .from("journal_entries")
    .select("id, mission_id, activity_id, prompt, response, created_at, is_milestone")
    .eq("user_id", user.id)
    .lt("created_at", revisitCutoff.toISOString())
    .order("created_at", { ascending: true });
  const revisitCandidates = (revisitCandidatesRaw || []) as RevisitCandidate[];

  // Every revisit, keyed by the entry it looks back at. Falls back to the old
  // naming convention when migration 006 hasn't run yet.
  const { data: existingRevisitsRaw, error: revisitLinkError } = await (supabase as any)
    .from("journal_entries")
    .select("activity_id, revisit_of, created_at")
    .eq("user_id", user.id)
    .like("activity_id", "%-revisit");
  const existingRevisits = (existingRevisitsRaw || []) as {
    activity_id: string;
    revisit_of?: string | null;
    created_at: string;
  }[];
  const linksUnavailable = !!revisitLinkError;

  const lastLookByParent = new Map<string, string>();
  const revisitedActivityIds = new Set<string>();
  for (const r of existingRevisits) {
    revisitedActivityIds.add(r.activity_id.replace(/-revisit$/, ""));
    if (!r.revisit_of) continue;
    const prev = lastLookByParent.get(r.revisit_of);
    if (!prev || new Date(r.created_at) > new Date(prev)) {
      lastLookByParent.set(r.revisit_of, r.created_at);
    }
  }

  const eligible = revisitCandidates.filter((e) => {
    if (e.activity_id.endsWith("-revisit")) return false;
    if (e.activity_id.endsWith("-debrief")) return false;
    // Without the link column we can't tell chains apart, so keep the old
    // once-only behaviour rather than nagging about an entry already revisited.
    if (linksUnavailable) return !revisitedActivityIds.has(e.activity_id);
    const lastLook = lastLookByParent.get(e.id);
    const from = lastLook || e.created_at;
    return daysBetween(from, new Date()) >= MIN_DAYS_BETWEEN_REVISITS;
  });

  const revisitEntry =
    eligible.find((e) => e.is_milestone) || eligible[0] || null;

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

  // ── The spine ──
  // Which track leads is a function of year level, not of what happens to be
  // furthest along. See src/lib/spine.ts.
  const yearLevel = parseYearLevel(cookies().get(YEAR_COOKIE)?.value) ?? "middle";
  const spine = spineFor(yearLevel);

  // Program state for the "this week" card. Absent table (migration 005 not
  // run) degrades to offering week 1 rather than erroring.
  const { data: programRaw } = await (supabase as any)
    .from("program_progress")
    .select("week, days, commitment, reflection, completed_at, started_at")
    .eq("user_id", user.id);

  const programProgress: Record<number, WeekProgress> = {};
  for (const row of (programRaw || []) as any[]) {
    programProgress[row.week] = {
      week: row.week,
      days: parseDays(row.days),
      commitment: row.commitment ?? null,
      reflection: row.reflection ?? null,
      completed_at: row.completed_at ?? null,
      started_at: row.started_at,
    };
  }
  const weekNumber = currentWeek(programProgress);
  const weeksDone = PROGRAM_WEEKS.filter((w) =>
    isWeekComplete(w, programProgress[w.week])
  ).length;
  const programWeek = {
    week: weekNumber,
    title: PROGRAM_WEEKS.find((w) => w.week === weekNumber)?.title ?? "",
    challenge:
      PROGRAM_WEEKS.find((w) => w.week === weekNumber)?.challenge.title ?? "",
    emoji: PROGRAM_WEEKS.find((w) => w.week === weekNumber)?.emoji ?? "🧭",
    started: !!programProgress[weekNumber],
    weeksDone,
    allDone: weeksDone === PROGRAM_WEEKS.length,
  };

  return (
    <DashboardClient
      profile={profile}
      progress={progress || []}
      challenge={challenge || null}
      recentEntries={recentEntries || []}
      supportCircle={supportCircle || []}
      revisitEntry={revisitEntry || null}
      nudgeActivity={nudgeActivity}
      spine={spine}
      yearLevel={yearLevel}
      programWeek={programWeek}
    />
  );
}
