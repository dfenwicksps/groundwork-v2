import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getLifeStage } from "@/lib/lifeStageServer";
import { missionsCompleted } from "@/lib/missionProgress";
import { CHARACTER_CODE_ACTIVITY_ID } from "@/lib/program";
import { endDue, type Scores, type Wave } from "@/lib/checkin";
import CheckinClient from "./CheckinClient";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const [lifeStage, { data: rows, error }, { data: progress }, { count: codeCount }] =
    await Promise.all([
      getLifeStage(supabase, user.id),
      db
        .from("outcome_checkins")
        .select("wave, scores, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      db.from("mission_progress").select("mission_id, activity_id").eq("user_id", user.id),
      db
        .from("journal_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("activity_id", CHARACTER_CODE_ACTIVITY_ID),
    ]);

  // Migration 013 not run yet: say so rather than failing on save.
  if (error) {
    return <CheckinClient userId={user.id} lifeStage={lifeStage} state={{ kind: "unavailable" }} />;
  }

  const list = (rows || []) as { wave: Wave; scores: Scores; created_at: string }[];
  const start = list.find((r) => r.wave === "start") ?? null;
  const end = [...list].reverse().find((r) => r.wave === "end") ?? null;

  const state = !start
    ? ({ kind: "take", wave: "start" } as const)
    : end
      ? ({ kind: "compare", start: start.scores, end: end.scores, startAt: start.created_at } as const)
      : endDue({
            startAt: start.created_at,
            endDone: false,
            missionsDone: missionsCompleted(progress || []),
            codeWritten: (codeCount ?? 0) > 0,
          })
        ? ({ kind: "take", wave: "end", start: start.scores } as const)
        : ({ kind: "waiting", startAt: start.created_at } as const);

  return <CheckinClient userId={user.id} lifeStage={lifeStage} state={state} />;
}
