// Loads supabase/v3/schema.sql into an in-memory Postgres and checks the rules
// in docs/v3/visibility.md against it: who can read what, the 5-or-more rule,
// and "Share with my teacher". Nothing is installed in the app and nothing
// outside this process is touched.
//
//   npm install --no-save @electric-sql/pglite     # once; not an app dependency
//   node scripts/v3/check-schema.mjs
//
// PGlite isn't one of the app's dependencies, the same way Playwright isn't
// (scripts/audit/README.md): install it only where you run this.
//
// What this does NOT prove: Supabase's auth schema, roles and default grants
// are stubbed below, so a pass here says the schema parses and the rules hold
// on plain Postgres. Phase 1's access tests run against a local Supabase.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const schema = readFileSync(process.argv[2] ?? "supabase/v3/schema.sql", "utf8");
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { cond ? pass++ : fail++; console.log(`${cond ? "ok  " : "FAIL"} ${name}${cond ? "" : "  -> " + detail}`); };

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  -- What Supabase does for every new object in public:
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`);

try { await db.exec(schema); ok("schema loads", true); }
catch (e) { ok("schema loads", false, e.message); console.log(e); process.exit(1); }

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const P = U(1), SA = U(2), T1 = U(3), T2 = U(4), TB = U(5), SB = U(6);
const S = (i) => U(100 + i);

const su = async (sql, params) => { await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false)"); return db.query(sql, params); };
const as = async (uid, sql, params) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${uid ? "authenticated" : "anon"}`);
  try { const r = await db.query(sql, params); return { rows: r.rows, error: null }; }
  catch (e) { return { rows: [], error: e.message }; }
  finally { await db.exec("reset role"); }
};

// ── Set-up, as the database owner ───────────────────────────────────────────
for (const [id, name] of [[P, "Platform"], [SA, "Admin A"], [T1, "Teacher One"], [T2, "Teacher Two"], [TB, "Teacher B"], [SB, "Admin B"],
  ...Array.from({ length: 12 }, (_, i) => [S(i + 1), `Student ${i + 1}`])]) {
  await su(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [id, `${name}@example.com`, JSON.stringify({ full_name: name })]);
}
const [{ id: A }] = (await su(`insert into schools (name, state) values ('School A', 'QLD') returning id`)).rows;
const [{ id: B }] = (await su(`insert into schools (name, state) values ('School B', 'NSW') returning id`)).rows;
await su(`insert into platform_admins (user_id) values ($1)`, [P]);
await su(`insert into staff (user_id, school_id, role) values ($1,$2,'school_admin'), ($3,$2,'teacher'), ($4,$2,'teacher'), ($5,$6,'teacher'), ($7,$6,'school_admin')`, [SA, A, T1, T2, TB, B, SB]);
const mk = async (school, teacher, name, yl) => (await su(`insert into classes (school_id, teacher_id, name, year_level) values ($1,$2,$3,$4) returning id, join_code`, [school, teacher, name, yl])).rows[0];
const C1 = await mk(A, T1, "9A", 9), C2 = await mk(A, T2, "9B", 9), CB = await mk(B, TB, "10X", 10), CS = await mk(A, T1, "Small", 9);
ok("join code has the right shape", /^[A-HJKMNP-Z2-9]{6}$/.test(C1.join_code), C1.join_code);

// ── Students join ───────────────────────────────────────────────────────────
for (let i = 1; i <= 8; i++) {
  const r = await as(S(i), `select * from join_class($1)`, [C1.join_code.toLowerCase()]);
  if (i === 1) ok("V-S6 join_class returns the class", r.rows.length === 1 && r.rows[0].class_name === "9A" && r.rows[0].teacher_name === "Teacher One", JSON.stringify(r));
}
for (let i = 9; i <= 11; i++) await as(S(i), `select * from join_class($1)`, [CS.join_code]);
await as(S(12), `select * from join_class($1)`, [CB.join_code]);
ok("join_class with a wrong code returns nothing", (await as(S(1), `select * from join_class('ZZZZZZ')`)).rows.length === 0);
await su(`update class_members set joined_at = now() - interval '10 days'`);

let r = await as(S(1), `insert into class_members (class_id, student_id) values ($1, $2)`, [C2.id, S(1)]);
ok("V-S6 a direct insert into class_members fails", !!r.error, "no error");
r = await as(S(1), `select * from class_members`);
ok("V-S3 a student sees only their own membership", r.rows.length === 1 && r.rows[0].student_id === S(1), JSON.stringify(r));
r = await as(S(1), `select * from classes`);
ok("V-S5 a student can't select classes (join code)", r.rows.length === 0, JSON.stringify(r));
r = await as(S(1), `select * from my_classes()`);
ok("V-S5 my_classes gives the class without a code", r.rows.length === 1 && !("join_code" in r.rows[0]), JSON.stringify(r));
r = await as(S(1), `update users set year_level = 12 where id = $1 returning year_level`, [S(1)]);
ok("V-C3 a student in a class can't change their year level", r.rows[0]?.year_level === 9, JSON.stringify(r));

// ── Students write ──────────────────────────────────────────────────────────
const entries = {};
for (let i = 1; i <= 12; i++) {
  r = await as(S(i), `insert into journal_entries (user_id, school_id, mission_id, activity_id, prompt, response) values ($1, $2, 1, 'x', 'Prompt', $3) returning id, school_id`, [S(i), B, `private words of student ${i}`]);
  entries[i] = r.rows[0];
}
ok("V-S8 school_id is set by the database, not the client", entries[1]?.school_id === A, JSON.stringify(entries[1]));
ok("V-S8 a School B student is filed under B", entries[12]?.school_id === B);
r = await as(S(1), `update journal_entries set school_id = $1 where id = $2 returning school_id`, [B, entries[1].id]);
ok("V-S8 school_id can't be changed afterwards", r.rows[0]?.school_id === A, JSON.stringify(r));
r = await as(S(1), `insert into journal_entries (user_id, mission_id, activity_id, prompt) values ($1, 1, 'x', 'p')`, [S(2)]);
ok("V-S2 a student can't write a row as someone else", !!r.error);
r = await as(S(1), `select * from journal_entries`);
ok("V-S1/V-S2 a student reads only their own entries", r.rows.length === 1 && r.rows[0].user_id === S(1), `${r.rows.length}`);

// all 8 take the self-check; levels: everyone 2, three students also 3
for (let i = 1; i <= 8; i++) {
  const levels = i <= 3 ? [2, 3] : [2];
  r = await as(S(i), `insert into self_checks (student_id, item_set, answers, suggested, taken_at) values ($1, 'v1', '{}', $2, now() - interval '2 days')`, [S(i), JSON.stringify({ steady: [1], levels, selves: [] })]);
  if (r.error) ok("student inserts self-check", false, r.error);
}

// ── Staff can't read student tables ─────────────────────────────────────────
const studentTables = ["onboarding_results", "journal_entries", "challenges", "support_circle", "mission_progress", "story_reads", "goals", "practice_log", "moral_profiles", "standard_checkins", "program_progress", "strength_profiles", "outcome_checkins", "small_steps", "conversation_requests", "self_checks", "self_progress", "shared_items", "class_members"];
for (const [who, uid] of [["teacher", T1], ["school admin", SA], ["platform admin", P]]) {
  let leaked = [];
  for (const t of studentTables) { const q = await as(uid, `select * from ${t}`); if (q.rows.length) leaked.push(t); }
  ok(`V-T1..3 / V-A1 / V-P1 ${who} reads zero rows from all ${studentTables.length} student tables`, leaked.length === 0, leaked.join(","));
  const u = await as(uid, `select id from users`);
  ok(`${who} reads only their own users row`, u.rows.length === 1 && u.rows[0].id === uid, `${u.rows.length}`);
}
r = await as(T1, `update journal_entries set response = 'x'`);
const after = await su(`select count(*)::int n from journal_entries where response = 'x'`);
ok("V-T4 a teacher can't change a student's entry", after.rows[0].n === 0);
r = await as(null, `select * from users`);
ok("V-N1 signed-out: no rows from users", r.rows.length === 0 || !!r.error, JSON.stringify(r.rows));
r = await as(null, `select * from class_roster($1)`, [C1.id]);
ok("V-N1 signed-out can't call class_roster", !!r.error || r.rows.length === 0);
r = await as(null, `select * from get_conversation_request('nope')`);
ok("V-N2 signed-out can call get_conversation_request", !r.error, r.error);

// ── Roster ──────────────────────────────────────────────────────────────────
const n = async (uid, sql, p) => (await as(uid, sql, p)).rows.length;
ok("V-T5 teacher sees their roster (8)", (await n(T1, `select * from class_roster($1)`, [C1.id])) === 8);
ok("V-T6 another teacher in the same school sees none", (await n(T2, `select * from class_roster($1)`, [C1.id])) === 0);
ok("V-X1 a teacher at another school sees none", (await n(TB, `select * from class_roster($1)`, [C1.id])) === 0);
ok("V-A3 school admin sees the roster", (await n(SA, `select * from class_roster($1)`, [C1.id])) === 8);
ok("V-A3 another school's admin sees none", (await n(SB, `select * from class_roster($1)`, [C1.id])) === 0);
ok("V-P2 platform admin sees none", (await n(P, `select * from class_roster($1)`, [C1.id])) === 0);
ok("V-S4 a student sees none", (await n(S(1), `select * from class_roster($1)`, [C1.id])) === 0);
ok("V-S4 a student gets nothing from class_patterns", (await n(S(1), `select * from class_patterns($1)`, [C1.id])) === 0);
ok("V-T6 another teacher gets nothing from class_patterns", (await n(T2, `select * from class_patterns($1)`, [C1.id])) === 0);

// ── Patterns ────────────────────────────────────────────────────────────────
const pat = async (uid, cls) => Object.fromEntries((await as(uid, `select * from class_patterns($1)`, [cls])).rows.map((x) => [`${x.section}/${x.key}`, x.students]));
let p = await pat(T1, C1.id);
console.log("   patterns:", JSON.stringify(p));
ok("patterns: class size shown", p["class/members"] === 8);
ok("patterns: taken = 8 shown", p["self_check/taken"] === 8);
ok("V-K2 a count of 3 is hidden", p["self_check/level-3"] === null);
ok("level-2 = 8 shown", p["self_check/level-2"] === 8);
ok("V-K6 exactly one hidden -> next-smallest hidden too", Object.entries(p).filter(([k, v]) => k.startsWith("self_check/level-") && v === null).length === 2, JSON.stringify(p));
ok("V-T8 only counts come back", (await as(T1, `select * from class_patterns($1)`, [C1.id])).rows.every((x) => Object.keys(x).join() === "section,key,students,out_of"));
p = await pat(T1, CS.id);
ok("V-K4 a class of 3 reports nothing", Object.keys(p).join() === "class/too_small" && p["class/too_small"] === null, JSON.stringify(p));
// remainder rule: delete two self-checks -> 6 of 8 took it -> hidden
await su(`delete from self_checks where student_id in ($1, $2)`, [S(7), S(8)]);
p = await pat(SA, C1.id);
ok("V-K5 6 of 8 is hidden (remainder of 2)", p["self_check/taken"] === null && !("self_check/level-1" in p), JSON.stringify(p));
// V-K11: a self-check taken today isn't counted yet
await as(S(7), `insert into self_checks (student_id, item_set, answers, suggested) values ($1, 'v1', '{}', '{"levels":[2]}')`, [S(7)]);
await as(S(8), `insert into self_checks (student_id, item_set, answers, suggested) values ($1, 'v1', '{}', '{"levels":[2]}')`, [S(8)]);
p = await pat(T1, C1.id);
ok("V-K11 today's self-checks aren't counted until tomorrow", p["self_check/taken"] === null, JSON.stringify(p));
// focus
r = await as(T2, `insert into class_focus (class_id, item_key) values ($1, 'self-worth')`, [C1.id]);
ok("V-T10 a teacher can't set another class's focus", !!r.error);
r = await as(T1, `insert into class_focus (class_id, item_key, starts_on) values ($1, 'self-worth', current_date - 3)`, [C1.id]);
ok("V-T10 a teacher sets their own class's focus", !r.error, r.error);
ok("a student sees their class focus", (await n(S(1), `select * from class_focus`)) === 1);
ok("a student in another school doesn't", (await n(S(12), `select * from class_focus`)) === 0);
for (let i = 1; i <= 8; i++) await as(S(i), `insert into self_progress (student_id, self_key, opened_at, challenge_accepted_at) values ($1, 'self-worth', now() - interval '1 day', $2)`, [S(i), i <= 2 ? new Date(Date.now() - 86400000).toISOString() : null]);
p = await pat(T1, C1.id);
ok("focus: 8 of 8 opened is shown", p["focus/self-worth:opened"] === 8, JSON.stringify(p));
ok("V-K2 focus: 2 accepted is hidden", p["focus/self-worth:accepted"] === null);
ok("V-K7 focus: 0 done is shown", p["focus/self-worth:done"] === 0);

// ── Sharing ─────────────────────────────────────────────────────────────────
r = await as(S(1), `select share_entry($1, $2) as r`, [entries[1].id, T1]);
ok("V-SH1 a student shares their entry with their teacher", r.rows[0]?.r === "ok", JSON.stringify(r));
r = await as(S(1), `select share_entry($1, $2) as r`, [entries[1].id, T2]);
ok("V-SH2 not with a teacher who doesn't teach them", r.rows[0]?.r === "not_your_teacher");
r = await as(S(2), `select share_entry($1, $2) as r`, [entries[1].id, T1]);
ok("V-SH1 not someone else's entry", r.rows[0]?.r === "not_yours");
r = await as(T1, `select share_entry($1, $2) as r`, [entries[1].id, T1]);
ok("V-SH1 a teacher can't create a share", r.rows[0]?.r === "not_yours");
r = await as(S(1), `insert into shared_items (student_id, teacher_id, class_id, entry_id, prompt, response) values ($1,$2,$3,$4,'p','r')`, [S(1), T2, C2.id, entries[1].id]);
ok("V-SH1 a direct insert into shared_items fails", !!r.error);
r = await as(T1, `select * from shared_with_me()`);
ok("V-T9 the teacher reads the shared copy", r.rows.length === 1 && r.rows[0].response === "private words of student 1" && r.rows[0].student_name === "Student 1", JSON.stringify(r));
ok("V-SH6 the school admin doesn't", (await n(SA, `select * from shared_with_me()`)) === 0);
ok("V-SH6 another teacher doesn't", (await n(T2, `select * from shared_with_me()`)) === 0);
await as(S(1), `update journal_entries set response = 'edited later' where id = $1`, [entries[1].id]);
r = await as(T1, `select * from shared_with_me()`);
ok("V-SH3 a later edit isn't shared", r.rows[0]?.response === "private words of student 1");
await as(S(2), `select share_entry($1, $2)`, [entries[2].id, T1]);
r = await as(S(2), `delete from shared_items where entry_id = $1`, [entries[2].id]);
ok("V-SH5 unsharing removes it for the teacher", (await n(T1, `select * from shared_with_me()`)) === 1);
r = await as(S(1), `delete from class_members where class_id = $1`, [C1.id]);
ok("V-S7 a student can leave", !r.error && (await n(S(1), `select * from class_members`)) === 0);
ok("V-SH9 leaving takes back what was shared", (await n(T1, `select * from shared_with_me()`)) === 0);
ok("V-S7 leaving keeps the student's own entries", (await n(S(1), `select * from journal_entries`)) === 1);
r = await as(T1, `select remove_from_class($1, $2) as r`, [C1.id, S(3)]);
ok("V-T12 a teacher removes a student from their class", r.rows[0]?.r === true);
r = await as(T2, `select remove_from_class($1, $2) as r`, [C1.id, S(4)]);
ok("V-T12 but not from someone else's", r.rows[0]?.r === false);

// ── Content ─────────────────────────────────────────────────────────────────
await su(`insert into content_items (kind, key, version, status, body, teacher_body) values ('self','self-worth',1,'published','{"name":"Self-worth"}','{"notes":["secret"]}'), ('self','mattering',1,'draft','{}',null)`);
r = await as(S(1), `select body from content_items`);
ok("V-S9 a student reads published content only", r.rows.length === 1, JSON.stringify(r));
r = await as(S(1), `select teacher_body from content_items`);
ok("V-C1 a student can't select teacher_body", !!r.error, JSON.stringify(r.rows));
r = await as(T1, `select teacher_body from content_items`);
ok("V-C1 nor can a teacher, from the table", !!r.error);
r = await as(S(1), `select teacher_notes('self-worth') as t`);
ok("V-C1 teacher_notes() gives a student nothing", r.rows[0]?.t === null, JSON.stringify(r));
r = await as(T1, `select teacher_notes('self-worth') as t`);
ok("V-T13 teacher_notes() gives a teacher the notes", r.rows[0]?.t?.notes?.[0] === "secret", JSON.stringify(r));
r = await as(T1, `insert into content_items (kind, key, version, body) values ('self','x',1,'{}')`);
ok("V-T13 a teacher can't write central content", !!r.error);
r = await as(P, `insert into content_items (kind, key, version, body) values ('self','x',1,'{}')`);
ok("V-P4 the platform admin can", !r.error, r.error);
r = await as(SA, `insert into content_overrides (school_id, kind, item_key, op, body) values ($1,'self','self-worth','patch','{"localLink":"Session 9"}')`, [A]);
ok("V-A4 a school admin sets localLink", !r.error, r.error);
r = await as(SA, `insert into content_overrides (school_id, kind, item_key, op, body) values ($1,'self','mattering','patch','{"what":"changed"}')`, [A]);
ok("V-A6 a school admin can't patch `what`", !!r.error);
r = await as(SA, `insert into content_overrides (school_id, kind, item_key, op, body) values ($1,'self','mattering','hide',null)`, [B]);
ok("V-A4 nor write another school's override", !!r.error);
r = await as(T1, `insert into content_overrides (school_id, kind, item_key, op) values ($1,'self','mattering','hide')`, [A]);
ok("V-T13 a teacher can't write overrides", !!r.error);
ok("V-X2 School A's students see its override", (await n(S(2), `select * from content_overrides`)) === 1);
ok("V-X2 School B's don't", (await n(S(12), `select * from content_overrides`)) === 0 && (await n(SB, `select * from content_overrides`)) === 0);

// ── Tenancy ─────────────────────────────────────────────────────────────────
ok("V-X1 a School A student sees only School A", (await n(S(2), `select * from schools`)) === 1);
r = await as(SA, `update schools set name = 'hacked' where id = $1 returning id`, [B]);
ok("V-A5 an admin can't update another school", r.rows.length === 0);
r = await as(SA, `insert into staff (user_id, school_id, role) values ($1, $2, 'teacher')`, [T1, B]);
ok("V-A8 an admin can't add staff to another school", !!r.error);
r = await as(SA, `insert into platform_admins (user_id) values ($1)`, [SA]);
ok("V-A8 an admin can't make themselves platform admin", !!r.error);
r = await as(T1, `select * from classes`);
ok("V-T11 a teacher reads only the classes they teach", r.rows.length === 2 && r.rows.every((c) => c.teacher_id === T1), `${r.rows.length}`);
r = await as(P, `select * from platform_totals()`);
ok("V-P3 platform totals come back for the platform admin", r.rows.length === 5 && r.rows.every((x) => Object.keys(x).join() === "key,total"), JSON.stringify(r));
ok("V-P3 a small count of students is hidden; the number of schools is not", r.rows.find((x) => x.key === "schools").total === 2 && r.rows.find((x) => x.key === "students_on_their_own").total === null, JSON.stringify(r.rows));
console.log("   totals:", JSON.stringify(r.rows));
ok("V-P3 and for nobody else", (await n(T1, `select * from platform_totals()`)) === 0);

// ── Media constraints ───────────────────────────────────────────────────────
r = await as(P, `insert into media_items (type, title, creator, provider, embed_id, start_s, end_s, rating, min_year_level, why, model, captions, transcript, verified_at, verified_by) values ('video','t','c','p','abc',0,60,'R18+',7,'w','coping',true,'tr',current_date,'me')`);
ok("media: a rating above MA15+ is refused", !!r.error);
r = await as(P, `insert into media_items (type, title, creator, provider, embed_id, start_s, end_s, rating, min_year_level, why, model, captions, transcript, verified_at, verified_by) values ('video','t','c','p','abc',0,60,'PG',7,'w','coping',false,'tr',current_date,'me')`);
ok("media: a video without captions is refused", !!r.error);
r = await as(SA, `insert into media_items (school_id, type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by) values ($1,'book','t','c','p','PG',7,'w','coping',current_date,'me')`, [A]);
ok("V-A4 a school admin adds their school's own record", !r.error, r.error);
ok("V-X2 School B can't see it", (await n(S(12), `select * from media_items`)) === 0);
r = await as(SA, `insert into media_items (type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by) values ('book','t','c','p','PG',7,'w','coping',current_date,'me')`);
ok("V-P4 a school admin can't add a central record", !!r.error);

// ── Deleting an account ─────────────────────────────────────────────────────
await su(`delete from auth.users where id = $1`, [S(2)]);
r = await su(`select (select count(*) from journal_entries where user_id = $1)::int a, (select count(*) from self_checks where student_id = $1)::int b, (select count(*) from class_members where student_id = $1)::int c, (select count(*) from self_progress where student_id = $1)::int d`, [S(2)]);
ok("V-S11 deleting the account removes the student's rows", Object.values(r.rows[0]).every((v) => v === 0), JSON.stringify(r.rows[0]));

// ── V-C2: no column for date of birth, phone, address or location ───────────
r = await su(`select table_name, column_name from information_schema.columns where table_schema = 'public'`);
const banned = new Set(["dob", "birth", "birthday", "age", "phone", "mobile", "address", "postcode", "suburb", "lat", "lng", "location"]);
const hits = r.rows.filter((c) => c.column_name.split("_").some((w) => banned.has(w)));
ok("V-C2 no column holds a birth date, phone, address or location", hits.length === 0, JSON.stringify(hits));
r = await su(`select count(*)::int n from pg_tables where schemaname = 'public' and not rowsecurity`);
ok("every table in public has row security on", r.rows[0].n === 0, `${r.rows[0].n} without`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
