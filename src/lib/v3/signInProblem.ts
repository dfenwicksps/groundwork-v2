// ─── Why a sign-in didn't finish ─────────────────────────────────────────────
// When Google or Microsoft sign-in fails, Supabase sends the browser back with
// an error instead of a code, and the callback used to drop it and show the
// sign-in page with no explanation. This turns the raw error into a short
// reference the sign-in page can show, so the person knows it wasn't them and
// whoever runs the site knows where to look.
//
// Only the reference goes in the address bar: never the raw message, an email
// address or anything else about the person.

export type SignInProblem = "provider" | "database" | "expired" | "denied" | "other";

export function classifySignInProblem(raw: string | null | undefined): SignInProblem {
  const s = (raw ?? "").toLowerCase();
  // The provider's client ID, secret or redirect address is wrong in Supabase.
  if (s.includes("exchange external code") || s.includes("invalid_client") || s.includes("redirect_uri")) return "provider";
  // The database refused to create the profile row.
  if (s.includes("database error")) return "database";
  // The sign-in was started in another browser, tab or address, or took too long.
  if (s.includes("code verifier") || s.includes("flow state") || s.includes("expired") || s.includes("invalid request")) return "expired";
  if (s.includes("access_denied") || s.includes("denied")) return "denied";
  return "other";
}

const MESSAGES: Record<SignInProblem, string> = {
  provider: "Signing in that way isn't working right now. It's a set-up problem on our side, not something you did. Use your email below for now.",
  database: "We couldn't set up your account just then. It's a problem on our side, not something you did. Please try again in a minute.",
  expired: "That sign-in didn't finish. Start again from this page, and stay in the same browser tab until you're back here.",
  denied: "The sign-in was cancelled. You can try again, or use your email below.",
  other: "That sign-in didn't finish. Please try again, or use your email below.",
};

export function isSignInProblem(v: string | null | undefined): v is SignInProblem {
  return !!v && Object.prototype.hasOwnProperty.call(MESSAGES, v);
}

/** What the sign-in page shows. The reference in brackets is for whoever runs the site. */
export function signInProblemMessage(p: SignInProblem): string {
  return `${MESSAGES[p]} (Ref: ${p})`;
}
