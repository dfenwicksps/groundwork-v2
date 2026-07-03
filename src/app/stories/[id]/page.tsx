import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import AppShell from "@/components/layout/AppShell";

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

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
          style={{ background: mission?.colour || "#1B3A5C" }}
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
              borderLeftColor: mission?.colour || "#1B3A5C",
              background: "#FAFAF8",
              borderTop: "1px solid #E8E8E4",
              borderRight: "1px solid #E8E8E4",
              borderBottom: "1px solid #E8E8E4",
            }}
          >
            <p className="text-ink leading-relaxed">{story.turning_point}</p>
          </div>
        </div>

        {/* Reflection prompts */}
        <div data-animate="4">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Reflect on this
          </div>
          <div className="space-y-3">
            {story.reflection_prompts.map((prompt, i) => (
              <div key={i} className="card p-5">
                <p className="text-sm text-ink leading-relaxed mb-3">
                  {prompt}
                </p>
                <Link
                  href={`/missions/${story.mission_id}/activities/${
                    mission?.activities[0]?.id || "strengths-mapping"
                  }?prompt=${encodeURIComponent(prompt)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
                >
                  Write about this
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

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
