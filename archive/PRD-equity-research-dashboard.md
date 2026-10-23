# Project Requirements Document: Equity Research Dashboard

## Problem Statement

Portfolio websites for financial analysts typically showcase static resumes and project descriptions. However, demonstrating **real analytical capabilities**—financial reasoning, data visualization, and research synthesis—requires a more sophisticated artifact.

This project addresses the need for a **professional-grade equity research dashboard** that:
- Demonstrates financial analysis skills in a portfolio context
- Showcases clean UI/UX and engineering judgment
- Operates entirely as a static site (no backend dependencies)
- Serves as a conversation piece for analyst role interviews

## Goals

### Primary Goals
1. **Portfolio Differentiation**: Create a standout portfolio artifact that demonstrates both technical and financial acumen
2. **Real-World Workflow Demonstration**: Showcase how an analyst would structure and present equity research
3. **Technical Excellence**: Demonstrate clean code, maintainable architecture, and thoughtful engineering decisions
4. **Static-First Architecture**: Prove that sophisticated financial dashboards can be built without backend infrastructure

### Secondary Goals
1. **Bloomberg-lite Aesthetic**: Create a professional, data-dense interface reminiscent of institutional research platforms
2. **Educational Value**: Serve as a reference implementation for static financial dashboards
3. **Maintainability**: Design for easy updates when new data becomes available

## Non-Goals

1. **Real-Time Data**: No live API integrations or real-time price feeds
2. **Backend Services**: No server-side logic, databases, or API endpoints
3. **User Authentication**: No user accounts or personalized dashboards
4. **Trading Functionality**: No order placement, portfolio management, or transaction capabilities
5. **Comprehensive Coverage**: Focus on 3 stocks (NVDA, META, GOOG) rather than broad market coverage
6. **Mobile Optimization**: Desktop-first design (mobile responsiveness is nice-to-have but not critical)

## Functional Requirements

### FR1: Routing & Navigation
- **FR1.1**: Dashboard overview page at `/dashboard`
- **FR1.2**: Individual ticker detail pages at `/dashboard/[ticker]` for NVDA, META, GOOG
- **FR1.3**: Each ticker page displays company name, ticker symbol, and last updated timestamp
- **FR1.4**: Each ticker page includes a link to a corresponding PDF equity research report

### FR2: Interactive Stock Price Chart
- **FR2.1**: Display historical price data with interactive hover tooltips
- **FR2.2**: Support time range selection: 1Y, 3Y, 5Y, MAX
- **FR2.3**: Display earnings date markers on the price chart
- **FR2.4**: Support smooth zoom and pan interactions
- **FR2.5**: Use TradingView lightweight-charts library for visualization

### FR3: Earnings Surprise Dashboard
- **FR3.1**: Display earnings data for the last 4–8 quarters
- **FR3.2**: Show EPS actual vs estimate with % surprise calculation
- **FR3.3**: Show revenue actual vs estimate with % surprise calculation
- **FR3.4**: Display post-earnings stock price reaction (e.g., next-day price change)
- **FR3.5**: Present data in tabular format (analyst-style)
- **FR3.6**: Include at least one visual chart (bar or line) for earnings trends

### FR4: Revenue & Profit Trends
- **FR4.1**: Display quarterly or annual revenue chart
- **FR4.2**: Display net income chart
- **FR4.3**: Display operating margin or gross margin chart
- **FR4.4**: Charts must be clean, readable, and prioritize insight over decoration

### FR5: Valuation Snapshot
- **FR5.1**: Display valuation metrics as metric cards:
  - P/E (Price-to-Earnings)
  - Forward P/E
  - EV/EBITDA (Enterprise Value to EBITDA)
  - Price / Free Cash Flow
  - PEG (Price/Earnings to Growth) if applicable
- **FR5.2**: Metrics may be manually maintained and periodically updated

### FR6: Optional Mini-DCF (Stretch Goal)
- **FR6.1**: If implemented, provide simple sliders for DCF assumptions
- **FR6.2**: Display calculated intrinsic value
- **FR6.3**: Show % upside/downside vs current price

## Technical Constraints

### TC1: Static Hosting Only
- **TC1.1**: No server-side APIs or backend services
- **TC1.2**: No secret API keys or environment variables
- **TC1.3**: All data must be loaded from static JSON files in `/public/data/`

### TC2: Next.js App Router
- **TC2.1**: Use `/app` directory structure exclusively
- **TC2.2**: No Pages Router patterns or legacy routing
- **TC2.3**: Leverage React Server Components where appropriate (though limited due to static export)

### TC3: GitHub Pages Compatibility
- **TC3.1**: Must respect `basePath` and `assetPrefix` for GitHub Pages deployment
- **TC3.2**: No dynamic server features (no API routes, no server-side rendering)
- **TC3.3**: Must work via `next export` (static export mode)

### TC4: Portfolio-First Philosophy
- **TC4.1**: Clarity over cleverness
- **TC4.2**: Reliability over automation
- **TC4.3**: Explainability over abstraction

## Data Architecture

### Data Storage
- All data stored in static JSON files:
  - `/public/data/NVDA.json`
  - `/public/data/META.json`
  - `/public/data/GOOG.json`

### Data Schema (Per Ticker)
Each JSON file should include:
```typescript
{
  metadata: {
    ticker: string;
    companyName: string;
    lastUpdated: string; // ISO 8601 date
    researchReportUrl?: string; // Path to PDF
  };
  priceHistory: {
    date: string; // ISO 8601
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  earnings: {
    quarter: string; // "2024-Q1"
    earningsDate: string; // ISO 8601
    epsActual: number;
    epsEstimate: number;
    epsSurprise: number; // percentage
    revenueActual: number;
    revenueEstimate: number;
    revenueSurprise: number; // percentage
    priceReaction: number; // percentage change next day
  }[];
  fundamentals: {
    revenue: {
      period: string; // "2024-Q1" or "2023"
      value: number;
      type: "quarterly" | "annual";
    }[];
    netIncome: {
      period: string;
      value: number;
      type: "quarterly" | "annual";
    }[];
    operatingMargin: {
      period: string;
      value: number; // percentage
      type: "quarterly" | "annual";
    }[];
  };
  valuation: {
    pe: number;
    forwardPe: number;
    evEbitda: number;
    priceToFcf: number;
    peg?: number;
    asOfDate: string; // ISO 8601
  };
  dcfDefaults?: {
    // Optional DCF assumptions
    terminalGrowthRate: number;
    discountRate: number;
    // ... other assumptions
  };
}
```

## Success Criteria

### Must-Have (MVP)
1. ✅ All routing works correctly (`/dashboard` and `/dashboard/[ticker]`)
2. ✅ Price charts display with at least 2 time ranges (1Y, 3Y)
3. ✅ Earnings surprise table displays for at least 4 quarters
4. ✅ At least one revenue/profit trend chart displays
5. ✅ Valuation metrics display correctly
6. ✅ All data loads from static JSON files
7. ✅ Site builds and deploys to GitHub Pages successfully

### Should-Have (Post-MVP)
1. ✅ All 4 time ranges work (1Y, 3Y, 5Y, MAX)
2. ✅ Earnings date markers appear on price chart
3. ✅ Earnings surprise visualization (chart) implemented
4. ✅ Multiple fundamental charts (revenue, net income, margin)
5. ✅ Smooth chart interactions (zoom, pan, hover)

### Nice-to-Have (Stretch)
1. ⚪ Mini-DCF calculator implemented
2. ⚪ Mobile-responsive design
3. ⚪ Loading states and error handling
4. ⚪ Print-friendly styles for research reports

## Out-of-Scope Items

1. **Real-time data updates**: Data will be manually updated periodically
2. **Multi-user features**: Single-user portfolio artifact
3. **Data validation**: Assumes JSON data is correct and complete
4. **Historical data backfill**: Focus on recent data (last 5 years max)
5. **Comparative analysis**: No cross-ticker comparisons in MVP
6. **Export functionality**: No CSV/PDF export of dashboard data
7. **Search/filter**: No search or filtering capabilities
8. **Notifications**: No alerts or notifications

## Technical Decisions & Tradeoffs

### Charting Library: TradingView Lightweight Charts
**Decision**: Use TradingView lightweight-charts
**Rationale**: 
- Industry-standard for financial visualization
- Lightweight and performant
- Excellent documentation
- Free for non-commercial use
- No external dependencies on TradingView servers

**Tradeoff**: Requires learning curve, but worth it for professional appearance

### Data Format: Static JSON
**Decision**: Store all data in static JSON files
**Rationale**:
- No backend required
- Easy to update manually
- Fast loading (no API calls)
- Version-controllable

**Tradeoff**: Manual updates required, but acceptable for portfolio artifact

### Static Export: Next.js `output: 'export'`
**Decision**: Use Next.js static export
**Rationale**:
- Required for GitHub Pages
- Simple deployment
- No server costs
- Fast page loads

**Tradeoff**: Limited to client-side features, but sufficient for this use case

## Future Considerations

If this project evolves beyond a portfolio artifact:
1. **Data Pipeline**: Automated data collection from financial APIs
2. **Backend API**: Server-side data aggregation and caching
3. **User Accounts**: Personalized watchlists and saved analyses
4. **More Tickers**: Expand beyond 3 stocks
5. **Comparative Analysis**: Side-by-side ticker comparisons
6. **Export Features**: PDF report generation, CSV data export

## Dependencies & Libraries

### Core
- Next.js 15.1.7 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3.4.1

### Financial Visualization
- TradingView lightweight-charts (to be added)

### Utilities
- date-fns or similar for date formatting (to be added)

## Timeline & Phases

See `IMPLEMENTATION_PLAN.md` for detailed phases and milestones.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Author**: Project Team  
**Status**: Draft → Ready for Implementation

