import { describe, expect, it } from "vitest";
import { allLevels } from "./levelMap";
import { ITEM_SET, SCALE, STATEMENTS, allAnswered, canRetake, parseSuggested, resultWords, suggest, type Answers } from "./selfCheck";

const APPROVED_LENGTH = 1502;

const selves = allLevels().flatMap((l) => l.level.selves.map((s) => ({ key: s.key, level: l.level.level })));
const all = (v: number): Answers => {
  const a: Answers = {};
  for (const s of selves) a[s.key] = v;
  return a;
};

describe("the self-check statements", () => {
  it("has exactly one statement for each of the 25 selves (D30)", () => {
    expect(Object.keys(STATEMENTS).sort()).toEqual(selves.map((s) => s.key).sort());
    expect(Object.keys(STATEMENTS)).toHaveLength(25);
  });

  it("runs from 'Not like me' to 'Very like me' in five steps", () => {
    expect(SCALE).toHaveLength(5);
    expect(SCALE[0]).toBe("Not like me");
    expect(SCALE[4]).toBe("Very like me");
  });

  it("phrases every statement in the first person, as one short sentence", () => {
    for (const [key, text] of Object.entries(STATEMENTS)) {
      expect(text, key).toMatch(/\b(I|I'm|I'll|I've|I'd|me|my)\b/);
      expect(text.length, key).toBeLessThan(95);
      expect(text, key).toMatch(/\.$/);
    }
  });

  it("keeps the Value myself statements positive, with no risk language anywhere", () => {
    const risk = /worthless|burden|disappear|nobody|no one|hate|hurt|die|dead|kill|alone|useless|failure|stupid|ugly|gone|notice if/i;
    for (const [key, text] of Object.entries(STATEMENTS)) expect(text, key).not.toMatch(risk);
    const negation = /\b(not|never|can't|cannot|don't|doesn't|won't|isn't|no)\b/i;
    for (const s of selves.filter((x) => x.level === 2)) expect(STATEMENTS[s.key], s.key).not.toMatch(negation);
  });

  it("names its wording, so a changed set is never compared with this one", () => {
    // v1 is the wording David approved on 13 Nov 2026 (D58). If a statement
    // changes, this snapshot fails: change ITEM_SET with it.
    expect(ITEM_SET).toBe("v1");
    expect(Object.values(STATEMENTS).join("|").length).toBe(APPROVED_LENGTH);
  });
});

describe("the suggestion", () => {
  it("needs every statement answered from 1 to 5", () => {
    expect(allAnswered(all(3))).toBe(true);
    expect(allAnswered({ ...all(3), "self-trust": 0 })).toBe(false);
    const missing = all(3);
    delete missing["mattering"];
    expect(allAnswered(missing)).toBe(false);
  });

  it("suggests nothing when the answers are much the same everywhere", () => {
    for (const v of [1, 3, 5]) expect(suggest(all(v))).toEqual({ steady: [], levels: [], selves: [] });
  });

  it("names the two steadiest levels, and a self from each of the two least steady", () => {
    const a = all(3);
    for (const s of selves.filter((x) => x.level === 1 || x.level === 6)) a[s.key] = 5;
    for (const s of selves.filter((x) => x.level === 3)) a[s.key] = 2;
    for (const s of selves.filter((x) => x.level === 4)) a[s.key] = 2;
    a["self-discipline"] = 1;
    a["self-trust"] = 1;
    const r = suggest(a);
    expect(r.steady).toEqual([1, 6]);
    expect(r.levels).toEqual([3, 4]);
    expect(r.selves.slice(0, 2).sort()).toEqual(["self-discipline", "self-trust"]);
    expect(r.selves.length).toBeGreaterThanOrEqual(2);
    expect(r.selves.length).toBeLessThanOrEqual(3);
  });

  it("doesn't call a level steady when its answers aren't on the 'like me' side", () => {
    const a = all(2);
    for (const s of selves.filter((x) => x.level === 5)) a[s.key] = 3;
    for (const s of selves.filter((x) => x.level === 2)) a[s.key] = 1;
    expect(suggest(a).steady).toEqual([]);
    expect(suggest(a).levels).toContain(2);
  });

  it("never names the same level as both steady and worth exploring", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const a: Answers = {};
      let x = seed * 7919;
      for (const s of selves) {
        x = (x * 1103515245 + 12345) % 2147483648;
        a[s.key] = 1 + (x % 5);
      }
      const r = suggest(a);
      for (const id of r.steady) expect(r.levels, `seed ${seed}`).not.toContain(id);
      expect(r.selves.length, `seed ${seed}`).toBeLessThanOrEqual(3);
      expect(r.levels.length, `seed ${seed}`).toBeLessThanOrEqual(2);
      // Every suggested self sits in a suggested level.
      for (const k of r.selves) expect(r.levels).toContain(selves.filter((s) => s.key === k)[0].level);
    }
  });

  it("stores and shows words only: no number reaches the result", () => {
    const a = all(3);
    for (const s of selves.filter((x) => x.level === 1)) a[s.key] = 5;
    for (const s of selves.filter((x) => x.level === 4)) a[s.key] = 1;
    const stored = suggest(a);
    expect(Object.keys(stored).sort()).toEqual(["levels", "selves", "steady"]);
    const words = resultWords(stored);
    const shown = [...words.steady.map((l) => l.name), ...words.explore.map((e) => `${e.self.name} ${e.self.short}`)].join(" ");
    expect(shown).not.toMatch(/\d|%|score|level \d|rank/i);
    expect(words.steady.map((l) => l.name)).toEqual(["Know myself"]);
  });

  it("reads back whatever the database holds without breaking", () => {
    expect(parseSuggested(null)).toEqual({ steady: [], levels: [], selves: [] });
    expect(parseSuggested({ levels: [2], selves: ["mattering", 4], steady: "x" })).toEqual({ steady: [], levels: [2], selves: ["mattering"] });
    expect(resultWords(parseSuggested({ levels: [] })).flat).toBe(true);
  });

  it("can be retaken once a term", () => {
    const taken = "2026-02-02T00:00:00Z";
    expect(canRetake(taken, new Date("2026-03-01T00:00:00Z"))).toBe(false);
    expect(canRetake(taken, new Date("2026-04-20T00:00:00Z"))).toBe(true);
  });
});
