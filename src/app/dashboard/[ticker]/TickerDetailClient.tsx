"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TickerHeader from "@/components/dashboard/TickerHeader";
import ResearchReportLink from "@/components/dashboard/ResearchReportLink";
import PriceChart from "@/components/dashboard/PriceChart";
import TimeRangeSelector from "@/components/dashboard/TimeRangeSelector";
import EarningsTable from "@/components/dashboard/EarningsTable";
import EarningsChart from "@/components/dashboard/EarningsChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import NetIncomeChart from "@/components/dashboard/NetIncomeChart";
import MarginChart from "@/components/dashboard/MarginChart";
import ValuationCards from "@/components/dashboard/ValuationCards";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
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
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y");

  useEffect(() => {
    async function loadData() {
      if (!isValidTicker(ticker)) {
        setError(true);
        setLoading(false);
        return;
      }

      const tickerData = await loadTickerData(ticker);
      if (!tickerData) {
        setError(true);
        setLoading(false);
        return;
      }

      setData(tickerData);
      setLoading(false);
    }

    loadData();
  }, [ticker]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <TickerHeader metadata={data.metadata} />
      <ResearchReportLink
        url={data.metadata.researchReportUrl}
        companyName={data.metadata.companyName}
      />

      {/* Main Content Sections */}
      <div className="mt-6 space-y-6">
        {/* Price Chart Section */}
        <section className="border-t border-gray-800 pt-6">
          <h2 className="text-xl font-bold mb-3">Price Chart</h2>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <TimeRangeSelector
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
            />
            <PriceChart
              priceData={data.priceHistory}
              earnings={data.earnings}
              timeRange={timeRange}
              height={350}
            />
          </div>
        </section>

        {/* Earnings Surprise Dashboard */}
        <section className="border-t border-gray-800 pt-6">
          <h2 className="text-xl font-bold mb-3">Earnings Surprise</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">Earnings History</h3>
              <EarningsTable earnings={data.earnings} />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">EPS Actual vs Estimate</h3>
              <EarningsChart earnings={data.earnings} height={280} />
            </div>
          </div>
        </section>

        {/* Revenue & Profit Trends */}
        <section className="border-t border-gray-800 pt-6">
          <h2 className="text-xl font-bold mb-3">Revenue & Profit Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">Quarterly Revenue</h3>
              <RevenueChart revenueData={data.fundamentals.revenue} height={250} />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">Quarterly Net Income</h3>
              <NetIncomeChart netIncomeData={data.fundamentals.netIncome} height={250} />
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-2">Operating Margin (%)</h3>
              <MarginChart marginData={data.fundamentals.operatingMargin} height={250} />
            </div>
          </div>
        </section>

        {data.valuation && (
          <section className="border-t border-gray-800 pt-6">
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

