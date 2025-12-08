/**
 * IPAI PPM Clarity - Canvas Page Component
 * Main canvas dashboard page with widgets and view management
 */

import React, { useState, useCallback } from 'react';
import { useCanvas, useCanvasViews, useAutoschedule } from '../../hooks/useCanvas';
import { CanvasGrid } from './CanvasGrid';
import { WidgetPalette } from './WidgetPalette';
import { SavedViewsDropdown } from './SavedViewsDropdown';
import { WidgetConfigDialog } from './WidgetConfigDialog';
import type { WidgetConfig, WidgetType } from '../../types/canvas';

// Icons (using Lucide React style)
import {
  Settings,
  Layout,
  Save,
  Plus,
  RefreshCw,
  Calendar,
  Check,
  X,
  Search,
} from 'lucide-react';

interface CanvasPageProps {
  canvasId: number;
  projectId: number;
  projectName: string;
}

export function CanvasPage({ canvasId, projectId, projectName }: CanvasPageProps) {
  const { canvas, loading, error, refresh, updateLayout } = useCanvas(canvasId);
  const { views, activeView, applyView, saveView } = useCanvasViews(canvasId);
  const { running, hasTentative, runSchedule, publish, discard, setHasTentative } = useAutoschedule(projectId);

  const [configMode, setConfigMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [newWidgetType, setNewWidgetType] = useState<WidgetType | null>(null);

  // Layout options
  const layoutOptions = [
    { value: 4, label: '4 Columns' },
    { value: 6, label: '6 Columns' },
    { value: 8, label: '8 Columns' },
  ];

  const handleLayoutChange = useCallback(async (columns: number) => {
    if (!canvas) return;

    const widgetPositions = canvas.widgets.map(w => ({
      widget_id: w.id,
      position_x: w.layout.x,
      position_y: w.layout.y,
      col_span: w.layout.col_span,
      row_span: w.layout.row_span,
    }));

    await updateLayout(columns, widgetPositions);
  }, [canvas, updateLayout]);

  const handleWidgetMove = useCallback(async (
    widgetId: number,
    x: number,
    y: number
  ) => {
    if (!canvas) return;

    const widgetPositions = canvas.widgets.map(w => ({
      widget_id: w.id,
      position_x: w.id === widgetId ? x : w.layout.x,
      position_y: w.id === widgetId ? y : w.layout.y,
      col_span: w.layout.col_span,
      row_span: w.layout.row_span,
    }));

    await updateLayout(canvas.layout_columns, widgetPositions);
  }, [canvas, updateLayout]);

  const handleAddWidget = useCallback((type: WidgetType) => {
    setNewWidgetType(type);
    setEditingWidget(null);
    setShowWidgetDialog(true);
  }, []);

  const handleEditWidget = useCallback((widget: WidgetConfig) => {
    setEditingWidget(widget);
    setNewWidgetType(null);
    setShowWidgetDialog(true);
  }, []);

  const handleSaveView = useCallback(async () => {
    if (!canvas) return;

    const name = window.prompt('Enter view name:');
    if (!name) return;

    await saveView(name, {
      layout_columns: canvas.layout_columns,
      search_text: searchText,
      widgets: {},
    });
  }, [canvas, searchText, saveView]);

  // Check tentative from canvas data
  React.useEffect(() => {
    // This would typically come from the project state
    // For now, we'll use the hook's state
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading canvas...</span>
      </div>
    );
  }

  if (error || !canvas) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error || 'Canvas not found'}</div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tentative Schedule Banner */}
      {hasTentative && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-amber-600 mr-2" />
            <span className="text-amber-800 font-medium">
              Tentative Schedule Active - Review and publish or discard
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={publish}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Publish
            </button>
            <button
              onClick={discard}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{canvas.name}</h1>
            <p className="text-sm text-gray-500">{projectName}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Saved Views */}
            <SavedViewsDropdown
              views={views}
              activeView={activeView}
              onSelectView={applyView}
            />

            {/* Layout Selector */}
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-500" />
              <select
                value={canvas.layout_columns}
                onChange={(e) => handleLayoutChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {layoutOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Autoschedule */}
            <button
              onClick={() => runSchedule(true)}
              disabled={running}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              {running ? 'Scheduling...' : 'Autoschedule'}
            </button>

            {/* Configure Mode */}
            <button
              onClick={() => setConfigMode(!configMode)}
              className={`px-3 py-2 rounded flex items-center gap-2 text-sm ${
                configMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>

            {/* Save View */}
            <button
              onClick={handleSaveView}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Save View
            </button>

            {/* Refresh */}
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Widget Counts */}
        <div className="mt-3 flex gap-4 text-sm text-gray-500">
          <span>
            <strong>{canvas.widget_count}</strong> / 10 widgets
          </span>
          <span>
            <strong>{canvas.table_widget_count}</strong> / 7 tables
          </span>
          <span>
            <strong>{canvas.chart_widget_count}</strong> charts/tiles
          </span>
        </div>
      </header>

      {/* Widget Palette (Configure Mode) */}
      {configMode && (
        <WidgetPalette
          onAddWidget={handleAddWidget}
          disabledTypes={
            canvas.widget_count >= 10
              ? ['number_tile', 'progress_ring', 'pie', 'bar', 'table']
              : canvas.table_widget_count >= 7
              ? ['table']
              : []
          }
        />
      )}

      {/* Canvas Grid */}
      <main className="p-6">
        <CanvasGrid
          widgets={canvas.widgets}
          layoutColumns={canvas.layout_columns}
          configMode={configMode}
          searchText={searchText}
          onWidgetMove={handleWidgetMove}
          onWidgetEdit={handleEditWidget}
          onWidgetDelete={(id) => console.log('Delete widget:', id)}
        />
      </main>

      {/* Widget Config Dialog */}
      {showWidgetDialog && (
        <WidgetConfigDialog
          canvasId={canvasId}
          widget={editingWidget}
          widgetType={newWidgetType}
          onClose={() => {
            setShowWidgetDialog(false);
            setEditingWidget(null);
            setNewWidgetType(null);
          }}
          onSave={async () => {
            await refresh();
            setShowWidgetDialog(false);
            setEditingWidget(null);
            setNewWidgetType(null);
          }}
        />
      )}
    </div>
  );
}

export default CanvasPage;
