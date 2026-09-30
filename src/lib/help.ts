// ─── Getting help ─────────────────────────────────────────────────────────────
// One list of services, used by the Support page, the "Need to talk?" sheet and
// the support card shown after writing. Australian services, chosen so that
// every student from 13 to 23 has at least one that's plainly for them — Kids
// Helpline covers to 25, but a 21-year-old won't assume so from the name.

export interface HelpLine {
  name: string;
  /** Digits as dialled; `display` is how the number is written. */
  tel: string;
  display: string;
  who: string;
  url?: string;
}

export const HELP_LINES: HelpLine[] = [
  {
    name: "Kids Helpline",
    tel: "1800551800",
    display: "1800 55 1800",
    who: "Ages 5 to 25. Free, 24/7, by phone or webchat.",
    url: "https://kidshelpline.com.au",
  },
  {
    name: "Lifeline",
    tel: "131114",
    display: "13 11 14",
    who: "Any age. Free, 24/7. You can also text 0477 13 11 14.",
    url: "https://www.lifeline.org.au",
  },
  {
    name: "13YARN",
    tel: "139276",
    display: "13 92 76",
    who: "For Aboriginal and Torres Strait Islander people. Free, 24/7.",
    url: "https://www.13yarn.org.au",
  },
  {
    name: "QLife",
    tel: "1800184527",
    display: "1800 184 527",
    who: "For LGBTIQ+ people. 3pm to midnight, every day.",
    url: "https://qlife.org.au",
  },
];

export const EMERGENCY = { tel: "000", display: "000" };

// Phrases that mean a student may be at risk, checked on their own device when
// they save something they wrote. Nothing is sent or stored: a match only shows
// the support card. Kept to explicit phrasings, so a reflection about a hard
// week doesn't trip it — a false positive costs a kind card, a miss costs more,
// but a card that appears for everything stops being read.
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill(ing)? my ?self\b/i,
  /\bend (it all|my life)\b/i,
  /\b(want|wanted|wanting) to die\b/i,
  /\bdon'?t want to (be alive|live|exist|be here anymore)\b/i,
  /\bno (reason|point) (to live|in living)\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bself[- ]?harm/i,
  /\b(cut|cutting|harm|harming) my ?self\b/i,
  // Not bare "hurt myself", which is also how a sports injury is described.
  /\bhurt(ing)? my ?self on purpose\b/i,
  /\b(want|wanted|wanting|thought about|think about|thinking about) (to )?hurt(ing)? my ?self\b/i,
  /\b(not|don'?t feel) safe at home\b/i,
  // A person as the subject, so "it hit me that…" doesn't match.
  /\b(he|she|they|dad|mum|mom|my (dad|mum|mom|stepdad|stepmum|stepmom|parents?|boyfriend|girlfriend|partner|brother|sister)) (hits|hit|beats|beat|hurts|abuses|abused) me\b/i,
  /\bbeing abused\b/i,
];

export function mentionsCrisis(text: string | null | undefined): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((p) => p.test(text));
}
