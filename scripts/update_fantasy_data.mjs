#!/usr/bin/env node

/**
 * Fantasy League Data Update Script
 *
 * Refreshes the fantasy football companion's static data:
 * - Last completed week's matchup results
 * - All-time cumulative stats (points, W/L record, single-week high/low)
 * - An auto-generated weekly newsletter (via OpenAI)
 *
 * Data Source: Yahoo Fantasy Sports API (OAuth 2.0)
 *
 * What gets updated:
 * - public/data/fantasy/league.json (team roster/metadata)
 * - public/data/fantasy/weekly/{season}-week{N}.json
 * - public/data/fantasy/stats-alltime.json (points/W-L/high/low only)
 * - public/data/fantasy/newsletters/{season}-week{N}.json + index.json
 *
 * What gets preserved (never overwritten):
 * - stats-alltime.json -> championships (manually curated)
 *
 * Required environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_REFRESH_TOKEN
 * - OPENAI_API_KEY
 *
 * See PRD.md ("Setup Runbook") for one-time Yahoo OAuth setup instructions.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DATA_DIR = join(__dirname, "..", "public", "data", "fantasy");
const YAHOO_TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";
const YAHOO_API_BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

// Yahoo assigns a new league_key each season for the same league (linked via
// a `renew` reference). Maintain that mapping here; update it once per new
// season. Fallback lookup via the user's games/leagues endpoint is attempted
// if a season is missing.
const SEASON_LEAGUE_KEYS = {
  // "2025": "449.l.51047",
  // "2024": "423.l.51047",
};

const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
const YAHOO_REFRESH_TOKEN = process.env.YAHOO_REFRESH_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET || !YAHOO_REFRESH_TOKEN) {
  console.error(
    "❌ Error: YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, and YAHOO_REFRESH_TOKEN are all required"
  );
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Exchange the stored refresh token for a short-lived access token.
 *
 * NOTE: If this starts failing with 401, the refresh token has likely
 * expired or been revoked by Yahoo — the one-time manual OAuth
 * authorization flow must be redone (see PRD.md Setup Runbook) to obtain a
 * new refresh token and update the YAHOO_REFRESH_TOKEN secret.
 */
async function getAccessToken() {
  const basicAuth = Buffer.from(
    `${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(YAHOO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: YAHOO_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to refresh Yahoo access token: HTTP ${response.status} - ${text}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Resolve the current season's league_key, falling back to a live lookup
 * via the user's games/leagues endpoint if not present in config.
 */
async function resolveLeagueKey(accessToken, season) {
  if (SEASON_LEAGUE_KEYS[season]) {
    return SEASON_LEAGUE_KEYS[season];
  }

  console.log(
    `  ⚠️  No league_key configured for season ${season}, attempting live lookup...`
  );

  const url = `${YAHOO_API_BASE}/users;use_login=1/games;game_keys=nfl/leagues?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Could not resolve league_key for season ${season}: HTTP ${response.status}`
    );
  }

  const data = await response.json();
  // Yahoo's JSON response shape is deeply nested; callers should inspect
  // this structure and add the resolved league_key to SEASON_LEAGUE_KEYS
  // once confirmed, rather than relying on this lookup every run.
  console.log(
    "  ℹ️  Live lookup response received — add the resolved league_key to SEASON_LEAGUE_KEYS once confirmed."
  );
  return null;
}

/**
 * Fetch league metadata (including current_week) for a given league_key
 */
async function fetchLeagueMeta(accessToken, leagueKey) {
  const url = `${YAHOO_API_BASE}/league/${leagueKey}?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch league metadata: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch the league's team roster (names, managers)
 */
async function fetchTeams(accessToken, leagueKey) {
  const url = `${YAHOO_API_BASE}/league/${leagueKey}/teams?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch a specific week's scoreboard (matchup results)
 */
async function fetchScoreboard(accessToken, leagueKey, week) {
  const url = `${YAHOO_API_BASE}/league/${leagueKey}/scoreboard;week=${week}?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch scoreboard for week ${week}: HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Load an existing JSON file, or return a fallback if it doesn't exist
 */
function loadJson(relativePath, fallback) {
  const filePath = join(DATA_DIR, relativePath);
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`  ❌ Error reading ${relativePath}:`, error.message);
    return fallback;
  }
}

/**
 * Write a JSON file, creating parent directories as needed
 */
function saveJson(relativePath, data) {
  const filePath = join(DATA_DIR, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  💾 Saved ${relativePath}`);
}

/**
 * Update stats-alltime.json with a new week's results, preserving the
 * manually curated `championships` field.
 */
function updateAllTimeStats(existingStats, weeklyMatchup, teamNamesByKey) {
  const stats = { ...existingStats };

  for (const matchup of weeklyMatchup.matchups) {
    const teamKey = matchup.teamKey;
    const existing = stats[teamKey] || {
      teamName: teamNamesByKey[teamKey] || teamKey,
      allTimePoints: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      highestSingleWeekScore: matchup.score,
      lowestSingleWeekScore: matchup.score,
      championships: 0, // manually curated — only set here if truly new
    };

    stats[teamKey] = {
      ...existing,
      teamName: teamNamesByKey[teamKey] || existing.teamName,
      allTimePoints: existing.allTimePoints + matchup.score,
      wins: existing.wins + (matchup.result === "W" ? 1 : 0),
      losses: existing.losses + (matchup.result === "L" ? 1 : 0),
      ties: existing.ties + (matchup.result === "T" ? 1 : 0),
      highestSingleWeekScore: Math.max(
        existing.highestSingleWeekScore,
        matchup.score
      ),
      lowestSingleWeekScore: Math.min(
        existing.lowestSingleWeekScore,
        matchup.score
      ),
      championships: existing.championships, // never auto-modified
    };
  }

  return stats;
}

/**
 * Generate the weekly newsletter (recap, trends, upcoming matchups) using
 * OpenAI. Called server-side only, inside this script — never from client
 * code (see PRD.md and copilot-instructions.md).
 */
async function generateNewsletter(weeklyMatchup, teamNamesByKey) {
  const matchupSummary = weeklyMatchup.matchups
    .map(
      (m) =>
        `${teamNamesByKey[m.teamKey] || m.teamKey} ${m.score} - ${
          m.opponentScore
        } ${teamNamesByKey[m.opponentTeamKey] || m.opponentTeamKey} (${
          m.result
        })`
    )
    .join("\n");

  const prompt = `You are writing a short fantasy football weekly newsletter for a private league.
Here are this week's results:
${matchupSummary}

Write a JSON object with exactly these three string fields:
- "recap": a 2-3 sentence recap of the week's results and standout performances
- "trends": 2-3 sentences on trends and each team's strengths/weaknesses based on these results
- "upcomingMatchups": 1-2 sentences previewing next week's key matchups

Respond with ONLY the JSON object, no markdown formatting.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  const raw = completion.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "  ⚠️  Could not parse OpenAI newsletter response as JSON, using raw text as recap"
    );
    return {
      recap: raw,
      trends: "",
      upcomingMatchups: "",
    };
  }
}

/**
 * Update the newsletter index manifest with a new season/week entry
 */
function updateNewsletterIndex(season, week) {
  const index = loadJson("newsletters/index.json", []);
  const exists = index.some((e) => e.season === season && e.week === week);

  if (!exists) {
    index.push({ season, week });
  }

  saveJson("newsletters/index.json", index);
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting fantasy league data update...\n");
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  const accessToken = await getAccessToken();
  console.log("✅ Yahoo access token refreshed\n");

  const league = loadJson("league.json", null);
  const season = league?.season || String(new Date().getFullYear());
  const leagueKey = await resolveLeagueKey(accessToken, season);

  if (!leagueKey) {
    console.error(
      `❌ Could not resolve league_key for season ${season}. Update SEASON_LEAGUE_KEYS in this script and re-run.`
    );
    process.exit(1);
  }

  console.log(`📊 League: ${leagueKey} (season ${season})\n`);

  // NOTE: fetchLeagueMeta/fetchScoreboard/fetchTeams return Yahoo's native
  // nested JSON shape. Transforming that into this project's WeeklyMatchup /
  // TeamMeta schema (src/types/fantasy.ts) is intentionally left as
  // implementation work tied to the real league's response shape — verify
  // field paths against a live response before wiring this up for real data.
  const leagueMeta = await fetchLeagueMeta(accessToken, leagueKey);
  const teamsData = await fetchTeams(accessToken, leagueKey);

  console.log(
    "⚠️  Transform leagueMeta/teamsData into league.json's TeamMeta[] shape here."
  );
  console.log(
    "⚠️  Determine the last completed week from leagueMeta.current_week, then call fetchScoreboard() and transform into WeeklyMatchup."
  );

  // --- The following illustrates the intended flow once the transforms
  // --- above are implemented against real Yahoo response data:
  //
  // const currentWeek = /* parse from leagueMeta */;
  // const lastCompletedWeek = currentWeek - 1;
  // const scoreboard = await fetchScoreboard(accessToken, leagueKey, lastCompletedWeek);
  // const weeklyMatchup = transformScoreboard(scoreboard, season, lastCompletedWeek);
  // saveJson(`weekly/${season}-week${lastCompletedWeek}.json`, weeklyMatchup);
  //
  // const teamNamesByKey = /* from transformed league.json teams */;
  // const existingStats = loadJson("stats-alltime.json", {});
  // const updatedStats = updateAllTimeStats(existingStats, weeklyMatchup, teamNamesByKey);
  // saveJson("stats-alltime.json", updatedStats);
  //
  // const newsletter = await generateNewsletter(weeklyMatchup, teamNamesByKey);
  // saveJson(`newsletters/${season}-week${lastCompletedWeek}.json`, {
  //   season,
  //   week: lastCompletedWeek,
  //   generatedAt: new Date().toISOString(),
  //   ...newsletter,
  // });
  // updateNewsletterIndex(season, lastCompletedWeek);

  console.log("\n✅ Fantasy data update script completed (see notes above).");
}

main().catch((error) => {
  console.error("\n❌ Fatal error during fantasy data update:", error.message);
  process.exit(1);
});
