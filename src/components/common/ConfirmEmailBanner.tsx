"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { describeAuthError, formatWait } from "@/lib/authErrors";

const DISMISS_KEY = "gw_confirm_banner_dismissed";

/**
 * Shown inside the app when someone is signed in but hasn't confirmed their
 * email. The point is that nobody is held at the door — they can do Mission 1
 * now and confirm whenever. When the Supabase project requires confirmation
 * there is no session to render this in, so it simply never appears.
 */
export default function ConfirmEmailBanner() {
  const [email, setEmail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (cancelled || !user || user.email_confirmed_at || !user.email) return;
        setEmail(user.email);
        try {
          setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
        } catch {
          setDismissed(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  async function resend() {
    if (!email || secondsLeft > 0) return;
    setStatus("sending");
    setError(null);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      const info = describeAuthError(error.message, "signup");
      setError(info.message);
      if (info.retryAfterSeconds) setSecondsLeft(info.retryAfterSeconds);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private browsing — the banner simply returns next page load */
    }
  }

  if (!email || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-start gap-3 text-sm">
        <span aria-hidden className="mt-0.5">✉️</span>
        <div className="flex-1 min-w-0">
          <p className="text-ink leading-snug">
            Confirm your email to keep your progress safe.{" "}
            <span className="text-ink-muted">
              Everything works in the meantime — this just means you won&apos;t lose it.
            </span>
          </p>
          {error && <p className="text-xs text-ink-muted mt-1">{error}</p>}
          <div className="flex items-center gap-4 mt-1">
            {status === "sent" ? (
              <span className="text-xs text-sage font-medium">Sent — check {email}.</span>
            ) : (
              <button
                onClick={resend}
                disabled={status === "sending" || secondsLeft > 0}
                className="text-xs font-medium text-teal hover:underline disabled:text-ink-muted disabled:no-underline"
              >
                {secondsLeft > 0
                  ? `Resend in ${formatWait(secondsLeft)}`
                  : status === "sending"
                  ? "Sending…"
                  : "Resend the link"}
              </button>
            )}
            <button onClick={dismiss} className="text-xs text-ink-muted hover:text-ink">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
