// ─── Content import (Phase 1b) ───────────────────────────────────────────────
// Turns v2's content modules and the HTML master into rows for the v3
// `content_items` table, and back again. Pure: nothing here touches a
// database. tests/v3/content proves that what goes in comes out deep-equal.
//
//   npx --yes tsx scripts/v3/content-import.ts            # summary and gaps
//   npx --yes tsx scripts/v3/content-import.ts --json     # the rows
//
// What is published and what is a draft:
//   * Strengths, mission steps, program weeks and career clusters are v2's
//     live content, unchanged, so they are published as version 1.
//   * Every self and every story is a DRAFT. Each still needs something only a
//     person can supply (D15), and the gaps are listed, never filled.
//
// What is NOT imported, and stays in v2's modules for now, because spec
// section 10's six kinds have no place for it: each mission's own title,
// question and colours; the values lists; the weekly five; the scaffolds
// (stems, hints, tap-to-answer tiers); the strengths scenarios; the boosts as
// items of their own; the strength-to-cluster and value-to-cluster maps; and
// v2's eight mission stories, which live in the database seed.

import { readFileSync, writeFileSync } from "node:fs";
import { MISSIONS, type Activity } from "../../src/lib/missions";
import { PROGRAM_WEEKS, type ProgramWeek } from "../../src/lib/program";
import { VIA_STRENGTHS, type CharacterStrength } from "../../src/lib/strengths";
import { BOOST_BY_KEY, STRENGTH_ACTIONS, STRENGTH_TO_BOOST } from "../../src/lib/boosts";
import { CLUSTERS, type CareerCluster } from "../../src/lib/pathways";
import { SELVES as V2_SELVES } from "../../src/lib/selves";
import type {
  ActivityBody,
  BuiltByLink,
  ClusterBody,
  ContentKind,
  ContentStatus,
  DraftStory,
  Self,
  SelfTeacherNotes,
  StrengthBody,
} from "../../src/lib/v3/content";
import { DEFAULT_HTML, extractArray, mapSelf } from "./selves-master";

/** One row for `content_items`. `teacherBody` goes to the column students can't read (D23). */
export interface ImportRow {
  kind: ContentKind;
  key: string;
  version: number;
  status: ContentStatus;
  body: object;
  teacherBody: SelfTeacherNotes | null;
}

/** Something a person still has to supply before a draft can be published. */
export interface Gap {
  key: string;
  field: string;
  note: string;
}

const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function row(kind: ContentKind, key: string, status: ContentStatus, body: object, teacherBody: SelfTeacherNotes | null = null): ImportRow {
  if (!KEY.test(key)) throw new Error(`"${key}" can't be a content key (${kind}).`);
  return { kind, key, version: 1, status, body, teacherBody };
}

// ─── Strengths ───────────────────────────────────────────────────────────────

export function strengthRows(): ImportRow[] {
  return VIA_STRENGTHS.map((s) => {
    const boost = BOOST_BY_KEY[STRENGTH_TO_BOOST[s.key]];
    const body: StrengthBody = {
      key: s.key,
      name: s.name,
      virtue: s.virtue,
      short: s.short,
      plain: s.plain,
      emoji: s.emoji,
      inPractice: boost ? boost.inPractice : null,
      action: STRENGTH_ACTIONS[s.key] ?? null,
    };
    return row("strength", s.key, "published", body);
  });
}

export function strengthsFromRows(rows: ImportRow[]): CharacterStrength[] {
  return rows
    .filter((r) => r.kind === "strength")
    .map((r) => {
      const b = r.body as StrengthBody;
      return { key: b.key, name: b.name, virtue: b.virtue, short: b.short, plain: b.plain, emoji: b.emoji };
    });
}

// ─── Mission steps and program weeks ─────────────────────────────────────────

export const weekKey = (week: number) => `week-${week}`;

export function activityRows(): ImportRow[] {
  const out: ImportRow[] = [];
  for (const m of MISSIONS) {
    m.activities.forEach((a, i) => {
      const body: ActivityBody = {
        key: a.id,
        source: "mission",
        missionId: m.id,
        week: null,
        title: a.title,
        order: i,
        // Tagging is new in v3 and is a person's job; nothing is guessed here.
        selves: [],
        strengths: [],
        keepFromAi: a.keepFromAi === true,
        payload: a as unknown as Record<string, unknown>,
      };
      out.push(row("activity", a.id, "published", body));
    });
  }
  for (const w of PROGRAM_WEEKS) {
    const body: ActivityBody = {
      key: weekKey(w.week),
      source: "program",
      missionId: null,
      week: w.week,
      title: w.title,
      order: w.week,
      selves: [],
      strengths: [],
      keepFromAi: false,
      payload: w as unknown as Record<string, unknown>,
    };
    out.push(row("activity", weekKey(w.week), "published", body));
  }
  return out;
}

const activityBodies = (rows: ImportRow[], source: ActivityBody["source"]) =>
  rows
    .filter((r) => r.kind === "activity")
    .map((r) => r.body as ActivityBody)
    .filter((b) => b.source === source)
    .sort((a, b) => (a.missionId ?? 0) - (b.missionId ?? 0) || a.order - b.order);

/** Each mission's steps, in v2's order, keyed by mission id. */
export function missionActivitiesFromRows(rows: ImportRow[]): Record<number, Activity[]> {
  const out: Record<number, Activity[]> = {};
  for (const b of activityBodies(rows, "mission")) {
    const id = b.missionId as number;
    (out[id] = out[id] ?? []).push(b.payload as unknown as Activity);
  }
  return out;
}

export function programWeeksFromRows(rows: ImportRow[]): ProgramWeek[] {
  return activityBodies(rows, "program").map((b) => b.payload as unknown as ProgramWeek);
}

// ─── Career clusters ─────────────────────────────────────────────────────────

export function clusterRows(): ImportRow[] {
  return CLUSTERS.map((c, i) => {
    const body: ClusterBody & { order: number } = {
      key: c.key, name: c.name, emoji: c.emoji, blurb: c.blurb,
      roles: c.roles, subjects: c.subjects, nextSteps: c.nextSteps, order: i,
    };
    return row("cluster", c.key, "published", body);
  });
}

export function clustersFromRows(rows: ImportRow[]): CareerCluster[] {
  return rows
    .filter((r) => r.kind === "cluster")
    .map((r) => r.body as ClusterBody & { order: number })
    .sort((a, b) => a.order - b.order)
    .map((b) => ({
      key: b.key, name: b.name, emoji: b.emoji, blurb: b.blurb,
      roles: b.roles, subjects: b.subjects, nextSteps: b.nextSteps,
    }));
}

// ─── Selves and their stories ────────────────────────────────────────────────

/** D40: the evidence review, applied at import. The master file itself isn't edited. */
export const DROPPED_SELVES = ["self-acceptance"];
export const RENAMED_SELVES: Record<string, { key: string; name: string }> = {
  "self-determination": { key: "autonomy", name: "Autonomy" },
};
/** v2's key for a self the master calls something else. */
const V2_KEY: Record<string, string> = { "self-regulation": "self-control" };

/** The 25 selves of v3, by level (D40). The import fails if the result isn't exactly these. */
export const V3_SELVES: Record<number, string[]> = {
  1: ["self-awareness", "self-reflection", "self-concept", "self-image", "social-self"],
  2: ["self-esteem", "self-worth", "mattering", "self-respect", "self-compassion"],
  3: ["self-regulation", "self-discipline", "self-motivation"],
  4: ["self-efficacy", "self-confidence", "self-trust"],
  5: ["autonomy", "self-advocacy", "self-authorship"],
  6: ["actual-self", "ideal-self", "ought-self", "feared-self", "possible-selves"],
  7: ["authentic-self"],
};

/** v2's `href` as a structured link. Only an exact, known shape is converted; anything else is left for a person. */
function linkFromV2(builtBy: { label: string; href: string }): BuiltByLink | null {
  const step = builtBy.href.match(/^\/missions\/(\d+)\/activities\/([a-z0-9-]+)$/);
  if (step) {
    const mission = MISSIONS.find((m) => m.id === Number(step[1]));
    if (mission && mission.activities.some((a) => a.id === step[2])) {
      return { kind: "mission-activity", missionId: mission.id, activityId: step[2], label: builtBy.label };
    }
  }
  return null;
}

export function selfRows(html: string): { rows: ImportRow[]; gaps: Gap[] } {
  const rows: ImportRow[] = [];
  const gaps: Gap[] = [];
  const gap = (key: string, field: string, note: string) => gaps.push({ key, field, note });

  for (const raw of extractArray(html, "SELVES")) {
    const masterKey = String(raw.key);
    if (DROPPED_SELVES.indexOf(masterKey) !== -1) continue;

    const mapped = mapSelf(raw);
    const self: Self = { ...mapped.self };
    const story: DraftStory = { ...mapped.story };
    const notes: SelfTeacherNotes = { ...mapped.notes };

    const renamed = RENAMED_SELVES[masterKey];
    if (renamed) {
      self.key = renamed.key;
      self.name = renamed.name;
      story.key = `${renamed.key}-story-1`;
      story.selfKey = renamed.key;
      self.storyKeys = [story.key];
      notes.selfKey = renamed.key;
      gap(self.key, "all text", `The master wrote this as "${String(raw.name)}". Renamed to ${renamed.name} (D40); the wording needs a person's read.`);
    }

    const v2 = V2_SELVES.find((s) => s.key === (V2_KEY[self.key] ?? self.key));
    if (v2) {
      // D32, D39, D43: students read v2's text and see v2's emoji for the selves v2 has.
      self.short = v2.short;
      self.what = v2.what;
      self.notThis = v2.notThis;
      // v2's prompts carry the two safety follow-ons the master cut (mattering, self-reflection).
      self.selfCheck = v2.selfCheck;
      self.icon = v2.emoji;
      const link = linkFromV2(v2.builtBy);
      if (link) self.builtBy = [link];
      else gap(self.key, "builtBy", `v2 points at "${v2.builtBy.href}" (${v2.builtBy.label}), which isn't a mission step. A person picks the link.`);
      if (v2.key !== self.key) {
        gap(self.key, "what, notThis", `v2 wrote this text for "${v2.name}" (${v2.key}). Check it still reads right under the name ${self.name}.`);
      }
    } else {
      // The master's line-icon name isn't an emoji, and isn't turned into one here.
      self.icon = "";
      gap(self.key, "icon", "Needs an emoji chosen by a person (D39).");
      gap(self.key, "short", "The master's line is in first person; it is recast in second person by a person (D43).");
      gap(self.key, "builtBy", `No structured link. The master says: "${mapped.gwText}".`);
    }

    gap(story.key, "ageBands", "A person sets the age bands.");
    gap(story.key, "verifiedAt, verifiedBy", "A person checks the story against its source and signs it.");
    if (story.sources.some((s) => /wikipedia/i.test(s.text))) {
      gap(story.key, "sources", "Cites Wikipedia; needs a primary source.");
    }

    rows.push(row("self", self.key, "draft", self, notes));
    rows.push(row("story", story.key, "draft", story));
  }

  const want = Object.keys(V3_SELVES).reduce<string[]>((all, lv) => all.concat(V3_SELVES[Number(lv)]), []);
  const got = rows.filter((r) => r.kind === "self").map((r) => r.key);
  const missing = want.filter((k) => got.indexOf(k) === -1);
  const extra = got.filter((k) => want.indexOf(k) === -1);
  if (missing.length || extra.length || got.length !== want.length) {
    throw new Error(`The master doesn't give the 25 selves of D40. Missing: ${missing.join(", ") || "none"}. Unexpected: ${extra.join(", ") || "none"}.`);
  }
  for (const r of rows.filter((x) => x.kind === "self")) {
    const s = r.body as Self;
    if (V3_SELVES[s.level].indexOf(s.key) === -1) throw new Error(`${s.key} is at level ${s.level} in the master, not where D40 has it.`);
  }
  return { rows, gaps };
}

// ─── Everything ──────────────────────────────────────────────────────────────

export function buildContent(html: string): { rows: ImportRow[]; gaps: Gap[] } {
  const selves = selfRows(html);
  const rows = strengthRows().concat(activityRows(), clusterRows(), selves.rows);
  const seen: Record<string, true> = {};
  for (const r of rows) {
    const id = `${r.kind}/${r.key}`;
    if (seen[id]) throw new Error(`Two rows for ${id}.`);
    seen[id] = true;
    // A row that wouldn't survive being stored as JSON isn't content.
    if (JSON.stringify(JSON.parse(JSON.stringify(r.body))) !== JSON.stringify(r.body)) throw new Error(`${id} isn't plain data.`);
  }
  return { rows, gaps: selves.gaps };
}

function main() {
  const html = readFileSync(DEFAULT_HTML, "utf8");
  const { rows, gaps } = buildContent(html);
  if (process.argv.indexOf("--json") !== -1) {
    process.stdout.write(JSON.stringify(rows, null, 2) + "\n");
    return;
  }
  const count = (kind: ContentKind, status: ContentStatus) => rows.filter((r) => r.kind === kind && r.status === status).length;
  console.log(`Rows: ${rows.length}`);
  for (const kind of ["strength", "activity", "cluster", "self", "story"] as ContentKind[]) {
    console.log(`  ${kind.padEnd(9)} published ${String(count(kind, "published")).padStart(3)}   draft ${String(count(kind, "draft")).padStart(3)}`);
  }
  console.log(`\nGaps a person has to close before the drafts can be published: ${gaps.length}`);
  const out = process.argv.indexOf("--out");
  if (out === -1) {
    for (const g of gaps) console.log(`  ${g.key}  [${g.field}]  ${g.note}`);
    return;
  }
  const cell = (t: string) => t.replace(/\|/g, "\\|");
  const L: string[] = [
    "# Content import: what a person still has to supply",
    "",
    "Generated by `scripts/v3/content-import.ts --out`. Don't edit by hand; run the script again.",
    "",
    `The import builds ${rows.length} rows. ${rows.filter((r) => r.status === "published").length} are v2's live content, unchanged, and are published. The ${rows.filter((r) => r.status === "draft").length} selves and stories are drafts until every gap below is closed by a person. The script fills none of them.`,
    "",
    "| Row | Field | What's needed |",
    "| --- | --- | --- |",
  ];
  for (const g of gaps) L.push(`| \`${g.key}\` | ${cell(g.field)} | ${cell(g.note)} |`);
  writeFileSync(process.argv[out + 1], L.join("\n") + "\n");
  console.log(`Written to ${process.argv[out + 1]}`);
}

// Run only when called directly, not when a test imports the builders.
if (/content-import\.ts$/.test(process.argv[1] ?? "")) main();
