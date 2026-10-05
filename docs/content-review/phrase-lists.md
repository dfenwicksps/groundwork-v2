# The on-device checks: building the phrase lists with young people

**Status:** the lists were written by adults, in English only. This pack is the plan for co-designing them with young people and adding the languages your students speak.
**Code:** the risk check is `CRISIS_PATTERNS` in `src/lib/help.ts`, and the hard-on-yourself check is `PATTERNS` in `src/lib/hardOnSelf.ts`. Run `npm run check:phrases` to test both.

## What the checks do, and don't

- **The risk check** runs on the student's device when they save any reflection. If the writing matches, the app shows the support card: Kids Helpline, Lifeline, 13YARN and QLife. Nothing is saved, flagged or sent, and no adult is told.
- **The hard-on-yourself check** runs on mission steps, weekly reflections, Your Next Chapter and My story. If the entry just written, and at least three of the last six, read as a verdict on the self, the app suggests a different move. Again, nothing is saved or sent.
- **The AI follow-up** on mission steps also looks for risk, and isn't limited to exact phrases. But the private steps, weekly reflections, Next Chapter and My story never go to it. So the most private writing relies on these lists alone.
- **They aren't a safety net and must never be described as monitoring.** What doesn't depend on them is "Need to talk?", on every screen including onboarding.

## Known gaps

- **English only.** A student who writes in another language, or switches between languages, isn't covered.
- **Adult wording.** The lists cover the textbook phrases and a few documented online euphemisms. They will miss much of how young people actually say these things, and slang changes fast.
- **Jokes and everyday speech.** "This exam is killing me" mustn't trigger the card, but some slang is used both ways. A card that appears too often stops being read.

## Running co-design sessions

**Who:**
- A youth advisory group of about six to ten students, from a partner school or a youth service.
- A facilitator trained in youth mental health.
- A counsellor or wellbeing staff member present.
- Consent from students and, where needed, parents or carers. If it's part of the pilot, run it through the ethics application (see `docs/evidence/evidence-plan.md`).

**How to keep it safe:**
- Never ask students about their own experiences, and never ask them to write or act out what distress sounds like.
- Ask about language in general: "When people your age are having a really bad time, how do they say it, in person and online?" and "What would someone say that adults wouldn't recognise?"
- Show them the current lists in plain words and ask three things: what's missing, what's out of date, and what would cause false alarms because people say it as a joke.
- Close every session with where to get help, and have the counsellor available afterwards.

**Turning it into patterns:**
- A developer turns each agreed phrase into a pattern.
- Each one gets at least one "must match" and one "mustn't match" case in `scripts/check-phrases.ts`. The "mustn't" is the everyday sentence it could catch by accident.
- If an addition makes the card appear for ordinary writing, drop it, or tie it to words that make the meaning clear. That's how "kms" works: it only counts after "gonna", "want to" and similar, because on its own it's also kilometres.

## Adding other languages

1. **Find the most common languages at partner schools.** Use aggregate enrolment figures, not individual students' details.
2. **Draft the phrases for each language** with a bilingual youth worker or accredited translator, plus a few young speakers of that language. Direct translation of the English list won't capture how young people say it.
3. **Have someone else review it** who speaks the language and works with young people.
4. **One technical point:** the patterns use word boundaries (`\b`), which only work for letters a–z. Languages written in other scripts, such as Chinese, Arabic or Vietnamese with its accents, need patterns without them. Test each addition with real sentences.
5. **Add support lines** for each language where they exist. For example, the Translating and Interpreting Service (TIS National) can connect a caller to an Australian service in their language. Verify every number before adding it.

## Keep it current

- Review the lists every year with a new group, since slang dates quickly.
- After any change, run `npm run check:phrases` and keep the cases.

## Changes so far

**October 2026, before co-design.** Added a few well-documented online euphemisms and classic phrasings:
- "kms", only after a word like "gonna" or "want to";
- "unalive" and "sewerslide";
- "kys", which is what bullying says;
- "end myself", and "take", "taking" or "took my own life";
- "wish I was dead" and "wish I wasn't alive";
- "don't want to wake up".

The hard-on-yourself check added "I'm trash", "garbage", "a waste of space", "a joke" and "a mess".

Considered and left out: "overdose", because jokes like "overdosed on coffee" would trip it.

All cases in `scripts/check-phrases.ts` pass.
