# Groundwork v3: visibility and safeguarding rules

Phase 0, task 3. This turns [SPEC.md](SPEC.md) section 3 into rules a test can check. Each rule has an ID. `supabase/v3/schema.sql` cites these IDs on every policy, and Phase 1's access tests cite them on every test.

**Status: draft for sign-off.** The Phase 0 gate needs a school wellbeing lead to approve this document. Section 9 lists what they are being asked to agree to, in plain language.

## 1. Terms

| Term | Meaning |
| --- | --- |
| Student | A signed-in user with no `staff` row and no `platform_admins` row. |
| Teacher | A user with a `staff` row whose `role` is `teacher`. |
| School admin | A user with a `staff` row whose `role` is `school_admin`. |
| Platform admin | A user with a `platform_admins` row. |
| Staff | A teacher or a school admin. |
| **Student-owned table** | A table whose rows belong to one student. The full list is in section 2. |
| **Free text** | Anything a student typed, and any answer a student gave: journal responses, reflections, letters, challenge debriefs, goals, habits, The Standard, small steps, Next Chapter, My Story, conversation answers, self-check answers, check-in answers, strengths answers, moral-profile answers. |
| The minimum group | `SMALL_COUNT` from `src/lib/completionCounts.ts`, which is 5. v3 imports it; it is never redefined. |
| Suppressed | Returned as SQL `null` by the reporting function, and shown as a dash (—) by the UI. |
| "Can't select" | The query succeeds and returns zero rows (Row Level Security), or fails with a permission error. Either passes. Returning any row fails. |

## 2. Student-owned tables

Every rule that says "any student-owned table" means every table here. A new student table added in a later phase must be added to this list and to the access tests in the same commit.

Carried over from v2: `users`, `onboarding_results`, `journal_entries`, `challenges`, `support_circle`, `mission_progress`, `story_reads`, `goals`, `practice_log`, `moral_profiles`, `standard_checkins`, `program_progress`, `strength_profiles`, `outcome_checkins`, `small_steps`, `conversation_requests`.

New in v3: `self_checks`, `self_progress`, `shared_items`.

## 3. Rules for each role

### 3.1 Student

| ID | Rule |
| --- | --- |
| V-S1 | A student can select, insert, update and delete their own rows in every student-owned table. |
| V-S2 | A student can't select any row in any student-owned table whose owner is another user, whether or not they share a class or a school. |
| V-S3 | A student can't select any row from `class_members` other than their own memberships. A student can't list who else is in their class. |
| V-S4 | A student can't execute `class_roster()`, `class_patterns()` or `shared_with_me()`; each returns no rows or an error. |
| V-S5 | A student can select a `classes` row only for a class they belong to, and only the columns `id`, `name`, `year_level` and the teacher's display name. A student can't select `join_code` for any class. |
| V-S6 | A student can join a class only through `join_class(code)`. A direct insert into `class_members` fails. |
| V-S7 | A student can leave a class (delete their own `class_members` row). Their own rows in every student-owned table are untouched by leaving. |
| V-S8 | A student can't set `school_id` on any row. Whatever the client sends, the stored value is the one the database works out from their class. |
| V-S9 | A student can select `content_items` whose `status` is `published`, and can never select the `teacherNotes` of any self. Teacher notes are stored apart from the student-readable body (section 6). |
| V-S10 | A student with no class has every right in V-S1 and none of the class or school features. Their rows carry `school_id = null`. |
| V-S11 | A student can delete their account. Doing so removes every row they own in every student-owned table, their class memberships, and every `shared_items` row they created. |

### 3.2 Teacher

| ID | Rule |
| --- | --- |
| V-T1 | A user with role `teacher` can't select any row from `journal_entries`. |
| V-T2 | A user with role `teacher` can't select any row from `self_checks`. |
| V-T3 | A user with role `teacher` can't select any row from any other student-owned table, with one exception: their own `users` row. |
| V-T4 | A teacher can't insert, update or delete a row in any student-owned table other than their own `users` row. |
| V-T5 | A teacher can call `class_roster(class_id)` for a class they teach. It returns each member's ID, display name and the date they joined, and no other column. (The ID is what lets a teacher remove a student, and can't be used to read anything.) |
| V-T6 | A teacher calling `class_roster()`, `class_patterns()` or `set_class_focus()` for a class they don't teach gets no rows or an error, including for another class in their own school. |
| V-T7 | A teacher can call `class_patterns(class_id)` for a class they teach. Every figure it returns obeys section 4. |
| V-T8 | `class_patterns()` returns counts and nothing else: no user IDs, no names, no timestamps of an individual's activity, no free text. |
| V-T9 | A teacher can call `shared_with_me()`. It returns only `shared_items` rows addressed to them, by students who shared them, in classes they teach. |
| V-T10 | A teacher can insert and update `class_focus` rows only for classes they teach. |
| V-T11 | A teacher can select `classes` rows only for classes they teach, and can regenerate the join code of those classes only. |
| V-T12 | A teacher can remove a student from a class they teach. This deletes the `class_members` row and nothing else. |
| V-T13 | A teacher can select the `teacherNotes` for a self. They can't edit central content or school overrides. |

### 3.3 School admin

| ID | Rule |
| --- | --- |
| V-A1 | A user with role `school_admin` can't select any row from any student-owned table, except their own `users` row. |
| V-A2 | A school admin can't call `shared_with_me()` for another user, and has no other way to read `shared_items`. Shared entries go to the teacher the student chose and to nobody else. |
| V-A3 | A school admin can call `class_roster()` and `class_patterns()` for any class in their own school, and for no class in any other school. |
| V-A4 | A school admin can select, insert and update `classes`, `staff`, `content_overrides` and `media_items` rows whose `school_id` is their own school's, and no others. |
| V-A5 | A school admin can update their own school's `settings` and can't update any other `schools` row. |
| V-A6 | A school admin can't write a `content_overrides` row that patches a protected field of central content. The protected fields are `what`, `notThis`, `sources` and `story` on a self. They can hide an item, set `localLink`, and add their own items. |
| V-A7 | A school admin can't set a rating ceiling above the maximum for that age band (`src/lib/v3/ageBands.ts`). A stored setting above the maximum is ignored. |
| V-A8 | A school admin can't grant the `platform_admin` role, and can't create a `staff` row for another school. |

### 3.4 Platform admin

| ID | Rule |
| --- | --- |
| V-P1 | A platform admin can't select any row from any student-owned table, except their own `users` row. |
| V-P2 | A platform admin can't call `class_roster()`, and can't select `class_members`. They never see a student's name. |
| V-P3 | A platform admin can call `platform_totals()`. It returns counts across the whole platform with no `school_id`, `class_id` or user ID, and suppresses any count of students below the minimum group. |
| V-P4 | A platform admin can select and write `schools`, `staff` and central `content_items` and `media_items` (those with `school_id` null). |
| V-P5 | The platform admin's rights don't come from the service-role key. The service-role key is never sent to a browser and is used only by server scripts (the import script, the link checker, account deletion). |

### 3.5 Between schools

| ID | Rule |
| --- | --- |
| V-X1 | No user of school A, in any role, can select a row whose `school_id` is school B's, from any table. |
| V-X2 | A school's own `content_overrides` and `media_items` are visible only to that school's staff and students. |
| V-X3 | A student in classes at two schools sees each school's overrides only in that school's class context, and their own rows are counted in each class's patterns separately. |

### 3.6 Signed-out visitors

| ID | Rule |
| --- | --- |
| V-N1 | A signed-out visitor can't select any row from any table. |
| V-N2 | The two exceptions are v2's `get_conversation_request(token)` and `answer_conversation_request(token, …)`, which carry over unchanged: a person holding an unexpired token can read that one request's questions and submit one answer. |

## 4. The 5-or-more rule

These apply to every figure returned by `class_patterns()` and `platform_totals()`, and to every figure a staff screen shows.

| ID | Rule |
| --- | --- |
| V-K1 | The minimum group is `SMALL_COUNT`. No function, screen or script uses a literal `5` in its place. |
| V-K2 | A count greater than 0 and less than `SMALL_COUNT` is suppressed. |
| V-K3 | A share (a percentage or fraction) is suppressed when its numerator or its denominator is below `SMALL_COUNT`. |
| V-K4 | For a class with fewer than `SMALL_COUNT` members, `class_patterns()` returns no figures at all, only the fact that the class is too small to report on. |
| V-K5 | **Complementary suppression.** When the number of class members who did *not* do something is between 1 and `SMALL_COUNT − 1`, the count of those who did is suppressed too. Example: in a class of 24, "22 opened it" is suppressed, because it tells the teacher that exactly 2 didn't. |
| V-K6 | When exactly one cell of a breakdown would be suppressed, the next-smallest cell is suppressed as well, so the hidden figure can't be worked out by subtracting from the total. This applies to the seven-level self-check pattern. |
| V-K7 | A count of exactly 0 is shown as 0, subject to V-K5. (Zero identifies nobody as having done the thing. V-K5 still hides it where "everyone else did" would identify a few who didn't.) |
| V-K8 | The suppression is done inside the database function. The browser never receives the true figure. |
| V-K9 | A suppressed figure is shown as a dash, with one fixed explanation on the page: "A dash means the group is too small to show without pointing at someone." It is never shown as "fewer than 5". |
| V-K10 | `class_patterns()` takes a class and nothing finer. There is no filter by gender, house, subgroup, date of joining or any other attribute, and none is to be added. |
| V-K11 | Every figure counts only what happened before today, and only students who joined before today, so the figures move once a day and not as each student acts. The self-check pattern counts each student's most recent self-check only. A teacher can't read one student's result off the change when that student joins or retakes. |

V-K5, V-K6 and V-K11 go further than the spec. The reasoning is in section 8.

## 5. "Share with my teacher"

| ID | Rule |
| --- | --- |
| V-SH1 | Sharing happens only when a student, signed in as themselves, calls `share_entry(entry_id, teacher_id)` for an entry they own. No staff action, setting, schedule or default creates a share. |
| V-SH2 | The student can share only with a teacher of a class they currently belong to. |
| V-SH3 | Sharing copies the entry's prompt and response, as they are at that moment, into a new `shared_items` row. The teacher is never given access to the `journal_entries` row. Later edits to the entry aren't shared. |
| V-SH4 | Before confirming, the student is shown the exact text that will be sent and the teacher's name. One entry is shared per confirmation; there is no "share all" and no standing permission. |
| V-SH5 | The student can unshare at any time. Unsharing deletes the `shared_items` row; the teacher can no longer read it. |
| V-SH6 | A shared item is visible to the one teacher it was sent to. It isn't visible to the school admin, to another teacher of the same class, or to the platform admin. |
| V-SH7 | The following can't be shared at all, because v2 already treats them as the most private: self-check answers and results, outcome check-in answers, and the support circle. `share_entry()` accepts journal entries only. |
| V-SH8 | The on-device risk check still runs when the student writes the entry. Sharing doesn't run it again, doesn't flag the item to the teacher, and doesn't label it. |
| V-SH9 | When a student leaves the class or deletes their account, their shared items to that class's teacher are deleted. When a teacher stops teaching the class, shared items addressed to them are deleted. |

## 6. Content, AI and data minimisation

| ID | Rule |
| --- | --- |
| V-C1 | The `teacherNotes` of a self are stored in a column that students have no select right on. They are never part of any response to a student session. |
| V-C2 | No table has a column for date of birth, age, phone number, street address or location. A schema test fails the build if any column name, split on underscores, contains the word `dob`, `birth`, `birthday`, `age`, `phone`, `mobile`, `address`, `postcode`, `suburb`, `lat`, `lng` or `location`. (Whole words, so `life_stage` and `self_image` pass.) |
| V-C3 | A student's year level is copied from their class when they join. It is never asked for as an age. |
| V-C4 | Private steps (`keepFromAi`), weekly reflections, Next Chapter and My Story are never sent to the Anthropic API. This is v2's rule. In v2 it is kept by the caller alone: only `ActivityClient` calls `/api/reflect`, and it skips steps marked `keepFromAi`; the route itself accepts any text. In v3 the route also checks: it loads the entry by `entryId`, refuses a request with no entry, and refuses when the entry's activity is one of the four kinds above. |
| V-C5 | When a school's `settings.ai_enabled` is false, `/api/reflect` makes no call to the Anthropic API for a student whose current class belongs to that school. |
| V-C6 | No free text is written to any table a staff role can select, other than a `shared_items` row created under section 5. |
| V-C7 | No free text appears in server logs, error reports or analytics events. |

## 7. Safeguarding components that carry over unchanged

These move into the new shell as they are. Their wording, patterns, thresholds and behaviour don't change without David's explicit approval, and `npm run check:phrases` passes on every commit.

| Component | File | What must stay true |
| --- | --- | --- |
| The risk check | `src/lib/help.ts` (`CRISIS_PATTERNS`, `mentionsCrisis`) | Runs on the student's device when they save something they wrote. Nothing is sent or stored. A match shows the support card and nothing else. |
| The helplines | `src/lib/help.ts` (`HELP_LINES`, `EMERGENCY`) | Kids Helpline, Lifeline, 13YARN, QLife, and 000. Names, numbers and descriptions unchanged. |
| The hard-on-yourself check | `src/lib/hardOnSelf.ts` (`PATTERNS`, `PATTERN_THRESHOLD`, `hardOnSelfRecently`) | Runs on the device over the student's last six entries. Looks for a pattern, not a moment. Nothing is saved, flagged or sent. The risk check takes priority. |
| The support card | `src/components/help/SupportCard.tsx` | Replaces the usual follow-up questions when the risk check or the AI reflection raises a concern. |
| The gentle check | `src/components/help/GentleCheck.tsx` | Shown when the hard-on-yourself check fires. Says "Only you can see this", which v3 must keep true. |
| "Need to talk?" | `src/components/help/GetHelpButton.tsx`, `HelpLines.tsx` | On every signed-in student screen. Opens a sheet over the page, so nothing the student has written is lost. |
| The phrase tests | `scripts/check-phrases.ts`, `docs/content-review/phrase-lists.md` | Every pattern change comes with a must-match and a mustn't-match case. |
| The private-step rule | `keepFromAi` on an activity and `isSensitiveActivity()` in `src/lib/missions.ts`; the `sendsToAi` check in `ActivityClient.tsx` | Private steps are never sent to the AI, are kept off Home's recent entries, and are found in journal search by their title only, never by what was written. |
| The mattering rule | The comment and copy in `src/lib/selves.ts` | The mattering prompt stays on the positive side. No question asks whether anyone would notice the student was gone. The same rule covers every Level 2 self-check item. |
| Account deletion | `src/app/api/delete-account/route.ts` | Carries over, and is extended to the new student-owned tables (V-S11). |

Three rules follow for v3:

| ID | Rule |
| --- | --- |
| V-G1 | No code path sends the result of `mentionsCrisis()` or `soundsHardOnSelf()` to the server, stores it, or includes it in any count. |
| V-G2 | No staff screen, function or report says or implies that a student triggered the support card or the gentle check. |
| V-G3 | The school's "Who to talk to here" card is shown beside the national helplines. It never replaces them, and a school can't hide a helpline. |

## 8. Where this draft goes further than the spec, and why

1. **Complementary suppression (V-K5, V-K6).** The spec hides counts below 5. That isn't enough on its own once the teacher has the roster, which the spec also gives them. "22 of 24 opened it" passes the spec's rule and tells the teacher two students didn't; a teacher who knows their class can often guess which. Hiding the figure when the remainder is small closes that. The cost is that the patterns screen shows more dashes, most of all in small classes and when nearly everyone takes part.
2. **Whole-class minimum (V-K4).** In a class of 4 no figure is safe, so nothing is reported.
3. **Differencing over time (V-K11).** If the pattern updates live, a teacher can note the figures, wait for one student to retake the self-check, and read the change. A daily recompute blunts that. It doesn't remove it entirely, and no simple rule does; this is a known limit and is stated plainly in section 9.
4. **Sharing copies, and doesn't grant (V-SH3).** It keeps "a teacher can't select any row from `journal_entries`" true with no exceptions.
5. **Shared items stop at the teacher (V-SH6).** The spec's table gives school admins "No" for shared items; this makes it a rule.

**One place where the spec's own table needs a decision, not a rule.** The spec gives the teacher "who has joined the class (names)" and also "participation counts". With names on one screen and "9 of 26 finished" on another, the spec's design accepts that a teacher knows 17 of their named students haven't finished, without knowing which. That is the intended trade, and this document keeps it. It is listed in section 9 so the wellbeing lead agrees to it knowingly.

## 9. For the wellbeing lead: what you are being asked to agree to

1. **A teacher sees the names of students in their class, and group figures. Nothing else.** They never see what a student wrote, what a student answered, or which students did or didn't do something.
2. **Group figures are hidden when the group is small** (fewer than 5 students, or all but a few). On small classes, most of the screen will be dashes.
3. **A student can choose to send one journal entry to one of their teachers.** The student sees exactly what will be sent. They can take it back. Nobody else at the school can read it.
4. **Groundwork doesn't tell any adult when a student writes something worrying.** When a student writes words that suggest they may be at risk, their own screen shows a support card with Kids Helpline, Lifeline, 13YARN, QLife and the school's own contact. Nothing is sent to the teacher, the school or Groundwork. This is deliberate: matching on key words raises false alarms and misses real ones, and students write honestly only when they trust that the writing is private.
5. **So Groundwork is not a monitoring tool, and must not be relied on as one.** A school that needs active monitoring of student writing needs a different product. **This is the decision the spec asks you to make with David:** is "support routes, not monitoring" acceptable for this school?
6. **A student who shares an entry may be disclosing something.** When a teacher reads a shared entry that raises a concern, the school's ordinary child-protection and duty-of-care procedures apply, exactly as they would to a note handed over in class. Groundwork doesn't change those obligations and doesn't handle them for the school. The share screen should tell the student, in plain words, that a teacher who is worried about their safety has to act on it. **Wording to be agreed with you.**
7. **A known limit.** A determined teacher who watches the group figures closely over time, in a small class, could sometimes infer something about one student. The rules above make that hard. They don't make it impossible.
8. **The school can add its own "Who to talk to here" card.** It appears beside the national helplines, never in place of them.

Items 4 to 6 are not legal advice, and nothing in this document has been checked against Queensland's mandatory-reporting law or the school's child-protection policy. That check belongs to the school before any class uses "Share with my teacher".
