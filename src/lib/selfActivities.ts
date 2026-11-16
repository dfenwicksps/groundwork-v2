// ─── The eighteen activities written for a self (D77, D78) ───────────────────
// David approved this wording on 16 Nov 2026. It is copied from
// docs/v3/new-activities-draft.md and docs/v3/self-activities-draft.md; change
// it there first, with his approval, then here.
//
// Each is a writing step on the existing screen: an introduction, a prompt,
// three guided questions with tap-to-start options, and a wrap-up. They are
// marked `optional` so the four old missions still count the steps they always
// did (the Me cards, "mission finished", the journey's phases). On the map they
// are ordinary things to do, and nothing shows them as optional.
//
// Keyed by the old mission each one is filed under, which sets its address and
// nothing else: 1 Identity, 2 Purpose, 3 Connection, 4 Meaning.

import type { Activity } from "./missions";

export const SELF_ACTIVITIES: Record<number, Activity[]> = {
  "1": [
    {
      "id": "name-it",
      "type": "journal",
      "optional": true,
      "title": "Name It",
      "subtitle": "",
      "intro": "Most of the time we use about four words for how we feel: good, bad, stressed, fine. But \"stressed\" might be worried, or embarrassed, or left out, or just tired. Those need different things. The closer the word, the easier it is to know what to do next.",
      "prompt": "Pick one moment from the last day or two when you felt something, and find the closest word for it.",
      "scaffoldingSteps": [
        "What was the moment? Keep it ordinary.",
        "What was the first word you'd have used for the feeling?",
        "Is there a closer word underneath it?"
      ],
      "starterOptions": [
        [
          "Getting a mark back",
          "Something someone said",
          "Waiting for a reply",
          "Walking into a room",
          "Being told to do something"
        ],
        [
          "Annoyed",
          "Stressed",
          "Fine",
          "Bad",
          "Weird"
        ],
        [
          "Embarrassed",
          "Left out",
          "Disappointed",
          "Worried about what's next",
          "Jealous",
          "Tired",
          "Proud, but didn't want to show it",
          "Relieved"
        ]
      ],
      "wrapUp": "You went from a rough word to a closer one. That's the whole skill, and it gets quicker. You don't have to do anything about the feeling. Knowing what it is comes first.",
      "tryIt": "Once more this week, when you notice a feeling, stop and look for the closer word. Come back and write which word it was.",
      "timeEstimate": "About 6 minutes"
    },
    {
      "id": "debrief-it",
      "type": "journal",
      "optional": true,
      "title": "The Debrief",
      "subtitle": "",
      "intro": "There are two ways to think about something that didn't go well. One goes round and round and leaves you feeling worse. The other takes three questions and ends with something to try. This is the second one.",
      "prompt": "Pick one thing from this week that didn't go to plan, and run it through three questions.",
      "scaffoldingSteps": [
        "What happened? Just the facts, the way a friend who was there would tell it.",
        "What was going on for you at the time?",
        "What's one thing you'd try next time? Small is fine."
      ],
      "starterOptions": [
        [
          "A test or assignment didn't go well",
          "I had an argument",
          "I said something I wish I hadn't",
          "I didn't do something I meant to",
          "I lost or played badly"
        ],
        [
          "I was tired",
          "I was rushing",
          "I was nervous",
          "I was annoyed about something else",
          "I hadn't prepared",
          "I wanted to impress someone"
        ],
        [
          "Start earlier",
          "Say it differently",
          "Ask before assuming",
          "Take a minute first",
          "Get help sooner"
        ]
      ],
      "wrapUp": "That's a debrief: what happened, what was going on, what next. Then you stop. If you catch yourself going back over it again, you've already got your answer, and you can let it go.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "three-words",
      "type": "journal",
      "optional": true,
      "title": "Three Words",
      "subtitle": "",
      "intro": "Everyone carries a picture of how they come across. Most of it is guesswork, and the guesses are often harder on us than other people are. The only way to check is to ask.",
      "prompt": "Guess the three words someone would use to describe you. Then ask them.",
      "scaffoldingSteps": [
        "Before you ask: what three words do you think they'd use?",
        "Ask one person you trust for three words they'd use for you. What did they say?",
        "What matched, and what surprised you?"
      ],
      "starterOptions": [
        [
          "Quiet",
          "Funny",
          "Loud",
          "Serious",
          "Kind",
          "Stubborn",
          "Sporty",
          "Smart",
          "Awkward"
        ],
        [
          "A parent or carer",
          "A friend",
          "A brother or sister",
          "A coach or teacher"
        ],
        [
          "They saw something I didn't",
          "They didn't mention what I worry about",
          "It mostly matched",
          "One word I want to think about"
        ]
      ],
      "wrapUp": "Now your picture has a bit less guesswork in it. One person's three words aren't the whole truth either. But you checked, and that's better than guessing.",
      "timeEstimate": "A conversation, then 5 minutes"
    }
  ],
  "2": [
    {
      "id": "if-then-plan",
      "type": "journal",
      "optional": true,
      "title": "The If-Then Plan",
      "subtitle": "",
      "intro": "Everyone has moments where they react before they've decided to. Trying harder in the moment mostly doesn't work, because by then it's already happening. What works better is deciding earlier. You pick the moment in advance and choose your move while you're calm.",
      "prompt": "Pick one moment that keeps catching you out, and write the plan for next time.",
      "scaffoldingSteps": [
        "What's a moment where you react faster than you'd like? Keep it ordinary.",
        "What usually happens, and what would you rather do instead?",
        "Write it as one line: \"If ___, then I will ___.\" Make the \"then\" small enough to do in five seconds."
      ],
      "starterOptions": [
        [
          "When my brother or sister winds me up",
          "When I get a message that annoys me",
          "When I'm losing at something",
          "When someone corrects me in front of people",
          "When I'm told to get off my phone"
        ],
        [
          "I snap, and I'd rather pause",
          "I fire back a message, and I'd rather wait",
          "I give up, and I'd rather take a minute",
          "I go quiet and stew, and I'd rather say one calm thing"
        ],
        [
          "If I feel my face go hot, then I'll take three slow breaths",
          "If I want to reply straight away, then I'll put the phone face down first",
          "If I'm about to walk off, then I'll say \"give me a sec\""
        ]
      ],
      "wrapUp": "You've made the decision ahead of time, so you don't have to make it in the heat of the moment. It won't work every time. When it doesn't, that's information about the plan, not about you. Change the \"then\" and go again.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "make-it-easier",
      "type": "journal",
      "optional": true,
      "title": "Make It Easier",
      "subtitle": "",
      "intro": "People who look disciplined usually aren't fighting harder than you. They've set things up so there's less to fight. The phone's in another room. The bag's packed the night before. This activity is about changing the set-up, not gritting your teeth.",
      "prompt": "Pick one thing you want to do more regularly, and redesign what's around it.",
      "scaffoldingSteps": [
        "What's one thing you keep meaning to do and keep putting off?",
        "What gets in the way, right at the moment you'd start?",
        "What's one change to the set-up that would make starting easier?"
      ],
      "starterOptions": [
        [
          "Homework before dinner",
          "Training or exercise",
          "Practising an instrument",
          "Getting to bed earlier",
          "Reading"
        ],
        [
          "My phone is right there",
          "I can't find what I need",
          "I'm comfortable where I am",
          "I don't know where to begin",
          "Someone else is around and distracting"
        ],
        [
          "Leave my phone in another room",
          "Put what I need out the night before",
          "Do it in a different spot",
          "Decide the first two minutes in advance",
          "Do it alongside someone"
        ]
      ],
      "wrapUp": "You didn't need more willpower. You needed a better set-up. That's a skill you can use on anything.",
      "tryIt": "Make the change once this week. Come back and write one line about what was different.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "my-reason",
      "type": "journal",
      "optional": true,
      "title": "My Reason",
      "subtitle": "",
      "intro": "There are things you do because you want to and things you do because you have to. The second kind is hard to start. It gets easier when you can find a reason that's actually yours, even a small one. Not the reason you've been given. Yours.",
      "prompt": "Pick one thing you have to do this week and find your own reason for it.",
      "scaffoldingSteps": [
        "What's one thing you have to do this week that you're not keen on?",
        "What reason have you been given for it?",
        "What could it do for you, or for someone you care about?"
      ],
      "starterOptions": [
        [
          "An assignment",
          "Study for a test",
          "Training",
          "A job at home",
          "Something I said I'd do"
        ],
        [
          "It's due",
          "It's on the test",
          "I was told to",
          "It's my turn",
          "I don't know"
        ],
        [
          "It gets me closer to something I want",
          "It's a skill I'll use",
          "Someone's counting on me",
          "I'll feel better once it's done",
          "It's practice at doing hard things"
        ]
      ],
      "wrapUp": "Write your reason in one line and put it where you'll see it before you start. It won't make the thing fun. It makes it yours, and that's usually enough to begin.",
      "timeEstimate": "About 6 minutes"
    },
    {
      "id": "proof-file",
      "type": "journal",
      "optional": true,
      "title": "The Proof File",
      "subtitle": "",
      "intro": "Believing you can do something hard mostly comes from one place: having done hard things before. The trouble is you forget. Once something's easy, you stop counting it. This activity collects the proof.",
      "prompt": "Name three things that used to be hard for you and aren't now, and how that happened.",
      "scaffoldingSteps": [
        "What's something you can do now that you couldn't do a few years ago? Big or small.",
        "How did you get from not being able to, to being able to?",
        "What's something in front of you now that feels the way that used to feel?"
      ],
      "starterOptions": [
        [
          "Swim properly",
          "Speak up in class",
          "Cook a meal",
          "Catch public transport on my own",
          "Play a song all the way through",
          "Keep going in a subject I found hard"
        ],
        [
          "I did it badly lots of times first",
          "Someone showed me",
          "I watched how someone else did it",
          "I broke it into smaller bits",
          "I kept turning up"
        ],
        [
          "A subject",
          "A sport or skill",
          "A conversation I need to have",
          "Something I've signed up for",
          "Something I haven't started yet"
        ]
      ],
      "wrapUp": "That's your proof file. Next time something feels impossible, the question isn't \"can I do it?\" It's \"what did I do last time something felt like this?\"",
      "timeEstimate": "About 10 minutes"
    },
    {
      "id": "smallest-version",
      "type": "journal",
      "optional": true,
      "title": "The Smallest Version",
      "subtitle": "",
      "intro": "Most people wait to feel confident before they have a go. It works the other way round. You have a go, it goes okay, and the feeling turns up afterwards. The trick is making the first go small enough that you'll actually do it.",
      "prompt": "Pick one thing you've been waiting to feel ready for, and shrink it.",
      "scaffoldingSteps": [
        "What's something you'd like to do but keep waiting to feel ready for?",
        "What's the smallest version of it, one you could do this week?",
        "When and where will you do it?"
      ],
      "starterOptions": [
        [
          "Trying out for something",
          "Answering a question in class",
          "Starting a conversation with someone new",
          "Posting or showing something I made",
          "Asking for help"
        ],
        [
          "Turn up and watch one session",
          "Answer one question I'm sure of",
          "Say hi and one more sentence",
          "Show it to one person I trust",
          "Ask one question"
        ],
        [
          "Tomorrow at school",
          "At training this week",
          "On the weekend",
          "Next time I see them"
        ]
      ],
      "wrapUp": "However it went, you did the thing that builds confidence: you had a go before you felt ready. The next version can be a bit bigger, when you choose.",
      "tryIt": "Do the small version once. Come back and write what happened, in a sentence or two.",
      "timeEstimate": "5 minutes to start"
    },
    {
      "id": "backing-my-call",
      "type": "journal",
      "optional": true,
      "title": "Backing My Call",
      "subtitle": "",
      "intro": "Trusting yourself doesn't mean always being right, and it doesn't mean never asking anyone. It means knowing your own judgement well enough to tell when to back it and when to get a second opinion.",
      "prompt": "Look at one time you backed your own call, and one time you didn't.",
      "scaffoldingSteps": [
        "Think of a time you went with your own judgement, even though others saw it differently. What happened?",
        "Think of a time you went against your own judgement. What made you do that?",
        "Looking at both, when is your judgement worth backing, and when is it worth checking with someone?"
      ],
      "starterOptions": [
        [
          "I chose a subject or activity others didn't",
          "I said no to something",
          "I stuck with a friend",
          "I did the work my own way",
          "I changed my mind about something"
        ],
        [
          "I didn't want to stand out",
          "Someone seemed surer than me",
          "It was easier",
          "I didn't want an argument",
          "I wasn't sure I knew enough"
        ],
        [
          "I'm usually right about people",
          "I'm usually right about what I can handle",
          "I should check when I'm angry or rushed",
          "I should check when it's something new to me"
        ]
      ],
      "wrapUp": "You know a bit more about when to trust your own read. Asking someone else isn't the opposite of self-trust. Knowing when to ask is part of it.",
      "timeEstimate": "About 10 minutes"
    },
    {
      "id": "part-i-choose",
      "type": "journal",
      "optional": true,
      "title": "The Part I Choose",
      "subtitle": "",
      "intro": "A lot of your week is decided by other people: school, family, timetables. That's normal at your age. But inside almost every \"have to\" there's a part you can choose. Finding that part is what makes something yours.",
      "prompt": "Take one \"have to\" from your week and find what you can choose inside it.",
      "scaffoldingSteps": [
        "What's one thing in your week you have to do and didn't choose?",
        "You may not choose whether. What could you choose about how, when, where or who with?",
        "Is there a reason to do it that's actually yours, even a small one?"
      ],
      "starterOptions": [
        [
          "A subject I didn't pick",
          "Jobs at home",
          "A sport or activity someone signed me up for",
          "An assignment",
          "A family thing"
        ],
        [
          "Which part I start with",
          "When in the day I do it",
          "Where I do it",
          "Who I do it with",
          "How I go about it"
        ],
        [
          "It gets me closer to something I want",
          "It matters to someone I care about",
          "I like being someone who follows through",
          "I'd rather do it well than drag it out",
          "Honestly, not yet"
        ]
      ],
      "wrapUp": "You've found your part of it. And if the honest answer was \"not yet\", that's worth knowing too. It might be something to raise with someone.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "say-what-you-need",
      "type": "journal",
      "optional": true,
      "title": "Say What You Need",
      "subtitle": "",
      "intro": "Speaking up for yourself is a skill, not a personality type. It has three parts: knowing what you need, picking the right person, and saying it in a way they can hear. This activity works on something small and everyday. If what's on your mind is bigger than that, the \"Need to talk?\" button is always there.",
      "prompt": "Pick one small thing you need and haven't asked for, and plan how you'd ask.",
      "scaffoldingSteps": [
        "What's one small thing that would make school, home or a friendship work better for you?",
        "Who's the right person to ask?",
        "Try it in three parts: \"I've noticed ___. I need ___. Could we ___?\""
      ],
      "starterOptions": [
        [
          "More time on something",
          "A clearer explanation",
          "A quieter place to work",
          "To be asked before plans are made",
          "A turn at something"
        ],
        [
          "A teacher",
          "A parent or carer",
          "A coach",
          "A friend",
          "I'm not sure yet"
        ],
        [
          "I've noticed I fall behind when it moves fast. I need a bit more time. Could we go over it at lunch?",
          "I've noticed I find out about plans last. I need a heads-up. Could we sort it earlier?"
        ]
      ],
      "keepFromAi": true,
      "wrapUp": "You've worked out what you need, who to ask and how to say it. Asking doesn't guarantee a yes. It does mean the other person knows, and that's where things start to change.",
      "tryIt": "If it feels right, ask once this week. Come back and write one line about how it went. If it doesn't feel right yet, that's your call.",
      "timeEstimate": "About 10 minutes"
    },
    {
      "id": "mine-or-borrowed",
      "type": "journal",
      "optional": true,
      "title": "Mine or Borrowed?",
      "subtitle": "",
      "intro": "Most of what you believe arrived before you could choose it: from family, friends, school, your feed. That isn't a problem, and it doesn't mean those beliefs are wrong. This activity just takes a look. You might keep every one of them. The difference is that afterwards you'll have checked.",
      "prompt": "Pick a belief you hold and work out where it came from.",
      "scaffoldingSteps": [
        "Name one thing you believe about how to live, how to treat people, or what matters.",
        "Where do you think it came from?",
        "Now that you've looked at it: keep it, change it, or still deciding?"
      ],
      "starterOptions": [
        [
          "Family comes first",
          "Hard work pays off",
          "You should always be honest",
          "It's important to stand out",
          "It's important not to make a fuss"
        ],
        [
          "My parents or carers",
          "My friends",
          "My culture or faith",
          "Things I watch or follow",
          "Something that happened to me",
          "I'm not sure"
        ],
        [
          "Keep it, it's mine now",
          "Keep most of it",
          "I'd change part of it",
          "Still deciding, and that's fine"
        ]
      ],
      "keepFromAi": true,
      "wrapUp": "Whatever you chose, the belief is a bit more yours than it was ten minutes ago. Working out what you think is a long job. Most adults are still doing it.",
      "timeEstimate": "About 10 minutes"
    }
  ],
  "3": [
    {
      "id": "getting-better-at",
      "type": "journal",
      "optional": true,
      "title": "Getting Better At",
      "subtitle": "",
      "intro": "How you rate yourself goes up and down, and that's normal. You can't just decide to rate yourself higher, and being told you're great doesn't do much. What does move it, slowly, is getting better at things that matter to you. So this activity isn't about how you feel about yourself. It's about noticing where you're improving.",
      "prompt": "Pick one thing that matters to you, and look at where you are with it compared with a year ago.",
      "scaffoldingSteps": [
        "What's something you care about being good at? It doesn't have to be a school thing.",
        "What can you do in it now that you couldn't a year ago?",
        "What's the next small thing you'd like to be able to do?"
      ],
      "starterOptions": [
        [
          "A sport",
          "An instrument or art",
          "A subject",
          "Being a good friend",
          "Cooking, building or fixing things",
          "Looking after someone"
        ],
        [
          "I'm faster or stronger",
          "I understand more of it",
          "I get nervous less",
          "I can do it without help",
          "People ask me for help with it"
        ],
        [
          "One skill I've been avoiding",
          "Doing it in front of people",
          "Doing it more often",
          "Helping someone else learn it"
        ]
      ],
      "wrapUp": "That's real, and you did it. On a week when you're rating yourself low, this is worth coming back to. Not as a pep talk. As a fact.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "not-my-results",
      "type": "journal",
      "optional": true,
      "title": "Not My Results",
      "subtitle": "",
      "intro": "Some weeks go well and some don't. If your sense of being worth something goes up and down with them, every bad result feels like it's about you. This activity looks at the parts of you that don't depend on how the week went.",
      "prompt": "Name some things about you that would still be true after your worst week.",
      "scaffoldingSteps": [
        "What's something you care about that has nothing to do with marks, wins or likes?",
        "What's something about how you treat people that stays the same whether you're winning or losing?",
        "Who is someone who'd think the same of you after a bad week?"
      ],
      "starterOptions": [
        [
          "My family",
          "My friends",
          "Being fair",
          "My faith or beliefs",
          "Animals",
          "Making people laugh",
          "Music"
        ],
        [
          "I stick up for people",
          "I listen",
          "I turn up",
          "I include people",
          "I keep my word"
        ],
        [
          "A parent or carer",
          "A grandparent",
          "A friend",
          "A pet, honestly",
          "I'm not sure right now"
        ]
      ],
      "wrapUp": "None of that changed last week, and none of it will change next week. Results matter, and it's fine to care about them. They're just not the bit that makes you count.",
      "wrapUpIf": {
        "step": 2,
        "answer": "I'm not sure right now",
        "text": "That's more common than you'd think, and it can change. Your support circle is a good place to start."
      },
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "what-id-say-to-a-friend",
      "type": "journal",
      "optional": true,
      "title": "What I'd Say to a Friend",
      "subtitle": "",
      "intro": "When a friend stuffs something up, most of us know what to say. When we do it ourselves, we say things we'd never say to them. This activity borrows the voice you already use for other people.",
      "prompt": "Pick a small, ordinary stuff-up from lately, and answer it the way you'd answer a friend.",
      "scaffoldingSteps": [
        "What's a small thing you got wrong lately? Keep it everyday.",
        "What did you say to yourself about it?",
        "If a friend told you they'd done exactly the same thing, what would you say to them?"
      ],
      "starterOptions": [
        [
          "I forgot something",
          "I said the wrong thing",
          "I did badly at something",
          "I let someone down in a small way",
          "I wasted time I needed"
        ],
        [
          "\"Typical\"",
          "\"I always do this\"",
          "\"Everyone saw\"",
          "\"I'm useless at this\"",
          "Not much, I just felt bad"
        ],
        [
          "\"Everyone does that\"",
          "\"It's one time\"",
          "\"You were tired\"",
          "\"What do you need now?\"",
          "\"It's fixable\""
        ]
      ],
      "keepFromAi": true,
      "wrapUp": "Read back what you'd say to your friend. It's true for you too. Being kind to yourself isn't letting yourself off. It just makes it easier to have another go.",
      "timeEstimate": "About 8 minutes"
    }
  ],
  "4": [
    {
      "id": "you-are-here",
      "type": "journal",
      "optional": true,
      "title": "You Are Here",
      "subtitle": "",
      "intro": "Before you can think about who you might become, you need a pin on the map for where you are now. Not the version you show people, and not the one you wish you were. Just a fair description of today.",
      "prompt": "Describe who you are right now, the way a fair friend would.",
      "scaffoldingSteps": [
        "What are three things that are true about you at the moment?",
        "What's something you do most weeks that says something about you?",
        "What's one thing you're working on?"
      ],
      "starterOptions": [
        [
          "I'm loyal",
          "I'm curious",
          "I get nervous in groups",
          "I work hard at things I like",
          "I'm funny with people I know",
          "I'm still working out what I'm into"
        ],
        [
          "I look after someone",
          "I train or practise",
          "I make things",
          "I read or watch a lot about one topic",
          "I help out at home"
        ],
        [
          "Speaking up",
          "Being more organised",
          "Staying calmer",
          "Trying new things",
          "Being a better friend"
        ]
      ],
      "wrapUp": "That's your pin. It's not a score and it's not permanent. It's just where you're starting from, and a starting point is useful.",
      "timeEstimate": "About 8 minutes"
    },
    {
      "id": "should-or-choose",
      "type": "journal",
      "optional": true,
      "title": "Should or Choose?",
      "subtitle": "",
      "intro": "Everyone carries a list of things they feel they should be: from family, friends, school, their culture, what they see online. Some of those you'd choose anyway. Some you're just carrying. This activity sorts them. Keeping one is as good an answer as dropping one.",
      "prompt": "Take a few \"I should\" sentences and work out which are yours.",
      "scaffoldingSteps": [
        "Finish this sentence a few times: \"I should…\"",
        "Pick one. Where does it come from?",
        "Try saying it as \"I choose to…\". Does it still sound right?"
      ],
      "starterOptions": [
        [
          "be better at school",
          "be more outgoing",
          "be good at sport",
          "look a certain way",
          "know what I want to do",
          "be easier to get along with"
        ],
        [
          "My family",
          "My friends",
          "School",
          "Things I see online",
          "My culture or faith",
          "Me",
          "I'm not sure"
        ],
        [
          "Yes, I'd choose it anyway",
          "Partly",
          "I'd choose a smaller version",
          "No, it's not really mine",
          "I don't know yet"
        ]
      ],
      "keepFromAi": true,
      "wrapUp": "Some of your \"shoulds\" turned out to be yours. Those are easier to carry now. If one of them isn't, you don't have to do anything about it today. It might be worth talking over with someone you trust.",
      "timeEstimate": "About 10 minutes"
    },
    {
      "id": "the-other-version",
      "type": "journal",
      "optional": true,
      "title": "The Other Version",
      "subtitle": "",
      "intro": "Most people have a version of themselves they don't want to turn into. Someone who gave up on things, or stopped being kind, or went along with everyone. Thinking about that version isn't a bad sign. It's useful, because it shows you what you care about. It works best when you put the opposite beside it.",
      "prompt": "Name one version of you that you'd rather not become, and the version you'd rather be.",
      "scaffoldingSteps": [
        "In everyday terms, what's one version of you that you don't want to become?",
        "What's the opposite version, the one you'd want?",
        "What's one small thing this week that the second version would do?"
      ],
      "starterOptions": [
        [
          "Someone who gives up when it's hard",
          "Someone who's unkind to get a laugh",
          "Someone who never tries anything",
          "Someone who lets friends down",
          "Someone who just goes along with it"
        ],
        [
          "Someone who sticks at things",
          "Someone people feel safe around",
          "Someone who has a go",
          "Someone you can count on",
          "Someone who says what they think"
        ],
        [
          "Finish one thing I'd usually drop",
          "Say something kind I'd usually keep in",
          "Try one new thing",
          "Keep one promise",
          "Say what I think once"
        ]
      ],
      "keepFromAi": true,
      "wrapUp": "The version you don't want just told you what you do want. That's all it's for. One small thing in the right direction counts for more than worrying about the wrong one.",
      "timeEstimate": "About 10 minutes"
    }
  ]
};
