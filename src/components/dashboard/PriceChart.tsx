"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeriesPartialOptions, LineSeries, CandlestickSeries, CandlestickSeriesPartialOptions } from "lightweight-charts";
import type { PriceDataPoint, TimeRange } from "@/types/dashboard";
import {
  toLineData,
  toCandlestickData,
  filterByTimeRange,
} from "@/lib/dashboard/chartUtils";

interface PriceChartProps {
  priceData: PriceDataPoint[];
  timeRange: TimeRange;
  height?: number;
}

/**
 * Price chart component using TradingView lightweight-charts
 * Displays candlestick chart with earnings date markers
 */
export default function PriceChart({
  priceData,
  timeRange,
  height = 400,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | ISeriesApi<"Candlestick"> | null>(null);
  const currentSeriesTypeRef = useRef<"line" | "candlestick" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");

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

    // Initial series will be added in the effect that handles chartType

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

  // Handle chart type changes and data updates
  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // Filter data by time range
    const filteredData = filterByTimeRange(priceData, timeRange);

    // If series exists and chart type has changed, remove it to recreate
    if (seriesRef.current && currentSeriesTypeRef.current !== chartType) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
      currentSeriesTypeRef.current = null;
    }

    // Create series if it doesn't exist
    if (!seriesRef.current) {
      if (chartType === "line") {
        const lineSeries = chartRef.current.addSeries(LineSeries, {
          color: "#3b82f6",
          lineWidth: 2,
          priceFormat: {
            type: "price",
            precision: 2,
            minMove: 0.01,
          },
        } as LineSeriesPartialOptions);
        seriesRef.current = lineSeries;
        currentSeriesTypeRef.current = "line";
      } else {
        const candlestickSeries = chartRef.current.addSeries(CandlestickSeries, {
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
        } as CandlestickSeriesPartialOptions);
        seriesRef.current = candlestickSeries;
        currentSeriesTypeRef.current = "candlestick";
      }
    }

    // Update data based on current chart type
    if (chartType === "line") {
      const lineData = toLineData(filteredData);
      (seriesRef.current as ISeriesApi<"Line">).setData(lineData);
    } else {
      const candlestickData = toCandlestickData(filteredData);
      (seriesRef.current as ISeriesApi<"Candlestick">).setData(candlestickData);
    }

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();

    // Earnings date markers
    // Note: Marker API implementation will be added in a future update
    // For now, earnings dates are available in the data but not visually marked
    // This can be enhanced with price line markers or custom overlays
  }, [chartType, priceData, timeRange, isLoading]);

  return (
    <div className="w-full relative">
      {/* Toggle button in top left */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-1">
        <button
          onClick={() => setChartType("line")}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
            chartType === "line"
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
          title="Line Chart"
        >
          Line
        </button>
        <button
          onClick={() => setChartType("candlestick")}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
            chartType === "candlestick"
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
          title="Candlestick Chart"
        >
          Candles
        </button>
      </div>
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
}

