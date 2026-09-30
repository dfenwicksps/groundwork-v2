"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { markStoryRead, markStoryActioned } from "@/lib/storyEngagement";
import { mentionsCrisis } from "@/lib/help";
import SupportCard from "@/components/help/SupportCard";

/**
 * The "Reflect on this" section of a story page. Also earns the story its
 * green tick on /stories, which needs both:
 *
 *  - read_at: set when this section scrolls into view (the prompts sit below
 *    the story, so seeing them means the student got to the end). Film stories
 *    pass markReadOnView={false} and mark themselves read when the film ends.
 *  - actioned_at: set when the student saves a written reflection. Answers go
 *    to the journal as "story-reflection" entries.
 */
export default function StoryReflections({
  storyId,
  missionId,
  prompts,
  writtenPrompts,
  markReadOnView = true,
}: {
  storyId: string;
  missionId: number;
  prompts: string[];
  writtenPrompts: string[];
  markReadOnView?: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [written, setWritten] = useState<Set<string>>(() => new Set(writtenPrompts));

  useEffect(() => {
    if (!markReadOnView) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          markStoryRead(storyId);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [storyId, markReadOnView]);

  return (
    <div data-animate="4" ref={sectionRef}>
      <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
        Reflect on this
      </div>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt}
            prompt={prompt}
            missionId={missionId}
            done={written.has(prompt)}
            onSaved={() => {
              setWritten((prev) => new Set(prev).add(prompt));
              markStoryActioned(storyId);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PromptCard({
  prompt,
  missionId,
  done,
  onSaved,
}: {
  prompt: string;
  missionId: number;
  done: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportNeeded, setSupportNeeded] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const db = createClient() as any;
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("You've been signed out — sign back in and try again.");
      return;
    }
    const { error: insertError } = await db.from("journal_entries").insert({
      user_id: user.id,
      mission_id: missionId,
      activity_id: "story-reflection",
      prompt,
      response: text.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError("That didn't save. Your words are still here — try again in a moment.");
      return;
    }
    setSupportNeeded(mentionsCrisis(text));
    setOpen(false);
    setText("");
    onSaved();
  };

  return (
    <>
      <div className={`card p-5 ${done ? "bg-sage/5 border-sage/30" : ""}`}>
        <div className="flex items-start gap-3">
          {done && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5"
              style={{ background: "var(--sage)" }}
              aria-label="Written"
            >
              ✓
            </div>
          )}
          <p className="text-sm text-ink leading-relaxed mb-3 flex-1">{prompt}</p>
        </div>

        {open ? (
          <div>
            <label className="sr-only" htmlFor={`reflect-${prompt}`}>
              Your reflection
            </label>
            <textarea
              id={`reflect-${prompt}`}
              className="input min-h-[120px] mb-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="No right answer. Write what's actually true for you."
              autoFocus
            />
            {error && <p className="text-xs text-red-700 mb-2">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving || !text.trim()}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save to journal"}
              </button>
              <button onClick={() => setOpen(false)} className="text-xs text-ink-muted hover:text-ink px-2">
                Cancel
              </button>
            </div>
          </div>
        ) : done ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-sage font-medium">Saved to your journal</span>
            <Link href="/journal" className="text-teal hover:underline">
              Read it
            </Link>
            <button onClick={() => setOpen(true)} className="text-ink-muted hover:text-ink">
              Write more
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
          >
            Write about this
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      {supportNeeded && (
        <div className="mt-3">
          <SupportCard />
        </div>
      )}
    </>
  );
}
