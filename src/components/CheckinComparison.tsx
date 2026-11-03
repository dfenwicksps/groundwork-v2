import { itemSet, type Scores } from "@/lib/checkin";

/**
 * Start and end check-in scores side by side, one card per area of the set
 * they were answered in. Shown on /check-in once the end is done, and on the
 * Me page from then on.
 */
export default function CheckinComparison({
  start,
  end,
  setId,
}: {
  start: Scores | null;
  end: Scores;
  setId: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted leading-relaxed">
        Where you started, and where you are now, out of 5.
      </p>
      {itemSet(setId).constructs.map(({ key, name, blurb }) => {
        const a = start?.[key];
        const b = end[key];
        if (b === undefined) return null;
        const diff = a !== undefined ? Math.round((b - a) * 10) / 10 : null;
        return (
          <div key={key} className="card p-4">
            <div className="text-sm font-semibold text-ink">{name}</div>
            <div className="text-xs text-ink-muted mb-3">{blurb}</div>
            {(
              [
                ["Start", a],
                ["Now", b],
              ] as const
            ).map(([label, v]) =>
              v === undefined ? null : (
                <div key={label} className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-ink-muted w-10">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-navy"
                      style={{ width: `${(v / 5) * 100}%`, opacity: label === "Start" ? 0.45 : 1 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-ink tabular-nums w-7 text-right">
                    {v.toFixed(1)}
                  </span>
                </div>
              )
            )}
            {diff !== null && (
              <div className="text-xs text-ink-muted mt-2">
                {diff > 0 ? `Up ${diff.toFixed(1)}` : diff < 0 ? `Down ${Math.abs(diff).toFixed(1)}` : "No change"}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-xs text-ink-muted leading-relaxed">
        A dip isn&apos;t a step backwards. Looking hard at who you are often makes you
        less sure for a while before you&apos;re surer, and that&apos;s how it&apos;s
        meant to go.
      </p>
    </div>
  );
}
