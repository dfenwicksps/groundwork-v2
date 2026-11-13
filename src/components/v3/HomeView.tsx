import Link from "next/link";
import type { MapGroup, MapLevel, MapPiece } from "@/lib/v3/levelMap";
import { NAVY, YELLOW, display, onBand } from "./mapStyle";

// Home answers one question first: what should I do now? One suggestion, then
// the way to everything else. It's a suggestion; nothing is locked (D3).
export default function HomeView({
  name,
  next,
  nextLevel,
  started,
  groups,
  classLine,
}: {
  name: string | null;
  next: MapPiece | null;
  nextLevel: MapLevel | null;
  /** Has the student done anything yet? */
  started: boolean;
  groups: MapGroup[];
  classLine: string | null;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[clamp(30px,5vw,44px)] font-extrabold leading-tight tracking-[-0.02em] text-[--navy]" style={display}>
        {name ? `Hi ${name}` : "Hi"}
      </h1>

      <section aria-labelledby="next" className="mt-5 rounded-3xl p-6 md:p-8" style={{ background: NAVY, color: "#fff" }}>
        <p id="next" className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: YELLOW }}>
          {next ? (started ? "Next up" : "A good place to start") : "You've done everything here"}
        </p>
        {next ? (
          <>
            <h2 className="mt-2 text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.02] tracking-[-0.02em]" style={{ ...onBand, color: "#fff" }}>
              {next.title}
            </h2>
            {next.blurb && <p className="mt-3 max-w-2xl text-[17px] font-medium leading-snug text-[#E9E6FF]">{next.blurb}</p>}
            <p className="mt-3 text-sm font-bold text-[#C9C3EE]">
              {[nextLevel?.name, next.kind, next.time].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={next.href}
                className="inline-flex min-h-[48px] items-center rounded-full px-6 text-base font-extrabold"
                style={{ background: YELLOW, color: NAVY }}
              >
                Start
              </Link>
              <Link href="/grow" className="text-sm font-bold text-white underline underline-offset-4">
                or choose something else from the map
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 max-w-2xl text-[17px] font-medium leading-snug text-[#E9E6FF]">
              Go back to anything on the map and see what&apos;s changed since you wrote it.
            </p>
            <Link
              href="/grow"
              className="mt-5 inline-flex min-h-[48px] items-center rounded-full px-6 text-base font-extrabold"
              style={{ background: YELLOW, color: NAVY }}
            >
              Open the map
            </Link>
          </>
        )}
      </section>

      <section aria-labelledby="map" className="mt-8">
        <h2 id="map" className="text-2xl font-extrabold text-[--navy]" style={display}>
          The map
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.key}>
              <Link href={`/grow#${g.key}`} className="card flex h-full flex-col gap-2 p-5 transition-transform hover:-translate-y-0.5">
                <span className="text-xl font-extrabold text-[--navy]" style={display}>
                  {g.name}
                </span>
                <span className="text-sm font-bold text-[--ink-muted]">{g.question}</span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {g.levels.map((l) => (
                    <span
                      key={l.key}
                      className="rounded-full px-2.5 py-1 text-xs font-extrabold text-white"
                      style={{ background: l.colour }}
                    >
                      {l.name}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="More" className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/journal" className="card p-4 text-sm font-bold text-[--ink] hover:underline">
          Your journal
        </Link>
        <Link href="/support" className="card p-4 text-sm font-bold text-[--ink] hover:underline">
          Your support circle
        </Link>
        {classLine ? (
          <div className="card p-4 text-sm font-bold text-[--ink]">
            Your class: <span className="font-semibold text-[--ink-muted]">{classLine}</span>
          </div>
        ) : (
          <Link href="/join" className="card p-4 text-sm font-bold text-[--ink] hover:underline">
            Join your class with a code
          </Link>
        )}
      </section>
    </div>
  );
}
