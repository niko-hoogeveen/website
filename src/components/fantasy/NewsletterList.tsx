import { formatSeasonWeek } from "@/lib/fantasy/formatters";

interface NewsletterListProps {
  entries: { season: string; week: number }[];
  selected: { season: string; week: number } | null;
  onSelect: (entry: { season: string; week: number }) => void;
}

/**
 * Sidebar list of available weekly newsletter entries, newest first
 */
export default function NewsletterList({
  entries,
  selected,
  onSelect,
}: NewsletterListProps) {
  const sorted = [...entries].sort((a, b) => {
    if (a.season !== b.season) return b.season.localeCompare(a.season);
    return b.week - a.week;
  });

  return (
    <nav className="space-y-2">
      {sorted.map((entry) => {
        const isActive =
          selected?.season === entry.season && selected?.week === entry.week;

        return (
          <button
            key={`${entry.season}-${entry.week}`}
            onClick={() => onSelect(entry)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              isActive
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800/60 border-gray-700/50 text-gray-300 hover:bg-gray-700/60"
            }`}
          >
            {formatSeasonWeek(entry.season, entry.week)}
          </button>
        );
      })}
    </nav>
  );
}
