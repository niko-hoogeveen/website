"use client";

import { useMemo } from "react";
import type { PriceDataPoint, TimeRange } from "@/types/dashboard";
import { filterByTimeRange } from "@/lib/dashboard/chartUtils";

interface LatestPriceProps {
  priceData: PriceDataPoint[];
  timeRange: TimeRange;
}

/**
 * Latest price component
 * Displays the most recent price from the filtered price data
 */
export default function LatestPrice({
  priceData,
  timeRange,
}: LatestPriceProps) {
  // Calculate current price from filtered data (most recent close price)
  const currentPrice = useMemo(() => {
    const filteredData = filterByTimeRange(priceData, timeRange);
    if (filteredData.length === 0) return null;

    // Sort by date to get the most recent
    const sorted = [...filteredData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted[0]?.close ?? null;
  }, [priceData, timeRange]);

  if (currentPrice === null) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-2 py-1">
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 mb-0.5">Latest Price</span>
          <span className="text-lg font-bold text-white">
            ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
