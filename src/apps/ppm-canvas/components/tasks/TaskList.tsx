/**
 * IPAI PPM Clarity - Task List View
 * Simple list view with inline editing and quick actions
 */

import React, { useState } from 'react';
import { useProjectTasks, useProjectPhases } from '../../hooks/useCanvas';
import {
  Plus,
  Diamond,
  AlertTriangle,
  Lock,
  Unlock,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import type { Task, Phase } from '../../types/canvas';

interface TaskListProps {
  projectId: number;
  onTaskSelect?: (task: Task) => void;
}

export function TaskList({ projectId, onTaskSelect }: TaskListProps) {
  const { tasks, loading, error, updateTask, refresh } = useProjectTasks(projectId);
  const { phases } = useProjectPhases(projectId);

  const [expandedPhases, setExpandedPhases] = useState<Set<number | 'unphased'>>(
    new Set(['unphased', ...(phases.map((p) => p.id) || [])])
  );
  const [newTaskPhase, setNewTaskPhase] = useState<number | 'unphased' | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  // Group tasks by phase
  const tasksByPhase = React.useMemo(() => {
    const grouped: Record<number | 'unphased', Task[]> = { unphased: [] };

    phases.forEach((phase) => {
      grouped[phase.id] = [];
    });

    tasks.forEach((task) => {
      const phaseId = task.phase_id || 'unphased';
      if (!grouped[phaseId]) {
        grouped[phaseId] = [];
      }
      grouped[phaseId].push(task);
    });

    return grouped;
  }, [tasks, phases]);

  const togglePhase = (phaseId: number | 'unphased') => {
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

  const handleAddTask = async (phaseId: number | 'unphased') => {
    if (!newTaskName.trim()) {
      setNewTaskPhase(null);
      return;
    }

    // Would call API to create task
    console.log('Create task:', newTaskName, 'in phase:', phaseId);

    setNewTaskName('');
    setNewTaskPhase(null);
    await refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent, phaseId: number | 'unphased') => {
    if (e.key === 'Enter') {
      handleAddTask(phaseId);
    } else if (e.key === 'Escape') {
      setNewTaskName('');
      setNewTaskPhase(null);
    }
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
    <div className="divide-y divide-gray-200">
      {/* Phases */}
      {phases.map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          tasks={tasksByPhase[phase.id] || []}
          expanded={expandedPhases.has(phase.id)}
          onToggle={() => togglePhase(phase.id)}
          onTaskSelect={onTaskSelect}
          onTaskUpdate={updateTask}
          showNewTask={newTaskPhase === phase.id}
          newTaskName={newTaskName}
          onNewTaskChange={setNewTaskName}
          onNewTaskSubmit={() => handleAddTask(phase.id)}
          onNewTaskCancel={() => {
            setNewTaskName('');
            setNewTaskPhase(null);
          }}
          onNewTaskKeyDown={(e) => handleKeyDown(e, phase.id)}
          onStartNewTask={() => setNewTaskPhase(phase.id)}
        />
      ))}

      {/* Unphased Tasks */}
      <div className="py-4">
        <div
          className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
          onClick={() => togglePhase('unphased')}
        >
          {expandedPhases.has('unphased') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-700">Unphased Tasks</span>
          <span className="text-sm text-gray-500">
            ({tasksByPhase['unphased']?.length || 0})
          </span>
        </div>

        {expandedPhases.has('unphased') && (
          <div className="pl-6">
            {tasksByPhase['unphased']?.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onSelect={() => onTaskSelect?.(task)}
                onUpdate={updateTask}
              />
            ))}

            {newTaskPhase === 'unphased' ? (
              <div className="flex items-center gap-2 px-4 py-2">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'unphased')}
                  placeholder="New task name..."
                  className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleAddTask('unphased')}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewTaskName('');
                    setNewTaskPhase(null);
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNewTaskPhase('unphased')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-full"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Phase Section Component
interface PhaseSectionProps {
  phase: Phase;
  tasks: Task[];
  expanded: boolean;
  onToggle: () => void;
  onTaskSelect?: (task: Task) => void;
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => Promise<boolean>;
  showNewTask: boolean;
  newTaskName: string;
  onNewTaskChange: (name: string) => void;
  onNewTaskSubmit: () => void;
  onNewTaskCancel: () => void;
  onNewTaskKeyDown: (e: React.KeyboardEvent) => void;
  onStartNewTask: () => void;
}

function PhaseSection({
  phase,
  tasks,
  expanded,
  onToggle,
  onTaskSelect,
  onTaskUpdate,
  showNewTask,
  newTaskName,
  onNewTaskChange,
  onNewTaskSubmit,
  onNewTaskCancel,
  onNewTaskKeyDown,
  onStartNewTask,
}: PhaseSectionProps) {
  return (
    <div className="py-4">
      {/* Phase Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <div
          className="w-3 h-3 rounded"
          style={{
            backgroundColor:
              phase.state === 'completed'
                ? '#10B981'
                : phase.state === 'in_progress'
                ? '#3B82F6'
                : '#9CA3AF',
          }}
        />
        <span className="font-medium text-gray-700">{phase.name}</span>
        <span className="text-sm text-gray-500">({tasks.length})</span>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2 max-w-xs ml-4">
          <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded"
              style={{ width: `${phase.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{Math.round(phase.progress)}%</span>
        </div>
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="pl-6">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onSelect={() => onTaskSelect?.(task)}
              onUpdate={onTaskUpdate}
            />
          ))}

          {/* New Task Input */}
          {showNewTask ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => onNewTaskChange(e.target.value)}
                onKeyDown={onNewTaskKeyDown}
                placeholder="New task name..."
                className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={onNewTaskSubmit}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onNewTaskCancel}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onStartNewTask}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-full"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Task Row Component
interface TaskRowProps {
  task: Task;
  onSelect: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => Promise<boolean>;
}

function TaskRow({ task, onSelect, onUpdate }: TaskRowProps) {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer
        ${task.is_critical ? 'bg-red-50' : ''}
      `}
      onClick={onSelect}
    >
      {/* Task Type Icon */}
      {task.task_type === 'milestone' ? (
        <Diamond className="w-4 h-4 text-purple-600" />
      ) : task.is_critical ? (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      ) : (
        <div className="w-4 h-4 border-2 border-gray-300 rounded" />
      )}

      {/* Name */}
      <span className="flex-1 text-sm text-gray-700">{task.name}</span>

      {/* Due Date */}
      {task.end_date && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(task.end_date).toLocaleDateString()}
        </div>
      )}

      {/* Duration */}
      {task.duration_days > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          {task.duration_days}d
        </div>
      )}

      {/* Progress */}
      {task.task_type !== 'milestone' && (
        <div className="w-16 h-1.5 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full rounded ${task.is_critical ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, task.percent_complete)}%` }}
          />
        </div>
      )}

      {/* Lock Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate(task.id, { locked: !task.locked });
        }}
        className="p-1 hover:bg-gray-200 rounded"
      >
        {task.locked ? (
          <Lock className="w-4 h-4 text-amber-600" />
        ) : (
          <Unlock className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

export default TaskList;
