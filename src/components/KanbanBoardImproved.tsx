import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  MoreVertical,
  Filter,
  Search,
} from 'lucide-react';
import { TaskEnhanced, Subtask } from '../lib/data/tasks-enhanced';
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
  purple: '#8B5CF6',
};

const COLUMNS: { status: TaskEnhanced['status']; label: string; color: string; icon: any }[] = [
  { status: 'not_started', label: 'To Do', color: '#64748B', icon: Clock },
  { status: 'in_progress', label: 'In Progress', color: COLORS.info, icon: AlertCircle },
  { status: 'blocked', label: 'Blocked', color: COLORS.warning, icon: AlertCircle },
  { status: 'completed', label: 'Done', color: COLORS.success, icon: CheckCircle2 },
];

const ItemTypes = {
  TASK_CARD: 'task_card',
};

interface DraggableTaskCardProps {
  task: TaskEnhanced;
  onTaskClick?: (task: TaskEnhanced) => void;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
}

function DraggableTaskCard({ task, onTaskClick, expandedTasks, toggleTask }: DraggableTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK_CARD,
    item: { taskId: task.id, currentStatus: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const owner = getTeamMemberByCode(task.owner);
  const assignee = task.assignee ? getTeamMemberByCode(task.assignee) : null;
  const isExpanded = expandedTasks.has(task.id);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const getPriorityConfig = (priority: string) => {
    const config = {
      critical: { label: 'Critical', color: COLORS.danger, bg: '#FEE2E2' },
      high: { label: 'High', color: COLORS.warning, bg: '#FEF3C7' },
      medium: { label: 'Medium', color: COLORS.info, bg: '#DBEAFE' },
      low: { label: 'Low', color: '#64748B', bg: '#F1F5F9' },
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

  const priorityConfig = getPriorityConfig(task.priority);
  const overdue = isOverdue(task.endDate);
  const dueSoon = isDueSoon(task.endDate);

  return (
    <div
      ref={drag}
      className={`mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:scale-[1.02]'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (onTaskClick) onTaskClick(task);
      }}
    >
      <Card className="border-l-4 shadow-sm hover:shadow-xl transition-all duration-200" style={{ borderLeftColor: priorityConfig.color }}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold" style={{ color: COLORS.primary }}>
                  {task.code}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0"
                  style={{
                    backgroundColor: priorityConfig.bg,
                    color: priorityConfig.color,
                    border: `1px solid ${priorityConfig.color}40`,
                  }}
                >
                  {priorityConfig.label}
                </Badge>
              </div>
              <div className="font-semibold text-sm mb-2 line-clamp-2 leading-snug">{task.name}</div>
              {task.description && (
                <div className="text-xs text-slate-500 line-clamp-1 mb-2">{task.description}</div>
              )}
            </div>
            <div className="flex gap-1 ml-2">
              {hasSubtasks && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${task.progress}%`,
                    backgroundColor:
                      task.progress === 100
                        ? COLORS.success
                        : task.progress >= 50
                        ? COLORS.info
                        : COLORS.warning,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 min-w-[40px] text-right">
                {task.progress}%
              </span>
            </div>
          </div>

          {/* Due Date & Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span
                className={`font-medium ${
                  overdue
                    ? 'text-red-600 font-semibold'
                    : dueSoon
                    ? 'text-amber-600 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {task.endDate}
              </span>
            </div>
            {overdue && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Overdue!
              </Badge>
            )}
            {dueSoon && !overdue && (
              <Badge className="text-xs px-1.5 py-0" style={{ backgroundColor: COLORS.warning }}>
                Due Soon
              </Badge>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {assignee && (
                <div className="flex items-center gap-2">
                  <Avatar
                    className="h-7 w-7 border-2 border-white shadow-sm"
                    style={{ backgroundColor: getAvatarColor(assignee.code) }}
                  >
                    <AvatarFallback className="text-xs font-semibold text-white">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-slate-700">{assignee.name.split(' ')[0]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-semibold">{task.comments.length}</span>
                </div>
              )}
              {hasSubtasks && (
                <div className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    {task.subtasks!.filter((st) => st.status === 'completed').length}/{task.subtasks!.length}
                  </span>
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-xs font-semibold">{task.attachments.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Subtasks */}
          {isExpanded && hasSubtasks && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {task.subtasks!.map((subtask) => {
                const checklistCompleted = subtask.checklist.filter((item) => item.completed).length;
                const checklistTotal = subtask.checklist.length;

                return (
                  <div
                    key={subtask.id}
                    className="p-2.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-xs mb-1">{subtask.name}</div>
                        {subtask.checklist.length > 0 && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {checklistCompleted}/{checklistTotal} completed
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0"
                        style={{
                          backgroundColor:
                            subtask.status === 'completed'
                              ? `${COLORS.success}20`
                              : subtask.status === 'in_progress'
                              ? `${COLORS.info}20`
                              : '#F3F4F6',
                          borderColor:
                            subtask.status === 'completed'
                              ? COLORS.success
                              : subtask.status === 'in_progress'
                              ? COLORS.info
                              : '#E5E7EB',
                        }}
                      >
                        {subtask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="bg-white rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${subtask.progress}%`,
                          backgroundColor: subtask.progress === 100 ? COLORS.success : COLORS.info,
                        }}
                      />
                    </div>
                    {subtask.assignee && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                        <User className="h-3 w-3" />
                        <span>{getTeamMemberByCode(subtask.assignee)?.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  column: typeof COLUMNS[0];
  tasks: TaskEnhanced[];
  onDrop: (taskId: string, newStatus: TaskEnhanced['status']) => void;
  onTaskClick?: (task: TaskEnhanced) => void;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
}

function DroppableColumn({ column, tasks, onDrop, onTaskClick, expandedTasks, toggleTask }: DroppableColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK_CARD,
    drop: (item: { taskId: string; currentStatus: TaskEnhanced['status'] }) => {
      if (item.currentStatus !== column.status) {
        onDrop(item.taskId, column.status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const IconComponent = column.icon;
  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`flex flex-col transition-all duration-200 ${
        isActive ? 'ring-2 ring-offset-2 rounded-lg' : ''
      }`}
      style={{
        ringColor: isActive ? column.color : 'transparent',
      }}
    >
      {/* Column Header */}
      <Card
        className="mb-3 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${column.color}15 0%, ${column.color}05 100%)`,
          borderTop: `3px solid ${column.color}`,
        }}
      >
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" style={{ color: column.color }} />
              <CardTitle className="text-sm font-bold" style={{ color: column.color }}>
                {column.label}
              </CardTitle>
            </div>
            <Badge
              className="font-semibold px-2.5 py-0.5"
              style={{ backgroundColor: column.color, color: '#FFFFFF' }}
            >
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks Container */}
      <div
        className={`flex-1 min-h-[400px] p-2 rounded-lg transition-all duration-200 ${
          isActive ? 'bg-slate-100' : 'bg-slate-50/50'
        }`}
      >
        {tasks.length === 0 ? (
          <div
            className={`h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isActive ? 'border-slate-400 bg-white' : 'border-slate-200 bg-white/50'
            }`}
          >
            <IconComponent className="h-12 w-12 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              {isActive ? 'Drop task here' : 'No tasks'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                expandedTasks={expandedTasks}
                toggleTask={toggleTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoardImproved({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleDrop = (taskId: string, newStatus: TaskEnhanced['status']) => {
    console.log(`Moving task ${taskId} to ${newStatus}`);
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
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

    return allTasks.filter((task) => {
      const matchesStatus = task.status === status && task.type === 'task';
      const matchesSearch = searchQuery === '' || 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Kanban Controls */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allTaskIds = new Set<string>();
                    const collectIds = (taskList: TaskEnhanced[]) => {
                      taskList.forEach((task) => {
                        allTaskIds.add(task.id);
                        if (task.children) collectIds(task.children);
                      });
                    };
                    collectIds(tasks);
                    setExpandedTasks(allTaskIds);
                  }}
                >
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExpandedTasks(new Set())}>
                  Collapse All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drag & Drop Instructions */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">👆</span>
            </div>
            <div>
              <div className="font-semibold text-amber-900 text-sm">Drag & Drop Enabled!</div>
              <div className="text-xs text-amber-700">
                Click and drag task cards between columns to update their status
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            return (
              <DroppableColumn
                key={column.status}
                column={column}
                tasks={columnTasks}
                onDrop={handleDrop}
                onTaskClick={onTaskClick}
                expandedTasks={expandedTasks}
                toggleTask={toggleTask}
              />
            );
          })}
        </div>

        {/* Footer Stats */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLUMNS.map((column) => {
                const count = getTasksByStatus(column.status).length;
                return (
                  <div key={column.status} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: column.color }}>
                      {count}
                    </div>
                    <div className="text-xs text-slate-600">{column.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
