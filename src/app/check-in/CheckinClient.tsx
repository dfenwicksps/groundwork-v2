"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import CheckinForm from "@/components/CheckinForm";
import CheckinComparison from "@/components/CheckinComparison";
import {
  countWord,
  followUpDate,
  itemSet,
  CURRENT_SET,
  type CheckinState,
  type Scores,
  type Wave,
} from "@/lib/checkin";
import type { LifeStage } from "@/lib/lifeStage";
import { useScrollToTop } from "@/lib/useScrollToTop";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long" });
}

/**
 * The check-in (see lib/checkin.ts). The start one shows no
 * numbers back: a score on day one invites a student to answer the second time
 * to beat it. The end one shows both, side by side, with a word about why a
 * dip can be a good sign.
 */
export default function CheckinClient({
  state,
  lifeStage,
}: {
  state: CheckinState;
  lifeStage?: LifeStage;
}) {
  const router = useRouter();
  const set = itemSet(state.kind === "unavailable" ? CURRENT_SET : state.setId);
  const count = countWord(set.items.length);
  const [savedAs, setSavedAs] = useState<{ wave: Wave; scores: Scores } | null>(null);
  useScrollToTop(savedAs?.wave ?? null);

  function saved(wave: Wave, scores: Scores) {
    setSavedAs({ wave, scores });
    router.refresh();
  }

  const heading = (
    <div data-animate="1">
      <Link href="/dashboard" className="text-xs text-teal hover:underline">
        ← Home
      </Link>
      <h1
        className="text-3xl lg:text-4xl text-navy mt-3 mb-2"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        Check-in
      </h1>
    </div>
  );

  let body: React.ReactNode;

  if (state.kind === "unavailable") {
    body = (
      <div className="card p-5 text-sm text-ink-muted leading-relaxed">
        The check-in isn&apos;t switched on yet. That&apos;s a fix needed on our side, not
        yours.
      </div>
    );
  } else if (savedAs?.wave === "start") {
    body = (
      <div className="card p-5" data-animate="2">
        <div className="text-sm font-semibold text-ink mb-2">That&apos;s your starting point.</div>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          No scores yet, on purpose. In ten weeks the same {count} questions come back,
          and you&apos;ll see both side by side.
        </p>
        <Link href="/dashboard" className="btn btn-primary w-full py-3 rounded-xl text-sm">
          Back to Home
        </Link>
      </div>
    );
  } else if (state.kind === "compare" || savedAs?.wave === "end") {
    const start = state.kind === "compare" ? state.start : (state as { start?: Scores }).start;
    const end = state.kind === "compare" ? state.end : savedAs!.scores;
    body = (
      <div data-animate="2">
        <CheckinComparison start={start ?? null} end={end} setId={set.id} />
      </div>
    );
  } else if (state.kind === "waiting") {
    body = (
      <div className="card p-5 text-sm text-ink-muted leading-relaxed" data-animate="2">
        You did the first check-in on {formatDate(state.startAt)}. The second one opens
        ten weeks after that, on {formatDate(followUpDate(state.startAt).toISOString())},
        however much of the app you&apos;ve done by then. Ten weeks gives something time
        to move.
      </div>
    );
  } else {
    const wave = state.wave;
    body = (
      <div className="space-y-4" data-animate="2">
        <p className="text-sm text-ink-muted leading-relaxed">
          {wave === "start"
            ? `${count[0].toUpperCase()}${count.slice(1)} quick questions about how you see yourself right now. No right answers, nothing to pass: answer how it is today. In ten weeks you'll answer the same ${count} again and see what's moved.`
            : `The same ${count} questions as ten weeks ago. Answer how it is today, not how you remember answering, and then see both side by side.`}
        </p>
        <CheckinForm
          wave={wave}
          context="home"
          itemSetId={set.id}
          lifeStage={lifeStage ?? "middle"}
          submitLabel={wave === "start" ? "Save my starting point" : "See what's moved"}
          onSaved={(scores) => saved(wave, scores)}
        />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg lg:max-w-2xl mx-auto px-4 py-8 space-y-6 lg:py-10">
        {heading}
        {body}
      </div>
    </AppShell>
  );
}
