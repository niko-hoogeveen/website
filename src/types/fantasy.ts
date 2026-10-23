/**
 * TypeScript interfaces for the Fantasy Football Companion data schema
 *
 * All data is loaded from static JSON files in /public/data/fantasy/
 * Data is refreshed by scripts/update_fantasy_data.mjs via the Yahoo
 * Fantasy Sports API and committed to the repo (see PRD.md for details).
 */

/**
 * A single team/owner in the league
 */
export interface TeamMeta {
  teamKey: string; // Yahoo team_key (e.g., "423.l.51047.t.1")
  teamName: string;
  managerName: string;
  avatarUrl?: string;
}

/**
 * League-level metadata and team roster
 * Source: public/data/fantasy/league.json
 */
export interface LeagueConfig {
  leagueKey: string; // Current season's Yahoo league_key
  leagueName: string;
  season: string; // e.g. "2025"
  teams: TeamMeta[];
}

/**
 * A single matchup result within a weekly snapshot
 */
export interface MatchupResult {
  teamKey: string;
  opponentTeamKey: string;
  score: number;
  opponentScore: number;
  result: "W" | "L" | "T";
}

/**
 * A week's worth of matchup results
 * Source: public/data/fantasy/weekly/{season}-week{N}.json
 */
export interface WeeklyMatchup {
  season: string;
  week: number;
  matchups: MatchupResult[];
}

/**
 * Cumulative all-time stats for a single team
 *
 * NOTE: `championships` is manually curated and must never be overwritten
 * by the automated update script (same convention as the dashboard's
 * earnings/fundamentals preservation).
 */
export interface AllTimeTeamStats {
  teamName: string;
  allTimePoints: number;
  wins: number;
  losses: number;
  ties: number;
  highestSingleWeekScore: number;
  lowestSingleWeekScore: number;
  championships: number; // manually curated, preserved across updates
}

/**
 * All-time stats keyed by teamKey
 * Source: public/data/fantasy/stats-alltime.json
 */
export interface AllTimeStats {
  [teamKey: string]: AllTimeTeamStats;
}

/**
 * A single auto-generated weekly newsletter entry
 * Source: public/data/fantasy/newsletters/{season}-week{N}.json
 */
export interface NewsletterEntry {
  season: string;
  week: number;
  generatedAt: string; // ISO 8601 date string
  recap: string;
  trends: string;
  upcomingMatchups: string;
}

/**
 * A single player's best score in the draft lottery mini-game
 * Persisted client-side only (localStorage) — see PRD.md for rationale
 */
export interface LotteryEntry {
  teamKey: string;
  teamName: string;
  score: number;
  playedAt: string; // ISO 8601 date string
}
