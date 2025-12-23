import { format } from "date-fns";
import type { TickerMetadata } from "@/types/dashboard";

interface TickerHeaderProps {
  metadata: TickerMetadata;
}

/**
 * Header component for ticker detail pages
 * Displays company name, ticker symbol, and last updated timestamp
 */
export default function TickerHeader({ metadata }: TickerHeaderProps) {
  const lastUpdatedDate = new Date(metadata.lastUpdated);
  const formattedDate = format(lastUpdatedDate, "MMMM d, yyyy");

  return (
    <header className="mb-8 pb-6 border-b border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{metadata.companyName}</h1>
          <p className="text-2xl text-gray-400 mb-4">{metadata.ticker}</p>
          <p className="text-sm text-gray-500">
            Last updated: {formattedDate}
          </p>
        </div>
      </div>
    </header>
  );
}

