import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import ProgramClient from "./ProgramClient";
import { parseYearLevel, YEAR_COOKIE } from "@/lib/yearLevel";
import { spineFor } from "@/lib/spine";
import { missionsCompleted, missionComplete } from "@/lib/missionProgress";
import { PROGRAM_WEEKS } from "@/lib/program";
import { MISSIONS } from "@/lib/missions";
import { parseDays, type WeekProgress, type Strand } from "@/lib/program";
import type { WeeklyCheckin } from "./WeeklyFiveSection";

/** Mission writing the weeks hard-depend on — see `required` in program.ts. */
const REQUIRED_SOURCE_IDS = [
  "values-clarifier",
  ...PROGRAM_WEEKS.flatMap((w) =>
    w.source?.required && w.source.kind === "entry" ? [w.source.activityId] : []
  ),
];

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;

  const [
    { data: progressRaw, error: progressError },
    { data: weeklyRaw },
    { data: missionRaw },
    { data: sourceRaw },
  ] = await Promise.all([
    db.from("program_progress").select("*").eq("user_id", user.id),
    db
      .from("standard_checkins")
      .select("id, answers, created_at")
      .eq("user_id", user.id)
      .eq("set", "weekly")
      .order("created_at", { ascending: false })
      .limit(12),
    db
      .from("mission_progress")
      .select("mission_id, activity_id")
      .eq("user_id", user.id),
    // Which mission writing exists, so the week list can say which weeks are
    // waiting on which mission rather than only telling them once they're in.
    db
      .from("journal_entries")
      .select("activity_id")
      .eq("user_id", user.id)
      .in("activity_id", REQUIRED_SOURCE_IDS),
  ]);

  // The program is the practice layer that follows the four missions, so its
  // own page has to know how much of the foundation is laid before it offers a
  // week. It never blocks — it just stops pretending week 1 is step one.
  const missionRows = (missionRaw || []) as {
    mission_id: number;
    activity_id: string;
  }[];
  const spine = spineFor(
    parseYearLevel(cookies().get(YEAR_COOKIE)?.value) ?? "middle",
    missionsCompleted(missionRows),
    missionComplete(missionRows, 1)
  );

  // Which missions are still outstanding, for the "finish these first" card.
  const doneByMission = new Set(
    MISSIONS.filter((m) => {
      const total = m.activities.filter((a) => !a.locked).length;
      const done = new Set(
        missionRows.filter((r) => r.mission_id === m.id).map((r) => r.activity_id)
      ).size;
      return total > 0 && done >= total;
    }).map((m) => m.id)
  );
  const outstanding = MISSIONS.filter((m) => !doneByMission.has(m.id)).map((m) => {
    const total = m.activities.filter((a) => !a.locked).length;
    const done = new Set(
      missionRows.filter((r) => r.mission_id === m.id).map((r) => r.activity_id)
    ).size;
    return { id: m.id, title: m.title, question: m.question, done, total };
  });

  const progress: Record<number, WeekProgress> = {};
  for (const row of (progressRaw || []) as any[]) {
    progress[row.week] = {
      week: row.week,
      days: parseDays(row.days),
      commitment: row.commitment ?? null,
      reflection: row.reflection ?? null,
      completed_at: row.completed_at ?? null,
      started_at: row.started_at,
    };
  }

  const weekly: WeeklyCheckin[] = ((weeklyRaw || []) as any[]).map((c) => ({
    id: c.id,
    answers: (c.answers && typeof c.answers === "object"
      ? c.answers
      : {}) as Partial<Record<Strand, string>>,
    created_at: c.created_at,
  }));

  // Migration 005 outstanding — show the program read-only rather than letting
  // students hit save-time errors (same pattern as featuresReady on /me).
  const ready =
    !progressError ||
    !/find the table|does not exist|schema cache/i.test(
      progressError.message || ""
    );

  // Weeks whose prerequisite mission work is still missing.
  const haveSource = new Set(
    ((sourceRaw || []) as { activity_id: string }[]).map((r) => r.activity_id)
  );
  const waiting: Record<number, { mission: number; label: string }> = {};
  for (const w of PROGRAM_WEEKS) {
    if (!w.source?.required) continue;
    const id =
      w.source.kind === "entry" ? w.source.activityId : "values-clarifier";
    if (!haveSource.has(id)) {
      waiting[w.week] = {
        mission: w.source.kind === "entry" ? w.source.missionId : 1,
        label: w.source.label,
      };
    }
  }

  return (
    <ProgramClient
      userId={user.id}
      progress={progress}
      weekly={weekly}
      spine={spine}
      outstanding={outstanding}
      waiting={waiting}
      ready={ready}
    />
  );
}
