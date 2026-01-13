import { format, parseISO } from "date-fns";
import type { TickerMetadata } from "@/types/dashboard";

interface TickerHeaderProps {
  metadata: TickerMetadata;
}

/**
 * Header component for ticker detail pages
 * Displays company name, ticker symbol, and last updated timestamp
 */
export default function TickerHeader({ metadata }: TickerHeaderProps) {
  // Use parseISO to correctly parse date strings without timezone shift
  const lastUpdatedDate = parseISO(metadata.lastUpdated);
  const formattedDate = format(lastUpdatedDate, "MMMM d, yyyy");

  return (
    <div className="mb-2">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {metadata.companyName}
      </h1>
      <p className="text-xl text-gray-400">
        {metadata.ticker} • Last updated: {formattedDate}
      </p>
    </div>
  );
}

