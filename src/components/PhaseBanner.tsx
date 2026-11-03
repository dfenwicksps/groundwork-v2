"use client";

import Link from "next/link";
import { ANCHOR_ACTIVITY_IDS, ANCHOR_LINKS, PHASE_INFO, type Phase } from "@/lib/phase";

/**
 * Shows which of the three journey phases the student is in, what it's for, and
 * where to go next. The phase is "how deep" the whole journey currently goes;
 * it complements the Me page's Discover→Launch strip, which is "what areas".
 * See src/lib/phase.ts.
 */
export default function PhaseBanner({
  phase,
  href,
  reviewed = [],
}: {
  phase: Phase;
  /** Where the CTA points; defaults to the Me page. */
  href?: string;
  /** Anchors already reviewed — Phase 2 shows them as a checklist. */
  reviewed?: string[];
}) {
  const info = PHASE_INFO[phase];
  const done = new Set(reviewed);
  // In Phase 2 the CTA goes to the first anchor still to review.
  const nextAnchor = ANCHOR_ACTIVITY_IDS.find((id) => !done.has(id));
  const target =
    phase === 2 && nextAnchor ? ANCHOR_LINKS[nextAnchor].href : href ?? "/me";

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
      {phase === 2 && (
        <div className="mt-3">
          <p className="text-xs opacity-80 mb-1.5">
            {done.size} of {ANCHOR_ACTIVITY_IDS.length} reviewed. Review all{" "}
            {ANCHOR_ACTIVITY_IDS.length} to unlock Phase 3.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ANCHOR_ACTIVITY_IDS.map((id) => (
              <li key={id}>
                <Link
                  href={ANCHOR_LINKS[id].href}
                  className="flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 bg-black/15 hover:bg-black/25 transition-colors"
                >
                  <span aria-hidden>{done.has(id) ? "✓" : "○"}</span>
                  <span className={done.has(id) ? "opacity-70" : ""}>{ANCHOR_LINKS[id].label}</span>
                  <span className="sr-only">{done.has(id) ? "(reviewed)" : "(to review)"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link
        href={target}
        className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold bg-black/20 hover:bg-black/30 transition-colors rounded-xl px-3.5 py-2"
      >
        {info.cta}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
