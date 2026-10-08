"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { mentionsCrisis } from "@/lib/help";
import SupportCard from "@/components/help/SupportCard";

// ─── Ending on something you can do ──────────────────────────────────────────
// After a reflection, the last word is an action, not the thing the student
// was turning over. Optional: tap one, write one, or ignore it. Used after
// mission steps, the week's reflection, the weekly five and the Next Chapter
// debrief; each saves the step its own way, through onSave.

const SMALL_STEP_OPTIONS = [
  "Tell one person one thing I wrote here",
  "Do one small thing differently this week",
  "Notice when this comes up, and jot it down",
];

export default function SmallStep({
  accent = "var(--navy)",
  saved,
  onSave,
  prompt = "What's one small thing you could do in the next week because of what you just wrote? Optional, and it's saved with this entry.",
  options = SMALL_STEP_OPTIONS,
}: {
  accent?: string;
  /** The step already kept, if any */
  saved: string;
  /** Saves the step; false keeps the form open with an error */
  onSave: (step: string) => Promise<boolean>;
  prompt?: string;
  options?: string[];
}) {
  const [draft, setDraft] = useState("");
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
    const ok = await onSave(step.replace(/\s*\n+\s*/g, " ").trim());
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
      <p className="text-xs text-[--ink-muted] leading-relaxed mb-3">{prompt}</p>
      <div className="space-y-1.5 mb-3">
        {options.map((o) => (
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
