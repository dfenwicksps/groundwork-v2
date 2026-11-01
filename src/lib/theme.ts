// ─── Look and feel ───────────────────────────────────────────────────────────
// Three looks: light, dark and bold (neon pink and lime on near-black). The
// choice is kept in this browser only, like the device passcode: it's a
// preference about this screen, not about the student.
//
// Until a look is picked, the app follows the phone's light/dark setting.
//
// The look is a data-theme attribute on <html>. An inline script in the root
// layout (THEME_BOOT_SCRIPT) sets it before first paint so the page never
// flashes the wrong colours, and keeps following the phone while nothing is
// picked. globals.css holds the colour tokens for each look.

export type Theme = "light" | "dark" | "bold";

export const THEMES: Theme[] = ["light", "dark", "bold"];
export const THEME_KEY = "gw_theme_v1";

/** Browser bar colour for each look (matches --c-surface-muted). */
export const THEME_BAR: Record<Theme, string> = {
  light: "#FAF5EC",
  dark: "#12121C",
  bold: "#0B0B0F",
};

/** Runs in <head>, before anything is painted. Keep it tiny and dependency-free. */
export const THEME_BOOT_SCRIPT = `(function(){var K="${THEME_KEY}",B=${JSON.stringify(THEME_BAR)},d=document.documentElement,m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");function s(){var t=window.__gwTheme||null;if(!t)try{t=localStorage.getItem(K)}catch(e){}if(!B[t])t=m&&m.matches?"dark":"light";d.setAttribute("data-theme",t);var a=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<a.length;i++)a[i].setAttribute("content",B[t])}s();document.addEventListener("DOMContentLoaded",s);if(m&&m.addEventListener)m.addEventListener("change",s)})()`;

function isTheme(v: unknown): v is Theme {
  return typeof v === "string" && (THEMES as string[]).includes(v);
}

/** The look picked on this device, or null while following the phone. */
export function getStoredTheme(): Theme | null {
  const mem = (window as unknown as { __gwTheme?: Theme }).__gwTheme;
  if (isTheme(mem)) return mem;
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

/** The look on screen right now. */
export function getActiveTheme(): Theme {
  const v = document.documentElement.getAttribute("data-theme");
  return isTheme(v) ? v : "light";
}

export function setTheme(theme: Theme): void {
  // Remembered for this visit too, so a blocked localStorage doesn't let the
  // boot script's phone-setting listener undo an explicit choice.
  (window as unknown as { __gwTheme?: Theme }).__gwTheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or storage blocked: still switch for this visit.
  }
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", THEME_BAR[theme]));
}
