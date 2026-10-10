"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MISSIONS,
  getActivityLabel,
  entryGroup,
  ENTRY_GROUP_LABELS,
  isSensitiveActivity,
  type EntryGroup,
} from "@/lib/missions";
import { formatDate, isWithin24Hours, truncate, parseReflection } from "@/lib/utils";
import type { JournalEntry } from "@/types/database";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import {
  revisitEligibility,
  agoLabel,
  isRevisitEntry,
  type RevisitEntry,
} from "@/lib/revisit";

export default function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const [filter, setFilter] = useState<EntryGroup | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Sensitive entries open in two taps: one to expand, one to show the words.
  const [revealed, setRevealed] = useState<string | null>(null);

  // Desktop has a reading pane with nothing in it until something is picked,
  // so it starts on the newest entry. A phone starts with every row folded.
  useEffect(() => {
    if (entries.length > 0 && window.matchMedia("(min-width: 1024px)").matches) {
      setExpanded((current) => current ?? entries[0].id);
    }
  }, [entries]);

  const groupOf = (e: JournalEntry) => entryGroup(e.activity_id, e.mission_id);
  const byMission = filter
    ? entries.filter((e) => groupOf(e) === filter)
    : entries;

  // Revisits keyed by the entry they look back at, so a card can show how many
  // times it has been reopened without another query.
  const revisitsByParent = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const parent = (e as JournalEntry & { revisit_of?: string | null }).revisit_of;
    if (!parent) continue;
    const list = revisitsByParent.get(parent) || [];
    list.push(e);
    revisitsByParent.set(parent, list);
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? byMission.filter((e) =>
        // A sensitive entry is found by its name, never by what's written in
        // it, so a search can't surface those words on screen.
        isSensitiveActivity(e.activity_id)
          ? getActivityLabel(e.activity_id).toLowerCase().includes(q)
          : e.response.toLowerCase().includes(q) ||
            e.prompt.toLowerCase().includes(q) ||
            getActivityLabel(e.activity_id).toLowerCase().includes(q)
      )
    : byMission;

  // What an open entry shows. A phone unfolds it under its row; desktop
  // gives it the reading pane beside the list.
  const entryBody = (entry: JournalEntry) => {
    const sensitive = isSensitiveActivity(entry.activity_id);
    const canEdit = isWithin24Hours(entry.created_at);
    return (
      <>
      {sensitive && revealed !== entry.id && (
        <div>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            This one stays hidden until you choose to show it, so it
            can&apos;t be caught by a glance at your screen.
          </p>
          <button
            onClick={() => setRevealed(entry.id)}
            className="btn btn-secondary text-sm py-2 px-4 rounded-xl"
          >
            Show it
          </button>
        </div>
      )}

      {(!sensitive || revealed === entry.id) && (
        <div>
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
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-teal uppercase tracking-wide">
                    Something to sit with
                  </span>
                  <span className="text-xs text-ink-muted">Suggested by AI</span>
                </div>
                {parsed.type === "tricheck" ? (
                  <div className="space-y-3">
                    {([
                      { label: "What you believe", q: parsed.tricheck.conceptual },
                      { label: "Something to try", q: parsed.tricheck.practical },
                      { label: "Who gets it",      q: parsed.tricheck.collective },
                    ] as const).map(({ label, q }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-xs font-semibold text-teal/50 uppercase tracking-wide w-[5.5rem] flex-shrink-0 pt-0.5 leading-tight">
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

          {/* Revisiting your own past writing is the one comparison
              this app makes — against yourself, never anyone else. */}
          {!isRevisitEntry(entry.activity_id) && (() => {
            const mine = revisitsByParent.get(entry.id) || [];
            const chain = {
              original: entry as unknown as RevisitEntry,
              revisits: mine as unknown as RevisitEntry[],
            };
            const el = revisitEligibility(chain);
            return (
              <div className="mt-4 pt-3 border-t border-surface-border">
                {el.ok ? (
                  <Link
                    href={`/revisit/${entry.id}`}
                    className="btn btn-secondary w-full py-2.5 rounded-xl text-sm"
                  >
                    {mine.length === 0
                      ? "Revisit this →"
                      : "Look at this again →"}
                  </Link>
                ) : (
                  <p className="text-xs text-ink-muted leading-relaxed">
                    You can revisit this in {el.waitDays}{" "}
                    {el.waitDays === 1 ? "day" : "days"} — last looked
                    at it {agoLabel(el.sinceDays)}.
                  </p>
                )}
                {mine.length > 0 && (
                  <Link
                    href={`/revisit/${entry.id}`}
                    className="block text-xs text-teal hover:underline text-center mt-2"
                  >
                    Read the whole thread ({mine.length + 1} entries)
                  </Link>
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
      </>
    );
  };

  const selected = filtered.find((e) => e.id === expanded) ?? null;
  const selectedGroup = selected ? groupOf(selected) : null;

  return (
    <AppShell>
      <div className="page">
        <div data-animate="1" className="mb-6">
          <h1
            className="text-3xl lg:text-4xl text-navy mb-1"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Your journal
          </h1>
          <p className="text-ink-muted text-sm">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} — private
            to you
          </p>
        </div>

        {/* Desktop: the list on the left, the open entry in a pane beside it */}
        <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10 lg:items-start">
        <div>
        {/* Search */}
        <div data-animate="2" className="mb-4">
          <label htmlFor="journal-search" className="sr-only">
            Search your journal
          </label>
          <input
            id="journal-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your journal…"
            className="input"
          />
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
            const count = entries.filter((e) => groupOf(e) === m.id).length;
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
          {(["weeks", "me"] as const).map((g) => {
            const count = entries.filter((e) => groupOf(e) === g).length;
            if (count === 0) return null;
            return (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                  filter === g
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
                )}
              >
                {ENTRY_GROUP_LABELS[g]}
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
            <p className="text-ink-muted">
              {q ? `Nothing matches “${search.trim()}”.` : "No entries yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-animate="3">
            {filtered.map((entry) => {
              const group = groupOf(entry);
              const mission =
                typeof group === "number" ? MISSIONS.find((m) => m.id === group) : undefined;
              const isOpen = expanded === entry.id;
              const label =
                getActivityLabel(entry.activity_id);
              const sensitive = isSensitiveActivity(entry.activity_id);

              return (
                <div
                  key={entry.id}
                  className={cn("card overflow-hidden", isOpen && "lg:ring-2 lg:ring-teal")}
                >
                  <button
                    onClick={() => {
                      setExpanded(isOpen ? null : entry.id);
                      setRevealed(null);
                    }}
                    className="w-full p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ background: mission?.colour || "#4F46E5" }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-ink">
                              {label}
                            </span>
                            {entry.is_milestone && (
                              <span className="text-xs text-coral bg-coral/10 px-1.5 py-0.5 rounded font-medium">
                                ★ Milestone
                              </span>
                            )}
                            {(revisitsByParent.get(entry.id)?.length ?? 0) > 0 && (
                              <span className="text-xs text-teal bg-teal/10 px-1.5 py-0.5 rounded font-medium">
                                ↻ Revisited{" "}
                                {revisitsByParent.get(entry.id)!.length}×
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {formatDate(entry.created_at)} ·{" "}
                            {typeof group === "number"
                              ? mission?.title || "Unknown mission"
                              : ENTRY_GROUP_LABELS[group]}
                          </div>
                          {!isOpen && (
                            <p className="text-xs text-ink-muted mt-1.5 line-clamp-2">
                              {sensitive ? "Private · tap to show" : truncate(entry.response, 120)}
                            </p>
                          )}
                        </div>
                      </div>
                      <svg aria-hidden="true"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={cn(
                          "flex-shrink-0 mt-1 text-ink-muted transition-transform",
                          isOpen && "rotate-90 lg:rotate-0"
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
                    <div className="px-4 pb-4 border-t border-surface-border pt-4 lg:hidden">
                      {entryBody(entry)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>

        <section
          aria-label="Open entry"
          className="hidden lg:block card p-8 sticky top-10 max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          {selected ? (
            <>
              <div className="mb-5 pb-5 border-b border-surface-border">
                <h2
                  className="text-2xl text-navy mb-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {getActivityLabel(selected.activity_id)}
                </h2>
                <p className="text-xs text-ink-muted">
                  {formatDate(selected.created_at)} ·{" "}
                  {typeof selectedGroup === "number"
                    ? MISSIONS.find((m) => m.id === selectedGroup)?.title || "Unknown mission"
                    : ENTRY_GROUP_LABELS[selectedGroup!]}
                </p>
              </div>
              {entryBody(selected)}
            </>
          ) : (
            <p className="text-sm text-ink-muted text-center py-16">
              {filtered.length === 0 ? "Nothing to read yet." : "Pick an entry to read it here."}
            </p>
          )}
        </section>
        </div>
      </div>
    </AppShell>
  );
}
