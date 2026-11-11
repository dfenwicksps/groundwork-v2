// Section 5 of docs/v3/visibility.md: "Share with my teacher".
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { nothing, seedWorld, type World } from "./db";

let w: World;
beforeAll(async () => {
  w = await seedWorld();
});
afterAll(async () => {
  await w.db.close();
});

const share = async (as: string, entry: string, teacher: string) =>
  (await w.db.as(as, `select share_entry($1, $2) as r`, [entry, teacher])).rows[0]?.r ?? null;
const inbox = async (teacher: string) => (await w.db.as(teacher, `select * from shared_with_me()`)).rows;

describe("sharing an entry", () => {
  it("V-SH1 only the student who owns the entry can share it", async () => {
    expect(await share(w.student(2), w.entry[1], w.teacher1)).toBe("not_yours");
    expect(await share(w.teacher1, w.entry[1], w.teacher1)).toBe("not_yours");
    expect(await share(w.adminA, w.entry[1], w.teacher1)).toBe("not_yours");
    expect(await inbox(w.teacher1)).toHaveLength(0);
    expect(await share(w.student(1), w.entry[1], w.teacher1)).toBe("ok");
    expect(await inbox(w.teacher1)).toHaveLength(1);
  });

  it("V-SH1 nobody can insert into shared_items directly", async () => {
    const row = `insert into shared_items (student_id, teacher_id, class_id, entry_id, prompt, response) values ($1, $2, $3, $4, 'p', 'r')`;
    for (const who of [w.student(2), w.teacher1, w.adminA, w.platform]) {
      const r = await w.db.as(who, row, [w.student(2), w.teacher1, w.c9A.id, w.entry[2]]);
      expect(r.error, who).not.toBeNull();
    }
    expect(await w.db.su(`select 1 from shared_items where student_id = $1`, [w.student(2)])).toHaveLength(0);
  });

  it("V-SH2 only with a teacher of a class the student is in now", async () => {
    expect(await share(w.student(2), w.entry[2], w.teacher2)).toBe("not_your_teacher");
    expect(await share(w.student(2), w.entry[2], w.teacherB)).toBe("not_your_teacher");
    expect(await share(w.student(2), w.entry[2], w.adminA)).toBe("not_your_teacher");
    expect(await share(w.student(13), w.entry[13], w.teacher1)).toBe("not_your_teacher");
  });

  it("V-SH3 the teacher gets a copy as it was then; later edits aren't shared, and the entry itself stays unreadable", async () => {
    await w.db.as(w.student(1), `update journal_entries set response = 'edited afterwards' where id = $1`, [w.entry[1]]);
    const rows = await inbox(w.teacher1);
    expect(rows[0].response).toBe("private words of student 1");
    expect(rows[0].prompt).toBe("Prompt");
    expect(nothing(await w.db.as(w.teacher1, `select * from journal_entries where id = $1`, [w.entry[1]]))).toBe(true);
  });

  it("V-SH5 the student can see what they've shared and take it back", async () => {
    expect(await share(w.student(3), w.entry[3], w.teacher1)).toBe("ok");
    const mine = await w.db.as(w.student(3), `select entry_id from shared_items`);
    expect(mine.rows).toEqual([{ entry_id: w.entry[3] }]);
    await w.db.as(w.student(3), `delete from shared_items where entry_id = $1`, [w.entry[3]]);
    expect((await inbox(w.teacher1)).map((r) => r.student_name)).toEqual(["Student 1"]);
  });

  it("V-SH5 a student can't take back someone else's share, and can't edit a shared copy", async () => {
    await w.db.as(w.student(2), `delete from shared_items`);
    await w.db.as(w.student(1), `update shared_items set response = 'rewritten'`);
    const rows = await inbox(w.teacher1);
    expect(rows).toHaveLength(1);
    expect(rows[0].response).toBe("private words of student 1");
  });

  it("V-SH6 only the one teacher it was sent to can read it", async () => {
    for (const who of [w.adminA, w.teacher2, w.teacherB, w.platform, w.student(2)]) {
      expect(await inbox(who), who).toHaveLength(0);
      expect(nothing(await w.db.as(who, `select * from shared_items`)), who).toBe(true);
    }
    // Not even the teacher reads the table; only the function.
    expect(nothing(await w.db.as(w.teacher1, `select * from shared_items`))).toBe(true);
  });

  it("V-SH7 only journal entries can be shared: a self-check or check-in id is refused", async () => {
    const check = (await w.db.su(`select id from self_checks where student_id = $1`, [w.student(1)]))[0].id;
    expect(await share(w.student(1), check, w.teacher1)).toBe("not_yours");
    const fns = await w.db.su(
      `select proname from pg_proc where pronamespace = 'public'::regnamespace and proname ~ '^share_'`
    );
    expect(fns).toEqual([{ proname: "share_entry" }]);
  });
});

describe("when a share ends on its own", () => {
  it("V-SH9 leaving the class takes back what was shared with its teacher", async () => {
    expect(await share(w.student(4), w.entry[4], w.teacher1)).toBe("ok");
    await w.db.as(w.student(4), `delete from class_members where class_id = $1`, [w.c9A.id]);
    expect((await inbox(w.teacher1)).map((r) => r.student_name)).not.toContain("Student 4");
    expect(await w.db.su(`select 1 from shared_items where student_id = $1`, [w.student(4)])).toHaveLength(0);
  });

  it("V-SH9 being removed by the teacher does the same", async () => {
    expect(await share(w.student(5), w.entry[5], w.teacher1)).toBe("ok");
    await w.db.as(w.teacher1, `select remove_from_class($1, $2)`, [w.c9A.id, w.student(5)]);
    expect(await w.db.su(`select 1 from shared_items where student_id = $1`, [w.student(5)])).toHaveLength(0);
  });

  it("V-SH9 deleting the entry removes the copy", async () => {
    expect(await share(w.student(2), w.entry[2], w.teacher1)).toBe("ok");
    await w.db.as(w.student(2), `delete from journal_entries where id = $1`, [w.entry[2]]);
    expect(await w.db.su(`select 1 from shared_items where student_id = $1`, [w.student(2)])).toHaveLength(0);
  });

  it("V-SH9 when the class gets a new teacher, what was shared with the old one is deleted", async () => {
    expect((await inbox(w.teacher1)).length).toBeGreaterThan(0);
    const r = await w.db.as(w.adminA, `update classes set teacher_id = $1 where id = $2 returning id`, [w.teacher2, w.c9A.id]);
    expect(r.rows).toHaveLength(1);
    expect(await inbox(w.teacher1)).toHaveLength(0);
    // And the new teacher doesn't inherit it.
    expect(await inbox(w.teacher2)).toHaveLength(0);
    expect(await w.db.su(`select 1 from shared_items where class_id = $1`, [w.c9A.id])).toHaveLength(0);
  });
});
