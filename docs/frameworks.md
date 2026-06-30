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
| 1 | Identity | Who am I becoming? | Exploration |
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

### Mission 1 — Identity ("Who am I becoming?")

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

_Last updated: 2026-06-30._
