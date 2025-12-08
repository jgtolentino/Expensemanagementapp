/**
 * IPAI PPM Clarity - Tasks Board View
 * Kanban-style board view for tasks
 */

import React, { useState, useMemo } from 'react';
import { useProjectTasks, useProjectPhases } from '../../hooks/useCanvas';
import {
  Diamond,
  AlertTriangle,
  User,
  Calendar,
  MoreVertical,
  Plus,
  GripVertical,
} from 'lucide-react';
import type { Task, Phase } from '../../types/canvas';

interface TasksBoardProps {
  projectId: number;
  groupBy?: 'phase' | 'status' | 'assignee';
  onTaskSelect?: (task: Task) => void;
}

// Status columns for task board
const STATUS_COLUMNS = [
  { id: 'not_started', label: 'Not Started', color: '#E5E7EB' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'on_hold', label: 'On Hold', color: '#F59E0B' },
  { id: 'completed', label: 'Completed', color: '#10B981' },
];

export function TasksBoard({
  projectId,
  groupBy = 'status',
  onTaskSelect,
}: TasksBoardProps) {
  const { tasks, loading, error, updateTask, refresh } = useProjectTasks(projectId);
  const { phases } = useProjectPhases(projectId);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Get columns based on groupBy
  const columns = useMemo(() => {
    if (groupBy === 'phase') {
      const phaseColumns = phases.map((phase) => ({
        id: String(phase.id),
        label: phase.name,
        color: '#6366F1',
      }));
      phaseColumns.push({ id: 'unphased', label: 'No Phase', color: '#9CA3AF' });
      return phaseColumns;
    }

    return STATUS_COLUMNS;
  }, [groupBy, phases]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    tasks.forEach((task) => {
      let columnId: string;

      if (groupBy === 'phase') {
        columnId = task.phase_id ? String(task.phase_id) : 'unphased';
      } else {
        // Map percent_complete to status
        if (task.percent_complete === 0) {
          columnId = 'not_started';
        } else if (task.percent_complete >= 100) {
          columnId = 'completed';
        } else {
          columnId = 'in_progress';
        }
      }

      if (grouped[columnId]) {
        grouped[columnId].push(task);
      }
    });

    return grouped;
  }, [tasks, columns, groupBy]);

  // Drag handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedTask) return;

    let updates: Partial<Task> = {};

    if (groupBy === 'phase') {
      updates.phase_id = columnId === 'unphased' ? undefined : parseInt(columnId);
    } else {
      // Update percent_complete based on status
      switch (columnId) {
        case 'not_started':
          updates.percent_complete = 0;
          break;
        case 'in_progress':
          if (draggedTask.percent_complete === 0 || draggedTask.percent_complete >= 100) {
            updates.percent_complete = 50;
          }
          break;
        case 'completed':
          updates.percent_complete = 100;
          break;
      }
    }

    await updateTask(draggedTask.id, updates);
    setDraggedTask(null);
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-gray-100 rounded-lg"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column Header */}
          <div
            className="px-4 py-3 rounded-t-lg border-b-2"
            style={{ borderColor: column.color }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{column.label}</h3>
              <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded">
                {tasksByColumn[column.id]?.length || 0}
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {tasksByColumn[column.id]?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={() => handleDragStart(task)}
                onClick={() => onTaskSelect?.(task)}
              />
            ))}

            {tasksByColumn[column.id]?.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No tasks
              </div>
            )}
          </div>

          {/* Add Task Button */}
          <div className="p-2 border-t border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Task</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onClick: () => void;
}

function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer
        hover:shadow-md transition-shadow
        ${task.is_critical ? 'border-l-4 border-l-red-500' : ''}
        ${task.task_type === 'milestone' ? 'border-l-4 border-l-purple-500' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {task.task_type === 'milestone' && (
            <Diamond className="w-4 h-4 text-purple-600 flex-shrink-0" />
          )}
          {task.is_critical && task.task_type !== 'milestone' && (
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium text-gray-800 text-sm line-clamp-2">
            {task.name}
          </span>
        </div>
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-grab" />
      </div>

      {/* WBS Code */}
      {task.wbs_code && (
        <div className="text-xs font-mono text-gray-500 mb-2">
          {task.wbs_code}
        </div>
      )}

      {/* Progress */}
      {task.task_type !== 'milestone' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(task.percent_complete)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-full rounded ${
                task.is_critical ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, task.percent_complete)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
        </div>
        {task.user_names?.length > 0 && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {task.user_names[0]}
            {task.user_names.length > 1 && ` +${task.user_names.length - 1}`}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        {task.is_critical && (
          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
            Critical
          </span>
        )}
        {task.locked && (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
            Locked
          </span>
        )}
        {task.predecessor_count > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {task.predecessor_count} dep
          </span>
        )}
      </div>
    </div>
  );
}

export default TasksBoard;
