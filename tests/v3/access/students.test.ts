// Section 3.1 of docs/v3/visibility.md: what a student can and can't do.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { STUDENT_TABLES, nothing, seedWorld, type World } from "./db";

let w: World;
beforeAll(async () => {
  w = await seedWorld();
});
afterAll(async () => {
  await w.db.close();
});

describe("a student and their own rows", () => {
  it("V-S1 can insert, select, update and delete their own journal entry", async () => {
    const me = w.student(1);
    const ins = await w.db.as(
      me,
      `insert into journal_entries (user_id, mission_id, activity_id, prompt, response) values ($1, 2, 'y', 'p', 'first') returning id`,
      [me]
    );
    expect(ins.error).toBeNull();
    const id = ins.rows[0].id;
    const upd = await w.db.as(me, `update journal_entries set response = 'second' where id = $1 returning response`, [id]);
    expect(upd.rows[0]?.response).toBe("second");
    const sel = await w.db.as(me, `select response from journal_entries where id = $1`, [id]);
    expect(sel.rows).toEqual([{ response: "second" }]);
    const del = await w.db.as(me, `delete from journal_entries where id = $1 returning id`, [id]);
    expect(del.rows).toHaveLength(1);
  });

  it("V-S1 every student-owned table has a policy for its owner, and only for its owner", async () => {
    const rows = await w.db.su(
      `select tablename, policyname, roles::text as roles, coalesce(qual, '') as qual, coalesce(with_check, '') as with_check
         from pg_policies where schemaname = 'public' and tablename = any($1)`,
      [Object.keys(STUDENT_TABLES)]
    );
    for (const table of Object.keys(STUDENT_TABLES)) {
      const mine = rows.filter((r) => r.tablename === table);
      expect(mine.length, `${table} has no policy`).toBeGreaterThan(0);
      for (const p of mine) {
        const rule = `${p.qual} ${p.with_check}`;
        expect(p.roles, `${table}: ${p.policyname}`).toBe("{authenticated}");
        expect(rule, `${table}: ${p.policyname}`).toContain(`auth.uid() = ${STUDENT_TABLES[table]}`);
        // Nothing widens it: no "or" to another role.
        expect(rule.toLowerCase(), `${table}: ${p.policyname}`).not.toMatch(/\bor\b/);
      }
    }
  });

  it("V-S2 can't select another student's rows in any student-owned table, classmate or not", async () => {
    // Student 2 is a classmate of student 1; student 12 is at another school.
    await w.db.as(w.student(2), `insert into self_progress (student_id, self_key) values ($1, 'mattering')`, [w.student(2)]);
    for (const table of Object.keys(STUDENT_TABLES)) {
      const owner = STUDENT_TABLES[table];
      const r = await w.db.as(w.student(1), `select ${owner} as owner from ${table}`);
      expect(r.error, table).toBeNull();
      for (const row of r.rows) expect(row.owner, table).toBe(w.student(1));
    }
    const r = await w.db.as(w.student(1), `select * from journal_entries where user_id = $1`, [w.student(2)]);
    expect(r.rows).toHaveLength(0);
  });

  it("V-S2 can't write a row as someone else, or change someone else's", async () => {
    const r = await w.db.as(
      w.student(1),
      `insert into journal_entries (user_id, mission_id, activity_id, prompt) values ($1, 1, 'x', 'p')`,
      [w.student(2)]
    );
    expect(r.error).not.toBeNull();
    await w.db.as(w.student(1), `update journal_entries set response = 'changed' where user_id = $1`, [w.student(2)]);
    await w.db.as(w.student(1), `delete from journal_entries where user_id = $1`, [w.student(2)]);
    const real = await w.db.su(`select response from journal_entries where id = $1`, [w.entry[2]]);
    expect(real).toEqual([{ response: "private words of student 2" }]);
  });

  it("V-S8 no student-owned table has a school_id column, so a row can't be filed under a school", async () => {
    const cols = await w.db.su(
      `select table_name from information_schema.columns
        where table_schema = 'public' and column_name = 'school_id' and table_name = any($1)`,
      [Object.keys(STUDENT_TABLES)]
    );
    expect(cols).toEqual([]);
    const r = await w.db.as(
      w.student(1),
      `insert into journal_entries (user_id, school_id, mission_id, activity_id, prompt) values ($1, $2, 1, 'x', 'p')`,
      [w.student(1), w.schoolB]
    );
    expect(r.error).not.toBeNull();
  });
});

describe("a student and their class", () => {
  it("V-S3 sees only their own class_members rows, not who else is in the class", async () => {
    const r = await w.db.as(w.student(1), `select student_id from class_members`);
    expect(r.rows).toEqual([{ student_id: w.student(1) }]);
  });

  it("V-S4 gets nothing from class_roster(), class_patterns() or shared_with_me()", async () => {
    const me = w.student(1);
    expect(nothing(await w.db.as(me, `select * from class_roster($1)`, [w.c9A.id]))).toBe(true);
    expect(nothing(await w.db.as(me, `select * from class_patterns($1)`, [w.c9A.id]))).toBe(true);
    expect(nothing(await w.db.as(me, `select * from shared_with_me()`))).toBe(true);
  });

  it("V-S5 can't select from classes at all, so never sees a join code", async () => {
    const r = await w.db.as(w.student(1), `select * from classes`);
    expect(r.rows).toHaveLength(0);
    const code = await w.db.as(w.student(1), `select join_code from classes where id = $1`, [w.c9A.id]);
    expect(code.rows).toHaveLength(0);
  });

  it("V-S5 my_classes() gives the class name, year level and teacher's name, and no code", async () => {
    const r = await w.db.as(w.student(1), `select * from my_classes()`);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].class_name).toBe("9A");
    expect(r.rows[0].year_level).toBe(9);
    expect(r.rows[0].teacher_name).toBe("Teacher One");
    expect(Object.keys(r.rows[0])).not.toContain("join_code");
  });

  it("V-S6 joins only through join_class(); a direct insert into class_members fails", async () => {
    const direct = await w.db.as(w.student(13), `insert into class_members (class_id, student_id) values ($1, $2)`, [
      w.c9B.id, w.student(13),
    ]);
    expect(direct.error).not.toBeNull();
    const wrong = await w.db.as(w.student(13), `select * from join_class('ZZZZZZ')`);
    expect(wrong.rows).toHaveLength(0);
    expect(await w.db.su(`select 1 from class_members where student_id = $1`, [w.student(13)])).toHaveLength(0);
  });

  it("V-S6 join_class() takes the code in any case and returns the class", async () => {
    const r = await w.db.as(w.student(1), `select * from join_class($1)`, [w.c9A.join_code.toLowerCase()]);
    expect(r.error).toBeNull();
    expect(r.rows[0]?.class_name).toBe("9A");
  });

  it("V-C3 year level is copied from the class, and a student in a class can't change it", async () => {
    const before = await w.db.su(`select year_level from users where id = $1`, [w.student(1)]);
    expect(before[0].year_level).toBe(9);
    await w.db.as(w.student(1), `update users set year_level = 12 where id = $1`, [w.student(1)]);
    const after = await w.db.su(`select year_level from users where id = $1`, [w.student(1)]);
    expect(after[0].year_level).toBe(9);
  });

  it("V-S9 reads published content only", async () => {
    await w.db.su(
      `insert into content_items (kind, key, version, status, body) values
         ('self', 'self-worth', 1, 'published', '{"name":"Self-worth"}'), ('self', 'mattering', 1, 'draft', '{}')`
    );
    const r = await w.db.as(w.student(1), `select key from content_items`);
    expect(r.rows).toEqual([{ key: "self-worth" }]);
  });
});

describe("a student with no class", () => {
  it("V-S10 has their own rows and none of the class or school features", async () => {
    const me = w.student(13);
    const own = await w.db.as(me, `select response from journal_entries`);
    expect(own.rows).toEqual([{ response: "private words of student 13" }]);
    const check = await w.db.as(
      me,
      `insert into self_checks (student_id, item_set, answers, suggested) values ($1, 'v1', '{}', '{"levels":[1]}') returning id`,
      [me]
    );
    expect(check.error).toBeNull();
    expect(nothing(await w.db.as(me, `select * from my_classes()`))).toBe(true);
    expect(nothing(await w.db.as(me, `select * from schools`))).toBe(true);
    expect(nothing(await w.db.as(me, `select * from class_focus`))).toBe(true);
    expect(nothing(await w.db.as(me, `select * from content_overrides`))).toBe(true);
  });

  it("V-S10 can set their own year level, having no class to copy it from", async () => {
    await w.db.as(w.student(13), `update users set year_level = 11 where id = $1`, [w.student(13)]);
    const r = await w.db.su(`select year_level from users where id = $1`, [w.student(13)]);
    expect(r[0].year_level).toBe(11);
  });
});

describe("leaving and deleting", () => {
  it("V-S7 can leave a class, and keeps every row of their own", async () => {
    const me = w.student(8);
    const r = await w.db.as(me, `delete from class_members where class_id = $1 returning class_id`, [w.c9A.id]);
    expect(r.rows).toHaveLength(1);
    expect(nothing(await w.db.as(me, `select * from my_classes()`))).toBe(true);
    expect((await w.db.as(me, `select * from journal_entries`)).rows).toHaveLength(1);
    expect((await w.db.as(me, `select * from self_checks`)).rows).toHaveLength(1);
  });

  it("V-S11 deleting the account removes every row they own, their memberships and what they shared", async () => {
    const me = w.student(7);
    await w.db.as(me, `insert into self_progress (student_id, self_key) values ($1, 'self-worth')`, [me]);
    const shared = await w.db.as(me, `select share_entry($1, $2) as r`, [w.entry[7], w.teacher1]);
    expect(shared.rows[0]?.r).toBe("ok");
    await w.db.su(`delete from auth.users where id = $1`, [me]);
    for (const table of Object.keys(STUDENT_TABLES)) {
      const left = await w.db.su(`select 1 from ${table} where ${STUDENT_TABLES[table]} = $1`, [me]);
      expect(left, table).toHaveLength(0);
    }
    expect(await w.db.su(`select 1 from class_members where student_id = $1`, [me])).toHaveLength(0);
    expect(await w.db.su(`select 1 from users where id = $1`, [me])).toHaveLength(0);
  });
});
