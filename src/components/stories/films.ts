// Stories told as an animated film instead of prose. Keyed by title because
// seeded story ids are generated per-database. The list page badges these; the
// story page and paired activities swap the prose for <StoryFilm>.
export const STORY_FILM_TITLES = [
  "The Version of Me at School",
  "The Friend Who Stayed",
  "Different Enough",
] as const;

export function storyHasFilm(title: string): boolean {
  return (STORY_FILM_TITLES as readonly string[]).includes(title);
}
