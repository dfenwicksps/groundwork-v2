# Groundwork

A mission-based, self-guided web app for teenagers that supports development of identity, purpose, connection, and meaning.

---

## What's built

This repo contains the full MVP foundation:

- ✅ Complete Supabase schema with RLS policies
- ✅ Auth (email + Google OAuth) with onboarding redirect
- ✅ 3-step onboarding flow
- ✅ Dashboard with mission map, active challenge, recent entries, support circle
- ✅ Mission 1 — all 5 activities (journal, values picker, mask check, milestone letter, weekly challenge)
- ✅ Missions 2–4 (first activity each, additional activities locked)
- ✅ Journal view — filterable, expandable, read-only after 24h
- ✅ AI reflection layer (Anthropic Claude) — fails silently if unavailable
- ✅ Stories library (8 seeded stories, 2 per mission)
- ✅ Support Circle page with conversation scaffolds
- ✅ Settings page
- ✅ Route-level auth middleware
- ✅ Mobile-first responsive design throughout

---

## Setup guide

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [Anthropic](https://console.anthropic.com) API key
- A [Vercel](https://vercel.com) account (for deployment, optional for local dev)

---

### Step 1 — Create a Supabase project

1. Go to [app.supabase.com](https://app.supabase.com) and click **New project**
2. Choose a name (e.g. `groundwork`), set a database password, choose a region
3. Wait ~2 minutes for provisioning

---

### Step 2 — Run the database schema

1. In your Supabase project, go to **SQL Editor** → **New query**
2. Open the file `supabase/schema.sql` from this repo
3. Paste the entire contents into the SQL editor
4. Click **Run**

This creates all tables, sets up Row Level Security, creates the user auto-creation trigger, and seeds the 8 stories.

**Verify:** After running, go to **Table Editor** and check that `stories` has 8 rows.

---

### Step 3 — Enable Google OAuth (optional)

1. In Supabase: **Authentication** → **Providers** → **Google**
2. Follow the [Google OAuth setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
3. Add your Google Client ID and Secret

If you skip this, email/password auth will still work.

---

### Step 4 — Get your environment variables

In Supabase: **Settings** → **API**

Copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret)*

In Anthropic Console: **API Keys** → create a new key → `ANTHROPIC_API_KEY`

---

### Step 5 — Configure local environment

```bash
cp .env.local.example .env.local
```

Fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 6 — Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Step 7 — Configure auth redirect URLs

In Supabase: **Authentication** → **URL Configuration**

Add to **Redirect URLs**:
```
http://localhost:3000/auth/callback
```

For production, also add:
```
https://your-domain.vercel.app/auth/callback
```

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all environment variables from `.env.local`
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Deploy

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── page.tsx                # Sign in / sign up
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── onboarding/
│   │   └── page.tsx                # 3-step onboarding
│   ├── dashboard/
│   │   ├── page.tsx                # Server component (data fetching)
│   │   └── DashboardClient.tsx     # Client component (UI)
│   ├── missions/[id]/
│   │   ├── page.tsx
│   │   ├── MissionDetailClient.tsx
│   │   └── activities/[activityId]/
│   │       ├── page.tsx
│   │       └── ActivityClient.tsx  # Handles all activity types
│   ├── journal/
│   ├── stories/
│   ├── support/
│   ├── settings/
│   └── api/
│       └── reflect/route.ts        # AI reflection endpoint
├── components/
│   └── layout/
│       └── AppShell.tsx            # Nav + page wrapper
├── lib/
│   ├── supabase.ts                 # Client + server Supabase instances
│   ├── missions.ts                 # Mission/activity data (content layer)
│   └── utils.ts                   # Utility functions
├── types/
│   └── database.ts                 # Full TypeScript types for Supabase schema
└── middleware.ts                   # Route protection
```

---

## Design system

**Typography**
- Display: Fraunces (serif, used for headings, mission questions, emotional moments)
- Body: DM Sans (clean, legible for small text)

**Colour palette**
| Name | Hex | Used for |
|------|-----|----------|
| Navy | `#1B3A5C` | Primary, Mission 1 |
| Teal | `#2E7D8C` | Accent, Mission 2, interactive states |
| Gold | `#C8982A` | Challenges, milestones, Mission 4 |
| Sage | `#4A7C59` | Success, Mission 3 |
| Surface muted | `#F8F8F6` | App background |

**Component classes** (defined in `globals.css`)
- `.card` — standard card with soft shadow
- `.card-elevated` — raised card
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-teal` — button variants
- `.input` — form input
- `.journal-textarea` — writing area
- `.progress-bar` / `.progress-fill` — mission progress
- `[data-animate="N"]` — staggered fade-up on mount

---

## Ethical constraints (enforced in code)

- The words "AI", "artificial intelligence", and "chatbot" never appear in the UI
- All AI output is labelled "Something to sit with:"
- No social features, no public profiles, no comparisons
- Journal content never logged or exposed beyond the authenticated user's session
- Support page actively directs users to human connections and Kids Helpline
- Onboarding explicitly prompts users to identify a trusted adult before starting
- "This is not a therapy app" stated on landing page and settings footer

---

## What to build next

Phases not yet built (from the original spec):

- [ ] Mission 2–4 remaining activities
- [ ] Journal export (optional — spec says no MVP export)
- [ ] Push notifications (spec says no MVP)
- [ ] Parent/teacher view (not in spec, but likely needed for school pilots)
- [ ] Analytics dashboard for educators (beyond MVP)
- [ ] Account deletion via service role key (currently signs out only)
- [ ] Email confirmation flow testing end-to-end
- [ ] Full accessibility audit (WCAG 2.1 AA)

---

## Notes for school pilot

When running this as a school pilot:

1. Consider disabling Google OAuth and using email-only (simpler for students)
2. The Kids Helpline number (1800 55 1800) is Australian — update for other regions
3. All journal content is encrypted at rest by Supabase (PostgreSQL AES-256)
4. No teacher or parent can read student journal entries — this is by design
5. You may want to add a parent notification system before commercial launch
