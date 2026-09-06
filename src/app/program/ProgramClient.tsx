"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import WeeklyFiveSection, { type WeeklyCheckin } from "./WeeklyFiveSection";
import TrackBanner from "@/components/TrackBanner";
import type { Spine } from "@/lib/spine";
import {
  PROGRAM_WEEKS,
  isWeekComplete,
  currentWeek,
  type WeekProgress,
} from "@/lib/program";

/**
 * The program overview. Missions are a library the student browses; this is a
 * sequence they walk. Nothing is locked — a student who wants week 5 first can
 * have it — but there is always exactly one "next" week being offered.
 */
export default function ProgramClient({
  userId,
  progress,
  weekly,
  spine,
  outstanding,
  waiting,
  ready,
}: {
  userId: string;
  spine: Spine;
  progress: Record<number, WeekProgress>;
  weekly: WeeklyCheckin[];
  /** Missions still to finish before the program is the student's next step */
  outstanding: { id: number; title: string; question: string; done: number; total: number }[];
  /** Weeks whose prerequisite mission work hasn't been done yet, by week number */
  waiting: Record<number, { mission: number; label: string }>;
  ready: boolean;
}) {
  const doneCount = PROGRAM_WEEKS.filter((w) =>
    isWeekComplete(w, progress[w.week])
  ).length;
  const nextWeek = currentWeek(progress);
  const next = PROGRAM_WEEKS.find((w) => w.week === nextWeek)!;
  const allDone = doneCount === PROGRAM_WEEKS.length;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">10 weeks</p>
          <h1
            className="text-3xl text-navy mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Character program.
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Identity is the starting point. Character is the practice.
            Contribution is the evidence. Each week has one question to sit with
            and one thing to actually do.
          </p>
        </div>

        <TrackBanner track="program" spine={spine} />

        {/* Mission 1 is the only hard prerequisite: weeks 1 and 2 are made
            out of the strengths and values it maps. Missions 2-4 aren't listed
            here as homework — each unlocks the one week built on it, when the
            student reaches it. */}
        {spine.missionsFirst && outstanding.length > 0 && (
          <div data-animate="2">
            <div className="rounded-2xl border-2 border-dashed border-navy/25 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2 text-navy">
                Before week 1
              </div>
              <p className="text-sm text-ink leading-relaxed mb-4">
                Week 1 sets the qualities you want at 25 against the strengths
                you already lead with, and week 2 attaches a behaviour to each
                of your values. Both are made out of Mission 1 — without it
                they&apos;re guesswork.
              </p>
              {(() => {
                const m1 = outstanding.find((m) => m.id === 1);
                if (!m1) return null;
                return (
                  <Link
                    href="/missions/1"
                    className="card p-3 flex items-center gap-3 hover:border-navy/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-navy">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink">
                        {m1.title}
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {m1.done} of {m1.total} steps · {m1.question}
                      </p>
                    </div>
                    <span className="text-ink-muted flex-shrink-0" aria-hidden>
                      →
                    </span>
                  </Link>
                );
              })()}
              <p className="text-[11px] text-ink-muted leading-relaxed mt-3">
                Missions 2, 3 and 4 aren&apos;t needed yet — each one opens the
                week that&apos;s built on it, when you get there.
              </p>
            </div>
          </div>
        )}

        {!ready && (
          <div className="card p-5 flex items-center gap-4" data-animate="2">
            <span className="text-3xl flex-shrink-0" aria-hidden>
              🧰
            </span>
            <div>
              <p className="text-sm text-ink font-medium mb-0.5">
                Being switched on shortly
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                You can read the ten weeks below, but progress can&apos;t be
                saved yet.
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div data-animate="2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Progress
            </h2>
            <span className="text-xs text-ink-muted">
              {doneCount} of {PROGRAM_WEEKS.length} weeks
            </span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden border border-surface-border">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(2, (doneCount / PROGRAM_WEEKS.length) * 100)}%`,
                background: "var(--teal)",
              }}
            />
          </div>
        </div>

        {/* The week being offered */}
        {!allDone && (
          <div data-animate="2">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              {progress[next.week]
                ? "Carry on with"
                : spine.missionsFirst
                  ? "Waiting for you"
                  : "Up next"}
            </h2>
            <Link
              href={`/program/${next.week}`}
              className="block rounded-2xl p-5 text-white"
              style={{ background: "var(--navy)" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
                Week {next.week} · {next.emoji}
              </div>
              <p
                className="text-xl mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {next.title}
              </p>
              <p className="text-sm leading-relaxed opacity-90">
                {next.challenge.title}
              </p>
            </Link>
          </div>
        )}

        {allDone && (
          <div
            data-animate="2"
            className="rounded-2xl p-5 text-white"
            style={{ background: "var(--navy)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
              All ten weeks
            </div>
            <p className="text-sm leading-relaxed">
              You&apos;ve been through the whole program. The weekly five below
              is the part that keeps going — it&apos;s the same work, just
              without the scaffolding.
            </p>
          </div>
        )}

        {/* The weekly heartbeat */}
        <WeeklyFiveSection userId={userId} checkins={weekly} ready={ready} />

        {/* All ten weeks */}
        <div data-animate="4">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            The ten weeks
          </h2>
          <div className="space-y-2">
            {PROGRAM_WEEKS.map((w) => {
              const p = progress[w.week];
              const done = isWeekComplete(w, p);
              const started = !!p && !done;
              const target = w.challenge.target ?? 1;
              return (
                <Link
                  key={w.week}
                  href={`/program/${w.week}`}
                  className={`card p-4 flex items-center gap-3 transition-all ${
                    done ? "bg-sage/5 border-sage/30" : "hover:border-navy/30"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      done
                        ? "bg-sage text-white"
                        : started
                          ? "bg-teal text-white"
                          : "bg-surface-muted text-ink-muted"
                    }`}
                  >
                    {done ? "✓" : w.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink leading-snug">
                      {w.emoji} {w.title}
                    </div>
                    <div className="text-xs text-ink-muted leading-snug truncate">
                      {w.challenge.title}
                    </div>
                  </div>
                  {waiting[w.week] && !done ? (
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide flex-shrink-0 text-right leading-tight">
                      Needs
                      <br />
                      Mission {waiting[w.week].mission}
                    </span>
                  ) : (
                    started && (
                      <span className="text-[10px] font-bold text-teal uppercase tracking-wide flex-shrink-0">
                        {p.days.length}/{target}
                      </span>
                    )
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-surface-border">
          The deeper mirror lives on your profile:{" "}
          <Link href="/me#standard" className="text-teal hover:underline">
            The Standard
          </Link>{" "}
          — the three questions underneath all of this.
        </p>
      </div>
    </AppShell>
  );
}
