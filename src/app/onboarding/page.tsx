"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { type ProcessingStyle, setProcessingStyle, tallyStyle } from "@/lib/processingStyle";
import { ONBOARDING_VALUES, VALUES_WITH_DEFINITIONS } from "@/lib/missions";

const STYLE_QUESTIONS: {
  id: string;
  question: string;
  options: { label: string; style: ProcessingStyle }[];
}[] = [
  {
    id: "q1",
    question: "When you're working something out...",
    options: [
      { label: "I like to dig in and understand it from all angles", style: "informational" },
      { label: "I find it easier with clear steps or someone to guide me", style: "normative" },
      { label: "I usually need to sit with it for a while first", style: "diffuse-avoidant" },
    ],
  },
  {
    id: "q2",
    question: "Starting new things feels...",
    options: [
      { label: "Interesting — I want to know why I'm doing it", style: "informational" },
      { label: "Better with structure — I like knowing the plan", style: "normative" },
      { label: "Hard sometimes — I can struggle to get going", style: "diffuse-avoidant" },
    ],
  },
  {
    id: "q3",
    question: "Be honest — coming here today...",
    options: [
      { label: "I'm genuinely curious to understand myself better", style: "informational" },
      { label: "I'm hoping there's a clear process I can follow", style: "normative" },
      { label: "Part of me isn't sure I'm ready to start", style: "diffuse-avoidant" },
    ],
  },
];

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

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [whyHere, setWhyHere] = useState("");
  const [styleAnswers, setStyleAnswers] = useState<Record<string, ProcessingStyle>>({});

  // Step 2
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  // Step 3
  const [supportName, setSupportName] = useState("");
  const [supportRelationship, setSupportRelationship] = useState("");

  function toggleValue(val: string) {
    if (selectedValues.includes(val)) {
      setSelectedValues(selectedValues.filter((v) => v !== val));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, val]);
    }
  }

  const hoveredValueDefinition = hoveredValue ? VALUES_WITH_DEFINITIONS[hoveredValue] : null;

  async function handleFinish(skip: boolean = false) {
    setLoading(true);
    setFinishError(null);
    const db = createClient() as any;
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/auth");
      return;
    }

    // Detect and persist processing style from the 3 style questions
    const votes = Object.values(styleAnswers);
    if (votes.length > 0) {
      setProcessingStyle(tallyStyle(votes));
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
          ...(name ? { display_name: name } : {}),
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

    // Save onboarding results
    const { error: resultsErr } = await db.from("onboarding_results").insert({
      user_id: user.id,
      why_here: whyHere,
      values: selectedValues,
    });
    if (resultsErr) {
      // Non-fatal: the profile is already marked complete, so don't block the
      // user from continuing — just log it.
      console.error("Failed to save onboarding results:", resultsErr.message);
    }

    // Save support circle contact if provided
    if (!skip && supportName && supportRelationship) {
      await db.from("support_circle").insert({
        user_id: user.id,
        name: supportName,
        relationship: supportRelationship,
      });
    }

    router.push("/dashboard");
  }

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
          <span>Getting started</span>
          <span>{step} of 3</span>
        </div>
        <div className="progress-bar">
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
          style={{ fontFamily: "'Fraunces', serif" }}
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
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              Let&apos;s start with you.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Just a couple of quick things before we get into it.
            </p>

            <div className="space-y-5">
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
                          <svg
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

            {/* Style detection questions — appear after "why here" is chosen */}
            {whyHere && (
              <div className="space-y-5 pt-2 border-t border-surface-border mt-2">
                <p className="text-xs text-ink-muted pt-3">
                  Two more quick ones — helps us tailor how things are presented.
                </p>
                {STYLE_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-ink mb-2">
                      {q.question}
                    </label>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt.style}
                          type="button"
                          onClick={() =>
                            setStyleAnswers((prev) => ({ ...prev, [q.id]: opt.style }))
                          }
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm",
                            styleAnswers[q.id] === opt.style
                              ? "border-teal bg-teal/5 ring-1 ring-teal text-ink"
                              : "border-surface-border bg-white text-ink-muted hover:border-teal/40"
                          )}
                          style={{ borderWidth: "1.5px" }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!whyHere || Object.keys(styleAnswers).length < STYLE_QUESTIONS.length}
              className="btn btn-primary w-full mt-6"
            >
              Next
            </button>
            {/* Tell the user WHY Next is disabled instead of leaving them guessing */}
            {(!whyHere || Object.keys(styleAnswers).length < STYLE_QUESTIONS.length) && (
              <p className="text-xs text-ink-muted text-center mt-2">
                {!whyHere
                  ? "Choose what brings you here to continue."
                  : `Answer ${STYLE_QUESTIONS.length - Object.keys(styleAnswers).length} more question${STYLE_QUESTIONS.length - Object.keys(styleAnswers).length === 1 ? "" : "s"} above to continue.`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              What matters most to you?
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Choose 3 values that feel genuinely true for you right now — not
              the ones you think you should have.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {ONBOARDING_VALUES.map((label) => {
                const selected = selectedValues.includes(label);
                const disabled = !selected && selectedValues.length >= 3;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleValue(label)}
                    onMouseEnter={() => setHoveredValue(label)}
                    onMouseLeave={() => setHoveredValue(null)}
                    disabled={disabled}
                    className={cn(
                      "p-3 rounded-xl text-sm font-medium transition-all border",
                      selected
                        ? "bg-navy text-white border-navy"
                        : disabled
                        ? "bg-surface-muted text-ink-muted border-surface-border cursor-not-allowed"
                        : "bg-white text-ink border-surface-border hover:border-navy/30"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tooltip / description area — fixed height prevents layout shift */}
            <div className="mb-4 h-[5.5rem] flex items-start">
              {hoveredValue && hoveredValueDefinition ? (
                <div className="w-full rounded-xl bg-teal/5 border border-teal/20 px-4 py-3 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{hoveredValue}: </span>
                  {hoveredValueDefinition}
                </div>
              ) : (
                <p className="text-xs text-ink-muted px-1 pt-1">Hover over a value to learn more</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-ink-muted mb-6">
              <span>{selectedValues.length} of 3 selected</span>
              {selectedValues.length > 0 && (
                <button
                  onClick={() => setSelectedValues([])}
                  className="text-teal hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedValues.length < 3}
                className="btn btn-primary flex-[2]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              One last thing.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Groundwork works best alongside real people. If you have someone you could talk to when things get heavy — a parent, a coach, an older sibling, anyone — it&apos;s worth keeping them in mind.
            </p>

            <div className="bg-surface-muted rounded-xl p-4 mb-6 border border-surface-border">
              <p className="text-sm text-ink-muted">
                This is completely optional — it just gives you someone to think of if you ever need it. You can add or change this any time.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Their name{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder="e.g. Mum, Coach Ben, Mrs Thompson"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Relationship{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={supportRelationship}
                  onChange={(e) => setSupportRelationship(e.target.value)}
                  placeholder="e.g. Parent, Teacher, Older sibling"
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              {finishError && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {finishError}
                </p>
              )}
              <button
                onClick={() => handleFinish(false)}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Setting up your account…" : finishError ? "Try again" : "Start Mission 1"}
              </button>
              <button
                onClick={() => handleFinish(true)}
                disabled={loading}
                className="text-sm text-ink-muted hover:text-ink transition-colors text-center py-1"
              >
                Skip for now
              </button>
            </div>

            <p className="text-xs text-ink-muted text-center mt-4">
              If you ever need more support, Kids Helpline is available 24/7
              on 1800 55 1800.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
