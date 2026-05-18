"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { cn, parseReflection } from "@/lib/utils";
import { type ProcessingStyle, getProcessingStyle } from "@/lib/processingStyle";
import type { Mission, Activity } from "@/lib/missions";
import { VALUES_WITH_DEFINITIONS, MISSIONS } from "@/lib/missions";
import type { JournalEntry, Challenge } from "@/types/database";
import AppShell from "@/components/layout/AppShell";

interface Props {
  mission: Mission;
  activity: Activity;
  userId: string;
  isCompleted: boolean;
  existingEntry: JournalEntry | null;
  existingChallenge: Challenge | null;
  pairedStory?: { id: string; title: string; teaser: string } | null;
}

export default function ActivityClient({
  mission,
  activity,
  userId,
  isCompleted,
  existingEntry,
  existingChallenge,
  pairedStory,
}: Props) {
  // Cast to any once — avoids the @supabase/ssr generic inference bug
  // where .update()/.insert() payloads type as `never`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;

  const [response, setResponse] = useState(existingEntry?.response || "");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [valueReasons, setValueReasons] = useState<Record<string, string>>({});
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [aiReflection, setAiReflection] = useState<string | null>(
    existingEntry?.ai_reflection || null
  );
  const [challengeDebrief, setChallengeDebrief] = useState(
    existingChallenge?.debrief_response || ""
  );
  const [debriefSubmitted, setDebriefSubmitted] = useState(
    !!existingChallenge?.completed_at
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryIdRef = useRef<string | null>(existingEntry?.id || null);

  // Processing style — read from localStorage after mount (SSR-safe)
  const [style, setStyle] = useState<ProcessingStyle | null>(null);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const whyId = useId();

  useEffect(() => {
    setStyle(getProcessingStyle());
  }, []);

  // ─── Autosave every 30 seconds ───────────────────────────────────────────────
  const autoSave = useCallback(async () => {
    if (!response.trim() || activity.type === "challenge") return;
    setSaving(true);
    if (entryIdRef.current) {
      await db
        .from("journal_entries")
        .update({ response, updated_at: new Date().toISOString() })
        .eq("id", entryIdRef.current);
    } else {
      const { data } = await db
        .from("journal_entries")
        .insert({
          user_id: userId,
          mission_id: mission.id,
          activity_id: activity.id,
          prompt: activity.prompt,
          response,
          is_milestone: activity.isMilestone || false,
        })
        .select("id")
        .single();
      if (data?.id) entryIdRef.current = data.id;
    }
    setLastSaved(new Date());
    setSaving(false);
  }, [response, activity, mission.id, userId, db]);

  useEffect(() => {
    if (submitted) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(autoSave, 30000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [response, autoSave, submitted]);

  // ─── Values picker ───────────────────────────────────────────────────────────
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

  // ─── Sentence starter ────────────────────────────────────────────────────────
  function applySentenceStarter(starter: string) {
    const newText = response ? `${response}\n\n${starter}` : starter;
    setResponse(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);

    let finalResponse = response;
    if (activity.type === "values_picker") {
      finalResponse = selectedValues
        .map((v) => `${v}: ${valueReasons[v] || "(no reason given)"}`)
        .join("\n");
    }

    let entryId = entryIdRef.current;

    if (activity.type !== "challenge") {
      if (entryId) {
        await db
          .from("journal_entries")
          .update({ response: finalResponse })
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
    }

    // Mark progress
    await db.from("mission_progress").upsert({
      user_id: userId,
      mission_id: mission.id,
      activity_id: activity.id,
    });

    // Advance active_mission when the last activity of this mission is completed
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

    // Create challenge record
    if (activity.type === "challenge") {
      await db.from("challenges").insert({
        user_id: userId,
        mission_id: mission.id,
        challenge_text: activity.prompt,
      });
    }

    // Request AI reflection (non-blocking, fail silently)
    if (activity.type !== "challenge" && finalResponse.trim().length > 20 && entryId) {
      fetchAiReflection(finalResponse, entryId);
    }

    setSubmitted(true);
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
      // Fail silently
    }
  }

  async function handleDebriefSubmit() {
    if (!existingChallenge?.id || !challengeDebrief.trim()) return;
    setSubmitting(true);
    await db
      .from("challenges")
      .update({
        completed_at: new Date().toISOString(),
        debrief_response: challengeDebrief,
      })
      .eq("id", existingChallenge.id);

    await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: mission.id,
      activity_id: `${activity.id}-debrief`,
      prompt: "Reflect on your challenge: what happened?",
      response: challengeDebrief,
    });

    setDebriefSubmitted(true);
    setSubmitting(false);
  }

  const canSubmitJournal = response.trim().length > 10;
  const canSubmitValues =
    activity.type === "values_picker" &&
    selectedValues.length === (activity.valuesCount || 5);

  const showDebrief =
    activity.type === "challenge" &&
    existingChallenge &&
    !existingChallenge.completed_at;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back link */}
        <Link
          href={`/missions/${mission.id}`}
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {mission.title}
        </Link>

        {/* Activity header */}
        <div className="mb-6" data-animate="1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-ink-muted">{activity.subtitle}</div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${mission.colour}18`,
                color: mission.colour,
              }}
            >
              {mission.phaseLabel}
            </span>
          </div>
          <h1
            className="text-2xl text-navy mb-2"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            {activity.title}
          </h1>
          {activity.isMilestone && (
            <span className="inline-flex items-center gap-1 text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">
              ★ Milestone entry
            </span>
          )}
          {activity.timeEstimate && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-muted">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {activity.timeEstimate}
            </div>
          )}
        </div>

        {/* Scaffolding — intro, paired story, warm-up */}
        {!submitted && (activity.intro || pairedStory || activity.warmUp) && (
          <div className="mb-6 space-y-3" data-animate="1">
            {/* Intro — why this step matters */}
            {activity.intro && (
              <p className="text-sm text-ink-muted leading-relaxed">
                {activity.intro}
              </p>
            )}

            {/* Paired story */}
            {pairedStory && (
              <Link
                href={`/stories/${pairedStory.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed transition-all hover:border-solid hover:shadow-soft"
                style={{ borderColor: `${mission.colour}40`, background: `${mission.colour}06` }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
                  style={{ background: `${mission.colour}18` }}
                >
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: mission.colour }}>
                    Read someone else&apos;s story first
                  </div>
                  <div className="text-sm font-medium text-ink truncate">
                    {pairedStory.title}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5 truncate">
                    {pairedStory.teaser}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-muted/40 flex-shrink-0">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}

            {/* Warm-up prompt */}
            {activity.warmUp && (
              <div className="rounded-xl bg-surface-muted px-4 py-3 border border-surface-border">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                  Before you write
                </div>
                <p className="text-sm text-ink leading-relaxed">
                  {activity.warmUp}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── JOURNAL / MILESTONE LETTER ─── */}
        {(activity.type === "journal" || activity.type === "milestone_letter") && (
          <div data-animate="2">
            {/* Informational: "Why this works" expandable — shown before the prompt */}
            {!submitted && style === "informational" && activity.whyItMatters && (
              <div className="mb-4">
                <button
                  type="button"
                  aria-expanded={whyExpanded}
                  aria-controls={whyId}
                  onClick={() => setWhyExpanded((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold text-teal hover:text-teal/80 transition-colors w-full text-left"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={cn("transition-transform flex-shrink-0", whyExpanded && "rotate-90")}
                  >
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  The idea behind this
                </button>
                {whyExpanded && (
                  <div
                    id={whyId}
                    className="mt-2 px-4 py-3 rounded-xl text-xs text-ink-muted leading-relaxed"
                    style={{ background: "rgba(46,125,140,0.04)", borderLeft: "2px solid rgba(46,125,140,0.25)" }}
                  >
                    {activity.whyItMatters}
                  </div>
                )}
              </div>
            )}

            {/* Prompt card — shows scaffolding steps if available, otherwise main prompt */}
            <div className="card p-5 mb-4">
              {activity.scaffoldingSteps && activity.scaffoldingSteps.length > 0 ? (
                <div>
                  <p className="text-sm text-ink-muted mb-3 leading-relaxed">
                    {activity.prompt}
                  </p>
                  {/* Normative: explicit "one at a time" heading */}
                  {style === "normative" && (
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                      Take these one at a time:
                    </p>
                  )}
                  <ol className="space-y-2">
                    {(style === "diffuse-avoidant" && !showAllSteps
                      ? activity.scaffoldingSteps.slice(0, 1)
                      : activity.scaffoldingSteps
                    ).map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white mt-0.5"
                          style={{ background: mission.colour }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm text-ink leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                  {/* Diffuse-Avoidant: progressive disclosure of remaining steps */}
                  {style === "diffuse-avoidant" &&
                    !showAllSteps &&
                    activity.scaffoldingSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllSteps(true)}
                        className="mt-3 text-xs text-ink-muted hover:text-ink transition-colors"
                      >
                        Show the other prompts when you&apos;re ready →
                      </button>
                    )}
                </div>
              ) : (
                <div>
                  <p className="text-ink leading-relaxed">{activity.prompt}</p>
                  {activity.secondaryPrompt && (
                    <p className="text-sm text-ink-muted leading-relaxed italic mt-2">
                      {activity.secondaryPrompt}
                    </p>
                  )}
                </div>
              )}
            </div>

            {submitted ? (
              <div>
                <div className="text-center py-6 mb-2" data-animate="1">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-sm font-medium text-navy">Saved.</p>
                  <p className="text-xs text-ink-muted mt-1">That's one more thing you know about yourself.</p>
                </div>
                <div className="card p-5 mb-4 bg-surface-muted">
                  <p className="text-sm text-ink-muted mb-2 font-medium">Your reflection</p>
                  <p className="text-ink leading-relaxed whitespace-pre-wrap">{response}</p>
                </div>

                {aiReflection && (() => {
                  const parsed = parseReflection(aiReflection);
                  if (!parsed) return null;
                  return (
                    <div
                      className="rounded-xl p-5 mb-4 border"
                      style={{ background: "rgba(46,125,140,0.04)", borderColor: "rgba(46,125,140,0.2)" }}
                      data-animate="3"
                    >
                      <div className="text-xs font-semibold text-teal mb-3 uppercase tracking-wide">
                        Something to sit with
                      </div>
                      {parsed.type === "tricheck" ? (
                        <div className="space-y-3">
                          {([
                            { label: "What you believe", q: parsed.tricheck.conceptual },
                            { label: "Something to try", q: parsed.tricheck.practical },
                            { label: "Who gets it",      q: parsed.tricheck.collective },
                          ] as const).map(({ label, q }) => (
                            <div key={label} className="flex gap-3">
                              <span className="text-[10px] font-semibold text-teal/50 uppercase tracking-wide w-[5.5rem] flex-shrink-0 pt-0.5 leading-tight">
                                {label}
                              </span>
                              <p className="text-sm text-ink leading-relaxed">{q}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ink leading-relaxed text-sm">{parsed.text}</p>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <Link href={`/missions/${mission.id}`} className="btn btn-secondary flex-1">
                    Back to mission
                  </Link>
                  <Link href="/dashboard" className="btn btn-primary flex-1">
                    Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Sentence starters */}
                {activity.sentenceStarters && activity.sentenceStarters.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-ink-muted mb-2">Try starting with:</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.sentenceStarters.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() => applySentenceStarter(starter)}
                          className="text-xs px-3 py-1.5 rounded-full border border-surface-border bg-white text-ink-muted hover:border-navy/30 hover:text-ink transition-all"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative mb-3">
                  <textarea
                    ref={textareaRef}
                    className="journal-textarea"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write whatever comes to mind. There are no wrong answers here."
                    rows={8}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-ink-muted/50">
                    {saving ? "Saving…" : lastSaved ? "Saved" : ""}
                  </div>
                </div>

                {activity.secondaryPrompt && response.length > 50 && !activity.scaffoldingSteps && (
                  <div className="mb-4 p-4 bg-teal/5 rounded-xl border border-teal/15">
                    <p className="text-sm text-teal-dark italic">{activity.secondaryPrompt}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmitJournal || submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? "Saving…" : "Save reflection"}
                </button>
                <p className="text-xs text-ink-muted text-center mt-3">
                  All entries are private. Only you can see this.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── VALUES PICKER ─── */}
        {activity.type === "values_picker" && (
          <div data-animate="2">
            <div className="card p-5 mb-5">
              <p className="text-ink leading-relaxed">{activity.prompt}</p>
            </div>

            {submitted ? (
              <div>
                <div className="card p-5 mb-4">
                  <p className="text-sm text-ink-muted font-medium mb-3">Your values</p>
                  <div className="space-y-3">
                    {existingEntry?.response.split("\n").map((line, i) => (
                      <div key={i} className="text-sm text-ink">
                        <span className="font-semibold text-navy">{line.split(":")[0]}</span>
                        {line.includes(":") && (
                          <span className="text-ink-muted">
                            {": " + line.split(": ").slice(1).join(": ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Link href={`/missions/${mission.id}`} className="btn btn-primary w-full">
                  Back to mission
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-ink-muted mb-4">
                  Select {activity.valuesCount || 5} values ({selectedValues.length} of{" "}
                  {activity.valuesCount || 5} chosen) — hover any value to see its definition
                </p>

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
                          sel
                            ? "bg-navy text-white border-navy"
                            : disabled
                            ? "opacity-40 bg-surface-muted border-surface-border cursor-not-allowed"
                            : "bg-white text-ink border-surface-border hover:border-navy/30"
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>

                {/* Value definition tooltip area — fixed height prevents layout shift */}
                <div className="h-[5.5rem] mb-4 flex items-start">
                  {hoveredValue ? (
                    <div className="w-full rounded-xl bg-teal/5 border border-teal/20 px-4 py-3 text-sm text-ink-muted">
                      <span className="font-semibold text-ink">{hoveredValue}: </span>
                      {VALUES_WITH_DEFINITIONS[hoveredValue] || ""}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted/50 px-1 pt-1">Hover over a value to learn more</p>
                  )}
                </div>

                {selectedValues.length > 0 && (
                  <div className="space-y-4 mb-5">
                    <p className="text-sm font-medium text-ink">
                      Optionally, add a sentence about why each one matters to you:
                    </p>
                    {selectedValues.map((val) => (
                      <div key={val}>
                        <label className="block text-sm font-medium text-navy mb-0.5">{val}</label>
                        {VALUES_WITH_DEFINITIONS[val] && (
                          <p className="text-xs text-ink-muted mb-1.5 leading-relaxed">
                            {VALUES_WITH_DEFINITIONS[val]}
                          </p>
                        )}
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder={`What does ${val} mean to you? (optional)`}
                          value={valueReasons[val] || ""}
                          onChange={(e) =>
                            setValueReasons({ ...valueReasons, [val]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmitValues || submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? "Saving…" : "Save my values"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── CHALLENGE ─── */}
        {activity.type === "challenge" && (
          <div data-animate="2">
            {showDebrief ? (
              <div>
                <div className="card p-5 mb-5 border-l-4" style={{ borderLeftColor: "#C8982A" }}>
                  <p className="text-xs font-semibold text-gold mb-2 uppercase tracking-wide">
                    Weekly challenge — check in
                  </p>
                  <p className="text-ink text-sm leading-relaxed">
                    {existingChallenge?.challenge_text}
                  </p>
                </div>

                {debriefSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-medium text-navy mb-2">Well done.</p>
                    <p className="text-sm text-ink-muted mb-6">Your reflection has been saved.</p>
                    <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-ink mb-1">What happened? What did you notice?</p>
                    <p className="text-sm text-ink-muted mb-4">
                      It&apos;s okay if it didn&apos;t go perfectly, or if you only partly did it. What did the experience tell you?
                    </p>
                    <textarea
                      className="journal-textarea mb-3"
                      rows={6}
                      value={challengeDebrief}
                      onChange={(e) => setChallengeDebrief(e.target.value)}
                      placeholder="Be honest. It's okay if you didn't do it — just write about what got in the way."
                    />
                    <button
                      onClick={handleDebriefSubmit}
                      disabled={!challengeDebrief.trim() || submitting}
                      className="btn btn-primary w-full"
                    >
                      {submitting ? "Saving…" : "Save reflection"}
                    </button>
                  </div>
                )}
              </div>
            ) : submitted ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">🎯</div>
                <h2
                  className="text-xl text-navy mb-4"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
                >
                  Challenge accepted.
                </h2>
                <div className="card p-5 mb-6 text-left">
                  <p className="text-sm text-ink leading-relaxed">{activity.prompt}</p>
                </div>
                <p className="text-sm text-ink-muted mb-6">
                  Come back in a week to reflect on how it went.
                </p>
                <Link href="/dashboard" className="btn btn-primary">Back to dashboard</Link>
              </div>
            ) : (
              <div>
                <div
                  className="rounded-2xl p-6 mb-6 text-white text-center"
                  style={{ background: "#C8982A" }}
                >
                  <div className="text-3xl mb-3">🎯</div>
                  <p
                    className="text-xl mb-3"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontStyle: "italic" }}
                  >
                    Your challenge this week
                  </p>
                  <p className="text-white/90 leading-relaxed">{activity.prompt}</p>
                </div>
                <p className="text-sm text-ink-muted text-center mb-5 leading-relaxed">
                  Come back in 7 days to reflect on what happened.
                  The reflection is the important part.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? "Starting challenge…" : "Accept this challenge"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
