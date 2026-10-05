// Prints how many students have finished each mission step and program week:
// totals only, from the views in supabase/migrations/015_completion_counts.sql.
//
//   npm run report:completion
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, from the
// environment or .env.local. Counts under five are shown as "fewer than 5",
// and so is any share worked out from one, so a small group can't be picked
// out. It won't run before COUNTS_START: students were told in the app first.

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { MISSIONS, requiredSteps } from "../src/lib/missions";
import { PROGRAM_WEEKS } from "../src/lib/program";
import { COUNTS_START, SMALL_COUNT, shownCount } from "../src/lib/completionCounts";

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  if (!existsSync(".env.local")) return undefined;
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

function share(n: number, of: number): string {
  if (!of || n < SMALL_COUNT || of < SMALL_COUNT) return "";
  return ` (${Math.round((n / of) * 100)}%)`;
}

async function main() {
  if (new Date() < new Date(`${COUNTS_START}T00:00:00`)) {
    console.error(
      `Not yet: students were told about these counts in the app, and they may only be read from ${COUNTS_START}.`
    );
    process.exit(1);
  }
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or put them in .env.local).");
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const [signups, steps, weeks] = await Promise.all([
    db.from("signup_counts").select("students, onboarded").single(),
    db.from("step_completion_counts").select("mission_id, activity_id, students"),
    db.from("week_completion_counts").select("week, started, finished"),
  ]);
  for (const r of [signups, steps, weeks]) {
    if (r.error) {
      console.error(`Couldn't read the counts (has migration 015 been run?): ${r.error.message}`);
      process.exit(1);
    }
  }

  const onboarded = signups.data!.onboarded as number;
  const byStep = new Map(
    (steps.data as { mission_id: number; activity_id: string; students: number }[]).map((r) => [
      `${r.mission_id}:${r.activity_id}`,
      r.students,
    ])
  );
  const byWeek = new Map(
    (weeks.data as { week: number; started: number; finished: number }[]).map((r) => [r.week, r])
  );

  console.log(`Signed up: ${shownCount(signups.data!.students as number)}`);
  console.log(`Finished onboarding: ${shownCount(onboarded)}`);

  // Each step against the one before it, so the biggest drop stands out.
  for (const m of MISSIONS) {
    console.log(`\nMission ${m.id} · ${m.title}`);
    let previous = onboarded;
    requiredSteps(m).forEach((a, i) => {
      const n = byStep.get(`${m.id}:${a.id}`) ?? 0;
      console.log(`  ${i + 1}. ${a.title}: ${shownCount(n)}${share(n, previous)}`);
      previous = n;
    });
    for (const a of m.activities.filter((x) => x.optional)) {
      const n = byStep.get(`${m.id}:${a.id}`) ?? 0;
      console.log(`  Optional · ${a.title}: ${shownCount(n)}`);
    }
  }

  console.log("\nThe ten weeks (started / finished)");
  for (const w of PROGRAM_WEEKS) {
    const r = byWeek.get(w.week);
    console.log(`  Week ${w.week} · ${w.title}: ${shownCount(r?.started ?? 0)} / ${shownCount(r?.finished ?? 0)}`);
  }
  console.log(`\nShares are against the line above. Counts under ${SMALL_COUNT} are hidden.`);
}

main();
