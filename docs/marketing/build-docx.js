const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, PageBreak, convertInchesToTwip,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ── Palette (Groundwork's own, from README § Design system) ──────────────
const NAVY = "1B3A5C", TEAL = "24707F", GOLD = "8E6910", SAGE = "3B6E4B", RUST = "9C3F2A";
const INK = "17222E", MUTED = "4E5A66", FAINT = "7E8892";
const LINE = "DCDCD4", SUNK = "F4F4F0";
const WASH = { say: "EAF1EC", care: "F8F2E0", never: "F7EAE5" };

const SERIF = "Georgia", SANS = "Calibri";
const W = 9026; // content width in DXA (A4 less 1" margins)

const noBorder = { top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
                   left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"} };
const hair = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const cellBorders = { top: hair, bottom: hair, left: hair, right: hair };

// ── Small builders ───────────────────────────────────────────────────────
const eyebrow = (t) => new Paragraph({ spacing:{ before:320, after:60 },
  children:[ new TextRun({ text:t.toUpperCase(), font:SANS, size:15, bold:true, color:FAINT, characterSpacing:28 }) ] });

const h1 = (t) => new Paragraph({ heading:HeadingLevel.HEADING_1, spacing:{ before:80, after:140 },
  children:[ new TextRun({ text:t, font:SERIF, size:30, bold:false, color:NAVY }) ] });

const h2 = (t, color=NAVY) => new Paragraph({ heading:HeadingLevel.HEADING_2, spacing:{ before:260, after:100 },
  children:[ new TextRun({ text:t, font:SERIF, size:24, color }) ] });

const h3 = (t, color=INK) => new Paragraph({ heading:HeadingLevel.HEADING_3, spacing:{ before:200, after:70 },
  children:[ new TextRun({ text:t, font:SANS, size:21, bold:true, color }) ] });

// rich(): "**bold**" and "*italic*" inline markers, kept simple and explicit.
function rich(text, { size=20, color=MUTED, font=SANS } = {}) {
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ text:text.slice(last,m.index), font, size, color }));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(new TextRun({ text:tok.slice(2,-2), font, size, bold:true, color:INK }));
    else out.push(new TextRun({ text:tok.slice(1,-1), font, size, italics:true, color }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ text:text.slice(last), font, size, color }));
  return out;
}

const p = (text, opts={}) => new Paragraph({
  spacing:{ after: opts.after ?? 120, line: 276 },
  children: rich(text, opts),
});

const bullet = (text, opts={}) => new Paragraph({
  numbering:{ reference:"gw-bullets", level:0 },
  spacing:{ after: 70, line: 268 },
  children: rich(text, opts),
});

const rule = () => new Paragraph({ spacing:{ before:160, after:160 },
  border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:LINE } }, children:[ new TextRun("") ] });

// A tinted, left-ruled callout built as a one-cell table.
function callout(title, body, accent, fill) {
  return new Table({
    width:{ size:W, type:WidthType.DXA }, columnWidths:[W],
    borders:{ ...noBorder, left:{ style:BorderStyle.SINGLE, size:18, color:accent } },
    rows:[ new TableRow({ children:[ new TableCell({
      width:{ size:W, type:WidthType.DXA },
      shading:{ type:ShadingType.CLEAR, fill, color:"auto" },
      margins:{ top:160, bottom:160, left:220, right:220 },
      borders:{ ...noBorder, left:{ style:BorderStyle.SINGLE, size:18, color:accent } },
      children:[
        ...(title ? [ new Paragraph({ spacing:{ after:70 },
          children:[ new TextRun({ text:title, font:SANS, size:19, bold:true, color:accent }) ] }) ] : []),
        ...body.map((t) => p(t, { after: 0 })),
      ],
    }) ] }) ],
  });
}

function tbl(widths, header, rows, opts={}) {
  const head = !header ? null : new TableRow({ tableHeader:true, children: header.map((t,i) => new TableCell({
    width:{ size:widths[i], type:WidthType.DXA }, borders:cellBorders,
    shading:{ type:ShadingType.CLEAR, fill:SUNK, color:"auto" },
    margins:{ top:100, bottom:100, left:140, right:140 },
    children:[ new Paragraph({ children:[ new TextRun({ text:t.toUpperCase(), font:SANS, size:15, bold:true, color:FAINT, characterSpacing:20 }) ] }) ],
  })) });
  const body = rows.map((r) => new TableRow({ children: r.map((t,i) => new TableCell({
    width:{ size:widths[i], type:WidthType.DXA }, borders:cellBorders,
    margins:{ top:110, bottom:110, left:140, right:140 },
    children:[ new Paragraph({ spacing:{ line:264 }, children: rich(t, { size: opts.size ?? 19, color: i===0 && opts.firstBold ? INK : MUTED }) }) ],
  })) }));
  return new Table({ width:{ size:W, type:WidthType.DXA }, columnWidths:widths, rows: head ? [head, ...body] : body });
}

const ref = (n, text, note) => [
  new Paragraph({ spacing:{ before:100, after:20, line:264 }, indent:{ left:420, hanging:420 },
    children:[ new TextRun({ text:`${n}.  `, font:SANS, size:19, bold:true, color:INK }), ...rich(text,{ size:19 }) ] }),
  new Paragraph({ spacing:{ after:60, line:252 }, indent:{ left:420 },
    children:[ new TextRun({ text:note, font:SANS, size:17, color:FAINT, italics:true }) ] }),
];

// ── Document ─────────────────────────────────────────────────────────────
const children = [];

// Masthead
children.push(
  new Paragraph({ spacing:{ after:60 }, children:[ new TextRun({ text:"GROUNDWORK", font:SERIF, size:20, color:NAVY, characterSpacing:60 }) ] }),
  new Paragraph({ spacing:{ after:140 }, children:[ new TextRun({
    text:"What the missions and the ten weeks are actually for", font:SERIF, size:44, color:NAVY }) ] }),
  new Paragraph({ spacing:{ after:140, line:288 }, children:[ new TextRun({
    text:"A marketing guide: what to claim about Groundwork, why finishing matters more than starting, and which piece of research stands behind each sentence.",
    font:SANS, size:23, color:MUTED }) ] }),
  new Paragraph({ spacing:{ after:60 }, border:{ top:{ style:BorderStyle.SINGLE, size:6, color:LINE } },
    children:[ new TextRun({ text:"", size:2 }) ] }),
  new Paragraph({ spacing:{ before:80, after:0 }, children:[ new TextRun({
    text:"For school partnerships, parent comms, and student-facing copy   ·   Product facts updated October 2026   ·   Evidence checked September 2026",
    font:SANS, size:17, color:FAINT }) ] }),
  rule(),
);

// ── 01 ───────────────────────────────────────────────────────────────────
children.push(
  eyebrow("01 — The product in one breath"),
  h1("Three parts, named the same way every time"),
  p("Groundwork is a self-guided identity and character programme for teenagers. Everything a student writes is private to them. There is no score, no streak, no leaderboard, and no social feed. Use the three names below consistently — inconsistent naming is the single biggest reason a demo loses a room."),
  h3("Four missions — the deep dives", NAVY),
  p("One big question each: four or five reflective steps of 2–15 minutes, a challenge carried through a week, then a conversation with someone in the student's life, with another way to do it for anyone who has nobody to ask. Twenty-six steps in all, starting with a two-minute look at the story so far."),
  h3("The ten-week Character Program — the habit layer", TEAL),
  p("One question a week and one thing to actually do. Ends in the Character Code — the student's story in one sentence, then five to seven commitments they write and keep."),
  h3("The Standard — the mirror", GOLD),
  p("Three outward-facing questions answered again and again, with the previous answer visible while writing the next. Read back over months."),
);

// ── 02 ───────────────────────────────────────────────────────────────────
children.push(
  eyebrow("02 — The core claim"),
  h1("Identity is the starting point. Character is the practice. Contribution is the evidence."),
  p("This is the sentence to lead with. It is not a slogan bolted on afterwards — it is the actual architecture of the app, and every section below is a different way of proving it."),
  new Paragraph({ spacing:{ before:60, after:60 } }),
  callout("The 40-second version — use verbatim in a first meeting",
    ["Most wellbeing tools ask a teenager how they feel. Groundwork asks who they are, then makes them go and act like it. The missions establish what a student actually values and is good at. The ten weeks turn that into behaviour someone else could observe. The result is not a mood score — it's a document in their own handwriting they can still read at 18."],
    NAVY, SUNK),
  new Paragraph({ spacing:{ after:60 } }),
  h3("The loop the product encodes"),
  tbl([2400, 6626],
    ["The move", "Where it happens"],
    [
      ["Work out who you want to be", "Missions 1 and 4 — the story so far, strengths, values, the future self"],
      ["Name what that person values", "Program weeks 1–2 — values become observable behaviours"],
      ["Practise the behaviour", "Program weeks 3–9 — one lived challenge a week"],
      ["Check the impact on others", "The Standard and the weekly five — repeated, never scored"],
    ], { firstBold:true }),
);

// ── 03 ───────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("03 — The argument that matters most"),
  h1("Why finishing is the product, not a nice-to-have"),
  p("Every buyer will ask about engagement. The honest and more persuasive answer is that Groundwork's benefits are structurally back-loaded: five of them do not exist at all until a student completes the sequence. Lead with this."),
  h3("1 — The order is the intervention"),
  p("The missions move from exploring, to committing, to joining it all up — built on exploration and commitment, the two dimensions Marcia used to operationalise Erikson's adolescent identity stage (refs 1, 2). Mission 4 asks “what kind of life do I want?” — a question that produces fantasy from a student who hasn't done Mission 1, and a decision from one who has. Durlak and colleagues' meta-analysis of 213 school SEL programmes found outcomes were moderated by whether the programme used sequenced, active, focused and explicit practice — dosage and order, not content alone, separated the programmes that worked (ref 3)."),
  h3("2 — Ten weeks is a dose, not a duration"),
  p("The programme runs seventy days. Lally and colleagues tracked ninety-six people forming a daily behaviour and found the median time to automaticity was sixty-six days, with occasional missed days doing no material damage (ref 4). That is why the trackers in the app are grids rather than streaks: a week with gaps still counts. A student who does weeks one to three has read about character. A student who finishes has run a behaviour long enough for it to start running itself."),
  h3("3 — The missions are load-bearing for the weeks"),
  p("Week 1 displays the strengths Mission 1 mapped and asks which five the student wants at 25. Week 2 lays out their chosen values and asks for the behaviour that proves each. Week 8 builds on Mission 3's map of who shaped them. The weeks don't reference the missions politely — several cannot be completed without them. Completion isn't enforced by nagging; it's enforced by the material being genuinely needed at the point it's needed."),
  h3("4 — The capstone only exists at the end"),
  p("The Character Code is week 10: the student's story in one sentence — because of where they've come from, who they are, where they're heading — then five to seven commitments written in the present tense as things they *do*. It is the artefact a parent can be shown and a student can be held to, and there is no partial version of it. Nine weeks of work produce no Code."),
  h3("5 — The record is the intervention"),
  p("Revisits let a student reopen something they wrote months earlier, read it whole, and say what has changed — for the story steps, what they would add to their story now. There is no comparison to other students and no score. But a revisit needs something to revisit — spacing is set at a minimum of fourteen days precisely because nothing much changes in a week. A student who completes builds the archive that makes year two of the product work. One who dabbles has nothing to come back to. *My story* gathers the archive into one page — where they've come from, who they are, where they're heading — then asks the student to join it up in one paragraph of their own words. Each year it asks for a new paragraph with last year's in view. Wherever a question comes back, the earlier answer is on screen, so the second answer is about what has changed."),
);

// ── 04 ───────────────────────────────────────────────────────────────────
const missions = [
  { n:"Mission 01 — Identity", q:"Who am I?", sub:"The story so far, strengths, values, the mask, the letter", phase:"Exploration", col:NAVY,
    left:"**The chapters of their story so far, a snapshot of their signature strengths, and five named values**, plus a written account of the gap between the private and public self.",
    benefit:"A student who can name what they're good at in their own words has something to steer by when a decision gets hard — and something to say in an interview at 17.",
    ev:"Built on the VIA classification of character strengths (ref 5). Acting from self-endorsed rather than externally pressured values is one of the most replicated findings in motivation research (ref 6). The mask activity draws on self-monitoring: some gap is healthy, a large one tracks with anxiety (ref 7). The opening step starts the life story that narrative-identity research describes (ref 13)." },
  { n:"Mission 02 — Purpose", q:"What do I care about?", sub:"The cause, the contribution, the people", phase:"Commitment", col:TEAL,
    left:"**A written commitment statement** naming one specific thing the student could contribute, to one specific thing they care about.",
    benefit:"The difference between a teenager who is busy and one who is going somewhere. Purpose is the strongest non-academic predictor a school can actually move.",
    ev:"Damon's distinction between being engaged and being purposeful (ref 8). Purpose correlates with life satisfaction across adolescence and emerging adulthood (ref 9). A brief intervention giving learning a self-transcendent purpose raised maths and science GPA months later across four studies with 2,000+ students (ref 10)." },
  { n:"Mission 03 — Connection", q:"Where do I belong?", sub:"Belonging vs fitting in, bridging, the people who shaped you", phase:"Commitment", col:SAGE,
    left:"**A named map of who shaped them and how**, and a working distinction between the groups they perform for and the ones they're known in.",
    benefit:"This is the mission that speaks directly to a wellbeing lead's actual caseload: the student who has friends and is still lonely.",
    ev:"Social identity theory on group membership as a pillar of self (ref 11). Putnam's bridging-versus-bonding distinction underwrites the cross-difference activity (ref 12). McAdams: people who can say who shaped them hold a more coherent identity (ref 13). A brief belonging intervention halved a three-year GPA gap and improved self-reported health (ref 14). Its conversation asks an older relative where the family comes from: young people who know more of their family's stories report higher self-esteem and a stronger sense of control over their lives (ref 24)." },
  { n:"Mission 04 — Meaning", q:"What kind of life do I want?", sub:"Where you've come from, future self, digital self, the through-line, the cost", phase:"Integration", col:GOLD,
    left:"**A sorted account of what family and culture handed them — keep, rework or leave — and a concrete picture of an ordinary day in their future**, with a written answer to what they would trade for it.",
    benefit:"Turns “what do you want to do after school?” from a question that produces panic into one that produces a sentence. Especially load-bearing for Year 12, who also get Your Next Chapter: the version of next year they're hoping for, the one they'd rather avoid, a step for each, and a conversation with someone already doing it. Year 7–9 get the same shape at a nearer distance: an ordinary Tuesday at 16, and next year at school.",
    ev:"Possible-selves research: vague future selves do almost nothing, specific ones move behaviour (ref 15). A possible-selves intervention with low-income Year 8 students improved grades, test scores and attendance and reduced misbehaviour, sustained over two years (ref 16). The opening step is Erikson's: identity forms as a young person sorts what they were handed, keeping some, reworking some and setting some down (ref 1)." },
];

children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("04 — Benefit by mission"),
  h1("What each mission actually leaves behind"),
  p("For each mission: the benefit in the language a buyer uses, and the research that licenses the claim. The bolded outcome is the thing that exists after the mission that did not exist before it."),
);
for (const m of missions) {
  children.push(
    new Paragraph({ spacing:{ before:280, after:40 }, children:[
      new TextRun({ text:m.n.toUpperCase(), font:SANS, size:15, bold:true, color:m.col, characterSpacing:28 }) ] }),
    new Paragraph({ spacing:{ after:40 }, children:[ new TextRun({ text:m.q, font:SERIF, size:26, color:m.col }) ] }),
    new Paragraph({ spacing:{ after:120 }, children:[
      new TextRun({ text:m.sub, font:SANS, size:19, italics:true, color:FAINT }),
      new TextRun({ text:`   ·   ${m.phase} phase`, font:SANS, size:17, color:FAINT }) ] }),
    tbl([1700, 7326], null, [
      ["Leaves behind", m.left],
      ["Benefit line", m.benefit],
      ["Evidence", m.ev],
    ], { firstBold:true }),
  );
}

// ── 05 ───────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("05 — The ten-week Character Program"),
  h1("The part that has to be lived rather than written about"),
  p("Every week ends in a challenge that happens off the screen. This is the single most useful thing to demonstrate, because it is the opposite of what buyers expect from an app — the app's own goal is to get the student off it and into a corridor, a kitchen, a training session."),
  new Paragraph({ spacing:{ after:80 } }),
  tbl([620, 2600, 5806], ["Wk", "The question", "What the student actually does"], [
    ["01","Who am I becoming?","Chooses five character qualities they want people using about them at 25, and names the gap against the five they lead with now."],
    ["02","What do I stand for?","Puts one observable behaviour next to each of their five values. A value without a behaviour is a preference."],
    ["03","Am I a contributor?","One useful unasked-for thing a day, told to nobody. No posting it. Credit collected turns contribution into trade."],
    ["04","Can people trust me?","Makes one small promise and keeps it every day for a week. Small and kept beats ambitious and dropped."],
    ["05","Do I do hard things?","Names a personal hill — fitness, a skill, a conversation they've dodged — and works it four times."],
    ["06","What guides my choices?","One real dilemma a day through three questions: what could happen, who could be harmed, what would a trustworthy person do."],
    ["07","Can I manage myself?","Writes three “I'm the kind of person who…” statements and says them as facts, not goals."],
    ["08","Who is shaping me?","Names three peers who lift them and two adults worth learning from, then spends deliberate time with them."],
    ["09","Do I leave room for inner work?","Three screen-free half hours. Boredom is the mechanism here, not the failure state."],
    ["10","What will my character code be?","Writes the Character Code: their story in one sentence, then five to seven commitments for the year ahead, in the present tense, as things they do."],
  ], { firstBold:true, size:18 }),
  new Paragraph({ spacing:{ before:80, after:120 }, children:[ new TextRun({
    text:"Every week except week 7 builds directly on saved mission work.", font:SANS, size:17, italics:true, color:FAINT }) ] }),
  h3("Why the challenges are shaped this way"),
  p("Weeks 4 and 5 make the student name their own promise or hill *before* any tracker appears. That is an implementation intention — specifying the when, where and how of a commitment in advance — which across 94 independent tests produced a medium-to-large effect on goal attainment, d = .65 (ref 17). Week 7 converts self-control from a willpower problem into an identity statement, because willpower depletes and self-concept doesn't. Week 3's no-credit rule is not moralism: prompting preadolescents to perform acts of kindness produced significantly larger gains in peer acceptance than a matched control activity (ref 18)."),
  h3("Why there is no streak"),
  p("The seven-day grid is a record, never a run to break, and a week can be completed with gaps in it. Character is never scored in Groundwork, and this is a deliberate design position worth stating out loud in a pitch: scoring character invites impression management, which is precisely what the questions exist to defeat. Each question in The Standard carries a counterweight that surfaces once the student starts writing — *who feels less safe around me?* — so the exercise stays a mirror rather than a highlight reel."),
  new Paragraph({ spacing:{ after:60 } }),
  callout("The demo move",
    ["When you have ninety seconds, show week 3 and read the challenge aloud: “one useful thing nobody asked you to do — and tell nobody.” Then show the Character Code from week 10. The gap between those two screens is the whole product, and it lands without any explanation of the underlying frameworks."],
    GOLD, WASH.care),
);

// ── 06 ───────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("06 — The number bank"),
  h1("Figures you can put on a slide"),
  p("Each of these is checked against the source paper. Quote the measure as written — the wording in the middle column is the claim, not the figure on its own."),
  new Paragraph({ spacing:{ after:80 } }),
  tbl([1300, 5426, 2300], ["Figure", "What it actually measures", "Source"], [
    ["+11 pts","Percentile-point gain in academic achievement for students in school-based SEL programmes, across 213 programmes and 270,034 students.","Durlak et al., 2011 (ref 3)"],
    ["18 years","The longest follow-up at which SEL participants still fared better than controls on skills, attitudes and wellbeing, across 82 programmes.","Taylor et al., 2017 (ref 19)"],
    ["11 : 1","Average benefit–cost ratio across six SEL programmes — eleven dollars of measured benefit per dollar spent.","Belfield et al., 2015 (ref 20)"],
    ["d = .65","Effect of forming an implementation intention on goal attainment, across 94 independent tests. The mechanism behind weeks 4 and 5.","Gollwitzer & Sheeran, 2006 (ref 17)"],
    ["66 days","Median time for a new daily behaviour to become automatic. The programme runs 70.","Lally et al., 2010 (ref 4)"],
    ["52%","Reduction in a three-year GPA gap following a brief social-belonging intervention, with improved self-reported health at three years.","Walton & Cohen, 2011 (ref 14)"],
  ], { firstBold:true, size:18 }),
  new Paragraph({ spacing:{ after:80 } }),
  callout("Read this before using the figures above",
    ["None of these studies evaluated Groundwork. They establish that the *categories* Groundwork works in — SEL, purpose, belonging, implementation intentions — produce measurable effects when delivered well. That is a legitimate and defensible thing to say. It is not the same as “Groundwork raises grades by 11 percentile points”, which would be false. The wording in section 7 keeps the distinction visible."],
    RUST, WASH.never),
);

// ── 07 ───────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("07 — What we can and cannot say"),
  h1("The claim ladder"),
  p("Groundwork's own documentation marks which frameworks are named in the research and which are only implied by it. Marketing should hold the same line. Schools do due diligence, and one overreached sentence costs more than it earns."),
  new Paragraph({ spacing:{ after:80 } }),
  tbl([1250, 3376, 4400], ["Verdict", "The line", "Why"], [
    ["SAY IT","“Built on the VIA character strengths framework and social-emotional learning research.”","Accurate and already on the landing page. The strengths assessment is an indicative snapshot of the VIA classification, not the full survey — say “based on” and “indicative”, never “validated” or “clinical”. (refs 5, 3)"],
    ["SAY IT","“Every activity maps to one of the five CASEL competencies, and we can show you which.”","True and unusually easy to evidence — the mapping is documented activity by activity. The single most useful sentence in a conversation with a wellbeing lead or curriculum coordinator. (ref 21)"],
    ["SAY IT","“Groundwork gives students practice in the Identities and change content of the Australian Curriculum’s HPE learning area, and fits the Student voice and Support elements of the Australian Student Wellbeing Framework.”","Mapped code by code in the repository (docs/curriculum-alignment.md): AC9HP8P01–P02 for Years 7–8 and AC9HP10P01–P02 for Years 9–10, part of the Personal, social and community health strand, plus the Personal and Social and Ethical Understanding capabilities. Say “gives practice in” or “supports”, never “covers” or “delivers”: nothing in Groundwork is taught or assessed. Name the strand, because there’s nothing for Movement and physical activity. The mapping stops at Year 10, which is where the F–10 curriculum ends. (refs 26, 27)"],
    ["SAY IT","“No teacher or parent can read a student's journal. That's a design decision, not a settings default.”","True and enforced in the schema's row-level security. Lead with it in parent communications rather than burying it — it is the objection you would otherwise spend the meeting on."],
    ["CAREFULLY","“Writing about yourself has measurable benefits.”","True but small. The best meta-analysis of experimental disclosure found an average effect of r = .075 across 146 randomised studies — real, cheap to deliver, and considerably smaller than earlier syntheses claimed. Say “a small, well-replicated benefit”. Never imply it is therapeutic. (ref 22)"],
    ["CAREFULLY","“Character education works.”","The evidence base is real but uneven in quality, and effective programmes share features — multi-year, whole-school, adult modelling — that a self-guided app does not supply on its own. Position Groundwork as the student-facing spine of a character programme, not a replacement for one. (ref 23)"],
    ["CAREFULLY","“The programme is personalised to each student.”","It adapts on one real axis: life stage, chosen at onboarding (Year 7–9, 10–11 or 12, just left school, or a few years out). That changes the examples, and for Year 12 and school leavers it puts next-year planning first. For anyone who has left school, the questions set at school are reworded for work and study, and the future steps picture an age a few years ahead of theirs rather than a fixed 21. Year 7–9 picture a nearer future and get more concrete versions of the story tasks, because finding one theme across your life mostly arrives later in adolescence (ref 25). Everyone starts with Mission 1. Describe that specifically. “Personalised” unqualified implies an adaptive engine that isn't there."],
    ["CAREFULLY","“Students get to see whether it's made a difference to them.”","A nine-question check-in during sign-up (straight after a one-minute story) and again ten weeks later shows each student their own change. The questions are Groundwork's own wording, not a validated scale, and answers are only shown back to the student — they are not counted in totals without ethics review and consent. Never quote check-in results as evidence that Groundwork works."],
    ["CAREFULLY","“It's locked, so nobody else can read it.”","A student can set an optional four-digit code that locks the app on that device, and the most personal entries stay hidden in the Journal until tapped. Say exactly that. The app itself says the code stops a casual look, not someone determined: it lives on the device, and getting past it means signing out, which then needs the account password."],
    ["CAREFULLY","“It supports students' cultural identity.”","Mission 3 has an optional Culture and Heritage step: four questions, each one skippable, kept private and never sent to the AI. Its wording was drafted without community input and is waiting for review by people from the communities it speaks to. Describe it exactly if asked. Don't promote it, or call it culturally safe or co-designed, until that review has happened."],
    ["NEVER","Anything that positions Groundwork as therapy, treatment, or a mental-health intervention.","The app says “this isn't a therapy app” on its own landing page and in settings, and directs students to Kids Helpline. Marketing must not contradict the product. This also keeps Groundwork out of a regulatory category it is not built for."],
    ["NEVER","Any figure from section 6 attributed to Groundwork itself.","No outcome study of Groundwork exists yet. “Programmes of this kind have been shown to…” is defensible; “Groundwork delivers…” is not, until there is a pilot with pre/post data behind it."],
    ["NEVER","“Track your students' progress”, said to a teacher or school.","There is no teacher dashboard and journals are private by design. Promising visibility that doesn't exist — and shouldn't — sets up a failed implementation. The most Groundwork can offer is completion totals: how many students finish each step, across everyone, with counts under five hidden. There's no per-class or per-student view, so don't promise one, and never anything a student wrote."],
    ["NEVER","“Covers the HPE curriculum”, or anything implying Groundwork teaches consent, respectful relationships or protective behaviours.","The mapping lists these as gaps, on purpose: they need a teacher, a class and the school’s own respectful relationships programme. A school that buys Groundwork thinking those boxes are ticked has been misled, and will find out. Don’t claim the Aboriginal and Torres Strait Islander cross-curriculum priority either, until the Culture and Heritage review is done."],
  ], { firstBold:true, size:18 }),
);

// ── 08 ───────────────────────────────────────────────────────────────────
const auds = [
  { h:"School leaders", who:"Deputy principals, heads of wellbeing, curriculum coordinators", col:NAVY,
    lead:"“You already run a character programme. This is the part your students do between your assemblies.”",
    pts:["**Maps to what they report on.** Five CASEL competencies, activity by activity, and the HPE curriculum's Identities and change content, code by code.",
         "**No marking, no timetable.** Self-guided, twenty-six mission steps plus a weekly cadence, at the student's pace.",
         "**Age-appropriate by design.** Everyone starts with Mission 1, then the weeks run one at a time. Examples change with life stage. Year 10–11s are offered Your Next Chapter around subject choice, and Year 12s and school leavers get next-year planning — Your Next Chapter, pathways and goals — first. Students who have left school get questions about work and study, not the classroom. Year 7–9 get a nearer future, more concrete tasks, and less to read before each question.",
         "**Defensible.** Every activity has a named framework behind it, and we'll tell you which claims are strong and which are indicative.",
         "**Privacy is the offer, not the risk.** Nobody reads student writing. That's why they write honestly. On a shared device, an optional code locks the app."] },
  { h:"Parents", who:"Reached through the school, at information evenings", col:TEAL,
    lead:"“It asks your teenager to do one difficult thing a week, and it never shows you what they wrote.”",
    pts:["**It gets them off the screen.** Every week ends in something lived — a promise kept, a conversation had, half an hour without a phone.",
         "**Nothing is public.** No feed, no followers, no comparison to other students, no score.",
         "**It points back to you.** Each mission ends in a conversation — what they were like as a kid, where the family comes from, how you chose your path — and week 8 asks them to name two adults worth learning from and go and spend time with them.",
         "**There's something to show for it.** The Character Code at week 10 — their story in one sentence and the commitments that follow — is a page a family can actually talk about, and My story puts the whole thing on one page, with a paragraph in their own words, that they can choose to print.",
         "**It's honest about what it isn't.** Not therapy, and it says so."] },
  { h:"Students", who:"In-app copy, assembly slides, anything they read themselves", col:SAGE,
    lead:"“Figure out who you are. Build a life that matters.”",
    pts:["**Keep the frameworks out of student copy.** The app explains the research in an optional “The idea behind this” panel for anyone who wants it; posters and slides shouldn't. Never say “intervention”.",
         "**Lead with the challenge, not the writing.** “Do one useful thing nobody asked you to do, and tell nobody” recruits better than any description of reflection.",
         "**Say the privacy plainly.** “Nobody reads this. Not your teacher, not your parents.”",
         "**No pressure language.** Nothing expires and nothing nags. Say that — it's true, and it's why they come back.",
         "**Blank page is the enemy.** Mention that most questions can be answered by tapping, finishing a sentence, or writing your own, and that the hard ones can be left out."] },
];

children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("08 — Message by audience"),
  h1("Three rooms, three different first sentences"),
  p("The product doesn't change. The order of the benefits does. Each block below opens with the line to actually use."),
);
for (const a of auds) {
  children.push(
    h2(a.h, a.col),
    new Paragraph({ spacing:{ after:100 }, children:[ new TextRun({ text:a.who, font:SANS, size:17, color:FAINT }) ] }),
    new Paragraph({ spacing:{ after:120, line:276 }, indent:{ left:220 },
      border:{ left:{ style:BorderStyle.SINGLE, size:12, color:a.col, space:10 } },
      children:[ new TextRun({ text:a.lead, font:SERIF, size:22, color:INK }) ] }),
    ...a.pts.map((t) => bullet(t)),
  );
}

// ── 09 ───────────────────────────────────────────────────────────────────
const objections = [
  { q:"“How do we know they'll finish it?”", a:[
    "Don't claim they all will. Say what makes finishing more likely: the app shows one thing to start — Mission 1, then one week at a time — not two competing tracks; the weekly challenges are small and concrete rather than aspirational; nothing expires, so a missed week isn't a failed programme; and most open questions can be answered by tapping a written answer, finishing a half-written sentence, or writing from scratch — so non-completion caused by not knowing how to start a sentence about yourself is designed out.",
    "Then turn it around: ask what proportion of their current character programme's content students can still recall in March. Groundwork produces a document they keep."] },
  { q:"“Isn't this just journalling?”", a:[
    "No — and the difference is the half of the product that happens off the screen. Every mission ends in a challenge carried through a week. Every one of the ten programme weeks ends in something lived: a promise kept daily, four sessions on a chosen hill, three screen-free half hours, deliberate time with named people. The writing exists to make the action specific enough to be doable, and every written step ends by asking for one small step to take in the next week.",
    "The honest add: the writing itself has a small, well-replicated benefit — not a large one. We don't sell the journalling as the mechanism."] },
  { q:"“Our students already have too many apps.”", a:[
    "Agreed, and Groundwork is built to be a low-frequency one. There are no notifications, no streaks, and no daily engagement target — the app has nothing to gain from a student being on it. The weekly cadence is one question and one action; the mission steps run 2–15 minutes each, twenty-six of them across the whole programme.",
    "If the school's real concern is screen time, week 9 is the answer: three screen-free half hours, with boredom named as the mechanism."] },
  { q:"“What happens if a student writes something concerning?”", a:[
    "Answer this one precisely and without spin, because getting it wrong is a safeguarding problem. Journals are private — no teacher or parent view exists. The app therefore does not and cannot function as a disclosure channel, and it says so: it states plainly that it isn't a therapy app; a “Need to talk?” button on every screen lists free services, including Kids Helpline (1800 55 1800 in Australia); and if something a student writes sounds like they may be at risk, the app shows those services in place of its usual follow-up questions. That check is not saved, flagged or seen by anyone, so it is not a referral: it puts help in front of the student, not in front of an adult. In the same way, if several of a student's recent entries are very hard on themselves, the app suggests a different move — talking to someone, or ten minutes doing something else — again without saving or flagging anything. The risk check runs on every reflection a student saves; the hard-on-yourself check runs on mission steps, weekly reflections, Your Next Chapter and the paragraph in My story. Both match a list of English phrases, including some common online slang. Until they're co-designed with young people they'll still miss a lot, and every other language. Never describe them as monitoring.",
    "What that means for a school: Groundwork sits inside your existing pastoral structure, it doesn't substitute for it. Any school deploying it should say so to students in the same breath."] },
  { q:"“Does it ask students about gender or sexuality?”", a:[
    "Answer this one exactly, because it will be asked by parents as well as schools. Mission 1 has an optional step, Parts of Who You Are, that asks about beliefs, gender and sexuality, because they are part of working out who you are for many teenagers. It doesn't count towards the mission, every question in it can be left out, and the app says that sure, unsure and not-yet are all fine answers.",
    "What a student writes there stays in their own account: it is never sent anywhere (not even for the app's AI follow-up questions), never appears on My story or anything printable, and nobody else can read it. In the Journal those entries stay hidden until the student taps to show them, Home never suggests looking back at them, and an optional code can lock the app on a shared device. The step points to QLife, a free Australian line for LGBTIQ+ people and anyone with questions about gender or sexuality. Don't describe it as a lesson or as guidance on either subject. It is a place to reflect, and it is optional."] },
  { q:"“Where's the evidence it works?”", a:[
    "Be straight: there is no outcome study of Groundwork itself yet. What exists is a design built activity-by-activity on named research — Erikson and Marcia for the sequence, VIA for strengths, self-determination theory for values, Damon for purpose, McAdams for narrative, possible selves for the future work, implementation intentions for the weekly commitments — and a large evidence base showing that programmes of this type produce measurable effects when they are sequenced, active, focused and explicit.",
    "Then make the ask: a pilot cohort with pre/post measures. The app already runs a nine-question check-in during sign-up and again ten weeks later that a pilot could use once it has ethics approval and consent, alongside validated measures. Schools respond well to being invited into the evidence rather than sold a claim, and it converts the weakest part of the pitch into a reason to sign.",
    "There is a written plan for that pilot: validated scales for each thing the check-in measures, run by a university research partner rather than inside the app, a comparison group that starts a term later, and the ethics and education-department approvals it needs. Say a pilot is planned, not that one is running, until a partner and approval are in place. From 20 October the app can also report how many students finish each step, as totals with small numbers hidden. That's useful for a pilot's feasibility measures, but it's never evidence that Groundwork works."] },
];

children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("09 — Objection handling"),
  h1("The six questions you will be asked"),
);
for (const o of objections) {
  children.push(h3(o.q, NAVY), ...o.a.map((t) => p(t)));
}

// ── 10 ───────────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("10 — Ready to use"),
  h1("Copy blocks"),
  p("Written to the claim ladder in section 7. Cut freely; don't add."),
  h3("One line"),
  callout(null, ["Groundwork helps teenagers work out who they are — then asks them to go and act like it."], TEAL, SUNK),
  new Paragraph({ spacing:{ after:60 } }),
  h3("Boilerplate — 60 words"),
  callout(null, ["Groundwork is a self-guided identity and character programme for teenagers. Four missions ask one big question each — identity, purpose, connection, meaning. A ten-week programme turns the answers into weekly practice, each week ending in something the student has to live rather than write about. It ends in a Character Code: their story in one sentence, and the commitments that follow. Everything they write stays private."], TEAL, SUNK),
  new Paragraph({ spacing:{ after:60 } }),
  h3("Cold email to a head of wellbeing"),
  callout(null, [
    "**Subject:** The part of your character programme students do on their own",
    "Most character programmes are strong on assemblies and thin on what happens between them. Groundwork is the between-them part: four missions that map a student's strengths, values and direction, then ten weeks that turn those into weekly practice — one question, one thing to actually do, no scores and no streaks. It ends with each student writing a Character Code: their story in one sentence, then five to seven commitments in their own words.",
    "Two things worth knowing up front. Every activity maps to a CASEL competency, and to the Identities and change content of the HPE curriculum, and I'm happy to send both mappings. And no teacher or parent can read student writing — that's deliberate, and it's why they write honestly.",
    "We don't have an outcome study yet, so I'd rather run a pilot with pre/post measures than make a claim I can't support. Worth fifteen minutes?",
  ], TEAL, SUNK),
  new Paragraph({ spacing:{ after:60 } }),
  h3("Parent evening — three slides' worth"),
  bullet("Your teenager will be asked one question a week, and given one thing to do about it."),
  bullet("You will not be shown what they wrote. That's the point — it's why the answers are honest."),
  bullet("At the end there's a page they wrote themselves, called a Character Code. Ask them about that one."),
  h3("Student-facing, for a poster or assembly slide"),
  bullet("Four questions. Ten weeks. One page you write at the end and actually mean."),
  bullet("This week: do one useful thing nobody asked you to do — and tell nobody."),
  bullet("Nobody reads this. Not your teacher. Not your parents."),
);

// ── References ───────────────────────────────────────────────────────────
children.push(
  new Paragraph({ children:[ new PageBreak() ] }),
  eyebrow("References"),
  h1("Sources"),
  p("Items 1, 2, 5–8, 11–13 and 15 are the frameworks Groundwork's activities are built on. Items 3, 4, 9, 10, 14 and 16–25 are the empirical results quoted in this guide. Items 26 and 27 are the Australian documents the curriculum line is mapped against. Verified September 2026; items 24–27 added October 2026."),
  ...[
    ["Erikson, E. H. (1968). *Identity: Youth and Crisis.* Norton.","The adolescent stage the whole programme is organised around, and the keep / rework / leave sort in Mission 4."],
    ["Marcia, J. E. (1966). Development and validation of ego identity status. *Journal of Personality and Social Psychology, 3*(5), 551–558.","Exploration and commitment, the two dimensions the missions are built on."],
    ["Durlak, J. A., Weissberg, R. P., Dymnicki, A. B., Taylor, R. D., & Schellinger, K. B. (2011). The impact of enhancing students' social and emotional learning: A meta-analysis of school-based universal interventions. *Child Development, 82*(1), 405–432. doi:10.1111/j.1467-8624.2010.01564.x","213 programmes, 270,034 students, +11 percentile points; SAFE practice and implementation quality as moderators."],
    ["Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology, 40*(6), 998–1009. doi:10.1002/ejsp.674","Median 66 days to automaticity, range 18–254; missed days not materially damaging."],
    ["Peterson, C., & Seligman, M. E. P. (2004). *Character Strengths and Virtues: A Handbook and Classification.* Oxford University Press.","The VIA classification behind Strengths Mapping and week 1."],
    ["Deci, E. L., & Ryan, R. M. (2000). The “what” and “why” of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.","Self-endorsed values and durable motivation — the Values Clarifier."],
    ["Snyder, M. (1974). Self-monitoring of expressive behavior. *Journal of Personality and Social Psychology, 30*(4), 526–537.","The private/public gap measured in The Mask Check."],
    ["Damon, W. (2008). *The Path to Purpose: Helping Our Children Find Their Calling in Life.* Free Press.","Engaged versus purposeful; contribution-based purpose, and The Standard."],
    ["Bronk, K. C., Hill, P. L., Lapsley, D. K., Talib, T. L., & Finch, H. (2009). Purpose, hope, and life satisfaction in three age groups. *The Journal of Positive Psychology, 4*(6), 500–510. doi:10.1080/17439760903271439","Purpose and life satisfaction in adolescents and emerging adults."],
    ["Yeager, D. S., Henderson, M. D., Paunesku, D., Walton, G. M., D'Mello, S., Spitzer, B. J., & Duckworth, A. L. (2014). Boring but important: A self-transcendent purpose for learning fosters academic self-regulation. *Journal of Personality and Social Psychology, 107*(4), 559–580.","Four studies, 2,000+ adolescents; brief purpose intervention raised maths and science GPA."],
    ["Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In W. G. Austin & S. Worchel (Eds.), *The Social Psychology of Intergroup Relations.* Brooks/Cole.","Social identity theory — Mission 3's belonging work."],
    ["Putnam, R. D. (2000). *Bowling Alone: The Collapse and Revival of American Community.* Simon & Schuster.","Bridging versus bonding relationships — Across the Gap."],
    ["McAdams, D. P., & McLean, K. C. (2013). Narrative identity. *Current Directions in Psychological Science, 22*(3), 233–238.","Autobiographical authorship — Your Story So Far, The People Who Shaped You, the Character Code's story sentence, and the yearly paragraph in My story."],
    ["Walton, G. M., & Cohen, G. L. (2011). A brief social-belonging intervention improves academic and health outcomes of minority students. *Science, 331*(6023), 1447–1451. doi:10.1126/science.1198364","Three-year GPA gap reduced by 52%; improved self-reported health."],
    ["Markus, H., & Nurius, P. (1986). Possible selves. *American Psychologist, 41*(9), 954–969.","The Future Self activity in Mission 4."],
    ["Oyserman, D., Bybee, D., & Terry, K. (2006). Possible selves and academic outcomes: How and when possible selves impel action. *Journal of Personality and Social Psychology, 91*(1), 188–204.","141 intervention / 123 control Year 8 students; grades, test scores and attendance up, misbehaviour and depression down, sustained at two years. Also the basis for Your Next Chapter, including the Year 7–9 version about next year at school."],
    ["Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69–119.","94 independent tests, d = .65 — the mechanism behind programme weeks 4 and 5."],
    ["Layous, K., Nelson, S. K., Oberle, E., Schonert-Reichl, K. A., & Lyubomirsky, S. (2012). Kindness counts: Prompting prosocial behavior in preadolescents boosts peer acceptance and well-being. *PLOS ONE, 7*(12), e51380. doi:10.1371/journal.pone.0051380","19 classrooms; acts of kindness produced larger peer-acceptance gains than a matched control activity. Both groups improved in wellbeing — quote it that way."],
    ["Taylor, R. D., Oberle, E., Durlak, J. A., & Weissberg, R. P. (2017). Promoting positive youth development through school-based social and emotional learning interventions: A meta-analysis of follow-up effects. *Child Development, 88*(4), 1156–1171. doi:10.1111/cdev.12864","82 programmes, 97,406 students; follow-ups from 6 months to 18 years, benefits similar across race, SES and school location."],
    ["Belfield, C., Bowden, A. B., Klapp, A., Levin, H., Shand, R., & Zander, S. (2015). The economic value of social and emotional learning. *Journal of Benefit-Cost Analysis, 6*(3), 508–544. doi:10.1017/bca.2015.55","Average 11:1 benefit–cost ratio across six programmes."],
    ["CASEL. *The CASEL Framework: Five core social and emotional competencies.* Collaborative for Academic, Social, and Emotional Learning. casel.org","The five-competency mapping quoted to schools."],
    ["Frattaroli, J. (2006). Experimental disclosure and its moderators: A meta-analysis. *Psychological Bulletin, 132*(6), 823–865.","146 randomised studies, average r = .075 — the reason the expressive-writing claim is marked “say it carefully”."],
    ["Berkowitz, M. W., & Bier, M. C. (2005). *What Works in Character Education: A Research-Driven Guide for Educators.* Character Education Partnership.","109 studies; the features effective character programmes share — the basis for positioning Groundwork as a spine, not a substitute."],
    ["Duke, M. P., Lazarus, A., & Fivush, R. (2008). Knowledge of family history as a clinically useful index of psychological well-being and prognosis: A brief report. *Psychotherapy: Theory, Research, Practice, Training, 45*(2), 268–272.","Knowing more family stories goes with higher self-esteem and a stronger sense of control — Mission 3's conversation."],
    ["Habermas, T., & Bluck, S. (2000). Getting a life: The emergence of the life story in adolescence. *Psychological Bulletin, 126*(5), 748–769.","Finding one theme across your life mostly arrives in late adolescence — why Year 7–9 get more concrete versions of the Through-Line, the story sentence and the yearly paragraph."],
    ["Australian Curriculum, Assessment and Reporting Authority (ACARA). (2022). *Australian Curriculum: Health and Physical Education, Version 9.0*, and the general capabilities. australiancurriculum.edu.au","The HPE content descriptions and capabilities in the curriculum line; codes checked October 2026."],
    ["Australian Government Department of Education. (2018). *The Australian Student Wellbeing Framework.* Education Services Australia. studentwellbeinghub.edu.au","The five elements and effective practices Groundwork is mapped against."],
  ].flatMap(([t, n], i) => ref(i + 1, t, n)),
  rule(),
  p("Internal marketing guide. Product facts are drawn from the Groundwork repository — docs/frameworks.md, docs/curriculum-alignment.md, src/lib/missions.ts, src/lib/program.ts, src/lib/standard.ts and src/lib/spine.ts — and reflect the build as at October 2026. Re-check the claim ladder in section 7 whenever the product changes.", { size:18, color:FAINT }),
  p("Groundwork is not a therapy app and should never be marketed as one. The Kids Helpline number surfaced in the product (1800 55 1800) is Australian; localise before marketing in another region.", { size:18, color:FAINT }),
);

// ── Assemble ─────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Groundwork",
  title: "Groundwork Marketing Guide",
  description: "Messaging, benefit arguments and checked research citations for the four missions and the ten-week Character Program.",
  numbering: { config: [{ reference:"gw-bullets", levels:[{
    level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT,
    style:{ paragraph:{ indent:{ left:convertInchesToTwip(0.3), hanging:convertInchesToTwip(0.18) } } } }] }] },
  styles: { default: { document: { run:{ font:SANS, size:20, color:INK }, paragraph:{ spacing:{ line:276 } } } } },
  sections: [{
    properties: { page: { margin: { top:1440, right:1440, bottom:1440, left:1440 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Groundwork-Marketing-Guide.docx");
  fs.writeFileSync(out, buf);
  console.log("wrote", out, `(${buf.length} bytes)`);
});
