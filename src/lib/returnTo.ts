// ─── Getting back ─────────────────────────────────────────────────────────────
// A program week sends the student out to twelve different places: mission
// activities, The Standard, the practice loop, the moral compass, the support
// circle. Every one of those was a one-way door. /me and /support live under a
// different nav tab, and the mission activity pages always send you back to
// their mission — so the only route back to week 3 was to notice "This Week"
// in the nav, land on the program overview, and find the week again.
//
// So an outbound link carries where it came from, and the destination offers a
// way back.
//
// The parameter is a *token*, never a URL. Rendering a link to an arbitrary
// path taken from the query string is how open redirects happen, and this one
// would be trivially reachable — so `week-3` is resolved against the known
// weeks here, and anything that doesn't match is simply ignored.

import { WEEK_BY_NUMBER, PROGRAM_WEEKS } from "./program";

export const RETURN_PARAM = "from";

/** The token a program week puts on its outbound links. */
export function weekReturnToken(week: number): string {
  return `week-${week}`;
}

/** Append the token to an href, preserving any existing query or hash. */
export function withReturn(href: string, week: number): string {
  const [base, hash] = href.split("#");
  const sep = base.includes("?") ? "&" : "?";
  const withParam = `${base}${sep}${RETURN_PARAM}=${weekReturnToken(week)}`;
  return hash ? `${withParam}#${hash}` : withParam;
}

export interface ReturnTarget {
  href: string;
  /** Short label for the back control, e.g. "Week 3" */
  short: string;
  /** Fuller label, e.g. "Week 3 — Am I a contributor?" */
  full: string;
}

/**
 * Resolve a return token to a real destination, or null.
 *
 * Only `week-N` for a week that actually exists resolves. Everything else —
 * an absolute URL, a protocol-relative path, a made-up token — returns null
 * and the destination simply renders no back control.
 */
export function parseReturnTo(raw: string | undefined | null): ReturnTarget | null {
  if (!raw) return null;
  const m = /^week-(\d{1,2})$/.exec(raw.trim());
  if (!m) return null;
  const week = WEEK_BY_NUMBER[Number(m[1])];
  if (!week) return null;
  return {
    href: `/program/${week.week}`,
    short: `Week ${week.week}`,
    full: `Week ${week.week} — ${week.title}`,
  };
}

/** Every valid token, for tests and for reasoning about the surface. */
export const VALID_RETURN_TOKENS = PROGRAM_WEEKS.map((w) => weekReturnToken(w.week));
