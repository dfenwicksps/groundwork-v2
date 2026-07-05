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

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data: strengthRow } = await supabase
    .from("strength_profiles")
    .select("ranking, scores, updated_at")
    .eq("user_id", user.id)
    .single();

  const { data: valuesRow } = await supabase
    .from("journal_entries")
    .select("response")
    .eq("user_id", user.id)
    .eq("activity_id", "values-clarifier")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const ranking =
    (strengthRow as { ranking: string[] } | null)?.ranking ?? null;
  const scores =
    (strengthRow as { scores: Record<string, number> } | null)?.scores ?? {};
  const values = ((valuesRow as { response: string } | null)?.response || "")
    .split("\n")
    .map((l) => l.split(":")[0].trim())
    .filter(Boolean);

  return (
    <MeClient
      displayName={(profile as { display_name: string } | null)?.display_name || ""}
      ranking={ranking}
      scores={scores}
      values={values}
    />
  );
}
