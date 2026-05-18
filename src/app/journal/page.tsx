import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import JournalClient from "./JournalClient";

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <JournalClient entries={entries || []} />;
}
