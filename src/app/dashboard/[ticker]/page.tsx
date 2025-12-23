import { getAvailableTickers } from "@/lib/dashboard/dataLoader";
import TickerDetailClient from "./TickerDetailClient";

/**
 * Generate static params for all available tickers
 * Required for static export with dynamic routes
 */
export function generateStaticParams() {
  return getAvailableTickers().map((ticker) => ({
    ticker,
  }));
}

/**
 * Ticker detail page (server component wrapper)
 * Renders the client component for data loading and interactivity
 */
export default function TickerDetailPage() {
  return <TickerDetailClient />;
}
