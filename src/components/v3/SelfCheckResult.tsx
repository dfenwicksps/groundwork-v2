import Link from "next/link";
import type { ResultWords } from "@/lib/v3/selfCheck";
import SelfTile from "./SelfTile";
import { NAVY, YELLOW, display, onBand } from "./mapStyle";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

function steadyLine(names: string[]): string {
  return names.length === 2 ? `${names[0]} and ${names[1]}` : names.join(", ");
}

// Words only. No score, percentage, label or rank appears here, and nothing
// on this screen is ever shown to a teacher (spec section 6, rule 4).
export default function SelfCheckResult({
  words,
  takenAt,
  previous,
  retakeOn,
}: {
  words: ResultWords;
  takenAt: string;
  previous: { words: ResultWords; takenAt: string } | null;
  /** When it can be taken again, or null if it can be now. */
  retakeOn: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-10 lg:py-10">
      <span className="inline-block rounded-full px-3.5 py-1.5 text-[12px] font-extrabold tracking-[0.12em] text-white" style={{ background: NAVY }}>
        YOUR SELF-CHECK
      </span>
      <h1 className="mt-3 text-[clamp(34px,6vw,56px)] font-extrabold leading-none tracking-[-0.02em] text-[--navy]" style={display}>
        Where you could start
      </h1>
      <p className="mt-3 text-[17px] font-medium leading-snug text-[--ink-muted]">
        These are ideas, not results. You know yourself better than 25 statements do, so start somewhere else if
        that feels right.
      </p>

      {words.flat ? (
        <section className="mt-6 rounded-3xl p-6 md:p-8" style={{ background: YELLOW, color: NAVY }}>
          <p className="text-[clamp(22px,3.4vw,30px)] font-extrabold leading-tight" style={onBand}>
            Your answers were much the same across the board, so nothing stands out as the place to start.
          </p>
          <p className="mt-3 text-[17px] font-semibold">Have a look around the map and pick whatever catches your eye.</p>
        </section>
      ) : (
        <>
          {words.steady.length > 0 && (
            <section className="mt-6 rounded-3xl p-6 md:p-8" style={{ background: YELLOW, color: NAVY }}>
              <p className="text-[13px] font-extrabold uppercase tracking-[0.12em]">Already steady</p>
              <p className="mt-2 text-[clamp(26px,4.4vw,40px)] font-extrabold leading-tight" style={onBand}>
                {steadyLine(words.steady.map((l) => l.name))}
              </p>
              <p className="mt-2 text-[17px] font-semibold">These sounded most like you. Good ground to build from.</p>
            </section>
          )}

          <section aria-labelledby="explore" className="mt-6">
            <h2 id="explore" className="text-2xl font-extrabold text-[--navy]" style={display}>
              Might be worth exploring
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {words.explore.map(({ level, self }) => (
                <li key={self.key} className="rounded-3xl p-3" style={{ background: level.level >= 6 ? "#E6E3F7" : level.band }}>
                  <p className="px-1.5 pb-2 text-xs font-extrabold uppercase tracking-[0.1em]" style={{ color: level.colour }}>
                    {level.name}
                  </p>
                  <SelfTile level={{ ...level, level: 1 }} self={self} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/grow" className="btn btn-primary">
          Open the map
        </Link>
        <Link href="/home" className="btn btn-secondary">
          Go to Home
        </Link>
      </div>

      {previous && (
        <section aria-labelledby="before" className="card mt-8 p-5">
          <h2 id="before" className="text-lg font-extrabold text-[--ink]" style={display}>
            Last time, {day(previous.takenAt)}
          </h2>
          {previous.words.flat ? (
            <p className="mt-2 text-sm text-[--ink-muted]">Nothing stood out.</p>
          ) : (
            <dl className="mt-2 space-y-1 text-sm">
              {previous.words.steady.length > 0 && (
                <div>
                  <dt className="inline font-bold text-[--ink]">Already steady: </dt>
                  <dd className="inline text-[--ink-muted]">{steadyLine(previous.words.steady.map((l) => l.name))}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-bold text-[--ink]">Worth exploring: </dt>
                <dd className="inline text-[--ink-muted]">{previous.words.explore.map((e) => e.self.name).join(", ")}</dd>
              </div>
            </dl>
          )}
          <p className="mt-2 text-sm text-[--ink-muted]">
            If this looks much the same as last time, that&apos;s normal. Most people&apos;s picture of themselves
            changes slowly.
          </p>
          <p className="mt-2 text-sm text-[--ink-muted]">People change. Different isn&apos;t better or worse.</p>
        </section>
      )}

      <p className="mt-6 text-sm font-medium text-[--ink-muted]">
        Taken {day(takenAt)}. Only you can see this.{" "}
        {retakeOn ? (
          <>You can take it again from {day(retakeOn)}.</>
        ) : (
          <Link href="/me/self-check" className="font-bold underline underline-offset-4">
            Take it again
          </Link>
        )}
      </p>
    </div>
  );
}
