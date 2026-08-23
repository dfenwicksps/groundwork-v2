"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";
import CharacterCodeBuilder from "./CharacterCodeBuilder";
import {
  DAY_LABELS,
  PROGRAM_WEEKS,
  isWeekComplete,
  WEEK_REFLECTION_SCAFFOLDS,
  commitmentScaffold,
  type ProgramWeek,
  type WeekProgress,
} from "@/lib/program";
import type { YearLevel } from "@/lib/yearLevel";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";

/**
 * One week of the program: the question to sit with, the existing tool that
 * does its inner work, and the challenge that has to be lived. The tracker is
 * a record and never a streak — an unticked day is simply unticked, and the
 * week can still be completed with gaps in it.
 */
export default function WeekClient({
  userId,
  week,
  progress,
  savedCode,
  yearLevel,
  ready,
}: {
  userId: string;
  week: ProgramWeek;
  /** Only affects the register of the commitment examples — see program.ts */
  yearLevel: YearLevel;
  progress: WeekProgress | null;
  savedCode: string[];
  ready: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [days, setDays] = useState<number[]>(progress?.days ?? []);
  const [commitment, setCommitment] = useState(progress?.commitment ?? "");
  const [reflection, setReflection] = useState(progress?.reflection ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const target = week.challenge.target ?? 1;
  const isTracked = week.challenge.kind !== "single";
  const needsCommitment = !!week.challenge.commitmentPrompt;
  const done = isWeekComplete(week, progress ?? undefined);
  const prev = PROGRAM_WEEKS.find((w) => w.week === week.week - 1);
  const next = PROGRAM_WEEKS.find((w) => w.week === week.week + 1);

  function friendly(message: string, fallback: string) {
    return /find the table|does not exist|schema cache|column/i.test(message)
      ? "This isn't switched on yet — that's a fix on our side, not yours."
      : fallback;
  }

  /** Upsert on (user_id, week) so starting and updating are the same call. */
  async function persist(patch: Record<string, unknown>, markDone = false) {
    setBusy(true);
    setError(null);
    const { error: err } = await db.from("program_progress").upsert(
      {
        user_id: userId,
        week: week.week,
        days,
        commitment: commitment.trim() || null,
        reflection: reflection.trim() || null,
        ...(markDone ? { completed_at: new Date().toISOString() } : {}),
        ...patch,
      },
      { onConflict: "user_id,week" }
    );
    setBusy(false);
    if (err) {
      setError(friendly(err.message || "", "Couldn't save — try again."));
      return false;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    return true;
  }

  async function toggleDay(i: number) {
    const nextDays = days.includes(i)
      ? days.filter((d) => d !== i)
      : [...days, i].sort((a, b) => a - b);
    setDays(nextDays);
    await persist({ days: nextDays });
  }

  async function finishWeek() {
    if (!reflection.trim()) return;
    const ok = await persist({ reflection: reflection.trim() }, true);
    if (ok) {
      // Journal copy so the week's reflection sits with everything else
      await db.from("journal_entries").insert({
        user_id: userId,
        mission_id: 1,
        activity_id: `program-week-${week.week}`,
        prompt: `Week ${week.week} — ${week.title} (${week.challenge.title})`,
        response: reflection.trim(),
        is_milestone: false,
      });
      router.refresh();
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
        {/* Header */}
        <div data-animate="1">
          <Link
            href="/program"
            className="text-xs text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1 mb-3"
          >
            ← All ten weeks
          </Link>
          <p className="text-sm text-ink-muted mb-1">
            Week {week.week} of {PROGRAM_WEEKS.length}
            {done && <span className="text-sage font-semibold"> · complete</span>}
          </p>
          <h1
            className="text-3xl text-navy mb-3"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {week.emoji} {week.title}
          </h1>
          <p className="text-sm text-ink leading-relaxed">{week.intro}</p>
        </div>

        {!ready && (
          <div className="card p-4 text-xs text-ink-muted leading-relaxed">
            Progress can&apos;t be saved yet — this is being switched on. You can
            still read the week and do the challenge.
          </div>
        )}

        {/* Questions */}
        <div data-animate="2">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Sit with these
          </h2>
          <div className="card p-5 space-y-2.5">
            {week.questions.map((q) => (
              <p key={q} className="text-sm text-ink leading-relaxed flex gap-2.5">
                <span className="text-ink-faint flex-shrink-0" aria-hidden>
                  —
                </span>
                {q}
              </p>
            ))}
          </div>
        </div>

        {/* The tool that already does this work */}
        {week.link && (
          <div data-animate="2">
            <Link
              href={week.link.href}
              className="card p-4 flex items-center gap-3 hover:border-navy/30 transition-all"
            >
              <span className="text-2xl flex-shrink-0" aria-hidden>
                🔗
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">
                  {week.link.label}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {week.link.note}
                </p>
              </div>
              <span className="text-ink-muted flex-shrink-0" aria-hidden>
                →
              </span>
            </Link>
          </div>
        )}

        {/* The challenge */}
        <div data-animate="3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            This week&apos;s challenge
          </h2>
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink mb-1.5">
              {week.challenge.title}
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              {week.challenge.description}
            </p>

            {/* Weeks that need the student to name their own commitment */}
            {needsCommitment && (
              <div className="mt-4">
                <p className="text-xs font-medium text-ink mb-1.5">
                  {week.challenge.commitmentPrompt}
                </p>
                <ScaffoldedInput
                  value={commitment}
                  onChange={setCommitment}
                  scaffold={commitmentScaffold(week.week, yearLevel)}
                  placeholder="Specific beats ambitious."
                  rows={2}
                />
                <button
                  onClick={() => persist({ commitment: commitment.trim() || null })}
                  disabled={!commitment.trim() || busy}
                  className="btn btn-secondary w-full py-2 rounded-xl text-xs mt-2"
                >
                  {busy ? "Saving…" : "Save this"}
                </button>
              </div>
            )}

            {/* Tracker — a record, not a streak */}
            {isTracked && (!needsCommitment || (progress?.commitment ?? "").trim()) && (
              <div className="mt-5 pt-4 border-t border-surface-border">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    {week.challenge.kind === "daily"
                      ? "The week"
                      : `${week.challenge.unit ?? "session"}s`}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {days.length} of {target}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: target }).map((_, i) => {
                    const on = days.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        disabled={busy || !ready}
                        aria-pressed={on}
                        aria-label={
                          week.challenge.kind === "daily"
                            ? `Day ${i + 1}`
                            : `${week.challenge.unit ?? "session"} ${i + 1}`
                        }
                        className={`flex-1 aspect-square max-w-[52px] rounded-xl border text-sm font-semibold transition-all ${
                          on
                            ? "bg-sage text-white border-sage"
                            : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
                        }`}
                      >
                        {on
                          ? "✓"
                          : week.challenge.kind === "daily"
                            ? DAY_LABELS[i]
                            : i + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-ink-muted mt-2 leading-relaxed">
                  A missed one is just a missed one — no streak to break. Tick
                  them honestly or the record is worth nothing.
                </p>
              </div>
            )}

            {isTracked && needsCommitment && !(progress?.commitment ?? "").trim() && (
              <p className="text-[11px] text-ink-muted mt-3 leading-relaxed">
                Name your{" "}
                {week.week === 4 ? "promise" : "hill"} above first — tracking it
                before you&apos;ve decided what it is defeats the point.
              </p>
            )}
          </div>
        </div>

        {/* Week 10 writes the artefact instead of a plain reflection */}
        {week.week === 10 ? (
          <CharacterCodeBuilder
            userId={userId}
            saved={savedCode}
            onSaved={async (commitments) => {
              // The code itself is the week's reflection — record it so week 10
              // completes and the program reads 10 of 10.
              await persist(
                { reflection: commitments.join("\n") },
                true
              );
            }}
          />
        ) : (
          <div data-animate="4">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              End of the week
            </h2>
            <div className="card p-5">
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                What actually happened? What surprised you? Honest beats tidy.
              </p>
              <TierSwitcher className="mb-4" />
              <ScaffoldedInput
                value={reflection}
                onChange={setReflection}
                scaffold={WEEK_REFLECTION_SCAFFOLDS[week.week]}
                placeholder="What did doing this for a week teach you about yourself?"
                rows={4}
              />
              {error && (
                <p role="alert" className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}
              <button
                onClick={finishWeek}
                disabled={!reflection.trim() || busy || !ready}
                className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-3"
              >
                {busy
                  ? "Saving…"
                  : done
                    ? "Update my reflection"
                    : "Finish this week ✓"}
              </button>
              {saved && (
                <p className="text-[11px] text-sage text-center mt-2 font-medium">
                  Saved.
                </p>
              )}
              {days.length < target && (
                <p className="text-[11px] text-ink-muted text-center mt-2">
                  You can finish the week with {days.length} of {target} ticked —
                  it just means less to reflect on.
                </p>
              )}
            </div>
          </div>
        )}

        {error && week.week === 10 && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Week to week */}
        <div className="flex gap-2 pt-2 border-t border-surface-border">
          {prev ? (
            <Link
              href={`/program/${prev.week}`}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              ← Week {prev.week}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next && (
            <Link
              href={`/program/${next.week}`}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              Week {next.week} →
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
