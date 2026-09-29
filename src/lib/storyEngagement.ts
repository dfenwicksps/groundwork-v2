import { createClient } from "@/lib/supabase";

// Client-side helpers for the story_reads table. Each sets exactly one of the
// two timestamps; upsert with onConflict merges only the provided columns, so
// marking a story read never clears actioned_at and vice versa. Both are
// fire-and-forget: losing a tick to a flaky connection is acceptable, getting
// in the way of the story or the student's writing is not.

async function stamp(storyId: string, column: "read_at" | "actioned_at") {
  try {
    const db = createClient() as any;
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return;
    await db
      .from("story_reads")
      .upsert(
        { user_id: user.id, story_id: storyId, [column]: new Date().toISOString() },
        { onConflict: "user_id,story_id" }
      );
  } catch {
    // Non-essential telemetry — never surface this to the student.
  }
}

/** The student reached the end of the story (or finished its animated telling). */
export function markStoryRead(storyId: string) {
  void stamp(storyId, "read_at");
}

/** The student saved a written reflection on one of the story's prompts. */
export function markStoryActioned(storyId: string) {
  void stamp(storyId, "actioned_at");
}
