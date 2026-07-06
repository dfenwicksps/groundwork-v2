"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BOOSTS, BOOST_BY_KEY } from "@/lib/boosts";

/**
 * "Who I'm becoming" — the student chooses ONE or TWO character qualities to
 * focus on (never everything at once), and the section becomes their growth
 * plan: quality → what it means in practice → this week's practice action,
 * with a nudge to attach a goal. Stored as a journal entry (values-clarifier
 * pattern), so choosing again just replaces the focus.
 */
export default function FocusSection({
  userId,
  focusKeys,
  suggestedQualities,
  hasGoals,
}: {
  userId: string;
  focusKeys: string[];
  /** Qualities suggested by the habit check's "worth working on" patterns */
  suggestedQualities: string[];
  hasGoals: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [choosing, setChoosing] = useState(false);
  const [selected, setSelected] = useState<string[]>(focusKeys);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<string[]>(focusKeys);

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < 2
        ? [...prev, key]
        : prev
    );
  }

  async function save() {
    if (selected.length === 0) return;
    setBusy(true);
    setError(null);
    const names = selected.map((k) => BOOST_BY_KEY[k]?.name || k);
    const { error: err } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: "focus-qualities",
      prompt: "Who I'm becoming — my focus qualities this term",
      response: `This term I'm developing: ${names.join(" + ")}\nkeys:${selected.join(",")}`,
      is_milestone: false,
    });
    setBusy(false);
    if (err) {
      setError("Couldn't save — check your connection and try again.");
      return;
    }
    setLocal(selected);
    setChoosing(false);
    router.refresh();
  }

  // ── Choosing ──
  if (choosing || local.length === 0) {
    return (
      <div data-animate="4" id="focus">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
          Who I&apos;m becoming
        </h2>
        <p className="text-xs text-ink-muted mb-3 leading-relaxed">
          Don&apos;t try to improve everything at once. Pick{" "}
          <span className="font-semibold">one or two</span> qualities to focus on
          this term — your call.
        </p>
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {BOOSTS.map((b) => {
              const sel = selected.includes(b.key);
              const suggested = suggestedQualities.includes(b.key);
              const disabled = !sel && selected.length >= 2;
              return (
                <button
                  key={b.key}
                  onClick={() => toggle(b.key)}
                  disabled={disabled}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    sel
                      ? "bg-navy text-white border-navy"
                      : disabled
                      ? "bg-surface-muted text-ink-muted/60 border-surface-border cursor-not-allowed"
                      : "bg-white text-ink border-surface-border hover:border-navy/30"
                  }`}
                >
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <span aria-hidden>{b.emoji}</span> {b.name}
                    {suggested && !sel && (
                      <span className="text-[10px] text-sage font-bold ml-auto" title="Suggested by your habit check">🌱</span>
                    )}
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-snug ${sel ? "text-white/80" : "text-ink-muted"}`}>
                    {b.inPractice}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-muted mb-3">
            {selected.length} of 2 chosen
            {suggestedQualities.length > 0 && " · 🌱 = suggested by your habit check"}
          </p>
          {error && <p role="alert" className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2">
            {local.length > 0 && (
              <button
                onClick={() => {
                  setChoosing(false);
                  setSelected(local);
                }}
                className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
            )}
            <button
              onClick={save}
              disabled={selected.length === 0 || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : "This is my focus →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Growth plan ──
  return (
    <div data-animate="4" id="focus">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
        Who I&apos;m becoming
      </h2>
      <div
        className="rounded-2xl p-5 text-white mb-3"
        style={{ background: "var(--navy)" }}
      >
        <p className="text-sm leading-relaxed">
          This term, I&apos;m developing{" "}
          {local.map((k, i) => (
            <span key={k}>
              {i > 0 && " and "}
              <span className="font-semibold">
                {BOOST_BY_KEY[k]?.emoji} {BOOST_BY_KEY[k]?.name || k}
              </span>
            </span>
          ))}
          .
        </p>
      </div>

      {/* The growth plan: quality → meaning → practice action */}
      <div className="space-y-2">
        {local.map((k) => {
          const b = BOOST_BY_KEY[k];
          if (!b) return null;
          return (
            <div key={k} className="card p-4">
              <div className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <span aria-hidden>{b.emoji}</span> {b.name}
              </div>
              <p className="text-xs text-ink-muted mb-2 leading-relaxed">{b.inPractice}</p>
              <div className="rounded-xl px-3.5 py-2.5 bg-teal/5 border border-teal/20">
                <div className="text-[10px] font-bold text-teal uppercase tracking-widest mb-0.5">
                  My practice action
                </div>
                <p className="text-xs text-ink leading-relaxed">{b.exercise}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3">
        {!hasGoals && (
          <a href="#goals" className="text-xs text-teal hover:underline">
            Attach a goal to this ↓
          </a>
        )}
        <button onClick={() => setChoosing(true)} className="text-xs text-ink-muted hover:text-ink transition-colors">
          Change my focus
        </button>
      </div>
    </div>
  );
}
