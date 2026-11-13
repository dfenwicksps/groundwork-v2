// The look of a level, taken from the master file (docs/v3/source): a soft
// band in the level's colour, "Imagine myself" in navy with dashed tiles, and
// "Authentic self" in yellow. The colours are fixed, not themed, so the map
// looks the same in every look the app offers.

import type { CSSProperties } from "react";
import type { MapLevel } from "@/lib/v3/levelMap";

export const NAVY = "#1B1640";
export const YELLOW = "#FFD23F";
export const INK = "#1E1E2A";

export type Tone = "soft" | "dark" | "bright";

export function toneOf(level: MapLevel): Tone {
  return level.level === 6 ? "dark" : level.level === 7 ? "bright" : "soft";
}

export function bandStyle(level: MapLevel): CSSProperties {
  const tone = toneOf(level);
  // The faint edge keeps the navy band visible on the dark looks.
  if (tone === "dark") return { background: NAVY, color: "#fff", border: "2px solid rgba(255,255,255,.16)" };
  if (tone === "bright") return { background: YELLOW, color: NAVY, border: `3px solid ${NAVY}` };
  return { background: level.band, color: INK };
}

/** The colour for a level's name and accents on its own band. */
export function accentOn(level: MapLevel): string {
  const tone = toneOf(level);
  return tone === "dark" ? "#fff" : tone === "bright" ? NAVY : level.colour;
}

/** A solid colour for buttons and pills that sit on white. */
export function solid(level: MapLevel): string {
  return level.colour;
}

export const display: CSSProperties = { fontFamily: "var(--font-display)" };

/** For headings on a fixed-colour band: the dark looks add a glow that blurs them there. */
export const onBand: CSSProperties = { fontFamily: "var(--font-display)", textShadow: "none" };
