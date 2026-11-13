import type { SmallStepRow } from "@/lib/smallSteps";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

/**
 * Small steps the student said they'd do and then did (lib/smallSteps.ts):
 * a running record of things they've actually done because of what they
 * wrote. It's the "wins log" the self-belief boost recommends, kept for them,
 * and each one is a small mastery experience, which is how self-efficacy is
 * mostly built.
 */
export default function StepsTakenSection({
  steps,
  total,
}: {
  steps: SmallStepRow[];
  total: number;
}) {
  return (
    <div data-animate="4" id="steps">
      <h2 className="me-heading mb-1">
        Steps you&apos;ve taken
      </h2>
      <p className="text-sm text-ink-muted mb-3 leading-relaxed">
        The small things you said you&apos;d do after a reflection, and did.
        {total > 0 ? ` ${total} so far.` : ""}
      </p>
      {steps.length === 0 ? (
        <div className="card p-5 text-sm text-ink-muted leading-relaxed">
          None yet. At the end of a step or a week, pick one small thing to do and
          when. Home will ask how it went, and the ones you do will collect here.
        </div>
      ) : (
        <ul className="card p-5 space-y-3">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3">
              <span className="text-sage flex-shrink-0 mt-0.5" aria-hidden>
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink leading-relaxed">{s.step}</p>
                <p className="text-xs text-ink-muted">
                  {s.done_at ? formatDate(s.done_at) : ""}
                  {s.source_label ? ` · ${s.source_label}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
