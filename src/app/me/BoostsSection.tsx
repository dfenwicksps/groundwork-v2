"use client";

import { useState } from "react";
import { BOOSTS } from "@/lib/boosts";

/**
 * "Build a quality" — practical guidance for the qualities the programme
 * develops: courage, vulnerability, resilience, self-belief, self-efficacy,
 * empathy, compassion, kindness.
 */
export default function BoostsSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div data-animate="5" id="boosts">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Build a quality
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        Short, practical guides — what each quality really is, and one way to grow
        it this week.
      </p>
      <div className="flex flex-wrap gap-2">
        {BOOSTS.map((b) => (
          <button
            key={b.key}
            onClick={() => setOpen(open === b.key ? null : b.key)}
            aria-expanded={open === b.key}
            className={`px-3 py-2 rounded-xl text-sm border transition-all flex items-center gap-1.5 ${
              open === b.key
                ? "bg-navy text-white border-navy"
                : "bg-white text-ink border-surface-border hover:border-navy/30"
            }`}
          >
            <span aria-hidden>{b.emoji}</span>
            {b.name}
          </button>
        ))}
      </div>
      {open && (() => {
        const b = BOOSTS.find((x) => x.key === open);
        if (!b) return null;
        return (
          <div className="card p-5 mt-3 space-y-3">
            <p className="text-sm text-ink leading-relaxed">{b.what}</p>
            <div className="rounded-xl px-4 py-3 bg-teal/5 border border-teal/20">
              <div className="text-[11px] font-bold text-teal uppercase tracking-widest mb-1">
                Try this week
              </div>
              <p className="text-sm text-ink leading-relaxed">{b.exercise}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
