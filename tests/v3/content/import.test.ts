// Phase 1b: v2's content goes into content_items and comes back unchanged.
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MISSIONS } from "../../../src/lib/missions";
import { PROGRAM_WEEKS } from "../../../src/lib/program";
import { VIA_STRENGTHS } from "../../../src/lib/strengths";
import { CLUSTERS } from "../../../src/lib/pathways";
import { SELVES as V2_SELVES } from "../../../src/lib/selves";
import { STRENGTH_ACTIONS } from "../../../src/lib/boosts";
import type { ActivityBody, DraftStory, Self, StrengthBody } from "../../../src/lib/v3/content";
import {
  buildContent,
  clustersFromRows,
  missionActivitiesFromRows,
  programWeeksFromRows,
  strengthsFromRows,
  V3_SELVES,
  type ImportRow,
} from "../../../scripts/v3/content-import";
import { DEFAULT_HTML } from "../../../scripts/v3/selves-master";
import { seedWorld, type World } from "../access/db";

const html = readFileSync(DEFAULT_HTML, "utf8");
const built = buildContent(html);
/** The rows as a database would hand them back: through JSON. */
const stored: ImportRow[] = JSON.parse(JSON.stringify(built.rows));

const of = (kind: string) => stored.filter((r) => r.kind === kind);
const self = (key: string) => of("self").find((r) => r.key === key)?.body as Self;

describe("v2's content survives the round trip", () => {
  it("every strength, deep-equal and in order", () => {
    expect(strengthsFromRows(stored)).toEqual(VIA_STRENGTHS);
  });

  it("every mission's steps, deep-equal and in order", () => {
    const back = missionActivitiesFromRows(stored);
    expect(Object.keys(back).map(Number)).toEqual(MISSIONS.map((m) => m.id));
    for (const m of MISSIONS) expect(back[m.id], `mission ${m.id}`).toEqual(m.activities);
  });

  it("every program week, deep-equal and in order", () => {
    expect(programWeeksFromRows(stored)).toEqual(PROGRAM_WEEKS);
  });

  it("every career cluster, deep-equal and in order", () => {
    expect(clustersFromRows(stored)).toEqual(CLUSTERS);
  });

  it("nothing is lost by storing it as JSON", () => {
    expect(stored).toEqual(built.rows);
  });

  it("the counts are v2's: 24 strengths, 28 steps, 10 weeks, 11 clusters", () => {
    expect(of("strength")).toHaveLength(24);
    expect(of("activity").filter((r) => (r.body as ActivityBody).source === "mission")).toHaveLength(28);
    expect(of("activity").filter((r) => (r.body as ActivityBody).source === "program")).toHaveLength(10);
    expect(of("cluster")).toHaveLength(11);
  });

  it("each strength carries its practice for the week", () => {
    for (const r of of("strength")) {
      const b = r.body as StrengthBody;
      expect(b.action, b.key).toBe(STRENGTH_ACTIONS[b.key]);
    }
  });
});

describe("the AI boundary travels with the content", () => {
  it("the steps v2 keeps from the AI are still marked, and no others are", () => {
    const v2 = MISSIONS.reduce<string[]>((all, m) => all.concat(m.activities.filter((a) => a.keepFromAi).map((a) => a.id)), []);
    const v3 = of("activity").filter((r) => (r.body as ActivityBody).keepFromAi).map((r) => r.key);
    expect(v2.length).toBeGreaterThan(0);
    expect(v3.sort()).toEqual(v2.sort());
  });
});

describe("the selves (D40)", () => {
  it("are the 25 of D40, at the levels the master gives", () => {
    expect(of("self")).toHaveLength(25);
    for (const level of Object.keys(V3_SELVES).map(Number)) {
      const here = of("self").filter((r) => (r.body as Self).level === level).map((r) => r.key);
      expect(here, `level ${level}`).toEqual(V3_SELVES[level]);
    }
  });

  it("self-acceptance is gone and self-determination is Autonomy", () => {
    const keys = stored.map((r) => r.key);
    expect(keys.filter((k) => /self-acceptance|self-determination/.test(k))).toEqual([]);
    expect(self("autonomy").name).toBe("Autonomy");
    expect(self("autonomy").storyKeys).toEqual(["autonomy-story-1"]);
    expect(of("story").find((r) => r.key === "autonomy-story-1")).toBeDefined();
  });

  it("the nine selves v2 has keep v2's words, prompt and emoji (D32, D39, D43)", () => {
    expect(V2_SELVES).toHaveLength(9);
    for (const v2 of V2_SELVES) {
      const s = self(v2.key === "self-control" ? "self-regulation" : v2.key);
      expect(s, v2.key).toBeDefined();
      expect(s.short).toBe(v2.short);
      expect(s.what).toBe(v2.what);
      expect(s.notThis).toBe(v2.notThis);
      expect(s.selfCheck).toBe(v2.selfCheck);
      expect(s.icon).toBe(v2.emoji);
    }
  });

  it("the two safety follow-ons the master cut are still there", () => {
    expect(self("mattering").selfCheck).toContain("the support circle is a good place to start");
    expect(self("self-reflection").selfCheck).toBe(V2_SELVES.find((s) => s.key === "self-reflection")?.selfCheck);
  });

  it("every self and story is a draft, and nothing a person must supply was filled in", () => {
    for (const r of of("self").concat(of("story"))) expect(r.status, r.key).toBe("draft");
    for (const r of of("story")) {
      const s = r.body as DraftStory;
      expect(s.ageBands, r.key).toBeNull();
      expect(s.verifiedAt, r.key).toBeNull();
      expect(s.verifiedBy, r.key).toBeNull();
    }
    const v2Keys = V2_SELVES.map((s) => (s.key === "self-control" ? "self-regulation" : s.key));
    for (const r of of("self")) {
      if (v2Keys.indexOf(r.key) === -1) expect((r.body as Self).icon, r.key).toBe("");
    }
  });

  it("every gap names a row that exists", () => {
    const keys = stored.map((r) => r.key);
    expect(built.gaps.length).toBeGreaterThan(0);
    for (const g of built.gaps) expect(keys, g.key).toContain(g.key);
    // Every story has its two gaps; no draft is gap-free.
    for (const r of of("story")) expect(built.gaps.filter((g) => g.key === r.key).length, r.key).toBeGreaterThanOrEqual(2);
  });

  it("teacher notes are apart from the body, on selves only", () => {
    for (const r of stored) {
      if (r.kind === "self") {
        expect(r.teacherBody?.selfKey, r.key).toBe(r.key);
        expect(r.teacherBody?.notes.length, r.key).toBe(5);
        for (const n of r.teacherBody?.notes ?? []) expect(JSON.stringify(r.body), r.key).not.toContain(n.text);
      } else {
        expect(r.teacherBody, r.key).toBeNull();
      }
    }
  });
});

describe("in the database", () => {
  let w: World;
  beforeAll(async () => {
    w = await seedWorld();
    for (const r of built.rows) {
      await w.db.su(
        `insert into content_items (kind, key, version, status, body, teacher_body, published_at)
         values ($1, $2, $3, $4, $5, $6, case when $4 = 'published' then now() end)`,
        [r.kind, r.key, r.version, r.status, JSON.stringify(r.body), r.teacherBody ? JSON.stringify(r.teacherBody) : null]
      );
    }
  });
  afterAll(async () => {
    await w.db.close();
  });

  it("every row is stored and reads back deep-equal", async () => {
    const rows = await w.db.su(`select kind, key, version, status, body, teacher_body from content_items`);
    expect(rows).toHaveLength(built.rows.length);
    const back: ImportRow[] = rows.map((r) => ({
      kind: r.kind, key: r.key, version: r.version, status: r.status, body: r.body, teacherBody: r.teacher_body,
    }));
    for (const want of stored) {
      const got = back.find((r) => r.kind === want.kind && r.key === want.key);
      expect(got, `${want.kind}/${want.key}`).toEqual(want);
    }
    expect(missionActivitiesFromRows(back)[1]).toEqual(MISSIONS[0].activities);
    expect(programWeeksFromRows(back)).toEqual(PROGRAM_WEEKS);
  });

  it("a student reads the 73 published rows and none of the 50 drafts", async () => {
    const r = await w.db.as(w.student(1), `select kind, key, status from content_items`);
    expect(r.rows).toHaveLength(73);
    expect(r.rows.filter((x) => x.status !== "published")).toEqual([]);
    expect(r.rows.filter((x) => x.kind === "self" || x.kind === "story")).toEqual([]);
  });

  it("a teacher and a school admin don't read drafts either; the platform admin does", async () => {
    for (const who of [w.teacher1, w.adminA]) {
      expect((await w.db.as(who, `select key from content_items`)).rows, who).toHaveLength(73);
    }
    expect((await w.db.as(w.platform, `select key from content_items`)).rows).toHaveLength(123);
  });

  it("no signed-in role can read the teacher notes column", async () => {
    for (const who of [w.student(1), w.teacher1, w.adminA, w.platform]) {
      expect((await w.db.as(who, `select teacher_body from content_items`)).error, who).not.toBeNull();
    }
  });
});
