import Link from "next/link";
import type { IdentityCard as Card } from "@/lib/identityCard";

/**
 * Mission 1's answer to "Who am I?", built one piece per step (see
 * lib/identityCard.ts). Empty pieces say which step fills them and link there,
 * so the card doubles as the mission's to-do list.
 */
export default function IdentityCard({
  card,
  colour,
}: {
  card: Card;
  colour: string;
}) {
  const total = card.pieces.length;
  const complete = card.filled === total;
  const missionId = card.missionId ?? 1;

  return (
    <section
      id={missionId === 1 ? "who-i-am" : `mission-${missionId}-card`}
      aria-labelledby={`card-title-${missionId}`}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: `${colour}30`, background: "white" }}
    >
      <div className="px-5 pt-5 pb-4 text-white" style={{ background: colour }}>
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id={`card-title-${missionId}`}
            className="text-xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {card.title ?? "Who I am"}
          </h2>
          <span className="text-xs font-semibold opacity-80 flex-shrink-0">
            {card.filled} of {total} pieces
          </span>
        </div>
        <div className="flex gap-1 mt-3" aria-hidden>
          {card.pieces.map((p) => (
            <span
              key={p.key}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background: p.text || p.chips.length ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
        <p className="text-xs leading-relaxed mt-3 opacity-90">
          {complete
            ? card.doneText ??
              "Mission 1 done. This is your answer to “Who am I?” for now. It will change, and that's the point: you'll come back to it."
            : card.filled === 0
              ? "Each step you finish adds a piece here. Start with Step 1."
              : "Each step you finish adds a piece. Keep going to fill the card."}
        </p>
        {complete && card.doneLink && (
          <Link
            href={card.doneLink.href}
            className="inline-flex mt-3 text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5"
          >
            {card.doneLink.text}
          </Link>
        )}
      </div>

      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {card.pieces.map((p, i) => {
          const filled = !!(p.text || p.chips.length);
          return (
            <li key={p.key} className="px-5 py-3.5">
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: filled ? colour : "var(--ink-muted)" }}>
                {p.label}
              </div>
              {filled ? (
                p.chips.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.chips.map((c) => (
                      <span
                        key={c}
                        className="text-sm px-2.5 py-1 rounded-full font-medium"
                        style={{ background: `${colour}12`, color: "var(--ink)" }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[--ink] leading-relaxed">{p.text}</p>
                )
              ) : (
                <Link
                  href={`/missions/${missionId}/activities/${p.activityId}`}
                  className="text-sm text-[--ink-muted] hover:text-[--ink] transition-colors"
                >
                  Unlocks at Step {i + 1} · {p.stepTitle} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
