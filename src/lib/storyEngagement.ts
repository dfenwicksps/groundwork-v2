import { createClient } from "@/lib/supabase";

// Client-side helpers for the story_reads table. Each sets exactly one of the
// three timestamps (opened_at, read_at, actioned_at); upsert with onConflict merges only the provided columns, so
// marking a story read never clears actioned_at and vice versa. Both are
// fire-and-forget: losing a tick to a flaky connection is acceptable, getting
// in the way of the story or the student's writing is not.

async function stamp(storyId: string, column: "opened_at" | "read_at" | "actioned_at") {
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

// Story ids are database ids; the landing page's film plays with a stand-in id
// and nobody signed in, so it's never stamped.
const STORY_ID = /^[0-9a-f-]{36}$/i;

/**
 * The student opened the story (its page loaded, or its film started). Only
 * totals are ever read from this (migration 021). Before that migration the
 * column doesn't exist; the write fails quietly, like any other stamp.
 */
export function markStoryOpened(storyId: string) {
  if (!STORY_ID.test(storyId)) return;
  void stamp(storyId, "opened_at");
}

/** The student reached the end of the story (or finished its animated telling). */
export function markStoryRead(storyId: string) {
  void stamp(storyId, "read_at");
}

/** The student saved a written reflection on one of the story's prompts. */
export function markStoryActioned(storyId: string) {
  void stamp(storyId, "actioned_at");
}
