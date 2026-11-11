// ─── Ask by link ──────────────────────────────────────────────────────────────
// The conversation steps ask a student to put a few questions to someone else.
// Not every student can sit down with that person: a grandparent interstate, a
// parent on night shift, an aunt who'd rather write than talk. So a student can
// make a private link instead and send it themselves, by text, email or
// whatever that person uses. The person answers on /ask/[token] with no
// account, and the answers come back into the step to read and write up.
//
// The app sends nothing and keeps no contact details: only who the student
// said it was for ("Grandma") and the name the person signed with. A link
// works once and lasts 30 days (migration 017).

export const ASK_LINK_DAYS = 30;
/** Open links per step: enough for Mum, Dad and a grandparent, not a mailing list. */
export const MAX_OPEN_LINKS = 5;

export interface ConversationRequest {
  id: string;
  token: string;
  for_label: string;
  from_name: string;
  questions: string[];
  answers: string[] | null;
  responder_name: string | null;
  created_at: string;
  expires_at: string;
  answered_at: string | null;
  seen_at: string | null;
}

/**
 * What the step is about, finishing "{name} would love to hear from you
 * about…", for the person answering. Keyed by activity id.
 */
export const ASK_TOPICS: Record<string, { about: string; message: string }> = {
  "conversation-who-i-was": {
    about: "what they were like when they were little",
    message: "what I was like when I was little",
  },
  "conversation-what-matters": {
    about: "something you care about, and how you got started",
    message: "something you care about and how you got into it",
  },
  "conversation-family-story": {
    about: "your family's story",
    message: "our family's story",
  },
  "conversation-path": {
    about: "how you ended up where you are",
    message: "how you ended up where you are",
  },
};

export function canAskByLink(activityId: string): boolean {
  return activityId in ASK_TOPICS;
}

export function askUrl(origin: string, token: string): string {
  return `${origin}/ask/${token}`;
}

/** The message the student sends, in their voice. They can edit it before sending. */
export function shareMessage(activityId: string, forLabel: string, url: string): string {
  const topic = ASK_TOPICS[activityId]?.message ?? "a few things about me";
  const hi = forLabel.trim() ? `Hi ${forLabel.trim()}! ` : "Hi! ";
  return `${hi}I'm using an app called Groundwork to work out who I am, and one step is asking someone about ${topic}. Could you answer a few questions for me? It takes about 10 minutes and only I'll see what you write: ${url}`;
}

export type RequestState = "waiting" | "answered" | "expired";

export function requestState(r: Pick<ConversationRequest, "answered_at" | "expires_at">, now = Date.now()): RequestState {
  if (r.answered_at) return "answered";
  return new Date(r.expires_at).getTime() <= now ? "expired" : "waiting";
}

/** The first word of a display name: what a grandparent would call them. */
export function firstName(displayName: string | null | undefined): string {
  return (displayName ?? "").trim().split(/\s+/)[0]?.slice(0, 40) ?? "";
}
