import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { topStrengths, strengthName } from "@/lib/strengths";
import {
  STORY_SOURCES,
  STORY_PARAGRAPH_ACTIVITY_ID,
  assembleStory,
  type StoryEntry,
  type StoryParagraph,
} from "@/lib/myStory";
import StoryClient from "./StoryClient";

export const dynamic = "force-dynamic";

export default async function MyStoryPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const [{ data: rows }, { data: profile }, { data: paragraphRows }] = await Promise.all([
    db
      .from("journal_entries")
      .select("activity_id, mission_id, response, created_at")
      .eq("user_id", user.id)
      .in("activity_id", STORY_SOURCES as unknown as string[])
      .order("created_at", { ascending: false }),
    db.from("strength_profiles").select("ranking").eq("user_id", user.id).maybeSingle(),
    // Every version of the paragraph, newest first: the latest leads the page,
    // and the earlier ones are its history.
    db
      .from("journal_entries")
      .select("id, response, created_at")
      .eq("user_id", user.id)
      .eq("activity_id", STORY_PARAGRAPH_ACTIVITY_ID)
      .order("created_at", { ascending: false }),
  ]);

  // Newest first, so the first one seen for each activity is the latest.
  const latest = new Map<string, StoryEntry>();
  for (const r of (rows || []) as StoryEntry[]) {
    if (!latest.has(r.activity_id)) latest.set(r.activity_id, r);
  }
  const ranking = (profile as { ranking: string[] } | null)?.ranking ?? [];

  return (
    <StoryClient
      userId={user.id}
      story={assembleStory(latest, topStrengths(ranking, 5).map(strengthName))}
      paragraphs={(paragraphRows || []) as StoryParagraph[]}
    />
  );
}
