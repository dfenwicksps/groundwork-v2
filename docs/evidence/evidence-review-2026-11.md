# Groundwork evidence review: identity, then confidence, efficacy and esteem

**Date:** 1 November 2026
**Question:** Is Groundwork evidence-based, and does its identity work plausibly raise young people's self-confidence, self-efficacy and self-esteem?
**Scope:** All student-facing content (`src/lib/*`, mission, program, boost and selves copy, the AI reflection prompt, the check-in) and the docs (`frameworks.md`, `evidence-plan.md`, marketing).
**Method:** Each research claim shown to students was pulled from the code and checked against the primary research and its replication record. Ratings:
- **Supported:** matches the research.
- **Overstated:** a real finding stated more strongly than the evidence allows.
- **Contested:** replications or later work cast real doubt on it.
- **Unsupported:** no research found that says this.

---

## 1. Verdict

**The identity work is soundly grounded. The bridge from identity to confidence, efficacy and esteem is mostly implied, not built.** One of the seven "selves" definitions also gets self-efficacy wrong.

Five strengths:
- The strongest causal evidence for identity interventions is on the app's side. In the Identity Project RCT, exploring identity led to resolution, then to higher self-esteem a year later. Oyserman's School-to-Jobs trials showed specific possible selves that come with strategies change behaviour. Missions 3 and 4 and Next Chapter follow both closely.
- The app avoids the approaches the self-esteem research warns against. There is no global praise, no score and no streak. It also separates self-esteem from self-worth, and it detects a run of harsh self-verdicts. Inflated praise backfires for low-self-esteem children (Brummelman et al., 2014), and the AI prompt correctly gives questions, not praise.
- Prosocial work (The Standard, week 3) has longitudinal support. Helping strangers predicted higher adolescent self-esteem a year later (Fu, Padilla-Walker & Brown, 2017).
- Three of Bandura's four sources of self-efficacy are present:
  - **mastery:** week 5, the self-efficacy boost, the Mission 1 experiment and the practice log;
  - **vicarious experience:** week 5 explicitly, Mission 2's "Who else cares" and the stories;
  - **social persuasion:** Ask-by-link and the support circle.
- The evidence plan is honest. It says the check-in isn't validated and that pre-post can't show effect.

Five gaps:
1. **Self-efficacy is defined incorrectly** (§3.1). This matters most, because it is the outcome you named.
2. **Nothing joins identity to competence.** Self-concept interventions work about twice as well when they target a specific domain and measure that domain: d = 1.16, against d = 0.51 overall (O'Mara et al., 2006). Harter's model says global self-worth follows competence in the domains a person values. Groundwork asks what students value (Mission 1) and has them do hard things (week 5). It never links the two: "the domains that matter to me, and where I'm building competence in them."
3. **No physiological or affective source of efficacy.** Nothing helps a student read nerves as readiness rather than as evidence they can't do it.
4. **Mastery isn't consistently made visible.** Only the self-efficacy boost asks the student to compare where they started with where they ended. Weeks 4 and 5 track whether sessions happened, not what improved.
5. **Nothing measures the three outcomes.** The check-in measures clarity, direction and purpose. None of self-esteem, self-efficacy or confidence is measured in the app or in the pilot plan (§5).

---

## 2. Claim-by-claim ratings

### Supported (no change needed)

| Where | Claim | Notes |
|---|---|---|
| `missions.ts` ~1374 | Exploring cultural background goes with self-esteem and coping (Umaña-Taylor) | RCT evidence: exploration, then resolution, then self-esteem at 1 year (Umaña-Taylor et al., 2018) |
| `missions.ts` ~1568, `nextChapter.ts` | Possible selves help when specific and paired with a plan (Oyserman) | Strong RCT evidence (Oyserman, Bybee & Terry, 2006) |
| `missions.ts` ~1449, `stageContent.ts` | Autobiographical reasoning develops in adolescence; Erikson's sorting of identifications | Habermas & Bluck (2000) |
| `missions.ts` ~1508 | Context collapse (Marwick & boyd) | Accurate |
| `missions.ts` ~1694 | Future-self connection leads to future-minded choices (Hershfield) | Supported; future-self letters have early support (e.g. Chishima & Wilson, 2021) |
| `missions.ts` ~1771 | Prolepsis | Accurate use of Cole's term |
| `missions.ts` ~1348 | Knowing family stories goes with self-esteem and sense of control (Duke & Fivush) | Correlational and small samples; "tend to" is the right hedge |
| `missions.ts` ~1207 | Bridging relationships; contact reduces prejudice | Putnam; Pettigrew & Tropp (2006) meta-analysis |
| `missions.ts` ~500 | Hiding big parts of yourself goes with stress and a shakier self | Authenticity research; Harter's adolescent "false self" work is the most relevant source and could be cited |
| `missions.ts` ~741, ~1004 | Damon's engaged versus purposeful; Benson's "sparks"; purposeful youth had adults who talked about purpose | Accurate |
| `missions.ts` ~1629 | Story coherence goes with meaning (McAdams) | Reasonably supported |
| `hardOnSelf.ts` | Ruminative exploration predicts distress (Luyckx) | Luyckx et al. (2008) |
| `boosts.ts` ~57, `selves.ts` ~90 | Efficacy is built mostly by mastery | Usher & Pajares (2008): mastery is usually the strongest source |
| `boosts.ts` ~33 | Courage grows by reps | Consistent with graded-exposure evidence |
| `program.ts` week 5 | Watching someone you recognise do a hard thing helps you believe you could | Bandura's vicarious experience; accurate |

### Needs correcting

| # | Where | Current claim | Rating | Evidence | Suggested change |
|---|---|---|---|---|---|
| 1 | `selves.ts` self-efficacy and self-confidence | Efficacy is "effort in produces results out"; confidence is "believing you can do this specific thing"; "you can lack confidence and still have high efficacy" | **Incorrect** | Bandura (1977, 1997): self-efficacy *is* the task-specific belief "I can do this". "Effort leads to results" is an *outcome expectation*, a separate idea. Bandura called "self-confidence" a catchword, not a construct. The app has the two definitions swapped. | See §3.1 |
| 2 | `selves.ts` self-control; `program.ts` week 7 (×2); `frameworks.md`; marketing | "Willpower is a tank that empties; identity doesn't" | **Contested** | Ego depletion failed a 23-lab registered replication (Hagger et al., 2016). A 36-lab test found at most a small, inconclusive effect (Vohs et al., 2021). | Drop the tank metaphor. Keep the identity framing on its own: "Rules you fight with tend to lose. A description of who you are gives you something to live up to." Present it as an approach, not a finding. |
| 3 | `missions.ts` ~927 | Commitment is "stronger again when you share it with someone" | **Contested** | Announcing *identity* intentions, and having others notice them, reduced follow-through across 4 experiments (Gollwitzer et al., 2009). Sharing *progress* with someone can still help. | "...strongest when the commitment is specific. If you tell someone, tell them what you'll *do*, and check back with them on it, rather than who you'll be." |
| 4 | `boosts.ts` kindness | "Research is blunt about this one: doing kind things reliably raises the mood..."; "anonymous ones count double" | **Overstated / unsupported** | Meta-analysis effect δ = 0.28, less than 1 point on a 0–10 scale; higher-quality studies show smaller effects (Curry et al., 2018). No evidence found for the "counts double" claim. | "Research finds doing kind things tends to lift the doer's mood a little, not only the receiver's." Cut "count double", or mark it as the app's suggestion. |
| 5 | `boosts.ts` self-belief | "People who believe in themselves are usually just people who keep track of their own wins" | **Unsupported** | No such finding. The wins log is a reasonable mastery-salience exercise. | "Belief in yourself tends to follow evidence, and most people forget their own. A wins log keeps it." |
| 6 | `missions.ts` ~436 | SDT finds people who act from their own values do better; "knowing your values... changes what you actually do" | **Overstated** | SDT is about autonomous motivation, i.e. acting from reasons you endorse. Values affirmation, the closer literature, has mixed large-scale replications (Hanselman et al., 2017: a precise null). | Keep the SDT sentence, reframed as autonomous motivation. Replace the last two sentences with something modest, e.g. "Knowing them gives you something to check choices against." |
| 7 | `missions.ts` ~802 | "Studies consistently find the most durable form [of purpose] is specific contribution... generic caring fades" | **Unsupported** as stated | Damon's definition includes a beyond-the-self, intended aim, but I found no study comparing how long specific and generic purpose last. | "Purpose researchers find purpose tends to be more lasting when it's something you actually do, not just something you feel." Or label it as the app's view. |
| 8 | `missions.ts` ~862 | "Purpose supported by community is significantly more durable... often the critical factor" | **Overstated** | Purposeful youth commonly have supportive mentors, but the evidence is correlational. | "Young people with strong purpose usually have people around them who share or model it." |
| 9 | `missions.ts` ~1270 | McAdams' "research shows that people who can clearly identify who has shaped them... more coherent, resilient identity" | **Overstated (misattributed)** | McAdams' empirical work is on narrative themes (redemption, agency, communion), not on naming who shaped you. | "Narrative identity research (McAdams and others) treats the people who shaped you as some of the main characters in your story; understanding how they did is part of authoring it." |
| 10 | `missions.ts` ~1147 | Brené Brown's fitting in versus belonging; Walton & Cohen's "small signals... can change how people get on for years" | **Partly overstated** | Brown's work is qualitative interviews and should be labelled that way. Walton & Cohen (2011) measured GPA and health in a 92-student trial. A 26,911-student replication (Walton et al., 2023) worked only where students' groups had real opportunities to belong. | "In her interviews, Brené Brown..." (already close). Replace the Walton sentence: "Experiments by Greg Walton and colleagues find that helping people see that feeling out of place is common and usually passes can improve how they get on, where the setting gives them a real chance to belong." |
| 11 | `missions.ts` ~411 | "Research shows that knowing and using your signature strengths predicts higher wellbeing, engagement and resilience" | **Overstated for this age** | Signature-strength interventions: g ≈ 0.3–0.4 across ages (Schutte & Malouff, 2019). Adolescent replications are thinner and mixed (no effect on depression). | "...studies, mostly with adults, find that using your top strengths in new ways tends to lift wellbeing a little." |
| 12 | `missions.ts` ~565 | Expressive writing "linked with less self-criticism and more clarity" | **Overstated** | Youth expressive-writing meta-analysis: g = 0.13, "small yet significant" (Travagin et al., 2015). The letter is also not Pennebaker's trauma-writing paradigm. | "Studies of writing about yourself find small benefits..."; keep the hedged distanced self-talk sentence (Kross). |
| 13 | `selves.ts` self-control | "narrower when you're tired, hungry or humiliated" | **Weak** | Hunger effects come from the discredited glucose model and the judges study. Tiredness and stress are better supported. | "tired, stressed or embarrassed" |
| 14 | `selves.ts` self-image | "most affected by what you scroll past" | **Overstated** | Social-media effects on adolescent self-image are real for some (e.g. appearance comparison) but small on average and contested. | "and it can be pulled around by what you scroll past" |
| 15 | `selves.ts` self-efficacy example | "I'm bad at this because I haven't done the reps yet" | **OK, with a note** | This is a growth-mindset framing. Mindset interventions show small, targeted effects (Yeager et al., 2019). Fine as an example; just don't present it as the definition. | Fold into the §3.1 rewrite |
| 16 | `selves.ts` builtBy | Self-efficacy is "built by" week 4 (trust) | **Mismatch** | Week 5 (hard things, repeated sessions) is the mastery week. Week 4 is about keeping promises. | Point self-efficacy to week 5 and self-confidence to the Mission 1 experiment or the boost. Or make both point to week 5 once §4 #2 exists. |
| 17 | Marketing (`build-docx.js`, `marketing-guide.html`) | Weeks 4 and 5 are implementation intentions, d = .65 | **Overstated** | Implementation intentions are *if-then* plans ("If it's 4pm, then I…"). Weeks 4 and 5 ask for a goal and what a session looks like, with no if-then. | Either add the if-then prompt (§4 #4, recommended, because it makes the claim true), or soften the marketing copy. |
| 18 | Marketing, `frameworks.md` | Week 7: "willpower depletes and self-concept doesn't" | **Contested** | As #2 | As #2 |

### Documentation drift (`frameworks.md`)

- It references `src/lib/processingStyle.ts`, `src/lib/learningMode.ts` and `src/components/TrackBanner.tsx`, which **don't exist**. Berzonsky-style detection and adaptive "why" panels aren't in the code any more. Remove them or mark them as retired. As written, the doc claims an adaptivity feature the app doesn't have.
- §3's "Starter vs. Advanced modes" is superseded by Quick, Extended and Open (§2c).
- **Marcia.** Identity statuses are not a linear developmental sequence. Current models (Crocetti's three-factor model; Luyckx's five dimensions) describe repeated cycles of exploration, commitment and reconsideration. Labelling Missions 2 and 3 "Commitment" for 13-year-olds conflicts with `stageContentMission2.ts`, which correctly says Years 7–9 explore. Say the missions *lean* from exploration toward commitment and that students cycle back, which the revisit chain already supports.
- Add a section on how the app aims at confidence, efficacy and esteem (§3.2). It's currently undocumented.

---

## 3. The identity-to-outcomes bridge

### 3.1 Fixing the seven selves

The selves page is where students learn the vocabulary, so it has to match the research. Suggested wording:

- **Self-efficacy.** *Short:* "Believing you can do the specific thing in front of you." *What:* "Self-efficacy is your belief that you can do a particular thing, like give this talk, pass this test or have this conversation. It's specific: you can have plenty for football and very little for speaking up in class. It's built mostly one way: small, real wins at things that used to be hard. Watching someone like you do it helps, and so does someone you trust telling you you can." *notThis:* "Not self-esteem. Self-efficacy is 'I can do this one'. Self-esteem is 'I'm alright' overall. And not the same as believing effort pays off; you need both."
- **Self-confidence.** Treat it as the everyday word. "Confidence is the everyday word for feeling sure of yourself. Psychologists mostly study it as self-efficacy: confidence about something specific. A general feeling of confidence is usually built from lots of specific ones." *notThis:* "Not something you wait for. The doing is what produces it."
- Move "what I do makes a difference" into the efficacy text as the related idea (outcome expectations or agency), and add it to `CONFUSED_PAIRS` as: "I can do it" versus "doing it will make a difference".

### 3.2 What the bridge should be

The research supports three routes from identity to these outcomes. Groundwork has parts of each.

| Route | Evidence | In Groundwork | Missing |
|---|---|---|---|
| Exploring identity, then resolving it, raises **self-esteem** | Identity Project RCT; self-concept clarity correlates strongly with self-esteem (Campbell, 1990) | Missions 1–4, revisits | Little. This is the app's core. |
| Building competence in **valued domains** raises **self-esteem** (Harter); domain-targeted work works best (O'Mara et al., 2006) | Strong meta-analytic support | Values (M1), strengths (M1), hard things (wk 5) | The link between them (§4 #1) |
| The four sources of **self-efficacy** (Bandura) | Strong | Mastery, vicarious, social persuasion | Affective states (§4 #3); visible mastery comparison (§4 #2) |
| Agency in your own story precedes mental-health gains (Adler, 2012) | Longitudinal, n = 47 adults; suggestive, not causal | My Story, Through-Line | An agency prompt (§4 #5) |
| Self-compassion as a floor for self-worth | Neff; intervention meta-analyses show moderate effects | Compassion boost, hard-on-self card, selves | Fine as is |
| Contribution raises self-esteem (Fu et al., 2017) | Longitudinal, n = 681 | The Standard, week 3 | Fine. Cite it in `frameworks.md`. |

**One risk to manage.** The Character Code and Becoming are identity *statements* shown on the profile. That is the setup in which Gollwitzer et al. (2009) found that being noticed gives a premature sense of already having the identity. Groundwork mostly avoids this, because the program asks for behaviour and the Code is written from evidence. Keep the Code paired with a behavioural check-in, e.g. the weekly five, rather than shown as a badge.

---

## 4. Recommended changes

**Status, 2 November 2026: A, B and C are approved and done** on the `evidence-review` branch. How each B addition was built:
1. **Domains that matter.** Week 5 shows the student's Mission 1 values and asks them to pick their hill in one. It reuses the week's existing "values" source, not a new Mission 1 step.
2. **Before and after on mastery.** Week 5's reflection opens with "Something I can do now that I couldn't on day one is…" and "What I did that made the difference was…".
3. **Nerves as readiness.** Added to week 5's challenge and the Courage boost.
4. **If-then plans.** Weeks 4 and 5 ask for an if-then plan ("If it's [when or where], then I'll…"), with a stem and a hint. It's prompted, not enforced, so a tapped Quick answer still works.
5. **Agency.** My Story's paragraph has a "One time I made something happen…" opening (Year 7–9: "Something I made happen was"), plus a hint.


**A. Content corrections.** Low effort, high value: the 18 claims in §2, the selves rewrite in §3.1 and the docs drift.

**B. Small design additions.** Each is a few prompts, not a new feature:
1. **Domains that matter.** Mission 1's values step (or week 1) asks: "Of these areas (school subjects, sport, friendships, making things, looking after people, ...), which two matter most to you?" Week 5 offers those as the source of the hill. This builds the Harter / O'Mara link.
2. **Before and after on mastery.** Week 5's end-of-week reflection and the practice log ask: "What can you do now that you couldn't on day one?", plus "What did *you* do that made the difference?" so the student credits their own action. This applies the boost's existing comparison to the main mastery week.
3. **Nerves as readiness.** A short line where students face a hard thing (week 5, the Courage boost, Next Chapter's conversation): "A racing heart before something hard is your body getting ready, not a sign you can't." Arousal-reappraisal research (Jamieson and colleagues) supports this modestly. Word it as a suggestion, not a finding.
4. **If-then plans in weeks 4 and 5.** Add "When and where will you do it? *If* [time or place], *then* I'll ___." This makes the implementation-intention claim true, and it is the best-evidenced single addition here (Gollwitzer & Sheeran, 2006).
5. **An agency prompt in My Story or the Through-Line:** "One time you made something happen, or changed how something was going."

**C. Measurement (for the pilot).** See §5.

---

## 5. Measuring the outcomes

**Superseded on 2 November 2026.** The first version of this section recommended adding validated scales. After discussion, the decision is:
- **five outcomes:** self-esteem, self-efficacy, self-confidence, self-concept clarity and mattering;
- **in the app:** measured in Groundwork's own words, inspired by the validated scales but not copying them, so the app never feels like a mental-health assessment (`checkin-v2-draft.md`);
- **outside the app:** the validated scales are run by the research partner, both to test effect and to check the in-app items (`evidence-plan.md` §2).

That section's earlier draft dropped self-confidence without saying so and put self-compassion in its place. Self-compassion is now a mechanism the app builds, not a measured outcome. Reasoning for the five is in `self-outcomes-map.md`.

---

## Sources

- Bandura (1977), *Self-efficacy: Toward a unifying theory of behavioral change*, Psychological Review 84(2) ([abstract](https://www.susana.org/en/knowledge-hub/resources-and-publications/library/details/4524)); Usher & Pajares (2008) on the relative strength of the sources ([summary](https://www.simplypsychology.org/self-efficacy.html))
- Hagger et al. (2016) registered replication ([APS](https://www.psychologicalscience.org/observer/replication-project-investigates-self-control-as-limited-resource-2)); Vohs et al. (2021) and commentary ([PMC8134656](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8134656/))
- Gollwitzer, Sheeran, Michalski & Seifert (2009), *When intentions go public*, Psychological Science 20(5) ([record](https://stafforini.com/works/gollwitzer-2009-when-intentions-go/), [Konstanz](https://www.socmot.uni-konstanz.de/node/131))
- Curry et al. (2018), *Happy to help?*, JESP 76 ([Bournemouth](https://eprints.bournemouth.ac.uk/30561/), [Oxford summary](https://ox.ac.uk/node/512470))
- Travagin, Margola & Revenson (2015), Clinical Psychology Review 36 ([OJP](https://www.ojp.gov/ncjrs/virtual-library/abstracts/how-effective-are-expressive-writing-interventions-adolescents-meta), [CrimeSolutions](https://crimesolutions.ojp.gov/ratedpractices/106))
- Umaña-Taylor et al. (2018), Identity Project, J. Youth & Adolescence and Child Development ([ASU](https://asu.elsevierpure.com/en/publications/a-universal-intervention-program-increases-ethnic-racial-identity), [SRCD](https://www.srcd.org/news/intervention-engages-youth-ethnic-and-racial-identity-can-enhance-positive-development))
- Brummelman et al. (2014), inflated praise ([OSU](https://artsandsciences.osu.edu/news/high-praise-could-backfire-kids-low-self-esteem))
- O'Mara, Marsh, Craven & Debus (2006), Educational Psychologist 41(3) ([UCL PDF](https://discovery-pp.ucl.ac.uk/id/eprint/1508112/1/O%27Mara%20et%20al.%202006.%20A%20comprehensive%20multilevel%20model%20meta-analysis%20of%20self-concept%20interventions.pdf), [WSU](https://researchers.westernsydney.edu.au/en/publications/do-self-concept-interventions-make-a-difference-a-synergistic-ble/))
- Walton & Cohen (2011) and Walton et al. (2023), Science ([Russell Sage](https://www.russellsage.org/node/4197), [ECR Hub](https://ecrhub.org/publications/where-and-whom-does-brief-social-belonging-intervention-promote-progress-college))
- Fu, Padilla-Walker & Brown (2017), J. Adolescence 57 ([BYU](https://news.byu.edu/news/study-teens-who-help-strangers-have-more-confidence))
- Adler (2012), JPSP ([PDF](https://cdn2.psychologytoday.com/assets/2023-10/Adler%20%282012%29%20JPSP.pdf))
- Hanselman et al. (2017), self-affirmation replications ([PMC5403146](https://pmc.ncbi.nlm.nih.gov/articles/PMC5403146), [WUSTL](https://profiles.wustl.edu/en/publications/new-evidence-on-self-affirmation-effects-and-theorized-sources-of/))
- Schutte & Malouff (2019), signature strengths meta-analysis ([Springer](https://link.springer.com/article/10.1007%2Fs10902-018-9990-2)); adolescent replication ([ProofPositive](https://proofpositive.org/bc-science/do-all-positive-psychology-exercises-work-for-everyone-replication-of-seligman-et-al-s-2005-interventions-among-adolescents/))
- Harter, Marold, Whitesell & Cobbs (1996), false self, Child Development 67 ([Harter, Guilford](https://www.guilford.com/author/Susan-Harter))
- Measures: [Rosenberg (UMD)](https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale); [SEQ-C (EdInstruments)](https://edinstruments.org/node/626); [GSE (YouthREX)](https://youthrex.com/wp-content/uploads/2019/10/General-Self-Efficacy-Scale.pdf); [SCS-Youth (self-compassion.org)](https://self-compassion.org/wp-content/uploads/2021/03/SCS-Youth-information.pdf)

*Not independently re-verified in this review; standard references: Campbell (1990) on clarity and self-esteem; Gollwitzer & Sheeran (2006) on implementation intentions; Pettigrew & Tropp (2006) on contact; Yeager et al. (2019) on mindset; Luyckx et al. (2008); Habermas & Bluck (2000); Oyserman, Bybee & Terry (2006). Harter SPPA licensing and SEQ-C permissions are unconfirmed.*
