import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { TaskEnhanced, Subtask, ChecklistItem } from '../lib/data/tasks-enhanced';
import { getTeamMemberByCode, getInitials, getAvatarColor } from '../lib/data/team-data';

interface KanbanBoardProps {
  tasks: TaskEnhanced[];
  onTaskClick?: (task: TaskEnhanced) => void;
  onStatusChange?: (taskId: string, newStatus: TaskEnhanced['status']) => void;
}

const COLORS = {
  primary: '#D97706',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
};

const COLUMNS: { status: TaskEnhanced['status']; label: string; color: string }[] = [
  { status: 'not_started', label: 'Not Started', color: '#6B7280' },
  { status: 'in_progress', label: 'In Progress', color: COLORS.info },
  { status: 'blocked', label: 'Blocked', color: COLORS.warning },
  { status: 'completed', label: 'Completed', color: COLORS.success },
];

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      critical: { label: 'Critical', color: COLORS.danger },
      high: { label: 'High', color: COLORS.warning },
      medium: { label: 'Medium', color: COLORS.info },
      low: { label: 'Low', color: '#6B7280' },
    };
    return config[priority as keyof typeof config] || config.medium;
  };

  const isOverdue = (endDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return endDate < today;
  };

  const isDueSoon = (endDate: string) => {
    const today = new Date();
    const dueDate = new Date(endDate);
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  };

  const renderTaskCard = (task: TaskEnhanced) => {
    const owner = getTeamMemberByCode(task.owner);
    const assignee = task.assignee ? getTeamMemberByCode(task.assignee) : null;
    const priorityBadge = getPriorityBadge(task.priority);
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const overdue = isOverdue(task.endDate);
    const dueSoon = isDueSoon(task.endDate);

    return (
      <Card
        key={task.id}
        className="mb-3 cursor-pointer hover:shadow-lg transition-all"
        onClick={(e) => {
          e.stopPropagation();
          if (onTaskClick) onTaskClick(task);
        }}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">{task.code}</span>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${priorityBadge.color}20`,
                    color: priorityBadge.color,
                    fontSize: '10px',
                  }}
                >
                  {priorityBadge.label}
                </Badge>
              </div>
              <div className="font-medium text-sm mb-1 line-clamp-2">{task.name}</div>
            </div>
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Progress value={task.progress} className="flex-1 h-2" />
              <span className="text-xs text-slate-600 w-10 text-right">{task.progress}%</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span
              className="text-xs"
              style={{
                color: overdue ? COLORS.danger : dueSoon ? COLORS.warning : '#64748B',
              }}
            >
              Due: {task.endDate}
              {overdue && ' (Overdue!)'}
              {dueSoon && !overdue && ' (Due Soon)'}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {assignee && (
                <Avatar
                  className="h-6 w-6"
                  style={{ backgroundColor: getAvatarColor(assignee.code) }}
                >
                  <AvatarFallback className="text-xs text-white">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-xs text-slate-600">{assignee?.name || owner?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {hasSubtasks && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{task.subtasks!.length}</span>
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Subtasks */}
          {isExpanded && hasSubtasks && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {task.subtasks!.map((subtask) => {
                const checklistCompleted = subtask.checklist.filter(
                  (item) => item.completed
                ).length;
                const checklistTotal = subtask.checklist.length;

                return (
                  <div
                    key={subtask.id}
                    className="p-2 bg-slate-50 rounded text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{subtask.name}</div>
                        {subtask.checklist.length > 0 && (
                          <div className="text-xs text-slate-500">
                            {checklistCompleted}/{checklistTotal} items completed
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor:
                            subtask.status === 'completed'
                              ? `${COLORS.success}20`
                              : subtask.status === 'in_progress'
                              ? `${COLORS.info}20`
                              : subtask.status === 'blocked'
                              ? `${COLORS.warning}20`
                              : '#F3F4F6',
                        }}
                      >
                        {subtask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Progress value={subtask.progress} className="h-1 mb-2" />
                    {subtask.assignee && (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <User className="h-3 w-3" />
                        <span>{getTeamMemberByCode(subtask.assignee)?.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getTasksByStatus = (status: TaskEnhanced['status']) => {
    // Flatten all tasks including children
    const allTasks: TaskEnhanced[] = [];
    const flatten = (taskList: TaskEnhanced[]) => {
      taskList.forEach((task) => {
        allTasks.push(task);
        if (task.children) {
          flatten(task.children);
        }
      });
    };
    flatten(tasks);

    return allTasks.filter((task) => task.status === status && task.type === 'task');
  };

  return (
    <div className="space-y-4">
      {/* Kanban Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Group by
              </Button>
              <Button variant="outline" size="sm">
                Sort
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Card Settings
              </Button>
              <Button variant="outline" size="sm">
                View Options
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);

          return (
            <div key={column.status} className="flex flex-col">
              <Card className="mb-3" style={{ backgroundColor: `${column.color}10` }}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold" style={{ color: column.color }}>
                      {column.label}
                    </CardTitle>
                    <Badge variant="secondary" style={{ backgroundColor: column.color, color: '#FFFFFF' }}>
                      {columnTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="flex-1 space-y-2">
                {columnTasks.length === 0 ? (
                  <Card className="opacity-50">
                    <CardContent className="p-8 text-center text-sm text-slate-500">
                      No tasks
                    </CardContent>
                  </Card>
                ) : (
                  columnTasks.map((task) => renderTaskCard(task))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
