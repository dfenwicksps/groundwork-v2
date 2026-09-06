"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RETURN_PARAM, parseReturnTo } from "@/lib/returnTo";

/**
 * "← Back to Week 3" — shown at the top of wherever a program week sent the
 * student, so the trip out to a tool is a round trip rather than a one-way
 * door. Renders nothing at all when there's no valid return token, which is
 * every normal visit to these pages.
 */
function Banner() {
  const target = parseReturnTo(useSearchParams().get(RETURN_PARAM));
  if (!target) return null;

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[--border]">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-2">
        <Link
          href={target.href}
          className="text-xs font-semibold text-[--teal] hover:underline inline-flex items-center gap-1.5 min-w-0"
        >
          <span aria-hidden>←</span>
          <span className="truncate">Back to {target.full}</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * useSearchParams needs a Suspense boundary to keep a page from opting out of
 * static rendering. None of the pages this appears on are static today, but
 * the boundary costs nothing and stops that becoming a build error later.
 */
export default function ReturnBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  );
}
