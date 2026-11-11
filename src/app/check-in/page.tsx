import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { checkinState, type CheckinRow } from "@/lib/checkin";
import { getLifeStage } from "@/lib/lifeStageServer";
import CheckinClient from "./CheckinClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Check-in" };

export default async function CheckinPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: rows, error } = await (supabase as any)
    .from("outcome_checkins")
    .select("wave, item_set, scores, created_at")
    .eq("user_id", user.id);

  // Migration 013 not run yet: say so rather than failing on save.
  if (error) return <CheckinClient state={{ kind: "unavailable" }} />;

  const state = checkinState((rows || []) as CheckinRow[]);
  const lifeStage = await getLifeStage(supabase, user.id);

  return <CheckinClient state={state} lifeStage={lifeStage} />;
}
