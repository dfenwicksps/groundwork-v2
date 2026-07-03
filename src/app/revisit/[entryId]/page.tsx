import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import RevisitClient from "./RevisitClient";

export const dynamic = "force-dynamic";

export default async function RevisitPage({
  params,
}: {
  params: { entryId: string };
}) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  type EntryRow = { id: string; mission_id: number; activity_id: string; prompt: string; response: string; created_at: string };

  const { data: entryRaw } = await (supabase as any)
    .from("journal_entries")
    .select("id, mission_id, activity_id, prompt, response, created_at")
    .eq("id", params.entryId)
    .eq("user_id", user.id)
    .single();
  const entry = entryRaw as EntryRow | null;

  if (!entry) notFound();

  // If already revisited, redirect to journal
  const { data: existing } = await (supabase as any)
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("activity_id", `${entry.activity_id}-revisit`)
    .limit(1)
    .single();

  if (existing) redirect("/journal");

  return <RevisitClient entry={entry} userId={user.id} />;
}
