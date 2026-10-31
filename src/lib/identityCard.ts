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
}

interface Sources {
  ranking: string[] | null | undefined;
  responses: Record<string, string | null | undefined>;
  challenge: { accepted: boolean; debriefed: boolean };
}

function said(activityId: string, response: string | null | undefined, index: number): string {
  const a = answerAt(1, activityId, response, index);
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
