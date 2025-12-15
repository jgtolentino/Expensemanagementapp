/**
 * IPAI PPM Clarity - Widget Palette Component
 * Displays available widget types for adding to the canvas
 */

import React from 'react';
import {
  Hash,
  PieChart,
  BarChart3,
  Table,
  CircleDot,
} from 'lucide-react';
import type { WidgetType } from '../../types/canvas';

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
  disabledTypes: WidgetType[];
}

const widgetTypes: Array<{
  type: WidgetType;
  label: string;
  icon: React.ReactNode;
  description: string;
  colSpan: number;
}> = [
  {
    type: 'number_tile',
    label: 'Number Tile',
    icon: <Hash className="w-5 h-5" />,
    description: 'Display a single metric value',
    colSpan: 1,
  },
  {
    type: 'progress_ring',
    label: 'Progress Ring',
    icon: <CircleDot className="w-5 h-5" />,
    description: 'Show progress as a circular gauge',
    colSpan: 1,
  },
  {
    type: 'pie',
    label: 'Pie Chart',
    icon: <PieChart className="w-5 h-5" />,
    description: 'Visualize proportional data',
    colSpan: 2,
  },
  {
    type: 'bar',
    label: 'Bar Chart',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Compare values across categories',
    colSpan: 2,
  },
  {
    type: 'table',
    label: 'Table',
    icon: <Table className="w-5 h-5" />,
    description: 'Display detailed data in rows',
    colSpan: 2,
  },
];

export function WidgetPalette({ onAddWidget, disabledTypes }: WidgetPaletteProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Add Widget:</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        {widgetTypes.map((widget) => {
          const isDisabled = disabledTypes.includes(widget.type);

          return (
            <button
              key={widget.type}
              onClick={() => !isDisabled && onAddWidget(widget.type)}
              disabled={isDisabled}
              className={`
                flex items-center gap-3 px-4 py-3 border rounded-lg
                transition-all duration-150
                ${
                  isDisabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                }
              `}
              title={isDisabled ? 'Maximum widgets reached' : widget.description}
            >
              <div
                className={`
                  p-2 rounded-lg
                  ${isDisabled ? 'bg-gray-200' : 'bg-blue-100 text-blue-600'}
                `}
              >
                {widget.icon}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{widget.label}</div>
                <div className="text-xs text-gray-500">
                  {widget.colSpan === 1 ? '1 column' : '2 columns'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Limits Info */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span>
          Max 10 total widgets per canvas
        </span>
        <span>•</span>
        <span>
          Max 7 table widgets
        </span>
      </div>
    </div>
  );
}

export default WidgetPalette;
