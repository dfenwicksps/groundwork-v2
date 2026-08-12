"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRelativeDate } from "@/lib/utils";
import { WEEKLY_FIVE, type Strand } from "@/lib/program";

export interface WeeklyCheckin {
  id: string;
  answers: Partial<Record<Strand, string>>;
  created_at: string;
}

/**
 * The weekly five — the program's heartbeat, and the thing a student keeps
 * doing long after the ten weeks are finished. Deliberately lighter than The
 * Standard: five short answers, no counterweight questions, no scoring. The
 * previous week's answer sits above each box so the student is always writing
 * against their own last line rather than into a blank.
 */
export default function WeeklyFiveSection({
  userId,
  checkins,
  ready,
}: {
  userId: string;
  checkins: WeeklyCheckin[]; // newest first
  ready: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const latest = checkins[0] ?? null;
  const [writing, setWriting] = useState(false);
  const [drafts, setDrafts] = useState<Partial<Record<Strand, string>>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = WEEKLY_FIVE.filter((q) => (drafts[q.key] || "").trim()).length;

  async function save() {
    const answers: Partial<Record<Strand, string>> = {};
    for (const q of WEEKLY_FIVE) {
      const v = (drafts[q.key] || "").trim();
      if (v) answers[q.key] = v;
    }
    if (Object.keys(answers).length === 0) return;
    setBusy(true);
    setError(null);

    const { error: err } = await db.from("standard_checkins").insert({
      user_id: userId,
      answers,
      set: "weekly",
    });
    if (err) {
      setBusy(false);
      setError(
        /find the table|does not exist|schema cache|column/i.test(err.message || "")
          ? "This isn't switched on yet — that's a fix on our side, not yours."
          : "Couldn't save — your writing is still here. Try again."
      );
      return;
    }

    // Journal copy — non-fatal
    await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: "weekly-five",
      prompt: "The weekly five",
      response: WEEKLY_FIVE.filter((q) => answers[q.key])
        .map((q) => `${q.question}\n${answers[q.key]}`)
        .join("\n\n"),
      is_milestone: false,
    });

    setBusy(false);
    setWriting(false);
    setDrafts({});
    router.refresh();
  }

  if (!ready) return null;

  if (writing) {
    return (
      <div id="weekly" data-animate="3">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          This week&apos;s five
        </h2>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-5 leading-relaxed">
            Five questions, five honest lines. This is the part you keep doing
            after the ten weeks are over.
          </p>
          <div className="space-y-5">
            {WEEKLY_FIVE.map((q) => {
              const last = latest?.answers[q.key];
              return (
                <div key={q.key}>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-base flex-shrink-0" aria-hidden>
                      {q.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink font-semibold leading-snug">
                        {q.question}
                      </p>
                      <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">
                        {q.meaning}
                      </p>
                    </div>
                  </div>
                  {last && (
                    <p className="text-[11px] text-ink-muted italic leading-relaxed mb-1.5 pl-6">
                      Last week: &ldquo;{last}&rdquo;
                    </p>
                  )}
                  <textarea
                    className="conv-textarea"
                    rows={2}
                    value={drafts[q.key] || ""}
                    onChange={(e) =>
                      setDrafts((p) => ({ ...p, [q.key]: e.target.value }))
                    }
                    placeholder={q.placeholder}
                  />
                </div>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600 mt-4">
              {error}
            </p>
          )}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => {
                setWriting(false);
                setDrafts({});
                setError(null);
              }}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={filled === 0 || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : "Save this week"}
            </button>
          </div>
          <p className="text-[11px] text-ink-muted text-center mt-2">
            {filled} of {WEEKLY_FIVE.length} answered — partial is fine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="weekly" data-animate="3">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        The weekly five
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        The whole program in five questions
        {checkins.length > 0 && ` · ${checkins.length} week${checkins.length === 1 ? "" : "s"} recorded`}
      </p>

      {latest ? (
        <div className="card p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold text-teal uppercase tracking-wider">
              Most recent
            </span>
            <span className="text-[11px] text-ink-muted">
              {formatRelativeDate(latest.created_at)}
            </span>
          </div>
          <div className="space-y-2.5">
            {WEEKLY_FIVE.map((q) => {
              const a = latest.answers[q.key];
              if (!a) return null;
              return (
                <div key={q.key} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0" aria-hidden>
                    {q.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                      {q.name}
                    </div>
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                      {a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setWriting(true)}
            className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-4"
          >
            Answer them for this week
          </button>
        </div>
      ) : (
        <div className="card p-5">
          <div className="space-y-2 mb-4">
            {WEEKLY_FIVE.map((q) => (
              <div key={q.key} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0" aria-hidden>
                  {q.emoji}
                </span>
                <p className="text-sm text-ink leading-snug">{q.question}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setWriting(true)}
            className="btn btn-primary w-full py-2.5 rounded-xl text-sm"
          >
            Answer them for the first time
          </button>
        </div>
      )}

      {/* History */}
      {checkins.length > 1 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Earlier weeks
          </div>
          {checkins.slice(1).map((c) => {
            const open = openId === c.id;
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
                  <span className="text-xs font-medium text-ink">
                    {formatRelativeDate(c.created_at)}
                  </span>
                  {!open && (
                    <span className="text-xs text-ink-muted italic truncate flex-1">
                      {WEEKLY_FIVE.map((q) => c.answers[q.key]).find(Boolean) || ""}
                    </span>
                  )}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                    className={`text-ink-muted flex-shrink-0 ml-auto transition-transform ${open ? "rotate-90" : ""}`}
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
                  <div className="px-3 pb-3 pt-3 space-y-2 border-t border-surface-border">
                    {WEEKLY_FIVE.map((q) => {
                      const a = c.answers[q.key];
                      if (!a) return null;
                      return (
                        <div key={q.key}>
                          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                            {q.emoji} {q.name}
                          </div>
                          <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                            {a}
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
      )}
    </div>
  );
}
