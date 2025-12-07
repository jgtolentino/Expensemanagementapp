import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ExpenseReportForm, ExpenseReport } from './components/te/ExpenseReportForm';
import { CashAdvanceForm, CashAdvance } from './components/te/CashAdvanceForm';
import { TEAnalyticsDashboard } from './components/te/TEAnalyticsDashboard';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'finance';
  department: string;
};

export default function TEApp() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCashAdvanceForm, setShowCashAdvanceForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null);
  const [selectedAdvance, setSelectedAdvance] = useState<CashAdvance | null>(null);

  // Mock data
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([
    {
      id: 'EXP-001',
      reportCode: 'EXP-2025-001',
      employeeId: 'emp1',
      employeeName: 'Current User',
      status: 'submitted',
      purpose: 'Q4 Client Meetings - Manila',
      periodStart: '2025-11-01',
      periodEnd: '2025-11-30',
      lines: [
        {
          id: 'line1',
          date: '2025-11-15',
          merchant: 'Grab',
          category: 'Transportation',
          amount: 450,
          currency: 'PHP',
          description: 'Airport to office',
        },
        {
          id: 'line2',
          date: '2025-11-15',
          merchant: 'Makati Shangri-La',
          category: 'Accommodation',
          amount: 8500,
          currency: 'PHP',
          description: '2 nights',
        },
      ],
      totalAmount: 8950,
      netReimbursable: 8950,
      createdAt: new Date('2025-11-30'),
      submittedAt: new Date('2025-12-01'),
    },
    {
      id: 'EXP-002',
      reportCode: 'EXP-2025-002',
      employeeId: 'emp1',
      employeeName: 'Current User',
      status: 'approved',
      purpose: 'Weekly team lunch',
      periodStart: '2025-10-01',
      periodEnd: '2025-10-31',
      lines: [
        {
          id: 'line3',
          date: '2025-10-20',
          merchant: 'Vikings Buffet',
          category: 'Meals',
          amount: 3200,
          currency: 'PHP',
          description: 'Team building lunch',
        },
      ],
      totalAmount: 3200,
      netReimbursable: 3200,
      createdAt: new Date('2025-10-31'),
      submittedAt: new Date('2025-11-01'),
    },
  ]);

  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>([
    {
      id: 'CA-001',
      requestCode: 'CA-2025-001',
      employeeId: 'emp1',
      employeeName: 'Current User',
      status: 'disbursed',
      requestedAmount: 15000,
      approvedAmount: 15000,
      currency: 'PHP',
      purpose: 'Cebu business trip - airfare and accommodation advance',
      neededDate: '2025-12-15',
      createdAt: new Date('2025-11-25'),
      submittedAt: new Date('2025-11-25'),
      approvedAt: new Date('2025-11-26'),
      disbursedAt: new Date('2025-11-27'),
      settledAmount: 0,
      outstandingAmount: 15000,
    },
    {
      id: 'CA-002',
      requestCode: 'CA-2025-002',
      employeeId: 'emp1',
      employeeName: 'Current User',
      status: 'settled',
      requestedAmount: 5000,
      approvedAmount: 5000,
      currency: 'PHP',
      purpose: 'Local client visits',
      neededDate: '2025-10-10',
      createdAt: new Date('2025-10-05'),
      submittedAt: new Date('2025-10-05'),
      approvedAt: new Date('2025-10-06'),
      disbursedAt: new Date('2025-10-07'),
      settledAmount: 5000,
      outstandingAmount: 0,
    },
  ]);

  const COLORS = {
    primary: '#0070F2',
    bg: '#F4F5F7',
    accent: '#FF6B35',
  };

  const statusColors: Record<string, string> = {
    draft: '#6B7280',
    submitted: '#0070F2',
    approved: '#10B981',
    rejected: '#EF4444',
    paid: '#6366F1',
    disbursed: '#F59E0B',
    settled: '#10B981',
  };

  const handleLogin = (role: 'employee' | 'manager' | 'finance') => {
    const users = {
      employee: {
        id: 'emp1',
        name: 'Maria Santos',
        email: 'maria.santos@company.com',
        role: 'employee' as const,
        department: 'Sales',
      },
      manager: {
        id: 'mgr1',
        name: 'Juan Manager',
        email: 'juan.manager@company.com',
        role: 'manager' as const,
        department: 'Sales',
      },
      finance: {
        id: 'fin1',
        name: 'Finance Director',
        email: 'finance@company.com',
        role: 'finance' as const,
        department: 'Finance',
      },
    };
    setUser(users[role]);
  };

  const handleSaveExpenseReport = (report: Partial<ExpenseReport>) => {
    const newReport: ExpenseReport = {
      id: `EXP-${String(expenseReports.length + 1).padStart(3, '0')}`,
      reportCode: `EXP-2025-${String(expenseReports.length + 1).padStart(3, '0')}`,
      employeeId: user?.id || 'emp1',
      employeeName: user?.name || 'Current User',
      status: 'draft',
      purpose: report.purpose || '',
      periodStart: report.periodStart || '',
      periodEnd: report.periodEnd || '',
      lines: report.lines || [],
      totalAmount: report.totalAmount || 0,
      netReimbursable: report.netReimbursable || 0,
      createdAt: new Date(),
    };
    setExpenseReports([newReport, ...expenseReports]);
    setShowExpenseForm(false);
    setActiveTab('expenses');
  };

  const handleSaveCashAdvance = (advance: Partial<CashAdvance>) => {
    const newAdvance: CashAdvance = {
      id: `CA-${String(cashAdvances.length + 1).padStart(3, '0')}`,
      requestCode: `CA-2025-${String(cashAdvances.length + 1).padStart(3, '0')}`,
      employeeId: user?.id || 'emp1',
      employeeName: user?.name || 'Current User',
      status: 'submitted',
      requestedAmount: advance.requestedAmount || 0,
      currency: 'PHP',
      purpose: advance.purpose || '',
      neededDate: advance.neededDate || '',
      createdAt: new Date(),
      submittedAt: new Date(),
    };
    setCashAdvances([newAdvance, ...cashAdvances]);
    setShowCashAdvanceForm(false);
    setActiveTab('advances');
  };

  const handleApproveReport = (reportId: string) => {
    setExpenseReports(
      expenseReports.map((r) => (r.id === reportId ? { ...r, status: 'approved' as const } : r))
    );
    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string) => {
    setExpenseReports(
      expenseReports.map((r) => (r.id === reportId ? { ...r, status: 'rejected' as const } : r))
    );
    setSelectedReport(null);
  };

  // Login screen
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: COLORS.bg }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: COLORS.primary }}>
              Travel & Expense
            </CardTitle>
            <CardDescription>SAP Concur-style expense management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">Demo Login:</p>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => handleLogin('employee')} style={{ backgroundColor: COLORS.primary }}>
                Employee
              </Button>
              <Button onClick={() => handleLogin('manager')} variant="outline">
                Manager
              </Button>
              <Button onClick={() => handleLogin('finance')} variant="outline">
                Finance Director
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expense report detail view
  if (selectedReport) {
    const canApprove = user.role === 'manager' && selectedReport.status === 'submitted';

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setSelectedReport(null)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedReport.purpose}</CardTitle>
                  <CardDescription>{selectedReport.reportCode}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColors[selectedReport.status]}20`,
                    color: statusColors[selectedReport.status],
                  }}
                >
                  {selectedReport.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Employee:</span>
                  <div>{selectedReport.employeeName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Period:</span>
                  <div>
                    {selectedReport.periodStart} to {selectedReport.periodEnd}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedReport.lines.map((line) => (
                  <div key={line.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{line.merchant}</div>
                      <div className="text-sm text-muted-foreground">
                        {line.category} • {line.date}
                      </div>
                      {line.description && (
                        <div className="text-sm text-muted-foreground mt-1">{line.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₱{line.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-xl">₱{selectedReport.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Cash Advance Applied:</span>
                <span>₱{(selectedReport.appliedCashAdvance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span>Net Reimbursable:</span>
                <span className="text-xl" style={{ color: COLORS.primary }}>
                  ₱{selectedReport.netReimbursable.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {canApprove && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleRejectReport(selectedReport.id)}
                className="border-red-500 text-red-500"
              >
                Reject
              </Button>
              <Button onClick={() => handleApproveReport(selectedReport.id)} style={{ backgroundColor: '#10B981' }}>
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Cash advance detail view
  if (selectedAdvance) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setSelectedAdvance(null)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Cash Advance Request</CardTitle>
                  <CardDescription>{selectedAdvance.requestCode}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColors[selectedAdvance.status]}20`,
                    color: statusColors[selectedAdvance.status],
                  }}
                >
                  {selectedAdvance.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Purpose</div>
                <div>{selectedAdvance.purpose}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Requested Amount</div>
                  <div className="text-2xl" style={{ color: COLORS.primary }}>
                    ₱{selectedAdvance.requestedAmount.toLocaleString()}
                  </div>
                </div>
                {selectedAdvance.approvedAmount && (
                  <div>
                    <div className="text-sm text-muted-foreground">Approved Amount</div>
                    <div className="text-2xl text-green-600">
                      ₱{selectedAdvance.approvedAmount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              {selectedAdvance.status === 'disbursed' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Settled</div>
                    <div className="text-lg">₱{(selectedAdvance.settledAmount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Outstanding</div>
                    <div className="text-lg text-orange-600">
                      ₱{(selectedAdvance.outstandingAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Expense form view
  if (showExpenseForm) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl" style={{ color: COLORS.primary }}>
            New Expense Report
          </h2>
          <ExpenseReportForm onSave={handleSaveExpenseReport} onCancel={() => setShowExpenseForm(false)} />
        </div>
      </div>
    );
  }

  // Cash advance form view
  if (showCashAdvanceForm) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl" style={{ color: COLORS.primary }}>
            New Cash Advance Request
          </h2>
          <CashAdvanceForm onSave={handleSaveCashAdvance} onCancel={() => setShowCashAdvanceForm(false)} />
        </div>
      </div>
    );
  }

  // Main dashboard
  const myReports = expenseReports.filter((r) => r.employeeId === user.id);
  const myAdvances = cashAdvances.filter((a) => a.employeeId === user.id);
  const outstandingAdvances = myAdvances.filter((a) => a.status === 'disbursed');
  const totalOutstanding = outstandingAdvances.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl" style={{ color: COLORS.primary }}>
                Travel & Expense
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.name} • {user.department}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setUser(null)}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="advances">Cash Advances</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-xl" style={{ color: COLORS.primary }}>
              Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: COLORS.primary }}>
                    {myReports.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#F59E0B' }}>
                    {outstandingAdvances.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Outstanding Advances</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#EF4444' }}>
                    ₱{totalOutstanding.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">To Settle</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => setShowExpenseForm(true)}>
                    + New Expense Report
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setShowCashAdvanceForm(true)}>
                    + Request Cash Advance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myReports.slice(0, 3).map((report) => (
                      <div
                        key={report.id}
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div>
                          <div className="text-sm font-medium">{report.purpose}</div>
                          <div className="text-xs text-muted-foreground">{report.reportCode}</div>
                        </div>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${statusColors[report.status]}20`,
                            color: statusColors[report.status],
                          }}
                        >
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: COLORS.primary }}>
                My Expense Reports
              </h2>
              <Button size="sm" onClick={() => setShowExpenseForm(true)} style={{ backgroundColor: COLORS.primary }}>
                + New Report
              </Button>
            </div>

            <div className="space-y-3">
              {myReports.map((report) => (
                <Card
                  key={report.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{report.purpose}</CardTitle>
                        <CardDescription className="text-xs">
                          {report.reportCode} • {report.periodStart} to {report.periodEnd}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[report.status]}20`,
                          color: statusColors[report.status],
                        }}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-lg" style={{ color: COLORS.primary }}>
                          ₱{report.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cash Advances Tab */}
          <TabsContent value="advances" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: COLORS.primary }}>
                My Cash Advances
              </h2>
              <Button
                size="sm"
                onClick={() => setShowCashAdvanceForm(true)}
                style={{ backgroundColor: COLORS.primary }}
              >
                + New Request
              </Button>
            </div>

            <div className="space-y-3">
              {myAdvances.map((advance) => (
                <Card
                  key={advance.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedAdvance(advance)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{advance.purpose}</CardTitle>
                        <CardDescription className="text-xs">{advance.requestCode}</CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[advance.status]}20`,
                          color: statusColors[advance.status],
                        }}
                      >
                        {advance.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Amount</div>
                        <div className="text-lg" style={{ color: COLORS.primary }}>
                          ₱{advance.requestedAmount.toLocaleString()}
                        </div>
                      </div>
                      {advance.status === 'disbursed' && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Outstanding</div>
                          <div className="text-lg text-orange-600">
                            ₱{(advance.outstandingAmount || 0).toLocaleString()}
                          </div>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <TEAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
