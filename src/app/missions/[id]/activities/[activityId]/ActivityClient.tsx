"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { cn, parseReflection } from "@/lib/utils";
import { type ProcessingStyle, getProcessingStyle } from "@/lib/processingStyle";
import { type LearningMode, getLearningMode, setLearningMode } from "@/lib/learningMode";
import type { Mission, Activity } from "@/lib/missions";
import { VALUES_WITH_DEFINITIONS, MISSIONS } from "@/lib/missions";
import type { JournalEntry, Challenge } from "@/types/database";

interface Props {
  mission: Mission;
  activity: Activity;
  userId: string;
  isCompleted: boolean;
  existingEntry: JournalEntry | null;
  existingChallenge: Challenge | null;
  pairedStory?: { id: string; title: string; teaser: string } | null;
}

// ─── Shared: Starter / Advanced mode toggle ───────────────────────────────────

const OTHER_OPTION = "__other__";

function ModeToggle({
  mode,
  onChange,
  accent,
}: {
  mode: LearningMode;
  onChange: (m: LearningMode) => void;
  accent: string;
}) {
  return (
    <div
      className="inline-flex items-center p-0.5 rounded-full border border-[--border] bg-white text-xs font-semibold"
      role="group"
      aria-label="Answer mode"
    >
      {(["starter", "advanced"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          className={cn(
            "px-3 py-1.5 rounded-full transition-colors",
            mode === m ? "text-white" : "text-[--ink-muted] hover:text-[--ink]"
          )}
          style={mode === m ? { background: accent } : undefined}
        >
          {m === "starter" ? "Starter" : "Advanced"}
        </button>
      ))}
    </div>
  );
}

// ─── Conversational journal flow ──────────────────────────────────────────────

type ConvPhase = "intro" | "q" | "done";

interface CompletedTurn {
  question: string;
  answer: string;
}

function ConversationalActivity({
  mission,
  activity,
  userId,
  existingEntry,
  pairedStory,
  onComplete,
}: {
  mission: Mission;
  activity: Activity;
  userId: string;
  existingEntry: JournalEntry | null;
  pairedStory?: { id: string; title: string; teaser: string } | null;
  onComplete: (response: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;

  // Questions: use scaffolding steps if available, else single prompt
  const questions =
    activity.scaffoldingSteps && activity.scaffoldingSteps.length > 0
      ? activity.scaffoldingSteps
      : [activity.prompt];

  const [phase, setPhase] = useState<ConvPhase>(
    existingEntry ? "done" : "intro"
  );
  const [mode, setModeState] = useState<LearningMode>("starter");
  // Read the saved preference after mount to avoid a hydration mismatch.
  useEffect(() => setModeState(getLearningMode()), []);
  const [qIdx, setQIdx] = useState(0);
  const [turns, setTurns] = useState<CompletedTurn[]>([]);
  const [current, setCurrent] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Starter mode uses multiple-choice when the current step has options.
  const stepOptions = activity.starterOptions?.[qIdx];
  const usingStarter = mode === "starter" && !!stepOptions;
  const writingOther = !usingStarter || selectedOption === OTHER_OPTION;

  function changeMode(m: LearningMode) {
    setModeState(m);
    setLearningMode(m);
    setSelectedOption(null);
    setCurrent("");
  }

  function pickOption(opt: string) {
    setSelectedOption(opt);
    if (opt !== OTHER_OPTION) {
      setCurrent("");
    } else {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }
  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(
    existingEntry?.ai_reflection || null
  );
  const [existingResponse] = useState(existingEntry?.response || "");
  const entryIdRef = useRef<string | null>(existingEntry?.id || null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new question appears
  useEffect(() => {
    if (phase === "q") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [qIdx, phase]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [current]);

  // Focus textarea when question changes
  useEffect(() => {
    if (phase === "q") {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [qIdx, phase]);

  function applySentenceStarter(starter: string) {
    const next = current ? `${current}\n\n${starter}` : starter;
    setCurrent(next);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(next.length, next.length);
      }
    }, 0);
  }

  function canSubmitCurrent() {
    if (usingStarter) {
      if (selectedOption && selectedOption !== OTHER_OPTION) return true;
      if (selectedOption === OTHER_OPTION) return current.trim().length > 2;
      return false;
    }
    return current.trim().length > 5;
  }

  async function handleNextQuestion() {
    if (!canSubmitCurrent()) return;

    const answer =
      usingStarter && selectedOption !== OTHER_OPTION
        ? selectedOption ?? ""
        : current.trim();

    const newTurns = [...turns, { question: questions[qIdx], answer }];
    setCurrent("");
    setSelectedOption(null);
    setTurns(newTurns);

    if (qIdx + 1 < questions.length) {
      setQIdx(qIdx + 1);
    } else {
      // All questions answered — build final response and save
      await finalise(newTurns);
    }
  }

  async function finalise(allTurns: CompletedTurn[]) {
    setSubmitting(true);

    const finalResponse =
      allTurns.length === 1
        ? allTurns[0].answer
        : allTurns.map((t, i) => `${i + 1}. ${t.question}\n${t.answer}`).join("\n\n");

    let entryId = entryIdRef.current;
    if (entryId) {
      await db
        .from("journal_entries")
        .update({ response: finalResponse, updated_at: new Date().toISOString() })
        .eq("id", entryId);
    } else {
      const { data } = await db
        .from("journal_entries")
        .insert({
          user_id: userId,
          mission_id: mission.id,
          activity_id: activity.id,
          prompt: activity.prompt,
          response: finalResponse,
          is_milestone: activity.isMilestone || false,
        })
        .select("id")
        .single();
      if (data?.id) {
        entryId = data.id;
        entryIdRef.current = data.id;
      }
    }

    // Request AI reflection async (non-blocking)
    if (finalResponse.length > 20 && entryId) {
      fetchAiReflection(finalResponse, entryId);
    }

    onComplete(finalResponse);
    setPhase("done");
    setSubmitting(false);
  }

  async function fetchAiReflection(text: string, entryId: string) {
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, entryId }),
      });
      if (res.ok) {
        const { reflection } = await res.json();
        if (reflection) setAiReflection(reflection);
      }
    } catch {
      // fail silently
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd+Enter or Ctrl+Enter to advance
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleNextQuestion();
    }
  }

  // Reopen a completed activity to revise the answer. entryIdRef still holds
  // the saved entry id, so finalise() will UPDATE it in place rather than
  // create a duplicate. Single-question activities pre-fill the existing text;
  // multi-step ones start fresh (the saved response can't be reliably split).
  function startEdit() {
    const single = questions.length === 1;
    const prefill = single ? turns[0]?.answer || existingResponse : "";
    setTurns([]);
    setQIdx(0);
    setSelectedOption(null);
    setCurrent(prefill);
    setPhase("q");
  }

  const isLastQuestion = qIdx === questions.length - 1;
  const progressPct = Math.round((qIdx / questions.length) * 100);

  // ── Intro phase ────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-muted)" }}>
        {/* Minimal header */}
        <div className="activity-header">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link
              href={`/missions/${mission.id}`}
              className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted] hover:text-[--ink] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-xs font-semibold text-[--ink-muted] tracking-wide truncate">
              {mission.title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-5 pt-8 pb-40" data-animate="1">
            {/* Activity header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${mission.colour}18`, color: mission.colour }}
                >
                  {mission.phaseLabel}
                </span>
                {activity.isMilestone && (
                  <span className="text-xs text-[--gold] bg-[rgba(200,152,42,0.1)] px-2.5 py-1 rounded-full font-semibold">
                    ★ Milestone
                  </span>
                )}
              </div>
              <h1
                className="text-[1.75rem] leading-tight text-[--navy] mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {activity.title}
              </h1>
              {activity.subtitle && (
                <p className="text-sm text-[--ink-muted]">{activity.subtitle}</p>
              )}
              {activity.timeEstimate && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[--ink-muted]/70">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {activity.timeEstimate}
                </div>
              )}
            </div>

            {/* Starter / Advanced mode chooser */}
            {activity.starterOptions && activity.starterOptions.length > 0 && (
              <div className="mb-6 rounded-2xl border border-[--border] bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm font-semibold text-[--ink]">
                    How do you want to answer?
                  </span>
                  <ModeToggle mode={mode} onChange={changeMode} accent={mission.colour} />
                </div>
                <p className="text-xs text-[--ink-muted] leading-relaxed">
                  {mode === "starter"
                    ? "Starter — pick the answer that fits you best. Quick and easy, no writing needed."
                    : "Advanced — write your own reflection, in your own words."}
                </p>
              </div>
            )}

            {/* Intro text */}
            {activity.intro && (
              <p className="text-[--ink-muted] text-sm leading-relaxed mb-5">
                {activity.intro}
              </p>
            )}

            {/* Warm-up */}
            {activity.warmUp && (
              <div className="question-card mb-5">
                <div className="text-[10px] font-bold text-[--ink-muted] uppercase tracking-widest mb-2">
                  Before you start
                </div>
                <p className="text-[--ink] leading-relaxed">{activity.warmUp}</p>
              </div>
            )}

            {/* Paired story */}
            {pairedStory && (
              <Link
                href={`/stories/${pairedStory.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed mb-5 transition-all hover:border-solid"
                style={{ borderColor: `${mission.colour}40`, background: `${mission.colour}06` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: `${mission.colour}18` }}>
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: mission.colour }}>
                    Read first
                  </div>
                  <div className="text-sm font-medium text-[--ink] truncate">{pairedStory.title}</div>
                  <div className="text-xs text-[--ink-muted] mt-0.5 truncate">{pairedStory.teaser}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[--ink-muted]/40 flex-shrink-0">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}

            {/* What's coming */}
            {questions.length > 1 && (
              <div className="mb-5 px-1">
                <p className="text-xs text-[--ink-muted] mb-2 font-medium">
                  {questions.length} questions, answer them in order:
                </p>
                <ol className="space-y-1.5">
                  {questions.map((q, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-[--ink-muted]">
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                        style={{ background: `${mission.colour}60` }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Begin button */}
            <button
              onClick={() => setPhase("q")}
              className="btn btn-primary w-full py-4 text-base rounded-xl mt-2"
              style={{ background: mission.colour }}
            >
              {usingStarter
                ? "Begin →"
                : questions.length === 1
                ? "Start writing"
                : "Begin →"}
            </button>
            <p className="text-[10px] text-[--ink-muted]/50 text-center mt-3 leading-relaxed">
              All entries are private. Only you can see this.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Conversation phase ─────────────────────────────────────────────────────
  if (phase === "q") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-muted)" }}>
        {/* Header with progress */}
        <div className="activity-header">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  if (qIdx > 0) {
                    setQIdx(qIdx - 1);
                    setTurns(turns.slice(0, -1));
                  } else {
                    setPhase("intro");
                  }
                }}
                className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted] hover:text-[--ink] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="flex-1 text-sm font-medium text-[--ink] truncate">
                {activity.title}
              </span>
              <span className="text-xs text-[--ink-muted] flex-shrink-0">
                {qIdx + 1} of {questions.length}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-[--border] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: mission.colour }}
              />
            </div>
            {activity.starterOptions && activity.starterOptions.length > 0 && (
              <div className="flex justify-end mt-2">
                <ModeToggle mode={mode} onChange={changeMode} accent={mission.colour} />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable conversation area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "calc(9rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
            {/* Completed turns */}
            {turns.map((turn, i) => (
              <div key={i} className="group">
                <button
                  onClick={() =>
                    setExpandedTurns((prev) => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })
                  }
                  className="w-full flex items-start gap-2.5 text-left"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                    style={{ background: "var(--sage)" }}
                  >
                    ✓
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[--ink-muted] leading-relaxed line-clamp-1">
                      {turn.question}
                    </p>
                    {expandedTurns.has(i) && (
                      <p className="text-sm text-[--ink] leading-relaxed mt-1 whitespace-pre-wrap">
                        {turn.answer}
                      </p>
                    )}
                    {!expandedTurns.has(i) && (
                      <p className="text-sm text-[--ink] leading-relaxed mt-0.5 line-clamp-2 italic">
                        &ldquo;{turn.answer}&rdquo;
                      </p>
                    )}
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={cn("flex-shrink-0 mt-0.5 text-[--ink-muted]/40 transition-transform", expandedTurns.has(i) && "rotate-180")}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="mt-3 ml-7 h-px bg-[--border]" />
              </div>
            ))}

            {/* Scenario setup — Mission 1 scenario-driven steps. Shown above
                the question so teens react to a concrete situation rather than
                introspect from a blank page. */}
            {activity.scenarios?.[qIdx] && (
              <div
                data-animate="1"
                className="rounded-2xl p-4 border"
                style={{
                  background: `${mission.colour}0D`,
                  borderColor: `${mission.colour}25`,
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: mission.colour }}
                >
                  <span aria-hidden>✦</span> Picture this
                </div>
                <p className="text-[--ink] leading-relaxed text-[0.95rem] italic">
                  {activity.scenarios[qIdx]}
                </p>
              </div>
            )}

            {/* Current question */}
            <div data-animate="2" className="question-card">
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: mission.colour }}
              >
                {activity.scenarios?.[qIdx]
                  ? "Now — you"
                  : `Question ${qIdx + 1}`}
              </div>
              <p className="text-[--ink] leading-relaxed text-base">
                {questions[qIdx]}
              </p>
            </div>

            {/* Starter mode: multiple-choice options */}
            {usingStarter && (
              <div data-animate="3" className="space-y-2">
                {stepOptions!.map((opt) => {
                  const sel = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => pickOption(opt)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all",
                        sel
                          ? "text-white"
                          : "bg-white text-[--ink] border-[--border] hover:border-[rgba(0,0,0,0.18)]"
                      )}
                      style={sel ? { background: mission.colour, borderColor: mission.colour } : undefined}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => pickOption(OTHER_OPTION)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border border-dashed text-sm transition-all",
                    selectedOption === OTHER_OPTION
                      ? "border-solid text-[--ink]"
                      : "text-[--ink-muted] hover:text-[--ink]"
                  )}
                  style={
                    selectedOption === OTHER_OPTION
                      ? { borderColor: mission.colour, background: `${mission.colour}0D` }
                      : { borderColor: "var(--border)" }
                  }
                >
                  ✎ Something else — let me write it
                </button>
              </div>
            )}

            {/* Advanced mode: sentence starters */}
            {!usingStarter && activity.sentenceStarters && activity.sentenceStarters.length > 0 && (
              <div data-animate="3">
                <p className="text-xs text-[--ink-muted] mb-2 px-0.5">Try starting with:</p>
                <div className="flex flex-wrap gap-2">
                  {activity.sentenceStarters.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => applySentenceStarter(s)}
                      className="starter-chip"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Fixed input bar */}
        <div className="conv-input-bar">
          <div className="max-w-lg mx-auto">
            {writingOther && (
              <textarea
                ref={textareaRef}
                className="conv-textarea mb-2"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your answer here…"
                rows={2}
              />
            )}
            <div className="flex items-center gap-3">
              <p className="flex-1 text-[10px] text-[--ink-muted]/40 leading-tight">
                {writingOther ? "⌘ Return to advance" : "Pick the one that fits you best"}
              </p>
              <button
                onClick={handleNextQuestion}
                disabled={!canSubmitCurrent() || submitting}
                className={cn(
                  "btn py-2.5 px-5 rounded-xl text-sm transition-all",
                  canSubmitCurrent()
                    ? "text-white"
                    : "bg-[--border] text-[--ink-muted] cursor-not-allowed"
                )}
                style={canSubmitCurrent() ? { background: mission.colour } : undefined}
              >
                {submitting
                  ? "Saving…"
                  : isLastQuestion
                  ? "Finish ✓"
                  : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Done phase ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-muted)" }}>
      <div className="activity-header">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-sm font-medium text-[--ink]">{activity.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-nav">
        <div className="max-w-lg mx-auto px-5 pt-8">
          {/* Celebration */}
          <div className="text-center mb-8" data-animate="1">
            <div className="text-4xl mb-4">✓</div>
            <h2
              className="text-2xl text-[--navy] mb-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Saved.
            </h2>
            <p className="text-sm text-[--ink-muted]">
              That&apos;s one more thing you know about yourself.
            </p>
          </div>

          {/* Summary of turns (when coming from conversation) */}
          {turns.length > 0 && (
            <div className="card p-5 mb-5 space-y-4" data-animate="2">
              {turns.map((turn, i) => (
                <div key={i}>
                  {i > 0 && <div className="h-px bg-[--border] my-4" />}
                  <p className="text-xs text-[--ink-muted] mb-1.5 leading-relaxed">
                    {turn.question}
                  </p>
                  <p className="text-sm text-[--ink] leading-relaxed whitespace-pre-wrap">
                    {turn.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pre-existing entry (returned to done state) */}
          {turns.length === 0 && existingResponse && (
            <div className="card p-5 mb-5" data-animate="2">
              <p className="text-xs text-[--ink-muted] font-medium mb-2">Your reflection</p>
              <p className="text-sm text-[--ink] leading-relaxed whitespace-pre-wrap">
                {existingResponse}
              </p>
            </div>
          )}

          {/* AI reflection */}
          {aiReflection && (() => {
            const parsed = parseReflection(aiReflection);
            if (!parsed) return null;
            return (
              <div
                className="rounded-2xl p-5 mb-5 border"
                style={{ background: "rgba(46,125,140,0.04)", borderColor: "rgba(46,125,140,0.2)" }}
                data-animate="3"
              >
                <div className="text-[10px] font-bold text-[--teal] mb-3 uppercase tracking-widest">
                  Something to sit with
                </div>
                {parsed.type === "tricheck" ? (
                  <div className="space-y-3">
                    {([
                      { label: "What you believe", q: parsed.tricheck.conceptual },
                      { label: "Something to try", q: parsed.tricheck.practical },
                      { label: "Who gets it", q: parsed.tricheck.collective },
                    ] as const).map(({ label, q }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-[9px] font-bold text-[--teal]/50 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5 leading-tight">
                          {label}
                        </span>
                        <p className="text-sm text-[--ink] leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[--ink] leading-relaxed">{parsed.text}</p>
                )}
              </div>
            );
          })()}

          {/* Loading state for AI reflection */}
          {!aiReflection && turns.length > 0 && (
            <div className="rounded-2xl p-5 mb-5 border border-[--border] bg-white" data-animate="3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[--teal] border-t-transparent animate-spin" />
                <p className="text-xs text-[--ink-muted]">Getting a reflection for you…</p>
              </div>
            </div>
          )}

          {/* Edit own answer */}
          <button
            onClick={startEdit}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[--teal] mb-4 py-2.5 rounded-xl border border-[--border] bg-white hover:bg-[--surface-muted] transition-colors"
            data-animate="4"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2L5 11l-2.5.5L3 9l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit my answer
          </button>

          {/* Navigation */}
          <div className="flex gap-3 pb-8" data-animate="4">
            <Link
              href={`/missions/${mission.id}`}
              className="btn btn-secondary flex-1 py-3 rounded-xl"
            >
              Back to mission
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-primary flex-1 py-3 rounded-xl"
              style={{ background: "var(--navy)" }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Values picker ────────────────────────────────────────────────────────────

function ValuesPickerActivity({
  mission,
  activity,
  userId,
  existingEntry,
  onComplete,
}: {
  mission: Mission;
  activity: Activity;
  userId: string;
  existingEntry: JournalEntry | null;
  onComplete: (response: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;
  const entryIdRef = useRef<string | null>(existingEntry?.id || null);

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [valueReasons, setValueReasons] = useState<Record<string, string>>({});
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingEntry);
  // Holds the saved response locally so the summary + edit work even right
  // after a fresh submit (when the existingEntry prop is still null).
  const [savedResponse, setSavedResponse] = useState(existingEntry?.response || "");
  const whyId = useId();
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [style] = useState<ProcessingStyle | null>(() =>
    typeof window !== "undefined" ? getProcessingStyle() : null
  );
  const [mode, setModeState] = useState<LearningMode>("starter");
  useEffect(() => setModeState(getLearningMode()), []);
  function changeMode(m: LearningMode) {
    setModeState(m);
    setLearningMode(m);
  }

  function toggleValue(val: string) {
    if (selectedValues.includes(val)) {
      setSelectedValues(selectedValues.filter((v) => v !== val));
      const updated = { ...valueReasons };
      delete updated[val];
      setValueReasons(updated);
    } else if (selectedValues.length < (activity.valuesCount || 5)) {
      setSelectedValues([...selectedValues, val]);
    }
  }

  const canSubmit = selectedValues.length === (activity.valuesCount || 5);

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);

    const finalResponse = selectedValues
      .map((v) => (valueReasons[v] ? `${v}: ${valueReasons[v]}` : v))
      .join("\n");

    const entryId = entryIdRef.current;
    if (entryId) {
      await db.from("journal_entries").update({ response: finalResponse }).eq("id", entryId);
    } else {
      const { data } = await db
        .from("journal_entries")
        .insert({
          user_id: userId,
          mission_id: mission.id,
          activity_id: activity.id,
          prompt: activity.prompt,
          response: finalResponse,
          is_milestone: activity.isMilestone || false,
        })
        .select("id")
        .single();
      if (data?.id) entryIdRef.current = data.id;
    }

    setSavedResponse(finalResponse);
    onComplete(finalResponse);
    setSubmitted(true);
    setSubmitting(false);
  }

  // Reopen to revise. Re-populate the grid + reasons from the saved entry so
  // the teen edits their existing choices rather than starting over. entryIdRef
  // still holds the id, so handleSubmit updates the same entry.
  function startEdit() {
    const source = savedResponse || existingEntry?.response;
    if (source) {
      const vals: string[] = [];
      const reasons: Record<string, string> = {};
      source.split("\n").forEach((line) => {
        const t = line.trim();
        if (!t) return;
        const idx = t.indexOf(":");
        if (idx === -1) {
          vals.push(t);
          return;
        }
        const v = t.slice(0, idx).trim();
        const r = t.slice(idx + 1).trim();
        if (!v) return;
        vals.push(v);
        if (r && r !== "(no reason given)") reasons[v] = r;
      });
      if (vals.length) {
        setSelectedValues(vals);
        setValueReasons(reasons);
      }
    }
    setSubmitted(false);
  }

  if (submitted) {
    const lines = (savedResponse || existingEntry?.response || "").split("\n").filter(Boolean);
    return (
      <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>
        <div className="activity-header">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link href={`/missions/${mission.id}`} className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-[--ink]">{activity.title}</span>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-5 pt-8 pb-nav">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-2xl text-[--navy] mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              Your values are in.
            </h2>
          </div>
          <div className="card p-5 mb-5 space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-[--navy]">{line.split(":")[0]}</span>
                {line.includes(":") && (
                  <span className="text-[--ink-muted]">{": " + line.split(": ").slice(1).join(": ")}</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={startEdit}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[--teal] mb-4 py-2.5 rounded-xl border border-[--border] bg-white hover:bg-[--surface-muted] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2L5 11l-2.5.5L3 9l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit my values
          </button>
          <div className="flex gap-3">
            <Link href={`/missions/${mission.id}`} className="btn btn-secondary flex-1 py-3 rounded-xl">Back to mission</Link>
            <Link href="/dashboard" className="btn btn-primary flex-1 py-3 rounded-xl">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>
      <div className="activity-header">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href={`/missions/${mission.id}`} className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="flex-1 text-sm font-medium text-[--ink]">{activity.title}</span>
          <span className="text-xs text-[--ink-muted]">
            {selectedValues.length} of {activity.valuesCount || 5}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-nav">
        <div className="card p-5 mb-5">
          <p className="text-[--ink] leading-relaxed">{activity.prompt}</p>
        </div>

        {/* Starter / Advanced mode chooser */}
        <div className="mb-5 rounded-2xl border border-[--border] bg-white p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm font-semibold text-[--ink]">
              How do you want to answer?
            </span>
            <ModeToggle mode={mode} onChange={changeMode} accent={mission.colour} />
          </div>
          <p className="text-xs text-[--ink-muted] leading-relaxed">
            {mode === "starter"
              ? "Starter — just choose your values. That's all you need to do."
              : "Advanced — choose your values, then add why each one matters."}
          </p>
        </div>

        {style === "informational" && activity.whyItMatters && (
          <div className="mb-5">
            <button
              type="button"
              aria-expanded={whyExpanded}
              aria-controls={whyId}
              onClick={() => setWhyExpanded((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-[--teal] w-full text-left"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform flex-shrink-0", whyExpanded && "rotate-90")}>
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              The idea behind this
            </button>
            {whyExpanded && (
              <div id={whyId} className="mt-2 px-4 py-3 rounded-xl text-xs text-[--ink-muted] leading-relaxed" style={{ background: "rgba(46,125,140,0.04)", borderLeft: "2px solid rgba(46,125,140,0.25)" }}>
                {activity.whyItMatters}
              </div>
            )}
          </div>
        )}

        {/* Scenario priming — help teens recognise a value in a situation
            before facing the abstract list. */}
        {activity.scenarios && activity.scenarios.length > 0 && (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-medium text-[--ink-muted] mb-1 px-0.5 flex items-center gap-1.5">
              <span aria-hidden style={{ color: mission.colour }}>✦</span>
              Sit with these first — notice which ones pull at you:
            </p>
            {activity.scenarios.map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3 border text-sm leading-relaxed text-[--ink] italic"
                style={{
                  background: `${mission.colour}0D`,
                  borderColor: `${mission.colour}25`,
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {(activity.valuesOptions || []).map((val) => {
            const sel = selectedValues.includes(val);
            const disabled = !sel && selectedValues.length >= (activity.valuesCount || 5);
            return (
              <button
                key={val}
                onClick={() => toggleValue(val)}
                onMouseEnter={() => setHoveredValue(val)}
                onMouseLeave={() => setHoveredValue(null)}
                disabled={disabled}
                className={cn(
                  "p-3 rounded-xl text-sm font-medium border transition-all text-left",
                  sel ? "bg-[--navy] text-white border-[--navy]"
                  : disabled ? "opacity-40 bg-[--surface-muted] border-[--border] cursor-not-allowed"
                  : "bg-white text-[--ink] border-[--border] hover:border-[rgba(27,58,92,0.3)]"
                )}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div className="h-20 mb-4 flex items-start">
          {hoveredValue ? (
            <div className="w-full rounded-xl bg-[rgba(46,125,140,0.05)] border border-[rgba(46,125,140,0.2)] px-4 py-3 text-sm text-[--ink-muted]">
              <span className="font-semibold text-[--ink]">{hoveredValue}: </span>
              {VALUES_WITH_DEFINITIONS[hoveredValue] || ""}
            </div>
          ) : (
            <p className="text-xs text-[--ink-muted]/40 px-1 pt-1">Tap a value to select it · hover to see the definition</p>
          )}
        </div>

        {mode === "advanced" && selectedValues.length > 0 && (
          <div className="space-y-4 mb-6">
            <p className="text-sm font-medium text-[--ink]">
              Why does each one matter to you? (optional)
            </p>
            {selectedValues.map((val) => (
              <div key={val}>
                <label className="block text-sm font-medium text-[--navy] mb-1">{val}</label>
                <input
                  type="text"
                  className="input text-sm"
                  placeholder={`What does ${val} mean to you?`}
                  value={valueReasons[val] || ""}
                  onChange={(e) => setValueReasons({ ...valueReasons, [val]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn btn-primary w-full py-4 rounded-xl text-base"
        >
          {submitting ? "Saving…" : "Save my values"}
        </button>
      </div>
    </div>
  );
}

// ─── Challenge activity ───────────────────────────────────────────────────────

function ChallengeActivity({
  mission,
  activity,
  userId,
  existingChallenge,
  onComplete,
}: {
  mission: Mission;
  activity: Activity;
  userId: string;
  existingChallenge: Challenge | null;
  onComplete: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingChallenge);
  const [debrief, setDebrief] = useState(existingChallenge?.debrief_response || "");
  const [debriefDone, setDebriefDone] = useState(!!existingChallenge?.completed_at);

  const showDebrief = existingChallenge && !existingChallenge.completed_at;

  async function acceptChallenge() {
    setSubmitting(true);
    await db.from("challenges").insert({
      user_id: userId,
      mission_id: mission.id,
      challenge_text: activity.prompt,
    });
    onComplete();
    setSubmitted(true);
    setSubmitting(false);
  }

  async function submitDebrief() {
    if (!existingChallenge?.id || !debrief.trim()) return;
    setSubmitting(true);
    await db.from("challenges").update({
      completed_at: new Date().toISOString(),
      debrief_response: debrief,
    }).eq("id", existingChallenge.id);
    await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: mission.id,
      activity_id: `${activity.id}-debrief`,
      prompt: "Reflect on your challenge: what happened?",
      response: debrief,
    });
    setDebriefDone(true);
    setSubmitting(false);
  }

  const header = (
    <div className="activity-header">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <Link href={`/missions/${mission.id}`} className="p-1.5 -ml-1.5 rounded-lg text-[--ink-muted]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-sm font-medium text-[--ink]">{activity.title}</span>
      </div>
    </div>
  );

  if (showDebrief) {
    return (
      <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>
        {header}
        <div className="max-w-lg mx-auto px-5 pt-6 pb-nav">
          <div className="card p-5 mb-5 border-l-4" style={{ borderLeftColor: "var(--gold)" }}>
            <p className="text-xs font-semibold text-[--gold] mb-2 uppercase tracking-wide">Check in</p>
            <p className="text-[--ink] text-sm leading-relaxed">{existingChallenge?.challenge_text}</p>
          </div>
          {debriefDone ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">✓</div>
              <p className="font-medium text-[--navy] mb-6">Reflection saved.</p>
              <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
            </div>
          ) : (
            <>
              <p className="font-medium text-[--ink] mb-1">What happened?</p>
              <p className="text-sm text-[--ink-muted] mb-4">It&apos;s okay if it didn&apos;t go perfectly.</p>
              <textarea
                className="journal-textarea mb-4"
                rows={6}
                value={debrief}
                onChange={(e) => setDebrief(e.target.value)}
                placeholder="Be honest. It's okay if you didn't do it."
              />
              <button
                onClick={submitDebrief}
                disabled={!debrief.trim() || submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? "Saving…" : "Save reflection"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>
        {header}
        <div className="max-w-lg mx-auto px-5 pt-8 pb-nav text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-xl text-[--navy] mb-4" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Challenge accepted.
          </h2>
          <div className="card p-5 mb-6 text-left">
            <p className="text-sm text-[--ink] leading-relaxed">{activity.prompt}</p>
          </div>
          <p className="text-sm text-[--ink-muted] mb-6">Come back in a week to reflect.</p>
          <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>
      {header}
      <div className="max-w-lg mx-auto px-5 pt-6 pb-nav">
        <div className="rounded-2xl p-6 mb-6 text-white text-center" style={{ background: "var(--gold)" }}>
          <div className="text-3xl mb-3">🎯</div>
          <p className="text-xl mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}>
            Your challenge this week
          </p>
          <p className="text-white/90 leading-relaxed">{activity.prompt}</p>
        </div>
        <p className="text-sm text-[--ink-muted] text-center mb-6 leading-relaxed">
          Come back in 7 days to reflect on what happened. That&apos;s where the real learning is.
        </p>
        <button
          onClick={acceptChallenge}
          disabled={submitting}
          className="btn btn-primary w-full py-4 rounded-xl text-base"
        >
          {submitting ? "Starting…" : "Accept this challenge"}
        </button>
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function ActivityClient({
  mission,
  activity,
  userId,
  isCompleted,
  existingEntry,
  existingChallenge,
  pairedStory,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;

  const [completed, setCompleted] = useState(isCompleted);

  // After any activity type completes, mark mission_progress and advance active_mission if needed
  const markProgress = useCallback(async () => {
    await db.from("mission_progress").upsert({
      user_id: userId,
      mission_id: mission.id,
      activity_id: activity.id,
    });

    const totalActivities = mission.activities.filter((a) => !a.locked).length;
    const { count } = await db
      .from("mission_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("mission_id", mission.id);
    const nextMissionId = mission.id + 1;
    const nextMissionExists = MISSIONS.some((m) => m.id === nextMissionId);
    if (count !== null && count >= totalActivities && nextMissionExists) {
      await db
        .from("users")
        .update({ active_mission: nextMissionId })
        .eq("id", userId)
        .lt("active_mission", nextMissionId);
    }
  }, [db, userId, mission, activity]);

  function handleComplete() {
    markProgress();
    setCompleted(true);
  }

  // Locked activities
  if (activity.locked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-muted)" }}>
        <div className="text-center px-6">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-[--ink-muted]">This activity is coming soon.</p>
          <Link href={`/missions/${mission.id}`} className="btn btn-secondary mt-4">
            Back to mission
          </Link>
        </div>
      </div>
    );
  }

  // Values picker
  if (activity.type === "values_picker") {
    return (
      <ValuesPickerActivity
        mission={mission}
        activity={activity}
        userId={userId}
        existingEntry={completed ? existingEntry : null}
        onComplete={() => handleComplete()}
      />
    );
  }

  // Challenge
  if (activity.type === "challenge") {
    return (
      <ChallengeActivity
        mission={mission}
        activity={activity}
        userId={userId}
        existingChallenge={existingChallenge}
        onComplete={handleComplete}
      />
    );
  }

  // Journal / milestone_letter → conversational flow
  return (
    <ConversationalActivity
      mission={mission}
      activity={activity}
      userId={userId}
      existingEntry={completed ? existingEntry : null}
      pairedStory={pairedStory}
      onComplete={() => handleComplete()}
    />
  );
}
