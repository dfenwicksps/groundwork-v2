"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import HelpLines from "./HelpLines";

/**
 * "Need to talk?" — reachable from every screen. It opens a sheet over the
 * current page rather than navigating away, so a student halfway through an
 * activity doesn't lose what they've written by asking for help.
 *
 * `floating` pins it to the top-right corner (the app shell on a phone);
 * `rail` is a full-width row at the foot of the desktop side rail; `inline`
 * sits in an activity header row.
 */
export default function GetHelpButton({ variant }: { variant: "floating" | "rail" | "inline" }) {
  const [open, setOpen] = useState(false);
  // The shell renders one for the phone and one for the rail.
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "floating"
            ? "fixed right-3 z-30 rounded-full bg-white/95 backdrop-blur border border-surface-border shadow-soft px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
            : variant === "rail"
            ? "w-full text-left px-3 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-ink hover:border-navy/30 transition-colors"
            : "ml-auto flex-shrink-0 rounded-full border border-surface-border px-2.5 py-1 text-xs font-semibold text-ink-muted hover:text-ink"
        }
        style={variant === "floating" ? { top: "calc(env(safe-area-inset-top, 0px) + 10px)" } : undefined}
      >
        {variant === "inline" ? "Help" : "Need to talk?"}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-labelledby={titleId}
        className="w-[min(28rem,calc(100vw-2rem))] max-h-[85vh] rounded-2xl p-0 backdrop:bg-black/40"
      >
        <div className="p-5 bg-surface-muted">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 id={titleId} className="text-xl text-navy" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              You don&apos;t have to handle it alone.
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 -mr-1 rounded-lg text-ink-muted hover:text-ink"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-ink-muted mb-4 leading-relaxed">
            Talking to someone you trust is always a good move. These services are free and
            confidential, and they talk to people your age every day.
          </p>
          <HelpLines />
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="block text-center text-sm text-teal hover:underline mt-4"
          >
            Your support circle and ways to start a conversation
          </Link>
        </div>
      </dialog>
    </>
  );
}
