"use client";

import Link from "next/link";
import { levelOfPiece, nextInLevel } from "@/lib/v3/levelMap";

// Where a finished step or week leads in v3: on to the next thing in the same
// part of the map, or back to that part. Nothing is locked, so "next" is an
// offer; the way back is always there.

/** The primary button: the next thing here, or back to the level when there isn't one. */
export function NextPieceButton({ pieceId, accent, className }: { pieceId: string; accent?: string; className?: string }) {
  const found = levelOfPiece(pieceId);
  if (!found) return null;
  const next = nextInLevel(pieceId);
  const cls = className ?? "btn btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2";
  return next ? (
    <Link href={next.href} className={cls} style={accent ? { background: accent } : undefined}>
      Next: {next.title} <span aria-hidden>→</span>
    </Link>
  ) : (
    <Link href={`/grow/${found.level.key}`} className={cls} style={accent ? { background: accent } : undefined}>
      Back to {found.level.name} <span aria-hidden>→</span>
    </Link>
  );
}

/** Two quiet links that sit beside other secondary buttons: the level, and Home. */
export function PieceBackLinks({ pieceId, className }: { pieceId: string; className?: string }) {
  const found = levelOfPiece(pieceId);
  const cls = className ?? "btn btn-secondary flex-1 py-2.5 rounded-xl text-sm";
  // When there's nothing next here, the primary button already leads back to
  // the level, so this row doesn't say it twice.
  const primaryIsLevel = !!found && !nextInLevel(pieceId);
  return (
    <>
      {!primaryIsLevel && (
        <Link href={found ? `/grow/${found.level.key}` : "/grow"} className={cls}>
          {found ? found.level.name : "The map"}
        </Link>
      )}
      <Link href="/home" className={cls}>
        Home
      </Link>
    </>
  );
}
