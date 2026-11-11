import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import MeClient from "./MeClient";
import { responseToHabits } from "@/lib/habits";
import { parseAnswers } from "@/lib/standard";
import { responseToCode, responseToStory, CHARACTER_CODE_ACTIVITY_ID } from "@/lib/program";
import { getLifeStage } from "@/lib/lifeStageServer";
import { resolvePhaseState } from "@/lib/phaseServer";
import { nextMissionStep, type ProgressRow } from "@/lib/missions";
import { BECOMING_ACTIVITY_ID, parseBecoming } from "@/lib/becoming";
import { answersOnly, clarifierValues } from "@/lib/journal";
import { truncate } from "@/lib/utils";
import { NEXT_CHAPTER_ACTIVITY_ID, parseNextChapter } from "@/lib/nextChapter";
import { checkinState, type CheckinRow } from "@/lib/checkin";
import type { SmallStepRow } from "@/lib/smallSteps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Me" };

export default async function MePage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  // Started alongside the rest; awaited where it's used.
  const planQuery = db
    .from("journal_entries")
    .select("response")
    .eq("user_id", user.id)
    .eq("activity_id", NEXT_CHAPTER_ACTIVITY_ID)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const [
    { data: profile },
    { data: strengthRow },
    { data: valuesRow },
    { data: moralRow },
    { data: goalsRaw, error: goalsError },
    { data: practiceRaw },
    { data: commitmentRow },
    { data: futureSelfRow },
    { data: habitRow },
    { data: focusRow },
    { data: standardRaw, error: standardError },
    { data: codeRow },
    { count: supportCount },
    { data: checkinRows, error: checkinError },
    { data: doneSteps, count: doneStepCount, error: stepsError },
  ] = await Promise.all([
    db.from("users").select("display_name").eq("id", user.id).single(),
    db
      .from("strength_profiles")
      .select("ranking, scores")
      .eq("user_id", user.id)
      .single(),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "values-clarifier")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("moral_profiles")
      .select("primary_style, secondary_style, style_scores, answers")
      .eq("user_id", user.id)
      .single(),
    db
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    db
      .from("practice_log")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(6),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "commitment-statement")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "future-self")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", "habit-check")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", BECOMING_ACTIVITY_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("standard_checkins")
      .select("id, answers, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("set", "standard")
      .order("created_at", { ascending: false })
      .limit(12),
    db
      .from("journal_entries")
      .select("response")
      .eq("user_id", user.id)
      .eq("activity_id", CHARACTER_CODE_ACTIVITY_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    db
      .from("support_circle")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    db
      .from("outcome_checkins")
      .select("wave, item_set, scores, created_at")
      .eq("user_id", user.id),
    db
      .from("small_steps")
      .select("id, step, when_label, source_label, status, due_at, snoozes, done_at, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "done")
      .order("done_at", { ascending: false })
      .limit(8),
  ]);

  const ranking: string[] | null = strengthRow?.ranking ?? null;
  const scores: Record<string, number> = strengthRow?.scores ?? {};
  const values = clarifierValues(valuesRow?.response as string | undefined);

  const practices = (practiceRaw || []) as {
    id: string;
    strength_key: string;
    action: string;
    started_at: string;
    completed_at: string | null;
    reflection: string | null;
  }[];
  const activePractice = practices.find((p) => !p.completed_at) || null;
  const recentPractices = practices.filter((p) => p.completed_at).slice(0, 3);

  const habitSaved = habitRow?.response
    ? responseToHabits(habitRow.response as string)
    : null;
  // Five qualities at 25 plus the one or two being worked on — the same record
  // program week 1 writes. parseBecoming also reads the pre-merge format, where
  // this entry held only one or two Boost keys.
  const becoming = parseBecoming(focusRow?.response as string | undefined);

  const standardCheckins = ((standardRaw || []) as any[]).map((c) => ({
    id: c.id as string,
    answers: parseAnswers(c.answers),
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
  }));

  const { data: planRow } = await planQuery;

  const phaseState = await resolvePhaseState(supabase, user.id);

  // In Phase 1 the banner's button goes straight to the next mission step,
  // as Home's "Up next" does. Only fetched when it's needed.
  let nextActivityHref: string | null = null;
  if (phaseState.phase === 1) {
    const { data: progressRows } = await db
      .from("mission_progress")
      .select("mission_id, activity_id, completed_at")
      .eq("user_id", user.id);
    const next = nextMissionStep((progressRows || []) as ProgressRow[]);
    if (next) nextActivityHref = `/missions/${next.mission.id}/activities/${next.activity.id}`;
  }

  return (
    <MeClient
      userId={user.id}
      displayName={profile?.display_name || ""}
      ranking={ranking}
      scores={scores}
      values={values}
      moralProfile={moralRow ?? null}
      goals={goalsRaw || []}
      activePractice={activePractice}
      recentPractices={recentPractices}
      commitmentExcerpt={
        truncate(
          answersOnly(2, "commitment-statement", commitmentRow?.response as string | undefined)
            .split("\n")[0],
          140
        ) || null
      }
      futureSelf={
        answersOnly(4, "future-self", futureSelfRow?.response as string | undefined) ||
        null
      }
      habitSaved={habitSaved}
      becoming={becoming}
      standardCheckins={standardCheckins}
      characterCode={responseToCode(codeRow?.response as string | undefined)}
      characterStory={responseToStory(codeRow?.response as string | undefined)}
      nextChapter={planRow?.response ? parseNextChapter(planRow.response as string) : null}
      // The Standard ships in migration 004 — same graceful degradation as
      // featuresReady below, so students on an un-migrated database see
      // "coming soon" rather than a save-time error.
      standardReady={
        !standardError ||
        !/find the table|does not exist|schema cache/i.test(
          standardError.message || ""
        )
      }
      supportCount={supportCount ?? 0}
      // Missing table (migration 020): the section hides itself.
      stepsTaken={stepsError ? null : { steps: (doneSteps || []) as SmallStepRow[], total: doneStepCount ?? 0 }}
      // A read error means migration 013 hasn't run: the section hides itself.
      checkin={checkinState(checkinError ? null : ((checkinRows || []) as CheckinRow[]))}
      lifeStage={await getLifeStage(supabase, user.id)}
      phase={phaseState.phase}
      reviewedAnchors={phaseState.reviewed}
      nextActivityHref={nextActivityHref}
      // If the goals table errors, the 003 migration hasn't run — the moral
      // compass, practice loop and goals need it, so we hide those rather than
      // let students hit save-time errors that read as "the app is broken".
      featuresReady={
        !goalsError ||
        !/find the table|does not exist|schema cache/i.test(goalsError.message || "")
      }
    />
  );
}
