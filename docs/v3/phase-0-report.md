# Groundwork v3: Phase 0 report

12 November 2026. Branch `v3`, 12 commits ahead of `origin/v3` (this report included), **not pushed**. Phase 1 has not been started and won't be until David approves Phase 0 in chat.

**State of the checks on the last commit:** `npm run lint` passes, `npm run build` passes, `npm run check:phrases` passes (42 cases), `npm test` passes (44 tests), the Selves validator passes (0 failures), the schema check passes (93 checks). `npm run audit` was **not run**: it needs Playwright and a browser installed, and Phase 0 changed no screen. The build was run on the commits that touched code, not on the documents-only commits.

**Nothing in v2 was changed.** `src/app`, `src/components`, the v2 libraries, `supabase/schema.sql` and `supabase/migrations/` are identical to `origin/main`.

## 0. Three things that happened before any Phase 0 task

1. **The brief wasn't at `docs/v3/BRIEF.md`.** It is at `docs/v3/source/brief.md`, with an identical copy beside it as `Groundwork-v3-build-brief.md`. The HTML master is at `docs/v3/source/Who am I becoming_ The Selves.html`, not the path the brief names. I used the files where they are (D14).
2. **`v3` had been cut from a stale `main`.** The local `main` was 88 commits behind `origin/main`. The brief describes the repo at PR #75; on the stale base the evidence reviews, `scripts/audit`, migrations 017–021 and six of the nine selves were missing. I merged `origin/main` into `v3` (D12). A merge, so `origin/v3` needs no force-push.
3. **Your unpushed commit `11abf85` is not in `v3`.** "Who Was I?: clearer questions and tap-to-answer options" sits on your local `main` only. `origin/main` rewrote the same step separately, and merging both gave the activity two `starterOptions` blocks. I took `origin/main`'s version of the two files and left your commit where it is (D13). It needs your decision on `main`.

## 1. What was built

| File | What it is |
| --- | --- |
| `docs/v3/SPEC.md` | Appendix A of the brief, verbatim. |
| `docs/v3/DECISIONS.md` | The decision log: D1–D11 from the spec, D12–D26 from this phase. |
| `docs/v3/navigation.md` | Every v3 route for the student app, teacher, school-admin and platform areas; what each reuses or replaces; the new-student flow; v2 screens with no v3 home. |
| `docs/v3/visibility.md` | Spec section 3 as 72 numbered rules a test can check, for all four roles; the 5-or-more rule; "Share with my teacher"; the safeguarding components that carry over; a plain-language page for the wellbeing lead. |
| `src/lib/v3/content.ts` | TypeScript types: `Level`, `Self`, `Story`, `DraftStory`, `MediaItem`, `ContentOverride`, and the `content_items` body shapes for self, strength, activity, story, cluster and subject. |
| `scripts/v3/validate-selves.ts` | Reads `LEVELS` and `SELVES` out of the HTML master, maps each field to v3, validates all 26, and writes the merge report. Exits 1 on any failure. |
| `docs/v3/selves-validation.md` | The validator's output: pass or fail per self, curation gaps, D3 wording, and the v2-against-master merge report. Generated; don't edit by hand. |
| `supabase/v3/schema.sql` | The schema draft: 31 tables, row security on every one, `class_patterns()` and the other functions, each policy commented with its rule. **Not applied anywhere.** |
| `scripts/v3/check-schema.mjs` | Loads the draft into an in-memory Postgres and runs 93 access checks against it. |
| `src/lib/v3/ageBands.ts` | Spec section 8's table as data, `allowedRatings(yearLevel, schoolSettings, mode)`, and three small helpers. |
| `src/lib/v3/ageBands.test.ts` | 44 unit tests, including one that tries 5,292 combinations of settings and checks none exceeds the maximum. |
| `vitest.config.mts`, `package.json` | Vitest, with `npm test`. |
| `.gitignore`, `.idea/` | The committed `.idea/` folder removed in its own commit, and ignored. It held no secrets. |

## 2. The validator's output

**All 26 selves pass. 0 failures.** Seven levels and 26 selves were found; every key matches spec section 5's list and sits on the level the spec gives it; every icon exists in the master's icon set; every self has a story with a figure, at least two beats, a turn and a source line, and five teacher notes. No reflective prompt trips the risk-phrase check.

To show it can fail, I ran it on a copy with eleven faults put in (an unknown level, a missing hook, an empty source, no beats, four notes, an unknown icon, a risk-language prompt, a bad key, a missing entry, an extra field, a missing figure). It reported 16 failures and exited 1.

| Level | Selves | Result |
| --- | --- | --- |
| 1 Know myself | self-awareness, self-reflection, self-concept, self-image, social-self | 5 pass |
| 2 Value myself | self-esteem, self-worth, mattering, self-respect, self-acceptance, self-compassion | 6 pass |
| 3 Manage myself | self-regulation, self-discipline, self-motivation | 3 pass |
| 4 Believe in myself | self-efficacy, self-confidence, self-trust | 3 pass |
| 5 Direct myself | self-determination, self-advocacy, self-authorship | 3 pass |
| 6 Imagine myself | actual-self, ideal-self, ought-self, feared-self, possible-selves | 5 pass |
| 7 (named "Final level" in the master) | authentic-self | 1 pass |

### Curation gaps: 159, across all 26

These aren't failures. They are fields v3 requires that the HTML master has no place for. The validator lists them and fills none (D15).

| Gap | Selves |
| --- | --- |
| The story has no age band | all 26 |
| The story has no verified date, and nobody recorded as checking it | all 26 |
| One source line covers the story and the research together, with no address | all 26 |
| `builtBy` is free text ("Mission 1, Strengths Mapping."), not a structured link. The validator suggests links by matching real titles; one self (`self-confidence`) got no match. | all 26 |
| The Character Project line is St Paul's-specific, so it belongs in that school's override, not in central content | all 26 |
| The source cites Wikipedia | self-acceptance, ideal-self, possible-selves |

### D3 wording still in the master: 5 places

Level 7 is named "Final level" (line 153, and shown as "FINAL LEVEL" at lines 218 and 313); "Start at Level 1 at the bottom and level up" (line 247); the "Start at Level 1" button (line 250).

### Merge report: v2's nine selves against the master

42 of 54 text fields differ. Nothing has been merged. The full text of both versions, side by side, is in [selves-validation.md](selves-validation.md), section 7.

| Self | name | short | what | notThis | selfCheck | builtBy label |
| --- | --- | --- | --- | --- | --- | --- |
| self-concept | same | differs | differs | differs | same | differs |
| self-image | same | differs | differs | differs | differs | differs |
| self-reflection | same | differs | differs | differs | differs | differs |
| self-esteem | same | differs | differs | differs | same | differs |
| self-worth | same | differs | differs | differs | differs | differs |
| mattering | same | differs | differs | differs | differs | differs |
| self-confidence | same | differs | differs | differs | same | differs |
| self-efficacy | same | differs | differs | differs | same | differs |
| self-regulation (v2: self-control) | differs | differs | differs | differs | differs | differs |

The pattern, so you don't have to read all 42 to see it:

- **`short`**: v2 says "you", the master says "I" ("The picture in your head" / "The picture in my head"). One decision settles all nine.
- **`what` and `notThis`**: the master is the v2 text cut to about a third, to fit a slide. v2's version carries the examples and the reasoning.
- **`builtBy` label**: punctuation only, in seven of nine.
- **Three differences are not cosmetic**, and I'd keep v2's text for each:
  1. **Mattering, `selfCheck`.** v2 ends: "If either is hard to answer right now, that's common, it can change, and the support circle is a good place to start." The master drops that sentence. It is the line that catches a student who can't name anyone.
  2. **Self-reflection, `selfCheck`.** v2 ends by telling a student who "just feels worse" to stop, do something else for ten minutes, or talk it through. The master drops it.
  3. **Self-efficacy, `what`.** v2's text is the one corrected in the November evidence review (Bandura's four sources, with mastery first). The master's is a shortened form of it; check it still says what the review wanted.
- **Self-regulation, `notThis`**, names Zidane inside the definition ("Zidane had every reason to be furious"). If that story is ever swapped, the definition breaks. The story should stay in the story.

## 3. Decisions I made

All are in [DECISIONS.md](DECISIONS.md) with reasons. Each is open to reversal.

| # | Decision |
| --- | --- |
| D12 | Merged `origin/main` into `v3` to fix the stale base. |
| D13 | Left your unpushed commit `11abf85` out of `v3`. |
| D14 | Used the brief and HTML master where you committed them; didn't rename. |
| D15 | The validator separates failures from curation gaps and never fills a gap. |
| D16 | A student's `school_id` is worked out by the database from their class and can't be set by the client. |
| D17 | Staff get no policy on any student table. Three functions are their only window. |
| D18 | A hidden figure is a dash, not "fewer than 5". |
| D19 | A figure is also hidden when the *remainder* is 1–4, and a class under 5 gets no figures. **Stricter than the spec.** |
| D20 | "Share with my teacher" copies the entry; it doesn't grant access to it. |
| D21 | Three age bands. No class, or an unknown year level, means G and PG only. |
| D22 | Added three tables the spec doesn't list: `self_progress`, `shared_items`, `media_hidden`. |
| D23 | Teacher notes live in their own column that no signed-in role can select. |
| D24 | The schema is checked in an in-memory Postgres (PGlite), installed with `--no-save`, not added to `package.json`. |
| D25 | Lesson mode is capped at the band's maximum too. **Stricter than the spec's table**; follows the brief. |
| D26 | Vitest (yours). It needed `vite` as a second dev dependency. |

## 4. Where I think the spec is wrong or risky

In rough order of how much I'd want them settled before Phase 1.

1. **The 5-or-more rule doesn't protect anyone once the teacher has the roster.** The spec gives teachers names and gives them counts. "22 of 24 opened it" passes the rule and tells the teacher two named students didn't. I added complementary suppression (D19). The cost is real: on a class of 24 where most students take part, the patterns screen will be mostly dashes. That may make the screen useless, and you should see it on realistic numbers before deciding. The alternative is to accept the leak and say so to the wellbeing lead.
2. **The self-check can't suggest seven of the 26 selves.** Rule 3 says to pick "the self within that level whose item scored lowest", with three items per level. Level 1 has five selves, Level 2 has six, Level 6 has five. With one item per self, two selves in Level 1, three in Level 2 and two in Level 6 can never be suggested. Level 7 has the opposite problem: three items, one self. Either the items don't map one-to-one to selves (then rule 3 needs rewriting), or the count isn't 21.
3. **"No scores" and "average the three items and rank the levels" are in tension.** The student never sees a number, which is the rule that matters. But the suggestion is a ranking of seven means of three Likert items, where one point on one item changes the result. That is fine for "where might I start"; it isn't fine if a class pattern built from it is read as "our Year 9s are weak at Level 3". The teacher screen's wording has to prevent that reading.
4. **The master includes three selves that v2's own evidence review argued against.** `self-outcomes-map.md` says self-acceptance should be folded into self-worth and self-compassion ("a separate lens would duplicate them"), rates self-respect "weak as a measured construct", and says to avoid the label "self-determination" because in disability education it means something different (Wehmeyer). D5 makes the HTML the master, so all three are in. The spec asks for the evidence review to be re-run on the 17 new selves; these three are where it will bite.
5. **"Share with my teacher" opens a disclosure channel the spec doesn't mention.** A student who shares an entry may be telling a teacher something that triggers the school's child-protection duties. The spec treats sharing as a privacy feature. It is also a safeguarding feature, and the school needs a process for it. I've put this to the wellbeing lead in `visibility.md` section 9 and marked it as not checked against Queensland law or school policy. I would not build the feature until that conversation has happened.
6. **A new student gets two questionnaires in a row.** v2 asks the outcome check-in at onboarding. The spec adds the self-check there. That is 35 statements (14 and 21) before a student has seen anything. Proposal: self-check at onboarding (it produces something the student uses straight away), outcome check-in a few days later from Home. That changes the evaluation's baseline timing, so it is your call.
7. **`school_id` on every student row adds risk for little gain.** The spec wants it so row security can keep schools apart. But no staff role can read those tables at all, and `class_patterns()` goes through class membership. The column goes stale when a student changes school or sits in classes at two schools. I've included it, as the brief asks, set by a trigger (D16). I'd drop it from the student tables and keep it on the tenancy tables only.
8. **Lesson mode has no cap in the spec.** "The school's film policy" would let a school set MA15+ for Year 8. I capped it (D25). The trade-off is that a school whose policy genuinely allows an M film in Year 10 with a consent note can do that, but nothing above.
9. **Join codes need more than six characters' worth of protection.** Anyone signed in who has the code can join, appear on the roster and count in the patterns. Phase 1 needs rate-limiting on `join_class()`, and I'd add an allowed-email-domains setting per school so a code only works for that school's accounts.
10. **Three stories cite Wikipedia, and none is verified.** I checked no story fact. Some teacher notes will date ("Zidane is now coaching France"). All 26 need a person's check before a student sees them, which is the Phase 2 gate.
11. **Scope.** The spec's own top risk, and I agree with it. Phase 1 alone is roles, tenancy, two sign-in providers, class codes, a content import for 3,500 lines of copy, a new shell and access tests. I'd split it (section 6).

Three findings about **v2**, not the spec:

- **The AI boundary is held by the browser, not the server.** `/api/reflect` accepts any text. Private steps stay away from it only because `ActivityClient` doesn't call it for them. Nothing leaks today, but one new caller could break rule 6 without any server check noticing. v3's rule V-C4 moves the check into the route. Worth doing on `main` too.
- **`supabase/schema.sql` isn't current**, though the README says it is. It lacks `outcome_checkins`, `small_steps`, `users.ai_reflections_enabled`, `story_reads.opened_at` and the four totals views, which exist only in migrations. A fresh v2 database built from `schema.sql` alone would be missing them.
- **v2 has 20 migration files** (002–021), not 21.

**Unverified.** I did not check the spec's claims about the Children's Online Privacy Code date, the under-16 YouTube rules, the *Slumdog Millionaire* classification, the ACARA v9.0 and Work Studies position, or the SET plan. They are in `SPEC.md` as you wrote them and I added no new claim of that kind to any document.

## 5. Questions for David

1. Your unpushed commit `11abf85` (Who Was I? wording): push it over `origin/main`'s version, merge the two by hand, or drop it?
2. Complementary suppression (D19): keep it and accept more dashes, or relax to the spec's plain 5-or-more?
3. The self-check: 21 items that can't reach seven selves, or one item per self (26)?
4. Self-acceptance, self-respect and "self-determination": keep all three as the master has them, or act on the evidence review now?
5. For the nine merged selves, `short` in first person ("my") as the master has it, or second person ("your") as v2 has it?
6. For `what` and `notThis`: v2's long text on the student's page and the master's short text on the projected slide, or one text for both?
7. The outcome check-in at onboarding: keep it there beside the self-check, or move it to Home a few days later?
8. v2's three-phase journey (`journey_phase`, the phase banner): keep in v3 or retire?
9. v2's gating in Grow (program after Mission 1; weeks 3, 6, 9 after their mission): keep, or does D3 mean no gates anywhere?
10. Lesson mode capped at the band's maximum (D25): agreed?
11. Drop `school_id` from the student tables (item 7 above), or keep it as the spec says?
12. Make PGlite a real dev dependency so the schema check runs in CI, or leave it `--no-save`?
13. Delete the duplicate `docs/v3/source/Groundwork-v3-build-brief.md`, and rename the HTML master to `who-am-i-becoming.html`?
14. Icons: the master's line-icon names, or v2's emoji, for the 26 selves?
15. Who is the wellbeing lead for the Phase 0 sign-off, and do you want `visibility.md` section 9 as a one-page PDF for them?

Still open from the brief, not needed yet: D11 (before Phase 3), first cohort (before Phase 2 content), lesson mode's visual style (before Phase 2).

## 6. Proposed Phase 1 plan

Phase 1 is the shell: schools, roles, sign-in, class codes, content import, v2 content in. I'd run it as four parts, each ending in something you can check, and I'd ask before starting each.

### 1a. Database and access tests (no screens)

- **Steps:** stand up a local Supabase. Apply `supabase/v3/schema.sql` to it. Port the 93 checks in `check-schema.mjs` to Vitest against the real local instance, one test per `visibility.md` rule, and add the ones PGlite can't cover (real auth, real default grants). Add the schema test for rule V-C2. Add a test that `small_count()` equals `SMALL_COUNT`.
- **Files:** `supabase/v3/schema.sql`, new `supabase/v3/tests/*`, `package.json`, a CI workflow (there is none yet).
- **Needs from you:** agreement to add the Supabase CLI as a dev tool, and Docker on your machine.
- **Risk:** real Supabase grants differ from my stub. That is exactly what this part is for.

### 1b. Content import

- **Steps:** write `scripts/v3/import-content.ts`. It reads `missions.ts`, `program.ts`, `strengths.ts`, `boosts.ts`, `pathways.ts` and `selves.ts`, validates each item against `content.ts`, and writes `content_items` rows. The v2 files stay in place and stay the source; nothing is deleted from them in Phase 1.
- **Proving no copy is lost:** a round-trip test. Import every item, read it back out of the database, rebuild the v2 object, and compare it with the original, deep-equal, for every mission step, week, strength, boost and cluster. Plus a count of every string in the v2 files against every string that arrived.
- **Files:** new `scripts/v3/import-content.ts`, `src/lib/v3/content.ts`, tests.
- **Risk:** `missions.ts` has functions and stage variants, not just data. Some of it won't serialise as it stands. I'd report what doesn't before changing any of it.

### 1c. Roles, sign-in and class codes

- **Steps:** Microsoft sign-in and magic links beside Google. `/join` and `join_class()`, with rate-limiting. Middleware that refuses `/teach`, `/school` and `/platform` by role. A bare teacher screen: classes, a join code, the roster. A bare school-admin screen: create a class, invite a teacher.
- **Files:** `src/middleware.ts`, `src/app/auth/*`, new `src/app/join`, `src/app/teach`, `src/app/school`, `src/lib/v3/roles.ts`.
- **Needs from you:** an Azure app registration for Microsoft sign-in, and a test Supabase project. I won't touch the live one.
- **Risk:** v2's middleware protects a fixed list of paths that doesn't include `/program`, `/next`, `/story` or `/check-in`; those pages each redirect a signed-out visitor themselves. That works, but a new page that forgets to is open. v3's middleware should refuse by default and allow by list.

### 1d. The new shell, with v2 content in it

- **Steps:** a new `AppShell` with the five tabs. Move v2's screens to the routes in `navigation.md` with their components unchanged. Redirect the old routes. The Me tab shows v2's nine selves; the 26 are Phase 2.
- **Files:** `src/components/layout/AppShell.tsx`, most of `src/app/*` (moves, not rewrites), `scripts/audit/lib.js` (its route list).
- **This is the part that touches more than ten files**, so it gets its own plan and your go-ahead first.

### How v2 parity is proved

1. **Content:** the round-trip test in 1b.
2. **Screens:** `npm run audit` (theme, phone, scroll, speech) passes on the new shell in all five looks, as it does on `main`, with its route list updated to the new routes. Its screenshots of each v2 screen on `main` are compared with the same screen in its new home.
3. **Safety:** `npm run check:phrases` passes unchanged. `help.ts`, `hardOnSelf.ts`, `SupportCard`, `GentleCheck`, `GetHelpButton` and `HelpLines` show an empty `git diff` against `main`. A new audit check loads every signed-in route and fails if "Need to talk?" is missing.
4. **Access:** the tests in 1a, in CI, on every commit.
5. **A written checklist** of every v2 route from `navigation.md` section 7, each ticked by hand against the running app.
6. **`main` is never touched.** v2 stays deployed from it throughout.

### Risks across Phase 1

- **Two sources of truth for content** while v2's files and the database both hold it. Controlled by keeping the files as the source and the database as a build output until Phase 2.
- **`v3` drifting from `main`.** If v2 keeps changing on `main`, `v3` needs regular merges. A v2 freeze, or a rule that v2 fixes land on `main` first and are merged across weekly, would help.
- **The Phase 0 gate isn't passed yet.** It needs the wellbeing lead's sign-off on `visibility.md`. Part 1a is safe to start before that, since it only tests the rules as written; 1c and 1d build on them.

## 7. After David's review (12 Nov 2026)

David answered the questions in section 5. His answers are D27–D39 in [DECISIONS.md](DECISIONS.md), and sections 1–6 above are left as they were written. What changed in the repo as a result:

- `school_id` removed from the 18 student-owned tables in the schema draft (D29). The schema check still passes, 93 checks.
- PGlite is a dev dependency, run with `npm run check:schema` (D37).
- The duplicate brief is deleted and the master is `docs/v3/source/who-am-i-becoming.html` (D38).
- `navigation.md`: the outcome check-in moves to Home (D33), the three-phase journey becomes a setting (D34), the self-check has one statement per self (D30), and Grow is proposed ungated (D35).
- Commit `11abf85` is PR #76 against `main` (D27).

David then confirmed the open points (D40–D45): 25 selves, no gates in Grow, the journey as a school setting that is off by default, `short` in second person, and no wellbeing-lead handout for now. **Phase 0 was approved on 12 Nov 2026 (D45).**

