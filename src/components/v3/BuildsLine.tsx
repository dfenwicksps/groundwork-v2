import Link from "next/link";
import { selvesOfPiece } from "@/lib/v3/levelMap";

// Which self a step or week builds, as links to that self's page (D75).
// Renders nothing for a piece the map doesn't tie to a self.
export default function BuildsLine({ pieceId, className }: { pieceId: string; className?: string }) {
  const selves = selvesOfPiece(pieceId);
  if (selves.length === 0) return null;
  return (
    <p className={className ?? "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[--ink-muted]"}>
      <span className="font-semibold">Builds:</span>
      {selves.map((s) => (
        <Link key={s.key} href={`/me/selves/${s.key}`} className="inline-flex min-h-[44px] items-center font-bold text-[--ink] underline underline-offset-2">
          {s.name}
        </Link>
      ))}
    </p>
  );
}
