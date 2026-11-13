import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_HTML } from "../../../scripts/v3/selves-master";
import { V3_SELVES, buildContent } from "../../../scripts/v3/content-import";
import type { Self } from "./content";
import { LEVEL_MAP, allLevels, allPieces } from "./levelMap";

const levels = allLevels();

describe("the level map", () => {
  it("has four names over seven levels, in order", () => {
    expect(LEVEL_MAP.map((g) => g.name)).toEqual(["Identity", "Connection", "Purpose", "Meaning"]);
    expect(levels.map((l) => l.level.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(levels.map((l) => l.level.name)).toEqual([
      "Know myself", "Value myself", "Manage myself", "Believe in myself", "Direct myself", "Imagine myself", "Authentic self",
    ]);
  });

  it("holds the 25 selves of D40, each at the level the master file gives it", () => {
    for (const { level } of levels) {
      expect(level.selves.map((s) => s.key), level.name).toEqual(V3_SELVES[level.level]);
    }
  });

  it("copies each self's name and one-liner from the master file exactly", () => {
    const rows = buildContent(readFileSync(DEFAULT_HTML, "utf8")).rows.filter((r) => r.kind === "self");
    const master: Record<string, Self> = {};
    for (const r of rows) master[r.key] = r.body as Self;
    for (const { level } of levels) {
      for (const s of level.selves) {
        expect(s.name, s.key).toBe(master[s.key].name);
        expect(s.short, s.key).toBe(master[s.key].short);
      }
    }
  });

  it("places every mission step and every week exactly once", () => {
    const placed: string[] = [];
    for (const { level } of levels) for (const id of level.pieces) placed.push(id);
    const known = Object.keys(allPieces());
    expect(known).toHaveLength(38);
    expect(placed.filter((id, i) => placed.indexOf(id) !== i)).toEqual([]);
    expect(placed.filter((id) => known.indexOf(id) === -1)).toEqual([]);
    expect(known.filter((id) => placed.indexOf(id) === -1)).toEqual([]);
  });

  it("gives no name or text a level number, a lock or a rank (D3, D52)", () => {
    const shown = JSON.stringify(LEVEL_MAP.map((g) => [g.name, g.question, g.levels.map((l) => [l.name, l.selves])]));
    expect(shown).not.toMatch(/level \d|level up|final|unlock|locked|stage \d/i);
  });
});
