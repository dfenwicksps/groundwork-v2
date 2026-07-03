"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Mission } from "@/lib/missions";
import AppShell from "@/components/layout/AppShell";

interface StoryPreview {
  id: string;
  title: string;
  teaser: string;
  tags: string[];
}

interface Props {
  mission: Mission;
  userId: string;
  completedActivities: Set<string>;
  stories: StoryPreview[];
}

export default function MissionDetailClient({
  mission,
  userId,
  completedActivities,
  stories,
}: Props) {
  const router = useRouter();
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const totalUnlocked = mission.activities.filter((a) => !a.locked).length;
  const totalCompleted = mission.activities.filter(
    (a) => !a.locked && completedActivities.has(a.id)
  ).length;
  const progressPct = Math.round((totalCompleted / totalUnlocked) * 100);

  // Reset this mission's progress so every activity can be redone. Journal
  // entries are intentionally NOT deleted — they stay in the Journal as a
  // record of what the user wrote. RLS scopes the delete to the user's rows.
  async function restartMission() {
    setRestarting(true);
    const db = createClient() as any;
    await db
      .from("mission_progress")
      .delete()
      .eq("user_id", userId)
      .eq("mission_id", mission.id);
    setRestarting(false);
    setConfirmingRestart(false);
    router.refresh();
  }

  return (
    <AppShell>
      {/* Mission hero */}
      <div
        className="px-4 pt-8 pb-10 text-white relative overflow-hidden"
        style={{ background: mission.colour }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(40%, -40%)" }}
        />
        <div className="max-w-2xl mx-auto relative">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 11L5 7l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-semibold opacity-60 uppercase tracking-wider">
              {mission.subtitle}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/80">
              {mission.phaseLabel}
            </span>
          </div>
          <h1
            className="text-3xl text-white mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            {mission.question}
          </h1>
          <p className="text-white/75 text-sm leading-relaxed mb-1 max-w-md">
            {mission.description}
          </p>
          <p className="text-white/50 text-xs leading-relaxed mb-5 max-w-md italic">
            {mission.phaseDescription}
          </p>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 opacity-80">
              <span>
                {totalCompleted} of {totalUnlocked} activities completed
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Journey — activities with stories woven in */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Your journey
            </h2>
            {stories.length > 0 && (
              <Link href="/stories" className="text-xs text-teal hover:underline">
                All stories
              </Link>
            )}
          </div>

          {/* Build a map: which story index appears before which activity index */}
          {(() => {
            const storySlots = new Map<number, number>();
            mission.activities.forEach((a, idx) => {
              if (a.storyBefore !== undefined && stories[a.storyBefore]) {
                storySlots.set(idx, a.storyBefore);
              }
            });

            const firstIncompleteIdx = mission.activities.findIndex(
              (a) => !a.locked && !completedActivities.has(a.id)
            );

            return (
              <div className="space-y-2">
                {mission.activities.map((activity, idx) => {
                  const completed = completedActivities.has(activity.id);
                  const isLocked = activity.locked;
                  const isCurrent = idx === firstIncompleteIdx;
                  const storyIdx = storySlots.get(idx);
                  const story = storyIdx !== undefined ? stories[storyIdx] : null;

                  return (
                    <div key={activity.id}>
                      {/* Story card woven in before this activity */}
                      {story && (
                        <Link
                          href={`/stories/${story.id}`}
                          className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl border border-dashed transition-all hover:border-solid hover:shadow-soft group"
                          style={{ borderColor: `${mission.colour}40`, background: `${mission.colour}06` }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
                            style={{ background: `${mission.colour}18` }}
                          >
                            📖
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: mission.colour }}>
                              Read first
                            </div>
                            <div className="text-sm font-medium text-ink truncate">
                              {story.title}
                            </div>
                            <div className="text-xs text-ink-muted mt-0.5 truncate">
                              {story.teaser}
                            </div>
                          </div>
                          <svg
                            width="14" height="14" viewBox="0 0 14 14" fill="none"
                            className="text-ink-muted flex-shrink-0"
                          >
                            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      )}

                      {isLocked ? (
                        <div className="card p-4 opacity-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-surface-border flex items-center justify-center text-xs text-ink-muted">
                              🔒
                            </div>
                            <div>
                              <div className="text-sm font-medium text-ink-muted">
                                Coming soon
                              </div>
                              <div className="text-xs text-ink-muted mt-0.5">
                                More activities being added
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={`/missions/${mission.id}/activities/${activity.id}`}
                          className={cn(
                            "card p-4 flex items-center gap-3 transition-all",
                            completed
                              ? "hover:shadow-soft"
                              : isCurrent
                              ? "ring-2 ring-teal hover:shadow-card"
                              : "hover:shadow-soft opacity-70"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm",
                              completed
                                ? "bg-sage text-white"
                                : isCurrent
                                ? "bg-teal text-white"
                                : "bg-surface-muted text-ink-muted border border-surface-border"
                            )}
                          >
                            {completed ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-sm font-medium", completed ? "text-ink-muted line-through" : "text-ink")}>
                                {activity.title}
                              </span>
                              {activity.isMilestone && (
                                <span className="text-xs text-gold-text bg-gold/10 px-1.5 py-0.5 rounded font-medium">
                                  ★ Milestone
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-ink-muted">{activity.subtitle}</span>
                              {activity.timeEstimate && !completed && (
                                <span className="text-xs text-ink-muted">· {activity.timeEstimate}</span>
                              )}
                            </div>
                          </div>

                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-muted flex-shrink-0">
                            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Remaining stories not woven into activities */}
        {(() => {
          const usedStoryIndices = new Set(
            mission.activities.map((a) => a.storyBefore).filter((i): i is number => i !== undefined)
          );
          const remainingStories = stories.filter((_, i) => !usedStoryIndices.has(i));
          if (remainingStories.length === 0) return null;
          return (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  More stories
                </h2>
                <Link href="/stories" className="text-xs text-teal hover:underline">
                  All stories
                </Link>
              </div>
              <div className="space-y-2">
                {remainingStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-card transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm"
                      style={{ background: mission.colour }}
                    >
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{story.title}</div>
                      <div className="text-xs text-ink-muted mt-0.5 truncate">{story.teaser}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-muted flex-shrink-0">
                      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Restart mission — only shown once there's progress to reset */}
        {totalCompleted > 0 && (
          <div className="pt-4 mt-2 border-t border-surface-border">
            {!confirmingRestart ? (
              <button
                onClick={() => setConfirmingRestart(true)}
                className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18M11.5 1.5V4H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Restart this mission
              </button>
            ) : (
              <div className="card p-5">
                <p className="text-sm font-medium text-ink mb-1">
                  Restart {mission.title}?
                </p>
                <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                  Every activity opens up again so you can redo it. Your existing
                  journal entries are kept — nothing you&apos;ve written is
                  deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingRestart(false)}
                    disabled={restarting}
                    className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={restartMission}
                    disabled={restarting}
                    className="btn btn-primary flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background: mission.colour }}
                  >
                    {restarting ? "Restarting…" : "Yes, restart"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
