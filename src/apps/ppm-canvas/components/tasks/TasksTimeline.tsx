/**
 * IPAI PPM Clarity - Tasks Timeline View
 * Gantt chart style timeline with WBS tree
 */

import React, { useMemo, useState, useRef } from 'react';
import { useWBSTree, useProjectTasks } from '../../hooks/useCanvas';
import {
  ChevronRight,
  ChevronDown,
  Diamond,
  AlertTriangle,
  Lock,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
} from 'lucide-react';
import type { WBSNode, Task } from '../../types/canvas';

interface TasksTimelineProps {
  projectId: number;
  onTaskSelect?: (taskId: number) => void;
}

// Time scales
type TimeScale = 'day' | 'week' | 'month';

const SCALE_CONFIG = {
  day: { width: 30, format: 'dd' },
  week: { width: 80, format: 'MMM d' },
  month: { width: 120, format: 'MMM yyyy' },
};

export function TasksTimeline({ projectId, onTaskSelect }: TasksTimelineProps) {
  const { tree, flatNodes, loading, expandedNodes, toggleNode, expandAll, collapseAll } = useWBSTree(projectId);
  const { tasks } = useProjectTasks(projectId);

  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [viewStart, setViewStart] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate date range from tasks
  const dateRange = useMemo(() => {
    const dates: Date[] = [];

    tasks.forEach((task) => {
      if (task.start_date) dates.push(new Date(task.start_date));
      if (task.end_date) dates.push(new Date(task.end_date));
    });

    if (dates.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
      };
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { start: minDate, end: maxDate };
  }, [tasks]);

  // Generate timeline columns
  const timelineColumns = useMemo(() => {
    const columns: Array<{ date: Date; label: string }> = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      columns.push({
        date: new Date(current),
        label: formatDate(current, timeScale),
      });

      // Increment based on scale
      if (timeScale === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (timeScale === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return columns;
  }, [dateRange, timeScale]);

  // Calculate bar position and width
  const getBarStyle = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const rangeStart = dateRange.start.getTime();
    const rangeEnd = dateRange.end.getTime();
    const totalRange = rangeEnd - rangeStart;

    const left = ((start.getTime() - rangeStart) / totalRange) * 100;
    const width = ((end.getTime() - start.getTime()) / totalRange) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(0.5, width)}%`,
    };
  };

  // Find task data for a node
  const getTaskData = (nodeId: string): Task | undefined => {
    if (!nodeId.startsWith('task_')) return undefined;
    const taskId = parseInt(nodeId.replace('task_', ''));
    return tasks.find((t) => t.id === taskId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">Loading timeline...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          >
            Collapse All
          </button>
          <button
            onClick={expandAll}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
          >
            Expand All
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newStart = new Date(viewStart);
              newStart.setDate(newStart.getDate() - 7);
              setViewStart(newStart);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={timeScale}
            onChange={(e) => setTimeScale(e.target.value as TimeScale)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="day">Days</option>
            <option value="week">Weeks</option>
            <option value="month">Months</option>
          </select>

          <button
            onClick={() => {
              const newStart = new Date(viewStart);
              newStart.setDate(newStart.getDate() + 7);
              setViewStart(newStart);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* WBS Tree */}
        <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
          {/* Tree Header */}
          <div className="sticky top-0 bg-gray-50 border-b px-3 py-2 font-semibold text-gray-700 text-sm">
            Task Name
          </div>

          {/* Tree Rows */}
          {flatNodes.map((node) => (
            <div
              key={node.id}
              className={`
                flex items-center px-3 py-2 border-b border-gray-100 hover:bg-gray-50
                ${node.is_critical ? 'bg-red-50' : ''}
                ${node.is_milestone ? 'bg-purple-50' : ''}
              `}
              style={{ paddingLeft: `${12 + node.level * 20}px` }}
            >
              {/* Toggle */}
              {node.hasChildren ? (
                <button
                  onClick={() => toggleNode(node.id)}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  {expandedNodes.has(node.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}

              {/* Icon */}
              {node.is_milestone && (
                <Diamond className="w-4 h-4 text-purple-600 mx-1" />
              )}
              {node.is_critical && !node.is_milestone && (
                <AlertTriangle className="w-4 h-4 text-red-600 mx-1" />
              )}
              {node.locked && <Lock className="w-3 h-3 text-amber-600 mx-1" />}

              {/* Name */}
              <span className="text-sm text-gray-700 truncate flex-1">
                {node.name}
              </span>
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-auto" ref={timelineRef}>
          {/* Timeline Header */}
          <div className="sticky top-0 bg-gray-50 border-b flex z-10">
            {timelineColumns.map((col, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2 py-2 border-r text-xs text-gray-600 text-center"
                style={{ width: SCALE_CONFIG[timeScale].width }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Gantt Rows */}
          <div className="relative">
            {/* Grid lines */}
            <div
              className="absolute inset-0 flex"
              style={{
                width: timelineColumns.length * SCALE_CONFIG[timeScale].width,
              }}
            >
              {timelineColumns.map((_, index) => (
                <div
                  key={index}
                  className="border-r border-gray-100 h-full"
                  style={{ width: SCALE_CONFIG[timeScale].width }}
                />
              ))}
            </div>

            {/* Today line */}
            {(() => {
              const today = new Date();
              const rangeStart = dateRange.start.getTime();
              const rangeEnd = dateRange.end.getTime();
              const left =
                ((today.getTime() - rangeStart) / (rangeEnd - rangeStart)) * 100;

              if (left >= 0 && left <= 100) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${left}%` }}
                  />
                );
              }
              return null;
            })()}

            {/* Task Bars */}
            {flatNodes.map((node, index) => {
              const task = getTaskData(node.id);
              const barStyle = getBarStyle(node.start, node.end);

              return (
                <div
                  key={node.id}
                  className="relative h-10 border-b border-gray-100"
                  style={{
                    width: timelineColumns.length * SCALE_CONFIG[timeScale].width,
                  }}
                >
                  {barStyle && (
                    <div
                      className={`
                        absolute top-2 h-6 rounded cursor-pointer
                        transition-all hover:opacity-80
                        ${node.is_milestone ? 'w-4 h-4 rotate-45 top-3' : ''}
                        ${node.is_critical ? 'bg-red-500' : ''}
                        ${node.is_milestone ? 'bg-purple-500' : ''}
                        ${!node.is_critical && !node.is_milestone ? 'bg-blue-500' : ''}
                        ${node.type === 'phase' ? 'bg-indigo-400 opacity-70' : ''}
                      `}
                      style={node.is_milestone ? { left: barStyle.left } : barStyle}
                      onClick={() =>
                        task && onTaskSelect?.(task.id)
                      }
                      title={`${node.name}\n${node.start} - ${node.end}`}
                    >
                      {/* Progress overlay */}
                      {!node.is_milestone && node.progress > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 bg-white/30 rounded-l"
                          style={{ width: `${Math.min(100, node.progress)}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format date based on scale
function formatDate(date: Date, scale: TimeScale): string {
  if (scale === 'day') {
    return date.toLocaleDateString('en-US', { day: '2-digit' });
  } else if (scale === 'week') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

export default TasksTimeline;
