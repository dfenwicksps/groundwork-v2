"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  LIFE_STAGE_OPTIONS,
  hasLeftSchool,
  setLifeStageCookie,
  type LifeStage,
} from "@/lib/lifeStage";
import VersionOfMeFilm from "@/components/stories/VersionOfMeFilm";
import SupportCard from "@/components/help/SupportCard";
import { markStoryActioned } from "@/lib/storyEngagement";
import { mentionsCrisis } from "@/lib/help";

const WHY_OPTIONS = [
  {
    value: "exploring",
    label: "Exploring myself",
    icon: "🧭",
    sub: "Curious about who I am and what I value",
  },
  {
    value: "lost",
    label: "Feeling a bit lost",
    icon: "🌊",
    sub: "Not sure where I'm headed right now",
  },
  {
    value: "direction",
    label: "Wanting more direction",
    icon: "🎯",
    sub: "I know what I want — I need help getting there",
  },
  {
    value: "curious",
    label: "Just curious",
    icon: "✨",
    sub: "Saw this and thought it looked interesting",
  },
];

// The story screen's one question. It follows Priya's story, so it asks the same
// thing of the student, as a tap rather than a blank box.
const GAP_QUESTION = "Where's the biggest gap between the real you and the version you show?";

function gapOptions(stage: LifeStage | null): string[] {
  return [
    stage && hasLeftSchool(stage) ? "Between home and work or uni" : "Between home and school",
    "Between friends and family",
    "Between online and in person",
    "Around people I've only just met",
    "I'm pretty much the same everywhere",
  ];
}

/**
 * Two screens. The first asks the three things the app tailors itself by and
 * creates the profile. The second is a real piece of Groundwork: a one-minute
 * story and one question about it, so a new student reaches the actual thing
 * within about a minute of signing up.
 *
 * What used to sit between them moved to where it's used. Values are chosen
 * properly in Mission 1's Values Clarifier; a trusted person is added from the
 * dashboard or the Support page. The "how you like to work" questions only
 * ever decided whether one activity opened its "why it matters" note, which is
 * one tap away for everyone.
 */
export default function OnboardingClient({ storyId }: { storyId: string | null }) {
  const router = useRouter();
  const TOTAL_STEPS = storyId ? 2 : 1;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null);
  const [whyHere, setWhyHere] = useState("");

  // Step 2
  const [gap, setGap] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [supportNeeded, setSupportNeeded] = useState(false);

  // Carry the name from signup so nobody types it twice. Still editable, which
  // quietly makes the point that you can go by whatever you like here.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        const fromSignup =
          (user?.user_metadata?.full_name as string | undefined) ??
          (user?.user_metadata?.name as string | undefined);
        if (fromSignup) setName(fromSignup.split(" ")[0]);
      });
  }, []);

  /** Creates the profile at the end of step 1, so the story is a bonus, not a gate. */
  async function saveProfile() {
    setLoading(true);
    setFinishError(null);
    const db = createClient() as any;
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    // Ensure the user row exists and mark onboarding complete in a single
    // upsert. The auto-create trigger may not have run for this account; a
    // plain update would silently affect zero rows and loop the user back to
    // onboarding. Upserting also guarantees the row exists before the
    // onboarding_results insert below, which has a FK on users(id).
    const { error: userErr } = await db
      .from("users")
      .upsert(
        {
          id: user.id,
          onboarding_complete: true,
          ...(name.trim() ? { display_name: name.trim() } : {}),
        },
        { onConflict: "id" }
      );
    if (userErr) {
      setLoading(false);
      setFinishError(
        "Something went wrong saving your profile — check your connection and try again."
      );
      return;
    }

    // Separate from the upsert above so a database without the life_stage
    // column can't block onboarding. The cookie set on tap still carries it.
    if (lifeStage) {
      await db.from("users").update({ life_stage: lifeStage }).eq("id", user.id);
    }

    // Non-fatal: the profile is already marked complete.
    const { error: resultsErr } = await db.from("onboarding_results").insert({
      user_id: user.id,
      why_here: whyHere,
      values: [],
    });
    if (resultsErr) console.error("Failed to save onboarding results:", resultsErr.message);

    setLoading(false);
    if (storyId) setStep(2);
    else router.push("/dashboard");
  }

  async function saveAnswer() {
    if (!gap || !storyId) return;
    setSaving(true);
    const db = createClient() as any;
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user) {
      const { error } = await db.from("journal_entries").insert({
        user_id: user.id,
        mission_id: 1,
        activity_id: "story-reflection",
        prompt: GAP_QUESTION,
        response: note.trim() ? `${gap}\n${note.trim()}` : gap,
      });
      if (!error) markStoryActioned(storyId);
    }
    setSaving(false);
    // Someone who writes something alarming in their first minute sees help
    // before anything else, and moves on when they choose to.
    if (mentionsCrisis(note)) {
      setSupportNeeded(true);
      return;
    }
    router.push("/dashboard");
  }

  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
          <span>Getting started</span>
          <span>{step} of {TOTAL_STEPS}</span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
          <div className="progress-fill" style={{ width: progressWidth }} />
        </div>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-semibold">G</span>
        </div>
        <span
          className="font-semibold text-navy text-lg"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Groundwork
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
            >
              Let&apos;s start with you.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Three quick questions, then a one-minute story. That&apos;s it.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Where are you at right now?
                </label>
                {([
                  ["school", "At school", "grid-cols-3"],
                  ["left", "Finished school", "grid-cols-2"],
                ] as const).map(([group, heading, cols]) => (
                  <div key={group} className="mb-2">
                    <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                      {heading}
                    </div>
                    <div className={cn("grid gap-2", cols)}>
                      {LIFE_STAGE_OPTIONS.filter((o) => o.group === group).map((y) => (
                        <button
                          key={y.key}
                          type="button"
                          onClick={() => {
                            setLifeStage(y.key);
                            setLifeStageCookie(y.key);
                          }}
                          aria-pressed={lifeStage === y.key}
                          className={cn(
                            "px-2 py-3 rounded-xl border text-center transition-all",
                            lifeStage === y.key
                              ? "border-teal bg-teal/5 ring-1 ring-teal"
                              : "border-surface-border bg-white hover:border-teal/40"
                          )}
                          style={{ borderWidth: "1.5px" }}
                        >
                          <div className="text-sm font-semibold text-ink whitespace-nowrap">
                            {lifeStage === y.key && <span aria-hidden>✓ </span>}
                            {y.label}
                          </div>
                          <div className="text-[11px] text-ink-muted mt-0.5">{y.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-ink-muted mt-1.5">
                  We&apos;ll tailor what we show you — you can change this later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="input"
                />
                <p className="text-[11px] text-ink-muted mt-1.5">
                  A nickname is fine — this is just what the app calls you.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-3">
                  What brings you here?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {WHY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWhyHere(opt.value)}
                      aria-pressed={whyHere === opt.value}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-1.5 transition-all",
                        "flex items-center gap-3",
                        whyHere === opt.value
                          ? "border-teal bg-teal/5 ring-1 ring-teal"
                          : "border-surface-border bg-white hover:border-teal/40"
                      )}
                      style={{ borderWidth: "1.5px" }}
                    >
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-ink text-sm">
                          {opt.label}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {opt.sub}
                        </div>
                      </div>
                      {whyHere === opt.value && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                          <svg aria-hidden="true"
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <path
                              d="M1.5 4L3 5.5L6.5 2"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {finishError && (
              <p role="alert" className="text-sm text-red-600 mt-4">
                {finishError}
              </p>
            )}
            <button
              onClick={saveProfile}
              disabled={!whyHere || loading}
              className="btn btn-primary w-full mt-6"
            >
              {loading ? "Setting up your account…" : "Next"}
            </button>
            {!whyHere && (
              <p className="text-xs text-ink-muted text-center mt-2">
                Choose what brings you here to continue.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — the first real thing: a story, then one question about it */}
      {step === 2 && storyId && (
        <div className="w-full max-w-md animate-fade-up">
          <h1
            className="text-2xl text-navy mb-2"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            One minute, one story.
          </h1>
          <p className="text-ink-muted text-sm mb-5">
            Priya&apos;s story sets up your first mission. Watch it, then answer one
            quick question.
          </p>

          <VersionOfMeFilm storyId={storyId} />

          <div className="card p-6">
            {supportNeeded ? (
              <>
                <SupportCard />
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn btn-primary w-full"
                >
                  Go to my dashboard
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-ink mb-3">{GAP_QUESTION}</p>
                <div className="space-y-2">
                  {gapOptions(lifeStage).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGap(opt)}
                      aria-pressed={gap === opt}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                        gap === opt
                          ? "border-teal bg-teal/5 ring-1 ring-teal text-ink"
                          : "border-surface-border bg-white text-ink hover:border-teal/40"
                      )}
                      style={{ borderWidth: "1.5px" }}
                    >
                      {gap === opt && <span aria-hidden>✓ </span>}
                      {opt}
                    </button>
                  ))}
                </div>
                {gap && (
                  <div className="mt-3">
                    <label htmlFor="gap-note" className="block text-xs text-ink-muted mb-1.5">
                      Want to say more? Optional.
                    </label>
                    <textarea
                      id="gap-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="input"
                      placeholder="Only you will see this."
                    />
                  </div>
                )}
                <button
                  onClick={saveAnswer}
                  disabled={!gap || saving}
                  className="btn btn-primary w-full mt-5"
                >
                  {saving ? "Saving…" : "Save and go to my dashboard"}
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="block w-full text-center text-sm text-ink-muted hover:text-ink mt-3"
                >
                  Skip for now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
