"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MISSIONS, getActivityLabel } from "@/lib/missions";
import { formatDate } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import ScaffoldedInput from "@/components/ScaffoldedInput";
import {
  revisitEligibility,
  revisitPrompts,
  revisitScaffold,
  revisitActivityId,
  elapsedLabel,
  agoLabel,
  daysBetween,
  MIN_DAYS_BETWEEN_REVISITS,
  type RevisitChain,
} from "@/lib/revisit";

/**
 * Reading your own arc, then adding to it. The whole intervention is that the
 * comparison is against yourself — never a peer, never a target, never a score.
 * Which is also why "nothing has changed" has to be an acceptable answer: an
 * exercise that only accepts growth teaches students to invent it.
 */
export default function RevisitClient({
  chain,
  userId,
  ready,
}: {
  chain: RevisitChain;
  userId: string;
  ready: boolean;
}) {
  const db = createClient() as any;
  const router = useRouter();

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { original, revisits } = chain;
  const mission = MISSIONS.find((m) => m.id === original.mission_id);
  const activityLabel = getActivityLabel(original.activity_id);
  const accent = mission?.colour || "var(--navy)";

  const eligibility = revisitEligibility(chain);
  const sinceOriginal = daysBetween(original.created_at, new Date());
  const prompts = revisitPrompts(sinceOriginal, revisits.length > 0);
  const scaffold = revisitScaffold(sinceOriginal);

  async function handleSubmit() {
    if (!response.trim()) return;
    setSubmitting(true);
    setSaveError(null);

    const { error } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: original.mission_id,
      activity_id: revisitActivityId(original.activity_id),
      prompt: `Revisit: ${original.prompt}`,
      response: response.trim(),
      is_milestone: false,
      revisit_of: original.id,
    });

    if (error) {
      setSaveError(
        /revisit_of|column|schema cache/i.test(error.message || "")
          ? "This isn't switched on yet — that's a fix on our side, not yours."
          : "Couldn't save your reflection — your writing is still here. Try again."
      );
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M9 11L5 7l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Journal
        </Link>

        {done ? (
          <div className="text-center py-12" data-animate="1">
            <div className="text-4xl mb-4">✓</div>
            <h2
              className="text-2xl text-navy mb-3"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Added to the thread.
            </h2>
            <p className="text-sm text-ink-muted mb-8 leading-relaxed max-w-sm mx-auto">
              That&apos;s {revisits.length + 1}{" "}
              {revisits.length === 0 ? "look" : "looks"} back at this one. In a
              few months it&apos;ll be worth reading the whole thing again.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/journal" className="btn btn-secondary">
                See your journal
              </Link>
              <Link href="/dashboard" className="btn btn-primary">
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6" data-animate="1">
              <div className="text-xs font-medium text-ink-muted mb-1">
                {revisits.length === 0
                  ? "Checking back in"
                  : `Looking back · ${revisits.length + 1}${revisits.length === 0 ? "st" : revisits.length === 1 ? "nd" : revisits.length === 2 ? "rd" : "th"} time`}
              </div>
              <h1
                className="text-2xl text-navy mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {sinceOriginal < 45 ? "Does this still hold?" : "Is this still you?"}
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                You wrote this {agoLabel(sinceOriginal)}. Read it properly
                before you answer — the point is the comparison, not the writing.
              </p>
            </div>

            {!ready && (
              <div className="card p-4 mb-5 text-xs text-ink-muted leading-relaxed">
                Saving a new reflection isn&apos;t switched on yet. You can still
                read this back.
              </div>
            )}

            {/* The arc — original, then each revisit in order */}
            <div className="mb-6 space-y-3" data-animate="1">
              <div
                className="rounded-xl p-5 border"
                style={{ background: `${accent}06`, borderColor: `${accent}25` }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {mission && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${accent}18`, color: accent }}
                    >
                      {mission.title}
                    </span>
                  )}
                  {original.is_milestone && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold-text">
                      Milestone
                    </span>
                  )}
                  <span className="text-xs text-ink-muted">
                    {activityLabel} · {formatDate(original.created_at)}
                  </span>
                </div>
                <p className="text-xs text-ink-muted italic mb-2 leading-relaxed">
                  {original.prompt}
                </p>
                {/* Shown whole, never truncated — a comparison you can't fully
                    read isn't a comparison. */}
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {original.response}
                </p>
              </div>

              {revisits.map((r) => (
                <div key={r.id} className="pl-4 border-l-2 border-surface-border ml-2">
                  <div className="rounded-xl p-4 bg-white border border-surface-border">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal">
                        {elapsedLabel(daysBetween(original.created_at, r.created_at))}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                      {r.response}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {eligibility.ok ? (
              <>
                <div className="card p-5 mb-5" data-animate="2">
                  <p className="text-sm font-medium text-ink mb-3">
                    Take a moment with these:
                  </p>
                  <ol className="space-y-3">
                    {prompts.map((prompt, i) => (
                      <li key={prompt} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sage/20 text-sage flex items-center justify-center text-xs font-semibold mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-ink leading-relaxed">{prompt}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div data-animate="2">
                  <div className="mb-3">
                    <ScaffoldedInput
                      value={response}
                      onChange={setResponse}
                      scaffold={scaffold}
                      placeholder="Write whatever feels honest right now. There's no wrong answer — including 'nothing has changed'."
                      rows={7}
                    />
                  </div>

                  {saveError && (
                    <p role="alert" className="text-sm text-red-600 mb-3">
                      {saveError}
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!response.trim() || submitting || !ready}
                    className="btn btn-primary w-full"
                  >
                    {submitting
                      ? "Saving…"
                      : saveError
                        ? "Try again"
                        : "Save this reflection"}
                  </button>

                  <p className="text-xs text-ink-muted text-center mt-3">
                    This gets added to your private journal, under the original.
                  </p>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push("/journal")}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    Not ready to revisit this yet
                  </button>
                </div>
              </>
            ) : (
              /* Too soon — spacing is the mechanism, not an obstacle */
              <div className="card p-5" data-animate="2">
                <p className="text-sm text-ink font-medium mb-1.5">
                  Come back in {eligibility.waitDays}{" "}
                  {eligibility.waitDays === 1 ? "day" : "days"}
                </p>
                <p className="text-xs text-ink-muted leading-relaxed">
                  You last looked at this {agoLabel(eligibility.sinceDays)}.
                  Revisits are spaced {MIN_DAYS_BETWEEN_REVISITS} days apart
                  because nothing much changes in a week — and answering
                  &ldquo;same as before&rdquo; over and over teaches you the
                  question is pointless, which it isn&apos;t.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
