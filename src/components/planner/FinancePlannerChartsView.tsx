import React from 'react';
import { FinancePlannerPlan } from '../../lib/data/finance-planner-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, Clock, Target } from 'lucide-react';

interface FinancePlannerChartsViewProps {
  plan: FinancePlannerPlan;
}

export const FinancePlannerChartsView: React.FC<FinancePlannerChartsViewProps> = ({ plan }) => {
  // Calculate statistics
  const allTasks = plan.buckets.flatMap(bucket => bucket.tasks);
  
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.progress === 100).length;
  const inProgressTasks = allTasks.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStartedTasks = allTasks.filter(t => t.progress === 0).length;
  const overdueTasks = allTasks.filter(t => new Date(t.due_date) < new Date() && t.progress < 100).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority breakdown
  const priorityStats = {
    Critical: allTasks.filter(t => t.priority === 'Critical').length,
    High: allTasks.filter(t => t.priority === 'High').length,
    Medium: allTasks.filter(t => t.priority === 'Medium').length,
    Low: allTasks.filter(t => t.priority === 'Low').length,
  };

  // Bucket statistics
  const bucketStats = plan.buckets.map(bucket => ({
    name: bucket.bucket_name,
    color: bucket.color,
    total: bucket.tasks.length,
    completed: bucket.tasks.filter(t => t.progress === 100).length,
    completionRate: bucket.tasks.length > 0 
      ? Math.round((bucket.tasks.filter(t => t.progress === 100).length / bucket.tasks.length) * 100)
      : 0
  }));

  // Assignee workload
  const assigneeWorkload: { [key: string]: number } = {};
  allTasks.forEach(task => {
    task.assigned_to.forEach(assignee => {
      assigneeWorkload[assignee] = (assigneeWorkload[assignee] || 0) + 1;
    });
  });

  const topAssignees = Object.entries(assigneeWorkload)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Upcoming deadlines (next 7 days)
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTasks = allTasks.filter(t => {
    const dueDate = new Date(t.due_date);
    return dueDate >= now && dueDate <= next7Days && t.progress < 100;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Analytics</h2>
          <p className="text-gray-600">Overview and insights for {plan.plan_title}</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total Tasks
              </CardDescription>
              <CardTitle className="text-3xl">{totalTasks}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">{completionRate}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">{completedTasks}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-600">{inProgressTasks} in progress</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{notStartedTasks} not started</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Overdue
              </CardDescription>
              <CardTitle className="text-3xl text-red-600">{overdueTasks}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="destructive" className="text-xs">
                Needs attention
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Due This Week
              </CardDescription>
              <CardTitle className="text-3xl text-amber-600">{upcomingTasks.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                Next 7 days
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bucket Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Progress by Bucket
              </CardTitle>
              <CardDescription>Task completion across workflow stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bucketStats.map((bucket) => (
                  <div key={bucket.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bucket.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">{bucket.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {bucket.completed}/{bucket.total}
                      </span>
                    </div>
                    <Progress value={bucket.completionRate} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{bucket.completionRate}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Priority Distribution
              </CardTitle>
              <CardDescription>Tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(priorityStats).map(([priority, count]) => {
                  const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  const colors = {
                    Critical: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
                    High: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
                    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
                    Low: { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-400' }
                  };
                  const color = colors[priority as keyof typeof colors];

                  return (
                    <div key={priority} className="flex items-center gap-3">
                      <Badge variant="outline" className={`text-xs w-20 justify-center ${color.bg} ${color.text}`}>
                        {priority}
                      </Badge>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color.bar} flex items-center justify-end px-2`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-xs font-medium text-white">{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {percentage <= 15 && (
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task) => {
                    const daysUntil = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <span className={daysUntil <= 1 ? 'text-red-600 font-medium' : ''}>
                              ({daysUntil} {daysUntil === 1 ? 'day' : 'days'})
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={task.priority === 'Critical' ? 'destructive' : 'outline'}
                          className="text-[9px]"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
                  {upcomingTasks.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{upcomingTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Team Workload
              </CardTitle>
              <CardDescription>Tasks assigned per team member</CardDescription>
            </CardHeader>
            <CardContent>
              {topAssignees.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topAssignees.map(([assignee, count]) => {
                    const maxCount = Math.max(...topAssignees.map(([, c]) => c));
                    const percentage = (count / maxCount) * 100;

                    return (
                      <div key={assignee} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-semibold text-white">
                            {assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 truncate">{assignee}</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 flex items-center justify-end px-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 20 && (
                                <span className="text-xs font-medium text-white">{count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {percentage <= 20 && (
                          <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
