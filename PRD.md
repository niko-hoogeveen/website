# Project Requirements Document: Fantasy Football Companion

## Problem Statement

Our Yahoo Fantasy Football league (league ID `51047`) has no shared home for
its history, weekly storylines, or draft-order theatrics — everything lives
scattered across Yahoo's app and group chat. This project adds a **fantasy
football companion section** to the existing portfolio site that:

- Surfaces the league's key historical stats in one place
- Recaps the past week's performances automatically, with narrative color
- Turns the annual draft-order determination into a fun, skill-based mini-game
- Does all of this **without introducing a backend**, staying true to the
  site's static-export, GitHub Pages architecture

## Goals

### Primary Goals
1. **Single source of truth** for league stats (recent + key all-time numbers)
2. **Automated weekly newsletter** — recap, trends/strengths/weaknesses, and
   upcoming key matchups generated from real Yahoo data, with zero manual
   writing required week-to-week
3. **A memorable draft-order ritual** — a simple, gimmicky mini-game that
   decides next season's draft order based on who's best at it
4. **Static-first architecture** — all of the above without a live backend,
   consistent with the rest of the site

### Secondary Goals
1. Reuse the existing site's dark, particle-background visual language
   rather than introducing a new design system
2. Keep the feature private to the league via a simple shared-password gate
3. Keep data pipelines maintainable using the same patterns already
   established by `scripts/update_dashboard_data.mjs`

## Non-Goals

1. **Prize money tracking** — explicitly out of scope for now
2. **Live, in-season score ticking** — data updates on a weekly batch cadence
   only, not real-time
3. **Real user accounts/authentication** — a single shared client-side
   password gate stands in for per-user login
4. **Multi-league support** — this covers exactly one Yahoo league
5. **Deep historical trend charts** — beyond the 5 named all-time stats below,
   richer historical analysis (e.g., multi-year charts, head-to-head
   matrices) is deferred to a future iteration
6. **Cross-device draft lottery persistence** — the lottery game's leaderboard
   lives in `localStorage` on whatever device it's played on; it is not
   synced across devices or users
7. **Mobile-specific optimization** — desktop-first, consistent with the rest
   of the site

## Functional Requirements

### FR1: Routing & Access
- **FR1.1**: New route at `/fantasy` (overview), `/fantasy/newsletter`
  (weekly recaps), `/fantasy/draft-lottery` (mini-game + results)
- **FR1.2**: All `/fantasy/**` routes are gated behind a client-side shared
  password prompt before content renders
- **FR1.3**: All `/fantasy/**` routes are excluded from search indexing
  (`robots: { index: false, follow: false }`) and from `sitemap.ts`
- **FR1.4**: Visual design reuses existing site patterns: `PageParticles`
  (unique `id` per page), `Breadcrumbs`, dark gradient card styling

### FR2: Historical & Weekly Statistics
- **FR2.1**: Display **last week's** matchup results (scores, win/loss) for
  every team in the league
- **FR2.2**: Display 5 all-time cumulative stats per team:
  1. All-time total points scored
  2. All-time win/loss record
  3. Highest single-week score ever recorded
  4. Lowest single-week score ever recorded
  5. Number of championships won
- **FR2.3**: All-time stats cover the tracked historical window (2 seasons at
  launch), with championship counts manually seeded for anything predating
  automated tracking
- **FR2.4**: Deeper historical breakdowns (multi-year charts, per-season
  drill-down) are explicitly deferred (see Non-Goals)

### FR3: Weekly Newsletter (OpenAI-Generated)
- **FR3.1**: After each week's Yahoo data refresh, an automated script
  generates a newsletter entry covering:
  - Performance recap (who won, who lost, standout performances)
  - Trends & strengths/weaknesses per team
  - Upcoming key matchups for the next week
- **FR3.2**: Generation happens **server-side only**, inside the scheduled
  Node script, using the `openai` package with a repo-secret API key — never
  exposed to client code
- **FR3.3**: Generated newsletters are committed as static JSON content and
  rendered on `/fantasy/newsletter`
- **FR3.4**: Newsletter list shows past weeks; each entry links to a detail
  view with the full recap text

### FR4: Draft Lottery Mini-Game
- **FR4.1**: A simple Snake-style game, playable via keyboard controls
- **FR4.2**: Before playing, the player selects their team/owner name from a
  dropdown sourced from the league's team list
- **FR4.3**: Each team may play **exactly once** per lottery cycle; once
  played, that team is disabled in the dropdown until a lottery reset
- **FR4.4**: Scores are tracked in a `localStorage`-backed leaderboard,
  visible on the page as teams play
- **FR4.5**: Final draft order is determined by ranking teams by score,
  **highest score picks first**
- **FR4.6**: A password-gated "Reset Lottery" control clears the leaderboard
  to start a new cycle (e.g., for the next season)
- **FR4.7**: This feature is intentionally designed for **sequential play on
  one shared device/browser** (e.g., at a draft night) rather than
  independent play across each owner's own device

### FR5: Yahoo Fantasy Sports API Integration
- **FR5.1**: A scheduled script (`scripts/update_fantasy_data.mjs`) refreshes
  an OAuth 2.0 access token from a stored refresh token, then pulls:
  - League standings / scoreboard for the most recently completed week
  - Next week's schedule (for newsletter matchup previews)
- **FR5.2**: Data is transformed and written to static JSON files under
  `public/data/fantasy/`, then committed and pushed by the workflow
- **FR5.3**: The script maintains a `season -> league_key` mapping, since
  Yahoo assigns a new `league_key` each season for the same league; a
  fallback lookup via the user's `games;game_keys=nfl/leagues` endpoint is
  used if a season is missing from the mapping
- **FR5.4**: Manually curated fields (e.g., championship counts predating
  automated tracking) are never overwritten by the script, following the
  same preservation pattern used by `scripts/update_dashboard_data.mjs` for
  earnings/fundamentals data

## Technical Constraints

### TC1: Static Hosting Only
- **TC1.1**: No server-side APIs, databases, or live backend services
- **TC1.2**: No API keys or secrets embedded in client-shipped code
- **TC1.3**: All fantasy data loaded from static JSON in `/public/data/fantasy/`

### TC2: Next.js App Router (existing convention)
- **TC2.1**: Route files (`page.tsx`) stay focused on metadata/SEO; a sibling
  `*Client.tsx` component renders the interactive body
- **TC2.2**: Use the existing `@/*` → `src/*` path alias

### TC3: GitHub Pages / Static Export Compatibility
- **TC3.1**: Must build cleanly via `output: 'export'` (no dynamic server
  features, no API routes)
- **TC3.2**: New GitHub Actions workflow for fantasy data updates must feed
  into the existing `deploy.yml` pipeline

### TC4: Yahoo OAuth Handling
- **TC4.1**: Yahoo Client ID/Secret and refresh token stored only as GitHub
  Actions repository secrets, never committed to source
- **TC4.2**: Access tokens are short-lived and refreshed on every scheduled
  run; the refresh token itself is long-lived but **not guaranteed
  indefinite** — see Risks & Assumptions
- **TC4.3**: One-time manual OAuth authorization is required to obtain the
  initial refresh token (see Setup Runbook)

### TC5: Security Posture of the Password Gate
- **TC5.1**: The `/fantasy` password gate is a client-side check only
  (hash comparison unlocking a `localStorage`/cookie flag)
- **TC5.2**: This is an **explicit, accepted tradeoff**: it deters casual
  access but is not cryptographically secure, since static hosting has no
  server to validate secrets. Acceptable because this protects informal
  league content among friends/family, not sensitive data

## Data Architecture

### Data Storage (`public/data/fantasy/`)
- `league.json` — league metadata: name, season, team list (manager names,
  Yahoo `team_key` mapping, avatar URLs)
- `weekly/{season}-week{N}.json` — that week's matchup results
- `stats-alltime.json` — the 5 cumulative all-time stats per team
- `newsletters/{season}-week{N}.json` — OpenAI-generated recap content

### Data Schema (illustrative)
```typescript
// league.json
interface LeagueConfig {
  leagueKey: string; // current season's Yahoo league_key
  leagueName: string;
  season: string; // e.g. "2025"
  teams: {
    teamKey: string; // Yahoo team_key
    teamName: string;
    managerName: string;
    avatarUrl?: string;
  }[];
}

// weekly/{season}-week{N}.json
interface WeeklyMatchup {
  season: string;
  week: number;
  matchups: {
    teamKey: string;
    opponentTeamKey: string;
    score: number;
    opponentScore: number;
    result: "W" | "L" | "T";
  }[];
}

// stats-alltime.json
interface AllTimeStats {
  [teamKey: string]: {
    teamName: string;
    allTimePoints: number;
    wins: number;
    losses: number;
    highestSingleWeekScore: number;
    lowestSingleWeekScore: number;
    championships: number; // manually seeded/preserved, never auto-overwritten
  };
}

// newsletters/{season}-week{N}.json
interface NewsletterEntry {
  season: string;
  week: number;
  generatedAt: string; // ISO 8601
  recap: string;
  trends: string;
  upcomingMatchups: string;
}
```

## Setup Runbook (One-Time, Manual)

1. Register a Yahoo Developer App at Yahoo's developer portal for the
   Fantasy Sports API; note the Client ID and Client Secret
2. Complete the OAuth 2.0 authorization-code flow once locally (e.g., using
   the "out-of-band" redirect) to obtain an initial refresh token
3. Add the following as GitHub Actions repository secrets:
   - `YAHOO_CLIENT_ID`
   - `YAHOO_CLIENT_SECRET`
   - `YAHOO_REFRESH_TOKEN`
   - `OPENAI_API_KEY`
4. Populate the initial `season -> league_key` mapping for the current and
   prior season in the update script's config
5. Seed `public/data/fantasy/stats-alltime.json` with historical
   championship counts and any pre-automation cumulative stats

## Success Criteria

### Must-Have (MVP)
1. ✅ `/fantasy`, `/fantasy/newsletter`, `/fantasy/draft-lottery` all render
   correctly and are excluded from search indexing
2. ✅ Password gate blocks content until the correct shared password is entered
3. ✅ Last week's matchup results display for every team
4. ✅ All 5 all-time stats display per team
5. ✅ Draft lottery game is playable, enforces one play per team, and
   produces a ranked draft order
6. ✅ At least one auto-generated newsletter entry renders correctly
7. ✅ `scripts/update_fantasy_data.mjs` successfully refreshes Yahoo data and
   generates a newsletter end-to-end
8. ✅ Site builds and deploys to GitHub Pages successfully with the new routes

### Should-Have (Post-MVP)
1. ✅ Scheduled GitHub Actions workflow runs weekly without manual intervention
2. ✅ Newsletter includes all three sections (recap, trends, upcoming matchups)
3. ✅ Reset control for the draft lottery works and is password-gated

### Nice-to-Have (Stretch / Future)
1. ⚪ Prize money tracking
2. ⚪ Multi-year historical trend charts
3. ⚪ Head-to-head records between teams
4. ⚪ Mobile-optimized layouts for the game and newsletter

## Out-of-Scope Items

1. **Prize money tracking** — deferred entirely
2. **Real-time score updates** — weekly batch only
3. **Cross-device lottery play** — localStorage only, single-device design
4. **Multi-league support** — single league only
5. **Deep historical analytics** — beyond the 5 named all-time stats
6. **User accounts** — shared password only, no per-user login

## Technical Decisions & Tradeoffs

### Data Pipeline: Scheduled Script + Static JSON (not a live backend)
**Decision**: Mirror the existing `update_dashboard_data.mjs` pattern —
a GitHub Actions cron job refreshes Yahoo data and commits static JSON.
**Rationale**: Preserves the static-export, no-backend architecture; reuses
a pattern already proven in this repo.
**Tradeoff**: Data is only as fresh as the last scheduled run, not live.

### Newsletter Generation: OpenAI, Server-Side Only
**Decision**: Call OpenAI from the Node script at build/update time, not
from client code.
**Rationale**: Avoids exposing API keys client-side; consistent with how the
existing `Chatbot.tsx` avoids embedding a key by proxying through a server.
**Tradeoff**: Newsletter content can't be regenerated on-demand by site
visitors — only refreshed on the next scheduled run.

### Draft Lottery: localStorage, Not a Database
**Decision**: Store lottery scores in `localStorage` only.
**Rationale**: Keeps the feature fully static and simple; the game is
intended to be played together on one device at a draft event anyway.
**Tradeoff**: Not robust against a player replaying on a different browser
to improve their score — accepted as a low-stakes, casual-use tradeoff.

### Access Control: Client-Side Password Gate
**Decision**: A simple client-side password check unlocks `/fantasy` content.
**Rationale**: No backend is available to validate secrets server-side;
this is "good enough" for keeping casual visitors out.
**Tradeoff**: Not real security — a technical visitor could find the
password in the page source. Accepted since the content isn't sensitive.

## Risks & Assumptions

1. **Yahoo refresh token longevity**: Yahoo does not guarantee a refresh
   token remains valid indefinitely. If the scheduled script starts failing
   with 401 errors, the one-time manual OAuth setup (see Setup Runbook) must
   be repeated to obtain a new refresh token.
2. **Per-season league key changes**: Yahoo issues a new `league_key` each
   season for the same league. The update script must track this mapping
   (with a fallback API lookup) or historical continuity will break.
3. **Manually curated data preservation**: Championship counts and any
   pre-automation historical stats must be seeded once and never
   auto-overwritten by the update script — same convention as the existing
   dashboard's earnings/fundamentals data.
4. **Security tradeoffs are accepted, not oversights**: Both the password
   gate and the lottery's localStorage persistence are intentionally simple
   given the static-hosting constraint; they are not intended to be secure
   against a determined technical user.

## Future Considerations

If this feature grows beyond its current scope:
1. **Prize money tracking**: manual or automated payout tracking per season
2. **Multi-league support**: expand beyond league `51047`
3. **Deeper historical analytics**: multi-year trend charts, head-to-head
   records, playoff bracket history
4. **Stronger access control**: if real security becomes necessary, this
   would require introducing a backend (breaking the current static-only
   constraint)
5. **Cross-device lottery play**: would require a lightweight backend/database

## Dependencies & Libraries

### Core (existing)
- Next.js 15.1.7 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4.1

### Fantasy-Specific
- `openai` (already a dependency) — used server-side in the update script
- Yahoo Fantasy Sports API (OAuth 2.0) — no new npm dependency required for
  basic `fetch`-based calls

### Utilities
- `date-fns` (existing) for date formatting

## Timeline & Phases

No fixed timeline. Implementation proceeds via the tracked todo list in the
session plan, roughly in this order: archive old docs → new docs → types/lib
→ sample data → pages (overview, newsletter, draft lottery) → update script
→ per-season league key handling → GitHub Actions workflow → nav integration
→ build/lint validation.

---

**Document Version**: 1.0
**Author**: Project Team
**Status**: Draft → Ready for Implementation
