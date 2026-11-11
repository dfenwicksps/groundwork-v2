// ─── Fluoro blocks (Bold look) ───────────────────────────────────────────────
// A card with data-fluoro={colour} is a solid fluoro block in the Bold look
// and an ordinary card in Light and Dark (globals.css, "Fluoro blocks").
// Missions use data-mission instead, so a mission keeps its own colour.

export const FLUORO = ["pink", "blue", "green", "yellow", "orange", "violet"] as const;
export type Fluoro = (typeof FLUORO)[number];

/** The i-th colour, wrapping round: for lists that take turns. */
export function fluoroAt(i: number): Fluoro {
  return FLUORO[((i % FLUORO.length) + FLUORO.length) % FLUORO.length];
}
