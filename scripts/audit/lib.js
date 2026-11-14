// Shared by the audits: where the app is, who's signed in, and which pages to
// visit. See README.md in this folder.
const fs = require("fs");
const path = require("path");

const BASE = process.env.AUDIT_BASE || "http://localhost:3123";
const UID = "00000000-0000-4000-8000-000000000001";
const OUT = path.resolve(__dirname, "../../audit-output");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    console.error(
      "Playwright isn't installed. Run:\n  npm install --no-save playwright && npx playwright install chromium"
    );
    process.exit(2);
  }
}

/** The Supabase auth cookie for the stand-in student. */
function authCookie() {
  const exp = Math.floor(Date.now() / 1000) + 86400 * 30;
  const session = {
    access_token: "audit-token", token_type: "bearer", expires_in: 86400 * 30, expires_at: exp,
    refresh_token: "audit-refresh",
    user: { id: UID, aud: "authenticated", role: "authenticated", email: "sam@example.com" },
  };
  return {
    name: "sb-localhost-auth-token",
    value: "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
    domain: new URL(BASE).hostname, path: "/",
  };
}

/** Every mission step, read from the missions file so new steps are picked up. */
function missionSteps() {
  const src = fs.readFileSync(path.resolve(__dirname, "../../src/lib/missions.ts"), "utf8");
  const out = {};
  // Each mission starts with `id: N,` and its steps carry `id: "slug"`.
  const parts = src.split(/\n\s{2,4}id: (\d),/).slice(1);
  for (let i = 0; i < parts.length; i += 2) {
    const steps = [...parts[i + 1].matchAll(/\bid: "([a-z0-9-]+)"/g)].map((m) => m[1]);
    if (steps.length) out[parts[i]] = [...new Set(steps)];
  }
  return out;
}

/** The map's levels, selves and fixed colours, read from the map file. */
function theMap() {
  const read = (f) => fs.readFileSync(path.resolve(__dirname, "../../src", f), "utf8");
  const src = read("lib/v3/levelMap.ts");
  const levels = [...src.matchAll(/level: \d+,\s*key: "([a-z-]+)"/g)].map((m) => m[1]);
  const selves = [...src.matchAll(/\{ key: "([a-z-]+)", name:/g)].map((m) => m[1]);
  const colours = new Set();
  for (const m of (src + read("components/v3/mapStyle.ts")).matchAll(/#([0-9a-f]{6})\b/gi)) {
    const n = parseInt(m[1], 16);
    colours.add(`rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`);
  }
  return { levels, selves, colours };
}

const FILM_STORY = "/stories/10000000-0000-4000-8000-000000000026"; // see mock-supabase.js
const TEXT_STORY = "/stories/10000000-0000-4000-8000-000000000027";

function signedInRoutes() {
  const steps = missionSteps();
  const map = theMap();
  return [
    "/home", "/grow",
    ...map.levels.map((k) => `/grow/${k}`),
    ...map.selves.map((k) => `/me/selves/${k}`),
    "/me/self-check", "/me/self-check/result",
    // v2's addresses, which now lead to Home and the map.
    "/dashboard", "/missions", "/missions/2",
    ...Object.entries(steps).flatMap(([m, a]) => a.map((x) => `/missions/${m}/activities/${x}`)),
    "/program", ...Array.from({ length: 10 }, (_, i) => `/program/${i + 1}`),
    "/journal", "/me", "/me?tab=profile", "/me?tab=reflect", "/me?tab=grow", "/me?tab=future",
    "/stories", FILM_STORY, TEXT_STORY, "/support", "/settings", "/check-in", "/next", "/story",
    "/revisit/10000000-0000-4000-8000-000000000020", "/onboarding",
    "/not-a-page",
  ];
}

const PUBLIC_ROUTES = ["/", "/auth", "/auth?mode=signup", "/privacy", "/terms", "/ask/not-a-real-token"];

/** Narrows a route list with --only=<text>[,<text>…]. */
function only(routes) {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return routes;
  const parts = arg.slice(7).split(",");
  return routes.filter((r) => parts.some((x) => r.includes(x)));
}

function outDir(name) {
  const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { BASE, UID, loadPlaywright, authCookie, signedInRoutes, theMap, PUBLIC_ROUTES, FILM_STORY, only, outDir };
