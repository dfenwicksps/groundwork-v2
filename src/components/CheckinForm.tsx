"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  complete,
  itemSet,
  itemText,
  scaleFor,
  type Answers,
  type CheckinContext,
  type Scores,
  type Wave,
} from "@/lib/checkin";
import type { LifeStage } from "@/lib/lifeStage";

/**
 * The check-in questions and their save button. Shared by onboarding (the
 * baseline) and /check-in (a start taken later, and the end). Saving goes
 * through /api/checkin, which scores it and records the dose server-side.
 *
 * `itemSetId` is the set to show: the current one for a start, the start's own
 * set for an end (see setForWave). The server decides the same way and checks
 * the answers against it, so the two can't drift apart.
 */
export default function CheckinForm({
  wave,
  context,
  itemSetId,
  lifeStage,
  submitLabel,
  onSaved,
}: {
  wave: Wave;
  context: CheckinContext;
  itemSetId: string;
  lifeStage: LifeStage;
  submitLabel: string;
  onSaved: (scores: Scores) => void;
}) {
  const set = itemSet(itemSetId);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answered = set.items.filter((i) => answers[i.key]).length;

  async function save() {
    if (!complete(set, answers)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wave, answers, context }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 503
            ? "The check-in isn't switched on yet. That's a fix needed on our side, not yours."
            : "Couldn't save — your answers are still here. Check your connection and try again."
        );
        setBusy(false);
        return;
      }
      onSaved(data.scores as Scores);
    } catch {
      setError("Couldn't save — your answers are still here. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-ink-muted leading-relaxed">
        Tap 1 to 5. The words under each question say what the two ends mean.
      </div>
      {set.items.map((item, i) => {
        const text = itemText(item, lifeStage);
        const scale = scaleFor(item);
        return (
        <fieldset key={item.key} className="card p-4">
          <legend className="sr-only">{text}</legend>
          <p className="text-sm text-ink leading-relaxed mb-3" aria-hidden>
            <span className="text-ink-muted mr-1.5">{i + 1}.</span>
            {text}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {scale.map((label, v) => {
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
          <div className="flex justify-between text-[11px] text-ink-faint mt-1.5" aria-hidden>
            <span>1 = {scale[0].toLowerCase()}</span>
            <span>5 = {scale[4].toLowerCase()}</span>
          </div>
          <p className="text-xs text-ink-muted mt-1 min-h-[1rem]">
            {answers[item.key] ? scale[answers[item.key] - 1] : ""}
          </p>
        </fieldset>
        );
      })}
      {error && (
        <p role="alert" className="text-sm text-red-600 leading-relaxed">
          {error}
        </p>
      )}
      <button
        onClick={save}
        disabled={!complete(set, answers) || busy}
        className="btn btn-primary w-full py-3.5 rounded-xl"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
      <p className="text-xs text-ink-muted text-center leading-relaxed">
        {answered} of {set.items.length} answered. Private: your answers are only
        ever shown back to you.
      </p>
    </div>
  );
}
