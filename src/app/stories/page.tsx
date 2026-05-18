import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import StoriesClient from "./StoriesClient";

export const dynamic = 'force-dynamic';

export default async function StoriesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: stories } = await supabase
    .from("stories")
    .select("id, mission_id, title, teaser, tags")
    .order("mission_id");

  return <StoriesClient stories={stories || []} />;
}
