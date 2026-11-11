// ─── The selves ───────────────────────────────────────────────────────────────
// Groundwork's stated aim includes developing language and understanding around
// self-efficacy, self-confidence, self-esteem, self-concept, self-worth,
// self-image and self-control. Four of those seven appeared nowhere in the app,
// and nothing anywhere helped a student tell them apart.
//
// Telling them apart is the actual learning. "I failed the test so I'm
// worthless" is a teenager treating a dip in self-esteem as a verdict on their
// self-worth; the words are the thing that lets them notice the swap. Likewise
// self-efficacy is specific ("I can do this one") while self-esteem is global
// ("I'm alright"), so a student can be genuinely sure of themselves at one
// thing and still think little of themselves, which is confusing until it has
// a name.
//
// Self-efficacy and self-confidence follow Bandura: self-efficacy is the
// task-specific belief "I can do this", built from four sources (mastery,
// watching people like you, being told you can by someone you trust, and how
// you read your own nerves). "Effort leads to results" is a different belief,
// an outcome expectation, and it's taught alongside efficacy rather than as
// its definition. Self-confidence is the everyday word; research mostly
// studies it as self-efficacy, and the general feeling is built from many
// specific ones. See docs/evidence/self-outcomes-map.md.
//
// Two more were added (November 2026) because the research says they're the
// distinctions that matter most for an app like this:
//   - Self-reflection, set against going over it (rumination). Reflection is
//     the app's main activity, and the curious kind helps while the repetitive,
//     self-critical kind is linked to distress (Trapnell & Campbell, 1999;
//     Luyckx's "ruminative exploration"). The hard-on-yourself card catches
//     the second kind after the fact; this gives students the words before.
//   - Mattering: being noticed, important and counted on (Rosenberg &
//     McCullough, 1981), with Prilleltensky's two halves, feeling valued and
//     adding value. It's what The Standard builds and the check-in measures,
//     but the app never named it. Its self-check stays on the positive side
//     on purpose: "would anyone notice if I was gone" is risk language.
//
// These are deliberately NOT Boosts. A Boost is a quality you practise this
// week; these are lenses you use to understand what you're looking at. Mixing
// them would be a category error, and the app already has one picker too many.

export interface Self {
  key: string;
  name: string;
  emoji: string;
  /** The one-line handle — what this actually is, in a teen's register */
  short: string;
  /** The fuller explanation */
  what: string;
  /** The distinction that does the teaching: what it gets confused with */
  notThis: string;
  /** A question that tells you where yours currently sits */
  selfCheck: string;
  /** Where in the app this one is actually built or examined */
  builtBy: { label: string; href: string };
}

export const SELVES: Self[] = [
  {
    key: "self-concept",
    name: "Self-concept",
    emoji: "🗺️",
    short: "The description of you — no scores attached.",
    what: "Your self-concept is the whole picture you hold of yourself: what you're like, what you're good at, what you care about, how you behave in different rooms. It's a description, not a judgement. \"I'm quiet in groups, I'm good with my hands, I get stubborn about fairness\" — none of that is praise or criticism, it's just the map.",
    notThis: "Not self-esteem. Self-concept is the description; self-esteem is how you feel about the description. Two people with almost identical self-concepts can feel completely differently about themselves.",
    selfCheck: "Could you describe yourself to a stranger in five sentences without any of them being good or bad?",
    builtBy: { label: "Mission 1 — Strengths Mapping", href: "/missions/1/activities/strengths-mapping" },
  },
  {
    key: "self-image",
    name: "Self-image",
    emoji: "🪞",
    short: "The picture in your head of how you come across.",
    what: "Self-image is the narrower, more visual part: how you think you look, sound, and land on other people. It's built partly from real feedback and partly from guesswork, and the guesswork is usually harsher than reality. It can also get pulled around by what you scroll past.",
    notThis: "Not self-concept. Self-concept is everything you know about yourself; self-image is specifically how you imagine you appear. Yours can be badly out of date — most people's is.",
    selfCheck: "If you recorded yourself talking to a friend and watched it back, would it match the version in your head?",
    builtBy: { label: "Mission 4 — The Digital Self", href: "/missions/4/activities/digital-self" },
  },
  {
    key: "self-reflection",
    name: "Self-reflection",
    emoji: "🔍",
    short: "Looking at yourself with curiosity, and coming out with something.",
    what: "Reflection is thinking back over what happened and what was going on for you, the way you'd look at a friend's situation: interested, not prosecuting. What happened? What was I feeling? What would I try next time? It's most of what this app asks you to do, and done this way it leaves you knowing yourself a bit better and with something to try.",
    notThis: "Not going over it. Replaying the same bad moment, or the same harsh verdict on yourself, feels like reflecting but works the opposite way: it tends to leave people more anxious and flat, not clearer. The tell is where it lands. Reflection asks \"what happened\" and \"what next\" and gets somewhere. Going over it asks \"why am I like this\" on a loop and never does.",
    selfCheck: "After you've thought something through, do you usually come out with something to try, or just feeling worse? If it's the second, stop, do something with your hands or your feet for ten minutes, or talk it through with someone instead.",
    builtBy: { label: "Your journal", href: "/journal" },
  },
  {
    key: "self-esteem",
    name: "Self-esteem",
    emoji: "📈",
    short: "How much you rate yourself — and it moves.",
    what: "Self-esteem is your running evaluation of yourself. It goes up after a good week and down after a bad one, and that's normal — it's supposed to move. The trouble starts when it's the only measure you've got, because then every setback feels like evidence about who you are rather than what happened.",
    notThis: "Not self-worth. Self-esteem is a rating and it fluctuates. Self-worth shouldn't. If yours drops to zero after one bad result, what's actually wobbling is the floor underneath it.",
    selfCheck: "Think of the last time you felt bad about yourself. Was it about something you did, or about who you are?",
    builtBy: { label: "Strength in action — the practice log", href: "/me?tab=grow#practice" },
  },
  {
    key: "self-worth",
    name: "Self-worth",
    emoji: "🪨",
    short: "That you count — regardless of how the week went.",
    what: "Self-worth is the floor: the belief that you matter independently of your results, your looks, your usefulness or your popularity. It's the one that isn't supposed to move. People who have it can fail badly and still be okay; people who don't have to keep earning their place, permanently.",
    notThis: "Not self-esteem, and not achievement. If it goes up when you win and down when you lose, that's self-esteem doing the work — and a floor made of results isn't a floor.",
    selfCheck: "If you achieved nothing at all this year, would you still be worth the same to the people who love you? Do you actually believe that about yourself?",
    builtBy: { label: "Your support circle", href: "/support" },
  },
  {
    key: "mattering",
    name: "Mattering",
    emoji: "🤝",
    short: "That people notice you, and count on you for something.",
    what: "Mattering is the sense that you make a difference to people: someone notices how you're going, you're important to them, and they count on you for something. It has two halves. One is feeling valued, which mostly comes from other people. The other is adding value, the things you do that leave people better off, and that half you can do something about today.",
    notThis: "Not belonging, and not self-worth. Belonging is being included; mattering is being important to someone in particular. And self-worth is the floor that holds even when nobody's noticing. Mattering helps build that floor, but it shouldn't be the only thing holding it up.",
    selfCheck: "Name one person who'd notice if you were having a rough week, and one thing someone counts on you for. If either is hard to answer right now, that's common, it can change, and the support circle is a good place to start.",
    builtBy: { label: "The Standard, on your Me page", href: "/me?tab=reflect#standard" },
  },
  {
    key: "self-confidence",
    name: "Self-confidence",
    emoji: "🎯",
    short: "Feeling sure enough of yourself to have a go.",
    what: "Confidence is the everyday word for feeling sure of yourself. Psychologists mostly study the specific kind, self-efficacy: confidence about one particular thing. The general feeling is usually built out of lots of specific ones. You can be confident on a football field and nervous about speaking up in class, and both are true at once. That's not a contradiction; it's how confidence works.",
    notThis: "Not self-esteem. Esteem is how you rate yourself overall (\"I'm alright\"); confidence is about whether you'll have a go. And not something you wait for. Waiting to feel confident before you start is backwards: the doing is what produces it.",
    selfCheck: "Name one thing you're genuinely confident at. What did you do to get there? That's the method for everything else.",
    builtBy: { label: "Mission 1 — The weekly challenge", href: "/missions/1/activities/weekly-challenge" },
  },
  {
    key: "self-efficacy",
    name: "Self-efficacy",
    emoji: "⚙️",
    short: "Believing you can do the specific thing in front of you.",
    what: "Self-efficacy is your belief that you can do a particular thing, like give this talk, pass this test or have this conversation. It's specific: you can have plenty for one thing and very little for another. Psychologists find it's built mostly one way: small, real wins at things that used to be hard. Watching someone like you do it helps, so does someone you trust telling you that you can, and so does reading your nerves as getting ready rather than as proof you can't.",
    notThis: "Not the same as believing effort pays off. Efficacy says \"I can do this\"; the other belief says \"doing it will make a difference\". You need both. \"I'm bad at this because I haven't done the reps yet\" is the second one, and it's what keeps you going long enough to build the first.",
    selfCheck: "When something goes badly, is your first thought about what you'd do differently, or about what you're like?",
    builtBy: { label: "Week 5 — Do I do hard things?", href: "/program/5" },
  },
  {
    key: "self-control",
    name: "Self-control",
    emoji: "🛑",
    short: "The gap you can hold between feeling it and doing it.",
    what: "Self-control isn't not feeling things. It's the space between the feeling and the action — the second and a half where you notice the urge and get to choose. That gap can be widened with practice, and it's narrower when you're tired, stressed or humiliated, which is worth knowing before you judge yourself by your worst moment.",
    notThis: "Not willpower. Gritting your teeth against a rule is a fight you often lose. \"I'm trying not to react\" is a rule; \"I'm the kind of person who stops first\" is a description of who you are, and it gives you something to live up to.",
    selfCheck: "What reliably shrinks your gap — tiredness, a particular person, being embarrassed? Knowing your own conditions is most of the skill.",
    builtBy: { label: "Week 7 — Can I manage myself?", href: "/program/7" },
  },
];

export const SELF_BY_KEY: Record<string, Self> = Object.fromEntries(
  SELVES.map((s) => [s.key, s])
);

/**
 * The pairs students most often collapse into one thing. Surfaced as a
 * "these two get mixed up" prompt, because the confusion is the teachable
 * moment and it doesn't announce itself.
 */
export const CONFUSED_PAIRS: { a: string; b: string; line: string }[] = [
  {
    a: "self-esteem",
    b: "self-worth",
    line: "One is a rating that moves with the week. The other is supposed to be a floor. Mixing them is why a bad result can feel like a verdict on you.",
  },
  {
    a: "self-concept",
    b: "self-image",
    line: "One is everything you know about yourself. The other is only how you think you come across — and it's usually harsher and more out of date than the real thing.",
  },
  {
    a: "self-confidence",
    b: "self-efficacy",
    line: "One is the everyday feeling of being sure of yourself. The other is the specific version: \"I can do this one\". The general feeling is mostly built from lots of the specific ones, which is why it grows by doing things, not by deciding to feel it.",
  },
];
