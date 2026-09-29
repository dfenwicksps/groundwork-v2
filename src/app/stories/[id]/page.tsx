import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import AppShell from "@/components/layout/AppShell";
import StoryReflections from "@/components/stories/StoryReflections";
import StoryFilm from "@/components/stories/StoryFilm";
import { storyHasFilm } from "@/components/stories/films";

export const dynamic = 'force-dynamic';

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: _story } = await supabase
    .from("stories")
    .select("*")
    .eq("id", params.id)
    .single();
  const story = _story as import("@/types/database").Story | null;

  if (!story) notFound();

  const mission = MISSIONS.find((m) => m.id === story.mission_id);
  const hasFilm = storyHasFilm(story.title);

  const [{ data: _read }, { data: _written }] = await Promise.all([
    supabase
      .from("story_reads")
      .select("read_at, actioned_at")
      .eq("user_id", user.id)
      .eq("story_id", story.id)
      .maybeSingle(),
    supabase
      .from("journal_entries")
      .select("prompt")
      .eq("user_id", user.id)
      .eq("activity_id", "story-reflection")
      .in("prompt", story.reflection_prompts),
  ]);
  const read = _read as { read_at: string | null; actioned_at: string | null } | null;
  const writtenPrompts = ((_written as { prompt: string }[] | null) || []).map((w) => w.prompt);
  const complete = !!read?.read_at && !!read?.actioned_at;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 11L5 7l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All stories
        </Link>

        {/* Mission tag */}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-4"
          style={{ background: mission?.colour || "#4F46E5" }}
        >
          {mission?.subtitle} — {mission?.title}
        </div>

        {/* Title */}
        <h1
          className="text-3xl text-navy mb-6"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            lineHeight: 1.2,
          }}
          data-animate="1"
        >
          {story.title}
        </h1>

        {complete && (
          <div className="flex items-center gap-2 text-xs font-medium text-sage mb-6 -mt-3">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: "var(--sage)" }}
              aria-hidden="true"
            >
              ✓
            </span>
            Read and reflected on
          </div>
        )}

        {hasFilm ? (
          <div data-animate="2">
            <StoryFilm storyId={story.id} title={story.title} />
          </div>
        ) : (
          <>
            {/* Context */}
            <div data-animate="2">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                The situation
              </div>
              <div className="card p-6 mb-6">
                <p className="text-ink leading-relaxed">{story.context}</p>
              </div>
            </div>

            {/* Turning point */}
            <div data-animate="3">
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                The turning point
              </div>
              <div
                className="rounded-xl p-6 mb-6 border-l-4"
                style={{
                  borderLeftColor: mission?.colour || "#4F46E5",
                  background: "#FAFAF8",
                  borderTop: "1px solid #E8E8E4",
                  borderRight: "1px solid #E8E8E4",
                  borderBottom: "1px solid #E8E8E4",
                }}
              >
                <p className="text-ink leading-relaxed">{story.turning_point}</p>
              </div>
            </div>
          </>
        )}

        <StoryReflections
          storyId={story.id}
          missionId={story.mission_id}
          prompts={story.reflection_prompts}
          writtenPrompts={writtenPrompts}
          markReadOnView={!hasFilm}
        />

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-6">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-muted text-ink-muted border border-surface-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
