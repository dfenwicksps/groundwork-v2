import { describe, expect, it } from "vitest";
import { MISSIONS } from "@/lib/missions";
import { mayReflect } from "./aiGate";

const step = { activity_id: "what-matters", mission_id: 2 };
const base = { userEnabled: true, entry: step, schoolSettings: [] as ({ ai_enabled?: unknown } | null)[] };

describe("the server's check before an AI follow-up", () => {
  it("allows an ordinary mission step for a student with no school", () => {
    expect(mayReflect(base)).toBe(true);
  });

  it("V-C4 refuses every step marked keepFromAi, and its revisit", () => {
    const priv = MISSIONS.flatMap((m) => m.activities.filter((a) => a.keepFromAi).map((a) => ({ activity_id: a.id, mission_id: m.id })));
    expect(priv.map((p) => p.activity_id).sort()).toEqual(["culture-and-heritage", "parts-of-you"]);
    for (const entry of priv) {
      expect(mayReflect({ ...base, entry }), entry.activity_id).toBe(false);
      expect(mayReflect({ ...base, entry: { ...entry, activity_id: `${entry.activity_id}-revisit` } })).toBe(false);
    }
  });

  it("V-C4 refuses weekly reflections, the Character Code and anything from the Me tab", () => {
    for (const id of ["weekly-five", "character-code", "week-3-reflection", "next-chapter", "my-story", "something-unknown"]) {
      expect(mayReflect({ ...base, entry: { activity_id: id, mission_id: 1 } }), id).toBe(false);
    }
  });

  it("V-C4 refuses when the entry can't be found", () => {
    expect(mayReflect({ ...base, entry: null })).toBe(false);
  });

  it("V-C5 refuses when any of the student's schools has AI switched off", () => {
    expect(mayReflect({ ...base, schoolSettings: [{ ai_enabled: false }] })).toBe(false);
    expect(mayReflect({ ...base, schoolSettings: [{ ai_enabled: true }, { ai_enabled: false }] })).toBe(false);
    expect(mayReflect({ ...base, schoolSettings: [{}, null, { ai_enabled: true }] })).toBe(true);
  });

  it("still honours the student's own switch", () => {
    expect(mayReflect({ ...base, userEnabled: false })).toBe(false);
  });
});
