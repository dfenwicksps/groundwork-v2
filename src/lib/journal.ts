// ─── Reading saved journal entries back ───────────────────────────────────────
// A scaffolded activity stores its entry as the questions interleaved with the
// answers:
//
//   1. <question>\n<answer>\n\n2. <question>\n<answer>
//
// That is the right thing to store — the entry stays readable years later, when
// nobody remembers what the prompt was. But anywhere the app *recalls* an entry
// to the student who wrote it, the questions are noise: they already know what
// they were asked, and echoing four prompts back buries the four answers.

import { getActivity } from "./missions";

/**
 * Split a saved response into per-question answers, using the known question
 * text as delimiters so multi-line answers parse reliably.
 *
 * Shared with the activity editor, which uses it to pre-fill a step with the
 * student's previous answer.
 */
export function splitScaffoldedResponse(
  saved: string,
  questions: string[]
): string[] {
  if (!saved) return [];
  if (questions.length <= 1) return [saved.trim()];
  return questions.map((q, i) => {
    const header = `${i + 1}. ${q}`;
    const start = saved.indexOf(header);
    if (start === -1) return "";
    const answerStart = start + header.length;
    let end = saved.length;
    if (i + 1 < questions.length) {
      const nextIdx = saved.indexOf(`${i + 2}. ${questions[i + 1]}`, answerStart);
      if (nextIdx !== -1) end = nextIdx;
    }
    return saved.slice(answerStart, end).trim();
  });
}

/**
 * The student's own words, with the prompts stripped — for recalling an entry
 * back to its author.
 *
 * Falls back to the raw response whenever the entry doesn't match the expected
 * shape: an activity with no scaffolding steps, an entry written before the
 * steps changed, or anything else unparseable. Showing a little extra is always
 * better than showing nothing.
 */
export function answersOnly(
  missionId: number,
  activityId: string,
  response: string | null | undefined
): string {
  if (!response?.trim()) return "";
  const steps = getActivity(missionId, activityId)?.scaffoldingSteps;
  if (!steps?.length) return response.trim();
  const answers = splitScaffoldedResponse(response, steps).filter((a) => a.trim());
  // Single newline, not blank-line separated: a recall card clamps to a few
  // lines, and blank lines spend half that budget on whitespace — which was
  // dropping the last answer, usually the one that synthesises the rest.
  return answers.length ? answers.join("\n") : response.trim();
}
