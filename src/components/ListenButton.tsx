"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SPEECH_EVENT,
  getListenSettings,
  speak,
  speechSupported,
  stopSpeaking,
  currentlySpeaking,
} from "@/lib/speech";

const HIGHLIGHT = "gw-reading";

type HighlightRegistry = { set(name: string, h: unknown): void; delete(name: string): void };
function highlights(): HighlightRegistry | null {
  const css = (globalThis as unknown as { CSS?: { highlights?: HighlightRegistry } }).CSS;
  return css?.highlights && "Highlight" in globalThis ? css.highlights : null;
}

/** Highlights characters [start, start+length) of `el`'s text, across its text nodes. */
function highlightRange(el: HTMLElement, start: number, length: number) {
  const reg = highlights();
  if (!reg) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let startNode: Text | null = null;
  let startOff = 0;
  let endNode: Text | null = null;
  let endOff = 0;
  const end = start + length;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = node.data.length;
    if (!startNode && start < pos + len) {
      startNode = node;
      startOff = start - pos;
    }
    if (startNode && end <= pos + len) {
      endNode = node;
      endOff = end - pos;
      break;
    }
    pos += len;
  }
  if (!startNode || !endNode) return;
  const range = document.createRange();
  range.setStart(startNode, Math.max(0, startOff));
  range.setEnd(endNode, Math.max(0, endOff));
  const H = (globalThis as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
  reg.set(HIGHLIGHT, new H(range));
}

function clearHighlight() {
  highlights()?.delete(HIGHLIGHT);
}

/**
 * A Listen button (lib/speech.ts). Reads `text`, or, with `targetId`, the
 * text of that element, highlighting each word as it's read where the
 * browser supports it. Hidden when the device can't speak or the student has
 * turned Listen buttons off in Settings.
 */
export default function ListenButton({
  text,
  targetId,
  label = "Listen",
  className,
  compact = false,
}: {
  text?: string;
  targetId?: string;
  /** What's read, for screen readers: "Listen to the question" */
  label?: string;
  className?: string;
  /** Icon only (labelled for screen readers), for tight spots */
  compact?: boolean;
}) {
  const id = useId();
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const sync = () => setAvailable(speechSupported() && getListenSettings().show);
    sync();
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if ("settings" in d) sync();
      if ("speaking" in d) setSpeaking(d.speaking === id);
    };
    window.addEventListener(SPEECH_EVENT, onEvent);
    return () => {
      window.removeEventListener(SPEECH_EVENT, onEvent);
      if (currentlySpeaking() === id) stopSpeaking();
    };
  }, [id]);

  if (!available) return null;

  async function toggle() {
    if (speaking) {
      stopSpeaking();
      clearHighlight();
      return;
    }
    const el = targetId ? document.getElementById(targetId) : null;
    const spoken = text ?? el?.textContent ?? "";
    await speak(id, spoken, {
      onWord: el && !text ? (start, length) => highlightRange(el, start, length) : undefined,
    });
    clearHighlight();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? "Stop reading" : label}
      aria-pressed={speaking}
      className={cn(
        "listen-btn inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold transition-colors",
        compact ? "w-8 h-8 justify-center" : "px-2.5 py-1",
        speaking
          ? "border-teal bg-teal/15 text-teal"
          : "border-surface-border text-ink-muted hover:text-ink hover:border-teal/50",
        className
      )}
    >
      {speaking ? (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2.5" y="2.5" width="7" height="7" rx="1" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 6h2.5L9 3v10L5.5 10H3z" fill="currentColor" />
          <path d="M11.5 5.5a3.5 3.5 0 010 5M13 3.5a6 6 0 010 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {!compact && <span>{speaking ? "Stop" : "Listen"}</span>}
    </button>
  );
}
