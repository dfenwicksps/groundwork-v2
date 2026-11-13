// What the signed-in student has finished, as the ids the map uses. Read
// through row security, so it is only ever their own (V-S1).

import { createServerClient } from "@/lib/supabase-server";

export interface StudentContext {
  userId: string;
  name: string | null;
  doneIds: string[];
  /** "9B with Ms Nguyen", joined with " · " when in more than one class. */
  classLine: string | null;
}

export async function getStudentContext(): Promise<StudentContext | null> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = supabase as any;
  const [{ data: profile }, { data: steps }, { data: weeks }, { data: classes }] = await Promise.all([
    db.from("users").select("display_name").eq("id", user.id),
    db.from("mission_progress").select("activity_id").eq("user_id", user.id),
    db.from("program_progress").select("week, completed_at").eq("user_id", user.id),
    db.rpc("my_classes"),
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
  };
}
