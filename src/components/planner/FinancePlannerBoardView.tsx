import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, MoreVertical, MessageSquare, Paperclip } from 'lucide-react';
import { FinancePlannerPlan, FinancePlannerTask } from '../../lib/data/finance-planner-data';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { DataSourceBadge } from '../ui/DataSourceBadge';
import { FinancePlannerTaskModal } from './FinancePlannerTaskModal';

interface FinancePlannerBoardViewProps {
  plan: FinancePlannerPlan;
}

export const FinancePlannerBoardView: React.FC<FinancePlannerBoardViewProps> = ({ plan }) => {
  const [selectedTask, setSelectedTask] = useState<{ task: FinancePlannerTask; bucketName: string } | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 p-6">
        <div className="flex gap-6 h-full min-w-max">
          {plan.buckets.map((bucket) => (
            <div key={bucket.bucket_id} className="flex-shrink-0 w-80 flex flex-col h-full max-h-full">
              {/* Bucket Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                    {bucket.bucket_name}
                  </h3>
                  <span className="text-gray-400 font-normal text-sm ml-1">
                    {bucket.tasks.length}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Task List (Scrollable) */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {bucket.tasks.map((task) => {
                  const completed = task.checklist.filter(i => i.is_checked).length;
                  const total = task.checklist.length;
                  const isOverdue = new Date(task.due_date) < new Date() && task.progress < 100;
                  const isDueSoon = !isOverdue && 
                    new Date(task.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                    task.progress < 100;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask({ task, bucketName: bucket.bucket_name })}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
                    >
                      {/* Priority Badge */}
                      {task.priority === 'Critical' || task.priority === 'High' ? (
                        <div className="mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-2 py-0.5 ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ) : null}

                      {/* Task Title */}
                      <h4 className="text-sm font-medium text-gray-900 mb-2 leading-tight">
                        {task.title}
                      </h4>

                      {/* Labels */}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.labels.map((label, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Checklist
                          </span>
                          <span className="font-medium">
                            {completed}/{total}
                          </span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {/* Due Date */}
                        <div className={`flex items-center gap-1.5 text-xs ${
                          isOverdue ? 'text-red-600 font-medium' :
                          isDueSoon ? 'text-amber-600' :
                          'text-gray-500'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(task.due_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: new Date(task.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                          {isOverdue && <AlertCircle className="w-3 h-3 ml-0.5" />}
                        </div>

                        {/* Right Side: Comments, Attachments, Assignee */}
                        <div className="flex items-center gap-2">
                          {/* Comments */}
                          {task.comments && task.comments > 0 ? (
                            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                              <MessageSquare className="w-3 h-3" />
                              {task.comments}
                            </div>
                          ) : null}

                          {/* Attachments */}
                          {task.attachments && task.attachments > 0 ? (
                            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                              <Paperclip className="w-3 h-3" />
                              {task.attachments}
                            </div>
                          ) : null}

                          {/* Data Source Badge */}
                          <DataSourceBadge 
                            source={task.meta.source} 
                            className="!px-1 !py-0 !text-[8px]" 
                          />

                          {/* Assignee Avatar */}
                          {task.assigned_to.length > 0 && (
                            <div className="flex -space-x-1">
                              {task.assigned_to.slice(0, 2).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-white"
                                  title={assignee}
                                >
                                  {assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                              ))}
                              {task.assigned_to.length > 2 && (
                                <div
                                  className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-700 border-2 border-white"
                                >
                                  +{task.assigned_to.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Task Button */}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  + Add task
                </button>
              </div>
            </div>
          ))}

          {/* Add Bucket Button */}
          <div className="flex-shrink-0 w-80">
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
              + Add bucket
            </button>
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
