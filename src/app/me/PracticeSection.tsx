"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { STRENGTH_BY_KEY } from "@/lib/strengths";
import { STRENGTH_ACTIONS } from "@/lib/boosts";

interface PracticeEntry {
  id: string;
  strength_key: string;
  action: string;
  started_at: string;
  completed_at: string | null;
  reflection: string | null;
}

/**
 * Strength in action — the weekly practice loop. The user CHOOSES a quality to
 * work on (their call, with growth edges suggested first), gets one concrete
 * exercise, and checks in later. A log, never a streak.
 */
export default function PracticeSection({
  userId,
  growthEdges,
  top5,
  active,
  recent,
}: {
  userId: string;
  growthEdges: string[]; // keys, lowest first
  top5: string[]; // keys
  active: PracticeEntry | null;
  recent: PracticeEntry[];
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [choosing, setChoosing] = useState(false);
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const suggested = [...growthEdges.slice(0, 3), ...top5.slice(0, 2)];
  const allKeys = Object.keys(STRENGTH_BY_KEY);

  async function start() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const { error: err } = await db.from("practice_log").insert({
      user_id: userId,
      strength_key: selected,
      action: STRENGTH_ACTIONS[selected] || "Use this strength in a new way this week.",
    });
    setBusy(false);
    if (err) {
      setError(
        /find the table|does not exist|schema cache/i.test(err.message || "")
          ? "The practice database isn't set up yet — a quick fix is needed on our side, not yours."
          : "Couldn't start — check your connection and try again."
      );
      return;
    }
    setChoosing(false);
    setSelected(null);
    router.refresh();
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    const { error: err } = await db
      .from("practice_log")
      .update({ reflection: editText.trim() })
      .eq("id", id);
    setBusy(false);
    if (err) {
      setError("Couldn't save your edit — your writing is still here. Try again.");
      return;
    }
    setEditId(null);
    setEditText("");
    router.refresh();
  }

  async function checkIn() {
    if (!active || !reflection.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await db
      .from("practice_log")
      .update({ completed_at: new Date().toISOString(), reflection: reflection.trim() })
      .eq("id", active.id);
    if (err) {
      setBusy(false);
      setError("Couldn't save your check-in — your writing is still here. Try again.");
      return;
    }
    // Journal copy — non-fatal if it fails
    await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: "strength-practice",
      prompt: `Strength in action: ${STRENGTH_BY_KEY[active.strength_key]?.name || active.strength_key} — ${active.action}`,
      response: reflection.trim(),
      is_milestone: false,
    });
    setBusy(false);
    setReflection("");
    router.refresh();
  }

  return (
    <div data-animate="4" id="practice">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Strength in action
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        Knowing your strengths is step one. Using one on purpose each week is how
        character becomes habit. No streaks — just practice.
      </p>

      {/* Active practice — check-in */}
      {active ? (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden>
              {STRENGTH_BY_KEY[active.strength_key]?.emoji}
            </span>
            <span className="text-sm font-semibold text-ink">
              {STRENGTH_BY_KEY[active.strength_key]?.name || active.strength_key}
            </span>
            <span className="text-[11px] font-bold text-teal uppercase tracking-wider ml-auto">
              In progress
            </span>
          </div>
          <p className="text-sm text-ink leading-relaxed mb-4">{active.action}</p>
          <p className="text-xs font-medium text-ink mb-2">How&apos;s it going? Check in:</p>
          <textarea
            className="conv-textarea mb-3"
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What did you try? What happened? Honest counts more than impressive."
          />
          {error && <p role="alert" className="text-sm text-red-600 mb-2">{error}</p>}
          <button
            onClick={checkIn}
            disabled={!reflection.trim() || busy}
            className="btn btn-primary w-full py-2.5 rounded-xl text-sm"
          >
            {busy ? "Saving…" : "Finish this practice ✓"}
          </button>
        </div>
      ) : choosing ? (
        <div className="card p-5">
          <p className="text-sm font-medium text-ink mb-3">
            Pick the strength you want to practise this week — your call:
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(showAllStrengths ? allKeys : suggested).map((k) => {
              const s = STRENGTH_BY_KEY[k];
              if (!s) return null;
              const isGrowth = growthEdges.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(selected === k ? null : k)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all flex items-center gap-1.5 ${
                    selected === k
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-ink border-surface-border hover:border-navy/30"
                  }`}
                >
                  <span aria-hidden>{s.emoji}</span>
                  {s.name}
                  <span className={selected === k ? "text-white/70 font-normal" : "text-ink-muted font-normal"}>
                    · {s.plain}
                  </span>
                  {isGrowth && selected !== k && (
                    <span className="text-[10px] text-sage font-semibold">🌱</span>
                  )}
                </button>
              );
            })}
          </div>
          {!showAllStrengths && (
            <button
              onClick={() => setShowAllStrengths(true)}
              className="text-xs text-teal hover:underline mb-2"
            >
              Show all 24
            </button>
          )}
          {selected && (
            <div className="rounded-xl px-4 py-3 bg-teal/5 border border-teal/20 my-3">
              <div className="text-[11px] font-bold text-teal uppercase tracking-widest mb-1">
                This week&apos;s practice
              </div>
              <p className="text-sm text-ink leading-relaxed">
                {STRENGTH_ACTIONS[selected]}
              </p>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setChoosing(false); setSelected(null); }} className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button
              onClick={start}
              disabled={!selected || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Starting…" : "I'll try this →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-5 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0" aria-hidden>🌱</span>
          <div className="flex-1">
            <p className="text-sm text-ink font-medium mb-0.5">
              Choose a strength to practise this week
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Growth edges 🌱 are great picks — but it&apos;s your choice.
            </p>
          </div>
          <button onClick={() => setChoosing(true)} className="btn btn-primary text-sm py-2 px-4 flex-shrink-0">
            Pick one
          </button>
        </div>
      )}

      {/* Practice log */}
      {recent.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Practice log
          </div>
          <div className="space-y-1.5">
            {recent.map((p) =>
              editId === p.id ? (
                <div key={p.id} className="bg-white border border-surface-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-ink mb-2">
                    <span aria-hidden>{STRENGTH_BY_KEY[p.strength_key]?.emoji}</span>
                    {STRENGTH_BY_KEY[p.strength_key]?.name || p.strength_key}
                  </div>
                  <textarea
                    className="conv-textarea mb-2"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  {error && <p role="alert" className="text-xs text-red-600 mb-2">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditId(null); setEditText(""); setError(null); }}
                      className="btn btn-secondary flex-1 py-2 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(p.id)}
                      disabled={busy}
                      className="btn btn-primary flex-1 py-2 rounded-xl text-xs"
                    >
                      {busy ? "Savingâ¦" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span aria-hidden>{STRENGTH_BY_KEY[p.strength_key]?.emoji}</span>
                  <span className="font-medium text-ink">
                    {STRENGTH_BY_KEY[p.strength_key]?.name || p.strength_key}
                  </span>
                  <span className="truncate flex-1 italic">
                    {p.reflection ? `“${p.reflection}”` : ""}
                  </span>
                  <button
                    onClick={() => { setEditId(p.id); setEditText(p.reflection || ""); }}
                    className="text-teal hover:underline flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
