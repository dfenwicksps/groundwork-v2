# Theoretical frameworks behind Groundwork

This document records the psychological and developmental frameworks that underpin
identity development in the Groundwork app, and points to where each one shows up in
the codebase. It is a reference for contributors and reviewers — the app's content is
deliberately built on established research rather than generic self-help.

> **A note on attribution.** Some frameworks are named explicitly in the content or
> code comments (Erikson, Self-Determination Theory, Damon, McAdams, possible selves,
> social identity, the Berzonsky style names). Others are strongly implied by the
> terminology but not named verbatim — these are marked _(implied)_ below. Where a
> claim is described as "research shows…" in the app, treat it as a popularised summary
> for teenagers, not a precise citation.

---

## 1. The developmental backbone

### Erikson — psychosocial identity development
The entire programme is organised around Erikson's adolescent stage (**identity vs.
role confusion**): the central task of working out who you are. This is named directly
in the data model.

- **Where:** the `phase` field comment in [`src/lib/missions.ts`](../src/lib/missions.ts)
  (`"Identity development phase from Erikson's framework"`).

### Marcia — identity statuses
Marcia described identity by two things: how much a young person has explored, and how
much they have committed. The statuses are not a sequence. Longitudinal work (Meeus,
Crocetti, Luyckx) finds most adolescents stay in one status for years, many start with
commitments taken from home, and change runs in cycles of committing, exploring in depth
and reconsidering. v3 follows this with a map that has no order and no gates, and with the
revisit chain. The seven levels are a vocabulary for parts of the self, not developmental
stages. The `phase` field in `missions.ts` is a v2 label and does not describe an order
students move through.

| Mission | Theme | Question | Phase |
| --- | --- | --- | --- |
| 1 | Identity | Who am I? | Exploration |
| 2 | Purpose | What do I care about? | Commitment |
| 3 | Connection | Where do I belong? | Commitment |
| 4 | Meaning | What kind of life do I want? | Integration |

- **Where:** `phase: "exploration" | "commitment" | "integration"` and each mission's
  `phaseLabel` / `phaseDescription` in [`src/lib/missions.ts`](../src/lib/missions.ts).

### Berzonsky — identity processing styles (retired)
An earlier version detected Berzonsky's processing styles (informational, normative,
diffuse-avoidant) at onboarding and adapted how much "why" it showed. That code
(`processingStyle.ts`) no longer exists, and the app doesn't adapt by processing style. The
Quick / Extended / Open scaffolding (§2c) now does the job of meeting students where they
are, chosen by the student rather than inferred.

---

## 2. Frameworks by dimension

Each mission's activities draw on a specific body of research, captured in the
`whyItMatters` field of the relevant activity in
[`src/lib/missions.ts`](../src/lib/missions.ts).

### Mission 1 — Identity ("Who am I?")

The app frames identity in **three layers**, used as its own integrating scaffold (the
"Integrated Identity Framework"):

- **Inner compass** — strengths and values (the self felt from the inside).
- **Public self** — the version shown to others.
- **Social self** — the groups and relationships that shape you.

Underpinning research:

- **Self-Determination Theory (Deci & Ryan)** — *Values Clarifier.* Acting for reasons
  you endorse (autonomous motivation) rather than from pressure goes with higher wellbeing
  and more persistent motivation. The app doesn't claim that knowing your values changes
  behaviour on its own: values-affirmation results are mixed in large replications.
- **Authenticity and "false self" behaviour (Harter)**; **self-monitoring (Snyder)**
  _(implied)_ — *The Mask Check.* Some adjusting between rooms is normal; feeling you must
  hide large parts of yourself goes with stress and lower self-worth in adolescents.
  Authenticity relates to wellbeing at about r = .40 (Sutton, 2020).
- **Writing about yourself; distanced self-talk** — *Identity Letter (milestone).*
  Expressive-writing benefits for 10–18 year olds are small (g ≈ 0.13; Travagin et al.,
  2015), and the letter isn't the classic trauma-writing task, so the app claims only
  small benefits. Addressing yourself as "you" draws on Kross's distanced self-talk.
- **Strengths-based identity** — *Strengths Mapping.* Naming strengths in your own
  words activates them as part of identity, not just skills.

### Mission 2 — Purpose ("What do I care about?")

- **William Damon — youth purpose** — distinguishes being *engaged* (doing things) from
  being *purposeful* (knowing why); purposeful adolescents are more resilient.
- **Contribution-based purpose** — Damon's definition includes an aim you act on that
  matters beyond you; the app makes it specific so it can be acted on. (It no longer claims
  that specific purpose is proven to last longer; no study found compares the two.)
- **Community-supported purpose** — purposeful youth usually have mentors or peers who
  share or model their purpose (correlational).

### Mission 3 — Connection ("Where do I belong?")

- **Social Identity Theory (Tajfel & Turner)** _(framework named as "social identity")_
  — belonging and the groups that define us.
- **Bridging vs. bonding relationships (Putnam)** _(implied)_ — *Across the Gap.* The
  most resilient belonging is built through "bridging relationships" that cross real
  differences, not only within homogeneous groups.
- **Dan McAdams — narrative identity** — *The People Who Shaped You.* Each person is an
  "autobiographical author"; the people who shaped you are main characters in the story.
  (McAdams' empirical findings are about narrative themes such as agency and redemption,
  not about naming who shaped you, so the app doesn't attribute a specific finding to him
  here.)

### Mission 4 — Meaning ("What kind of life do I want?")

- **Possible selves (Markus & Nurius)** — *Future Self.* A clear, *specific* positive
  image of who you could become is one of the strongest predictors of motivated
  behaviour in adolescence; vague future selves have little effect.
- **Expressive writing / identity coherence** — *A Life Worth Building (milestone).*
  Writing to your future self builds continuity between present and future selves
  ("identity coherence"), which correlates with life satisfaction and better decisions.

### Across all missions — The Standard (recurring outward check-in)

Every other instrument in the app looks *inward* (what my strengths are, how I decide,
what my patterns look like) and is answered **once**. The Standard looks *outward* and is
answered **repeatedly**: three fixed questions about what the student is contributing to
the rooms they're in.

1. How am I making others feel safer and stronger?
2. How am I adding more value than I am consuming?
3. How am I being someone people can trust?

Underpinning research:

- **William Damon — contribution-based purpose.** Purpose becomes durable when it is
  framed as "something specific I contribute," not "I want to help people." These
  questions force the specific version by asking for a real person and a real moment.
- **Prosocial behaviour and adolescent wellbeing** _(implied)_ — acts of contribution
  predict wellbeing more reliably than acts of self-focused achievement; the check-in
  asks students to notice contributions they'd otherwise not register.
- **Trustworthiness as behavioural consistency** _(implied)_ — the third question
  deliberately defines trust as word-matching-action when unobserved, and as being the
  same person across rooms, which links it back to the Mask Check's self-monitoring gap.
- **Expressive writing / self-authorship (McAdams)** — because every check-in is kept and
  the previous answer is shown while writing the next, the student reads their own
  development back over months. The history *is* the intervention.

Design constraints that follow from the research:

- **No score and no streak** — consistent with the practice log's "a record, not a
  scoreboard" stance. Scoring character invites impression management, which is exactly
  what the questions are trying to defeat.
- **Each question carries a counterweight** (`harder` in
  [`src/lib/standard.ts`](../src/lib/standard.ts)) surfaced only once the student starts
  writing — "who feels *less* safe around me?" — so the exercise stays a mirror rather
  than becoming self-congratulation.

- **Where:** [`src/lib/standard.ts`](../src/lib/standard.ts) (questions, parsing, cadence),
  [`src/app/me/StandardSection.tsx`](../src/app/me/StandardSection.tsx) (UI + history),
  `standard_checkins` table in
  [`supabase/migrations/004_standard_checkins.sql`](../supabase/migrations/004_standard_checkins.sql).

---

## 2b. The 10-Week Character Program

The missions are a **library** — self-paced content explored in any order. The program is a
**cadence**: ten weeks, one focus each, each ending in a challenge that has to be lived
rather than written about. It exists because habit formation needs repetition over time,
which self-paced content cannot supply.

The loop it encodes: **identity is the starting point, character is the practice,
contribution is the evidence.** Work out who you want to be → name what that person values
→ practise behaviours consistent with those values → reflect on your impact on others →
repeat until the behaviour is simply who you are.

| Week | Focus | Reuses |
| --- | --- | --- |
| 1 | Who am I becoming? (identity is explored, not assigned) | Strengths Mapping |
| 2 | What do I stand for? (values → observable behaviours) | Values Clarifier |
| 3 | Am I a contributor? (surplus value) | The Standard, Q2 |
| 4 | Can people trust me? (reliability, integrity) | The Standard, Q3 |
| 5 | Do I do hard things? (the path of resistance) | Strength in action |
| 6 | What guides my choices? (moral wisdom over rule-following) | Moral Compass |
| 7 | Can I manage myself? (self-control via identity) | — |
| 8 | Who is shaping me? (character develops socially) | Support Circle |
| 9 | Do I leave room for inner work? | The Digital Self |
| 10 | What will my character code be? (integration) | — |

Where a week's inner work already has a tool, the week **links to it** rather than
duplicating it — the program supplies the sequence and the challenge, not a second copy of
the strengths assessment.

Underpinning research and design constraints:

- **Identity-based self-control** _(implied)_ — week 7 frames self-control as a
  description to live up to ("I'm the kind of person who…") rather than a rule to resist.
  This is a design choice, not a finding: the "willpower runs out" (ego depletion) model it
  used to cite failed a 23-lab replication (Hagger et al., 2016), and a 36-lab test was
  inconclusive (Vohs et al., 2021).
- **Implementation intentions** (Gollwitzer & Sheeran, 2006) — weeks 4 and 5 require the
  student to name their own promise or "hill" *before* any tracking appears, then add an
  if-then plan ("If it's [time or place], then I'll…"). The if-then is what makes it an
  implementation intention; naming a goal alone is not.
- **Contribution without recognition** — week 3's challenge explicitly forbids posting or
  mentioning the act, on the grounds that contribution exchanged for credit is trade.
- **Non-streak tracking** — the 7-day grid is a record, never a run to break, matching the
  practice log. A week can still be completed with gaps in it.
- **Solitude and reflection** — week 9 treats boredom as the mechanism rather than the
  failure state.

The capstone is the **Character Code**: 5–7 commitments written in the present tense as
things the student *does*. It's stored as a milestone journal entry (so earlier versions
remain readable as history) and surfaces on the Profile tab as their strongest single
statement of identity.

### The weekly five

The whole program compressed into five questions to return to every week, for as long as
they use the app — the part that outlives the ten weeks:

1. **Identity** — Who am I becoming?
2. **Values** — What do I stand for?
3. **Discipline** — What hard thing am I willing to do because it matters?
4. **Contribution** — What am I giving rather than merely consuming?
5. **Impact** — Are people safer, stronger or better because I am in their lives?

The Standard's three-part test lives inside these: contribution is question 4, impact is
question 5, and trust runs through question 2. The two are deliberately different speeds —
the weekly five is quick and cumulative, The Standard is slower and harder, with its
counterweight questions.

- **Where:** [`src/lib/program.ts`](../src/lib/program.ts) (weeks, weekly five, progress,
  Character Code), [`src/app/program/`](../src/app/program) (overview, week detail,
  tracker, code builder), `program_progress` +
  [`supabase/migrations/005_program.sql`](../supabase/migrations/005_program.sql).

---

## 2c. Scaffolding: Quick / Extended / Open

Every open prompt in the app is tiered. The tiers differ by **how much structure the
student gets**, not by how much they are expected to write:

| Tier | What the student sees | For |
| --- | --- | --- |
| **Quick** | Tap a complete answer someone else has worded | The blank page is the barrier |
| **Extended** | Finish a half-written sentence | Knows roughly what they think, can't start the sentence |
| **Open** | A blank box | Already fluent in writing about themselves |

Extended is the rung that was missing and the one most students need — Quick can be
answered without thinking, and Open assumes you already know how to begin a sentence about
yourself. This matters most at 14, where non-completion is rarely unwillingness.

Design rules the implementation holds to:

- **The tier is a floor, never a ceiling.** A tapped Quick answer lands in the same
  editable textarea as everything else, so a student who taps can keep typing.
- **Nothing is ever destroyed by tapping.** Options and stems *insert* into what's already
  written (`insertText`) — tapping a second option after typing appends rather than
  overwriting the first attempt.
- **One switcher per page, not per box.** The tier lives in shared state broadcast on a
  custom event, so the five boxes of the weekly five move together.
- **"Stuck? Try this" appears at every tier, including Open** — hints are angles *into* the
  question, never answers to it. A hint that hands over an answer removes the thinking the
  question exists to cause.
- **The choice persists** across sessions, and migrates anyone who had already chosen under
  the old two-mode Starter/Advanced system (`starter → quick`, `advanced → open`).

Coverage: all 14 reflective mission activities across Missions 1–4 (56 steps), The
Standard, the weekly five, all 10 program week reflections, the week 4 and 5 commitments,
the Character Code, Goals, the practice log, and Revisit.

- **Where:** [`src/lib/scaffold.ts`](../src/lib/scaffold.ts) (tiers, persistence, insert
  semantics), [`src/components/ScaffoldedInput.tsx`](../src/components/ScaffoldedInput.tsx)
  (the shared input + switcher), [`src/lib/missionScaffolds.ts`](../src/lib/missionScaffolds.ts)
  (mission stems and hints), with the newer surfaces' scaffolds beside their own content in
  `standard.ts` and `program.ts`.

---

## 2d. Longitudinal revisits

The most defensible intervention in the app: no comparison to other people, no score, no
advice. A student reads what they wrote months ago and answers one question — *has this
changed?* Growth becomes something they observe in their own words rather than something
the app asserts about them.

The mechanism is a **chain**. Each revisit is a journal entry linked to its original by
`revisit_of`, so a milestone written at 14 can be reopened at 15 and again at 16 and read
as a single arc. Earlier, a revisit was linked only by naming convention
(`{activity_id}-revisit`), which allowed exactly one revisit per activity and conflated two
attempts at the same activity — the chain replaces both limits.

Design rules:

- **Spacing is the mechanism, not an obstacle.** Revisits are 14 days apart minimum,
  measured from the *most recent* look rather than the original — otherwise a year-old
  milestone could be revisited twice in an afternoon. Nothing much changes in a week, and
  answering "same as before" repeatedly teaches a student the question is empty.
- **"Nothing has changed" is an acceptable answer**, and is named as one in the hints. An
  exercise that only accepts growth teaches students to invent it.
- **The original is shown whole, never truncated** — a comparison you can't fully read
  isn't a comparison.
- **The questions change with the distance.** At two weeks: "has anything tested it?" At a
  year: "does it sound like you, or someone you used to be?" Asking a 14-year-old how
  they've grown in a fortnight invites performance.
- **Student-initiated, not only nudged.** Any milestone can be reopened from the journal;
  the dashboard still offers one, now preferring milestones and re-offering a chain once
  it's eligible again.

- **Where:** [`src/lib/revisit.ts`](../src/lib/revisit.ts) (chain, eligibility, time-scaled
  prompts), [`src/app/revisit/[entryId]/`](../src/app/revisit) (the arc + new reflection),
  the journal's revisit action, and
  [`supabase/migrations/006_revisits.sql`](../supabase/migrations/006_revisits.sql), which
  backfills existing convention-linked revisits so no history is lost.

---

## 2e. The spine — one path

Groundwork carries two bodies of work: the **Missions** (a library, explored in any order)
and the **10-Week Program** (a cadence, walked in sequence). Presented as peers they
compete. The spine picks which one Home offers first; it never hides anything.

> **Updated November 2026.** This section previously described a year-level table, a
> `TrackBanner` and **Start here** / **Anytime** badges. Those were removed in September
> 2026, when Home was rebuilt around a single "Up next" card. The rule below is the current one;
> [`src/lib/spine.ts`](../src/lib/spine.ts) is the source of truth.

- **Mission 1 comes first, for everyone.** Weeks 1 and 2 are built on its strengths and
  values, so Mission 1 gates the program.
- **Missions 2–4 gate only the weeks built on them:**
  - Mission 2 gates week 3;
  - Mission 3 gates week 6;
  - Mission 4 gates week 9.

  Students start living the challenges after one mission instead of after about four
  hours of writing.
- **Life stage** no longer decides which track leads. For Year 12 and anyone who has
  left school, it still puts pathways and goals above the program.
- **Home shows one "Up next" card:** the next mission step while missions lead, then this
  week of the program, with a one-line explanation of the order under it.

Mission 1's question is **"What am I actually like?"** rather than "Who am I becoming?", so
it doesn't collide with the Program's week 1. Weeks 4 and 5 take their tap-examples from
life stage (`commitmentScaffold` in [`src/lib/program.ts`](../src/lib/program.ts)).

---

## 2f. Outcomes: identity, then esteem, efficacy, confidence and mattering

Since November 2026 Groundwork names five outcomes:
- **self-esteem;**
- **self-efficacy;**
- **self-confidence** (the everyday sense);
- **self-concept clarity;**
- **mattering.**

The research route from identity to these outcomes, and the reasons for choosing them over
the 22 candidates considered, are in
[`evidence/self-outcomes-map.md`](evidence/self-outcomes-map.md). In short:
- identity exploration and resolution raise self-esteem (Umaña-Taylor's Identity Project RCT);
- competence in the areas a student values feeds esteem (Harter; O'Mara et al., 2006);
- self-efficacy is built from Bandura's four sources (mastery, vicarious experience, persuasion, reading your nerves);
- The Standard and week 3 build mattering: feeling valued and adding value. Helping strangers predicts later adolescent self-esteem (Fu et al., 2017).

How the outcomes are measured, in the app and in a pilot, is in
[`evidence/checkin-v2-draft.md`](evidence/checkin-v2-draft.md) and
[`evidence/evidence-plan.md`](evidence/evidence-plan.md). The claim-by-claim evidence check
of the app's content is [`evidence/evidence-review-2026-11.md`](evidence/evidence-review-2026-11.md).

---

## 3. How the frameworks shape the product

- **No fixed sequence** — the map can be entered at any level. The four groups keep v2's
  questions (who am I, what do I care about, where do I belong, what kind of life do I
  want), but nothing in identity research orders them, and the app doesn't.
- **Scaffolding** — Quick / Extended / Open (§2c), chosen by the student, lowers the
  barrier for young people who lack the vocabulary for open-ended reflection. (It replaced
  both the old Starter/Advanced modes and Berzonsky-style adaptivity.)
- **Scenario-driven prompts** — Mission 1 questions lead with concrete scenarios so
  teenagers recognise a strength or value in a situation rather than introspecting from
  a blank page.

---

## 4. Source map

| Framework | Code location |
| --- | --- |
| Erikson (psychosocial stage) | `phase` field comment, `missions.ts` |
| Marcia (exploration/commitment) _(implied)_ | `phase` enum + `phaseLabel`, `missions.ts` |
| Berzonsky (processing styles) | Retired; no longer in the code |
| Self-Determination Theory | Values Clarifier `whyItMatters`, `missions.ts` |
| Authenticity / false self; self-monitoring _(implied)_ | The Mask Check `whyItMatters`, `missions.ts` |
| Writing about yourself; distanced self-talk | Identity Letter & future-self `whyItMatters`, `missions.ts` |
| William Damon (purpose) | Mission 2 `whyItMatters`, `missions.ts` |
| Social Identity Theory | Mission 3 `whyItMatters`, `missions.ts` |
| Bridging/bonding _(implied)_ | Across the Gap `whyItMatters`, `missions.ts` |
| Dan McAdams (narrative identity) | People Who Shaped You `whyItMatters`, `missions.ts` |
| Possible selves (Markus & Nurius) | Future Self `whyItMatters`, `missions.ts` |
| Contribution-based purpose / prosocial behaviour _(implied)_ | `standard.ts`, `StandardSection.tsx` |
| Identity-based self-control _(design choice)_; implementation intentions | `program.ts` (weeks 4, 5, 7), `program/[week]/WeekClient.tsx` |
| Bandura's four sources of self-efficacy | `selves.ts`, week 5 (`program.ts`), boosts |
| Mattering (Rosenberg & McCullough; Prilleltensky) | The Standard (`standard.ts`), week 3 |
| Moral identity (Aquino & Reed) | Character Code, The Standard, moral compass |

## 5. Social-Emotional Learning (CASEL) mapping

Groundwork's activities map onto the five CASEL SEL competencies:

| CASEL competency | Where Groundwork develops it |
| --- | --- |
| **Self-awareness** | VIA strengths assessment, Values Clarifier, Mask Check, moral compass, journal + AI reflections |
| **Self-management** | Weekly challenges, strength-in-action practice loop, WOOP-style goals with if-then plans, draft/revisit cycle, the 10-week program (weeks 4, 5, 7, 9 — promise-keeping, the hill, identity statements, screen-free reflection) |
| **Social awareness** | Mission 3 (belonging, fitting-in vs belonging, bridging differences), empathy/compassion boosts, stories library, The Standard (questions 1 and 2 — impact on others, contribution vs consumption) |
| **Relationship skills** | Support circle + conversation scaffolds, connection challenge, vulnerability boost, The Standard (question 3 — trustworthiness as consistency) |
| **Responsible decision-making** | Moral compass dilemmas (care/fairness/loyalty/principle styles with overuse warnings), prudence/judgment strengths content |

The VIA classification (positive psychology) supplies the *what* of character;
the CASEL frame describes the *how* of the skills being practised. Together they
ground the app's claim to be a character-education and SEL-aligned platform.

For the Australian Curriculum (v9 HPE and general capabilities) and the Australian
Student Wellbeing Framework, see [`curriculum-alignment.md`](curriculum-alignment.md).

_Last updated: 2026-11-02._
