// ─── Look and feel ───────────────────────────────────────────────────────────
// Three looks: light, dark and bold (neon pink and lime on near-black).
//
// The choice lives on the student's account (users.theme), so it follows them
// to any device. This browser keeps a copy in localStorage, because the look
// has to be applied before first paint, long before the account can be asked.
// ThemeSync (components/ThemeSync.tsx) brings the copy into line with the
// account once per visit (reconcileTheme), and signing out clears it, so the
// next person on a shared device doesn't inherit the look. The copy records
// whose it is, so a look left behind by someone else is never saved to the
// account of whoever signs in next.
//
// No choice (null) means following the phone's light/dark setting.
//
// The look is a data-theme attribute on <html>. An inline script in the root
// layout (THEME_BOOT_SCRIPT) sets it before first paint so the page never
// flashes the wrong colours, and keeps following the phone while nothing is
// picked. globals.css holds the colour tokens for each look.

export type Theme = "light" | "dark" | "bold";

export const THEMES: Theme[] = ["light", "dark", "bold"];
export const THEME_KEY = "gw_theme_v1";
/** The account the browser's copy belongs to. */
export const THEME_OWNER_KEY = "gw_theme_owner";
/** Set for this tab once the copy has been checked against the account. */
export const THEME_SYNCED_KEY = "gw_theme_synced";

/** Browser bar colour for each look (matches --c-surface-muted). */
export const THEME_BAR: Record<Theme, string> = {
  light: "#FAF5EC",
  dark: "#12121C",
  bold: "#0B0B0F",
};

/** Runs in <head>, before anything is painted. Keep it tiny and dependency-free. */
export const THEME_BOOT_SCRIPT = `(function(){var K="${THEME_KEY}",B=${JSON.stringify(THEME_BAR)},d=document.documentElement,m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");function s(){var t=window.__gwTheme||null;if(!t)try{t=localStorage.getItem(K)}catch(e){}if(!B[t])t=m&&m.matches?"dark":"light";d.setAttribute("data-theme",t);var a=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<a.length;i++)a[i].setAttribute("content",B[t])}window.__gwApplyTheme=s;s();document.addEventListener("DOMContentLoaded",s);if(m&&m.addEventListener)m.addEventListener("change",s)})()`;

type ThemeWindow = Window & { __gwTheme?: Theme; __gwApplyTheme?: () => void };

export function parseTheme(v: unknown): Theme | null {
  return typeof v === "string" && (THEMES as string[]).includes(v) ? (v as Theme) : null;
}

/** The look this browser holds a copy of, or null while following the phone. */
export function getStoredTheme(): Theme | null {
  const mem = parseTheme((window as ThemeWindow).__gwTheme);
  if (mem) return mem;
  try {
    return parseTheme(localStorage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

/** The look on screen right now. */
export function getActiveTheme(): Theme {
  return parseTheme(document.documentElement.getAttribute("data-theme")) ?? "light";
}

/** Whose look this browser holds a copy of, if anyone's. */
function getThemeOwner(): string | null {
  try {
    return localStorage.getItem(THEME_OWNER_KEY);
  } catch {
    return null;
  }
}

/**
 * Show a look and keep this browser's copy of it, recorded as `owner`'s; null
 * goes back to following the phone. Saving it to the account is the caller's
 * job (saveTheme).
 */
export function applyTheme(theme: Theme | null, owner?: string): void {
  const w = window as ThemeWindow;
  // Also kept in memory, so a blocked localStorage doesn't let the boot
  // script's phone-setting listener undo an explicit choice.
  if (theme) w.__gwTheme = theme;
  else delete w.__gwTheme;
  try {
    if (theme) localStorage.setItem(THEME_KEY, theme);
    else localStorage.removeItem(THEME_KEY);
    if (theme && owner) localStorage.setItem(THEME_OWNER_KEY, owner);
    else localStorage.removeItem(THEME_OWNER_KEY);
  } catch {
    // Private mode or storage blocked: still switch for this visit.
  }
  if (w.__gwApplyTheme) {
    w.__gwApplyTheme();
  } else if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

/**
 * Save a student's look to their account. Returns false if the write failed
 * (offline, or the column not yet added); the browser copy still holds it.
 */
export async function saveTheme(db: any, userId: string, theme: Theme): Promise<boolean> {
  const { error } = await db.from("users").update({ theme }).eq("id", userId);
  return !error;
}

/**
 * Bring this browser's copy into line with the account, and return the look
 * the student has chosen (null: following the phone).
 *
 * - The account has a look: it wins, on this device too.
 * - The account has none, and the copy is this student's (a pick whose save
 *   failed, say before migration 018 was run): it's saved to the account now.
 * - The account has none, and the copy is someone else's or nobody's: it's
 *   dropped, so it can't land on this student's account.
 *
 * `fromAccount` is users.theme, already read by the caller.
 */
export async function reconcileTheme(
  db: any,
  userId: string,
  fromAccount: Theme | null
): Promise<Theme | null> {
  if (fromAccount) {
    if (fromAccount !== getStoredTheme() || getThemeOwner() !== userId) {
      applyTheme(fromAccount, userId);
    }
    return fromAccount;
  }
  const local = getStoredTheme();
  if (!local) return null;
  if (getThemeOwner() === userId) {
    await saveTheme(db, userId, local);
    return local;
  }
  applyTheme(null);
  return null;
}

/** Mark this tab's copy as checked against the account. */
export function markThemeSynced(): void {
  try {
    sessionStorage.setItem(THEME_SYNCED_KEY, "1");
  } catch {
    // ignore
  }
}

/** On sign-out: forget this browser's copy so the next person starts fresh. */
export function clearThemeCache(): void {
  try {
    sessionStorage.removeItem(THEME_SYNCED_KEY);
  } catch {
    // ignore
  }
  applyTheme(null);
}
