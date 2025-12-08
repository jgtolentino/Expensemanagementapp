/**
 * IPAI PPM Clarity - Widget Configuration Dialog
 * Dialog for creating and editing widget configurations
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { canvasApi } from '../../api/canvas';
import type { WidgetConfig, WidgetType, OperationType, FormatType, WidgetFilter, TableColumn } from '../../types/canvas';

interface WidgetConfigDialogProps {
  canvasId: number;
  widget: WidgetConfig | null;
  widgetType: WidgetType | null;
  onClose: () => void;
  onSave: () => void;
}

const targetModelOptions = [
  { value: 'project.task', label: 'Tasks' },
  { value: 'ipai.task.todo', label: 'To-Dos' },
  { value: 'ipai.project.phase', label: 'Phases' },
];

const operationOptions: Array<{ value: OperationType; label: string }> = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

const formatOptions: Array<{ value: FormatType; label: string }> = [
  { value: 'number', label: 'Number' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'currency', label: 'Currency' },
  { value: 'hours', label: 'Hours' },
];

const colorOptions = [
  '#0078D4', // Blue
  '#4B38B3', // Purple
  '#107C10', // Green
  '#D83B01', // Red/Orange
  '#F2C811', // Gold
  '#00B294', // Teal
  '#8764B8', // Violet
  '#038387', // Cyan
];

export function WidgetConfigDialog({
  canvasId,
  widget,
  widgetType,
  onClose,
  onSave,
}: WidgetConfigDialogProps) {
  const isEditing = !!widget;
  const initialType = widget?.type || widgetType || 'number_tile';

  const [formData, setFormData] = useState({
    title: widget?.title || '',
    type: initialType,
    target_model: widget?.target_model || 'project.task',
    operation: widget?.operation || 'count',
    format: widget?.format || 'number',
    color: widget?.color || '#0078D4',
    group_by: widget?.group_by || '',
    aggregate_field: widget?.aggregate_field || '',
    sort_order: widget?.sort_order || 'desc',
    limit: widget?.limit || 10,
    target_value: widget?.target_value || 100,
    actual_field: widget?.actual_field || 'percent_complete',
    filters: widget?.filters || [],
    table_columns: widget?.table_columns || [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update title placeholder based on widget type
  const getDefaultTitle = () => {
    switch (formData.type) {
      case 'number_tile':
        return 'Total Count';
      case 'progress_ring':
        return 'Progress';
      case 'pie':
        return 'Distribution';
      case 'bar':
        return 'Comparison';
      case 'table':
        return 'Data Table';
      default:
        return 'Widget';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const config = {
        ...formData,
        layout: widget?.layout || {
          col_span: ['number_tile', 'progress_ring'].includes(formData.type) ? 1 : 2,
          row_span: 1,
          x: 0,
          y: 0,
        },
      };

      let result;
      if (isEditing && widget) {
        result = await canvasApi.updateWidget(widget.id, config);
      } else {
        result = await canvasApi.createWidget(canvasId, config);
      }

      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Failed to save widget');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Show different fields based on widget type
  const showGroupBy = ['pie', 'bar'].includes(formData.type);
  const showAggregateField = formData.operation !== 'count';
  const showProgressFields = formData.type === 'progress_ring';
  const showTableFields = formData.type === 'table';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Widget' : 'New Widget'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder={getDefaultTitle()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Widget Type (read-only when editing) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
                disabled={isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="number_tile">Number Tile</option>
                <option value="progress_ring">Progress Ring</option>
                <option value="pie">Pie Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="table">Table</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateFormData('color', color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-blue-500'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Target Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Object
              </label>
              <select
                value={formData.target_model}
                onChange={(e) => updateFormData('target_model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {targetModelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={formData.operation}
                onChange={(e) => updateFormData('operation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {operationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => updateFormData('format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Group By (for charts) */}
            {showGroupBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group By Field
                </label>
                <input
                  type="text"
                  value={formData.group_by}
                  onChange={(e) => updateFormData('group_by', e.target.value)}
                  placeholder="e.g., phase_id, state, task_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Aggregate Field */}
            {showAggregateField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aggregate Field
                </label>
                <input
                  type="text"
                  value={formData.aggregate_field}
                  onChange={(e) => updateFormData('aggregate_field', e.target.value)}
                  placeholder="e.g., planned_hours, percent_complete"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Progress Ring specific fields */}
            {showProgressFields && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => updateFormData('target_value', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Field
                  </label>
                  <input
                    type="text"
                    value={formData.actual_field}
                    onChange={(e) => updateFormData('actual_field', e.target.value)}
                    placeholder="percent_complete"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit Results
              </label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => updateFormData('limit', parseInt(e.target.value))}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={formData.sort_order}
                onChange={(e) => updateFormData('sort_order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Widget' : 'Add Widget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WidgetConfigDialog;
