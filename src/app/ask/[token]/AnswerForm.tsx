"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

const MAX_ANSWER = 3000;

/** The answer form on /ask/[token]. Submits once, through answer_conversation_request. */
export default function AnswerForm({
  token,
  fromName,
  forLabel,
  about,
  questions,
}: {
  token: string;
  fromName: string;
  forLabel: string;
  about: string;
  questions: string[];
}) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [responder, setResponder] = useState("");
  const [state, setState] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const anyAnswer = answers.some((a) => a.trim().length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!anyAnswer) {
      setError("Answer at least one question. You can leave the others blank.");
      return;
    }
    setState("sending");
    setError(null);
    const { data, error: err } = await (createClient() as any).rpc("answer_conversation_request", {
      p_token: token,
      p_answers: answers.map((a) => a.trim()),
      p_responder: responder.trim(),
    });
    if (err) {
      setState("form");
      setError("Couldn't send your answers. Check your connection and try again. Nothing you typed has been lost.");
      return;
    }
    if (data === "ok") {
      setState("done");
      return;
    }
    setState("form");
    setError(
      data === "answered"
        ? "Someone has already answered this link, so these answers couldn't be added."
        : data === "expired"
          ? `This link has expired. Ask ${fromName} for a new one.`
          : "Something about the answers couldn't be saved. Try shortening any very long answers."
    );
  }

  if (state === "done") {
    return (
      <div className="card p-6">
        <h1 className="text-2xl text-navy mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          Thank you
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          {fromName} can read your answers now. Hearing how someone else sees them is one of
          the most useful parts of this for them. You can close this page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1
          className="text-3xl text-navy mb-3"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.15 }}
        >
          {fromName} has a few questions for you
        </h1>
        <p className="text-sm text-ink leading-relaxed mb-2">
          Hi {forLabel}. {fromName} is using Groundwork, an app that helps young people work
          out who they are. One step asks them to hear from someone about {about}, and they
          picked you.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed">
          Only {fromName} will see what you write. Answer as many as you like, in as much or
          as little detail as you like. Stories and small details are often what they
          remember most. It takes about 10 minutes, and you can only send it once.
        </p>
      </div>

      {questions.map((q, i) => (
        <label key={i} className="block card p-4">
          <span className="block text-sm font-semibold text-ink mb-2 leading-snug">
            {fromName} asks: {q}
          </span>
          <textarea
            id={`answer-${i}`}
            value={answers[i]}
            onChange={(e) => setAnswers((as) => as.map((a, j) => (j === i ? e.target.value : a)))}
            maxLength={MAX_ANSWER}
            rows={4}
            className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm leading-relaxed bg-white"
          />
        </label>
      ))}

      <label className="block">
        <span className="block text-sm font-semibold text-ink mb-1">Your name, the way {fromName} knows you</span>
        <input
          id="responder"
          value={responder}
          onChange={(e) => setResponder(e.target.value)}
          maxLength={60}
          placeholder={forLabel}
          className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm bg-white"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 leading-relaxed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary w-full py-3.5 rounded-xl text-base"
      >
        {state === "sending" ? "Sending…" : `Send to ${fromName}`}
      </button>
      <p className="text-xs text-ink-muted text-center leading-relaxed">
        Groundwork doesn&apos;t ask for or keep your contact details.
      </p>
    </form>
  );
}
