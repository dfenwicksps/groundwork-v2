"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";
import CharacterCodeBuilder from "./CharacterCodeBuilder";
import BecomingQualities from "@/components/BecomingQualities";
import { ValueBehaviours, LinesBuilder } from "./ArtefactBuilders";
import {
  DAY_LABELS,
  PROGRAM_WEEKS,
  isWeekComplete,
  artefactComplete,
  artefactTarget,
  commitmentToLines,
  commitmentToPairs,
  linesToCommitment,
  pairsToCommitment,
  WEEK_REFLECTION_SCAFFOLDS,
  ARTEFACT_SCAFFOLDS,
  commitmentScaffold,
  type ProgramWeek,
  type WeekProgress,
} from "@/lib/program";
import { STRENGTH_BY_KEY } from "@/lib/strengths";
import { QUALITIES_COUNT, type Becoming } from "@/lib/becoming";
import { withReturn } from "@/lib/returnTo";
import type { YearLevel } from "@/lib/yearLevel";
import ScaffoldedInput, { TierSwitcher } from "@/components/ScaffoldedInput";

/**
 * One week of the program: the question to sit with, the existing tool that
 * does its inner work, and the challenge that has to be lived. The tracker is
 * a record and never a streak — an unticked day is simply unticked, and the
 * week can still be completed with gaps in it.
 */
export interface Compass {
  /** Display names of the top five VIA strengths */
  strengths: string[];
  /** The same five as keys, for comparison against the week 1 picker */
  strengthKeys: string[];
  /** The five values chosen in Mission 1 */
  values: string[];
}

export default function WeekClient({
  userId,
  week,
  progress,
  savedCode,
  compass,
  becoming,
  sourceEntry,
  capstone,
  suggestedQualities,
  earlier,
  yearLevel,
  ready,
}: {
  userId: string;
  week: ProgramWeek;
  /** Only affects the register of the commitment examples — see program.ts */
  yearLevel: YearLevel;
  progress: WeekProgress | null;
  savedCode: string[];
  /** What the missions already produced — shown, not linked to */
  compass: Compass;
  /** The shared "Who I'm becoming" record — week 1's artefact lives here */
  becoming: Becoming;
  /** For a week built on a mission entry: what the student wrote there */
  sourceEntry: string | null;
  /** Week 10 only: mission writing the Character Code should be built from */
  capstone: {
    activityId: string;
    missionId: number;
    label: string;
    note: string;
    href: string;
    excerpt: string | null;
  }[];
  /** VIA keys the habit check flagged, for week 1's picker */
  suggestedQualities: string[];
  /** Week 10 only: the artefacts weeks 1, 2, 7 and 8 made */
  earlier: { week: number; heading: string; items: string[] }[];
  ready: boolean;
}) {
  const router = useRouter();
  const db = createClient() as any;

  const [days, setDays] = useState<number[]>(progress?.days ?? []);
  const [commitment, setCommitment] = useState(progress?.commitment ?? "");
  const [reflection, setReflection] = useState(progress?.reflection ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const target = week.challenge.target ?? 1;
  const isTracked = week.challenge.kind !== "single";
  // Weeks 4 and 5 name a promise; the artefact weeks use the same column for
  // a list, so the free-text commitment box is only for the former.
  const needsCommitment = !!week.challenge.commitmentPrompt && !week.artefact;
  const done = isWeekComplete(week, progress ?? undefined);
  // Read from local state, not the server prop, so the reflection unlocks the
  // moment the artefact is saved rather than on the next navigation.
  //
  // Week 1's artefact is the shared "Who I'm becoming" record rather than this
  // week's own column, so it can already exist — set from the profile — before
  // this week has any row at all. Asking such a student to "make the 5 above
  // first" when the five are visible above would be plainly wrong.
  const artefactDoneNow =
    week.artefact?.kind === "qualities"
      ? becoming.qualities.length >= QUALITIES_COUNT
      : artefactComplete(week, {
          ...(progress ?? ({} as WeekProgress)),
          commitment,
        });
  // `commitment` holds the saved artefact for these weeks, so read it back
  // through the shape the week expects.
  const savedLines = week.artefact ? commitmentToLines(commitment) : [];
  const savedPairs =
    week.artefact?.kind === "value-behaviours"
      ? commitmentToPairs(commitment).filter((x) => x.value)
      : [];
  // The qualities picker takes taps, not writing, so week 1 still needs the
  // switcher down at the reflection. The other two builders don't.
  const writingArtefactAbove =
    week.artefact?.kind === "value-behaviours" || week.artefact?.kind === "lines";
  const hasSource =
    week.source?.kind === "strengths"
      ? compass.strengths.length > 0
      : week.source?.kind === "values"
        ? compass.values.length > 0
        : week.source?.kind === "entry"
          ? !!sourceEntry?.trim()
          : true;
  const prev = PROGRAM_WEEKS.find((w) => w.week === week.week - 1);
  const next = PROGRAM_WEEKS.find((w) => w.week === week.week + 1);

  function friendly(message: string, fallback: string) {
    return /find the table|does not exist|schema cache|column/i.test(message)
      ? "This isn't switched on yet — that's a fix on our side, not yours."
      : fallback;
  }

  /** Upsert on (user_id, week) so starting and updating are the same call. */
  async function persist(patch: Record<string, unknown>, markDone = false) {
    setBusy(true);
    setError(null);
    const { error: err } = await db.from("program_progress").upsert(
      {
        user_id: userId,
        week: week.week,
        days,
        commitment: commitment.trim() || null,
        reflection: reflection.trim() || null,
        ...(markDone ? { completed_at: new Date().toISOString() } : {}),
        ...patch,
      },
      { onConflict: "user_id,week" }
    );
    setBusy(false);
    if (err) {
      setError(friendly(err.message || "", "Couldn't save — try again."));
      return false;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    return true;
  }

  async function toggleDay(i: number) {
    const nextDays = days.includes(i)
      ? days.filter((d) => d !== i)
      : [...days, i].sort((a, b) => a - b);
    setDays(nextDays);
    await persist({ days: nextDays });
  }

  /**
   * Artefacts live in the same `commitment` column as the week 4/5 promise, so
   * saving one is an ordinary persist with the state kept in step — otherwise
   * the next tick of a day would write the pre-artefact value back over it.
   */
  async function saveArtefact(value: string): Promise<boolean> {
    setCommitment(value);
    return persist({ commitment: value || null });
  }

  async function finishWeek() {
    if (!reflection.trim()) return;
    // The artefact gate only guards *completing* a week. A week finished before
    // the artefact existed is grandfathered — blocking it would leave the
    // student unable to touch a reflection the header already calls complete.
    if (!done && week.artefact && !artefactDoneNow) return;
    // Week 1 keeps a receipt of the shared record, so every server-side surface
    // (the dashboard card, the program list) can count the week complete
    // without also having to load the profile.
    const receipt =
      week.artefact?.kind === "qualities"
        ? { commitment: linesToCommitment(becoming.qualities) }
        : {};
    const ok = await persist(
      { reflection: reflection.trim(), ...receipt },
      true
    );
    if (ok) {
      // Journal copy so the week's reflection sits with everything else
      await db.from("journal_entries").insert({
        user_id: userId,
        mission_id: 1,
        activity_id: `program-week-${week.week}`,
        prompt: `Week ${week.week} — ${week.title} (${week.challenge.title})`,
        response: reflection.trim(),
        is_milestone: false,
      });
      router.refresh();
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
        {/* Header */}
        <div data-animate="1">
          <Link
            href="/program"
            className="text-xs text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1 mb-3"
          >
            ← All ten weeks
          </Link>
          <p className="text-sm text-ink-muted mb-1">
            Week {week.week} of {PROGRAM_WEEKS.length}
            {done && <span className="text-sage font-semibold"> · complete</span>}
          </p>
          <h1
            className="text-3xl text-navy mb-3"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {week.emoji} {week.title}
          </h1>
          <p className="text-sm text-ink leading-relaxed">{week.intro}</p>
        </div>

        {!ready && (
          <div className="card p-4 text-xs text-ink-muted leading-relaxed">
            Progress can&apos;t be saved yet — this is being switched on. You can
            still read the week and do the challenge.
          </div>
        )}

        {/* Questions */}
        <div data-animate="2">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Sit with these
          </h2>
          <div className="card p-5 space-y-2.5">
            {week.questions.map((q) => (
              <p key={q} className="text-sm text-ink leading-relaxed flex gap-2.5">
                <span className="text-ink-faint flex-shrink-0" aria-hidden>
                  —
                </span>
                {q}
              </p>
            ))}
          </div>
        </div>

        {/* What the missions already produced. A week built on Mission 1 shows
            that work rather than linking to it — the link was a detour for
            anyone who'd already done it, and no help at all in explaining what
            the week was going to do with it. */}
        {week.source && hasSource && (
          <div data-animate="2">
            <div className="rounded-2xl bg-white border-2 border-navy/20 p-5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-3 text-navy">
                <span aria-hidden>🧭</span>{" "}
                {week.source.kind === "entry"
                  ? `From Mission ${week.source.missionId} — your own words`
                  : "From your Mission 1 compass"}
              </div>
              {week.source.kind === "entry" ? (
                <>
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                    {week.source.recallLabel}
                  </div>
                  {/* Their own writing, not a summary of it. Clamped rather
                      than truncated so nothing is silently cut off — the whole
                      entry is one tap away. */}
                  <blockquote className="text-sm text-ink leading-relaxed border-l-2 border-navy/25 pl-3 mb-3 line-clamp-6 whitespace-pre-line">
                    {sourceEntry}
                  </blockquote>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {week.source.soWhat}
                  </p>
                </>
              ) : week.source.kind === "strengths" ? (
                <>
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                    Your signature strengths
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {compass.strengthKeys.map((k) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: "var(--navy)" }}
                      >
                        <span aria-hidden className="mr-1">
                          {STRENGTH_BY_KEY[k]?.emoji}
                        </span>
                        {STRENGTH_BY_KEY[k]?.name ?? k}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {week.source.soWhat}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                    Your values
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {compass.values.map((v) => (
                      <span
                        key={v}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border border-navy/40 text-navy"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {week.source.soWhat}
                  </p>
                </>
              )}
              <Link
                href={withReturn(week.source.href, week.week)}
                className="text-xs text-teal hover:underline mt-3 inline-block"
              >
                {week.source.kind === "entry" ? "Reread or rewrite" : "Redo"}{" "}
                {week.source.label}
              </Link>
            </div>
          </div>
        )}

        {/* Missing source: the week's first action, not a side link. */}
        {week.source && !hasSource && (
          <div data-animate="2">
            <div className="rounded-2xl border-2 border-dashed border-navy/25 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2 text-navy">
                Do this first
              </div>
              <p className="text-sm text-ink leading-relaxed mb-3">
                {week.source.whyNeeded}
              </p>
              <Link
                href={withReturn(week.source.href, week.week)}
                className="btn btn-primary w-full py-2.5 rounded-xl text-sm block text-center"
              >
                {week.source.label} →
              </Link>
            </div>
          </div>
        )}

        {/* A genuinely different tool the week points into */}
        {week.link && (
          <div data-animate="2">
            <Link
              href={withReturn(week.link.href, week.week)}
              className="card p-4 flex items-center gap-3 hover:border-navy/30 transition-all"
            >
              <span className="text-2xl flex-shrink-0" aria-hidden>
                🔗
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">
                  {week.link.label}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {week.link.note}
                </p>
              </div>
              <span className="text-ink-muted flex-shrink-0" aria-hidden>
                →
              </span>
            </Link>
          </div>
        )}

        {/* The challenge */}
        <div data-animate="3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            This week&apos;s challenge
          </h2>
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink mb-1.5">
              {week.challenge.title}
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              {week.challenge.description}
            </p>

            {/* Weeks that need the student to name their own commitment */}
            {needsCommitment && (
              <div className="mt-4">
                <p className="text-xs font-medium text-ink mb-1.5">
                  {week.challenge.commitmentPrompt}
                </p>
                <ScaffoldedInput
                  value={commitment}
                  onChange={setCommitment}
                  scaffold={commitmentScaffold(week.week, yearLevel)}
                  placeholder="Specific beats ambitious."
                  rows={2}
                />
                <button
                  onClick={() => persist({ commitment: commitment.trim() || null })}
                  disabled={!commitment.trim() || busy}
                  className="btn btn-secondary w-full py-2 rounded-xl text-xs mt-2"
                >
                  {busy ? "Saving…" : "Save this"}
                </button>
              </div>
            )}

            {/* Tracker — a record, not a streak */}
            {isTracked && (!needsCommitment || (progress?.commitment ?? "").trim()) && (
              <div className="mt-5 pt-4 border-t border-surface-border">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    {week.challenge.kind === "daily"
                      ? "The week"
                      : `${week.challenge.unit ?? "session"}s`}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {days.length} of {target}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: target }).map((_, i) => {
                    const on = days.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        disabled={busy || !ready}
                        aria-pressed={on}
                        aria-label={
                          week.challenge.kind === "daily"
                            ? `Day ${i + 1}`
                            : `${week.challenge.unit ?? "session"} ${i + 1}`
                        }
                        className={`flex-1 aspect-square max-w-[52px] rounded-xl border text-sm font-semibold transition-all ${
                          on
                            ? "bg-sage text-white border-sage"
                            : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
                        }`}
                      >
                        {on
                          ? "✓"
                          : week.challenge.kind === "daily"
                            ? DAY_LABELS[i]
                            : i + 1}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-ink-muted mt-2 leading-relaxed">
                  A missed one is just a missed one — no streak to break. Tick
                  them honestly or the record is worth nothing.
                </p>
              </div>
            )}

            {isTracked && needsCommitment && !(progress?.commitment ?? "").trim() && (
              <p className="text-[11px] text-ink-muted mt-3 leading-relaxed">
                Name your{" "}
                {week.week === 4 ? "promise" : "hill"} above first — tracking it
                before you&apos;ve decided what it is defeats the point.
              </p>
            )}
          </div>
        </div>

        {/* The thing the week makes. Previously these weeks said "write them
            somewhere you'll see them" — so the artefact left the app, and
            week 10's "look back at your week 1 five qualities" pointed at
            nothing the app could show. */}
        {/* Week 1's challenge is the profile's "Who I'm becoming" — one
            artefact, two doors. It reads and writes the shared record, and
            hands this week a completion receipt on the way through. */}
        {week.artefact?.kind === "qualities" && (
          <BecomingQualities
            userId={userId}
            saved={becoming}
            currentTop={compass.strengthKeys}
            suggested={suggestedQualities}
            variant="program"
            strengthsHref={withReturn(
              "/missions/1/activities/strengths-mapping",
              week.week
            )}
            disabled={!ready}
            onSaved={(keys) => saveArtefact(linesToCommitment(keys))}
          />
        )}

        {/* Nothing to build until the values exist, and the "do this first"
            banner above is already the action — a second copy of the same
            call to action is the redundancy this rework is removing. */}
        {week.artefact?.kind === "value-behaviours" && hasSource && (
          <ValueBehaviours
            heading={week.artefact.heading}
            blurb={week.artefact.blurb}
            values={compass.values}
            valuesHref={withReturn(
              week.source?.href ?? "/missions/1/activities/values-clarifier",
              week.week
            )}
            saved={savedPairs}
            busy={busy}
            disabled={!ready}
            onSave={(pairs) => saveArtefact(pairsToCommitment(pairs))}
          />
        )}

        {week.artefact?.kind === "lines" && (
          <LinesBuilder
            heading={week.artefact.heading}
            blurb={week.artefact.blurb}
            count={week.artefact.count}
            placeholders={week.artefact.placeholders}
            scaffold={ARTEFACT_SCAFFOLDS[week.week]}
            saved={savedLines}
            busy={busy}
            disabled={!ready}
            onSave={(lines) => saveArtefact(linesToCommitment(lines))}
          />
        )}

        {/* Week 10 reads back what the earlier weeks made, so the code is
            written from evidence rather than from memory. */}
        {week.week === 10 && earlier.length > 0 && (
          <div data-animate="3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              What you already wrote down
            </h2>
            <div className="space-y-2">
              {earlier.map((e) => (
                <div key={e.week} className="card p-4">
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                    Week {e.week} · {e.heading}
                  </div>
                  <ul className="space-y-1">
                    {e.items.map((item, i) => (
                      <li key={i} className="text-sm text-ink leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed mt-2">
              Your code should be recognisable from this. If none of it made the
              cut, that&apos;s worth a second look before you write.
            </p>
          </div>
        )}

        {/* The other half of the evidence. The weeks supply behaviour; these
            two mission steps supply what the student said they stand for and
            the thread they found — writing the app had never read again. */}
        {week.week === 10 && capstone.length > 0 && (
          <div data-animate="3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              And what you wrote in the missions
            </h2>
            <div className="space-y-2">
              {capstone.map((c) => (
                <div key={c.activityId} className="card p-4">
                  <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                    {c.note}
                  </div>
                  <div className="text-sm font-semibold text-ink mb-1.5">
                    {c.label}
                  </div>
                  <blockquote className="text-sm text-ink leading-relaxed border-l-2 border-navy/25 pl-3 line-clamp-6 whitespace-pre-line">
                    {c.excerpt}
                  </blockquote>
                  <Link
                    href={withReturn(c.href, week.week)}
                    className="text-xs text-teal hover:underline mt-2 inline-block"
                  >
                    Read it in full →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week 10 writes the artefact instead of a plain reflection */}
        {week.week === 10 ? (
          <CharacterCodeBuilder
            userId={userId}
            saved={savedCode}
            onSaved={async (commitments) => {
              // The code itself is the week's reflection — record it so week 10
              // completes and the program reads 10 of 10.
              await persist(
                { reflection: commitments.join("\n") },
                true
              );
            }}
          />
        ) : (
          <div data-animate="4">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              End of the week
            </h2>
            <div className="card p-5">
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                What actually happened? What surprised you? Honest beats tidy.
              </p>
              {/* The tier is page-wide state, so two switchers on one screen
                  are two controls for one setting. The artefact builders above
                  already render one when they take written answers. */}
              {!writingArtefactAbove && <TierSwitcher className="mb-4" />}
              <ScaffoldedInput
                value={reflection}
                onChange={setReflection}
                scaffold={WEEK_REFLECTION_SCAFFOLDS[week.week]}
                placeholder="What did doing this for a week teach you about yourself?"
                rows={4}
              />
              {error && (
                <p role="alert" className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}
              <button
                onClick={finishWeek}
                disabled={
                  !reflection.trim() ||
                  busy ||
                  !ready ||
                  (!done && !!week.artefact && !artefactDoneNow)
                }
                className="btn btn-primary w-full py-2.5 rounded-xl text-sm mt-3"
              >
                {busy
                  ? "Saving…"
                  : done
                    ? "Update my reflection"
                    : "Finish this week ✓"}
              </button>
              {saved && (
                <p className="text-[11px] text-sage text-center mt-2 font-medium">
                  Saved.
                </p>
              )}
              {week.artefact && !artefactDoneNow && (
                <p className="text-[11px] text-ink-muted text-center mt-2 leading-relaxed">
                  {done
                    ? `You finished this week before this part existed. Making the ${artefactTarget(week)} above is worth doing anyway — week 10 reads them back.`
                    : `Make the ${artefactTarget(week)} above first — reflecting on something you haven't made yet is the habit this program is trying to break.`}
                </p>
              )}
              {isTracked && days.length < target && (
                <p className="text-[11px] text-ink-muted text-center mt-2">
                  You can finish the week with {days.length} of {target} ticked —
                  it just means less to reflect on.
                </p>
              )}
            </div>
          </div>
        )}

        {error && week.week === 10 && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Week to week */}
        <div className="flex gap-2 pt-2 border-t border-surface-border">
          {prev ? (
            <Link
              href={`/program/${prev.week}`}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              ← Week {prev.week}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next && (
            <Link
              href={`/program/${next.week}`}
              className="btn btn-secondary flex-1 py-2.5 rounded-xl text-sm"
            >
              Week {next.week} →
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
