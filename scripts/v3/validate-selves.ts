// Checks the "Who am I becoming? The Selves" HTML master against the v3 content
// schema (src/lib/v3/content.ts), and compares it with the selves v2 already
// has (src/lib/selves.ts).
//
//   npx --yes tsx scripts/v3/validate-selves.ts [path-to-html] [--out report.md]
//
// It reads LEVELS and SELVES out of the HTML, maps each field to its v3 field
// (spec section 5), and reports three things, kept apart on purpose:
//
//   Failures        the master entry is malformed: a missing field, an unknown
//                   level, a story with no source. Exit code 1 if there are any.
//   Curation gaps   something v3 requires that the master has no place for: a
//                   story's age band, who verified it and when, structured
//                   links into the app. Only a person can supply these, so the
//                   script lists them and never fills them in.
//   Merge report    for the selves v2 already has, where the v2 wording and
//                   the master's differ, field by field. It doesn't choose.
//
// It changes nothing: it only reads, and writes the report if asked to.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { SELVES as V2_SELVES, CONFUSED_PAIRS } from "../../src/lib/selves";
import { DEFAULT_HTML, extractArray, mapSelf, type Mapped, type Raw } from "./selves-master";
import { mentionsCrisis } from "../../src/lib/help";
import { soundsHardOnSelf } from "../../src/lib/hardOnSelf";
import {
  LESSON_STEPS,
  type BuiltByLink,
  type DraftStory,
  type Level,
  type LevelId,
  type Self,
  type SelfTeacherNotes,
} from "../../src/lib/v3/content";


// ─── What the spec says should be there ──────────────────────────────────────

/** Spec section 5, "The 26 selves". */
const EXPECTED: Record<LevelId, string[]> = {
  1: ["self-awareness", "self-reflection", "self-concept", "self-image", "social-self"],
  2: ["self-esteem", "self-worth", "mattering", "self-respect", "self-acceptance", "self-compassion"],
  3: ["self-regulation", "self-discipline", "self-motivation"],
  4: ["self-efficacy", "self-confidence", "self-trust"],
  5: ["self-determination", "self-advocacy", "self-authorship"],
  6: ["actual-self", "ideal-self", "ought-self", "feared-self", "possible-selves"],
  7: ["authentic-self"],
};

/** v2 keys that the master renames. The v2 text is compared under the new key. */
const RENAMED: Record<string, string> = { "self-control": "self-regulation" };

/** Wording in the master that D3 (a map, not a ladder) says must change. */
const D3_PHRASES: { pattern: RegExp; becomes: string }[] = [
  { pattern: /final level/i, becomes: '"Bringing it together"' },
  { pattern: /level up/i, becomes: '"Start wherever you need. The self-check can suggest where."' },
  { pattern: /start at level 1/i, becomes: '"Start wherever you need. The self-check can suggest where."' },
];

// ─── Reading the HTML ────────────────────────────────────────────────────────

/** The names in the master's icon set (`const P = { eye:'…', … }`). */
function extractIcons(html: string): Set<string> {
  const start = html.indexOf("const P = {");
  const end = html.indexOf("};", start);
  if (start < 0 || end < 0) return new Set();
  const names = new Set<string>();
  for (const m of Array.from(html.slice(start, end).matchAll(/(?:^|[\s,{])([a-z][a-z0-9]*):'/g))) names.add(m[1]);
  return names;
}

// ─── Checks ──────────────────────────────────────────────────────────────────

interface Problem {
  key: string;
  field: string;
  problem: string;
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function checkLevels(raw: Raw[]): { levels: Level[]; failures: Problem[] } {
  const failures: Problem[] = [];
  const levels: Level[] = [];
  raw.forEach((l, i) => {
    const where = `LEVELS[${i}]`;
    const id = l.id;
    if (typeof id !== "number" || !Number.isInteger(id) || id < 1 || id > 7) {
      failures.push({ key: where, field: "id", problem: `must be a whole number from 1 to 7, got ${JSON.stringify(id)}` });
      return;
    }
    for (const f of ["name", "q", "c", "t"]) {
      if (!isText(l[f])) failures.push({ key: where, field: f, problem: "missing or empty" });
    }
    for (const f of ["c", "t"]) {
      if (isText(l[f]) && !/^#[0-9a-f]{6}$/i.test(l[f] as string)) {
        failures.push({ key: where, field: f, problem: `not a six-digit hex colour: ${l[f]}` });
      }
    }
    levels.push({
      id: id as LevelId,
      name: String(l.name ?? ""),
      question: String(l.q ?? ""),
      colour: String(l.c ?? ""),
      tint: String(l.t ?? ""),
    });
  });
  const ids = levels.map((l) => l.id);
  for (let n = 1; n <= 7; n++) {
    const count = ids.filter((x) => x === n).length;
    if (count !== 1) failures.push({ key: "LEVELS", field: "id", problem: `level ${n} appears ${count} times; expected once` });
  }
  return { levels, failures };
}

const STRING_FIELDS = ["key", "name", "icon", "short", "hook", "turn", "is_", "isnt", "ask", "living", "cp", "gw", "src"];
const FIG_FIELDS = ["kind", "name", "sub", "moment", "icon"];
const KNOWN_FIELDS = new Set(STRING_FIELDS.concat(["level", "fig", "beats", "notes"]));
/** Everything a student reads. Teacher notes and the source line are left out. */
const STUDENT_FIELDS = ["short", "hook", "turn", "is_", "isnt", "ask", "living"];

function checkSelf(s: Raw, i: number, levelIds: Set<number>, icons: Set<string>): Problem[] {
  const key = isText(s.key) ? s.key : `SELVES[${i}]`;
  const out: Problem[] = [];
  const fail = (field: string, problem: string) => out.push({ key, field, problem });

  for (const f of STRING_FIELDS) if (!isText(s[f])) fail(f, "missing or empty");
  for (const f of Object.keys(s)) if (!KNOWN_FIELDS.has(f)) fail(f, "a field the v3 mapping doesn't know");

  if (isText(s.key) && !/^[a-z]+(-[a-z]+)*$/.test(s.key)) fail("key", `not lower-case words joined by hyphens: ${s.key}`);

  if (typeof s.level !== "number") fail("level", "missing");
  else if (!levelIds.has(s.level)) fail("level", `unknown level ${s.level}`);

  if (isText(s.icon) && icons.size && !icons.has(s.icon)) fail("icon", `"${s.icon}" isn't in the master's icon set`);

  const fig = s.fig as Raw | undefined;
  if (!fig || typeof fig !== "object") fail("fig", "missing: the story has nobody in it");
  else {
    for (const f of FIG_FIELDS) if (!isText(fig[f])) fail(`fig.${f}`, "missing or empty");
    if (isText(fig.icon) && icons.size && !icons.has(fig.icon)) fail("fig.icon", `"${fig.icon}" isn't in the master's icon set`);
  }

  if (!Array.isArray(s.beats) || s.beats.length === 0) fail("beats", "missing: the story has no beats");
  else {
    s.beats.forEach((b, n) => {
      if (!isText(b)) fail(`beats[${n}]`, "empty");
    });
    if (s.beats.length < 2) fail("beats", "a story needs at least two beats");
  }

  if (!isText(s.src)) fail("story", "story without a source");

  if (!Array.isArray(s.notes)) fail("notes", "missing");
  else {
    if (s.notes.length !== LESSON_STEPS.length) {
      fail("notes", `expected ${LESSON_STEPS.length} (one per lesson step), got ${s.notes.length}`);
    }
    s.notes.forEach((n, k) => {
      if (!isText(n)) fail(`notes[${k}]`, "empty");
    });
  }

  // The reflective prompt is never a risk-language question (brief rule 3).
  if (isText(s.ask) && mentionsCrisis(s.ask)) fail("ask", "matches the risk-phrase check; a prompt must never use risk language");

  return out;
}

/** Student-facing text that would itself trip one of the on-device checks. Worth a person's eye; not a failure. */
function phraseNotes(s: Raw): Problem[] {
  const key = String(s.key);
  const out: Problem[] = [];
  const texts: [string, unknown][] = [
    ...STUDENT_FIELDS.map((f): [string, unknown] => [f, s[f]]),
    ...(Array.isArray(s.beats) ? s.beats.map((b, n): [string, unknown] => [`beats[${n}]`, b]) : []),
  ];
  for (const [field, text] of texts) {
    if (!isText(text)) continue;
    if (field !== "ask" && mentionsCrisis(text)) out.push({ key, field, problem: "matches the risk-phrase check" });
    if (soundsHardOnSelf(text)) out.push({ key, field, problem: "matches the hard-on-yourself check" });
  }
  return out;
}

// ─── Mapping to v3 ───────────────────────────────────────────────────────────

function gapsFor(m: Mapped): Problem[] {
  const key = m.self.key;
  const out: Problem[] = [];
  if (m.story.ageBands === null) out.push({ key, field: "story.ageBands", problem: "no age band in the master; a person sets it" });
  if (m.story.verifiedAt === null) out.push({ key, field: "story.verifiedAt", problem: "not verified; a person checks the story and dates it" });
  if (m.story.verifiedBy === null) out.push({ key, field: "story.verifiedBy", problem: "nobody recorded as having checked it" });
  if (m.self.sources.length === 1) {
    out.push({ key, field: "sources", problem: "one line covers the story and the research; split it, and add an address for each" });
  }
  if (m.self.sources.some((s) => /wikipedia/i.test(s.text))) {
    out.push({ key, field: "sources", problem: "cites Wikipedia; replace with the primary source when verifying" });
  }
  out.push({
    key,
    field: "builtBy",
    problem: m.suggestedBuiltBy.length
      ? `free text in the master; ${m.suggestedBuiltBy.length} link(s) suggested, to confirm`
      : "free text in the master; no link could be suggested",
  });
  out.push({ key, field: "localLink", problem: "the master's Character Project line is St Paul's-specific; move it to that school's override" });
  return out;
}

// ─── Merge report ────────────────────────────────────────────────────────────

interface Diff {
  key: string;
  v2Key: string;
  field: string;
  same: boolean;
  v2: string;
  html: string;
}

function mergeReport(mapped: Mapped[]): { diffs: Diff[]; missing: string[] } {
  const byKey = new Map(mapped.map((m) => [m.self.key, m]));
  const diffs: Diff[] = [];
  const missing: string[] = [];
  for (const v2 of V2_SELVES) {
    const key = RENAMED[v2.key] ?? v2.key;
    const m = byKey.get(key);
    if (!m) {
      missing.push(v2.key);
      continue;
    }
    const rows: [string, string, string][] = [
      ["name", v2.name, m.self.name],
      ["short", v2.short, m.self.short],
      ["what (HTML is_)", v2.what, m.self.what],
      ["notThis (HTML isnt)", v2.notThis, m.self.notThis],
      ["selfCheck (HTML ask)", v2.selfCheck, m.self.selfCheck],
      ["builtBy label (HTML gw)", v2.builtBy.label, m.gwText],
    ];
    for (const [field, a, b] of rows) {
      diffs.push({ key, v2Key: v2.key, field, same: a.trim() === b.trim(), v2: a, html: b });
    }
  }
  return { diffs, missing };
}

// ─── Output ──────────────────────────────────────────────────────────────────

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function main() {
  const args = process.argv.slice(2);
  const outAt = args.indexOf("--out");
  const outPath = outAt >= 0 ? args[outAt + 1] : null;
  const htmlPath = args.find((a, i) => !a.startsWith("--") && i !== outAt + 1) ?? DEFAULT_HTML;

  if (!existsSync(htmlPath)) {
    console.error(`Can't find the HTML master at "${htmlPath}". Pass its path as the first argument.`);
    process.exit(2);
  }
  const html = readFileSync(htmlPath, "utf8");
  const rawLevels = extractArray(html, "LEVELS");
  const rawSelves = extractArray(html, "SELVES");
  const icons = extractIcons(html);

  const { levels, failures: levelFailures } = checkLevels(rawLevels);
  const levelIds = new Set<number>(levels.map((l) => l.id));

  // Set-level checks: the right 26, each once, each on the level the spec gives it.
  const setFailures: Problem[] = [];
  const keys = rawSelves.map((s) => String(s.key));
  for (const k of Array.from(new Set(keys))) {
    const n = keys.filter((x) => x === k).length;
    if (n > 1) setFailures.push({ key: k, field: "key", problem: `appears ${n} times` });
  }
  const expectedAll = Object.values(EXPECTED).flat();
  for (const k of expectedAll) if (!keys.includes(k)) setFailures.push({ key: k, field: "key", problem: "in the spec's list of 26, not in the master" });
  for (const k of keys) if (!expectedAll.includes(k)) setFailures.push({ key: k, field: "key", problem: "in the master, not in the spec's list of 26" });
  for (const s of rawSelves) {
    const want = (Object.entries(EXPECTED).find(([, ks]) => ks.includes(String(s.key))) ?? [])[0];
    if (want && Number(want) !== s.level) {
      setFailures.push({ key: String(s.key), field: "level", problem: `the spec puts it on level ${want}; the master has ${s.level}` });
    }
  }
  if (rawSelves.length !== 26) setFailures.push({ key: "SELVES", field: "length", problem: `expected 26, got ${rawSelves.length}` });

  const perSelf = rawSelves.map((s, i) => ({ raw: s, failures: checkSelf(s, i, levelIds, icons) }));
  const mapped = rawSelves.map(mapSelf);
  const gaps = mapped.flatMap(gapsFor);
  const notes = rawSelves.flatMap(phraseNotes);
  const { diffs, missing } = mergeReport(mapped);

  // v2's confused pairs must still point at selves that exist.
  const mappedKeys = new Set(mapped.map((m) => m.self.key));
  for (const p of CONFUSED_PAIRS) {
    for (const k of [p.a, p.b]) {
      if (!mappedKeys.has(RENAMED[k] ?? k)) setFailures.push({ key: k, field: "CONFUSED_PAIRS", problem: "v2 pairs this self with another, and the master doesn't have it" });
    }
  }

  const wording: { line: number; text: string; becomes: string }[] = [];
  html.split("\n").forEach((line, i) => {
    // The two data lines are checked field by field above; here it's the page's own copy.
    if (/^const SELVES = /.test(line)) return;
    if (/^const LEVELS = /.test(line)) {
      for (const l of levels) {
        for (const d of D3_PHRASES) if (d.pattern.test(l.name)) wording.push({ line: i + 1, text: `LEVELS: level ${l.id} is named "${l.name}"`, becomes: d.becomes });
      }
      return;
    }
    for (const d of D3_PHRASES) {
      const m = line.match(d.pattern);
      if (m) wording.push({ line: i + 1, text: line.trim().slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + 60), becomes: d.becomes });
    }
  });
  // One line can match two phrases that call for the same change; report it once.
  const seen = new Set<string>();
  const wordingOnce = wording.filter((w) => {
    const id = `${w.line}|${w.becomes}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const allFailures = [...levelFailures, ...setFailures, ...perSelf.flatMap((p) => p.failures)];
  const failed = new Set(allFailures.map((f) => f.key));

  const L: string[] = [];
  L.push("# Selves master: validation and merge report", "");
  L.push(`Generated by \`scripts/v3/validate-selves.ts\` from \`${htmlPath}\`. Don't edit by hand; run the script again.`, "");
  L.push("## 1. Summary", "");
  L.push(`- Levels found: ${levels.length}. Selves found: ${rawSelves.length}. Icons in the master's set: ${icons.size}.`);
  L.push(`- **Failures: ${allFailures.length}.** Selves passing: ${perSelf.filter((p) => p.failures.length === 0 && !failed.has(String(p.raw.key))).length} of ${rawSelves.length}.`);
  L.push(`- Curation gaps (a person has to supply these): ${gaps.length}, across ${new Set(gaps.map((g) => g.key)).size} selves.`);
  L.push(`- Wording that D3 says must change: ${wordingOnce.length} place(s).`);
  L.push(`- v2 selves compared: ${V2_SELVES.length - missing.length} of ${V2_SELVES.length}. Fields that differ: ${diffs.filter((d) => !d.same).length} of ${diffs.length}.`, "");

  L.push("## 2. Pass or fail, per self", "");
  L.push("| Level | Self | Result | Failures | Curation gaps |", "| --- | --- | --- | --- | --- |");
  for (const p of perSelf) {
    const key = String(p.raw.key);
    const mine = allFailures.filter((f) => f.key === key);
    const g = gaps.filter((x) => x.key === key).length;
    L.push(`| ${p.raw.level} | \`${key}\` | ${mine.length ? "**FAIL**" : "pass"} | ${mine.length ? mine.map((f) => cell(`${f.field}: ${f.problem}`)).join("; ") : "none"} | ${g} |`);
  }
  L.push("");

  L.push("## 3. Failures", "");
  if (!allFailures.length) L.push("None.", "");
  else {
    L.push("| Where | Field | Problem |", "| --- | --- | --- |");
    for (const f of allFailures) L.push(`| \`${f.key}\` | ${cell(f.field)} | ${cell(f.problem)} |`);
    L.push("");
  }

  L.push("## 4. Curation gaps", "");
  L.push("Not failures. These are fields v3 requires and the HTML master has no place for. The script doesn't fill them: a story's age band and verified date mean something only when a person has set them.", "");
  const gapKinds = new Map<string, string[]>();
  for (const g of gaps) {
    // The builtBy gap's wording varies with how many links were suggested; group it as one kind.
    const kind = `${g.field}: ${g.problem.replace(/; \d+ link\(s\) suggested, to confirm|; no link could be suggested/, "")}`;
    gapKinds.set(kind, [...(gapKinds.get(kind) ?? []), g.key]);
  }
  L.push("| Gap | Selves affected |", "| --- | --- |");
  for (const [kind, ks] of Array.from(gapKinds)) L.push(`| ${cell(kind)} | ${ks.length === rawSelves.length ? `all ${ks.length}` : ks.map((k) => `\`${k}\``).join(", ")} |`);
  L.push("");

  L.push("### Suggested `builtBy` links, to confirm", "");
  L.push("The master's \"In Groundwork\" line is free text. These are the places in v2 it names, found by matching against real mission-step titles, week numbers and feature names. A person confirms each before it is published; a self whose line names something the script couldn't place is marked.", "");
  L.push("| Self | The master says | Suggested links |", "| --- | --- | --- |");
  for (const m of mapped) {
    L.push(`| \`${m.self.key}\` | ${cell(m.gwText)} | ${m.suggestedBuiltBy.length ? m.suggestedBuiltBy.map((b) => cell(b.label)).join("; ") : "**none found**"} |`);
  }
  L.push("");

  L.push("## 5. Wording that D3 says must change", "");
  if (!wordingOnce.length) L.push("None found.", "");
  else {
    L.push("| HTML line | Text | Becomes |", "| --- | --- | --- |");
    for (const w of wordingOnce) L.push(`| ${w.line} | ${cell(w.text)} | ${cell(w.becomes)} |`);
    L.push("");
  }

  L.push("## 6. Student-facing text that trips an on-device check", "");
  L.push("Not failures. A story can fairly describe a hard moment; this is here so a person reads those lines on purpose.", "");
  if (!notes.length) L.push("None.", "");
  else {
    L.push("| Self | Field | Check |", "| --- | --- | --- |");
    for (const n of notes) L.push(`| \`${n.key}\` | ${cell(n.field)} | ${cell(n.problem)} |`);
    L.push("");
  }

  L.push("## 7. Merge report: v2's selves against the master", "");
  L.push("For the selves v2's `src/lib/selves.ts` already has. `self-control` in v2 is compared with `self-regulation` in the master. Nothing has been merged: where the two differ, David chooses.", "");
  if (missing.length) L.push(`**In v2 and not in the master:** ${missing.map((k) => `\`${k}\``).join(", ")}.`, "");
  L.push("### At a glance", "");
  const fields = Array.from(new Set(diffs.map((d) => d.field)));
  L.push(`| Self | ${fields.join(" | ")} |`, `| --- | ${fields.map(() => "---").join(" | ")} |`);
  for (const key of Array.from(new Set(diffs.map((d) => d.key)))) {
    const row = fields.map((f) => (diffs.find((d) => d.key === key && d.field === f)?.same ? "same" : "**differs**"));
    const v2Key = diffs.find((d) => d.key === key)?.v2Key;
    L.push(`| \`${key}\`${v2Key !== key ? ` (v2: \`${v2Key}\`)` : ""} | ${row.join(" | ")} |`);
  }
  L.push("");
  L.push("### Field by field", "");
  for (const key of Array.from(new Set(diffs.map((d) => d.key)))) {
    const mine = diffs.filter((d) => d.key === key && !d.same);
    const v2Key = diffs.find((d) => d.key === key)?.v2Key;
    L.push(`#### \`${key}\`${v2Key !== key ? ` (v2 key: \`${v2Key}\`)` : ""}`, "");
    if (!mine.length) {
      L.push("No differences in text.", "");
      continue;
    }
    L.push("| Field | v2 (`selves.ts`) | HTML master |", "| --- | --- | --- |");
    for (const d of mine) L.push(`| ${cell(d.field)} | ${cell(d.v2)} | ${cell(d.html)} |`);
    L.push("");
  }
  L.push("Icons aren't compared: v2 stores an emoji for each self, and the master stores a name from its own line-icon set. v3 needs one or the other.", "");

  const report = L.join("\n");
  if (outPath) {
    writeFileSync(outPath, report);
    console.log(`Report written to ${outPath}`);
  } else {
    console.log(report);
  }

  console.log(
    `\n${allFailures.length ? "FAIL" : "PASS"}: ${allFailures.length} failure(s), ${gaps.length} curation gap(s), ` +
      `${diffs.filter((d) => !d.same).length} differing field(s) against v2.`
  );
  process.exit(allFailures.length ? 1 : 0);
}

main();
