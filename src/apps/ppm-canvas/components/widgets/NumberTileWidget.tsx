/**
 * IPAI PPM Clarity - Number Tile Widget
 * Displays a single numeric metric value
 */

import React from 'react';
import { useWidgetData } from '../../hooks/useCanvas';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import type { WidgetConfig, NumberTileData } from '../../types/canvas';

interface NumberTileWidgetProps {
  config: WidgetConfig;
  searchText?: string;
}

export function NumberTileWidget({ config, searchText }: NumberTileWidgetProps) {
  const { data, loading, error, refresh } = useWidgetData(config.id);

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'hours':
        return `${Math.round(value)}h`;
      default:
        return new Intl.NumberFormat().format(Math.round(value));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data || data.type !== 'number_tile') {
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

  const tileData = data as NumberTileData;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div
        className="text-4xl font-bold"
        style={{ color: config.color }}
      >
        {formatValue(tileData.value, tileData.format)}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        {config.operation === 'count' ? 'Total' : config.operation}
      </div>
    </div>
  );
}

export default NumberTileWidget;
