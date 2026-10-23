/**
 * Data loading utilities for the Fantasy Football Companion
 *
 * Since we're using static export, all data is loaded from JSON files in
 * /public/data/fantasy/ using fetch in client components. Yahoo API data
 * is never fetched live from the browser — see scripts/update_fantasy_data.mjs
 * and PRD.md for how the underlying JSON is produced.
 */

import type {
  LeagueConfig,
  WeeklyMatchup,
  AllTimeStats,
  NewsletterEntry,
} from "@/types/fantasy";

/**
 * Load the league metadata + team roster
 */
export async function loadLeagueConfig(): Promise<LeagueConfig | null> {
  try {
    const response = await fetch(`/data/fantasy/league.json`);

    if (!response.ok) {
      console.error(`Failed to load league config: ${response.statusText}`);
      return null;
    }

    return (await response.json()) as LeagueConfig;
  } catch (error) {
    console.error(`Error loading league config:`, error);
    return null;
  }
}

/**
 * Load a specific week's matchup results
 */
export async function loadWeeklyMatchup(
  season: string,
  week: number
): Promise<WeeklyMatchup | null> {
  try {
    const response = await fetch(
      `/data/fantasy/weekly/${season}-week${week}.json`
    );

    if (!response.ok) {
      console.error(
        `Failed to load weekly matchup for ${season} week ${week}: ${response.statusText}`
      );
      return null;
    }

    return (await response.json()) as WeeklyMatchup;
  } catch (error) {
    console.error(
      `Error loading weekly matchup for ${season} week ${week}:`,
      error
    );
    return null;
  }
}

/**
 * Load the all-time cumulative stats for every team
 */
export async function loadAllTimeStats(): Promise<AllTimeStats | null> {
  try {
    const response = await fetch(`/data/fantasy/stats-alltime.json`);

    if (!response.ok) {
      console.error(`Failed to load all-time stats: ${response.statusText}`);
      return null;
    }

    return (await response.json()) as AllTimeStats;
  } catch (error) {
    console.error(`Error loading all-time stats:`, error);
    return null;
  }
}

/**
 * Load a specific week's auto-generated newsletter entry
 */
export async function loadNewsletterEntry(
  season: string,
  week: number
): Promise<NewsletterEntry | null> {
  try {
    const response = await fetch(
      `/data/fantasy/newsletters/${season}-week${week}.json`
    );

    if (!response.ok) {
      console.error(
        `Failed to load newsletter for ${season} week ${week}: ${response.statusText}`
      );
      return null;
    }

    return (await response.json()) as NewsletterEntry;
  } catch (error) {
    console.error(
      `Error loading newsletter for ${season} week ${week}:`,
      error
    );
    return null;
  }
}

/**
 * Load an index of all available newsletter entries, newest first
 * Source: public/data/fantasy/newsletters/index.json
 * (a small manifest maintained by the update script listing season/week pairs)
 */
export async function loadNewsletterIndex(): Promise<
  { season: string; week: number }[]
> {
  try {
    const response = await fetch(`/data/fantasy/newsletters/index.json`);

    if (!response.ok) {
      console.error(`Failed to load newsletter index: ${response.statusText}`);
      return [];
    }

    return (await response.json()) as { season: string; week: number }[];
  } catch (error) {
    console.error(`Error loading newsletter index:`, error);
    return [];
  }
}
