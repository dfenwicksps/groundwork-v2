// Section 4 of docs/v3/visibility.md: the 5-or-more rule.
// Each test builds its own class state, so each gets a fresh database.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SMALL_COUNT } from "../../../src/lib/completionCounts";
import { patterns, seedWorld, type World } from "./db";

let w: World;
beforeEach(async () => {
  w = await seedWorld();
});
afterEach(async () => {
  await w.db.close();
});

const levels = (p: Record<string, number | null>) =>
  [1, 2, 3, 4, 5, 6, 7].map((i) => p[`self_check/level-${i}`]);

/** Replace 9A's self-checks: `sets[i]` is the levels suggested to student i+1. Taken two days ago. */
async function selfChecks(sets: number[][]) {
  await w.db.su(`delete from self_checks`);
  for (let i = 0; i < sets.length; i++) {
    await w.db.su(
      `insert into self_checks (student_id, item_set, answers, suggested, taken_at) values ($1, 'v1', '{}', $2, now() - interval '2 days')`,
      [w.student(i + 1), JSON.stringify({ levels: sets[i] })]
    );
  }
}

describe("the minimum group", () => {
  it("V-K1 the database's minimum is the app's SMALL_COUNT, not a second number", async () => {
    const r = await w.db.su(`select public.small_count() as n`);
    expect(r[0].n).toBe(SMALL_COUNT);
  });

  it("V-K1 safe_count() follows small_count() at every size up to 30", async () => {
    for (let outOf = 0; outOf <= 30; outOf++) {
      const rows = await w.db.su(
        `select n, public.safe_count(n, $1::int) as shown from generate_series(0, $1::int) as n`,
        [outOf]
      );
      for (const { n, shown } of rows) {
        const rest = outOf - n;
        const hide = outOf < SMALL_COUNT || (n > 0 && n < SMALL_COUNT) || (rest > 0 && rest < SMALL_COUNT);
        expect(shown, `${n} of ${outOf}`).toBe(hide ? null : n);
      }
    }
  });

  it("V-K2 a count between 1 and 4 is hidden", async () => {
    // Seed: 8 took it, all pointed at level 2, three at level 3.
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["self_check/level-3"]).toBeNull();
    expect(p["self_check/level-2"]).toBe(8);
  });

  it("V-K3 nothing is broken down when the number who took it is itself too small to show", async () => {
    await selfChecks([[2], [2], [2]]); // 3 of 8
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["self_check/taken"]).toBeNull();
    expect(Object.keys(p).filter((k) => k.startsWith("self_check/level-"))).toEqual([]);
  });

  it("V-K4 a class under the minimum reports nothing but that it is too small", async () => {
    const p = await patterns(w, w.teacher1, w.cSmall.id);
    expect(p).toEqual({ "class/too_small": null });
    // The school admin gets no more than the teacher.
    expect(await patterns(w, w.adminA, w.cSmall.id)).toEqual({ "class/too_small": null });
  });

  it("V-K5 a count is hidden when the students who didn't number 1 to 4", async () => {
    await selfChecks([[2], [2], [2], [2], [2], [2]]); // 6 of 8: two didn't
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["class/members"]).toBe(8);
    expect(p["self_check/taken"]).toBeNull();
  });

  it("V-K6 when exactly one level would be hidden, the next-smallest is hidden with it", async () => {
    // 8 took it. Level 1: 8. Level 2: 8. Level 3: 3 (hidden). Others: 0.
    await selfChecks([[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2], [1, 2], [1, 2], [1, 2], [1, 2]]);
    const shown = levels(await patterns(w, w.teacher1, w.c9A.id));
    expect(shown[2]).toBeNull();
    expect(shown.filter((v) => v === null)).toHaveLength(2);
  });

  it("V-K7 a count of zero is shown as 0", async () => {
    await w.db.as(w.teacher1, `insert into class_focus (class_id, item_key, starts_on) values ($1, 'self-worth', current_date - 3)`, [w.c9A.id]);
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["focus/self-worth:opened"]).toBe(0);
    expect(p["focus/self-worth:done"]).toBe(0);
  });

  it("V-K7 but zero is hidden when everyone else numbers 1 to 4", async () => {
    const r = await w.db.su(`select public.safe_count(0, 3) as a, public.safe_count(0, 8) as b, public.safe_count(5, 5) as c`);
    expect(r[0]).toEqual({ a: null, b: 0, c: 5 });
  });

  it("V-K8 the hidden figure never leaves the database: the teacher's own query holds null", async () => {
    const r = await w.db.as(w.teacher1, `select * from class_patterns($1) where key = 'level-3'`, [w.c9A.id]);
    expect(r.rows).toEqual([{ section: "self_check", key: "level-3", students: null, out_of: 8 }]);
    // And the teacher has no other route to the true figure.
    const direct = await w.db.as(w.teacher1, `select count(*)::int as n from self_checks`);
    expect(direct.rows).toEqual([{ n: 0 }]);
    const fn = await w.db.su(`select prosecdef from pg_proc where proname = 'class_patterns'`);
    expect(fn).toEqual([{ prosecdef: true }]);
  });

  it("V-K10 class_patterns() takes a class and nothing finer", async () => {
    const fns = await w.db.su(
      `select pg_get_function_identity_arguments(oid) as args from pg_proc
        where pronamespace = 'public'::regnamespace and proname = 'class_patterns'`
    );
    expect(fns).toEqual([{ args: "p_class uuid" }]);
  });

  it("V-K11 a self-check taken today isn't counted until tomorrow", async () => {
    await selfChecks([[2], [2], [2], [2], [2], [2]]);
    for (const n of [7, 8]) {
      await w.db.as(w.student(n), `insert into self_checks (student_id, item_set, answers, suggested) values ($1, 'v1', '{}', '{"levels":[2]}')`, [w.student(n)]);
    }
    // All 8 have now taken it, but two did so today: still 6 of 8, still hidden.
    expect((await patterns(w, w.teacher1, w.c9A.id))["self_check/taken"]).toBeNull();
    await w.db.su(`update self_checks set taken_at = now() - interval '1 day' where taken_at >= current_date`);
    expect((await patterns(w, w.teacher1, w.c9A.id))["self_check/taken"]).toBe(8);
  });

  it("V-K11 a student who joined today isn't counted until tomorrow", async () => {
    const r = await w.db.as(w.student(13), `select * from join_class($1)`, [w.c9A.join_code]);
    expect(r.rows).toHaveLength(1);
    expect((await patterns(w, w.teacher1, w.c9A.id))["class/members"]).toBe(8);
  });

  it("V-K11 only each student's most recent self-check is counted", async () => {
    // Everyone retakes yesterday and is pointed at level 5 instead.
    for (let n = 1; n <= 8; n++) {
      await w.db.su(
        `insert into self_checks (student_id, item_set, answers, suggested, taken_at) values ($1, 'v1', '{}', '{"levels":[5]}', now() - interval '1 day')`,
        [w.student(n)]
      );
    }
    const p = await patterns(w, w.teacher1, w.c9A.id);
    expect(p["self_check/taken"]).toBe(8);
    expect(levels(p)).toEqual([0, 0, 0, 0, 8, 0, 0]);
  });
});
