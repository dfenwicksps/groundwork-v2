// Stand-in Supabase for the audits: GoTrue's /auth/v1/user and a small
// PostgREST over in-memory seed rows for one student, "Sam", part-way through
// Mission 3, with a self-check taken. Writes are accepted and echoed but never kept. Not for anything
// but the audits in this folder.
//
// Settings (environment variables):
//   MOCK_PORT=54321   port to listen on
//   ONBOARDED=0       Sam hasn't finished onboarding (to audit /onboarding)
//   THEME=bold        the look saved on Sam's account (default: none, so Neon)
//   CHECKINS=none     no check-ins yet (to audit the check-in form)
//   SELFCHECK=none    no self-check yet (to audit the self-check form)
const http = require("http");
const UID = "00000000-0000-4000-8000-000000000001";
const now = Date.now();
const iso = (daysAgo) => new Date(now - daysAgo * 86400000).toISOString();

const M = {
  1: ["chapters-so-far","strengths-mapping","values-clarifier","mask-check","identity-letter","weekly-challenge","conversation-who-i-was","parts-of-you"],
  2: ["what-matters","contribution-map","the-other-side","commitment-statement","purpose-challenge","conversation-what-matters"],
  3: ["belonging","fitting-in-vs-belonging","across-the-gap","people-who-shaped-you","connection-challenge"],
};
const STRENGTH_KEYS = ["kindness","humor","curiosity","fairness","perseverance","honesty","creativity","love","teamwork","gratitude","hope","bravery","judgment","perspective","zest","social-intelligence","leadership","forgiveness","humility","prudence","self-regulation","appreciation","love-of-learning","spirituality"];
let n = 0; const id = () => `10000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const progress = [];
for (const [m, acts] of Object.entries(M)) acts.forEach((a, i) => {
  if (m === "3" && i > 2) return;
  progress.push({ id: id(), user_id: UID, mission_id: Number(m), activity_id: a, completed_at: iso(40 - i), started_at: iso(41 - i) });
});

const entry = (mission_id, activity_id, response, days, extra = {}) => ({
  id: id(), user_id: UID, mission_id, activity_id, prompt: "", response, created_at: iso(days), updated_at: iso(days),
  is_milestone: false, ai_reflection: null, revisit_of: null, ...extra,
});
const journal = [
  entry(1, "values-clarifier", "Honesty: telling the truth\nFairness\nFamily\nCreativity\nFriendship", 38),
  entry(1, "chapters-so-far", "1. Chapter titles\nThe Quiet Years\n\n2. Current chapter\nFinding My People", 39),
  entry(1, "identity-letter", "Dear me, you are kinder than you think.", 30, { is_milestone: true }),
  entry(1, "mask-check", "At school I keep my head down. At home I'm loud.", 33),
  entry(2, "what-matters", "Animals, and people being treated fairly.", 20),
  entry(2, "commitment-statement", "I stand for fairness. I'll speak up once a week.", 15, { is_milestone: true }),
  entry(3, "belonging", "Footy club feels like mine.", 8),
  entry(0, "free-journal", "Rough week, but I sorted it with Jo.", 2),
];

const stories = [
  [1, "The Version of Me at School"], [1, "The Mask That Slipped"], [2, "The Thing She Couldn't Ignore"],
  [2, "The Coach Who Stopped Winning"], [3, "The Friend Who Stayed"], [3, "Different Enough"],
  [4, "The Long Way Round"], [4, "A Letter to Twenty-Five"],
].map(([mission_id, title]) => ({
  id: id(), mission_id, title, teaser: "A short story about working out who you are when it isn't easy.",
  context: "Context paragraph. ".repeat(6), turning_point: "Turning point paragraph. ".repeat(6),
  reflection_prompts: ["What would you have done?", "Who does this remind you of?"], tags: [],
}));

const T = {
  users: [{ id: UID, display_name: "Sam Rivera", created_at: iso(80), onboarding_complete: process.env.ONBOARDED !== "0", active_mission: 3, life_stage: "middle", theme: process.env.THEME || null, journey_phase: 1, phase_meta: null, ai_reflections_enabled: true }],
  strength_profiles: [{ id: id(), user_id: UID, ranking: STRENGTH_KEYS, scores: Object.fromEntries(STRENGTH_KEYS.map((k, i) => [k, 24 - i])), created_at: iso(39), updated_at: iso(39) }],
  mission_progress: progress,
  journal_entries: journal,
  program_progress: [1, 2, 3].map((w) => ({ id: id(), user_id: UID, week: w, started_at: iso(30 - w * 7), completed_at: iso(24 - w * 7), days: [0, 1, 2, 3, 4, 5, 6], sessions: 4, commitment: w === 2 ? "Honesty|Tell Mum when I've broken something" : null, reflection: "It went better than I thought." }))
    .concat([{ id: id(), user_id: UID, week: 4, started_at: iso(3), completed_at: null, days: [0, 1], sessions: 0, commitment: "Out the door by 7:40 every day", reflection: null }]),
  outcome_checkins: process.env.CHECKINS === "none" ? [] : [
    { id: id(), user_id: UID, wave: "start", item_set: "groundwork-interim-v2", answers: {}, scores: { clarity: 3, esteem: 3.5, confidence: 2.5, efficacy: 3, mattering: 4 }, life_stage: "middle", created_at: iso(75), context: "onboarding", dose: {} },
    { id: id(), user_id: UID, wave: "end", item_set: "groundwork-interim-v2", answers: {}, scores: { clarity: 3.5, esteem: 3.5, confidence: 3.5, efficacy: 3.7, mattering: 3.7 }, life_stage: "middle", created_at: iso(2), context: "home", dose: {} },
  ],
  stories, story_reads: [{ id: id(), user_id: UID, story_id: stories[0].id, read_at: iso(70), actioned_at: null }],
  standard_checkins: [{ id: id(), user_id: UID, set: "standard", answers: { safer: "I sat with Jo at lunch.", value: "Helped clean up after training.", trust: "Kept the secret I was told." }, created_at: iso(9), updated_at: iso(9) }],
  support_circle: [{ id: id(), user_id: UID, name: "Mum", relationship: "parent", created_at: iso(60) }, { id: id(), user_id: UID, name: "Coach Lee", relationship: "mentor", created_at: iso(50) }],
  goals: [{ id: id(), user_id: UID, title: "Get my maths grade up", domain: "school", wish: "Pass maths", outcome: "A C or better", obstacle: "Phone", plan: "If it's 4pm, then phone in the kitchen", status: "active", created_at: iso(12) }],
  practice_log: [{ id: id(), user_id: UID, strength_key: "kindness", action: "One unrequested favour a day", started_at: iso(5), completed_at: null, reflection: null }],
  small_steps: [
    { id: id(), user_id: UID, entry_id: null, source_kind: "activity", source_key: "mask-check", source_label: "The Mask Check", step: "Be a little more myself once in the room where I hold back", when_label: "This week", due_at: iso(1), status: "open", snoozes: 0, done_at: null, created_at: iso(7) },
    { id: id(), user_id: UID, entry_id: null, source_kind: "week", source_key: "3", source_label: "Week 3 · Am I a contributor?", step: "Notice someone else's unnoticed contribution and thank them", when_label: "Tomorrow", due_at: iso(10), status: "done", snoozes: 0, done_at: iso(9), created_at: iso(12) },
    { id: id(), user_id: UID, entry_id: null, source_kind: "activity", source_key: "values-clarifier", source_label: "Values Clarifier", step: "Make one choice this week because of my top value", when_label: "This week", due_at: iso(30), status: "done", snoozes: 0, done_at: iso(28), created_at: iso(36) },
  ],
  // Only names are stored as a result: two steady levels, two to look at, a self from each.
  self_checks: process.env.SELFCHECK === "none" ? [] : [
    { id: id(), student_id: UID, item_set: "v1", taken_at: iso(6), suggested: { steady: [1, 2], levels: [3, 4], selves: ["self-regulation", "self-efficacy"] } },
  ],
  moral_profiles: [], challenges: [], conversation_requests: [], onboarding_results: [],
};

function filterRows(rows, params) {
  let out = rows;
  for (const [k, v] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
    const m = /^(not\.)?(eq|neq|in|is|like|ilike|gte|lte|gt|lt)\.(.*)$/.exec(v);
    if (!m) continue;
    const [, neg, op, raw] = m;
    const test = (r) => {
      const x = r[k];
      switch (op) {
        case "eq": return String(x) === raw;
        case "neq": return String(x) !== raw;
        case "in": return raw.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/^"|"$/g, "")).includes(String(x));
        case "is": return raw === "null" ? x == null : String(x) === raw;
        case "like": case "ilike": { const re = new RegExp("^" + raw.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/%/g, ".*") + "$", op === "ilike" ? "i" : ""); return re.test(String(x ?? "")); }
        case "gte": return String(x) >= raw; case "lte": return String(x) <= raw;
        case "gt": return String(x) > raw; case "lt": return String(x) < raw;
      }
      return true;
    };
    out = out.filter((r) => (neg ? !test(r) : test(r)));
  }
  const order = params.get("order");
  if (order) {
    const [col, dir] = order.split(",")[0].split(".");
    out = [...out].sort((a, b) => (String(a[col] ?? "") < String(b[col] ?? "") ? -1 : 1) * (dir === "desc" ? -1 : 1));
  }
  const limit = Number(params.get("limit"));
  if (limit) out = out.slice(0, limit);
  return out;
}

const user = { id: UID, aud: "authenticated", role: "authenticated", email: "sam@example.com", email_confirmed_at: iso(80), created_at: iso(80), app_metadata: { provider: "email" }, user_metadata: {} };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Expose-Headers": "Content-Range" };
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  let body = ""; req.on("data", (c) => (body += c));
  req.on("end", () => {
    const send = (code, obj, extra = {}) => { res.writeHead(code, { "Content-Type": "application/json", ...cors, ...extra }); res.end(obj === undefined ? "" : JSON.stringify(obj)); };
    if (url.pathname.startsWith("/auth/v1/user")) return send(200, user);
    if (url.pathname.startsWith("/auth/v1/")) return send(200, {});
    const m = /^\/rest\/v1\/([a-z_]+)/.exec(url.pathname);
    if (!m) return send(404, { message: "not found" });
    const table = T[m[1]];
    if (!table) return send(404, { code: "42P01", message: `relation "public.${m[1]}" does not exist` });
    if (req.method === "GET" || req.method === "HEAD") {
      const rows = filterRows(table, url.searchParams);
      const range = { "Content-Range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}` };
      if (req.method === "HEAD") return send(200, undefined, range);
      if ((req.headers.accept || "").includes("vnd.pgrst.object")) {
        if (rows.length !== 1) return send(406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `Results contain ${rows.length} rows` });
        return send(200, rows[0], range);
      }
      return send(200, rows, range);
    }
    // Writes: accept and echo, never persisted (the audit only looks).
    let data = {}; try { data = JSON.parse(body || "{}"); } catch {}
    const one = Array.isArray(data) ? data[0] : data;
    if ((req.headers.accept || "").includes("vnd.pgrst.object")) return send(201, { id: id(), ...one });
    return send(201, [{ id: id(), ...one }]);
  });
}).listen(Number(process.env.MOCK_PORT || 54321), () => console.log(`stand-in Supabase on :${process.env.MOCK_PORT || 54321}`));
