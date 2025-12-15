/**
 * IPAI PPM Clarity - Pie Chart Widget
 * Displays data as a pie/donut chart
 */

import React, { useMemo } from 'react';
import { useWidgetData } from '../../hooks/useCanvas';
import { RefreshCw } from 'lucide-react';
import type { WidgetConfig, PieChartData, ChartDataItem } from '../../types/canvas';

interface PieChartWidgetProps {
  config: WidgetConfig;
  searchText?: string;
}

// Color palette for pie segments
const COLORS = [
  '#0078D4',
  '#4B38B3',
  '#107C10',
  '#D83B01',
  '#F2C811',
  '#00B294',
  '#8764B8',
  '#038387',
  '#CA5010',
  '#6B69D6',
];

export function PieChartWidget({ config, searchText }: PieChartWidgetProps) {
  const { data, loading, error, refresh } = useWidgetData(config.id);

  // Calculate pie segments
  const segments = useMemo(() => {
    if (!data || data.type !== 'pie') return [];

    const pieData = data as PieChartData;
    const total = pieData.data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    let startAngle = 0;
    return pieData.data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...item,
        percentage,
        startAngle,
        endAngle: startAngle + angle,
        color: COLORS[index % COLORS.length],
      };
      startAngle += angle;
      return segment;
    });
  }, [data]);

  // Generate SVG path for pie segment
  const getArcPath = (
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data || data.type !== 'pie') {
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

  const pieData = data as PieChartData;

  if (pieData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 5;

  return (
    <div className="flex h-full gap-4">
      {/* Pie Chart */}
      <div className="flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => (
            <path
              key={index}
              d={getArcPath(cx, cy, radius, segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="transition-opacity hover:opacity-80 cursor-pointer"
            >
              <title>{`${segment.name}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
            </path>
          ))}
          {/* Center hole for donut effect */}
          <circle cx={cx} cy={cy} r={radius * 0.5} fill="white" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 truncate flex-1" title={segment.name}>
                {segment.name}
              </span>
              <span className="text-gray-500 font-medium">
                {segment.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PieChartWidget;
