"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Brings the page back to the top whenever `key` changes: a flow moving to
 * its next screen (onboarding's steps, a mission step's intro → questions →
 * done, a check-in saved). Moving between pages already lands at the top;
 * swapping one screen for another inside a page didn't, so on a phone the
 * new screen opened wherever the old one had been scrolled to.
 *
 * Skips the first render, so a page opened mid-way (a #section link) keeps
 * its place. `area` is an inner scrolling box to reset too, for layouts
 * where that, not the window, is what scrolls (wider screens).
 */
export function useScrollToTop(key: unknown, area?: RefObject<HTMLElement | null>) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    area?.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [key, area]);
}
