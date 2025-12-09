import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import AppFeatures from './components/AppFeatures';
import { 
  Briefcase, FolderKanban, Users, DollarSign, FileText, AlertTriangle, 
  BarChart3, Calendar, Plus, ChevronRight, ChevronDown, MoreVertical,
  Clock, CheckCircle2, Circle, Diamond, Link2, User, Milestone
} from 'lucide-react';

const COLORS = {
  primary: '#D97706',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
};

// Task types
type TaskType = 'phase' | 'milestone' | 'task';
type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'at_risk';

interface Task {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  assignee?: string;
  dependencies?: string[];
  children?: Task[];
  expanded?: boolean;
  etc: number; // Estimate to Complete
  actuals: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  team: number;
  phase: string;
  startDate: string;
  endDate: string;
  manager: string;
  tasks: Task[];
}

export default function FinancePPMApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'resources' | 'financials'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [taskView, setTaskView] = useState<'timeline' | 'grid' | 'board' | 'features'>('timeline');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['TASK-001', 'TASK-004']));

  // Mock project data with WBS
  const projects: Project[] = [
    {
      id: 'PRJ-001',
      name: 'Brand Refresh Campaign',
      status: 'in_progress',
      progress: 65,
      budget: 450000,
      spent: 292500,
      team: 8,
      phase: 'Execution',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      manager: 'Sarah Chen',
      tasks: [
        {
          id: 'TASK-001',
          name: 'Planning Phase',
          type: 'phase',
          status: 'completed',
          startDate: '2024-01-15',
          endDate: '2024-02-28',
          duration: 45,
          progress: 100,
          etc: 0,
          actuals: 360,
          expanded: true,
          children: [
            {
              id: 'TASK-002',
              name: 'Define Brand Strategy',
              type: 'task',
              status: 'completed',
              startDate: '2024-01-15',
              endDate: '2024-01-30',
              duration: 15,
              progress: 100,
              assignee: 'Sarah Chen',
              etc: 0,
              actuals: 120,
            },
            {
              id: 'TASK-003',
              name: 'Market Research Complete',
              type: 'milestone',
              status: 'completed',
              startDate: '2024-02-15',
              endDate: '2024-02-15',
              duration: 0,
              progress: 100,
              etc: 0,
              actuals: 0,
            },
          ],
        },
        {
          id: 'TASK-004',
          name: 'Design Phase',
          type: 'phase',
          status: 'in_progress',
          startDate: '2024-03-01',
          endDate: '2024-04-30',
          duration: 60,
          progress: 70,
          etc: 180,
          actuals: 420,
          expanded: true,
          children: [
            {
              id: 'TASK-005',
              name: 'Create Design Concepts',
              type: 'task',
              status: 'completed',
              startDate: '2024-03-01',
              endDate: '2024-03-20',
              duration: 20,
              progress: 100,
              assignee: 'Marcus Wu',
              dependencies: ['TASK-003'],
              etc: 0,
              actuals: 160,
            },
            {
              id: 'TASK-006',
              name: 'Design Review & Approval',
              type: 'task',
              status: 'in_progress',
              startDate: '2024-03-21',
              endDate: '2024-04-10',
              duration: 20,
              progress: 65,
              assignee: 'Sarah Chen',
              dependencies: ['TASK-005'],
              etc: 56,
              actuals: 104,
            },
            {
              id: 'TASK-007',
              name: 'Final Design Approval',
              type: 'milestone',
              status: 'not_started',
              startDate: '2024-04-30',
              endDate: '2024-04-30',
              duration: 0,
              progress: 0,
              dependencies: ['TASK-006'],
              etc: 0,
              actuals: 0,
            },
          ],
        },
        {
          id: 'TASK-008',
          name: 'Implementation Phase',
          type: 'phase',
          status: 'not_started',
          startDate: '2024-05-01',
          endDate: '2024-06-30',
          duration: 60,
          progress: 0,
          etc: 480,
          actuals: 0,
          children: [
            {
              id: 'TASK-009',
              name: 'Develop Marketing Materials',
              type: 'task',
              status: 'not_started',
              startDate: '2024-05-01',
              endDate: '2024-05-31',
              duration: 30,
              progress: 0,
              assignee: 'Priya Sharma',
              dependencies: ['TASK-007'],
              etc: 240,
              actuals: 0,
            },
            {
              id: 'TASK-010',
              name: 'Launch Campaign',
              type: 'task',
              status: 'not_started',
              startDate: '2024-06-01',
              endDate: '2024-06-30',
              duration: 30,
              progress: 0,
              assignee: 'Team',
              dependencies: ['TASK-009'],
              etc: 240,
              actuals: 0,
            },
          ],
        },
      ],
    },
    {
      id: 'PRJ-002',
      name: 'Digital Transformation',
      status: 'in_progress',
      progress: 42,
      budget: 780000,
      spent: 327600,
      team: 12,
      phase: 'Planning',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      manager: 'David Park',
      tasks: [],
    },
    {
      id: 'PRJ-003',
      name: 'Q4 Product Launch',
      status: 'planning',
      progress: 15,
      budget: 320000,
      spent: 48000,
      team: 6,
      phase: 'Initiation',
      startDate: '2024-09-01',
      endDate: '2024-12-15',
      manager: 'Emma Thompson',
      tasks: [],
    },
    {
      id: 'PRJ-004',
      name: 'Market Research Study',
      status: 'at_risk',
      progress: 78,
      budget: 180000,
      spent: 158400,
      team: 4,
      phase: 'Closing',
      startDate: '2023-11-01',
      endDate: '2024-02-29',
      manager: 'Alex Rodriguez',
      tasks: [],
    },
  ];

  const portfolioMetrics = {
    totalProjects: 24,
    activeProjects: 16,
    totalBudget: 3450000,
    totalSpent: 2186500,
    utilization: 78,
    atRisk: 3,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { label: 'In Progress', color: COLORS.info },
      planning: { label: 'Planning', color: COLORS.warning },
      at_risk: { label: 'At Risk', color: COLORS.danger },
      completed: { label: 'Completed', color: COLORS.success },
      not_started: { label: 'Not Started', color: '#6B7280' },
    };
    return config[status as keyof typeof config] || config.not_started;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'phase':
        return <FolderKanban className="h-4 w-4" />;
      case 'milestone':
        return <Diamond className="h-4 w-4" />;
      case 'task':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const renderTaskRow = (task: Task, level: number = 0, parentId?: string) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const statusConfig = getStatusBadge(task.status);

    return (
      <div key={task.id}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 border-b"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse */}
          <div className="w-4">
            {hasChildren && (
              <button onClick={() => toggleTask(task.id)}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
            )}
          </div>

          {/* Task Icon & Name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div style={{ color: task.type === 'milestone' ? COLORS.warning : COLORS.primary }}>
              {getTaskIcon(task.type)}
            </div>
            <span className={`truncate ${task.type === 'phase' ? 'font-semibold' : ''}`}>
              {task.name}
            </span>
          </div>

          {/* Status */}
          <div className="w-28">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Dates */}
          <div className="w-40 text-sm text-slate-600 hidden md:block">
            {task.startDate} - {task.endDate}
          </div>

          {/* Progress */}
          <div className="w-32 hidden lg:block">
            <div className="flex items-center gap-2">
              <Progress value={task.progress} className="flex-1" />
              <span className="text-sm text-slate-600 w-10">{task.progress}%</span>
            </div>
          </div>

          {/* Assignee */}
          <div className="w-32 text-sm text-slate-600 hidden xl:block">
            {task.assignee || '-'}
          </div>

          {/* Actions */}
          <button className="p-1 hover:bg-slate-100 rounded">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && task.children?.map(child => renderTaskRow(child, level + 1, task.id))}
      </div>
    );
  };

  const renderTimelineView = (project: Project) => {
    return (
      <div className="space-y-4">
        {/* Timeline Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
                <Button variant="outline" size="sm">
                  Autoschedule
                </Button>
                <Button variant="outline" size="sm">
                  Compare Baseline
                </Button>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="weeks">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="quarters">Quarters</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  View Options
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WBS Task List */}
        <Card>
          <CardHeader>
            <CardTitle>Work Breakdown Structure</CardTitle>
            <CardDescription>
              Phases, milestones, and tasks with dependencies
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b bg-slate-50 flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-600">
              <div className="w-4"></div>
              <div className="flex-1">Task Name</div>
              <div className="w-28">Status</div>
              <div className="w-40 hidden md:block">Dates</div>
              <div className="w-32 hidden lg:block">Progress</div>
              <div className="w-32 hidden xl:block">Assignee</div>
              <div className="w-8"></div>
            </div>
            {project.tasks.map(task => renderTaskRow(task))}
          </CardContent>
        </Card>

        {/* Critical Path Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-slate-600">Total Tasks</div>
                <div className="text-2xl font-semibold">12</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">On Critical Path</div>
                <div className="text-2xl font-semibold" style={{ color: COLORS.danger }}>
                  5
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Dependencies</div>
                <div className="text-2xl font-semibold">8</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Project Float</div>
                <div className="text-2xl font-semibold">3 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGridView = (project: Project) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Grid</CardTitle>
          <CardDescription>Excel-inspired grid for quick data entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-2 px-3">WBS</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Start</th>
                  <th className="text-left py-2 px-3">End</th>
                  <th className="text-left py-2 px-3">Duration</th>
                  <th className="text-left py-2 px-3">ETC</th>
                  <th className="text-left py-2 px-3">Actuals</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.flatMap((task, idx) => {
                  const rows = [
                    <tr key={task.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold">{task.name}</td>
                      <td className="py-2 px-3">{task.type}</td>
                      <td className="py-2 px-3">{task.startDate}</td>
                      <td className="py-2 px-3">{task.endDate}</td>
                      <td className="py-2 px-3">{task.duration}d</td>
                      <td className="py-2 px-3">{task.etc}h</td>
                      <td className="py-2 px-3">{task.actuals}h</td>
                      <td className="py-2 px-3">{task.status}</td>
                    </tr>
                  ];
                  if (task.children) {
                    task.children.forEach((child, childIdx) => {
                      rows.push(
                        <tr key={child.id} className="border-b hover:bg-slate-50">
                          <td className="py-2 px-3 pl-8">{`${idx + 1}.${childIdx + 1}`}</td>
                          <td className="py-2 px-3">{child.name}</td>
                          <td className="py-2 px-3">{child.type}</td>
                          <td className="py-2 px-3">{child.startDate}</td>
                          <td className="py-2 px-3">{child.endDate}</td>
                          <td className="py-2 px-3">{child.duration}d</td>
                          <td className="py-2 px-3">{child.etc}h</td>
                          <td className="py-2 px-3">{child.actuals}h</td>
                          <td className="py-2 px-3">{child.status}</td>
                        </tr>
                      );
                    });
                  }
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBoardView = (project: Project) => {
    const allTasks = project.tasks.flatMap(task => {
      if (task.children) {
        return [task, ...task.children];
      }
      return [task];
    });

    const columns = {
      not_started: allTasks.filter(t => t.status === 'not_started'),
      in_progress: allTasks.filter(t => t.status === 'in_progress'),
      completed: allTasks.filter(t => t.status === 'completed'),
      at_risk: allTasks.filter(t => t.status === 'at_risk'),
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Configure Card</Button>
              <Button variant="outline" size="sm">View Options</Button>
              <Select defaultValue="status">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Color by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(columns).map(([status, tasks]) => (
            <Card key={status} className="bg-slate-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {getStatusBadge(status).label}
                  </CardTitle>
                  <Badge variant="secondary">{tasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.map(task => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-2 mb-2">
                        {getTaskIcon(task.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{task.name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {task.duration}d • {task.assignee || 'Unassigned'}
                          </div>
                        </div>
                      </div>
                      <Progress value={task.progress} className="h-1" />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const currentProject = projects.find(p => p.id === selectedProject);

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

          {/* Project List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Portfolio overview</CardDescription>
                </div>
                <Button style={{ backgroundColor: COLORS.primary }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project.id);
                      setActiveView('projects');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {project.manager} • {project.team} members • {project.phase}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${getStatusBadge(project.status).color}20`,
                          color: getStatusBadge(project.status).color,
                        }}
                      >
                        {getStatusBadge(project.status).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex-1">
                        <Progress value={project.progress} />
                      </div>
                      <div className="w-12 text-right">{project.progress}%</div>
                      <div className="text-right">
                        {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Project Detail View
  if (activeView === 'projects' && currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
        <main className="container mx-auto p-6 max-w-7xl">
          {/* Project Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setActiveView('dashboard');
                }}
                className="hover:text-slate-900"
              >
                Projects
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>{currentProject.name}</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
                  {currentProject.name}
                </h1>
                <p className="text-muted-foreground">
                  {currentProject.manager} • {currentProject.startDate} - {currentProject.endDate}
                </p>
              </div>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${getStatusBadge(currentProject.status).color}20`,
                  color: getStatusBadge(currentProject.status).color,
                }}
              >
                {getStatusBadge(currentProject.status).label}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={taskView} onValueChange={(v) => setTaskView(v as any)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="timeline">Timeline (WBS)</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              {renderTimelineView(currentProject)}
            </TabsContent>

            <TabsContent value="grid">
              {renderGridView(currentProject)}
            </TabsContent>

            <TabsContent value="board">
              {renderBoardView(currentProject)}
            </TabsContent>

            <TabsContent value="features">
              <AppFeatures
                appName="Finance PPM"
                appColor={COLORS.primary}
                features={[
                  {
                    name: "Work Breakdown Structure (WBS)",
                    description: "Hierarchical task organization with phases, milestones, and tasks",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Timeline Layout",
                    description: "Gantt-style timeline view with task dependencies and critical path",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Grid Layout",
                    description: "Excel-inspired grid for quick data entry and bulk editing",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Board Layout",
                    description: "Kanban-style board view with drag-and-drop cards",
                    status: "active",
                    category: "Core Functionality"
                  },
                  {
                    name: "Task Dependencies",
                    description: "Finish-Start, Start-Start, Finish-Finish, Start-Finish relationships",
                    status: "active",
                    category: "Scheduling"
                  },
                  {
                    name: "Autoschedule",
                    description: "Automated task scheduling with critical path calculation",
                    status: "beta",
                    category: "Scheduling"
                  },
                  {
                    name: "Resource Assignment",
                    description: "Assign resources, roles, and teams to tasks",
                    status: "active",
                    category: "Resource Management"
                  },
                  {
                    name: "ETC & Actuals Tracking",
                    description: "Estimate To Complete and actual hours tracking",
                    status: "active",
                    category: "Time Tracking"
                  },
                  {
                    name: "Baseline Comparison",
                    description: "Compare current schedule against baseline",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "Portfolio Dashboard",
                    description: "High-level portfolio metrics and project health",
                    status: "active",
                    category: "Analytics"
                  },
                  {
                    name: "Financial Planning",
                    description: "Budget tracking and cost management",
                    status: "active",
                    category: "Financial Management"
                  },
                  {
                    name: "Risk Management",
                    description: "Identify and track project risks",
                    status: "planned",
                    category: "Risk Management"
                  },
                  {
                    name: "Subprojects",
                    description: "Group related projects under master project",
                    status: "planned",
                    category: "Project Management"
                  },
                  {
                    name: "Timesheet Integration",
                    description: "Connect tasks with timesheet entries",
                    status: "planned",
                    category: "Time Tracking"
                  },
                  {
                    name: "Configurable Widgets",
                    description: "Custom dashboard widgets with KPIs",
                    status: "beta",
                    category: "Customization"
                  }
                ]}
                quickActions={[
                  {
                    label: "Create Project",
                    description: "Start a new project with template",
                    icon: "🚀"
                  },
                  {
                    label: "View Timeline",
                    description: "Open Gantt chart view",
                    icon: "📅"
                  },
                  {
                    label: "Autoschedule",
                    description: "Run critical path analysis",
                    icon: "⚡"
                  },
                  {
                    label: "Portfolio View",
                    description: "See all projects at a glance",
                    icon: "📊"
                  }
                ]}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Default back to dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
      <main className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Select a view from the navigation</h2>
          <Button onClick={() => setActiveView('dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
