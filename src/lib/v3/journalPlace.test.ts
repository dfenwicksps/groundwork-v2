import { describe, expect, it } from "vitest";
import { MISSIONS } from "@/lib/missions";
import { PROGRAM_WEEKS } from "@/lib/program";
import { JOURNAL_GROUPS, journalPlace } from "./journalPlace";
import { levelOfPiece } from "./levelMap";

describe("journalPlace", () => {
  it("files every mission step under the level the map puts it in", () => {
    for (const m of MISSIONS) {
      for (const a of m.activities) {
        const place = journalPlace(a.id, m.id);
        expect(place.level?.key, a.id).toBe(levelOfPiece(a.id)?.level.key);
        expect(place.group, a.id).toBe(levelOfPiece(a.id)?.group.key);
      }
    }
  });

  it("follows the map, not the old mission, for a step that moved", () => {
    // The map decides, whatever mission the entry was stored with.
    expect(journalPlace("where-ive-come-from", 2).level?.key).toBe(levelOfPiece("where-ive-come-from")?.level.key);
    expect(journalPlace("digital-self", 1).group).toBe("meaning");
  });

  it("files debriefs and revisits with the step they belong to", () => {
    expect(journalPlace("weekly-challenge-debrief", 1).level?.key).toBe("know-myself");
    expect(journalPlace("belonging-revisit", 3).level?.key).toBe("value-myself");
  });

  it("files every week, and the Character Code, under the week's level", () => {
    for (const w of PROGRAM_WEEKS) {
      expect(journalPlace(`program-week-${w.week}`, 1).level?.key, `week ${w.week}`).toBe(
        levelOfPiece(`week-${w.week}`)?.level.key
      );
    }
    expect(journalPlace("character-code", 1).level?.key).toBe("authentic-self");
  });

  it("files a story reflection under its group, with no level", () => {
    expect(journalPlace("story-reflection", 3)).toMatchObject({ group: "connection", level: null });
  });

  it("files everything from outside the map under Me", () => {
    for (const id of ["the-standard", "habit-check", "goal-checkin", "weekly-five", "next-chapter", "something-unknown"]) {
      expect(journalPlace(id, 1).group, id).toBe("me");
    }
  });

  it("offers the four groups in map order, then Me", () => {
    expect(JOURNAL_GROUPS.map((g) => g.key)).toEqual(["identity", "connection", "purpose", "meaning", "me"]);
  });
});
