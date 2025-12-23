/**
 * Loading skeleton component for dashboard pages
 * Provides a professional loading state while data is being fetched
 */
export default function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-800 rounded w-64 mb-4"></div>
        <div className="h-6 bg-gray-800 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-32"></div>
      </div>

      {/* Chart skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-800 rounded w-40 mb-4"></div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="h-96 bg-gray-800 rounded"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-800 rounded w-56 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

