import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { getRoles, staffHome } from "@/lib/v3/roles";
import { classifySignInProblem } from "@/lib/v3/signInProblem";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // What went wrong, if anything, so the sign-in page can say so instead of
  // silently reappearing. Only a short reference is passed on.
  let problem = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");

  if (code) {
    const supabase = createServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) problem = exchangeError.message;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // v3: take up any staff invite waiting for this address, and send staff
      // to their own area rather than through the student welcome.
      const roles = await getRoles();
      const home = roles ? staffHome(roles) : null;
      if (home) return NextResponse.redirect(new URL(home, requestUrl.origin));

      const { data } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();

      const profile = data as { onboarding_complete: boolean } | null;

      if (profile?.onboarding_complete) {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }
    }
  }

  const back = new URL("/auth", requestUrl.origin);
  if (problem || code) {
    // The provider's own wording goes to the server log, not the address bar.
    console.error("Sign-in didn't finish:", problem ?? "no session after exchanging the code");
    back.searchParams.set("problem", classifySignInProblem(problem));
  }
  return NextResponse.redirect(back);
}
