"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeriesPartialOptions, LineSeries } from "lightweight-charts";
import type { EarningsData } from "@/types/dashboard";

interface EarningsChartProps {
  earnings: EarningsData[];
  height?: number;
}

/**
 * Earnings chart component
 * Displays EPS Actual vs Estimate over time using lightweight-charts
 */
export default function EarningsChart({
  earnings,
  height = 400,
}: EarningsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const actualSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const estimateSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sort earnings by quarter (oldest first for chart)
  const sortedEarnings = [...earnings].sort((a, b) =>
    a.quarter.localeCompare(b.quarter)
  );

  useEffect(() => {
    if (!chartContainerRef.current || sortedEarnings.length === 0) return;

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

    // Add line series for EPS Actual
    const actualSeries = chart.addSeries(LineSeries, {
      color: "#26a69a",
      lineWidth: 2,
      title: "EPS Actual",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    } as LineSeriesPartialOptions);

    // Add line series for EPS Estimate
    const estimateSeries = chart.addSeries(LineSeries, {
      color: "#ef5350",
      lineWidth: 2,
      lineStyle: 1, // Dashed line
      title: "EPS Estimate",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    } as LineSeriesPartialOptions);

    actualSeriesRef.current = actualSeries;
    estimateSeriesRef.current = estimateSeries;

    // Prepare data
    const actualData = sortedEarnings.map((earning) => ({
      time: earning.earningsDate,
      value: earning.epsActual,
    }));

    const estimateData = sortedEarnings.map((earning) => ({
      time: earning.earningsDate,
      value: earning.epsEstimate,
    }));

    // Set data
    actualSeries.setData(actualData);
    estimateSeries.setData(estimateData);

    // Fit content
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
  }, [height, sortedEarnings]);

  // Update data when earnings change
  useEffect(() => {
    if (!actualSeriesRef.current || !estimateSeriesRef.current || isLoading) return;

    const sorted = [...earnings].sort((a, b) => a.quarter.localeCompare(b.quarter));

    const actualData = sorted.map((earning) => ({
      time: earning.earningsDate,
      value: earning.epsActual,
    }));

    const estimateData = sorted.map((earning) => ({
      time: earning.earningsDate,
      value: earning.epsEstimate,
    }));

    actualSeriesRef.current.setData(actualData);
    estimateSeriesRef.current.setData(estimateData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [earnings, isLoading]);

  if (sortedEarnings.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">No earnings data available for chart</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
}

