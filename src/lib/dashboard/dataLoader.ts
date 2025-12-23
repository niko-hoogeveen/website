/**
 * Data loading utilities for the Equity Research Dashboard
 * 
 * Since we're using static export, we load data from JSON files in /public/data/
 * using fetch in client components.
 */

import type { TickerData, TickerSymbol } from "@/types/dashboard";

/**
 * Load ticker data from static JSON file
 * 
 * @param ticker - The ticker symbol (NVDA, META, or GOOG)
 * @returns Promise resolving to TickerData or null if ticker not found
 */
export async function loadTickerData(ticker: TickerSymbol): Promise<TickerData | null> {
  try {
    const response = await fetch(`/data/${ticker}.json`);
    
    if (!response.ok) {
      console.error(`Failed to load data for ${ticker}: ${response.statusText}`);
      return null;
    }
    
    const data: TickerData = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get all available ticker symbols
 */
export function getAvailableTickers(): TickerSymbol[] {
  return ["NVDA", "META", "GOOG"];
}

/**
 * Validate if a string is a valid ticker symbol
 */
export function isValidTicker(ticker: string): ticker is TickerSymbol {
  return getAvailableTickers().includes(ticker as TickerSymbol);
}

