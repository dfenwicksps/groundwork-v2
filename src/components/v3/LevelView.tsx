import Link from "next/link";
import type { MapGroup, MapLevel, MapPiece } from "@/lib/v3/levelMap";
import PieceCard from "./PieceCard";
import SelfTile from "./SelfTile";
import { YELLOW, accentOn, bandStyle, display, onBand, toneOf } from "./mapStyle";

export default function LevelView({
  group,
  level,
  pieces,
  doneIds,
}: {
  group: MapGroup;
  level: MapLevel;
  pieces: MapPiece[];
  doneIds: string[];
}) {
  const tone = toneOf(level);
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-10 lg:py-10">
      <Link href={`/grow#${group.key}`} className="inline-flex min-h-[44px] items-center text-sm font-bold text-[--ink-muted] hover:underline">
        ← The map
      </Link>

      <header className="mt-1 rounded-3xl p-6 md:p-8" style={bandStyle(level)}>
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em]" style={{ color: tone === "dark" ? YELLOW : accentOn(level) }}>
          {group.name} · {group.question}
        </p>
        <h1 className="mt-2 text-[clamp(36px,6vw,60px)] font-extrabold leading-none tracking-[-0.02em]" style={{ ...onBand, color: accentOn(level) }}>
          {level.name}
        </h1>
        <p className="mt-2 text-xl font-bold" style={{ color: tone === "dark" ? "#E9E6FF" : "#2E2A3D" }}>
          {level.question}
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {level.selves.map((s) => (
            <SelfTile key={s.key} level={level} self={s} />
          ))}
        </div>
      </header>

      <section aria-labelledby="todo" className="mt-8">
        <h2 id="todo" className="text-2xl font-extrabold text-[--navy]" style={display}>
          Things to do
        </h2>
        <p className="mt-1 text-sm font-semibold text-[--ink-muted]">Any order. Pick the one that looks most useful today.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((p) => (
            <li key={p.id}>
              <PieceCard level={level} piece={p} done={doneIds.indexOf(p.id) !== -1} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
