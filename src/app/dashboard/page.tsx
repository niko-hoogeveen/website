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
import { format, parseISO } from "date-fns";
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
      </div>

      {/* Description Section */}
      <div className="animate-slide-in-bottom mt-8 mb-10">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold font-geist mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why I Created This Dashboard
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                I built this dashboard as a way to learn how equity research
                actually works by doing it myself. While moving from software
                engineering into market and stock analysis, I realized that
                reading reports alone wasn&apos;t enough—I wanted to work
                directly with price data, earnings results, and valuation
                metrics in a way that felt realistic. This project brings those
                pieces together in one place and reflects how I personally
                analyze companies: looking at the business, the numbers, and how
                the market reacts over time. It also gave me a way to combine my
                technical background with my growing interest in financial
                analysis in a practical, hands-on way.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker Cards Section */}
      <div className="animate-slide-in-bottom-delay-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-200">
          Available Companies
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-700 rounded-xl p-6 bg-gray-900/50"
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
            {tickers.map((ticker, index) => {
              const data = tickerData[ticker];
              if (!data) {
                return (
                  <div
                    key={ticker}
                    className="border border-gray-700 rounded-xl p-6 bg-gray-900/50"
                  >
                    <p className="text-gray-500">Failed to load {ticker}</p>
                  </div>
                );
              }

              return (
                <div
                  className="animate-slide-in-bottom"
                  key={ticker}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                  }}
                >
                  <Link
                    href={`/dashboard/${ticker}`}
                    className="group block border border-gray-700/50 rounded-xl p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 
                              hover:from-gray-800/90 hover:to-gray-700/50 
                              hover:border-gray-600/50
                              transition-all duration-300 ease-out 
                              hover:scale-[1.02] hover:shadow-2xl 
                              cursor-pointer relative overflow-hidden"
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl"></div>

                    <div className="relative z-10">
                      <div className="mb-5">
                        <h2 className="text-2xl font-bold mb-1 group-hover:text-white transition-colors">
                          {data.metadata.companyName}
                        </h2>
                        <p className="text-lg text-gray-400 font-medium">
                          {ticker}
                        </p>
                      </div>

                      <div className="flex flex-row justify-between items-end pt-4 border-t border-gray-700/50">
                        <div className="text-sm space-y-1">
                          <p className="text-gray-400">
                            Updated:{" "}
                            <span className="text-gray-300">
                              {format(
                                parseISO(data.metadata.lastUpdated),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </p>
                          {data.valuation &&
                            data.valuation.pe !== null &&
                            data.valuation.pe !== undefined && (
                              <p className="text-gray-400">
                                P/E:{" "}
                                <span className="text-gray-300 font-semibold">
                                  {data.valuation.pe.toFixed(1)}
                                </span>
                              </p>
                            )}
                        </div>
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                          <LatestPrice
                            priceData={data.priceHistory}
                            timeRange={timeRange}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
