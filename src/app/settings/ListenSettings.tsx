"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LISTEN,
  getListenSettings,
  setListenSettings,
  speak,
  speechSupported,
  type ListenSettings as Settings,
} from "@/lib/speech";

const SPEEDS: { rate: number; label: string }[] = [
  { rate: 0.8, label: "Slower" },
  { rate: 1, label: "Normal" },
  { rate: 1.2, label: "Faster" },
];

/**
 * Read aloud (lib/speech.ts): show or hide the Listen buttons, and how fast
 * they read. Kept on this device, like a font size: it's about the device's
 * voice, which differs from phone to phone.
 */
export default function ListenSettings() {
  const [s, setS] = useState<Settings>(DEFAULT_LISTEN);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setS(getListenSettings());
    setSupported(speechSupported());
  }, []);

  function update(next: Settings) {
    setS(next);
    setListenSettings(next);
  }

  return (
    <div data-animate="3" className="card p-6">
      <h2 className="font-semibold text-ink mb-1">Read aloud</h2>
      {!supported ? (
        <p className="text-sm text-ink-muted">
          This browser can&apos;t read aloud. Most phones can: try Safari on an iPhone or
          Chrome on Android.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-muted mb-4">
            Listen buttons read questions, answers and stories aloud in your phone&apos;s own
            voice. Nothing you write is sent anywhere to do it.
          </p>
          <label className="flex items-center justify-between gap-4 mb-4">
            <span className="text-sm text-ink">Show Listen buttons</span>
            <button
              type="button"
              role="switch"
              aria-checked={s.show}
              onClick={() => update({ ...s, show: !s.show })}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                s.show ? "bg-teal" : "bg-surface-border"
              )}
            >
              <span
                className={cn(
                  "switch-knob absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all",
                  s.show ? "left-[22px]" : "left-0.5"
                )}
              />
            </button>
          </label>
          <div className="text-sm text-ink mb-2">Speed</div>
          <div className="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="Reading speed">
            {SPEEDS.map((o) => (
              <button
                key={o.rate}
                type="button"
                aria-pressed={s.rate === o.rate}
                onClick={() => update({ ...s, rate: o.rate })}
                className={cn(
                  "py-2 rounded-xl border text-sm font-semibold",
                  s.rate === o.rate ? "bg-navy text-white border-navy" : "border-surface-border text-ink"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              speak("settings-test", "This is how the Listen buttons will sound.", { rate: s.rate })
            }
            className="btn btn-secondary text-sm py-2 px-4 rounded-xl"
          >
            Try it
          </button>
        </>
      )}
    </div>
  );
}
