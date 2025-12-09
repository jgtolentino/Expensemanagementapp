import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import AppFeatures from './components/AppFeatures';
import { 
  Briefcase, FolderKanban, Users, DollarSign, FileText, AlertTriangle, 
  BarChart3, Calendar, Plus, ChevronRight, ChevronDown, MoreVertical,
  Clock, CheckCircle2, Diamond, TrendingUp, TrendingDown, Minus,
  Shield, Activity, Target, GitBranch, List, Kanban, ListChecks
} from 'lucide-react';
import { logFrameStructure, getLogFrameById, getAllIndicators, LogFrameObjective } from './lib/data/logframe-data';
import { sampleTasksEnhanced, allTasksEnhanced, TaskEnhanced, getAllTasks } from './lib/data/tasks-enhanced';
import { teamMembers, getTeamMemberByCode } from './lib/data/team-data';
import { portfolioDashboard } from './lib/data/ppm-sample-data';
import { PortfolioDashboard } from './components/portfolio-dashboard';
import KanbanBoardImproved from './components/KanbanBoardImproved';
import TaskDetailView from './components/TaskDetailView';
import { PlannerView } from './components/planner/PlannerView';
import { FinancePlannerView } from './components/planner/FinancePlannerView';

const COLORS = {
  primary: '#D97706',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
  purple: '#8B5CF6',
};

// Finance Clarity PPM Data Types
interface Portfolio {
  id: string;
  name: string;
  description: string;
  strategicTheme: string;
  owner: string;
  totalBudget: number;
  actualSpend: number;
  projectCount: number;
  healthScore: number | null;
  ragStatus: 'Green' | 'Yellow' | 'Red';
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
}

interface FinancialPlan {
  id: string;
  projectWbs: string;
  phaseName: string;
  budgetType: 'OPEX' | 'CAPEX';
  category: string;
  plannedAmount: number;
  actualSpend: number;
  forecast: number;
  variance: number;
  variancePercent: number;
  period: string;
  status: 'Planned' | 'Active' | 'Complete' | 'In Progress';
}

interface KPI {
  id: string;
  name: string;
  category: string;
  target: string;
  actual: string;
  variance: string;
  trend: 'Improving' | 'Stable' | 'Declining' | 'On Track' | 'At Risk';
  status: 'Active' | 'At Risk' | 'Inactive';
}

interface Risk {
  id: string;
  taskPhase: string;
  riskType: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  exposure: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed';
  owner: string;
}

export default function FinancePPMApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'portfolio' | 'portfolio-dashboard' | 'financials' | 'risks' | 'kpis' | 'logframe' | 'tasks' | 'team' | 'planner' | 'finance-planner'>('dashboard');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskEnhanced | null>(null);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set(['GOAL-001', 'OUTCOME-001']));

  // Finance Clarity PPM Sample Data
  const portfolios: Portfolio[] = [
    {
      id: 'PF-001',
      name: 'Finance Operations Excellence 2025',
      description: 'Monthly close process transformation and optimization',
      strategicTheme: 'Process Excellence',
      owner: 'CKVC',
      totalBudget: 2500000,
      actualSpend: 312350,
      projectCount: 1,
      healthScore: 85,
      ragStatus: 'Green',
      status: 'Active',
    },
    {
      id: 'PF-002',
      name: 'Financial Systems Modernization',
      description: 'ERP and financial systems upgrade program',
      strategicTheme: 'Digital Transformation',
      owner: 'CKVC',
      totalBudget: 8500000,
      actualSpend: 0,
      projectCount: 3,
      healthScore: null,
      ragStatus: 'Green',
      status: 'Planning',
    },
    {
      id: 'PF-003',
      name: 'Compliance & Governance',
      description: 'Financial controls and regulatory compliance framework',
      strategicTheme: 'Risk & Compliance',
      owner: 'CKVC',
      totalBudget: 1200000,
      actualSpend: 145000,
      projectCount: 2,
      healthScore: 80,
      ragStatus: 'Yellow',
      status: 'Active',
    },
  ];

  const financialPlans: FinancialPlan[] = [
    { id: 'FP-2025-01-001', projectWbs: '1.0', phaseName: 'I. Initial & Compliance', budgetType: 'OPEX', category: 'Payroll & Personnel', plannedAmount: 35000, actualSpend: 33240, forecast: 34500, variance: -500, variancePercent: -1.43, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-01-002', projectWbs: '1.0', phaseName: 'I. Initial & Compliance', budgetType: 'OPEX', category: 'Tax & Provisions', plannedAmount: 15000, actualSpend: 14850, forecast: 14900, variance: -100, variancePercent: -0.67, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-01-003', projectWbs: '1.0', phaseName: 'I. Initial & Compliance', budgetType: 'OPEX', category: 'VAT & Compliance', plannedAmount: 12000, actualSpend: 11500, forecast: 11800, variance: -200, variancePercent: -1.67, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-01-004', projectWbs: '1.0', phaseName: 'I. Initial & Compliance', budgetType: 'OPEX', category: 'CA Liquidations', plannedAmount: 8000, actualSpend: 7650, forecast: 7800, variance: -200, variancePercent: -2.50, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-02-001', projectWbs: '2.0', phaseName: 'II. Accruals & Amortization', budgetType: 'OPEX', category: 'Accruals & Expenses', plannedAmount: 45000, actualSpend: 42300, forecast: 44000, variance: -1000, variancePercent: -2.22, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-02-002', projectWbs: '2.0', phaseName: 'II. Accruals & Amortization', budgetType: 'OPEX', category: 'Corporate Accruals', plannedAmount: 28000, actualSpend: 27100, forecast: 27500, variance: -500, variancePercent: -1.79, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-02-003', projectWbs: '2.0', phaseName: 'II. Accruals & Amortization', budgetType: 'OPEX', category: 'Client Billings', plannedAmount: 52000, actualSpend: 50800, forecast: 51500, variance: -500, variancePercent: -0.96, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-02-004', projectWbs: '2.0', phaseName: 'II. Accruals & Amortization', budgetType: 'CAPEX', category: 'Asset Capitalization', plannedAmount: 18000, actualSpend: 17200, forecast: 17800, variance: -200, variancePercent: -1.11, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-02-005', projectWbs: '2.0', phaseName: 'II. Accruals & Amortization', budgetType: 'OPEX', category: 'Depreciation', plannedAmount: 22000, actualSpend: 22000, forecast: 22000, variance: 0, variancePercent: 0.00, period: 'Jan 2025', status: 'Complete' },
    { id: 'FP-2025-03-001', projectWbs: '3.0', phaseName: 'III. WIP', budgetType: 'OPEX', category: 'WIP Management', plannedAmount: 16000, actualSpend: 15200, forecast: 15800, variance: -200, variancePercent: -1.25, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-03-002', projectWbs: '3.0', phaseName: 'III. WIP', budgetType: 'OPEX', category: 'WIP Reconciliation', plannedAmount: 12000, actualSpend: 11400, forecast: 11700, variance: -300, variancePercent: -2.50, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-04-001', projectWbs: '4.0', phaseName: 'IV. Final Adjustments', budgetType: 'OPEX', category: 'Prior Period Review', plannedAmount: 8000, actualSpend: 7600, forecast: 7850, variance: -150, variancePercent: -1.88, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-04-002', projectWbs: '4.0', phaseName: 'IV. Final Adjustments', budgetType: 'OPEX', category: 'Reclassifications', plannedAmount: 14000, actualSpend: 13200, forecast: 13800, variance: -200, variancePercent: -1.43, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-04-003', projectWbs: '4.0', phaseName: 'IV. Final Adjustments', budgetType: 'OPEX', category: 'Regional Reporting', plannedAmount: 10000, actualSpend: 9500, forecast: 9800, variance: -200, variancePercent: -2.00, period: 'Jan 2025', status: 'Active' },
    { id: 'FP-2025-04-005', projectWbs: '4.0', phaseName: 'IV. Final Adjustments', budgetType: 'OPEX', category: 'TB Sign-off', plannedAmount: 5000, actualSpend: 4800, forecast: 4950, variance: -50, variancePercent: -1.00, period: 'Jan 2025', status: 'In Progress' },
  ];

  const kpis: KPI[] = [
    { id: 'KPI-001', name: 'On-Time Period Close Rate', category: 'Cycle Time', target: '100%', actual: '92%', variance: '-8%', trend: 'Improving', status: 'Active' },
    { id: 'KPI-002', name: 'Budget Variance %', category: 'Financial', target: '<5%', actual: '1.8%', variance: '3.2%', trend: 'Stable', status: 'Active' },
    { id: 'KPI-003', name: 'Task Completion Rate', category: 'Execution', target: '100%', actual: '83%', variance: '-17%', trend: 'On Track', status: 'Active' },
    { id: 'KPI-004', name: 'High Risk Mitigation %', category: 'Risk Management', target: '80%', actual: '60%', variance: '-20%', trend: 'Declining', status: 'At Risk' },
    { id: 'KPI-005', name: 'Time Entry Compliance %', category: 'Resource', target: '95%', actual: '88%', variance: '-7%', trend: 'Stable', status: 'Active' },
  ];

  const risks: Risk[] = [
    { id: 'RSK-001', taskPhase: 'CT-0004', riskType: 'Compliance', description: 'VAT filing deadline may be missed due to data compilation delays', probability: 'High', impact: 'High', exposure: 'Critical', status: 'Open', owner: 'JAP' },
    { id: 'RSK-007', taskPhase: 'CT-0024', riskType: 'Operational', description: 'WIP data inconsistencies between project system and GL', probability: 'High', impact: 'High', exposure: 'Critical', status: 'Open', owner: 'JRMO' },
    { id: 'RSK-012', taskPhase: 'CT-0035', riskType: 'Operational', description: 'Incomplete flash report data causing regional reporting delays', probability: 'High', impact: 'High', exposure: 'Critical', status: 'Open', owner: 'BOM' },
    { id: 'RSK-003', taskPhase: 'CT-0009', riskType: 'Financial', description: 'Client contract amendments not reflected in accrual calculations', probability: 'Medium', impact: 'High', exposure: 'High', status: 'Mitigated', owner: 'JPAL' },
    { id: 'RSK-010', taskPhase: 'CT-0029', riskType: 'Operational', description: 'Incorrect job code transfers affecting project profitability', probability: 'Medium', impact: 'High', exposure: 'High', status: 'Open', owner: 'JAP' },
  ];

  // Calculate portfolio metrics
  const portfolioMetrics = {
    totalProjects: portfolios.reduce((sum, p) => sum + p.projectCount, 0),
    activeProjects: portfolios.filter(p => p.status === 'Active').length,
    totalBudget: portfolios.reduce((sum, p) => sum + p.totalBudget, 0),
    totalSpent: portfolios.reduce((sum, p) => sum + p.actualSpend, 0),
    utilization: 78,
    atRisk: risks.filter(r => r.exposure === 'Critical' && r.status === 'Open').length,
  };

  // Calculate phase budgets
  const phaseBudgets = financialPlans.reduce((acc, plan) => {
    if (!acc[plan.projectWbs]) {
      acc[plan.projectWbs] = { 
        name: plan.phaseName, 
        planned: 0, 
        actual: 0, 
        variance: 0 
      };
    }
    acc[plan.projectWbs].planned += plan.plannedAmount;
    acc[plan.projectWbs].actual += plan.actualSpend;
    acc[plan.projectWbs].variance += plan.variance;
    return acc;
  }, {} as Record<string, { name: string; planned: number; actual: number; variance: number }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRAGBadge = (status: 'Green' | 'Yellow' | 'Red') => {
    const config = {
      Green: { label: 'On Track', color: COLORS.success },
      Yellow: { label: 'At Risk', color: COLORS.warning },
      Red: { label: 'Critical', color: COLORS.danger },
    };
    return config[status];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving':
      case 'On Track':
        return <TrendingUp className="h-4 w-4" style={{ color: COLORS.success }} />;
      case 'Declining':
      case 'At Risk':
        return <TrendingDown className="h-4 w-4" style={{ color: COLORS.danger }} />;
      default:
        return <Minus className="h-4 w-4" style={{ color: COLORS.info }} />;
    }
  };

  const getRiskBadge = (exposure: string) => {
    const config = {
      Critical: { color: COLORS.danger, bg: '#FEE2E2' },
      High: { color: COLORS.warning, bg: '#FEF3C7' },
      Medium: { color: COLORS.info, bg: '#DBEAFE' },
      Low: { color: '#6B7280', bg: '#F3F4F6' },
    };
    return config[exposure as keyof typeof config] || config.Low;
  };

  // Dashboard View
  if (activeView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Finance PPM
            </h1>
            <p className="text-muted-foreground">
              Finance Clarity Project Portfolio Management
            </p>
          </div>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-3xl">{portfolioMetrics.totalProjects}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {portfolioMetrics.activeProjects} active projects
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Portfolio Budget</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(portfolioMetrics.totalBudget)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {formatCurrency(portfolioMetrics.totalSpent)} spent
                </div>
                <Progress
                  value={(portfolioMetrics.totalSpent / portfolioMetrics.totalBudget) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Team Utilization</CardDescription>
                <CardTitle className="text-3xl">{portfolioMetrics.utilization}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm" style={{ color: COLORS.danger }}>
                  {portfolioMetrics.atRisk} projects at risk
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('portfolio')}
            >
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-1" style={{ color: COLORS.primary }} />
                <div className="text-left">
                  <div className="font-semibold">Portfolios</div>
                  <div className="text-xs text-slate-500">{portfolios.length} active</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start relative group"
              onClick={() => setActiveView('portfolio-dashboard')}
            >
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 mt-1" style={{ color: COLORS.info }} />
                <div className="text-left">
                  <div className="font-semibold">Portfolio Dashboard</div>
                  <div className="text-xs text-slate-500">Strategic View ⭐</div>
                </div>
              </div>
              <Badge className="absolute top-1 right-1 text-xs bg-blue-500">NEW</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('financials')}
            >
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 mt-1" style={{ color: COLORS.success }} />
                <div className="text-left">
                  <div className="font-semibold">Financial Plans</div>
                  <div className="text-xs text-slate-500">{financialPlans.length} budget lines</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('risks')}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-1" style={{ color: COLORS.danger }} />
                <div className="text-left">
                  <div className="font-semibold">Risk Register</div>
                  <div className="text-xs text-slate-500">{risks.filter(r => r.status === 'Open').length} open</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('kpis')}
            >
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 mt-1" style={{ color: COLORS.info }} />
                <div className="text-left">
                  <div className="font-semibold">KPIs</div>
                  <div className="text-xs text-slate-500">{kpis.filter(k => k.status === 'Active').length} active metrics</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('logframe')}
            >
              <div className="flex items-start gap-3">
                <GitBranch className="h-5 w-5 mt-1" style={{ color: COLORS.purple }} />
                <div className="text-left">
                  <div className="font-semibold">LogFrame</div>
                  <div className="text-xs text-slate-500">{getAllIndicators().length} indicators</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('tasks')}
            >
              <div className="flex items-start gap-3">
                <Kanban className="h-5 w-5 mt-1" style={{ color: COLORS.info }} />
                <div className="text-left">
                  <div className="font-semibold">Tasks & Kanban</div>
                  <div className="text-xs text-slate-500">{getAllTasks(allTasksEnhanced).length} tasks</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start relative group"
              onClick={() => setActiveView('planner')}
            >
              <div className="flex items-start gap-3">
                <ListChecks className="h-5 w-5 mt-1" style={{ color: COLORS.primary }} />
                <div className="text-left">
                  <div className="font-semibold">Planner Views</div>
                  <div className="text-xs text-slate-500">Board & Grid ⭐</div>
                </div>
              </div>
              <Badge className="absolute top-1 right-1 text-xs bg-green-500">NEW</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start relative group"
              onClick={() => setActiveView('finance-planner')}
            >
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-1" style={{ color: COLORS.info }} />
                <div className="text-left">
                  <div className="font-semibold">Finance Planner</div>
                  <div className="text-xs text-slate-500">BIR, Month-end, HR ⭐</div>
                </div>
              </div>
              <Badge className="absolute top-1 right-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">✨ NEW</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-20 justify-start"
              onClick={() => setActiveView('team')}
            >
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-1" style={{ color: COLORS.success }} />
                <div className="text-left">
                  <div className="font-semibold">Team Directory</div>
                  <div className="text-xs text-slate-500">{teamMembers.length} members</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Portfolios List */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Portfolios</CardTitle>
                  <CardDescription>Strategic portfolio overview</CardDescription>
                </div>
                <Button style={{ backgroundColor: COLORS.primary }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Portfolio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolios.map(portfolio => {
                  const spentPercent = (portfolio.actualSpend / portfolio.totalBudget) * 100;
                  const ragBadge = getRAGBadge(portfolio.ragStatus);
                  
                  return (
                    <div
                      key={portfolio.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPortfolio(portfolio.id);
                        setActiveView('portfolio');
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{portfolio.name}</div>
                          <div className="text-sm text-slate-500 mt-1">
                            {portfolio.description}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {portfolio.strategicTheme}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {portfolio.projectCount} projects • {portfolio.owner}
                            </span>
                            {portfolio.healthScore && (
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-600">Health: {portfolio.healthScore}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: ragBadge.bg || `${ragBadge.color}20`,
                            color: ragBadge.color,
                          }}
                        >
                          {ragBadge.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={spentPercent} />
                        </div>
                        <div className="text-sm text-slate-600">
                          {formatCurrency(portfolio.actualSpend)} / {formatCurrency(portfolio.totalBudget)}
                        </div>
                        <div className="text-sm font-medium" style={{ 
                          color: spentPercent < 80 ? COLORS.success : spentPercent < 95 ? COLORS.warning : COLORS.danger 
                        }}>
                          {spentPercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Current period performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kpis.slice(0, 4).map(kpi => (
                    <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {getTrendIcon(kpi.trend)}
                        <div>
                          <div className="font-medium text-sm">{kpi.name}</div>
                          <div className="text-xs text-slate-500">{kpi.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{kpi.actual}</div>
                        <div className="text-xs text-slate-500">Target: {kpi.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Risks</CardTitle>
                <CardDescription>High exposure risks requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risks.filter(r => r.exposure === 'Critical').slice(0, 3).map(risk => {
                    const badge = getRiskBadge(risk.exposure);
                    return (
                      <div key={risk.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" style={{ color: badge.color }} />
                            <span className="font-medium text-sm">{risk.id}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {risk.exposure}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{risk.description}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{risk.riskType}</span>
                          <span>•</span>
                          <span>P: {risk.probability}</span>
                          <span>•</span>
                          <span>I: {risk.impact}</span>
                          <span>•</span>
                          <span>Owner: {risk.owner}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Financials View
  if (activeView === 'financials') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>Financial Plans</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Financial Plans & Budgets
            </h1>
            <p className="text-muted-foreground">
              Budget tracking by phase and category
            </p>
          </div>

          {/* Phase Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(phaseBudgets).map(([wbs, data]) => {
              const variancePercent = (data.variance / data.planned) * 100;
              return (
                <Card key={wbs}>
                  <CardHeader>
                    <CardDescription className="text-xs">{wbs}</CardDescription>
                    <CardTitle className="text-lg">{data.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Planned</span>
                        <span className="font-medium">{formatCurrency(data.planned)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Actual</span>
                        <span className="font-medium">{formatCurrency(data.actual)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Variance</span>
                        <span 
                          className="font-semibold"
                          style={{ color: data.variance < 0 ? COLORS.success : COLORS.danger }}
                        >
                          {formatCurrency(data.variance)} ({variancePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={(data.actual / data.planned) * 100} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Budget Lines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Details - Jan 2025</CardTitle>
                  <CardDescription>Category-level budget breakdown</CardDescription>
                </div>
                <Select defaultValue="jan">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">Jan 2025</SelectItem>
                    <SelectItem value="feb">Feb 2025</SelectItem>
                    <SelectItem value="mar">Mar 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Phase</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Planned</th>
                      <th className="text-right py-3 px-4 font-medium">Actual</th>
                      <th className="text-right py-3 px-4 font-medium">Forecast</th>
                      <th className="text-right py-3 px-4 font-medium">Variance</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialPlans.map(plan => (
                      <tr key={plan.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">{plan.projectWbs}</td>
                        <td className="py-3 px-4 font-medium">{plan.category}</td>
                        <td className="py-3 px-4">
                          <Badge variant={plan.budgetType === 'CAPEX' ? 'default' : 'secondary'} className="text-xs">
                            {plan.budgetType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(plan.plannedAmount)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(plan.actualSpend)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(plan.forecast)}</td>
                        <td 
                          className="py-3 px-4 text-right font-semibold"
                          style={{ color: plan.variance < 0 ? COLORS.success : COLORS.danger }}
                        >
                          {formatCurrency(plan.variance)}
                          <div className="text-xs">{plan.variancePercent.toFixed(1)}%</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: plan.status === 'Complete' ? `${COLORS.success}20` :
                                plan.status === 'In Progress' ? `${COLORS.info}20` :
                                `${COLORS.warning}20`,
                              color: plan.status === 'Complete' ? COLORS.success :
                                plan.status === 'In Progress' ? COLORS.info :
                                COLORS.warning,
                            }}
                          >
                            {plan.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t">
                    <tr className="font-semibold">
                      <td colSpan={3} className="py-3 px-4">Total</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(financialPlans.reduce((sum, p) => sum + p.plannedAmount, 0))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(financialPlans.reduce((sum, p) => sum + p.actualSpend, 0))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(financialPlans.reduce((sum, p) => sum + p.forecast, 0))}
                      </td>
                      <td 
                        className="py-3 px-4 text-right"
                        style={{ color: COLORS.success }}
                      >
                        {formatCurrency(financialPlans.reduce((sum, p) => sum + p.variance, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Risks View
  if (activeView === 'risks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>Risk Register</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Risk Register
            </h1>
            <p className="text-muted-foreground">
              Project risk identification and mitigation tracking
            </p>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Risks</CardDescription>
                <CardTitle className="text-3xl">{risks.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {risks.filter(r => r.status === 'Open').length} open
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Critical Exposure</CardDescription>
                <CardTitle className="text-3xl" style={{ color: COLORS.danger }}>
                  {risks.filter(r => r.exposure === 'Critical').length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Requires immediate attention
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>High Exposure</CardDescription>
                <CardTitle className="text-3xl" style={{ color: COLORS.warning }}>
                  {risks.filter(r => r.exposure === 'High').length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Active monitoring required
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Mitigated</CardDescription>
                <CardTitle className="text-3xl" style={{ color: COLORS.success }}>
                  {risks.filter(r => r.status === 'Mitigated').length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Successfully mitigated
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk List */}
          <Card>
            <CardHeader>
              <CardTitle>All Risks</CardTitle>
              <CardDescription>Sorted by exposure level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risks.map(risk => {
                  const badge = getRiskBadge(risk.exposure);
                  return (
                    <div key={risk.id} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5" style={{ color: badge.color }} />
                          <div>
                            <div className="font-semibold">{risk.id}</div>
                            <div className="text-sm text-slate-500 mt-1">{risk.riskType} • {risk.taskPhase}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {risk.exposure}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {risk.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 mb-3">{risk.description}</div>
                      <div className="flex items-center gap-6 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-500">Probability: </span>
                          <span className="font-medium">{risk.probability}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Impact: </span>
                          <span className="font-medium">{risk.impact}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Owner: </span>
                          <span className="font-medium">{risk.owner}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // KPIs View
  if (activeView === 'kpis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>KPIs</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Key Performance Indicators
            </h1>
            <p className="text-muted-foreground">
              Performance metrics and trends
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {kpis.map(kpi => (
              <Card key={kpi.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kpi.trend)}
                      <CardDescription className="text-xs">{kpi.category}</CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: kpi.status === 'Active' ? `${COLORS.success}20` : `${COLORS.danger}20`,
                        color: kpi.status === 'Active' ? COLORS.success : COLORS.danger,
                      }}
                    >
                      {kpi.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{kpi.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Current</div>
                        <div className="text-2xl font-semibold">{kpi.actual}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Target</div>
                        <div className="text-lg font-medium text-slate-600">{kpi.target}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Variance</span>
                      <span 
                        className="font-semibold"
                        style={{ 
                          color: kpi.variance.startsWith('-') ? COLORS.danger : COLORS.success 
                        }}
                      >
                        {kpi.variance}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Trend:</span>
                      <span className="font-medium">{kpi.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* KPI Table */}
          <Card>
            <CardHeader>
              <CardTitle>All KPIs</CardTitle>
              <CardDescription>Complete metrics overview</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">KPI Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Target</th>
                    <th className="text-right py-3 px-4 font-medium">Actual</th>
                    <th className="text-right py-3 px-4 font-medium">Variance</th>
                    <th className="text-center py-3 px-4 font-medium">Trend</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map(kpi => (
                    <tr key={kpi.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{kpi.name}</td>
                      <td className="py-3 px-4 text-slate-600">{kpi.category}</td>
                      <td className="py-3 px-4 text-right">{kpi.target}</td>
                      <td className="py-3 px-4 text-right font-semibold">{kpi.actual}</td>
                      <td 
                        className="py-3 px-4 text-right font-semibold"
                        style={{ 
                          color: kpi.variance.startsWith('-') ? COLORS.danger : COLORS.success 
                        }}
                      >
                        {kpi.variance}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(kpi.trend)}
                          <span className="text-xs">{kpi.trend}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: kpi.status === 'Active' ? `${COLORS.success}20` : `${COLORS.danger}20`,
                            color: kpi.status === 'Active' ? COLORS.success : COLORS.danger,
                          }}
                        >
                          {kpi.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // LogFrame View
  if (activeView === 'logframe') {
    const toggleObjective = (id: string) => {
      const newExpanded = new Set(expandedObjectives);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedObjectives(newExpanded);
    };

    const renderObjectiveTree = (objective: LogFrameObjective, level: number = 0) => {
      const hasChildren = objective.children && objective.children.length > 0;
      const isExpanded = expandedObjectives.has(objective.id);
      const levelColors = {
        'Goal': { bg: '#1F4E79', text: '#FFFFFF' },
        'Outcome': { bg: '#2E75B6', text: '#FFFFFF' },
        'Immediate Objective': { bg: '#70AD47', text: '#FFFFFF' },
        'Output': { bg: '#FFC000', text: '#000000' },
        'Activity': { bg: '#F3F4F6', text: '#000000' },
      };
      const colors = levelColors[objective.level] || levelColors.Activity;

      return (
        <div key={objective.id} className="mb-2">
          <div
            className="border rounded-lg overflow-hidden"
            style={{ marginLeft: `${level * 24}px` }}
          >
            <div
              className="p-4 cursor-pointer"
              style={{ backgroundColor: colors.bg, color: colors.text }}
              onClick={() => hasChildren && toggleObjective(objective.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {hasChildren && (
                    <div className="mt-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.text, borderColor: colors.text }}>
                        {objective.level}
                      </Badge>
                      {objective.code && (
                        <Badge variant="outline" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.text, borderColor: colors.text }}>
                          {objective.code}
                        </Badge>
                      )}
                    </div>
                    <div className="font-semibold text-lg mb-1">{objective.title}</div>
                    <div className="text-sm opacity-90 whitespace-pre-line">{objective.description}</div>
                    
                    {objective.indicators.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {objective.indicators.map(indicator => (
                          <div key={indicator.id} className="text-sm p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <div className="font-medium">{indicator.name}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span>Target: {indicator.target}</span>
                              {indicator.actual && (
                                <span className="font-semibold">
                                  Actual: {indicator.actual}
                                  {indicator.linkedKPI && (
                                    <Badge variant="outline" className="ml-2 text-xs" style={{ borderColor: colors.text }}>
                                      {indicator.linkedKPI}
                                    </Badge>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  {objective.progress !== undefined && (
                    <div className="w-24">
                      <div className="text-xs mb-1">Progress</div>
                      <Progress value={objective.progress} className="h-2" />
                      <div className="text-xs mt-1 text-right">{objective.progress}%</div>
                    </div>
                  )}
                  {objective.status && (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: colors.text,
                      }}
                    >
                      {objective.status}
                    </Badge>
                  )}
                </div>
              </div>
              
              {objective.meansOfVerification.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="text-xs font-medium mb-1">Means of Verification:</div>
                  <div className="text-xs opacity-80">
                    {objective.meansOfVerification.join(' • ')}
                  </div>
                </div>
              )}
              
              {objective.assumptions.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium mb-1">Assumptions:</div>
                  <div className="text-xs opacity-80">
                    {objective.assumptions.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="mt-2">
              {objective.children!.map(child => renderObjectiveTree(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>LogFrame</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Logical Framework (LogFrame)
            </h1>
            <p className="text-muted-foreground">
              Results-based management framework for Finance Operations Excellence
            </p>
          </div>

          {/* LogFrame Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Indicators</CardDescription>
                <CardTitle className="text-3xl">{getAllIndicators().length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Across all levels
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Goal Progress</CardDescription>
                <CardTitle className="text-3xl">92%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm" style={{ color: COLORS.success }}>
                  On Track
                </div>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Immediate Objectives</CardDescription>
                <CardTitle className="text-3xl">2</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  IM1: Month-End • IM2: Tax Filing
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Linked KPIs</CardDescription>
                <CardTitle className="text-3xl">
                  {getAllIndicators().filter(ind => ind.linkedKPI).length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Connected to KPI dashboard
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="text-sm font-medium text-slate-600">Legend:</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1F4E79' }}></div>
                  <span className="text-sm">Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2E75B6' }}></div>
                  <span className="text-sm">Outcome</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#70AD47' }}></div>
                  <span className="text-sm">Immediate Objective</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFC000' }}></div>
                  <span className="text-sm">Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F3F4F6' }}></div>
                  <span className="text-sm">Activity</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LogFrame Tree */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Results Framework</CardTitle>
                  <CardDescription>Hierarchical view of objectives, indicators, and assumptions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allIds = new Set<string>();
                      function collectIds(obj: LogFrameObjective) {
                        allIds.add(obj.id);
                        if (obj.children) {
                          obj.children.forEach(child => collectIds(child));
                        }
                      }
                      logFrameStructure.forEach(obj => collectIds(obj));
                      setExpandedObjectives(allIds);
                    }}
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedObjectives(new Set(['GOAL-001']))}
                  >
                    Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logFrameStructure.map(objective => renderObjectiveTree(objective))}
              </div>
            </CardContent>
          </Card>

          {/* Linked Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Linked KPIs</CardTitle>
                <CardDescription>KPIs connected to LogFrame indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {kpis.slice(0, 5).map(kpi => (
                    <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" style={{ color: COLORS.info }} />
                        <span className="text-sm font-medium">{kpi.id}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{kpi.actual}</div>
                        <div className="text-xs text-slate-500">{kpi.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Linkage</CardTitle>
                <CardDescription>Tasks contributing to objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-2">IM1: Month-End Closing</div>
                    <div className="flex flex-wrap gap-1">
                      {['CT-0001', 'CT-0002', 'CT-0007', 'CT-0024', 'CT-0036'].map(taskId => (
                        <Badge key={taskId} variant="outline" className="text-xs">
                          {taskId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">IM2: Tax Filing</div>
                    <div className="flex flex-wrap gap-1">
                      {['CT-0003', 'CT-0004'].map(taskId => (
                        <Badge key={taskId} variant="outline" className="text-xs">
                          {taskId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Tasks & Kanban View
  if (activeView === 'tasks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>Tasks & Kanban</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Tasks & Kanban Board
            </h1>
            <p className="text-muted-foreground">
              Full hierarchy with checklists, comments, and @mentions
            </p>
          </div>

          {/* Kanban Board */}
          <KanbanBoardImproved
            tasks={allTasksEnhanced}
            onTaskClick={(task) => setSelectedTask(task)}
            onStatusChange={(taskId, newStatus) => {
              console.log(`Task ${taskId} moved to ${newStatus}`);
              // Update task status in state - in real app, this would update the backend
            }}
          />

          {/* Task Detail Modal */}
          {selectedTask && (
            <TaskDetailView
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={(updatedTask) => {
                // Update task in state
                console.log('Task updated:', updatedTask);
                setSelectedTask(updatedTask);
              }}
            />
          )}
        </main>
      </div>
    );
  }

  // Microsoft Planner Views (Board & Grid)
  if (activeView === 'planner') {
    return (
      <div className="h-screen">
        <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-10 p-4">
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="pt-16 h-full">
          <PlannerView />
        </div>
      </div>
    );
  }

  // Finance Planner View (BIR, Month-end, HR workflows)
  if (activeView === 'finance-planner') {
    return (
      <div className="h-screen">
        <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-10 p-4">
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="pt-16 h-full">
          <FinancePlannerView />
        </div>
      </div>
    );
  }

  // Team Directory View
  if (activeView === 'team') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>Team Directory</span>
            </div>
            <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
              Team Directory
            </h1>
            <p className="text-muted-foreground">
              Finance Clarity Project Portfolio Management Team
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {teamMembers.map((member) => (
              <Card key={member.code}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                      style={{ backgroundColor: member.code === 'CKVC' ? COLORS.primary : member.code === 'RIM' ? COLORS.info : member.code === 'JAP' ? COLORS.success : COLORS.purple }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{member.name}</div>
                      <div className="text-sm text-slate-600 mb-1">{member.role}</div>
                      <div className="text-xs text-slate-500 mb-2">{member.email}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          @{member.code}
                        </Badge>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: member.active ? `${COLORS.success}20` : '#F3F4F6',
                            color: member.active ? COLORS.success : '#6B7280',
                          }}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardDescription>Total Members</CardDescription>
                <CardTitle className="text-3xl">{teamMembers.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {teamMembers.filter(m => m.active).length} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Departments</CardDescription>
                <CardTitle className="text-3xl">1</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Finance
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Email Notifications</CardDescription>
                <CardTitle className="text-3xl">
                  {teamMembers.filter(m => m.notificationPreferences?.emailAlerts).length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Members with alerts enabled
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>@Mention Ready</CardDescription>
                <CardTitle className="text-3xl">
                  {teamMembers.filter(m => m.notificationPreferences?.mentions).length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Can be mentioned in comments
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Portfolio Dashboard View (New - Strategic Overview)
  if (activeView === 'portfolio-dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 max-w-[1600px]">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={() => setActiveView('dashboard')} 
              className="hover:text-gray-900 transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Portfolio Dashboard</span>
          </div>

          {/* Portfolio Dashboard Component */}
          <PortfolioDashboard data={portfolioDashboard} />
        </div>
      </div>
    );
  }

  // Portfolio Detail View
  if (activeView === 'portfolio' && selectedPortfolio) {
    const portfolio = portfolios.find(p => p.id === selectedPortfolio);
    if (!portfolio) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button onClick={() => setActiveView('dashboard')} className="hover:text-slate-900">
                Dashboard
              </button>
              <ChevronRight className="h-4 w-4" />
              <button onClick={() => setActiveView('portfolio')} className="hover:text-slate-900">
                Portfolios
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>{portfolio.name}</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
                  {portfolio.name}
                </h1>
                <p className="text-muted-foreground">{portfolio.description}</p>
              </div>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${getRAGBadge(portfolio.ragStatus).color}20`,
                  color: getRAGBadge(portfolio.ragStatus).color,
                }}
              >
                {getRAGBadge(portfolio.ragStatus).label}
              </Badge>
            </div>
          </div>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardDescription>Total Budget</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(portfolio.totalBudget)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {formatCurrency(portfolio.actualSpend)} spent
                </div>
                <Progress
                  value={(portfolio.actualSpend / portfolio.totalBudget) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Projects</CardDescription>
                <CardTitle className="text-2xl">{portfolio.projectCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  {portfolio.status}
                </div>
              </CardContent>
            </Card>

            {portfolio.healthScore && (
              <Card>
                <CardHeader>
                  <CardDescription>Health Score</CardDescription>
                  <CardTitle className="text-2xl">{portfolio.healthScore}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm" style={{ color: COLORS.success }}>
                    Strong health
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardDescription>Strategic Theme</CardDescription>
                <CardTitle className="text-lg">{portfolio.strategicTheme}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Owner: {portfolio.owner}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Details */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Overview</CardTitle>
                  <CardDescription>Strategic objectives and current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-slate-600">{portfolio.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Strategic Alignment</h3>
                      <Badge variant="outline">{portfolio.strategicTheme}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Status</h3>
                      <p className="text-slate-600">{portfolio.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Budget allocation and spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-slate-600">Total Budget</span>
                      <span className="font-semibold text-lg">{formatCurrency(portfolio.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-slate-600">Actual Spend</span>
                      <span className="font-semibold text-lg">{formatCurrency(portfolio.actualSpend)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-slate-600">Remaining</span>
                      <span 
                        className="font-semibold text-lg"
                        style={{ color: COLORS.success }}
                      >
                        {formatCurrency(portfolio.totalBudget - portfolio.actualSpend)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-slate-600">Spend %</span>
                      <span className="font-semibold text-lg">
                        {((portfolio.actualSpend / portfolio.totalBudget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Risks</CardTitle>
                  <CardDescription>Risk exposure and mitigation status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    View risks in the dedicated Risk Register
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={() => setActiveView('risks')}>
                      Go to Risk Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <AppFeatures
                appName="Finance PPM"
                appColor={COLORS.primary}
                features={[
                  {
                    name: "Portfolio Management",
                    description: "Strategic portfolio grouping with health scores and RAG status",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Financial Planning & Budgeting",
                    description: "Budget allocation, tracking, and variance analysis by phase and category",
                    status: "active",
                    category: "Financial Management"
                  },
                  {
                    name: "Risk Register",
                    description: "Comprehensive risk identification, assessment, and mitigation tracking",
                    status: "active",
                    category: "Risk Management"
                  },
                  {
                    name: "KPI Dashboard",
                    description: "Key performance indicators with targets, actuals, and trend analysis",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "Multi-Currency Support",
                    description: "Budget and financial tracking in PHP and other currencies",
                    status: "active",
                    category: "Financial Management"
                  },
                  {
                    name: "OPEX/CAPEX Classification",
                    description: "Budget type tracking for operational and capital expenditures",
                    status: "active",
                    category: "Financial Management"
                  },
                  {
                    name: "Variance Analysis",
                    description: "Automatic calculation of budget variances and percentages",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "Health Score Tracking",
                    description: "Portfolio health monitoring with 0-100 scoring system",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "RAG Status Indicators",
                    description: "Red-Amber-Green status visualization for quick health assessment",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Strategic Theme Alignment",
                    description: "Link portfolios to strategic themes and objectives",
                    status: "active",
                    category: "Strategic Planning"
                  },
                  {
                    name: "Risk Exposure Matrix",
                    description: "Probability × Impact risk assessment with exposure levels",
                    status: "active",
                    category: "Risk Management"
                  },
                  {
                    name: "Trend Analysis",
                    description: "KPI trend tracking (Improving, Stable, Declining, At Risk)",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "Real-time Data Integration",
                    description: "Integration with Finance Clarity PPM sample data",
                    status: "active",
                    category: "Integration"
                  },
                  {
                    name: "Odoo 18 CE + OCA Compatible",
                    description: "Data structures aligned with Odoo PPM modules",
                    status: "active",
                    category: "Integration"
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return null;
}
