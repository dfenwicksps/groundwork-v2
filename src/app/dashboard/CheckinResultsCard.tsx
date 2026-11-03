import Link from "next/link";
import { itemSet, type Scores } from "@/lib/checkin";

/**
 * Home's view of the check-in, once both are done: each area's start and now,
 * in one line each, and a way to the full comparison on the Me page. Before
 * then Home says nothing about results — there are none to show (no scores
 * after the first check-in, on purpose), and "Also now" already offers the
 * check-in when one is due.
 */
export default function CheckinResultsCard({
  start,
  end,
  setId,
}: {
  start: Scores;
  end: Scores;
  setId: string;
}) {
  const rows = itemSet(setId)
    .constructs.map(({ key, name }) => ({ key, name, a: start[key], b: end[key] }))
    .filter((r): r is { key: typeof r.key; name: string; a: number; b: number } =>
      r.a !== undefined && r.b !== undefined
    );
  if (rows.length === 0) return null;

  return (
    <section data-animate="3" aria-labelledby="checkin-results">
      <div className="flex items-baseline justify-between mb-3">
        <h2 id="checkin-results" className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Your check-in
        </h2>
        <Link href="/me#checkin" className="text-xs text-teal hover:underline">
          See it all
        </Link>
      </div>
      <Link href="/me#checkin" className="card p-5 block hover:shadow-card transition-all">
        <p className="text-xs text-ink-muted mb-3">Where you started, and where you are now, out of 5.</p>
        <ul className="space-y-2">
          {rows.map(({ key, name, a, b }) => {
            const diff = Math.round((b - a) * 10) / 10;
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span className="flex-1 text-ink">{name}</span>
                <span className="tabular-nums text-ink-muted">
                  {a.toFixed(1)} <span aria-hidden>→</span>
                  <span className="sr-only">to</span> <span className="font-semibold text-ink">{b.toFixed(1)}</span>
                </span>
                <span
                  className={
                    "tabular-nums text-xs w-12 text-right " +
                    (diff > 0 ? "text-sage" : "text-ink-muted")
                  }
                >
                  {diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `−${Math.abs(diff).toFixed(1)}` : "same"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-ink-muted leading-relaxed mt-3">
          A dip isn&apos;t a step backwards: looking hard at yourself often makes you less sure
          for a while first.
        </p>
      </Link>
    </section>
  );
}
