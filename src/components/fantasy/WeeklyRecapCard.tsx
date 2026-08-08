import { formatScore } from "@/lib/fantasy/formatters";
import type { MatchupResult, TeamMeta } from "@/types/fantasy";

interface WeeklyRecapCardProps {
  matchup: MatchupResult;
  team: TeamMeta | undefined;
  opponent: TeamMeta | undefined;
}

/**
 * Displays a single team's result for the most recent week
 */
export default function WeeklyRecapCard({
  matchup,
  team,
  opponent,
}: WeeklyRecapCardProps) {
  const isWin = matchup.result === "W";
  const isTie = matchup.result === "T";

  return (
    <div className="border border-gray-700/50 rounded-xl p-5 bg-gradient-to-br from-gray-900/80 to-gray-800/40">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-white">{team?.teamName ?? matchup.teamKey}</h3>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            isTie
              ? "bg-gray-700 text-gray-300"
              : isWin
              ? "bg-green-900/60 text-green-400"
              : "bg-red-900/60 text-red-400"
          }`}
        >
          {matchup.result}
        </span>
      </div>
      <div className="flex justify-between text-sm text-gray-300">
        <span>{formatScore(matchup.score)}</span>
        <span className="text-gray-500">vs</span>
        <span>
          {opponent?.teamName ?? matchup.opponentTeamKey} (
          {formatScore(matchup.opponentScore)})
        </span>
      </div>
    </div>
  );
}
