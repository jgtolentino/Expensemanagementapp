import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { FinancePlannerPlan, FinancePlannerTask, FinancePlannerBucket } from '../../lib/data/finance-planner-data';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { FinancePlannerTaskModal } from './FinancePlannerTaskModal';

interface FinancePlannerScheduleViewProps {
  plan: FinancePlannerPlan;
}

interface TaskWithBucket extends FinancePlannerTask {
  bucketName: string;
  bucketColor: string;
}

export const FinancePlannerScheduleView: React.FC<FinancePlannerScheduleViewProps> = ({ plan }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<{ task: FinancePlannerTask; bucketName: string } | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [hideFutureRecurring, setHideFutureRecurring] = useState(false);
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set(plan.buckets.map(b => b.bucket_id)));

  // Get all tasks with dates and bucket info
  const allTasks: TaskWithBucket[] = plan.buckets.flatMap(bucket =>
    bucket.tasks.map(task => ({
      ...task,
      bucketName: bucket.bucket_name,
      bucketColor: bucket.color
    }))
  );

  // Get calendar days for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Build calendar grid (including leading/trailing empty cells)
  const calendarWeeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  // Add empty cells before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add all days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      calendarWeeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add trailing empty cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendarWeeks.push(currentWeek);
  }

  // Get tasks that span a specific date
  const getTasksSpanningDate = (day: number | null): TaskWithBucket[] => {
    if (!day) return [];
    const checkDate = new Date(year, month, day);
    
    return allTasks.filter(task => {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.due_date);
      
      // Task spans this date if checkDate is between start and end (inclusive)
      return checkDate >= new Date(startDate.setHours(0, 0, 0, 0)) && 
             checkDate <= new Date(endDate.setHours(23, 59, 59, 999));
    });
  };

  // Calculate task bar positioning for a task on a specific week row
  const getTaskBarInfo = (task: TaskWithBucket, weekIndex: number, week: (number | null)[]) => {
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.due_date);
    
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();
    
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth();
    const endYear = endDate.getFullYear();
    
    // Find which columns (0-6) this task occupies in this week
    let startCol = -1;
    let endCol = -1;
    
    week.forEach((day, colIndex) => {
      if (!day) return;
      
      const cellDate = new Date(year, month, day);
      const taskStart = new Date(startYear, startMonth, startDay);
      const taskEnd = new Date(endYear, endMonth, endDay);
      
      if (cellDate >= taskStart && cellDate <= taskEnd) {
        if (startCol === -1) startCol = colIndex;
        endCol = colIndex;
      }
    });
    
    if (startCol === -1) return null;
    
    return {
      startCol,
      span: endCol - startCol + 1,
      isStart: startMonth === month && week[startCol] === startDay,
      isEnd: endMonth === month && week[endCol] === endDay
    };
  };

  // Group tasks by week and position
  const getWeekTasks = (weekIndex: number, week: (number | null)[]) => {
    const tasksInWeek = new Map<string, ReturnType<typeof getTaskBarInfo>>();
    
    allTasks.forEach(task => {
      const barInfo = getTaskBarInfo(task, weekIndex, week);
      if (barInfo) {
        tasksInWeek.set(task.id, barInfo);
      }
    });
    
    return tasksInWeek;
  };

  // Get unscheduled tasks (tasks that don't fall in current month)
  const getUnscheduledTasksByBucket = (): { bucket: FinancePlannerBucket; tasks: TaskWithBucket[] }[] => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    return plan.buckets.map(bucket => {
      const unscheduledTasks = allTasks.filter(task => {
        if (task.bucketName !== bucket.bucket_name) return false;
        
        const taskStart = new Date(task.start_date);
        const taskEnd = new Date(task.due_date);
        
        // Task is unscheduled if it doesn't overlap with current month
        return taskEnd < monthStart || taskStart > monthEnd;
      });
      
      return { bucket, tasks: unscheduledTasks };
    }).filter(group => group.tasks.length > 0);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const toggleBucket = (bucketId: string) => {
    const newExpanded = new Set(expandedBuckets);
    if (newExpanded.has(bucketId)) {
      newExpanded.delete(bucketId);
    } else {
      newExpanded.add(bucketId);
    }
    setExpandedBuckets(newExpanded);
  };

  const getLabelColor = (label: string) => {
    // Map labels to colors like Microsoft Planner
    const colorMap: { [key: string]: string } = {
      'Finance': 'bg-pink-100 text-pink-700 border-pink-200',
      'Critical': 'bg-red-100 text-red-700 border-red-200',
      'Compliance': 'bg-blue-100 text-blue-700 border-blue-200',
      'Review': 'bg-purple-100 text-purple-700 border-purple-200',
      'HR': 'bg-green-100 text-green-700 border-green-200',
      'IT': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Payment': 'bg-amber-100 text-amber-700 border-amber-200',
      '1601C': 'bg-blue-100 text-blue-700 border-blue-200',
      '2550Q': 'bg-purple-100 text-purple-700 border-purple-200',
      'Withholding Tax': 'bg-pink-100 text-pink-700 border-pink-200',
      'VAT': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    
    return colorMap[label] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const unscheduledGroups = getUnscheduledTasksByBucket();

  return (
    <>
      <div className="flex-1 overflow-hidden flex bg-white">
        {/* Calendar View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Controls */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[140px] text-center">
                  <button className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                    {monthNames[month]} {year}
                    <ChevronDown className="inline-block w-3 h-3 ml-1" />
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Hide future recurring tasks toggle */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Hide future recurring tasks</span>
                <Switch
                  checked={hideFutureRecurring}
                  onCheckedChange={setHideFutureRecurring}
                  className="scale-75"
                />
              </div>

              {/* Week/Month toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    viewMode === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    viewMode === 'month' ? 'bg-white text-gray-900 border-l border-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b sticky top-0 bg-white z-10">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Weeks */}
              {calendarWeeks.map((week, weekIndex) => {
                const weekTasks = getWeekTasks(weekIndex, week);
                const tasksToRender = Array.from(weekTasks.entries());

                return (
                  <div key={weekIndex} className="relative border-b">
                    {/* Week row - day numbers */}
                    <div className="grid grid-cols-7">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`min-h-[80px] p-1 border-r last:border-r-0 relative ${
                            !day ? 'bg-gray-50' : ''
                          } ${isToday(day) ? 'bg-blue-50' : ''}`}
                        >
                          {day && (
                            <div className={`text-xs font-medium mb-1 ${
                              isToday(day) ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {day}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Task bars overlay */}
                    <div className="absolute top-6 left-0 right-0 pointer-events-none">
                      {tasksToRender.map(([taskId, barInfo], taskIndex) => {
                        if (!barInfo) return null;
                        
                        const task = allTasks.find(t => t.id === taskId);
                        if (!task) return null;

                        const leftPercent = (barInfo.startCol / 7) * 100;
                        const widthPercent = (barInfo.span / 7) * 100;

                        return (
                          <div
                            key={taskId}
                            className="absolute pointer-events-auto"
                            style={{
                              top: `${taskIndex * 28}px`,
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              paddingLeft: '4px',
                              paddingRight: '4px'
                            }}
                          >
                            <div
                              onClick={() => setSelectedTask({ task, bucketName: task.bucketName })}
                              className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-all hover:shadow-md group border"
                              style={{
                                backgroundColor: task.bucketColor + '20',
                                borderColor: task.bucketColor,
                                borderLeftWidth: barInfo.isStart ? '3px' : '1px',
                                borderRightWidth: barInfo.isEnd ? '1px' : '0px'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.progress === 100}
                                onChange={(e) => e.stopPropagation()}
                                className="w-3 h-3 rounded border-gray-400 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                              />
                              {task.labels.length > 0 && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] px-1 py-0 ${getLabelColor(task.labels[0])}`}
                                >
                                  {task.labels[0]}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-900 truncate flex-1">
                                {task.title}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Unscheduled Tasks */}
        <div className="w-80 border-l bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <h3 className="text-sm font-semibold text-gray-900">Unscheduled tasks</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {unscheduledGroups.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                All tasks are scheduled in this month
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {unscheduledGroups.map(({ bucket, tasks }) => (
                  <div key={bucket.bucket_id}>
                    {/* Bucket Header */}
                    <button
                      onClick={() => toggleBucket(bucket.bucket_id)}
                      className="w-full flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{bucket.bucket_name}</span>
                      {expandedBuckets.has(bucket.bucket_id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {/* Tasks */}
                    {expandedBuckets.has(bucket.bucket_id) && (
                      <div className="space-y-2 mt-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask({ task, bucketName: task.bucketName })}
                            className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={task.progress === 100}
                              onChange={(e) => e.stopPropagation()}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              {task.labels.length > 0 && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] px-1.5 py-0 mb-1 ${getLabelColor(task.labels[0])}`}
                                >
                                  {task.labels[0]}
                                </Badge>
                              )}
                              <div className="text-sm text-gray-900 leading-tight">
                                {task.title}
                              </div>
                              {task.checklist.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {task.checklist.filter(i => i.is_checked).length} / {task.checklist.length}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add task button */}
                <button className="w-full flex items-center gap-2 p-3 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Plus className="w-4 h-4" />
                  Add task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <FinancePlannerTaskModal
          task={selectedTask.task}
          bucketName={selectedTask.bucketName}
          planName={plan.plan_title}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};
