"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COUNTS_ANNOUNCED,
  COUNTS_START,
  STORY_COUNTS_ANNOUNCED,
  STORY_COUNTS_START,
} from "@/lib/completionCounts";

/**
 * The privacy policy promises notice in the app before a change that matters
 * takes effect. These are those notices for the totals Groundwork counts (see
 * lib/completionCounts.ts): each shown once, on Home, to anyone who joined
 * before it was announced. Someone joining later reads it on the privacy page.
 * One at a time, oldest first, so Home never stacks them.
 */
const NOTICES = [
  {
    seenKey: "gw_notice_counts_v1",
    announced: COUNTS_ANNOUNCED,
    start: COUNTS_START,
    text: (date: string) =>
      `From ${date} we'll count how many students finish each step, as totals across everyone, to see where Groundwork loses people. Never what you wrote, and never who.`,
  },
  {
    seenKey: "gw_notice_story_counts_v1",
    announced: STORY_COUNTS_ANNOUNCED,
    start: STORY_COUNTS_START,
    text: (date: string) =>
      `From ${date} we'll also count how many students open, finish and reflect on each story, as totals across everyone, to work out which stories help. Never what you wrote, and never who.`,
  },
];

function seen(key: string): boolean {
  try {
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
}

export default function PolicyNotice({ joinedAt }: { joinedAt: string }) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const joined = new Date(joinedAt);
    const i = NOTICES.findIndex(
      (n) => joined < new Date(`${n.announced}T00:00:00Z`) && !seen(n.seenKey)
    );
    setIndex(i === -1 ? null : i);
  }, [joinedAt]);

  if (index === null) return null;
  const notice = NOTICES[index];

  function dismiss() {
    try {
      localStorage.setItem(notice.seenKey, "1");
    } catch {
      // storage unavailable: it just shows again next time
    }
    const joined = new Date(joinedAt);
    const next = NOTICES.findIndex(
      (n, i) => i > index! && joined < new Date(`${n.announced}T00:00:00Z`) && !seen(n.seenKey)
    );
    setIndex(next === -1 ? null : next);
  }

  const startDate = new Date(`${notice.start}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
  });

  return (
    <div role="status" className="card p-4" data-animate="1">
      <div className="text-sm font-semibold text-ink mb-1">A change to our privacy page</div>
      <p className="text-sm text-ink-muted leading-relaxed mb-3">
        {notice.text(startDate)}{" "}
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
