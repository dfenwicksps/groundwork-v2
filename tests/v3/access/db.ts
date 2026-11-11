// ─── Test database for the access tests ──────────────────────────────────────
// Loads supabase/v3/schema.sql into an in-memory Postgres (PGlite) and seeds
// two schools. Every test asks its question the way a signed-in user would:
// the `authenticated` role, with auth.uid() set to that user.
//
// What this proves: the schema's row security, grants and functions keep the
// rules in docs/v3/visibility.md on Postgres.
// What it does NOT prove: Supabase's own auth schema, roles and default
// grants are stubbed in STUB below. The tests only use `su()` and `as()`, so
// pointing them at a real local Supabase later means writing a second
// `openDb()` over a Postgres connection; no test changes.
//
// Nothing outside this process is touched. No live project, no network.

import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export interface Result {
  rows: Row[];
  error: string | null;
}

export interface Db {
  /** As the database owner: for set-up and for looking at what really happened. */
  su(sql: string, params?: unknown[]): Promise<Row[]>;
  /** As a signed-in user (or signed out, with null). Errors are returned, not thrown. */
  as(uid: string | null, sql: string, params?: unknown[]): Promise<Result>;
  close(): Promise<void>;
}

/** What Supabase provides before any of our SQL runs. */
const STUB = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

const UUID = /^[0-9a-f-]{36}$/;

export async function openDb(): Promise<Db> {
  const pg = new PGlite();
  await pg.exec(STUB);
  await pg.exec(readFileSync(resolve(process.cwd(), "supabase/v3/schema.sql"), "utf8"));

  return {
    async su(sql, params) {
      await pg.exec("reset role; select set_config('request.jwt.claim.sub', '', false)");
      return (await pg.query(sql, params as unknown[])).rows as Row[];
    },
    async as(uid, sql, params) {
      if (uid !== null && !UUID.test(uid)) throw new Error(`not a user id: ${uid}`);
      await pg.exec(
        `reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${uid ? "authenticated" : "anon"}`
      );
      try {
        const r = await pg.query(sql, params as unknown[]);
        return { rows: r.rows as Row[], error: null };
      } catch (e) {
        return { rows: [], error: e instanceof Error ? e.message : String(e) };
      } finally {
        await pg.exec("reset role");
      }
    },
    close: () => pg.close(),
  };
}

// ─── The seeded world ────────────────────────────────────────────────────────
//
//   School A (QLD)                               School B (NSW)
//     admin: adminA                                admin: adminB
//     9A     teacher1   students 1-8               10X  teacherB  students 12, 14
//     Small  teacher1   students 9-11
//     9B     teacher2   students 14-19
//
//   student 13 has no class. Student 14 is in a class at each school.
//   platform: the platform admin, on no school's staff.
//
// Every student has one journal entry ("private words of student N"). Students
// 1-8 took the self-check two days ago: all of them were pointed at level 2,
// and students 1-3 at level 3 as well. Everyone joined ten days ago.

const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export interface ClassRef {
  id: string;
  join_code: string;
}

export interface World {
  db: Db;
  platform: string;
  adminA: string;
  adminB: string;
  teacher1: string;
  teacher2: string;
  teacherB: string;
  /** student(1) to student(19). */
  student(n: number): string;
  schoolA: string;
  schoolB: string;
  c9A: ClassRef;
  cSmall: ClassRef;
  c9B: ClassRef;
  c10X: ClassRef;
  /** The journal entry id of each student, by number. */
  entry: Record<number, string>;
}

/** The tables a student owns rows in (docs/v3/visibility.md, section 2), with the owner column. */
export const STUDENT_TABLES: Record<string, string> = {
  onboarding_results: "user_id",
  journal_entries: "user_id",
  challenges: "user_id",
  support_circle: "user_id",
  mission_progress: "user_id",
  story_reads: "user_id",
  goals: "user_id",
  practice_log: "user_id",
  moral_profiles: "user_id",
  standard_checkins: "user_id",
  program_progress: "user_id",
  strength_profiles: "user_id",
  outcome_checkins: "user_id",
  small_steps: "user_id",
  conversation_requests: "user_id",
  self_checks: "student_id",
  self_progress: "student_id",
  shared_items: "student_id",
};

export const STUDENT_COUNT = 19;

export async function seedWorld(): Promise<World> {
  const db = await openDb();
  const platform = uid(1), adminA = uid(2), teacher1 = uid(3), teacher2 = uid(4), teacherB = uid(5), adminB = uid(6);
  const student = (n: number) => uid(100 + n);

  const people: [string, string][] = [
    [platform, "Platform"], [adminA, "Admin A"], [teacher1, "Teacher One"],
    [teacher2, "Teacher Two"], [teacherB, "Teacher B"], [adminB, "Admin B"],
  ];
  for (let i = 1; i <= STUDENT_COUNT; i++) people.push([student(i), `Student ${i}`]);
  for (const [id, name] of people) {
    await db.su(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
      id, `${name.replace(/ /g, ".").toLowerCase()}@example.com`, JSON.stringify({ full_name: name }),
    ]);
  }

  const schoolA = (await db.su(`insert into schools (name, state) values ('School A', 'QLD') returning id`))[0].id;
  const schoolB = (await db.su(`insert into schools (name, state) values ('School B', 'NSW') returning id`))[0].id;
  await db.su(`insert into platform_admins (user_id) values ($1)`, [platform]);
  await db.su(
    `insert into staff (user_id, school_id, role) values
       ($1, $2, 'school_admin'), ($3, $2, 'teacher'), ($4, $2, 'teacher'), ($5, $6, 'teacher'), ($7, $6, 'school_admin')`,
    [adminA, schoolA, teacher1, teacher2, teacherB, schoolB, adminB]
  );

  const mk = async (school: string, teacher: string, name: string, year: number): Promise<ClassRef> =>
    (await db.su(
      `insert into classes (school_id, teacher_id, name, year_level) values ($1, $2, $3, $4) returning id, join_code`,
      [school, teacher, name, year]
    ))[0] as ClassRef;
  const c9A = await mk(schoolA, teacher1, "9A", 9);
  const cSmall = await mk(schoolA, teacher1, "Small", 9);
  const c9B = await mk(schoolA, teacher2, "9B", 9);
  const c10X = await mk(schoolB, teacherB, "10X", 10);

  const join = async (n: number, c: ClassRef) => {
    const r = await db.as(student(n), `select * from join_class($1)`, [c.join_code]);
    if (r.error || r.rows.length !== 1) throw new Error(`seed: student ${n} couldn't join: ${r.error}`);
  };
  for (let i = 1; i <= 8; i++) await join(i, c9A);
  for (let i = 9; i <= 11; i++) await join(i, cSmall);
  await join(12, c10X);
  for (let i = 14; i <= 19; i++) await join(i, c9B);
  await join(14, c10X);
  await db.su(`update class_members set joined_at = now() - interval '10 days'`);

  const entry: Record<number, string> = {};
  for (let i = 1; i <= STUDENT_COUNT; i++) {
    const r = await db.as(
      student(i),
      `insert into journal_entries (user_id, mission_id, activity_id, prompt, response)
       values ($1, 1, 'x', 'Prompt', $2) returning id`,
      [student(i), `private words of student ${i}`]
    );
    if (r.error) throw new Error(`seed: journal entry for student ${i}: ${r.error}`);
    entry[i] = r.rows[0].id;
  }

  for (let i = 1; i <= 8; i++) {
    const r = await db.as(
      student(i),
      `insert into self_checks (student_id, item_set, answers, suggested, taken_at)
       values ($1, 'v1', '{"a1": 4}', $2, now() - interval '2 days')`,
      [student(i), JSON.stringify({ steady: [1], levels: i <= 3 ? [2, 3] : [2], selves: ["self-worth"] })]
    );
    if (r.error) throw new Error(`seed: self-check for student ${i}: ${r.error}`);
  }

  return {
    db, platform, adminA, adminB, teacher1, teacher2, teacherB, student,
    schoolA, schoolB, c9A, cSmall, c9B, c10X, entry,
  };
}

/** class_patterns() as a lookup: "section/key" -> students (null when suppressed). */
export async function patterns(w: World, who: string, classId: string): Promise<Record<string, number | null>> {
  const r = await w.db.as(who, `select * from class_patterns($1)`, [classId]);
  if (r.error) throw new Error(r.error);
  const out: Record<string, number | null> = {};
  for (const x of r.rows) out[`${x.section}/${x.key}`] = x.students;
  return out;
}

/** True when the query gave this user nothing: no rows, or a refusal. */
export function nothing(r: Result): boolean {
  return r.rows.length === 0;
}
