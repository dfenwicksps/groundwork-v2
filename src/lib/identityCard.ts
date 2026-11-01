// ─── Who I Am card ────────────────────────────────────────────────────────────
// Mission 1 used to end with nothing to show for it: the summary of what the
// missions found only appears on the dashboard once all four are done, so a
// student finished "Who am I?" and was never shown an answer. Teenagers who
// don't see a result quickly stop.
//
// The card is that answer, and it builds as they go: one piece per step, each
// filled the moment the step is saved, so the payoff of a step is visible on
// the mission page straight away rather than three missions later.
//
// Deliberately leaves out the Mask Check's hidden part and anything from the
// optional Parts of Who You Are: a card is something a student may show or
// screenshot, so it only carries things they'd say out loud.

import { answerAt, clarifierValues, LEFT_OUT_ANSWER } from "./journal";
import { strengthName, topStrengths } from "./strengths";
import { getActivity } from "./missions";
import { activityForStage } from "./stageContent";
import type { LifeStage } from "./lifeStage";

export interface IdentityPiece {
  key: string;
  /** What this piece of the card is, in the student's voice */
  label: string;
  /** The step that fills it */
  activityId: string;
  stepTitle: string;
  /** One line, or a list of chips; empty until the step is done */
  text: string;
  chips: string[];
}

export interface IdentityCard {
  pieces: IdentityPiece[];
  filled: number;
  /** Which mission's card this is; the Who I Am card is Mission 1's. */
  missionId?: number;
  title?: string;
  /** Shown once every piece is filled */
  doneText?: string;
  /** A link shown once every piece is filled (Mission 4's card opens My Story) */
  doneLink?: { href: string; text: string };
}

interface Sources {
  ranking: string[] | null | undefined;
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
  stage?: LifeStage;
}

/**
 * One answer from an entry, read against the questions as this student saw
 * them (a stage can reword them), or "" if it was left out.
 */
function said(
  activityId: string,
  response: string | null | undefined,
  index: number,
  missionId = 1,
  stage?: LifeStage
): string {
  const base = getActivity(missionId, activityId);
  const questions = base && stage ? activityForStage(base, stage).scaffoldingSteps : undefined;
  const a = answerAt(missionId, activityId, response, index, questions);
  return a === LEFT_OUT_ANSWER ? "" : a;
}

/** A challenge's check-in can say it didn't happen, so the card never claims it did. */
function challengeText(c: { accepted: boolean; debriefed: boolean }, accepted: string): string {
  return c.debriefed ? "Checked in afterwards on how it went" : c.accepted ? accepted : "";
}

export function buildIdentityCard({ ranking, responses, challenge, stage }: Sources): IdentityCard {
  const pieces: IdentityPiece[] = [
    {
      key: "chapter",
      label: "The chapter I'm in",
      activityId: "chapters-so-far",
      stepTitle: "Your Story So Far",
      text: said("chapters-so-far", responses["chapters-so-far"], 1, 1, stage),
      chips: [],
    },
    {
      key: "strengths",
      label: "My top strengths",
      activityId: "strengths-mapping",
      stepTitle: "Strengths Mapping",
      text: "",
      chips: topStrengths(ranking ?? [], 5).map(strengthName),
    },
    {
      key: "values",
      label: "What matters most to me",
      activityId: "values-clarifier",
      stepTitle: "Values Clarifier",
      text: "",
      chips: clarifierValues(responses["values-clarifier"]).slice(0, 5),
    },
    {
      key: "real",
      label: "Where I can just be me",
      activityId: "mask-check",
      stepTitle: "The Mask Check",
      text: said("mask-check", responses["mask-check"], 3, 1, stage),
      chips: [],
    },
    {
      key: "letter",
      label: "A true thing about me",
      activityId: "identity-letter",
      stepTitle: "Identity Letter",
      text: said("identity-letter", responses["identity-letter"], 3, 1, stage),
      chips: [],
    },
    {
      key: "experiment",
      label: "My experiment",
      activityId: "weekly-challenge",
      stepTitle: "Mission Challenge",
      text: challengeText(challenge, "Accepted, and trying it this week"),
      chips: [],
    },
    {
      key: "constant",
      label: "Still me since I was little",
      activityId: "conversation-who-i-was",
      stepTitle: "Who Was I?",
      text: said("conversation-who-i-was", responses["conversation-who-i-was"], 3, 1, stage),
      chips: [],
    },
  ];
  return {
    pieces,
    filled: pieces.filter((p) => p.text || p.chips.length).length,
  };
}

/** The activities whose latest entries the card reads. */
export const IDENTITY_CARD_SOURCES = [
  "chapters-so-far",
  "values-clarifier",
  "mask-check",
  "identity-letter",
  "conversation-who-i-was",
];

// ─── Purpose card ─────────────────────────────────────────────────────────────
// Mission 2's version: what they care about, what they bring, who else cares,
// the milestone sentence, the experiment, and what they heard from someone
// further down the road. Same rules as the Who I Am card: one piece per step,
// filled when the step is saved, and nothing they'd keep to themselves.

export const PURPOSE_CARD_SOURCES = [
  "what-matters",
  "contribution-map",
  "the-other-side",
  "commitment-statement",
  "conversation-what-matters",
];

export function buildPurposeCard({
  responses,
  challenge,
  stage,
}: {
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
  stage: LifeStage;
}): IdentityCard {
  const explore = stage === "junior"; // Year 7–9 explore rather than commit
  const piece = (key: string, label: string, activityId: string, stepTitle: string, index: number): IdentityPiece => ({
    key,
    label,
    activityId,
    stepTitle,
    text: said(activityId, responses[activityId], index, 2, stage),
    chips: [],
  });
  const pieces: IdentityPiece[] = [
    piece("cares", "What pulls at me", "what-matters", "What Matters", 0),
    piece("bring", "What I could bring", "contribution-map", "The Contribution Map", 2),
    piece("people", "Who else cares", "the-other-side", "Who Else Cares", 0),
    explore
      ? piece("stand", "What I want to explore", "commitment-statement", "What I Want to Explore", 0)
      : piece("stand", "What I stand for", "commitment-statement", "Commitment Statement", 0),
    {
      key: "step",
      label: "My first step",
      activityId: "purpose-challenge",
      stepTitle: "Mission Challenge",
      text: challengeText(challenge, "Picked one thing to do about it this week"),
      chips: [],
    },
    piece("heard", "What I heard from someone else", "conversation-what-matters", "What They Care About", 3),
  ];
  return {
    pieces,
    filled: pieces.filter((p) => p.text).length,
    missionId: 2,
    title: "My purpose",
    doneText: explore
      ? "Mission 2 done. This is what you care about and what you want to explore next. It's meant to change as you try things."
      : "Mission 2 done. This is what you care about and what you can bring to it, for now. It can grow and change with you.",
  };
}

// ─── Connection card ──────────────────────────────────────────────────────────
// Mission 3's version: where they belong, who could belong more because of
// them, someone across a real difference, the people who shaped them, their
// reach-out, and something handed down in their family. Never the hard-shaping
// question from Step 4: a card is something a student may show.

export const CONNECTION_CARD_SOURCES = [
  "belonging",
  "fitting-in-vs-belonging",
  "across-the-gap",
  "people-who-shaped-you",
  "conversation-family-story",
];

export function buildConnectionCard({
  responses,
  challenge,
  stage,
}: {
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
  stage: LifeStage;
}): IdentityCard {
  const piece = (key: string, label: string, activityId: string, stepTitle: string, index: number): IdentityPiece => ({
    key,
    label,
    activityId,
    stepTitle,
    text: said(activityId, responses[activityId], index, 3, stage),
    chips: [],
  });
  const pieces: IdentityPiece[] = [
    piece("belong", "Where I belong", "belonging", "Where You Belong", 0),
    piece("room", "Someone I'm making room for", "fitting-in-vs-belonging", "Fitting In vs. Belonging", 3),
    piece("gap", "Someone across the gap", "across-the-gap", "Across the Gap", 0),
    piece("shaped", "People who shaped me", "people-who-shaped-you", "The People Who Shaped You", 0),
    {
      key: "reach",
      label: "My reach-out",
      activityId: "connection-challenge",
      stepTitle: "Mission Challenge",
      text: challengeText(challenge, "Reaching toward someone this week"),
      chips: [],
    },
    piece("handed", "Handed down in my family", "conversation-family-story", "Where We Come From", 2),
  ];
  return {
    pieces,
    filled: pieces.filter((p) => p.text).length,
    missionId: 3,
    title: "My people",
    doneText:
      "Mission 3 done. This is where you belong and who's part of your story, for now. It will change as people come and go, and that's normal.",
  };
}

// ─── Direction card ───────────────────────────────────────────────────────────
// Mission 4's version, in step order: something kept (reworked) from what they
// were handed, where they're most real online, an ordinary day in the future,
// the thread, the direction, the deliberate choice, and what someone else's
// path told them. Never the turning point from Step 1, which can be painful.
// Finished, it hands over to My Story, which joins all four missions up.

export const DIRECTION_CARD_SOURCES = [
  "where-ive-come-from",
  "digital-self",
  "future-self",
  "the-through-line",
  "meaning-letter",
  "conversation-path",
];

export function buildDirectionCard({
  responses,
  challenge,
  stage,
}: {
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
  stage: LifeStage;
}): IdentityCard {
  const piece = (key: string, label: string, activityId: string, stepTitle: string, index: number): IdentityPiece => ({
    key,
    label,
    activityId,
    stepTitle,
    text: said(activityId, responses[activityId], index, 4, stage),
    chips: [],
  });
  const pieces: IdentityPiece[] = [
    piece("kept", "Something I'm keeping, my way", "where-ive-come-from", "Where You've Come From", 3),
    piece("online", "Where I'm most real online", "digital-self", "Digital Self", 3),
    piece("tuesday", "An ordinary day, a few years on", "future-self", "Future Self", 0),
    piece("thread", "My thread", "the-through-line", "The Through-Line", 3),
    piece("direction", "My direction", "meaning-letter", "A Life Worth Building", 0),
    {
      key: "choice",
      label: "My deliberate choice",
      activityId: "meaning-challenge",
      stepTitle: "Mission Challenge",
      text: challengeText(challenge, "Making one choice on purpose this week"),
      chips: [],
    },
    piece("path", "What someone's path told me", "conversation-path", "How They Chose", 3),
  ];
  return {
    pieces,
    filled: pieces.filter((p) => p.text).length,
    missionId: 4,
    title: "My direction",
    doneText:
      "All four missions done. Your story so far, from where you've come from to where you're heading, is joined up in one place.",
    doneLink: { href: "/story", text: "Open My Story →" },
  };
}
