# Copilot Instructions for `niko-hoogeveen/website` — Fantasy Football Companion

> Note: this repo also still contains an existing equity research dashboard
> (`/dashboard`) feature and its data pipeline. These instructions focus on
> the newer **fantasy football companion** (`/fantasy`) project. Dashboard-
> specific guidance was archived to
> `archive/copilot-instructions-equity-research-dashboard.md` — consult it if
> working on `/dashboard` code.

## Build, lint, and test commands

- `npm run dev` - start the Next.js app locally with Turbopack.
- `npm run build` - create the static production export in `out/`.
- `npm run lint` - run the repo's ESLint configuration via Next.js.
- `node scripts/update_fantasy_data.mjs` - refresh `public/data/fantasy/*.json`
  from the Yahoo Fantasy Sports API and generate the weekly newsletter via
  OpenAI. Requires `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`,
  `YAHOO_REFRESH_TOKEN`, and `OPENAI_API_KEY`.

## Tests

This repository does **not** currently define an automated test runner or
`npm test` script, so there is no single-test command to use. Validation is
centered on:

- `npm run lint`
- `npm run build`

## High-level architecture

This is a **Next.js App Router** site deployed as a **static export** to
GitHub Pages (`next.config.ts` sets `output: 'export'`). The fantasy
football companion lives at `/fantasy` and follows the same static-export
constraints as the rest of the site:

- no server-side APIs or live backend
- all fantasy data loaded client-side from static JSON in `public/data/fantasy/`
- Yahoo Fantasy Sports API data is **never fetched live from the browser** —
  it's pulled ahead of time by a scheduled script and committed as JSON

### Data flow

```
Yahoo Fantasy Sports API (OAuth2)
        │
        ▼  scripts/update_fantasy_data.mjs (GitHub Actions, weekly cron)
        │  - refresh access token from stored refresh token
        │  - pull last week's scoreboard/standings + next week's schedule
        │  - update public/data/fantasy/weekly/*.json and stats-alltime.json
        │  - call OpenAI (server-side) to draft the weekly newsletter
        ▼
public/data/fantasy/**.json (committed to repo)
        │
        ▼
src/app/fantasy/**  (static Next.js pages, client-side password gate)
```

### Key files
- `src/types/fantasy.ts` — shared TypeScript schema for league/team/weekly/
  newsletter/all-time-stats data
- `src/lib/fantasy/dataLoader.ts` — fetches JSON from `/public/data/fantasy/`
- `src/lib/fantasy/formatters.ts` — number/date formatting helpers
- `src/lib/fantasy/auth.ts` — client-side password gate logic (hash check +
  localStorage/cookie unlock flag)
- `src/components/fantasy/` — `PasswordGate`, stat cards, newsletter list/
  article, `SnakeGame`, `DraftLotteryLeaderboard`
- `scripts/update_fantasy_data.mjs` — the scheduled data-refresh + newsletter
  generation script
- `.github/workflows/update-fantasy-data.yml` — weekly cron running the
  script above; feeds into `.github/workflows/deploy.yml`

## Key conventions specific to this project

### Route structure: server wrapper + client component

Same pattern as the rest of the site — route files stay focused on
metadata/SEO, a sibling `*Client.tsx` renders the interactive body:

- `src/app/fantasy/page.tsx` → `FantasyClient.tsx`
- `src/app/fantasy/newsletter/page.tsx` → `NewsletterClient.tsx`
- `src/app/fantasy/draft-lottery/page.tsx` → `DraftLotteryClient.tsx`

### `/fantasy` routes are private and non-indexed

- All `/fantasy/**` pages set `robots: { index: false, follow: false }` in
  their metadata and are excluded from `src/app/sitemap.ts`
- Content is gated behind `PasswordGate` — a **client-side only** check.
  This is intentionally not real security (no backend exists to validate a
  secret), just a casual deterrent. Do not attempt to "harden" this without
  first discussing introducing a backend, since that would break the
  static-export constraint.

### Yahoo OAuth handling

- Yahoo Client ID/Secret/refresh token live **only** as GitHub Actions
  repository secrets — never commit them, never expose them client-side
- The update script refreshes a short-lived access token from the stored
  refresh token on every run (`grant_type=refresh_token` against
  `https://api.login.yahoo.com/oauth2/get_token`)
- Yahoo assigns a **new `league_key` every season** for the same league —
  the script maintains a `season -> league_key` mapping with a fallback
  lookup via the `games;game_keys=nfl/leagues` endpoint. When adding a new
  season, update this mapping.
- If the script starts failing with 401s, the stored refresh token has
  likely expired/been revoked and the one-time manual OAuth flow must be
  redone (see `PRD.md` Setup Runbook) to get a new refresh token secret.

### Preserve manually curated stats

`public/data/fantasy/stats-alltime.json` mixes script-updated fields
(all-time points, W/L record, single-week high/low) with a manually curated
field (`championships`) that predates automated tracking. The update script
must **never overwrite** `championships` — same "preserve curated data"
convention used by the dashboard's `update_dashboard_data.mjs` for
earnings/fundamentals.

### Newsletter generation is server-side only

OpenAI is called from `scripts/update_fantasy_data.mjs` (a Node script run
by GitHub Actions), never from client components. This mirrors how the
existing `Chatbot.tsx` avoids embedding an API key client-side by proxying
through an external server — the principle here is the same: keep API keys
out of anything shipped to the browser.

### Draft lottery is single-device by design

`SnakeGame` / `DraftLotteryLeaderboard` persist scores in `localStorage`
only. This is intentional — the game is meant to be played sequentially on
one shared device (e.g., at a draft night), not independently across each
owner's own device. Don't add cross-device sync without discussing a
backend first.

### Use the shared path alias

Imports consistently use the TypeScript alias from `tsconfig.json`:

- `@/*` -> `src/*`

Prefer `@/components/...`, `@/lib/...`, and `@/types/...` over deep relative
imports.

### Reuse the site-wide visual patterns

Common page composition patterns are deliberate and reused across routes:

- `PageParticles` background with a **unique `id` per page instance**
- `Breadcrumbs` on secondary pages
- Tailwind-heavy component styling with dark gradients, gray borders, and
  animation utility classes

Match these existing patterns rather than introducing a separate visual
system for the fantasy section.
