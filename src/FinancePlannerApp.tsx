import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Calendar, FileText, Users, UserPlus, UserMinus, LayoutGrid, 
  Plus, TrendingUp, Clock, CheckCircle2, AlertTriangle, Menu,
  Home, Settings, HelpCircle, Bell, Search, Star
} from 'lucide-react';
import { 
  FINANCE_PLANNER_PLANS, 
  FINANCE_PLANNER_TEMPLATES,
  getPinnedPlans,
  getFinancePlannerStats,
  getPlansByCategory,
  getTemplatesByCategory,
  FinancePlannerPlan,
  FinancePlannerTemplate
} from './lib/data/finance-planner-data';
import { FinancePlannerView } from './components/planner/FinancePlannerView';

type ViewType = 'home' | 'plan' | 'templates' | 'calendar' | 'myTasks';

export default function FinancePlannerApp() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const stats = getFinancePlannerStats();
  const pinnedPlans = getPinnedPlans();
  const financePlans = getPlansByCategory('Finance');
  const hrPlans = getPlansByCategory('HR');

  const handleOpenPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setActiveView('plan');
  };

  // Plan Detail View (Full Planner UI)
  if (activeView === 'plan' && selectedPlanId) {
    const plan = FINANCE_PLANNER_PLANS.find(p => p.plan_id === selectedPlanId);
    if (!plan) return null;

    return (
      <div className="h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('home')}
                className="text-white hover:bg-white/20 h-8"
              >
                ← Back to Plans
              </Button>
              <div className="text-sm opacity-90">Finance Planner</div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Planner View */}
        <div className="flex-1 overflow-hidden">
          <FinancePlannerView />
        </div>
      </div>
    );
  }

  // Templates View
  if (activeView === 'templates') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('home')}
                  className="text-white hover:bg-white/20"
                >
                  ← Back
                </Button>
                <h1 className="text-2xl font-bold">Plan Templates</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Finance Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTemplatesByCategory('Finance').map((template) => (
                <Card key={template.template_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <Badge variant="outline" className="text-xs">Finance</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Benefits:</div>
                        <ul className="space-y-1">
                          {template.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Workflow stages:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.default_buckets.map((bucket, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                              {bucket}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* HR Templates */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTemplatesByCategory('HR').map((template) => (
                <Card key={template.template_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Users className="h-8 w-8 text-green-600" />
                      <Badge variant="outline" className="text-xs">HR</Badge>
                    </div>
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Benefits:</div>
                        <ul className="space-y-1">
                          {template.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Workflow stages:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.default_buckets.map((bucket, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                              {bucket}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-2 bg-green-600 hover:bg-green-700">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Finance Planner</h1>
                  <p className="text-sm text-blue-100">BIR Tax Filing • Month-end Closing • HR Workflows</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-white/20">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-1 -mb-px">
              <button
                onClick={() => setActiveView('home')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'home'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-100 hover:text-white hover:border-white/50'
                }`}
              >
                <Home className="h-4 w-4 inline-block mr-2" />
                Home
              </button>
              <button
                onClick={() => setActiveView('myTasks')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'myTasks'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-100 hover:text-white hover:border-white/50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 inline-block mr-2" />
                My Tasks
              </button>
              <button
                onClick={() => setActiveView('templates')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeView === 'templates'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-100 hover:text-white hover:border-white/50'
                }`}
              >
                <LayoutGrid className="h-4 w-4 inline-block mr-2" />
                Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-8 w-8 opacity-80" />
                <div className="text-3xl font-bold">{stats.totalTasks}</div>
              </div>
              <div className="text-sm opacity-90">Total Tasks</div>
              <div className="mt-2 text-xs opacity-75">
                {stats.completionRate}% completion rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <div className="text-3xl font-bold">{stats.completedTasks}</div>
              </div>
              <div className="text-sm opacity-90">Completed</div>
              <div className="mt-2 text-xs opacity-75">
                {stats.totalTasks - stats.completedTasks} remaining
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-8 w-8 opacity-80" />
                <div className="text-3xl font-bold">{stats.overdueTasks}</div>
              </div>
              <div className="text-sm opacity-90">Overdue</div>
              <div className="mt-2 text-xs opacity-75">
                Needs immediate attention
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 opacity-80" />
                <div className="text-3xl font-bold">{stats.criticalTasks}</div>
              </div>
              <div className="text-sm opacity-90">Critical Tasks</div>
              <div className="mt-2 text-xs opacity-75">
                High priority items
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pinned Plans */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900">Pinned Plans</h2>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {pinnedPlans.map((plan) => {
              const totalTasks = plan.buckets.reduce((sum, b) => sum + b.tasks.length, 0);
              const completedTasks = plan.buckets.reduce(
                (sum, b) => sum + b.tasks.filter(t => t.progress === 100).length,
                0
              );
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              const categoryIcons = {
                'Finance': FileText,
                'HR': Users,
                'Compliance': AlertTriangle
              };
              const Icon = categoryIcons[plan.category] || Calendar;

              return (
                <Card
                  key={plan.plan_id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                  onClick={() => handleOpenPlan(plan.plan_id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-3 rounded-lg text-white"
                        style={{ backgroundColor: plan.plan_color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <Badge variant="outline" className="text-xs">
                          {plan.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{plan.plan_title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{completedTasks}/{totalTasks}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <LayoutGrid className="h-4 w-4" />
                            <span>{plan.buckets.length} stages</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Open →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All Plans - Finance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financePlans.map((plan) => {
              const totalTasks = plan.buckets.reduce((sum, b) => sum + b.tasks.length, 0);
              const completedTasks = plan.buckets.reduce(
                (sum, b) => sum + b.tasks.filter(t => t.progress === 100).length,
                0
              );

              return (
                <Card
                  key={plan.plan_id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenPlan(plan.plan_id)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: plan.plan_color }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{plan.plan_title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{completedTasks}/{totalTasks} tasks</span>
                      <span>{plan.buckets.length} stages</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All Plans - HR */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hrPlans.map((plan) => {
              const totalTasks = plan.buckets.reduce((sum, b) => sum + b.tasks.length, 0);
              const completedTasks = plan.buckets.reduce(
                (sum, b) => sum + b.tasks.filter(t => t.progress === 100).length,
                0
              );

              return (
                <Card
                  key={plan.plan_id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenPlan(plan.plan_id)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: plan.plan_color }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{plan.plan_title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{completedTasks}/{totalTasks} tasks</span>
                      <span>{plan.buckets.length} stages</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Templates Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Start Templates</h2>
            <Button
              variant="outline"
              onClick={() => setActiveView('templates')}
            >
              View All Templates →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FINANCE_PLANNER_TEMPLATES.slice(0, 3).map((template) => (
              <Card key={template.template_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {template.category === 'Finance' ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Users className="h-5 w-5 text-green-600" />
                    )}
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-base">{template.template_name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
