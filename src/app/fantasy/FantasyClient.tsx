"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageParticles from "@/components/Particles";
import Breadcrumbs from "@/components/Breadcrumbs";
import PasswordGate from "@/components/fantasy/PasswordGate";
import AllTimeStatCard from "@/components/fantasy/AllTimeStatCard";
import WeeklyRecapCard from "@/components/fantasy/WeeklyRecapCard";
import {
  loadLeagueConfig,
  loadWeeklyMatchup,
  loadAllTimeStats,
} from "@/lib/fantasy/dataLoader";
import type { LeagueConfig, WeeklyMatchup, AllTimeStats } from "@/types/fantasy";

export default function FantasyClient() {
  const [league, setLeague] = useState<LeagueConfig | null>(null);
  const [weekly, setWeekly] = useState<WeeklyMatchup | null>(null);
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const leagueConfig = await loadLeagueConfig();
      setLeague(leagueConfig);

      if (leagueConfig) {
        // MVP: display the most recently completed week (week 1 in sample data)
        const matchup = await loadWeeklyMatchup(leagueConfig.season, 1);
        setWeekly(matchup);
      }

      const stats = await loadAllTimeStats();
      setAllTimeStats(stats);

      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <PasswordGate>
      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        <PageParticles id="fantasy-particles" />

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Fantasy", href: "/fantasy" },
          ]}
        />

        <div className="animate-slide-in-top mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {league?.leagueName ?? "Fantasy Football Companion"}
          </h1>
          <p className="text-xl text-gray-400">
            League stats, weekly newsletter, and the draft lottery
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 h-32"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Last Week's Results */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-200">
                Last Week&apos;s Results
              </h2>
              {weekly ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekly.matchups.map((matchup) => (
                    <WeeklyRecapCard
                      key={matchup.teamKey}
                      matchup={matchup}
                      team={league?.teams.find(
                        (t) => t.teamKey === matchup.teamKey
                      )}
                      opponent={league?.teams.find(
                        (t) => t.teamKey === matchup.opponentTeamKey
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No weekly results available yet.</p>
              )}
            </section>

            {/* All-Time Stats */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-200">
                All-Time Stats
              </h2>
              {allTimeStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(allTimeStats).map(([teamKey, stats]) => (
                    <AllTimeStatCard
                      key={teamKey}
                      teamKey={teamKey}
                      stats={stats}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No all-time stats available yet.</p>
              )}
            </section>

            {/* Navigation to Newsletter & Draft Lottery */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/fantasy/newsletter"
                className="inline-block px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Weekly Newsletter
              </Link>
              <Link
                href="/fantasy/draft-lottery"
                className="inline-block px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Draft Lottery Game
              </Link>
            </div>
          </div>
        )}
      </div>
    </PasswordGate>
  );
}
