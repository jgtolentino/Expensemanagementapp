/**
 * IPAI PPM Clarity - Canvas Grid Component
 * Grid layout system for positioning widgets
 */

import React, { useMemo } from 'react';
import { NumberTileWidget } from '../widgets/NumberTileWidget';
import { ProgressRingWidget } from '../widgets/ProgressRingWidget';
import { PieChartWidget } from '../widgets/PieChartWidget';
import { BarChartWidget } from '../widgets/BarChartWidget';
import { TableWidget } from '../widgets/TableWidget';
import { Pencil, X, GripVertical } from 'lucide-react';
import type { WidgetConfig } from '../../types/canvas';

interface CanvasGridProps {
  widgets: WidgetConfig[];
  layoutColumns: number;
  configMode: boolean;
  searchText: string;
  onWidgetMove: (widgetId: number, x: number, y: number) => void;
  onWidgetEdit: (widget: WidgetConfig) => void;
  onWidgetDelete: (widgetId: number) => void;
}

export function CanvasGrid({
  widgets,
  layoutColumns,
  configMode,
  searchText,
  onWidgetMove,
  onWidgetEdit,
  onWidgetDelete,
}: CanvasGridProps) {
  // Sort widgets by position
  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => {
      if (a.layout.y !== b.layout.y) {
        return a.layout.y - b.layout.y;
      }
      return a.layout.x - b.layout.x;
    });
  }, [widgets]);

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, widgetId: number) => {
    if (!configMode) return;
    e.dataTransfer.setData('widgetId', String(widgetId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!configMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetX: number, targetY: number) => {
    if (!configMode) return;
    e.preventDefault();
    const widgetId = parseInt(e.dataTransfer.getData('widgetId'));
    if (widgetId) {
      onWidgetMove(widgetId, targetX, targetY);
    }
  };

  // Render appropriate widget component
  const renderWidget = (widget: WidgetConfig) => {
    const commonProps = {
      config: widget,
      searchText,
    };

    switch (widget.type) {
      case 'number_tile':
        return <NumberTileWidget {...commonProps} />;
      case 'progress_ring':
        return <ProgressRingWidget {...commonProps} />;
      case 'pie':
        return <PieChartWidget {...commonProps} />;
      case 'bar':
        return <BarChartWidget {...commonProps} />;
      case 'table':
        return <TableWidget {...commonProps} />;
      default:
        return <div className="text-red-500">Unknown widget type</div>;
    }
  };

  return (
    <div
      className={`grid gap-4 ${configMode ? 'canvas-config-mode' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${layoutColumns}, 1fr)`,
        gridAutoRows: 'minmax(140px, auto)',
      }}
    >
      {sortedWidgets.map((widget) => (
        <div
          key={widget.id}
          className={`
            bg-white rounded-lg shadow-sm border border-gray-200
            ${configMode ? 'cursor-move border-dashed border-blue-400 border-2' : ''}
            transition-shadow hover:shadow-md
          `}
          style={{
            gridColumn: `span ${widget.layout.col_span}`,
            gridRow: `span ${widget.layout.row_span}`,
          }}
          draggable={configMode}
          onDragStart={(e) => handleDragStart(e, widget.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, widget.layout.x, widget.layout.y)}
        >
          {/* Widget Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {configMode && (
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
              )}
              <h3 className="font-semibold text-gray-800 text-sm">
                {widget.title}
              </h3>
            </div>

            {/* Widget Actions */}
            <div
              className={`flex gap-1 ${
                configMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}
            >
              <button
                onClick={() => onWidgetEdit(widget)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Edit widget"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {configMode && (
                <button
                  onClick={() => onWidgetDelete(widget.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Remove widget"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Widget Content */}
          <div className="p-4 flex-1">
            {renderWidget(widget)}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="col-span-full text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No widgets yet
          </h3>
          <p className="text-gray-500 mb-4">
            Click Configure to add widgets to your canvas
          </p>
        </div>
      )}

      {/* Drop Zones (visible in config mode) */}
      {configMode && widgets.length < 10 && (
        <div
          className="col-span-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.preventDefault();
            // Find next available position
            const maxY = Math.max(...widgets.map(w => w.layout.y + w.layout.row_span), 0);
            const widgetId = parseInt(e.dataTransfer.getData('widgetId'));
            if (widgetId) {
              onWidgetMove(widgetId, 0, maxY);
            }
          }}
        >
          Drag widgets here or click "Add Widget" in the palette
        </div>
      )}
    </div>
  );
}

export default CanvasGrid;
