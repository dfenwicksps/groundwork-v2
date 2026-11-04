// Read-aloud audit, with a stand-in voice (a real one can't run headless):
//   - a question's Listen button reads it, highlights words and finishes;
//   - film narration keeps reading as scenes move on;
//   - turning Listen buttons off in Settings hides them.
// It checks the app's side only. Real voices still need a check on a real
// iPhone and Android phone.
//
//   node scripts/audit/speech.js
const { BASE, FILM_STORY, loadPlaywright, authCookie } = require("./lib");

// Records what's spoken and fires a boundary per word, 40ms apart.
function fakeVoice() {
  window.__spoken = []; let timers = [];
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  const synth = {
    speaking: false,
    getVoices: () => [{ name: "Stand-in", lang: "en-AU", localService: true }],
    cancel() { timers.forEach(clearTimeout); timers = []; },
    speak(u) {
      window.__spoken.push(u.text); let t = 0;
      for (const w of u.text.matchAll(/\S+/g)) {
        timers.push(setTimeout(() => u.onboundary && u.onboundary({ name: "word", charIndex: w.index, charLength: w[0].length }), t));
        t += 40;
      }
      timers.push(setTimeout(() => u.onend && u.onend(), t + 10));
    },
    pause() {}, resume() {}, addEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies([authCookie()]);
  await ctx.addInitScript(fakeVoice);
  const p = await ctx.newPage();
  const found = [];
  p.on("pageerror", (e) => found.push(`JS error: ${String(e).slice(0, 150)}`));
  const expect = (ok, what) => { console.log(`  ${ok ? "ok  " : "FAIL"} ${what}`); if (!ok) found.push(what); };

  // 1. A mission question
  await p.goto(BASE + "/missions/4/activities/where-ive-come-from", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /Begin/ }).click(); await p.waitForTimeout(500);
  await p.getByRole("button", { name: "Listen to the question" }).click(); await p.waitForTimeout(120);
  const mid = await p.evaluate(() => ({
    stop: !!document.querySelector('[aria-label="Stop reading"]'),
    hl: !!(window.CSS && CSS.highlights && CSS.highlights.has("gw-reading")),
  }));
  expect(mid.stop, "question: shows Stop while reading");
  expect(mid.hl, "question: highlights the word being read");
  await p.waitForTimeout(3000);
  const after = await p.evaluate(() => ({
    stop: !!document.querySelector('[aria-label="Stop reading"]'),
    spoken: window.__spoken.length,
  }));
  expect(!after.stop && after.spoken > 0, "question: finishes and goes back to Listen");

  // 2. Film narration
  await p.goto(BASE + FILM_STORY, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Play the story" }).click(); await p.waitForTimeout(300);
  await p.getByRole("button", { name: /Turn narration on/ }).click(); await p.waitForTimeout(300);
  const n1 = await p.evaluate(() => window.__spoken.length);
  await p.waitForTimeout(9000);
  const n2 = await p.evaluate(() => window.__spoken.length);
  expect(n2 > n1, "film: narration keeps reading as scenes change");

  // 3. Turning Listen off
  await p.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await p.locator("h2:has-text('Read aloud')").locator("xpath=..").getByRole("switch").first().click();
  await p.waitForTimeout(300);
  await p.goto(BASE + "/program/4", { waitUntil: "networkidle" });
  expect((await p.locator(".listen-btn").count()) === 0, "settings: turning Listen off hides the buttons");

  await browser.close();
  console.log(`Read-aloud: ${found.length} findings.`);
  return found.length;
}

module.exports = main;
if (require.main === module) main().then((bad) => process.exit(bad ? 1 : 0));
