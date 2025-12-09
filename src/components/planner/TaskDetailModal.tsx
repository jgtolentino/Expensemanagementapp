import React, { useState } from 'react';
import { X, CheckSquare, Square, Calendar, User, Tag } from 'lucide-react';
import { PlannerTask, PlannerChecklistItem } from '../../lib/data/planner-projects';
import { DataSourceBadge } from '../ui/DataSourceBadge';

interface TaskDetailModalProps {
  task: PlannerTask;
  bucketName: string;
  projectName: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, bucketName, projectName, onClose }) => {
  // Local state for checklist to support interactivity
  const [checklist, setChecklist] = useState<PlannerChecklistItem[]>(task.checklist);

  const toggleItem = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
    ));
  };

  const completedCount = checklist.filter(i => i.is_checked).length;
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="font-semibold">{projectName}</span>
              <span>/</span>
              <span>{bucketName}</span>
              <DataSourceBadge source={task.meta.source} />
            </div>
            <h2 className="text-2xl text-gray-900">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Checklist Progress</span>
                <span className="text-gray-500">{completedCount}/{checklist.length} completed</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    item.is_checked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`mt-0.5 ${item.is_checked ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.is_checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm ${item.is_checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {item.content}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
            <h3 className="text-xs text-gray-400 uppercase mb-4">Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {task.start_date}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {task.due_date}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Assigned To</label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  {task.assigned_to.join(', ')}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map(label => (
                    <span key={label} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-600">
                      <Tag className="w-3 h-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
