import React, { useState } from 'react';
import { LayoutGrid, Kanban, Calendar as CalendarIcon, BarChart3, Plus, Star, Menu } from 'lucide-react';
import { 
  FINANCE_PLANNER_PLANS, 
  getPinnedPlans, 
  getFinancePlannerStats,
  FinancePlannerPlan 
} from '../../lib/data/finance-planner-data';
import { FinancePlannerBoardView } from './FinancePlannerBoardView';
import { FinancePlannerGridView } from './FinancePlannerGridView';
import { FinancePlannerScheduleView } from './FinancePlannerScheduleView';
import { FinancePlannerChartsView } from './FinancePlannerChartsView';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

type ViewMode = 'board' | 'grid' | 'schedule' | 'charts';

export const FinancePlannerView: React.FC = () => {
  const [activePlanId, setActivePlanId] = useState(FINANCE_PLANNER_PLANS[0].plan_id);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [showSidebar, setShowSidebar] = useState(true);

  const activePlan = FINANCE_PLANNER_PLANS.find(p => p.plan_id === activePlanId) || FINANCE_PLANNER_PLANS[0];
  const stats = getFinancePlannerStats();
  const pinnedPlans = getPinnedPlans();

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Plan Navigation */}
      {showSidebar && (
        <div className="w-72 bg-white border-r flex flex-col shadow-sm">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Finance Planner</h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Total Tasks</div>
                <div className="text-lg font-semibold text-blue-900">{stats.totalTasks}</div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 mb-1">Completed</div>
                <div className="text-lg font-semibold text-green-900">{stats.completedTasks}</div>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <div className="text-xs text-red-600 mb-1">Overdue</div>
                <div className="text-lg font-semibold text-red-900">{stats.overdueTasks}</div>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-600 mb-1">Critical</div>
                <div className="text-lg font-semibold text-amber-900">{stats.criticalTasks}</div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="p-4 space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              My Day
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              My Tasks
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              My Plans
            </button>
          </div>

          {/* Pinned Plans */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="mb-2 flex items-center gap-2 px-3">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pinned Plans</h3>
            </div>
            <div className="space-y-1">
              {pinnedPlans.map((plan) => (
                <button
                  key={plan.plan_id}
                  onClick={() => setActivePlanId(plan.plan_id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ${
                    activePlanId === plan.plan_id
                      ? 'bg-blue-50 text-blue-900 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: plan.plan_color }}
                  />
                  <span className="flex-1 truncate">{plan.plan_title}</span>
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0"
                  >
                    {plan.buckets.reduce((sum, b) => sum + b.tasks.length, 0)}
                  </Badge>
                </button>
              ))}
            </div>

            {/* All Plans */}
            <div className="mt-6 mb-2 px-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Plans</h3>
            </div>
            <div className="space-y-1">
              {FINANCE_PLANNER_PLANS.filter(p => !p.is_pinned).map((plan) => (
                <button
                  key={plan.plan_id}
                  onClick={() => setActivePlanId(plan.plan_id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ${
                    activePlanId === plan.plan_id
                      ? 'bg-blue-50 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: plan.plan_color }}
                  />
                  <span className="flex-1 truncate">{plan.plan_title}</span>
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0"
                  >
                    {plan.buckets.reduce((sum, b) => sum + b.tasks.length, 0)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          
          {/* Plan Title & Description */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 md:hidden"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: activePlan.plan_color }}
              >
                <span className="text-sm font-semibold">
                  {activePlan.plan_title.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{activePlan.plan_title}</h1>
                <p className="text-xs text-gray-500">{activePlan.description}</p>
              </div>
            </div>
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
              onClick={() => setViewMode('schedule')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                viewMode === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Schedule
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
            <button
              onClick={() => setViewMode('charts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                viewMode === 'charts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Charts
            </button>
          </div>
        </div>

        {/* Main View Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === 'board' && <FinancePlannerBoardView plan={activePlan} />}
          {viewMode === 'schedule' && <FinancePlannerScheduleView plan={activePlan} />}
          {viewMode === 'grid' && <FinancePlannerGridView plan={activePlan} />}
          {viewMode === 'charts' && <FinancePlannerChartsView plan={activePlan} />}
        </div>
      </div>
    </div>
  );
};
