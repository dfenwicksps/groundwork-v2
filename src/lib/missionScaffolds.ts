import type { Scaffold } from "./scaffold";

// ─── Mission scaffolds ────────────────────────────────────────────────────────
// Missions already ship `starterOptions` — complete answers to tap — which the
// Quick tier uses. What was missing everywhere was the middle rung: a
// half-written sentence to finish. Extended is the tier most students actually
// need; Quick can be answered without thinking, and Open assumes you already
// know how to begin a sentence about yourself.
//
// Kept out of missions.ts so that file stays readable as content. Indexes align
// 1:1 with each activity's scaffoldingSteps.
//
// Hints are angles into the question, never answers to it.

interface ActivityScaffold {
  /** stems[i] and stuck[i] scaffold scaffoldingSteps[i] */
  stems: string[][];
  stuck: string[][];
}

export const MISSION_SCAFFOLDS: Record<string, ActivityScaffold> = {
  // ── Mission 1 · Identity ───────────────────────────────────────────────────
  "mask-check": {
    stems: [
      ["With my friends I'm", "Around my family I'm more", "The biggest difference between the two is"],
      ["Something I keep to myself is", "It stays hidden because", "The only place it shows up is"],
      ["I was protecting", "I thought that if I hadn't,", "Over time that costs me"],
      ["What they give me is", "They never", "To feel more of that elsewhere I'd have to"],
    ],
    stuck: [
      ["Think volume, opinions, humour, how much you admit you care.", "Which room do you relax in fastest?"],
      ["You don't have to describe it — just say that it exists and where.", "It might be an interest, a worry, or an opinion."],
      ["Usually it's protection against being judged, laughed at, or seen as trying too hard.", "What's the worst thing you imagined happening?"],
      ["Often it's that they don't react much — you can say things without a fuss.", "What would have to change in a harder room?"],
    ],
  },
  "identity-letter": {
    stems: [
      ["What I'd want them to know first is", "The thing people usually get wrong about me is", "What actually matters to me is"],
      ["On a hard day, remember that", "The true thing you'll need to hear is", "Don't forget that you"],
      ["That moment shows I'm still working on", "Said kindly:", "It's not that I'm bad at it — it's that"],
      ["Their sentence would be", "I'd struggle to say it because", "Saying it anyway:"],
    ],
    stuck: [
      ["Not achievements — what you're actually like to be around.", "What would your closest friend say if someone asked them to describe you?"],
      ["Write what you'd want to hear, not what sounds wise.", "What do you forget about yourself when things go badly?"],
      ["Say it the way you'd say it to a friend, not the way you say it to yourself.", "'Working on' isn't the same as 'failing at'."],
      ["Pick someone who actually likes you.", "If it feels arrogant to write down, that's usually the point."],
    ],
  },

  // ── Mission 2 · Purpose ────────────────────────────────────────────────────
  "what-matters": {
    stems: [
      ["Something that genuinely bothers me is", "It bothers me because", "I notice I react whenever"],
      ["Someone I admire is", "What pulls me towards them is", "What they do that I'd want to do is"],
      ["The impact I'd want to have is", "Even a small version would be", "It would feel meaningful because"],
      ["What these have in common is", "That suggests I'm oriented towards", "The thread running through them is"],
    ],
    stuck: [
      ["What makes you angry when you see it? That's the clue.", "Local counts — it doesn't have to be a global cause."],
      ["Could be a teacher, a relative, an athlete, someone historical.", "It's the quality you admire that matters, not how famous they are."],
      ["Small is fine — meaningful isn't the same as large.", "Who specifically would be better off?"],
      ["Look for the repeated word or feeling across your three answers.", "If they seem unrelated, what's the need underneath all of them?"],
    ],
  },
  "contribution-map": {
    stems: [
      ["One of my strengths that could be useful here is", "Even in a small way, I could", "Where that strength already shows up is"],
      ["The value that feels most alive here is", "It connects because", "When I think about this cause I feel"],
      ["Something only I could bring is", "My particular combination means", "Most people wouldn't"],
      ["A tiny version would be", "I could start this week by", "It would take about"],
    ],
    stuck: [
      ["Look at your top strengths on the Me page.", "Useful doesn't mean impressive — think practical."],
      ["Which of your values would you be using if you acted on this?", "Which one would be violated if you ignored it?"],
      ["It's the combination that's unusual, not any single strength.", "What do people already come to you for?"],
      ["Make it small enough to do in an hour.", "What's the first step that doesn't need anyone's permission?"],
    ],
  },
  "the-other-side": {
    stems: [
      ["Someone who cares about this too is", "I noticed because", "We've never actually talked about it, but"],
      ["A group that exists around this is", "What I know about them is", "What I'd want to find out is"],
      ["Knowing others care makes me feel", "It changes how seriously I take it because", "On my own I tend to"],
      ["The people I'd want to be connected to are", "That community would look like", "My place in it would be"],
    ],
    stuck: [
      ["Loosely counts — someone who mentioned it once.", "Family counts too."],
      ["If you don't know of one, that's an answer — what would you search for?", "School clubs and local groups count."],
      ["Does it make it feel more real, or less like it's yours?", "Both reactions are honest."],
      ["What kind of people, not which specific people.", "Would you want to lead, help, or just belong?"],
    ],
  },
  "commitment-statement": {
    stems: [
      ["What I care about, specifically, is", "Not just that — more precisely,", "The part of it that grips me is"],
      ["This connects to my strength of", "My value of ___ shows up here because", "Who I am links to this because"],
      ["In relation to this I want to be someone who", "Not what I'll do — who I'll be:", "Even if nothing comes of it, I want to be"],
      ["I'd want them to understand that", "It matters to me because", "This isn't for show because"],
    ],
    stuck: [
      ["Add a 'specifically' to whatever you wrote first.", "Narrow it until it sounds like yours rather than anyone's."],
      ["Name the actual strength or value, not a general quality.", "Check your Me page if you can't remember them."],
      ["Character, not activity.", "Think 'reliable', 'brave', 'steady' rather than 'organise events'."],
      ["Why this, and not something else?", "What would you say if someone accused you of doing it for show?"],
    ],
  },

  // ── Mission 3 · Connection ─────────────────────────────────────────────────
  belonging: {
    stems: [
      ["Somewhere I feel genuinely accepted is", "What that relationship is like is", "I can tell because"],
      ["What they do is", "What they never do is", "That lets me"],
      ["Somewhere I don't quite fit is", "Sitting with that feels", "What I do about it is"],
      ["Belonging seems to require", "It's different from just being around people because", "Based on my experience,"],
    ],
    stuck: [
      ["Accepted, not just tolerated — what's the difference for you?", "Could be one person rather than a group."],
      ["Often it's what they don't do — no judgement, no repeating things.", "Think about how they react when you get something wrong."],
      ["Almost everyone has one — naming it isn't a weakness.", "Is it the place, or how you show up there?"],
      ["You've just described two situations — what separates them?", "Is it being known, being liked, or being useful?"],
    ],
  },
  "fitting-in-vs-belonging": {
    stems: [
      ["Where I feel most myself is", "What makes it possible is", "There I don't have to"],
      ["Where I adjust myself is", "What I do differently there is", "What I hold back is"],
      ["What fitting in costs me is", "The quieter cost is", "Over time that means"],
      ["A group where the cost is too high is", "Genuine belonging there would look like", "I'm not sure whether I belong in"],
    ],
    stuck: [
      ["No performance, no editing — where's that?", "It might be one person rather than a group."],
      ["What do you not say in that room?", "Do you change your humour, your opinions, or your volume?"],
      ["Not the obvious cost — the slow one.", "What do you lose by being slightly edited all the time?"],
      ["Deciding the cost is too high is a legitimate answer.", "What would have to change for it to be real?"],
    ],
  },
  "across-the-gap": {
    stems: [
      ["The person is", "The gap between us is", "Honestly, the difference is"],
      ["What made it possible was", "One of us had to", "The turning point was"],
      ["What this relationship gave me is", "An easier relationship couldn't have", "What I learned from them is"],
      ["A gap that feels too wide is", "A small step towards it would be", "What stops me is"],
    ],
    stuck: [
      ["Could be age, background, beliefs, or how you see the world.", "Don't shrink the gap to be polite."],
      ["Usually someone went first. Who?", "What did they do that let you relax?"],
      ["What can you only learn from someone unlike you?", "Has it changed an opinion you used to hold?"],
      ["Small step — a message, not a reconciliation.", "What's the smallest thing that wouldn't cost you much?"],
    ],
  },
  "people-who-shaped-you": {
    stems: [
      ["The people who left something lasting are", "What each of them gave me was", "Not the obvious choice, but"],
      ["What I carry from them is", "I notice it when", "The specific moment was"],
      ["A relationship that shaped me without my choosing was", "What it left in me is", "I'm still working out whether"],
      ["Together they say I'm becoming", "The fact these are my people suggests", "What that says about me is"],
    ],
    stuck: [
      ["Not necessarily who you love most — who changed something.", "Could include someone you no longer see."],
      ["A habit, a phrase, a way of looking at something.", "Where does it show up in an ordinary week?"],
      ["This one can be hard. Write only what you want to.", "Not all shaping is positive — that's worth naming."],
      ["Look for the pattern across all of them.", "What kind of person gets shaped by these particular people?"],
    ],
  },

  // ── Mission 4 · Meaning ────────────────────────────────────────────────────
  "future-self": {
    stems: [
      ["On an ordinary Tuesday at 21 I'm", "I'm probably living", "The people around me are"],
      ["By then I hope I've figured out", "Something I'm confused about now is", "I'd want to understand"],
      ["What I'd want to keep is", "I'd be sad to lose", "The part of me worth protecting is"],
      ["Something I could start now is", "Future me would be grateful if I", "Even a small version would be"],
    ],
    stuck: [
      ["Ordinary, not a highlight — what's the boring version?", "Where do you wake up, and what do you do first?"],
      ["What question about yourself would you most like answered?", "It's fine if it's something small."],
      ["What do people tend to lose between 15 and 21?", "Which of your current qualities do you value most?"],
      ["Start now — this week, not eventually.", "What compounds if you do it for six years?"],
    ],
  },
  "digital-self": {
    stems: [
      ["Where I spend most time online is", "How I show up there is", "It's different from real life because"],
      ["My feed mostly reflects", "It says I'm interested in", "That's accurate — or isn't — because"],
      ["Something I've said online I wouldn't say in person is", "What made that possible was", "Looking back I feel"],
      ["The most real version of me online is", "The most performed one is", "I perform it for"],
    ],
    stuck: [
      ["Pick one platform, not all of them.", "Are you louder or quieter online than off?"],
      ["Actually open it and scroll. What's the first thing you see?", "Is it who you are, or who you were six months ago?"],
      ["Distance and anonymity make things easier to say. Which was it?", "It doesn't have to be something bad."],
      ["Who is the audience for the performed version?", "Which version would you be happiest for a parent to scroll through?"],
    ],
  },
  "the-through-line": {
    stems: [
      ["From Mission 1 I learned", "It still feels true because", "My inner compass points towards"],
      ["What I actually care about is", "The honest version is", "What I want to contribute is"],
      ["Mission 3 told me that", "The relationships that matter most are", "Where I belong is"],
      ["Putting them together points towards", "A way of being, not a job:", "The life this suggests is"],
    ],
    stuck: [
      ["Check your strengths and values on the Me page.", "What surprised you most back then?"],
      ["Honest, not impressive.", "What would you still do if nobody ever knew?"],
      ["What kind of people, not which people.", "What does belonging require, for you?"],
      ["A way of being, not a career title.", "What would an ordinary week of that life look like?"],
    ],
  },
  "meaning-letter": {
    stems: [
      ["Who I am right now is", "Something I didn't know at the start is", "The real version, not the curated one, is"],
      ["What I genuinely care about is", "The contribution I want to make is", "The honest version is"],
      ["The people who matter to me are", "What belonging means to me is", "What I've learned about connection is"],
      ["The life I'm starting to build is", "I'd want future me to remember", "I chose it because"],
    ],
    stuck: [
      ["What changed in you across the four missions?", "Write to your future self, not to a teacher."],
      ["Drop the impressive version and write the true one.", "What would you still care about in ten years?"],
      ["Name them, at least to yourself.", "What do they give you that you couldn't get on your own?"],
      ["Life, not career or status.", "Why this, and not the default path?"],
    ],
  },
};

/**
 * The scaffold for one step of an activity. `quick` comes from the activity's
 * own starterOptions, which are authored alongside the questions in missions.ts.
 */
export function scaffoldForStep(
  activityId: string,
  stepIndex: number,
  starterOptions?: string[][]
): Scaffold {
  const s = MISSION_SCAFFOLDS[activityId];
  return {
    quick: starterOptions?.[stepIndex],
    stems: s?.stems[stepIndex],
    stuck: s?.stuck[stepIndex],
  };
}
