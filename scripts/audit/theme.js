// Theme audit: visits every page in one look and checks
//   - the page is actually in that look (html[data-theme]);
//   - every visible piece of text against the colour behind it (WCAG AA:
//     4.5:1, or 3:1 for large text);
//   - no large light panels (a light card left over from another look);
//   - no JavaScript errors.
// Saves a full-page screenshot of each page and report.json to
// audit-output/theme-<look>/.
//
//   node scripts/audit/theme.js [look] [--only=<text>]
// look: default (Neon, with nothing chosen), neon, bold, light or dark.
const { BASE, loadPlaywright, authCookie, signedInRoutes, PUBLIC_ROUTES, only, outDir } = require("./lib");
const fs = require("fs");

const look = process.argv.slice(2).find((a) => !a.startsWith("--")) || "default";
const expected = look === "default" ? "neon" : look;
// Pages with a deliberately light area of their own (a film's artwork).
const LIGHT_OK = /^\/stories\/[0-9a-f-]{36}$/;

// Runs in the page: every visible text run, its colour and the colour behind it.
function auditPage() {
  const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const pageBg = parse(getComputedStyle(document.body).backgroundColor) || { r: 0, g: 0, b: 0, a: 1 };
  function bgOf(el) {
    const layers = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
      if (cs.backgroundImage && cs.backgroundImage.includes("gradient") && e !== document.body && !e.matches("div[data-theme]")) {
        // Use the gradient's first colour stop as an estimate.
        const g = parse((cs.backgroundImage.match(/rgba?\([^)]+\)/) || [])[0]);
        if (g && g.a > 0.5) { layers.push({ ...g, a: 1 }); break; }
      }
    }
    let col = { ...pageBg, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) col = blend(layers[i], col);
    return col;
  }
  const skip = (el) => el.closest("svg, [aria-hidden='true'], .sr-only, [data-film], .film, iframe, video, canvas, [class*='Film']");
  const issues = []; const light = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const text = t.textContent.trim(); if (!text) continue;
    const el = t.parentElement; if (!el || seen.has(el) || skip(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.15) continue;
    let fg = parse(cs.color); if (!fg) continue;
    // Effective opacity from ancestors
    let op = 1; for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity);
    const bg = bgOf(el); fg = blend({ ...fg, a: fg.a * op }, bg);
    const l1 = lum(fg), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) issues.push({ text: text.slice(0, 60), ratio: Math.round(ratio * 100) / 100, need, fg: cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, cls: (el.className || "").toString().slice(0, 90), tag: el.tagName });
  }
  // Large light panels (Neon has none): anything over 3000px² with a light, opaque background.
  for (const el of document.body.querySelectorAll("*")) {
    // Buttons, links and chips are meant to be bright in Neon; only flag panels.
    if (skip(el) || el.matches("button, a, [role=button], label, .btn, .btn *")) continue;
    const cs = getComputedStyle(el); const c = parse(cs.backgroundColor);
    if (!c || c.a < 0.6) continue;
    const r = el.getBoundingClientRect(); if (r.width * r.height < 3000) continue;
    if (lum(c) > 0.35) light.push({ bg: cs.backgroundColor, w: Math.round(r.width), h: Math.round(r.height), cls: (el.className || "").toString().slice(0, 90), tag: el.tagName, text: (el.innerText || "").trim().slice(0, 50) });
  }
  return { theme: document.documentElement.dataset.theme, issues, light };
}

async function main() {
  const { chromium } = loadPlaywright();
  const tag = (process.argv.find((x) => x.startsWith("--out=")) || "").slice(6);
  const out = outDir(`theme-${look}${tag ? "-" + tag : ""}`);
  const browser = await chromium.launch();
  const report = {};
  for (const [signedIn, list] of [[true, only(signedInRoutes())], [false, only(PUBLIC_ROUTES)]]) {
    for (const vp of [{ width: 390, height: 844, name: "phone" }, { width: 1280, height: 900, name: "desktop" }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      if (signedIn) await ctx.addCookies([authCookie()]);
      await ctx.addInitScript((t) => { try { if (t !== "default") localStorage.setItem("gw_theme_v1", t); } catch {} }, look);
      for (const r of list) {
        const p = await ctx.newPage();
        const errs = []; p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
        const key = `${vp.name} ${r}`;
        try {
          const resp = await p.goto(BASE + r, { waitUntil: "networkidle", timeout: 60000 });
          await p.waitForTimeout(700);
          const res = await p.evaluate(auditPage);
          if (LIGHT_OK.test(r)) res.light = [];
          report[key] = { status: resp && resp.status(), finalUrl: p.url().replace(BASE, ""), ...res, errs };
          await p.screenshot({ path: `${out}/${vp.name}_${r.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
        } catch (e) { report[key] = { error: String(e).slice(0, 200) }; }
        await p.close();
      }
      await ctx.close();
    }
  }
  fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
  await browser.close();
  let bad = 0;
  for (const [k, v] of Object.entries(report)) {
    const wrongLook = v.theme !== expected;
    const n = (v.issues || []).length + (v.light || []).length;
    if (!n && !v.error && !(v.errs || []).length && !wrongLook) continue;
    bad++;
    console.log(`${k}${v.finalUrl && !k.endsWith(v.finalUrl) ? " → " + v.finalUrl : ""}: look=${v.theme}${wrongLook ? " (expected " + expected + ")" : ""} contrast=${(v.issues || []).length} light=${(v.light || []).length}${v.error ? " ERROR " + v.error : ""}${(v.errs || []).length ? " JS: " + v.errs[0] : ""}`);
    for (const i of (v.issues || []).slice(0, 3)) console.log(`    ${i.ratio}:1 (needs ${i.need}) "${i.text}" ${i.fg} on ${i.bg}`);
    for (const l of (v.light || []).slice(0, 2)) console.log(`    light panel ${l.w}x${l.h} ${l.bg} <${l.tag.toLowerCase()} class="${l.cls}">`);
  }
  console.log(`Theme (${look}): ${Object.keys(report).length} page views, ${bad} with findings. Screenshots in ${out}`);
  return bad;
}

module.exports = main;
if (require.main === module) main().then((bad) => process.exit(bad ? 1 : 0));
