export type LearningMode = "starter" | "advanced";

const KEY = "groundwork_learning_mode";

/**
 * The app defaults to "starter" mode — multiple-choice answers where the user
 * picks what they align with — because open-ended reflection is hard for many
 * teenagers. "advanced" mode opens up the open-ended written reflections.
 */
export function getLearningMode(): LearningMode {
  if (typeof window === "undefined") return "starter";
  return localStorage.getItem(KEY) === "advanced" ? "advanced" : "starter";
}

export function setLearningMode(mode: LearningMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, mode);
}
