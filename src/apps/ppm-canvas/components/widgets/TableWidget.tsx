/**
 * IPAI PPM Clarity - Table Widget
 * Displays data in a scrollable table format
 */

import React, { useMemo } from 'react';
import { useWidgetData } from '../../hooks/useCanvas';
import { RefreshCw, AlertCircle, Check, X } from 'lucide-react';
import type { WidgetConfig, TableData } from '../../types/canvas';

interface TableWidgetProps {
  config: WidgetConfig;
  searchText?: string;
}

export function TableWidget({ config, searchText }: TableWidgetProps) {
  const { data, loading, error, refresh } = useWidgetData(config.id);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!data || data.type !== 'table') return [];

    const tableData = data as TableData;
    let rows = tableData.rows;

    if (searchText && searchText.trim()) {
      const search = searchText.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search)
        )
      );
    }

    return rows;
  }, [data, searchText]);

  // Format cell value
  const formatCellValue = (value: unknown, field: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    // Boolean values
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      );
    }

    // Progress/percentage fields
    if (
      field.includes('progress') ||
      field.includes('percent') ||
      field.includes('complete')
    ) {
      const numValue = Number(value);
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded"
              style={{ width: `${Math.min(100, numValue)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round(numValue)}%
          </span>
        </div>
      );
    }

    // Critical flag
    if (field === 'is_critical' && value === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Critical
        </span>
      );
    }

    // Numbers
    if (typeof value === 'number') {
      return new Intl.NumberFormat().format(value);
    }

    // Dates
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return new Date(value).toLocaleDateString();
    }

    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data || data.type !== 'table') {
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

  const tableData = data as TableData;

  if (tableData.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            {tableData.columns.map((col, index) => (
              <th
                key={index}
                className="text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 border-b border-gray-100"
            >
              {tableData.columns.map((col, colIndex) => (
                <td key={colIndex} className="px-3 py-2 text-gray-700">
                  {formatCellValue(row[col.field], col.field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer with count */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
        Showing {filteredRows.length} of {tableData.total} items
        {searchText && ` (filtered)`}
      </div>
    </div>
  );
}

export default TableWidget;
