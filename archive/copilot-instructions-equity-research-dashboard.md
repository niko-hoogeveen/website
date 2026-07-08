# Copilot Instructions for `niko-hoogeveen/website`

## Build, lint, and test commands

- `npm run dev` - start the Next.js app locally with Turbopack.
- `npm run build` - create the static production export in `out/`.
- `npm run lint` - run the repo's ESLint configuration via Next.js.
- `node scripts/update_dashboard_data.mjs` - refresh `public/data/*.json` from Financial Modeling Prep. Requires `FMP_API_KEY`.

## Tests

This repository does **not** currently define an automated test runner or `npm test` script, so there is no single-test command to use. Validation is currently centered on:

- `npm run lint`
- `npm run build`

## High-level architecture

This is a **Next.js App Router** site that is deployed as a **static export** to GitHub Pages. The static-export constraint is important:

- `next.config.ts` sets `output: 'export'`
- dynamic dashboard pages rely on `generateStaticParams()`
- dashboard data is loaded client-side from files under `public/data/`, not from server routes or runtime APIs

The app has two main surfaces:

1. **Portfolio pages** (`/`, `/about`, `/contact`)
   - Route files in `src/app/**/page.tsx` define metadata and structured data.
   - The actual interactive UI is usually rendered by a sibling `*Client.tsx` component.
   - Shared presentation lives in `src/components/`.

2. **Equity research dashboard** (`/dashboard`, `/dashboard/[ticker]`)
   - `src/lib/dashboard/dataLoader.ts` is the entry point for loading ticker JSON from `/public/data/{ticker}.json`.
   - `src/types/dashboard.ts` defines the JSON schema shared across dashboard components.
   - `src/lib/dashboard/chartUtils.ts` and `src/lib/dashboard/formatters.ts` hold reusable transformation/formatting logic for charting and metric display.
   - `src/components/dashboard/` contains the dashboard-specific UI (price chart, earnings views, valuation cards, headers, selectors).

There is also an offline data pipeline for the dashboard:

- `scripts/update_dashboard_data.mjs` refreshes **price history**, **valuation metrics**, and `metadata.lastUpdated`
- the script intentionally preserves manually curated **earnings**, **fundamentals**, **DCF defaults**, and **research report URLs**
- `.github/workflows/update-dashboard.yml` runs that updater on a schedule and commits changed JSON
- `.github/workflows/deploy.yml` builds the static site and deploys the generated `out/` directory to GitHub Pages

## Key conventions specific to this repo

### Route structure: server wrapper + client component

For pages with interactivity or browser-only libraries, keep the route file focused on metadata/SEO and render a separate client component for the actual page body. Existing examples:

- `src/app/page.tsx` -> `src/app/HomeClient.tsx`
- `src/app/about/page.tsx` -> `src/app/about/AboutClient.tsx`
- `src/app/contact/page.tsx` -> `src/app/contact/ContactClient.tsx`
- `src/app/dashboard/[ticker]/page.tsx` -> `TickerDetailClient.tsx`

Follow that pattern instead of moving metadata logic into client components.

### Static-export-safe dashboard changes

Because the site is exported statically:

- do not introduce server-only dashboard data fetching paths for ticker pages
- keep ticker data in `public/data/`
- when adding a ticker, update all of the following together:
  - `scripts/update_dashboard_data.mjs` (`TICKERS`)
  - `src/lib/dashboard/dataLoader.ts` (`getAvailableTickers`, validation)
  - `src/types/dashboard.ts` (`TickerSymbol`)
  - `src/app/dashboard/[ticker]/page.tsx` (`tickerInfo`, static params)
  - the corresponding `public/data/<TICKER>.json`
  - optional PDF under `public/data/reports/`

### SEO metadata is first-class

Pages in this repo consistently define:

- `export const metadata`
- canonical URLs
- Open Graph/Twitter metadata
- JSON-LD `<script type="application/ld+json">` blocks where relevant

If you add or materially change a route, update both the UI and the SEO metadata/structured data.

### Use the shared path alias

Imports consistently use the TypeScript alias from `tsconfig.json`:

- `@/*` -> `src/*`

Prefer `@/components/...`, `@/lib/...`, and `@/types/...` over deep relative imports.

### Reuse the site-wide visual patterns

Common page composition patterns are deliberate and reused across routes:

- `PageParticles` background with a **unique `id` per page instance**
- `Breadcrumbs` on secondary pages
- Tailwind-heavy component styling with dark gradients, gray borders, and animation utility classes

When building new pages or sections, match those existing patterns rather than introducing a separate visual system.

### Preserve existing dashboard data semantics

The dashboard JSON files contain a few repo-specific conventions that other code depends on:

- `metadata.researchReportUrl` may be the literal string `"undefined"` when no report exists
- price history is expected as oldest-to-newest daily OHLCV data
- manually curated fundamentals/earnings should not be overwritten by automatic update flows
