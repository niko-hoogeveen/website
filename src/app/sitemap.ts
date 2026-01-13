import { MetadataRoute } from "next";

// Required for static export
export const dynamic = "force-static";

const BASE_URL = "https://nikohoogeveen.com";

// Available ticker symbols for the dashboard
const TICKERS = ["AMZN", "META", "NVDA"];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Main pages
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Dashboard ticker pages
  const tickerPages: MetadataRoute.Sitemap = TICKERS.map((ticker) => ({
    url: `${BASE_URL}/dashboard/${ticker}`,
    lastModified: currentDate,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...mainPages, ...tickerPages];
}
