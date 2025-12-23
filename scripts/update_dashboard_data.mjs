#!/usr/bin/env node

/**
 * Dashboard Data Update Script
 *
 * This script updates stock price history and valuation metrics for the equity research dashboard.
 * It preserves manually curated data (earnings, fundamentals, DCF defaults).
 *
 * Data Sources:
 * - Financial Modeling Prep API (https://financialmodelingprep.com)
 *
 * What gets updated:
 * - Price history (daily OHLCV data)
 * - Valuation metrics (P/E, Forward P/E, EV/EBITDA, Price/FCF, PEG)
 * - Metadata (lastUpdated timestamp)
 *
 * What gets preserved:
 * - Earnings data (manually curated)
 * - Fundamentals (revenue, net income, operating margin - manually curated)
 * - DCF defaults (manually set)
 * - Research report URLs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TICKERS = ["NVDA", "META", "AMZN"];
const DATA_DIR = join(__dirname, "..", "public", "data");
// FMP API base URL (v3)
const API_BASE = "https://financialmodelingprep.com/stable";

// Get API key from environment
const API_KEY = process.env.FMP_API_KEY;
if (!API_KEY) {
  console.error("❌ Error: FMP_API_KEY environment variable is required");
  process.exit(1);
}

/**
 * Test API key validity by making a simple API call
 */
async function testApiKey() {
  try {
    // Use a simple endpoint that should work with free tier
    const testUrl = `${API_BASE}/quote?symbol=NVDA&apikey=${API_KEY}`;
    const response = await fetch(testUrl);
    const responseText = await response.text();

    if (!response.ok) {
      let errorMsg = `API Key Test Failed: HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData["Error Message"]) {
          errorMsg += ` - ${errorData["Error Message"]}`;
        }
      } catch (e) {
        if (responseText && responseText.length < 200) {
          errorMsg += ` - ${responseText}`;
        }
      }
      throw new Error(errorMsg);
    }

    console.log("✅ API key validated successfully\n");
    return true;
  } catch (error) {
    console.error(`❌ API Key Validation Failed: ${error.message}`);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Verify your API key is correct");
    console.error("   2. Check if your API key has remaining calls");
    console.error("   3. Ensure your API key is active in FMP dashboard");
    console.error("   4. Free tier: 250 calls/day limit");
    throw error;
  }
}

/**
 * Fetch historical price data from FMP API
 * Returns daily OHLCV data with price change calculations
 */
async function fetchPriceHistory(ticker) {
  try {
    // FMP API endpoint - historical EOD (End of Day) prices
    const url = `${API_BASE}/historical-price-eod/full?symbol=${ticker}&apikey=${API_KEY}`;
    console.log(`  📊 Fetching price history for ${ticker}...`);

    const response = await fetch(url);
    const responseText = await response.text();

    if (!response.ok) {
      // Parse error response for better debugging
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = "";

      try {
        const errorData = JSON.parse(responseText);
        if (errorData["Error Message"]) {
          errorDetails = errorData["Error Message"];
        } else if (errorData.message) {
          errorDetails = errorData.message;
        } else if (typeof errorData === "string") {
          errorDetails = errorData;
        }
      } catch (e) {
        if (responseText && responseText.length < 500) {
          errorDetails = responseText;
        }
      }

      if (errorDetails) {
        errorMsg += ` - ${errorDetails}`;
      }

      if (response.status === 403) {
        errorMsg +=
          "\n  💡 Tip: Check if your API key is valid and has access to this endpoint.";
        errorMsg +=
          "\n  💡 Free tier may have limited access to historical data endpoints.";
      } else if (response.status === 401) {
        errorMsg += "\n  💡 Tip: Your API key may be invalid or expired.";
      }

      throw new Error(errorMsg);
    }

    const data = JSON.parse(responseText);

    // FMP API returns data in different formats - handle both
    let historicalData = [];

    if (Array.isArray(data)) {
      // Direct array response
      historicalData = data;
    } else if (data.historical && Array.isArray(data.historical)) {
      // Nested historical property
      historicalData = data.historical;
    } else if (data.data && Array.isArray(data.data)) {
      // Nested data property
      historicalData = data.data;
    } else {
      throw new Error(
        "Invalid API response: could not find historical data array"
      );
    }

    if (historicalData.length === 0) {
      throw new Error("No historical data returned from API");
    }

    // Transform FMP format to our format
    // Calculate price change (day-over-day) as we process
    // FMP typically returns newest first, we want oldest first for easier merging
    const sortedData = [...historicalData].sort((a, b) => {
      const dateA = a.date || a.Date || a.tradingDay;
      const dateB = b.date || b.Date || b.tradingDay;
      return dateA.localeCompare(dateB);
    });

    const priceData = sortedData
      .map((day) => {
        // Handle different field name variations from FMP API
        const date = day.date || day.Date || day.tradingDay;
        const open = parseFloat(day.open || day.Open || day.openPrice);
        const high = parseFloat(day.high || day.High || day.highPrice);
        const low = parseFloat(day.low || day.Low || day.lowPrice);
        const close = parseFloat(
          day.close || day.Close || day.closePrice || day.price
        );
        const volume = parseInt(
          day.volume || day.Volume || day.tradedVolume || 0,
          10
        );

        return {
          date: date,
          open: open,
          high: high,
          low: low,
          close: close,
          volume: volume,
        };
      })
      .filter(
        (day) =>
          // Validate data points
          day.date && !isNaN(day.open) && !isNaN(day.close) && day.volume >= 0 // Allow 0 volume (some days may have no trading)
      );

    console.log(`  ✅ Fetched ${priceData.length} days of price data`);
    return priceData;
  } catch (error) {
    console.error(
      `  ❌ Error fetching price history for ${ticker}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Helper function to extract a value from an object by trying multiple field names
 */
function extractField(obj, possibleNames) {
  if (!obj) return null;
  for (const name of possibleNames) {
    if (obj[name] !== undefined && obj[name] !== null && !isNaN(obj[name])) {
      return obj[name];
    }
  }
  return null;
}

/**
 * Fetch key metrics (valuation ratios) from FMP API
 * Uses both key-metrics and ratios endpoints for comprehensive data
 */
async function fetchKeyMetrics(ticker) {
  try {
    console.log(`  📈 Fetching key metrics and ratios for ${ticker}...`);

      // Fetch both key metrics and ratios in parallel
      // Using TTM (Trailing Twelve Months) endpoints for most current data
      const [metricsResponse, ratiosResponse] = await Promise.all([
        fetch(`${API_BASE}/key-metrics-ttm?symbol=${ticker}&apikey=${API_KEY}`).catch(
          () => null
        ),
        fetch(`${API_BASE}/ratios-ttm?symbol=${ticker}&apikey=${API_KEY}`).catch(
          () => null
        ),
      ]);

    let metrics = null;
    let ratios = null;

    // Parse key metrics
    if (metricsResponse && metricsResponse.ok) {
      try {
        const metricsData = await metricsResponse.json();
        if (Array.isArray(metricsData) && metricsData.length > 0) {
          metrics = metricsData[0]; // Most recent
          // Debug: log available fields (first 10 keys)
          const availableFields = Object.keys(metrics).slice(0, 20);
          console.log(
            `  🔍 Key metrics fields available: ${availableFields.join(
              ", "
            )}...`
          );
        }
      } catch (e) {
        console.log(`  ⚠️  Could not parse key metrics response: ${e.message}`);
      }
    } else if (metricsResponse) {
      console.log(
        `  ⚠️  Key metrics API returned status: ${metricsResponse.status}`
      );
    }

    // Parse ratios
    if (ratiosResponse && ratiosResponse.ok) {
      try {
        const ratiosData = await ratiosResponse.json();
        if (Array.isArray(ratiosData) && ratiosData.length > 0) {
          ratios = ratiosData[0]; // Most recent
          // Debug: log available fields (first 10 keys)
          const availableFields = Object.keys(ratios).slice(0, 10);
          console.log(
            `  🔍 Ratios fields available: ${availableFields.join(", ")}...`
          );
        }
      } catch (e) {
        console.log(`  ⚠️  Could not parse ratios response: ${e.message}`);
      }
    } else if (ratiosResponse) {
      console.log(`  ⚠️  Ratios API returned status: ${ratiosResponse.status}`);
    }

      // Extract valuation metrics from both sources
      // Priority: ratios-ttm for most metrics, key-metrics-ttm for TTM-specific metrics
      // Try multiple field name variations to match FMP API response format
      const valuation = {
        pe: null,
        forwardPeGrowth: null, // Note: This is growth rate, not forward P/E
        evEbitda: null,
        priceToFcf: null,
        peg: null,
        priceToBook: null,
        priceToSales: null,
        evToSales: null,
        debtToEquity: null,
        currentRatio: null,
        quickRatio: null,
        returnOnEquity: null,
        returnOnAssets: null,
        operatingMargin: null,
        netProfitMargin: null,
        asOfDate: new Date().toISOString().split("T")[0],
      };

      // Extract from key-metrics-ttm endpoint (TTM = Trailing Twelve Months)
      if (metrics) {
        // EV/EBITDA from key-metrics-ttm
        valuation.evEbitda = extractField(metrics, [
          "evToEBITDATTM",
        ]);

        // Price to Free Cash Flow (EV to FCF from key-metrics)
        valuation.priceToFcf = extractField(metrics, [
          "evToFreeCashFlowTTM",
        ]);

        // Current Ratio
        valuation.currentRatio = extractField(metrics, [
          "currentRatioTTM",
        ]);

        // Return on Equity
        valuation.returnOnEquity = extractField(metrics, [
          "returnOnEquityTTM",
        ]);

        // Return on Assets
        valuation.returnOnAssets = extractField(metrics, [
          "returnOnAssetsTTM",
        ]);

        // EV/Sales (alternative valuation metric)
        valuation.evToSales = extractField(metrics, [
          "evToSalesTTM",
        ]);
      }

      // Extract from ratios-ttm endpoint (primary source for most ratios)
      if (ratios) {
        // P/E Ratio (most important valuation metric)
        valuation.pe = extractField(ratios, [
          "priceToEarningsRatioTTM",
        ]);

        // PEG Ratio (Price/Earnings to Growth)
        valuation.peg = extractField(ratios, [
          "priceToEarningsGrowthRatioTTM",
        ]);

        // Forward P/E Growth (note: this is growth rate, not forward P/E itself)
        valuation.forwardPeGrowth = extractField(ratios, [
          "forwardPriceToEarningsGrowthRatioTTM",
        ]);

        // EV/EBITDA (fallback from ratios-ttm if not found in key-metrics)
        if (!valuation.evEbitda) {
          valuation.evEbitda = extractField(ratios, [
            "enterpriseValueMultipleTTM",
          ]);
        }

        // Price to Book
        valuation.priceToBook = extractField(ratios, [
          "priceToBookRatioTTM",
        ]);

        // Price to Sales
        valuation.priceToSales = extractField(ratios, [
          "priceToSalesRatioTTM",
        ]);

        // Price to Free Cash Flow (fallback from ratios-ttm if not found in key-metrics)
        if (!valuation.priceToFcf) {
          valuation.priceToFcf = extractField(ratios, [
            "priceToFreeCashFlowRatioTTM",
          ]);
        }

        // Debt to Equity
        valuation.debtToEquity = extractField(ratios, [
          "debtToEquityRatioTTM",
        ]);

        // Current Ratio (fallback from ratios-ttm if not found in key-metrics)
        if (!valuation.currentRatio) {
          valuation.currentRatio = extractField(ratios, [
            "currentRatioTTM",
          ]);
        }

        // Quick Ratio (liquidity metric)
        valuation.quickRatio = extractField(ratios, [
          "quickRatioTTM",
        ]);

        // Operating Profit Margin
        valuation.operatingMargin = extractField(ratios, [
          "operatingProfitMarginTTM",
        ]);

        // Net Profit Margin
        valuation.netProfitMargin = extractField(ratios, [
          "netProfitMarginTTM",
        ]);
      }

    // Convert null/undefined to null and ensure numbers
    Object.keys(valuation).forEach((key) => {
      if (key !== "asOfDate") {
        const value = valuation[key];
        if (value === null || value === undefined || isNaN(value)) {
          valuation[key] = null;
        } else {
          valuation[key] = parseFloat(value);
        }
      }
    });

    // Validate that we have at least some data
    const hasData = Object.keys(valuation).some(
      (key) => key !== "asOfDate" && valuation[key] !== null
    );

    if (!hasData) {
      console.log(
        `  ⚠️  No valuation metrics found, but continuing with null values`
      );
      // Don't throw - allow null values to be saved
    }

    // Log summary of extracted metrics
    const extractedMetrics = Object.entries(valuation)
      .filter(([key, value]) => key !== "asOfDate" && value !== null)
      .map(([key]) => key)
      .join(", ");

    if (extractedMetrics) {
      console.log(`  ✅ Fetched valuation metrics: ${extractedMetrics}`);
    } else {
      console.log(`  ⚠️  No valuation metrics extracted (all null)`);
    }

    return valuation;
  } catch (error) {
    console.error(
      `  ❌ Error fetching key metrics for ${ticker}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Fetch company profile to get company name
 */
async function fetchCompanyProfile(ticker) {
  try {
    // Use profile endpoint instead of search-symbol for more reliable company name
    const url = `${API_BASE}/profile?symbol=${ticker}&apikey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null; // Non-critical, use existing name
    }

    const data = await response.json();

    // Handle both array and object responses
    if (Array.isArray(data) && data.length > 0) {
      return data[0].companyName || data[0].name || null;
    } else if (data && typeof data === "object") {
      return data.companyName || data.name || null;
    }

    return null;
  } catch (error) {
    console.log(
      `  ⚠️  Could not fetch company profile for ${ticker} (using existing name)`
    );
    return null;
  }
}

/**
 * Overwrite price history with new data from API
 * Strategy: Replace all existing price data with fresh data from API to avoid duplicates
 */
function overwritePriceHistory(newData) {
  // Sort by date to ensure chronological order (oldest first)
  const sorted = [...newData].sort((a, b) => a.date.localeCompare(b.date));

  console.log(
    `  📝 Overwriting with ${sorted.length} days of price data from API`
  );
  return sorted;
}

/**
 * Load existing JSON file
 */
function loadExistingData(ticker) {
  const filePath = join(DATA_DIR, `${ticker}.json`);

  if (!existsSync(filePath)) {
    console.log(
      `  ⚠️  No existing file found for ${ticker}, will create new one`
    );
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `  ❌ Error reading existing file for ${ticker}:`,
      error.message
    );
    return null;
  }
}

/**
 * Save updated JSON file
 */
function saveData(ticker, data) {
  const filePath = join(DATA_DIR, `${ticker}.json`);

  try {
    // Pretty print JSON with 2-space indentation
    const json = JSON.stringify(data, null, 2);
    writeFileSync(filePath, json, "utf-8");
    console.log(`  💾 Saved updated data to ${filePath}`);
  } catch (error) {
    console.error(`  ❌ Error saving file for ${ticker}:`, error.message);
    throw error;
  }
}

/**
 * Update data for a single ticker
 */
async function updateTicker(ticker) {
  console.log(`\n🔄 Processing ${ticker}...`);

  // Load existing data
  const existing = loadExistingData(ticker);

  // Fetch new data from API
  const [priceHistory, valuation, companyName] = await Promise.all([
    fetchPriceHistory(ticker),
    fetchKeyMetrics(ticker).catch(() => null), // Don't fail if metrics unavailable
    fetchCompanyProfile(ticker).catch(() => null),
  ]);

  // Overwrite price history with fresh data from API
  const updatedPriceHistory = overwritePriceHistory(priceHistory);

  // Build updated data object
  const updated = {
    metadata: {
      ticker: ticker,
      companyName:
        companyName ||
        existing?.metadata?.companyName ||
        `${ticker} Corporation`,
      lastUpdated: new Date().toISOString().split("T")[0],
      researchReportUrl: existing?.metadata?.researchReportUrl,
    },
    priceHistory: updatedPriceHistory,
    earnings: existing?.earnings || [], // Preserve manual earnings data
    fundamentals: existing?.fundamentals || {
      // Preserve manual fundamentals
      revenue: [],
      netIncome: [],
      operatingMargin: [],
    },
     valuation: valuation ||
       existing?.valuation || {
         // Use new or fallback to existing
         pe: null,
         forwardPeGrowth: null,
         evEbitda: null,
         priceToFcf: null,
         peg: null,
         priceToBook: null,
         priceToSales: null,
         evToSales: null,
         debtToEquity: null,
         currentRatio: null,
         quickRatio: null,
         returnOnEquity: null,
         returnOnAssets: null,
         operatingMargin: null,
         netProfitMargin: null,
         asOfDate: new Date().toISOString().split("T")[0],
       },
    dcfDefaults: existing?.dcfDefaults, // Preserve manual DCF defaults
  };

  // Save updated data
  saveData(ticker, updated);

  console.log(`  ✅ Successfully updated ${ticker}`);
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting dashboard data update...\n");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`📊 Tickers: ${TICKERS.join(", ")}\n`);

  // Test API key first
  await testApiKey();

  const errors = [];

  for (const ticker of TICKERS) {
    try {
      await updateTicker(ticker);

      // Add a small delay between API calls to be respectful
      if (ticker !== TICKERS[TICKERS.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`\n❌ Failed to update ${ticker}:`, error.message);
      errors.push({ ticker, error: error.message });
    }
  }

  console.log("\n" + "=".repeat(50));
  if (errors.length === 0) {
    console.log("✅ All tickers updated successfully!");
    process.exit(0);
  } else {
    console.log(`⚠️  Completed with ${errors.length} error(s):`);
    errors.forEach(({ ticker, error }) => {
      console.log(`   - ${ticker}: ${error}`);
    });
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
