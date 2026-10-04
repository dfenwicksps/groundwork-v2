// ─── A passcode for this device ──────────────────────────────────────────────
// For a student on a shared phone or family laptop. Their account stays signed
// in, so anyone who picks the device up could read their journal; this asks
// for a four-digit code first.
//
// What it is and isn't: a guard against a casual look, not security. The code
// lives only in this browser, as a salted SHA-256 hash, and someone determined
// could clear the browser's storage. What it does guarantee is that getting
// past it without the code means signing out — and getting back in then takes
// the account password. Forgetting the code works the same way.
//
// The check runs twice: an inline script in the root layout hides the page
// before first paint (LOCK_BOOT_SCRIPT), so nothing flashes on screen, and the
// DeviceLock component shows the code screen and handles unlocking.

export const LOCK_KEY = "gw_lock_v1";
/** Set for this tab once unlocked; a new tab or a fresh visit asks again. */
export const UNLOCKED_KEY = "gw_unlocked";
export const LOCKED_CLASS = "gw-locked";
/** Away this long (tab hidden) and the code is asked for again. */
export const RELOCK_AFTER_MS = 5 * 60 * 1000;
export const PIN_LENGTH = 4;

/** Pages anyone can see without signing in never ask for the code. */
export function isPublicPath(path: string): boolean {
  return path === "/" || /^\/(auth|privacy|terms)(\/|$)/.test(path);
}

/** Runs in <head>, before anything is painted. Keep it tiny and dependency-free. */
export const LOCK_BOOT_SCRIPT = `try{var p=location.pathname;if(localStorage.getItem("${LOCK_KEY}")&&!sessionStorage.getItem("${UNLOCKED_KEY}")&&!(p==="/"||/^\\/(auth|privacy|terms)(\\/|$)/.test(p)))document.documentElement.classList.add("${LOCKED_CLASS}")}catch(e){}`;

interface StoredLock {
  salt: string;
  hash: string;
}

function read(): StoredLock | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    return raw ? (JSON.parse(raw) as StoredLock) : null;
  } catch {
    return null;
  }
}

async function digest(salt: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hasLock(): boolean {
  return read() !== null;
}

export function validPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

export async function setLock(pin: string): Promise<void> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  localStorage.setItem(LOCK_KEY, JSON.stringify({ salt, hash: await digest(salt, pin) }));
  markUnlocked();
}

export async function checkPin(pin: string): Promise<boolean> {
  const lock = read();
  if (!lock) return true;
  return (await digest(lock.salt, pin)) === lock.hash;
}

export function clearLock(): void {
  try {
    localStorage.removeItem(LOCK_KEY);
    sessionStorage.removeItem(UNLOCKED_KEY);
  } catch {
    // storage unavailable: nothing to clear
  }
  document.documentElement.classList.remove(LOCKED_CLASS);
}

export function markUnlocked(): void {
  try {
    sessionStorage.setItem(UNLOCKED_KEY, "1");
  } catch {
    // private mode without session storage: the lock just asks again
  }
  document.documentElement.classList.remove(LOCKED_CLASS);
}

export function isUnlocked(): boolean {
  try {
    return !!sessionStorage.getItem(UNLOCKED_KEY);
  } catch {
    return false;
  }
}

export function relock(): void {
  try {
    sessionStorage.removeItem(UNLOCKED_KEY);
  } catch {
    // ignore
  }
  if (hasLock()) document.documentElement.classList.add(LOCKED_CLASS);
}
