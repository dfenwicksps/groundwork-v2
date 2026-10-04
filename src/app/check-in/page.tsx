import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { endDue, type Scores, type Wave } from "@/lib/checkin";
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
    .select("wave, scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Migration 013 not run yet: say so rather than failing on save.
  if (error) return <CheckinClient state={{ kind: "unavailable" }} />;

  const list = (rows || []) as { wave: Wave; scores: Scores; created_at: string }[];
  const start = list.find((r) => r.wave === "start") ?? null;
  const end = [...list].reverse().find((r) => r.wave === "end") ?? null;

  const state: CheckinState = !start
    ? { kind: "take", wave: "start" }
    : end
      ? { kind: "compare", start: start.scores, end: end.scores, startAt: start.created_at }
      : endDue({ startAt: start.created_at, endDone: false })
        ? { kind: "take", wave: "end", start: start.scores }
        : { kind: "waiting", startAt: start.created_at };

  return <CheckinClient state={state} />;
}
