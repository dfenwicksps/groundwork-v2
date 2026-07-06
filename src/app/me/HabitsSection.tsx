"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  HABIT_QUESTIONS,
  scoreHabits,
  habitsToResponse,
  type HabitAnswer,
  type HabitResult,
} from "@/lib/habits";
import { BOOST_BY_KEY } from "@/lib/boosts";

/**
 * Habit Check — "character is what you repeatedly practise". An honest
 * self-audit of how the student currently responds in real situations.
 * Stored as a journal entry (no schema change); retake pre-fills answers.
 */
export default function HabitsSection({
  userId,
  saved,
}: {
  userId: string;
  saved: { answers: Record<string, HabitAnswer>; result: HabitResult } | null;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, HabitAnswer>>(
    saved?.answers ?? {}
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<HabitResult | null>(saved?.result ?? null);

  const allAnswered = HABIT_QUESTIONS.every((q) => answers[q.id]);

  async function save() {
    if (!allAnswered) return;
    setBusy(true);
    setError(null);
    const result = scoreHabits(answers);
    const { error: err } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: "habit-check",
      prompt: "Habit Check — how do you currently respond in real situations?",
      response: habitsToResponse(answers, result),
      is_milestone: false,
    });
    setBusy(false);
    if (err) {
      setError("Couldn't save — check your connection and try again.");
      return;
    }
    setLocal(result);
    setTaking(false);
    router.refresh();
  }

  // ── Audit in progress ──
  if (taking) {
    return (
      <div data-animate="4" id="habits">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          Habit check
        </h2>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-4 leading-relaxed">
            Be honest — this is a mirror, not a test. Nobody else sees it.
          </p>
          <div className="space-y-4">
            {HABIT_QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="text-sm text-ink font-medium mb-1.5">{q.question}</p>
                <div className="flex gap-1.5">
                  {(["usually", "sometimes", "rarely"] as HabitAnswer[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                        answers[q.id] === a
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setTaking(false)}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!allAnswered || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : "See my patterns"}
            </button>
          </div>
          {!allAnswered && (
            <p className="text-[11px] text-ink-muted text-center mt-2">
              Answer all {HABIT_QUESTIONS.length} to continue.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── No audit yet ──
  if (!local) {
    return (
      <div data-animate="4" id="habits">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          Habit check
        </h2>
        <div className="card p-5 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0" aria-hidden>🪞</span>
          <div className="flex-1">
            <p className="text-sm text-ink font-medium mb-0.5">
              How do you actually respond under pressure?
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Character is what you repeatedly practise — 8 honest questions show
              your current patterns.
            </p>
          </div>
          <button
            onClick={() => setTaking(true)}
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
    <div data-animate="4" id="habits">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
        Habit check — your current patterns
      </h2>
      <div className="card p-5 space-y-4">
        {local.keeps.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-sage uppercase tracking-wider mb-1.5">
              ✓ Already working for you
            </div>
            <div className="flex flex-wrap gap-1.5">
              {local.keeps.map((k) => (
                <span key={k} className="px-2.5 py-1 rounded-full text-xs bg-sage/10 text-sage font-medium">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {local.grows.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-gold-text uppercase tracking-wider mb-1.5">
              🌱 Worth working on
            </div>
            <div className="space-y-1.5">
              {local.grows.map((g) => (
                <div key={g.label} className="flex items-center gap-2 text-xs">
                  <span className="text-ink font-medium">{g.label}</span>
                  <span className="text-ink-muted">
                    → builds with{" "}
                    <span className="font-semibold">
                      {BOOST_BY_KEY[g.quality]?.emoji} {BOOST_BY_KEY[g.quality]?.name || g.quality}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {local.sometimes.length > 0 && (
          <p className="text-xs text-ink-muted leading-relaxed">
            <span className="font-semibold">Sometimes:</span>{" "}
            {local.sometimes.join(" · ")} — worth watching, no judgement.
          </p>
        )}
        <p className="text-xs text-ink-muted leading-relaxed border-t border-surface-border pt-3">
          Your patterns point at the qualities worth choosing in{" "}
          <span className="font-medium">Who I&apos;m becoming</span> below.
        </p>
        <button onClick={() => setTaking(true)} className="text-xs text-teal hover:underline">
          Retake — your answers are saved
        </button>
      </div>
    </div>
  );
}
