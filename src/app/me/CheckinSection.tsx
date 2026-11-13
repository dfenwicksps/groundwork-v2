import Link from "next/link";
import CheckinComparison from "@/components/CheckinComparison";
import { followUpDate, type CheckinState } from "@/lib/checkin";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * The check-in on the Me page. It follows /check-in's rule: after the first
 * check-in there are no scores, only when the second one opens; once both are
 * done, they're shown side by side and stay here. Answering happens on
 * /check-in, so this only reports and links.
 */
export default function CheckinSection({ state }: { state: CheckinState }) {
  // Not switched on yet (migration 013): nothing to show or offer.
  if (state.kind === "unavailable") return null;

  return (
    <div data-animate="4" id="checkin">
      <h2 className="me-heading mb-1">
        Check-in
      </h2>
      <p className="text-sm text-ink-muted mb-3 leading-relaxed">
        A few quick questions at the start and again ten weeks later, about how you see
        yourself. Only you ever see your answers.
      </p>

      {state.kind === "compare" ? (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            {formatDate(state.startAt)} and {formatDate(state.endAt)}
          </p>
          <CheckinComparison start={state.start} end={state.end} setId={state.setId} />
        </div>
      ) : state.kind === "waiting" ? (
        <div data-fluoro="violet" className="card p-5">
          <p className="text-sm text-ink leading-relaxed">
            You did the first check-in on {formatDate(state.startAt)}. The second one opens
            on {formatDate(followUpDate(state.startAt).toISOString())}, and then you&apos;ll
            see both side by side here.
          </p>
          <p className="text-xs text-ink-muted mt-2 leading-relaxed">
            No scores until then, on purpose: you answer the second time as you are, not
            to beat the first.
          </p>
        </div>
      ) : (
        <Link
          href="/check-in"
          data-fluoro="violet"
          className="card p-5 flex items-center gap-4 hover:shadow-card transition-shadow"
        >
          <span className="text-3xl flex-shrink-0" aria-hidden>
            {state.wave === "start" ? "◔" : "◕"}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-ink">
              {state.wave === "start" ? "Do your first check-in" : "Your second check-in is ready"}
            </span>
            <span className="block text-xs text-ink-muted mt-0.5 leading-relaxed">
              {state.wave === "start"
                ? "About two minutes. In ten weeks you'll answer the same questions and see what's moved."
                : "Ten weeks on: the same questions as before. Then see both side by side."}
            </span>
          </span>
          <span className="text-teal text-sm" aria-hidden>
            →
          </span>
        </Link>
      )}
    </div>
  );
}
