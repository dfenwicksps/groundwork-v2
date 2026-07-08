"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { STRENGTH_BY_KEY, type Virtue } from "@/lib/strengths";
import PathwaysSection from "./PathwaysSection";
import MoralSection from "./MoralSection";
import PracticeSection from "./PracticeSection";
import GoalsSection from "./GoalsSection";
import BoostsSection from "./BoostsSection";
import HabitsSection from "./HabitsSection";
import FocusSection from "./FocusSection";
import JourneyStrip from "./JourneyStrip";
import type { HabitAnswer, HabitResult } from "@/lib/habits";
import type { YearLevel } from "@/lib/yearLevel";

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
  habitSaved,
  focusKeys,
  supportCount,
  featuresReady,
  yearLevel,
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
  habitSaved: { answers: Record<string, HabitAnswer>; result: HabitResult } | null;
  focusKeys: string[];
  supportCount: number;
  featuresReady: boolean;
  yearLevel: YearLevel;
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

  // #4: the Me page was a 13-section scroll — split into journey-aligned tabs.
  // Default tab follows year level (seniors → Future, juniors → Grow).
  type MeTab = "profile" | "reflect" | "grow" | "future";
  const defaultTab: MeTab =
    yearLevel === "senior" ? "future" : yearLevel === "junior" ? "grow" : "profile";
  const [tab, setTab] = useState<MeTab>(defaultTab);

  // Cross-links (journey strip, "#boosts" from a challenge, "attach a goal")
  // use #anchors — map each to the tab that holds it, then scroll after switch.
  useEffect(() => {
    const HASH_TAB: Record<string, MeTab> = {
      habits: "reflect", moral: "reflect",
      focus: "grow", practice: "grow", boosts: "grow",
      pathways: "future", goals: "future",
    };
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      if (HASH_TAB[h]) {
        setTab(HASH_TAB[h]);
        setTimeout(
          () => document.getElementById(h)?.scrollIntoView({ behavior: "smooth" }),
          80
        );
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const TABS: { key: MeTab; label: string; emoji: string }[] = [
    { key: "profile", label: "Profile", emoji: "🧭" },
    { key: "reflect", label: "Reflect", emoji: "🪞" },
    { key: "grow", label: "Grow", emoji: "🌱" },
    { key: "future", label: "Future", emoji: "🚀" },
  ];

  const soonNote = (
    <div className="card p-5 flex items-center gap-4">
      <span className="text-3xl flex-shrink-0" aria-hidden>🧰</span>
      <div>
        <p className="text-sm text-ink font-medium mb-0.5">More tools land here soon</p>
        <p className="text-xs text-ink-muted leading-relaxed">
          This one is being switched on — check back shortly.
        </p>
      </div>
    </div>
  );

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

        {/* Tab bar — journey-aligned, only when there's a profile */}
        {hasProfile && (
          <div
            className="sticky top-0 z-20 -mx-4 px-4 py-2"
            style={{ background: "rgba(250,245,236,0.95)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex gap-1.5" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[11px] font-semibold transition-all",
                    tab === t.key
                      ? "bg-navy text-white"
                      : "bg-white text-ink-muted border border-surface-border"
                  )}
                >
                  <span className="text-base" aria-hidden>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purpose profile — the one-line "who I am" artefact */}
        {hasProfile && tab === "profile" && (
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

        {/* The staged student journey: Discover → … → Launch */}
        {hasProfile && tab === "profile" && (
          <JourneyStrip
            hasProfile={hasProfile}
            hasValues={values.length > 0}
            hasHabits={!!habitSaved}
            hasMoral={!!moralProfile}
            hasFocus={focusKeys.length > 0}
            hasPractice={!!activePractice || recentPractices.length > 0}
            hasSupport={supportCount > 0}
            hasGoals={goals.length > 0}
          />
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
        ) : tab === "profile" ? (
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
                come as naturally yet.{" "}
                <a href="#practice" className="font-medium text-teal hover:underline">
                  Practise one →
                </a>
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
                      <span className="text-ink-muted font-normal">· {s.plain}</span>
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
                            <span className="text-sm text-ink truncate">
                              {s.name}{" "}
                              <span className="text-ink-muted">· {s.plain}</span>
                            </span>
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
        ) : null}

        {/* Reflect — how I decide + my current patterns */}
        {hasProfile && tab === "reflect" && (
          <>
            <HabitsSection userId={userId} saved={habitSaved} />
            {featuresReady ? (
              <MoralSection userId={userId} profile={moralProfile} />
            ) : (
              soonNote
            )}
          </>
        )}

        {/* Grow — choose qualities + practise them */}
        {hasProfile && tab === "grow" && (
          <>
            <FocusSection
              userId={userId}
              focusKeys={focusKeys}
              suggestedQualities={Array.from(
                new Set((habitSaved?.result.grows || []).map((g) => g.quality))
              )}
              hasGoals={goals.length > 0}
            />
            {featuresReady && (
              <PracticeSection
                userId={userId}
                growthEdges={bottom5}
                top5={top5}
                active={activePractice}
                recent={recentPractices}
              />
            )}
            <BoostsSection />
            {!featuresReady && soonNote}
          </>
        )}

        {/* Future — pathways + goals */}
        {hasProfile && tab === "future" && (
          <>
            <div id="pathways">
              <PathwaysSection top5={top5} values={values} yearLevel={yearLevel} />
            </div>
            {featuresReady ? (
              <div id="goals">
                <GoalsSection
                  userId={userId}
                  goals={goals}
                  values={values}
                  topStrengthKeys={top5}
                  yearLevel={yearLevel}
                />
              </div>
            ) : (
              soonNote
            )}
          </>
        )}

        {/* Values */}
        {values.length > 0 && tab === "profile" && (
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
