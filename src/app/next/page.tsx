import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getLifeStage } from "@/lib/lifeStageServer";
import { answerAt, LEFT_OUT_ANSWER } from "@/lib/journal";
import { NEXT_CHAPTER_ACTIVITY_ID } from "@/lib/nextChapter";
import NextChapterClient from "./NextChapterClient";

export const dynamic = "force-dynamic";

export default async function NextChapterPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const db = supabase as any;
  const latest = (activityId: string, fields = "response") =>
    db
      .from("journal_entries")
      .select(fields)
      .eq("user_id", user.id)
      .eq("activity_id", activityId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  const [lifeStage, { data: planRow }, { data: futureSelfRow }] = await Promise.all([
    getLifeStage(supabase, user.id),
    latest(NEXT_CHAPTER_ACTIVITY_ID, "id, response"),
    latest("future-self"),
  ]);

  // The Tuesday itself (Future Self's first answer), which is what the hoped-for
  // version of next year should be heading towards.
  const tuesday = answerAt(4, "future-self", futureSelfRow?.response as string | undefined, 0);

  return (
    <NextChapterClient
      userId={user.id}
      lifeStage={lifeStage}
      saved={(planRow as { id: string; response: string } | null) ?? null}
      futureSelf={tuesday && tuesday !== LEFT_OUT_ANSWER ? tuesday : null}
    />
  );
}
