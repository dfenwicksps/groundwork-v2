import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import MeClient from "./MeClient";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;

  const [
    { data: profile },
    { data: strengthRow },
    { data: valuesRow },
    { data: moralRow },
    { data: goalsRaw },
    { data: practiceRaw },
    { data: commitmentRow },
  ] = await Promise.all([
    db.from("users").select("display_name").eq("id", user.id).single(),
    db
      .from("strength_profiles")
      .select("ranking, scores")
      .eq("user_id", user.id)
      .single(),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "values-clarifier")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("moral_profiles")
      .select("primary_style, secondary_style, style_scores")
      .eq("user_id", user.id)
      .single(),
    db
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    db
      .from("practice_log")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(6),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "commitment-statement")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const ranking: string[] | null = strengthRow?.ranking ?? null;
  const scores: Record<string, number> = strengthRow?.scores ?? {};
  const values = ((valuesRow?.response as string) || "")
    .split("\n")
    .map((l: string) => l.split(":")[0].trim())
    .filter(Boolean);

  const practices = (practiceRaw || []) as {
    id: string;
    strength_key: string;
    action: string;
    started_at: string;
    completed_at: string | null;
    reflection: string | null;
  }[];
  const activePractice = practices.find((p) => !p.completed_at) || null;
  const recentPractices = practices.filter((p) => p.completed_at).slice(0, 3);

  return (
    <MeClient
      userId={user.id}
      displayName={profile?.display_name || ""}
      ranking={ranking}
      scores={scores}
      values={values}
      moralProfile={moralRow ?? null}
      goals={goalsRaw || []}
      activePractice={activePractice}
      recentPractices={recentPractices}
      commitmentExcerpt={((commitmentRow?.response as string) || "").slice(0, 140) || null}
    />
  );
}
