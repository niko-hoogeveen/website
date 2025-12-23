/**
 * TypeScript interfaces for the Equity Research Dashboard data schema
 * 
 * All data is loaded from static JSON files in /public/data/
 * Each ticker has its own JSON file following this schema.
 */

export interface PriceDataPoint {
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EarningsData {
  quarter: string; // Format: "2024-Q1"
  earningsDate: string; // ISO 8601 date string
  epsActual: number;
  epsEstimate: number;
  epsSurprise: number; // Percentage (e.g., 5.2 means 5.2% surprise)
  revenueActual: number; // In millions
  revenueEstimate: number; // In millions
  revenueSurprise: number; // Percentage
  priceReaction: number; // Percentage change next day after earnings
}

export interface FundamentalDataPoint {
  period: string; // Format: "2024-Q1" for quarterly, "2023" for annual
  value: number;
  type: "quarterly" | "annual";
}

export interface ValuationMetrics {
  pe: number; // Price-to-Earnings ratio
  forwardPe: number; // Forward P/E
  evEbitda: number; // Enterprise Value to EBITDA
  priceToFcf: number; // Price to Free Cash Flow
  peg?: number; // Price/Earnings to Growth (optional)
  asOfDate: string; // ISO 8601 date string
}

export interface DCFDefaults {
  terminalGrowthRate: number; // Percentage (e.g., 2.5 for 2.5%)
  discountRate: number; // WACC as percentage
  freeCashFlowGrowthRate?: number; // Optional: growth rate for FCF projections
}

export interface TickerMetadata {
  ticker: string; // Stock ticker symbol (e.g., "NVDA")
  companyName: string; // Full company name
  lastUpdated: string; // ISO 8601 date string
  researchReportUrl?: string; // Path to PDF research report (optional)
}

export interface TickerData {
  metadata: TickerMetadata;
  priceHistory: PriceDataPoint[];
  earnings: EarningsData[];
  fundamentals: {
    revenue: FundamentalDataPoint[];
    netIncome: FundamentalDataPoint[];
    operatingMargin: FundamentalDataPoint[]; // Percentage values
  };
  valuation: ValuationMetrics;
  dcfDefaults?: DCFDefaults; // Optional DCF assumptions
}

/**
 * Supported ticker symbols
 */
export type TickerSymbol = "NVDA" | "META" | "GOOG";

/**
 * Time range options for price charts
 */
export type TimeRange = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "MAX";

