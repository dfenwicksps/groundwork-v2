"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { LifeStage } from "@/lib/lifeStage";
import AppShell from "@/components/layout/AppShell";
import {
  CHECKIN_ITEMS,
  CONSTRUCTS,
  ITEM_SET,
  SCALE,
  complete,
  score,
  type Answers,
  type Scores,
  type Wave,
} from "@/lib/checkin";

export type CheckinState =
  | { kind: "unavailable" }
  | { kind: "take"; wave: Wave; start?: Scores }
  | { kind: "waiting"; startAt: string }
  | { kind: "compare"; start: Scores; end: Scores; startAt: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long" });
}

/**
 * The nine-question check-in (see lib/checkin.ts). The start one shows no
 * numbers back: a score on day one invites a student to answer the second time
 * to beat it. The end one shows both, side by side, with a word about why a
 * dip can be a good sign.
 */
export default function CheckinClient({
  userId,
  lifeStage,
  state,
}: {
  userId: string;
  lifeStage: LifeStage;
  state: CheckinState;
}) {
  const router = useRouter();
  const db = createClient() as any;
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAs, setSavedAs] = useState<{ wave: Wave; scores: Scores } | null>(null);

  const answered = CHECKIN_ITEMS.filter((i) => answers[i.key]).length;

  async function save(wave: Wave) {
    if (!complete(answers)) return;
    setBusy(true);
    setError(null);
    const scores = score(answers);
    const { error: err } = await db.from("outcome_checkins").insert({
      user_id: userId,
      wave,
      item_set: ITEM_SET,
      answers,
      scores,
      life_stage: lifeStage,
    });
    setBusy(false);
    if (err) {
      setError("Couldn't save — your answers are still here. Check your connection and try again.");
      return;
    }
    setSavedAs({ wave, scores });
    router.refresh();
  }

  const heading = (
    <div data-animate="1">
      <Link href="/dashboard" className="text-xs text-teal hover:underline">
        ← Home
      </Link>
      <h1
        className="text-3xl text-navy mt-3 mb-2"
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
          No scores yet, on purpose. Once you&apos;ve finished the missions or the ten
          weeks, the same nine questions come back, and you&apos;ll see both side by
          side.
        </p>
        <Link href="/dashboard" className="btn btn-primary w-full py-3 rounded-xl text-sm">
          Back to Home
        </Link>
      </div>
    );
  } else if (state.kind === "compare" || savedAs?.wave === "end") {
    const start = state.kind === "compare" ? state.start : (state as { start?: Scores }).start;
    const end = state.kind === "compare" ? state.end : savedAs!.scores;
    body = <Comparison start={start ?? null} end={end} />;
  } else if (state.kind === "waiting") {
    body = (
      <div className="card p-5 text-sm text-ink-muted leading-relaxed" data-animate="2">
        You did the first check-in on {formatDate(state.startAt)}. The second one opens
        once you&apos;ve finished the four missions or the ten weeks, and at least four
        weeks after the first, so there&apos;s been time for something to move.
      </div>
    );
  } else {
    const wave = state.wave;
    body = (
      <div className="space-y-4" data-animate="2">
        <p className="text-sm text-ink-muted leading-relaxed">
          {wave === "start"
            ? "Nine quick questions about how you see yourself right now. No right answers, nothing to pass: answer how it is today. Near the end you'll answer the same nine again and see what's moved."
            : "The same nine questions as last time. Answer how it is today, not how you remember answering, and then see both side by side."}
        </p>
        <div className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-ink-muted leading-relaxed">
          1 = {SCALE[0].toLowerCase()} · 5 = {SCALE[4].toLowerCase()}
        </div>
        {CHECKIN_ITEMS.map((item, i) => (
          <fieldset key={item.key} className="card p-4">
            <legend className="sr-only">{item.text}</legend>
            <p className="text-sm text-ink leading-relaxed mb-3" aria-hidden>
              <span className="text-ink-muted mr-1.5">{i + 1}.</span>
              {item.text}
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {SCALE.map((label, v) => {
                const value = v + 1;
                const sel = answers[item.key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sel}
                    aria-label={`${value}: ${label}`}
                    onClick={() => setAnswers((a) => ({ ...a, [item.key]: value }))}
                    className={cn(
                      "py-2.5 rounded-xl border text-sm font-semibold transition-all",
                      sel ? "bg-navy text-white border-navy" : "bg-white text-ink border-border hover:border-navy/30"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-muted mt-2 min-h-[1rem]">
              {answers[item.key] ? SCALE[answers[item.key] - 1] : ""}
            </p>
          </fieldset>
        ))}
        {error && (
          <p role="alert" className="text-sm text-red-600 leading-relaxed">
            {error}
          </p>
        )}
        <button
          onClick={() => save(wave)}
          disabled={!complete(answers) || busy}
          className="btn btn-primary w-full py-3.5 rounded-xl"
        >
          {busy ? "Saving…" : wave === "start" ? "Save my starting point" : "See what's moved"}
        </button>
        <p className="text-xs text-ink-muted text-center leading-relaxed">
          {answered} of {CHECKIN_ITEMS.length} answered. Your answers are private. The only
          other use is in totals with names removed, to check whether Groundwork
          actually helps.
        </p>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {heading}
        {body}
      </div>
    </AppShell>
  );
}

function Comparison({ start, end }: { start: Scores | null; end: Scores }) {
  return (
    <div className="space-y-3" data-animate="2">
      <p className="text-sm text-ink-muted leading-relaxed">
        Where you started, and where you are now, out of 5.
      </p>
      {CONSTRUCTS.map(({ key, name, blurb }) => {
        const a = start?.[key];
        const b = end[key];
        const diff = a !== undefined ? Math.round((b - a) * 10) / 10 : null;
        return (
          <div key={key} className="card p-4">
            <div className="text-sm font-semibold text-ink">{name}</div>
            <div className="text-xs text-ink-muted mb-3">{blurb}</div>
            {(
              [
                ["Start", a],
                ["Now", b],
              ] as const
            ).map(([label, v]) =>
              v === undefined ? null : (
                <div key={label} className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-ink-muted w-10">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-navy"
                      style={{ width: `${(v / 5) * 100}%`, opacity: label === "Start" ? 0.45 : 1 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink tabular-nums w-7 text-right">{v.toFixed(1)}</span>
                </div>
              )
            )}
            {diff !== null && (
              <div className="text-xs text-ink-muted mt-2">
                {diff > 0 ? `Up ${diff.toFixed(1)}` : diff < 0 ? `Down ${Math.abs(diff).toFixed(1)}` : "No change"}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-xs text-ink-muted leading-relaxed">
        A dip isn&apos;t a step backwards. Looking hard at who you are often makes you
        less sure for a while before you&apos;re surer, and that&apos;s how it&apos;s
        meant to go.
      </p>
    </div>
  );
}
