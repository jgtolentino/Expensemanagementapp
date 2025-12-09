// components/portfolio-dashboard-live.tsx
// Live Portfolio Dashboard - Uses Real Production CSV Data
// Replaces mock metrics with actual statistics from planner-projects.ts

import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  CheckCircle2,
  Heart,
  ListTodo,
  FolderKanban,
  Activity,
  AlertCircle
} from 'lucide-react';
import { DataSourceBadge } from './ui/DataSourceBadge';
import { 
  PORTFOLIO_LIVE_METRICS,
  LIVE_PROJECT_LIST,
  DASHBOARD_SUMMARY_CARDS,
  DETAILED_PROJECT_CARDS
} from '../lib/data/dashboard-live';
import { PLANNER_DATA_META } from '../lib/data/planner-projects';

export function PortfolioDashboardLive() {
  // Get icon component by name
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Briefcase, Heart, CheckSquare: ListTodo, TrendingUp
    };
    return icons[iconName] || Activity;
  };

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
      {/* Header Section */}
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
              Enterprise-wide financial systems upgrade and process automation initiative
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Owner: <span className="font-medium">CKVC</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Phase: <span className="font-medium">Execution</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Theme: <span className="font-medium">Digital Transformation</span></span>
              </div>
            </div>
          </div>

          {/* Health Score Badge */}
          <div className={`px-6 py-3 rounded-lg border-2 ${
            Number(PORTFOLIO_LIVE_METRICS.healthScore.value) >= 80 
              ? getRAGColorClass('Green')
              : Number(PORTFOLIO_LIVE_METRICS.healthScore.value) >= 60
              ? getRAGColorClass('Amber')
              : getRAGColorClass('Red')
          }`}>
            <div className="text-center">
              <div className="text-sm font-medium mb-1">Health Score</div>
              <div className="font-bold">{PORTFOLIO_LIVE_METRICS.healthScore.value}/100</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Odoo 18 CE + OCA Compatible | Data Source: Production CSV Import</span>
        </div>
      </div>

      {/* KPI Cards Row - ALL PRODUCTION DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_SUMMARY_CARDS.map((card, index) => {
          const IconComponent = card.icon === 'Briefcase' ? Briefcase :
                                card.icon === 'CheckSquare' ? ListTodo :
                                card.icon === 'Heart' ? Heart :
                                TrendingUp;

          const colorClasses = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            amber: 'text-amber-600',
            red: 'text-red-600',
            indigo: 'text-indigo-600'
          };

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-5 h-5 ${colorClasses[card.color as keyof typeof colorClasses]}`} />
                  <span className="text-sm text-gray-600">{card.title}</span>
                </div>
                <DataSourceBadge 
                  source={card.meta.source}
                  className="text-[8px]"
                />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="text-xs text-gray-500">{card.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Projects List - REAL DATA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            Active Projects ({LIVE_PROJECT_LIST.length})
          </h3>
          <DataSourceBadge 
            source="production"
            filename={PLANNER_DATA_META.filename}
            showTooltip={true}
          />
        </div>
        
        <div className="space-y-3">
          {DETAILED_PROJECT_CARDS.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{project.code}</span>
                    <span className="text-sm font-semibold text-gray-900">{project.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRAGColorClass(project.ragStatus)}`}>
                      {project.ragStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{project.description}</p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium $
{
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
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
                  <div className="text-xs text-gray-500">Buckets</div>
                  <div className="text-sm font-medium text-gray-900">{LIVE_PROJECT_LIST.find(p => p.id === project.id)?.bucketCount || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Overall Progress</div>
                  <div className="text-sm font-medium text-gray-900">{project.progress.tasks.percent}%</div>
                </div>
              </div>
              
              {/* Progress Bar - Task Level */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Task Completion</span>
                  <span>{project.progress.tasks.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      project.progress.tasks.percent >= 80 ? 'bg-green-600' :
                      project.progress.tasks.percent >= 50 ? 'bg-amber-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${project.progress.tasks.percent}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar - Checklist Level */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Checklist Completion</span>
                  <span>{project.progress.checklist.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${project.progress.checklist.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Note - No Budget Data */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 mb-1">Financial Data Not Available</h4>
            <p className="text-sm text-amber-800">
              The imported CSV files ({PLANNER_DATA_META.filename}) contain task and checklist data only. 
              Budget, CAPEX/OPEX, and financial variance metrics are not included in the current data source.
            </p>
            <p className="text-sm text-amber-700 mt-2">
              <strong>To enable financial tracking:</strong> Import budget data from accounting systems or 
              add financial columns to the CSV template.
            </p>
          </div>
          <DataSourceBadge source="mock" />
        </div>
      </div>

      {/* Data Source Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DataSourceBadge source="production" />
              <span className="text-sm font-semibold text-green-900">Production Data Sources</span>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• File: {PLANNER_DATA_META.filename}</li>
              <li>• Last Updated: {PLANNER_DATA_META.lastUpdated}</li>
              <li>• Projects: {PORTFOLIO_LIVE_METRICS.activeProjects.value}</li>
              <li>• Tasks: {PORTFOLIO_LIVE_METRICS.totalTasks.value}</li>
              <li>• Checklist Items: {PORTFOLIO_LIVE_METRICS.checklistItems.value}</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DataSourceBadge source="mock" />
              <span className="text-sm font-semibold text-amber-900">Placeholder Data</span>
            </div>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Budget: Not available in CSV</li>
              <li>• CAPEX/OPEX: Not available in CSV</li>
              <li>• Financial Variance: Not available in CSV</li>
              <li>• Risk Register: Not available in CSV</li>
              <li>• Team Directory: Not available in CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioDashboardLive;
