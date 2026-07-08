"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { strengthName } from "@/lib/strengths";
import type { YearLevel } from "@/lib/yearLevel";

interface Goal {
  id: string;
  domain: "school" | "life" | "future";
  wish: string;
  outcome: string | null;
  obstacle: string | null;
  plan: string | null;
  linked_value: string | null;
  status: string;
  reflection: string | null;
}

const DOMAIN_LABEL: Record<Goal["domain"], { label: string; emoji: string }> = {
  school: { label: "School", emoji: "🏫" },
  life: { label: "Life right now", emoji: "🌱" },
  future: { label: "Beyond graduation", emoji: "🚀" },
};

/**
 * Practical goals — WOOP-lite (wish → outcome → obstacle → plan), linked to
 * the user's own values, for school / life / beyond graduation.
 */
export default function GoalsSection({
  userId,
  goals,
  values,
  topStrengthKeys,
  yearLevel,
}: {
  userId: string;
  goals: Goal[];
  values: string[];
  topStrengthKeys: string[];
  yearLevel: YearLevel;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [domain, setDomain] = useState<Goal["domain"]>(
    yearLevel === "senior" ? "future" : "school"
  );
  const [wish, setWish] = useState("");
  const [outcome, setOutcome] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [plan, setPlan] = useState("");
  const [linkedValue, setLinkedValue] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<string | null>(null);
  const [finishNote, setFinishNote] = useState("");

  const active = goals.filter((g) => g.status === "active");
  const done = goals.filter((g) => g.status === "done");
  const doneCount = goals.filter((g) => g.status === "done").length;

  function resetForm() {
    setWish(""); setOutcome(""); setObstacle(""); setPlan("");
    setLinkedValue(null); setDomain("school"); setError(null); setEditingId(null);
  }

  function startEdit(g: Goal) {
    setEditingId(g.id);
    setDomain(g.domain);
    setWish(g.wish);
    setOutcome(g.outcome || "");
    setObstacle(g.obstacle || "");
    setPlan(g.plan || "");
    setLinkedValue(g.linked_value);
    setError(null);
    setCreating(true);
  }

  async function save() {
    if (!wish.trim() || !plan.trim()) return;
    setBusy(true);
    setError(null);
    const payload = {
      domain,
      wish: wish.trim(),
      outcome: outcome.trim() || null,
      obstacle: obstacle.trim() || null,
      plan: plan.trim(),
      linked_value: linkedValue,
    };
    const { error: err } = editingId
      ? await db.from("goals").update(payload).eq("id", editingId)
      : await db.from("goals").insert({
          user_id: userId,
          ...payload,
          linked_strength: topStrengthKeys[0] || null,
        });
    setBusy(false);
    if (err) {
      setError(
        /find the table|does not exist|schema cache/i.test(err.message || "")
          ? "The goals database isn't set up yet — a quick fix is needed on our side, not yours."
          : "Couldn't save your goal — check your connection and try again."
      );
      return;
    }
    setCreating(false);
    resetForm();
    router.refresh();
  }

  async function reopen(g: Goal) {
    setBusy(true);
    await db
      .from("goals")
      .update({ status: "active", completed_at: null })
      .eq("id", g.id);
    setBusy(false);
    router.refresh();
  }

  async function finishGoal(goal: Goal) {
    setBusy(true);
    const { error: err } = await db
      .from("goals")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
        reflection: finishNote.trim() || null,
      })
      .eq("id", goal.id);
    if (!err && finishNote.trim()) {
      await db.from("journal_entries").insert({
        user_id: userId,
        mission_id: 4,
        activity_id: "goal-checkin",
        prompt: `Goal finished: ${goal.wish}`,
        response: finishNote.trim(),
        is_milestone: false,
      });
    }
    setBusy(false);
    setFinishing(null);
    setFinishNote("");
    router.refresh();
  }

  return (
    <div data-animate="5">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Your goals
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        Self-knowledge becomes real when it has a target. Small and specific beats
        big and vague.{doneCount > 0 ? ` ${doneCount} finished so far ✓` : ""}
      </p>

      {/* Active goals */}
      {active.length > 0 && (
        <div className="space-y-2 mb-3">
          {active.map((g) => (
            <div key={g.id} className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-teal uppercase tracking-wider">
                  {DOMAIN_LABEL[g.domain].emoji} {DOMAIN_LABEL[g.domain].label}
                </span>
                {g.linked_value && (
                  <span className="text-[11px] text-ink-muted ml-auto">
                    for <span className="font-semibold">{g.linked_value}</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-ink mb-1">{g.wish}</p>
              {g.plan && (
                <p className="text-xs text-ink-muted leading-relaxed mb-2">
                  <span className="font-semibold">Plan:</span> {g.plan}
                </p>
              )}
              {finishing === g.id ? (
                <div className="pt-2 border-t border-surface-border mt-1">
                  <textarea
                    className="conv-textarea mb-2"
                    rows={2}
                    value={finishNote}
                    onChange={(e) => setFinishNote(e.target.value)}
                    placeholder="How did it go? (optional — saved to your journal)"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setFinishing(null)} className="btn btn-secondary flex-1 py-2 rounded-xl text-xs">
                      Not yet
                    </button>
                    <button onClick={() => finishGoal(g)} disabled={busy} className="btn btn-primary flex-1 py-2 rounded-xl text-xs">
                      {busy ? "Saving…" : "Mark done ✓"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFinishing(g.id)}
                    className="text-xs text-teal hover:underline"
                  >
                    Check in on this goal
                  </button>
                  <button
                    onClick={() => startEdit(g)}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Done goals */}
      {done.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {done.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-2 text-xs text-ink-muted bg-white border border-surface-border rounded-xl px-3 py-2"
            >
              <span aria-hidden className="text-sage">✓</span>
              <span className="flex-1 line-through truncate">{g.wish}</span>
              <button
                onClick={() => reopen(g)}
                disabled={busy}
                className="text-teal hover:underline flex-shrink-0"
              >
                Reopen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      {creating ? (
        <div className="card p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold text-ink mb-2">Where does this goal live?</p>
            <div className="flex gap-2">
              {(Object.keys(DOMAIN_LABEL) as Goal["domain"][]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`flex-1 px-2 py-2 rounded-xl text-xs font-medium border transition-all ${
                    domain === d
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-ink border-surface-border"
                  }`}
                >
                  {DOMAIN_LABEL[d].emoji} {DOMAIN_LABEL[d].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              What do you want? <span className="font-normal text-ink-muted">(one specific thing)</span>
            </label>
            <input type="text" className="input text-sm" value={wish} onChange={(e) => setWish(e.target.value)}
              placeholder="e.g. Speak up at least once per class" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Why does it matter? <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input type="text" className="input text-sm" value={outcome} onChange={(e) => setOutcome(e.target.value)}
              placeholder="What's different if you pull it off?" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              What will get in the way? <span className="font-normal text-ink-muted">(optional, be honest)</span>
            </label>
            <input type="text" className="input text-sm" value={obstacle} onChange={(e) => setObstacle(e.target.value)}
              placeholder="e.g. I talk myself out of it in the moment" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Your if-then plan
            </label>
            <input type="text" className="input text-sm" value={plan} onChange={(e) => setPlan(e.target.value)}
              placeholder="If [the obstacle shows up], then I will [specific move]" />
          </div>
          {values.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink mb-2">
                Link it to one of your values <span className="font-normal text-ink-muted">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {values.map((v) => (
                  <button
                    key={v}
                    onClick={() => setLinkedValue(linkedValue === v ? null : v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      linkedValue === v
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-ink border-surface-border"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setCreating(false); resetForm(); }} className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!wish.trim() || !plan.trim() || busy}
              className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
            >
              {busy ? "Saving…" : editingId ? "Save changes" : "Set this goal"}
            </button>
          </div>
          {(!wish.trim() || !plan.trim()) && (
            <p className="text-[11px] text-ink-muted text-center">
              The what and the if-then plan are the two that matter — fill those to save.
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="btn btn-secondary w-full py-3 rounded-xl text-sm"
        >
          + Set a goal
        </button>
      )}
    </div>
  );
}
