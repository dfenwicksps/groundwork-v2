// Section 6 of docs/v3/visibility.md: what's stored, and the rules the media
// table keeps for itself (spec section 8).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedWorld, type World } from "./db";

let w: World;
beforeAll(async () => {
  w = await seedWorld();
  await w.db.su(
    `insert into content_items (kind, key, version, status, body, teacher_body)
     values ('self', 'self-worth', 1, 'published', '{"name":"Self-worth"}', '{"notes":["for the teacher"]}')`
  );
});
afterAll(async () => {
  await w.db.close();
});

describe("teacher notes", () => {
  it("V-C1 no signed-in role can select teacher_body from the table, by name or with *", async () => {
    for (const who of [w.student(1), w.student(13), w.teacher1, w.adminA, w.platform]) {
      expect((await w.db.as(who, `select teacher_body from content_items`)).error, who).not.toBeNull();
      expect((await w.db.as(who, `select * from content_items`)).error, who).not.toBeNull();
      const body = await w.db.as(who, `select body from content_items where key = 'self-worth'`);
      expect(JSON.stringify(body.rows), who).not.toContain("for the teacher");
    }
  });

  it("V-C1 teacher_notes() gives a student nothing, in a class or not", async () => {
    for (const who of [w.student(1), w.student(13)]) {
      const r = await w.db.as(who, `select teacher_notes('self-worth') as t`);
      expect(r.rows[0]?.t ?? null, who).toBeNull();
    }
  });
});

describe("what the database can't hold", () => {
  it("V-C2 no column for a birth date, age, phone, address or location", async () => {
    const banned = ["dob", "birth", "birthday", "age", "phone", "mobile", "address", "postcode", "suburb", "lat", "lng", "location"];
    const cols = await w.db.su(
      `select table_name, column_name from information_schema.columns where table_schema = 'public'`
    );
    expect(cols.length).toBeGreaterThan(100);
    const hits = cols.filter((c) => (c.column_name as string).split("_").some((word) => banned.indexOf(word) !== -1));
    expect(hits).toEqual([]);
  });

  it("V-C2 every table in public has row security switched on", async () => {
    const off = await w.db.su(`select tablename from pg_tables where schemaname = 'public' and not rowsecurity`);
    expect(off).toEqual([]);
  });

  it("media: nothing above MA15+ can be stored", async () => {
    for (const rating of ["R18+", "R 18+", "X18+", "", "ma15+"]) {
      const r = await w.db.as(
        w.platform,
        `insert into media_items (type, title, creator, provider, rating, min_year_level, why, model, verified_at, verified_by)
         values ('book', 't', 'c', 'p', $1, 7, 'w', 'coping', current_date, 'a person')`,
        [rating]
      );
      expect(r.error, rating).not.toBeNull();
    }
  });

  it("media: a video needs an id, a start and end, captions and a transcript", async () => {
    const video = (over: Record<string, unknown>) => {
      const v: Record<string, unknown> = { embed_id: "abc", start_s: 0, end_s: 60, captions: true, transcript: "words", ...over };
      return w.db.as(
        w.platform,
        `insert into media_items (type, title, creator, provider, embed_id, start_s, end_s, captions, transcript, rating, min_year_level, why, model, verified_at, verified_by)
         values ('video', 't', 'c', 'p', $1, $2, $3, $4, $5, 'PG', 7, 'w', 'coping', current_date, 'a person')`,
        [v.embed_id, v.start_s, v.end_s, v.captions, v.transcript]
      );
    };
    expect((await video({})).error).toBeNull();
    expect((await video({ embed_id: null })).error).not.toBeNull();
    expect((await video({ end_s: null })).error).not.toBeNull();
    expect((await video({ start_s: 60, end_s: 60 })).error).not.toBeNull();
    expect((await video({ captions: false })).error).not.toBeNull();
    expect((await video({ transcript: null })).error).not.toBeNull();
  });

  it("media: a record can't be stored without who verified it and when", async () => {
    const r = await w.db.as(
      w.platform,
      `insert into media_items (type, title, creator, provider, rating, min_year_level, why, model)
       values ('book', 't', 'c', 'p', 'PG', 7, 'w', 'coping')`
    );
    expect(r.error).not.toBeNull();
  });

  it("join codes are six characters with no 0, O, 1, I or L, and differ between classes", async () => {
    const codes = (await w.db.su(`select join_code from classes`)).map((r) => r.join_code as string);
    for (const c of codes) expect(c).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
    expect(codes.filter((c, i) => codes.indexOf(c) === i)).toHaveLength(codes.length);
  });
});
