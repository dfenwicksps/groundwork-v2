"use client";

import Link from "next/link";
import { MISSIONS, getActivityLabel, requiredSteps, requiredDone } from "@/lib/missions";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { UserProfile, MissionProgress, Challenge } from "@/types/database";
import AppShell from "@/components/layout/AppShell";
import MissionsSummaryCard from "./MissionsSummaryCard";
import type { MissionSummary } from "@/lib/missionSummary";
import type { Spine } from "@/lib/spine";
import { LIFE_STAGE_OPTIONS, hasLeftSchool, type LifeStage } from "@/lib/lifeStage";
import { whoToYou } from "@/lib/nextChapter";
import { endDue } from "@/lib/checkin";
import { isStoryActivity } from "@/lib/revisit";

type RevisitEntry = {
  id: string;
  mission_id: number;
  activity_id: string;
  prompt: string;
  response: string;
  created_at: string;
};

type NextMissionStep = {
  missionId: number;
  missionTitle: string;
  question: string;
  colour: string;
  activityId: string;
  activityTitle: string;
  step: number;
  total: number;
};

type FeaturedStory = { id: string; title: string; teaser: string; film: boolean };

type ProgramWeekCard = {
  week: number;
  title: string;
  challenge: string;
  emoji: string;
  started: boolean;
  weeksDone: number;
  allDone: boolean;
};

interface Props {
  profile: UserProfile;
  progress: MissionProgress[];
  challenge: Challenge | null;
  supportCount: number;
  revisitEntry: RevisitEntry | null;
  welcomeBack: boolean;
  nextMissionStep: NextMissionStep | null;
  featuredStory: FeaturedStory | null;
  spine: Spine;
  programWeek: ProgramWeekCard;
  lifeStage: LifeStage;
  /** Present only once all four missions are done */
  missionSummary: MissionSummary | null;
  /** The next-chapter plan, if one has been made: who they'll ask, and whether it's time */
  nextChapter: { who: string; due: boolean } | null;
  /** The outcome check-in: null when it isn't available yet */
  checkin: { startAt: string | null; endDone: boolean } | null;
}

const MISSION_CHALLENGE_ACTIVITY: Record<number, string> = {
  1: "weekly-challenge",
  2: "purpose-challenge",
  3: "connection-challenge",
  4: "meaning-challenge",
};

function missionsComplete(progress: MissionProgress[]): number {
  return MISSIONS.filter((m) => {
    const total = requiredSteps(m).length;
    const ids = progress.filter((p) => p.mission_id === m.id).map((p) => p.activity_id);
    return total > 0 && requiredDone(m, ids) >= total;
  }).length;
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Home. One thing to do next, then only what's time-sensitive, then a story.
 *
 * It used to be about ten stacked sections: both tracks as rival cards, the
 * mission map, recent reflections, the support circle and a stats row. Each
 * made sense alone; together a fourteen-year-old couldn't see what to do
 * today. Everything removed lives on its own tab (Missions, Journal, Support).
 *
 * "Up next" follows the spine: the next mission step while the missions lead
 * (until Mission 1 is done), then this week of the ten-week program.
 */
export default function DashboardClient({
  profile,
  progress,
  challenge,
  supportCount,
  revisitEntry,
  welcomeBack,
  nextMissionStep,
  featuredStory,
  spine,
  programWeek,
  lifeStage,
  missionSummary,
  nextChapter,
  checkin,
}: Props) {
  const firstName = profile.display_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const missionsDone = missionsComplete(progress);

  const upNext =
    spine.lead === "mission" && nextMissionStep ? (
      <Link
        href={`/missions/${nextMissionStep.missionId}/activities/${nextMissionStep.activityId}`}
        className="block rounded-2xl p-6 text-white relative overflow-hidden group"
        style={{ background: nextMissionStep.colour }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white"
          style={{ transform: "translate(30%, -30%)" }}
          aria-hidden
        />
        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
            Mission {nextMissionStep.missionId} · {nextMissionStep.missionTitle} · Step{" "}
            {nextMissionStep.step} of {nextMissionStep.total}
          </div>
          <p className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            {nextMissionStep.activityTitle}
          </p>
          <p className="text-sm opacity-90 italic">{nextMissionStep.question}</p>
          <span className="inline-flex items-center gap-2 mt-4 bg-white/20 group-hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
            {nextMissionStep.step === 1 ? "Start" : "Carry on"}
            <Arrow />
          </span>
        </div>
      </Link>
    ) : (
      <Link
        href={programWeek.allDone ? "/program#weekly" : `/program/${programWeek.week}`}
        className="block rounded-2xl p-6 text-white group"
        style={{ background: "var(--navy)" }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
          {programWeek.allDone
            ? "All ten weeks done"
            : `Week ${programWeek.week} of 10 · ${programWeek.emoji}`}
        </div>
        <p className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {programWeek.allDone ? "Keep the weekly five going" : programWeek.title}
        </p>
        <p className="text-sm leading-relaxed opacity-90">
          {programWeek.allDone ? spine.programBlurb : programWeek.challenge}
        </p>
        <span className="inline-flex items-center gap-2 mt-4 bg-white/15 group-hover:bg-white/25 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
          {programWeek.allDone
            ? "Open the weekly five"
            : programWeek.started
              ? "Carry on"
              : "Start this week"}
          <Arrow />
        </span>
      </Link>
    );

  // Only what's time-sensitive or specific to them — never a second "to do".
  const alsoNow: { key: string; href: string; icon: string; title: string; sub: string }[] = [];
  if (challenge) {
    alsoNow.push({
      key: "challenge",
      href: `/missions/${challenge.mission_id}/activities/${MISSION_CHALLENGE_ACTIVITY[challenge.mission_id] ?? "weekly-challenge"}`,
      icon: "⚑",
      title: "Check in on your mission challenge",
      sub: `Started ${formatRelativeDate(challenge.issued_at)} · ${truncate(challenge.challenge_text, 70)}`,
    });
  }
  if (revisitEntry) {
    alsoNow.push({
      key: "revisit",
      href: `/revisit/${revisitEntry.id}`,
      icon: "↩",
      title: `Look back at ${getActivityLabel(revisitEntry.activity_id)}`,
      sub: isStoryActivity(revisitEntry.activity_id)
        ? `Written ${formatRelativeDate(revisitEntry.created_at)}. What would you add to your story now?`
        : `Written ${formatRelativeDate(revisitEntry.created_at)}. Does it still feel true?`,
    });
  }
  // The next chapter: a planned conversation that's due comes first, for
  // anyone; otherwise students for whom "what's next" is the live question are
  // offered the plan until they've made one, then pathways and goals.
  if (nextChapter?.due) {
    alsoNow.push({
      key: "next-chapter",
      href: "/next#debrief",
      icon: "→",
      title: `Did you talk to ${truncate(whoToYou(nextChapter.who), 40)}?`,
      sub: "Write down what you found out while it's fresh.",
    });
  } else if (spine.futureFirst && !nextChapter) {
    alsoNow.push({
      key: "next-chapter",
      href: "/next",
      icon: "→",
      title: "Plan your next chapter",
      sub: hasLeftSchool(lifeStage)
        ? "Your options, the year you're hoping for, and who to ask."
        : "Life after school: your options, the year you're hoping for, and who to ask.",
    });
  } else if (spine.futureFirst) {
    alsoNow.push({
      key: "future",
      href: "/me?tab=future",
      icon: "→",
      title: "Pathways and goals",
      sub: hasLeftSchool(lifeStage)
        ? "Where your strengths point, and your next concrete steps."
        : "Where your strengths point, and the first steps after school.",
    });
  }

  // The check-in comes last: it's for later, and nothing else on Home waits on it.
  if (checkin && !checkin.startAt) {
    alsoNow.push({
      key: "checkin",
      href: "/check-in",
      icon: "◔",
      title: "A one-minute check-in",
      sub: "Nine quick questions now, so later you can see what's moved.",
    });
  } else if (
    checkin &&
    endDue({ startAt: checkin.startAt, endDone: checkin.endDone })
  ) {
    alsoNow.push({
      key: "checkin",
      href: "/check-in",
      icon: "◕",
      title: "The check-in, one more time",
      sub: "Ten weeks on: the same nine questions. See what's moved.",
    });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
        {/* Greeting */}
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">{greeting}</p>
          <h1 className="text-3xl text-navy" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            {firstName}.
          </h1>
          {welcomeBack && (
            <p className="text-sm text-ink-muted mt-2">
              Welcome back. No catching up to do — here&apos;s the next thing.
            </p>
          )}
        </div>

        {/* Up next — the one thing to do */}
        <section data-animate="2" aria-labelledby="up-next">
          <h2 id="up-next" className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Up next
          </h2>
          {upNext}
          <p className="text-xs text-ink-muted leading-relaxed mt-2">{spine.orderLine}</p>
        </section>

        {/* Also now */}
        {alsoNow.length > 0 && (
          <section data-animate="3" aria-labelledby="also-now">
            <h2 id="also-now" className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Also now
            </h2>
            <div className="space-y-2">
              {alsoNow.map((row) => (
                <Link
                  key={row.key}
                  href={row.href}
                  className="card p-4 flex items-center gap-3 hover:border-navy/30 transition-all"
                >
                  <span
                    className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-base text-ink-muted flex-shrink-0"
                    aria-hidden
                  >
                    {row.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink">{row.title}</div>
                    <p className="text-xs text-ink-muted leading-relaxed truncate">{row.sub}</p>
                  </div>
                  <Arrow className="text-ink-muted flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* What the missions found, once there's all of it */}
        {missionSummary && <MissionsSummaryCard summary={missionSummary} />}

        {/* A story, because most students never go looking for one */}
        {featuredStory && (
          <section data-animate="4" aria-labelledby="story-for-you">
            <div className="flex items-baseline justify-between mb-3">
              <h2 id="story-for-you" className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                A story for you
              </h2>
              <Link href="/stories" className="text-xs text-teal hover:underline">
                All stories
              </Link>
            </div>
            <Link
              href={`/stories/${featuredStory.id}`}
              className="card p-5 block hover:shadow-card transition-all"
            >
              {featuredStory.film && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mb-1.5 rounded-full bg-navy/10 text-navy text-xs font-medium">
                  <svg aria-hidden="true" width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M3 1.8v8.4c0 .6.65.97 1.16.66l6.3-4.2a.78.78 0 000-1.32l-6.3-4.2A.78.78 0 003 1.8z" />
                  </svg>
                  Animated · 1 min
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg text-navy mb-1" style={{ fontFamily: "var(--font-story)", fontWeight: 500 }}>
                    {featuredStory.title}
                  </p>
                  <p className="text-sm text-ink-muted leading-relaxed">{featuredStory.teaser}</p>
                </div>
                <Arrow className="text-ink-muted flex-shrink-0 mt-1" />
              </div>
            </Link>
          </section>
        )}

        {/* Where things stand, one line each, linking to the tab with the detail */}
        <div data-animate="5" className="pt-4 border-t border-surface-border space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/missions" className="text-ink-muted hover:text-ink">
              Missions <span className="font-semibold text-ink">{missionsDone} of 4</span>
            </Link>
            <Link href="/program" className="text-ink-muted hover:text-ink">
              Weeks <span className="font-semibold text-ink">{programWeek.weeksDone} of 10</span>
            </Link>
            <Link href="/support" className="text-ink-muted hover:text-ink">
              {supportCount > 0 ? (
                <>
                  Your support circle <span className="font-semibold text-ink">{supportCount}</span>
                </>
              ) : (
                <>Add someone you trust</>
              )}
            </Link>
          </div>
          <p className="text-xs text-ink-muted">
            Tuned for:{" "}
            <span className="font-medium text-ink">
              {LIFE_STAGE_OPTIONS.find((y) => y.key === lifeStage)?.label ?? "Year 10–11"}
            </span>
            .{" "}
            <Link href="/settings" className="text-teal hover:underline">
              Change it any time
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}
