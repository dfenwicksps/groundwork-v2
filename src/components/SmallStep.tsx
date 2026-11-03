"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { mentionsCrisis } from "@/lib/help";
import { createClient } from "@/lib/supabase";
import SupportCard from "@/components/help/SupportCard";
import {
  WHEN_OPTIONS,
  dueFor,
  stepOptions,
  stepWithWhen,
  GENERIC_STEPS,
  type StepSource,
  type StepWhen,
} from "@/lib/smallSteps";

// ─── Ending on something you can do ──────────────────────────────────────────
// After a reflection, the last word is an action, not the thing the student
// was turning over. Optional: tap one, write one, or ignore it. Used after
// mission steps, the week's reflection, the weekly five and the Next Chapter
// debrief; each saves the step's text copy its own way, through onSave.
//
// With a `source`, the options are written for that step or week, the student
// picks when, and the step is kept in small_steps so Home can ask "Did you do
// it?" once it's due and the Me page can list the done ones (lib/smallSteps).

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

/** Keeps the step for following up. A missing table (migration 020) is ignored. */
async function recordStep(source: StepSource, entryId: string | null | undefined, step: string, when: StepWhen) {
  const db = createClient() as any;
  const { data } = await db.auth.getSession();
  const userId = data?.session?.user?.id;
  if (!userId) return;
  const row = {
    user_id: userId,
    entry_id: entryId ?? null,
    source_kind: source.kind,
    source_key: source.key,
    source_label: source.label,
    step,
    when_label: WHEN_OPTIONS.find((w) => w.key === when)?.label ?? null,
    due_at: dueFor(when).toISOString(),
    status: "open",
    snoozes: 0,
    done_at: null,
    updated_at: new Date().toISOString(),
  };
  try {
    if (entryId) await db.from("small_steps").upsert(row, { onConflict: "entry_id" });
    else await db.from("small_steps").insert(row);
  } catch {
    // Following up is a bonus; the step is still saved on the entry.
  }
}

export default function SmallStep({
  accent = "var(--navy)",
  saved,
  onSave,
  prompt,
  options,
  source,
  entryId,
}: {
  accent?: string;
  /** The step already kept, if any */
  saved: string;
  /** Saves the step's text copy on the entry; false keeps the form open with an error */
  onSave: (step: string) => Promise<boolean>;
  prompt?: string;
  options?: string[];
  /** Where it was written: picks the options, and keeps the step for following up */
  source?: StepSource;
  /** The journal entry the step hangs off, so changing it replaces it */
  entryId?: string | null;
}) {
  const choices = options ?? (source ? stepOptions(source) : GENERIC_STEPS);
  const ask =
    prompt ??
    (source
      ? "What's one small thing you'll do because of what you just wrote? Pick when, and we'll check back with you then. Optional."
      : "What's one small thing you could do in the next week because of what you just wrote? Optional, and it's saved with this entry.");
  const [draft, setDraft] = useState("");
  const [when, setWhen] = useState<StepWhen>("week");
  const [checkBack, setCheckBack] = useState<Date | null>(null);
  const [editing, setEditing] = useState(!saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The page's own check has already run on the entry this step hangs off;
  // the step is new writing, so it gets the same on-device check.
  const [supportNeeded, setSupportNeeded] = useState(false);
  const inputId = useId();

  async function save(step: string) {
    if (step.trim().length < 3) return;
    setSupportNeeded(mentionsCrisis(step));
    setBusy(true);
    setError(null);
    const clean = step.replace(/\s*\n+\s*/g, " ").trim();
    const ok = await onSave(source ? stepWithWhen(clean, when) : clean);
    if (ok && source) {
      await recordStep(source, entryId, clean, when);
      setCheckBack(dueFor(when));
    }
    setBusy(false);
    if (!ok) {
      setError("Couldn't save that. Try again in a moment.");
      return;
    }
    setEditing(false);
  }

  if (!editing && saved) {
    return (
      <>
        {supportNeeded && <SupportCard />}
        <div className="rounded-2xl p-4 mb-5 bg-white border-2" style={{ borderColor: `color-mix(in srgb, ${accent} 22%, transparent)` }} data-animate="3">
          <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>
            ✓ Your small step
          </div>
          <p className="text-sm text-[--ink] leading-relaxed">{saved}</p>
          {checkBack && (
            <p className="text-xs text-[--ink-muted] mt-1.5 leading-relaxed">
              We&apos;ll ask how it went on {formatDay(checkBack)}. Done steps are kept on your Me page.
            </p>
          )}
          <button
            onClick={() => {
              setDraft(saved);
              setEditing(true);
            }}
            className="text-xs text-[--teal] hover:underline mt-2"
          >
            Change it
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="rounded-2xl p-4 mb-5 bg-white border-2" style={{ borderColor: `color-mix(in srgb, ${accent} 22%, transparent)` }} data-animate="3">
      <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>
        Before you go: one small step
      </div>
      <p className="text-xs text-[--ink-muted] leading-relaxed mb-3">{ask}</p>
      <div className="space-y-1.5 mb-3">
        {choices.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setDraft(o)}
            aria-pressed={draft === o}
            className={cn(
              "w-full text-left px-3 py-2 rounded-xl border text-sm leading-relaxed transition-all",
              draft === o ? "text-white" : "bg-white text-[--ink] border-[--border] hover:border-[rgba(0,0,0,0.18)]"
            )}
            style={draft === o ? { background: accent, borderColor: accent } : undefined}
          >
            {draft === o && <span aria-hidden className="mr-1.5">✓</span>}
            {o}
          </button>
        ))}
      </div>
      <label htmlFor={inputId} className="sr-only">Your own small step</label>
      <input
        id={inputId}
        type="text"
        className="input text-sm mb-2"
        value={draft}
        maxLength={160}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Or write your own"
      />
      {source && (
        <div className="mb-3" role="group" aria-label="When">
          <div className="text-xs font-semibold text-[--ink-muted] mb-1.5">When?</div>
          <div className="flex flex-wrap gap-1.5">
            {WHEN_OPTIONS.map((w) => (
              <button
                key={w.key}
                type="button"
                onClick={() => setWhen(w.key)}
                aria-pressed={when === w.key}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-semibold",
                  when === w.key ? "text-white" : "bg-white text-[--ink] border-[--border]"
                )}
                style={when === w.key ? { background: accent, borderColor: accent } : undefined}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 mb-2">
          {error}
        </p>
      )}
      <button
        onClick={() => save(draft)}
        disabled={draft.trim().length < 3 || busy}
        className="btn btn-secondary w-full py-2.5 rounded-xl text-sm"
      >
        {busy ? "Saving…" : "Keep this step"}
      </button>
    </div>
  );
}
