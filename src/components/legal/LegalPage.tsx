import Link from "next/link";
import { OPERATOR } from "@/lib/legal";

/**
 * Shared chrome for /privacy and /terms. Deliberately plain: no app shell, no
 * bottom nav, readable without an account.
 */
export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <nav className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-semibold">G</span>
          </div>
          <span
            className="font-semibold text-navy text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Groundwork
          </span>
        </Link>
        <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
          Back
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        <h1
          className="text-4xl text-navy mb-3 mt-6"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 1.15 }}
        >
          {title}
        </h1>
        <p className="text-ink-muted leading-relaxed mb-2">{intro}</p>
        <p className="text-xs text-ink-muted mb-10">Last updated {OPERATOR.lastUpdated}.</p>

        <div className="space-y-8">{children}</div>

        <div className="mt-12 pt-8 border-t border-surface-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/privacy" className="text-teal hover:underline">Privacy</Link>
          <Link href="/terms" className="text-teal hover:underline">Terms</Link>
          <Link href="/" className="text-ink-muted hover:text-ink">Home</Link>
        </div>
      </main>
    </div>
  );
}

/** One titled section of a policy. */
export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="text-xl text-navy mb-3"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {heading}
      </h2>
      <div className="space-y-3 text-ink leading-relaxed [&_ul]:space-y-2">{children}</div>
    </section>
  );
}

/** A short, plainly-worded summary line at the top of a section. */
export function Plainly({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-teal/5 border border-teal/20 px-4 py-3 text-sm text-ink">
      <span className="font-semibold">In short: </span>
      {children}
    </p>
  );
}
