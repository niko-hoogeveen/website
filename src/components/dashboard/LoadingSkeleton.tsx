"use client";

/**
 * Loading skeleton component for dashboard pages
 * Provides a professional loading state while data is being fetched
 * Matches the actual ticker detail page layout structure
 */
export default function LoadingSkeleton() {
  return (
    <div className="mt-10">
      {/* Header skeleton - matches the centered header layout */}
      <header className="font-geist text-center mt-5 mb-8 animate-pulse">
        <div className="flex flex-row justify-center gap-64 mr-10">
          {/* Back link skeleton */}
          <div className="h-6 bg-gray-800 rounded w-40"></div>
          
          {/* Ticker header skeleton */}
          <div>
            <div className="h-8 bg-gray-800 rounded w-48 mb-3 mx-auto"></div>
            <div className="h-6 bg-gray-800 rounded w-32 mb-2 mx-auto"></div>
            <div className="h-5 bg-gray-800 rounded w-40 mx-auto"></div>
          </div>
          
          <div></div>
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-6 max-w-6xl mx-auto p-6">
        {/* Price Chart Section */}
        <section className="border-t border-gray-500 pt-6 animate-pulse">
          <div className="h-7 bg-gray-800 rounded w-32 mb-3"></div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            {/* Time range selector skeleton */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-9 bg-gray-800 rounded-lg w-16"></div>
              ))}
            </div>
            {/* Chart skeleton */}
            <div className="h-[350px] bg-gray-800 rounded"></div>
          </div>
        </section>

        {/* Earnings Surprise Dashboard */}
        <section className="border-t border-gray-800 pt-6 animate-pulse">
          <div className="h-7 bg-gray-800 rounded w-48 mb-3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Earnings Table skeleton */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="h-6 bg-gray-800 rounded w-40 mb-3"></div>
              <div className="space-y-2">
                {/* Table header */}
                <div className="h-8 bg-gray-800 rounded mb-2"></div>
                {/* Table rows */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-gray-800/70 rounded"></div>
                ))}
              </div>
            </div>
            {/* Earnings Chart skeleton */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="h-6 bg-gray-800 rounded w-48 mb-3"></div>
              <div className="h-[280px] bg-gray-800 rounded"></div>
            </div>
          </div>
        </section>

        {/* Revenue & Profit Trends */}
        <section className="border-t border-gray-800 pt-6 animate-pulse">
          <div className="h-7 bg-gray-800 rounded w-56 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
              >
                <div className="h-6 bg-gray-800 rounded w-40 mb-3"></div>
                <div className="h-[250px] bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Valuation Snapshot */}
        <section className="border-t border-gray-800 pt-6 animate-pulse">
          <div className="h-7 bg-gray-800 rounded w-48 mb-3"></div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

