import { Metadata } from "next";
import DashboardClient from "@/app/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Stock Analysis Dashboard",
  description:
    "Interactive equity research dashboard featuring stock analysis, price charts, earnings data, and valuation metrics for Amazon, Meta, and Nvidia.",
  alternates: {
    canonical: "https://nikohoogeveen.com/dashboard",
  },
  openGraph: {
    title: "Stock Analysis Dashboard | Niko Hoogeveen",
    description:
      "Interactive equity research dashboard with comprehensive stock analysis tools.",
    url: "https://nikohoogeveen.com/dashboard",
    type: "website",
  },
};

/**
 * Dashboard overview page
 * Displays a list of available tickers with navigation cards
 */
export default function DashboardPage() {
  return <DashboardClient />;
}
