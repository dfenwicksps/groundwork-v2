import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import WeekClient from "./WeekClient";
import {
  WEEK_BY_NUMBER,
  PROGRAM_WEEKS,
  parseDays,
  responseToCode,
  commitmentToLines,
  CHARACTER_CODE_ACTIVITY_ID,
  type WeekProgress,
} from "@/lib/program";
import { topStrengths, strengthName } from "@/lib/strengths";
import {
  BECOMING_ACTIVITY_ID,
  parseBecoming,
  toStrengthKey,
  EMPTY_BECOMING,
} from "@/lib/becoming";
import { responseToHabits } from "@/lib/habits";
import { parseYearLevel, YEAR_COOKIE } from "@/lib/yearLevel";

export const dynamic = "force-dynamic";

export default async function WeekPage({
  params,
}: {
  params: { week: string };
}) {
  const weekNum = Number(params.week);
  const week = WEEK_BY_NUMBER[weekNum];
  if (!week) notFound();

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const yearLevel = parseYearLevel(cookies().get(YEAR_COOKIE)?.value) ?? "middle";

  // Weeks that are built on Mission 1's work read it rather than linking to it;
  // week 10 reads back weeks 1 and 2. Both need every week's row, so the query
  // is by user rather than by week and the current week is picked out below.
  const needsCompass = !!week.source || week.week === 10;
  // Week 1's challenge IS the profile's "Who I'm becoming" record, so the week
  // reads it rather than keeping its own copy. The habit check supplies the
  // 🌱 suggestions the profile picker has always had.
  // Week 10 needs it too: it reads the earlier artefacts back, and week 1's is
  // the shared record rather than a column of raw keys.
  const needsBecoming = week.artefact?.kind === "qualities" || week.week === 10;

  const [
    { data: rows, error: progressError },
    { data: codeRow },
    { data: strengthRow },
    { data: valuesRow },
    { data: becomingRow },
    { data: habitRow },
  ] = await Promise.all([
    db.from("program_progress").select("*").eq("user_id", user.id),
    // Only week 10 needs it, but fetching alongside keeps this a single round trip
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", CHARACTER_CODE_ACTIVITY_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    needsCompass
      ? db
          .from("strength_profiles")
          .select("ranking")
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    needsCompass
      ? db
          .from("journal_entries")
          .select("response")
          .eq("user_id", user.id)
          .eq("activity_id", "values-clarifier")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
    needsBecoming
      ? db
          .from("journal_entries")
          .select("response")
          .eq("user_id", user.id)
          .eq("activity_id", BECOMING_ACTIVITY_ID)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
    needsBecoming
      ? db
          .from("journal_entries")
          .select("response")
          .eq("user_id", user.id)
          .eq("activity_id", "habit-check")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const allRows = (rows || []) as any[];
  const row = allRows.find((r) => r.week === weekNum) ?? null;

  const progress: WeekProgress | null = row
    ? {
        week: row.week,
        days: parseDays(row.days),
        commitment: row.commitment ?? null,
        reflection: row.reflection ?? null,
        completed_at: row.completed_at ?? null,
        started_at: row.started_at,
      }
    : null;

  // A missing row is a normal "not started yet" .single() error, not a broken
  // database — only a missing table means the migration is outstanding.
  const ready =
    !progressError ||
    !/find the table|does not exist|schema cache/i.test(
      progressError.message || ""
    );

  // The inner compass, as the missions produced it. `strengths` is what week 1
  // shows instead of the link it used to carry; `values` is what week 2 puts
  // the behaviour boxes next to.
  const ranking = (strengthRow as { ranking: string[] } | null)?.ranking || [];
  const strengths = ranking.length ? topStrengths(ranking, 5) : [];
  const values = ((valuesRow as { response: string } | null)?.response || "")
    .split("\n")
    .map((l) => l.split(":")[0].trim())
    .filter(Boolean)
    .slice(0, 5);

  const becoming = becomingRow
    ? parseBecoming((becomingRow as { response: string }).response)
    : EMPTY_BECOMING;

  // Week 10 is the only week that reads other weeks — the code is meant to be
  // written from the evidence, and until now that evidence lived nowhere.
  const earlier =
    week.week === 10
      ? PROGRAM_WEEKS.filter((w) => w.artefact)
          .map((w) => {
            const r = allRows.find((x) => x.week === w.week);
            return {
              week: w.week,
              heading: w.artefact!.heading,
              // Week 1 stores VIA keys, and only as a completion receipt — the
              // live answer is the shared record, so read that and show names.
              items:
                w.artefact!.kind === "qualities"
                  ? becoming.qualities.map(strengthName)
                  : commitmentToLines(r?.commitment),
            };
          })
          .filter((x) => x.items.length > 0)
      : [];

  // The habit check names Boost keys; the picker speaks VIA, so translate.
  const habitResponse = (habitRow as { response: string } | null)?.response;
  const suggestedQualities = Array.from(
    new Set(
      // responseToHabits returns null for an unparseable entry.
      ((habitResponse ? responseToHabits(habitResponse) : null)?.result.grows ?? [])
        .map((g) => toStrengthKey(g.quality))
        .filter((k): k is string => !!k)
    )
  );

  return (
    <WeekClient
      userId={user.id}
      week={week}
      progress={progress}
      savedCode={responseToCode(codeRow?.response as string | undefined)}
      compass={{
        strengths: strengths.map(strengthName),
        strengthKeys: strengths,
        values,
      }}
      becoming={becoming}
      suggestedQualities={suggestedQualities}
      earlier={earlier}
      yearLevel={yearLevel}
      ready={ready}
    />
  );
}
