/**
 * Chart data transformation utilities
 * Converts JSON price data to formats compatible with TradingView lightweight-charts
 */

import { subYears, parseISO, isAfter, subMonths, subWeeks } from "date-fns";
import type { PriceDataPoint, EarningsData, TimeRange } from "@/types/dashboard";

/**
 * Transform price data point to candlestick format for lightweight-charts
 */
export interface CandlestickData {
  time: string; // Format: YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Transform price data point to line format for lightweight-charts
 */
export interface LineData {
  time: string; // Format: YYYY-MM-DD
  value: number;
}

/**
 * Transform price data point to volume format for lightweight-charts
 */
export interface VolumeData {
  time: string; // Format: YYYY-MM-DD
  value: number;
  color: string; // Green for up days, red for down days
}

/**
 * Convert PriceDataPoint to candlestick format
 */
export function toCandlestickData(
  data: PriceDataPoint[]
): CandlestickData[] {
  return data.map((point) => ({
    time: point.date,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
  }));
}

/**
 * Convert PriceDataPoint to line format (using close prices)
 */
export function toLineData(data: PriceDataPoint[]): LineData[] {
  return data.map((point) => ({
    time: point.date,
    value: point.close,
  }));
}

/**
 * Convert PriceDataPoint to volume format with color coding
 */
export function toVolumeData(data: PriceDataPoint[]): VolumeData[] {
  return data.map((point) => {
    const isUp = point.close >= point.open;
    return {
      time: point.date,
      value: point.volume,
      color: isUp
        ? "rgba(0, 150, 136, 0.5)"
        : "rgba(255, 82, 82, 0.5)",
    };
  });
}

/**
 * Filter price data by time range
 */
export function filterByTimeRange(
  data: PriceDataPoint[],
  range: TimeRange
): PriceDataPoint[] {
  if (data.length === 0) return [];

  // Sort data by date (oldest first)
  const sortedData = [...data].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Get the most recent date
  const latestDate = parseISO(sortedData[sortedData.length - 1].date);
  let cutoffDate: Date;

  switch (range) {
    case "1W":
      cutoffDate = subWeeks(latestDate, 1);
      break;
    case "1M":
      cutoffDate = subMonths(latestDate, 3);
      break;
    case "6M":
      cutoffDate = subMonths(latestDate, 6);
      break;
    case "1Y":
      cutoffDate = subYears(latestDate, 1);
      break;
    case "5Y":
      cutoffDate = subYears(latestDate, 5);
      break;
    case "MAX":
    default:
      return sortedData;
  }

  // Filter data to include only dates on or after cutoff
  return sortedData.filter((point) => {
    const pointDate = parseISO(point.date);
    return isAfter(pointDate, cutoffDate) || pointDate.getTime() === cutoffDate.getTime();
  });
}

/**
 * Get earnings dates for marker placement
 */
export function getEarningsDates(earnings: EarningsData[]): string[] {
  return earnings.map((e) => e.earningsDate).sort();
}

/**
 * Filter earnings dates by time range
 */
export function filterEarningsByTimeRange(
  earnings: EarningsData[],
  range: TimeRange,
  priceData: PriceDataPoint[]
): EarningsData[] {
  if (priceData.length === 0) return [];

  const sortedPriceData = [...priceData].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const latestDate = parseISO(sortedPriceData[sortedPriceData.length - 1].date);
  let cutoffDate: Date;

  switch (range) {
    case "1W":
      cutoffDate = subWeeks(latestDate, 1);
      break;
    case "1M":
      cutoffDate = subMonths(latestDate, 3);
      break;
    case "6M":
      cutoffDate = subMonths(latestDate, 6);
      break;
    case "1Y":
      cutoffDate = subYears(latestDate, 1);
      break;
    case "5Y":
      cutoffDate = subYears(latestDate, 5);
      break;
    case "MAX":
    default:
      return earnings;
  }

  return earnings.filter((e) => {
    const earningsDate = parseISO(e.earningsDate);
    return isAfter(earningsDate, cutoffDate) || earningsDate.getTime() === cutoffDate.getTime();
  });
}

