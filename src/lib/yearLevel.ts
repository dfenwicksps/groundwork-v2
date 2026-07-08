// ─── Year level ───────────────────────────────────────────────────────────────
// A light personalisation signal captured at onboarding. Stored in a cookie so
// the (server-rendered) Me page can order sections without a hydration flash,
// and without needing a database migration. Never gates anything — it only
// tunes emphasis (a Year 12 wants pathways + goals first; a Year 9 wants
// character-building first and careers de-emphasised).

export type YearLevel = "junior" | "middle" | "senior";

export const YEAR_OPTIONS: { key: YearLevel; label: string; sub: string }[] = [
  { key: "junior", label: "Year 7–9", sub: "Getting started" },
  { key: "middle", label: "Year 10–11", sub: "Figuring it out" },
  { key: "senior", label: "Year 12", sub: "Nearly there" },
];

export const YEAR_COOKIE = "gw_year";

export function parseYearLevel(v: string | undefined | null): YearLevel | null {
  return v === "junior" || v === "middle" || v === "senior" ? v : null;
}

/** Client-side setter (writes the cookie the server reads on the next request). */
export function setYearLevelCookie(y: YearLevel): void {
  if (typeof document === "undefined") return;
  document.cookie = `${YEAR_COOKIE}=${y}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/** Client-side getter (for pre-filling the Settings control). */
export function getYearLevelCookie(): YearLevel | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${YEAR_COOKIE}=([^;]+)`));
  return parseYearLevel(m?.[1]);
}
