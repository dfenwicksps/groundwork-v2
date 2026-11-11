import { tint } from "@/lib/utils";
import type { IdentityCard } from "@/lib/identityCard";

/**
 * Earlier missions' cards, compact, for a step that builds on all of them
 * (Mission 4's Through-Line). Reading what you found beats recalling it: the
 * thread is far easier to see with the pieces in front of you.
 */
export default function CardRecap({ cards }: { cards: { colour: string; card: IdentityCard }[] }) {
  const shown = cards.filter(({ card }) => card.filled > 0);
  if (!shown.length) return null;
  return (
    <div className="space-y-3 mb-5">
      {shown.map(({ colour, card }) => (
        <section
          key={card.missionId ?? 1}
          className="rounded-2xl bg-white border overflow-hidden"
          style={{ borderColor: `${tint(colour, "35")}` }}
        >
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white" style={{ background: colour }}>
            Mission {card.missionId ?? 1} · {card.title ?? "Who I am"}
          </div>
          <dl className="px-4 py-3 space-y-2">
            {card.pieces
              .filter((p) => p.text || p.chips.length)
              .map((p) => (
                <div key={p.key}>
                  <dt className="text-xs font-semibold text-[--ink-muted]">{p.label}</dt>
                  <dd className="text-sm text-[--ink] leading-snug">{p.chips.length ? p.chips.join(", ") : p.text}</dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
