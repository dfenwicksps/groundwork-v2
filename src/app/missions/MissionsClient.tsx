"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import TrackBanner from "@/components/TrackBanner";
import type { Spine } from "@/lib/spine";
import { WEEKLY_BY_KEY, type Strand } from "@/lib/program";

interface MissionCard {
  id: number;
  title: string;
  subtitle: string;
  question: string;
  description: string;
  colour: string;
  strands: Strand[];
  done: number;
  total: number;
  complete: boolean;
}

/**
 * The missions overview — deliberately the mirror image of /program.
 *
 * Same shape, same order, same words where the words mean the same thing:
 * a banner saying which track comes first, a progress bar in the same units,
 * one card offering the next thing, then the full list. Two tracks that look
 * like rivals shouldn't also be navigated differently.
 */
export default function MissionsClient({
  missions,
  activeMission,
  spine,
}: {
  missions: MissionCard[];
  activeMission: number;
  spine: Spine;
}) {
  const doneCount = missions.filter((m) => m.complete).length;
  const allDone = doneCount === missions.length;
  // The one to offer: the first unfinished mission, falling back to whichever
  // is flagged active. Never a finished one — that was the old nav's mistake.
  const next =
    missions.find((m) => !m.complete && m.id === activeMission) ||
    missions.find((m) => !m.complete) ||
    missions.find((m) => m.id === activeMission) ||
    missions[0];
  const started = next.done > 0;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">Four missions</p>
          <h1
            className="text-3xl text-navy mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            The deep dives.
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            One big question each — identity, purpose, connection, meaning. Five
            steps per mission: four reflections and one challenge you carry
            through the week. Nothing expires, and nothing nags you.
          </p>
        </div>

        <TrackBanner track="missions" spine={spine} />

        {/* Progress, in the same units the program uses */}
        <div data-animate="2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Progress
            </h2>
            <span className="text-xs text-ink-muted">
              {doneCount} of {missions.length} missions
            </span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden border border-surface-border">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(2, (doneCount / missions.length) * 100)}%`,
                background: "var(--teal)",
              }}
            />
          </div>
        </div>

        {/* The mission being offered */}
        {!allDone ? (
          <div data-animate="2">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              {started ? "Carry on with" : "Up next"}
            </h2>
            <Link
              href={`/missions/${next.id}`}
              className="block rounded-2xl p-5 text-white"
              style={{ background: next.colour }}
            >
              <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
                {next.subtitle}
              </div>
              <p
                className="text-xl mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                {next.question}
              </p>
              <p className="text-sm leading-relaxed opacity-90">
                Step {Math.min(next.done + 1, next.total)} of {next.total}
              </p>
            </Link>
          </div>
        ) : (
          <div
            data-animate="2"
            className="rounded-2xl p-5 text-white"
            style={{ background: "var(--navy)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
              All four missions
            </div>
            <p className="text-sm leading-relaxed">
              The foundation is laid. Any mission can be reread or redone — and
              the ten-week program is where what you found in them turns into
              habit.
            </p>
          </div>
        )}

        {/* All four */}
        <div data-animate="4">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            The four missions
          </h2>
          <div className="space-y-2">
            {missions.map((m) => (
              <Link
                key={m.id}
                href={`/missions/${m.id}`}
                className={`card p-4 flex items-center gap-3 transition-all ${
                  m.complete ? "bg-sage/5 border-sage/30" : "hover:border-navy/30"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: m.complete ? "var(--sage)" : m.colour }}
                >
                  {m.complete ? "✓" : m.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink leading-snug">
                    {m.title}
                  </div>
                  <div
                    className="text-xs text-ink-muted leading-snug truncate"
                    style={{ fontStyle: "italic" }}
                  >
                    {m.question}
                  </div>
                  {/* Which of the weekly five this one is the ground for. */}
                  <div className="text-[10px] text-ink-faint leading-snug mt-0.5 truncate">
                    {m.strands.map((k) => WEEKLY_BY_KEY[k].name).join(" · ")}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide flex-shrink-0">
                  {m.done}/{m.total}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-surface-border">
          Every mission has real stories alongside it:{" "}
          <Link href="/stories" className="text-teal hover:underline">
            Stories
          </Link>{" "}
          — other people&apos;s situations, no tidy endings.
        </p>
      </div>
    </AppShell>
  );
}
