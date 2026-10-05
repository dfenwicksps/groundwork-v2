"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COUNTS_ANNOUNCED, COUNTS_START } from "@/lib/completionCounts";

const SEEN_KEY = "gw_notice_counts_v1";

/**
 * The privacy policy promises notice in the app before a change that matters
 * takes effect. This is that notice for the completion counts (see
 * lib/completionCounts.ts): shown once, on Home, to anyone who joined before
 * they were announced. Someone joining later reads it on the privacy page.
 */
export default function PolicyNotice({ joinedAt }: { joinedAt: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (new Date(joinedAt) >= new Date(`${COUNTS_ANNOUNCED}T00:00:00Z`)) return;
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, [joinedAt]);

  function dismiss() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // storage unavailable: it just shows again next time
    }
    setShow(false);
  }

  if (!show) return null;
  const startDate = new Date(`${COUNTS_START}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
  });

  return (
    <div role="status" className="card p-4" data-animate="1">
      <div className="text-sm font-semibold text-ink mb-1">A change to our privacy page</div>
      <p className="text-sm text-ink-muted leading-relaxed mb-3">
        From {startDate} we&apos;ll count how many students finish each step, as
        totals across everyone, to see where Groundwork loses people. Never what you
        wrote, and never who.{" "}
        <Link href="/privacy" className="text-teal underline">
          Read what&apos;s changed
        </Link>
      </p>
      <button onClick={dismiss} className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
        Got it
      </button>
    </div>
  );
}
