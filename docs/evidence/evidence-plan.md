# Groundwork: a plan for evidence

**What this is:** the steps between "the app can collect a before and after" and "we can say whether it helps". It covers:
- which validated scales to use and what each needs;
- how to run them without building licensed questionnaires into the app;
- the ethics and school approvals;
- a pilot design;
- the small amount of code a pilot would need.

**Status, November 2026:**
- The app runs its own nine-question check-in (`src/lib/checkin.ts`). It's taken during onboarding and again 70 days later, with a record of how much of the app the student used each time.
- The questions are Groundwork's own wording. They aren't validated, so their results aren't evidence.
- Nothing is analysed across students. The privacy page says answers are only shown back to the student.

**Decision, 2 November 2026:** Groundwork's outcomes are now five:
- self-esteem;
- self-efficacy;
- self-confidence;
- self-concept clarity;
- mattering.

Direction and purpose are no longer measured outcomes; purpose is still built in Mission 2. The reasoning is in `self-outcomes-map.md`, and the draft in-app items are in `checkin-v2-draft.md`.

The in-app check-in stays in Groundwork's own words, inspired by the validated scales but never copying them, so the app never feels like a mental-health assessment. The validated scales below are run *outside* the app, by the research partner. They do two jobs:
- test whether Groundwork changes anything;
- check whether the in-app items measure what they claim.

Licensing details below were checked against public sources in October–November 2026. Confirm them with each rights holder before relying on them.

---

## 1. The short version

1. **Find a university research partner first.** They bring the ethics committee (HREC), the non-commercial licences for wellbeing measures, a survey platform, and credibility with schools.
2. **Run the validated scales in the partner's survey tool, not in the app.** Link answers to app use with a study code. This avoids embedding licensed scales in a commercial product, and keeps research data under the university's governance.
3. **Make the pilot about feasibility, not proof.** Can schools recruit? Do students stay? Do they use it? Is it safe? A small pilot can't show the app works, but it can show whether a proper trial is worth running.
4. **Keep the in-app check-in for everyone.** Students still see what moved. The pilot also tests Groundwork's own questions against the validated scales. If they agree well, the in-app check-in becomes a usable light-touch measure afterwards. Until then, no claim of change in any of the five outcomes should rest on it.

---

## 2. Validated scales, matched to the five outcomes

Each outcome has a validated scale to check the in-app items against, except self-confidence, which has no separate validated construct.

| Outcome | Validated scale | Items | Used with adolescents? | What using it needs |
|---|---|---|---|---|
| **Self-esteem** | Rosenberg Self-Esteem Scale (Rosenberg, 1965/1989) | 10, four-point agreement | Yes, very widely | The University of Maryland says it's public domain: no permission or notification needed. Cite the 1989 edition. |
| **Self-efficacy** | Self-Efficacy Questionnaire for Children, SEQ-C (Muris, 2001) | 24: academic, social, emotional, 8 each; five-point | Yes. Validated with 330 young adolescents. | No licence statement found. Ask Peter Muris (Maastricht University). |
| *(shorter alternative)* | General Self-Efficacy Scale (Schwarzer & Jerusalem, 1995) | 10, four-point | From age 12 | Free with attribution for research; check before any commercial or digital use. Less sensitive than SEQ-C, because it isn't domain-specific. |
| **Self-confidence** | None that is separate. Check the in-app confidence items against SEQ-C and Rosenberg instead. | — | — | — |
| **Self-concept clarity** | Self-Concept Clarity Scale (Campbell et al., 1996) | 12, five-point agreement | Yes. Crocetti and colleagues used it in a six-wave study of Dutch adolescents and their parents. | Published in an APA journal. Research use is common without a formal licence. For anything beyond a university study, ask the lead author and APA permissions. |
| **Mattering** | General Mattering Scale (Marcus, 1991) | 5 | Used across ages; adolescent evidence is thinner | Items are printed in later papers (e.g. Taylor & Turner, 2001); no licence statement found. Check with the partner. |
| *(adolescent alternative)* | Mattering to Others Questionnaire (Marshall, 2001, *Journal of Adolescence* 24) | Covers mattering to parents and to friends | Built for adolescents | Ask the author |
| **Wellbeing** (safety and secondary outcome) | Short Warwick-Edinburgh Mental Wellbeing Scale, SWEMWBS | 7 | Yes. Warwick says the short version is validated from age 11. | Free under a non-commercial licence for universities, schools and charities. A company needs a paid commercial licence, and Warwick says anyone building it into a system needs a full commercial licence first. |

**Things to know before choosing:**
- **Length.** Rosenberg, SEQ-C, Self-Concept Clarity, General Mattering and SWEMWBS come to about 58 items. Add Groundwork's own 12–17 to check them against, and it's 70–75 in all. That's fine in a consented school session, but too long for anything else. If it has to shrink, swap SEQ-C for the General Self-Efficacy Scale (−14 items).
- **Sensitivity to change.**
  - Self-concept clarity was very stable from year to year in the Dutch study, and global self-esteem is fairly stable too. Over ten weeks either may barely move.
  - Domain-specific efficacy is the most likely to change.
  - Don't size a future trial on any of them without pilot data.
- **Self-confidence has no validated scale.** The pilot's job for the confidence items is to show they hang together and relate to efficacy and esteem as expected, i.e. related but not identical. If they turn out indistinguishable from efficacy, report confidence as efficacy's everyday name.
- **Is Groundwork commercial?** If it's run by a company, it counts as commercial for licensing, even if it's free to students. A university running the pilot under its own licences avoids that, but only if the university administers the scales, not the app.
- **Earlier choices, kept for reference.** The plan previously used the U-MICS (identity commitment and exploration) and the Claremont Purpose Scale. They fit the old direction and purpose items. Use them only if those outcomes come back.

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
- **Early signal (exploratory):** before and after, using
  - Rosenberg Self-Esteem Scale;
  - SEQ-C;
  - Self-Concept Clarity Scale;
  - General Mattering Scale (or Marshall's adolescent measure).
- **Groundwork's own check-in items:** collected in the same sitting as the validated scales, to check how well they match: each in-app area against its scale, and the confidence items against SEQ-C and Rosenberg. That would be the first real data on whether the in-app check-in measures what it claims to.

**Progression criteria:** agree before the pilot what would justify a full trial. For example: a minimum share completing follow-up, a minimum level of use, and no safety concerns. Set the thresholds with the research partner.

**Timing:** ten weeks of use, matching the program and the 70-day follow-up. Approvals usually take longer than the pilot, so allow at least a school term for HREC and education department review.

---

## 5. Permission requests to send

These are short drafts, adapted to whoever sends them. Ideally that's the research partner, since academic-to-academic requests tend to get faster answers. Check the contact details before sending.

**To the SEQ-C author (Peter Muris, Maastricht University):**
> We're planning a small university-led pilot of Groundwork, a self-guided identity-development app for Australian students aged 13 to 18, and would like to use the SEQ-C as an outcome measure, administered in the university's survey platform rather than inside the app. Could you confirm permission for this use, and whether there's a version you'd recommend for students up to 18?

**About mattering:** the research partner should confirm the terms for the General Mattering Scale, or contact Sheila Marshall (University of British Columbia) about the Mattering to Others Questionnaire if the adolescent measure is preferred.

**Rosenberg Self-Esteem Scale:** no request needed; it's public domain. Cite it.

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
6. **The v2 check-in** (`checkin-v2-draft.md`):
   - a new `ITEM_SET` id;
   - per-area response labels (self-efficacy uses "how sure");
   - life-stage wording variants.

   A student's end check-in must use the same set as their start, so a v1 start is never compared with a v2 end. The check-in already stores which set each answer was given under.

---

## Sources

- Self-Concept Clarity Scale: Campbell et al. (1996), *Journal of Personality and Social Psychology*, 70(1), 141–156. For use with adolescents, see Crocetti and colleagues' six-wave study of self-concept clarity in adolescents and parents ([Tilburg University record](https://research.tilburguniversity.edu/en/publications/self-concept-clarity-in-adolescents-and-parents-a-six-wave-longit/)).
- U-MICS: Crocetti, Rubini & Meeus (2008), and the validation in Spanish university students ([PMC6085597](https://pmc.ncbi.nlm.nih.gov/articles/PMC6085597/)), which describes the 13 items, three dimensions and two domains.
- Claremont Purpose Scale: Bronk, Riches & Mangan (2018), *Research in Human Development*, 15(2), 101–117. Item list: [cic.edu](https://cic.edu/claremont-purpose-scale). Access listing: [EdInstruments](https://edinstruments.org/node/677).
- WEMWBS and SWEMWBS licensing: [Warwick Innovations FAQ](https://warwick.ac.uk/services/innovations/wemwbs/faq/) and [non-commercial licence registration](https://warwick.ac.uk/fac/sci/med/research/platform/wemwbs/using-old/non-commercial-licence-registration). Adolescent validation: Clarke et al. (2011), *BMC Public Health* ([PMC3141456](https://pmc.ncbi.nlm.nih.gov/articles/PMC3141456)).
- National Statement on Ethical Conduct in Human Research (2023), Chapter 4.2 ([PDF copy](https://www.swslhd.health.nsw.gov.au/Ethics/content/pdf/National-Statement-Ethical-Conduct-Human-Research-2023.pdf)).
- NSW SERAP: [Research in our schools](https://education.nsw.gov.au/about-us/education-data-and-research/research-with-us/researching-in-our-schools).
- Rosenberg Self-Esteem Scale: public-domain statement and citation guidance from the University of Maryland ([using the scale](https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale)).
- SEQ-C: Muris (2001), *Journal of Psychopathology and Behavioral Assessment*, 23, 145–149 ([EdInstruments listing](https://edinstruments.org/node/626)).
- General Self-Efficacy Scale: Schwarzer & Jerusalem (1995) ([YouthREX copy](https://youthrex.com/wp-content/uploads/2019/10/General-Self-Efficacy-Scale.pdf)).
- Mattering: Rosenberg & McCullough (1981); General Mattering Scale (Marcus, 1991) ([review of mattering measures](https://journals.copmadrid.org/clysa/archivos/1130-5274-clinsa-35-2-0057.pdf), [GMS-6 extension](https://journals.sagepub.com/doi/10.1177/07342829241255232)); Marshall (2001), *Journal of Adolescence*, 24, 473–490.
