/**
 * IPAI PPM Clarity - Tasks Grid View
 * Editable table view for tasks with WBS hierarchy
 */

import React, { useState, useCallback } from 'react';
import { useProjectTasks } from '../../hooks/useCanvas';
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  Diamond,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';
import type { Task, TaskType } from '../../types/canvas';

interface TasksGridProps {
  projectId: number;
  onTaskSelect?: (task: Task) => void;
  selectedTaskIds?: number[];
}

export function TasksGrid({ projectId, onTaskSelect, selectedTaskIds = [] }: TasksGridProps) {
  const {
    tasks,
    loading,
    error,
    updateTask,
    bulkUpdate,
    shiftDates,
    refresh,
  } = useProjectTasks(projectId);

  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    taskId: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Group tasks by phase
  const tasksByPhase = React.useMemo(() => {
    const grouped: Record<number | 'unphased', Task[]> = { unphased: [] };

    tasks.forEach((task) => {
      const phaseId = task.phase_id || 'unphased';
      if (!grouped[phaseId]) {
        grouped[phaseId] = [];
      }
      grouped[phaseId].push(task);
    });

    return grouped;
  }, [tasks]);

  // Toggle phase expansion
  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  // Handle cell editing
  const startEdit = (taskId: number, field: string, value: string | number) => {
    setEditingCell({ taskId, field });
    setEditValue(String(value));
  };

  const commitEdit = async () => {
    if (!editingCell) return;

    const { taskId, field } = editingCell;
    let value: unknown = editValue;

    // Convert value based on field type
    if (field === 'percent_complete' || field === 'duration_days') {
      value = parseFloat(editValue) || 0;
    }

    await updateTask(taskId, { [field]: value });
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle keyboard in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Render task type icon
  const renderTypeIcon = (type: TaskType, isCritical: boolean) => {
    if (type === 'milestone') {
      return <Diamond className={`w-4 h-4 ${isCritical ? 'text-red-600' : 'text-purple-600'}`} />;
    }
    if (isCritical) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  // Render progress bar
  const renderProgress = (percent: number) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(percent)}%</span>
    </div>
  );

  // Render editable cell
  const renderCell = (
    task: Task,
    field: keyof Task,
    render?: (value: unknown) => React.ReactNode
  ) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.field === field;
    const value = task[field];

    if (isEditing) {
      return (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
          autoFocus
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        onDoubleClick={() => startEdit(task.id, field, String(value ?? ''))}
      >
        {render ? render(value) : String(value ?? '-')}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="text-red-500 mb-2">{error}</span>
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-16">
              WBS
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700">
              Name
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-24">
              Type
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-28">
              Start
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-28">
              Finish
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-20">
              Duration
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-32">
              Progress
            </th>
            <th className="text-center px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-20">
              Critical
            </th>
            <th className="text-center px-3 py-2 border-b border-gray-200 font-semibold text-gray-700 w-16">
              Locked
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isSelected = selectedTaskIds.includes(task.id);

            return (
              <tr
                key={task.id}
                className={`
                  border-b border-gray-100 hover:bg-gray-50
                  ${task.is_critical ? 'bg-red-50' : ''}
                  ${task.task_type === 'milestone' ? 'bg-purple-50' : ''}
                  ${isSelected ? 'bg-blue-100' : ''}
                `}
                onClick={() => onTaskSelect?.(task)}
              >
                {/* WBS Code */}
                <td className="px-3 py-2 font-mono text-xs text-gray-500">
                  {task.wbs_code || '-'}
                </td>

                {/* Name with indent */}
                <td className="px-3 py-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${(task.wbs_level - 1) * 16}px` }}
                  >
                    {renderTypeIcon(task.task_type, task.is_critical)}
                    {renderCell(task, 'name')}
                  </div>
                </td>

                {/* Type */}
                <td className="px-3 py-2">
                  <span
                    className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${task.task_type === 'milestone' ? 'bg-purple-100 text-purple-700' : ''}
                      ${task.task_type === 'phase' ? 'bg-blue-100 text-blue-700' : ''}
                      ${task.task_type === 'task' ? 'bg-gray-100 text-gray-700' : ''}
                      ${task.task_type === 'summary' ? 'bg-amber-100 text-amber-700' : ''}
                    `}
                  >
                    {task.task_type}
                  </span>
                </td>

                {/* Start Date */}
                <td className="px-3 py-2 text-gray-600">
                  {task.start_date
                    ? new Date(task.start_date).toLocaleDateString()
                    : '-'}
                </td>

                {/* End Date */}
                <td className="px-3 py-2 text-gray-600">
                  {task.end_date
                    ? new Date(task.end_date).toLocaleDateString()
                    : '-'}
                </td>

                {/* Duration */}
                <td className="px-3 py-2">
                  {renderCell(task, 'duration_days', (v) => `${v}d`)}
                </td>

                {/* Progress */}
                <td className="px-3 py-2">
                  {renderProgress(task.percent_complete)}
                </td>

                {/* Critical */}
                <td className="px-3 py-2 text-center">
                  {task.is_critical && (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                </td>

                {/* Locked */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTask(task.id, { locked: !task.locked });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={task.locked ? 'Unlock task' : 'Lock task'}
                  >
                    {task.locked ? (
                      <Lock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks found
        </div>
      )}
    </div>
  );
}

export default TasksGrid;
