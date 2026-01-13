import { Metadata } from "next";
import { getAvailableTickers } from "@/lib/dashboard/dataLoader";
import TickerDetailClient from "./TickerDetailClient";

const tickerInfo: Record<string, { name: string; description: string }> = {
  AMZN: {
    name: "Amazon",
    description:
      "Comprehensive stock analysis for Amazon (AMZN) including price charts, earnings data, valuation metrics, and research reports.",
  },
  META: {
    name: "Meta Platforms",
    description:
      "Comprehensive stock analysis for Meta Platforms (META) including price charts, earnings data, valuation metrics, and research reports.",
  },
  NVDA: {
    name: "Nvidia",
    description:
      "Comprehensive stock analysis for Nvidia (NVDA) including price charts, earnings data, valuation metrics, and research reports.",
  },
};

type Props = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const info = tickerInfo[ticker] || {
    name: ticker,
    description: `Stock analysis for ${ticker}`,
  };

  return {
    title: `${info.name} (${ticker}) Stock Analysis`,
    description: info.description,
    alternates: {
      canonical: `https://nikohoogeveen.com/dashboard/${ticker}`,
    },
    openGraph: {
      title: `${info.name} (${ticker}) Stock Analysis | Niko Hoogeveen`,
      description: info.description,
      url: `https://nikohoogeveen.com/dashboard/${ticker}`,
      type: "article",
    },
  };
}

/**
 * Generate static params for all available tickers
 * Required for static export with dynamic routes
 */
export function generateStaticParams() {
  return getAvailableTickers().map((ticker) => ({
    ticker,
  }));
}

/**
 * Ticker detail page (server component wrapper)
 * Renders the client component for data loading and interactivity
 */
export default function TickerDetailPage() {
  return <TickerDetailClient />;
}
