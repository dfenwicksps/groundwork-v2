// ─── What you were handed ─────────────────────────────────────────────────────
// Erikson's account of how identity forms starts before any choosing: a young
// person absorbs ways of living from family and culture, then sorts them — some
// kept, some reworked into their own shape, some set down. He called it the
// selective repudiation and assimilation of childhood identifications. Nothing
// else in the app asked for it; every other step starts from the present.
//
// "What did your family give you?" is impossible to answer cold, so this is a
// list of concrete things people are commonly handed, to sort one tap at a
// time. Anything left unsorted simply doesn't apply. "Leave" is not a verdict
// on the people who handed it over, and the copy says so.
//
// The answer is saved as readable text inside the journal entry (one line per
// pile), so it shows up properly anywhere entries are read back and needs no
// new table. parseSort reads it back for editing.

export type Pile = "keep" | "rework" | "leave";

export const PILES: { key: Pile; label: string; heading: string; hint: string }[] = [
  { key: "keep", label: "Keep", heading: "Keeping", hint: "Yours now, by choice" },
  { key: "rework", label: "Rework", heading: "Reworking", hint: "Keeping some, changing the shape" },
  { key: "leave", label: "Leave", heading: "Leaving", hint: "Setting it down" },
];

export const INHERITANCE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "How things work at home",
    items: [
      "How we handle money",
      "How we argue (or don't)",
      "How much feelings get talked about",
      "Work hard, finish what you start",
      "Family comes first",
    ],
  },
  {
    title: "What counts as doing well",
    items: [
      "What counts as a good job",
      "How much school and marks matter",
      "Caring what other people think",
    ],
  },
  {
    title: "Culture and background",
    items: [
      "Language, food and traditions",
      "What it means to be from where we're from",
      "Faith, religion or beliefs",
    ],
  },
  {
    title: "What's expected of you",
    items: [
      "What people expect of you because of your gender",
      "Your role in the family — the funny one, the responsible one…",
      "Who you're expected to become",
    ],
  },
];

export const INHERITANCE_ITEMS = INHERITANCE_GROUPS.flatMap((g) => g.items);

/** Fewest sorted items before the step can be finished. */
export const SORT_MIN = 3;

export type SortChoices = Record<string, Pile>;

/**
 * One line per pile, items separated by "; " (items can contain commas).
 * Empty piles are left out entirely.
 */
export function sortToText(choices: SortChoices): string {
  return PILES.map(({ key, heading }) => {
    const items = Object.keys(choices).filter((item) => choices[item] === key);
    return items.length ? `${heading}: ${items.join("; ")}` : "";
  })
    .filter(Boolean)
    .join("\n");
}

/**
 * Items whose wording has changed, so a sort saved under the old wording reads
 * back as the same item rather than as one the student wrote themselves.
 */
const RENAMED: Record<string, string> = {
  // A binary that doesn't fit every student, and gender-diverse young people
  // are among those most affected by what it describes.
  "How boys or girls are supposed to be": "What people expect of you because of your gender",
};

/** The reverse of sortToText. Unrecognised lines are ignored. */
export function parseSort(text: string | null | undefined): SortChoices {
  const choices: SortChoices = {};
  if (!text) return choices;
  for (const line of text.split("\n")) {
    const pile = PILES.find(({ heading }) => line.startsWith(`${heading}:`));
    if (!pile) continue;
    line
      .slice(pile.heading.length + 1)
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((item) => {
        choices[RENAMED[item] ?? item] = pile.key;
      });
  }
  return choices;
}

/** Items in one pile, in the order they were saved. */
export function itemsIn(text: string | null | undefined, pile: Pile): string[] {
  const choices = parseSort(text);
  return Object.keys(choices).filter((item) => choices[item] === pile);
}
