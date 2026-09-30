"use client";

import { useState } from "react";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { cn } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";
import { storyHasFilm } from "@/components/stories/films";

interface StoryPreview {
  id: string;
  mission_id: number;
  title: string;
  teaser: string;
  tags: string[];
}

interface StoryReadState {
  story_id: string;
  read_at: string | null;
  actioned_at: string | null;
}

export default function StoriesClient({
  stories,
  reads,
}: {
  stories: StoryPreview[];
  reads: StoryReadState[];
}) {
  const [filter, setFilter] = useState<number | null>(null);
  const readById = new Map(reads.map((r) => [r.story_id, r]));

  const filtered = filter
    ? stories.filter((s) => s.mission_id === filter)
    : stories;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div data-animate="1" className="mb-6">
          <h1
            className="text-3xl text-navy mb-1"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Stories
          </h1>
          <p className="text-ink-muted text-sm">
            Real situations. No celebrities. No tidy endings.
          </p>
          <p className="text-xs text-ink-muted mt-2 leading-relaxed">
            Each one is based on real students&apos; experiences, with names and
            identifying details changed. Nobody here is a real named person — the
            situations are.
          </p>
        </div>

        {/* Filter */}
        <div data-animate="2" className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filter === null
                ? "bg-navy text-white border-navy"
                : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
            )}
          >
            All missions
          </button>
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilter(m.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                filter === m.id
                  ? "text-white border-transparent"
                  : "bg-white text-ink-muted border-surface-border hover:border-navy/30"
              )}
              style={filter === m.id ? { background: m.colour } : {}}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* Story grid */}
        <div className="grid gap-3" data-animate="3">
          {filtered.map((story) => {
            const mission = MISSIONS.find((m) => m.id === story.mission_id);
            const read = readById.get(story.id);
            // Same treatment as a finished mission: sage card, sage tick.
            const complete = !!read?.read_at && !!read?.actioned_at;
            return (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className={cn(
                  "card p-5 hover:shadow-card transition-all group block",
                  complete && "bg-sage/5 border-sage/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                    style={{ background: complete ? "var(--sage)" : mission?.colour || "#4F46E5" }}
                    aria-label={complete ? "Read and reflected on" : undefined}
                  >
                    {complete ? "✓" : mission?.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2
                        className="text-lg text-navy group-hover:text-teal transition-colors"
                        style={{ fontFamily: "var(--font-story)", fontWeight: 500 }}
                      >
                        {story.title}
                      </h2>
                      <svg aria-hidden="true"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="text-ink-muted flex-shrink-0 mt-1"
                      >
                        <path
                          d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium mb-2">
                      <span style={{ color: mission?.colour }}>{mission?.title}</span>
                      {storyHasFilm(story.title) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-navy/10 text-navy">
                          <svg aria-hidden="true" width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M3 1.8v8.4c0 .6.65.97 1.16.66l6.3-4.2a.78.78 0 000-1.32l-6.3-4.2A.78.78 0 003 1.8z" />
                          </svg>
                          Animated
                        </span>
                      )}
                      {read?.read_at && !read.actioned_at && (
                        <span className="text-ink-muted font-normal">Read · one reflection to go</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {story.teaser}
                    </p>
                    {story.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {story.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
