// Phone layout audit, at 360, 375 and 390px wide:
//   - nothing pushes the page wider than the screen (sideways scrolling);
//   - every text box is at least 16px, so iPhones don't zoom in on tap.
//
//   node scripts/audit/phone.js [--only=<text>]
const { BASE, loadPlaywright, authCookie, signedInRoutes, PUBLIC_ROUTES, only } = require("./lib");

function measure() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const off = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || (r.right <= vw + 1 && r.left >= -1)) continue;
    if (getComputedStyle(el).position === "fixed") continue;
    // Fine if something above it clips sideways (a scrolling row, say).
    let clipped = false;
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(e).overflowX)) { clipped = true; break; }
    }
    if (!clipped) off.push(`<${el.tagName.toLowerCase()} class="${(el.className || "").toString().slice(0, 60)}"> right edge ${Math.round(r.right)}px`);
  }
  const small = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]), textarea, select")]
    .filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 16)
    .map((e) => `${getComputedStyle(e).fontSize} <${e.tagName.toLowerCase()} class="${e.className.slice(0, 50)}">`);
  return { vw, sw, off: off.slice(0, 3), small };
}

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const found = [];
  let views = 0;
  for (const width of [360, 375, 390]) {
    for (const [signedIn, list] of [[true, only(signedInRoutes())], [false, only(PUBLIC_ROUTES)]]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true });
      if (signedIn) await ctx.addCookies([authCookie()]);
      for (const r of list) {
        const p = await ctx.newPage();
        try {
          await p.goto(BASE + r, { waitUntil: "networkidle", timeout: 60000 });
          await p.waitForTimeout(500);
          const m = await p.evaluate(measure);
          views++;
          if (m.sw > m.vw || m.off.length) found.push(`${width}px ${r}: page ${m.sw}px wide on a ${m.vw}px screen. ${m.off.join("; ")}`);
          if (m.small.length && width === 390) found.push(`${r}: text box under 16px (iPhone zooms in): ${m.small.slice(0, 2).join("; ")}`);
        } catch (e) { found.push(`${width}px ${r}: ERROR ${String(e).slice(0, 120)}`); }
        await p.close();
      }
      await ctx.close();
    }
  }
  await browser.close();
  for (const f of found) console.log(f);
  console.log(`Phone layout: ${views} page views, ${found.length} findings.`);
  return found.length;
}

module.exports = main;
if (require.main === module) main().then((bad) => process.exit(bad ? 1 : 0));
