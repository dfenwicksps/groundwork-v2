"use client";

import Link from "next/link";

/**
 * The ordinary Tuesday at 21, surfaced where a student is actually thinking
 * about life after school.
 *
 * Future Self is step 1 of Mission 4 and stays there — this reads it back. It
 * was the last reflective mission step nothing downstream ever looked at, and
 * unlike the others it had no natural home in a program week: the weeks want
 * character and values material, and this is a picture of circumstances.
 * Circumstances are exactly what the Future tab is for, sitting above the
 * career pathways your strengths point at and the goals you set beyond
 * graduation.
 */
export default function FutureSelfSection({
  /** Their answers with the prompts stripped — see lib/journal.ts */
  excerpt,
  href,
}: {
  excerpt: string | null;
  href: string;
}) {
  return (
    <div data-animate="2" id="future-self">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Your ordinary Tuesday at 21
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        {excerpt
          ? "The picture you wrote in Mission 4. Everything below is about getting there — so it's worth checking it's still the one you want."
          : "Before pathways and goals mean much, it helps to have a picture of the life they're for."}
      </p>

      <div className="card p-5">
        {excerpt ? (
          <>
            <blockquote className="text-sm text-ink leading-relaxed border-l-2 border-navy/25 pl-3 whitespace-pre-line line-clamp-6">
              {excerpt}
            </blockquote>
            <Link
              href={href}
              className="text-xs text-teal hover:underline mt-3 inline-block"
            >
              Reread or rewrite it →
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-ink leading-relaxed mb-3">
              Mission 4 asks you to walk through a random Tuesday at 21 — where
              you wake up, what fills the afternoon, who&apos;s around. Vague
              futures don&apos;t pull at anything. Specific ones do.
            </p>
            <Link
              href={href}
              className="btn btn-primary w-full py-2.5 rounded-xl text-sm block text-center"
            >
              Future Self →
            </Link>
            <p className="text-[11px] text-ink-muted text-center mt-2">
              About ten minutes, in Mission 4.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
