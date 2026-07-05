"use client";

import Link from "next/link";
import { MISSIONS, getActivityLabel } from "@/lib/missions";
import { formatRelativeDate, truncate, cn } from "@/lib/utils";
import type {
  UserProfile,
  MissionProgress,
  Challenge,
  JournalEntry,
  SupportContact,
} from "@/types/database";
import AppShell from "@/components/layout/AppShell";

type RevisitEntry = {
  id: string;
  mission_id: number;
  activity_id: string;
  prompt: string;
  response: string;
  created_at: string;
};

type NudgeActivity = {
  missionId: number;
  activityId: string;
  title: string;
};

interface Props {
  profile: UserProfile;
  progress: MissionProgress[];
  challenge: Challenge | null;
  recentEntries: Partial<JournalEntry>[];
  supportCircle: SupportContact[];
  revisitEntry: RevisitEntry | null;
  nudgeActivity: NudgeActivity | null;
}

function getMissionProgress(
  missionId: number,
  progress: MissionProgress[]
): number {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return 0;
  const totalActivities = mission.activities.filter((a) => !a.locked).length;
  const completed = progress.filter(
    (p) => p.mission_id === missionId
  ).length;
  return Math.round((completed / totalActivities) * 100);
}

const MISSION_CHALLENGE_ACTIVITY: Record<number, string> = {
  1: "weekly-challenge",
  2: "purpose-challenge",
  3: "connection-challenge",
  4: "meaning-challenge",
};

export default function DashboardClient({
  profile,
  progress,
  challenge,
  recentEntries,
  supportCircle,
  revisitEntry,
  nudgeActivity,
}: Props) {
  const firstName = profile.display_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeMission = MISSIONS.find((m) => m.id === profile.active_mission) || MISSIONS[0];
  const activeMissionProgress = getMissionProgress(profile.active_mission, progress);

  const totalCompleted = progress.length;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">{greeting}</p>
          <h1
            className="text-3xl text-navy"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {firstName}.
          </h1>
        </div>

        {/* Active Mission Card */}
        <div data-animate="2">
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{ background: activeMission.colour }}
          >
            {/* Background decoration */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{
                background: "white",
                transform: "translate(30%, -30%)",
              }}
            />
            <div
              className="absolute bottom-0 right-8 w-24 h-24 rounded-full opacity-10"
              style={{
                background: "white",
                transform: "translate(0, 40%)",
              }}
            />

            <div className="relative">
              <div className="text-xs font-medium opacity-70 mb-1">
                {activeMission.subtitle} — Active
              </div>
              <h2
                className="text-2xl mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                {activeMission.question}
              </h2>

              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between text-xs mb-1.5 opacity-80">
                  <span>Progress</span>
                  <span>{activeMissionProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${activeMissionProgress}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/missions/${profile.active_mission}`}
                className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                Continue mission
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Revisit prompt — Evaluation Cycle */}
        {revisitEntry && (
          <div data-animate="3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Time to check back in
            </h2>
            <Link
              href={`/revisit/${revisitEntry.id}`}
              className={cn(
                "card p-5 flex items-start gap-4 hover:shadow-card transition-all group",
                "border-l-4"
              )}
              style={{ borderLeftColor: "#15803D" }}
            >
              <div className="w-9 h-9 rounded-xl bg-sage/10 flex items-center justify-center text-lg flex-shrink-0">
                ↩
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink mb-1">
                  {getActivityLabel(revisitEntry.activity_id)}
                </p>
                <p className="text-xs text-ink-muted mb-2">
                  Written {formatRelativeDate(revisitEntry.created_at)} · Does it still feel true?
                </p>
                <p className="text-xs text-ink-muted italic line-clamp-2">
                  &ldquo;{truncate(revisitEntry.response, 100)}&rdquo;
                </p>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-ink-muted group-hover:text-ink-muted flex-shrink-0 mt-1 transition-colors"
              >
                <path
                  d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* Avoidance nudge — gentle re-entry when inactive 10+ days */}
        {nudgeActivity && (
          <div data-animate="3">
            <Link
              href={`/missions/${nudgeActivity.missionId}/activities/${nudgeActivity.activityId}`}
              className="card p-5 flex items-start gap-4 hover:shadow-card transition-all group border border-dashed border-surface-border hover:border-navy/20"
            >
              <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center text-lg flex-shrink-0">
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink mb-0.5">
                  {nudgeActivity.title} — whenever you&apos;re ready
                </p>
                <p className="text-xs text-ink-muted mb-2">
                  Your next step is here. No pressure on timing.
                </p>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-ink-muted/30 group-hover:text-ink-muted flex-shrink-0 mt-1 transition-colors"
              >
                <path
                  d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* Active Challenge */}
        {challenge && (
          <div data-animate="3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              This week&apos;s challenge
            </h2>
            <div className="card p-5 border-l-4" style={{ borderLeftColor: "#F59E0B" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink mb-1">
                    {challenge.challenge_text}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Started {formatRelativeDate(challenge.issued_at)}
                  </p>
                </div>
                <Link
                  href={`/missions/${challenge.mission_id}/activities/${MISSION_CHALLENGE_ACTIVITY[challenge.mission_id] ?? "weekly-challenge"}`}
                  className="flex-shrink-0 bg-gold/10 text-gold-text hover:bg-gold/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Check in
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mission Map */}
        <div data-animate="3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Mission map
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MISSIONS.map((mission) => {
              const mProgress = getMissionProgress(mission.id, progress);
              const isActive = mission.id === profile.active_mission;
              const isLocked = mission.id > profile.active_mission;

              return (
                <Link
                  key={mission.id}
                  href={isLocked ? "#" : `/missions/${mission.id}`}
                  className={`card p-4 transition-all group ${
                    isLocked ? "pointer-events-none" : "hover:shadow-card"
                  }`}
                  aria-disabled={isLocked}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: mission.colour }}
                    >
                      {mission.id}
                    </div>
                    {isActive && (
                      <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    {mProgress === 100 && (
                      <span className="text-xs font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                        Done ✓
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-ink-muted">Next</span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-semibold mb-0.5 ${isLocked ? "text-ink-muted" : "text-navy"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {mission.title}
                  </div>
                  <div className={`text-xs mb-0.5 ${isLocked ? "text-ink-muted" : "text-ink-muted"}`}>
                    {mission.phaseLabel}
                  </div>
                  <div className={`text-xs mb-3 line-clamp-1 ${isLocked ? "text-ink-muted" : "text-ink-muted"}`} style={{ fontStyle: "italic" }}>
                    {mission.question}
                  </div>
                  {!isLocked && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${mProgress}%` }}
                      />
                    </div>
                  )}
                  {isLocked && (
                    <div className="h-1.5 rounded-full bg-surface-border/50" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Reflections */}
        {recentEntries.length > 0 && (
          <div data-animate="4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Recent reflections
              </h2>
              <Link
                href="/journal"
                className="text-xs text-teal hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal`}
                  className="card p-4 flex items-center justify-between group hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background:
                          MISSIONS.find((m) => m.id === entry.mission_id)
                            ?.colour || "#4F46E5",
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">
                        {entry.activity_id
                          ? getActivityLabel(entry.activity_id) ||
                            entry.activity_id
                          : "Reflection"}
                        {entry.is_milestone && (
                          <span className="ml-2 text-xs text-gold-text bg-gold/10 px-1.5 py-0.5 rounded">
                            ★ Milestone
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {entry.created_at
                          ? formatRelativeDate(entry.created_at)
                          : ""}
                      </div>
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-ink-muted group-hover:text-ink-muted flex-shrink-0 ml-3 transition-colors"
                  >
                    <path
                      d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Support Circle Widget */}
        <div data-animate="5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Your support circle
            </h2>
            <Link href="/support" className="text-xs text-teal hover:underline">
              Manage
            </Link>
          </div>

          {supportCircle.length > 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-muted mb-3">
                The people in your corner:
              </p>
              <div className="flex flex-wrap gap-2">
                {supportCircle.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-2 bg-surface-muted rounded-lg px-3 py-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-xs font-semibold text-navy">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {contact.name}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {contact.relationship}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-4 leading-relaxed">
                If things ever feel too hard, reach out to one of these people.
                Real conversations matter more than anything on this app.
              </p>
            </div>
          ) : (
            <Link href="/support" className="card p-5 block hover:shadow-card transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center text-lg flex-shrink-0">
                  🤝
                </div>
                <div>
                  <p className="text-sm font-medium text-ink mb-1">
                    Add a trusted person
                  </p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Groundwork works best alongside real relationships. Add
                    someone you could talk to if things get hard.
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Stats row */}
        {totalCompleted > 0 && (
          <div data-animate="6" className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Activities done",
                value: totalCompleted,
                color: "#4F46E5",
              },
              {
                label: "Missions started",
                value: MISSIONS.filter((m) =>
                  progress.some((p) => p.mission_id === m.id)
                ).length,
                color: "#0E7490",
              },
              {
                label: "Days active",
                value: Math.max(
                  1,
                  Math.ceil(
                    (new Date().getTime() -
                      new Date(profile.created_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ),
                color: "#15803D",
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 text-center">
                <div
                  className="text-2xl font-semibold mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-ink-muted leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
