import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { topStrengths, strengthName } from "@/lib/strengths";
import { STORY_SOURCES, assembleStory, type StoryEntry } from "@/lib/myStory";
import StoryClient from "./StoryClient";

export const dynamic = "force-dynamic";

export default async function MyStoryPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const [{ data: rows }, { data: profile }] = await Promise.all([
    db
      .from("journal_entries")
      .select("activity_id, mission_id, response, created_at")
      .eq("user_id", user.id)
      .in("activity_id", STORY_SOURCES as unknown as string[])
      .order("created_at", { ascending: false }),
    db.from("strength_profiles").select("ranking").eq("user_id", user.id).maybeSingle(),
  ]);

  // Newest first, so the first one seen for each activity is the latest.
  const latest = new Map<string, StoryEntry>();
  for (const r of (rows || []) as StoryEntry[]) {
    if (!latest.has(r.activity_id)) latest.set(r.activity_id, r);
  }
  const ranking = (profile as { ranking: string[] } | null)?.ranking ?? [];

  return <StoryClient story={assembleStory(latest, topStrengths(ranking, 5).map(strengthName))} />;
}
