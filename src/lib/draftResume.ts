// ─── Resuming a writing step from its saved draft ────────────────────────────
// While a student is on a question, the answers so far hold one entry per
// question before it. Answering the last question adds its answer before the
// save; if the save then fails, the draft keeps that answer too. Resumed as it
// was, the last question would show again and a second answer would be added
// after the first, so the entry listed (and saved) it twice.
//
// This puts the draft back the way the screen expects it: the answers before
// the question shown, and the answer already given to that question, if any,
// handed back so it can be put in the box again.

export interface Turn {
  question: string;
  answer: string;
}

export function resumeDraft(
  turns: Turn[],
  savedIdx: number | undefined,
  questionCount: number
): { turns: Turn[]; qIdx: number; pending: string | null } {
  const last = Math.max(questionCount - 1, 0);
  const qIdx = Math.max(0, Math.min(savedIdx ?? turns.length, last, turns.length));
  return {
    turns: turns.slice(0, qIdx),
    qIdx,
    pending: turns.length > qIdx ? turns[qIdx].answer : null,
  };
}
