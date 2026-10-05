# Groundwork: a plan for evidence

**What this is:** the steps between "the app can collect a before and after" and "we can say whether it helps". It covers:
- which validated scales to use and what each needs;
- how to run them without building licensed questionnaires into the app;
- the ethics and school approvals;
- a pilot design;
- the small amount of code a pilot would need.

**Status, October 2026:**
- The app runs its own nine-question check-in (`src/lib/checkin.ts`). It's taken during onboarding and again 70 days later, with a record of how much of the app the student used each time.
- The questions are Groundwork's own wording. They aren't validated, so their results aren't evidence.
- Nothing is analysed across students. The privacy page says answers are only shown back to the student.

Licensing details below were checked against public sources in October 2026. Confirm them with each rights holder before relying on them.

---

## 1. The short version

1. **Find a university research partner first.** They bring the ethics committee (HREC), the non-commercial licences for wellbeing measures, a survey platform, and credibility with schools.
2. **Run the validated scales in the partner's survey tool, not in the app.** Link answers to app use with a study code. This avoids embedding licensed scales in a commercial product, and keeps research data under the university's governance.
3. **Make the pilot about feasibility, not proof.** Can schools recruit? Do students stay? Do they use it? Is it safe? A small pilot can't show the app works, but it can show whether a proper trial is worth running.
4. **Keep the in-app check-in for everyone.** Students still see what moved. The pilot can also test Groundwork's own nine questions against the validated scales, which would make them more useful afterwards.

---

## 2. Validated scales, matched to what the check-in measures

The check-in measures three things, chosen to match the identity research. Each has a validated scale.

| What it measures | Validated scale | Items | Used with adolescents? | What using it needs |
|---|---|---|---|---|
| **Knowing who you are** (clarity) | Self-Concept Clarity Scale (Campbell et al., 1996) | 12, five-point agreement | Yes. Crocetti and colleagues used it in a six-wave study of Dutch adolescents and their parents. | Published in an APA journal. Research use is common without a formal licence. For anything beyond a university study, ask the lead author and APA permissions. |
| **Having a direction** (commitment and exploration) | Utrecht-Management of Identity Commitments Scale, U-MICS (Crocetti, Rubini & Meeus, 2008) | 13 per domain: 5 commitment, 5 in-depth exploration, 3 reconsideration. Five-point agreement. | Yes. Validated in many countries and languages. | No licence statement found. Ask Elisabetta Crocetti (University of Bologna) for permission, and which domain fits best. The educational domain is the natural one. |
| **Something bigger than you** (purpose) | Claremont Purpose Scale (Bronk, Riches & Mangan, 2018) | 12, each with its own five response labels | Yes, designed for grades 6–12. | Listed as open access. Contact Kendall Cotton Bronk (Claremont Graduate University) to confirm use. |
| **Wellbeing** (safety and secondary outcome) | Short Warwick-Edinburgh Mental Wellbeing Scale, SWEMWBS | 7 | Yes. Warwick says the short version is validated from age 11. | Free under a non-commercial licence for universities, schools and charities. A company needs a paid commercial licence, and Warwick says anyone building it into a system needs a full commercial licence first. |

**Things to know before choosing:**
- **Length.** All four together come to about 44 items. That's too long for onboarding, but fine for a consented study session at school. That's another reason to run them in a research survey, not the app.
- **Sensitivity to change.** Self-concept clarity was very stable from year to year in the Dutch study. Over ten weeks it may barely move. Treat clarity as a secondary outcome, and don't size a future trial on it without pilot data.
- **Purpose scale format.** Its response labels differ for every question. Groundwork's check-in uses one shared five-point scale, so it couldn't show this scale without a change (see section 6).
- **Is Groundwork commercial?** If it's run by a company, it counts as commercial for licensing, even if it's free to students. A university running the pilot under its own licences avoids that, but only if the university administers the scales, not the app.

---

## 3. Ethics and approvals (Australia)

- **Human research ethics (HREC).** Research with people under 18 needs HREC review under the *National Statement on Ethical Conduct in Human Research* (2023), mainly Chapter 4.2, *Children and young people*. A university partner's HREC is the usual route.
- **Consent.** Expect to need both the student's consent and a parent or carer's. The National Statement lets an HREC accept a mature young person's own consent in some circumstances. That's the committee's call, so don't assume it.
- **School approvals.** Research in NSW public schools needs approval under SERAP (State Education Research and Partnerships). It now starts with an expression of interest. Other states, and the Catholic and independent sectors, have their own processes. Allow for them in the timeline.
- **Aboriginal and Torres Strait Islander students.** If the pilot recruits them, or reports on them as a group, follow the NHMRC's *Ethical conduct in research with Aboriginal and Torres Strait Islander Peoples and communities* (2018) and the AIATSIS Code of Ethics. That means community engagement before the study, not after. It ties in with the community review the Culture and Heritage step needs (`docs/content-review/culture-and-heritage.md`).
- **Working with Children Checks** for anyone on the research team who will be in schools.
- **Privacy:**
  - update the privacy page before any data is used for research;
  - confirm where the app's data is hosted (the Supabase region);
  - state what's shared with researchers. That should be the study code, check-in scores, usage counts and dates, never journal text;
  - set how long data is kept and how a student withdraws.
- **Pre-registration.** Register the pilot's aims and measures before data collection, on OSF or the Australian New Zealand Clinical Trials Registry. A later trial will be more credible for it.

---

## 4. Pilot design

**Question:** is a full trial of Groundwork feasible, acceptable and safe in Australian schools, and is there an early signal worth testing?

**Design:** a small waitlist-controlled pilot.
- Classes or schools are randomised to start now or one school term later.
- The later group gives a comparison for the ten weeks.
- Every participant still gets the app.
- A pre-post study with no comparison group, which is what the app supports today, can't separate the app from ordinary growing up.

**Participants:**
- Year 9 to 11 students in 2 to 4 schools. Year 12 is better avoided, because of exam pressure and the end of the school year.
- Size the sample for estimating recruitment and retention, not for detecting an effect. Ask the research partner to set a target.

**Measures:**
- **Feasibility (primary):**
  - consent and recruitment rate;
  - share completing the follow-up survey;
  - app use: required mission steps done, weeks done, Character Code written. The app already records all of these as its usage record.
- **Acceptability:** short student interviews or focus groups, and teacher feedback.
- **Safety:**
  - SWEMWBS at both time points;
  - a distress protocol agreed with each school's wellbeing staff;
  - a count of how often the in-app support card appeared. This would need a small change, because today nothing about it is recorded.
- **Early signal (exploratory):** U-MICS, Claremont Purpose Scale and Self-Concept Clarity Scale, before and after.
- **Groundwork's own nine questions:** collected alongside the validated scales, to check how well they match. That would be the first real data on whether the in-app check-in measures what it claims to.

**Progression criteria:** agree before the pilot what would justify a full trial. For example: a minimum share completing follow-up, a minimum level of use, and no safety concerns. Set the thresholds with the research partner.

**Timing:** ten weeks of use, matching the program and the 70-day follow-up. Approvals usually take longer than the pilot, so allow at least a school term for HREC and education department review.

---

## 5. Permission requests to send

These are short drafts, adapted to whoever sends them. Ideally that's the research partner, since academic-to-academic requests tend to get faster answers. Check the contact details before sending.

**To the U-MICS author (Elisabetta Crocetti, University of Bologna):**
> We're planning a small university-led pilot of Groundwork, a self-guided identity-development app for Australian students aged 13 to 18, and would like to use the U-MICS as an outcome measure, administered in the university's survey platform rather than inside the app. Could you confirm permission for this use, and advise which domain (educational or interpersonal) you'd recommend for a general identity intervention at this age?

**To the Claremont Purpose Scale author (Kendall Cotton Bronk, Claremont Graduate University):**
> We'd like to use the Claremont Purpose Scale as an outcome measure in a small university-led pilot of a self-guided identity-development app for Australian students aged 13 to 18, administered in the university's survey platform. Could you confirm this use is permitted, and whether there's an Australian or adapted version we should use?

**To Warwick Innovations (SWEMWBS):** the university partner registers for the non-commercial licence itself. Separately, ask Warwick in writing whether the pilot as designed sits within that licence, since Groundwork itself is the intervention being tested.

---

## 6. What the app would need for the pilot

None of this is built yet. It should be shaped by what the HREC approves, so it's listed here rather than written ahead of time.

1. **Study enrolment:**
   - a place for a consented student to enter the study code they're given;
   - stored with the date of consent and of any withdrawal;
   - withdrawing stops anything further being shared.
2. **Survey links:** for enrolled students, Home's check-in suggestion points to the partner's baseline and follow-up surveys, with the study code filled in. The timing uses the existing 70-day follow-up.
3. **A research export:**
   - a script run by an authorised person;
   - covers enrolled, non-withdrawn students only;
   - includes the study code, the in-app check-in scores and usage records with their dates, and the start group;
   - never includes journal text or names.
4. **A count of support-card appearances,** as a safety measure. It would record only that the card appeared and when, never what triggered it.
5. **Privacy page and an in-app study information sheet,** in the HREC-approved wording.
6. **Only if a scale is later moved into the app:** per-question response labels in the check-in, for the Claremont Purpose Scale. Plus a new `ITEM_SET` id, so answers to the new and old questions are never mixed. The check-in already stores which set each answer was given under.

---

## Sources

- Self-Concept Clarity Scale: Campbell et al. (1996), *Journal of Personality and Social Psychology*, 70(1), 141–156. For use with adolescents, see Crocetti and colleagues' six-wave study of self-concept clarity in adolescents and parents ([Tilburg University record](https://research.tilburguniversity.edu/en/publications/self-concept-clarity-in-adolescents-and-parents-a-six-wave-longit/)).
- U-MICS: Crocetti, Rubini & Meeus (2008), and the validation in Spanish university students ([PMC6085597](https://pmc.ncbi.nlm.nih.gov/articles/PMC6085597/)), which describes the 13 items, three dimensions and two domains.
- Claremont Purpose Scale: Bronk, Riches & Mangan (2018), *Research in Human Development*, 15(2), 101–117. Item list: [cic.edu](https://cic.edu/claremont-purpose-scale). Access listing: [EdInstruments](https://edinstruments.org/node/677).
- WEMWBS and SWEMWBS licensing: [Warwick Innovations FAQ](https://warwick.ac.uk/services/innovations/wemwbs/faq/) and [non-commercial licence registration](https://warwick.ac.uk/fac/sci/med/research/platform/wemwbs/using-old/non-commercial-licence-registration). Adolescent validation: Clarke et al. (2011), *BMC Public Health* ([PMC3141456](https://pmc.ncbi.nlm.nih.gov/articles/PMC3141456)).
- National Statement on Ethical Conduct in Human Research (2023), Chapter 4.2 ([PDF copy](https://www.swslhd.health.nsw.gov.au/Ethics/content/pdf/National-Statement-Ethical-Conduct-Human-Research-2023.pdf)).
- NSW SERAP: [Research in our schools](https://education.nsw.gov.au/about-us/education-data-and-research/research-with-us/researching-in-our-schools).
