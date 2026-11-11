"use client";

import { useEffect } from "react";
import { markStoryOpened } from "@/lib/storyEngagement";

/** Records that this story's page was opened (totals only; migration 021). */
export default function StoryOpened({ storyId }: { storyId: string }) {
  useEffect(() => {
    markStoryOpened(storyId);
  }, [storyId]);
  return null;
}
