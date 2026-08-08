import { formatRecord, formatScore } from "@/lib/fantasy/formatters";
import type { AllTimeTeamStats } from "@/types/fantasy";

interface AllTimeStatCardProps {
  teamKey: string;
  stats: AllTimeTeamStats;
}

/**
 * Displays a single team's all-time cumulative stats:
 * all-time points, W/L record, highest/lowest single-week score, championships
 */
export default function AllTimeStatCard({ stats }: AllTimeStatCardProps) {
  return (
    <div className="border border-gray-700/50 rounded-xl p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40">
      <h3 className="text-lg font-bold mb-4 text-white">{stats.teamName}</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-400">All-Time Points</dt>
          <dd className="text-gray-200 font-semibold">
            {formatScore(stats.allTimePoints)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Record</dt>
          <dd className="text-gray-200 font-semibold">
            {formatRecord(stats.wins, stats.losses, stats.ties)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Highest Single Week</dt>
          <dd className="text-green-400 font-semibold">
            {formatScore(stats.highestSingleWeekScore)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Lowest Single Week</dt>
          <dd className="text-red-400 font-semibold">
            {formatScore(stats.lowestSingleWeekScore)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-400">Championships</dt>
          <dd className="text-yellow-400 font-semibold">
            {stats.championships}
          </dd>
        </div>
      </dl>
    </div>
  );
}
