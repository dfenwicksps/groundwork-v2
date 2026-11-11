// Sections 3.2 to 3.4 of docs/v3/visibility.md: teachers, school admins and
// the platform admin. The point of most of these is what they CAN'T read.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { STUDENT_TABLES, nothing, patterns, seedWorld, type World } from "./db";

let w: World;
beforeAll(async () => {
  w = await seedWorld();
  // Something in every table a count is built from, so "zero rows" means refused, not empty.
  await w.db.as(w.student(1), `insert into self_progress (student_id, self_key) values ($1, 'self-worth')`, [w.student(1)]);
  await w.db.as(w.student(1), `insert into support_circle (user_id, name) values ($1, 'Nan')`, [w.student(1)]);
  await w.db.as(w.student(1), `select share_entry($1, $2)`, [w.entry[1], w.teacher1]);
  await w.db.su(
    `insert into content_items (kind, key, version, status, body, teacher_body)
     values ('self', 'self-worth', 1, 'published', '{"name":"Self-worth"}', '{"notes":["for the teacher"]}')`
  );
});
afterAll(async () => {
  await w.db.close();
});

/** Every student-owned table, read as this user: the names of any that gave rows back. */
async function leaks(who: string): Promise<string[]> {
  const out: string[] = [];
  for (const table of Object.keys(STUDENT_TABLES)) {
    const r = await w.db.as(who, `select * from ${table}`);
    if (r.rows.length > 0) out.push(table);
  }
  return out;
}

describe("a teacher can't read students' work", () => {
  it("V-T1 selects no row from journal_entries, even their own class's", async () => {
    expect((await w.db.su(`select 1 from journal_entries`)).length).toBeGreaterThan(0);
    expect(nothing(await w.db.as(w.teacher1, `select * from journal_entries`))).toBe(true);
    expect(nothing(await w.db.as(w.teacher1, `select response from journal_entries where user_id = $1`, [w.student(1)]))).toBe(true);
  });

  it("V-T2 selects no row from self_checks", async () => {
    expect((await w.db.su(`select 1 from self_checks`)).length).toBe(8);
    expect(nothing(await w.db.as(w.teacher1, `select * from self_checks`))).toBe(true);
  });

  it("V-T3 selects no row from any other student-owned table, and only their own users row", async () => {
    expect(await leaks(w.teacher1)).toEqual([]);
    expect(nothing(await w.db.as(w.teacher1, `select * from class_members`))).toBe(true);
    const users = await w.db.as(w.teacher1, `select id from users`);
    expect(users.rows).toEqual([{ id: w.teacher1 }]);
  });

  it("V-T4 can't insert, update or delete in a student-owned table", async () => {
    const ins = await w.db.as(
      w.teacher1,
      `insert into journal_entries (user_id, mission_id, activity_id, prompt) values ($1, 1, 'x', 'from the teacher')`,
      [w.student(1)]
    );
    expect(ins.error).not.toBeNull();
    await w.db.as(w.teacher1, `update journal_entries set response = 'changed'`);
    await w.db.as(w.teacher1, `delete from journal_entries`);
    await w.db.as(w.teacher1, `delete from self_checks`);
    await w.db.as(w.teacher1, `update users set display_name = 'changed' where id = $1`, [w.student(1)]);
    expect(await w.db.su(`select 1 from journal_entries where response = 'changed' or prompt = 'from the teacher'`)).toHaveLength(0);
    expect(await w.db.su(`select 1 from journal_entries`)).toHaveLength(19);
    expect(await w.db.su(`select 1 from self_checks`)).toHaveLength(8);
    expect((await w.db.su(`select display_name from users where id = $1`, [w.student(1)]))[0].display_name).toBe("Student 1");
  });

  it("V-T4 can't read the service-role totals views either", async () => {
    for (const view of ["signup_counts", "step_completion_counts", "week_completion_counts", "story_engagement_counts"]) {
      const r = await w.db.as(w.teacher1, `select * from ${view}`);
      expect(r.error, view).not.toBeNull();
    }
  });
});

describe("what a teacher does get", () => {
  it("V-T5 class_roster() for their class: id, display name and date joined, nothing else", async () => {
    const r = await w.db.as(w.teacher1, `select * from class_roster($1)`, [w.c9A.id]);
    expect(r.rows).toHaveLength(8);
    for (const row of r.rows) expect(Object.keys(row).sort()).toEqual(["display_name", "joined_at", "student_id"]);
  });

  it("V-T6 nothing for a class they don't teach, including one in their own school", async () => {
    expect(nothing(await w.db.as(w.teacher2, `select * from class_roster($1)`, [w.c9A.id]))).toBe(true);
    expect(nothing(await w.db.as(w.teacher2, `select * from class_patterns($1)`, [w.c9A.id]))).toBe(true);
    const focus = await w.db.as(w.teacher2, `insert into class_focus (class_id, item_key) values ($1, 'self-worth')`, [w.c9A.id]);
    expect(focus.error).not.toBeNull();
  });

  it("V-T7 class_patterns() for their class", async () => {
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["class/members"]).toBe(8);
    expect(p["self_check/taken"]).toBe(8);
  });

  it("V-T8 class_patterns() returns counts and nothing else", async () => {
    const r = await w.db.as(w.teacher1, `select * from class_patterns($1)`, [w.c9A.id]);
    expect(r.rows.length).toBeGreaterThan(0);
    for (const row of r.rows) {
      expect(Object.keys(row)).toEqual(["section", "key", "students", "out_of"]);
      expect(row.students === null || Number.isInteger(row.students)).toBe(true);
      // The key names a figure, never a person.
      expect(row.key).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
      expect(row.key).not.toMatch(/Student/);
    }
  });

  it("V-T9 shared_with_me() returns only what was shared with them", async () => {
    const r = await w.db.as(w.teacher1, `select * from shared_with_me()`);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].response).toBe("private words of student 1");
    expect(r.rows[0].student_name).toBe("Student 1");
    expect(nothing(await w.db.as(w.teacher2, `select * from shared_with_me()`))).toBe(true);
  });

  it("V-T10 sets and changes the focus for a class they teach, and no other", async () => {
    const ins = await w.db.as(w.teacher1, `insert into class_focus (class_id, item_key) values ($1, 'self-worth') returning id`, [w.c9A.id]);
    expect(ins.error).toBeNull();
    const upd = await w.db.as(w.teacher1, `update class_focus set item_key = 'mattering' where id = $1 returning item_key`, [ins.rows[0].id]);
    expect(upd.rows).toEqual([{ item_key: "mattering" }]);
    const other = await w.db.as(w.teacher2, `update class_focus set item_key = 'changed' where id = $1 returning id`, [ins.rows[0].id]);
    expect(other.rows).toHaveLength(0);
    const move = await w.db.as(w.teacher1, `update class_focus set class_id = $2 where id = $1`, [ins.rows[0].id, w.c9B.id]);
    expect(move.error).not.toBeNull();
  });

  it("V-T11 selects only the classes they teach, and regenerates only those join codes", async () => {
    const r = await w.db.as(w.teacher1, `select id, teacher_id from classes`);
    expect(r.rows.map((c) => c.id).sort()).toEqual([w.c9A.id, w.cSmall.id].sort());
    const mine = await w.db.as(w.teacher1, `select regenerate_join_code($1) as code`, [w.cSmall.id]);
    expect(mine.rows[0].code).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
    expect(mine.rows[0].code).not.toBe(w.cSmall.join_code);
    const theirs = await w.db.as(w.teacher1, `select regenerate_join_code($1) as code`, [w.c9B.id]);
    expect(theirs.rows[0]?.code ?? null).toBeNull();
    expect((await w.db.su(`select join_code from classes where id = $1`, [w.c9B.id]))[0].join_code).toBe(w.c9B.join_code);
  });

  it("V-T12 removes a student from their class, which deletes the membership and nothing else", async () => {
    const no = await w.db.as(w.teacher2, `select remove_from_class($1, $2) as r`, [w.c9A.id, w.student(6)]);
    expect(no.rows[0]?.r).toBe(false);
    expect(await w.db.su(`select 1 from class_members where student_id = $1`, [w.student(6)])).toHaveLength(1);
    const yes = await w.db.as(w.teacher1, `select remove_from_class($1, $2) as r`, [w.c9A.id, w.student(6)]);
    expect(yes.rows[0]?.r).toBe(true);
    expect(await w.db.su(`select 1 from class_members where student_id = $1`, [w.student(6)])).toHaveLength(0);
    expect(await w.db.su(`select 1 from journal_entries where user_id = $1`, [w.student(6)])).toHaveLength(1);
    expect(await w.db.su(`select 1 from self_checks where student_id = $1`, [w.student(6)])).toHaveLength(1);
    expect(await w.db.su(`select 1 from users where id = $1`, [w.student(6)])).toHaveLength(1);
  });

  it("V-T13 reads teacher notes, and can't edit central content or school overrides", async () => {
    const notes = await w.db.as(w.teacher1, `select teacher_notes('self-worth') as t`);
    expect(notes.rows[0].t).toEqual({ notes: ["for the teacher"] });
    const item = await w.db.as(w.teacher1, `insert into content_items (kind, key, version, body) values ('self', 'x', 1, '{}')`);
    expect(item.error).not.toBeNull();
    await w.db.as(w.teacher1, `update content_items set body = '{"name":"changed"}'`);
    expect((await w.db.su(`select body from content_items where key = 'self-worth'`))[0].body).toEqual({ name: "Self-worth" });
    const over = await w.db.as(w.teacher1, `insert into content_overrides (school_id, kind, item_key, op) values ($1, 'self', 'self-worth', 'hide')`, [w.schoolA]);
    expect(over.error).not.toBeNull();
  });
});

describe("a school admin", () => {
  it("V-A1 selects no row from any student-owned table, and only their own users row", async () => {
    expect(await leaks(w.adminA)).toEqual([]);
    expect(nothing(await w.db.as(w.adminA, `select * from class_members`))).toBe(true);
    expect((await w.db.as(w.adminA, `select id from users`)).rows).toEqual([{ id: w.adminA }]);
  });

  it("V-A2 has no way to read what a student shared with a teacher", async () => {
    expect(nothing(await w.db.as(w.adminA, `select * from shared_with_me()`))).toBe(true);
    expect(nothing(await w.db.as(w.adminA, `select * from shared_items`))).toBe(true);
  });

  it("V-A3 gets the roster and patterns for any class in their school, and none in another", async () => {
    expect((await w.db.as(w.adminA, `select * from class_roster($1)`, [w.c9B.id])).rows).toHaveLength(6);
    expect((await patterns(w, w.adminA, w.c9B.id))["class/members"]).toBe(6);
    expect(nothing(await w.db.as(w.adminA, `select * from class_roster($1)`, [w.c10X.id]))).toBe(true);
    expect(nothing(await w.db.as(w.adminA, `select * from class_patterns($1)`, [w.c10X.id]))).toBe(true);
    expect(nothing(await w.db.as(w.adminB, `select * from class_roster($1)`, [w.c9A.id]))).toBe(true);
  });

  it("V-A4 reads and writes classes, staff, overrides and media for their own school only", async () => {
    const a = w.adminA;
    expect((await w.db.as(a, `select school_id from classes`)).rows.every((r) => r.school_id === w.schoolA)).toBe(true);
    expect((await w.db.as(a, `select school_id from staff`)).rows.every((r) => r.school_id === w.schoolA)).toBe(true);

    const cls = await w.db.as(a, `insert into classes (school_id, teacher_id, name, year_level) values ($1, $2, '8C', 8) returning id`, [w.schoolA, w.teacher2]);
    expect(cls.error).toBeNull();
    const clsB = await w.db.as(a, `insert into classes (school_id, teacher_id, name, year_level) values ($1, $2, 'X', 8)`, [w.schoolB, w.teacherB]);
    expect(clsB.error).not.toBeNull();

    const over = await w.db.as(a, `insert into content_overrides (school_id, kind, item_key, op) values ($1, 'self', 'self-worth', 'hide')`, [w.schoolA]);
    expect(over.error).toBeNull();
    const overB = await w.db.as(a, `insert into content_overrides (school_id, kind, item_key, op) values ($1, 'self', 'self-worth', 'hide')`, [w.schoolB]);
    expect(overB.error).not.toBeNull();

    const media = `insert into media_items (school_id, type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by)
                   values ($1, 'book', 'A book', 'An author', 'library', 'PG', 7, 'why', 'coping', current_date, 'a person')`;
    expect((await w.db.as(a, media, [w.schoolA])).error).toBeNull();
    expect((await w.db.as(a, media, [w.schoolB])).error).not.toBeNull();
  });

  it("V-A5 updates their own school's settings and no other school's", async () => {
    const own = await w.db.as(w.adminA, `update schools set settings = '{"ai_enabled": false}' where id = $1 returning id`, [w.schoolA]);
    expect(own.rows).toHaveLength(1);
    const other = await w.db.as(w.adminA, `update schools set name = 'changed' where id = $1 returning id`, [w.schoolB]);
    expect(other.rows).toHaveLength(0);
    expect((await w.db.su(`select name from schools where id = $1`, [w.schoolB]))[0].name).toBe("School B");
  });

  it("V-A6 can set localLink on central content, and can't patch a protected field", async () => {
    const ok = await w.db.as(
      w.adminA,
      `insert into content_overrides (school_id, kind, item_key, op, body) values ($1, 'self', 'mattering', 'patch', '{"localLink":"Pastoral session 9"}')`,
      [w.schoolA]
    );
    expect(ok.error).toBeNull();
    for (const field of ["what", "notThis", "sources", "story", "selfCheck"]) {
      const r = await w.db.as(
        w.adminA,
        `insert into content_overrides (school_id, kind, item_key, op, body) values ($1, 'self', 'self-image', 'patch', $2)`,
        [w.schoolA, JSON.stringify({ [field]: "changed" })]
      );
      expect(r.error, field).not.toBeNull();
    }
  });

  it("V-A8 can't make a platform admin, or add staff to another school", async () => {
    const p = await w.db.as(w.adminA, `insert into platform_admins (user_id) values ($1)`, [w.adminA]);
    expect(p.error).not.toBeNull();
    const s = await w.db.as(w.adminA, `insert into staff (user_id, school_id, role) values ($1, $2, 'teacher')`, [w.teacher1, w.schoolB]);
    expect(s.error).not.toBeNull();
    const own = await w.db.as(w.adminA, `insert into staff (user_id, school_id, role) values ($1, $2, 'teacher')`, [w.adminA, w.schoolA]);
    // Already on staff as admin: the point is only that the other-school insert is what's refused.
    expect(await w.db.su(`select 1 from staff where user_id = $1 and school_id = $2`, [w.teacher1, w.schoolB])).toHaveLength(0);
    expect(own).toBeDefined();
  });
});

describe("the platform admin", () => {
  it("V-P1 selects no row from any student-owned table, and only their own users row", async () => {
    expect(await leaks(w.platform)).toEqual([]);
    expect((await w.db.as(w.platform, `select id from users`)).rows).toEqual([{ id: w.platform }]);
  });

  it("V-P2 can't call class_roster() or select class_members, so never sees a student's name", async () => {
    expect(nothing(await w.db.as(w.platform, `select * from class_roster($1)`, [w.c9A.id]))).toBe(true);
    expect(nothing(await w.db.as(w.platform, `select * from class_members`))).toBe(true);
    expect(nothing(await w.db.as(w.platform, `select * from class_patterns($1)`, [w.c9A.id]))).toBe(true);
    expect(nothing(await w.db.as(w.platform, `select * from shared_with_me()`))).toBe(true);
  });

  it("V-P3 platform_totals() gives counts with no school, class or user in them, and hides small student counts", async () => {
    const r = await w.db.as(w.platform, `select * from platform_totals()`);
    expect(r.error).toBeNull();
    expect(r.rows.length).toBeGreaterThan(0);
    for (const row of r.rows) expect(Object.keys(row)).toEqual(["key", "total"]);
    const by: Record<string, number | null> = {};
    for (const row of r.rows) by[row.key] = row.total;
    expect(by["schools"]).toBe(2);
    // One student has no class: fewer than the minimum, so hidden.
    expect(by["students_on_their_own"]).toBeNull();
    for (const who of [w.teacher1, w.adminA, w.student(1)]) {
      expect(nothing(await w.db.as(who, `select * from platform_totals()`))).toBe(true);
    }
  });

  it("V-P4 reads and writes schools, staff and central content and media", async () => {
    const p = w.platform;
    expect((await w.db.as(p, `select id from schools`)).rows).toHaveLength(2);
    const school = await w.db.as(p, `insert into schools (name, state) values ('School C', 'VIC') returning id`);
    expect(school.error).toBeNull();
    const staff = await w.db.as(p, `insert into staff (user_id, school_id, role) values ($1, $2, 'school_admin')`, [w.teacher2, school.rows[0].id]);
    expect(staff.error).toBeNull();
    const item = await w.db.as(p, `insert into content_items (kind, key, version, body) values ('self', 'self-trust', 1, '{}')`);
    expect(item.error).toBeNull();
    const media = await w.db.as(
      p,
      `insert into media_items (type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by)
       values ('book', 'Central book', 'An author', 'library', 'G', 7, 'why', 'coping', current_date, 'a person')`
    );
    expect(media.error).toBeNull();
    // And a school admin can't add a central record.
    const notCentral = await w.db.as(
      w.adminA,
      `insert into media_items (type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by)
       values ('book', 'Not central', 'An author', 'library', 'G', 7, 'why', 'coping', current_date, 'a person')`
    );
    expect(notCentral.error).not.toBeNull();
  });
});
