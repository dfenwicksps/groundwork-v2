"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import { storySentence } from "@/lib/program";
import { storyDueForRenewal, type MyStory } from "@/lib/myStory";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

/** One piece of the story, or where to go to write it. */
function Piece({
  label,
  children,
  empty,
}: {
  label: string;
  children?: ReactNode;
  empty?: { href: string; text: string };
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">{label}</div>
      {children ? (
        <div className="text-sm text-ink leading-relaxed whitespace-pre-line">{children}</div>
      ) : empty ? (
        <Link href={empty.href} className="text-sm text-teal hover:underline no-print">
          {empty.text} →
        </Link>
      ) : null}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="px-2.5 py-1 rounded-lg bg-navy/10 text-navy text-xs font-medium">
          {i}
        </span>
      ))}
    </span>
  );
}

function Part({ number, title, blurb, children }: { number: string; title: string; blurb: string; children: ReactNode }) {
  return (
    <section className="story-part" aria-labelledby={`part-${number}`}>
      <div className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">Part {number}</div>
      <h2 id={`part-${number}`} className="text-2xl text-navy mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {title}
      </h2>
      <p className="text-xs text-ink-muted leading-relaxed mb-3">{blurb}</p>
      <div className="card p-5 divide-y divide-border">{children}</div>
    </section>
  );
}

/**
 * The student's life story in three parts, assembled from what they've written
 * (see lib/myStory.ts). Read-only: every piece is written somewhere else, and
 * the empty ones link there.
 */
export default function StoryClient({ story }: { story: MyStory }) {
  const { past, present, future } = story;
  const renew = storyDueForRenewal(story.codeWrittenAt);

  return (
    <AppShell>
      <style>{`@media print { nav, button, .no-print { display: none !important; } body { background: #fff; } .story-part { break-inside: avoid; } }`}</style>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        <div data-animate="1">
          <Link href="/me" className="text-xs text-teal hover:underline no-print">
            ← Me
          </Link>
          <h1 className="text-3xl text-navy mt-3 mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            My story
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Where you&apos;ve come from, who you are, and where you&apos;re heading, put
            together from what you&apos;ve written. It changes as you do: write a newer
            answer anywhere and it shows up here.
          </p>
        </div>

        {story.sentence ? (
          <div className="rounded-2xl p-5 text-white" style={{ background: "var(--navy)" }} data-animate="2">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">In one sentence</div>
            <p className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-story)" }}>
              {storySentence(story.sentence)}
            </p>
            {story.codeWrittenAt && (
              <p className="text-xs opacity-70 mt-3">Written {formatDate(story.codeWrittenAt)}</p>
            )}
          </div>
        ) : (
          <div className="card p-5 no-print" data-animate="2">
            <p className="text-sm text-ink leading-relaxed mb-1">
              Your story in one sentence gets written in week 10, with your Character Code.
            </p>
            <Link href="/program/10" className="text-sm text-teal hover:underline">
              Week 10 →
            </Link>
          </div>
        )}

        {renew && (
          <div className="rounded-2xl p-4 border-2 border-dashed border-navy/25 no-print">
            <p className="text-sm text-ink leading-relaxed mb-1">
              It&apos;s been a year since you wrote this. A lot can change in a year.
            </p>
            <Link href="/program/10" className="text-sm text-teal hover:underline">
              Write this year&apos;s version →
            </Link>
          </div>
        )}

        <Part number="1" title="Where I've come from" blurb="The chapters so far, a moment that changed things, and what you were handed.">
          <Piece
            label={past.chaptersFrom === "mission-4" ? "The chapters so far (as of Mission 4)" : "The chapters so far"}
            empty={{ href: "/missions/1/activities/chapters-so-far", text: "Name your chapters in Mission 1" }}
          >
            {past.chapters}
          </Piece>
          {past.currentChapter && <Piece label="The chapter I'm in now">{past.currentChapter}</Piece>}
          <Piece label="A turning point" empty={{ href: "/missions/4/activities/where-ive-come-from", text: "In Mission 4" }}>
            {past.turningPoint}
          </Piece>
          {(past.keeping.length > 0 || past.reworking.length > 0 || past.leaving.length > 0) && (
            <Piece label="What I was handed">
              <div className="space-y-2">
                {past.keeping.length > 0 && (
                  <div><span className="text-xs text-ink-muted mr-2">Keeping</span><Chips items={past.keeping} /></div>
                )}
                {past.reworking.length > 0 && (
                  <div><span className="text-xs text-ink-muted mr-2">Reworking</span><Chips items={past.reworking} /></div>
                )}
                {past.leaving.length > 0 && (
                  <div><span className="text-xs text-ink-muted mr-2">Leaving</span><Chips items={past.leaving} /></div>
                )}
              </div>
            </Piece>
          )}
          {past.reworkingNote && <Piece label="What I'm reworking">{past.reworkingNote}</Piece>}
          {past.familyStory && <Piece label="A story from my family">{past.familyStory}</Piece>}
        </Part>

        <Part number="2" title="Who I am now" blurb="What you lead with, what you stand for, and the thread through it.">
          <Piece label="Strengths I lead with (a snapshot)" empty={{ href: "/missions/1/activities/strengths-mapping", text: "Map them in Mission 1" }}>
            {present.strengths.length > 0 ? <Chips items={present.strengths} /> : null}
          </Piece>
          <Piece label="What I value" empty={{ href: "/missions/1/activities/values-clarifier", text: "Choose them in Mission 1" }}>
            {present.values.length > 0 ? <Chips items={present.values} /> : null}
          </Piece>
          <Piece label="The thread" empty={{ href: "/missions/4/activities/the-through-line", text: "Find it in Mission 4" }}>
            {present.thread}
          </Piece>
        </Part>

        <Part number="3" title="Where I'm heading" blurb="A picture of the future, a direction, and what you do about it now.">
          <Piece label="An ordinary Tuesday at 21" empty={{ href: "/missions/4/activities/future-self", text: "Picture it in Mission 4" }}>
            {future.tuesday}
          </Piece>
          <Piece label="The direction" empty={{ href: "/missions/4/activities/meaning-letter", text: "Name it in Mission 4" }}>
            {future.direction}
          </Piece>
          {future.hopingFor && <Piece label="Next year, I'm hoping for">{future.hopingFor}</Piece>}
          <Piece label="What I do about it" empty={{ href: "/program/10", text: "Write your commitments in week 10" }}>
            {future.commitments.length > 0 ? (
              <ol className="space-y-1.5">
                {future.commitments.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ink-muted tabular-nums">{i + 1}.</span>
                    {c}
                  </li>
                ))}
              </ol>
            ) : null}
          </Piece>
        </Part>

        <div className="flex flex-col gap-2 no-print">
          <button onClick={() => window.print()} className="btn btn-secondary w-full py-3 rounded-xl text-sm">
            Print it or save it as a PDF
          </button>
          <p className="text-xs text-ink-muted text-center leading-relaxed">
            Private, like everything here. Only what&apos;s on this page prints, and nothing
            you wrote in Parts of Who You Are is ever included.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
