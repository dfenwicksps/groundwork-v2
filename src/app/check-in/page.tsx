import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { CURRENT_SET, endDue, itemSet, type Scores, type Wave } from "@/lib/checkin";
import { getLifeStage } from "@/lib/lifeStageServer";
import CheckinClient, { type CheckinState } from "./CheckinClient";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: rows, error } = await (supabase as any)
    .from("outcome_checkins")
    .select("wave, item_set, scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Migration 013 not run yet: say so rather than failing on save.
  if (error) return <CheckinClient state={{ kind: "unavailable" }} />;

  const list = (rows || []) as { wave: Wave; item_set: string; scores: Scores; created_at: string }[];
  const start = list.find((r) => r.wave === "start") ?? null;
  const end = [...list].reverse().find((r) => r.wave === "end") ?? null;
  // Everything after a start uses the start's set, so the comparison lines up.
  const setId = start ? itemSet(start.item_set).id : CURRENT_SET;
  const lifeStage = await getLifeStage(supabase, user.id);

  const state: CheckinState = !start
    ? { kind: "take", wave: "start", setId }
    : end
      ? { kind: "compare", start: start.scores, end: end.scores, startAt: start.created_at, setId }
      : endDue({ startAt: start.created_at, endDone: false })
        ? { kind: "take", wave: "end", start: start.scores, setId }
        : { kind: "waiting", startAt: start.created_at, setId };

  return <CheckinClient state={state} lifeStage={lifeStage} />;
}
