"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getAvailableTickers, loadTickerData } from "@/lib/dashboard/dataLoader";
import type { TickerData } from "@/types/dashboard";

/**
 * Dashboard overview page
 * Displays a list of available tickers with navigation cards
 */
export default function DashboardPage() {
  const [tickerData, setTickerData] = useState<
    Record<string, TickerData | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllTickers() {
      const tickers = getAvailableTickers();
      const data: Record<string, TickerData | null> = {};

      for (const ticker of tickers) {
        data[ticker] = await loadTickerData(ticker);
      }

      setTickerData(data);
      setLoading(false);
    }

    loadAllTickers();
  }, []);

  const tickers = getAvailableTickers();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <DashboardHeader />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-700 rounded-lg p-6 bg-gray-900/50"
            >
              <div className="h-8 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tickers.map((ticker) => {
            const data = tickerData[ticker];
            if (!data) {
              return (
                <div
                  key={ticker}
                  className="border border-gray-700 rounded-lg p-6 bg-gray-900/50"
                >
                  <p className="text-gray-500">Failed to load {ticker}</p>
                </div>
              );
            }

            return (
              <Link
                key={ticker}
                href={`/dashboard/${ticker}`}
                className="block border border-gray-700 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1">
                    {data.metadata.companyName}
                  </h2>
                  <p className="text-lg text-gray-400">{ticker}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    Last updated:{" "}
                    {new Date(data.metadata.lastUpdated).toLocaleDateString()}
                  </p>
                  {data.valuation && (
                    <p>P/E: {data.valuation.pe.toFixed(1)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

