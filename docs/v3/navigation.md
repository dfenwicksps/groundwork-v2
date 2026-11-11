# Groundwork v3: navigation and screen map

Phase 0, task 2. Source: [SPEC.md](SPEC.md) sections 2, 4, 5, 6, 7, 8 and 9, read against the v2 app on `origin/main` at the merge of PR #75.

This is a design document. No route below exists yet. Route names are proposals, and the ones marked **(decide)** need David's call before Phase 1.

## 1. How to read this

- **Reuses** means the v2 component moves into the new shell with its behaviour intact.
- **Replaces** means the v2 screen is retired and its content is re-homed.
- **New** means there is nothing in v2 to start from.
- Every signed-in student screen carries "Need to talk?" (`GetHelpButton`), as v2's `AppShell` does today. That isn't repeated in each row.
- Staff routes live under `/teach` and `/school`, and platform routes under `/platform`, so middleware can refuse a whole area by role with one prefix check.

## 2. The student app: five tabs

| Tab | Route | v2 tab it takes over from |
| --- | --- | --- |
| Home | `/home` | Home (`/dashboard`) |
| Me | `/me` | Me (`/me`) |
| Grow | `/grow` | Missions (`/missions`) and This Week (`/program`) |
| Future | `/future` | none; was the Future tab inside `/me` |
| Journal | `/journal` | Journal (`/journal`) |

Me is the spine. Each Grow activity, media clip and careers prompt names the self or strength it builds and links back to it.

### 2.1 Home

| Route | Shows | v2 source |
| --- | --- | --- |
| `/home` | Today's next step (one card, chosen as v2's `spine.ts` chooses it). The class focus, if the teacher has set one: the self, its living-it challenge and the days left. Two or three suggested selves from the last self-check. The active challenge and its debrief when due. Recent entries. The support circle. The school's "Who to talk to here" card beside the national helplines. | **Replaces** `dashboard/DashboardClient.tsx`. **Reuses** `MissionsSummaryCard`, `PolicyNotice`, `ReturnBanner`, `ConfirmEmailBanner`, `spine.ts`. Class focus and the school card are **new**. |
| `/support` | The support circle, conversation starters, the helplines, the school's own card. | **Reuses** `support/SupportClient.tsx` and `HelpLines` unchanged. The school card is **new** and sits beside the helplines, never in place of them. |
| `/check-in` | The start and end outcome check-in (`checkin.ts`). This is the evaluation measure, not the self-check. | **Reuses** `check-in/CheckinClient.tsx`, `CheckinForm`. |

A redirect from `/dashboard` to `/home` keeps old links and the installed home-screen icon working.

### 2.2 Me (the spine)

| Route | Shows | v2 source |
| --- | --- | --- |
| `/me` | The Selves map: seven levels, 26 selves, any order, an "explored" mark and nothing else (no locks, percentages or progress bars). The self-check's suggested selves are highlighted. Entry points to the self-check, strengths and the Who I Am card. | **Replaces** `me/MeClient.tsx` (a four-tab page today: profile, reflect, grow, future). The map itself is **new**; its visual language comes from the HTML master's home view. |
| `/me/selves/[key]` | One self: `short`, the story (`hook`, figure, beats, `turn`), `what` and `notThis`, the reflective prompt, the living-it challenge with an "accept" button, `builtBy` links into Grow, the school's `localLink`, at most one featured clip and two extras, and the sources, collapsed. A confused-pair prompt where one exists ("these two get mixed up"). Never the teacher notes. | **Replaces** `me/SelvesSection.tsx` (nine selves in a list). **Reuses** `CONFUSED_PAIRS` from `selves.ts`. |
| `/me/self-check` | One statement per self (D30; 26 as the master stands, 25 if D31 is confirmed), grouped by level, on a five-point scale from "Not like me" to "Very like me". | **New.** Layout can follow `CheckinForm`. |
| `/me/self-check/result` | Words only: one or two levels where the student is already steady, two or three selves that might be worth exploring. No numbers anywhere. Earlier results side by side, using the revisit pattern. A retake is offered once a term. | **New.** Comparison follows `revisit.ts`. |
| `/me/strengths` | The VIA-24 profile, Strengths Mapping (take or retake), and strength-in-action practice. | **Reuses** the strengths activity (`strengths.ts`, today at `/missions/1/activities/strengths-mapping`), `PracticeSection`, `BecomingQualities`, `becoming.ts`. |
| `/me/card` | The Who I Am card: top strengths, values, Character Code, the life-story sentence. | **Reuses** the profile tab of `MeClient.tsx` and `/story` (`StoryClient`, `myStory.ts`). |
| `/me/moral` | The moral-style profile. | **Reuses** `MoralSection`, `moral.ts`. |

### 2.3 Grow

| Route | Shows | v2 source |
| --- | --- | --- |
| `/grow` | One list of journeys: the four missions and the 10-week program, each tagged with the selves and strengths it builds. Accepted living-it challenges. Habits. | **Replaces** `missions/MissionsClient.tsx` and `program/ProgramClient.tsx` as two separate indexes. **Reuses** `HabitsSection`, `BoostsSection`, `StepsTakenSection`, `WeeklyFiveSection`. |
| `/grow/missions/[id]` | One mission and its steps. | **Reuses** `missions/[id]/MissionDetailClient.tsx`. |
| `/grow/missions/[id]/[activityId]` | One step: the writing surface, scaffolds, the AI follow-up where allowed, and the story offered "before you start" at the step it models. | **Reuses** `ActivityClient.tsx`, `ScaffoldedInput`, `SmallStep`, `SupportCard`, `GentleCheck`, and the three films in `components/stories/`. |
| `/grow/program/[week]` | One program week: the challenge, day ticks (no streak), the artefact, the reflection. | **Reuses** `program/[week]/WeekClient.tsx`, `ArtefactBuilders`, `CharacterCodeBuilder`. |
| `/grow/challenges` | Living-it challenges the student has accepted from a self's page or from the class focus, each with one reflection when done. | **New.** v2's `challenges` table and debrief pattern are the starting point. |

Redirects from `/missions/*` and `/program/*` keep v2 links working, including the `builtBy` links in `selves.ts` until they become structured.

### 2.4 Future

| Route | Shows | v2 source |
| --- | --- | --- |
| `/future` | The two careers tracks, the student's possible selves, and their Next Chapter plan. Which track leads follows year level. | **Replaces** the Future tab of `MeClient.tsx`. |
| `/future/possible-selves` | The Level 6 selves (actual, ideal, ought, feared, possible) as the frame for "me at 20", with one strategy for this term. | **Reuses** `FutureSelfSection`, `GoalsSection` (the wish, outcome, obstacle, plan fields are already Oyserman-shaped). |
| `/future/subjects` | Track A, Years 9–10, five steps: what I bring; what I enjoy and do well (two separate ratings); where it could lead; whose choice is it; my subject thinking. | **New.** Steps 1 and 3 reuse `strengths.ts`, `VALUES_LIST` and the `subjects` field on each cluster in `pathways.ts`. |
| `/future/subjects/summary` | "My subject thinking": a one-page shortlist with reasons that the student can print or save. Nothing is sent. | **New.** |
| `/future/pathways` | Track B, Years 10–12: clusters with roles, subjects and Australian next steps. Links to myfuture and the state admissions centre are labelled as leaving Groundwork. | **Reuses** `PathwaysSection`, `pathways.ts` (`suggestPathways` stays "indicative and exploratory"). |
| `/future/next-chapter` | The Next Chapter plan and its debrief. | **Reuses** `next/NextChapterClient.tsx`, `nextChapter.ts`. |
| `/future/pathways/summary` | "My pathway thinking", exportable in the same way. | **New.** |

### 2.5 Journal

| Route | Shows | v2 source |
| --- | --- | --- |
| `/journal` | Every entry, filterable, read-only after 24 hours. The Standard and its history. | **Reuses** `journal/JournalClient.tsx`, `StandardSection`, `standard.ts`. |
| `/journal/revisit/[entryId]` | A milestone reopened beside the original. | **Reuses** `revisit/[entryId]/RevisitClient.tsx`, `revisit.ts`. |
| `/journal/[entryId]/share` | "Share with my teacher": shows exactly what will be sent and to which teacher, and asks once. Also where a student unshares. | **New.** See [visibility.md](visibility.md), rules V-SH1 to V-SH6. |

### 2.6 Outside the tabs

| Route | Shows | v2 source |
| --- | --- | --- |
| `/` | The landing page. | **Reuses** `app/page.tsx`. |
| `/auth`, `/auth/callback` | Sign in with Google or Microsoft school accounts; an emailed magic link as the fallback. | **Reuses** `auth/AuthForm.tsx`. Microsoft sign-in and magic links are **new**; v2 has Google and email with a password. |
| `/join` and `/join/[code]` | Enter a six-character class code. Shows the class name, teacher and year level before the student confirms. | **New.** |
| `/welcome` | The short welcome: the existing story film, then into the self-check. | **Replaces** `onboarding/OnboardingClient.tsx` (three steps today). The film is **reused**. |
| `/settings` | The look, read-aloud, device lock, AI follow-up on or off, leave a class, delete my account. | **Reuses** `settings/SettingsClient.tsx`, `DeviceLockSettings`. "Leave a class" is **new**. |
| `/ask/[token]` | The page a parent or grandparent opens to answer a conversation's questions. No sign-in. | **Reuses** `ask/[token]` unchanged. |
| `/privacy`, `/terms` | The notices. | **Reuses** `LegalPage`, `legal.ts`. Both need rewriting for the teacher layer before any class joins. |
| `/api/reflect`, `/api/checkin`, `/api/delete-account` | Server routes. | **Reused.** `/api/reflect` also has to honour the school's AI switch. |

## 3. The new-student flow

From spec section 4. Every step can be left and resumed.

1. **Sign in** at `/auth` with a school Google or Microsoft account.
2. **Join a class** at `/join` with the six-character code. The student sees the class name, teacher and year level, and confirms. The year level is copied from the class; the student is never asked their age (D8).
3. **Welcome** at `/welcome`: the existing story film. It can be skipped.
4. **Self-check** at `/me/self-check`: about five minutes. It can be skipped; a student who skips lands on the map with nothing highlighted.
5. **The Selves map** at `/me` with two or three suggested starting selves highlighted.
6. **Home** at `/home`.

**A student with no class code** taps "I'm using Groundwork on my own" at step 2 and picks a year group the way v2's onboarding asks for a life stage. They get the whole student app and no teacher layer. They can enter a code later from Settings.

**The start-of-program check-in is not part of this flow (D33).** v2 asks it during onboarding. In v3 the self-check is the only questionnaire a new student meets; Home offers the check-in (`/check-in`, the evaluation measure) as a card a few days after the first session. How many days, and what happens to the "start" measure for a student who puts it off for weeks, are open and affect the evaluation plan in `docs/evidence/evidence-plan.md`. v2's onboarding also asks why the student is here and has them pick strengths and values; those have no step here (see "Screens with no home").

## 4. The teacher area: four areas, no individual student data

| Route | Shows | v2 source |
| --- | --- | --- |
| `/teach` | The teacher's classes and each one's current focus. | **New.** |
| `/teach/classes/[id]` | The class's join code (with a "new code" button), its year level, and the roster: the names of students who have joined, and nothing else about them. Remove a student from the class. | **New.** |
| `/teach/lesson` | Pick a self to teach: the seven-level map, with selves the school has hidden left out. | **New.** The HTML master's home view is the model. |
| `/teach/lesson/[key]` | The projected screen. Steps through map, hook, story beats, turn, what it is and isn't, the ask (with an optional silent-thinking timer), living it, and "set as class focus". Arrow keys step; Esc returns to the map. Student-facing content only. | **New.** The HTML master's deck is the model. |
| `/teach/lesson/[key]/presenter` | The teacher's own screen, in a second window or on a tablet: the teacher notes, the source line, the story's verified date and age band, and the next step. | **New.** |
| `/teach/lesson/[key]/card` | A printable one-page lesson card, for a room with no projector. | **New.** |
| `/teach/library` | The selves, stories and media available to this teacher's school: central content, minus what the school hides, plus what it adds. Read-only for teachers. | **New.** |
| `/teach/patterns/[classId]` | The share of the class whose suggested start falls in each level. How many opened the focus self and accepted its challenge. How many finished this week's activity. A dash wherever the small-group rule applies. | **New.** Reads only from `class_patterns()`. |
| `/teach/shared` | Entries that students in the teacher's classes chose to share, each with the student's name and the date. | **New.** Reads only from `shared_with_me()`. |

## 5. The school-admin area

| Route | Shows |
| --- | --- |
| `/school` | The school's classes and teachers. |
| `/school/staff` | Invite or remove teachers. |
| `/school/classes` | Create and archive classes; assign a teacher and a year level. |
| `/school/settings` | Film policy for lesson mode; whether M (or MA15+ for Years 11–12) is enabled in student mode, per age band; the library catalogue address; the name and date of the senior-planning interview (the SET plan in Queensland); the AI follow-up on or off for the tenancy. |
| `/school/support` | The "Who to talk to here" card: who, where, and how to reach them. |
| `/school/content` | Hide a self. Edit `localLink` on any self. Add the school's own stories. Central `what`, `notThis` and research claims are read-only here. |
| `/school/media` | Hide a central media record; add the school's own; lower a rating ceiling. |
| `/school/subjects` | Upload the school's subject list and prerequisites, for Track A. |
| `/school/reports` | Class-level patterns for every class in the school, exportable. The same suppression as the teacher view. |

All of it is **new**.

## 6. The platform-admin area

| Route | Shows |
| --- | --- |
| `/platform` | Anonymous platform totals: schools, classes, students, completions. No names of students, no rows. |
| `/platform/schools` | Onboard a school and its first school admin. |
| `/platform/content` | Publish status of central content: which version of each item is live, and the import script's last report. Central content is edited in git, not here. |
| `/platform/media` | The central media library: add, verify, retire; the link checker's broken list. |

All of it is **new**. v2's `scripts/completion-report.ts` is the precedent for the totals.

## 7. Where each v2 route goes

| v2 route | v3 home | What changes |
| --- | --- | --- |
| `/` | `/` | Nothing. |
| `/auth`, `/auth/callback` | same | Microsoft sign-in and magic links added. |
| `/onboarding` | `/join`, `/welcome`, `/me/self-check` | Replaced by the new-student flow. |
| `/dashboard` | `/home` | Adds the class focus and the suggested selves. |
| `/me` (profile tab) | `/me/card`, `/me/strengths` | Split by purpose. |
| `/me` (reflect tab) | `/journal` (The Standard), `/grow` (habits), `/me/moral`, `/home` (check-in results) | Split by purpose. |
| `/me` (grow tab) | `/grow`, `/me/selves/*`, `/me/strengths` | Selves expand from 9 to 26. |
| `/me` (future tab) | `/future/*` | Joined with the subject-choice track. |
| `/missions`, `/missions/[id]`, `/missions/[id]/activities/[activityId]` | `/grow`, `/grow/missions/*` | One list of journeys. |
| `/program`, `/program/[week]` | `/grow`, `/grow/program/[week]` | Same. |
| `/next` | `/future/next-chapter` | Moved. |
| `/story` | `/me/card` | The life-story sentence is part of the Who I Am card. |
| `/journal` | `/journal` | Unchanged. |
| `/revisit/[entryId]` | `/journal/revisit/[entryId]` | Moved under Journal. |
| `/stories`, `/stories/[id]` | inside Grow activities | See section 8. |
| `/support` | `/support`, and every screen | Adds the school's card. |
| `/check-in` | `/check-in` | The screen is unchanged. It is no longer asked during onboarding: Home offers it a few days after the student's first session (D33). |
| `/settings` | `/settings` | Adds "leave a class". |
| `/ask/[token]` | `/ask/[token]` | Unchanged. |
| `/privacy`, `/terms` | same | Rewritten for the teacher layer. |

## 8. v2 screens with no v3 home, and why

| v2 screen | Why it has no home | What happens to its content |
| --- | --- | --- |
| `/stories` (the stories index) | Spec section 4 and the multimedia review: stories work at the step they model, not as a library to browse. | Each story is offered inside its activity. `/stories/[id]` stays reachable by direct link so a "before you start" card has somewhere to open. |
| `me/JourneyStrip.tsx`, `PhaseBanner`, and `journey_phase` on `users` (the three-phase journey: first pass, review, deepen) | The spec doesn't mention the three phases. They aren't a level lock, so D3 doesn't rule them out, but a phase banner next to a level map gives the student two "where am I up to" signals. | **Kept as a setting (D34).** Off unless chosen. Whether the school or the student chooses is still to be confirmed; `journey_phase` stays in the schema draft either way. |
| The Missions tab and the This Week tab, as tabs | Merged into Grow (spec section 4). | All content is kept. |
| `/onboarding` steps "why are you here" and the strengths-and-values picker | The new-student flow goes from welcome to self-check. | Values still get chosen in Mission 1's Values Clarifier, and strengths in Strengths Mapping. `onboarding_results` is kept in the schema draft. |

## 9. Two things in v2 that the new map has to respect

These aren't in the spec and would be easy to break.

1. **v2 gates some content in Grow; v3 will not (D35, proposed).** `spine.ts` holds the 10-week program until Mission 1 is done, and holds weeks 3, 6 and 9 until the mission they're built on is done, because those weeks reuse what the mission produced. David asked for the evidence to decide. It supports a recommended order and against a block: see D35. The proposal is that every week opens; a week that needs something from a mission (values, strengths) says so and lets the student choose it there and then, or go and do the mission. Home's "Up next" card keeps suggesting v2's order.
2. **Class focus points at a self; most of Grow is still mission-shaped.** A teacher sets "self-compassion" as the focus, and the student's Home shows its living-it challenge. For the 17 new selves there is no Grow activity yet that builds them, so `builtBy` will be empty for most of the map until content is written in Phase 2. The self page has to read sensibly with no `builtBy` links.
