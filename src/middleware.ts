import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/missions",
  "/journal",
  "/stories",
  "/support",
  "/settings",
  "/onboarding",
  "/revisit",
  "/me",
  // v3
  "/home",
  "/grow",
  "/join",
  "/teach",
  "/school",
  "/platform",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase sometimes redirects the OAuth code to the Site URL (/) instead of
  // /auth/callback when the redirect URL pattern doesn't match. Catch it here
  // and forward to the callback route so the code gets exchanged properly.
  const code = request.nextUrl.searchParams.get("code");
  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // v3: the four mission pages gave way to the map (D50). Old links, and the
  // few "back to mission" links still in v2's screens, land on the part of
  // the map that carries the mission's name. Steps keep their addresses.
  const oldMission = pathname.match(/^\/missions(?:\/([1-4]))?\/?$/);
  if (oldMission) {
    const url = request.nextUrl.clone();
    url.pathname = "/grow";
    url.search = "";
    url.hash = oldMission[1] ? ["identity", "purpose", "connection", "meaning"][Number(oldMission[1]) - 1] : "";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const redirectUrl = new URL("/auth", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
