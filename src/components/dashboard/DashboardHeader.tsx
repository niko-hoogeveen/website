import Link from "next/link";
import Hero from "@/components/Hero";

/**
 * Header component for the dashboard overview page
 */
export default function DashboardHeader() {
  return (
    <header className="font-geist text-center mb-4 mt-5">
      <div className="flex flex-column justify-center gap-64">
        <div>
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="">
          <h1 className="text-4xl font-bold mb-2">Equity Research Dashboard</h1>
          <p className="text-gray-400">
            Professional equity analysis and research reports
          </p>
        </div>
        <div>
          <Hero />
        </div>
      </div>
    </header>
  );
}
