/**
 * Number and date formatting utilities for the dashboard
 */

/**
 * Format a number as currency (millions)
 */
export function formatMillions(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(0)}M`;
}

/**
 * Format a percentage with sign
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Get color class for positive/negative values
 */
export function getValueColorClass(value: number): string {
  if (value > 0) {
    return "text-green-400";
  } else if (value < 0) {
    return "text-red-400";
  }
  return "text-gray-400";
}

