"use client";

import type { TimeRange } from "@/types/dashboard";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

/**
 * Time range selector component
 * Provides buttons for selecting chart time ranges: 1Y, 3Y, 5Y, MAX
 */
export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
    { value: "5Y", label: "5Y" },
    { value: "MAX", label: "MAX" },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedRange === range.value
              ? "bg-gray-700 text-white border border-gray-600"
              : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

