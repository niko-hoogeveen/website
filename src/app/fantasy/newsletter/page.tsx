import { Metadata } from "next";
import NewsletterClient from "./NewsletterClient";

export const metadata: Metadata = {
  title: "Weekly Newsletter | Fantasy Football Companion",
  description: "Auto-generated weekly recaps, trends, and upcoming matchups.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Newsletter page (server component wrapper)
 * Renders the client component, which handles the password gate and data loading
 */
export default function NewsletterPage() {
  return <NewsletterClient />;
}
