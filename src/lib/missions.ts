export interface Activity {
  id: string;
  type:
    | "journal"
    | "values_picker"
    | "challenge"
    | "milestone_letter"
    | "strengths_assessment";
  title: string;
  subtitle: string;
  prompt: string;
  secondaryPrompt?: string;
  isMilestone?: boolean;
  isChallenge?: boolean;
  challengeDebriefDays?: number;
  /**
   * When set, this step cites the user's previously-diagnosed strengths and/or
   * values, so the server injects their actual VIA signature strengths / chosen
   * values into the activity (rendered as a compass card + inline reminder).
   */
  referencesStrengths?: boolean;
  referencesValues?: boolean;
  valuesOptions?: string[];
  valuesCount?: number;
  locked?: boolean;
  /** Context paragraph — why this step matters in the journey */
  intro?: string;
  /** An easier lead-in question to warm up before the main prompt */
  warmUp?: string;
  /** Index (0-based) of this mission's story to surface before this activity */
  storyBefore?: number;
  /** Numbered sub-questions that break the main prompt into smaller, guided steps */
  scaffoldingSteps?: string[];
  /**
   * Concrete, relatable scenarios shown *before* each question to help teens
   * who "don't know what they don't know" recognise themselves in a situation
   * rather than introspect from a blank page. Aligned 1:1 by index with
   * scaffoldingSteps (scenarios[i] sets up scaffoldingSteps[i]). For
   * values_picker activities, rendered as priming cards above the grid.
   * Optional — only Mission 1 uses these, so other missions are unaffected.
   */
  scenarios?: string[];
  /**
   * Shown on the done screen: what the teen just discovered about themselves
   * and how it leads into the next step. Keeps the journey feeling like a
   * journey instead of disconnected worksheets.
   */
  wrapUp?: string;
  /**
   * Multiple-choice answers for "Starter" mode, aligned 1:1 by index with
   * scaffoldingSteps (starterOptions[i] are the choices for scaffoldingSteps[i]).
   * In Starter mode (the default) the teen picks the option they align with most
   * instead of writing; Advanced mode opens the open-ended textarea. A
   * "Something else" path is always offered on top of these so nobody is boxed
   * in. Optional — only Mission 1 authors these.
   */
  starterOptions?: string[][];
  /**
   * Extra conceptual context shown to Informational-style users.
   * Explains the psychological or research basis for the activity.
   */
  whyItMatters?: string;
  /** Estimated time to complete the activity */
  timeEstimate?: string;
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  question: string;
  description: string;
  colour: string;
  /** Lighter companion shade for decorative gradients/tints */
  colourLight: string;
  textColour: string;
  activities: Activity[];
  /** Identity development phase from Erikson's framework */
  phase: "exploration" | "commitment" | "integration";
  /** Short phase label shown in UI */
  phaseLabel: string;
  /** One-sentence description of what this phase involves */
  phaseDescription: string;
}

export const VALUES_LIST = [
  "Courage",
  "Kindness",
  "Honesty",
  "Creativity",
  "Loyalty",
  "Fairness",
  "Growth",
  "Family",
  "Independence",
  "Humour",
  "Compassion",
  "Adventure",
  "Justice",
  "Faith",
  "Discipline",
  "Connection",
  "Curiosity",
  "Service",
  "Resilience",
  "Authenticity",
];

/**
 * Definitions for all 20 values — used wherever values are presented
 * so users always understand what they're choosing.
 */
export const VALUES_WITH_DEFINITIONS: Record<string, string> = {
  Courage:
    "Acting despite fear, not in the absence of it. Whether it's speaking up in a room that disagrees with you, trying something you might fail at, or letting someone actually see how you feel.",
  Kindness:
    "Choosing warmth and generosity, especially when it costs you something. It shows up in the small moments: the text you didn't have to send, the extra patience, the willingness to put someone else first.",
  Honesty:
    "Telling the truth — to others and to yourself. It's more than not lying. It's the hard feedback you give, the uncomfortable things you admit, and not pretending everything's fine when it isn't.",
  Creativity:
    "Finding new ways to see, solve, and express. You don't just accept the obvious answer — you ask what else is possible, and you're willing to make something imperfect rather than make nothing at all.",
  Loyalty:
    "Standing by the people and commitments you care about, even when it's inconvenient or costs you something.",
  Fairness:
    "The conviction that everyone deserves to be treated with equal dignity. When you see unfairness, it bothers you — and you believe it's worth speaking up, even when it isn't your fight.",
  Growth:
    "The belief that where you are now isn't where you have to stay. You're drawn to discomfort, feedback, and challenge — not because they're fun, but because they're how you actually move forward.",
  Family:
    "The people closest to you — by blood or by bond — are at the centre of what you care about. Their wellbeing matters deeply, and your relationships with them shape a lot of who you are.",
  Independence:
    "Trusting your own judgment and carving your own path, rather than needing others to define your direction for you.",
  Humour:
    "Finding the lightness in life, even in difficult moments. You use laughter to connect, to cope, and to keep perspective — and you believe that not taking everything too seriously is a kind of wisdom.",
  Compassion:
    "Feeling what others feel, and being moved to do something about it. Not sympathy from a distance — a genuine pull toward people who are struggling, and the impulse to actually help.",
  Adventure:
    "Seeking out new experiences and being willing to go where you haven't been before — physically, mentally, or emotionally.",
  Justice:
    "The belief that wrongs should be made right, and that being a bystander to unfairness isn't neutrality — it's a choice.",
  Faith:
    "Trusting in something larger than yourself — whether that's a spiritual belief, a community, or a set of principles that holds you steady.",
  Discipline:
    "Showing up and doing the work even when motivation has run out — because consistency matters more than inspiration.",
  Connection:
    "Building genuine relationships where you're truly known and you truly know others — not just surrounded by people, but actually seen.",
  Curiosity:
    "A genuine hunger to understand — people, ideas, how things work, why the world is the way it is. You ask questions not to seem smart, but because you actually want to know the answers.",
  Service:
    "Finding meaning in contributing to others — whether in small daily acts or bigger commitments to a community or cause.",
  Resilience:
    "Getting back up — not because the hard thing didn't hurt, but because you don't let it define you. You bend, you feel it fully, and then you find a way through. Again and again.",
  Authenticity:
    "Showing up as yourself, not a version shaped by what others expect. It means saying what you actually think, living by what you actually believe, and refusing to perform a role that isn't yours.",
};

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Identity",
    subtitle: "Mission 1",
    question: "Who am I becoming?",
    phase: "exploration",
    phaseLabel: "Phase 1 — Exploration",
    phaseDescription:
      "Looking inward without pressure to have it figured out yet.",
    description:
      "Identity has three layers worth knowing: your inner compass (the self you feel from the inside), your public self (the version you show others), and your social self (the groups that shape who you are). This mission explores all three — mapping your strengths, naming what you value, and examining the gap between who you feel you are and who you present yourself to be. There are no right answers. The goal is honest self-knowledge, not a finished picture.",
    colour: "#4F46E5",
    colourLight: "#6366F1",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "strengths-mapping",
        wrapUp:
          "Those are your signature strengths — the ones that fire up most naturally for you, out of all 24. They’re the first half of your inner compass, and the app will point back to them from here on. Next: the other half — the values underneath why those strengths matter to you.",
        type: "strengths_assessment",
        title: "Strengths Mapping",
        subtitle: "Step 1 of 5 · Inner compass",
        intro:
          "Here’s the plan for this mission: build your inner compass, test it, then write it down. Your compass has two halves — strengths (what you’re naturally good at) and values (what actually matters to you). This step maps the first half. Psychologists have found that everyone’s character is a mix of the same 24 strengths — you just have more of some than others. Nobody can rank their own cold, so instead you’ll react to 12 quick everyday situations. Your reactions do the ranking for you.",
        warmUp:
          "For each situation, tap the option that’s MOST like you, then the one that’s LEAST like you. Go with your gut — there are no wrong answers, and no one else sees this. It takes about 5 minutes.",
        prompt:
          "React to 12 everyday situations to discover your top character strengths — the ones that come most naturally to you.",
        whyItMatters:
          "This is based on the VIA Classification of Character Strengths (Peterson & Seligman) — 24 strengths grouped under six virtues, found across cultures worldwide. Research shows that knowing and using your top ‘signature’ strengths predicts higher wellbeing, engagement, and resilience. This is a quick indicative snapshot to surface your signature strengths — not the full clinical survey — but it’s enough to start steering by.",
        timeEstimate: "About 5 minutes",
      },
      {
        id: "values-clarifier",
        wrapUp:
          "Those five values are the other half of your inner compass. Strengths are what you're good at; values are what you refuse to trade away. Together they're what steady decisions get made from. Next, we stress-test the compass: the rooms where you show all of it, and the rooms where you hide some.",
        type: "values_picker",
        title: "Values Clarifier",
        subtitle: "Step 2 of 5 · Inner compass",
        intro:
          "Strengths were the first half of your inner compass — this is the second half. Values are what you refuse to trade away, and together with your strengths they're what you'll steer by for the rest of this journey. 'What are your values?' is impossible to answer cold, so read the situations below first. Notice which ones tug at you — which make you go 'I'd hate that' or 'that'd really bother me'. That reaction is a value showing itself.",
        warmUp:
          "You don't have to relate to all of these — just notice which ones pull at something in you. That pull is the clue.",
        scenarios: [
          "You find out a friend has been quietly spreading something untrue about another friend. Calling it out could cost you — but staying quiet doesn't sit right either. What's the part of you that won't let it go?",
          "Two free Saturdays, two versions of you. One stays in, deep into something you love, totally absorbed and happy on your own. The other is out, around people, in the middle of everything. Which one feels more like a good day — and what does that say you need?",
          "An adult you respect breaks a promise to you and never mentions it again. It stings more than you expected. Which part stings most — the unfairness, the broken trust, the not being taken seriously?",
          "You're handed the chance to do something new that you might genuinely be bad at in front of people. Part of you wants to run. Part of you is curious. Which part usually wins — and how do you feel about that?",
        ],
        prompt:
          "Values can feel like a big, abstract word — so don't try to name yours from a blank page. Read the situations below first and notice which ones pull at something in you. Then choose the five values that feel most true — not the ones you think you should have.",
        valuesOptions: VALUES_LIST,
        valuesCount: 5,
        whyItMatters:
          "Self-determination theory — one of the most replicated frameworks in psychology — finds that people who act from their own values (rather than external pressure) consistently report higher wellbeing, more resilient motivation, and more stable behaviour over time. Knowing your values isn't just clarifying. It changes what you actually do, especially under pressure.",
        timeEstimate: "About 8 minutes",
      },
      {
        id: "mask-check",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "You just tested your compass against the real world \u2014 and found where it gets dimmed: which parts of you stay hidden in which rooms, and what that costs. That gap is exactly why the next step matters: a letter from the real you, to the real you, with nobody else in the room.",
        type: "journal",
        title: "The Mask Check",
        subtitle: "Step 3 of 5 · Your public self",
        intro:
          "Your compass is built — strengths mapped, values chosen. Now we test it against the real world. Everyone wears slightly different versions of themselves in different rooms — that's normal, not fake. The question is which parts of your compass make it into every room, and which get hidden. The moments below will show you.",
        warmUp:
          "This isn't about catching yourself being fake. Everyone adjusts. We're just looking at where the gap is biggest — because that's where the most interesting stuff usually is.",
        storyBefore: 0,
        prompt:
          "Think about who you are at school, at home, and with your closest friends. Where do you feel most like yourself? Where do you feel like you're performing?",
        secondaryPrompt:
          "What would it look like to bring a little more of the real you into one of those spaces?",
        scenarios: [
          "Same joke, three rooms. Something funny pops into your head. With your closest friends you'd say it one way. In class you'd say a watered-down version, or read the room and not bother. At a family dinner you might not say it at all.",
          "There's a part of you that mostly only exists when you're completely alone — something you think about, like, make, or care about that almost nobody around you knows is there. Not a dark secret, just a part that stays private.",
          "You're scrolling and you catch yourself posting — or almost posting — something. Then you delete it, or change it, because of how it might land. That tiny edit is the gap between the inside you and the outside you, happening in real time.",
          "One place or person — a friend, a group, a team, even a single person — where you don't quietly brace yourself before walking in. You're just already you.",
        ],
        scaffoldingSteps: [
          "Pick two of those rooms. How does the 'you' that shows up actually change between them — your volume, your opinions, how much you let show?",
          "What's one part of you that stays mostly hidden? You don't have to reveal it in detail — just name that it's there and where it lives.",
          "What were you protecting in that moment — what did you think might happen if you'd left it as it was? What does that fear cost you over time?",
          "What's different about that place or person? What do they give you that the harder rooms don't — and what would it take to feel a little more of that elsewhere?",
        ],
        starterOptions: [
          [
            "I get louder and more myself with close friends",
            "I go quieter and more careful in some rooms",
            "I act more grown-up or 'sorted' than I feel",
            "I hide my real opinions to keep the peace",
            "Honestly, I'm pretty much the same everywhere",
          ],
          [
            "A creative side most people don't see",
            "How much I actually care about things",
            "Worries or pressure I keep to myself",
            "An interest I think others would judge",
            "A softer, more sensitive side",
          ],
          [
            "Being judged or laughed at",
            "Looking like I'm trying too hard",
            "Being seen as 'too much' or 'too intense'",
            "Letting people down or disappointing them",
            "Not really sure — it's just a habit",
          ],
          [
            "They accept me without me explaining myself",
            "No pressure to perform or impress",
            "We share the same humour or interests",
            "I trust them not to judge me",
            "They knew me before I started masking",
          ],
        ],
        whyItMatters:
          "Psychologists call the gap between your private and public self 'self-monitoring'. Some gap is normal and healthy — we all adapt to context. But when the gap gets very large, it tends to correlate with higher anxiety and a fragmented sense of identity. This activity isn't about eliminating the gap. It's about seeing it clearly so you can decide — consciously — where you want to close it.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "identity-letter",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "That letter is the truest snapshot of you that exists anywhere \u2014 compass, masks and all. Nobody can mark it, judge it, or take it. Future-you will read it on a day they need it. One thing left: living one small piece of it out loud.",
        type: "milestone_letter",
        title: "Identity Letter",
        subtitle: "Step 4 of 5 · Milestone",
        intro:
          "You've explored your inner compass — your strengths and values. You've examined your public self — where you perform versus where you're real. You've started to notice your social self — where you feel genuinely known versus where you belong on the surface. Now comes the step that holds all three together. This letter asks you to speak directly to yourself about who you actually are right now — and who you sense you're becoming.",
        warmUp:
          "You've already done the hard noticing in the last three steps. This letter just gathers it up. Write it to yourself as 'you' — it's private, permanent, and only ever for you.",
        storyBefore: 1,
        prompt:
          "Write a short letter to yourself — not who you think you should be, but who you actually are right now. Be honest. Be kind.",
        secondaryPrompt:
          "This letter is private. Nobody else will ever read it. That's the whole point.",
        isMilestone: true,
        scenarios: [
          "Someone your age has just moved here and knows literally nothing about you — not your grades, not your socials, not what you look like. You get one conversation to tell them who you actually are.",
          "It's a hard day, a year from now. Future-you is reading this letter looking for something to hold onto. They need a reminder of something true about who you are right now.",
          "Think of a recent moment you're not proud of — everyone has them. Not to beat yourself up. Just to be honest that you're a work in progress, like everyone.",
          "The kindest person who really knows you is asked to describe you in one honest sentence. They don't flatter you — they just see you clearly.",
        ],
        scaffoldingSteps: [
          "What would you want them to understand about you first — your personality, your quirks, what actually matters to you, not your achievements?",
          "What's the true thing future-you might need reminding of on that hard day?",
          "What does that moment quietly tell you about something you're still working on — said kindly, the way you'd say it to a friend?",
          "What's their one sentence — and is it something you'd struggle to say about yourself? Try saying it anyway.",
        ],
        starterOptions: [
          [
            "I'm loyal — I show up for the people I care about",
            "I'm curious — I love figuring things out",
            "I'm creative — I'm always making or imagining",
            "I'm thoughtful — I notice and feel things deeply",
            "I'm determined — I don't give up easily",
          ],
          [
            "This hard feeling won't last forever",
            "You've gotten through hard things before",
            "You are more than this one bad day",
            "The people who love you are still there",
            "It's okay to not be okay right now",
          ],
          [
            "I'm learning to be kinder to myself",
            "I'm working on speaking up for what I need",
            "I'm learning it's okay to ask for help",
            "I'm working on not comparing myself to others",
            "I'm learning to handle big feelings better",
          ],
          [
            "You're a genuinely good person",
            "You're stronger than you give yourself credit for",
            "You matter to more people than you realise",
            "You're worth knowing, exactly as you are",
            "You're doing better than you think",
          ],
        ],
        whyItMatters:
          "Writing about yourself in the second person — addressing yourself as 'you' — activates a different kind of self-awareness than thinking in the first person does. Studies on expressive writing show it can reduce self-criticism, increase clarity about values, and help consolidate fragmented self-perceptions into a more coherent sense of identity. The letter format isn't arbitrary — it works.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "weekly-challenge",
        referencesStrengths: true,
        wrapUp:
          "Accepting is the whole step \u2014 you've just turned self-knowledge into an experiment. Whatever happens this week is data, not a grade. Come back in a few days and tell yourself the truth about how it went.",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
        intro:
          "Everything so far has been noticing. This step is one small experiment in the real world — taking one thing you discovered about yourself and actually living it once, just to see what it feels like. You don't need to be certain and it doesn't need to go well. Noticing what happens is the whole point.",
        prompt:
          "Pick ONE small experiment for this week — whichever one made you go 'ugh, maybe':\n\n• Say the toned-down thing at full volume once — voice an opinion in a room where you'd normally stay quiet.\n• Let one person see a hidden part — show someone a thing you make, think, or care about that you usually keep private.\n• Use a strength on purpose — put the thing you're naturally good at to use in a situation that isn't asking for it.\n• Spend an hour on the 'good day' version of you — do the thing that energises you, guilt-free, and pay attention to how it feels.\n\nPick one. Keep it small. Just notice what happens.",
        isChallenge: true,
        challengeDebriefDays: 7,
        timeEstimate: "5 minutes to start",
      },
    ],
  },
  {
    id: 2,
    title: "Purpose",
    subtitle: "Mission 2",
    question: "What do I care about?",
    phase: "commitment",
    phaseLabel: "Phase 2 — Commitment",
    phaseDescription:
      "Moving from self-knowledge to conscious choices about what matters.",
    description:
      "Mission 1 helped you map who you are. This mission asks the next question: given who you are, what in the world actually pulls you? Purpose isn't found — it's built, gradually, from the intersection of your inner compass and the things you can't ignore. This mission moves through three dimensions: the cause that genuinely matters to you, the particular contribution you could make to it, and the people who share your care. The goal isn't a plan. It's a commitment.",
    colour: "#0E7490",
    colourLight: "#0891B2",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "what-matters",
        wrapUp:
          "You've named the thing that actually pulls at you \u2014 not what you're supposed to care about, what you genuinely do. That pull is where purpose starts for everyone. Next: working out what you, specifically, could bring to it.",
        scenarios: [
          "You're scrolling before bed. Post after post slides past \u2014 then one story stops your thumb. It sits in your chest a bit heavier than the rest, and you're still thinking about it when you put the phone down.",
          "School assembly. A guest speaker is telling their story. Most of the room is half-listening, but something about this person has actually got you \u2014 and a week later, you still remember them.",
          "Imagine it's ten years from now and you bump into a mate from school. They ask what you've been up to \u2014 and you get to say one thing that makes you quietly proud.",
          "Look back at what stopped your thumb, who got your attention, and what you'd want to be proud of. Line them up like clues.",
        ],
        starterOptions: [
          [
            "People being treated unfairly when they did nothing wrong",
            "The planet or animals being wrecked and ignored",
            "Bullying, cruelty, or people being humiliated",
            "People stuck with no real chance to get ahead",
            "People struggling alone when nobody checks on them",
          ],
          [
            "They stood up for something when it was easier to stay quiet",
            "They built something real starting from nothing",
            "They quietly helped people without wanting credit",
            "They got seriously good at a craft they loved",
            "They stayed kind through things that would break most people",
          ],
          [
            "I made life genuinely better for the people around me",
            "I stood up for something that needed defending",
            "I made things \u2014 that people actually use or love",
            "I helped fix a problem most people walked past",
            "I helped a few people who really needed it",
          ],
          [
            "I keep coming back to fairness \u2014 things being made right",
            "I'm pulled toward protecting people, animals, or places",
            "I want to build and improve things",
            "I care most about people being seen and backed up",
            "I'm drawn to courage \u2014 people who act, not just talk",
          ],
        ],
        type: "journal",
        title: "What Matters",
        subtitle: "Step 1 of 5 · Your motivated self",
        intro:
          "Mission 1 was about looking inward — who you are, what you value, where you're most yourself. This mission turns that inward knowledge outward. Purpose often starts not with a grand vision, but with a quiet anger or a persistent pull — something in the world that bothers you, or something you find yourself drawn back to again and again. This step is about naming that thing honestly.",
        warmUp:
          "Think about the last time you felt genuinely bothered by something in the world — not just inconvenienced, but actually troubled. Hold that feeling in mind before you write. That's usually where purpose begins.",
        storyBefore: 0,
        prompt:
          "Write about something that genuinely matters to you — a problem in the world, a person you admire, a cause you care about. Why does it matter?",
        scaffoldingSteps: [
          "What's a problem in the world — local or global — that actually bothers you? Not one you feel you should care about, but one you actually do.",
          "Is there a person you admire — real or historical — whose life or work pulls you toward something? What is it about them?",
          "When you think about your future, what kind of impact, however small, would feel meaningful?",
          "What do all of these have in common? What does that tell you about what you're actually oriented toward?",
        ],
        whyItMatters:
          "Researcher William Damon distinguishes between being 'engaged' (doing things) and being 'purposeful' (knowing why). Purposeful adolescents are more resilient under pressure and report significantly higher wellbeing — not because their lives are easier, but because they have a direction. The quiet anger or persistent pull you feel about something isn't random. It's identity data, pointing you somewhere specific.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "contribution-map",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "You just connected your inner compass from Mission 1 to the thing you care about. That's the difference between 'someone should do something' and 'I've actually got something to offer'. Next: discovering you're not the only one who cares.",
        scenarios: [
          "Your school is running a big fundraiser for a cause. At the first meeting, jobs get handed out \u2014 posters, speeches, budgets, the group chat, the actual event. You look at the list, and one job quietly has your name on it.",
          "Think about the cause you named in Step 1. Now imagine you're right there, in the middle of it \u2014 at the beach clean-up, the food drive, the campaign, whatever it is. A moment happens where something in you switches on.",
          "The organisers pull you aside: 'We've got heaps of helpers. What we don't have is someone who can do the thing YOU do.' What's the thing?",
          "It's this Saturday morning. You've got two free hours and zero excuses. The smallest real version of your contribution is sitting right there.",
        ],
        starterOptions: [
          [
            "The organising \u2014 I'd sort the plan and keep it moving",
            "The creative stuff \u2014 posters, videos, the vibe",
            "The talking \u2014 getting people to actually care",
            "The behind-the-scenes work nobody sees but everyone needs",
            "The people side \u2014 making the team work together",
          ],
          [
            "Seeing it up close makes it real \u2014 I have to do something",
            "I get ideas immediately \u2014 ways it could work better",
            "I go steady and practical while others get overwhelmed",
            "I end up talking to people \u2014 hearing their stories",
            "I can't switch off from it afterwards \u2014 it stays with me",
          ],
          [
            "I notice what others miss",
            "I don't give up when it gets boring or hard",
            "I can make people feel welcome and included",
            "I can take something messy and give it order",
            "I can make something people actually want to look at",
          ],
          [
            "Show up to one local thing and just help",
            "Make one thing \u2014 a post, a poster, a video",
            "Have one real conversation about it with someone",
            "Give one hour of the skill I already have",
            "Learn one thing properly so I'm more useful next time",
          ],
        ],
        type: "journal",
        title: "The Contribution Map",
        subtitle: "Step 2 of 5 · Your motivated self",
        intro:
          "Knowing what matters to you is one thing. The next question is more specific: what do you, in particular, have to contribute to it? Purpose built from your actual strengths is more durable than purpose chosen at random — because it connects who you are to what you do. This step draws that line. If you're not sure yet — that's a valid answer too. Write about where you're uncertain, not just where you're confident.",
        warmUp:
          "Look back at the strengths you mapped and the values you chose in Mission 1. If those things had a direction — if your inner compass was pointing somewhere — what would that direction be? Does it point toward what you wrote about in Step 1?",
        prompt:
          "What's the connection between who you are and what you care about? How do your particular strengths and values fit the thing that matters to you?",
        scaffoldingSteps: [
          "Look at the strengths you identified in Mission 1. How might they be genuinely useful in relation to what you care about — even in a small way?",
          "Look at the values you chose. Which ones feel most alive when you think about the problem or cause from Step 1?",
          "Is there a kind of contribution — however small — that only you, with your particular inner compass, could make to this?",
          "What would even a tiny version of that contribution look like in practice?",
        ],
        whyItMatters:
          "Studies on youth purpose consistently find that the most durable form isn't 'I want to help people' — it's 'I have something specific to contribute.' Generic caring fades under pressure; specific contribution becomes part of identity. This is why connecting your particular strengths to a particular problem is more powerful than choosing a cause at random. Purpose that fits who you are tends to stick.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "the-other-side",
        wrapUp:
          "Knowing other people care about this too doesn't make your caring less special \u2014 it makes it more real, and much harder to give up on. Purpose with people attached lasts. Now you're ready to say it like you mean it.",
        scenarios: [
          "After class, you notice someone stayed back to help with the exact kind of thing you care about \u2014 no audience, no credit. You'd never really talked to them before.",
          "You go looking online and it turns out there's a whole community around your cause \u2014 local groups, global movements, people who've been at it for years.",
          "You get added to a group chat of people working on this thing. The energy is different: everyone actually cares. Nobody's pretending it's not cool to try.",
          "Picture yourself a year from now, properly connected to some of these people. What would your place in that group be?",
        ],
        starterOptions: [
          [
            "A friend who cares more than they let on",
            "A family member who's quietly been doing this for years",
            "A teacher or coach who lights up about it",
            "Someone at school I've never properly talked to",
            "Honestly \u2014 I haven't found anyone yet, and I'd like to",
          ],
          [
            "It's bigger than I thought \u2014 that's encouraging",
            "It's already organised \u2014 I could actually join something",
            "Other people my age are doing it, not just adults",
            "People have made real progress \u2014 it's not hopeless",
            "It makes my caring feel less weird and more normal",
          ],
          [
            "Relieved \u2014 it's not just me",
            "More serious about it \u2014 like it counts now",
            "A bit nervous \u2014 these people are really committed",
            "Energised \u2014 caring is easier with company",
            "Seen \u2014 like a hidden part of me makes sense here",
          ],
          [
            "The reliable one who always shows up",
            "The one with ideas nobody else thought of",
            "The one who welcomes new people in",
            "The one who keeps everyone going when it gets hard",
            "The quiet one doing solid work in the background",
          ],
        ],
        type: "journal",
        title: "The Other Side",
        subtitle: "Step 3 of 5 · Your people",
        intro:
          "Purpose gets real when you realise you're not alone in caring. There are people — in your life, in history, in communities you haven't found yet — who care about the same things you do. This step asks you to find one of them and pay attention to what their story tells you about yours.",
        warmUp:
          "Think of one person — someone you know, someone you've read about, or a historical figure — who has built part of their life around something you care about. Not necessarily someone famous. Just someone who has taken this kind of thing seriously. What do you know about what drove them?",
        storyBefore: 1,
        prompt:
          "Who else cares about what you care about? Find one person — in your life, in a story, in history — who is connected to what matters to you. What does their experience tell you about your own?",
        scaffoldingSteps: [
          "Who in your personal life — even loosely — cares about the same thing? A friend, family member, teacher, or someone you've noticed?",
          "Is there a community, movement, or group that exists around this cause? What do you know about it?",
          "What does it feel like to know that others care about this too — not just you? Does it change how seriously you take your own caring?",
          "Is there a kind of person you'd want to be connected to through this cause? What would that community look like, and what would your place in it be?",
        ],
        whyItMatters:
          "Purpose supported by community is significantly more durable than individual conviction alone. Research on purposeful adolescents finds that mentors, peers, and even historical figures who model a cause are often the critical factor in whether purpose becomes action or stays aspiration. Knowing you're not alone in caring about something isn't just comforting — it changes how seriously you take it, and how long it lasts.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "commitment-statement",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "You put it in writing: what you stand for and why it's yours. That's a commitment, not a contract \u2014 it's allowed to grow and change with you. Last step: acting on it once, in the real world, this week.",
        scenarios: [
          "There's a wall of causes at school, each with one sentence and a name signed under it. Yours is going up where people you know will read it.",
          "A good friend catches you working on this and asks, genuinely: 'Why do you care so much about that?' They're not mocking you \u2014 they actually want to know.",
          "Someday someone will laugh at this or tell you it's pointless. Picture that moment \u2014 and picture yourself not folding.",
          "Ten years from now, you find this exact statement in an old file. You read it as the person you've become.",
        ],
        starterOptions: [
          [
            "I stand for people getting a fair go",
            "I stand for protecting what can't protect itself",
            "I stand for building things that make life better",
            "I stand for nobody having to struggle alone",
            "I stand for telling the truth even when it's awkward",
          ],
          [
            "Because I've seen what happens when nobody cares",
            "Because it connects to who I actually am",
            "Because I can't un-see the problem now",
            "Because someone did this for me once",
            "Because if people like me don't, who will?",
          ],
          [
            "I'd remind myself why it matters and keep going",
            "I'd rather care openly than pretend to care about nothing",
            "Their opinion doesn't get a vote on my values",
            "I'd let the work answer for me",
            "It would sting \u2014 and I'd still not stop",
          ],
          [
            "I hope I'm still working on it, further down the road",
            "I hope I remember this is where it started",
            "I hope I never became someone who stopped caring",
            "I hope I can tell them it grew into something real",
            "I hope I'm proud of the person who wrote it",
          ],
        ],
        type: "milestone_letter",
        title: "Commitment Statement",
        subtitle: "Step 4 of 5 · Milestone",
        intro:
          "You've named what matters to you. You've mapped the connection between who you are and what you care about. You've seen that others share this care. Now comes the step that moves from exploring to committing — not with certainty, not permanently, but with enough conviction to say: this is mine. I'm going to take this seriously. This is the difference between interest and purpose.",
        warmUp:
          "Think about what it would mean to genuinely commit to this — not as a project or a task, but as part of who you are and what you stand for. What would change if you took it seriously? Sit with that for a moment before you write.",
        storyBefore: 1,
        prompt:
          "Write a commitment statement — a clear, personal declaration of what you care about and why. Not a plan. Not a promise to the world. Just an honest statement of what you're standing for.",
        isMilestone: true,
        scaffoldingSteps: [
          "Name what you care about as clearly and specifically as you can. Not 'I care about the environment' — something more particular to you.",
          "Link it explicitly to who you are: how do your strengths or values from Mission 1 connect to this?",
          "What kind of person do you want to be in relation to this — not what you'll do, but who you'll be?",
          "What would you want someone reading this to understand about why it genuinely matters to you?",
        ],
        whyItMatters:
          "Research on identity development finds that articulating a commitment — even privately, before acting on it — significantly increases psychological investment and follow-through. This isn't superstition. It's the mechanics of how belief becomes identity: the moment you say 'this is mine,' something shifts. The commitment doesn't have to be certain or permanent. It just has to be honest.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "purpose-challenge",
        referencesStrengths: true,
        wrapUp:
          "Challenge accepted. Purpose only becomes real when it costs you a little effort \u2014 this week you'll find out what one small act in its direction feels like.",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
        intro:
          "Commitment isn't proven by what you say — it's tested by what you actually do. This challenge asks you to take one real step toward what you care about. Not a grand gesture. Just the smallest version of genuine engagement that feels real to you.",
        prompt:
          "This week, do one concrete thing that connects you to what you care about. It could be learning more, talking to someone, showing up somewhere, making something, or helping in a small way. The action matters less than the fact that you actually did it.",
        isChallenge: true,
        challengeDebriefDays: 7,
        timeEstimate: "5 minutes to start",
      },
    ],
  },
  {
    id: 3,
    title: "Connection",
    subtitle: "Mission 3",
    question: "Where do I belong?",
    phase: "commitment",
    phaseLabel: "Phase 2 — Commitment",
    phaseDescription:
      "Understanding how your relationships shape and reflect who you are.",
    description:
      "Mission 2 asked what you care about in the world. This mission turns toward the people you care about — and the ones who've shaped you without you fully realising it. Your social identity isn't just about being in groups. It's about where you feel genuinely known, what makes connection real rather than just convenient, and who — across ease and difficulty — has left something lasting in you. This mission examines all three.",
    colour: "#15803D",
    colourLight: "#16A34A",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "belonging",
        wrapUp:
          "You've just worked out where you're actually known versus just around people \u2014 most adults never name that difference. Next we sharpen it further: the difference between fitting in and belonging.",
        scenarios: [
          "There's one place you walk into and something in your shoulders drops. You don't check the room before you speak. You just... arrive.",
          "Watch what the people in that place actually do. There's something specific about how they treat you that makes it safe to be all of you.",
          "Now the opposite: there's a table, a group, a room where you're technically included \u2014 but you're always slightly on guard, slightly editing.",
          "Based on your real experience \u2014 not the movies \u2014 what actually turns 'being around people' into belonging?",
        ],
        starterOptions: [
          [
            "One friend's place where I'm basically family",
            "My own crew \u2014 the group that just gets me",
            "Home, or one particular person at home",
            "A team, club, or activity where I make sense",
            "Honestly, nowhere fully yet \u2014 I'm still looking",
          ],
          [
            "They take the mick but never about the real stuff",
            "They notice when I'm off and actually ask",
            "I can be quiet there without it being weird",
            "They've seen me at my worst and stayed",
            "They want my actual opinion, not agreement",
          ],
          [
            "A friend group where I'm the optional extra",
            "A class where I play a character",
            "A team where I'm only worth my performance",
            "Family gatherings where I edit myself",
            "Online spaces where I'm always performing",
          ],
          [
            "Being known \u2014 not just liked",
            "Not having to earn your place every single day",
            "People staying when you stop being fun",
            "Being missed when you're not there",
            "Safety to disagree and still belong",
          ],
        ],
        type: "journal",
        title: "Where You Belong",
        subtitle: "Step 1 of 5 · Your social self",
        intro:
          "Missions 1 and 2 were mostly about you — your inner compass, your values, your purpose. This mission turns outward. Identity doesn't develop in isolation — it's built in relationship with others, and it's reflected back by the people around you. This first step is about finding the relationships where that reflection is clearest: where you feel most genuinely yourself, not most comfortable or most accepted, but most real.",
        warmUp:
          "Think about the last time you were with someone and felt completely at ease — no managing yourself, no performing, just present. Who were you with, and what made that possible?",
        storyBefore: 0,
        prompt:
          "Think about the people in your life who make you feel most like yourself. What is it about those relationships that matters?",
        scaffoldingSteps: [
          "Think of a person or group where you feel genuinely accepted — not just tolerated. Who are they, and what's that relationship like?",
          "What is it about those people that lets you show up as yourself? What do they do, or not do, that makes that possible?",
          "Is there somewhere you feel like you don't quite fit, or you're still searching for your people? What does that feel like to sit with?",
          "What does belonging actually require, based on your experience? What makes it different from just being around people?",
        ],
        whyItMatters:
          "Social identity theory identifies our sense of belonging within groups as one of the core pillars of a stable identity — but not all group membership provides genuine belonging. Research consistently finds that feeling authentically known by others (not just accepted) is one of the strongest predictors of adolescent wellbeing and resilience. This activity is about telling the difference between being around people and actually belonging with them.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "fitting-in-vs-belonging",
        wrapUp:
          "Now you can tell when you're editing yourself to be accepted and when you're accepted as-is \u2014 and what the editing quietly costs you. Next: the surprising kind of belonging that crosses big differences.",
        scenarios: [
          "With one particular group, you're completely yourself \u2014 your jokes land wrong sometimes and it doesn't matter, you say what you actually think, you never rehearse.",
          "With another group, there's a version of you that gets deployed. You know the rules there: what to laugh at, what to wear, what not to mention.",
          "Being that adjusted version works \u2014 you're accepted. But acceptance-with-conditions has a running cost that nobody talks about.",
          "There might be a group where you've quietly decided the entry fee is too high \u2014 or one where you can't tell yet if you belong.",
        ],
        starterOptions: [
          [
            "My closest one or two friends",
            "My main friend group, most of the time",
            "One family member who gets me completely",
            "My team or club, when we're actually doing the thing",
            "A friend I only see online \u2014 weirdly, the realest one",
          ],
          [
            "I get quieter and let others set the tone",
            "I act more confident than I feel",
            "I hide interests they'd think are weird",
            "I laugh at stuff I don't actually find funny",
            "I shrink my opinions down to fit",
          ],
          [
            "It's exhausting \u2014 like a shift I don't get paid for",
            "I lose track of which version is actually me",
            "The real me never gets a chance to be liked",
            "I feel lonelier there than when I'm alone",
            "Small \u2014 honestly, adapting doesn't cost me much",
          ],
          [
            "Yes \u2014 I've stepped back from a group over this",
            "I'm in one now, and I'm rethinking it",
            "There's a group I want in with, at the price of editing myself",
            "I can't tell yet \u2014 that's what bothers me",
            "No \u2014 where I am now is mostly real",
          ],
        ],
        type: "journal",
        title: "Fitting In vs. Belonging",
        subtitle: "Step 2 of 5 · Your social self",
        intro:
          "There's a difference between fitting in and belonging — and it matters. Fitting in means changing yourself so that a group accepts you. Belonging means being accepted as yourself. They can look the same from the outside, but they feel very different from the inside. This step asks you to tell them apart in your own life.",
        warmUp:
          "Think about a group you're part of — a friend group, a team, a class, a community. Do you feel like you belong there, or do you feel like you fit in? Is there a difference, in your experience, between the two?",
        prompt:
          "Describe a situation where you feel you genuinely belong — and one where you're just fitting in. What's the difference between how those feel?",
        scaffoldingSteps: [
          "Think of a group or situation where you feel genuinely yourself — no performance, no editing. What's that like? What makes it possible?",
          "Think of a group or situation where you feel more like you're adjusting yourself to be accepted. What do you do differently there? What do you hold back?",
          "What does it cost you to fit in — not the obvious stuff, but the quieter cost of being a slightly different version of yourself?",
          "Is there a group where you've decided the cost of fitting in is too high? Or one where you're not sure whether you belong yet? What would genuine belonging look like there?",
        ],
        whyItMatters:
          "Research on belonging draws a sharp distinction between fitting in and genuinely belonging. Fitting in means reading a situation and adjusting yourself to be accepted. Belonging means being accepted as yourself. The two can look identical from the outside but feel completely different. Studies find that people who try hardest to fit in often report the lowest sense of belonging — because the adjustment itself signals that the real self isn't safe there. Telling the difference is the first step to choosing differently.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "across-the-gap",
        wrapUp:
          "You've seen that real connection doesn't need sameness \u2014 bridging a genuine gap builds the strongest kind of belonging there is. Now for the milestone: the people whose fingerprints are on who you're becoming.",
        scenarios: [
          "There's someone in your life from a genuinely different world \u2014 a grandparent, a neighbour, a teammate, a family friend. Different generation, background, beliefs, or just a completely different head.",
          "And yet \u2014 somewhere in there, a real moment of connection happened between you. Not agreement. Connection.",
          "That relationship gave you something your easy, same-age, same-world friendships couldn't have.",
          "There's probably also a relationship where the gap currently feels too wide \u2014 where connection seems impossible from here.",
        ],
        starterOptions: [
          [
            "A grandparent or much older relative",
            "Someone whose beliefs are basically opposite to mine",
            "A teammate or classmate from a different world",
            "An adult \u2014 coach, teacher, boss \u2014 who's nothing like me",
            "Someone I clashed with before I understood them",
          ],
          [
            "One of us asked a real question and actually listened",
            "Doing something together \u2014 the task built the bridge",
            "They took me seriously when they didn't have to",
            "We found one thing we both love",
            "Someone went first and dropped the act",
          ],
          [
            "Proof my way of seeing things isn't the only one",
            "Patience with people I don't instantly get",
            "A kind of respect that doesn't need agreement",
            "Stories and perspective my friends can't give me",
            "Confidence that difference isn't danger",
          ],
          [
            "Ask them one genuine question and just listen",
            "Show up to something that matters to them",
            "Let one wall down and say something honest",
            "Find the one thing we still share and start there",
            "Honestly? Just stop avoiding them",
          ],
        ],
        type: "journal",
        title: "Across the Gap",
        subtitle: "Step 3 of 5 · Your social self",
        intro:
          "The relationships that shape us most aren't always the easiest ones. Some of the most important connections in your life might be with people who see the world very differently from you — a parent, a grandparent, someone from a different background, a person you disagreed with. The gap between you and them is real. But connection across a gap is a different kind of belonging, and it leaves a different kind of mark.",
        warmUp:
          "Think of someone in your life who is significantly different from you — different background, different age, different values, different way of seeing things. What made connection with them possible, even briefly?",
        storyBefore: 1,
        prompt:
          "Think of a relationship where there's a real difference between you — in background, values, age, or how you see the world. What does that relationship teach you about connection?",
        scaffoldingSteps: [
          "Who is this person — and what's the gap between you? Describe the difference honestly, without minimising it.",
          "What made connection across that gap possible — even just partially? What did one of you have to do?",
          "What has this relationship given you that an easier relationship couldn't have? What have you learned from someone who sees things differently?",
          "Is there a relationship in your life where the gap feels too wide right now — where you're not sure connection is possible? What would even a small step toward it look like?",
        ],
        whyItMatters:
          "Research on social identity consistently finds that the most resilient sense of belonging isn't built only within homogeneous groups — it's built through what psychologists call 'bridging relationships': connections that cross real differences. These relationships are harder to form, but they tend to be more durable and to expand your sense of who you are in ways that same-group relationships can't. They also predict greater openness, flexibility, and empathy over time.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "people-who-shaped-you",
        wrapUp:
          "You just took authorship of your own story \u2014 you can now see who built parts of you, and what you chose to keep. That's not sentimental; it's power. One more step: building connection on purpose this week.",
        scenarios: [
          "Line up who you were three years ago next to who you are now. Some of the differences didn't come from you \u2014 they came through specific people.",
          "Catch yourself mid-week doing something \u2014 a saying, a habit, a way you handle pressure \u2014 and realise: that's not originally mine. I caught it from someone.",
          "Not all shaping is chosen. Someone may have changed you through something hard \u2014 leaving, letting you down, being someone you had to survive rather than enjoy.",
          "Look at the whole cast of people who built parts of you. There's a pattern in who got through.",
        ],
        starterOptions: [
          [
            "A parent or family member who never gave up on me",
            "A coach or teacher who saw something before I did",
            "A friend who changed how I treat people",
            "Someone whose belief in me raised my own",
            "Someone whose example I'm quietly copying",
          ],
          [
            "The way I talk myself through hard moments",
            "How I treat people who can't do anything for me",
            "My standards \u2014 what 'done properly' means",
            "A saying or joke that's now fully mine",
            "How I show up when someone needs me",
          ],
          [
            "Someone leaving taught me I could stand alone",
            "Being let down taught me what I'll never do to others",
            "Hard treatment gave me armour \u2014 useful and heavy",
            "Watching someone struggle taught me compassion",
            "A loss taught me what actually matters",
          ],
          [
            "I'm built by people who backed me \u2014 so I back people",
            "The ones who got through all told me the truth",
            "I keep the lessons, even from people I've let go",
            "I'm becoming the person younger-me needed",
            "My people shaped my values more than my words",
          ],
        ],
        type: "milestone_letter",
        title: "The People Who Shaped You",
        subtitle: "Step 4 of 5 · Milestone",
        intro:
          "You are partly who you are because of other people. Not just the ones who raised you, but the ones who saw something in you, or challenged you, or showed you something you couldn't have found alone. You've been shaped by relationships you chose and ones you didn't — and some of that shaping happened without you fully noticing. This milestone is about seeing it clearly.",
        warmUp:
          "Think about who you were three or four years ago, and who you are now. The ways you've changed — some of them were shaped by specific people. Who were they? You don't have to include everyone. Just the ones who actually left something in you.",
        prompt:
          "Write about the people who have genuinely shaped who you are. Not a list — a reflection on what they gave you, what they changed in you, and what you carry from them.",
        isMilestone: true,
        scaffoldingSteps: [
          "Name two or three people who have left something lasting in you — not necessarily the most obvious choices, but the ones who actually changed something. What did each of them give you?",
          "Think about one of them more carefully: what specific thing — a moment, a habit, a way of seeing something — do you carry from them? Where do you notice it showing up in you?",
          "Has any relationship shaped you in a way you didn't choose — or wouldn't have chosen? What did that leave in you?",
          "Looking at all of them together: what does it say about the kind of person you're becoming, that these are the people who shaped you?",
        ],
        whyItMatters:
          "Psychologist Dan McAdams calls each of us an 'autobiographical author' — the person who makes meaning of our own story. His research shows that people who can clearly identify who has shaped them, and how, tend to have a more coherent, resilient sense of identity — not because their story is simpler, but because they understand how they came to be who they are. Seeing the people who shaped you isn't sentimental. It's how you take authorship of your own narrative.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "connection-challenge",
        referencesStrengths: true,
        wrapUp:
          "Reaching toward someone first is how belonging actually gets built \u2014 nobody drifts into it. Whatever happens this week, you'll learn something about connection you can't learn by waiting.",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
        intro:
          "Belonging isn't passive. It's built — slowly, through small acts of reaching toward people. This challenge asks you to take one small step toward genuine connection: not a grand gesture, but something real. Notice what happens when you actually try.",
        prompt:
          "This week, reach toward someone — genuinely. It could be a conversation you've been avoiding, checking in on someone you've been thinking about, or being a little more honest than you usually are with someone you trust. The goal is one real moment of connection that you actually initiated. Notice what it costs and what it gives.",
        isChallenge: true,
        challengeDebriefDays: 7,
        timeEstimate: "5 minutes to start",
      },
    ],
  },
  {
    id: 4,
    title: "Meaning",
    subtitle: "Mission 4",
    question: "What kind of life do I want?",
    phase: "integration",
    phaseLabel: "Phase 3 — Integration",
    phaseDescription:
      "Weaving what you know about yourself into how you actually live.",
    description:
      "Three missions in, you know more about yourself than you did at the start — who you are, what you care about, where you belong. This mission asks the final question: given all of that, what kind of life do you actually want to build? Not the life that would impress people. Not the one you think you should want. The one that would feel worth waking up inside. This is where exploration becomes intention.",
    colour: "#C2410C",
    colourLight: "#EA580C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "future-self",
        wrapUp:
          "You now hold a specific picture of a future you \u2014 an ordinary Tuesday, not a fantasy. Specific futures pull way harder than vague ones. Next: checking how much of your identity the internet is quietly writing for you.",
        scenarios: [
          "It's a random Tuesday and you're 21. Your alarm goes off. Walk through the day like a camera is following you \u2014 where you wake up, what you do, who you talk to, what fills the afternoon.",
          "That 21-year-old has figured some things out that current-you is still wrestling with. One of them would be a genuine relief to have sorted.",
          "But some things about right-now-you are worth protecting. The 21-year-old would be poorer without them.",
          "The 21-year-old looks back at you, right now, this week \u2014 and there's one thing you could start that they'd be genuinely grateful for.",
        ],
        starterOptions: [
          [
            "Studying something I actually chose, with my own routine",
            "Working and independent \u2014 earning my own way",
            "Making things \u2014 projects, art, code, content, whatever",
            "Surrounded by a small crew of real friends",
            "Honestly can't picture it \u2014 and maybe that's okay",
          ],
          [
            "What I'm actually good at \u2014 no more guessing",
            "Who my real friends are",
            "How to handle my own head on bad days",
            "What I want \u2014 separate from what others want for me",
            "How to speak up without rehearsing it for a week",
          ],
          [
            "My sense of humour",
            "How much I care about my people",
            "My curiosity \u2014 the questions, the rabbit holes",
            "My stubbornness about what's fair",
            "The dreams everyone tells me to be realistic about",
          ],
          [
            "Actually start the thing I keep talking about",
            "Look after my body like it has to last",
            "Keep the friends worth keeping \u2014 on purpose",
            "Get slightly braver about being seen trying",
            "Save some money. Seriously.",
          ],
        ],
        type: "journal",
        title: "Future Self",
        subtitle: "Step 1 of 5 · Your future",
        intro:
          "Identity isn't a fixed thing — it's a story you're always in the middle of writing. Before you can decide what kind of life to build, it helps to have a clear image of who you're building it for. Not an ambition. Not a career goal. Just a vivid picture of the kind of person you want to be growing into — someone specific, living an ordinary week, not a highlight reel.",
        warmUp:
          "Think about the last time you felt genuinely alive — not just happy, but actually alive. Interested, purposeful, like you were doing something that mattered. Where were you and what were you doing? Hold that in mind before you write.",
        prompt:
          "Imagine yourself at 21. What do you hope you'll have learned about yourself by then?",
        scaffoldingSteps: [
          "Picture yourself at 21 in an ordinary week — not a highlight, just a regular Tuesday. What does that look like? Where are you, what are you doing, who are you with?",
          "What do you hope you'll have figured out about yourself by then that you haven't yet?",
          "What do you want to have stayed the same about you — the things you'd be sad to lose along the way?",
          "What's one thing the version of you right now could start doing that would make the 21-year-old version grateful?",
        ],
        whyItMatters:
          "Research on 'possible selves' — the versions of yourself you imagine in the future — shows that having a clear, concrete positive image of who you could become is one of the strongest predictors of motivated, directed behaviour in adolescence. But the detail matters: vague future selves ('I want to be successful') have almost no effect. Specific ones do. The more clearly you can see a Tuesday at 21, the more concretely you can begin moving toward it.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "digital-self",
        wrapUp:
          "You've seen which version of you the internet gets \u2014 and how much of your feed was chosen by you versus fed to you. Seeing it clearly is how you take the wheel back. Next: finding the single thread through everything you've discovered.",
        scenarios: [
          "Pick the place you spend most screen time. Now imagine someone who only knows you from there \u2014 that's the only you they've ever met.",
          "Open your feed and pretend it's a mirror built from everything you've ever clicked. It's showing you who the algorithm thinks you are.",
          "There's probably a message, comment, or post you made online that in-person you would never have said out loud.",
          "Across every platform, chat, and profile \u2014 line up all the versions of you that exist on screens.",
        ],
        starterOptions: [
          [
            "Pretty much me, just with better timing",
            "Funnier and more confident than in-person me",
            "Quieter \u2014 I watch and rarely post",
            "A curated highlight reel \u2014 the good bits only",
            "A different character \u2014 barely me at all",
          ],
          [
            "Fairly accurate, honestly",
            "It shows who I was, not who I'm becoming",
            "It feeds my worst habits, not my real interests",
            "It's who the internet wants me to be",
            "It knows my guilty pleasures better than my friends do",
          ],
          [
            "Braver \u2014 I say things I'd choke on face-to-face",
            "Harsher \u2014 distance makes me sharper than I mean to be",
            "More honest about how I actually feel",
            "More fake-positive than I really am",
            "Not really \u2014 I'm careful everywhere",
          ],
          [
            "The group-chat me with close friends is realest",
            "Anonymous me \u2014 no name means no performance",
            "My main profile is the most managed and least real",
            "In-person me is realest; online is all performance",
            "They're all a bit real, all a bit performed \u2014 a remix",
          ],
        ],
        type: "journal",
        title: "Digital Self",
        subtitle: "Step 2 of 5 · Your digital life",
        intro:
          "You don't just exist in the physical world — you exist online too. And the version of you that shows up on screens isn't fake, but it is filtered. Algorithms decide what you see, platforms shape how you present yourself, and the gap between who you are online and who you are in person can tell you a lot about both. Before you can build the life you want, it's worth looking honestly at how much of your identity is being shaped by forces you didn't choose.",
        warmUp:
          "Think about the last thing you posted, liked, or commented on publicly. Would the people who know you best be surprised by it — or is that completely them?",
        prompt:
          "How do you show up online compared to offline? What does the gap between those versions of you tell you about yourself?",
        scaffoldingSteps: [
          "Pick one place you spend time online — a platform, a group chat, a community. How do you show up there, and is that version of you different from who you are face-to-face?",
          "Your feed and recommendations are shaped by everything you've clicked, searched, and engaged with. Look at it honestly: what does it reflect back at you about who you are — and is that accurate?",
          "Have you ever said something online you wouldn't say in person, or been a version of yourself that you couldn't quite be offline? What made that possible?",
          "Across everywhere you exist online, which version of you feels most real? Which one feels most like a performance — and for who?",
        ],
        whyItMatters:
          "Networked Social Identity Theory describes how digital platforms don't just reflect identity — they actively shape it, through algorithmic curation, social comparison, and the pressure to perform consistency across audiences. The version of you that exists online is co-authored by the platform, not just by you. Understanding that isn't cause for alarm — it's a way of reclaiming authorship. You can't make intentional choices about how you present yourself until you can see clearly how the context is already shaping you.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "the-through-line",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "That thread \u2014 who you are, what you care about, where you belong \u2014 is the closest thing to a compass heading anyone ever gets. Now write it down properly: your milestone letter to the person you're becoming.",
        scenarios: [
          "Rewind to Mission 1 \u2014 strengths, values, masks, your letter. One discovery from that mission still rings true weeks later.",
          "Mission 2 asked what pulls at you and what you could contribute. Underneath everything you wrote, there was one honest sentence.",
          "Mission 3 was about your people \u2014 where you're known, who shaped you. It told you something about what you need from other humans.",
          "Now lay all three answers side by side. They point somewhere \u2014 not at a job, at a way of being.",
        ],
        starterOptions: [
          [
            "I'm steadier than I gave myself credit for",
            "The gap between rooms \u2014 how much I mask",
            "My strengths are real, just quieter than other people's",
            "My values were already there; I just hadn't named them",
            "How much of me nobody actually sees",
          ],
          [
            "I care more than I let on \u2014 caring felt uncool",
            "There's a specific thing only I could bring to it",
            "My anger at unfairness is actually a compass",
            "I want my effort to mean something beyond me",
            "I'd been waiting for permission to care out loud",
          ],
          [
            "Being known matters more to me than being liked",
            "I need fewer, realer people \u2014 not more people",
            "I've been shaped by better people than I realised",
            "I do belonging for others better than I ask for it",
            "I'm still looking for my place \u2014 and that's honest",
          ],
          [
            "A life where I make things that matter to someone",
            "A life where my people are close and real",
            "A life where I fight for something bigger than me",
            "A life where I'm the same person in every room",
            "A life built on purpose \u2014 not drifted into",
          ],
        ],
        type: "journal",
        title: "The Through-Line",
        subtitle: "Step 3 of 5 · Integration",
        intro:
          "Mission 1 was about who you are — your strengths, your values, where you're most yourself. Mission 2 was about what you care about — what pulls you, what you have to contribute, who else shares that care. Mission 3 was about where you belong — the relationships that see you clearly, the ones that have shaped you most. This step asks the question that sits underneath all three: what's the thread running through it?",
        warmUp:
          "Think back to the thing that surprised you most across all three missions — something you wrote or realised that you didn't expect. What was it? What does it tell you about yourself?",
        prompt:
          "Look across everything you've learned about yourself in this journey. What's the single thread that connects who you are, what you care about, and where you belong — and what kind of life does it point toward?",
        scaffoldingSteps: [
          "What's the most important thing you learned about yourself in Mission 1 — something about your inner compass that still feels true?",
          "What's the most honest thing you discovered about what you care about and want to contribute in Mission 2?",
          "What did Mission 3 tell you about the relationships and communities that matter most to you?",
          "If you put all three together — who you are, what you care about, where you belong — what kind of life does that combination point toward? Not just a career — a way of being. (Though your strengths do point at careers too — check your Me page.)",
        ],
        whyItMatters:
          "Integration — the third phase of identity development — isn't about having everything figured out. It's about finding the through-line: the thread that connects your values, your purpose, and your relationships into something coherent. Psychologists find that this coherence is what separates people who feel like they're drifting from people who feel like they're building something — even when their external circumstances look similar. The thread doesn't have to be obvious. But naming it tends to make it real.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "meaning-letter",
        referencesStrengths: true,
        referencesValues: true,
        wrapUp:
          "That letter holds the whole journey in one place, written by the only real expert on you. It's not a plan \u2014 it's a direction. One last thing: live one deliberate day of it.",
        scenarios: [
          "Open the letter the way you'd want to be introduced to a stranger who's going to know you for the next ten years \u2014 the real version, not the r\u00e9sum\u00e9.",
          "Future-you will forget how clear this feels right now. Put what you care about on the record, plainly.",
          "The people. Future-you should remember who mattered here at the start, and what you learned about letting people actually know you.",
          "End with the direction. Not a five-year plan \u2014 a heading. The kind of life this whole journey points toward.",
        ],
        starterOptions: [
          [
            "I'm someone still under construction \u2014 and okay with that",
            "I'm quieter outside than I am inside",
            "I'm the one who notices things others walk past",
            "I'm braver than my track record shows so far",
            "I'm someone who feels everything \u2014 I've stopped apologising for it",
          ],
          [
            "What I care about is real even when it isn't cool",
            "I want my effort to count for someone besides me",
            "I've found the thing that makes me feel switched on",
            "I refuse to become someone who shrugs",
            "My caring is a strength \u2014 not a weakness to manage",
          ],
          [
            "Thank the people who saw me before I saw myself",
            "Remember: being known beats being impressive",
            "Keep choosing the friends who let me be real",
            "Forgive the ones who shaped me the hard way",
            "Stay someone people can be real around",
          ],
          [
            "Build a life I don't need to escape from",
            "Keep the promises I made to myself here",
            "Be the same person in every room",
            "Make the quiet kind of difference that actually lasts",
            "Stay curious \u2014 never stop figuring myself out",
          ],
        ],
        type: "milestone_letter",
        title: "A Life Worth Building",
        subtitle: "Step 4 of 5 · Milestone",
        intro:
          "You've mapped who you are, named what you care about, found where you belong, and traced the thread that connects all three. Now comes the final act: putting it in writing. This letter is addressed to the version of yourself that's still becoming — not a promise, not a plan, but a declaration of what you're building toward and why. It's the most honest document in this whole journey.",
        warmUp:
          "Imagine you're looking back on this moment from ten years from now. What would you want the version of you reading this letter to know about who you were and what you were just beginning to understand?",
        prompt:
          "Write a letter to your future self about the life you're beginning to build. Draw on everything you've learned across all four missions. What do you know about yourself now that you want to carry forward?",
        isMilestone: true,
        scaffoldingSteps: [
          "Start with who you are right now — the real version, not the curated one. What do you know about yourself that you didn't know at the start of this?",
          "Name what you genuinely care about and the kind of contribution you want to make — the honest version, not the impressive one.",
          "Write about the people who matter to you, and what you've learned about what belonging actually means to you.",
          "Look ahead: what kind of life — not career, not status, but life — are you starting to build? What would you want your future self to remember about why you chose it?",
        ],
        whyItMatters:
          "Research on expressive writing — particularly writing to your future self — shows it does something structurally different from ordinary reflection: it activates a sense of continuity between who you are now and who you're becoming, which psychologists call 'identity coherence.' People who score higher on identity coherence report significantly higher life satisfaction, better decision-making under pressure, and greater resilience when things go wrong. The letter works because it makes your future self feel real — and that changes how you act now.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "meaning-challenge",
        referencesStrengths: true,
        wrapUp:
          "One deliberate choice, made on purpose, is what all four missions look like in real life. Notice how different it feels from drifting \u2014 that feeling is the whole point.",
        type: "challenge",
        title: "Weekly Challenge",
        subtitle: "Step 5 of 5",
        intro:
          "Four missions of understanding. This final challenge asks you to actually live it — even briefly. One week, one deliberate choice that reflects the version of yourself you've been working to understand. Not a performance. Not proof. Just what it feels like when you act on purpose.",
        prompt:
          "This week, make one deliberate choice that aligns with the life you described in your letter — something you'd do if you were already the person you're becoming. It could be how you spend your time, what you say yes or no to, or how you show up for someone who matters to you. Notice what it feels like to do it on purpose rather than by accident.",
        isChallenge: true,
        challengeDebriefDays: 7,
        timeEstimate: "5 minutes to start",
      },
    ],
  },
];

export function getMission(id: number): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getActivity(
  missionId: number,
  activityId: string
): Activity | undefined {
  const mission = getMission(missionId);
  return mission?.activities.find((a) => a.id === activityId);
}

/**
 * The 12-value subset offered during onboarding (all drawn from VALUES_LIST,
 * definitions in VALUES_WITH_DEFINITIONS). Single source of truth — the
 * onboarding flow and the Settings values editor both import this, so the
 * value the user picks at onboarding is always editable later.
 */
export const ONBOARDING_VALUES = [
  "Courage",
  "Kindness",
  "Honesty",
  "Creativity",
  "Growth",
  "Family",
  "Humour",
  "Compassion",
  "Curiosity",
  "Resilience",
  "Fairness",
  "Authenticity",
] as const;

// Base display labels derived straight from the mission definitions, so they
// can never drift from the actual activity titles.
const BASE_ACTIVITY_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const m of MISSIONS) {
    for (const a of m.activities) map[a.id] = a.title;
  }
  return map;
})();

/**
 * Human-readable label for any activity id, including the derived
 * `<id>-debrief` (challenge check-ins) and `<id>-revisit` (evaluation cycle)
 * journal entries. Replaces the hand-maintained label maps that previously
 * lived in the Dashboard, Journal, and Revisit clients.
 */
export function getActivityLabel(activityId: string): string {
  if (activityId.endsWith("-debrief")) {
    const base = BASE_ACTIVITY_LABELS[activityId.replace(/-debrief$/, "")];
    return base ? `${base} — Debrief` : "Challenge Debrief";
  }
  if (activityId.endsWith("-revisit")) {
    const base = BASE_ACTIVITY_LABELS[activityId.replace(/-revisit$/, "")];
    return base ? `${base} — Revisit` : "Revisit";
  }
  return BASE_ACTIVITY_LABELS[activityId] || activityId;
}
