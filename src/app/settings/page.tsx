import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";
import { clarifierValues } from "@/lib/journal";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: _raw } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = _raw as {
    display_name: string | null;
    ai_reflections_enabled: boolean | null;
  } | null;

  const { data: onboarding } = await supabase
    .from("onboarding_results")
    .select("values")
    .eq("user_id", user.id)
    .single();
  const savedValues = (onboarding as { values: string[] } | null)?.values ?? [];

  const { data: clarifier } = await supabase
    .from("journal_entries")
    .select("response")
    .eq("user_id", user.id)
    .eq("activity_id", "values-clarifier")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const missionValues = clarifierValues((clarifier as { response: string } | null)?.response);

  return (
    <SettingsClient
      userId={user.id}
      email={user.email || ""}
      displayName={profile?.display_name || ""}
      savedValues={savedValues}
      missionValues={missionValues}
      aiReflectionsEnabled={profile?.ai_reflections_enabled ?? true}
    />
  );
}
