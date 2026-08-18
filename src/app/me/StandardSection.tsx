"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRelativeDate } from "@/lib/utils";
import {
  STANDARD_QUESTIONS,
  STANDARD_BY_KEY,
  answeredCount,
  cleanAnswers,
  cadenceNote,
  standardToResponse,
  type StandardAnswers,
  type StandardCheckin,
  type StandardKey,
} from "@/lib/standard";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";

/**
 * The Standard — three questions the student holds themselves to, answered
 * again and again over months. Not scored, not a streak, never compared to
 * anyone else. The value is in reading your own answers back, so every
 * check-in is kept and the previous answer is shown while writing the next.
 */
export default function StandardSection({
  userId,
  checkins,
  ready,
}: {
  userId: string;
  checkins: StandardCheckin[]; // newest first
  ready: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const latest = checkins[0] ?? null;
  const previous = checkins.slice(1);

  const [writing, setWriting] = useState(false);
  const [drafts, setDrafts] = useState<StandardAnswers>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = answeredCount(drafts);
  const note = cadenceNote(latest?.created_at ?? null);

  function friendlyError(message: string, fallback: string) {
    return /find the table|does not exist|schema cache/i.test(message)
      ? "This isn't switched on yet — that's a fix on our side, not yours."
      : fallback;
  }

  function startWriting(prefill: StandardAnswers = {}) {
    setDrafts(prefill);
    setError(null);
    setEditing(false);
    setWriting(true);
  }

  async function save() {
    const answers = cleanAnswers(drafts);
    if (Object.keys(answers).length === 0) return;
    setBusy(true);
    setError(null);

    const { error: err } = await db.from("standard_checkins").insert({
      user_id: userId,
      answers,
      set: "standard",
    });
    if (err) {
      setBusy(false);
      setError(
        friendlyError(
          err.message || "",
          "Couldn't save — your writing is still here. Try again."
        )
      );
      return;
    }

    // Journal copy so check-ins sit alongside everything else — non-fatal.
    await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: "the-standard",
      prompt: "The Standard — the three questions I hold myself to",
      response: standardToResponse(answers),
      is_milestone: false,
    });

    setBusy(false);
    setWriting(false);
    setDrafts({});
    router.refresh();
  }

  async function saveEdit() {
    if (!latest) return;
    const answers = cleanAnswers(drafts);
    if (Object.keys(answers).length === 0) return;
    setBusy(true);
    setError(null);
    const { error: err } = await db
      .from("standard_checkins")
      .update({ answers, updated_at: new Date().toISOString() })
      .eq("id", latest.id);
    setBusy(false);
    if (err) {
      setError(
        friendlyError(
          err.message || "",
          "Couldn't save your edit — your writing is still here. Try again."
        )
      );
      return;
    }
    setWriting(false);
    setEditing(false);
    setDrafts({});
    router.refresh();
  }

  if (!ready) {
    return (
      <div data-animate="5" id="standard">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          The Standard
        </h2>
        <div className="card p-5 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0" aria-hidden>
            🧰
          </span>
          <div>
            <p className="text-sm text-ink font-medium mb-0.5">
              Being switched on shortly
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Three questions to hold yourself to — check back soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Writing a check-in ──
  if (writing) {
    return (
      <div data-animate="5" id="standard">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          {editing ? "Editing your last check-in" : "The Standard"}
        </h2>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-5 leading-relaxed">
            Answer honestly, not impressively. Nobody else sees this — and a
            weak honest answer is worth more to you than a strong invented one.
          </p>

          <TierSwitcher className="mb-5" />

          <div className="space-y-6">
            {STANDARD_QUESTIONS.map((q) => {
              const last = latest?.answers[q.key];
              return (
                <div key={q.key}>
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-lg flex-shrink-0" aria-hidden>
                      {q.emoji}
                    </span>
                    <p className="text-sm text-ink font-semibold leading-snug">
                      {q.question}
                    </p>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed mb-2.5">
                    {q.meaning}
                  </p>

                  {/* The payoff of a recurring check-in: last time's answer, right there */}
                  {!editing && last && (
                    <div className="rounded-xl px-3 py-2 bg-surface-muted border border-surface-border mb-2.5">
                      <div className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">
                        Last time you wrote
                      </div>
                      <p className="text-xs text-ink-muted italic leading-relaxed">
                        &ldquo;{last}&rdquo;
                      </p>
                    </div>
                  )}

                  <ScaffoldedInput
                    value={drafts[q.key] || ""}
                    onChange={(v) =>
                      setDrafts((prev) => ({ ...prev, [q.key]: v }))
                    }
                    scaffold={{ quick: q.examples, stems: q.stems, stuck: q.stuck }}
                    placeholder={q.placeholder}
                    rows={3}
                  />

                  {/* The counterweight — only once they've started, so it reads as
                      a deepening question rather than an accusation. */}
                  {(drafts[q.key] || "").trim().length > 0 && (
                    <p className="text-[11px] text-gold-text leading-relaxed mt-2 pl-2 border-l-2 border-gold/40">
                      {q.harder}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 mt-4">
              {error}
            </p>
          )}

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                setWriting(false);
                setEditing(false);
                setDrafts({});
                setError(null);
              }}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={editing ? saveEdit : save}
              disabled={filled === 0 || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Save this check-in"}
            </button>
          </div>
          <p className="text-[11px] text-ink-muted text-center mt-2">
            {filled === 0
              ? "Answer at least one to save."
              : filled < STANDARD_QUESTIONS.length
                ? `${filled} of ${STANDARD_QUESTIONS.length} answered — partial is fine.`
                : "All three answered."}
          </p>
        </div>
      </div>
    );
  }

  // ── Never checked in ──
  if (!latest) {
    return (
      <div data-animate="5" id="standard">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          The Standard
        </h2>
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">
          Everything else here asks who you are. These three ask what you&apos;re
          putting into the rooms you&apos;re in — and you answer them again and
          again, for as long as you use this app.
        </p>
        <div className="card p-5">
          <div className="space-y-3 mb-5">
            {STANDARD_QUESTIONS.map((q) => (
              <div key={q.key} className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0" aria-hidden>
                  {q.emoji}
                </span>
                <p className="text-sm text-ink leading-snug font-medium">
                  {q.question}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed mb-4 pt-3 border-t border-surface-border">
            No score, no streak, nobody else reading it. Just the same three
            questions, and a record of how your answers change.
          </p>
          <button
            onClick={() => startWriting()}
            className="btn btn-primary w-full py-2.5 rounded-xl text-sm"
          >
            Answer them for the first time
          </button>
        </div>
      </div>
    );
  }

  // ── Latest check-in + history ──
  return (
    <div data-animate="5" id="standard">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        The Standard
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        The three questions you hold yourself to · {checkins.length} check-in
        {checkins.length === 1 ? "" : "s"}
      </p>

      <div className="card p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-bold text-teal uppercase tracking-wider">
            Most recent
          </span>
          <span className="text-[11px] text-ink-muted">
            {formatRelativeDate(latest.created_at)}
          </span>
        </div>

        <div className="space-y-4">
          {STANDARD_QUESTIONS.map((q) => {
            const answer = latest.answers[q.key];
            return (
              <div key={q.key}>
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-base flex-shrink-0" aria-hidden>
                    {q.emoji}
                  </span>
                  <p className="text-xs text-ink font-semibold leading-snug">
                    {q.question}
                  </p>
                </div>
                {answer ? (
                  <p className="text-sm text-ink leading-relaxed pl-6 whitespace-pre-wrap">
                    {answer}
                  </p>
                ) : (
                  <p className="text-xs text-ink-faint italic pl-6">
                    Left blank last time.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {note && (
          <p className="text-xs text-ink-muted leading-relaxed mt-4 pt-3 border-t border-surface-border">
            {note}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setDrafts(latest.answers);
              setEditing(true);
              setWriting(true);
              setError(null);
            }}
            className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => startWriting()}
            className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
          >
            Check in again
          </button>
        </div>
      </div>

      {/* History — the actual point of the exercise */}
      {previous.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Earlier check-ins
          </div>
          <div className="space-y-1.5">
            {previous.map((c) => {
              const open = openId === c.id;
              const preview =
                STANDARD_QUESTIONS.map((q) => c.answers[q.key]).find(Boolean) ||
                "";
              return (
                <div
                  key={c.id}
                  className="bg-white border border-surface-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(open ? null : c.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-xs font-medium text-ink flex-shrink-0">
                      {formatRelativeDate(c.created_at)}
                    </span>
                    {!open && (
                      <span className="text-xs text-ink-muted italic truncate flex-1">
                        {preview ? `“${preview}”` : ""}
                      </span>
                    )}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                      className={`text-ink-muted flex-shrink-0 ml-auto transition-transform ${
                        open ? "rotate-90" : ""
                      }`}
                    >
                      <path
                        d="M4 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 space-y-3 border-t border-surface-border pt-3">
                      {STANDARD_QUESTIONS.map((q) => {
                        const answer = c.answers[q.key];
                        if (!answer) return null;
                        return (
                          <div key={q.key}>
                            <div className="text-[11px] font-semibold text-ink-muted mb-0.5">
                              {q.emoji} {STANDARD_BY_KEY[q.key].short}
                            </div>
                            <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                              {answer}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
