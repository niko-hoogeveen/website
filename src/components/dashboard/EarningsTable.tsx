"use client";

import type { EarningsData } from "@/types/dashboard";
import { formatMillions, formatPercentage, formatNumber, getValueColorClass } from "@/lib/dashboard/formatters";

interface EarningsTableProps {
  earnings: EarningsData[];
}

/**
 * Earnings table component
 * Displays earnings history with actual vs estimate, surprise %, and price reaction
 */
export default function EarningsTable({ earnings }: EarningsTableProps) {
  // Sort by quarter (most recent first)
  const sortedEarnings = [...earnings].sort((a, b) => {
    // Compare quarters (e.g., "2024-Q4" vs "2024-Q3")
    return b.quarter.localeCompare(a.quarter);
  });

  if (sortedEarnings.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">No earnings data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Quarter</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">EPS Act</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">EPS Est</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">EPS Surp</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">Rev Act</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">Rev Est</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">Rev Surp</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400">Price Rxn</th>
          </tr>
        </thead>
        <tbody>
          {sortedEarnings.map((earning, index) => (
            <tr
              key={earning.quarter}
              className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${
                index % 2 === 0 ? "bg-gray-900/30" : ""
              }`}
            >
              <td className="py-2 px-2 text-xs font-medium">{earning.quarter}</td>
              <td className="py-2 px-2 text-xs text-right">{formatNumber(earning.epsActual, 2)}</td>
              <td className="py-2 px-2 text-xs text-right text-gray-500">
                {formatNumber(earning.epsEstimate, 2)}
              </td>
              <td className={`py-2 px-2 text-xs text-right font-medium ${getValueColorClass(earning.epsSurprise)}`}>
                {formatPercentage(earning.epsSurprise)}
              </td>
              <td className="py-2 px-2 text-xs text-right">{formatMillions(earning.revenueActual)}</td>
              <td className="py-2 px-2 text-xs text-right text-gray-500">
                {formatMillions(earning.revenueEstimate)}
              </td>
              <td className={`py-2 px-2 text-xs text-right font-medium ${getValueColorClass(earning.revenueSurprise)}`}>
                {formatPercentage(earning.revenueSurprise)}
              </td>
              <td className={`py-2 px-2 text-xs text-right font-medium ${getValueColorClass(earning.priceReaction)}`}>
                {formatPercentage(earning.priceReaction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

