"use client";

import { useEffect, useState } from "react";
import SnakeGame from "@/components/fantasy/SnakeGame";
import { verifyPassword } from "@/lib/fantasy/auth";
import type { TeamMeta, LotteryEntry } from "@/types/fantasy";

const STORAGE_KEY = "fantasy-lottery-entries";

interface DraftLotteryLeaderboardProps {
  teams: TeamMeta[];
}

function loadEntries(): LotteryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LotteryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: LotteryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Draft lottery leaderboard: each team plays the Snake mini-game exactly
 * once (tracked in localStorage on this browser). Draft order is the
 * ranking of scores, highest first.
 *
 * NOTE: this is intentionally a single-device experience (e.g., played
 * together at a draft night) — see PRD.md for the accepted tradeoffs.
 */
export default function DraftLotteryLeaderboard({
  teams,
}: DraftLotteryLeaderboardProps) {
  const [entries, setEntries] = useState<LotteryEntry[]>([]);
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const availableTeams = teams.filter(
    (team) => !entries.some((entry) => entry.teamKey === team.teamKey)
  );

  const rankedEntries = [...entries].sort((a, b) => b.score - a.score);

  const handleGameOver = (score: number) => {
    const team = teams.find((t) => t.teamKey === selectedTeamKey);
    if (!team) return;

    const newEntry: LotteryEntry = {
      teamKey: team.teamKey,
      teamName: team.teamName,
      score,
      playedAt: new Date().toISOString(),
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    saveEntries(updated);
    setPlaying(false);
    setSelectedTeamKey("");
  };

  const handleReset = async () => {
    const isValid = await verifyPassword(resetPassword);
    if (isValid) {
      setEntries([]);
      saveEntries([]);
      setResetPassword("");
      setResetError(false);
      setShowReset(false);
    } else {
      setResetError(true);
    }
  };

  return (
    <div className="space-y-8">
      {!playing ? (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Play the Draft Lottery Game
          </h3>
          {availableTeams.length === 0 ? (
            <p className="text-gray-400">
              Every team has already played this lottery cycle. Reset below to
              start a new cycle.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedTeamKey}
                onChange={(e) => setSelectedTeamKey(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select your team...</option>
                {availableTeams.map((team) => (
                  <option key={team.teamKey} value={team.teamKey}>
                    {team.teamName} ({team.managerName})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPlaying(true)}
                disabled={!selectedTeamKey}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                Play
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <SnakeGame onGameOver={handleGameOver} />
        </div>
      )}

      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Leaderboard & Draft Order
        </h3>
        {rankedEntries.length === 0 ? (
          <p className="text-gray-500">No one has played yet.</p>
        ) : (
          <ol className="space-y-2">
            {rankedEntries.map((entry, index) => (
              <li
                key={entry.teamKey}
                className="flex justify-between items-center px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg"
              >
                <span className="text-gray-300">
                  <span className="font-bold text-white mr-2">
                    Pick {index + 1}:
                  </span>
                  {entry.teamName}
                </span>
                <span className="text-blue-400 font-semibold">
                  {entry.score}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="text-right">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="text-sm text-gray-500 hover:text-gray-300 underline"
          >
            Reset Lottery
          </button>
        ) : (
          <div className="inline-flex gap-2 items-center">
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Password"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Confirm Reset
            </button>
            {resetError && (
              <span className="text-red-400 text-sm">Incorrect password</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
