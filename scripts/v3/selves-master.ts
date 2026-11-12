// ─── Reading the HTML master ─────────────────────────────────────────────────
// Shared by the validator (validate-selves.ts) and the content import
// (content-import.ts), so both read "Who am I becoming?" the same way.
//
// Nothing here fills a gap. A field the master has no place for stays empty
// or null, and a person supplies it (D15).

import { MISSIONS } from "../../src/lib/missions";
import { PROGRAM_WEEKS } from "../../src/lib/program";
import {
  LESSON_STEPS,
  type BuiltByLink,
  type DraftStory,
  type LevelId,
  type Self,
  type SelfTeacherNotes,
} from "../../src/lib/v3/content";

export const DEFAULT_HTML = "docs/v3/source/who-am-i-becoming.html";

export type Raw = Record<string, unknown>;

export function extractArray(html: string, name: string): Raw[] {
  const m = html.match(new RegExp(`^const ${name} = (\\[.*\\]);\\s*$`, "m"));
  if (!m) throw new Error(`Couldn't find "const ${name} = [...]" on one line in the HTML.`);
  const parsed: unknown = JSON.parse(m[1]);
  if (!Array.isArray(parsed)) throw new Error(`${name} isn't an array.`);
  return parsed as Raw[];
}

/**
 * Places in the v2 app the master's free-text "In Groundwork" line names, found
 * by matching it against real titles in missions.ts and program.ts. These are
 * suggestions for a person to confirm, not links: nothing is published from them.
 */
export function suggestBuiltBy(gw: string): BuiltByLink[] {
  const text = gw.toLowerCase();
  const out: BuiltByLink[] = [];
  for (const m of MISSIONS) {
    for (const a of m.activities) {
      const title = a.title.toLowerCase();
      const bare = title.replace(/^(the|your) /, "");
      if (bare.length >= 6 && (text.includes(title) || text.includes(bare))) {
        out.push({ kind: "mission-activity", missionId: m.id, activityId: a.id, label: `Mission ${m.id}: ${a.title}` });
      }
    }
  }
  for (const m of Array.from(text.matchAll(/week (\d+)/g))) {
    const week = Number(m[1]);
    const w = PROGRAM_WEEKS.find((p) => p.week === week);
    if (w) out.push({ kind: "program-week", week, label: `Week ${week}: ${w.title}` });
  }
  const features: [RegExp, BuiltByLink & { kind: "feature" }][] = [
    [/\bjournal\b/, { kind: "feature", feature: "journal", label: "Your journal" }],
    [/support circle/, { kind: "feature", feature: "support-circle", label: "Your support circle" }],
    [/the standard/, { kind: "feature", feature: "the-standard", label: "The Standard" }],
    [/\bhabits\b/, { kind: "feature", feature: "habits", label: "Habits" }],
    [/practice log/, { kind: "feature", feature: "practice-log", label: "Strength in action: the practice log" }],
    [/future self/, { kind: "feature", feature: "future-self", label: "Future Self" }],
    [/next chapter/, { kind: "feature", feature: "next-chapter", label: "Next Chapter" }],
    [/pathways/, { kind: "feature", feature: "pathways", label: "Pathways" }],
    [/hard on yourself/, { kind: "feature", feature: "hard-on-yourself-card", label: "The hard-on-yourself card" }],
  ];
  for (const [re, link] of features) if (re.test(text)) out.push(link);
  return out;
}

export interface Mapped {
  self: Self;
  story: DraftStory;
  notes: SelfTeacherNotes;
  /** The master's free text for the two fields that become structured or school-owned. */
  gwText: string;
  cpText: string;
  suggestedBuiltBy: BuiltByLink[];
}

export function mapSelf(s: Raw): Mapped {
  const key = String(s.key);
  const fig = (s.fig ?? {}) as Raw;
  const src = String(s.src ?? "");
  const storyKey = `${key}-story-1`;
  return {
    self: {
      key,
      name: String(s.name ?? ""),
      level: s.level as LevelId,
      icon: String(s.icon ?? ""),
      short: String(s.short ?? ""),
      what: String(s.is_ ?? ""),
      notThis: String(s.isnt ?? ""),
      selfCheck: String(s.ask ?? ""),
      livingIt: String(s.living ?? ""),
      // Left empty on purpose: see suggestedBuiltBy.
      builtBy: [],
      // The master's `cp` is St Paul's Character Project text, so it isn't
      // central content. It becomes that school's override.
      localLink: null,
      storyKeys: [storyKey],
      sources: src ? [{ text: src }] : [],
    },
    story: {
      key: storyKey,
      selfKey: key,
      kind: "celebrity",
      figure: {
        kind: String(fig.kind ?? ""),
        name: String(fig.name ?? ""),
        sub: String(fig.sub ?? ""),
        moment: String(fig.moment ?? ""),
        icon: String(fig.icon ?? ""),
      },
      hook: String(s.hook ?? ""),
      beats: Array.isArray(s.beats) ? s.beats.map(String) : [],
      turn: String(s.turn ?? ""),
      ageBands: null,
      sources: src ? [{ text: src }] : [],
      verifiedAt: null,
      verifiedBy: null,
    },
    notes: {
      selfKey: key,
      notes: (Array.isArray(s.notes) ? s.notes : []).slice(0, LESSON_STEPS.length).map((text, i) => ({
        step: LESSON_STEPS[i],
        text: String(text),
      })),
    },
    gwText: String(s.gw ?? ""),
    cpText: String(s.cp ?? ""),
    suggestedBuiltBy: suggestBuiltBy(String(s.gw ?? "")),
  };
}

