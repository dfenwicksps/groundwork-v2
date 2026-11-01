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
}

interface Sources {
  ranking: string[] | null | undefined;
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
}

function said(activityId: string, response: string | null | undefined, index: number, missionId = 1): string {
  const a = answerAt(missionId, activityId, response, index);
  return a === LEFT_OUT_ANSWER ? "" : a;
}

export function buildIdentityCard({ ranking, responses, challenge }: Sources): IdentityCard {
  const pieces: IdentityPiece[] = [
    {
      key: "chapter",
      label: "The chapter I'm in",
      activityId: "chapters-so-far",
      stepTitle: "Your Story So Far",
      text: said("chapters-so-far", responses["chapters-so-far"], 1),
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
      text: said("mask-check", responses["mask-check"], 3),
      chips: [],
    },
    {
      key: "letter",
      label: "A true thing about me",
      activityId: "identity-letter",
      stepTitle: "Identity Letter",
      text: said("identity-letter", responses["identity-letter"], 3),
      chips: [],
    },
    {
      key: "experiment",
      label: "My experiment",
      activityId: "weekly-challenge",
      stepTitle: "Mission Challenge",
      text: challenge.debriefed
        ? "Tried it, and told myself the truth about how it went"
        : challenge.accepted
          ? "Accepted, and trying it this week"
          : "",
      chips: [],
    },
    {
      key: "constant",
      label: "Still me since I was little",
      activityId: "conversation-who-i-was",
      stepTitle: "Who Was I?",
      text: said("conversation-who-i-was", responses["conversation-who-i-was"], 3),
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
    text: said(activityId, responses[activityId], index, 2),
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
      text: challenge.debriefed
        ? "Did one real thing about it, and told myself how it went"
        : challenge.accepted
          ? "Picked one thing to do about it this week"
          : "",
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
