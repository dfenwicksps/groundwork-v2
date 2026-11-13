import Link from "next/link";
import type { MapLevel, MapPiece } from "@/lib/v3/levelMap";
import { display } from "./mapStyle";

// One thing to do. "Done" is the only mark it can carry: no score, no count.
export default function PieceCard({ level, piece, done }: { level: MapLevel; piece: MapPiece; done: boolean }) {
  return (
    <Link
      href={piece.href}
      className="card flex h-full flex-col gap-2 p-4 transition-transform hover:-translate-y-0.5"
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white"
          style={{ background: level.colour }}
        >
          {piece.kind}
        </span>
        {done && <span className="text-xs font-bold text-[--ink-muted]">Done</span>}
      </span>
      <span className="text-lg font-extrabold leading-tight text-[--ink]" style={display}>
        {piece.title}
      </span>
      {piece.blurb && <span className="text-sm leading-snug text-[--ink-muted]">{piece.blurb}</span>}
      <span className="mt-auto pt-1 text-xs font-semibold text-[--ink-muted]">
        {[piece.time, piece.optional ? "Optional" : null].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}
