# Multimedia in Groundwork: a review before building

**Date:** 3 November 2026
**Question:** Do the stories add value? And how should animation, pictures and sound be added so the app works better for students with diverse needs (reading difficulty and dyslexia, English as an additional language, attention and ADHD, vision and hearing)?
**Status:** review and recommendations only. Nothing is built yet.

---

## 1. Short answer

1. **The stories can add value, but the research says only under specific conditions,** and today's design meets only some of them.
   - The strongest relevant finding: a protagonist who copes and takes control can raise readers' own sense of control, which is self-efficacy, one of our five outcomes. It happens only when readers are absorbed in the story and identify with the character (Isberner et al., 2018).
   - Narratives in general have only small effects on attitudes and behaviour (r ≈ .17–.23; Braddock & Dillard, 2016).
   - Today, five of the eight stories are text only, all are optional extras, and we don't yet know how many students finish them.
   - **Recommendation:** check the usage data first. Then keep fewer, better stories, placed at the moment they're needed, each built to model one thing.
2. **Read-aloud is the best-evidenced addition and should come first.** Text-to-speech improves reading comprehension for students with reading difficulties (g = 0.35 across 22 studies; Wood et al., 2018). It also helps students learning English, and it's free using the phone's own voice.
3. **Animation helps when it shows something changing** (d ≈ 0.23–0.37; Höffler & Leutner, 2007; later meta-analyses), **not when it decorates.** That argues for polishing the films around emotion and turning points, and for only a few small animations in the app.
4. **Sound effects and decorative images can make learning worse.**
   - Irrelevant sounds and "seductive details" lower learning, by g ≈ −0.33 across 58 studies (Sundararajan & Adesope, 2020). The cost is larger for learners with less working memory, which includes many students with ADHD.
   - Sound effects should therefore be limited to sounds that carry meaning, kept out from under narration, captioned, and off by default. The same caution applies to photos and AI images.
5. **Every addition needs an equal alternative,** so no student is shut out:
   - captions or a transcript for anything spoken;
   - a description for anything visual that carries meaning;
   - stillness for anyone who has turned motion off.

---

## 2. What's there now

| | Today |
|---|---|
| Stories | 8 seeded stories, 2 per mission. 3 are animated films (*The Version of Me at School*, *The Friend Who Stayed*, *Different Enough*); 5 are text only. |
| Where they appear | The first real screen in onboarding (the *Version of Me* film), the landing page (same film), "Extras" on each mission page (optional, outside the mission), "A story for you" on Home, and the Stories tab. |
| Films | Drawn in code (SVG), 1 caption line per scene, pause/previous/next, a "Prefer to read it?" transcript, and motion turned off for anyone who has asked their phone to reduce motion. |
| Sound | None anywhere. |
| Pictures | None, apart from the film scenes and small icons. |
| Tracking | `story_reads` records when a story is finished (read_at) and when the student writes a reflection on it (actioned_at). The data to judge use already exists. |

---

## 3. Do the stories add value?

### What the research supports

- **Stories can raise self-efficacy through vicarious experience.** Watching someone like you cope with a hard thing is one of Bandura's four sources of self-efficacy.
  - Isberner et al. (2018) found that written and video stories whose protagonist showed high self-efficacy raised readers' own control beliefs, at least for a while.
  - The effect ran through transportation and identification: being absorbed in the story and seeing yourself in the character.
- **Similarity matters.** Identification is stronger when the character is like the reader, in age and situation (2019 PLoS ONE study on age similarity).
  - Peer models who *cope*, struggling and then managing, are usually more effective for self-efficacy than models who are simply good at it (Schunk & Hanson's peer-modelling work). *Not re-verified for this review.*
- **The effects are small on their own.** Narratives change attitudes, beliefs, intentions and behaviour by small amounts (r ≈ .17–.23; Braddock & Dillard, 2016). A story does most when it leads into something the student then does, which is how the stories are paired with reflection prompts and mission steps.

### Where today's stories fall short of that

1. **They're optional extras, mostly outside the flow.** Research favours a story at the moment it's needed, for example just before the step it models, rather than in a side list.
2. **Most are text only.** Students who find reading hard, or are learning English, are the least likely to become absorbed in them.
3. **Not all of them model coping.** Some resolve neatly. A model who struggles, then manages, is the one that builds "I could do that too".
4. **Nobody knows yet whether students finish them.** `story_reads` already holds the answer.

### Recommendation

1. **Check the data first.** Find what share of students who open a story finish it, and what share write a reflection.
   - The completion-report script (`scripts/completion-report.ts`) can be extended to report this as anonymous totals, with small counts hidden, as it does for steps.
   - If a story is rarely finished, it isn't earning its place in its current form.
2. **Fewer, better stories.**
   - Each one models **one** thing tied to a step, such as "speaking up once in the room where I hold back".
   - The protagonist is the student's age, struggles first, then manages.
   - Under a minute.
3. **Put each story at the moment of need.** Offer it inside the step it supports ("Before you start: a one-minute story"), not only in Extras.
4. **Every story available three ways:** watch, listen or read. See §5.

---

## 4. Principles for any multimedia (Mayer's multimedia learning research)

| Principle | What it means for Groundwork |
|---|---|
| **Coherence:** leave out what doesn't serve the point | No background music or decorative sound. Every image and animation has a job. Seductive details cost about g ≈ −0.33 (Sundararajan & Adesope, 2020). |
| **Signalling** | Point attention at what matters, such as a character's face at the turning point, not at the scenery. |
| **Segmenting** | Short scenes the student moves through at their own pace. The film player already does this. Keep it. |
| **Modality and redundancy** | Narration plus pictures generally beats on-screen text plus pictures. But captions help students learning English and Deaf or hard-of-hearing students (Gernsbacher, 2015), and some studies find identical captions slow typical learners. **So captions are a choice the student controls,** on by default for films without narration. |
| **Animation vs. still pictures** | Animation helps when it shows change, such as a feeling shifting or an event unfolding (d ≈ 0.23–0.37). Decorative motion doesn't help. |
| **Universal Design for Learning** (multiple ways to take in, take part and show) | The evidence that UDL raises achievement is mixed and mostly weak (Capp, 2017; King-Sears et al., 2023). But offering more than one way in is also what accessibility standards (WCAG 2.2) require, so it's worth doing for access, not as a claimed effect. |

---

## 5. What each group of students needs

| Need | What helps | Evidence | In Groundwork |
|---|---|---|---|
| **Reading difficulty / dyslexia** | Read-aloud of stories, questions, options and help text; highlighting the words as they're read; picture cues on tap-answers; shorter text | Text-to-speech g = 0.35 (Wood et al., 2018). Reading while listening helps more when the audio sets the pace (g = .41 vs .18; Clinton-Lisell, 2023). | Read-aloud everywhere; picture cues on Quick answers |
| **English as an additional language** | Read-aloud; captions; pictures; plain English | Captions help most when viewing in a non-native language (Gernsbacher, 2015) | Read-aloud plus captions; plain-English review of the longest text |
| **Attention / ADHD** | Short chunks, learner-paced, visible progress, no competing sound or motion | Extraneous detail costs more for low working memory (coherence; seductive details) | Short scenes, no background audio, gentle animation only, motion off when asked |
| **Vision** | Proper screen-reader labels; audio description of meaningful visuals; read-aloud; high contrast | WCAG 2.2 (1.1.1, 1.2.3/1.2.5) | Audio description for each film scene; image descriptions; contrast already audited |
| **Hearing** | Captions or transcript for anything spoken; nothing important carried by sound alone | WCAG 2.2 (1.2.2) | Films already have captions and a transcript; any new sound needs a text equivalent |
| **Motion sensitivity** (often forgotten) | Respect the phone's "reduce motion" setting | WCAG 2.2 (2.3.3) | Already respected; every new animation must do the same |

---

## 6. Verdicts on what you asked for

| Your choice | Verdict | Why, and how |
|---|---|---|
| **Read aloud everywhere** | **Do first** | Best-evidenced item, and it serves four of your five groups. Use the phone's built-in speech (Web Speech API): free, offline, many languages. Add a "Listen" button on stories, step questions, options and help text, highlight words as they're read, and let the student set the speed. Caveats: voices vary by device, and speech has to start from a tap on iPhones, which is fine with a button. |
| **Polish the 3 films** | **Yes, focused** | Make the meaning clearer, not busier: expressive faces at the turning point, clearer coping arcs, better timing. Add optional spoken narration (read-aloud of each scene's line, in step with the scene) and an audio-description line for each scene. |
| **Small animations in the app** | **Yes, a few** | Only where they show something: progress filling, a card being added to the Who I Am card, a done step ticking. No decorative movement. All of it off when the phone asks for reduced motion. |
| **Illustrations in the film style** | **Yes** | For finding your way: an illustration for each mission and step intro, and for empty screens. Consistent with the films, light to load, and they adapt to every look. Recommended addition: **picture cues on tap-answers**, which help readers who struggle. |
| **Sound effects in films** | **Limited trial only** | Sound that carries meaning (a phone buzzing in the story, a door closing) can help absorption. Background music and ambience are the irrelevant sound the research warns against, worst under narration. If added: off by default, never under narration, captioned ("[phone buzzes]"). |
| **Photos / AI images** | **Not recommended for the app** | They're inconsistent with the illustrated style and raise representation risks (whose faces, which cultures) that the Culture and Heritage review is already careful about. They also carry licensing questions and weigh far more on slow connections. AI images would need checking one by one. If used at all, keep them to marketing. |
| **Review the stories first** | **Yes** | See §3: check the data, then fewer, better, better-placed stories, each available to watch, listen or read. |

---

## 7. Proposed order of work (each step needs your go-ahead)

1. **Read-aloud everywhere,** with word highlighting, a speed control, and a setting to show or hide the Listen buttons.
2. **Story data and redesign brief.**
   - Extend the completion report with anonymous story finish and reflection rates.
   - Then decide which stories to keep, rewrite or drop, and where each one goes inside a step.
3. **Film polish.** Faces and emotion at the turning points, coping arcs, timing, narration through read-aloud, and an audio-description line per scene.
4. **Picture cues and illustrations.**
   - Cues on tap-answers.
   - Illustrations for mission and step intros and empty screens, in the film style.
5. **A few meaningful animations,** all respecting reduced motion.
6. **Optional:** a sound-effects trial on one film, off by default, captioned, and only if students in co-design ask for it.

**Co-design.** As with the on-device phrase lists (`docs/content-review/phrase-lists.md`), test steps 1–4 with a small group of students, including students with dyslexia, students learning English, and students with ADHD. Small and observed beats guessing.

**Measuring.** Count, never content:
- how often Listen is used;
- story finish rates before and after the redesign;
- step completion, from the existing completion counts.

---

## Sources

- Braddock & Dillard (2016), meta-analysis of narrative effects; transportation and identification overview ([summary](https://en.wikipedia.org/wiki/Transportation_theory_(psychology))).
- Isberner et al. (2018), *Empowering stories: Transportation into narratives with strong protagonists increases self-related control beliefs*, Discourse Processes ([PMC6999344](https://pmc.ncbi.nlm.nih.gov/articles/PMC6999344/)).
- Age similarity and identification, PLoS ONE (2019) ([DOAJ](https://doaj.org/article/cf764f6b062540858b8172fb8503476a)).
- Wood, Moxley, Tighe & Wagner (2018), text-to-speech meta-analysis, *Journal of Learning Disabilities* ([PMC5494021](https://pmc.ncbi.nlm.nih.gov/articles/PMC5494021/), [ASHA summary](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8f7b9dd3-41fb-48c6-86a5-3e25ad47bc7b)); Clinton-Lisell (2023) on reading while listening ([UND](https://commons.und.edu/ehb-fac/75)).
- Höffler & Leutner (2007), animation vs. static pictures ([IPN](https://www.leibniz-ipn.de/en/research/publications/instructional-animation-versus-static-pictures-a-meta-analysis)); later meta-analyses summarised in ([Springer](https://link.springer.com/article/10.1007/s11251-021-09541-w)).
- Mayer, coherence principle ([Cambridge](https://www.cambridge.org/core/books/multimedia-learning/coherence-principle/4C1367F7716D91DE196CA8D319DF5FAD)); Moreno & Mayer (2000) on irrelevant sounds.
- Sundararajan & Adesope (2020), seductive details meta-analysis, *Educational Psychology Review* ([WSU](https://news.wsu.edu/2020/03/19/seductive-details-inhibit-learning/)); Rey (2012) ([overview](https://en.wikipedia.org/wiki/Seductive_details)).
- Gernsbacher (2015), *Video captions benefit everyone* ([PDF](https://successforkidswithhearingloss.com/wp-content/uploads/2020/04/Video-Captions-Benefit-Everyone_2015.pdf)); critique ([Learning and the Brain](https://www.learningandthebrain.com/blog/video-captions-benefit-everyone-an-investigation/)).
- UDL: Capp (2017) and King-Sears et al. (2023) ([summary](https://www.readingrockets.org/resources/resource-library/effectiveness-universal-design-learning-meta-analysis-literature-between), [critique, in French](https://r-libre.teluq.ca/3987/1/UDL.pdf)).
- Web Speech API support and quirks ([Chrome](https://developer.chrome.com/blog/web-apps-that-talk-introduction-to-the-speech-synthesis-api), [Readium](https://readium.org/speech/docs/WebSpeech.html)).
- WCAG 2.2 success criteria 1.1.1, 1.2.2, 1.2.3/1.2.5 and 2.3.3 (W3C). Not re-verified here.
