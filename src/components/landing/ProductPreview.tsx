import { MISSIONS } from "@/lib/missions";

/**
 * A static rendering of the real dashboard — the active mission card above the
 * mission map — so the landing page shows the product rather than only
 * describing it. Mirrors DashboardClient's layout deliberately: what someone
 * sees here is what they get after signing up.
 */
export default function ProductPreview() {
  const active = MISSIONS[0];
  const progress = [40, 0, 0, 0];

  return (
    <div
      className="relative mx-auto w-full max-w-sm text-left"
      role="img"
      aria-label="A preview of the Groundwork dashboard: an active mission card for Mission 1, Identity, at 40 percent complete, above a map of all four missions."
    >
      <div className="rounded-[1.75rem] border border-surface-border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)] p-3">
        {/* App bar */}
        <div className="flex items-center gap-2 px-2 pt-1 pb-3">
          <div className="w-5 h-5 bg-navy rounded flex items-center justify-center">
            <span className="text-white text-[8px] font-semibold">G</span>
          </div>
          <span
            className="text-sm font-semibold text-navy"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Groundwork
          </span>
        </div>

        <div className="px-1 pb-1 space-y-3">
          <div>
            <p className="text-[10px] text-ink-muted">Good evening</p>
            <p
              className="text-lg text-navy leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sam.
            </p>
          </div>

          {/* Active mission */}
          <div
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{ background: active.colour }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white"
              style={{ transform: "translate(30%, -30%)" }}
            />
            <div className="relative">
              <div className="text-[9px] font-medium opacity-70 mb-0.5">
                {active.subtitle} — Active
              </div>
              <div
                className="text-base leading-snug mb-3"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                {active.question}
              </div>
              <div className="flex items-center justify-between text-[9px] opacity-80 mb-1">
                <span>Progress</span>
                <span>40%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-2/5 bg-white/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Mission map */}
          <div>
            <p className="text-[9px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Mission map
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MISSIONS.map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-surface-border bg-white p-2.5"
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-semibold text-white mb-1.5"
                    style={{ background: m.colour }}
                  >
                    {m.id}
                  </div>
                  <div
                    className="text-[11px] font-semibold text-navy leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m.title}
                  </div>
                  <div className="text-[9px] text-ink-muted mb-1.5 leading-tight line-clamp-1 italic">
                    {m.question}
                  </div>
                  <div className="h-1 rounded-full bg-surface-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${progress[i]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
