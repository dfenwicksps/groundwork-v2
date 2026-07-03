export interface Activity {
  id: string;
  type: "journal" | "values_picker" | "challenge" | "milestone_letter";
  title: string;
  subtitle: string;
  prompt: string;
  secondaryPrompt?: string;
  isMilestone?: boolean;
  isChallenge?: boolean;
  challengeDebriefDays?: number;
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
  /** Clickable sentence openers to help with the blank-page moment */
  sentenceStarters?: string[];
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
    colour: "#1B3A5C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "strengths-mapping",
        type: "journal",
        title: "Strengths Mapping",
        subtitle: "Step 1 of 5 · Inner compass",
        intro:
          "Most people can't list their strengths if you ask them straight out — it feels like bragging, or your mind just goes blank. So we're not going to ask you that. Instead, we'll walk through a few everyday situations. Notice how you'd actually react in each one. That reaction is the clue. Your strengths are usually the things you do so naturally you don't even count them as skills.",
        warmUp:
          "There's no right answer to any of this, and nobody else will see it. You're just noticing patterns in how you already are.",
        prompt:
          "Think about a moment recently when you felt genuinely good at something. What were you doing, and what made it feel natural?",
        secondaryPrompt:
          "Try to be specific — not 'I'm good at sport' but what exactly were you doing, and what about it felt right?",
        scenarios: [
          "A teacher splits the class into groups for a big project. Within five minutes everyone's fallen into a role without being told to — one person's organising, one's throwing out ideas, one's keeping everyone calm, one's quietly getting the actual work done.",
          "It's the weekend and you've got a few free hours with nothing you have to do. You end up doing something and afterwards you feel more energised than when you started — not drained, not bored. Could be making something, fixing something, gaming, helping someone, going somewhere, figuring something out.",
          "A friend messages you the night before something stressful — an exam, a tryout, a performance, a hard conversation. They're panicking. You're the one they came to.",
          "Someone who's known you for years is asked what you're just naturally good at. They answer straight away, without having to stop and think.",
        ],
        scaffoldingSteps: [
          "In a situation like that, which person do you usually become — and what do you end up actually doing? Describe it like it's a normal Tuesday for you.",
          "What was the thing you did, and what was it about it that left you feeling good rather than tired?",
          "What do you actually do for them — make a plan, calm them down, distract them, hype them up, just listen? What does your instinct in that moment say you're good at?",
          "What do you think they'd say — and is it something you'd find hard to claim about yourself? Looking back at the situations above, what keeps showing up?",
        ],
        starterOptions: [
          [
            "The organiser — I sort out who's doing what",
            "The ideas person — I get everyone thinking",
            "The calm one — I keep the group steady",
            "The doer — I quietly get the actual work done",
            "The motivator — I keep everyone's energy up",
          ],
          [
            "Making, building, or fixing something",
            "Helping someone work through a problem",
            "Competing, training, or playing",
            "Creating — art, music, writing, video, design",
            "Figuring out how something works",
          ],
          [
            "Help them make a plan and break it down",
            "Calm them down and steady their nerves",
            "Distract them and lighten the mood",
            "Hype them up and remind them they've got this",
            "Just listen — let them get it all out",
          ],
          [
            "I'm dependable — people know they can count on me",
            "I'm creative — I see things others don't",
            "I'm steady — I keep my head when things get tense",
            "I'm driven — I push through and get things done",
            "I'm a connector — I bring people together",
          ],
        ],
        sentenceStarters: [
          "The role I usually end up in is...",
          "I lose track of time when I'm...",
          "People seem to rely on me for...",
        ],
        whyItMatters:
          "Research on identity development shows that people who can articulate their strengths — not just their roles or achievements — make more confident decisions and navigate uncertainty better. This isn't about ego. It's about building a clear inner compass. The act of naming a strength in your own words activates it as part of your identity, not just a skill you happen to have.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "values-clarifier",
        type: "values_picker",
        title: "Values Clarifier",
        subtitle: "Step 2 of 5 · Inner compass",
        intro:
          "'What are your values?' is almost impossible to answer cold — the word feels big and abstract. But you make value-based choices every day without naming them. So before you pick, read the situations below. Notice which ones tug at you, which make you go 'I'd hate that' or 'that'd really bother me.' That reaction is a value showing itself. Then the list will feel a lot easier.",
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
        type: "journal",
        title: "The Mask Check",
        subtitle: "Step 3 of 5 · Your public self",
        intro:
          "Everyone wears slightly different versions of themselves in different rooms — that's normal, not fake. But it's hard to see your own masks until someone points at a specific moment. So here are some specific moments. Notice which 'you' shows up in each, and how far that is from the you on the inside.",
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
        sentenceStarters: [
          "The 'me' people see in that room is...",
          "I tend to hide the part of me that...",
          "I feel least like I'm performing when...",
        ],
        whyItMatters:
          "Psychologists call the gap between your private and public self 'self-monitoring'. Some gap is normal and healthy — we all adapt to context. But when the gap gets very large, it tends to correlate with higher anxiety and a fragmented sense of identity. This activity isn't about eliminating the gap. It's about seeing it clearly so you can decide — consciously — where you want to close it.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "identity-letter",
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
        sentenceStarters: [
          "Right now, you are someone who...",
          "On a hard day, remember that you...",
          "Something true you don't say enough is...",
        ],
        whyItMatters:
          "Writing about yourself in the second person — addressing yourself as 'you' — activates a different kind of self-awareness than thinking in the first person does. Studies on expressive writing show it can reduce self-criticism, increase clarity about values, and help consolidate fragmented self-perceptions into a more coherent sense of identity. The letter format isn't arbitrary — it works.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "weekly-challenge",
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
    colour: "#2E7D8C",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "what-matters",
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
        sentenceStarters: [
          "Something in the world that genuinely bothers me is...",
          "When I see this kind of thing, I feel...",
          "I keep coming back to this because...",
        ],
        whyItMatters:
          "Researcher William Damon distinguishes between being 'engaged' (doing things) and being 'purposeful' (knowing why). Purposeful adolescents are more resilient under pressure and report significantly higher wellbeing — not because their lives are easier, but because they have a direction. The quiet anger or persistent pull you feel about something isn't random. It's identity data, pointing you somewhere specific.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "contribution-map",
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
        sentenceStarters: [
          "My strengths could contribute to this by...",
          "The value that feels most alive in relation to this is...",
          "What I might uniquely bring to this is...",
        ],
        whyItMatters:
          "Studies on youth purpose consistently find that the most durable form isn't 'I want to help people' — it's 'I have something specific to contribute.' Generic caring fades under pressure; specific contribution becomes part of identity. This is why connecting your particular strengths to a particular problem is more powerful than choosing a cause at random. Purpose that fits who you are tends to stick.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "the-other-side",
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
        sentenceStarters: [
          "Someone I know — or know of — who also cares about this is...",
          "The community that exists around this looks like...",
          "Knowing others care about this makes me feel...",
        ],
        whyItMatters:
          "Purpose supported by community is significantly more durable than individual conviction alone. Research on purposeful adolescents finds that mentors, peers, and even historical figures who model a cause are often the critical factor in whether purpose becomes action or stays aspiration. Knowing you're not alone in caring about something isn't just comforting — it changes how seriously you take it, and how long it lasts.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "commitment-statement",
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
        sentenceStarters: [
          "What I genuinely care about is...",
          "This connects to who I am because...",
          "The kind of person I want to be in relation to this is...",
        ],
        whyItMatters:
          "Research on identity development finds that articulating a commitment — even privately, before acting on it — significantly increases psychological investment and follow-through. This isn't superstition. It's the mechanics of how belief becomes identity: the moment you say 'this is mine,' something shifts. The commitment doesn't have to be certain or permanent. It just has to be honest.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "purpose-challenge",
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
    colour: "#4A7C59",
    textColour: "#FFFFFF",
    activities: [
      {
        id: "belonging",
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
        sentenceStarters: [
          "I feel most myself when I'm with...",
          "What those relationships have in common is...",
          "I'm still looking for...",
        ],
        whyItMatters:
          "Social identity theory identifies our sense of belonging within groups as one of the core pillars of a stable identity — but not all group membership provides genuine belonging. Research consistently finds that feeling authentically known by others (not just accepted) is one of the strongest predictors of adolescent wellbeing and resilience. This activity is about telling the difference between being around people and actually belonging with them.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "fitting-in-vs-belonging",
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
        sentenceStarters: [
          "A place where I genuinely belong is...",
          "In some groups, I find myself holding back...",
          "The cost of fitting in that I rarely talk about is...",
        ],
        whyItMatters:
          "Research on belonging draws a sharp distinction between fitting in and genuinely belonging. Fitting in means reading a situation and adjusting yourself to be accepted. Belonging means being accepted as yourself. The two can look identical from the outside but feel completely different. Studies find that people who try hardest to fit in often report the lowest sense of belonging — because the adjustment itself signals that the real self isn't safe there. Telling the difference is the first step to choosing differently.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "across-the-gap",
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
        sentenceStarters: [
          "Someone I've connected with across a real difference is...",
          "What made it possible was...",
          "What this relationship has given me that easier ones haven't is...",
        ],
        whyItMatters:
          "Research on social identity consistently finds that the most resilient sense of belonging isn't built only within homogeneous groups — it's built through what psychologists call 'bridging relationships': connections that cross real differences. These relationships are harder to form, but they tend to be more durable and to expand your sense of who you are in ways that same-group relationships can't. They also predict greater openness, flexibility, and empathy over time.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "people-who-shaped-you",
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
        sentenceStarters: [
          "One person who genuinely changed something in me is...",
          "What they gave me — that I carry now — is...",
          "I didn't fully realise how much they shaped me until...",
        ],
        whyItMatters:
          "Psychologist Dan McAdams calls each of us an 'autobiographical author' — the person who makes meaning of our own story. His research shows that people who can clearly identify who has shaped them, and how, tend to have a more coherent, resilient sense of identity — not because their story is simpler, but because they understand how they came to be who they are. Seeing the people who shaped you isn't sentimental. It's how you take authorship of your own narrative.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "connection-challenge",
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
    colour: "#C8982A",
    textColour: "#1A1A1A",
    activities: [
      {
        id: "future-self",
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
        sentenceStarters: [
          "By 21, I hope I'll have learned...",
          "I want to have stayed the same in the way that...",
          "The thing I'd be most sad to lose about who I am now is...",
        ],
        whyItMatters:
          "Research on 'possible selves' — the versions of yourself you imagine in the future — shows that having a clear, concrete positive image of who you could become is one of the strongest predictors of motivated, directed behaviour in adolescence. But the detail matters: vague future selves ('I want to be successful') have almost no effect. Specific ones do. The more clearly you can see a Tuesday at 21, the more concretely you can begin moving toward it.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "digital-self",
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
        sentenceStarters: [
          "Online, I'm more likely to...",
          "When I look at my feed, it mostly shows me...",
          "The version of me that exists online is different because...",
        ],
        whyItMatters:
          "Networked Social Identity Theory describes how digital platforms don't just reflect identity — they actively shape it, through algorithmic curation, social comparison, and the pressure to perform consistency across audiences. The version of you that exists online is co-authored by the platform, not just by you. Understanding that isn't cause for alarm — it's a way of reclaiming authorship. You can't make intentional choices about how you present yourself until you can see clearly how the context is already shaping you.",
        timeEstimate: "About 10 minutes",
      },
      {
        id: "the-through-line",
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
          "If you put all three together — who you are, what you care about, where you belong — what kind of life does that combination point toward? Not a career. A way of being.",
        ],
        sentenceStarters: [
          "The thing I keep coming back to across all of this is...",
          "If I'm honest, the kind of life I want to build is one where...",
          "What surprised me most about myself across these three missions is...",
        ],
        whyItMatters:
          "Integration — the third phase of identity development — isn't about having everything figured out. It's about finding the through-line: the thread that connects your values, your purpose, and your relationships into something coherent. Psychologists find that this coherence is what separates people who feel like they're drifting from people who feel like they're building something — even when their external circumstances look similar. The thread doesn't have to be obvious. But naming it tends to make it real.",
        timeEstimate: "About 12 minutes",
      },
      {
        id: "meaning-letter",
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
        sentenceStarters: [
          "What I know about myself now that I didn't know before is...",
          "The life I'm starting to build is one where...",
          "The thing I most want my future self to remember is...",
        ],
        whyItMatters:
          "Research on expressive writing — particularly writing to your future self — shows it does something structurally different from ordinary reflection: it activates a sense of continuity between who you are now and who you're becoming, which psychologists call 'identity coherence.' People who score higher on identity coherence report significantly higher life satisfaction, better decision-making under pressure, and greater resilience when things go wrong. The letter works because it makes your future self feel real — and that changes how you act now.",
        timeEstimate: "About 15 minutes",
      },
      {
        id: "meaning-challenge",
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
