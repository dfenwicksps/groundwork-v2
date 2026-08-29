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

### Marcia — identity statuses (exploration → commitment) _(implied)_
Marcia operationalised Erikson's stage into statuses defined by two axes —
**exploration** and **commitment**. Groundwork sequences its missions along exactly
this progression, adding a final **integration** phase:

| Mission | Theme | Question | Phase |
| --- | --- | --- | --- |
| 1 | Identity | What am I actually like? | Exploration |
| 2 | Purpose | What do I care about? | Commitment |
| 3 | Connection | Where do I belong? | Commitment |
| 4 | Meaning | What kind of life do I want? | Integration |

- **Where:** `phase: "exploration" | "commitment" | "integration"` and each mission's
  `phaseLabel` / `phaseDescription` in [`src/lib/missions.ts`](../src/lib/missions.ts).

### Berzonsky — identity processing styles
Groundwork detects how a young person tends to process identity-relevant information
and adapts its content accordingly. The three styles are Berzonsky's, used verbatim:

- **Informational** — explores deeply, wants to understand the "why."
- **Normative** — prefers structure, clear steps, and guidance.
- **Diffuse-avoidant** — tends to delay and avoid; needs gentle, low-pressure entry.

- **Where:** [`src/lib/processingStyle.ts`](../src/lib/processingStyle.ts) (detection +
  tallying), the onboarding style questions in
  [`src/app/onboarding/page.tsx`](../src/app/onboarding/page.tsx), and the
  `whyItMatters` ("the idea behind this") panel that is surfaced to *informational*
  users in the activity UI.

---

## 2. Frameworks by dimension

Each mission's activities draw on a specific body of research, captured in the
`whyItMatters` field of the relevant activity in
[`src/lib/missions.ts`](../src/lib/missions.ts).

### Mission 1 — Identity ("What am I actually like?")

The app frames identity in **three layers**, used as its own integrating scaffold (the
"Integrated Identity Framework"):

- **Inner compass** — strengths and values (the self felt from the inside).
- **Public self** — the version shown to others.
- **Social self** — the groups and relationships that shape you.

Underpinning research:

- **Self-Determination Theory (Deci & Ryan)** — *Values Clarifier.* Acting from your
  own values rather than external pressure predicts higher wellbeing and more durable
  motivation.
- **Self-monitoring (Snyder)** _(implied)_ — *The Mask Check.* The gap between the
  private and public self; some gap is healthy, a large gap correlates with anxiety.
- **Expressive writing** — *Identity Letter (milestone).* Writing to oneself in the
  second person consolidates a fragmented self-image and reduces self-criticism.
- **Strengths-based identity** — *Strengths Mapping.* Naming strengths in your own
  words activates them as part of identity, not just skills.

### Mission 2 — Purpose ("What do I care about?")

- **William Damon — youth purpose** — distinguishes being *engaged* (doing things) from
  being *purposeful* (knowing why); purposeful adolescents are more resilient.
- **Contribution-based purpose** — durable purpose comes from "I have something specific
  to contribute," not generic "I want to help people."
- **Community-supported purpose** — purpose backed by mentors, peers, and figures who
  model a cause is far more likely to become action.

### Mission 3 — Connection ("Where do I belong?")

- **Social Identity Theory (Tajfel & Turner)** _(framework named as "social identity")_
  — belonging and the groups that define us.
- **Bridging vs. bonding relationships (Putnam)** _(implied)_ — *Across the Gap.* The
  most resilient belonging is built through "bridging relationships" that cross real
  differences, not only within homogeneous groups.
- **Dan McAdams — narrative identity** — *The People Who Shaped You.* Each person is an
  "autobiographical author"; understanding who shaped you builds a coherent, resilient
  identity.

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

- **Identity-based habit change** _(implied)_ — week 7 deliberately converts self-control
  from a willpower problem into an identity statement ("I'm the kind of person who…"),
  because willpower depletes and self-concept does not.
- **Implementation intentions** _(implied)_ — weeks 4 and 5 require the student to name
  their own promise or "hill" *before* any tracking appears; an unnamed commitment can't
  be kept or measured, so the tracker stays hidden until they've written it.
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

## 2e. The spine — one path, chosen by year level

Groundwork carries two bodies of work: the **Missions** (a library, explored in any order)
and the **10-Week Program** (a cadence, walked in sequence). Presented as peers they
compete — two tracks both saying "start here", with nothing telling a student which is
theirs. The dashboard previously never mentioned the Program at all, so a student who
didn't tap its nav icon never met it.

The spine picks which track leads, using the year level captured at onboarding. It never
hides anything — both stay fully reachable from the nav. It only decides what the dashboard
offers first, because the first card is the only one some students read.

| Year level | Leads with | Then |
| --- | --- | --- |
| Junior (7–9) | **This week** (program) | Mission, mission map |
| Middle (10–11) | Mission | This week, mission map |
| Senior (12) | Mission | **Next year** (pathways/goals), then this week |

The reasoning is developmental rather than cosmetic. At 14 the program's concreteness is
the point — "do one unnoticed thing a day" lands in a way that "examine the gap between
your inner and public self" does not. At 18 the near-future work is what the student
actually arrived with, and a ten-week character cadence is not the answer to "what do I do
next year"; it's offered below, not as the on-ramp.

Mission 1's question was also renamed from *"Who am I becoming?"* to **"What am I actually
like?"** — it previously collided word-for-word with the Program's week 1, so a student
moving between the two tracks met the identical headline twice with different content
under each. The new wording is also more honest about what the mission does: strengths,
values, the mask, the letter. Descriptive rather than aspirational.

Weeks 4 and 5 also take their **examples** from year level, because register matters most
where the student writes their own commitment: an 18-year-old offered "make my bed every
morning" reads the whole exercise as written for children, and a 14-year-old offered "be on
time to every shift" has no shift. Only the tap-examples change — the sentence-starters,
the hints and the challenge itself are identical at every age
(`commitmentScaffold` in [`src/lib/program.ts`](../src/lib/program.ts)).

### Saying it out loud

Ordering alone turned out not to be enough. A student reading the dashboard top to bottom
still saw two equally weighted cards, and the nav offered **Journey** and **Program** — two
abstractions that name neither the work nor the order — with neither page mentioning the
other. The spine's decision existed but was never stated anywhere a student could read it.

Three changes make it legible:

1. **The nav says what the thing is.** *Journey → Missions*, *Program → This week*. One
   names a body of work; the other names a cadence. "Journey" and "Program" could each have
   been either.
2. **Every landing point carries the same marker.** `TrackBadge` renders **Start here**
   (sage) on the track the spine leads with, and **Anytime** on the other. It appears on the
   dashboard's two cards and at the top of `/program` and `/missions/[id]`, so the answer to
   "which first?" is the same wherever a student meets it.
3. **Each track describes the other.** `TrackBanner` sits at the top of both track pages: a
   one-line description of where you are, then a divider link to the other track with its
   own one-liner — prefixed **"Start with "** when the track you're on isn't the lead. A
   student who lands on missions first is told, in place, that this week comes first for
   them; nothing stops them carrying on.

Nothing is gated. The badge reports a recommendation, and the link to the other track is
always live — a junior who wants Mission 3 today can have it.

- **Where:** [`src/lib/spine.ts`](../src/lib/spine.ts) (the rule),
  [`src/components/TrackBanner.tsx`](../src/components/TrackBanner.tsx) (banner + badge),
  [`src/components/layout/AppShell.tsx`](../src/components/layout/AppShell.tsx) (nav labels),
  [`src/app/dashboard/page.tsx`](../src/app/dashboard/page.tsx) (year level + program state),
  and `DashboardClient` (ordering + badges).

---

## 3. How the frameworks shape the product

- **Sequencing** — missions follow the Erikson/Marcia arc: explore the self before
  committing to purpose and connection, then integrate it into a life direction.
- **Adaptivity** — Berzonsky processing style (set at onboarding) tailors how much
  conceptual "why" is surfaced.
- **Starter vs. Advanced modes** — see [`src/lib/learningMode.ts`](../src/lib/learningMode.ts).
  Starter mode (multiple-choice) lowers the barrier for young people who lack the
  vocabulary for open-ended reflection; Advanced mode opens the open-ended writing that
  the expressive-writing research relies on.
- **Scenario-driven prompts** — Mission 1 questions lead with concrete scenarios so
  teenagers recognise a strength or value in a situation rather than introspecting from
  a blank page.

---

## 4. Source map

| Framework | Code location |
| --- | --- |
| Erikson (psychosocial stage) | `phase` field comment, `missions.ts` |
| Marcia (exploration/commitment) _(implied)_ | `phase` enum + `phaseLabel`, `missions.ts` |
| Berzonsky (processing styles) | `processingStyle.ts`, `onboarding/page.tsx` |
| Self-Determination Theory | Values Clarifier `whyItMatters`, `missions.ts` |
| Self-monitoring _(implied)_ | The Mask Check `whyItMatters`, `missions.ts` |
| Expressive writing | Identity Letter & future-self `whyItMatters`, `missions.ts` |
| William Damon (purpose) | Mission 2 `whyItMatters`, `missions.ts` |
| Social Identity Theory | Mission 3 `whyItMatters`, `missions.ts` |
| Bridging/bonding _(implied)_ | Across the Gap `whyItMatters`, `missions.ts` |
| Dan McAdams (narrative identity) | People Who Shaped You `whyItMatters`, `missions.ts` |
| Possible selves (Markus & Nurius) | Future Self `whyItMatters`, `missions.ts` |
| Contribution-based purpose / prosocial behaviour _(implied)_ | `standard.ts`, `StandardSection.tsx` |
| Identity-based habit change / implementation intentions _(implied)_ | `program.ts` (weeks 4, 5, 7), `program/[week]/WeekClient.tsx` |

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

_Last updated: 2026-08-12._
