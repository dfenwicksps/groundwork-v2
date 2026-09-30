import { HELP_LINES, EMERGENCY } from "@/lib/help";

/** The services, each with a tap-to-call number, and 000 last. */
export default function HelpLines() {
  return (
    <div className="space-y-2">
      {HELP_LINES.map((line) => (
        <div key={line.name} className="rounded-xl border border-surface-border bg-white p-3.5">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold text-ink">{line.name}</span>
            <a
              href={`tel:${line.tel}`}
              className="text-sm font-semibold text-teal hover:underline tabular-nums"
            >
              {line.display}
            </a>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            {line.who}
            {line.url && (
              <>
                {" "}
                <a
                  href={line.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:underline"
                >
                  Website
                </a>
              </>
            )}
          </p>
        </div>
      ))}
      <div className="rounded-xl bg-coral/10 border border-coral/30 p-3.5">
        <p className="text-sm text-ink">
          <span className="font-semibold">In danger right now?</span> Call{" "}
          <a href={`tel:${EMERGENCY.tel}`} className="font-semibold text-coral-dark hover:underline">
            {EMERGENCY.display}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
