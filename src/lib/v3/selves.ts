// ─── The 25 selves, as a student reads them ──────────────────────────────────
// generated/selves.json is written from the master file by the content import
// (docs/v3/source/who-am-i-becoming.html), and selves.test.ts fails if the two
// drift. It holds David's own wording: what each self is, what it isn't, a
// question to think about and one thing to try.
//
// Not here yet: the stories. Each needs an age band and a person's check
// before a student sees it (D15, D49).

import data from "./generated/selves.json";

export interface SelfText {
  key: string;
  name: string;
  /** For matching the master file only. Never shown. */
  level: number;
  short: string;
  what: string;
  notThis: string;
  ask: string;
  livingIt: string;
}

export const SELVES_TEXT: SelfText[] = data as SelfText[];

export function findSelf(key: string): SelfText | undefined {
  return SELVES_TEXT.filter((s) => s.key === key)[0];
}
