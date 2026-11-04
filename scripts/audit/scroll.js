// Scroll audit: moving to a new screen starts at the top, on a phone.
//   - a mission step's Begin button (at the bottom) opens the first question
//     at the top;
//   - a link at the bottom of one page opens the next page at the top.
//
//   node scripts/audit/scroll.js
const { BASE, loadPlaywright, authCookie } = require("./lib");

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });
  await ctx.addCookies([authCookie()]);
  const p = await ctx.newPage();
  const y = () => p.evaluate(() => Math.round(window.scrollY));
  const found = [];
  const check = (what, got) => { console.log(`  ${what}: scrollY ${got}`); if (got > 80) found.push(`${what} opened ${got}px down, not at the top`); };

  await p.goto(BASE + "/missions/4/activities/where-ive-come-from", { waitUntil: "networkidle" });
  const begin = p.getByRole("button", { name: /Begin/ });
  await begin.scrollIntoViewIfNeeded();
  await begin.click(); await p.waitForTimeout(800);
  check("Mission step, after Begin", await y());

  await p.goto(BASE + "/missions", { waitUntil: "networkidle" });
  const link = p.locator("a[href^='/missions/2']").first();
  await link.scrollIntoViewIfNeeded(); await link.click();
  await p.waitForURL(/missions\/2/); await p.waitForTimeout(800);
  check("Missions list → Mission 2", await y());

  await p.goto(BASE + "/program/4", { waitUntil: "networkidle" });
  const next = p.locator("a[href='/program/5']").last();
  await next.scrollIntoViewIfNeeded(); await next.click();
  await p.waitForURL(/program\/5/); await p.waitForTimeout(800);
  check("Week 4 → Week 5", await y());

  await browser.close();
  for (const f of found) console.log(f);
  console.log(`Scroll: 3 moves, ${found.length} findings.`);
  return found.length;
}

module.exports = main;
if (require.main === module) main().then((bad) => process.exit(bad ? 1 : 0));
