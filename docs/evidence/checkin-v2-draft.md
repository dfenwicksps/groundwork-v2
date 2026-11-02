# Check-in v2: draft items for review

**Status:** DRAFT for your edits. No app code uses these yet.
**Decision this implements** (2 November 2026): five outcomes, measured in the app in Groundwork's own words, inspired by validated scales but not copying them:
- self-esteem
- self-efficacy
- self-confidence
- self-concept clarity
- mattering

They replace the current direction and purpose items. Purpose remains something the app builds (Mission 2); it just isn't something we claim to change.

**What these items can and can't do:** they show a student what moved. They are not evidence of effect until the pilot checks them against validated scales run outside the app (see `evidence-plan.md`). Nothing in the app, marketing or school material should claim change in these outcomes from these items alone.

---

## 1. Design rules the items follow

1. **No clinical register.** No item names a construct ("self-esteem"), a symptom or a diagnosis. Wording matches the existing check-in: first person, plain, a little informal.
2. **No harsh negatives.** Rosenberg-style statements such as "At times I think I am no good at all" are out. Each reverse-scored item is mild, and none would trip the hard-on-yourself check. Mattering has no reverse items, because "nobody would notice me" is too close to risk language for a self-guided app.
3. **Rate, don't choose.** Every item is a rating, never "which would you do?". Multiple-choice scenarios measure whether a student can spot the right answer, not what they believe about themselves.
4. **Self-efficacy uses its own scale.** Bandura's method asks how sure you are that you could do a specific thing, in a specific area. The other four use the existing "like me" scale.
5. **Same meaning at every age.** Only the setting changes by life stage (class, uni or TAFE, work); the thing being rated doesn't.
6. **Clarity keeps its three items word for word.** That keeps clarity results comparable across the old and new sets, the only continuity available.

---

## 2. The items

**Scale A (most items):** Not like me · A bit like me · Somewhat like me · Quite like me · Very like me *(unchanged)*
**Scale B (self-efficacy only):** Not at all sure · A bit sure · Fairly sure · Very sure · Completely sure

Items are interleaved in the order shown in §3, so no construct comes in a block.

### Knowing who you are: self-concept clarity *(unchanged)*

| Key | Item | Rev |
|---|---|---|
| c1 | I could describe who I am to someone in a few honest sentences. | |
| c2 | My sense of who I am changes a lot depending on who I'm with. | ✓ |
| c3 | I know what I value, even when the people around me don't share it. | |

### Liking who you are: self-esteem
*Inspired by: Rosenberg's global self-evaluation, and Harter's global self-worth.*

| Key | Item | Rev | Notes |
|---|---|---|---|
| e1 | On the whole, I like the person I am. | | The core global evaluation |
| e2 | I've got good things to offer, even in a bad week. | | Adds stability, the "floor" idea, without asking about worth outright |
| e3 | I often wish I was someone else. | ✓ | A mild reverse item that guards against agreeing with everything |

### Backing yourself: self-confidence (the everyday sense)
*Inspired by: general willingness to act without certainty. No validated scale exists for this, so the pilot checks these items against self-efficacy and self-esteem.*

| Key | Item | Rev | Notes |
|---|---|---|---|
| f1 | I'm usually willing to have a go, even when I'm not sure it'll work. | | Acting despite doubt |
| f2 | When something's new, I expect I'll work it out. | | General expectation of coping |
| f3 | I hold back from trying things in case I look silly. | ✓ | Fear of judgement, the main thing that blocks confidence at this age |

### I can do this: self-efficacy
*Inspired by: the SEQ-C's three areas (school, social, emotional) and Bandura's "how sure are you that you could…" format.*
**Stem:** "How sure are you that you could…"

| Key | Area | Year 7–12 wording | Left-school wording |
|---|---|---|---|
| s1 | Study / work | …keep going with schoolwork that's hard, when you'd rather stop? | …keep going with study or work that's hard, when you'd rather stop? |
| s2 | People | …start a conversation with someone in your year you don't really know? | …start a conversation with someone at uni, TAFE or work you don't really know? |
| s3 | Feelings | …calm yourself down after something's really upset you? | *(same)* |
| s4 | Standing your ground | …say no to friends when they want you to do something you don't want to do? | *(same)* |
| s5 | Getting better | …stick at practising something difficult until you're noticeably better at it? | *(same)* |

s5 is the item closest to week 5 and the mastery work, so expect it to move most if the program is doing its job.

**One honest limit.** Bandura's full method uses several items per area at rising difficulty. One item per area is an index, not a full scale. It's the right trade for a 3-minute check-in, but the pilot's longer validated measure (SEQ-C) is what tells us whether the index is good enough.

### Mattering to people: mattering
*Inspired by: Rosenberg & McCullough's three parts (being noticed, being important, being depended on), and Prilleltensky's two halves (feeling valued, adding value).*

| Key | Item | Rev | Part |
|---|---|---|---|
| m1 | There are people who notice how I'm going. | | Being noticed |
| m2 | Someone counts on me for something. | | Being depended on |
| m3 | Some people are better off because of things I do. | | Adding value, which is The Standard's question 2 |

No reverse item. That's deliberate (see rule 2), and the cost is some sensitivity to students who agree with everything. The pilot can show whether that's a problem.

---

## 3. Order and length

**17 items, about 3 minutes.** That's up from 9, so onboarding gets longer. Order, alternating constructs and scales:

c1 · e1 · s1 · m1 · f1 · c2 · s2 · e2 · m2 · f2 · s3 · c3 · e3 · s4 · m3 · f3 · s5

**If that's too long,** a 12-item version would be: c1, c2, e1, e3, f1, f3, s1, s3, s5, m1, m2, m3. It keeps at least two items per construct, and one reverse item each for clarity, esteem and confidence. Two-item results are rough, so I'd only drop to this if completion rates suffer.

---

## 4. What the student sees afterwards

| Construct | Name on the results screen | Blurb |
|---|---|---|
| clarity | Knowing who you are | How clear and steady your sense of yourself feels *(unchanged)* |
| esteem | Liking who you are | How you feel about yourself overall |
| confidence | Backing yourself | How ready you are to have a go |
| efficacy | Knowing you can | How sure you are you could handle specific hard things |
| mattering | Mattering to people | Feeling noticed, counted on and useful to others |

There are no scores out of 100 and no labels like "low". The current design shows a bar per area at the start and again at the end, which already fits.

---

## 5. Code changes needed once you approve the wording

1. **`checkin.ts`:**
   - add `groundwork-interim-v2` with the five constructs;
   - give each construct its own scale labels (efficacy uses scale B);
   - give items a life-stage wording variant.
2. **Keep v1 in the code.** A student whose start check-in was v1 must get v1 at the end too, or there's nothing to compare. The end check-in uses the start's `item_set`, and v2 applies only to new starts. This is the most important part of the change.
3. **`CheckinForm.tsx`:** show the right scale per item and the efficacy stem. It needs the student's life stage, which is already captured at onboarding.
4. **`CheckinClient.tsx`:** results for five areas; v1 students keep seeing their three.
5. **`/api/checkin`:** validate against the set being answered, not a fixed list.
6. **No database migration.** Answers are already stored as JSON with their `item_set`.

## 6. Questions for you

1. Any item that doesn't sound like Groundwork, or like your students?
2. 17 items, or the 12-item version?
3. Are the names on the results screen (§4) right? "Backing yourself" is an Australian idiom, which is intended.
4. Should Year 7–9 get simpler wording on any item? I've kept the vocabulary at roughly a 12-year-old's level throughout, but s4 and e2 are the ones to check with students.
