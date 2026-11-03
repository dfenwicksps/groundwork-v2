"use client";

// ─── Read aloud ───────────────────────────────────────────────────────────────
// A Listen button on stories, questions, tap-answers and help text, using the
// device's own voice (Web Speech API): free, works offline, no audio files,
// and in whatever languages the device has. Read-aloud is the best-evidenced
// support for students who find reading hard (text-to-speech, g = 0.35 across
// 22 studies; Wood et al., 2018) and it helps students learning English too.
// See docs/evidence/multimedia-review.md.
//
// One thing reads at a time: starting one stops any other, and every Listen
// button hears about it through a window event, so only one shows "Stop".
//
// Practical quirks handled here:
//   - Chrome stops long utterances after about 15 seconds, so text is read a
//     sentence or so at a time.
//   - Voices load asynchronously and are named "en-AU" or "en_AU" depending on
//     the device; an Australian voice is preferred, then other English.
//   - iPhones only speak in response to a tap, so speak() is always called
//     straight from a click handler (or after one has started speech).

export const LISTEN_KEY = "gw_listen_v1";
export const SPEECH_EVENT = "gw-speech";

export interface ListenSettings {
  /** Show Listen buttons at all */
  show: boolean;
  /** Speaking rate: 0.8 slower, 1 normal, 1.2 faster */
  rate: number;
}

export const DEFAULT_LISTEN: ListenSettings = { show: true, rate: 1 };

export function getListenSettings(): ListenSettings {
  try {
    const raw = localStorage.getItem(LISTEN_KEY);
    if (!raw) return DEFAULT_LISTEN;
    const v = JSON.parse(raw);
    return {
      show: typeof v.show === "boolean" ? v.show : true,
      rate: typeof v.rate === "number" && v.rate >= 0.5 && v.rate <= 2 ? v.rate : 1,
    };
  } catch {
    return DEFAULT_LISTEN;
  }
}

export function setListenSettings(next: ListenSettings): void {
  try {
    localStorage.setItem(LISTEN_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the change still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: { settings: next } }));
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const norm = (l: string) => l.replace("_", "-").toLowerCase();
  const prefer = ["en-au", "en-nz", "en-gb", "en-us"];
  for (const p of prefer) {
    const local = voices.find((v) => norm(v.lang) === p && v.localService);
    if (local) return local;
    const any = voices.find((v) => norm(v.lang) === p);
    if (any) return any;
  }
  return voices.find((v) => norm(v.lang).startsWith("en")) ?? null;
}

/** Splits text into chunks of a sentence or two, keeping each chunk's offset. */
export function chunkText(text: string, max = 220): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  const re = /[^.!?…\n]+[.!?…]*["”’)]*\s*|\n+/g;
  let m: RegExpExecArray | null;
  let cur = "";
  let curStart = 0;
  while ((m = re.exec(text))) {
    const piece = m[0];
    if (!piece.trim()) {
      if (cur.trim()) out.push({ text: cur, start: curStart });
      cur = "";
      curStart = m.index + piece.length;
      continue;
    }
    if (cur && (cur + piece).length > max) {
      out.push({ text: cur, start: curStart });
      cur = "";
      curStart = m.index;
    }
    if (!cur) curStart = m.index;
    cur += piece;
  }
  if (cur.trim()) out.push({ text: cur, start: curStart });
  return out;
}

let currentId: string | null = null;
let runToken = 0;

function announce(id: string | null) {
  window.dispatchEvent(new CustomEvent(SPEECH_EVENT, { detail: { speaking: id } }));
}

export function currentlySpeaking(): string | null {
  return currentId;
}

export function stopSpeaking(): void {
  if (!speechSupported()) return;
  runToken++;
  window.speechSynthesis.cancel();
  if (currentId !== null) {
    currentId = null;
    announce(null);
  }
}

/**
 * Reads `text` aloud. `onWord` gets the character offset and length of each
 * word as it's spoken (where the voice reports it), for highlighting.
 * Resolves when reading finishes or is stopped.
 */
export function speak(
  id: string,
  text: string,
  opts: { onWord?: (start: number, length: number) => void; rate?: number } = {}
): Promise<void> {
  if (!speechSupported() || !text.trim()) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  const token = ++runToken;
  currentId = id;
  announce(id);
  const rate = opts.rate ?? getListenSettings().rate;
  const voice = pickVoice();
  const chunks = chunkText(text);

  return new Promise<void>((resolve) => {
    let i = 0;
    const finish = () => {
      if (token === runToken) {
        currentId = null;
        announce(null);
      }
      resolve();
    };
    const next = () => {
      if (token !== runToken) return resolve();
      if (i >= chunks.length) return finish();
      const { text: t, start } = chunks[i++];
      const u = new SpeechSynthesisUtterance(t);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = "en-AU";
      }
      u.rate = rate;
      u.onboundary = (e) => {
        if (token !== runToken || e.name === "sentence") return;
        const len = (e as SpeechSynthesisEvent & { charLength?: number }).charLength ||
          (t.slice(e.charIndex).match(/^\S+/)?.[0].length ?? 0);
        opts.onWord?.(start + e.charIndex, len);
      };
      u.onend = next;
      u.onerror = () => (token === runToken ? finish() : resolve());
      synth.speak(u);
    };
    next();
  });
}
