// Phase 1c: staff invites and the limit on class-code guesses
// (supabase/v3/supabase/migrations/20261113000000_v3_invites_and_join_limit.sql).
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nothing, seedWorld, type World } from "./db";

let w: World;
beforeEach(async () => {
  w = await seedWorld();
});
afterEach(async () => {
  await w.db.close();
});

const NEW = "00000000-0000-4000-8000-0000000009aa";
const invite = (as: string, school: string, email: string, role = "teacher", by = as) =>
  w.db.as(as, `insert into staff_invites (school_id, email, role, invited_by) values ($1, $2, $3, $4)`, [school, email, role, by]);
const accept = async (as: string) =>
  (await w.db.as(as, `select accept_staff_invites() as n`)).rows[0]?.n ?? null;

describe("inviting staff", () => {
  it("V-A9 a school admin invites to their own school and no other; teachers and students can't invite", async () => {
    expect((await invite(w.adminA, w.schoolA, "new.teacher@example.com")).error).toBeNull();
    expect((await invite(w.adminA, w.schoolB, "x@example.com")).error).not.toBeNull();
    expect((await invite(w.teacher1, w.schoolA, "y@example.com")).error).not.toBeNull();
    expect((await invite(w.student(1), w.schoolA, "z@example.com")).error).not.toBeNull();
    // The invite names who sent it, and it can't name someone else.
    expect((await invite(w.adminA, w.schoolA, "q@example.com", "teacher", w.teacher1)).error).not.toBeNull();
    expect(await w.db.su(`select email from staff_invites`)).toEqual([{ email: "new.teacher@example.com" }]);
  });

  it("V-A9 the platform admin can invite a school's first admin", async () => {
    expect((await invite(w.platform, w.schoolB, "first.admin@example.com", "school_admin")).error).toBeNull();
  });

  it("V-A9 invites are seen by that school's admin and the platform admin, and nobody else", async () => {
    await invite(w.adminA, w.schoolA, "new.teacher@example.com");
    const seen = async (who: string) => (await w.db.as(who, `select email from staff_invites`)).rows.length;
    expect(await seen(w.adminA)).toBe(1);
    expect(await seen(w.platform)).toBe(1);
    for (const who of [w.adminB, w.teacher1, w.teacherB, w.student(1), w.student(13)]) {
      expect(nothing(await w.db.as(who, `select * from staff_invites`)), who).toBe(true);
    }
    // Another school's admin can't withdraw it; its own admin can.
    await w.db.as(w.adminB, `delete from staff_invites`);
    expect(await seen(w.adminA)).toBe(1);
    await w.db.as(w.adminA, `delete from staff_invites`);
    expect(await seen(w.adminA)).toBe(0);
  });

  it("V-A9 an address is stored trimmed and in lower case, and an invite can't be edited", async () => {
    expect((await invite(w.adminA, w.schoolA, "Mixed@Example.com")).error).not.toBeNull();
    expect((await invite(w.adminA, w.schoolA, "not-an-email")).error).not.toBeNull();
    await invite(w.adminA, w.schoolA, "new.teacher@example.com");
    const r = await w.db.as(w.adminA, `update staff_invites set role = 'school_admin'`);
    expect(r.error).not.toBeNull();
  });

  it("V-A10 an invite is taken up only once the person's own email is confirmed", async () => {
    await invite(w.adminA, w.schoolA, "new.teacher@example.com");
    await w.db.su(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'New.Teacher@example.com', '{"full_name":"New Teacher"}')`, [NEW]);
    await w.db.su(`update auth.users set email_confirmed_at = null where id = $1`, [NEW]);

    expect(await accept(NEW)).toBe(0);
    expect(await w.db.su(`select 1 from staff where user_id = $1`, [NEW])).toHaveLength(0);

    await w.db.su(`update auth.users set email_confirmed_at = now() where id = $1`, [NEW]);
    expect(await accept(NEW)).toBe(1);
    expect(await w.db.su(`select school_id, role from staff where user_id = $1`, [NEW])).toEqual([{ school_id: w.schoolA, role: "teacher" }]);
    // Taken up means gone: the address isn't kept.
    expect(await w.db.su(`select 1 from staff_invites`)).toHaveLength(0);
    expect(await accept(NEW)).toBe(0);
  });

  it("V-A10 nobody takes up an invite sent to someone else, and a signed-out visitor can't call it", async () => {
    await invite(w.adminA, w.schoolA, "new.teacher@example.com");
    await w.db.su(`update auth.users set email_confirmed_at = now()`);
    for (const who of [w.student(1), w.teacherB, w.adminB]) expect(await accept(who), who).toBe(0);
    expect(await w.db.su(`select 1 from staff_invites`)).toHaveLength(1);
    expect((await w.db.as(null, `select accept_staff_invites()`)).error).not.toBeNull();
  });
});

describe("the staff list", () => {
  it("V-A4 a school admin gets the names and roles of their own staff, and nobody else gets any", async () => {
    const list = async (who: string, school: string) => (await w.db.as(who, `select display_name, role from school_staff($1)`, [school])).rows;
    expect(await list(w.adminA, w.schoolA)).toEqual([
      { display_name: "Admin A", role: "school_admin" },
      { display_name: "Teacher One", role: "teacher" },
      { display_name: "Teacher Two", role: "teacher" },
    ]);
    expect(await list(w.platform, w.schoolB)).toHaveLength(2);
    expect(await list(w.adminA, w.schoolB)).toHaveLength(0);
    for (const who of [w.teacher1, w.student(1), w.adminB]) expect(await list(who, w.schoolA), who).toHaveLength(0);
    // Students never appear in it.
    expect(JSON.stringify(await list(w.adminA, w.schoolA))).not.toContain("Student");
  });
});

describe("guessing class codes", () => {
  const join = async (as: string, code: string) => (await w.db.as(as, `select * from join_class($1)`, [code])).rows;

  it("V-S12 after too many wrong codes, even the right one is refused until ten minutes pass", async () => {
    const limit = (await w.db.su(`select public.join_attempt_limit() as n`))[0].n as number;
    const me = w.student(13);
    for (let i = 0; i < limit; i++) expect(await join(me, "ZZZZZZ")).toHaveLength(0);
    expect(await join(me, w.c9A.join_code)).toHaveLength(0);
    expect(await w.db.su(`select 1 from class_members where student_id = $1`, [me])).toHaveLength(0);

    // Someone else is unaffected.
    expect(await join(w.student(12), w.c9A.join_code)).toHaveLength(1);

    await w.db.su(`update join_attempts set tried_at = now() - interval '11 minutes'`);
    expect(await join(me, w.c9A.join_code)).toHaveLength(1);
    expect(await w.db.su(`select 1 from join_attempts where user_id = $1`, [me])).toHaveLength(0);
  });

  it("V-S12 a few wrong tries don't lock anyone out, and only the time is kept", async () => {
    const me = w.student(13);
    for (let i = 0; i < 3; i++) await join(me, "ZZZZZZ");
    expect(await join(me, w.c9A.join_code)).toHaveLength(1);
    const cols = await w.db.su(`select column_name from information_schema.columns where table_name = 'join_attempts' order by 1`);
    expect(cols.map((c) => c.column_name)).toEqual(["tried_at", "user_id"]);
  });

  it("V-S12 nobody reads the record of wrong tries", async () => {
    await join(w.student(13), "ZZZZZZ");
    for (const who of [w.student(13), w.teacher1, w.adminA, w.platform]) {
      expect(nothing(await w.db.as(who, `select * from join_attempts`)), who).toBe(true);
    }
  });
});
