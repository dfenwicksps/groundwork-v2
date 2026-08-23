import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import WeekClient from "./WeekClient";
import {
  WEEK_BY_NUMBER,
  parseDays,
  responseToCode,
  CHARACTER_CODE_ACTIVITY_ID,
  type WeekProgress,
} from "@/lib/program";
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

  const [{ data: row, error: progressError }, { data: codeRow }] =
    await Promise.all([
      db
        .from("program_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("week", weekNum)
        .single(),
      // Only week 10 needs it, but fetching alongside keeps this a single round trip
      db
        .from("journal_entries")
        .select("response")
        .eq("user_id", user.id)
        .eq("activity_id", CHARACTER_CODE_ACTIVITY_ID)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

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

  return (
    <WeekClient
      userId={user.id}
      week={week}
      progress={progress}
      savedCode={responseToCode(codeRow?.response as string | undefined)}
      yearLevel={yearLevel}
      ready={ready}
    />
  );
}
