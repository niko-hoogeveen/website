import Link from "next/link";

/**
 * Header component for the dashboard overview page
 */
export default function DashboardHeader() {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Equity Research Dashboard</h1>
          <p className="text-gray-400">
            Professional equity analysis and research reports
          </p>
        </div>
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </div>
    </header>
  );
}

