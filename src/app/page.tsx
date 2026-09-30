import Link from "next/link";
import BuildStamp from "@/components/BuildStamp";
import VersionOfMeFilm from "@/components/stories/VersionOfMeFilm";

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
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-10 text-center">
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
          className="text-lg text-ink-muted max-w-xl mx-auto mb-3 leading-relaxed"
          data-animate="3"
        >
          For anyone working out who they are and where they&apos;re heading: at
          school, just out of it, or a few years on. Short missions, small
          real-world challenges, and stories that don&apos;t pretend it&apos;s easy.
        </p>
        <p className="text-sm text-ink-muted mb-10" data-animate="3">
          Most answers are a tap. Write more only if you want to.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center" data-animate="4">
          <Link
            href="/auth?mode=signup"
            className="btn btn-primary px-8 py-3.5 text-base"
          >
            Start Mission 1 — free
          </Link>
          <Link
            href="#story"
            className="btn btn-secondary px-8 py-3.5 text-base"
          >
            Watch a story
          </Link>
        </div>
      </section>

      {/* Show before explaining: one of the animated stories, playable here. */}
      <section id="story" className="max-w-lg mx-auto px-6 pb-14 scroll-mt-6">
        <h2
          className="text-2xl md:text-3xl text-navy mb-2 text-center"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          One minute, one story.
        </h2>
        <p className="text-sm text-ink-muted mb-5 text-center leading-relaxed">
          Priya is loud at home and careful at school. Watch what happens when
          the two versions of her meet.
        </p>
        <VersionOfMeFilm storyId="landing" />
        <p className="text-sm text-ink-muted text-center max-w-md mx-auto">
          This isn&apos;t a therapy app. If something feels too heavy to carry
          alone, please talk to someone you trust.
        </p>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="max-w-5xl mx-auto px-6 py-14 border-t border-surface-border"
      >
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl text-navy mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            How it works
          </h2>
          <p className="text-ink-muted max-w-lg mx-auto">
            At whatever pace you like. Nothing expires and nothing nags you.
          </p>
        </div>

        <ol className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            {
              title: "Start with who you are",
              body: "Mission 1 maps your strengths and values. Each step takes about 8 to 15 minutes, less if you tap.",
            },
            {
              title: "Try it in real life",
              body: "Then, each week: one question to think about and one small thing to actually do.",
            },
            {
              title: "Look back",
              body: "Months later, reread what you wrote and see what's changed. Only you can see it.",
            },
          ].map((step, i) => (
            <li key={step.title} className="card p-6 text-left">
              <div className="text-xs font-semibold text-teal mb-2">Step {i + 1}</div>
              <h3 className="font-semibold text-navy mb-1.5 text-lg">{step.title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>

        <h3
          className="text-xl text-navy mb-4 text-center"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          Four missions. One question each.
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              n: "01",
              title: "Identity",
              q: "Who am I?",
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
      <section className="max-w-5xl mx-auto px-6 py-14 border-t border-surface-border">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🔒",
              title: "Private by default",
              body: "Everything you write is yours. Nothing is shared with other students, compared, or scored — and our privacy policy says exactly where it does go.",
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
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="bg-navy rounded-3xl p-12 text-center text-white">
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            Ready to do the work?
          </h2>
          <p className="text-white/70 mb-8 max-w-sm mx-auto">
            Mission 1&apos;s first step takes about 8 minutes, and most of it is
            taps. The results last a lot longer than that.
          </p>
          <Link
            href="/auth?mode=signup"
            className="btn bg-white text-navy hover:bg-white/90 px-10 py-3.5 text-base"
          >
            Start Mission 1 — free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 text-center text-sm text-ink-muted px-6">
        <p>
          Groundwork is not a therapy replacement. If you need support, talk to
          someone you trust, or call{" "}
          <a href="tel:1800551800" className="underline hover:text-ink transition-colors">
            Kids Helpline (ages 5–25) on 1800 55 1800
          </a>{" "}
          or{" "}
          <a href="tel:131114" className="underline hover:text-ink transition-colors">
            Lifeline on 13 11 14
          </a>
          .
        </p>
        <nav className="flex items-center justify-center gap-6 mt-4">
          <Link href="/privacy" className="underline hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="underline hover:text-ink transition-colors">
            Terms
          </Link>
        </nav>
        <BuildStamp className="mt-4" />
      </footer>
    </div>
  );
}
