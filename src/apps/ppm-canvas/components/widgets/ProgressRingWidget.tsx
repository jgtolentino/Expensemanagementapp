/**
 * IPAI PPM Clarity - Progress Ring Widget
 * Displays progress as a circular gauge/ring
 */

import React from 'react';
import { useWidgetData } from '../../hooks/useCanvas';
import { RefreshCw } from 'lucide-react';
import type { WidgetConfig, ProgressRingData } from '../../types/canvas';

interface ProgressRingWidgetProps {
  config: WidgetConfig;
  searchText?: string;
}

export function ProgressRingWidget({ config, searchText }: ProgressRingWidgetProps) {
  const { data, loading, error, refresh } = useWidgetData(config.id);

  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data || data.type !== 'progress_ring') {
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

  const ringData = data as ProgressRingData;
  const percentage = Math.min(100, Math.max(0, ringData.percentage));
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold"
            style={{ color: config.color }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        {ringData.value.toFixed(1)} / {ringData.target}
      </div>
    </div>
  );
}

export default ProgressRingWidget;
