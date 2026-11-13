import { describe, expect, it } from "vitest";
import { HIDDEN, patternLabel, shownClassCount } from "./patterns";

describe("showing class patterns", () => {
  it("V-K9 a hidden figure is a dash, never a hint at its size", () => {
    expect(shownClassCount(null)).toBe(HIDDEN);
    expect(shownClassCount(undefined)).toBe(HIDDEN);
    expect(shownClassCount(null)).not.toMatch(/fewer|less|under|\d/);
  });

  it("a figure the database chose to show is shown as it is, including zero", () => {
    expect(shownClassCount(0)).toBe("0");
    expect(shownClassCount(8)).toBe("8");
  });

  it("labels use level names, never numbers", () => {
    const label = patternLabel({ section: "self_check", key: "level-3", students: null, out_of: 8 });
    expect(label).toBe("Suggested to start in Manage myself");
    expect(label).not.toMatch(/level/i);
  });
});
