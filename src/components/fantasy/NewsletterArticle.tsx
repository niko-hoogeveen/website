import { formatSeasonWeek } from "@/lib/fantasy/formatters";
import type { NewsletterEntry } from "@/types/fantasy";

interface NewsletterArticleProps {
  entry: NewsletterEntry;
}

/**
 * Renders a single auto-generated weekly newsletter entry
 */
export default function NewsletterArticle({ entry }: NewsletterArticleProps) {
  return (
    <article className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white mb-1">
          {formatSeasonWeek(entry.season, entry.week)}
        </h2>
        <p className="text-sm text-gray-500">
          Generated {new Date(entry.generatedAt).toLocaleDateString()}
        </p>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-white">Recap</h3>
        <p className="text-gray-300 leading-relaxed">{entry.recap}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-white">
          Trends & Strengths/Weaknesses
        </h3>
        <p className="text-gray-300 leading-relaxed">{entry.trends}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-white">
          Upcoming Key Matchups
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {entry.upcomingMatchups}
        </p>
      </section>
    </article>
  );
}
