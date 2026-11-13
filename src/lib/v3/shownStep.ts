// What a step shows about where it lives. v2 showed "Mission 2 — Purpose" and
// "Step 3 of 6"; v3 shows the part of the map ("Purpose — Believe in myself")
// in that group's colour, and no count. Only what is displayed changes: the
// mission id, the steps and every saved row stay exactly as v2 has them.

import { getMission, type Activity, type Mission } from "@/lib/missions";
import { GROUP_MISSION, levelOfPiece, withoutStepCount } from "./levelMap";

export function shownStep(mission: Mission, activity: Activity): { mission: Mission; activity: Activity } {
  const shownActivity = { ...activity, subtitle: withoutStepCount(activity.subtitle) };
  const place = levelOfPiece(activity.id);
  if (!place) return { mission, activity: shownActivity };
  const shade = getMission(GROUP_MISSION[place.group.key]);
  return {
    mission: {
      ...mission,
      title: place.level.name,
      subtitle: place.group.name,
      colour: shade?.colour ?? mission.colour,
      colourLight: shade?.colourLight ?? mission.colourLight,
      textColour: shade?.textColour ?? mission.textColour,
    },
    activity: shownActivity,
  };
}
