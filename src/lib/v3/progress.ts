// What the signed-in student has finished, as the ids the map uses. Read
// through row security, so it is only ever their own (V-S1).

import { createServerClient } from "@/lib/supabase-server";
import { parseSuggested, type Suggested } from "./selfCheck";

export interface StudentContext {
  userId: string;
  name: string | null;
  doneIds: string[];
  /** "9B with Ms Nguyen", joined with " · " when in more than one class. */
  classLine: string | null;
  /** The student's self-checks, newest first (at most two). Their own rows only. */
  checks: { takenAt: string; suggested: Suggested }[];
}

export async function getStudentContext(): Promise<StudentContext | null> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = supabase as any;
  const [{ data: profile }, { data: steps }, { data: weeks }, { data: classes }, { data: checks }] = await Promise.all([
    db.from("users").select("display_name").eq("id", user.id),
    db.from("mission_progress").select("activity_id").eq("user_id", user.id),
    db.from("program_progress").select("week, completed_at").eq("user_id", user.id),
    db.rpc("my_classes"),
    db.from("self_checks").select("taken_at, suggested").eq("student_id", user.id).order("taken_at", { ascending: false }).limit(2),
  ]);

  const doneIds: string[] = [];
  for (const r of (steps ?? []) as { activity_id: string }[]) doneIds.push(r.activity_id);
  for (const r of (weeks ?? []) as { week: number; completed_at: string | null }[]) {
    if (r.completed_at) doneIds.push(`week-${r.week}`);
  }
  const mine = (classes ?? []) as { class_name: string; teacher_name: string | null }[];

  return {
    userId: user.id,
    name: ((profile ?? [])[0]?.display_name as string | null) ?? null,
    doneIds,
    classLine: mine.length
      ? mine.map((c) => `${c.class_name}${c.teacher_name ? ` with ${c.teacher_name}` : ""}`).join(" · ")
      : null,
    checks: ((checks ?? []) as { taken_at: string; suggested: unknown }[]).map((c) => ({
      takenAt: c.taken_at,
      suggested: parseSuggested(c.suggested),
    })),
  };
}
