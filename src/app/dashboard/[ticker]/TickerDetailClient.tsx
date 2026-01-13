"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TickerHeader from "@/components/dashboard/TickerHeader";
import ResearchReportLink from "@/components/dashboard/ResearchReportLink";
import PriceChart from "@/components/dashboard/PriceChart";
import TimeRangeSelector from "@/components/dashboard/TimeRangeSelector";
import LatestPrice from "@/components/dashboard/LatestPrice";
import EarningsTable from "@/components/dashboard/EarningsTable";
import EarningsChart from "@/components/dashboard/EarningsChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import NetIncomeChart from "@/components/dashboard/NetIncomeChart";
import MarginChart from "@/components/dashboard/MarginChart";
import ValuationCards from "@/components/dashboard/ValuationCards";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import PageParticles from "@/components/Particles";
import Hero from "@/components/Hero";
import { loadTickerData, isValidTicker } from "@/lib/dashboard/dataLoader";
import type { TickerData, TimeRange } from "@/types/dashboard";

/**
 * Client component for ticker detail page
 * Handles data loading and rendering
 */
export default function TickerDetailClient() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [data, setData] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y");

  useEffect(() => {
    // Minimum delay before showing skeleton (prevents flash on fast loads)
    const MIN_LOADING_TIME = 75; // milliseconds

    // Set timeout to show skeleton only if loading takes longer than minimum
    const skeletonTimeout = setTimeout(() => {
      setShowSkeleton(true);
    }, MIN_LOADING_TIME);

    async function loadData() {
      if (!isValidTicker(ticker)) {
        clearTimeout(skeletonTimeout);
        setError(true);
        setLoading(false);
        setShowSkeleton(false);
        return;
      }

      const tickerData = await loadTickerData(ticker);

      // Clear the skeleton timeout since we have data
      clearTimeout(skeletonTimeout);

      if (!tickerData) {
        setError(true);
        setLoading(false);
        setShowSkeleton(false);
        return;
      }

      setData(tickerData);
      setLoading(false);
      setShowSkeleton(false);
    }

    loadData();

    return () => {
      clearTimeout(skeletonTimeout);
    };
  }, [ticker]);

  // Show skeleton only if loading takes longer than minimum delay
  if (loading && showSkeleton) {
    return <LoadingSkeleton />;
  }

  // If still loading but skeleton hasn't appeared yet, show nothing
  // This prevents flash for fast loads (< 250ms)
  if (loading) {
    return null;
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <PageParticles id={`ticker-error-particles`} />
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Ticker Not Found</h1>
          <p className="text-gray-400 mb-6">
            The ticker &quot;{ticker}&quot; is not available.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors duration-200"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 animate-fade-in">
      <PageParticles id={`ticker-${ticker}-particles`} />
      <header className="font-geist text-center mt-5 animate-slide-in-top">
        <div className="flex flex-row justify-center gap-64">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors duration-200 right-10"
          >
            ← Back to Dashboard
          </Link>
          <div>
            <TickerHeader metadata={data.metadata} />
            {data.metadata.researchReportUrl !== "undefined" && (
              <ResearchReportLink
                url={data.metadata.researchReportUrl}
                companyName={data.metadata.companyName}
              />
            )}
          </div>
          <div>
            <Hero />
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-6 p-6">
        {/* Price Chart Section */}
        <section className="border-t border-gray-500 pt-6 animate-slide-in-bottom-delay-100">
          <h2 className="text-xl font-bold mb-3">Price Chart</h2>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <TimeRangeSelector
                selectedRange={timeRange}
                onRangeChange={setTimeRange}
              />
              <LatestPrice
                priceData={data.priceHistory}
                timeRange={timeRange}
              />
            </div>
            <PriceChart
              priceData={data.priceHistory}
              timeRange={timeRange}
              height={350}
            />
          </div>
        </section>

        {/* Earnings Surprise Dashboard */}
        <section className="border-t border-gray-800 pt-6 animate-slide-in-bottom-delay-200">
          <h2 className="text-xl font-bold mb-3">Earnings Surprise</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">Earnings History</h3>
              <EarningsTable earnings={data.earnings} />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">
                EPS Actual vs Estimate
              </h3>
              <EarningsChart earnings={data.earnings} height={280} />
            </div>
          </div>
        </section>

        {/* Revenue & Profit Trends */}
        <section className="border-t border-gray-800 pt-6 animate-slide-in-bottom-delay-300">
          <h2 className="text-xl font-bold mb-3">Revenue & Profit Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">
                Quarterly Revenue
              </h3>
              <RevenueChart
                revenueData={data.fundamentals.revenue}
                height={250}
              />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">
                Quarterly Net Income
              </h3>
              <NetIncomeChart
                netIncomeData={data.fundamentals.netIncome}
                height={250}
              />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">
                Operating Margin (%)
              </h3>
              <MarginChart
                marginData={data.fundamentals.operatingMargin}
                height={250}
              />
            </div>
          </div>
        </section>

        {data.valuation && (
          <section className="border-t border-gray-800 pt-6 animate-slide-in-bottom-delay-400">
            <h2 className="text-xl font-bold mb-3">Valuation Snapshot</h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <ValuationCards valuation={data.valuation} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
