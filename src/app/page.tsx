import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-semibold">G</span>
          </div>
          <span
            className="font-semibold text-navy text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Groundwork
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            Sign in
          </Link>
          <Link href="/auth?mode=signup" className="btn btn-primary text-sm py-2 px-4">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-navy mb-6 max-w-3xl mx-auto"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
          data-animate="2"
        >
          Figure out who you are.{" "}
          <span style={{ fontStyle: "italic", color: "#0E7490" }}>
            Build a life that matters.
          </span>
        </h1>

        <p
          className="text-lg text-ink-muted max-w-xl mx-auto mb-10 leading-relaxed"
          data-animate="3"
        >
          Groundwork is a self-guided programme that helps teenagers develop
          identity, purpose, connection, and meaning — through honest reflection
          and real-world challenges.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center" data-animate="4">
          <Link
            href="/auth?mode=signup"
            className="btn btn-primary px-8 py-3.5 text-base"
          >
            Start your journey
          </Link>
          <Link
            href="#how-it-works"
            className="btn btn-secondary px-8 py-3.5 text-base"
          >
            How it works
          </Link>
        </div>

        {/* Honest disclaimer */}
        <p
          className="mt-8 text-sm text-ink-muted max-w-md mx-auto"
          data-animate="5"
        >
          This isn&apos;t a therapy app. If something feels too heavy to carry alone, please talk to someone you trust.
        </p>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="max-w-5xl mx-auto px-6 py-20 border-t border-surface-border"
      >
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl text-navy mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Four missions. One question each.
          </h2>
          <p className="text-ink-muted max-w-lg mx-auto">
            You move through each mission at your own pace — about 15 minutes a week. Reflective activities, real stories, and one challenge to try in the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              n: "01",
              title: "Identity",
              q: "Who am I becoming?",
              col: "#4F46E5",
            },
            {
              n: "02",
              title: "Purpose",
              q: "What do I care about?",
              col: "#0E7490",
            },
            {
              n: "03",
              title: "Connection",
              q: "Where do I belong?",
              col: "#15803D",
            },
            {
              n: "04",
              title: "Meaning",
              q: "What kind of life do I want?",
              col: "#C2410C",
            },
          ].map((m) => (
            <div
              key={m.n}
              className="rounded-2xl p-6 text-white"
              style={{ background: m.col }}
            >
              <div className="text-xs font-semibold opacity-60 mb-3">
                Mission {m.n}
              </div>
              <div
                className="text-xl mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {m.title}
              </div>
              <div
                className="text-sm opacity-80"
                style={{ fontStyle: "italic" }}
              >
                &ldquo;{m.q}&rdquo;
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-surface-border">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🔒",
              title: "Private by default",
              body: "Everything you write is yours. Nothing is shared, compared, or scored.",
            },
            {
              icon: "🤝",
              title: "Real relationships first",
              body: "Groundwork regularly points you toward the humans in your life — not toward staying on the app.",
            },
            {
              icon: "🌱",
              title: "Growth, not performance",
              body: "There are no rankings, no streaks to protect, no pressure. Just honest reflection at your own pace.",
            },
          ].map((p) => (
            <div key={p.title} className="card p-6">
              <div className="text-2xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-navy mb-2 text-lg">
                {p.title}
              </h3>
              <p className="text-ink-muted text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-navy rounded-3xl p-12 text-center text-white">
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            Ready to do the work?
          </h2>
          <p className="text-white/70 mb-8 max-w-sm mx-auto">
            It takes about 15 minutes a week. The results last longer than that.
          </p>
          <Link
            href="/auth?mode=signup"
            className="btn bg-white text-navy hover:bg-white/90 px-10 py-3.5 text-base"
          >
            Begin Mission 1 — free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 text-center text-sm text-ink-muted px-6">
        <p>
          Groundwork is not a therapy replacement. If you need support, please
          speak to a trusted adult or call{" "}
          <a
            href="tel:1800551800"
            className="underline hover:text-ink-muted transition-colors"
          >
            Kids Helpline: 1800 55 1800
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
