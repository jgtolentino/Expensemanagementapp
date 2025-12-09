import React from 'react';
import { ChevronDown, Circle, CheckCircle2, Clock } from 'lucide-react';
import { PlannerProject, PlannerTask } from '../../lib/data/planner-projects';
import { DataSourceBadge } from '../ui/DataSourceBadge';

interface GridViewProps {
  project: PlannerProject;
  onTaskClick: (task: PlannerTask, bucketName: string) => void;
}

export const GridView: React.FC<GridViewProps> = ({ project, onTaskClick }) => {
  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b w-8">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Task Name</th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Progress</th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Bucket</th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Assigned To</th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Due Date</th>
            <th className="py-3 px-4 text-xs text-gray-500 uppercase tracking-wider border-b">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {project.buckets.map((bucket) => (
            <React.Fragment key={bucket.bucket_name}>
              {/* Group Header */}
              <tr className="bg-gray-50/50">
                <td colSpan={7} className="py-2 px-4 text-xs text-gray-700 flex items-center gap-2">
                  <ChevronDown className="w-3 h-3" />
                  {bucket.bucket_name}
                </td>
              </tr>
              
              {/* Task Rows */}
              {bucket.tasks.map((task) => {
                 const completed = task.checklist.filter(i => i.is_checked).length;
                 const total = task.checklist.length;
                 const isDone = total > 0 && completed === total;
                 const isStarted = completed > 0;

                return (
                  <tr 
                    key={task.id} 
                    onClick={() => onTaskClick(task, bucket.bucket_name)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 border-b border-gray-100 w-8" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-900">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : isStarted ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span>{completed}/{total} items</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {bucket.bucket_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                          {task.assigned_to[0]?.charAt(0)}
                        </div>
                        {task.assigned_to[0]}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3 h-3" />
                        {task.due_date}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-100">
                      <DataSourceBadge source={task.meta.source} />
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
