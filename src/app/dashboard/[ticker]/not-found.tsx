import Link from "next/link";

/**
 * 404 page for invalid ticker routes
 */
export default function NotFound() {
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
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-6">Ticker not found</p>
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

