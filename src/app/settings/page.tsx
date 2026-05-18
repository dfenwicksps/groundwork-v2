import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";

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
  const profile = _raw as { display_name: string | null } | null;

  const { data: onboarding } = await supabase
    .from("onboarding_results")
    .select("values")
    .eq("user_id", user.id)
    .single();
  const savedValues = (onboarding as { values: string[] } | null)?.values ?? [];

  return (
    <SettingsClient
      userId={user.id}
      email={user.email || ""}
      displayName={profile?.display_name || ""}
      savedValues={savedValues}
    />
  );
}
