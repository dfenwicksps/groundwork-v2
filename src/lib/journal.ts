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
/**
 * Index of the "N. " marker that opens an answer block, or -1.
 *
 * The exact question text is the better delimiter while it is accurate, but
 * prompts do get rewritten — and an entry saved under the old wording still has
 * to parse. The number survives a rewrite; the sentence after it does not.
 */
function markerIndex(saved: string, n: number, from = 0): number {
  const at = saved.indexOf(`\n${n}. `, from);
  if (at !== -1) return at + 1;
  if (from === 0 && saved.startsWith(`${n}. `)) return 0;
  return -1;
}

export function splitScaffoldedResponse(
  saved: string,
  questions: string[]
): string[] {
  if (!saved) return [];
  if (questions.length <= 1) return [saved.trim()];
  return questions.map((q, i) => {
    const header = `${i + 1}. ${q}`;
    const exact = saved.indexOf(header);

    let answerStart: number;
    if (exact !== -1) {
      answerStart = exact + header.length;
    } else {
      // This question has been reworded since the entry was written. Fall back
      // to the number and skip past whatever the old wording was.
      const marker = markerIndex(saved, i + 1);
      if (marker === -1) return "";
      const eol = saved.indexOf("\n", marker);
      answerStart = eol === -1 ? saved.length : eol;
    }

    let end = saved.length;
    if (i + 1 < questions.length) {
      // The next question's full text is the safest boundary: an answer that
      // happens to contain its own numbered list can't be mistaken for the next
      // question. Only when that text isn't found — because the question was
      // reworded — fall back to the bare number. Without that fallback the old
      // heading and its answer were swallowed into this one, which is exactly
      // what a recall card then displayed.
      const exactNext = saved.indexOf(`${i + 2}. ${questions[i + 1]}`, answerStart);
      const nextAt =
        exactNext !== -1 ? exactNext : markerIndex(saved, i + 2, answerStart);
      if (nextAt !== -1) end = nextAt;
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
