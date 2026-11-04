// Runs the audits against the app on a stand-in database: starts
// mock-supabase.js and `next dev` (unless an app is already answering at
// AUDIT_BASE), runs each check, then stops what it started.
//
//   npm run audit                 all checks, in the default look (Neon)
//   npm run audit -- theme:bold   one check, in another look
//   npm run audit -- phone scroll
//
// Checks: theme[:look], phone, scroll, speech. Exit code 1 if any finding.
const { spawn } = require("child_process");
const path = require("path");
const { BASE } = require("./lib");

const ROOT = path.resolve(__dirname, "../..");
const MOCK_PORT = 54321;
const started = [];

function start(cmd, args, env) {
  const child = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"], detached: true });
  child.stderr.on("data", (d) => process.env.AUDIT_VERBOSE && process.stderr.write(d));
  started.push(child);
  return child;
}

function stop(child) {
  try { process.kill(-child.pid); } catch {}
  started.splice(started.indexOf(child), 1);
}

async function up(url, seconds) {
  for (let i = 0; i < seconds; i++) {
    try { const r = await fetch(url); if (r.status < 500) return true; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function startMock(env = {}) {
  const m = start(process.execPath, [path.join(__dirname, "mock-supabase.js")], { MOCK_PORT: String(MOCK_PORT), ...env });
  return up(`http://localhost:${MOCK_PORT}/rest/v1/profiles`, 10).then(() => m);
}

/** Runs one check with argv set as if from the command line. */
async function run(file, args) {
  const saved = process.argv;
  process.argv = [saved[0], file, ...args];
  try {
    delete require.cache[require.resolve(file)];
    return await require(file)();
  } finally {
    process.argv = saved;
  }
}

async function main() {
  const asked = process.argv.slice(2);
  const checks = asked.length ? asked : ["theme", "phone", "scroll", "speech"];

  let mock = null;
  if (!(await up(BASE, 1))) {
    mock = await startMock();
    const port = new URL(BASE).port || "3123";
    console.log(`Starting the app on ${BASE} against the stand-in database…`);
    start("npx", ["next", "dev", "-p", port], {
      NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${MOCK_PORT}`,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "audit", SUPABASE_SERVICE_ROLE_KEY: "audit",
      NEXT_TELEMETRY_DISABLED: "1",
    });
    if (!(await up(BASE, 120))) throw new Error(`The app didn't start on ${BASE}`);
    // Compile the main pages before timing anything.
    for (const r of ["/", "/dashboard", "/me"]) await fetch(BASE + r).catch(() => {});
  } else {
    console.log(`Using the app already running at ${BASE}.`);
  }

  let findings = 0;
  for (const c of checks) {
    const [name, look] = c.split(":");
    console.log(`\n── ${c} ──`);
    if (name === "theme") {
      findings += await run(path.join(__dirname, "theme.js"), [look || "default"]);
      // A new student's screens need a student with nothing done yet.
      if (mock) {
        stop(mock);
        mock = await startMock({ ONBOARDED: "0", CHECKINS: "none" });
        console.log("  …and as a new student (onboarding, first check-in):");
        findings += await run(path.join(__dirname, "theme.js"), [look || "default", "--only=/onboarding,/check-in", "--out=new-student"]);
        stop(mock);
        mock = await startMock();
      }
    } else if (["phone", "scroll", "speech"].includes(name)) {
      findings += await run(path.join(__dirname, `${name}.js`), []);
    } else {
      console.log(`Unknown check "${c}". Use theme[:look], phone, scroll or speech.`);
      findings++;
    }
  }
  console.log(`\n${findings ? findings + " findings" : "No findings"}.`);
  return findings;
}

main()
  .then((n) => { started.slice().forEach(stop); process.exit(n ? 1 : 0); })
  .catch((e) => { console.error(e); started.slice().forEach(stop); process.exit(2); });
