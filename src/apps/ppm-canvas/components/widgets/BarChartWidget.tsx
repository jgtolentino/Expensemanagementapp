/**
 * IPAI PPM Clarity - Bar Chart Widget
 * Displays data as horizontal bar chart
 */

import React, { useMemo } from 'react';
import { useWidgetData } from '../../hooks/useCanvas';
import { RefreshCw } from 'lucide-react';
import type { WidgetConfig, BarChartData } from '../../types/canvas';

interface BarChartWidgetProps {
  config: WidgetConfig;
  searchText?: string;
}

export function BarChartWidget({ config, searchText }: BarChartWidgetProps) {
  const { data, loading, error, refresh } = useWidgetData(config.id);

  // Calculate bar widths
  const bars = useMemo(() => {
    if (!data || data.type !== 'bar') return [];

    const barData = data as BarChartData;
    const maxValue = Math.max(...barData.data.map((item) => item.value), 1);

    return barData.data.map((item, index) => ({
      ...item,
      percentage: (item.value / maxValue) * 100,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data || data.type !== 'bar') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <span className="text-red-500 text-sm mb-2">{error || 'No data'}</span>
        <button
          onClick={refresh}
          className="text-xs text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const barData = data as BarChartData;

  if (barData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {bars.map((bar, index) => (
        <div key={index} className="flex items-center gap-3">
          {/* Label */}
          <div
            className="w-20 text-sm text-gray-700 truncate flex-shrink-0"
            title={bar.name}
          >
            {bar.name}
          </div>

          {/* Bar container */}
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-300"
              style={{
                width: `${bar.percentage}%`,
                backgroundColor: config.color,
              }}
            />
          </div>

          {/* Value */}
          <div className="w-12 text-sm font-medium text-gray-700 text-right">
            {new Intl.NumberFormat().format(bar.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarChartWidget;
