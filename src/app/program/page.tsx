import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import ProgramClient from "./ProgramClient";
import { parseDays, type WeekProgress, type Strand } from "@/lib/program";
import type { WeeklyCheckin } from "./WeeklyFiveSection";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;

  const [{ data: progressRaw, error: progressError }, { data: weeklyRaw }] =
    await Promise.all([
      db.from("program_progress").select("*").eq("user_id", user.id),
      db
        .from("standard_checkins")
        .select("id, answers, created_at")
        .eq("user_id", user.id)
        .eq("set", "weekly")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

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

  return (
    <ProgramClient
      userId={user.id}
      progress={progress}
      weekly={weekly}
      ready={ready}
    />
  );
}
