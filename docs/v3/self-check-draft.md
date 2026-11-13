# Groundwork v3: the self-check statements (draft)

**Status: draft wording for David's review, 13 Nov 2026 (D57). The self-check is built and uses these statements, marked in the database as item set `draft-1`. They must not be put in front of students until the three steps under "Before any student answers" are done.**

## What the self-check is

25 short statements, one for each self (D30). For each, the student picks how much it sounds like them, from "Not like me" to "Very like me". At the end they get words, never numbers: one or two parts of the map where they're already steady, and two or three selves that might be worth exploring. It's a way to choose where to start. It isn't a test, and nobody but the student sees it.

The five answers are: **Not like me · A little like me · Somewhat like me · Mostly like me · Very like me.** The spec fixes only the two ends; the middle three are mine.

## The statements

Seven are the spec's own examples (section 6). I drafted the other 18 to match them. The app keeps them in `src/lib/v3/selfCheck.ts`.

### Know myself (Identity)

| Self | Statement | From |
| --- | --- | --- |
| Self-awareness | When I'm upset, I can usually name what I'm actually feeling. | Spec example |
| Self-reflection | After something goes well or badly, I think about why. | New draft |
| Self-concept | I could describe what I'm like to someone who's never met me. | New draft |
| Self-image | I've got a fair idea of how I come across to other people. | New draft |
| Social self | I notice how I change depending on who I'm with. | New draft |

### Value myself (Connection)

| Self | Statement | From |
| --- | --- | --- |
| Self-esteem | Most days, I'm okay with being me. | New draft |
| Self-worth | Even after a rough week, I still feel like I count. | New draft |
| Mattering | There are people who are glad when I turn up. | New draft |
| Self-respect | I stick to what matters to me, even when it would be easier to let it go. | New draft |
| Self-compassion | When I mess up, I talk to myself the way I'd talk to a friend. | Spec example |

### Manage myself (Purpose)

| Self | Statement | From |
| --- | --- | --- |
| Self-regulation | When I feel a big reaction coming, I can usually pause before I act. | New draft |
| Self-discipline | I can keep going on something boring when it matters to me. | Spec example |
| Self-motivation | I can find my own reasons to get started, without someone pushing me. | New draft |

### Believe in myself (Purpose)

| Self | Statement | From |
| --- | --- | --- |
| Self-efficacy | When something's hard, I can usually work out a way to get better at it. | New draft |
| Self-confidence | I'll have a go at something new even if I'm not sure how it'll turn out. | New draft |
| Self-trust | When I promise myself I'll do something, I usually do it. | Spec example |

### Direct myself (Purpose)

| Self | Statement | From |
| --- | --- | --- |
| Autonomy | A lot of what I do each week, I'd choose to do anyway. | New draft |
| Self-advocacy | I can say what I need to a teacher, even when it's awkward. | Spec example |
| Self-authorship | I've thought about what I believe, and haven't just taken on what others think. | New draft |

### Imagine myself (Meaning)

| Self | Statement | From |
| --- | --- | --- |
| Actual self | I can be honest with myself about where I'm at right now. | New draft |
| Ideal self | I can picture a version of me in five years that I'd like to be. | Spec example |
| Ought self | I can tell the difference between what I want and what others expect of me. | New draft |
| Feared self | I know the kind of person I'd rather not turn into. | New draft |
| Possible selves | I can imagine more than one future that could suit me. | New draft |

### Authentic self (Meaning)

| Self | Statement | From |
| --- | --- | --- |
| Authentic self | I act much the same way whoever I'm with. | Spec example |

## Rules these keep, and how each is checked

| Rule | How it's kept |
| --- | --- |
| Written fresh, with no item from a published scale (the spec's licensing rule) | I wrote them without copying any scale. I have **not** compared them line by line against published scales, so a specialist's eye on that is worth having. |
| "Very like me" is always the steady end | Every statement is worded in the positive direction, so nothing is scored in reverse. |
| The Value myself statements are positive | A test fails if any of the five contains a negation or a risk word. None asks about being worthless, a burden, unnoticed or wanting to disappear. |
| No risk language anywhere | The same test checks all 25. |
| One short first-person sentence | Tested. |

## How the suggestion is worked out

The spec's rule assumed three statements per level. With one per self (D30) it works like this:

1. For each of the seven parts of the map, take how "like me" its statements were on the whole.
2. The two that were most like the student are **already steady**, but only if their answers sat on the "like me" side. A student who answered low everywhere is not told anything is steady.
3. The two that were least like the student each suggest one self: the one whose statement was least like them. A third self is added when that part of the map has a clear second.
4. If the answers were much the same everywhere, nothing is suggested, and the student is told to pick whatever looks interesting.
5. Ties go to whichever comes first on the map.

Only the names of levels and selves are stored as the result. No score is stored for display and none is shown.

## What the result does

- **The result screen** shows the words, and last time's result beside it once there is one.
- **Home** suggests a next step from the parts of the map the self-check pointed at, and shows the suggested selves.
- **The map** marks the suggested selves "From your self-check". Only the student sees that.
- **The teacher** sees one thing, once at least five students have taken it: how many students were pointed at each part of the map, with small numbers hidden (the existing rules V-K1 to V-K11).

A student can take it again after ten weeks, which stands in for "once a term".

## Before any student answers

From spec section 6, "Before release". None of these has happened.

1. **David approves the wording** of all 25.
2. **A school psychologist or counsellor reviews the five Value myself statements.**
3. **A pilot with about 30 students**, to find statements everyone agrees with and statements students misread.

Also still true: never describe it to schools or parents as a diagnostic or an assessment.

## Things for David to decide

1. **The wording,** especially the 18 new statements.
2. **"I notice how I change depending on who I'm with" (Social self) and "I act much the same way whoever I'm with" (Authentic self)** pull in opposite directions. Both are true to the master file's descriptions, but a student may feel they can't agree with both. One may need rewording.
3. **Authentic self has only one statement,** so that part of the map rests on a single answer. It will show up as "steady" or "worth exploring" more often than the others by chance.
4. **Ten weeks between takes.** Term lengths differ by state and year; say if you want a different gap.
5. **The middle three answer labels.**
