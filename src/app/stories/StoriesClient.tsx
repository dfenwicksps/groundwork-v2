"use client";

import { useState } from "react";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { cn } from "@/lib/utils";
import AppShell from "@/components/layout/AppShell";

interface StoryPreview {
  id: string;
  mission_id: number;
  title: string;
  teaser: string;
  tags: string[];
}

export default function StoriesClient({ stories }: { stories: StoryPreview[] }) {
  const [filter, setFilter] = useState<number | null>(null);

  const filtered = filter
    ? stories.filter((s) => s.mission_id === filter)
    : stories;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div data-animate="1" className="mb-6">
          <h1
            className="text-3xl text-navy mb-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Stories
          </h1>
          <p className="text-ink-muted text-sm">
            Real situations. No celebrities. No tidy endings.
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
            return (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="card p-5 hover:shadow-card transition-all group block"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                    style={{ background: mission?.colour || "#1B3A5C" }}
                  >
                    {mission?.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-navy group-hover:text-teal transition-colors">
                        {story.title}
                      </h2>
                      <svg
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
                    <div
                      className="text-xs font-medium mb-2"
                      style={{ color: mission?.colour }}
                    >
                      {mission?.title}
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
