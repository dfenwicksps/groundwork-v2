// ─── Life stage ───────────────────────────────────────────────────────────────
// A light personalisation signal captured at onboarding: where the student is
// right now. Groundwork is for 13 to 23 year olds, so it covers the school
// years and the first years after them. Never gates anything — it only tunes
// emphasis and examples (a Year 12 wants pathways and goals first; a Year 9
// wants character-building first and careers de-emphasised; someone a few years
// out of school wants examples about work and rent, not homework).
//
// The school stages keep the keys they had when this was "year level", so
// existing cookies and code paths mean what they always did.

export type LifeStage = "junior" | "middle" | "senior" | "leaver" | "adult";

export interface LifeStageOption {
  key: LifeStage;
  label: string;
  sub: string;
  group: "school" | "left";
}

export const LIFE_STAGE_OPTIONS: LifeStageOption[] = [
  { key: "junior", label: "Year 7–9", sub: "Getting started", group: "school" },
  { key: "middle", label: "Year 10–11", sub: "Figuring it out", group: "school" },
  { key: "senior", label: "Year 12", sub: "Nearly there", group: "school" },
  { key: "leaver", label: "Just left school", sub: "Uni, TAFE, work or a gap year", group: "left" },
  { key: "adult", label: "Finding my feet", sub: "A few years out of school", group: "left" },
];

const STAGES = new Set<string>(LIFE_STAGE_OPTIONS.map((o) => o.key));

/** Stages past school — they share examples and wording about work and study. */
export function hasLeftSchool(stage: LifeStage): boolean {
  return stage === "leaver" || stage === "adult";
}

/** Stages for whom "what's next" is the live question, so future work leads. */
export function futureFirst(stage: LifeStage): boolean {
  return stage === "senior" || hasLeftSchool(stage);
}

/**
 * The age Mission 4's Future Self pictures. Written as 21 for Year 10–12,
 * which is a different life but a visible one. It moves with the student
 * either side: asking someone who is already 21 to imagine being 21 makes the
 * step meaningless, and for a twelve-year-old 21 is too far off to picture in
 * any detail, so Year 7–9 picture 16, the end of school in sight.
 */
export function futureSelfAge(stage: LifeStage): number {
  if (stage === "adult") return 28;
  if (stage === "leaver") return 25;
  if (stage === "junior") return 16;
  return 21;
}

/**
 * The age week 1's five qualities are chosen for. 25 is far enough ahead for
 * anyone at school or just out of it; a few years out, it's too close to be a
 * direction.
 */
export function becomingAge(stage: LifeStage): number {
  return stage === "adult" ? 30 : 25;
}

// The cookie keeps its old name so existing students' choices still read. It's
// now a fallback: the account's users.life_stage is the source of truth, and
// the cookie is still written so the app behaves the same if that column hasn't
// been added yet.
export const LIFE_STAGE_COOKIE = "gw_year";

export function parseLifeStage(v: string | undefined | null): LifeStage | null {
  return v && STAGES.has(v) ? (v as LifeStage) : null;
}

/** Client-side setter (writes the cookie the server reads on the next request). */
export function setLifeStageCookie(stage: LifeStage): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LIFE_STAGE_COOKIE}=${stage}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/** Client-side getter (for pre-filling the Settings control). */
export function getLifeStageCookie(): LifeStage | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LIFE_STAGE_COOKIE}=([^;]+)`));
  return parseLifeStage(m?.[1]);
}

/**
 * Save a student's choice to their account, and to the cookie as a fallback.
 * A failed account write is left silent: the cookie still carries the choice on
 * this device.
 */
export async function saveLifeStage(
  db: any,
  userId: string,
  stage: LifeStage
): Promise<void> {
  setLifeStageCookie(stage);
  await db.from("users").update({ life_stage: stage }).eq("id", userId);
}
