"use client";

import Link from "next/link";

interface Stage {
  key: string;
  label: string;
  emoji: string;
  done: boolean;
  href: string;
  outcome: string;
}

/**
 * The student journey at a glance: Discover → Reflect → Grow → Practise →
 * Connect → Belong → Launch. Each stage links to where it happens and ticks
 * off as the student's data appears.
 */
export default function JourneyStrip({
  hasProfile,
  hasValues,
  hasHabits,
  hasMoral,
  hasFocus,
  hasPractice,
  hasSupport,
  hasGoals,
}: {
  hasProfile: boolean;
  hasValues: boolean;
  hasHabits: boolean;
  hasMoral: boolean;
  hasFocus: boolean;
  hasPractice: boolean;
  hasSupport: boolean;
  hasGoals: boolean;
}) {
  const stages: Stage[] = [
    { key: "discover", label: "Discover", emoji: "🔍", done: hasProfile && hasValues, href: "/missions/1", outcome: "I know my strengths and values" },
    { key: "reflect", label: "Reflect", emoji: "🪞", done: hasHabits || hasMoral, href: "#habits", outcome: "I see how my choices shape my character" },
    { key: "grow", label: "Grow", emoji: "🌱", done: hasFocus, href: "#focus", outcome: "I've chosen qualities to develop" },
    { key: "practise", label: "Practise", emoji: "💪", done: hasPractice, href: "#practice", outcome: "I'm turning qualities into actions" },
    { key: "connect", label: "Connect", emoji: "🧭", done: hasProfile && hasValues, href: "#pathways", outcome: "I see where my identity could take me" },
    { key: "belong", label: "Belong", emoji: "🤝", done: hasSupport, href: "/support", outcome: "I know who's in my corner" },
    { key: "launch", label: "Launch", emoji: "🚀", done: hasGoals, href: "#goals", outcome: "I've set goals for school, life and beyond" },
  ];
  const doneCount = stages.filter((s) => s.done).length;

  return (
    <div data-animate="2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Your journey
        </h2>
        <span className="text-xs text-ink-muted">
          {doneCount} of {stages.length}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {stages.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            title={s.outcome}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border flex-shrink-0 min-w-[64px] transition-all ${
              s.done
                ? "bg-sage/10 border-sage/30"
                : "bg-white border-surface-border hover:border-navy/30"
            }`}
          >
            <span className="text-base" aria-hidden>
              {s.done ? "✅" : s.emoji}
            </span>
            <span className={`text-[10px] font-semibold ${s.done ? "text-sage" : "text-ink-muted"}`}>
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
