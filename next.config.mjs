import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// ─── Build stamp ──────────────────────────────────────────────────────────────
// Resolved once at build time and inlined, so the running app can say exactly
// which commit it came from. On Vercel the VERCEL_* vars are authoritative (the
// build runs from a detached checkout, where `git rev-parse --abbrev-ref HEAD`
// reports "HEAD" rather than the branch). Locally we fall back to git itself.

function git(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const sha = process.env.VERCEL_GIT_COMMIT_SHA || git("git rev-parse HEAD");
const ref =
  process.env.VERCEL_GIT_COMMIT_REF || git("git rev-parse --abbrev-ref HEAD");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_SHA: sha ? sha.slice(0, 7) : "",
    NEXT_PUBLIC_BUILD_REF: ref === "HEAD" ? "" : ref,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_ENV: process.env.VERCEL_ENV || "local",
  },
};

export default nextConfig;
