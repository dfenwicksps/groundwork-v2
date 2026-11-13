"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { allLevels } from "@/lib/v3/levelMap";
import { ITEM_SET, SCALE, STATEMENTS, allAnswered, suggest, type Answers } from "@/lib/v3/selfCheck";
import { NAVY, YELLOW, accentOn, bandStyle, display, onBand, toneOf } from "./mapStyle";

// The self-check. Not a test: no score, no label, nothing a teacher sees.
// The answers are saved to the student's own row and nowhere else.
export default function SelfCheckForm({ studentId, preview }: { studentId: string | null; preview?: boolean }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const levels = allLevels();
  const total = Object.keys(STATEMENTS).length;
  const answered = Object.keys(answers).length;
  const ready = allAnswered(answers);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    if (preview || !studentId) {
      router.push("/dev-preview/self-check-result");
      return;
    }
    setBusy(true);
    setFailed(false);
    const { error } = await (createClient() as any).from("self_checks").insert({
      student_id: studentId,
      item_set: ITEM_SET,
      answers,
      suggested: suggest(answers),
    });
    if (error) {
      setBusy(false);
      setFailed(true);
      return;
    }
    router.push("/me/self-check/result");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl px-4 py-8 lg:px-10 lg:py-10">
      <header>
        <span className="inline-block rounded-full px-3.5 py-1.5 text-[12px] font-extrabold tracking-[0.12em] text-white" style={{ background: NAVY }}>
          THE SELF-CHECK
        </span>
        <h1 className="mt-3 text-[clamp(34px,6vw,56px)] font-extrabold leading-none tracking-[-0.02em] text-[--navy]" style={display}>
          Where could I start?
        </h1>
        <div className="mt-4 space-y-2 text-[17px] font-medium leading-snug text-[--ink-muted]">
          <p>
            {total} short statements. For each one, pick how much it sounds like you. It takes about five minutes.
          </p>
          <p>
            It isn&apos;t a test. There are no right answers, no score and no label. At the end you get a couple of
            ideas for where to start, in words.
          </p>
          <p>Only you see your answers. Your teacher never does.</p>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        {levels.map(({ level }) => {
          const tone = toneOf(level);
          return (
            <section key={level.key} aria-labelledby={`sc-${level.key}`} className="rounded-3xl p-4 sm:p-6" style={bandStyle(level)}>
              <h2 id={`sc-${level.key}`} className="text-2xl font-extrabold" style={{ ...onBand, color: accentOn(level) }}>
                {level.name}
              </h2>
              <div className="mt-3 space-y-3">
                {level.selves.map((s) => {
                  const chosen = answers[s.key];
                  return (
                    <fieldset
                      key={s.key}
                      className="rounded-2xl p-4"
                      style={tone === "dark" ? { border: "2px dashed rgba(255,255,255,.45)" } : { background: "#fff", color: "#1E1E2A" }}
                    >
                      <legend className="float-left mb-3 w-full text-[17px] font-bold leading-snug">{STATEMENTS[s.key]}</legend>
                      <div className="clear-both flex items-start justify-between gap-1">
                        {SCALE.map((label, i) => {
                          const v = i + 1;
                          const on = chosen === v;
                          return (
                            <label key={label} className="flex min-h-[44px] flex-1 cursor-pointer flex-col items-center gap-1.5 text-center">
                              <input
                                type="radio"
                                className="peer sr-only"
                                name={s.key}
                                value={v}
                                checked={on}
                                onChange={() => setAnswers((a) => ({ ...a, [s.key]: v }))}
                              />
                              <span
                                aria-hidden="true"
                                className="h-8 w-8 rounded-full border-[3px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                                style={{
                                  borderColor: tone === "dark" ? YELLOW : tone === "bright" ? NAVY : level.colour,
                                  background: on ? (tone === "dark" ? YELLOW : tone === "bright" ? NAVY : level.colour) : "transparent",
                                  outlineColor: tone === "dark" ? "#fff" : NAVY,
                                }}
                              />
                              <span className={`text-[11px] font-bold leading-tight sm:text-xs ${i === 0 || i === 4 || on ? "" : "max-sm:sr-only"}`}>
                                {label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="btn btn-primary" disabled={!ready || busy}>
          {busy ? "Saving…" : "See where I could start"}
        </button>
        <p className="text-sm font-semibold text-[--ink-muted]" aria-live="polite">
          {ready ? "All answered." : `${answered} of ${total} answered.`}
        </p>
        <Link href="/grow" className="text-sm font-semibold text-[--ink-muted] underline underline-offset-4">
          Skip it and go to the map
        </Link>
      </div>
      {failed && (
        <p role="alert" className="mt-3 text-sm font-semibold text-[--ink]">
          That didn&apos;t save. Check your connection and try again. Your answers are still here.
        </p>
      )}
    </form>
  );
}
