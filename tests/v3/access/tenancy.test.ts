// Sections 3.5 and 3.6 of docs/v3/visibility.md: across schools, and signed out.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { nothing, patterns, seedWorld, type World } from "./db";

let w: World;
beforeAll(async () => {
  w = await seedWorld();
  await w.db.as(w.adminA, `insert into content_overrides (school_id, kind, item_key, op) values ($1, 'self', 'self-worth', 'hide')`, [w.schoolA]);
  await w.db.as(w.adminB, `insert into content_overrides (school_id, kind, item_key, op) values ($1, 'self', 'mattering', 'hide')`, [w.schoolB]);
  const media = `insert into media_items (school_id, type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by)
                 values ($1, 'book', $2, 'An author', 'library', 'PG', 7, 'why', 'coping', current_date, 'a person')`;
  await w.db.as(w.adminA, media, [w.schoolA, "School A's book"]);
  await w.db.as(w.adminB, media, [w.schoolB, "School B's book"]);
});
afterAll(async () => {
  await w.db.close();
});

/** Every table in public that has a school_id column. */
async function schoolTables(): Promise<string[]> {
  const rows = await w.db.su(
    `select c.table_name from information_schema.columns c
       join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name
      where c.table_schema = 'public' and c.column_name = 'school_id' and t.table_type = 'BASE TABLE' order by 1`
  );
  return rows.map((r) => r.table_name);
}

describe("across schools", () => {
  it("V-X1 nobody at School A, in any role, selects a row belonging to School B", async () => {
    const tables = await schoolTables();
    expect(tables).toEqual(["classes", "content_overrides", "media_hidden", "media_items", "staff"]);
    for (const who of [w.student(1), w.teacher1, w.teacher2, w.adminA]) {
      for (const table of tables) {
        const r = await w.db.as(who, `select school_id from ${table}`);
        for (const row of r.rows) expect(row.school_id, `${table} as ${who}`).not.toBe(w.schoolB);
      }
      const schools = await w.db.as(who, `select id from schools`);
      expect(schools.rows).toEqual([{ id: w.schoolA }]);
    }
  });

  it("V-X1 a teacher or admin at another school gets nothing for a School A class", async () => {
    for (const who of [w.teacherB, w.adminB]) {
      expect(nothing(await w.db.as(who, `select * from class_roster($1)`, [w.c9A.id]))).toBe(true);
      expect(nothing(await w.db.as(who, `select * from class_patterns($1)`, [w.c9A.id]))).toBe(true);
      expect(nothing(await w.db.as(who, `select * from class_focus`))).toBe(true);
    }
    const code = await w.db.as(w.adminB, `select regenerate_join_code($1) as code`, [w.c9A.id]);
    expect(code.rows[0]?.code ?? null).toBeNull();
  });

  it("V-X2 a school's overrides and its own media are seen by that school only", async () => {
    for (const who of [w.student(1), w.teacher1, w.adminA]) {
      const o = await w.db.as(who, `select item_key from content_overrides`);
      expect(o.rows, who).toEqual([{ item_key: "self-worth" }]);
      const m = await w.db.as(who, `select title from media_items`);
      expect(m.rows, who).toEqual([{ title: "School A's book" }]);
    }
    for (const who of [w.student(12), w.teacherB, w.adminB]) {
      const o = await w.db.as(who, `select item_key from content_overrides`);
      expect(o.rows, who).toEqual([{ item_key: "mattering" }]);
      const m = await w.db.as(who, `select title from media_items`);
      expect(m.rows, who).toEqual([{ title: "School B's book" }]);
    }
    // A student with no class sees neither school's.
    expect(nothing(await w.db.as(w.student(13), `select * from content_overrides`))).toBe(true);
    expect(nothing(await w.db.as(w.student(13), `select * from media_items`))).toBe(true);
  });

  it("V-X3 a student in a class at each school is in both, and each class counts them on its own", async () => {
    const both = w.student(14);
    const classes = await w.db.as(both, `select class_name, school_id from my_classes() order by class_name`);
    expect(classes.rows).toEqual([
      { class_name: "10X", school_id: w.schoolB },
      { class_name: "9B", school_id: w.schoolA },
    ]);
    // Each override row names its school, so the app can apply it in that class's context.
    const o = await w.db.as(both, `select school_id, item_key from content_overrides order by item_key`);
    expect(o.rows).toEqual([
      { school_id: w.schoolB, item_key: "mattering" },
      { school_id: w.schoolA, item_key: "self-worth" },
    ]);
    expect((await patterns(w, w.teacher2, w.c9B.id))["class/members"]).toBe(6);
    // 10X has two members: too small to report, and School A's staff can't ask about it at all.
    expect(Object.keys(await patterns(w, w.teacherB, w.c10X.id))).toEqual(["class/too_small"]);
    expect(nothing(await w.db.as(w.teacher2, `select * from class_roster($1)`, [w.c10X.id]))).toBe(true);
  });
});

describe("signed out", () => {
  it("V-N1 selects no row from any table or view", async () => {
    const rels = await w.db.su(
      `select table_name from information_schema.tables where table_schema = 'public' order by 1`
    );
    expect(rels.length).toBeGreaterThan(30);
    for (const { table_name } of rels) {
      const r = await w.db.as(null, `select * from ${table_name}`);
      expect(r.rows, table_name).toHaveLength(0);
    }
  });

  it("V-N1 can't call any function that reports on students", async () => {
    for (const call of [
      `select * from class_roster('${w.c9A.id}')`,
      `select * from class_patterns('${w.c9A.id}')`,
      `select * from shared_with_me()`,
      `select * from platform_totals()`,
      `select * from my_classes()`,
      `select * from join_class('${w.c9A.join_code}')`,
      `select teacher_notes('self-worth')`,
      `select share_entry('${w.entry[1]}', '${w.teacher1}')`,
      `select regenerate_join_code('${w.c9A.id}')`,
      `select remove_from_class('${w.c9A.id}', '${w.student(1)}')`,
    ]) {
      const r = await w.db.as(null, call);
      expect(r.error, call).not.toBeNull();
    }
  });

  it("V-N2 can use a conversation token, and only that", async () => {
    const made = await w.db.as(
      w.student(1),
      `insert into conversation_requests (user_id, token, mission_id, activity_id, from_name, for_label, questions)
       values ($1, 'tok-abcdefghijklmnopqrstuvwxyz-123456', 1, 'conversation-who-i-was', 'Sam', 'Nan', '["What was I like?"]') returning id`,
      [w.student(1)]
    );
    expect(made.error).toBeNull();
    const got = await w.db.as(null, `select * from get_conversation_request('tok-abcdefghijklmnopqrstuvwxyz-123456')`);
    expect(got.error).toBeNull();
    expect(got.rows).toHaveLength(1);
    const wrong = await w.db.as(null, `select * from get_conversation_request('not-a-real-token')`);
    expect(wrong.rows).toHaveLength(0);
    expect(nothing(await w.db.as(null, `select * from conversation_requests`))).toBe(true);
  });
});
