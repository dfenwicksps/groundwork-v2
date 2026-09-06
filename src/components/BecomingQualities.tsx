"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { VIA_STRENGTHS, STRENGTH_BY_KEY } from "@/lib/strengths";
import {
  BECOMING_ACTIVITY_ID,
  QUALITIES_COUNT,
  FOCUS_MAX,
  practiceFor,
  boostKeyFor,
  serialiseBecoming,
  type Becoming,
} from "@/lib/becoming";
import { cn } from "@/lib/utils";

/**
 * "Who I'm becoming" — the one place the app asks who you're heading towards.
 *
 * It renders in two places and is the same artefact in both: as program week
 * 1's challenge, and on the profile under Grow. Whichever door you come in by,
 * you're editing one record (see src/lib/becoming.ts), so changing your five on
 * the profile changes what week 1 shows, and vice versa.
 *
 * Two steps, deliberately in this order:
 *
 *   1. Five qualities you'd want to be described by at 25 — the direction.
 *   2. One or two of those five to work on now — the work.
 *
 * Step 2 is capped at two on purpose. "Improve everything" is how nothing gets
 * practised, and the practice action underneath only means anything if there
 * are one or two of them.
 */
export default function BecomingQualities({
  userId,
  saved,
  /** The student's actual top five VIA strengths, from Mission 1 */
  currentTop,
  /** VIA keys the habit check flagged as worth working on */
  suggested = [],
  /** "program" frames it as this week's challenge; "profile" as a standing plan */
  variant,
  strengthsHref = "/missions/1/activities/strengths-mapping",
  /** Program week 1 records its own completion receipt through this */
  onSaved,
  disabled = false,
  hasGoals = false,
}: {
  userId: string;
  saved: Becoming;
  currentTop: string[];
  suggested?: string[];
  variant: "program" | "profile";
  /** Where to send someone with no strengths mapped — carries a return token
      when a program week is the one asking. */
  strengthsHref?: string;
  onSaved?: (qualities: string[]) => Promise<boolean>;
  disabled?: boolean;
  hasGoals?: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [current, setCurrent] = useState<Becoming>(saved);
  // "qualities" picks the five, "focus" picks the one or two, null shows the plan.
  const [step, setStep] = useState<"qualities" | "focus" | null>(
    saved.qualities.length < QUALITIES_COUNT ? "qualities" : null
  );
  const [picked, setPicked] = useState<string[]>(saved.qualities);
  const [focus, setFocus] = useState<string[]>(saved.focus);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSet = new Set(currentTop);
  const suggestedSet = new Set(suggested);

  /**
   * Functional updates, not `setPicked([...picked, key])`. Two taps inside one
   * React batch both read the same array from the render closure, so the second
   * silently discards the first — exactly what fast tapping on a phone does.
   */
  function togglePicked(key: string) {
    setPicked((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= QUALITIES_COUNT) {
        setBlocked(key);
        setTimeout(() => setBlocked((b) => (b === key ? null : b)), 1800);
        return prev;
      }
      return [...prev, key];
    });
  }

  function toggleFocus(key: string) {
    setFocus((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= FOCUS_MAX) {
        setBlocked(key);
        setTimeout(() => setBlocked((b) => (b === key ? null : b)), 1800);
        return prev;
      }
      return [...prev, key];
    });
  }

  async function persist(next: Becoming): Promise<boolean> {
    setBusy(true);
    setError(null);
    const { error: err } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: BECOMING_ACTIVITY_ID,
      prompt: "Who I'm becoming — five qualities at 25, and what I'm working on",
      response: serialiseBecoming(next),
      is_milestone: false,
    });
    if (err) {
      setBusy(false);
      setError("Couldn't save — your choices are still here. Try again.");
      return false;
    }
    // The program week keeps its own receipt so it can count itself complete;
    // it never renders from it, so the two can't show different answers.
    if (onSaved && !(await onSaved(next.qualities))) {
      setBusy(false);
      setError("Saved to your profile, but this week didn't record it. Try again.");
      return false;
    }
    setBusy(false);
    setCurrent(next);
    router.refresh();
    return true;
  }

  // ── Step 1: the five ──
  if (step === "qualities") {
    const open = openKey ? STRENGTH_BY_KEY[openKey] : null;
    return (
      <Frame variant={variant} step="qualities">
        <div className="card p-5">
          {currentTop.length > 0 ? (
            <div className="rounded-xl bg-surface-muted border border-surface-border p-4 mb-4">
              <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
                What you lead with today · from Mission 1
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentTop.map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border border-navy/30 text-navy"
                  >
                    {STRENGTH_BY_KEY[k]?.name ?? k}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                You&apos;re choosing from the same 24, so the two lists line up.
                Picking your current five back is allowed — just make sure
                it&apos;s a decision rather than a default.
              </p>
            </div>
          ) : (
            <p className="text-xs text-ink-muted leading-relaxed mb-4">
              Pick your five now if you like — but without your strengths mapped
              there&apos;s nothing to set them against, and the gap is the point.{" "}
              <Link
                href={strengthsHref}
                className="text-teal hover:underline"
              >
                Strengths Mapping
              </Link>{" "}
              takes about eight minutes.
            </p>
          )}

          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-semibold text-ink">
              Pick {QUALITIES_COUNT}
            </span>
            <span className="text-[11px] text-ink-muted">
              {picked.length} of {QUALITIES_COUNT}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {VIA_STRENGTHS.map((s) => {
              const sel = picked.includes(s.key);
              const atLimit = !sel && picked.length >= QUALITIES_COUNT;
              return (
                <div key={s.key} className="relative">
                  <button
                    type="button"
                    onClick={() => togglePicked(s.key)}
                    aria-pressed={sel}
                    className={cn(
                      "w-full h-full p-3 pr-7 rounded-xl text-sm font-medium border transition-all text-left",
                      blocked === s.key && "animate-nudge",
                      sel
                        ? "bg-[--navy] text-white border-[--navy]"
                        : atLimit
                          ? "bg-white text-[--ink-muted] border-[--border] hover:border-[rgba(27,58,92,0.2)]"
                          : "bg-white text-[--ink] border-[--border] hover:border-[rgba(27,58,92,0.3)]"
                    )}
                  >
                    {sel && (
                      <span aria-hidden className="mr-1">
                        ✓
                      </span>
                    )}
                    {s.name}
                    {/* Marking what's already yours turns the grid itself into
                        the comparison, before anything is saved. */}
                    {currentSet.has(s.key) && (
                      <span
                        className={cn(
                          "block text-[10px] font-semibold mt-0.5",
                          sel ? "text-white/70" : "text-sage"
                        )}
                      >
                        already yours
                      </span>
                    )}
                    {!currentSet.has(s.key) && suggestedSet.has(s.key) && (
                      <span
                        className={cn(
                          "block text-[10px] font-semibold mt-0.5",
                          sel ? "text-white/70" : "text-teal"
                        )}
                      >
                        🌱 from your habit check
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenKey(openKey === s.key ? null : s.key)}
                    aria-expanded={openKey === s.key}
                    aria-label={`What ${s.name} means`}
                    className={cn(
                      "absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full border",
                      "text-[11px] font-semibold leading-none flex items-center justify-center transition-colors",
                      sel
                        ? "border-white/50 text-white/90 hover:bg-white/20"
                        : "border-[rgba(0,0,0,0.22)] text-[--ink-muted] hover:border-[--navy] hover:text-[--navy]"
                    )}
                  >
                    i
                  </button>
                </div>
              );
            })}
          </div>

          <div className="min-h-20 mb-4 flex items-start">
            {blocked ? (
              <div
                role="status"
                className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-ink"
              >
                You&apos;ve chosen {QUALITIES_COUNT}. Tap one of them to swap it
                out first.
              </div>
            ) : open ? (
              <div className="w-full rounded-xl bg-[rgba(46,125,140,0.05)] border border-[rgba(46,125,140,0.2)] px-4 py-3 text-sm text-ink-muted">
                <span className="font-semibold text-ink">{open.name}: </span>
                {open.short}
              </div>
            ) : (
              <p className="text-xs text-ink-muted px-1 pt-1">
                Tap a quality to choose it · tap its{" "}
                <span className="font-medium">i</span> for what it means
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 mb-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            {current.qualities.length > 0 && (
              <button
                onClick={() => {
                  setPicked(current.qualities);
                  setFocus(current.focus);
                  setStep(null);
                }}
                className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                // A focus that's no longer one of the five can't survive.
                setFocus((f) => f.filter((k) => picked.includes(k)));
                setStep("focus");
              }}
              disabled={picked.length !== QUALITIES_COUNT || disabled}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              Next: what to work on →
            </button>
          </div>
        </div>
      </Frame>
    );
  }

  // ── Step 2: the one or two ──
  if (step === "focus") {
    return (
      <Frame variant={variant} step="focus">
        <div className="card p-5">
          <p className="text-sm text-ink leading-relaxed mb-1">
            Five is the direction. Now pick{" "}
            <span className="font-semibold">one or two</span> to actually work on
            — the ones you&apos;ll get a practice action for.
          </p>
          <p className="text-xs text-ink-muted leading-relaxed mb-4">
            Trying to build all five at once is how none of them get built. You
            can change this whenever you want.
          </p>

          <div className="space-y-2 mb-3">
            {picked.map((k) => {
              const s = STRENGTH_BY_KEY[k];
              const sel = focus.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleFocus(k)}
                  aria-pressed={sel}
                  className={cn(
                    "w-full p-3 rounded-xl text-left border transition-all",
                    blocked === k && "animate-nudge",
                    sel
                      ? "bg-[--navy] text-white border-[--navy]"
                      : "bg-white text-ink border-surface-border hover:border-navy/30"
                  )}
                >
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <span aria-hidden>{sel ? "✓" : s?.emoji}</span>
                    {s?.name ?? k}
                    {currentSet.has(k) && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold ml-auto",
                          sel ? "text-white/70" : "text-sage"
                        )}
                      >
                        already yours
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] mt-0.5 leading-snug",
                      sel ? "text-white/80" : "text-ink-muted"
                    )}
                  >
                    {s?.short}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-ink-muted mb-3">
            {focus.length} of {FOCUS_MAX} chosen
            {blocked &&
              ` · you've chosen ${FOCUS_MAX} — tap one to swap it out first`}
          </p>

          {error && (
            <p role="alert" className="text-sm text-red-600 mb-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setStep("qualities")}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              ← Back
            </button>
            <button
              onClick={async () => {
                if (await persist({ qualities: picked, focus })) setStep(null);
              }}
              disabled={focus.length === 0 || busy || disabled}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : "This is who I'm becoming"}
            </button>
          </div>
        </div>
      </Frame>
    );
  }

  // ── The plan ──
  const already = current.qualities.filter((k) => currentSet.has(k));
  const toGrow = current.qualities.filter((k) => !currentSet.has(k));

  return (
    <Frame variant={variant} step={null}>
      <div
        className="rounded-2xl p-5 text-white mb-3"
        style={{ background: "var(--navy)" }}
      >
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">
          At 25, I want to be described as
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {current.qualities.map((k) => (
            <span
              key={k}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold",
                current.focus.includes(k)
                  ? "bg-white text-navy"
                  : "bg-white/15 text-white"
              )}
            >
              <span aria-hidden className="mr-1">
                {STRENGTH_BY_KEY[k]?.emoji}
              </span>
              {STRENGTH_BY_KEY[k]?.name ?? k}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          Working on{" "}
          {current.focus.map((k, i) => (
            <span key={k}>
              {i > 0 && " and "}
              <span className="font-semibold">
                {STRENGTH_BY_KEY[k]?.name ?? k}
              </span>
            </span>
          ))}{" "}
          right now.
        </p>
      </div>

      {/* The gap — only meaningful once Mission 1 has produced a top five. */}
      {currentTop.length > 0 && (
        <div className="card p-4 mb-3 space-y-2">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
            Against where you are now
          </div>
          {already.length > 0 && (
            <p className="text-sm text-ink leading-relaxed">
              <span className="font-semibold">
                {already.map((k) => STRENGTH_BY_KEY[k]?.name ?? k).join(", ")}
              </span>{" "}
              {already.length === 1 ? "is" : "are"} already in your top five —
              the part of the 25-year-old you that already exists.
            </p>
          )}
          {toGrow.length > 0 ? (
            <p className="text-sm text-ink leading-relaxed">
              <span className="font-semibold">
                {toGrow.map((k) => STRENGTH_BY_KEY[k]?.name ?? k).join(", ")}
              </span>{" "}
              {toGrow.length === 1 ? "isn't" : "aren't"} there yet. That gap is
              what the work is for.
            </p>
          ) : (
            <p className="text-sm text-ink leading-relaxed">
              You picked exactly the five you already lead with. Worth asking
              honestly: is that because they&apos;re genuinely the ones you want
              at 25, or because they were the easiest to pick?
            </p>
          )}
        </div>
      )}

      {/* Growth plan: quality → what it means → one thing to do */}
      <div className="space-y-2">
        {current.focus.map((k) => {
          const s = STRENGTH_BY_KEY[k];
          const { inPractice, action } = practiceFor(k);
          const boost = boostKeyFor(k);
          return (
            <div key={k} className="card p-4">
              <div className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <span aria-hidden>{s?.emoji}</span> {s?.name ?? k}
              </div>
              <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                {inPractice}
              </p>
              <div className="rounded-xl px-3.5 py-2.5 bg-teal/5 border border-teal/20">
                <div className="text-[10px] font-bold text-teal uppercase tracking-widest mb-0.5">
                  My practice action
                </div>
                <p className="text-xs text-ink leading-relaxed">{action}</p>
              </div>
              {/* Eight of the 24 have a longer guide behind them. */}
              {boost && (
                <Link
                  href="/me?tab=grow#boosts"
                  className="text-[11px] text-teal hover:underline mt-2 inline-block"
                >
                  Read the longer guide on this →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {variant === "profile" && !hasGoals && (
          <a href="#goals" className="text-xs text-teal hover:underline">
            Attach a goal to this ↓
          </a>
        )}
        <button
          onClick={() => {
            setFocus(current.focus);
            setPicked(current.qualities);
            setStep("focus");
          }}
          className="text-xs text-teal hover:underline"
        >
          Change what I&apos;m working on
        </button>
        <button
          onClick={() => {
            setPicked(current.qualities);
            setFocus(current.focus);
            setStep("qualities");
          }}
          className="text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Change my five
        </button>
      </div>
    </Frame>
  );
}

/**
 * The heading and standfirst. The artefact is identical in both places; only
 * the framing differs — week 1 is meeting it as this week's challenge, the
 * profile is coming back to a plan already in progress.
 */
function Frame({
  variant,
  step,
  children,
}: {
  variant: "program" | "profile";
  step: "qualities" | "focus" | null;
  children: React.ReactNode;
}) {
  const blurb =
    step === "qualities"
      ? "Pick the five you'd want someone to reach for when describing you at 25. Not the ones you already have — the ones you'd want to be true."
      // The focus step's card carries its own explanation, and repeating it
      // here just made the same sentence appear twice in a row.
      : null;

  return (
    <div data-animate="4" id="focus">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Who I&apos;m becoming
      </h2>
      {blurb && (
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">{blurb}</p>
      )}
      {!blurb && variant === "program" && (
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">
          This is the same plan as on your profile — change it in either place.
        </p>
      )}
      {!blurb && variant === "profile" && <div className="mb-3" />}
      {children}
    </div>
  );
}
