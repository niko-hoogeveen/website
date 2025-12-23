"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeriesPartialOptions, LineSeries } from "lightweight-charts";
import type { FundamentalDataPoint } from "@/types/dashboard";

interface MarginChartProps {
  marginData: FundamentalDataPoint[];
  height?: number;
}

/**
 * Operating Margin chart component
 * Displays quarterly operating margin as a line chart (percentage)
 */
export default function MarginChart({
  marginData,
  height = 350,
}: MarginChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter for quarterly data and sort by period
  const quarterlyData = marginData
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
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add line series for operating margin
    const marginSeries = chart.addSeries(LineSeries, {
      color: "#ffa726",
      lineWidth: 2,
      title: "Operating Margin (%)",
      priceFormat: {
        type: "price",
        precision: 1,
        minMove: 0.1,
      },
    } as LineSeriesPartialOptions);

    seriesRef.current = marginSeries;

    // Prepare data
    const chartData = quarterlyData.map((point) => {
      const [year, quarter] = point.period.split("-Q");
      const month = (parseInt(quarter) - 1) * 3 + 3;
      const date = `${year}-${month.toString().padStart(2, "0")}-01`;
      
      return {
        time: date,
        value: point.value, // Already a percentage
      };
    });

    marginSeries.setData(chartData);
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

  // Update data when marginData changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || isLoading) return;

    const quarterly = marginData
      .filter((d) => d.type === "quarterly")
      .sort((a, b) => a.period.localeCompare(b.period));

    const chartData = quarterly.map((point) => {
      const [year, quarter] = point.period.split("-Q");
      const month = (parseInt(quarter) - 1) * 3 + 3;
      const date = `${year}-${month.toString().padStart(2, "0")}-01`;
      
      return {
        time: date,
        value: point.value,
      };
    });

    seriesRef.current.setData(chartData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [marginData, isLoading]);

  if (quarterlyData.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">No margin data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
}

