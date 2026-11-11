// ─── Age bands and rating ceilings ───────────────────────────────────────────
// Spec section 8: a student's year level decides the highest classification
// Groundwork will show them. There is no date of birth anywhere (D8); the year
// level, copied from the student's class, is the only age signal.
//
//   Year level   Student mode,   Student mode, if the   Lesson mode
//                by default      school enables it
//   7–8          G, PG           M                      the school's film policy
//   9–10         G, PG           M                      the school's film policy
//   11–12        G, PG, M        MA15+                  the school's film policy
//
// The third column is a hard limit. A school can lower a band's ceiling, and
// can raise it as far as that column, and no further: whatever a school's
// settings say, allowedRatings() never returns a rating above it. That holds
// in lesson mode too. The spec gives lesson mode to "the school's film
// policy" without a cap; a policy that put MA15+ in front of Year 8 would be
// a mistake in the settings, not a decision this code should carry out
// (docs/v3/DECISIONS.md, D25).
//
// M is "not recommended for under 15s"; MA15+ is legally restricted for under
// 15s. R 18+ and X 18+ are not representable here at all.
//
// Pure functions, no imports beyond types. Nothing in v2 uses this file.

import type { AgeBand, Rating, YearLevel } from "./content";

/** Lowest to highest. A ceiling of M allows G, PG and M. */
export const RATING_ORDER: readonly Rating[] = ["G", "PG", "M", "MA15+"];

export type RatingMode = "student" | "lesson";

export interface AgeBandRule {
  band: AgeBand;
  yearLevels: readonly YearLevel[];
  /** About how old, for the people reading the table. Never used to decide anything. */
  ages: string;
  /** Student mode when the school has set nothing. */
  defaultCeiling: Rating;
  /** The most a school can enable, in either mode. */
  maxCeiling: Rating;
}

export const AGE_BANDS: readonly AgeBandRule[] = [
  { band: "7-8", yearLevels: [7, 8], ages: "about 12–14", defaultCeiling: "PG", maxCeiling: "M" },
  { band: "9-10", yearLevels: [9, 10], ages: "about 14–16", defaultCeiling: "PG", maxCeiling: "M" },
  { band: "11-12", yearLevels: [11, 12], ages: "about 16–18", defaultCeiling: "M", maxCeiling: "MA15+" },
];

/**
 * When the year level isn't known: a student with no class, or a value that
 * isn't 7 to 12. The lowest default, and nothing a school setting can raise.
 */
export const UNKNOWN_BAND_CEILING: Rating = "PG";

/**
 * The part of a school's settings that concerns ratings. It comes out of a
 * JSON column, so every value is treated as possibly wrong: anything that
 * isn't one of the four ratings is ignored.
 */
export interface SchoolRatingSettings {
  /** Student mode: the highest rating shown to each band. Missing means the band's default. */
  studentCeiling?: Partial<Record<AgeBand, Rating>> | null;
  /** Lesson mode: the school's film policy, as the highest rating a teacher may project to each band. */
  filmPolicy?: Partial<Record<AgeBand, Rating>> | null;
}

export function isRating(v: unknown): v is Rating {
  return typeof v === "string" && (RATING_ORDER as readonly string[]).includes(v);
}

/** The band for a year level, or null when it isn't a whole number from 7 to 12. */
export function ageBandFor(yearLevel: number | null | undefined): AgeBandRule | null {
  if (typeof yearLevel !== "number") return null;
  return AGE_BANDS.find((b) => (b.yearLevels as readonly number[]).includes(yearLevel)) ?? null;
}

function lower(a: Rating, b: Rating): Rating {
  return RATING_ORDER.indexOf(a) <= RATING_ORDER.indexOf(b) ? a : b;
}

/** A setting for one band, if the school has set a real rating for it. */
function setting(map: unknown, band: AgeBand): Rating | null {
  if (!map || typeof map !== "object") return null;
  const v = (map as Record<string, unknown>)[band];
  return isRating(v) ? v : null;
}

/**
 * The highest rating this student may be shown.
 *
 * - Student mode: the school's ceiling for the band if it set one, otherwise
 *   the band's default.
 * - Lesson mode: the school's film policy for the band if it set one,
 *   otherwise the band's default (the same as student mode with nothing set).
 * - Either way, never above the band's maximum.
 * - Year level unknown: G and PG, and school settings can only lower that.
 */
export function ratingCeiling(
  yearLevel: number | null | undefined,
  schoolSettings: SchoolRatingSettings | null | undefined,
  mode: RatingMode
): Rating {
  const rule = ageBandFor(yearLevel);
  const settings = schoolSettings && typeof schoolSettings === "object" ? schoolSettings : null;

  if (!rule) {
    // No band, so no school figure applies to this student by name. If the
    // school has lowered every band below PG, respect the lowest it set.
    const maps = settings ? [mode === "lesson" ? settings.filmPolicy : settings.studentCeiling] : [];
    let ceiling = UNKNOWN_BAND_CEILING;
    for (const m of maps) {
      for (const b of AGE_BANDS) {
        const s = setting(m, b.band);
        if (s) ceiling = lower(ceiling, s);
      }
    }
    return ceiling;
  }

  const chosen = setting(mode === "lesson" ? settings?.filmPolicy : settings?.studentCeiling, rule.band);
  return lower(chosen ?? rule.defaultCeiling, rule.maxCeiling);
}

/**
 * Every rating this student may be shown, lowest first. Always includes G.
 * Never includes a rating above the band's maximum, whatever the settings say.
 */
export function allowedRatings(
  yearLevel: number | null | undefined,
  schoolSettings: SchoolRatingSettings | null | undefined,
  mode: RatingMode
): Rating[] {
  const ceiling = ratingCeiling(yearLevel, schoolSettings, mode);
  return RATING_ORDER.slice(0, RATING_ORDER.indexOf(ceiling) + 1);
}

/** What the caller needs to know about a media record to decide whether to show it. */
export interface RatedMedia {
  type: "video" | "song" | "book" | "film";
  rating: Rating;
  /** For a clip: the rating of the film or show it comes from. */
  sourceTitleRating?: Rating | null;
  minYearLevel: number;
}

/**
 * Whether a record may be shown to this student.
 *
 * A clip is judged on its own rating: a G-rated clip from an MA15+ film can
 * be shown. A full film ("watch with family") is judged on the film's rating.
 */
export function mayShow(
  media: RatedMedia,
  yearLevel: number | null | undefined,
  schoolSettings: SchoolRatingSettings | null | undefined,
  mode: RatingMode
): boolean {
  const allowed = allowedRatings(yearLevel, schoolSettings, mode);
  if (!isRating(media.rating) || !allowed.includes(media.rating)) return false;
  // An unknown year level passes no minimum except the lowest.
  const level = ageBandFor(yearLevel) ? (yearLevel as number) : 7;
  return level >= media.minYearLevel;
}

/**
 * The second rule for film titles (spec section 8): Groundwork never suggests
 * watching a whole film rated above the student's ceiling, even when the clip
 * from it is suitable. True when the clip's source title may be named as
 * something to go and watch; false means show the clip without the suggestion.
 */
export function maySuggestFullTitle(
  media: Pick<RatedMedia, "rating" | "sourceTitleRating">,
  yearLevel: number | null | undefined,
  schoolSettings: SchoolRatingSettings | null | undefined,
  mode: RatingMode
): boolean {
  const title = media.sourceTitleRating ?? media.rating;
  return isRating(title) && allowedRatings(yearLevel, schoolSettings, mode).includes(title);
}
