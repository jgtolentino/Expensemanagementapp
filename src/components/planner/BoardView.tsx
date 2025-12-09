import React from 'react';
import { MoreHorizontal, Clock } from 'lucide-react';
import { PlannerProject, PlannerTask } from '../../lib/data/planner-projects';
import { DataSourceBadge } from '../ui/DataSourceBadge';

interface BoardViewProps {
  project: PlannerProject;
  onTaskClick: (task: PlannerTask, bucketName: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ project, onTaskClick }) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-100 p-6">
      <div className="flex gap-6 h-full">
        {project.buckets.map((bucket) => (
          <div key={bucket.bucket_name} className="flex-shrink-0 w-80 flex flex-col h-full max-h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-gray-700 text-sm uppercase tracking-wide">
                {bucket.bucket_name}
                <span className="ml-2 text-gray-400 font-normal normal-case">
                  {bucket.tasks.length}
                </span>
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Task List (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {bucket.tasks.map((task) => {
                const completed = task.checklist.filter(i => i.is_checked).length;
                const total = task.checklist.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                
                const isOverdue = new Date(task.due_date) < new Date();

                return (
                  <div 
                    key={task.id}
                    onClick={() => onTaskClick(task, bucket.bucket_name)}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.labels.map(l => (
                        <span key={l} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">
                          {l}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-gray-900 mb-3">{task.title}</h4>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>Checklist</span>
                        <span>{completed}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                      <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <DataSourceBadge source={task.meta.source} className="!px-1 !py-0 !text-[8px]" />
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600">
                          {task.assigned_to[0]?.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
