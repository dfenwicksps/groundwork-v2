"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

// Translate raw Supabase auth errors into language a teenager can act on.
function friendlyAuthError(message: string, mode: "login" | "signup"): string {
  const m = message.toLowerCase();
  if (m.includes("email not confirmed")) {
    return "Your email isn't confirmed yet — check your inbox for the link we sent you (it might be in spam).";
  }
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("is invalid")) {
    return "That email address doesn't look right — double-check it?";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "There's already an account with that email. Try signing in instead.";
  }
  if (m.includes("at least") && m.includes("characters")) {
    return "Your password needs to be at least 8 characters.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts — give it a minute, then try again.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return mode === "signup"
    ? "Something went wrong creating your account. Please try again."
    : "Something went wrong signing you in. Please try again.";
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");

  // Stable client instance so the mount-only session check has honest deps.
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(friendlyAuthError(error.message, "signup"));
      } else if (data.session) {
        // Email confirmation is disabled — the user already has a session,
        // so don't tell them to check an inbox that has nothing in it.
        router.push("/onboarding");
      } else {
        setSuccess("Check your email for a confirmation link. Once confirmed, you can sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(friendlyAuthError(error.message, "login"));
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await (supabase as any)
            .from("users")
            .select("onboarding_complete")
            .eq("id", user.id)
            .single();
          const profile = data as { onboarding_complete: boolean } | null;
          if (profile?.onboarding_complete) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }
      }
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    setError(null);
    if (!email) {
      setError("Type your email above first, then tap \"Forgot password?\" again.");
      return;
    }
    setResetState("sending");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) {
      setResetState("idle");
      setError(friendlyAuthError(error.message, "login"));
    } else {
      setResetState("sent");
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center px-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">G</span>
            </div>
            <span className="font-semibold text-navy text-xl" style={{ fontFamily: "var(--font-display)" }}>
              Groundwork
            </span>
          </div>
          <h1 className="text-2xl text-navy mt-4" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            {mode === "login" ? "Welcome back" : "Start your journey"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {mode === "login"
              ? "Sign in to continue where you left off."
              : "Create a free account to begin Mission 1."}
          </p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">✉️</div>
              <p className="text-sage font-medium mb-2">Check your inbox</p>
              <p className="text-sm text-ink-muted">{success}</p>
              <button
                onClick={() => { setSuccess(null); setMode("login"); }}
                className="mt-6 btn btn-secondary w-full"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">First name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" className="input" required autoComplete="given-name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" required autoComplete="email" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-ink">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetState !== "idle"}
                      className="text-xs text-teal hover:text-teal-dark transition-colors disabled:opacity-60"
                    >
                      {resetState === "sending"
                        ? "Sending…"
                        : resetState === "sent"
                        ? "Reset link sent ✓"
                        : "Forgot password?"}
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                  className="input" required minLength={mode === "signup" ? 8 : undefined}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"} />
              </div>
              {resetState === "sent" && (
                <div role="status" className="text-sm text-sage bg-sage/5 border border-sage/20 rounded-lg px-4 py-3">
                  Password reset link sent to {email}. The link signs you in —
                  you can then set a new password in Settings.
                </div>
              )}
              {error && (
                <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
                {loading ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-xs text-ink-muted">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>
              <button onClick={handleGoogleSignIn} disabled={loading} className="btn btn-secondary w-full gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-ink-muted mt-5">
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); }} className="text-teal font-medium hover:underline">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(null); }} className="text-teal font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
