"use client";

import VersionOfMeFilm from "./VersionOfMeFilm";
import FriendWhoStayedFilm from "./FriendWhoStayedFilm";

/** Renders the animated telling of a story, or nothing if it has none (see films.ts). */
export default function StoryFilm({ storyId, title }: { storyId: string; title: string }) {
  switch (title) {
    case "The Version of Me at School":
      return <VersionOfMeFilm storyId={storyId} />;
    case "The Friend Who Stayed":
      return <FriendWhoStayedFilm storyId={storyId} />;
    default:
      return null;
  }
}
