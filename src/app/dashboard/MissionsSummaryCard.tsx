"use client";

import Link from "next/link";
import { STRENGTH_BY_KEY } from "@/lib/strengths";
import type { MissionSummary } from "@/lib/missionSummary";

/**
 * What the four missions identified, in the space the active-mission card used
 * to occupy.
 *
 * Before this, a student who had finished everything still saw "Mission 4 —
 * Active" with "All 5 steps done" and a Continue button: an invitation to carry
 * on with something already complete, and the last thing the dashboard said
 * about four missions' worth of work. This says what the work found instead,
 * and keeps every part of it one tap from being redone.
 */
export default function MissionsSummaryCard({
  summary,
}: {
  summary: MissionSummary;
}) {
  const rows: { mission: number; label: string; text: string }[] = [
    { mission: 2, label: "What you care about", text: summary.cares },
    { mission: 3, label: "Where you're most yourself", text: summary.belongs },
    { mission: 4, label: "The thread through all of it", text: summary.thread },
  ].filter((r) => r.text);

  return (
    <div data-animate="2">
      <div className="flex items-baseline gap-2 flex-wrap mb-3">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Your missions
        </h2>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ background: "var(--sage)", color: "white" }}
        >
          All four done
        </span>
      </div>

      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "var(--navy)" }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }}
          aria-hidden
        />
        <div className="relative">
          <p
            className="text-xl mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            The missions identified:
          </p>

          {summary.strengths.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">
                Your strengths
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.strengths.map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15"
                  >
                    <span aria-hidden className="mr-1">
                      {STRENGTH_BY_KEY[k]?.emoji}
                    </span>
                    {STRENGTH_BY_KEY[k]?.name ?? k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {summary.values.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">
                Your values
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.values.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border border-white/30"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-3 mb-1">
              {rows.map((r) => (
                <div key={r.mission}>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
                    {r.label}
                  </div>
                  {/* Their own words, clamped — the full entry is in the
                      journal and the mission is one tap away. */}
                  <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-line">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed mt-2">
        None of this is fixed — people change, and the answers should keep up.{" "}
        <Link href="/missions" className="text-teal hover:underline font-medium">
          Revisit or redo any mission →
        </Link>
      </p>
    </div>
  );
}
