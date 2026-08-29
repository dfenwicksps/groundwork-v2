import Link from "next/link";
import type { Spine } from "@/lib/spine";

// ─── Track banner ─────────────────────────────────────────────────────────────
// Groundwork has two bodies of work and a student needs to know, on whichever
// one they land on, three things: what this is, what the other one is, and
// which to do first. Before this, the nav offered "Journey" and "Program" as
// unexplained peers and neither page said anything about the other — so the
// answer to "what am I supposed to be doing?" was nowhere in the app.
//
// The spine decides which is "first" by year level. The banner only reports
// that decision; it never blocks the other track.

type Track = "program" | "missions";

const COPY: Record<
  Track,
  { title: string; what: string; otherLabel: string; otherHref: string; otherWhat: string }
> = {
  program: {
    title: "This week",
    what: "One question a week and one thing to actually do, for ten weeks.",
    otherLabel: "Missions",
    otherHref: "/missions/1",
    otherWhat:
      "Four deep dives — identity, purpose, connection, meaning. Any order, any time.",
  },
  missions: {
    title: "Missions",
    what:
      "Four deep dives — identity, purpose, connection, meaning. Take them in order, or dip in.",
    otherLabel: "This week",
    otherHref: "/program",
    otherWhat: "Your weekly step in the ten-week character program.",
  },
};

/**
 * The "which first?" marker. Exported so the dashboard labels its two cards
 * with exactly the same words the track pages use — a student who reads
 * "Start here" on the dashboard should meet the same phrase when they land.
 */
export function TrackBadge({ lead }: { lead: boolean }) {
  if (!lead) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest text-[--ink-faint]">
        Anytime
      </span>
    );
  }
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
      style={{ background: "var(--sage)", color: "white" }}
    >
      Start here
    </span>
  );
}

export default function TrackBanner({
  track,
  spine,
}: {
  track: Track;
  spine: Spine;
}) {
  const c = COPY[track];
  const leadTrack: Track = spine.lead === "program" ? "program" : "missions";
  const isLead = track === leadTrack;

  return (
    <div className="rounded-2xl border border-[--border] bg-white p-4" data-animate="1">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold text-[--ink]">{c.title}</span>
        <TrackBadge lead={isLead} />
      </div>
      <p className="text-xs text-[--ink-muted] leading-relaxed">{c.what}</p>

      <Link
        href={c.otherHref}
        className="mt-3 pt-3 border-t border-[--border] flex items-center gap-2 group"
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[--ink]">
            {!isLead && <span className="text-[--sage]">Start with </span>}
            {c.otherLabel}
          </div>
          <p className="text-[11px] text-[--ink-muted] leading-relaxed">
            {c.otherWhat}
          </p>
        </div>
        <span className="text-[--ink-muted] flex-shrink-0" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
