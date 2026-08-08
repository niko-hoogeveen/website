"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";
import PasswordGate from "@/components/fantasy/PasswordGate";
import DraftLotteryLeaderboard from "@/components/fantasy/DraftLotteryLeaderboard";
import { loadLeagueConfig } from "@/lib/fantasy/dataLoader";
import type { LeagueConfig } from "@/types/fantasy";

export default function DraftLotteryClient() {
  const [league, setLeague] = useState<LeagueConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const config = await loadLeagueConfig();
      setLeague(config);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <PasswordGate>
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        <PageParticles id="fantasy-draft-lottery-particles" />

        <Link
          href="/fantasy"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Fantasy Home
        </Link>

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Fantasy", href: "/fantasy" },
            { name: "Draft Lottery", href: "/fantasy/draft-lottery" },
          ]}
        />

        <div className="animate-slide-in-top mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Draft Lottery
          </h1>
          <p className="text-xl text-gray-400">
            Each owner plays once — best score picks first. Best played
            together on one device at draft night!
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse h-64 bg-gray-900/50 border border-gray-700 rounded-xl" />
        ) : league ? (
          <DraftLotteryLeaderboard teams={league.teams} />
        ) : (
          <p className="text-gray-500">Unable to load league data.</p>
        )}
      </div>
    </PasswordGate>
  );
}
