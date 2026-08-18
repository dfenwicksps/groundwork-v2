"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  TIERS,
  TIER_EVENT,
  readTier,
  writeTier,
  insertText,
  hasTierContent,
  type Scaffold,
  type Tier,
} from "@/lib/scaffold";

/**
 * Tier state shared across every input on the page. A page with five boxes
 * (the weekly five) shows one switcher, not five — so changing it anywhere has
 * to move all of them, which the custom event handles.
 */
export function useTier(): [Tier, (t: Tier) => void] {
  const [tier, setTierState] = useState<Tier>("quick");

  useEffect(() => {
    setTierState(readTier());
    const onChange = (e: Event) => setTierState((e as CustomEvent).detail as Tier);
    window.addEventListener(TIER_EVENT, onChange);
    return () => window.removeEventListener(TIER_EVENT, onChange);
  }, []);

  const setTier = useCallback((t: Tier) => {
    setTierState(t);
    writeTier(t);
  }, []);

  return [tier, setTier];
}

/**
 * The tier switcher. Rendered once per page — every ScaffoldedInput on the
 * page follows it, because the tier lives in shared state rather than in any
 * one input.
 */
export function TierSwitcher({ className = "" }: { className?: string }) {
  const [tier, setTier] = useTier();
  const active = TIERS.find((t) => t.key === tier);

  return (
    <div className={`rounded-2xl border border-[--border] bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-semibold text-[--ink]">
          How do you want to answer?
        </span>
        <div
          role="radiogroup"
          aria-label="How much help do you want"
          className="flex bg-[--surface-muted] rounded-full p-0.5 border border-[--border]"
        >
          {TIERS.map((t) => {
            const on = t.key === tier;
            return (
              <button
                key={t.key}
                role="radio"
                aria-checked={on}
                onClick={() => setTier(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  on
                    ? "bg-white text-[--teal] shadow-sm"
                    : "text-[--ink-muted] hover:text-[--ink]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-[--ink-muted] leading-relaxed">{active?.blurb}</p>
    </div>
  );
}

/**
 * A textarea that never presents a student with nothing. At Quick it offers
 * complete answers to tap, at Extended half-written sentences to finish, and
 * at every tier — including Open — a "Stuck?" affordance holding angles into
 * the question.
 *
 * Everything inserts into the textarea rather than replacing it, so tapping is
 * a way to start writing rather than a way to avoid it.
 */
export default function ScaffoldedInput({
  value,
  onChange,
  scaffold,
  placeholder,
  rows = 4,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  scaffold?: Scaffold;
  placeholder?: string;
  rows?: number;
  /** Visible question text, when the input needs its own label */
  label?: string;
  id?: string;
}) {
  const [tier] = useTier();
  const [stuckOpen, setStuckOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const showQuick = tier === "quick" && !!scaffold?.quick?.length;
  const showStems = tier === "extended" && !!scaffold?.stems?.length;
  const hasStuck = !!scaffold?.stuck?.length;

  function insert(text: string) {
    onChange(insertText(value, text));
    // Put the cursor where the writing continues, not back at the top
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[--ink] mb-2 leading-snug">
          {label}
        </label>
      )}

      {/* Quick — complete answers, tapped then editable */}
      {showQuick && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {scaffold!.quick!.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => insert(q)}
              className="starter-chip !whitespace-normal text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Extended — sentence openings to finish */}
      {showStems && (
        <div className="flex flex-col gap-1.5 mb-2.5">
          {scaffold!.stems!.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => insert(s.trimEnd() + " ")}
              className="starter-chip !whitespace-normal !rounded-xl text-left w-full !items-start !text-[--ink]"
            >
              <span>
                {s.trimEnd()}
                <span className="text-[--ink-muted] opacity-60"> …</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <textarea
        id={id}
        ref={ref}
        className="conv-textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {/* Stuck? — offered at every tier, including Open */}
      {hasStuck && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setStuckOpen((o) => !o)}
            aria-expanded={stuckOpen}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[--teal] hover:underline"
          >
            <span aria-hidden>💡</span>
            {stuckOpen ? "Hide these" : "Stuck? Try this"}
          </button>
          {stuckOpen && (
            <ul className="mt-2 space-y-1.5 rounded-xl bg-[--surface-muted] border border-[--border] p-3">
              {scaffold!.stuck!.map((h) => (
                <li key={h} className="text-xs text-[--ink-muted] leading-relaxed flex gap-2">
                  <span className="text-[--ink-faint] flex-shrink-0" aria-hidden>
                    —
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Only shown when the chosen tier has nothing authored for this prompt,
          so the student isn't left wondering where the help went. */}
      {!hasTierContent(scaffold, tier) && tier !== "open" && hasStuck && (
        <p className="text-[11px] text-[--ink-muted] mt-1.5 leading-relaxed">
          No tap-answers for this one — the hints above are the help here.
        </p>
      )}
    </div>
  );
}
