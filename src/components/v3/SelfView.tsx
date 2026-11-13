import Link from "next/link";
import type { MapGroup, MapLevel, MapPiece } from "@/lib/v3/levelMap";
import type { SelfText } from "@/lib/v3/selves";
import PieceCard from "./PieceCard";
import { NAVY, YELLOW, accentOn, bandStyle, display, onBand, toneOf } from "./mapStyle";

// One self: what it is, what it isn't, something to think about, something to
// try. David's wording from the master file. No stories yet (D49).
export default function SelfView({
  group,
  level,
  self,
  pieces,
  doneIds,
}: {
  group: MapGroup;
  level: MapLevel;
  self: SelfText;
  pieces: MapPiece[];
  doneIds: string[];
}) {
  const tone = toneOf(level);
  const others = level.selves.filter((s) => s.key !== self.key);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-10 lg:py-10">
      <Link href={`/grow/${level.key}`} className="inline-flex min-h-[44px] items-center text-sm font-bold text-[--ink-muted] hover:underline">
        ← {level.name}
      </Link>

      <header className="mt-1 rounded-3xl p-6 md:p-9" style={bandStyle(level)}>
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em]" style={{ color: tone === "dark" ? YELLOW : accentOn(level) }}>
          {group.name} · {level.name}
        </p>
        <h1 className="mt-2 text-[clamp(40px,8vw,76px)] font-extrabold leading-[0.95] tracking-[-0.03em]" style={{ ...onBand, color: accentOn(level) }}>
          {self.name}
        </h1>
        <p className="mt-3 max-w-2xl text-xl font-bold leading-snug" style={{ color: tone === "dark" ? "#E9E6FF" : "#2E2A3D" }}>
          {self.short}
        </p>
      </header>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl p-6" style={{ background: tone === "soft" ? level.band : "#E6E3F7", color: "#1E1E2A" }}>
          <h2 className="text-2xl font-extrabold" style={{ ...onBand, color: tone === "soft" ? level.colour : NAVY }}>
            What it is
          </h2>
          <p className="mt-2 text-[17px] font-medium leading-relaxed">{self.what}</p>
        </section>
        <section className="rounded-3xl p-6" style={{ background: "#fff", color: "#1E1E2A", border: "3px dashed #B8B1CC" }}>
          <h2 className="text-2xl font-extrabold" style={{ ...onBand, color: NAVY }}>
            What it isn&apos;t
          </h2>
          <p className="mt-2 text-[17px] font-medium leading-relaxed">{self.notThis}</p>
        </section>
      </div>

      <section className="mt-4 rounded-3xl p-6 md:p-8" style={{ background: YELLOW, color: NAVY }}>
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em]">Think about</p>
        <p className="mt-2 text-[clamp(22px,3.4vw,32px)] font-extrabold leading-tight" style={onBand}>
          {self.ask}
        </p>
      </section>

      <section className="mt-4 rounded-3xl p-6 md:p-8 text-white" style={{ background: tone === "soft" ? level.colour : NAVY }}>
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] opacity-90">Try it this week</p>
        <p className="mt-2 text-[clamp(20px,3vw,28px)] font-extrabold leading-tight" style={onBand}>
          {self.livingIt}
        </p>
      </section>

      {pieces.length > 0 && (
        <section aria-labelledby="build" className="mt-8">
          <h2 id="build" className="text-2xl font-extrabold text-[--navy]" style={display}>
            Things to do in {level.name}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pieces.map((p) => (
              <li key={p.id}>
                <PieceCard level={level} piece={p} done={doneIds.indexOf(p.id) !== -1} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <nav aria-label={`Other selves in ${level.name}`} className="mt-8 flex flex-wrap gap-2">
          {others.map((s) => (
            <Link
              key={s.key}
              href={`/me/selves/${s.key}`}
              className="inline-flex min-h-[44px] items-center rounded-full border-2 px-4 text-sm font-extrabold"
              style={{ borderColor: level.colour, color: level.colour, background: "#fff" }}
            >
              {s.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
