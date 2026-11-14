// Where a journal entry sits on the map. v2 filed entries under its four
// missions, "Ten weeks" and "Me tab"; in v3 every step and week lives in a
// level (levelMap.ts), so an entry is filed under its level's group. What was
// written outside the map (The Standard, habits, goals and the rest of Me)
// is filed under "me".

import { GROUP_MISSION, LEVEL_MAP, levelOfPiece, type GroupKey, type MapGroup, type MapLevel } from "./levelMap";

export type JournalGroup = GroupKey | "me";

export interface JournalPlace {
  group: JournalGroup;
  /** "Identity", or "Me" for entries from outside the map. */
  groupName: string;
  /** Null for "me", and for a story reflection, which belongs to a group but no one level. */
  level: MapLevel | null;
}

const ME: JournalPlace = { group: "me", groupName: "Me", level: null };

function placeOf(found: { group: MapGroup; level: MapLevel }): JournalPlace {
  return { group: found.group.key, groupName: found.group.name, level: found.level };
}

export function journalPlace(activityId: string, missionId: number): JournalPlace {
  const base = activityId.replace(/-(debrief|revisit)$/, "");
  const piece = levelOfPiece(base);
  if (piece) return placeOf(piece);

  const week = activityId.match(/^program-week-(\d+)$/);
  if (week) {
    const found = levelOfPiece(`week-${week[1]}`);
    if (found) return placeOf(found);
  }
  // The Character Code is what Week 10 makes.
  if (activityId === "character-code") {
    const found = levelOfPiece("week-10");
    if (found) return placeOf(found);
  }
  // A story reflection is stored with the mission it was read in.
  if (activityId === "story-reflection") {
    const group = LEVEL_MAP.filter((g) => GROUP_MISSION[g.key] === missionId)[0];
    if (group) return { group: group.key, groupName: group.name, level: null };
  }
  return ME;
}

/** The filters, in map order, with "me" last. */
export const JOURNAL_GROUPS: { key: JournalGroup; name: string }[] = LEVEL_MAP.map(
  (g): { key: JournalGroup; name: string } => ({ key: g.key, name: g.name })
).concat([{ key: "me", name: "Me" }]);
