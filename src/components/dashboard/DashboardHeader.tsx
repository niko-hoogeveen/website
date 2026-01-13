import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import Breadcrumbs from "@/components/Breadcrumbs";

/**
 * Header component for the dashboard overview page
 */
export default function DashboardHeader() {
  return (
    <header className="font-geist mb-4">
      {/* Back Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Dashboard", href: "/dashboard" },
        ]}
      />

      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Equity Research Dashboard
        </h1>
        <p className="text-xl text-gray-400">
          Professional equity analysis and research reports
        </p>
      </div>
    </header>
  );
}
