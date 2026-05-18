export type ProcessingStyle = "informational" | "normative" | "diffuse-avoidant";

const KEY = "groundwork_style";

export function getProcessingStyle(): ProcessingStyle | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(KEY);
  if (val === "informational" || val === "normative" || val === "diffuse-avoidant") {
    return val;
  }
  return null;
}

export function setProcessingStyle(style: ProcessingStyle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, style);
}

/**
 * Tally an array of style votes and return the majority.
 * Ties are broken: informational > normative > diffuse-avoidant
 * (most engaged style wins ties, reducing false diffuse-avoidant classification).
 */
export function tallyStyle(votes: ProcessingStyle[]): ProcessingStyle {
  const counts: Record<ProcessingStyle, number> = {
    informational: 0,
    normative: 0,
    "diffuse-avoidant": 0,
  };
  for (const v of votes) counts[v]++;
  if (counts.informational >= counts.normative && counts.informational >= counts["diffuse-avoidant"]) {
    return "informational";
  }
  if (counts.normative >= counts["diffuse-avoidant"]) {
    return "normative";
  }
  return "diffuse-avoidant";
}
