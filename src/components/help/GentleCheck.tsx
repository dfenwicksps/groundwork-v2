"use client";

import Link from "next/link";

// ─── When it's been heavy lately ─────────────────────────────────────────────
// Shown when several recent entries read as hard on the self (lib/hardOnSelf).
// It suggests a different move rather than another lap of the same thoughts.
// Nothing about it is saved or sent. Shown after mission steps, the week's
// reflection, the weekly five and Next Chapter; the crisis card (SupportCard)
// takes its place whenever that's needed.

export default function GentleCheck() {
  return (
    <div
      className="rounded-2xl p-5 mb-5 border"
      style={{ background: "rgba(124,58,237,0.05)", borderColor: "rgba(124,58,237,0.2)" }}
      data-animate="2"
    >
      <div className="text-sm font-semibold text-[--ink] mb-1.5">
        You&apos;ve been hard on yourself lately.
      </div>
      <p className="text-sm text-[--ink-muted] leading-relaxed mb-3">
        A few things you&apos;ve written recently sound like a verdict on yourself,
        not just a rough day. Going over the same painful thoughts again and again
        tends to make them feel truer, not clearer. That&apos;s how minds work, not
        a flaw in you.
      </p>
      <ul className="text-sm text-[--ink] leading-relaxed space-y-1.5 mb-3 list-disc pl-5">
        <li>Write one line to yourself the way you&apos;d say it to a friend who wrote this.</li>
        <li>Do something for ten minutes instead: a walk, music, messaging someone.</li>
        <li>
          Talk it through with someone.{" "}
          <Link href="/support" className="text-[--teal] underline">
            People you can talk to
          </Link>
        </li>
      </ul>
      <p className="text-xs text-[--ink-muted] leading-relaxed">
        Only you can see this. It&apos;s worked out on your device, and nothing is
        saved or sent anywhere.
      </p>
    </div>
  );
}
