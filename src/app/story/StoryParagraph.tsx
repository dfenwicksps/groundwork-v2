"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";
import SupportCard from "@/components/help/SupportCard";
import GentleCheck from "@/components/help/GentleCheck";
import { mentionsCrisis } from "@/lib/help";
import { hardOnSelfRecently } from "@/lib/hardOnSelf";
import {
  PARAGRAPH_MIN_WORDS,
  STORY_PARAGRAPH_ACTIVITY_ID,
  STORY_PARAGRAPH_PROMPT,
  STORY_PARAGRAPH_SCAFFOLD,
  paragraphDue,
  wordCount,
  type StoryParagraph,
} from "@/lib/myStory";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function monthYear(iso: string, addDays = 0): string {
  const d = new Date(new Date(iso).getTime() + addDays * 86_400_000);
  return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

/**
 * The paragraph at the top of My story: the latest version, in the student's
 * own words, with the earlier ones a tap away so the years read as one story.
 */
export function ParagraphCard({ paragraphs }: { paragraphs: StoryParagraph[] }) {
  const [latest, ...earlier] = paragraphs;
  if (!latest) return null;
  return (
    <div className="card p-5" data-animate="2">
      <div className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">In my own words</div>
      <p className="text-base text-ink leading-relaxed whitespace-pre-line" style={{ fontFamily: "var(--font-story)" }}>
        {latest.response}
      </p>
      <p className="text-xs text-ink-muted mt-3">Written {formatDate(latest.created_at)}</p>
      {earlier.length > 0 && (
        <details className="mt-3 no-print">
          <summary className="text-xs text-teal cursor-pointer">
            {earlier.length === 1 ? "The version before" : `Earlier versions (${earlier.length})`}
          </summary>
          <div className="mt-3 space-y-3">
            {earlier.map((p) => (
              <div key={p.id} className="border-l-2 border-navy/20 pl-3">
                <div className="text-xs text-ink-muted mb-1">{formatDate(p.created_at)}</div>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{p.response}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Below the three parts, with them in view: tell it in one paragraph. The first
 * time, and once a year after that, it's a new version written with last year's
 * on screen. In between, the current one can be changed in place.
 */
export function ParagraphWriter({
  userId,
  paragraphs,
  ready,
  onSaved,
}: {
  userId: string;
  paragraphs: StoryParagraph[];
  /** Enough pieces above to join up (readyForParagraph) */
  ready: boolean;
  onSaved: (paragraphs: StoryParagraph[]) => void;
}) {
  const db = createClient() as any;
  const latest = paragraphs[0] ?? null;
  const due = paragraphDue(latest);
  const [writing, setWriting] = useState<"new" | "edit" | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportNeeded, setSupportNeeded] = useState(false);
  const [hardOnSelf, setHardOnSelf] = useState(false);

  const words = wordCount(draft);
  const enough = words >= PARAGRAPH_MIN_WORDS;

  async function save() {
    if (!enough || !writing) return;
    setBusy(true);
    setError(null);
    const response = draft.trim();
    const { data, error: err } =
      writing === "edit" && latest
        ? await db
            .from("journal_entries")
            .update({ response, updated_at: new Date().toISOString() })
            .eq("id", latest.id)
            .select("id, response, created_at")
            .single()
        : await db
            .from("journal_entries")
            .insert({
              user_id: userId,
              mission_id: 4,
              activity_id: STORY_PARAGRAPH_ACTIVITY_ID,
              prompt: STORY_PARAGRAPH_PROMPT,
              response,
              is_milestone: true,
            })
            .select("id, response, created_at")
            .single();
    setBusy(false);
    if (err || !data) {
      setError("Couldn't save — your writing is still here. Check your connection and try again.");
      return;
    }
    onSaved(writing === "edit" ? [data as StoryParagraph, ...paragraphs.slice(1)] : [data as StoryParagraph, ...paragraphs]);
    setWriting(null);
    setDraft("");
    const crisis = mentionsCrisis(response);
    setSupportNeeded(crisis);
    setHardOnSelf(!crisis && (await hardOnSelfRecently(db, userId, response)));
  }

  const afterSave = (
    <>
      {supportNeeded && <SupportCard />}
      {!supportNeeded && hardOnSelf && <GentleCheck />}
    </>
  );

  if (!ready && !latest) {
    return (
      <section className="no-print" aria-labelledby="paragraph-heading">
        <h2 id="paragraph-heading" className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
          Tell it in a paragraph
        </h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          Once there&apos;s something in Part 1 and something in Part 2 or 3, you can join it
          all up here, in your own words.
        </p>
      </section>
    );
  }

  if (!writing) {
    return (
      <section className="no-print" aria-labelledby="paragraph-heading">
        {afterSave}
        <h2 id="paragraph-heading" className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
          Tell it in a paragraph
        </h2>
        <div className="card p-5">
          {!latest ? (
            <>
              <p className="text-sm text-ink leading-relaxed mb-1">
                Everything above is in pieces. Now join it up: where you&apos;ve come from,
                what changed you, who that&apos;s made you, and where it&apos;s heading, in one
                paragraph and your own words.
              </p>
              <p className="text-xs text-ink-muted leading-relaxed mb-4">
                Linking what happened to who you are is how a life starts to read as one
                story. You&apos;ll be asked for a new version each year, with this one in view.
              </p>
            </>
          ) : due ? (
            <p className="text-sm text-ink leading-relaxed mb-4">
              It&apos;s been a year since you told it in a paragraph. Write this year&apos;s
              version with last year&apos;s in view: what&apos;s the same, and what&apos;s a new
              chapter?
            </p>
          ) : (
            <p className="text-sm text-ink-muted leading-relaxed mb-4">
              This year&apos;s version is at the top of the page. You can change it any time;
              around {monthYear(latest.created_at, 365)} you&apos;ll be asked for a new one.
            </p>
          )}
          <button
            onClick={() => {
              const edit = !!latest && !due;
              setWriting(edit ? "edit" : "new");
              setDraft(edit ? latest!.response : "");
              setSupportNeeded(false);
              setHardOnSelf(false);
            }}
            className={latest && !due ? "btn btn-secondary w-full py-2.5 rounded-xl text-sm" : "btn btn-primary w-full py-3 rounded-xl text-sm"}
          >
            {!latest ? "Write it" : due ? "Write this year's version" : "Change it"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="no-print" aria-labelledby="paragraph-heading">
      <h2 id="paragraph-heading" className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
        Tell it in a paragraph
      </h2>
      <div className="card p-5">
        {writing === "new" && latest && (
          <div className="rounded-xl bg-surface-muted px-4 py-3 mb-4">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">
              Last time, {formatDate(latest.created_at)}
            </div>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{latest.response}</p>
          </div>
        )}
        <TierSwitcher className="mb-4" />
        <ScaffoldedInput
          id="story-paragraph"
          label="Where you've come from, what changed you, who you are now, and where you're heading"
          value={draft}
          onChange={setDraft}
          scaffold={STORY_PARAGRAPH_SCAFFOLD}
          placeholder="I grew up…"
          rows={8}
        />
        <p className="text-xs text-ink-muted mt-2" aria-live="polite">
          {enough
            ? `${words} words`
            : `${words} of about ${PARAGRAPH_MIN_WORDS} words. A paragraph, not a sentence.`}
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-600 mt-2">
            {error}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setWriting(null);
              setDraft("");
              setError(null);
            }}
            className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!enough || busy}
            className="btn btn-primary flex-[2] py-2.5 rounded-xl text-sm"
          >
            {busy ? "Saving…" : "Save my story"}
          </button>
        </div>
        <p className="text-xs text-ink-muted mt-3 leading-relaxed">
          Private, like everything here. It&apos;s never sent to the AI.
        </p>
      </div>
    </section>
  );
}
