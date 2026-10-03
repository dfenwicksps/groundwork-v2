"use client";

import Link from "next/link";
import { shortDate, talkDue, whoToYou, type NextChapter } from "@/lib/nextChapter";

/**
 * The way into the next-chapter plan from the Future tab, above the picture at
 * 21, the pathways and the goals: it's the part of the tab that asks the
 * student to decide something and go and find out.
 */
export default function NextChapterSection({ plan }: { plan: NextChapter | null }) {
  return (
    <div data-animate="2" id="next-chapter">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Your next chapter
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        {plan
          ? "The plan you made for what's next."
          : "The options in front of you, the version of next year you're hoping for and the one you'd rather avoid, and someone to ask. About ten minutes."}
      </p>
      <Link href="/next" className="card p-5 block hover:border-navy/30 transition-all">
        {plan ? (
          <>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Hoping for</div>
            <p className="text-sm text-ink leading-relaxed line-clamp-3">{plan.hoping}</p>
            <p className="text-xs text-teal mt-3">
              {plan.foundOut
                ? "Open your plan →"
                : talkDue(plan)
                  ? `Did you talk to ${whoToYou(plan.who)}? Write it up →`
                  : `Asking ${whoToYou(plan.who)}${plan.talkBy ? ` by ${shortDate(plan.talkBy)}` : ""} · Open your plan →`}
            </p>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-ink mb-1">Plan your next chapter</div>
            <p className="text-xs text-teal">Start →</p>
          </>
        )}
      </Link>
    </div>
  );
}
