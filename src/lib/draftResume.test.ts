import { describe, expect, it } from "vitest";
import { resumeDraft } from "./draftResume";

const t = (n: number) => Array.from({ length: n }, (_, i) => ({ question: `Q${i + 1}`, answer: `A${i + 1}` }));

describe("resuming a writing step from its draft", () => {
  it("keeps the answers before the question shown, as they were", () => {
    expect(resumeDraft(t(1), 1, 3)).toEqual({ turns: t(1), qIdx: 1, pending: null });
    expect(resumeDraft(t(0), 0, 3)).toEqual({ turns: [], qIdx: 0, pending: null });
  });

  it("after a failed save on the last question, shows that question once, with its answer back in the box", () => {
    // The draft holds all three answers and still points at question 3.
    const r = resumeDraft(t(3), 2, 3);
    expect(r.qIdx).toBe(2);
    expect(r.turns).toEqual(t(2));
    expect(r.pending).toBe("A3");
  });

  it("never points past the answers it has", () => {
    expect(resumeDraft(t(1), 2, 3)).toEqual({ turns: t(1), qIdx: 1, pending: null });
  });

  it("copes with an old draft that has no question number", () => {
    expect(resumeDraft(t(2), undefined, 3)).toEqual({ turns: t(2), qIdx: 2, pending: null });
    expect(resumeDraft(t(3), undefined, 3)).toEqual({ turns: t(2), qIdx: 2, pending: "A3" });
  });
});
