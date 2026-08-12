"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  CODE_MIN,
  CODE_MAX,
  codeToResponse,
  CHARACTER_CODE_ACTIVITY_ID,
} from "@/lib/program";

const STARTERS = [
  "I keep my word, including the small promises.",
  "I leave rooms better than I found them.",
  "I say the true thing kindly, rather than the easy thing.",
  "I do the hard rep on the days I don't feel like it.",
  "I don't laugh at things that make someone smaller.",
];

/**
 * Week 10's capstone. Written as commitments in the present tense — things the
 * student does, not things they'd like to be — and stored as a milestone
 * journal entry so it surfaces in the journal and on their profile. Writing it
 * again supersedes the previous version rather than editing in place, which
 * means the earlier codes stay readable as history.
 */
export default function CharacterCodeBuilder({
  userId,
  saved,
  onSaved,
}: {
  userId: string;
  saved: string[];
  /** Writing the code is what completes week 10 — there's no separate reflection. */
  onSaved: (commitments: string[]) => Promise<void>;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [editing, setEditing] = useState(saved.length === 0);
  const [lines, setLines] = useState<string[]>(
    saved.length ? saved : ["", "", "", "", ""]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = lines.filter((l) => l.trim()).length;
  const canSave = filled >= CODE_MIN;

  function setLine(i: number, v: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? v : l)));
  }

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    const commitments = lines.map((l) => l.trim()).filter(Boolean);
    const { error: err } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: 1,
      activity_id: CHARACTER_CODE_ACTIVITY_ID,
      prompt: "My Character Code — the commitments guiding my next year",
      response: codeToResponse(commitments),
      is_milestone: true,
    });
    if (err) {
      setBusy(false);
      setError("Couldn't save — your writing is still here. Try again.");
      return;
    }
    await onSaved(commitments);
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div data-animate="4">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          My Character Code
        </h2>
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: "var(--navy)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-3">
            The next year
          </div>
          <ol className="space-y-2.5">
            {saved.map((c, i) => (
              <li key={i} className="text-sm leading-relaxed flex gap-2.5">
                <span className="opacity-60 flex-shrink-0 tabular-nums">
                  {i + 1}.
                </span>
                {c}
              </li>
            ))}
          </ol>
        </div>
        <button
          onClick={() => {
            setLines(saved);
            setEditing(true);
          }}
          className="text-xs text-teal hover:underline mt-3"
        >
          Write a new version
        </button>
      </div>
    );
  }

  return (
    <div data-animate="4">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        My Character Code
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        {CODE_MIN}–{CODE_MAX} commitments for the next year. Write them as things
        you <span className="font-semibold">do</span>, in the present tense — not
        things you hope to become.
      </p>
      <div className="card p-5">
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm text-ink-muted tabular-nums pt-3 flex-shrink-0 w-4">
                {i + 1}.
              </span>
              <textarea
                className="conv-textarea"
                rows={2}
                value={l}
                onChange={(e) => setLine(i, e.target.value)}
                placeholder={STARTERS[i] || "One more commitment…"}
              />
            </div>
          ))}
        </div>

        {lines.length < CODE_MAX && (
          <button
            onClick={() => setLines((p) => [...p, ""])}
            className="text-xs text-teal hover:underline mt-2"
          >
            + Add another ({lines.length} of {CODE_MAX})
          </button>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 mt-3">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={!canSave || busy}
          className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-4"
        >
          {busy ? "Saving…" : "This is my code"}
        </button>
        <p className="text-[11px] text-ink-muted text-center mt-2">
          {filled} written · {CODE_MIN} needed
        </p>
      </div>
    </div>
  );
}
