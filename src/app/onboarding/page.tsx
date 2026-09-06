import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

/**
 * Onboarding, guarded.
 *
 * The form itself has no idea whether it has already been filled in, so anyone
 * who reached /onboarding again — a bookmark, the back button, a stale tab —
 * could run it a second time. Nothing is lost when they do (the finish handler
 * only sets onboarding_complete and display_name), but it writes a duplicate
 * onboarding_results row and can add the same trusted person twice.
 *
 * Checked on the server so a student who is already onboarded never sees a
 * flash of step 1 before being moved on — the same shape as the dashboard's
 * check in the opposite direction.
 */
export default async function OnboardingPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data } = await (supabase as any)
    .from("users")
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  // A missing row means the auto-create trigger hasn't run yet, which is a
  // reason to show onboarding rather than skip it.
  if ((data as { onboarding_complete?: boolean } | null)?.onboarding_complete) {
    redirect("/dashboard");
  }

  return <OnboardingClient />;
}
