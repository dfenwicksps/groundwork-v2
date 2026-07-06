"use client";

import { useState } from "react";
import { suggestPathways } from "@/lib/pathways";

/**
 * "Where your strengths could take you" — career clusters computed from the
 * user's own top-5 strengths and chosen values. Exploratory, never
 * prescriptive: framed as directions worth investigating, not predictions.
 */
export default function PathwaysSection({
  top5,
  values,
}: {
  top5: string[];
  values: string[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const suggestions = suggestPathways(top5, values, 3);
  if (suggestions.length === 0) return null;

  return (
    <div data-animate="4">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Where your strengths could take you
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        Directions your profile points toward — not predictions, just places worth
        exploring. Built from your actual strengths and values.
      </p>
      <div className="space-y-2">
        {suggestions.map(({ cluster, fromStrengths, fromValues }) => {
          const isOpen = open === cluster.key;
          return (
            <div key={cluster.key} className="card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : cluster.key)}
                className="w-full p-4 flex items-center gap-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden>
                  {cluster.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink">{cluster.name}</div>
                  <div className="text-xs text-ink-muted">{cluster.blurb}</div>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`flex-shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-surface-border pt-3 space-y-3">
                  <p className="text-xs text-ink leading-relaxed">
                    <span className="font-semibold text-teal">Why it fits you: </span>
                    {fromStrengths.length > 0 && (
                      <>your strength{fromStrengths.length > 1 ? "s" : ""} in{" "}
                      <span className="font-medium">{fromStrengths.join(", ")}</span></>
                    )}
                    {fromStrengths.length > 0 && fromValues.length > 0 && " — and "}
                    {fromValues.length > 0 && (
                      <>valuing <span className="font-medium">{fromValues.join(", ")}</span></>
                    )}
                    {" "}point here.
                  </p>
                  <div>
                    <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                      Example paths
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.roles.map((r) => (
                        <span key={r} className="px-2.5 py-1 rounded-full text-xs bg-surface-muted border border-surface-border text-ink">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                      Subjects that feed it
                    </div>
                    <p className="text-xs text-ink-muted">{cluster.subjects.join(" · ")}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
