import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { MISSIONS } from "@/lib/missions";
import { missionsCompleted } from "@/lib/missionProgress";
import { spineFor } from "@/lib/spine";
import { parseYearLevel, YEAR_COOKIE } from "@/lib/yearLevel";
import MissionsClient from "./MissionsClient";

export const dynamic = "force-dynamic";

/**
 * The missions index.
 *
 * The nav's "Missions" tab used to point at /missions/1 because this page
 * didn't exist — so a student on Mission 4 who tapped Missions landed on a
 * mission they finished months ago, and the two tracks were asymmetric: "This
 * Week" opened an overview of all ten weeks, "Missions" opened one specific
 * mission. This is the missing half of that pair.
 */
export default async function MissionsIndexPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const [{ data: profileRaw }, { data: progressRaw }] = await Promise.all([
    db.from("users").select("active_mission").eq("id", user.id).single(),
    db.from("mission_progress").select("mission_id, activity_id").eq("user_id", user.id),
  ]);

  const rows = (progressRaw || []) as { mission_id: number; activity_id: string }[];
  const activeMission =
    (profileRaw as { active_mission?: number } | null)?.active_mission ?? 1;

  const missions = MISSIONS.map((m) => {
    const total = m.activities.filter((a) => !a.locked).length;
    const done = Math.min(
      new Set(
        rows.filter((r) => r.mission_id === m.id).map((r) => r.activity_id)
      ).size,
      total
    );
    return {
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      question: m.question,
      description: m.description,
      colour: m.colour,
      phaseLabel: m.phaseLabel,
      done,
      total,
      complete: total > 0 && done >= total,
    };
  });

  return (
    <MissionsClient
      missions={missions}
      activeMission={activeMission}
      spine={spineFor(
        parseYearLevel(cookies().get(YEAR_COOKIE)?.value) ?? "middle",
        missionsCompleted(rows)
      )}
    />
  );
}
