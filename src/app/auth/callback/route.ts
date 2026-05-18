import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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

  return NextResponse.redirect(new URL("/auth", requestUrl.origin));
}
