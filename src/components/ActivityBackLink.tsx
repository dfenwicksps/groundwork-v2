"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RETURN_PARAM, parseReturnTo } from "@/lib/returnTo";

/**
 * The back arrow in an activity header.
 *
 * Normally it goes to the activity's mission, which is right when the student
 * arrived from the mission. But program weeks send students straight into a
 * mission activity, and for them "back" meant the mission they were never in —
 * so the week they came from was unreachable without going through the nav.
 *
 * When a week sent them, the arrow returns there and says so, because an arrow
 * that silently changes destination is worse than one that doesn't.
 */
function Arrow() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M13 16L7 10l6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MissionBack({ missionId }: { missionId: number }) {
  return (
    <Link
      href={`/missions/${missionId}`}
      aria-label="Back to mission"
      className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted] flex-shrink-0"
    >
      <Arrow />
    </Link>
  );
}

function Inner({ missionId }: { missionId: number }) {
  const target = parseReturnTo(useSearchParams().get(RETURN_PARAM));
  if (!target) return <MissionBack missionId={missionId} />;

  return (
    <Link
      href={target.href}
      aria-label={`Back to ${target.full}`}
      className="p-1.5 -ml-1.5 rounded-lg text-[--teal] flex items-center gap-1 flex-shrink-0"
    >
      <Arrow />
      <span className="text-xs font-semibold">{target.short}</span>
    </Link>
  );
}

export default function ActivityBackLink({ missionId }: { missionId: number }) {
  // Falls back to the mission link rather than nothing, so the arrow never
  // flickers out of existence while the params resolve.
  return (
    <Suspense fallback={<MissionBack missionId={missionId} />}>
      <Inner missionId={missionId} />
    </Suspense>
  );
}

/**
 * The done screen's primary action, when a program week is what sent them.
 *
 * Finishing the activity is the moment the week's errand is complete, so
 * "carry on through the mission" is the wrong next step — it walks them
 * further away from the thing they were doing. Renders nothing when they
 * arrived any other way, leaving the mission's own actions in place.
 */
function ReturnInner() {
  const target = parseReturnTo(useSearchParams().get(RETURN_PARAM));
  if (!target) return null;
  return (
    <Link
      href={target.href}
      className="btn btn-primary w-full py-3.5 rounded-xl mb-3 flex items-center justify-center gap-2"
    >
      <span aria-hidden>←</span> Back to {target.full}
    </Link>
  );
}

export function ReturnToWeekButton() {
  return (
    <Suspense fallback={null}>
      <ReturnInner />
    </Suspense>
  );
}
