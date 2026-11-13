import Link from "next/link";
import type { MapGroup } from "@/lib/v3/levelMap";
import SelfTile from "./SelfTile";
import { NAVY, YELLOW, accentOn, bandStyle, display, onBand, toneOf } from "./mapStyle";

// The map: four big questions, seven parts of you, 25 selves. Any order.
// No numbers, locks, bars or ranks (D3, D52).
export default function GrowMap({
  groups,
  classLine,
}: {
  groups: MapGroup[];
  /** "9B with Ms Nguyen", or null when the student isn't in a class. */
  classLine: string | null;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-10 lg:py-10">
      <header className="mb-8">
        <span
          className="inline-block rounded-full px-3.5 py-1.5 text-[12px] font-extrabold tracking-[0.12em] text-white"
          style={{ background: NAVY }}
        >
          THE MAP
        </span>
        <h1
          className="mt-3 text-[clamp(40px,7vw,76px)] font-extrabold leading-[0.98] tracking-[-0.03em] text-[--navy]"
          style={display}
        >
          Who am I{" "}
          <span className="rounded-[14px] px-2.5" style={{ background: YELLOW, color: NAVY, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
            becoming?
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-lg font-semibold leading-snug text-[--ink-muted]">
          Four big questions. Seven parts of you. Everything is open, so start wherever feels useful.
        </p>
        <p className="mt-3 text-sm font-semibold text-[--ink-muted]">
          {classLine ? (
            <>Your class: {classLine}</>
          ) : (
            <Link href="/join" className="text-[--teal] underline-offset-2 hover:underline">
              Got a class code? Join your class
            </Link>
          )}
        </p>
      </header>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.key} id={group.key} aria-labelledby={`g-${group.key}`} className="scroll-mt-6">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 id={`g-${group.key}`} className="text-2xl font-extrabold text-[--navy]" style={display}>
                {group.name}
              </h2>
              <p className="text-base font-bold text-[--ink-muted]">{group.question}</p>
            </div>

            <div className="space-y-3.5">
              {group.levels.map((level) => {
                const tone = toneOf(level);
                return (
                  <div
                    key={level.key}
                    className="grid gap-4 rounded-3xl p-4 md:grid-cols-[190px_minmax(0,1fr)]"
                    style={bandStyle(level)}
                  >
                    <div className="flex flex-col justify-center gap-1.5">
                      <h3 className="text-[22px] font-extrabold leading-[1.05]" style={{ ...onBand, color: accentOn(level) }}>
                        {level.name}
                      </h3>
                      <p className="text-[15px] font-bold" style={{ color: tone === "dark" ? YELLOW : "#2E2A3D" }}>
                        {level.question}
                      </p>
                      <Link
                        href={`/grow/${level.key}`}
                        className="mt-1.5 inline-flex min-h-[44px] w-fit items-center rounded-full px-4 text-sm font-extrabold"
                        style={
                          tone === "dark"
                            ? { background: YELLOW, color: NAVY }
                            : { background: tone === "bright" ? NAVY : level.colour, color: "#fff" }
                        }
                      >
                        {level.pieces.length} things to do
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
                      {level.selves.map((s) => (
                        <SelfTile key={s.key} level={level} self={s} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
