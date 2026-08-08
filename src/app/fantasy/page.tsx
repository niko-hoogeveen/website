import { Metadata } from "next";
import FantasyClient from "./FantasyClient";

export const metadata: Metadata = {
  title: "Fantasy Football Companion",
  description: "Private league companion site — stats, newsletter, and draft lottery.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Fantasy football companion overview page (server component wrapper)
 * Renders the client component, which handles the password gate and data loading
 */
export default function FantasyPage() {
  return <FantasyClient />;
}
