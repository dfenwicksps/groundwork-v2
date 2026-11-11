import { describe, expect, it } from "vitest";
import {
  AGE_BANDS,
  RATING_ORDER,
  ageBandFor,
  allowedRatings,
  maySuggestFullTitle,
  mayShow,
  ratingCeiling,
  type RatingMode,
  type SchoolRatingSettings,
} from "./ageBands";
import type { AgeBand, Rating } from "./content";

const YEARS = [7, 8, 9, 10, 11, 12];
const MODES: RatingMode[] = ["student", "lesson"];
const BANDS: AgeBand[] = ["7-8", "9-10", "11-12"];

/** Spec section 8's "if the school enables it" column, written out by hand. */
const MAX_FOR_YEAR: Record<number, Rating[]> = {
  7: ["G", "PG", "M"],
  8: ["G", "PG", "M"],
  9: ["G", "PG", "M"],
  10: ["G", "PG", "M"],
  11: ["G", "PG", "M", "MA15+"],
  12: ["G", "PG", "M", "MA15+"],
};

const all = (r: Rating): Partial<Record<AgeBand, Rating>> => ({ "7-8": r, "9-10": r, "11-12": r });

describe("the table from spec section 8", () => {
  it("has three bands covering Years 7 to 12 once each", () => {
    expect(AGE_BANDS.map((b) => b.band)).toEqual(BANDS);
    expect(AGE_BANDS.flatMap((b) => b.yearLevels)).toEqual(YEARS);
  });

  it.each([
    [7, "7-8"],
    [8, "7-8"],
    [9, "9-10"],
    [10, "9-10"],
    [11, "11-12"],
    [12, "11-12"],
  ])("puts Year %i in band %s", (year, band) => {
    expect(ageBandFor(year)?.band).toBe(band);
  });

  it.each([
    [7, ["G", "PG"]],
    [8, ["G", "PG"]],
    [9, ["G", "PG"]],
    [10, ["G", "PG"]],
    [11, ["G", "PG", "M"]],
    [12, ["G", "PG", "M"]],
  ])("student mode, Year %i, nothing set by the school: %j", (year, expected) => {
    expect(allowedRatings(year, null, "student")).toEqual(expected);
    expect(allowedRatings(year, {}, "student")).toEqual(expected);
    expect(allowedRatings(year, undefined, "student")).toEqual(expected);
  });

  it.each([
    [7, ["G", "PG", "M"]],
    [8, ["G", "PG", "M"]],
    [9, ["G", "PG", "M"]],
    [10, ["G", "PG", "M"]],
    [11, ["G", "PG", "M", "MA15+"]],
    [12, ["G", "PG", "M", "MA15+"]],
  ])("student mode, Year %i, school enables the most it can: %j", (year, expected) => {
    expect(allowedRatings(year, { studentCeiling: all("MA15+") }, "student")).toEqual(expected);
  });

  it("M for Years 7 to 10 only when the school enables it", () => {
    expect(allowedRatings(9, { studentCeiling: { "9-10": "M" } }, "student")).toEqual(["G", "PG", "M"]);
    // Enabling it for one band doesn't enable it for another.
    expect(allowedRatings(8, { studentCeiling: { "9-10": "M" } }, "student")).toEqual(["G", "PG"]);
  });

  it("MA15+ for Years 11 and 12 only when the school enables it", () => {
    expect(allowedRatings(11, null, "student")).not.toContain("MA15+");
    expect(allowedRatings(11, { studentCeiling: { "11-12": "MA15+" } }, "student")).toContain("MA15+");
  });
});

describe("a school can lower a ceiling", () => {
  it("to G only", () => {
    for (const year of YEARS) {
      expect(allowedRatings(year, { studentCeiling: all("G") }, "student")).toEqual(["G"]);
    }
  });

  it("takes M away from Years 11 and 12", () => {
    expect(allowedRatings(12, { studentCeiling: { "11-12": "PG" } }, "student")).toEqual(["G", "PG"]);
  });
});

describe("lesson mode follows the school's film policy", () => {
  it("uses filmPolicy, not studentCeiling", () => {
    const s: SchoolRatingSettings = { studentCeiling: { "9-10": "G" }, filmPolicy: { "9-10": "M" } };
    expect(allowedRatings(9, s, "lesson")).toEqual(["G", "PG", "M"]);
    expect(allowedRatings(9, s, "student")).toEqual(["G"]);
  });

  it("falls back to the band's default when the school has no film policy", () => {
    expect(allowedRatings(9, null, "lesson")).toEqual(["G", "PG"]);
    expect(allowedRatings(12, { studentCeiling: { "11-12": "MA15+" } }, "lesson")).toEqual(["G", "PG", "M"]);
  });

  it("is still capped at the band's maximum", () => {
    expect(allowedRatings(8, { filmPolicy: all("MA15+") }, "lesson")).toEqual(["G", "PG", "M"]);
    expect(allowedRatings(12, { filmPolicy: all("MA15+") }, "lesson")).toEqual(["G", "PG", "M", "MA15+"]);
  });
});

describe("never above the 'if the school enables it' column, whatever the settings say", () => {
  // Every value a settings JSON column could plausibly hold for one band,
  // including ones that aren't ratings at all.
  const VALUES: unknown[] = [
    undefined,
    null,
    "G",
    "PG",
    "M",
    "MA15+",
    "R18+",
    "R 18+",
    "X18+",
    "ma15+",
    "MA",
    "",
    "anything",
    0,
    4,
    99,
    true,
    [],
    {},
    ["MA15+"],
    { rating: "MA15+" },
  ];

  it("holds for every year level, mode and combination of settings", () => {
    let checked = 0;
    for (const year of YEARS) {
      for (const mode of MODES) {
        for (const a of VALUES) {
          for (const b of VALUES) {
            // The same odd value in every band, in both maps, in every pairing.
            const settings = {
              studentCeiling: { "7-8": a, "9-10": a, "11-12": a },
              filmPolicy: { "7-8": b, "9-10": b, "11-12": b },
            } as unknown as SchoolRatingSettings;
            const got = allowedRatings(year, settings, mode);
            for (const r of got) expect(MAX_FOR_YEAR[year]).toContain(r);
            expect(got[0]).toBe("G");
            checked++;
          }
        }
      }
    }
    expect(checked).toBe(YEARS.length * MODES.length * VALUES.length * VALUES.length);
  });

  it("holds when the settings object itself is the wrong shape", () => {
    const shapes: unknown[] = [
      "MA15+",
      42,
      [],
      { studentCeiling: "MA15+", filmPolicy: "MA15+" },
      { studentCeiling: ["MA15+"], filmPolicy: 7 },
      { studentCeiling: { "7-12": "MA15+", all: "MA15+" } },
      { ceiling: "MA15+" },
    ];
    for (const year of YEARS) {
      for (const mode of MODES) {
        for (const s of shapes) {
          const got = allowedRatings(year, s as SchoolRatingSettings, mode);
          for (const r of got) expect(MAX_FOR_YEAR[year]).toContain(r);
        }
      }
    }
  });

  it("never returns a rating that isn't one of the four", () => {
    for (const year of [...YEARS, 0, 6, 13, NaN]) {
      for (const mode of MODES) {
        for (const r of allowedRatings(year, { studentCeiling: all("MA15+"), filmPolicy: all("MA15+") }, mode)) {
          expect(RATING_ORDER).toContain(r);
        }
      }
    }
  });

  it("ignores a setting that isn't a rating, and uses the default", () => {
    const s = { studentCeiling: { "9-10": "R18+" } } as unknown as SchoolRatingSettings;
    expect(allowedRatings(9, s, "student")).toEqual(["G", "PG"]);
  });
});

describe("when the year level isn't known", () => {
  const unknown: unknown[] = [null, undefined, 0, 6, 13, 9.5, NaN, -9, "9", Infinity];

  it("has no band", () => {
    for (const y of unknown) expect(ageBandFor(y as number)).toBeNull();
  });

  it("allows G and PG and nothing a school setting can raise", () => {
    for (const y of unknown) {
      for (const mode of MODES) {
        expect(allowedRatings(y as number, null, mode)).toEqual(["G", "PG"]);
        expect(
          allowedRatings(y as number, { studentCeiling: all("MA15+"), filmPolicy: all("MA15+") }, mode)
        ).toEqual(["G", "PG"]);
      }
    }
  });

  it("still respects a school that has lowered its ceiling", () => {
    expect(allowedRatings(null, { studentCeiling: all("G") }, "student")).toEqual(["G"]);
  });
});

describe("ratingCeiling", () => {
  it("is the last of the allowed ratings", () => {
    for (const year of YEARS) {
      for (const mode of MODES) {
        const allowed = allowedRatings(year, null, mode);
        expect(ratingCeiling(year, null, mode)).toBe(allowed[allowed.length - 1]);
      }
    }
  });
});

describe("mayShow", () => {
  const clip = (rating: Rating, minYearLevel = 7) => ({ type: "video" as const, rating, minYearLevel });

  it("shows a PG clip to Year 9 and holds back an M clip", () => {
    expect(mayShow(clip("PG"), 9, null, "student")).toBe(true);
    expect(mayShow(clip("M"), 9, null, "student")).toBe(false);
  });

  it("shows the M clip once the school enables M", () => {
    expect(mayShow(clip("M"), 9, { studentCeiling: { "9-10": "M" } }, "student")).toBe(true);
  });

  it("never shows MA15+ to Year 10, whatever the school sets", () => {
    const s: SchoolRatingSettings = { studentCeiling: all("MA15+"), filmPolicy: all("MA15+") };
    expect(mayShow(clip("MA15+"), 10, s, "student")).toBe(false);
    expect(mayShow(clip("MA15+"), 10, s, "lesson")).toBe(false);
  });

  it("holds back a record whose minimum year level is above the student's", () => {
    expect(mayShow(clip("G", 9), 8, null, "student")).toBe(false);
    expect(mayShow(clip("G", 9), 9, null, "student")).toBe(true);
  });

  it("treats an unknown year level as the youngest", () => {
    expect(mayShow(clip("G", 7), null, null, "student")).toBe(true);
    expect(mayShow(clip("G", 8), null, null, "student")).toBe(false);
  });

  it("refuses a record with a rating it doesn't know", () => {
    expect(mayShow({ type: "video", rating: "R18+" as Rating, minYearLevel: 7 }, 12, null, "student")).toBe(false);
  });
});

describe("the second rule for film titles", () => {
  // Spec section 8's example: a G-rated clip from an MA15+ film.
  const clipFromMa15Film = { type: "video" as const, rating: "G" as Rating, sourceTitleRating: "MA15+" as Rating, minYearLevel: 7 };

  it("shows the clip but doesn't suggest the film to Year 9", () => {
    expect(mayShow(clipFromMa15Film, 9, null, "student")).toBe(true);
    expect(maySuggestFullTitle(clipFromMa15Film, 9, null, "student")).toBe(false);
  });

  it("doesn't suggest it to Year 9 even when the school enables everything it can", () => {
    expect(maySuggestFullTitle(clipFromMa15Film, 9, { studentCeiling: all("MA15+") }, "student")).toBe(false);
  });

  it("suggests it to Year 12 only when the school has enabled MA15+", () => {
    expect(maySuggestFullTitle(clipFromMa15Film, 12, null, "student")).toBe(false);
    expect(maySuggestFullTitle(clipFromMa15Film, 12, { studentCeiling: { "11-12": "MA15+" } }, "student")).toBe(true);
  });

  it("judges a record with no source title on its own rating", () => {
    expect(maySuggestFullTitle({ rating: "PG" }, 7, null, "student")).toBe(true);
    expect(maySuggestFullTitle({ rating: "M" }, 7, null, "student")).toBe(false);
  });
});
