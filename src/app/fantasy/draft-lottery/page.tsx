import { Metadata } from "next";
import DraftLotteryClient from "./DraftLotteryClient";

export const metadata: Metadata = {
  title: "Draft Lottery | Fantasy Football Companion",
  description: "Play the draft lottery mini-game to determine next season's draft order.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Draft lottery page (server component wrapper)
 * Renders the client component, which handles the password gate and the game
 */
export default function DraftLotteryPage() {
  return <DraftLotteryClient />;
}
