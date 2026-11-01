"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getActiveTheme, getStoredTheme, setTheme, type Theme } from "@/lib/theme";

// Each preview is drawn in its own look's colours, whatever look is on now,
// so the three are always comparable side by side.
const OPTIONS: {
  key: Theme;
  label: string;
  sub: string;
  bg: string;
  card: string;
  line: string;
  a: string;
  b: string;
}[] = [
  { key: "light", label: "Light", sub: "Clean and bright", bg: "#FAF5EC", card: "#FFFFFF", line: "#EBE2D2", a: "#4338CA", b: "#0E7490" },
  { key: "dark", label: "Dark", sub: "Easy on the eyes", bg: "#12121C", card: "#1C1C29", line: "#2E2E42", a: "#6366F1", b: "#06B6D4" },
  { key: "bold", label: "Bold", sub: "Neon. Loud. Yours.", bg: "#0B0B0F", card: "#16161C", line: "#4A2C46", a: "#D6006F", b: "#D4FF00" },
];

function Preview({ o }: { o: (typeof OPTIONS)[number] }) {
  const bold = o.key === "bold";
  return (
    <div
      aria-hidden
      className="h-16 rounded-lg p-2 flex flex-col gap-1.5 overflow-hidden"
      style={{
        background: o.bg,
        backgroundImage: bold
          ? "radial-gradient(circle at 100% 0%, rgba(255,61,165,0.35), transparent 55%), radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1.6px)"
          : undefined,
        backgroundSize: bold ? "100% 100%, 8px 8px" : undefined,
      }}
    >
      <div
        className="rounded-md px-1.5 py-1 flex flex-col gap-1"
        style={{
          background: o.card,
          border: `${bold ? 1.5 : 1}px solid ${o.line}`,
          boxShadow: bold ? `2px 2px 0 ${o.a}` : undefined,
        }}
      >
        <div className="h-1.5 w-3/4 rounded-full" style={{ background: bold ? "#FAFAFA" : o.a }} />
        <div className="h-1 w-1/2 rounded-full" style={{ background: o.b }} />
      </div>
      <div
        className="h-2.5 w-10 rounded"
        style={{ background: o.a, boxShadow: bold ? `1.5px 1.5px 0 ${o.b}` : undefined }}
      />
    </div>
  );
}

export default function ThemeSettings() {
  // Read after mount: the look lives in this browser, not on the server.
  const [active, setActive] = useState<Theme | null>(null);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    setActive(getActiveTheme());
    setPicked(getStoredTheme() !== null);
    // While following the phone, the boot script can switch the look under us.
    const obs = new MutationObserver(() => setActive(getActiveTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function choose(t: Theme) {
    setTheme(t);
    setActive(t);
    setPicked(true);
  }

  return (
    <div data-animate="3" className="card p-6">
      <h2 className="font-semibold text-ink mb-1">Look</h2>
      <p className="text-sm text-ink-muted mb-4">
        Pick how Groundwork looks on this device.
        {active && !picked && " Until you pick, it follows your phone's light or dark setting."}
      </p>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Look">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={active === o.key}
            onClick={() => choose(o.key)}
            className={cn(
              "p-2 rounded-xl border text-left transition-all",
              active === o.key
                ? "border-teal bg-teal/5 ring-1 ring-teal"
                : "border-surface-border bg-white hover:border-teal/40"
            )}
            style={{ borderWidth: "1.5px" }}
          >
            <Preview o={o} />
            <div className="text-sm font-semibold text-ink mt-2">{o.label}</div>
            <div className="text-xs text-ink-muted leading-snug">{o.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
