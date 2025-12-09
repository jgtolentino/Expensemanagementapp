import React, { useState } from 'react';
import { ArrowUpDown, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FinancePlannerPlan, FinancePlannerTask } from '../../lib/data/finance-planner-data';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FinancePlannerTaskModal } from './FinancePlannerTaskModal';

interface FinancePlannerGridViewProps {
  plan: FinancePlannerPlan;
}

type SortField = 'title' | 'bucket' | 'priority' | 'due_date' | 'progress' | 'assigned';
type SortDirection = 'asc' | 'desc';

export const FinancePlannerGridView: React.FC<FinancePlannerGridViewProps> = ({ plan }) => {
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTask, setSelectedTask] = useState<{ task: FinancePlannerTask; bucketName: string } | null>(null);

  // Flatten all tasks with bucket info
  const allTasks = plan.buckets.flatMap(bucket =>
    bucket.tasks.map(task => ({
      ...task,
      bucketName: bucket.bucket_name,
      bucketColor: bucket.color
    }))
  );

  // Sort tasks
  const sortedTasks = [...allTasks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'bucket':
        comparison = a.bucketName.localeCompare(b.bucketName);
        break;
      case 'priority':
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case 'due_date':
        comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'assigned':
        comparison = (a.assigned_to[0] || '').localeCompare(b.assigned_to[0] || '');
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors group"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${
        sortField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
      }`} />
    </button>
  );

  return (
    <>
      <div className="flex-1 overflow-auto bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
            <p className="text-sm text-gray-500">{sortedTasks.length} tasks across {plan.buckets.length} buckets</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </TableHead>
              <TableHead className="min-w-[250px]">
                <SortButton field="title">Task Name</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="bucket">Bucket</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="priority">Priority</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="assigned">Assigned To</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="due_date">Due Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="progress">Progress</SortButton>
              </TableHead>
              <TableHead className="w-[100px]">Labels</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const isOverdue = new Date(task.due_date) < new Date() && task.progress < 100;
              const completed = task.checklist.filter(i => i.is_checked).length;
              const total = task.checklist.length;

              return (
                <TableRow
                  key={task.id}
                  onClick={() => setSelectedTask({ task, bucketName: task.bucketName })}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={task.progress === 100}
                      onChange={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1 h-6 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: task.bucketColor }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {task.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {task.bucketName}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      {task.assigned_to.slice(0, 2).map((assignee, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[9px] font-semibold text-white"
                          title={assignee}
                        >
                          {assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {task.assigned_to.length > 2 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{task.assigned_to.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className={`flex items-center gap-1.5 text-sm ${
                      isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'
                    }`}>
                      {isOverdue && <AlertCircle className="w-4 h-4" />}
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: new Date(task.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="h-1.5 w-16" />
                      <span className="text-xs text-gray-600 w-12">
                        {completed}/{total}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.labels.slice(0, 2).map((label, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {label}
                        </span>
                      ))}
                      {task.labels.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{task.labels.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks in this plan yet</p>
          </div>
        )}
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
