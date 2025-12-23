"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, HistogramSeriesPartialOptions, HistogramSeries } from "lightweight-charts";
import type { FundamentalDataPoint } from "@/types/dashboard";

interface NetIncomeChartProps {
  netIncomeData: FundamentalDataPoint[];
  height?: number;
}

/**
 * Net Income chart component
 * Displays quarterly net income as a bar chart (handles negative values)
 */
export default function NetIncomeChart({
  netIncomeData,
  height = 350,
}: NetIncomeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter for quarterly data and sort by period
  const quarterlyData = netIncomeData
    .filter((d) => d.type === "quarterly")
    .sort((a, b) => a.period.localeCompare(b.period));

  useEffect(() => {
    if (!chartContainerRef.current || quarterlyData.length === 0) {
      setIsLoading(false);
      return;
    }

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
        mode: 1,
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
        entireTextOnly: false,
        autoScale: true,
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add histogram (bar) series for net income
    // Use different colors for positive/negative values
    const netIncomeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => {
          // Convert from millions to billions and format
          const absPrice = Math.abs(price);
          const billions = absPrice / 1000;
          const sign = price >= 0 ? "" : "-";
          
          if (billions >= 1) {
            return `${sign}$${billions.toFixed(1)}B`;
          } else {
            return `${sign}$${(billions * 1000).toFixed(0)}M`;
          }
        },
        tickmarksFormatter: (prices: readonly number[]) => {
          // Format Y-axis tick marks
          return prices.map((price) => {
            const absPrice = Math.abs(price);
            const billions = absPrice / 1000;
            const sign = price >= 0 ? "" : "-";
            
            if (billions >= 1) {
              return `${sign}$${billions.toFixed(1)}B`;
            } else {
              return `${sign}$${(billions * 1000).toFixed(0)}M`;
            }
          });
        },
        minMove: 0.1,
      },
      priceLineVisible: false,
      lastValueVisible: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0,
      },
    } as HistogramSeriesPartialOptions);

    seriesRef.current = netIncomeSeries;

    // Prepare data with color coding for positive/negative
    const chartData = quarterlyData.map((point) => {
      const [year, quarter] = point.period.split("-Q");
      const month = (parseInt(quarter) - 1) * 3 + 3;
      const date = `${year}-${month.toString().padStart(2, "0")}-01`;
      
      return {
        time: date,
        value: point.value,
        color: point.value >= 0 ? "#26a69a" : "#ef5350", // Green for profit, red for loss
      };
    });

    netIncomeSeries.setData(chartData);
    chart.timeScale().fitContent();

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
  }, [height, quarterlyData]);

  // Update data when netIncomeData changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || isLoading) return;

    const quarterly = netIncomeData
      .filter((d) => d.type === "quarterly")
      .sort((a, b) => a.period.localeCompare(b.period));

    const chartData = quarterly.map((point) => {
      const [year, quarter] = point.period.split("-Q");
      const month = (parseInt(quarter) - 1) * 3 + 3;
      const date = `${year}-${month.toString().padStart(2, "0")}-01`;
      
      return {
        time: date,
        value: point.value,
        color: point.value >= 0 ? "#26a69a" : "#ef5350",
      };
    });

    seriesRef.current.setData(chartData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [netIncomeData, isLoading]);

  if (quarterlyData.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">No net income data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
}

