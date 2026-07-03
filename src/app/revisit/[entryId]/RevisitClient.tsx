"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MISSIONS } from "@/lib/missions";
import { formatDate, truncate } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";

const ACTIVITY_LABELS: Record<string, string> = {
  "strengths-mapping": "Strengths Mapping",
  "values-clarifier": "Values Clarifier",
  "mask-check": "The Mask Check",
  "identity-letter": "Identity Letter",
  "weekly-challenge": "Weekly Challenge",
  "what-matters": "What Matters",
  "contribution-map": "The Contribution Map",
  "the-other-side": "The Other Side",
  "commitment-statement": "Commitment Statement",
  "purpose-challenge": "Weekly Challenge",
  belonging: "Where You Belong",
  "fitting-in-vs-belonging": "Fitting In vs. Belonging",
  "across-the-gap": "Across the Gap",
  "people-who-shaped-you": "The People Who Shaped You",
  "connection-challenge": "Weekly Challenge",
  "future-self": "Future Self",
  "digital-self": "Digital Self",
  "the-through-line": "The Through-Line",
  "meaning-letter": "A Life Worth Building",
  "meaning-challenge": "Weekly Challenge",
};

const REVISIT_PROMPTS = [
  "Does this still feel true? Has anything happened in the last couple of weeks that tested it?",
  "Can you think of a moment where this showed up in your actual life — or where it didn't?",
  "Would you keep this commitment as it is, adjust it, or let it go? What's making you say that?",
];

type OriginalEntry = {
  id: string;
  mission_id: number;
  activity_id: string;
  prompt: string;
  response: string;
  created_at: string;
};

export default function RevisitClient({
  entry,
  userId,
}: {
  entry: OriginalEntry;
  userId: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;
  const router = useRouter();

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mission = MISSIONS.find((m) => m.id === entry.mission_id);
  const activityLabel = ACTIVITY_LABELS[entry.activity_id] || entry.activity_id;

  async function handleSubmit() {
    if (!response.trim()) return;
    setSubmitting(true);
    setSaveError(null);

    const { error } = await db.from("journal_entries").insert({
      user_id: userId,
      mission_id: entry.mission_id,
      activity_id: `${entry.activity_id}-revisit`,
      prompt: `Revisit: ${entry.prompt}`,
      response: response.trim(),
      is_milestone: false,
    });

    if (error) {
      setSaveError("Couldn't save your reflection — your writing is still here. Try again.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 11L5 7l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Dashboard
        </Link>

        {done ? (
          <div className="text-center py-12" data-animate="1">
            <div className="text-4xl mb-4">✓</div>
            <h2
              className="text-2xl text-navy mb-3"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              Good check-in.
            </h2>
            <p className="text-sm text-ink-muted mb-8 leading-relaxed max-w-sm mx-auto">
              Revisiting your commitments is how they become real — not just
              words on a screen.
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
            {/* Header */}
            <div className="mb-6" data-animate="1">
              <div className="text-xs font-medium text-ink-muted mb-1">
                Checking back in
              </div>
              <h1
                className="text-2xl text-navy mb-2"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
              >
                Does this still hold?
              </h1>
            </div>

            {/* Original entry card */}
            <div
              className="rounded-xl p-5 mb-6 border"
              style={{
                background: mission ? `${mission.colour}06` : "rgba(27,58,92,0.03)",
                borderColor: mission ? `${mission.colour}25` : "rgba(27,58,92,0.12)",
              }}
              data-animate="1"
            >
              <div className="flex items-center gap-2 mb-2">
                {mission && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${mission.colour}18`,
                      color: mission.colour,
                    }}
                  >
                    {mission.title}
                  </span>
                )}
                <span className="text-xs text-ink-muted">
                  {activityLabel} · {formatDate(entry.created_at)}
                </span>
              </div>
              <p className="text-xs text-ink-muted italic mb-2 leading-relaxed">
                {entry.prompt}
              </p>
              <p className="text-sm text-ink leading-relaxed">
                &ldquo;{truncate(entry.response, 200)}&rdquo;
              </p>
            </div>

            {/* Evaluation cycle prompts */}
            <div className="card p-5 mb-5" data-animate="2">
              <p className="text-sm font-medium text-ink mb-3">
                Take a moment with these:
              </p>
              <ol className="space-y-3">
                {REVISIT_PROMPTS.map((prompt, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sage/20 text-sage flex items-center justify-center text-xs font-semibold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-ink leading-relaxed">{prompt}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Reflection textarea */}
            <div data-animate="2">
              <textarea
                className="journal-textarea mb-3"
                rows={7}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write whatever feels honest right now. There's no wrong answer."
                autoFocus
              />

              {saveError && (
                <p role="alert" className="text-sm text-red-600 mb-3">{saveError}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!response.trim() || submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? "Saving…" : saveError ? "Try again" : "Save this reflection"}
              </button>

              <p className="text-xs text-ink-muted text-center mt-3">
                This gets added to your private journal.
              </p>
            </div>

            {/* Skip link */}
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-xs text-ink-muted hover:text-ink transition-colors"
              >
                Not ready to revisit this yet
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
