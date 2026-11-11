import Link from "next/link";
import { tint } from "@/lib/utils";
import { pieceDone, type IdentityCard as Card } from "@/lib/identityCard";

/**
 * A mission's card, built one piece per step (see lib/identityCard.ts). It's
 * also the mission's navigation: every piece links to the step that fills
 * it ("Open" once it's done, so a step can be reopened or redone), and the
 * next step to do is the one button on the card.
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
  const nextIdx = card.pieces.findIndex((p) => !pieceDone(p));
  const stepHref = (p: Card["pieces"][number]) => `/missions/${missionId}/activities/${p.activityId}`;

  return (
    <section
      id={missionId === 1 ? "who-i-am" : `mission-${missionId}-card`}
      aria-labelledby={`card-title-${missionId}`}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: `${tint(colour, "30")}`, background: "var(--surface)" }}
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
                background: pieceDone(p) ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
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
            className="inline-flex mt-3 text-sm font-semibold bg-black/20 hover:bg-black/30 transition-colors rounded-lg px-3 py-1.5"
          >
            {card.doneLink.text}
          </Link>
        )}
      </div>

      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {card.pieces.map((p, i) => {
          const filled = pieceDone(p);
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
                        style={{ background: `${tint(colour, "12")}`, color: "var(--ink)" }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : p.text ? (
                  <p className="text-sm text-[--ink] leading-relaxed">{p.text}</p>
                ) : (
                  // The step is done but this question was left out, which the app allows.
                  <p className="text-sm text-[--ink-muted] italic leading-relaxed">Left this one out, and that&apos;s fine.</p>
                )
              ) : i === nextIdx ? (
                // The next step to do: the card's one button.
                <Link
                  href={stepHref(p)}
                  className="inline-flex items-center gap-1.5 mt-0.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                  style={{ background: colour }}
                >
                  {p.stale ? `Redo Step ${i + 1} · ${p.stepTitle}` : `Start Step ${i + 1} · ${p.stepTitle}`}
                  <span aria-hidden>→</span>
                </Link>
              ) : (
                <Link
                  href={stepHref(p)}
                  className="text-sm text-[--ink-muted] hover:text-[--ink] transition-colors"
                >
                  {p.stale
                    ? `This step's questions changed. Redo Step ${i + 1} to add this →`
                    : `Unlocks at Step ${i + 1} · ${p.stepTitle} →`}
                </Link>
              )}
              {filled && (
                <Link
                  href={stepHref(p)}
                  className="inline-block mt-1.5 text-xs text-[--ink-muted] hover:text-[--ink] hover:underline transition-colors"
                >
                  Open Step {i + 1} · {p.stepTitle} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
