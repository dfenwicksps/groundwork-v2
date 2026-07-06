"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { STRENGTH_BY_KEY, type Virtue } from "@/lib/strengths";
import PathwaysSection from "./PathwaysSection";
import MoralSection from "./MoralSection";
import PracticeSection from "./PracticeSection";
import GoalsSection from "./GoalsSection";
import BoostsSection from "./BoostsSection";

// Virtue accent colours (from the bright palette)
const VIRTUE_COLOUR: Record<Virtue, string> = {
  Wisdom: "#4338CA",
  Courage: "#C2410C",
  Humanity: "#E11D48",
  Justice: "#0E7490",
  Temperance: "#15803D",
  Transcendence: "#92610C",
};

interface PracticeEntry {
  id: string;
  strength_key: string;
  action: string;
  started_at: string;
  completed_at: string | null;
  reflection: string | null;
}

export default function MeClient({
  userId,
  displayName,
  ranking,
  scores,
  values,
  moralProfile,
  goals,
  activePractice,
  recentPractices,
  commitmentExcerpt,
}: {
  userId: string;
  displayName: string;
  ranking: string[] | null;
  scores: Record<string, number>;
  values: string[];
  moralProfile: {
    primary_style: string;
    secondary_style: string | null;
    style_scores: Record<string, number>;
  } | null;
  
  goals: any[];
  activePractice: PracticeEntry | null;
  recentPractices: PracticeEntry[];
  commitmentExcerpt: string | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const firstName = displayName?.split(" ")[0] || "you";

  const hasProfile = !!ranking && ranking.length > 0;
  const top5 = hasProfile ? ranking!.slice(0, 5) : [];
  const bottom5 = hasProfile ? ranking!.slice(-5).reverse() : [];
  const maxScore = hasProfile
    ? Math.max(1, ...ranking!.map((k) => scores[k] ?? 0))
    : 1;
  const minScore = hasProfile
    ? Math.min(0, ...ranking!.map((k) => scores[k] ?? 0))
    : 0;
  const range = Math.max(1, maxScore - minScore);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">Your profile</p>
          <h1
            className="text-3xl text-navy"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {firstName}.
          </h1>
        </div>

        {/* Purpose profile — the one-line "who I am" artefact */}
        {hasProfile && (
          <div
            data-animate="1"
            className="rounded-2xl p-4 text-white"
            style={{ background: "var(--navy)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
              Your profile in one line
            </div>
            <p className="text-sm leading-relaxed">
              Leads with <span className="font-semibold">{STRENGTH_BY_KEY[top5[0]]?.name}</span>
              {values[0] && (
                <> · stands for <span className="font-semibold">{values[0]}</span></>
              )}
              {commitmentExcerpt && (
                <> · committed to <span className="italic">&ldquo;{commitmentExcerpt}…&rdquo;</span></>
              )}
            </p>
          </div>
        )}

        {!hasProfile ? (
          <div className="card p-8 text-center" data-animate="2">
            <div className="text-4xl mb-3" aria-hidden>🧭</div>
            <h2
              className="text-xl text-navy mb-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Discover your character strengths
            </h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed max-w-sm mx-auto">
              Do <span className="font-medium">Strengths Mapping</span> in Mission 1 to
              rank all 24 VIA character strengths and reveal your signature five.
            </p>
            <Link
              href="/missions/1/activities/strengths-mapping"
              className="btn btn-primary px-8"
            >
              Start Strengths Mapping
            </Link>
          </div>
        ) : (
          <>
            {/* Signature strengths */}
            <div data-animate="2">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                Your signature strengths
              </h2>
              <div className="space-y-2">
                {top5.map((k, i) => {
                  const s = STRENGTH_BY_KEY[k];
                  if (!s) return null;
                  const c = VIRTUE_COLOUR[s.virtue];
                  return (
                    <div
                      key={k}
                      className="card p-4 flex items-center gap-3"
                      style={{ borderLeft: `4px solid ${c}` }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                        style={{ background: c }}
                      >
                        {i + 1}
                      </div>
                      <div className="text-xl" aria-hidden>{s.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink">{s.name}</div>
                        <div className="text-xs text-ink-muted leading-snug">{s.short}</div>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${c}15`, color: c }}
                      >
                        {s.virtue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Growth edges */}
            <div data-animate="3">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Growth edges
              </h2>
              <p className="text-xs text-ink-muted mb-3">
                Your lower-ranked strengths — not weaknesses, just the ones that don&apos;t
                come as naturally yet. Practise one in{" "}
                <span className="font-medium">Strength in action</span> below.
              </p>
              <div className="flex flex-wrap gap-2">
                {bottom5.map((k) => {
                  const s = STRENGTH_BY_KEY[k];
                  if (!s) return null;
                  return (
                    <span
                      key={k}
                      className="px-3 py-1.5 rounded-lg text-sm bg-white border border-surface-border text-ink flex items-center gap-1.5"
                    >
                      <span aria-hidden>{s.emoji}</span>
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Full ranking */}
            <div data-animate="4">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3 w-full"
                aria-expanded={showAll}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={cn("transition-transform", showAll && "rotate-90")}
                >
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                All 24, ranked highest → lowest
              </button>
              {showAll && (
                <div className="card p-4 space-y-2.5">
                  {ranking!.map((k, i) => {
                    const s = STRENGTH_BY_KEY[k];
                    if (!s) return null;
                    const c = VIRTUE_COLOUR[s.virtue];
                    const score = scores[k] ?? 0;
                    const pct = Math.round(((score - minScore) / range) * 100);
                    return (
                      <div key={k} className="flex items-center gap-3">
                        <span className="text-xs text-ink-muted w-5 flex-shrink-0 text-right tabular-nums">
                          {i + 1}
                        </span>
                        <span className="text-base w-6 text-center flex-shrink-0" aria-hidden>
                          {s.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm text-ink truncate">{s.name}</span>
                            <span className="text-[10px] text-ink-muted flex-shrink-0">
                              {s.virtue}
                            </span>
                          </div>
                          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.max(6, pct)}%`, background: c }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Retake */}
            <div data-animate="5" className="text-center">
              <Link
                href="/missions/1/activities/strengths-mapping"
                className="text-sm text-teal hover:underline"
              >
                Retake the strengths assessment
              </Link>
            </div>
          </>
        )}

        {/* Pathways / moral compass / practice / goals — only meaningful once
            a strengths profile exists */}
        {hasProfile && (
          <>
            <PathwaysSection top5={top5} values={values} />
            <MoralSection userId={userId} profile={moralProfile} />
            <PracticeSection
              userId={userId}
              growthEdges={bottom5}
              top5={top5}
              active={activePractice}
              recent={recentPractices}
            />
            <GoalsSection
              userId={userId}
              goals={goals}
              values={values}
              topStrengthKeys={top5}
            />
            <BoostsSection />
          </>
        )}

        {/* Values */}
        {values.length > 0 && (
          <div data-animate="5">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Your chosen values
            </h2>
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-medium"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Settings link */}
        <div data-animate="6" className="pt-2 border-t border-surface-border">
          <Link
            href="/settings"
            className="flex items-center justify-between py-3 text-sm font-medium text-ink hover:text-navy transition-colors"
          >
            <span>Account &amp; settings</span>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="text-ink-muted" aria-hidden>
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
