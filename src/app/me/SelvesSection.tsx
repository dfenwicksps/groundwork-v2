"use client";

import { useState } from "react";
import Link from "next/link";
import { SELVES, CONFUSED_PAIRS, SELF_BY_KEY } from "@/lib/selves";

/**
 * "The words for it": the selves, and what separates them.
 *
 * Deliberately a reference rather than another thing to fill in. The app has
 * plenty of places to write; what it had none of was somewhere to find out that
 * the sinking feeling after a bad result is self-esteem doing its normal job,
 * not evidence about your worth. Each one names what it gets confused with,
 * because the confusion is the part that actually costs students something.
 */
const COUNT_WORDS: Record<number, string> = { 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten" };

/**
 * A link to another part of the Me page (such as The Standard, on the Reflect
 * tab). A client-side navigation to the same page doesn't remount it, so the
 * Me page's tab-from-hash logic never hears about it; announcing the hash
 * change lets it switch tabs and scroll there.
 */
function followInPage(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("/me") || !href.includes("#")) return;
  e.preventDefault();
  window.history.pushState(null, "", href);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export default function SelvesSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div data-animate="5" id="selves">
      <h2 className="me-heading mb-1">
        The words for it
      </h2>
      <p className="text-sm text-ink-muted mb-3 leading-relaxed">
        {COUNT_WORDS[SELVES.length] ?? SELVES.length} words that get used as if they mean the same thing.
        They don&apos;t, and the differences are worth having, because most of
        the time you&apos;re feeling one of them and blaming another.
      </p>

      <div className="flex flex-wrap gap-2">
        {SELVES.map((s) => (
          <button
            key={s.key}
            onClick={() => setOpen(open === s.key ? null : s.key)}
            aria-expanded={open === s.key}
            className={`px-3 py-2 rounded-xl text-sm border transition-all flex items-center gap-1.5 ${
              open === s.key
                ? "bg-navy text-white border-navy"
                : "bg-white text-ink border-surface-border hover:border-navy/30"
            }`}
          >
            <span aria-hidden>{s.emoji}</span>
            {s.name}
          </button>
        ))}
      </div>

      {open &&
        (() => {
          const s = SELF_BY_KEY[open];
          if (!s) return null;
          return (
            <div data-fluoro="blue" className="card p-5 mt-3 space-y-3">
              <p className="text-sm font-semibold text-ink">{s.short}</p>
              <p className="text-sm text-ink leading-relaxed">{s.what}</p>

              <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">
                  Often confused with
                </div>
                <p className="text-sm text-ink leading-relaxed">{s.notThis}</p>
              </div>

              <div className="rounded-xl px-4 py-3 bg-[rgba(46,125,140,0.05)] border border-[rgba(46,125,140,0.2)]">
                <div className="text-xs font-bold text-teal uppercase tracking-widest mb-1">
                  Where yours sits
                </div>
                <p className="text-sm text-ink leading-relaxed">{s.selfCheck}</p>
              </div>

              {/* Naming a thing is half of it; the app has to say where the
                  other half happens or this is just a glossary. */}
              <Link
                href={s.builtBy.href}
                onClick={(e) => followInPage(e, s.builtBy.href)}
                className="text-xs text-teal hover:underline inline-block"
              >
                Where this one gets built: {s.builtBy.label} →
              </Link>
            </div>
          );
        })()}

      {!open && (
        <div data-fluoro="green" className="card p-4 mt-3 space-y-2.5">
          <div className="text-xs font-bold text-ink-muted uppercase tracking-widest">
            The three that get mixed up most
          </div>
          {CONFUSED_PAIRS.map((p) => (
            <p key={p.a} className="text-xs text-ink-muted leading-relaxed">
              <button
                onClick={() => setOpen(p.a)}
                className="font-semibold text-ink hover:text-teal transition-colors"
              >
                {SELF_BY_KEY[p.a].name}
              </button>
              <span className="text-ink-faint"> vs </span>
              <button
                onClick={() => setOpen(p.b)}
                className="font-semibold text-ink hover:text-teal transition-colors"
              >
                {SELF_BY_KEY[p.b].name}
              </button>
              {" — "}
              {p.line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
