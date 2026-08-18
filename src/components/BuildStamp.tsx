// ─── Build stamp ──────────────────────────────────────────────────────────────
// Which build is actually running. The version number alone can't answer that —
// two deploys can share a version — so the commit is the real identity, and the
// branch is shown too, because deploying the wrong branch is the failure this
// exists to make visible.
//
// Values are inlined at build time by next.config.mjs.

export const BUILD = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0",
  sha: process.env.NEXT_PUBLIC_BUILD_SHA || "",
  ref: process.env.NEXT_PUBLIC_BUILD_REF || "",
  time: process.env.NEXT_PUBLIC_BUILD_TIME || "",
  env: process.env.NEXT_PUBLIC_BUILD_ENV || "local",
};

/** "v0.4.0 · a1b2c3d · main" — omits any part that isn't known. */
export function buildLabel(): string {
  const parts = [`v${BUILD.version}`];
  if (BUILD.sha) parts.push(BUILD.sha);
  if (BUILD.ref) parts.push(BUILD.ref);
  return parts.join(" · ");
}

function buildDate(): string {
  if (!BUILD.time) return "";
  const d = new Date(BUILD.time);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Deliberately quiet — this is for whoever is checking a deploy, not something
 * a 14-year-old needs to read. `title` carries the full detail on hover.
 */
export default function BuildStamp({ className = "" }: { className?: string }) {
  const date = buildDate();
  const detail = [
    `Version ${BUILD.version}`,
    BUILD.sha && `commit ${BUILD.sha}`,
    BUILD.ref && `branch ${BUILD.ref}`,
    date && `built ${date}`,
    BUILD.env !== "local" && BUILD.env,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <p
      title={detail}
      className={`text-[11px] text-ink-muted/70 tabular-nums ${className}`}
    >
      {buildLabel()}
      {date && <span className="opacity-70"> · {date}</span>}
      {BUILD.env === "preview" && (
        <span className="ml-1.5 px-1 py-0.5 rounded bg-gold/15 text-gold-text font-semibold uppercase tracking-wide text-[9px]">
          preview
        </span>
      )}
    </p>
  );
}
