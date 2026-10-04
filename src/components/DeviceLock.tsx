"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  PIN_LENGTH,
  RELOCK_AFTER_MS,
  checkPin,
  clearLock,
  hasLock,
  isPublicPath,
  isUnlocked,
  markUnlocked,
  relock,
} from "@/lib/deviceLock";

/**
 * The code screen for the device passcode (lib/deviceLock.ts). Mounted once in
 * the root layout, beside the page. While locked, the page itself is hidden by
 * the gw-locked class on <html>, and this is the only thing shown.
 */
export default function DeviceLock() {
  const pathname = usePathname();
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hiddenAt = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Decide on every navigation: a public page never asks, a private one asks
  // until this tab has been unlocked.
  useEffect(() => {
    const shouldLock = hasLock() && !isUnlocked() && !isPublicPath(pathname);
    setLocked(shouldLock);
    if (shouldLock) document.documentElement.classList.add("gw-locked");
    else document.documentElement.classList.remove("gw-locked");
  }, [pathname]);

  // Away for a while: ask again when they come back.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) {
        hiddenAt.current = null;
        if (hasLock() && !isPublicPath(window.location.pathname)) {
          relock();
          setPin("");
          setLocked(true);
        }
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (locked) setTimeout(() => inputRef.current?.focus(), 50);
  }, [locked]);

  async function tryPin(value: string) {
    setBusy(true);
    const ok = await checkPin(value);
    setBusy(false);
    if (ok) {
      markUnlocked();
      setLocked(false);
      setPin("");
      setError(null);
    } else {
      setError("That's not it. Try again.");
      setPin("");
      inputRef.current?.focus();
    }
  }

  async function forgot() {
    // Removing the lock means signing out; getting back in takes the password.
    await createClient().auth.signOut();
    clearLock();
    window.location.href = "/auth";
  }

  if (!locked) return null;

  return (
    <div
      id="gw-lock"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gw-lock-title"
      className="fixed inset-0 z-[100] bg-surface-muted flex items-center justify-center px-6"
    >
      <div className="w-full max-w-xs text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-navy text-white flex items-center justify-center" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="4.5" y="9.5" width="13" height="9" rx="2" />
            <path d="M7.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" />
          </svg>
        </div>
        <h1 id="gw-lock-title" className="text-xl text-navy mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Groundwork is locked
        </h1>
        <p className="text-sm text-ink-muted mb-5">Enter your {PIN_LENGTH}-digit code.</p>
        <label htmlFor="gw-lock-pin" className="sr-only">
          Passcode
        </label>
        <input
          ref={inputRef}
          id="gw-lock-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={PIN_LENGTH}
          value={pin}
          disabled={busy}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
            setPin(v);
            setError(null);
            if (v.length === PIN_LENGTH) tryPin(v);
          }}
          className="input text-center text-2xl tracking-[0.6em] mb-2"
        />
        <p role="alert" className="text-sm text-red-600 min-h-[1.25rem] mb-4">
          {error}
        </p>
        <button onClick={forgot} className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
          Forgot it? Sign out to remove the lock
        </button>
      </div>
    </div>
  );
}
