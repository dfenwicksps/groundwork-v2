"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  CODE_MIN,
  CODE_MAX,
  codeToResponse,
  CHARACTER_CODE_ACTIVITY_ID,
  CHARACTER_CODE_SCAFFOLD,
  EMPTY_STORY,
  STORY_PARTS,
  storyComplete,
  storySentence,
  type LifeStory,
  type StoryPart,
} from "@/lib/program";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";

const STARTERS = [
  "I keep my word, including the small promises.",
  "I leave rooms better than I found them.",
  "I say the true thing kindly, rather than the easy thing.",
  "I do the hard rep on the days I don't feel like it.",
  "I don't laugh at things that make someone smaller.",
];

/**
 * Week 10's capstone, in two parts. First the story it stands on: one sentence
 * joining where the student has come from, who they are and where they're
 * heading (see STORY_PARTS). Then the commitments, in the present tense —
 * things the student does, not things they'd like to be.
 *
 * Stored as a milestone journal entry so it surfaces in the journal and on
 * their profile. Writing it again supersedes the previous version rather than
 * editing in place, which means the earlier codes stay readable as history.
 */
export default function CharacterCodeBuilder({
  userId,
  saved,
  savedStory,
  earlier = {},
  onSaved,
}: {
  userId: string;
  saved: string[];
  /** What the student already wrote that each part of the sentence repeats */
  earlier?: Partial<Record<StoryPart, { label: string; text: string }>>;
  /** Null for a code written before the story was part of it */
  savedStory: LifeStory | null;
  /** Writing the code is what completes week 10 — there's no separate reflection. */
  onSaved: (commitments: string[]) => Promise<void>;
}) {
  const router = useRouter();
  const db = createClient() as any;
  const fieldId = useId();

  const [editing, setEditing] = useState(saved.length === 0);
  const [lines, setLines] = useState<string[]>(
    saved.length ? saved : ["", "", "", "", ""]
  );
  const [story, setStory] = useState<LifeStory>(savedStory ?? EMPTY_STORY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = lines.filter((l) => l.trim()).length;
  const storyDone = storyComplete(story);
  const canSave = filled >= CODE_MIN && storyDone;

  function setPart(key: StoryPart, v: string) {
    setStory((prev) => ({ ...prev, [key]: v }));
  }

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
      response: codeToResponse(commitments, story),
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
          {savedStory && (
            <div className="mb-5 pb-5 border-b border-white/20">
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
                My story
              </div>
              <p className="leading-relaxed" style={{ fontFamily: "var(--font-story)" }}>
                {storySentence(savedStory)}
              </p>
            </div>
          )}
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
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
        <p className="text-xs text-ink-muted leading-relaxed mt-3">
          A code is for a year. When it&apos;s been one, write a new version.
          This one stays in your journal, so you can see how the story changed.
        </p>
        {!savedStory && (
          <p className="text-xs text-ink-muted leading-relaxed mt-2">
            New: the code now opens with your story in one sentence (where
            you&apos;ve come from, who you are, where you&apos;re heading). Write a
            new version to add yours.
          </p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => {
              setLines(saved);
              setStory(savedStory ?? EMPTY_STORY);
              setEditing(true);
            }}
            className="text-xs text-teal hover:underline"
          >
            Write a new version
          </button>
          <Link href="/story" className="text-xs text-teal hover:underline">
            See your whole story →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-animate="4">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        My Character Code
      </h2>
      <p className="text-xs text-ink-muted mb-3 leading-relaxed">
        Two parts: the story it stands on, then what you&apos;ll do about it.
      </p>
      <div className="card p-5 mb-3">
        <TierSwitcher className="mb-4" />
        <div className="text-sm font-semibold text-ink mb-1">1 · My story, in one sentence</div>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          Where you&apos;ve come from, who that made you, and where it&apos;s taking
          you. Finish each part. A few words is enough; the joins do the work.
        </p>
        <div className="space-y-3">
          {STORY_PARTS.map((p) => (
            <div key={p.key}>
              <label
                htmlFor={`${fieldId}-${p.key}`}
                className="block text-sm font-semibold text-navy mb-1"
              >
                {p.lead}…
                <span className="ml-1.5 text-xs font-normal text-ink-muted">{p.label}</span>
              </label>
              {earlier[p.key] && (
                <div className="rounded-xl bg-surface-muted px-3 py-2 mb-2">
                  <div className="text-xs font-semibold text-ink-muted mb-0.5">{earlier[p.key]!.label}</div>
                  <p className="text-xs text-ink leading-relaxed whitespace-pre-line line-clamp-4">
                    {earlier[p.key]!.text}
                  </p>
                </div>
              )}
              <ScaffoldedInput
                id={`${fieldId}-${p.key}`}
                value={story[p.key]}
                onChange={(v) => setPart(p.key, v)}
                scaffold={p.scaffold}
                placeholder={p.placeholder}
                rows={2}
              />
            </div>
          ))}
        </div>
        {(story.from || story.am || story.heading) && (
          <div className="mt-4 rounded-xl px-4 py-3 bg-surface-muted">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">
              Read together
            </div>
            <p className="text-sm text-ink leading-relaxed" style={{ fontFamily: "var(--font-story)" }}>
              {storySentence(story)}
            </p>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold text-ink mb-1">2 · What I&apos;ll do about it</div>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          {CODE_MIN}–{CODE_MAX} commitments for the next year. Write them as things
          you <span className="font-semibold">do</span>, in the present tense — not
          things you hope to become.
        </p>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm text-ink-muted tabular-nums pt-3 flex-shrink-0 w-4">
                {i + 1}.
              </span>
              <div className="flex-1">
                <ScaffoldedInput
                  value={l}
                  onChange={(v) => setLine(i, v)}
                  scaffold={CHARACTER_CODE_SCAFFOLD}
                  placeholder={STARTERS[i] || "One more commitment…"}
                  rows={2}
                />
              </div>
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
        <p className="text-xs text-ink-muted text-center mt-2">
          {storyDone ? "Story done" : "Story to finish"} · {filled} of {CODE_MIN} commitments
        </p>
      </div>
    </div>
  );
}
