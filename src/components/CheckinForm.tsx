"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CHECKIN_ITEMS,
  SCALE,
  complete,
  type Answers,
  type CheckinContext,
  type Scores,
  type Wave,
} from "@/lib/checkin";

/**
 * The nine check-in questions and their save button. Shared by onboarding (the
 * baseline) and /check-in (a start taken later, and the end). Saving goes
 * through /api/checkin, which scores it and records the dose server-side.
 */
export default function CheckinForm({
  wave,
  context,
  submitLabel,
  onSaved,
}: {
  wave: Wave;
  context: CheckinContext;
  submitLabel: string;
  onSaved: (scores: Scores) => void;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answered = CHECKIN_ITEMS.filter((i) => answers[i.key]).length;

  async function save() {
    if (!complete(answers)) return;
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
        onClick={save}
        disabled={!complete(answers) || busy}
        className="btn btn-primary w-full py-3.5 rounded-xl"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
      <p className="text-xs text-ink-muted text-center leading-relaxed">
        {answered} of {CHECKIN_ITEMS.length} answered. Private: your answers are only
        ever shown back to you.
      </p>
    </div>
  );
}
