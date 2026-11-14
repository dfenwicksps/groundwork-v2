# Audits

Browser checks that load every page of the app the way a student would, on a stand-in database, and report anything that's wrong. Run them after a change to layout, colours or the theme, and before a release.

```
npm install --no-save playwright && npx playwright install chromium   # once
npm run audit                       # every check, in the default look (Neon)
npm run audit -- theme:bold         # the theme check in another look
npm run audit -- phone scroll       # just these checks
```

`npm run audit` starts the stand-in database and `next dev` on port 3123, runs the checks, and stops both. If something is already answering at `AUDIT_BASE` (default `http://localhost:3123`), it uses that instead. It exits with 1 if anything was found. Set `AUDIT_VERBOSE=1` to see the app's own output.

Playwright isn't one of the app's dependencies, so normal installs and deploys stay lean. Install it only where you run the audits.

## The checks

| Check | What it looks for | Pages |
|---|---|---|
| `theme[:look]` | The page is in the right look. All text passes WCAG AA contrast against what's behind it (4.5:1, or 3:1 for large text). No light panels left over from another look; the map's own fixed colours, and white cards on the map's own pages, are allowed (D56). No JavaScript errors. Saves a full-page screenshot of each page. | Every page, phone and desktop. With the runner's own database, it also checks onboarding, a first check-in and the self-check form as a brand-new student. |
| `phone` | Nothing makes a page wider than the screen (no sideways scrolling) at 360, 375 and 390px. Every text box is at least 16px, so iPhones don't zoom in when tapped. | Every page |
| `scroll` | Moving to a new screen starts at the top: Begin on a step, the map to a level, and one week to the next. | Three common moves |
| `speech` | Listen buttons read, highlight words and finish. Film narration keeps reading as scenes change. Turning Listen off in Settings hides the buttons. It uses a stand-in voice, so real iPhone and Android voices still need checking by hand. | A mission question, a film, Settings |

Looks: `default` (nothing chosen, which is Neon), `neon`, `bold`, `light`, `dark`.

Screenshots and `report.json` go to `audit-output/`, which git ignores.

Each check also runs on its own, against an app you've started yourself, for example `node scripts/audit/theme.js light --only=/me`. `--only=` takes part of a page address, or several separated by commas.

## The stand-in database

`mock-supabase.js` answers the app's Supabase calls for one student, Sam, who is part-way through Mission 3 in v2's terms and has taken the self-check. Sam has journal entries, a support circle, a goal, small steps, and both check-ins done. It never stores anything. Settings:

| Variable | Effect |
|---|---|
| `ONBOARDED=0` | Sam hasn't finished onboarding |
| `CHECKINS=none` | No check-ins yet, so the check-in form shows |
| `SELFCHECK=none` | No self-check yet, so its form shows |
| `THEME=bold` | The look saved on Sam's account |
| `MOCK_PORT` | Port (default 54321) |

When the app starts reading a new table, add rows for it in `mock-supabase.js`. A missing table answers as "does not exist", the same as a missing migration would.

Pages come from `lib.js`. Mission steps are read from `src/lib/missions.ts`, so new steps are covered automatically. New pages need adding to `signedInRoutes()` or `PUBLIC_ROUTES`.
