import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";
import { POSTS } from "@/lib/posts";

// Required for static export
export const dynamic = "force-static";

// Available ticker symbols for the dashboard
const TICKERS = ["AMZN", "META", "NVDA"];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Main pages
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/resume`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/writing`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects/calorie-prediction`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  const postPages: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${BASE_URL}/writing/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // Dashboard ticker pages
  const tickerPages: MetadataRoute.Sitemap = TICKERS.map((ticker) => ({
    url: `${BASE_URL}/dashboard/${ticker}`,
    lastModified: currentDate,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...mainPages, ...postPages, ...tickerPages];
}
