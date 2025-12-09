import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, MessageSquare, Paperclip, AlertCircle, Tag } from 'lucide-react';
import { FinancePlannerTask } from '../../lib/data/finance-planner-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { DataSourceBadge } from '../ui/DataSourceBadge';

interface FinancePlannerTaskModalProps {
  task: FinancePlannerTask;
  bucketName: string;
  planName: string;
  onClose: () => void;
}

export const FinancePlannerTaskModal: React.FC<FinancePlannerTaskModalProps> = ({
  task,
  bucketName,
  planName,
  onClose
}) => {
  const [checklist, setChecklist] = useState(task.checklist);

  const completed = checklist.filter(item => item.is_checked).length;
  const total = checklist.length;
  const isOverdue = new Date(task.due_date) < new Date() && task.progress < 100;

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
      )
    );
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{planName}</span>
                <span>›</span>
                <span>{bucketName}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Priority & Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={`${getPriorityColor(task.priority)}`}
            >
              {task.priority} Priority
            </Badge>
            <Badge variant="outline">
              {task.progress === 100 ? 'Completed' : task.progress > 0 ? 'In Progress' : 'Not Started'}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </Badge>
            )}
            <DataSourceBadge source={task.meta.source} />
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(task.start_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                isOverdue ? 'text-red-600' : 'text-gray-700'
              }`}>
                <Clock className="w-4 h-4" />
                Due Date
              </h3>
              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                {isOverdue && (
                  <span className="ml-2 text-xs">
                    ({Math.ceil((new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assigned To
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.assigned_to.map((assignee, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-semibold text-white">
                    {assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{assignee}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Progress
              </h3>
              <span className="text-sm text-gray-600">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Checklist
              </h3>
              <span className="text-sm text-gray-500">
                {completed} of {total} complete
              </span>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    className={`flex-1 text-sm cursor-pointer ${
                      item.is_checked ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    {item.content}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments & Comments Placeholder */}
          <div className="grid grid-cols-2 gap-4">
            {task.attachments && task.attachments > 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                  <Paperclip className="w-4 h-4" />
                  <span className="font-medium">Attachments</span>
                </div>
                <p className="text-sm text-gray-500">{task.attachments} file{task.attachments !== 1 ? 's' : ''}</p>
              </div>
            ) : null}

            {task.comments && task.comments > 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Comments</span>
                </div>
                <p className="text-sm text-gray-500">{task.comments} comment{task.comments !== 1 ? 's' : ''}</p>
              </div>
            ) : null}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Task ID: {task.id}</span>
              <span>Last updated: {new Date(task.meta.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
