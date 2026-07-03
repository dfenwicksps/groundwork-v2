"use client";

import { useState } from "react";
import { MISSIONS, getActivityLabel } from "@/lib/missions";
import { formatDate, isWithin24Hours, truncate, parseReflection } from "@/lib/utils";
import type { JournalEntry } from "@/types/database";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

export default function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter
    ? entries.filter((e) => e.mission_id === filter)
    : entries;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div data-animate="1" className="mb-6">
          <h1
            className="text-3xl text-navy mb-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Your journal
          </h1>
          <p className="text-ink-muted text-sm">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} — private
            to you
          </p>
        </div>

        {/* Filter */}
        <div data-animate="2" className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filter === null
                ? "bg-navy text-white border-navy"
                : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
            )}
          >
            All
          </button>
          {MISSIONS.map((m) => {
            const count = entries.filter((e) => e.mission_id === m.id).length;
            if (count === 0) return null;
            return (
              <button
                key={m.id}
                onClick={() => setFilter(m.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                  filter === m.id
                    ? "text-white border-transparent"
                    : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
                )}
                style={filter === m.id ? { background: m.colour } : {}}
              >
                {m.title}
                <span className="text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <div
            data-animate="3"
            className="card p-10 text-center"
          >
            <div className="text-3xl mb-3">📝</div>
            <p className="text-ink-muted">No entries yet.</p>
          </div>
        ) : (
          <div className="space-y-3" data-animate="3">
            {filtered.map((entry) => {
              const mission = MISSIONS.find((m) => m.id === entry.mission_id);
              const isOpen = expanded === entry.id;
              const canEdit = isWithin24Hours(entry.created_at);
              const label =
                getActivityLabel(entry.activity_id);

              return (
                <div key={entry.id} className="card overflow-hidden">
                  <button
                    onClick={() =>
                      setExpanded(isOpen ? null : entry.id)
                    }
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ background: mission?.colour || "#1B3A5C" }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-ink">
                              {label}
                            </span>
                            {entry.is_milestone && (
                              <span className="text-xs text-gold-text bg-gold/10 px-1.5 py-0.5 rounded font-medium">
                                ★ Milestone
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {formatDate(entry.created_at)} ·{" "}
                            {mission?.title || "Unknown mission"}
                          </div>
                          {!isOpen && (
                            <p className="text-xs text-ink-muted mt-1.5 line-clamp-2">
                              {truncate(entry.response, 120)}
                            </p>
                          )}
                        </div>
                      </div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={cn(
                          "flex-shrink-0 mt-1 text-ink-muted transition-transform",
                          isOpen && "rotate-90"
                        )}
                      >
                        <path
                          d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-surface-border pt-4">
                      <p className="text-sm text-ink-muted italic mb-3 leading-relaxed">
                        {entry.prompt}
                      </p>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                        {entry.response}
                      </p>

                      {entry.ai_reflection && (() => {
                        const parsed = parseReflection(entry.ai_reflection);
                        if (!parsed) return null;
                        return (
                          <div
                            className="mt-4 p-4 rounded-xl border"
                            style={{
                              background: "rgba(46, 125, 140, 0.04)",
                              borderColor: "rgba(46, 125, 140, 0.2)",
                            }}
                          >
                            <div className="text-xs font-semibold text-teal mb-3 uppercase tracking-wide">
                              Something to sit with
                            </div>
                            {parsed.type === "tricheck" ? (
                              <div className="space-y-3">
                                {([
                                  { label: "What you believe", q: parsed.tricheck.conceptual },
                                  { label: "Something to try", q: parsed.tricheck.practical },
                                  { label: "Who gets it",      q: parsed.tricheck.collective },
                                ] as const).map(({ label, q }) => (
                                  <div key={label} className="flex gap-3">
                                    <span className="text-[11px] font-semibold text-teal/50 uppercase tracking-wide w-[5.5rem] flex-shrink-0 pt-0.5 leading-tight">
                                      {label}
                                    </span>
                                    <p className="text-sm text-ink leading-relaxed">{q}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-ink">{parsed.text}</p>
                            )}
                          </div>
                        );
                      })()}

                      {!canEdit && (
                        <p className="text-xs text-ink-muted mt-3">
                          Entries are read-only after 24 hours.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
