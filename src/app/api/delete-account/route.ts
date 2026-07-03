import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";

/**
 * Permanently delete the signed-in user's account.
 *
 * Uses the Supabase service role key to delete the auth user; every app table
 * (users, journal_entries, onboarding_results, challenges, support_circle,
 * mission_progress) references auth.users with ON DELETE CASCADE, so this one
 * call removes all of the user's data.
 *
 * If the service key isn't configured we return 501 so the client can tell
 * the user the truth instead of pretending the deletion happened.
 */
export async function POST() {
  // Identify the caller from their session cookie.
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    return NextResponse.json(
      { error: "Account deletion isn't available right now. Please contact us and we'll remove your data." },
      { status: 501 }
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { error: "Something went wrong deleting your account. Please try again or contact us." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
