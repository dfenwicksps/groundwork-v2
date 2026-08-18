import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import RevisitClient from "./RevisitClient";
import { buildChain, type RevisitEntry } from "@/lib/revisit";

export const dynamic = "force-dynamic";

const COLS =
  "id, mission_id, activity_id, prompt, response, created_at, is_milestone, revisit_of";

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

  const db = supabase as any;

  const { data: entryRaw, error: entryError } = await db
    .from("journal_entries")
    .select(COLS)
    .eq("id", params.entryId)
    .eq("user_id", user.id)
    .single();

  // Migration 006 outstanding — the revisit_of column doesn't exist yet.
  const columnMissing = /revisit_of|column .* does not exist/i.test(
    entryError?.message || ""
  );
  if (columnMissing) {
    const { data: fallback } = await db
      .from("journal_entries")
      .select("id, mission_id, activity_id, prompt, response, created_at, is_milestone")
      .eq("id", params.entryId)
      .eq("user_id", user.id)
      .single();
    if (!fallback) notFound();
    return (
      <RevisitClient
        chain={{ original: fallback as RevisitEntry, revisits: [] }}
        userId={user.id}
        ready={false}
      />
    );
  }

  const entry = entryRaw as RevisitEntry | null;
  if (!entry) notFound();

  // Following a revisit's link should open the arc it belongs to, not start a
  // chain hanging off a revisit.
  const rootId = entry.revisit_of || entry.id;
  let root = entry;
  if (entry.revisit_of) {
    const { data: rootRaw } = await db
      .from("journal_entries")
      .select(COLS)
      .eq("id", rootId)
      .eq("user_id", user.id)
      .single();
    if (rootRaw) root = rootRaw as RevisitEntry;
  }

  const { data: revisitsRaw } = await db
    .from("journal_entries")
    .select(COLS)
    .eq("user_id", user.id)
    .eq("revisit_of", root.id)
    .order("created_at", { ascending: true });

  return (
    <RevisitClient
      chain={buildChain(root, (revisitsRaw || []) as RevisitEntry[])}
      userId={user.id}
      ready
    />
  );
}
