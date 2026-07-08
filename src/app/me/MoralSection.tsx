"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  MORAL_SCENARIOS,
  MORAL_STYLES,
  scoreMoral,
  type MoralStyle,
} from "@/lib/moral";

interface Profile {
  primary_style: string;
  secondary_style: string | null;
  style_scores: Record<string, number>;
  /** Raw per-question picks, so a retake pre-fills previous answers. */
  answers: MoralStyle[] | null;
}

/**
 * Moral compass — 8 quick dilemmas diagnosing how the user tends to decide
 * (care-led / fairness-led / loyalty-led / principle-led). Answers are saved
 * and fully editable: retaking pre-fills previous picks and you can move
 * back/forward to change any one.
 */
export default function MoralSection({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile | null;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [taking, setTaking] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(MoralStyle | null)[]>(() =>
    profile?.answers && profile.answers.length === MORAL_SCENARIOS.length
      ? [...profile.answers]
      : MORAL_SCENARIOS.map(() => null)
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [local, setLocal] = useState<Profile | null>(profile);

  const info = local ? MORAL_STYLES[local.primary_style as MoralStyle] : null;
  const secondaryInfo =
    local?.secondary_style ? MORAL_STYLES[local.secondary_style as MoralStyle] : null;

  const isLast = idx === MORAL_SCENARIOS.length - 1;
  const canAdvance = answers[idx] != null;

  function choose(style: MoralStyle) {
    setAnswers((a) => a.map((v, i) => (i === idx ? style : v)));
  }

  async function finish() {
    if (answers.some((a) => a == null)) return;
    setSaving(true);
    setSaveError(null);
    const picks = answers as MoralStyle[];
    const result = scoreMoral(picks);
    const base = {
      user_id: userId,
      style_scores: result.scores,
      primary_style: result.primary,
      secondary_style: result.secondary,
      taken_at: new Date().toISOString(),
    };
    let { error } = await db
      .from("moral_profiles")
      .upsert({ ...base, answers: picks }, { onConflict: "user_id" });
    // The answers column (for retake prefill) is optional — if the database
    // hasn't been migrated for it yet, save the result without it rather than
    // blocking the user.
    if (error && /answers/i.test(error.message || "")) {
      ({ error } = await db
        .from("moral_profiles")
        .upsert(base, { onConflict: "user_id" }));
    }
    setSaving(false);
    if (error) {
      setSaveError(
        /find the table|does not exist|schema cache/i.test(error.message || "")
          ? "The moral compass database isn't set up yet — a quick fix is needed on our side, not yours."
          : "Couldn't save — check your connection and try again."
      );
      return;
    }
    setLocal({
      primary_style: result.primary,
      secondary_style: result.secondary,
      style_scores: result.scores,
      answers: picks,
    });
    setTaking(false);
    setIdx(0);
    router.refresh();
  }

  // ── Quiz in progress ──
  if (taking) {
    const sc = MORAL_SCENARIOS[idx];
    return (
      <div data-animate="4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Your moral compass
          </h2>
          <span className="text-xs text-ink-muted">
            {idx + 1} of {MORAL_SCENARIOS.length}
          </span>
        </div>
        <div className="card p-5">
          <p className="text-sm text-ink leading-relaxed mb-4">{sc.scenario}</p>
          {saveError && (
            <p role="alert" className="text-sm text-red-600 mb-3">{saveError}</p>
          )}
          <div className="space-y-2">
            {sc.options.map((o) => {
              const sel = answers[idx] === o.style;
              return (
                <button
                  key={o.style}
                  onClick={() => choose(o.style)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all ${
                    sel
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-ink border-surface-border hover:border-navy/30"
                  }`}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => (idx > 0 ? setIdx(idx - 1) : setTaking(false))}
              className="btn btn-secondary py-2 px-4 rounded-xl text-sm"
            >
              {idx > 0 ? "Back" : "Cancel"}
            </button>
            <button
              onClick={() => (isLast ? finish() : setIdx(idx + 1))}
              disabled={!canAdvance || saving}
              className="btn btn-primary flex-1 py-2 rounded-xl text-sm"
            >
              {saving ? "Saving…" : isLast ? "See my result" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No profile yet ──
  if (!local || !info) {
    return (
      <div data-animate="4">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          Your moral compass
        </h2>
        <div className="card p-5 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0" aria-hidden>🧭</span>
          <div className="flex-1">
            <p className="text-sm text-ink font-medium mb-0.5">
              How do you decide what&apos;s right?
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              8 quick dilemmas reveal your decision-making pattern.
            </p>
          </div>
          <button
            onClick={() => {
              setIdx(0);
              setTaking(true);
            }}
            className="btn btn-primary text-sm py-2 px-4 flex-shrink-0"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // ── Result ──
  return (
    <div data-animate="4">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
        Your moral compass
      </h2>
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl" aria-hidden>{info.emoji}</span>
          <div>
            <div className="text-base font-semibold text-ink">{info.name}</div>
            {secondaryInfo && (
              <div className="text-xs text-ink-muted">
                with a {secondaryInfo.name.toLowerCase()} streak {secondaryInfo.emoji}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-ink leading-relaxed mb-3">{info.how}</p>
        <p className="text-xs text-ink-muted leading-relaxed mb-3">
          <span className="font-semibold text-sage">Your superpower: </span>
          {info.strength}
        </p>
        <div className="rounded-xl px-4 py-3 bg-gold/10 border border-gold/30 mb-3">
          <p className="text-xs text-ink leading-relaxed">
            <span className="font-semibold">Watch out: </span>
            {info.watchOut}
          </p>
        </div>
        <button
          onClick={() => {
            setIdx(0);
            setTaking(true);
          }}
          className="text-xs text-teal hover:underline"
        >
          {local.answers ? "Review & edit my answers" : "Retake the dilemmas"}
        </button>
      </div>
    </div>
  );
}
