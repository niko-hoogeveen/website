"use client";

import { format } from "date-fns";
import type { ValuationMetrics } from "@/types/dashboard";

interface ValuationCardsProps {
  valuation: ValuationMetrics;
}

/**
 * Valuation cards component
 * Displays valuation metrics as a grid of cards with proper formatting
 */
export default function ValuationCards({ valuation }: ValuationCardsProps) {
  const asOfDate = new Date(valuation.asOfDate);
  const formattedDate = format(asOfDate, "MMM d, yyyy");

  const metrics = [
    {
      label: "P/E",
      value: valuation.pe,
      format: (v: number) => v.toFixed(1),
      description: "Price-to-Earnings",
    },
    {
      label: "Forward P/E",
      value: valuation.forwardPe,
      format: (v: number) => v.toFixed(1),
      description: "Forward Price-to-Earnings",
    },
    {
      label: "EV/EBITDA",
      value: valuation.evEbitda,
      format: (v: number) => v.toFixed(1),
      description: "Enterprise Value to EBITDA",
    },
    {
      label: "Price/FCF",
      value: valuation.priceToFcf,
      format: (v: number) => v.toFixed(1),
      description: "Price to Free Cash Flow",
    },
    {
      label: "PEG",
      value: valuation.peg,
      format: (v: number) => v.toFixed(2),
      description: "Price/Earnings to Growth",
      optional: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Valuation Metrics</h3>
        <p className="text-sm text-gray-500">As of {formattedDate}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          // Skip optional metrics if not available
          if (metric.optional && metric.value === undefined) {
            return null;
          }

          return (
            <div
              key={metric.label}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors duration-200"
              title={metric.description}
            >
              <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
              <p className="text-xl font-bold">
                {metric.value !== undefined
                  ? metric.format(metric.value)
                  : "N/A"}
              </p>
              {metric.description && (
                <p className="text-xs text-gray-600 mt-1 hidden md:block">
                  {metric.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

