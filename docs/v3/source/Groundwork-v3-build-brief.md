# Groundwork v3: build brief for the coding agent

You're joining Groundwork as the lead developer for its v3 restructure. Groundwork is a teen identity-development and careers app built by David Fenwick, a Digital Technologies teacher and Year 9 Coordinator at St Paul's School, Bald Hills, Queensland. David is an experienced developer and curriculum designer. He wants complete, working output, not outlines. He also wants **targeted clarifying questions before any large build** rather than assumptions.

The full v3 specification is in **Appendix A** at the end of this brief. It is the source of truth. Where this brief and the spec disagree, the spec wins, unless David says otherwise in chat.

---

## 1. Where you're working

- **Repo:** `dfenwicksps/groundwork-v2` (Next.js 14 App Router, React 18, TypeScript, Tailwind 3, Supabase via `@supabase/ssr`, Anthropic SDK). Deployed on Vercel at `mygroundwork.vercel.app`.
- **Branch:** create `v3` from `main` and do all work there. Never commit to `main`. Keep v2 working and deployable from `main` throughout.
- **State of v2:** in testing. **No students use it and there is no production data to preserve.** That's why v3 can consolidate the 21 migrations into a fresh schema.
- **Key existing assets to read first, before writing anything:**
  - `README.md`
  - `docs/frameworks.md`, `docs/curriculum-alignment.md`
  - `docs/evidence/` (the evidence review, the self-outcomes map, the multimedia review, the evidence plan)
  - `docs/content-review/phrase-lists.md`
  - `src/lib/selves.ts`, `strengths.ts`, `becoming.ts`, `pathways.ts`, `nextChapter.ts`, `missions.ts`, `program.ts`, `boosts.ts`, `help.ts`, `hardOnSelf.ts`, `completionCounts.ts`
  - `src/components/layout/AppShell.tsx`, `src/components/help/*`
  - `supabase/schema.sql`, `supabase/migrations/`
  - `scripts/audit/`, `scripts/check-phrases.ts`, `scripts/completion-report.ts`
- **The Selves master content** is a standalone HTML file, "Who am I becoming? The Selves". Its `SELVES` and `LEVELS` arrays are the master copy for all 26 selves. If it isn't at `docs/v3/source/who-am-i-becoming.html`, **ask David to add it there before starting Phase 0, task 4.** Don't reconstruct its content from memory or from the spec's summary.

---

## 2. What to do in this session

**Phase 0 (Design) in full, then stop for David's review.** Don't start Phase 1 until David has approved Phase 0 in chat. The Phase 0 gate in the spec also needs a school wellbeing lead to sign off the visibility rules. David will arrange that; you just produce the documents.

### Phase 0 tasks

Commit each task separately on the `v3` branch.

1. **Save the spec and decisions.**
   - Commit Appendix A verbatim to `docs/v3/SPEC.md`.
   - Create `docs/v3/DECISIONS.md` as a decision log seeded with D1–D11 from spec section 1. Every later decision you or David make gets a new numbered entry with date, decision, reason and consequence.
2. **Navigation and screen map: `docs/v3/navigation.md`.**
   - List every v3 route for the student app (5 tabs) and the teacher and school-admin areas, with what each screen shows.
   - Show which v2 route or component it reuses or replaces.
   - Include the new-student flow from spec section 4.
   - Note any v2 screen that has no v3 home, and why.
3. **Visibility and safeguarding: `docs/v3/visibility.md`.**
   - Turn spec section 3 into testable rules, written as statements a test can check, e.g. "A user with role `teacher` can't select any row from `journal_entries`".
   - Cover all four roles, the 5-or-more rule (reuse `SMALL_COUNT` from `src/lib/completionCounts.ts`) and the student-initiated "Share with my teacher" path.
   - List the safeguarding components that must carry over unchanged.
4. **Content schema and validator.**
   - Define TypeScript types for v3 content: `Self`, `Level`, `Story`, `MediaItem`, `ContentOverride`, and the `content_items` body shapes for self, strength, activity, story, career cluster and subject.
   - Base them on spec sections 5, 8 and 10.
   - Write `scripts/v3/validate-selves.ts`. It extracts `LEVELS` and `SELVES` from the HTML master, maps each HTML field to its v3 field (spec section 5's mapping table), and validates all 26 entries.
   - It must report every entry that fails: missing field, unknown level, story without a source, and so on.
   - It must also print a merge report. For the 8 selves already in v2's `selves.ts`, plus self-control → self-regulation, list where the v2 and HTML text differ field by field, so David can choose. **Don't merge the text yourself.**
5. **Database schema draft: `supabase/v3/schema.sql`.** Draft only; don't apply it anywhere.
   - All tables from spec section 10, with Row Level Security policies that implement `visibility.md`.
   - The `class_patterns()` reporting function with the 5-or-more rule.
   - `school_id` added to the carried-over v2 student tables.
   - Comment each policy with the `visibility.md` rule it implements.
   - Leave `supabase/migrations/` and `supabase/schema.sql` untouched; v2 still uses them.
6. **Age bands and rating ceilings: `src/lib/v3/ageBands.ts`.**
   - Encode spec section 8's table: year level → age band → default ceiling, maximum the school can enable, lesson-mode rule.
   - Add a pure function `allowedRatings(yearLevel, schoolSettings, mode)` with unit tests.
   - The function must never return a rating above the "if the school enables it" column, whatever the school settings say.
7. **Phase 0 report** (see section 6 of this brief).

### Testing setup

v2 has no unit-test runner. **Ask David before adding one.** If he agrees, propose Vitest as the default, with a one-line reason.

---

## 3. Rules that are never broken

These come from v2's design and David's decisions. Treat them as tests, not preferences.

1. **Teachers and school admins never see an individual student's journal entries, reflections or self-check answers**, nor any count or share below 5 (D6). They see aggregates only, through reporting functions, never raw tables.
2. **Don't weaken the safety components:** `src/lib/help.ts` (`CRISIS_PATTERNS`, helplines), `src/lib/hardOnSelf.ts`, `SupportCard`, `GentleCheck`, and "Need to talk?" on every screen.
   - You may move them into the new shell.
   - Don't change their wording, patterns or behaviour without David's explicit approval.
   - `npm run check:phrases` must pass on every commit.
3. **The self-check is never a diagnostic.** No scores, numbers, percentages, labels or rankings shown to students or anyone else. Level 2 items are positively worded. Never ask risk-language questions (spec section 6).
4. **Levels are a map, not a ladder (D3).** No locks, progress bars, streaks or "level up" mechanics. An "explored" mark is the most allowed.
5. **Collect only what's needed:** no date of birth (year level is the age signal, D8), no phone numbers, no location. Free text never reaches the teacher layer.
6. **AI boundary:** private steps, weekly reflections, Next Chapter and My Story are never sent to the Anthropic API. This holds over from v2.
7. **Media:** never generate, guess or autocomplete a media URL or YouTube ID. Only a person adds media records. Embeds use youtube-nocookie.com, start and end times, no autoplay, captions on.
8. **Licensing:** don't add VIA survey items or items from published scales. Use strength *names* only. Self-check items are written fresh.
9. **No secrets in the repo.** Remove the committed `.idea/` folder in its own commit.
10. **Australian English.** Student-facing copy stays in v2's teen register: plain, warm, no clinical language. Match the existing copy in `selves.ts` and `missions.ts`.

---

## 4. How to work

- **Ask before large builds.** At each phase start and before any change touching more than ~10 files, post a short plan and the 2–4 decisions you need, then wait.
- **Disagree with reasons.** If the spec looks wrong, unsafe or over-built, say so plainly with your reasoning and a proposal. Don't diverge silently, and don't comply silently either. David wants a balanced view, not agreement.
- **Before every commit**, run `npm run lint`, `npm run build`, `npm run check:phrases` and `npm run audit` (once it works on the new shell). Fix failures, don't skip them.
- **Commits are small and named** `v3(phase-N): what changed`.
- **Ask before adding any dependency**, giving the reason and the alternative. Upgrading Next.js or React is out of scope unless David asks.
- **Never touch the live Supabase project or Vercel environment variables.** Use a local or branch Supabase instance for any testing.
- **Check claims about research, curriculum or law before writing them into docs or student copy.** David's v2 has a documented evidence review; keep to that standard. Flag anything you can't verify as unverified.
  - **Curriculum:** v3 aligns to the Australian Curriculum v9.0, not v8.4. Work Studies Years 9–10 is v8.4-only and optional; don't describe it as v9.0.
  - **Privacy:** the OAIC Children's Online Privacy Code is due to be registered by 10 December 2026. Design to high-privacy defaults and don't claim compliance with a code whose final text you haven't read.

---

## 5. Open questions for David

Raise these at the right point; don't block Phase 0 on them.

- **D11 confirmation:** a curated central list plus school overrides (the spec's assumption), or one central list only? Ask before Phase 3.
- **First cohort for 3.0:** Year 9 only, or Years 7–12? Ask before Phase 2 content work.
- **Test runner:** agreement to add Vitest (or an alternative). Ask in Phase 0.
- **Lesson mode and the HTML master:** should lesson mode reuse the HTML master's presenter layout and visual style, or adopt the app's design system? Ask before Phase 2.

---

## 6. The Phase 0 report

End the session with this report, then stop.

1. **What was built:** each file, one line each.
2. **The validator's output:** pass or fail per self, plus the v2-vs-HTML merge report as a table.
3. **Decisions you made:** each already added to `DECISIONS.md`.
4. **Where you think the spec is wrong or risky:** with reasons.
5. **Questions for David:** numbered, each answerable in a line.
6. **The proposed Phase 1 plan:** steps, files touched, risks, and how you'll prove v2 parity.

---

# Appendix A: Groundwork v3 Product and Technical Specification

11 November 2026 · David Fenwick

### 1. Purpose, scope and decisions

Groundwork v3 is a restructure of the existing `groundwork-v2` repo into a teacher-led, multi-school platform. It is built around the "Who am I becoming?" Selves map, VIA character strengths and an integrated careers pathway. It is not a rewrite from scratch: v2's content libraries, safety components and evidence work carry over (section 11).

**In scope:** roles and multi-school tenancy, new navigation, all 26 Selves, a self-check that suggests where to start, teacher lesson mode, an embedded and rated media library, careers (subject choice and post-school), and content that schools can edit.

**Out of scope for v3.0:** parent accounts, native mobile apps, AI-generated media recommendations, and individual-level teacher reporting (excluded by decision D6).

#### Decision log

| # | Decision | Source | Consequence for the build |
| --- | --- | --- | --- |
| D1 | v3 is a restructure of navigation and flow, with careers built in | David | Same repo, new app shell; content modules ported, not rewritten |
| D2 | A teacher leads the class | David | Teacher role, class management, lesson mode |
| D3 | Levels are a map students explore freely, by need | David | No locking or unlocking; the self-check suggests a starting point |
| D4 | A needs test comes first to show strengths and areas to work on | David | Self-check module (section 6), framed as "where to start", never a score |
| D5 | The "Who am I becoming?" HTML is the master copy (26 selves) | David | The poster (21 items) must be updated to match the HTML |
| D6 | Teachers never see individual self-check results | David | Class-level patterns only, with minimum group sizes (section 3) |
| D7 | Media is embedded in the app; the rating ceiling follows the user's age | David | Rated media library with age bands (section 8) |
| D8 | Year level is used as the age signal | David | No date of birth collected; year level maps to an age band |
| D9 | Audience is wider than St Paul's | David | Multi-school tenancy; meet the Children's Online Privacy Code |
| D10 | Careers covers both subject choice and post-school pathways | David | Two linked careers tracks (section 9) |
| D11 | Schools can edit content and media lists | David (read as: curated default list, school overrides) | Content is stored in the database with versioning and a per-school override layer (section 10) |

**Open on D11:** David answered "Yes" to an either/or question. This spec assumes a curated central list that each school can override. If he meant one list for everyone, sections 8 and 10 get simpler.

### 2. Users, roles and multi-school tenancy

v3 has four roles on a single hierarchy: a platform owns schools, a school owns classes, and a class holds one teacher plus students. Every row of student data carries a `school_id`. Supabase Row Level Security is enforced on that key so no school can read another school's data.

| Role | Who | Can do | Cannot do |
| --- | --- | --- | --- |
| Platform admin | You (Groundwork owner) | Manage the curated content and media library; onboard schools; view anonymous platform totals | See any student's entries or self-check answers |
| School admin | Wellbeing or ICT lead at each school | Create classes, invite teachers, set school overrides to content and media, set the school film policy, export class-level reports | See individual student data |
| Teacher | Class or pastoral teacher | Run lesson mode, assign selves, strengths or weeks to the class, see class-level patterns and participation counts | See journal entries, self-check answers or individual reflections |
| Student | Years 7–12 (Year 9 first) | Use the self-check, explore any self, journal, do weekly challenges, use careers tools, join a class with a code | See other students' data |

**Joining a class:** students join with a 6-character class code from the teacher, rather than teachers importing student lists. This keeps v3 out of each school's student information system for 3.0 and minimises the personal data held.

**Year level:** this is set when a student joins a class and copied from the class. Students don't enter an age (D8). It drives the age band used for media (section 8) and the existing `lifeStage` content variants.

**Students without a class:** v2's self-guided mode stays available. A student without a class gets the full student experience with no teacher layer. This keeps v3 usable at home and in schools that haven't onboarded.

**Single sign-on (SSO):** Google and Microsoft sign-in using school accounts. Schools mostly use one or the other, and it avoids passwords for 13–15 year olds. Email magic links remain the fallback.

### 3. Privacy, safeguarding and data visibility

Students own their own data. Teachers see the class as a group, never as individuals. Nothing a student writes or answers reaches an adult unless the student chooses to send it. This keeps v2's promise ("only you can see this") intact in a teacher-led product.

#### What each role can see

| Data | Student | Teacher | School admin | Platform admin |
| --- | --- | --- | --- | --- |
| Journal entries, reflections, letters | Own only | No | No | No |
| Self-check answers and suggested starting levels | Own only | No | No | No |
| Class pattern from the self-check, e.g. share of the class whose suggested start is Level 3 | No | Yes, if 5 or more students | Yes, if 5 or more | No |
| Participation: how many completed this week's activity | No | Count only, if 5 or more | Count only | Anonymous totals only |
| Who has joined the class (names) | No | Yes | Yes | No |
| Anything a student chooses to send, e.g. "Share with my teacher" on one entry | Yes | That item only | No | No |

The minimum group of 5 reuses v2's existing `SMALL_COUNT = 5` in `completionCounts.ts`. Below 5, a count or share is shown as a dash, so one student can't be identified in a small class or a subgroup.

#### Safeguarding

- **Kept from v2:** the on-device risk check (`CRISIS_PATTERNS`), the hard-on-yourself check, the support card (Kids Helpline, Lifeline, 13YARN, QLife), and "Need to talk?" on every screen.
- **Kept from v2:** the self-check never asks risk-language questions. The mattering item stays on the positive side, as `selves.ts` already notes.
- **New in v3:** a school-set "Who to talk to here" card, naming the school counsellor or wellbeing team and how to reach them, shown alongside the national helplines.
- **Decision needed with school wellbeing leads:** v2 deliberately tells no adult when the risk check fires. In a teacher-led product, some schools will expect escalation. This spec keeps v2's model: support routes, not monitoring. The reasons are that escalation from keyword matching gives false alarms, and it would break the privacy promise that makes students write honestly. Schools that need active monitoring should be told plainly that Groundwork doesn't provide it.

#### Compliance

- **Children's Online Privacy Code:** it must be registered by 10 December 2026 ([OAIC](https://www.oaic.gov.au/privacy/privacy-registers/privacy-codes/childrens-online-privacy-code)). Design to it from the start: high-privacy defaults, collecting only what's needed, a plain-language privacy notice for students, and deletion on request. The v2 `/api/delete-account` route carries over.
- **Data minimisation:** no date of birth, no phone number, no location, no free-text data sent to the teacher layer.
- **AI reflection:** the v2 rule stays. Private steps, weekly reflections, Next Chapter and My Story never go to the AI. Schools can switch the AI follow-up off for their tenancy.
- **Hosting:** run Supabase in the Sydney region (ap-southeast-2) for the Australian school market. Schools' privacy impact assessments will ask where data is stored.
- **Before onboarding a second school:** a privacy impact assessment and a school-facing data-processing agreement.

### 4. Information architecture and navigation

v3 replaces v2's five tabs (Home, Missions, Program, Journal, Me) with five that follow the question "Who am I becoming?": who I am now (Me), how I grow (Grow), where I'm heading (Future), and what I've written (Journal). Missions and the 10-week program merge into Grow. Next Chapter and pathways move into Future.

*(Diagram, as text.)* **Student app, 5 tabs:** Home (today's next step, class focus, Need to talk?) · **Me — the spine** (Selves map of 26, self-check, VIA strengths, Who I Am card) · Grow (10-week program, missions, living-it challenges, habits) · Future (possible selves, subject choice, pathways, Next Chapter) · Journal (private entries, revisits, The Standard). **Teacher app, 4 areas, no individual student data:** Classes (join codes, year level) · Lesson mode (present a self, set the class focus) · Library (curated + school edits, media and ratings) · Class patterns (groups of 5 or more, participation counts).

The highlighted tab is the new spine. Every Grow activity, media clip and careers prompt links back to a self or a strength in Me, so students always see why they're doing something.

#### Where v2's screens go

| v2 route | v3 home | Change |
| --- | --- | --- |
| `/dashboard` | Home | Adds the class focus set by the teacher and the suggested next self |
| `/me` (Selves, Standard, goals, habits, Future Self) | Me, Grow, Future, Journal | Split by purpose; Selves expands from 9 to 26 |
| `/missions`, `/program` | Grow | One list of journeys, each tagged to selves and strengths |
| `/next`, Pathways section | Future | Joined with the new subject-choice track |
| `/journal`, `/revisit` | Journal | Unchanged |
| `/stories` | Inside activities | Stories are offered at the step they model, as the multimedia review recommended, not as a separate tab |
| `/support` | Home and every screen | Unchanged, plus the school's own "Who to talk to here" card |

**Flow for a new student:** join a class with a code → a short welcome (the existing story film) → the self-check (about 6 minutes) → the Selves map with 2–3 suggested starting selves highlighted → Home.

### 5. The Selves module

All 26 selves from the HTML master become first-class content in Me. They're grouped into 7 levels, and students can open any level in any order (D3). 9 already exist in v2's `selves.ts`; 17 are new, and v2's self-control is renamed self-regulation to match the master.

#### The 26 selves

| Level | Question | Selves | Already in v2 |
| --- | --- | --- | --- |
| 1 Know myself | Who am I, really? | Self-awareness, self-reflection, self-concept, self-image, social self | Self-reflection, self-concept, self-image |
| 2 Value myself | Do I rate who I am? | Self-esteem, self-worth, mattering, self-respect, self-acceptance, self-compassion | Self-esteem, self-worth, mattering |
| 3 Manage myself | Can I steer myself? | Self-regulation, self-discipline, self-motivation | Self-control (renamed self-regulation) |
| 4 Believe in myself | Can I actually do this? | Self-efficacy, self-confidence, self-trust | Self-efficacy, self-confidence |
| 5 Direct myself | Where am I heading? | Self-determination, self-advocacy, self-authorship | None |
| 6 Imagine myself | Who could I be? | Actual, ideal, ought, feared and possible selves | None (Future Self covers part of this) |
| 7 Bringing it together | Am I being the real me? | Authentic self | None |

#### Wording changes to the master

These bring the master in line with D3 (explore freely):

- "Start at Level 1, then level up" becomes "Start wherever you need. The self-check can suggest where."
- "Final level" becomes "Bringing it together".
- Levels show no locks, no percentages and no progress bars. Each self a student has explored gets a simple "explored" mark only. This keeps v2's no-score, no-streak rule.

#### Content model: HTML fields to v3 fields

| HTML field | v3 field | Shown to | Notes |
| --- | --- | --- | --- |
| `key`, `name`, `level`, `icon` | `key`, `name`, `level`, `icon` | Everyone | `key` stays stable forever: journal entries and media link to it |
| `short` | `short` | Students | One-line description |
| `hook`, `fig`, `beats`, `turn` | `story` (a structured object) | Students and lesson mode | The real-person example; carries an age band and a `verified_at` date (below) |
| `is_`, `isnt` | `what`, `notThis` | Students | Same as v2's `selves.ts`, so v2 text can be merged |
| `ask` | `selfCheck` | Students | The reflective prompt; also feeds the journal |
| `living` | `livingIt` | Students | Becomes a Grow challenge the student can accept |
| `gw` | `builtBy[]` | Students | Structured links to activities, not free text, so links can't break after the restructure |
| `cp` | `localLink` | Students in that school | Character Project text is St Paul's-specific, so it becomes a school-overridable field |
| `notes` | `teacherNotes[]` | Teachers only, in lesson mode | Never sent to the student app |
| `src` | `sources[]` | Everyone, collapsed | Needed for evidence claims and for checking stories |

#### Rules for the real-person stories

- Each story carries an age band (section 8), because a story can be suitable for one year level and not another.
- Each story carries a `verified_at` date and is re-checked yearly, because celebrity facts change. For example, Nate in *Ted Lasso* (the mattering story) becomes an antagonist in season 2. Teacher notes should either address that or the story should be swapped.
- Where the research favours it, add a second, peer-age "struggle then cope" story alongside the celebrity one. v2's multimedia review found same-age coping models work better than polished success stories.
- Re-run the v2 evidence review's corrections across all 17 new selves before release. For example, self-respect is rated as a weak construct in `self-outcomes-map.md`, so its copy should not imply research certainty.

### 6. The self-check

The self-check is 21 short statements: 3 per level, about 5 minutes. It shows each student one or two levels where they're already steady and two or three selves that might be worth exploring next. It is a conversation starter, not a diagnostic: it gives no scores, no labels and no ranking, and only the student sees it (D4, D6).

#### Why not a validated test of all 26 selves

- **Length:** reliable measures need about 4–10 items per construct, which is over 100 items for 26 selves. Year 9 students won't answer that carefully.
- **Licensing:** most validated self-esteem, self-compassion and self-efficacy scales, and the VIA survey items, are copyrighted. They can't be built into a commercial or multi-school app without permission.
- **Purpose:** the only job here is to suggest where to start. Measuring change belongs to the separate check-in (`checkin.ts`), which already serves the evaluation plan.

#### Design rules

1. Items are written fresh for Groundwork in a teen register, on a 5-point scale from "Not like me" to "Very like me".
2. Every Level 2 item is phrased positively. No item asks about worthlessness, being a burden or wanting to disappear, consistent with v2's rule on mattering.
3. Each level's 3 items are averaged. The two highest levels are shown as "where you're already steady". The two lowest suggest 2–3 selves to explore, picking the self within that level whose item scored lowest.
4. The results screen shows words only, never numbers: "Already steady: Know myself. Might be worth exploring: Self-compassion, Self-trust."
5. Students can retake it once a term. Comparison is only with their own past results, using v2's revisit pattern.
6. The class sees one thing: the share of the class whose suggested start falls in each level, hidden below 5 students (section 3).

#### Example items (one per level, draft wording)

| Level | Example statement |
| --- | --- |
| 1 Know myself | When I'm upset, I can usually name what I'm actually feeling. |
| 2 Value myself | When I mess up, I talk to myself the way I'd talk to a friend. |
| 3 Manage myself | I can keep going on something boring when it matters to me. |
| 4 Believe in myself | When I promise myself I'll do something, I usually do it. |
| 5 Direct myself | I can say what I need to a teacher, even when it's awkward. |
| 6 Imagine myself | I can picture a version of me in five years that I'd like to be. |
| 7 Bringing it together | I act much the same way whoever I'm with. |

#### Before release

- Pilot the items with about 30 students and check for ceiling effects (everyone agreeing) and items students misread.
- Have a school psychologist or counsellor review the Level 2 items.
- Never describe it to schools or parents as a diagnostic or assessment. Call it the self-check.

### 7. Teacher lesson mode

Lesson mode turns the HTML master's presenter into a v3 screen. The teacher projects one self, steps through its story, runs the reflection, and then sets that self as the class focus. The focus appears on each student's Home with its living-it challenge. It must work with no student devices in the room, because schools such as St Paul's don't allow phones during school hours. Student follow-up happens later on laptops or at home.

#### The lesson sequence for one self

1. **Map:** the 7 levels on screen, with the chosen self highlighted.
2. **Hook:** the question on its own, e.g. "What are you worth on your worst day?"
3. **Story:** the beats shown one at a time, with the embedded clip if the school has approved one (section 8).
4. **Turn:** the one-line takeaway.
5. **What it is / isn't:** the distinction that does the teaching.
6. **Ask:** the reflective question, with an optional 20-second silent-thinking timer, as the HTML teacher notes suggest. No one is required to share.
7. **Living it:** the week's challenge.
8. **Set as class focus:** one button. It pushes the self and its challenge to students' Home for 7 days.

#### Presenter view

- **The projected screen** shows only student-facing content.
- **The teacher's own screen**, a second window or a tablet, shows the teacher notes, the source line, the story's verified date, the age band and the next step.
- **Keyboard:** arrow keys step through the sequence; Esc returns to the map.
- **Offline fallback:** a printable one-page lesson card for each self, exported as a PDF from the same content.

#### What the teacher sees afterwards

- How many students opened the focus self and accepted the challenge, as counts of 5 or more only.
- Never what any student wrote.

#### Lesson-mode content controls (school admin)

- Choose which stories and clips are available, and add the school's own (section 10).
- Edit `localLink`, e.g. "Connects to Character Project Session 9" at St Paul's.
- Hide any self the school doesn't want taught, for example while a topic is sensitive after a local event.

### 8. Media library

Videos, songs and books are curated records in the database. Each is tied to specific selves and strengths, rated, and shown at the moment it's needed: on a self's page, in lesson mode, or inside a Grow activity. There is never a feed. Video plays embedded inside Groundwork, so students aren't sent to YouTube itself.

#### Why embedded, not linked out

- **Without an account, YouTube's filters are gone.** Australians under 16 can't hold accounts but can still watch logged out ([Australian Government fact sheet](https://www.infrastructure.gov.au/sites/default/files/documents/social-media-minimum-age-and-age-assurance-trial-fact-sheet-july-2025.pdf)). YouTube says logged-out use removes the parental controls and safety filters built for young users ([Google](https://blog.google/intl/en-au/products/whats-changing-on-youtube-in-australia/)). A link out drops a 14-year-old into autoplay, recommendations and comments with none of those protections.
- **Embed settings:** the embedded player uses the privacy-enhanced domain (youtube-nocookie.com), fixed start and end times, no autoplay, and captions on by default. At the end, YouTube can still suggest videos from the same channel. Short end times and a careful choice of channel are the control.

#### Rating ceilings by year level (D7, D8)

| Year level (age band) | Student mode, default | Student mode, if the school enables it | Lesson mode |
| --- | --- | --- | --- |
| Years 7–8 (about 12–14) | G, PG | M | The school's film policy, set by the school admin |
| Years 9–10 (about 14–16) | G, PG | M | The school's film policy |
| Years 11–12 (about 16–18) | G, PG, M | MA15+ | The school's film policy |

These ceilings follow the Australian classification categories: M is not recommended for under 15s, and MA15+ is legally restricted for under 15s unless they are with a parent or guardian. Clips without an official rating, such as interviews, ads and talks, are rated by the curator using the same six classification elements: themes, violence, language, drug use, nudity and sex.

**Film titles have a second rule.** A G-rated clip can come from an MA15+ film; *Slumdog Millionaire*, on the VIA film list, is rated MA15+ for strong themes and violence ([Classification Board](https://www.classification.gov.au/titles/slumdog-millionaire-0)). Groundwork never suggests watching a full film rated above the student's ceiling, even when the clip itself is suitable.

#### Media types

| Type | Shown as | Rules |
| --- | --- | --- |
| Video | Embedded clip, usually under 4 minutes | Captions required, plus a transcript or a short written summary for students who prefer to read |
| Song | Title, artist and one line on why it fits; an embedded preview only where the provider allows it without sign-in | Clean versions only. Lyrics are never reproduced in the app |
| Book | Title, author, age band, one line on why, and a link to the school library catalogue | Schools add their library's search address in settings |
| Film (full) | Title, rating and why, as a "watch with family" suggestion | Filtered by the rating ceiling above |

#### Each media record holds

`type`, `title`, `creator`, `provider` and `embed_id`, `start_s` and `end_s`, `rating` with its descriptors, `min_year_level`, `selves[]` and `strengths[]`, `why` (one line), `model` (coping or mastery), `captions` (yes/no), `transcript`, `verified_at`, `verified_by`, `status` (active, broken or retired), and `school_id` (null for central records, set for a school's own).

#### Curation and checking

- **People choose, never AI.** AI can invent links and misjudge content. AI may help draft the `why` line, but a person approves every record.
- **Little, at the right moment.** At most 1 featured clip and 2 extras per self. This follows v2's multimedia review: decorative or extra media lowers learning, more so for students with ADHD.
- **A nightly link check:** a script added to `scripts/audit` asks YouTube whether each embedded video is still available. Removed or private videos are marked broken and hidden, and the curator is told.
- **A yearly review:** every record's `verified_at` is checked once a year, as the stories in section 5 are.

#### What schools can change (D11)

- Hide any central record.
- Add their own records, which carry their `school_id` and go through the same fields and the same link check.
- Lower a year level's rating ceiling. Schools can't raise it above the "if the school enables it" column.

### 9. Careers

Careers in v3 is two linked tracks in the Future tab. Track A is subject choice in Years 9–10, leading into Queensland's Year 10 SET plan or another state's equivalent. Track B is post-school pathways in Years 10–12. Both are built on the student's strengths, values and possible selves, so careers reads as the next chapter of "Who am I becoming?" and not a separate quiz. The stated goal holds throughout: leave school with a clear direction that can stay fluid.

#### Design principles

- **Exploratory, never prescriptive.** No "your ideal career is…" matching. v2's `pathways.ts` already frames clusters as "indicative and exploratory"; keep that.
- **Possible selves with a plan.** The strongest evidence in v2's evidence review is for specific possible selves paired with strategies (Oyserman's School-to-Jobs trials). Every career idea a student saves gets one next step and one obstacle-plus-response.
- **Linked to Levels 5 and 6.** Self-determination, self-authorship and the ideal, ought and feared selves are where the identity work and the careers work meet. The ought-self prompt ("whose expectations are in this choice?") appears at each subject decision.
- **The student decides what's shared.** A student can export a one-page "My subject thinking" or "My pathway thinking" summary to bring to a SET plan interview or a careers meeting. Nothing is sent automatically (D6).

#### Track A: subject choice (Years 9–10)

| Step | What the student does | Built from |
| --- | --- | --- |
| 1. What I bring | Sees their top VIA strengths and values side by side | v2 Strengths Mapping, Values Clarifier |
| 2. What I enjoy and do well | Rates current subjects on enjoyment and confidence, kept separate on purpose | New; links to self-efficacy (Level 4) |
| 3. Where it could lead | Sees which career clusters use the subjects they're drawn to | v2 `pathways.ts` (`subjects` per cluster) |
| 4. Whose choice is it | Notes any ought-self pressure on each subject | Ought self (Level 6) |
| 5. My subject thinking | Shortlist plus reasons, exportable | New |

Each school uploads its own subject list and prerequisites (D11). In Queensland, Track A is timed to finish before each school's SET plan interviews (the date is a school setting), so it feeds the SET plan, which students complete in Year 10 with their parents and school ([myQCE](https://myqce.qcaa.qld.edu.au/planning-your-pathway.html)).

#### Track B: post-school pathways (Years 10–12)

- **Clusters:** v2's career clusters, each with roles, related subjects and Australian next steps (university, TAFE/VET, apprenticeship, straight to work).
- **Possible-self plan:** a specific "me at 20" with one strategy for this term (Next Chapter, extended).
- **Outbound links**, labelled as leaving Groundwork: [myfuture](https://myfuture.edu.au) for national career information, and the state's admissions centre (QTAC in Queensland). These are information sites, not social media, so linking out is acceptable here.
- **Revisit each year:** the Year 11 and 12 student sees their Year 10 thinking beside today's, using v2's revisit pattern, so changing direction is shown as normal.

#### Multi-state note

The SET plan is a Queensland requirement. For schools in other states, the senior-planning document's name, timing and admissions-centre link are set in each school's settings.

### 10. Content architecture and data model

Central content stays in the repo as reviewed source files and is published to Supabase by an import script. School changes live in an override table on top. Each student sees: central version → minus what their school hides → plus what their school adds or edits.

This is a deliberate middle path. A full content-management system for central content would take weeks to build. Keeping git as the editor for central content means every change still goes through review, `check:phrases` and the evidence checks. Only schools need an editing screen.

#### Tables

| Area | Table | Key fields | Notes |
| --- | --- | --- | --- |
| Tenancy | `schools` | `id`, `name`, `state`, `settings` (film policy, library address, SET plan name and date, AI on/off) | One row per school |
| Tenancy | `staff` | `user_id`, `school_id`, `role` (school\_admin, teacher) | Platform admins are kept separately |
| Tenancy | `classes` | `id`, `school_id`, `teacher_id`, `year_level`, `join_code` | The year level drives the age band |
| Tenancy | `class_members` | `class_id`, `student_id`, `joined_at` | A student can be in more than one class |
| Content | `content_items` | `kind` (self, strength, activity, story, cluster, subject), `key`, `version`, `body` (JSON), `status` | Central content, published from the repo |
| Content | `content_overrides` | `school_id`, `item_key`, `op` (hide, patch, add), `body` | A school's layer |
| Content | `media_items`, `media_links` | Fields as in section 8; links to selves and strengths by `key` | A link is to a key, so content versions can change underneath |
| Teaching | `class_focus` | `class_id`, `item_key`, `starts_on`, `ends_on` | Set from lesson mode |
| Student | `self_checks` | `student_id`, `taken_at`, `answers`, `suggested` | Row Level Security: the student only |
| Student | v2 tables (`journal_entries`, `mission_progress` and others) | Add `school_id` (null for independent students) | Kept, not redesigned |
| Reporting | `class_patterns()` | A function returning counts per level and per focus | Runs with elevated rights but returns nothing below 5; teachers can't query raw student tables |

#### Rules

- **Content keys are permanent.** A journal entry stores `item_key` and `version`, so a revisit shows the wording the student actually answered.
- **No raw-table access above the student.** Teachers and school admins read only through reporting functions that apply the 5-or-more rule. This is tested in CI with the existing `scripts/audit` mock-Supabase setup.
- **Content stays out of components.** v2's `missions.ts` (1,985 lines) and `program.ts` (1,498 lines) become seed files. The import script validates them against a schema before publishing.

### 11. What carries over from v2

Most of v2 carries over. What changes is the shell around the content (navigation, roles, where content is stored), not the content or the safety work. v2 has no live students, so nothing needs migrating. Its 21 Supabase migrations can be consolidated into one clean v3 schema.

| v2 asset | Fate in v3 | Why |
| --- | --- | --- |
| `selves.ts` (9 selves, confused pairs) | Merged into the 26 from the HTML master | Same field shape; the confused-pairs prompts are kept |
| `strengths.ts`, `becoming.ts`, Strengths Mapping | Kept, moved to the Me tab | VIA-24 is the shared vocabulary across the app |
| `missions.ts`, `program.ts`, `boosts.ts` | Kept as seed content in Grow, tagged to selves and strengths | Already evidence-reviewed |
| `pathways.ts`, `nextChapter.ts` | Extended into the Future tab | The core of careers Track B |
| `help.ts`, `hardOnSelf.ts`, SupportCard, GentleCheck | Kept unchanged | Safety-critical and already co-design-planned |
| Revisits, The Standard, journal | Kept | Core to comparing yourself with your own past |
| Read-aloud (`speech.ts`), themes, device lock | Kept | Accessibility work already done |
| Story films (3) | Kept, offered inside activities | Following the multimedia review |
| `scripts/audit`, `check-phrases.ts`, `completion-report.ts` | Kept and extended (link checker, row-level access tests) | Quality gates |
| `docs/evidence/*` | Kept; re-run on the new content | The evidence base for schools |
| AppShell navigation, dashboard layout | Replaced | The restructure (section 4) |
| `.idea/` folder committed to the repo | Removed | Flagged in the April review; IDE files shouldn't be in the repo |
| 21 migrations | Consolidated into a fresh v3 schema | No production data to preserve |

**Repo approach:** create a `v3` branch in `groundwork-v2`. Keep the repo name (the v1 repo already uses `groundwork`), and merge v3 into the main branch when it passes the Phase 2 gate. Keep v2 deployed at its current address until v3 reaches feature parity, so the testing build stays usable.

### 12. Curriculum and framework alignment

v3 is mapped mainly to the Australian Curriculum v9.0 Personal and Social Capability and the Health and Physical Education learning area. Careers is aligned to Queensland's SET planning and the national career development framework.

**Note on Work Studies:** Work Studies Years 9–10 is not part of v9.0; it remains an optional curriculum on the v8.4 website ([ACARA](https://www.australiancurriculum.edu.au/f-10-curriculum/f-10-curriculum-overview/)). Groundwork can support schools that still teach it, but it shouldn't be marketed as a v9.0 alignment.

| Groundwork v3 | Framework | Element or strand | Strength of fit |
| --- | --- | --- | --- |
| Levels 1–2 (Know myself, Value myself) | AC v9.0 Personal and Social Capability | Self-awareness | Strong |
| Levels 3–5 (Manage, Believe in, Direct myself) | AC v9.0 Personal and Social Capability | Self-management | Strong |
| Social self, mattering, self-advocacy; The Standard | AC v9.0 Personal and Social Capability | Social awareness; Social management | Moderate |
| Selves, masks, identity work | AC v9.0 Health and Physical Education | Personal, social and community health strand | Moderate; map to specific Years 7–10 content descriptions before marketing |
| VIA strengths, The Standard, moral work | AC v9.0 Ethical Understanding | General capability | Moderate |
| Careers Track A | Queensland SET plan (Year 10) | QCAA and Department of Education SET planning | Strong for Queensland |
| Careers Tracks A and B | Australian Blueprint for Career Development | Personal management; learning and work exploration; career building | Strong |
| Careers (schools still using it) | AC v8.4 Work Studies Years 9–10 (optional) | Career and life design strand | Optional only |

**To verify before any school-facing claim:** this mapping is at the element level. Each row needs checking against the exact v9.0 sub-elements and content descriptions, with codes recorded in `docs/curriculum-alignment.md`, which already exists in the repo.

### 13. Build phases and acceptance criteria

v3 is built in six phases. Each phase ends at a gate that must be passed before the next begins. The Selves come before media and careers, because media and careers both link to self and strength keys. No dates are set: none have been agreed, and David's 2027 classes can run from the standalone HTML master while v3 is built.

*(Diagram, as text.)* 0 Design (navigation map, who sees what, content schema, age bands) → gate: wellbeing lead approves privacy · 1 Shell (schools, roles, SSO, class codes, content import, v2 content in) → gate: v2 parity, access tests pass · **2 Selves** (26 selves, self-check, lesson mode, class patterns) → gate: self-check piloted with ~30 students · 3 Media (library, rating ceilings, link checker, school edits) → gate: all media rated and verified · 4 Careers (subject choice, pathways, SET plan export) → gate: careers adviser reviews export · 5 Scale (privacy review, school contract, second school) → gate: second school live.

The highlighted phase is the first one students would notice. Phases 0 and 1 are foundations they never see.

#### Acceptance criteria

**Phase 0: Design**

- [ ] Navigation map and screen list agreed (section 4)
- [ ] Visibility table (section 3) reviewed and signed off by a school wellbeing lead
- [ ] Content schema for selves, media and overrides written and validated against all 26 HTML entries
- [ ] Age-band and rating-ceiling table confirmed (section 8)

**Phase 1: Shell**

- [ ] Schools, staff, classes and class codes working, with Google and Microsoft sign-in
- [ ] Row Level Security tests in CI prove a teacher can't read any student table directly
- [ ] All v2 content imported through the validated import script, with no copy lost
- [ ] `check:phrases` and the existing audits pass on the new shell

**Phase 2: Selves**

- [ ] All 26 selves live, with wording aligned to D3 (no "final level", no locks)
- [ ] Every story has an age band, a source and a `verified_at` date
- [ ] Self-check piloted with about 30 students; items revised; Level 2 items reviewed by a counsellor
- [ ] Lesson mode runs a full self from a projector with a separate presenter view
- [ ] Class patterns show nothing for groups under 5

**Phase 3: Media**

- [ ] At least one featured clip or book for every self, each rated and verified
- [ ] Rating ceilings enforced by year level in student mode; lesson mode follows the school's policy
- [ ] Nightly link checker running and alerting
- [ ] Schools can hide, add and lower ceilings

**Phase 4: Careers**

- [ ] Track A runs with a school's own subject list and exports "My subject thinking"
- [ ] Track B clusters extended from `pathways.ts`, with myfuture and admissions-centre links
- [ ] A careers adviser has reviewed the export against their SET plan interview

**Phase 5: Scale**

- [ ] Privacy impact assessment complete; checked against the registered Children's Online Privacy Code
- [ ] School data-processing agreement drafted
- [ ] A second school onboarded without code changes, only settings and overrides

### 14. Risks and open questions

The biggest risk is scope: v3 is a large build for one person alongside a full teaching load. The phase gates and the HTML master covering 2027 classes are the main controls.

#### Risks

| Risk | Mitigation |
| --- | --- |
| Scope outgrows the time available | Phases close at gates; the HTML master runs classes meanwhile; Phase 5 waits until 0–4 are stable |
| The self-check is read as a diagnostic or a label | No scores or numbers, "steady" and "explore" wording, never marketed as an assessment (section 6) |
| Schools expect safeguarding escalation that Groundwork doesn't provide | State it plainly in onboarding and the data agreement; decide the stance with wellbeing leads in Phase 0 |
| Schools' edits weaken the evidence base | Schools can hide, add, set `localLink` and lower ceilings, but can't edit central `what`, `notThis` or research claims |
| Embedded clips break or change | Nightly link checker and yearly review (section 8) |
| Film clips uploaded by fans breach copyright | Embed only from rights-holder or official channels; record the channel in `provider` |
| Celebrity stories date or turn sour | `verified_at`, a yearly review, a peer-age story beside each (section 5) |
| Licensed instruments slip in (VIA survey items, published scales) | Strength names only; self-check items written fresh; evaluation scales used only with permission |
| The Children's Online Privacy Code's start date and final text aren't confirmed | Build to high-privacy defaults now; re-check the registered Code before Phase 5 |

#### Open questions

- [ ] Confirm D11: curated central list plus school overrides, or one central list only?
- [ ] Safeguarding stance: agree with St Paul's wellbeing staff that v3 offers support routes, not monitoring.
- [ ] First cohort: Year 9 only in 3.0, or Years 7–12 from the start? This decides how much media is needed per age band.
- [ ] Media curation: who besides David curates and verifies, and how many hours a term does it need?
- [ ] Business model for other schools (free, per-school licence, grant-funded). This shapes the data agreement and hosting choices.
- [ ] Update the A3 poster to match the HTML master (26 selves, D3 wording).

#### Sources

- [Children's Online Privacy Code (OAIC)](https://www.oaic.gov.au/privacy/privacy-registers/privacy-codes/childrens-online-privacy-code)
- [Social Media Minimum Age fact sheet (Australian Government)](https://www.infrastructure.gov.au/sites/default/files/documents/social-media-minimum-age-and-age-assurance-trial-fact-sheet-july-2025.pdf)
- [What's changing for under 16s on YouTube in Australia (Google)](https://blog.google/intl/en-au/products/whats-changing-on-youtube-in-australia/)
- [Slumdog Millionaire classification (Classification Board)](https://www.classification.gov.au/titles/slumdog-millionaire-0)
- [F–10 Curriculum overview, v9.0 and Work Studies (ACARA)](https://www.australiancurriculum.edu.au/f-10-curriculum/f-10-curriculum-overview/)
- [Planning your pathway: SET plans (myQCE, QCAA)](https://myqce.qcaa.qld.edu.au/planning-your-pathway.html)
- Repo `dfenwicksps/groundwork-v2` at the merge of PR #75 (11 November 2026): `src/lib/selves.ts`, `pathways.ts`, `completionCounts.ts`, `docs/evidence/*`, `docs/content-review/phrase-lists.md`
- "Who am I becoming? The Selves" HTML (master copy), Selves A3 poster, VIA Character Strengths printable
