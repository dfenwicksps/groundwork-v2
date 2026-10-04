"use client";

import { useEffect, useState } from "react";
import { PIN_LENGTH, checkPin, clearLock, hasLock, setLock, validPin } from "@/lib/deviceLock";

type Mode = "idle" | "setting" | "removing";

/** Turn the device passcode on, change it, or turn it off (lib/deviceLock.ts). */
export default function DeviceLockSettings() {
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // localStorage only exists in the browser, so read it after mount.
  useEffect(() => setOn(hasLock()), []);

  function reset(next: Mode = "idle") {
    setMode(next);
    setPin("");
    setConfirm("");
    setCurrent("");
    setError(null);
  }

  async function save() {
    if (on && !(await checkPin(current))) return setError("Your current code isn't right.");
    if (!validPin(pin)) return setError(`Use ${PIN_LENGTH} digits.`);
    if (pin !== confirm) return setError("Those two don't match.");
    await setLock(pin);
    setOn(true);
    setDone(on ? "Code changed." : "Lock is on for this device.");
    reset();
  }

  async function remove() {
    if (!(await checkPin(current))) return setError("That code isn't right.");
    clearLock();
    setOn(false);
    setDone("Lock is off for this device.");
    reset();
  }

  const digits = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH));
  const pinInput = "input text-center tracking-[0.5em] text-lg";

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-ink mb-1">Lock on this device</h2>
      <p className="text-sm text-ink-muted mb-4 leading-relaxed">
        If other people use this phone or computer, ask for a {PIN_LENGTH}-digit code
        before anyone can see Groundwork. It&apos;s stored only on this device, it asks
        again after you&apos;ve been away for five minutes, and forgetting it just means
        signing out and back in. It stops a casual look, not someone determined.
      </p>

      {done && mode === "idle" && <p className="text-xs text-sage mb-3">{done} ✓</p>}

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setDone(null); reset("setting"); }} className="btn btn-secondary text-sm py-2 px-4 rounded-xl">
            {on ? "Change code" : "Turn on"}
          </button>
          {on && (
            <button onClick={() => { setDone(null); reset("removing"); }} className="btn btn-secondary text-sm py-2 px-4 rounded-xl">
              Turn off
            </button>
          )}
        </div>
      )}

      {mode !== "idle" && (
        <div className="space-y-2">
          {(on || mode === "removing") && (
            <label className="block">
              <span className="block text-xs font-medium text-ink mb-1">Current code</span>
              <input type="password" inputMode="numeric" autoComplete="off" className={pinInput} value={current} onChange={digits(setCurrent)} />
            </label>
          )}
          {mode === "setting" && (
            <>
              <label className="block">
                <span className="block text-xs font-medium text-ink mb-1">New {PIN_LENGTH}-digit code</span>
                <input type="password" inputMode="numeric" autoComplete="off" className={pinInput} value={pin} onChange={digits(setPin)} />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ink mb-1">Same code again</span>
                <input type="password" inputMode="numeric" autoComplete="off" className={pinInput} value={confirm} onChange={digits(setConfirm)} />
              </label>
            </>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={mode === "setting" ? save : remove} className="btn btn-primary text-sm py-2 px-4 rounded-xl">
              {mode === "setting" ? "Save code" : "Turn off"}
            </button>
            <button onClick={() => reset()} className="btn btn-secondary text-sm py-2 px-4 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
