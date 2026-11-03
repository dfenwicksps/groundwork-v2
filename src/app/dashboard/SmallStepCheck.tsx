"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { SNOOZE_DAYS, SNOOZES_BEFORE_LET_GO, type SmallStepRow } from "@/lib/smallSteps";

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

/**
 * Home's check-back on a small step once it's due: "Did you do it?". Done
 * steps are kept on the Me page; "Not yet" asks again a few days later; after
 * a couple of those it says plainly that letting it go is fine, so a step
 * never turns into a nag.
 */
export default function SmallStepCheck({ step }: { step: SmallStepRow }) {
  const [result, setResult] = useState<null | { kind: "done" | "later" | "dropped"; next?: Date }>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function update(kind: "done" | "later" | "dropped") {
    setBusy(true);
    setError(false);
    const db = createClient() as any;
    const now = new Date();
    const next = new Date(now.getTime() + SNOOZE_DAYS * 86_400_000);
    const patch =
      kind === "done"
        ? { status: "done", done_at: now.toISOString() }
        : kind === "dropped"
          ? { status: "dropped" }
          : { due_at: next.toISOString(), snoozes: step.snoozes + 1 };
    const { error: err } = await db
      .from("small_steps")
      .update({ ...patch, updated_at: now.toISOString() })
      .eq("id", step.id);
    setBusy(false);
    if (err) {
      setError(true);
      return;
    }
    setResult({ kind, next: kind === "later" ? next : undefined });
  }

  if (result) {
    return (
      <div data-fluoro="violet" className="card p-4" role="status">
        <p className="text-sm text-ink leading-relaxed">
          {result.kind === "done"
            ? "Nice one. It's on your Me page, with the others you've done."
            : result.kind === "dropped"
              ? "Let go. That's allowed: not every step is the right one."
              : `No problem. We'll ask again on ${formatDay(result.next!)}.`}
        </p>
      </div>
    );
  }

  const nudged = step.snoozes >= SNOOZES_BEFORE_LET_GO;
  return (
    <div data-fluoro="violet" className="card p-4">
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-base text-ink-muted flex-shrink-0"
          aria-hidden
        >
          ✓
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ink">Did you do it?</div>
          <p className="text-sm text-ink leading-relaxed mt-0.5">&ldquo;{step.step}&rdquo;</p>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            {step.source_label ? `From ${step.source_label}. ` : ""}
            {nudged ? "Still want to? It's fine to let it go." : ""}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => update("done")}
              disabled={busy}
              className="btn btn-primary text-sm py-2 px-4 rounded-xl"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => update("later")}
              disabled={busy}
              className="btn btn-secondary text-sm py-2 px-4 rounded-xl"
            >
              Not yet
            </button>
            <button
              type="button"
              onClick={() => update("dropped")}
              disabled={busy}
              className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 px-2"
            >
              Let it go
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-ink-muted mt-2">
              Couldn&apos;t save that. Try again in a moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
