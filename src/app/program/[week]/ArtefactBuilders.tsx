"use client";

import { useState } from "react";
import Link from "next/link";
import { VALUES_WITH_DEFINITIONS, VALUE_BEHAVIOURS } from "@/lib/missions";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";
import type { Scaffold } from "@/lib/scaffold";

/**
 * The two remaining artefact shapes — week 2's value/behaviour pairs and the
 * plain numbered lines weeks 7 and 8 ask for. Week 1 has its own picker, and
 * week 10 has the Character Code builder; between them, every "single" week
 * now makes something the app keeps.
 */

// ─── Week 2 — five values, five behaviours ────────────────────────────────────

/**
 * One scaffold per value, because a tap-answer for "Courage" is no use next to
 * "Family". The quick tier holds concrete observable behaviours for that exact
 * value (see VALUE_BEHAVIOURS); the stems and hints are shared, since the
 * shape of a good answer is the same whichever value it belongs to.
 */
function behaviourScaffold(value: string): Scaffold {
  return {
    quick: VALUE_BEHAVIOURS[value],
    stems: [
      "Someone watching me would see me",
      "This week that looked like",
      "The moment it would show is when",
    ],
    stuck: [
      "A behaviour is something a camera could record. \"Being honest\" isn't; \"telling Dad I'd broken it before he found out\" is.",
      "If you can't name a behaviour for one of these, that's the finding — it's a preference so far, not a value.",
      "Pick the smallest observable thing, not the most impressive one.",
    ],
  };
}

export function ValueBehaviours({
  heading,
  blurb,
  /** The five values chosen in Mission 1 — empty if that step isn't done */
  values,
  valuesHref,
  saved,
  busy,
  disabled,
  onSave,
}: {
  heading: string;
  blurb: string;
  values: string[];
  valuesHref: string;
  saved: { value: string; behaviour: string }[];
  busy: boolean;
  disabled: boolean;
  /** Resolves false when the save failed, so the editor keeps the work */
  onSave: (pairs: { value: string; behaviour: string }[]) => Promise<boolean>;
}) {
  // Saved pairs win over the mission's values, so re-reading a finished week
  // shows what the student actually wrote rather than resetting it.
  const base = saved.length
    ? saved
    : values.map((v) => ({ value: v, behaviour: "" }));

  const [pairs, setPairs] = useState(base);
  // What the summary renders — kept locally so it's correct the instant a save
  // returns, rather than after the server refresh lands.
  const [current, setCurrent] = useState(saved);
  const [editing, setEditing] = useState(
    !saved.length || saved.some((p) => !p.behaviour)
  );
  const [openValue, setOpenValue] = useState<string | null>(null);

  const filled = pairs.filter((p) => p.value.trim() && p.behaviour.trim()).length;

  function setBehaviour(i: number, v: string) {
    setPairs((prev) => prev.map((p, idx) => (idx === i ? { ...p, behaviour: v } : p)));
  }

  if (!values.length && !current.length) {
    return (
      <div data-animate="3">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          {heading}
        </h2>
        <div className="card p-5">
          <p className="text-sm text-ink leading-relaxed mb-3">
            This week attaches a behaviour to each of your five values — so it
            needs the five values first.
          </p>
          <Link
            href={valuesHref}
            className="btn btn-primary w-full py-2.5 rounded-xl text-sm block text-center"
          >
            Choose your five values →
          </Link>
          <p className="text-[11px] text-ink-muted text-center mt-2">
            About eight minutes, in Mission 1. Then come straight back here.
          </p>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <div data-animate="3">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          {heading}
        </h2>
        <div className="card p-5 space-y-3">
          {current.map((p) => (
            <div key={p.value} className="border-l-2 border-navy/25 pl-3">
              <div className="text-sm font-semibold text-navy">{p.value}</div>
              <p className="text-sm text-ink leading-relaxed">{p.behaviour}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setPairs(current);
            setEditing(true);
          }}
          className="text-xs text-teal hover:underline mt-3"
        >
          Rewrite a behaviour
        </button>
      </div>
    );
  }

  return (
    <div data-animate="3">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        {heading}
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">{blurb}</p>

      <div className="card p-5">
        <TierSwitcher className="mb-4" />
        <div className="space-y-4">
          {pairs.map((p, i) => (
            <div key={`${p.value}-${i}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold text-navy">{p.value}</span>
                {VALUES_WITH_DEFINITIONS[p.value] && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenValue(openValue === p.value ? null : p.value)
                    }
                    aria-expanded={openValue === p.value}
                    aria-label={`What ${p.value} means`}
                    className="w-[18px] h-[18px] rounded-full border border-[rgba(0,0,0,0.22)] text-[11px] font-semibold leading-none text-ink-muted hover:border-navy hover:text-navy flex items-center justify-center flex-shrink-0"
                  >
                    i
                  </button>
                )}
              </div>
              {openValue === p.value && (
                <p className="text-xs text-ink-muted leading-relaxed mb-2 rounded-lg bg-[rgba(46,125,140,0.05)] border border-[rgba(46,125,140,0.2)] px-3 py-2">
                  {VALUES_WITH_DEFINITIONS[p.value]}
                </p>
              )}
              <ScaffoldedInput
                value={p.behaviour}
                onChange={(v) => setBehaviour(i, v)}
                scaffold={behaviourScaffold(p.value)}
                placeholder={`What would someone see me do that proves ${p.value}?`}
                rows={2}
              />
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            if (await onSave(pairs)) {
              setCurrent(pairs);
              setEditing(false);
            }
          }}
          disabled={filled < pairs.length || busy || disabled}
          className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-4"
        >
          {busy ? "Saving…" : "Save my behaviours"}
        </button>
        <p className="text-[11px] text-ink-muted text-center mt-2">
          {filled} of {pairs.length} written — a value with an empty box beside
          it is the preference this week is arguing against.
        </p>
      </div>
    </div>
  );
}

// ─── Weeks 7 and 8 — a fixed number of lines ──────────────────────────────────

export function LinesBuilder({
  heading,
  blurb,
  count,
  placeholders,
  scaffold,
  saved,
  busy,
  disabled,
  onSave,
}: {
  heading: string;
  blurb: string;
  count: number;
  placeholders: string[];
  scaffold?: Scaffold;
  saved: string[];
  busy: boolean;
  disabled: boolean;
  /** Resolves false when the save failed, so the editor keeps the work */
  onSave: (lines: string[]) => Promise<boolean>;
}) {
  const [lines, setLines] = useState<string[]>(
    saved.length ? saved : Array.from({ length: count }, () => "")
  );
  const [current, setCurrent] = useState<string[]>(saved);
  const [editing, setEditing] = useState(saved.length < count);

  const filled = lines.filter((l) => l.trim()).length;

  if (!editing) {
    return (
      <div data-animate="3">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          {heading}
        </h2>
        <div className="card p-5">
          <ol className="space-y-2.5">
            {current.map((l, i) => (
              <li key={i} className="text-sm text-ink leading-relaxed flex gap-2.5">
                <span className="text-ink-muted flex-shrink-0 tabular-nums">
                  {i + 1}.
                </span>
                {l}
              </li>
            ))}
          </ol>
        </div>
        <button
          onClick={() => {
            setLines(current);
            setEditing(true);
          }}
          className="text-xs text-teal hover:underline mt-3"
        >
          Change these
        </button>
      </div>
    );
  }

  return (
    <div data-animate="3">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        {heading}
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">{blurb}</p>

      <div className="card p-5">
        <TierSwitcher className="mb-4" />
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm text-ink-muted tabular-nums pt-3 flex-shrink-0 w-4">
                {i + 1}.
              </span>
              <div className="flex-1">
                <ScaffoldedInput
                  value={l}
                  onChange={(v) =>
                    setLines((prev) => prev.map((x, idx) => (idx === i ? v : x)))
                  }
                  scaffold={scaffold}
                  placeholder={placeholders[i] || "One more…"}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            const next = lines.map((l) => l.trim()).filter(Boolean);
            if (await onSave(next)) {
              setCurrent(next);
              setEditing(false);
            }
          }}
          disabled={filled < count || busy || disabled}
          className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-4"
        >
          {busy ? "Saving…" : "Save these"}
        </button>
        <p className="text-[11px] text-ink-muted text-center mt-2">
          {filled} of {count} written
        </p>
      </div>
    </div>
  );
}
