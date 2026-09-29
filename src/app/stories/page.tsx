import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import StoriesClient from "./StoriesClient";

export const dynamic = 'force-dynamic';

export default async function StoriesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: stories }, { data: reads }] = await Promise.all([
    supabase
      .from("stories")
      .select("id, mission_id, title, teaser, tags")
      .order("mission_id"),
    supabase
      .from("story_reads")
      .select("story_id, read_at, actioned_at")
      .eq("user_id", user.id),
  ]);

  return <StoriesClient stories={stories || []} reads={reads || []} />;
}
