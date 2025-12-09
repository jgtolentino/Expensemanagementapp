import React, { useState } from 'react';
import { LayoutGrid, Kanban, CheckSquare } from 'lucide-react';
import { PLANNER_RAW_DATA, PlannerTask } from '../../lib/data/planner-projects';
import { BoardView } from './BoardView';
import { GridView } from './GridView';
import { TaskDetailModal } from './TaskDetailModal';

export const PlannerView: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState(PLANNER_RAW_DATA[0].plan_id);
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const [selectedTask, setSelectedTask] = useState<{task: PlannerTask, bucket: string} | null>(null);

  const activeProject = PLANNER_RAW_DATA.find(p => p.plan_id === activeProjectId) || PLANNER_RAW_DATA[0];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Project Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {PLANNER_RAW_DATA.map(project => (
            <button
              key={project.plan_id}
              onClick={() => setActiveProjectId(project.plan_id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                activeProjectId === project.plan_id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {project.plan_title}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
              viewMode === 'board' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Kanban className="w-4 h-4" />
            Board
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'board' ? (
          <BoardView 
            project={activeProject} 
            onTaskClick={(task, bucket) => setSelectedTask({task, bucket})} 
          />
        ) : (
          <GridView 
            project={activeProject} 
            onTaskClick={(task, bucket) => setSelectedTask({task, bucket})} 
          />
        )}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask.task}
          bucketName={selectedTask.bucket}
          projectName={activeProject.plan_title}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
