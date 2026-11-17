# Groundwork v3: what's left, and who does it

**Written 17 November 2026.** Everything still open, in the order I'd do it. Each item has one owner.

- **David** means only you can do it: a decision, wording, an account, or a person to arrange.
- **Claude** means I can do it. Where it says "after" an item, I'm waiting on that one first.
- Wording I draft always comes back to you for approval before it goes in.

Where I'm not sure of an item's current state, it says so. Update this file as things close.

## 1. Decisions waiting on you

Small ones. Each unblocks work in the later sections.

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 1.1 | Widen Social self's wording to cover the groups a student is part of, or add a self for it | David | I recommended widening. I draft the wording once you choose (2.1). |
| 1.2 | Move Digital Self back to Know myself? | David | I recommended yes. It now builds Self-image first. |
| 1.3 | Keep the darker orange for Manage myself (`#B83D0B`), or go back to the master's `#C2410C`? | David | The darker one passes contrast; the master's doesn't quite. |
| 1.4 | Life-story steps for Years 7 to 9: keep them light and optional, with the conversations ahead of solo writing? | David | Identity review, item 7. |
| 1.5 | Add an activity on who I am as a learner? | David | Identity review, item 8. |
| 1.6 | Say What You Need: what happens if a student raises something serious | David | The same question as sharing an entry with a teacher, which is still open. |
| 1.7 | Should the "try it" activities prompt a student to come back and write a line? | David | Eight activities have a try-it. At present it's a card on the done screen. |
| 1.8 | Merge or close pull request 76 (Who Was I? wording, on v2) | David | Open since 11 November. |

## 2. Finishing this week's work on selves and activities

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 2.1 | Draft Social self's wider wording | Claude | After 1.1. |
| 2.2 | Move Digital Self, if you say yes | Claude | After 1.2. Small. |
| 2.3 | Stories for Life story, Belonging and Sense of purpose (figure, hook, beats, turn) | David | Only a person supplies stories. |
| 2.4 | Lesson notes and Character Project lines for the same three | David | Five notes each, to match the other selves. |
| 2.5 | Icons for the same three | David | The master file has stand-ins: clock, home, rocket. |
| 2.6 | Redraw the poster for 28 selves, with the wording changes from D71 | David | It still shows 25 and the old lines. |
| 2.7 | Recast the first-person short lines in the second person for the selves that came from the master file | Claude drafts, David approves | Sixteen lines. The three new ones are already approved in both forms. |
| 2.8 | See the done screen of a new activity working: wrap-up, "Try it" card, and Not My Results' extra line | Claude | **Done 17 Nov, on the audit's stand-in database:** Name It and Not My Results finish and show the wrap-up, the "Try it" card and the extra line. Saving to a real database is still untested (4.5). After 4.1. The local preview has no database, so nobody has seen it. |
| 2.9 | Check the new screens in the other three looks, and the Value myself level page | Claude | **Done 17 Nov:** the audit found nothing in any of the four looks (244 page views each) or at phone widths (366). I've only looked in the default look. |
| 2.10 | Build the come-back prompt for "try it" activities | Claude | After 1.7, if yes. |
| 2.11 | Say in `frameworks.md` that each level's list is a teaching selection from named research, and add the three new selves and the eighteen activities | Claude | **Done 17 Nov:** `frameworks.md` §2g and the source map. Review recommendation 6. |
| 2.12 | Bring `deploy.md`, `level-map.md` and the spec up to date (28 selves, 56 activities, what the app now has) | Claude | **Done 17 Nov:** a dated changes note on the spec and `level-map.md`; `deploy.md`'s lists rewritten. `deploy.md` still says the selves' pages and self-check aren't built. |
| 2.13 | Re-check the two sources cited from memory in the new teacher notes (Baumeister & Leary 1995; Damon, Menon & Bronk 2003) | Claude | **Done 17 Nov:** both confirmed. |
| 2.14 | Fix: after a save fails and the student resumes, the done screen lists the last answer twice | Claude | **Done 17 Nov.** From the code, the answer was saved twice as well as shown twice; I didn't capture a save from before the fix. Fixed on `v3` (`src/lib/draftResume.ts`, with tests) and checked in a browser. v2 on `main` has the same fault; not fixed there. |

## 3. Before any class uses it

These are the safety and review gates. None can be skipped.

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 3.1 | Arrange a school counsellor or psychologist to review | David | One sitting can cover 3.2 to 3.4. |
| 3.2 | Counsellor reads the Value myself self-check statements, including Belonging's | Counsellor, arranged by David | Required by the spec. |
| 3.3 | Counsellor reads four activities: Not My Results, What I'd Say to a Friend, Should or Choose?, The Other Version | Counsellor, arranged by David | |
| 3.4 | Counsellor reads Belonging's page | Counsellor, arranged by David | |
| 3.5 | Prepare a pack for the counsellor: every item to read, on a few pages | Claude | **Done 17 Nov:** `counsellor-pack.md`, with a notes table for the reviewer. |
| 3.6 | Apply whatever the counsellor changes | Claude drafts, David approves | After 3.2 to 3.4. |
| 3.7 | Wellbeing lead signs off the visibility table (what teachers can and can't see) | David arranges | Phase 0 item, still unticked in the spec. |
| 3.8 | Have the Culture and Heritage step reviewed by the communities it speaks to | David arranges | Identity review, item 9. |
| 3.9 | Verify each story against its source, and set its age band | David | 25 stories in the master file, plus the three new ones. |
| 3.10 | Replace the three story sources that cite Wikipedia | David, or Claude finds candidates for David to confirm | **Candidates found 17 Nov:** `story-sources.md`. Two facts may be wrong; yours to check.  |
| 3.11 | Rewrite the privacy and terms pages for v3 and the teacher layer | Claude drafts, David approves | They still describe v2. You may want legal advice on these. |
| 3.12 | Connect a proper email service, or rely on Google and Microsoft sign-in | David | Supabase's built-in sender is for testing only. |

## 4. Accounts and keys

Only you can do these. I never create the projects or hold their keys.

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 4.1 | v3 Supabase project and v3 Vercel project, following `deploy.md` | David | I don't know whether this is done. Tell me and I'll update this file. |
| 4.2 | Azure app registration for Microsoft sign-in | David | Keep the secret in Supabase only. |
| 4.3 | Google sign-in: add the v3 callback address to the existing Google client | David | |
| 4.4 | Make yourself platform admin, add the school, create a test class | David | `deploy.md`, parts 4 and 5. |
| 4.5 | First walk-through on the live address, as a student and as a teacher | David, with Claude fixing what you find | |

## 5. Build still to do

Each is a build I'd ask about before starting.

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 5.1 | Home: replace the cards left over from v2 | Claude | |
| 5.2 | Stories on each self's page | Claude | After 3.9, for the stories that are verified. |
| 5.3 | Lesson mode: a teacher projects one self and steps through it | Claude | Phase 2. The identity review suggests giving this priority. |
| 5.4 | The switch in settings for the three-phase journey | Claude | |
| 5.5 | School settings, sharing an entry with a teacher, leaving a class | Claude | The database supports them; there's no screen. After 1.6 for sharing. |
| 5.6 | Careers work on the Future tab | Claude builds, David supplies the school's subject list | Phase 4. A careers adviser reviews the export. |
| 5.7 | Media for each self: clips and books, rated and verified | David adds every media record; Claude builds the screens and the link checker | Phase 3. I never add or guess a link. |
| 5.8 | Activity on who I am as a learner | Claude drafts, David approves | After 1.5, if yes. |
| 5.9 | Lighter life-story steps for Years 7 to 9 | Claude drafts, David approves | After 1.4, if yes. |

## 6. Evidence and the pilot

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 6.1 | Pilot the self-check with about 30 students | David runs it; Claude prepares the materials and reads the results | Looks for statements everyone agrees with and ones students misread. No student's answers leave the app. |
| 6.2 | Revise the self-check after the pilot | Claude drafts, David approves | After 6.1. |
| 6.3 | Decide the wider pilot's design: a comparison group, results by year level, and whether to measure anxiety and low mood | David | Identity review, item 11. Measuring mood needs ethics advice and the school's agreement. |
| 6.4 | Until there are results, say "built on identity research", not "improves" | Claude checks the app and marketing; David approves any change | Identity review, item 12. |
| 6.5 | Keep "research shows knowing yourself is made up of these" out of school materials | Claude checks; David approves any change | From the 16 November review. |

## 7. Later, before a second school

| # | Item | Owner | Notes |
| --- | --- | --- | --- |
| 7.1 | Privacy impact assessment, checked against the Children's Online Privacy Code | David, with advice; Claude prepares the data map | Phase 5. |
| 7.2 | School data-processing agreement | David, with legal advice | Phase 5. |
| 7.3 | Merge v3 into the main branch | David decides when; Claude prepares the pull request | After the Phase 2 gate in the spec. v2 stays live from `main` until then. |

## What I can start now without waiting on you

Done on 17 November: 2.8, 2.9, 2.11, 2.12, 2.13, 3.5, and the candidate sources for 3.10. 2.14 too.

## What's holding the most up

1. **The counsellor (3.1).** Five items wait on one conversation.
2. **The v3 database and site (4.1).** Until they exist, nobody has seen the app save anything.
3. **Stories (2.3, 3.9).** Each self's page is missing its story until a person has checked it.
