/**
 * Number and formatting utilities for the fantasy football companion
 */

/**
 * Format a win/loss(/tie) record as "W-L" or "W-L-T"
 */
export function formatRecord(wins: number, losses: number, ties = 0): string {
  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

/**
 * Format a fantasy score to one decimal place (standard fantasy convention)
 */
export function formatScore(value: number): string {
  return value.toFixed(1);
}

/**
 * Format a win percentage from wins/losses/ties
 */
export function formatWinPercentage(
  wins: number,
  losses: number,
  ties = 0
): string {
  const totalGames = wins + losses + ties;
  if (totalGames === 0) return "0.0%";
  const winPct = ((wins + ties * 0.5) / totalGames) * 100;
  return `${winPct.toFixed(1)}%`;
}

/**
 * Get a display label for a given season + week, e.g. "2025 · Week 4"
 */
export function formatSeasonWeek(season: string, week: number): string {
  return `${season} · Week ${week}`;
}
