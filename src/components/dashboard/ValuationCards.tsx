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
    // Core Valuation Metrics (always shown if available)
    {
      label: "P/E",
      value: valuation.pe,
      format: (v: number) => v.toFixed(1),
      description: "Price-to-Earnings",
      category: "valuation",
    },
    {
      label: "EV/EBITDA",
      value: valuation.evEbitda,
      format: (v: number) => v.toFixed(1),
      description: "Enterprise Value to EBITDA",
      category: "valuation",
    },
    {
      label: "Price/FCF",
      value: valuation.priceToFcf,
      format: (v: number) => v.toFixed(1),
      description: "Price to Free Cash Flow",
      category: "valuation",
    },
    {
      label: "P/B",
      value: valuation.priceToBook,
      format: (v: number) => v.toFixed(2),
      description: "Price to Book",
      category: "valuation",
      optional: true,
    },
    {
      label: "P/S",
      value: valuation.priceToSales,
      format: (v: number) => v.toFixed(2),
      description: "Price to Sales",
      category: "valuation",
      optional: true,
    },
    {
      label: "EV/Sales",
      value: valuation.evToSales,
      format: (v: number) => v.toFixed(2),
      description: "Enterprise Value to Sales",
      category: "valuation",
      optional: true,
    },
    {
      label: "PEG",
      value: valuation.peg,
      format: (v: number) => v.toFixed(2),
      description: "Price/Earnings to Growth",
      category: "valuation",
      optional: true,
    },
    // Financial Health Metrics
    {
      label: "D/E",
      value: valuation.debtToEquity,
      format: (v: number) => v.toFixed(2),
      description: "Debt to Equity",
      category: "financial",
      optional: true,
    },
    {
      label: "Current Ratio",
      value: valuation.currentRatio,
      format: (v: number) => v.toFixed(2),
      description: "Current Ratio",
      category: "financial",
      optional: true,
    },
    {
      label: "Quick Ratio",
      value: valuation.quickRatio,
      format: (v: number) => v.toFixed(2),
      description: "Quick Ratio",
      category: "financial",
      optional: true,
    },
    // Profitability Metrics
    {
      label: "ROE",
      value: valuation.returnOnEquity,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
      description: "Return on Equity",
      category: "profitability",
      optional: true,
    },
    {
      label: "ROA",
      value: valuation.returnOnAssets,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
      description: "Return on Assets",
      category: "profitability",
      optional: true,
    },
    {
      label: "Op Margin",
      value: valuation.operatingMargin,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
      description: "Operating Profit Margin",
      category: "profitability",
      optional: true,
    },
    {
      label: "Net Margin",
      value: valuation.netProfitMargin,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
      description: "Net Profit Margin",
      category: "profitability",
      optional: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Valuation Metrics (TTM)</h3>
        <p className="text-sm text-gray-500">As of {formattedDate}</p>
      </div>
      <div className="space-y-6">
        {/* Core Valuation Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Valuation Ratios (TTM)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {metrics
              .filter((m) => m.category === "valuation")
              .map((metric) => {
                if (metric.optional && (metric.value === undefined || metric.value === null)) {
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
                      {metric.value !== undefined && metric.value !== null
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

        {/* Financial Health Metrics */}
        {(valuation.debtToEquity !== null || valuation.currentRatio !== null || valuation.quickRatio !== null) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Financial Health (TTM)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {metrics
                .filter((m) => m.category === "financial")
                .map((metric) => {
                  if (metric.optional && (metric.value === undefined || metric.value === null)) {
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
                        {metric.value !== undefined && metric.value !== null
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
        )}

        {/* Profitability Metrics */}
        {(valuation.returnOnEquity !== null || valuation.returnOnAssets !== null || valuation.operatingMargin !== null || valuation.netProfitMargin !== null) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Profitability (TTM)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {metrics
                .filter((m) => m.category === "profitability")
                .map((metric) => {
                  if (metric.optional && (metric.value === undefined || metric.value === null)) {
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
                        {metric.value !== undefined && metric.value !== null
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
        )}
      </div>
    </div>
  );
}

