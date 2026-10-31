"use client";

import Link from "next/link";
import { PHASE_INFO, type Phase } from "@/lib/phase";

/**
 * Shows which of the three journey phases the student is in, what it's for, and
 * where to go next. The phase is "how deep" the whole journey currently goes;
 * it complements the Me page's Discover→Launch strip, which is "what areas".
 * See src/lib/phase.ts.
 */
export default function PhaseBanner({
  phase,
  href,
}: {
  phase: Phase;
  /** Where the CTA points; defaults to the Me page. */
  href?: string;
}) {
  const info = PHASE_INFO[phase];
  const target = href ?? "/me";

  return (
    <div
      className="rounded-2xl p-4 lg:p-5 text-white"
      style={{ background: "var(--navy)" }}
      data-animate="1"
    >
      <div className="flex items-center gap-2 mb-2">
        {([1, 2, 3] as Phase[]).map((p) => (
          <span
            key={p}
            aria-hidden
            className="h-1.5 flex-1 rounded-full"
            style={{ background: p <= phase ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)" }}
          />
        ))}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80">
            Phase {phase} of 3 · {info.name}
          </div>
          <p className="text-sm leading-relaxed mt-1 opacity-95">{info.blurb}</p>
        </div>
      </div>
      <Link
        href={target}
        className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-3.5 py-2"
      >
        {info.cta}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
