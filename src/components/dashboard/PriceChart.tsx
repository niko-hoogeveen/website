"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeriesPartialOptions, LineSeries } from "lightweight-charts";
import type { PriceDataPoint, EarningsData, TimeRange } from "@/types/dashboard";
import {
  toLineData,
  filterByTimeRange,
} from "@/lib/dashboard/chartUtils";

interface PriceChartProps {
  priceData: PriceDataPoint[];
  earnings: EarningsData[];
  timeRange: TimeRange;
  height?: number;
}

/**
 * Price chart component using TradingView lightweight-charts
 * Displays candlestick chart with earnings date markers
 */
export default function PriceChart({
  priceData,
  earnings,
  timeRange,
  height = 400,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: "transparent" },
        textColor: "#d3d1d1",
      },
      grid: {
        vertLines: { color: "#2a2a2a" },
        horzLines: { color: "#2a2a2a" },
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
        vertLine: {
          width: 1,
          color: "#758696",
          style: 0,
          labelBackgroundColor: "#23262e",
        },
        horzLine: {
          width: 1,
          color: "#758696",
          style: 0,
          labelBackgroundColor: "#23262e",
        },
      },
      rightPriceScale: {
        borderColor: "#2a2a2a",
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series using the built-in series definition
    const lineSeriesInstance = chart.addSeries(LineSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    } as LineSeriesPartialOptions);

    seriesRef.current = lineSeriesInstance;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    setIsLoading(false);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [height]);

  // Update chart data when priceData or timeRange changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || isLoading) return;

    // Filter data by time range
    const filteredData = filterByTimeRange(priceData, timeRange);
    const candlestickData = toLineData(filteredData);

    // Set data
    seriesRef.current.setData(candlestickData);

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();

    // Earnings date markers
    // Note: Marker API implementation will be added in a future update
    // For now, earnings dates are available in the data but not visually marked
    // This can be enhanced with price line markers or custom overlays
  }, [priceData, earnings, timeRange, isLoading]);

  return (
    <div className="w-full">
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
}

