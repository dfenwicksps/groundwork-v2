// Every rule in docs/v3/visibility.md is either tested here against the
// database, or listed below with where it is (or will be) checked instead.
// Add a rule to the document without doing one or the other and this fails.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Rules a database test can't settle, and what settles them. */
const CHECKED_ELSEWHERE: Record<string, string> = {
  "V-A7": "src/lib/v3/ageBands.test.ts: a stored ceiling above the band's maximum is ignored.",
  "V-P5": "Phase 1c: no service-role key in any client bundle (a build check), and the scripts that use it.",
  "V-K9": "Phase 1d: the teacher screens show a dash, never 'fewer than 5' (unit test on shownClassCount()).",
  "V-SH4": "Phase 2, with the share screen: the student sees the exact text and the teacher's name first.",
  "V-SH8": "Phase 2, with the share screen: sharing doesn't re-run or report the on-device risk check.",
  "V-C4": "Phase 1c: /api/reflect refuses private steps server-side (route test).",
  "V-C5": "Phase 1c: /api/reflect makes no API call when the school has AI switched off (route test).",
  "V-C6": "Review at each phase: no free text in a staff-readable table other than shared_items.",
  "V-C7": "Review at each phase: no free text in logs, error reports or analytics.",
  "V-G1": "Phase 1d: the results of mentionsCrisis() and soundsHardOnSelf() never leave the device (code check).",
  "V-G2": "Phase 1d: no staff screen or function reports that a support card was shown.",
  "V-G3": "Phase 1d: the school's card sits beside the helplines and can't replace or hide them.",
};

const dir = join(process.cwd(), "tests/v3/access");

function ruleIds(): string[] {
  const doc = readFileSync(join(process.cwd(), "docs/v3/visibility.md"), "utf8");
  const ids: string[] = [];
  const re = /^\| (V-[A-Z]+\d+) \|/gm;
  let m = re.exec(doc);
  while (m) {
    ids.push(m[1]);
    m = re.exec(doc);
  }
  return ids;
}

function testedIds(): string[] {
  const ids: string[] = [];
  for (const file of readdirSync(dir)) {
    if (!/\.test\.ts$/.test(file) || file === "coverage.test.ts") continue;
    const src = readFileSync(join(dir, file), "utf8");
    // Only a rule named at the start of a test's title counts.
    const re = /\bit\(\s*"(V-[A-Z]+\d+) /g;
    let m = re.exec(src);
    while (m) {
      if (ids.indexOf(m[1]) === -1) ids.push(m[1]);
      m = re.exec(src);
    }
  }
  return ids;
}

describe("the rules in visibility.md", () => {
  const rules = ruleIds();
  const tested = testedIds();

  it("are the 72 the document lists, each once", () => {
    expect(rules).toHaveLength(72);
    expect(rules.filter((id, i) => rules.indexOf(id) !== i)).toEqual([]);
  });

  it("each have a database test, or a stated reason they're checked elsewhere", () => {
    const missing = rules.filter((id) => tested.indexOf(id) === -1 && !(id in CHECKED_ELSEWHERE));
    expect(missing).toEqual([]);
  });

  it("aren't claimed both ways, and nothing here names a rule that doesn't exist", () => {
    expect(Object.keys(CHECKED_ELSEWHERE).filter((id) => tested.indexOf(id) !== -1)).toEqual([]);
    expect(Object.keys(CHECKED_ELSEWHERE).filter((id) => rules.indexOf(id) === -1)).toEqual([]);
    expect(tested.filter((id) => rules.indexOf(id) === -1)).toEqual([]);
  });

  it("60 are tested against the database and 12 are checked elsewhere", () => {
    expect(rules.filter((id) => tested.indexOf(id) !== -1)).toHaveLength(60);
    expect(Object.keys(CHECKED_ELSEWHERE)).toHaveLength(12);
  });
});
