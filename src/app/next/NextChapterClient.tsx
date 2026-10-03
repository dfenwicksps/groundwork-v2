"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { hasLeftSchool, type LifeStage } from "@/lib/lifeStage";
import { mentionsCrisis } from "@/lib/help";
import AppShell from "@/components/layout/AppShell";
import SupportCard from "@/components/help/SupportCard";
import {
  NEXT_CHAPTER_ACTIVITY_ID,
  EMPTY_NEXT_CHAPTER,
  OPTIONS_MAX,
  QUESTIONS_MAX,
  TALK_QUESTIONS,
  WHO_SUGGESTIONS,
  TALK_BY,
  OUTCOMES,
  optionsFor,
  nextChapterToText,
  parseNextChapter,
  planComplete,
  dateIn,
  talkDue,
  shortDate,
  whoToYou,
  type NextChapter,
} from "@/lib/nextChapter";

/**
 * The guided flow for the next stage of life: what's on the table, the
 * version of next year you're hoping for and the one you'd rather avoid (each
 * with a step attached), and a conversation with someone already doing it.
 * See lib/nextChapter.ts for why it's built this way.
 *
 * One journal entry holds the whole thing. Saving the plan writes it; the
 * debrief, written after the conversation, updates the same entry.
 */
export default function NextChapterClient({
  userId,
  lifeStage,
  saved,
  futureSelf,
}: {
  userId: string;
  lifeStage: LifeStage;
  saved: { id: string; response: string } | null;
  futureSelf: string | null;
}) {
  const router = useRouter();
  const db = createClient() as any;
  const ids = useId();

  const initial = parseNextChapter(saved?.response);
  const [n, setN] = useState<NextChapter>(saved ? initial : EMPTY_NEXT_CHAPTER);
  const [entryId, setEntryId] = useState<string | null>(saved?.id ?? null);
  const [editing, setEditing] = useState(!saved);
  const [customQuestion, setCustomQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportNeeded, setSupportNeeded] = useState(false);
  const [foundOut, setFoundOut] = useState(initial.foundOut);
  const [leftMe, setLeftMe] = useState(initial.leftMe);

  const options = optionsFor(lifeStage);
  const leftSchool = hasLeftSchool(lifeStage);
  // Questions offered: the standard ones plus any the student wrote themselves.
  const questionList = [...TALK_QUESTIONS, ...n.questions.filter((q) => !TALK_QUESTIONS.includes(q))];

  function set<K extends keyof NextChapter>(key: K, value: NextChapter[K]) {
    setN((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(key: "options" | "questions", item: string, max: number) {
    setN((prev) => {
      const list = prev[key];
      if (list.includes(item)) return { ...prev, [key]: list.filter((x) => x !== item) };
      if (list.length >= max) return prev;
      return { ...prev, [key]: [...list, item] };
    });
  }

  function addQuestion() {
    const q = customQuestion.replace(/[;\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    if (q.length < 4) return;
    setN((prev) =>
      prev.questions.includes(q) || prev.questions.length >= QUESTIONS_MAX
        ? prev
        : { ...prev, questions: [...prev.questions, q] }
    );
    setCustomQuestion("");
  }

  async function write(next: NextChapter): Promise<boolean> {
    setBusy(true);
    setError(null);
    const response = nextChapterToText(next);
    const { data, error: err } = entryId
      ? await db
          .from("journal_entries")
          .update({ response, updated_at: new Date().toISOString() })
          .eq("id", entryId)
          .select("id")
          .single()
      : await db
          .from("journal_entries")
          .insert({
            user_id: userId,
            mission_id: 4,
            activity_id: NEXT_CHAPTER_ACTIVITY_ID,
            prompt: "My next chapter: what's on the table, the version of next year I'm hoping for and the one I'd rather avoid, and who I'll ask",
            response,
            is_milestone: false,
          })
          .select("id")
          .single();
    setBusy(false);
    if (err || !data?.id) {
      setError("Couldn't save — your writing is still here. Check your connection and try again.");
      return false;
    }
    setEntryId(data.id);
    if (mentionsCrisis(response)) setSupportNeeded(true);
    router.refresh();
    return true;
  }

  async function savePlan() {
    if (!planComplete(n)) return;
    if (await write(n)) setEditing(false);
  }

  async function saveDebrief() {
    if (foundOut.trim().length < 3) return;
    const next = { ...n, foundOut: foundOut.trim(), leftMe };
    if (await write(next)) setN(next);
  }

  const missing = [
    !n.options.length && "what's on the table",
    (n.hoping.trim().length < 3 || n.firstStep.trim().length < 3) && "the version you're hoping for",
    (n.avoiding.trim().length < 3 || n.headOff.trim().length < 3) && "the version you'd rather avoid",
    (n.who.trim().length < 3 || !n.questions.length || !n.talkBy) && "who you'll ask",
  ].filter(Boolean) as string[];

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div data-animate="1">
          <Link href="/me?tab=future" className="text-xs text-teal hover:underline">
            ← Future
          </Link>
          <h1
            className="text-3xl text-navy mt-3 mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Your next chapter
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            {leftSchool
              ? "What's next, made concrete: the options in front of you, the version of next year you're hoping for and the one you'd rather avoid, and someone to ask who's already doing it."
              : "Life after school, made concrete: the options in front of you, the version of next year you're hoping for and the one you'd rather avoid, and someone to ask who's already doing it."}
          </p>
        </div>

        {supportNeeded && <SupportCard />}

        {futureSelf && (
          <details className="card p-4" data-animate="2">
            <summary className="text-xs font-bold text-ink-muted uppercase tracking-wider cursor-pointer">
              Your ordinary Tuesday at 21, from Mission 4
            </summary>
            <blockquote className="text-sm text-ink leading-relaxed border-l-2 border-navy/25 pl-3 mt-3 whitespace-pre-line">
              {futureSelf}
            </blockquote>
          </details>
        )}

        {editing ? (
          <div className="space-y-4" data-animate="3">
            {/* 1 — options */}
            <section className="card p-5" aria-labelledby={`${ids}-1`}>
              <h2 id={`${ids}-1`} className="text-sm font-semibold text-ink mb-1">
                1 · What&apos;s on the table
              </h2>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Pick up to {OPTIONS_MAX} you&apos;re weighing up. Not sure is a real answer.
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => {
                  const sel = n.options.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => toggle("options", o, OPTIONS_MAX)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-sm transition-all",
                        sel ? "bg-navy text-white border-navy" : "bg-white text-ink border-border hover:border-navy/30"
                      )}
                    >
                      {sel && <span aria-hidden className="mr-1">✓</span>}
                      {o}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2 — hoped-for */}
            <section className="card p-5" aria-labelledby={`${ids}-2`}>
              <h2 id={`${ids}-2`} className="text-sm font-semibold text-ink mb-1">
                2 · The version of next year you&apos;re hoping for
              </h2>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                A year from now, on an ordinary weekday. Specific beats impressive.
              </p>
              <label htmlFor={`${ids}-hoping`} className="sr-only">The version you&apos;re hoping for</label>
              <textarea
                id={`${ids}-hoping`}
                className="input text-sm mb-3"
                rows={3}
                value={n.hoping}
                onChange={(e) => set("hoping", e.target.value)}
                placeholder={leftSchool ? "Second semester of a course I actually chose, working two shifts a week" : "In first-year nursing, working two shifts a week at the café"}
              />
              <label htmlFor={`${ids}-first`} className="block text-xs font-semibold text-ink mb-1">
                One step this month that makes it more likely
              </label>
              <textarea
                id={`${ids}-first`}
                className="input text-sm"
                rows={2}
                value={n.firstStep}
                onChange={(e) => set("firstStep", e.target.value)}
                placeholder="Look up the entry requirements and ask the careers adviser what I'd need"
              />
            </section>

            {/* 3 — feared */}
            <section className="card p-5" aria-labelledby={`${ids}-3`}>
              <h2 id={`${ids}-3`} className="text-sm font-semibold text-ink mb-1">
                3 · The version you&apos;d rather avoid
              </h2>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Everyone has one. It&apos;s not here to scare you: people who name it
                and plan a step against it are more likely to steer clear of it than
                people who only picture the good version.
              </p>
              <label htmlFor={`${ids}-avoid`} className="sr-only">The version you&apos;d rather avoid</label>
              <textarea
                id={`${ids}-avoid`}
                className="input text-sm mb-3"
                rows={3}
                value={n.avoiding}
                onChange={(e) => set("avoiding", e.target.value)}
                placeholder="Drifting: doing a course I picked because my mates did, and hating it"
              />
              <label htmlFor={`${ids}-headoff`} className="block text-xs font-semibold text-ink mb-1">
                What you could do early to head it off
              </label>
              <textarea
                id={`${ids}-headoff`}
                className="input text-sm"
                rows={2}
                value={n.headOff}
                onChange={(e) => set("headOff", e.target.value)}
                placeholder="Go to one open day on my own before I choose"
              />
            </section>

            {/* 4 — talk to someone */}
            <section className="card p-5" aria-labelledby={`${ids}-4`}>
              <h2 id={`${ids}-4`} className="text-sm font-semibold text-ink mb-1">
                4 · Ask someone who&apos;s already doing it
              </h2>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Ten minutes with someone a step ahead tells you more than a week of
                reading about it. Who could you ask?
              </p>
              <label htmlFor={`${ids}-who`} className="sr-only">Who you&apos;ll ask</label>
              <input
                id={`${ids}-who`}
                type="text"
                className="input text-sm mb-2"
                value={n.who}
                maxLength={100}
                onChange={(e) => set("who", e.target.value)}
                placeholder="My cousin, who's a second-year apprentice"
              />
              <div className="flex flex-wrap gap-1.5 mb-4">
                {WHO_SUGGESTIONS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => set("who", w)}
                    className="px-2.5 py-1 rounded-full border border-border text-xs text-ink-muted hover:text-ink hover:border-navy/30"
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-ink mb-2">
                Pick up to {QUESTIONS_MAX} questions to ask
              </div>
              <div className="space-y-1.5 mb-2">
                {questionList.map((q) => {
                  const sel = n.questions.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => toggle("questions", q, QUESTIONS_MAX)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all",
                        sel ? "bg-navy text-white border-navy" : "bg-white text-ink border-border hover:border-navy/30"
                      )}
                    >
                      {sel && <span aria-hidden className="mr-1.5">✓</span>}
                      {q}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mb-4">
                <label htmlFor={`${ids}-q`} className="sr-only">Your own question</label>
                <input
                  id={`${ids}-q`}
                  type="text"
                  className="input text-sm flex-1"
                  value={customQuestion}
                  maxLength={120}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addQuestion();
                    }
                  }}
                  placeholder="Or write your own question"
                />
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={customQuestion.trim().length < 4 || n.questions.length >= QUESTIONS_MAX}
                  className="btn btn-secondary px-4 rounded-xl text-sm"
                >
                  Add
                </button>
              </div>

              <fieldset>
                <legend className="text-xs font-semibold text-ink mb-2">By when?</legend>
                <div className="grid grid-cols-3 gap-1.5">
                  {TALK_BY.map(({ days, label }) => {
                    const date = dateIn(days);
                    const sel = n.talkBy === date;
                    return (
                      <button
                        key={days}
                        type="button"
                        aria-pressed={sel}
                        onClick={() => set("talkBy", date)}
                        className={cn(
                          "px-2 py-2 rounded-xl border text-xs font-medium leading-tight transition-all",
                          sel ? "bg-navy text-white border-navy" : "bg-white text-ink border-border hover:border-navy/30"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {n.talkBy && (
                  <p className="text-xs text-ink-muted mt-2">By {shortDate(n.talkBy)}. You&apos;ll get a nudge on Home then.</p>
                )}
              </fieldset>
            </section>

            {error && (
              <p role="alert" className="text-sm text-red-600 leading-relaxed">
                {error}
              </p>
            )}
            <button
              onClick={savePlan}
              disabled={!planComplete(n) || busy}
              className="btn btn-primary w-full py-3.5 rounded-xl"
            >
              {busy ? "Saving…" : "Save my plan"}
            </button>
            <p className="text-xs text-ink-muted text-center leading-relaxed">
              {missing.length ? `Still to do: ${missing.join(", ")}.` : "Private, like everything you write here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-animate="3">
            <section className="card p-5 space-y-4">
              <div>
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">On the table</div>
                <div className="flex flex-wrap gap-1.5">
                  {n.options.map((o) => (
                    <span key={o} className="px-2.5 py-1 rounded-lg bg-navy text-white text-xs font-medium">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Hoping for</div>
                <p className="text-sm text-ink leading-relaxed">{n.hoping}</p>
                <p className="text-sm text-ink-muted leading-relaxed mt-1">
                  <span className="font-semibold text-ink">This month:</span> {n.firstStep}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Rather avoid</div>
                <p className="text-sm text-ink leading-relaxed">{n.avoiding}</p>
                <p className="text-sm text-ink-muted leading-relaxed mt-1">
                  <span className="font-semibold text-ink">Heading it off:</span> {n.headOff}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Who you&apos;re asking</div>
                <p className="text-sm text-ink leading-relaxed mb-1">
                  {n.who}
                  {n.talkBy && <span className="text-ink-muted"> · by {shortDate(n.talkBy)}</span>}
                </p>
                <ul className="text-sm text-ink leading-relaxed list-disc pl-5 space-y-0.5">
                  {n.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* After the conversation */}
            <section id="debrief" className="card p-5" aria-labelledby={`${ids}-debrief`}>
              <h2 id={`${ids}-debrief`} className="text-sm font-semibold text-ink mb-1">
                {n.foundOut ? "What you found out" : `Did you talk to ${whoToYou(n.who)}?`}
              </h2>
              {n.foundOut ? (
                <>
                  <p className="text-sm text-ink leading-relaxed">{n.foundOut}</p>
                  {n.leftMe && (
                    <p className="text-xs text-ink-muted mt-2">It left you: {n.leftMe.toLowerCase()}.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                    {talkDue(n)
                      ? "Write it down while it's fresh. What they said is worth more than what you expected them to say."
                      : "Once you have, write down what you found out. Nothing yet is fine."}
                  </p>
                  <label htmlFor={`${ids}-found`} className="sr-only">What you found out</label>
                  <textarea
                    id={`${ids}-found`}
                    className="input text-sm mb-3"
                    rows={3}
                    value={foundOut}
                    onChange={(e) => setFoundOut(e.target.value)}
                    placeholder="The first year is mostly theory, and the placements are what decide if you love it"
                  />
                  <div className="text-xs font-semibold text-ink mb-2">Has it changed anything?</div>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {OUTCOMES.map((o) => (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={leftMe === o}
                        onClick={() => setLeftMe(leftMe === o ? "" : o)}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-sm transition-all",
                          leftMe === o ? "bg-navy text-white border-navy" : "bg-white text-ink border-border hover:border-navy/30"
                        )}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <p role="alert" className="text-sm text-red-600 mb-3 leading-relaxed">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={saveDebrief}
                    disabled={foundOut.trim().length < 3 || busy}
                    className="btn btn-primary w-full py-3 rounded-xl text-sm"
                  >
                    {busy ? "Saving…" : "Save what I found out"}
                  </button>
                </>
              )}
            </section>

            <div className="flex flex-col gap-2">
              <Link href="/me?tab=future#goals" className="btn btn-secondary w-full py-3 rounded-xl text-sm">
                Turn your first step into a goal →
              </Link>
              <button
                onClick={() => {
                  setFoundOut(n.foundOut);
                  setLeftMe(n.leftMe);
                  setEditing(true);
                }}
                className="text-xs text-teal hover:underline py-1"
              >
                Change the plan
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
