"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PageParticles from "@/components/Particles";
import {
  getAvailableTickers,
  loadTickerData,
} from "@/lib/dashboard/dataLoader";
import type { TickerData } from "@/types/dashboard";
import LatestPrice from "@/components/dashboard/LatestPrice";
import { TimeRange } from "@/types/dashboard";
/**
 * Dashboard overview page
 * Displays a list of available tickers with navigation cards
 */
export default function DashboardPage() {
  const [tickerData, setTickerData] = useState<
    Record<string, TickerData | null>
  >({});
  const [timeRange] = useState<TimeRange>("1Y");
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
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <PageParticles id="dashboard-particles" />
      <div className="animate-slide-in-top">
        <DashboardHeader />
        <br></br>
        <h3 className="text-left text-2xl font-bold font-geist">
          Why I Created this Dashboard
        </h3>
        <p className="mt-1 mx-0.25">
          I built this dashboard as a way to learn how equity research actually
          works by doing it myself. While moving from software engineering into
          market and stock analysis, I realized that reading reports alone
          wasn’t enough—I wanted to work directly with price data, earnings
          results, and valuation metrics in a way that felt realistic. This
          project brings those pieces together in one place and reflects how I
          personally analyze companies: looking at the business, the numbers,
          and how the market reacts over time. It also gave me a way to combine
          my technical background with my growing interest in financial analysis
          in a practical, hands-on way.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse mt-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {tickers.map((ticker, index) => {
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
              <div className="animate-slide-in-bottom" key={ticker}>
                <Link
                  key={ticker}
                  href={`/dashboard/${ticker}`}
                  className="block border border-gray-700 rounded-lg p-6 bg-gray-900/50 
                            hover:bg-gray-800/50 transition-all duration-300 ease-out hover:scale-105 
                            hover:shadow-lg cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-1">
                      {data.metadata.companyName}
                    </h2>
                    <p className="text-lg text-gray-400">{ticker}</p>
                  </div>
                  <div className="flex flex-row justify-between">
                    <div className="text-sm text-gray-500">
                      <p>
                        Last updated:{" "}
                        {new Date(
                          data.metadata.lastUpdated
                        ).toLocaleDateString()}
                      </p>
                      {data.valuation &&
                        data.valuation.pe !== null &&
                        data.valuation.pe !== undefined && (
                          <p>P/E: {data.valuation.pe.toFixed(1)}</p>
                        )}
                    </div>
                    <LatestPrice
                        priceData={data.priceHistory}
                        timeRange={timeRange}
                      />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
