import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import AppFeatures from "./components/AppFeatures";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Download, Share2, Filter, Calendar, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Table as TableIcon } from "lucide-react";

const COLORS = {
  primary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0EA5E9",
};

// Mock data for dashboards
const revenueData = [
  { month: "Jan", revenue: 2400000, target: 2200000, expenses: 1800000 },
  { month: "Feb", revenue: 2600000, target: 2400000, expenses: 1900000 },
  { month: "Mar", revenue: 2800000, target: 2500000, expenses: 2000000 },
  { month: "Apr", revenue: 3100000, target: 2600000, expenses: 2100000 },
  { month: "May", revenue: 2900000, target: 2700000, expenses: 2000000 },
  { month: "Jun", revenue: 3300000, target: 2800000, expenses: 2200000 },
];

const clientDistribution = [
  { name: "Technology", value: 35, color: "#8B5CF6" },
  { name: "FMCG", value: 25, color: "#0EA5E9" },
  { name: "Finance", value: 20, color: "#10B981" },
  { name: "Retail", value: 12, color: "#F59E0B" },
  { name: "Others", value: 8, color: "#6B7280" },
];

const projectPerformance = [
  { name: "Q1", completed: 24, inProgress: 12, delayed: 3 },
  { name: "Q2", completed: 28, inProgress: 15, delayed: 2 },
  { name: "Q3", completed: 32, inProgress: 18, delayed: 4 },
  { name: "Q4", completed: 26, inProgress: 14, delayed: 2 },
];

const kpiData = [
  { label: "Total Revenue", value: "₱17.1M", change: "+12.5%", trend: "up", period: "vs last quarter" },
  { label: "Active Projects", value: "47", change: "+8", trend: "up", period: "this month" },
  { label: "Client Satisfaction", value: "94%", change: "+2%", trend: "up", period: "NPS score" },
  { label: "Team Utilization", value: "78%", change: "-3%", trend: "down", period: "capacity used" },
  { label: "Avg Project Margin", value: "32%", change: "+1.5%", trend: "up", period: "gross margin" },
  { label: "Outstanding AR", value: "₱4.2M", change: "-8%", trend: "up", period: "aging < 30 days" },
];

const topClients = [
  { name: "Ayala Corporation", revenue: 3200000, projects: 8, status: "active" },
  { name: "SM Investments", revenue: 2800000, projects: 6, status: "active" },
  { name: "BDO Unibank", revenue: 2400000, projects: 5, status: "active" },
  { name: "Globe Telecom", revenue: 2100000, projects: 7, status: "active" },
  { name: "Jollibee Foods", revenue: 1900000, projects: 4, status: "active" },
];

const teamPerformance = [
  { name: "Creative", billable: 82, utilization: 85, revenue: 2400000 },
  { name: "Strategy", billable: 78, utilization: 80, revenue: 1800000 },
  { name: "Digital", billable: 85, utilization: 88, revenue: 2100000 },
  { name: "Production", billable: 75, utilization: 78, revenue: 1600000 },
];

const savedReports = [
  { id: "R001", name: "Executive Dashboard", category: "Overview", lastRun: "2 hours ago", schedule: "Daily 9AM" },
  { id: "R002", name: "Revenue Analysis", category: "Finance", lastRun: "1 day ago", schedule: "Weekly Mon" },
  { id: "R003", name: "Project Pipeline", category: "Operations", lastRun: "3 hours ago", schedule: "Daily 10AM" },
  { id: "R004", name: "Client Profitability", category: "Finance", lastRun: "2 days ago", schedule: "Monthly 1st" },
  { id: "R005", name: "Team Capacity", category: "Resources", lastRun: "5 hours ago", schedule: "Daily 8AM" },
];

export default function BIApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("quarter");
  const [selectedDashboard, setSelectedDashboard] = useState("executive");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100">
      <main className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
            Business Intelligence
          </h1>
          <p className="text-muted-foreground">
            Power BI / Tableau-style analytics & reporting platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="data">Data Explorer</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3">
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Overview</SelectItem>
                    <SelectItem value="finance">Finance Dashboard</SelectItem>
                    <SelectItem value="operations">Operations Dashboard</SelectItem>
                    <SelectItem value="clients">Client Analytics</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiData.map((kpi, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <CardDescription>{kpi.label}</CardDescription>
                    <CardTitle className="text-3xl">{kpi.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{ color: kpi.trend === "up" ? COLORS.success : COLORS.danger }}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpi.period}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue vs target & expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke={COLORS.info}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Distribution by Industry</CardTitle>
                  <CardDescription>Revenue breakdown by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                  <CardDescription>Quarterly project completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" fill={COLORS.info} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="delayed" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Clients</CardTitle>
                  <CardDescription>By revenue this quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topClients.map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-0">
                        <div className="flex-1">
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.projects} projects
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(client.revenue)}</div>
                          <Badge variant="secondary" className="mt-1">
                            {client.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Billability and utilization by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Department</th>
                        <th className="text-right py-3 px-4">Billable %</th>
                        <th className="text-right py-3 px-4">Utilization %</th>
                        <th className="text-right py-3 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPerformance.map((team, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-3 px-4 font-medium">{team.name}</td>
                          <td className="text-right py-3 px-4">
                            <span className="text-sm">{team.billable}%</span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${team.utilization}%`,
                                    backgroundColor: COLORS.primary,
                                  }}
                                />
                              </div>
                              <span className="text-sm w-12">{team.utilization}%</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(team.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl mb-1">Saved Reports</h2>
                <p className="text-muted-foreground">Scheduled and custom reports</p>
              </div>
              <Button style={{ backgroundColor: COLORS.primary }}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}20` }}>
                    <BarChart3 className="h-6 w-6" style={{ color: COLORS.primary }} />
                  </div>
                  <CardTitle className="text-lg">Financial</CardTitle>
                  <CardDescription>12 reports</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.info}20` }}>
                    <PieChartIcon className="h-6 w-6" style={{ color: COLORS.info }} />
                  </div>
                  <CardTitle className="text-lg">Operations</CardTitle>
                  <CardDescription>8 reports</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.success}20` }}>
                    <LineChartIcon className="h-6 w-6" style={{ color: COLORS.success }} />
                  </div>
                  <CardTitle className="text-lg">Marketing</CardTitle>
                  <CardDescription>6 reports</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.warning}20` }}>
                    <TableIcon className="h-6 w-6" style={{ color: COLORS.warning }} />
                  </div>
                  <CardTitle className="text-lg">Custom</CardTitle>
                  <CardDescription>15 reports</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Saved Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your frequently accessed reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {report.category} • Last run: {report.lastRun}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{report.schedule}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Explorer Tab */}
          <TabsContent value="data" className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1">Data Explorer</h2>
              <p className="text-muted-foreground">
                Build custom queries and explore your data
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Query Builder</CardTitle>
                <CardDescription>Create custom data views</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select defaultValue="projects">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="clients">Clients</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expenses">Expenses</SelectItem>
                        <SelectItem value="resources">Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select defaultValue="quarter">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Visualization</Label>
                    <Select defaultValue="table">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button style={{ backgroundColor: COLORS.primary }}>Run Query</Button>
                  <Button variant="outline">Save Query</Button>
                  <Button variant="ghost">Reset</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Data Sources</CardTitle>
                <CardDescription>Connected systems and databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Odoo ERP", status: "Connected", records: "47,234 records" },
                    { name: "Supabase DB", status: "Connected", records: "18 tables" },
                    { name: "Finance PPM", status: "Connected", records: "24 projects" },
                    { name: "Rate Card Pro", status: "Connected", records: "156 quotes" },
                    { name: "T&E System", status: "Connected", records: "892 expenses" },
                    { name: "Gearroom", status: "Connected", records: "134 assets" },
                  ].map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-muted-foreground">{source.records}</div>
                      </div>
                      <Badge variant="secondary" style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success }}>
                        {source.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <AppFeatures
              appName="Business Intelligence"
              appColor={COLORS.primary}
              features={[
                {
                  name: "Interactive Dashboards",
                  description: "Drag-and-drop dashboard builder with real-time data visualization",
                  status: "active",
                  category: "Core Functionality"
                },
                {
                  name: "Custom Reports",
                  description: "Build and schedule custom reports with multiple data sources",
                  status: "active",
                  category: "Core Functionality"
                },
                {
                  name: "Data Visualization",
                  description: "Bar, line, pie, area charts and advanced visualizations",
                  status: "active",
                  category: "Core Functionality"
                },
                {
                  name: "Query Builder",
                  description: "Visual SQL query builder with drag-and-drop interface",
                  status: "active",
                  category: "Data Analysis"
                },
                {
                  name: "KPI Tracking",
                  description: "Track key performance indicators with trend analysis",
                  status: "active",
                  category: "Analytics"
                },
                {
                  name: "Multi-Source Integration",
                  description: "Connect to Odoo, Supabase, and other data sources",
                  status: "active",
                  category: "Integrations"
                },
                {
                  name: "Scheduled Reports",
                  description: "Automated report generation and email delivery",
                  status: "active",
                  category: "Automation"
                },
                {
                  name: "Export Capabilities",
                  description: "Export to PDF, Excel, CSV, and PowerPoint formats",
                  status: "active",
                  category: "Export & Sharing"
                },
                {
                  name: "Role-Based Access",
                  description: "Control dashboard and report visibility by user role",
                  status: "active",
                  category: "Security"
                },
                {
                  name: "Real-Time Updates",
                  description: "Live data refresh with customizable intervals",
                  status: "beta",
                  category: "Performance"
                },
                {
                  name: "AI-Powered Insights",
                  description: "Automated anomaly detection and predictive analytics",
                  status: "planned",
                  category: "AI & Machine Learning"
                },
                {
                  name: "Natural Language Queries",
                  description: "Ask questions in plain English to generate reports",
                  status: "planned",
                  category: "AI & Machine Learning"
                },
                {
                  name: "Mobile App",
                  description: "iOS and Android apps for dashboards on-the-go",
                  status: "planned",
                  category: "Mobile"
                },
                {
                  name: "Collaboration Features",
                  description: "Share dashboards, add comments, and collaborative analysis",
                  status: "beta",
                  category: "Collaboration"
                },
                {
                  name: "Data Governance",
                  description: "Data lineage tracking and audit logs",
                  status: "planned",
                  category: "Security"
                }
              ]}
              quickActions={[
                {
                  label: "View Executive Dashboard",
                  description: "High-level KPIs and metrics",
                  icon: "📊"
                },
                {
                  label: "Create Custom Report",
                  description: "Build a new report from scratch",
                  icon: "📝"
                },
                {
                  label: "Export Data",
                  description: "Download data in multiple formats",
                  icon: "📥"
                },
                {
                  label: "Query Builder",
                  description: "Explore data with custom queries",
                  icon: "🔍"
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
