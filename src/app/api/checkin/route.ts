import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getLifeStage } from "@/lib/lifeStageServer";
import { MISSIONS, requiredDone } from "@/lib/missions";
import { missionsCompleted } from "@/lib/missionProgress";
import { CHARACTER_CODE_ACTIVITY_ID } from "@/lib/program";
import {
  CHECKIN_ITEMS,
  ITEM_SET,
  complete,
  endDue,
  score,
  type Answers,
  type CheckinContext,
  type Dose,
  type Wave,
} from "@/lib/checkin";

/**
 * Saves a check-in. It goes through the server rather than straight from the
 * browser so the parts that make it evaluable can be trusted: the answers are
 * validated and scored here, the dose (how much of the app the student had
 * used) is read from the database at the moment of answering, and the timing
 * rules (one start, an end only once it's due) are enforced.
 */
export async function POST(req: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    wave?: Wave;
    answers?: Answers;
    context?: CheckinContext;
  } | null;
  const wave = body?.wave;
  const context: CheckinContext = body?.context === "onboarding" ? "onboarding" : "home";
  // Only the known items, only whole numbers 1–5.
  const answers: Answers = {};
  for (const { key } of CHECKIN_ITEMS) {
    const v = Number(body?.answers?.[key]);
    if (Number.isInteger(v) && v >= 1 && v <= 5) answers[key] = v;
  }
  if ((wave !== "start" && wave !== "end") || !complete(answers)) {
    return NextResponse.json({ error: "Incomplete check-in" }, { status: 400 });
  }

  const db = supabase as any;
  const [
    { data: existing, error: tableError },
    { data: progress },
    { data: weeks },
    { count: codeCount },
    { data: profile },
    lifeStage,
  ] = await Promise.all([
    db.from("outcome_checkins").select("wave, created_at").eq("user_id", user.id),
    db.from("mission_progress").select("mission_id, activity_id").eq("user_id", user.id),
    db.from("program_progress").select("week, completed_at").eq("user_id", user.id),
    db
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("activity_id", CHARACTER_CODE_ACTIVITY_ID),
    db.from("users").select("created_at").eq("id", user.id).maybeSingle(),
    getLifeStage(supabase, user.id),
  ]);
  if (tableError) {
    return NextResponse.json({ error: "The check-in isn't switched on yet." }, { status: 503 });
  }

  const rows = (existing || []) as { wave: Wave; created_at: string }[];
  const startAt = rows.find((r) => r.wave === "start")?.created_at ?? null;
  if (wave === "start" && startAt) {
    return NextResponse.json({ error: "Already done" }, { status: 409 });
  }
  if (wave === "end" && !endDue({ startAt, endDone: rows.some((r) => r.wave === "end") })) {
    return NextResponse.json({ error: "Not due yet" }, { status: 409 });
  }

  const progressRows = (progress || []) as { mission_id: number; activity_id: string }[];
  const joined = (profile as { created_at?: string } | null)?.created_at;
  const dose: Dose = {
    requiredStepsDone: MISSIONS.reduce(
      (sum, m) =>
        sum + requiredDone(m, progressRows.filter((p) => p.mission_id === m.id).map((p) => p.activity_id)),
      0
    ),
    missionsDone: missionsCompleted(progressRows),
    weeksDone: ((weeks || []) as { completed_at: string | null }[]).filter((w) => w.completed_at).length,
    codeWritten: (codeCount ?? 0) > 0,
    daysSinceJoined: joined ? Math.floor((Date.now() - new Date(joined).getTime()) / 86_400_000) : null,
  };

  const scores = score(answers);
  const row = {
    user_id: user.id,
    wave,
    item_set: ITEM_SET,
    answers,
    scores,
    life_stage: lifeStage,
  };
  let { error } = await db.from("outcome_checkins").insert({ ...row, context, dose });
  // Migration 014 not run yet: keep the answers rather than lose them.
  if (error && /context|dose|column/i.test(error.message || "")) {
    ({ error } = await db.from("outcome_checkins").insert(row));
  }
  if (error) {
    return NextResponse.json({ error: "Couldn't save the check-in." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, scores });
}
