/**
 * Translates raw Supabase auth errors into language a teenager can act on.
 *
 * Supabase surfaces rate limits as opaque strings ("For security purposes, you
 * can only request this after 47 seconds", "email rate limit exceeded"). Shown
 * verbatim they read as an accusation, and the second form gives no wait time
 * at all — so a student whose very first attempt collided with a school's
 * shared IP has no idea whether to wait ten seconds or give up. We parse out
 * the wait where Supabase gives one, supply a sensible one where it doesn't,
 * and always say plainly that the block is about timing, not about them.
 */

export interface AuthErrorInfo {
  /** Human-readable message to show the user. */
  message: string;
  /** Seconds until the user may retry, when the error is a rate limit. */
  retryAfterSeconds?: number;
}

/** Fallback wait for rate limits Supabase reports without a duration. */
const DEFAULT_RATE_LIMIT_WAIT = 60;

function parseSeconds(raw: string): number | null {
  // "For security purposes, you can only request this after 47 seconds."
  const seconds = raw.match(/after (\d+) seconds?/i);
  if (seconds) return parseInt(seconds[1], 10);
  const minutes = raw.match(/after (\d+) minutes?/i);
  if (minutes) return parseInt(minutes[1], 10) * 60;
  return null;
}

export function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const mins = Math.ceil(seconds / 60);
  return `${mins} minute${mins === 1 ? "" : "s"}`;
}

export function describeAuthError(
  raw: string,
  mode: "login" | "signup" | "magic"
): AuthErrorInfo {
  const lower = raw.toLowerCase();

  // --- Rate limits -------------------------------------------------------
  const isRateLimit =
    lower.includes("rate limit") ||
    lower.includes("for security purposes") ||
    lower.includes("too many requests") ||
    lower.includes("too many") ||
    lower.includes("over_email_send_rate_limit");

  if (isRateLimit) {
    const wait = parseSeconds(raw) ?? DEFAULT_RATE_LIMIT_WAIT;

    // Email-send limits are per-project and routinely tripped by someone else
    // on the same school network, so never phrase this as the user's fault.
    const sharedLimit =
      lower.includes("email rate limit") ||
      lower.includes("over_email_send_rate_limit");

    return {
      retryAfterSeconds: wait,
      message: sharedLimit
        ? `We're sending too many emails at once right now — this isn't about anything you did, and it can happen on a school network. Try again in ${formatWait(
            wait
          )}.`
        : `Too many attempts in a row. Try again in ${formatWait(wait)}.`,
    };
  }

  // --- Ordinary auth failures -------------------------------------------
  if (lower.includes("email not confirmed")) {
    return {
      message:
        "You haven't confirmed your email yet. Check your inbox, or use the sign-in link option below.",
    };
  }

  if (lower.includes("invalid login credentials")) {
    return { message: "That email and password don't match. Have another go." };
  }

  if (lower.includes("is invalid") || lower.includes("unable to validate email")) {
    return { message: "That email address doesn't look right — double-check it?" };
  }

  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return {
      message: "There's already an account with that email. Try signing in instead.",
    };
  }

  if (lower.includes("at least") && lower.includes("characters")) {
    return { message: "Your password needs to be at least 8 characters." };
  }

  if (lower.includes("signups not allowed") || lower.includes("signup is disabled")) {
    return { message: "New sign-ups are paused right now. Try again later." };
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return { message: "We couldn't reach the server. Check your connection and try again." };
  }

  // --- Anything we haven't seen before ----------------------------------
  return {
    message:
      mode === "signup"
        ? "We couldn't create your account just then. Give it another try."
        : mode === "magic"
        ? "We couldn't send that link just then. Give it another try."
        : "We couldn't sign you in just then. Give it another try.",
  };
}
