"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { markStoryRead } from "@/lib/storyEngagement";

/**
 * The player shared by every animated story: poster, scene-by-scene playback
 * with a line of narration per scene, pause/prev/next, and a transcript.
 *
 * Watching to the end marks the story read (the story page passes
 * markReadOnView={false} to its reflection section), and so does opening the
 * transcript — reading it is an equal way in for anyone who can't watch.
 *
 * Scene art is inline SVG animated with CSS supplied by each film. Everything
 * inside the stage pauses with the player via `.film-paused`, and each scene
 * remounts on entry so its animations start from the top.
 *
 * SVG note for film authors: an element's CSS transform animation replaces its
 * transform attribute, so anything animated sits inside a separately
 * positioned <g>.
 */

export interface FilmScene {
  id: string;
  duration: number; // ms
  caption: string;
  art: ReactNode;
}

export default function FilmPlayer({
  storyId,
  scenes,
  poster,
  css,
}: {
  storyId: string;
  scenes: FilmScene[];
  poster: ReactNode;
  css: string;
}) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 through the current scene
  const [done, setDone] = useState(false);
  const elapsedRef = useRef(0);
  const markedRef = useRef(false);

  const markRead = () => {
    if (markedRef.current) return;
    markedRef.current = true;
    markStoryRead(storyId);
  };

  // A rAF clock rather than timeouts, so pause/resume keeps its place exactly.
  useEffect(() => {
    if (!playing || done) return;
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      // Capped so time spent in a background tab (no frames) doesn't land as
      // one big jump that skips the scene the student was watching.
      elapsedRef.current += Math.min(now - last, 100);
      last = now;
      const duration = scenes[scene].duration;
      if (elapsedRef.current >= duration) {
        elapsedRef.current = 0;
        if (scene < scenes.length - 1) {
          setProgress(0);
          setScene(scene + 1);
        } else {
          setProgress(1);
          setDone(true);
          setPlaying(false);
          markRead();
        }
        return;
      }
      setProgress(elapsedRef.current / duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // markRead is stable in effect: it only reads refs and the storyId prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, scene, done, storyId, scenes]);

  const goTo = (i: number) => {
    elapsedRef.current = 0;
    setProgress(0);
    setScene(i);
    setDone(false);
  };

  const start = () => {
    setStarted(true);
    setPlaying(true);
  };

  const replay = () => {
    goTo(0);
    setPlaying(true);
  };

  const last = scenes.length - 1;

  return (
    <div>
      <style>{PLAYER_CSS + css}</style>
      <div className="card overflow-hidden mb-3">
        {started && (
          <div className="flex gap-1 px-3 pt-3" aria-hidden="true">
            {scenes.map((s, i) => (
              <div key={s.id} className="h-1 flex-1 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "var(--navy)",
                    width: i < scene || done ? "100%" : i === scene ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className={`relative ${playing ? "" : "film-paused"}`}>
          {!started ? (
            <button onClick={start} className="relative block w-full group" aria-label="Play the story">
              {poster}
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform"
                  style={{ background: "var(--navy)" }}
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M3 1.8v8.4c0 .6.65.97 1.16.66l6.3-4.2a.78.78 0 000-1.32l-6.3-4.2A.78.78 0 003 1.8z" />
                  </svg>
                </span>
              </span>
              <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-ink-muted">
                An animated story · about a minute
              </span>
            </button>
          ) : (
            <div key={scene} className="film-scene">
              {scenes[scene].art}
            </div>
          )}

          {done && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <button onClick={replay} className="btn-secondary text-sm">
                Watch again
              </button>
            </div>
          )}
        </div>

        {started && (
          <div className="px-4 pb-4">
            <p
              key={scene}
              className="film-caption text-sm text-ink leading-relaxed min-h-[5.5rem] pt-3"
              aria-live="polite"
            >
              {scenes[scene].caption}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-ink-muted">
                Scene {scene + 1} of {scenes.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo(scene - 1)}
                  disabled={scene === 0}
                  aria-label="Previous scene"
                  className="w-8 h-8 rounded-full border border-surface-border flex items-center justify-center text-ink-muted hover:border-navy/30 disabled:opacity-40 transition-all"
                >
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => (done ? replay() : setPlaying(!playing))}
                  aria-label={done ? "Watch again" : playing ? "Pause" : "Play"}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
                  style={{ background: "var(--navy)" }}
                >
                  {playing ? (
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <rect x="2.5" y="1.5" width="2.5" height="9" rx="0.75" />
                      <rect x="7" y="1.5" width="2.5" height="9" rx="0.75" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 1.8v8.4c0 .6.65.97 1.16.66l6.3-4.2a.78.78 0 000-1.32l-6.3-4.2A.78.78 0 003 1.8z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => goTo(scene + 1)}
                  disabled={scene === last}
                  aria-label="Next scene"
                  className="w-8 h-8 rounded-full border border-surface-border flex items-center justify-center text-ink-muted hover:border-navy/30 disabled:opacity-40 transition-all"
                >
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <details
        className="card p-4 mb-6"
        onToggle={(e) => {
          if ((e.currentTarget as HTMLDetailsElement).open) markRead();
        }}
      >
        <summary className="text-sm font-medium text-teal cursor-pointer select-none">
          Prefer to read it?
        </summary>
        <div className="mt-3 space-y-3">
          {scenes.map((s) => (
            <p key={s.id} className="text-sm text-ink leading-relaxed">
              {s.caption}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
}

const PLAYER_CSS = `
.film-scene, .film-caption { animation: film-in 0.6s ease both; }
@keyframes film-in { from { opacity: 0; } to { opacity: 1; } }
.film-paused, .film-paused * { animation-play-state: paused !important; }
@media (prefers-reduced-motion: reduce) {
  .film-scene *, .film-scene, .film-caption {
    animation-duration: 0.01s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
  }
}
`;
