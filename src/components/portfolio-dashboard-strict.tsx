// components/portfolio-dashboard-strict.tsx
// Strict Production Dashboard - ONLY Shows Real CSV Data
// All mock/unsupported features are hidden via feature flags

import React from 'react';
import { 
  Briefcase, 
  CheckCircle2,
  ListTodo,
  Calendar,
  Users,
  Tag,
  TrendingUp,
  Clock,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { DataSourceBadge } from './ui/DataSourceBadge';
import { 
  LIVE_PROJECT_LIST,
  DETAILED_PROJECT_CARDS
} from '../lib/data/dashboard-live';
import { 
  LIVE_PORTFOLIO_STATS,
  LIVE_TASK_DETAILS,
  LIVE_BUCKET_STATS
} from '../lib/data/planner-stats';
import { PLANNER_DATA_META } from '../lib/data/planner-projects';
import { 
  FEATURE_FLAGS,
  shouldShowWidget,
  getCurrentMode,
  getEnabledFeatures,
  getDisabledFeatures 
} from '../lib/config/feature-flags';

export function PortfolioDashboardStrict() {
  // Calculate additional metrics from real data
  const taskDetails = LIVE_TASK_DETAILS;
  const bucketStats = LIVE_BUCKET_STATS;
  
  // Assignee distribution
  const assigneeCount = new Set(
    taskDetails.flatMap(task => task.assignees)
  ).size;
  
  // Label distribution
  const labelCount = new Set(
    taskDetails.flatMap(task => task.labels)
  ).size;
  
  // Timeline metrics
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = taskDetails.filter(task => task.dueDate < today && !task.isComplete).length;
  const upcomingTasks = taskDetails.filter(task => {
    const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7 && !task.isComplete;
  }).length;

  // Get RAG color classes
  const getRAGColorClass = (color: string) => {
    switch (color) {
      case 'Green': return 'bg-green-100 text-green-800 border-green-300';
      case 'Amber': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Red': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section - Production Data Only */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl text-gray-900">Financial Systems Modernization</h1>
              <DataSourceBadge 
                source="production" 
                filename={PLANNER_DATA_META.filename}
                lastUpdated={PLANNER_DATA_META.lastUpdated}
                showTooltip={true}
              />
            </div>
            <p className="text-gray-600 mb-4">
              Task Command Center - Production Data Only
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Mode: <span className="font-medium text-green-700">{getCurrentMode()}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Data Source: <span className="font-medium">CSV Import</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Last Updated: <span className="font-medium">{PLANNER_DATA_META.lastUpdated}</span></span>
              </div>
            </div>
          </div>

          {/* Production Data Badge */}
          <div className="px-6 py-3 rounded-lg border-2 bg-green-100 text-green-800 border-green-300">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">🟢 PRODUCTION ONLY</div>
              <div className="text-xs">No Mock Data</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Strict Production Mode | Showing only CSV-backed data | Odoo 18 CE Compatible</span>
        </div>
      </div>

      {/* KPI Cards Row - ONLY REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        {shouldShowWidget('show_task_metrics') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Active Projects</span>
              </div>
              <DataSourceBadge source="production" className="text-[8px]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {LIVE_PORTFOLIO_STATS.projectCount}
            </div>
            <div className="text-xs text-gray-500">
              {LIVE_PORTFOLIO_STATS.bucketCount} phases total
            </div>
          </div>
        )}

        {/* Card 2: Total Tasks */}
        {shouldShowWidget('show_task_metrics') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Total Tasks</span>
              </div>
              <DataSourceBadge source="production" className="text-[8px]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {LIVE_PORTFOLIO_STATS.taskCount}
            </div>
            <div className="text-xs text-gray-500">
              {LIVE_PORTFOLIO_STATS.completedTaskCount} completed
            </div>
          </div>
        )}

        {/* Card 3: Active Assignments */}
        {shouldShowWidget('show_team_allocation') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Active Assignments</span>
              </div>
              <DataSourceBadge source="production" className="text-[8px]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {assigneeCount}
            </div>
            <div className="text-xs text-gray-500">
              Unique assignees
            </div>
          </div>
        )}

        {/* Card 4: Checklist Progress */}
        {shouldShowWidget('show_task_metrics') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-600">Checklist Progress</span>
              </div>
              <DataSourceBadge source="production" className="text-[8px]" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {LIVE_PORTFOLIO_STATS.checklistProgressPercent}%
            </div>
            <div className="text-xs text-gray-500">
              {LIVE_PORTFOLIO_STATS.completedChecklistCount}/{LIVE_PORTFOLIO_STATS.checklistItemCount} items
            </div>
          </div>
        )}
      </div>

      {/* Timeline Metrics - Real Dates from CSV */}
      {shouldShowWidget('show_timeline_view') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Timeline Status
            </h3>
            <DataSourceBadge 
              source="production"
              filename={PLANNER_DATA_META.filename}
              showTooltip={true}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-red-900">Overdue</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{overdueTasks}</div>
              <div className="text-xs text-red-700">Tasks past due date</div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Due This Week</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">{upcomingTasks}</div>
              <div className="text-xs text-amber-700">Tasks due in 7 days</div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">On Track</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {LIVE_PORTFOLIO_STATS.taskCount - overdueTasks - upcomingTasks - LIVE_PORTFOLIO_STATS.completedTaskCount}
              </div>
              <div className="text-xs text-green-700">Tasks with buffer time</div>
            </div>
          </div>
        </div>
      )}

      {/* Projects List - REAL DATA ONLY */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            Active Projects ({LIVE_PROJECT_LIST.length})
          </h3>
          <DataSourceBadge 
            source="production"
            filename={PLANNER_DATA_META.filename}
            showTooltip={true}
          />
        </div>
        
        <div className="space-y-4">
          {DETAILED_PROJECT_CARDS.map((project) => {
            const projectTasks = taskDetails.filter(task => task.projectId === project.id);
            const projectAssignees = new Set(projectTasks.flatMap(task => task.assignees));
            const projectLabels = new Set(projectTasks.flatMap(task => task.labels));
            
            return (
              <div key={project.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {project.code}
                      </span>
                      <span className="font-semibold text-gray-900">{project.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRAGColorClass(project.ragStatus)}`}>
                        {project.ragStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{project.description}</p>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{projectAssignees.size} assignees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{projectLabels.size} labels</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ListTodo className="w-3 h-3" />
                        <span>{project.progress.tasks.total} tasks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{project.progress.checklist.total} checklist items</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </div>
                </div>
                
                {/* Progress Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Task Progress</div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.progress.tasks.completed}/{project.progress.tasks.total} ({project.progress.tasks.percent}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Checklist Progress</div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.progress.checklist.completed}/{project.progress.checklist.total} ({project.progress.checklist.percent}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Buckets/Phases</div>
                    <div className="text-sm font-medium text-gray-900">
                      {LIVE_PROJECT_LIST.find(p => p.id === project.id)?.bucketCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Overall Status</div>
                    <div className={`text-sm font-medium ${
                      project.progress.tasks.percent >= 80 ? 'text-green-700' :
                      project.progress.tasks.percent >= 50 ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {project.progress.tasks.percent}% Complete
                    </div>
                  </div>
                </div>
                
                {/* Progress Bars */}
                <div className="space-y-2">
                  {/* Task Completion Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Task Completion</span>
                      <span>{project.progress.tasks.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          project.progress.tasks.percent >= 80 ? 'bg-green-600' :
                          project.progress.tasks.percent >= 50 ? 'bg-amber-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${project.progress.tasks.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Completion Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Checklist Completion</span>
                      <span>{project.progress.checklist.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress.checklist.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Flag Status - What's Hidden */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Strict Production Mode Active</h4>
            <p className="text-sm text-blue-800 mb-3">
              The following features are hidden because they are not supported by the current CSV data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              {getDisabledFeatures().map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3">
              To enable these features, import additional CSV files with budget, risk, or strategy data.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Data Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DataSourceBadge source="production" />
              <span className="text-sm font-semibold text-green-900">Available Data (CSV)</span>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• File: {PLANNER_DATA_META.filename}</li>
              <li>• Last Updated: {PLANNER_DATA_META.lastUpdated}</li>
              <li>• Projects: {LIVE_PORTFOLIO_STATS.projectCount}</li>
              <li>• Phases/Buckets: {LIVE_PORTFOLIO_STATS.bucketCount}</li>
              <li>• Tasks: {LIVE_PORTFOLIO_STATS.taskCount}</li>
              <li>• Checklist Items: {LIVE_PORTFOLIO_STATS.checklistItemCount}</li>
              <li>• Assignees: {assigneeCount}</li>
              <li>• Labels: {labelCount}</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">Not Available (Hidden)</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Budget/Financial Data</li>
              <li>• CAPEX/OPEX Classification</li>
              <li>• Risk Register</li>
              <li>• Strategic Theme Mapping</li>
              <li>• Resource Rates</li>
              <li>• Multi-Currency</li>
              <li>• Health Score (insufficient data)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioDashboardStrict;
