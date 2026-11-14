# Does Groundwork hold up against identity development research?

**Date:** 14 November 2026
**Question (David):** Does the app's content, claims and activities hold up against Erikson, James Marcia and more recent identity development research?
**Scope:** v3 as it stands on the `v3` branch: the map (4 groups, 7 levels, 25 selves), the 28 steps and 10 weeks, the self-check, the revisit chain, the "why it matters" lines students see, the selves' wording and teacher notes in `docs/v3/source/who-am-i-becoming.html`, and `docs/frameworks.md`.
**Companion:** `evidence-review-2026-11.md` checked every research claim in v2's content on 1 November and its fixes were applied. This review doesn't repeat that. It asks one narrower question: is the *design* consistent with identity theory, and where does later research disagree with it?

---

## 1. Verdict

**It can't be proved, and the honest answer has two halves.**

**Half one: consistency with theory. Mostly yes.** Groundwork's core activities match what Erikson described and what the neo-Eriksonian research measures: exploring, committing, looking again, and joining the parts into a story. On several points the app is ahead of the popular version of the theory. It treats the levels as a map, not a ladder. It tells students "nothing has changed" is an acceptable answer. It moved Years 7 to 9 from committing to exploring. It names the difference between reflecting and going over it.

**Half two: evidence that it works. Not yet.** No study has tested Groundwork. The interventions that *have* been tested are different in kind: facilitated, in groups, mostly with 15 to 18-year-olds. Their pooled effects are small to moderate. Universal school wellbeing programs have also produced null and occasionally negative results in large trials, including one in Australian schools. So the theory supports building this; it does not show that this build helps.

**Seven places where the content or design is out of step with the research**, in order of how much they matter:

1. One line a student sees is wrong on the evidence: "Shutting options down too early (foreclosure) is the bigger risk" (Possible selves). The research points the other way (§4.1).
2. The app asks for a lot of reconsidering. Reconsideration and brooding-style exploration are the two identity processes most consistently linked to anxiety and depressive symptoms (§4.2).
3. Life-story work is given to 12 to 14-year-olds. The one finding specific to that age links it to *lower* wellbeing (§4.3).
4. The seven levels are a taxonomy of self-words, not a developmental model. Nothing in identity research orders them (§4.4).
5. "Exploration first, then commitment", attributed to Erikson and Marcia, is a simplification that later longitudinal work contradicts (§4.5).
6. Three selves rest on research that doesn't say what the app implies: self-authorship (an adult construct), the ought/ideal distinction (the predicted difference didn't hold up), and the feared-self "balance" (wrong attribution) (§4.6).
7. The work is private and individual. Erikson's identity is psychosocial, and the research finds parents and context carry much of the process (§4.7).

None of these is a reason to stop. Items 1, 5 and 6 are wording. Items 2, 3 and 7 are design risks that a pilot should measure.

---

## 2. Method and its limits

- I read the app's content in the repository, then checked each identity-theory claim against published reviews, meta-analyses and the primary studies' abstracts.
- **I mostly read abstracts and reviews, not full texts.** Where a figure comes from a secondary source, the table in §7 says so.
- Statements about what Erikson and Marcia wrote are from standard accounts of their work, not from re-reading the books. I've kept those to the uncontroversial core.
- I did not re-check the non-identity claims (strengths, self-determination theory, implementation intentions). The 1 November review covers them.
- Ratings: **Holds** (matches the research), **Simplified** (a fair teen summary that drops something that matters), **Out of step** (the research says otherwise), **Untested** (no research either way).

---

## 3. The theory, and what has changed since

**Erikson (1950, 1968).** Adolescence is the stage of identity versus role confusion. Young people sort through what they absorbed as children, try on roles in a period society allows for it (the psychosocial moratorium), and arrive at commitments in work, belief and relationships. Three points matter for Groundwork and are often lost in summaries:
- Identity is **psychosocial**. It is settled between a person and the people who recognise them, not inside one head.
- It rests on the stage before it, industry versus inferiority: a child's sense of **competence**.
- It is never finished. Erikson described it as lifelong.

**Marcia (1966).** Marcia made this measurable with two questions: has the person explored, and have they committed? That gives four statuses: diffusion (neither), foreclosure (committed without exploring), moratorium (exploring, not committed) and achievement (both). Marcia did not say people pass through them in order, though the model is usually taught that way.

**What later research added or changed:**

| Finding | Source | What it means for Groundwork |
|---|---|---|
| Identity changes slowly. In a meta-analysis of 72 data sets, 49% of people stayed in the same status, 36% moved forward and 15% moved back. Large shares had not reached achievement by young adulthood. | Kroger, Martinussen & Marcia (2010) | Don't expect or imply visible change in a term. |
| In a five-wave Dutch study of 12 to 20-year-olds, 63% stayed in the same status throughout. The high-commitment statuses grew; diffusion and moratorium shrank. | Meeus et al. (2010) | Many early adolescents already hold commitments. That is normal, not a fault. |
| Identity works in cycles, not a line: commit, explore the commitment in depth, reconsider, commit again. | Crocetti, Rubini & Meeus (2008); Luyckx et al. (2008) | The revisit chain is the right shape. |
| There is a harmful kind of exploration. Ruminative exploration goes with distress; the reflective kinds were unrelated to wellbeing. | Luyckx et al. (2008) | Exploration is not good in itself. |
| Within the same young person, a rise in identity uncertainty came before a rise in depressive symptoms a year later, not the other way round. Low self-concept clarity came before anxiety and depressive symptoms. | Becht et al. (2019) and Schwartz et al. (2012), both as reported in Branje et al. (2021) | Stirring up uncertainty has a cost. |
| Identity is also a story. Coherence in a life story builds gradually from about 8 to 20, with the causal and thematic kinds arriving from mid-adolescence. | Habermas & Bluck (2000); Habermas & de Silveira (2008); McAdams & McLean (2013) | Life-story work suits older students better. |
| Parents matter more than peers for identity, and it runs both ways. Identity is worked out domain by domain, with school and friendships the live ones in adolescence. | Branje et al. (2021) | The conversation steps are well aimed. School identity is thin in the app. |
| The status model reflects Western ideas of separating from family and choosing for yourself. Fit varies by culture. | Côté & Levine (1988); van Hoof (1999); later cross-national work | "Truly my own" is not everyone's ideal. |

---

## 4. Where Groundwork is out of step

### 4.1 "Foreclosure is the bigger risk" (Out of step)

**What the app says.** Possible selves, "what it isn't": "Not having to decide now. Year 9 is meant to be the exploring phase. Shutting options down too early (foreclosure) is the bigger risk." (`src/lib/v3/generated/selves.json`, from the master file.)

**What the research says.**
- Foreclosed and achieved young people are close to indistinguishable on self-esteem and internalising symptoms (Waterman, 1999, as summarised in Schwartz et al., 2011). The costs found for foreclosure are rigidity and closed-mindedness, not distress.
- High-commitment statuses, foreclosure included, go with better wellbeing than moratorium and diffusion (Kroger & Marcia, 2011, as cited in later work).
- The processes tied to anxiety and depressive symptoms are reconsideration, uncertainty and ruminative exploration (§3).
- Most early adolescents who hold commitments keep them (Meeus et al., 2010).

**So:** for a 14-year-old, the evidence does not make early commitment "the bigger risk". Prolonged uncertainty is the one with the mental-health signal. "Year 9 is meant to be the exploring phase" is also stronger than the data: exploring is common and fine at 14, and so is already knowing.

**Suggested wording, for David to approve:** "Not having to decide now. Plenty of people your age are still looking, and plenty already have a fair idea. Both are normal. Keeping a couple of options open costs you little."

### 4.2 The app asks for a lot of reconsidering (Untested, with a known risk)

**What the app does.** Revisits ask "has this changed?". The self-authorship self asks "Did you choose it, or did you absorb it?". The ought self asks students to cross out "should". The Mask Check asks where they hide themselves. The Standard's counterweight asks "who feels less safe around me?".

**What the research says.** Reconsideration of commitment is the identity process most consistently linked to anxiety, depressive symptoms and worse relationships with parents. Uncertainty comes before symptoms, not after (§3). Self-reflection in general has close to zero net link with depression, because people who reflect also tend to ruminate (Trapnell & Campbell, 1999, in adults).

**What the app already does about it.** A good deal:
- revisits are at least 14 days apart, and "nothing has changed" is named as a fine answer;
- the self-reflection self teaches the difference between reflecting and going over it;
- the hard-on-yourself card watches for a run of harsh verdicts;
- most reflective steps end in something to do.

**So:** the design is aware of the risk and the mitigations are sensible. Whether they are enough is not known. This is the first thing a pilot should measure, with a symptom measure and not only the outcomes the app hopes to raise (§6).

### 4.3 Life-story work in Years 7 to 9 (Out of step for the youngest)

**What the app does.** Your Story So Far, Where I've Come From, The Through-Line and My Story ask students to link past events to who they are now. The "why it matters" line for Where I've Come From calls this "one of the main ways a steady sense of self gets built during the teens and early twenties".

**What the research says.** That line is right for older teenagers. For the youngest it is not: early adolescents who did this kind of reasoning reported lower wellbeing than peers who didn't (McLean, Breen & Fournier, 2010; McLean & Mansfield, 2011, as reported in Branje et al., 2021). The usual reading is that the skill is new at that age and hard events get linked to the self before a young person can make something good of them. The original study was of boys only.

**What the app already does.** v2 softened The Through-Line for Years 7 to 9, and Your Story So Far asks only for chapter titles, which is light.

**So:** keep the light versions for Years 7 to 9, keep hard events optional, and prefer the conversation steps at that age. Hearing an adult tell the story is closer to how the research says the skill is built.

### 4.4 The seven levels are not a developmental model (Untested)

**What the app does.** 25 selves in seven levels: Know, Value, Manage, Believe in, Direct, Imagine, Authentic.

**What the research says.** Nothing. I found no model in identity research that sorts self-constructs into these seven or orders them. Most of the 25 are not identity processes in Erikson's or Marcia's sense. Self-esteem, self-efficacy and self-regulation are things identity work is hoped to improve, or things that feed it. Identity research's own moving parts are exploration, commitment, reconsideration and narrative, and those live in the app's *activities*, not in its map.

**Where the map does agree with theory:**
- Know myself first: self-concept clarity is the nearest measurable thing to "knowing who I am", and low clarity comes before symptoms.
- Believe in myself as part of identity: Erikson put competence underneath identity.
- Imagine myself: possible selves are well supported when they are specific and come with a plan (Oyserman, Bybee & Terry, 2006).

**Where it could mislead:**
- Seven numbered levels ending in "Authentic self" read as a climb with a summit. Decision D3 (a map, not a ladder) and D52 (names, not numbers) already guard against that in the app. The poster and master file still number them.
- "Authentic self" as the last level suggests an end state. Identity has none.

**So:** the levels are a reasonable teaching vocabulary. They should be described as that, and not as stages of identity development, in anything a school or parent reads.

### 4.5 "Exploration first, then commitment" (Simplified)

**Where.** Teacher note on Possible selves ("Erikson and Marcia: exploration first, then commitment"); the Year 7 to 9 purpose step ("exploring comes before committing, and that's healthy"); `frameworks.md` §3 ("missions follow the Erikson/Marcia arc").

**What the research says.** Marcia's statuses are combinations, not a sequence. The longitudinal work finds most young people *start* adolescence with commitments taken from home, then explore those in depth, and sometimes reconsider (Meeus et al., 2010; Crocetti et al., 2008). Commitment often comes first.

**So:** the decision to let Years 7 to 9 explore instead of commit is still sound, for a different reason: a commitment picked from a list at 12 is weak, and nothing is lost by not forcing one. The stated reason should change. Suggested: "People work out who they are by trying things, settling on some, and looking again later. There's no set order."

### 4.6 Three selves that lean on the wrong research

| Self | What's implied | What the research says | Rating |
|---|---|---|---|
| **Self-authorship** | A Year 9 student can author their own beliefs (Baxter Magolda, 2001) | Baxter Magolda's work followed adults from 18 into their thirties; many reached self-authorship in their late twenties or later. Already noted in D51. The activity itself, checking a belief you absorbed, is ordinary identity exploration and is fine. | Simplified. Keep the activity; don't cite it as an adolescent finding. |
| **Ought self and ideal self** | Two different gaps (Higgins, 1987) | A meta-analysis of 70 studies found the theory's specific pairings did not hold: the ideal gap related to both depression and anxiety at least as strongly as the ought gap (Mason et al., 2019). Both gaps go with worse mood. | Simplified. The vocabulary is usable. Making a gap vivid has a cost, which "the gap should pull, not crush" already says. |
| **Feared self** | "Markus and Nurius: feared selves motivate most when balanced with a hoped-for self" | The balance finding is Oyserman & Markus (1990), in 13 to 16-year-olds and about delinquency. A 2016 study did not find the link in younger samples. | Wrong attribution. Change the note to Oyserman & Markus (1990). |

### 4.7 Identity is settled with other people (Simplified by design)

**What the app does.** Almost everything is written alone and kept private. Teachers never see it.

**What the research says.** Erikson's identity needs recognition from others. Parental support and trust go with firmer identity; low support predicts reconsideration; friends matter less than parents (Branje et al., 2021). The tested interventions are all facilitated and done in groups.

**What the app already does.** Four conversation steps with an adult, the support circle, Ask-by-link, and stories. Lesson mode is planned and not built.

**So:** privacy is the right call for safety and trust, and it has a price. The conversation steps are the part of the app closest to the evidence. They deserve more weight than their place in the list suggests, and lesson mode matters more than it looks.

### 4.8 Smaller gaps

- **School and work identity.** Research treats educational identity as the most active domain in adolescence. The app's "Parts of you" covers beliefs, relationships, gender and sexuality. "Who am I as a learner" has no step, and careers isn't built in v3.
- **Culture.** "Making choices that are truly my own" and "not borrowing someone else's" are an individualist ideal. For many families, and in Aboriginal and Torres Strait Islander accounts of identity as inseparable from family and community (Brown, Azzopardi & Stanley, 2023), the self is not built by separating. The ought-self teacher note ("Be careful not to set students against parents") is the right instinct. The culture step is still marked as drafted without community input.
- **The self-check retake.** Ten weeks is short against research showing most young people don't change status in five years. A retake will usually give a similar result. The result screen should say that is expected.

---

## 5. Where Groundwork holds up

| Design choice | Why it holds | Source |
|---|---|---|
| A map, not a ladder; no locks, no "level up" | Statuses aren't a sequence, and most change is slow | Kroger et al. (2010); Meeus et al. (2010) |
| The revisit chain | Matches the commit, explore in depth, reconsider cycle | Crocetti et al. (2008) |
| "Nothing has changed" is accepted | Stability is the commonest finding | Meeus et al. (2010) |
| Reflection is taught as different from going over it | Ruminative exploration is the harmful kind | Luyckx et al. (2008) |
| Possible selves that are specific and come with a step | The best trial evidence in the field: grades and attendance up, depression down, held for two years | Oyserman, Bybee & Terry (2006) |
| Exploring cultural background | Exploration led to resolution, then to higher self-esteem and lower depressive symptoms a year on | Umaña-Taylor et al. (2018) |
| Conversations with adults about their story and purpose | Parents and other adults carry much of identity development | Branje et al. (2021) |
| Believe in myself built from doing, not praise | Erikson's competence stage; Bandura | Covered in the 1 November review |
| No scores, labels or rankings in the self-check | Low self-concept clarity is a risk; a label could set a verdict | Schwartz et al. (2012) |
| Years 7 to 9 are not asked to commit | A forced commitment is weak; nothing is lost by waiting | Sound, though for a different reason than stated (§4.5) |
| "Parts of you": different areas at different speeds, unsure is normal | Identity is domain by domain, and rarely in step | Branje et al. (2021) |
| Students aren't lectured; they choose the amount of help | Programs that respect teenagers' status do better than ones that instruct them | Yeager, Dahl & Dweck (2018) |

---

## 6. Does it work? What the trial evidence allows

- **Identity interventions can move identity.** A 2025 meta-analysis found small to moderate effects on personal and social identity (Crocetti et al., 2025). I could not open the full text, so I have not verified its figures or how many studies it pooled.
- **The tested programs are not like Groundwork.** The Identity Project is eight facilitated sessions in class with 15 to 16-year-olds. School-to-Jobs is eleven weeks of group sessions in Year 8. None is a private, self-paced app. None covers 25 constructs.
- **Not everyone benefits.** In a Swedish trial of the Identity Project (509 students), students low in extraversion and openness gained little or nothing in exploration.
- **Universal school programs can fail or backfire.**
  - MYRIAD (UK, more than 8,000 students): school mindfulness was no better than usual teaching.
  - Climate Schools (Australia, 37 schools): higher internalising scores than controls at 6 and 12 months.
  - WISE Teens (Australia, 1,071 students, not randomised): more anxiety and depression straight after, and poorer relationships with parents at follow-up.
  - Foulkes & Stringaris (2023) argue that school programs should measure harm as a matter of course.
- **Self-guided digital work can help when it is narrow.** Online single-session programs reduced depressive symptoms in a trial of 2,452 teenagers who already had symptoms (Schleider et al., 2021). That is a targeted, single-purpose tool, not a broad one.

**So Groundwork may not claim it improves identity, wellbeing or mental health.** It may say it is built on identity research. The evidence plan (`evidence-plan.md`) already says a before-and-after check can't show an effect. Add to it: a comparison group, a measure of anxiety and low mood so harm would show, and results split by year level.

---

## 7. Claim by claim

| # | Where | Claim | Rating | Note |
|---|---|---|---|---|
| 1 | Selves: possible selves | Foreclosure is the bigger risk; Year 9 is "meant to be" exploring | Out of step | §4.1 |
| 2 | Teacher note; `stageContentMission2.ts`; `frameworks.md` §3 | Exploration comes before commitment (Erikson, Marcia) | Simplified | §4.5 |
| 3 | Step: Where I've Come From | Erikson: sorting through what you absorbed as a kid | Holds | Standard account of Erikson |
| 4 | Step: Where I've Come From | Autobiographical reasoning is a main way a steady self is built in the teens | Holds for mid and late teens; out of step for 12 to 14 | §4.3 |
| 5 | Step: Your Story So Far | Identity as a life story | Holds | McAdams & McLean (2013) |
| 6 | Step: The Through-Line | A story that hangs together goes with more meaning | Holds | Coherence goes with fewer difficulties (Branje et al., 2021). Correlational. |
| 7 | Step: Parts of You | Areas explored at different speeds; unsure is normal | Holds | "Research links to a clearer sense of self" is fair for reflective exploration, not for brooding |
| 8 | Step: Who I Was (conversation) | Life stories are built with other people | Holds | Narrative and parent findings |
| 9 | Step: Culture and background | Exploring it goes with self-esteem | Holds | Trial evidence; replications under way in Europe, outcomes not yet confirmed there |
| 10 | Step: Future Self | Possible selves work when specific and planned | Holds | Oyserman et al. (2006) |
| 11 | Selves: feared self note | Balance attributed to Markus & Nurius | Wrong attribution | Oyserman & Markus (1990); §4.6 |
| 12 | Selves: ought and ideal | Two distinct gaps | Simplified | Mason et al. (2019); §4.6 |
| 13 | Selves: self-authorship | Cited to Baxter Magolda | Simplified | Adult research; §4.6 |
| 14 | Selves: self-concept | "It isn't fixed. Year 9 maps get redrawn a lot." | Simplified | Change at this age is real but modest. "Can be redrawn" is closer. |
| 15 | Selves: self-reflection | Reflecting versus going over it | Holds | Trapnell & Campbell (1999); Luyckx et al. (2008) |
| 16 | Selves: authentic self | Lining up who you are, what you value and how you act | Holds as a definition | Don't present as the end of development (§4.4) |
| 17 | `frameworks.md` §1 | Missions lean from exploration to commitment to integration | Out of date | The map replaced the missions. The section needs rewriting for v3. |
| 18 | The map as a whole | Seven levels of the self | Untested | A teaching vocabulary, not a stage model (§4.4) |
| 19 | Revisits | Reading your own words back shows growth | Untested | Right shape; watch for prompting doubt (§4.2) |
| 20 | Self-check | A place to start, in words | Untested | Not a measure of identity. Needs the counsellor review and pilot already required (D58). |

---

## 8. Recommended changes

Nothing here has been applied. Wording is David's to approve.

**Wording (small):**
1. Replace the foreclosure line on Possible selves (§4.1).
2. Change "exploring comes before committing" in the Year 7 to 9 purpose step and the teacher note (§4.5).
3. Change the feared-self note's attribution to Oyserman & Markus (1990).
4. Soften "Year 9 maps get redrawn a lot" to "can be redrawn".
5. On the self-check result after a retake, say a similar result is normal.
6. Rewrite `frameworks.md` §1 and §3 for the map, and describe the levels as vocabulary, not stages.

**Design (for discussion):**
7. For Years 7 to 9, keep life-story steps light and optional, and put the conversation steps ahead of the solo writing ones (§4.3).
8. Add a step on school identity: who am I as a learner (§4.8).
9. Have the culture step reviewed by the communities it speaks to, as its own code comment already asks.
10. Give lesson mode and the conversation steps priority, because that is where the app is closest to the evidence (§4.7).

**Evidence:**
11. In the pilot, measure anxiety and low mood, use a comparison group, and report by year level (§6).
12. Until then, claim "built on identity research", not "improves".

---

## 9. What I could not verify

- The effect sizes and study count in Crocetti et al. (2025). Only "small to moderate" is confirmed, from a paper citing it.
- The often-quoted line that many people don't reach identity achievement until their mid-thirties. I saw it only second-hand and have not used it.
- Whether early adolescents were more often diffused or foreclosed in any one study. I have relied on the direction of change (commitment statuses grow, diffusion shrinks), which is confirmed.
- McLean, Breen & Fournier (2010) directly. The early-adolescent finding is quoted from Branje et al. (2021).
- Anything specific to Australian students' identity development. The longitudinal work is mostly Dutch, Belgian, Italian, Japanese and American.
- Erikson's and Marcia's original texts. I've relied on standard accounts.
- Baxter Magolda's and Kegan's figures on when self-authorship is reached. They come from summaries of their books.

---

## 10. Sources

Reviews and meta-analyses:
- Branje, de Moor, Spitzer & Becht (2021). Dynamics of identity development in adolescence: a decade in review. *Journal of Research on Adolescence*. https://pmc.ncbi.nlm.nih.gov/articles/PMC9298910/
- Kroger, Martinussen & Marcia (2010). Identity status change during adolescence and young adulthood: a meta-analysis. *Journal of Adolescence*. https://pubmed.ncbi.nlm.nih.gov/20004962/
- Crocetti, Pagano, De Lise, Maratia, Bobba, Meeus & Bacaro (2025). Promoting adolescents' personal and social identities: a meta-analysis of psychosocial interventions. *Identity*, 25(2). https://doi.org/10.1080/15283488.2024.2394888
- Mason et al. (2019). Self-discrepancy and psychopathology: a meta-analysis. *Psychological Bulletin*. https://scholars.duke.edu/publication/1365352
- Travagin, Margola & Revenson (2015). Expressive writing for adolescents: a meta-analysis. *Clinical Psychology Review*. https://www.pubmed.gov/25656314/

Identity processes:
- Meeus, van de Schoot, Keijsers, Schwartz & Branje (2010). On the progression and stability of adolescent identity formation. *Child Development*. https://research.tilburguniversity.edu/en/publications/on-the-progression-and-stability-of-adolescent-identity-formation/
- Crocetti, Rubini & Meeus (2008). Capturing the dynamics of identity formation in various ethnic groups. *Journal of Adolescence*. https://cris.unibo.it/handle/11585/60962
- Luyckx et al. (2008). Capturing ruminative exploration. *Journal of Research in Personality*. https://scinapse.io/papers/2073148230
- Becht et al. (2016). The quest for identity in adolescence. *Developmental Psychology*. https://research.tilburguniversity.edu/en/publications/the-quest-for-identity-in-adolescence-heterogeneity-in-daily-iden/
- Schwartz et al. (2012). Characterizing the self-system over time in adolescence. *Journal of Youth and Adolescence*. https://link.springer.com/doi/10.1007/s10964-012-9751-1
- Schwartz et al. (2011). Examining the light and dark sides of emerging adults' identity. https://www.ojp.gov/ncjrs/virtual-library/abstracts/examining-light-and-dark-sides-emerging-adults-identity-study
- Beyers & Seiffge-Krenke (2010). Does identity precede intimacy? *Journal of Adolescent Research*. https://lirias.kuleuven.be/retrieve/91121

Narrative identity:
- McAdams & McLean (2013). Narrative identity. *Current Directions in Psychological Science*. https://journals.sagepub.com/doi/10.1177/0963721413475622
- McLean, Breen & Fournier (2010). Constructing the self in early, middle, and late adolescent boys. *Journal of Research on Adolescence*. https://narrativestudies.lib.unb.ca/bibcite/reference/17838
- McLean & Mansfield (2011). To reason or not to reason. *New Directions for Child and Adolescent Development*. https://zendy.io/title/10.1002/cd.291
- Köber, Schmiedek & Habermas (2015). Life narrative coherence from age 8 to 70. https://www.fb03.uni-frankfurt.de/75851556/2015_K%C3%B6berSchmiedekHabermas_Cohort_sequential_study_of_life_narrative_coherence_preprint.pdf

Possible selves and related:
- Oyserman, Bybee & Terry (2006). Possible selves and academic outcomes. https://deepblue.lib.umich.edu/bitstream/2027.42/89942/1/oyserman__bybee___terry_2006.pdf
- Oyserman & Markus (1990). Possible selves and delinquency. https://dornsife.usc.edu/daphna-oyserman/wp-content/uploads/sites/232/2024/08/oyserman_markus_1990.pdf
- Baxter Magolda (2001). *Making Their Own Way*. Not opened; the ages are from summaries of her longitudinal study.

Interventions and harm:
- Umaña-Taylor et al. (2018). The Identity Project. https://umana-taylorlab.gse.harvard.edu/publication/universal-intervention-program-increases-ethnic-racial-identity-exploration-and
- Who benefits most? Personality and Identity Project outcomes (2025). https://pmc.ncbi.nlm.nih.gov/articles/PMC12331835/
- Foulkes & Stringaris (2023). Do no harm. *BJPsych Bulletin*. https://discovery.ucl.ac.uk/10183675/1/do-no-harm-can-school-mental-health-interventions-cause-iatrogenic-harm.pdf
- Andrews et al. (2023). Climate Schools trial. *Psychological Medicine*. https://www.cambridge.org/core/journals/psychological-medicine/article/abs/evaluating-the-effectiveness-of-a-universal-ehealth-schoolbased-prevention-programme-for-depression-and-anxiety-and-the-moderating-role-of-friendship-network-characteristics/745721E4F8E63892095BB0551F267F7F
- Harvey et al. (2023). WISE Teens. Summary: https://www.nationalelfservice.net/treatment/psychotherapy/dbt-children-schools/
- MYRIAD trial summary. https://nationalelfservice.net/treatment/mindfulness/mindfulness-in-schools-myriad-trial-findings-offer-limited-support-for-school-based-mindfulness-training
- Schleider et al. (2021). Online single-session interventions. *Nature Human Behaviour*. https://dx.doi.org/10.1038/s41562-021-01235-0
- Yeager, Dahl & Dweck (2018). Why interventions to influence adolescent behavior often fail but could succeed. https://escholarship.org/uc/item/9mm4q4fb

Culture:
- Brown, Azzopardi & Stanley (2023). Aragung buraay: culture, identity and positive futures for Australian children. *Medical Journal of Australia*. https://www.mja.com.au/journal/2023/219/10/aragung-buraay-culture-identity-and-positive-futures-australian-children
- Critiques of the status model (Côté & Levine, 1988; van Hoof, 1999), as summarised in https://pmc.ncbi.nlm.nih.gov/articles/PMC7870419
