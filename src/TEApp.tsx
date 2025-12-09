import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Progress } from './components/ui/progress';
import AppFeatures from './components/AppFeatures';
import {
  Plane, CreditCard, Receipt, DollarSign, TrendingUp, FileText, Camera,
  Plus, Calendar, MapPin, Users, CheckCircle2, XCircle, Clock,
  AlertTriangle, Download, Upload, Filter, Search, MoreVertical,
  Car, Utensils, Hotel, ShoppingBag, Phone, Fuel, Train, ChevronRight
} from 'lucide-react';

const COLORS = {
  primary: '#0070F2',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
};

type ExpenseCategory = 
  | 'Airfare' | 'Accommodation' | 'Meals' | 'Transportation' | 'Car Rental'
  | 'Fuel' | 'Parking' | 'Entertainment' | 'Office Supplies' | 'Communication'
  | 'Per Diem' | 'Mileage' | 'Other';

interface ExpenseLine {
  id: string;
  date: string;
  category: ExpenseCategory;
  merchant: string;
  amount: number;
  currency: string;
  description: string;
  receipt?: boolean;
  policyCompliant: boolean;
  mileage?: number;
  fromLocation?: string;
  toLocation?: string;
}

interface ExpenseReport {
  id: string;
  reportCode: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'pending_approval';
  employeeName: string;
  employeeId: string;
  purpose: string;
  periodStart: string;
  periodEnd: string;
  lines: ExpenseLine[];
  totalAmount: number;
  advanceAmount: number;
  netReimbursable: number;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  approver?: string;
  policyViolations: number;
  comments?: string[];
}

interface CashAdvance {
  id: string;
  requestCode: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'disbursed' | 'settled';
  employeeName: string;
  employeeId: string;
  requestedAmount: number;
  approvedAmount: number;
  currency: string;
  purpose: string;
  neededDate: string;
  tripStart: string;
  tripEnd: string;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  settledAmount: number;
  outstandingAmount: number;
  approver?: string;
}

interface MileageEntry {
  id: string;
  date: string;
  from: string;
  to: string;
  distance: number;
  purpose: string;
  rate: number;
  amount: number;
}

export default function TEApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null);

  // Mock Data
  const expenseReports: ExpenseReport[] = [
    {
      id: 'EXP-001',
      reportCode: 'EXP-2024-001',
      status: 'submitted',
      employeeName: 'Maria Santos',
      employeeId: 'EMP-001',
      purpose: 'Q4 Client Meetings - Manila & Cebu',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-15',
      totalAmount: 45750,
      advanceAmount: 15000,
      netReimbursable: 30750,
      policyViolations: 0,
      createdAt: new Date('2024-12-15'),
      submittedAt: new Date('2024-12-16'),
      approver: 'Juan Manager',
      lines: [
        {
          id: 'L001',
          date: '2024-12-02',
          category: 'Airfare',
          merchant: 'Philippine Airlines',
          amount: 8500,
          currency: 'PHP',
          description: 'MNL-CEB Round Trip',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L002',
          date: '2024-12-03',
          category: 'Accommodation',
          merchant: 'Marco Polo Cebu',
          amount: 12500,
          currency: 'PHP',
          description: '2 nights stay',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L003',
          date: '2024-12-03',
          category: 'Meals',
          merchant: 'Anzani Restaurant',
          amount: 4250,
          currency: 'PHP',
          description: 'Client dinner',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L004',
          date: '2024-12-04',
          category: 'Transportation',
          merchant: 'Grab',
          amount: 1200,
          currency: 'PHP',
          description: 'Hotel to meeting venue',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L005',
          date: '2024-12-05',
          category: 'Mileage',
          merchant: 'Personal Vehicle',
          amount: 850,
          currency: 'PHP',
          description: 'Office visits',
          receipt: false,
          policyCompliant: true,
          mileage: 85,
          fromLocation: 'BGC Office',
          toLocation: 'Makati Client Site',
        },
      ],
    },
    {
      id: 'EXP-002',
      reportCode: 'EXP-2024-002',
      status: 'approved',
      employeeName: 'Maria Santos',
      employeeId: 'EMP-001',
      purpose: 'November Business Expenses',
      periodStart: '2024-11-01',
      periodEnd: '2024-11-30',
      totalAmount: 8900,
      advanceAmount: 0,
      netReimbursable: 8900,
      policyViolations: 1,
      createdAt: new Date('2024-11-30'),
      submittedAt: new Date('2024-12-01'),
      approvedAt: new Date('2024-12-03'),
      approver: 'Juan Manager',
      comments: ['Parking expense exceeds policy limit by ₱200'],
      lines: [
        {
          id: 'L006',
          date: '2024-11-15',
          category: 'Meals',
          merchant: 'Starbucks',
          amount: 650,
          currency: 'PHP',
          description: 'Client meeting coffee',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L007',
          date: '2024-11-20',
          category: 'Parking',
          merchant: 'Ayala Triangle Parking',
          amount: 700,
          currency: 'PHP',
          description: 'All-day parking',
          receipt: true,
          policyCompliant: false,
        },
        {
          id: 'L008',
          date: '2024-11-25',
          category: 'Office Supplies',
          merchant: 'National Bookstore',
          amount: 2550,
          currency: 'PHP',
          description: 'Presentation materials',
          receipt: true,
          policyCompliant: true,
        },
      ],
    },
    {
      id: 'EXP-003',
      reportCode: 'EXP-2024-003',
      status: 'draft',
      employeeName: 'Maria Santos',
      employeeId: 'EMP-001',
      purpose: 'December Local Travel',
      periodStart: '2024-12-16',
      periodEnd: '2024-12-31',
      totalAmount: 3450,
      advanceAmount: 0,
      netReimbursable: 3450,
      policyViolations: 0,
      createdAt: new Date('2024-12-20'),
      lines: [
        {
          id: 'L009',
          date: '2024-12-18',
          category: 'Transportation',
          merchant: 'Grab',
          amount: 850,
          currency: 'PHP',
          description: 'Client visit',
          receipt: true,
          policyCompliant: true,
        },
        {
          id: 'L010',
          date: '2024-12-19',
          category: 'Meals',
          merchant: 'Manila Peninsula',
          amount: 2600,
          currency: 'PHP',
          description: 'Business lunch with VIP client',
          receipt: true,
          policyCompliant: true,
        },
      ],
    },
  ];

  const cashAdvances: CashAdvance[] = [
    {
      id: 'CA-001',
      requestCode: 'CA-2024-001',
      status: 'disbursed',
      employeeName: 'Maria Santos',
      employeeId: 'EMP-001',
      requestedAmount: 15000,
      approvedAmount: 15000,
      currency: 'PHP',
      purpose: 'Cebu business trip - December',
      neededDate: '2024-12-01',
      tripStart: '2024-12-02',
      tripEnd: '2024-12-05',
      createdAt: new Date('2024-11-25'),
      submittedAt: new Date('2024-11-25'),
      approvedAt: new Date('2024-11-26'),
      disbursedAt: new Date('2024-11-28'),
      settledAmount: 15000,
      outstandingAmount: 0,
      approver: 'Juan Manager',
    },
    {
      id: 'CA-002',
      requestCode: 'CA-2024-002',
      status: 'approved',
      employeeName: 'Maria Santos',
      employeeId: 'EMP-001',
      requestedAmount: 25000,
      approvedAmount: 25000,
      currency: 'PHP',
      purpose: 'Singapore trade show - January 2025',
      neededDate: '2025-01-10',
      tripStart: '2025-01-12',
      tripEnd: '2025-01-16',
      createdAt: new Date('2024-12-15'),
      submittedAt: new Date('2024-12-15'),
      approvedAt: new Date('2024-12-18'),
      settledAmount: 0,
      outstandingAmount: 25000,
      approver: 'Juan Manager',
    },
  ];

  const mileageEntries: MileageEntry[] = [
    {
      id: 'MIL-001',
      date: '2024-12-05',
      from: 'BGC Office',
      to: 'Makati Client Site',
      distance: 8.5,
      purpose: 'Client meeting',
      rate: 10,
      amount: 85,
    },
    {
      id: 'MIL-002',
      date: '2024-12-10',
      from: 'BGC Office',
      to: 'Ortigas Center',
      distance: 12.3,
      purpose: 'Supplier visit',
      rate: 10,
      amount: 123,
    },
  ];

  const dashboardMetrics = {
    pendingReimbursement: 30750,
    outstandingAdvances: 25000,
    submittedReports: 1,
    draftReports: 1,
    ytdExpenses: 154350,
    avgProcessingTime: '3.2 days',
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Draft', color: '#6B7280' },
      submitted: { label: 'Submitted', color: COLORS.info },
      pending_approval: { label: 'Pending Approval', color: COLORS.warning },
      approved: { label: 'Approved', color: COLORS.success },
      rejected: { label: 'Rejected', color: COLORS.danger },
      paid: { label: 'Paid', color: '#6366F1' },
      disbursed: { label: 'Disbursed', color: COLORS.warning },
      settled: { label: 'Settled', color: COLORS.success },
    };
    return config[status as keyof typeof config] || config.draft;
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons = {
      Airfare: <Plane className="h-4 w-4" />,
      Accommodation: <Hotel className="h-4 w-4" />,
      Meals: <Utensils className="h-4 w-4" />,
      Transportation: <Car className="h-4 w-4" />,
      'Car Rental': <Car className="h-4 w-4" />,
      Fuel: <Fuel className="h-4 w-4" />,
      Parking: <MapPin className="h-4 w-4" />,
      Entertainment: <Users className="h-4 w-4" />,
      'Office Supplies': <ShoppingBag className="h-4 w-4" />,
      Communication: <Phone className="h-4 w-4" />,
      'Per Diem': <DollarSign className="h-4 w-4" />,
      Mileage: <MapPin className="h-4 w-4" />,
      Other: <FileText className="h-4 w-4" />,
    };
    return icons[category] || icons.Other;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <main className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2" style={{ color: COLORS.primary }}>
            Travel & Expense
          </h1>
          <p className="text-muted-foreground">
            SAP Concur-style expense management
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
            <TabsTrigger value="advances">Cash Advances</TabsTrigger>
            <TabsTrigger value="mileage">Mileage</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setShowExpenseForm(true);
                  setActiveTab('expenses');
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}
                    >
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">New Expense Report</div>
                      <div className="text-sm text-slate-500">Create & submit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setShowAdvanceForm(true);
                  setActiveTab('advances');
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.warning}20`, color: COLORS.warning }}
                    >
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Request Cash Advance</div>
                      <div className="text-sm text-slate-500">For upcoming trip</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success }}
                    >
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Capture Receipt</div>
                      <div className="text-sm text-slate-500">Mobile OCR scan</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending Reimbursement</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(dashboardMetrics.pendingReimbursement)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600">
                    {dashboardMetrics.submittedReports} report(s) submitted
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Outstanding Advances</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(dashboardMetrics.outstandingAdvances)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm" style={{ color: COLORS.warning }}>
                    Settlement required
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>YTD Expenses</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(dashboardMetrics.ytdExpenses)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600">
                    Avg processing: {dashboardMetrics.avgProcessingTime}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Expense Reports</CardTitle>
                    <CardDescription>Your latest submissions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('expenses')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseReports.slice(0, 3).map(report => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        setSelectedReport(report);
                        setActiveTab('expenses');
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{report.purpose}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {report.reportCode} • {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-medium">{formatCurrency(report.totalAmount)}</div>
                        {report.advanceAmount > 0 && (
                          <div className="text-sm text-slate-500">
                            Net: {formatCurrency(report.netReimbursable)}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${getStatusBadge(report.status).color}20`,
                          color: getStatusBadge(report.status).color,
                        }}
                      >
                        {getStatusBadge(report.status).label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Advances */}
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Cash Advances</CardTitle>
                <CardDescription>Advances requiring settlement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cashAdvances
                    .filter(ca => ca.outstandingAmount > 0)
                    .map(advance => (
                      <div
                        key={advance.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        style={{ borderColor: COLORS.warning }}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{advance.purpose}</div>
                          <div className="text-sm text-slate-500 mt-1">
                            {advance.requestCode} • Trip: {formatDate(advance.tripStart)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: COLORS.warning }}>
                            {formatCurrency(advance.outstandingAmount)}
                          </div>
                          <div className="text-sm text-slate-500">Outstanding</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Reports Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1">Expense Reports</h2>
                <p className="text-slate-600">Manage your expense claims</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  size="sm"
                  style={{ backgroundColor: COLORS.primary }}
                  onClick={() => setShowExpenseForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </div>

            {showExpenseForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create Expense Report</CardTitle>
                  <CardDescription>Submit expenses for reimbursement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Purpose</Label>
                      <Input placeholder="e.g., Client meetings in Manila" />
                    </div>
                    <div className="space-y-2">
                      <Label>Report Period</Label>
                      <div className="flex gap-2">
                        <Input type="date" />
                        <Input type="date" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cash Advance (if any)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select advance to settle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No advance</SelectItem>
                        {cashAdvances
                          .filter(ca => ca.status === 'disbursed' && ca.outstandingAmount > 0)
                          .map(ca => (
                            <SelectItem key={ca.id} value={ca.id}>
                              {ca.requestCode} - {formatCurrency(ca.outstandingAmount)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Expense Lines</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                    <div className="text-sm text-slate-500 text-center py-8">
                      No expenses added yet
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                      Cancel
                    </Button>
                    <Button variant="outline">Save as Draft</Button>
                    <Button style={{ backgroundColor: COLORS.primary }}>
                      Submit for Approval
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {expenseReports.map(report => (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{report.purpose}</h3>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${getStatusBadge(report.status).color}20`,
                                color: getStatusBadge(report.status).color,
                              }}
                            >
                              {getStatusBadge(report.status).label}
                            </Badge>
                            {report.policyViolations > 0 && (
                              <Badge variant="secondary" style={{ backgroundColor: `${COLORS.warning}20`, color: COLORS.warning }}>
                                {report.policyViolations} Policy Issue(s)
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            {report.reportCode} • {formatDate(report.periodStart)} - {formatDate(report.periodEnd)} • {report.lines.length} expense(s)
                          </div>
                          {report.approver && (
                            <div className="text-sm text-slate-500 mt-1">
                              Approver: {report.approver}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold">{formatCurrency(report.totalAmount)}</div>
                          {report.advanceAmount > 0 && (
                            <div className="text-sm text-slate-500 mt-1">
                              Advance: {formatCurrency(report.advanceAmount)}
                              <br />
                              Net: {formatCurrency(report.netReimbursable)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expense Lines Preview */}
                      <div className="border-t pt-3">
                        <div className="space-y-2">
                          {report.lines.slice(0, 3).map(line => (
                            <div key={line.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1">
                                <div style={{ color: COLORS.primary }}>
                                  {getCategoryIcon(line.category)}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">{line.category}</span>
                                  <span className="text-slate-500"> - {line.merchant}</span>
                                </div>
                                {line.receipt && (
                                  <Receipt className="h-3 w-3 text-slate-400" />
                                )}
                                {!line.policyCompliant && (
                                  <AlertTriangle className="h-3 w-3" style={{ color: COLORS.warning }} />
                                )}
                              </div>
                              <div className="font-medium">{formatCurrency(line.amount)}</div>
                            </div>
                          ))}
                          {report.lines.length > 3 && (
                            <div className="text-sm text-slate-500 text-center pt-2">
                              +{report.lines.length - 3} more expense(s)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comments */}
                      {report.comments && report.comments.length > 0 && (
                        <div className="border-t mt-3 pt-3">
                          <div className="text-sm text-slate-600">
                            <strong>Comments:</strong> {report.comments[0]}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cash Advances Tab */}
          <TabsContent value="advances" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1">Cash Advances</h2>
                <p className="text-slate-600">Request and track travel advances</p>
              </div>
              <Button
                size="sm"
                style={{ backgroundColor: COLORS.primary }}
                onClick={() => setShowAdvanceForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            {showAdvanceForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Request Cash Advance</CardTitle>
                  <CardDescription>For upcoming business travel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trip Purpose</Label>
                      <Input placeholder="e.g., Singapore trade show" />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount Needed</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Needed By</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Trip Start</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Trip End</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Justification</Label>
                    <Textarea placeholder="Explain why this advance is needed..." rows={3} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAdvanceForm(false)}>
                      Cancel
                    </Button>
                    <Button variant="outline">Save as Draft</Button>
                    <Button style={{ backgroundColor: COLORS.primary }}>
                      Submit Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cashAdvances.map(advance => (
                  <Card key={advance.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{advance.purpose}</h3>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${getStatusBadge(advance.status).color}20`,
                                color: getStatusBadge(advance.status).color,
                              }}
                            >
                              {getStatusBadge(advance.status).label}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div>{advance.requestCode}</div>
                            <div>
                              Trip: {formatDate(advance.tripStart)} - {formatDate(advance.tripEnd)}
                            </div>
                            {advance.approver && <div>Approver: {advance.approver}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold">
                            {formatCurrency(advance.approvedAmount)}
                          </div>
                          {advance.outstandingAmount > 0 && (
                            <div className="text-sm mt-2">
                              <div style={{ color: COLORS.warning }}>
                                Outstanding: {formatCurrency(advance.outstandingAmount)}
                              </div>
                            </div>
                          )}
                          {advance.settledAmount > 0 && (
                            <div className="text-sm text-slate-500 mt-1">
                              Settled: {formatCurrency(advance.settledAmount)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="border-t mt-4 pt-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" style={{ color: COLORS.success }} />
                            <div>
                              <div className="font-medium">Submitted</div>
                              <div className="text-slate-500">{formatDate(advance.submittedAt!)}</div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                          {advance.approvedAt && (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" style={{ color: COLORS.success }} />
                                <div>
                                  <div className="font-medium">Approved</div>
                                  <div className="text-slate-500">{formatDate(advance.approvedAt)}</div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </>
                          )}
                          {advance.disbursedAt && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" style={{ color: COLORS.success }} />
                              <div>
                                <div className="font-medium">Disbursed</div>
                                <div className="text-slate-500">{formatDate(advance.disbursedAt)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mileage Tab */}
          <TabsContent value="mileage" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1">Mileage Tracking</h2>
                <p className="text-slate-600">Track personal vehicle usage</p>
              </div>
              <Button size="sm" style={{ backgroundColor: COLORS.primary }}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Rate</CardTitle>
                <CardDescription>Company standard mileage rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">₱10.00 / km</div>
                <div className="text-sm text-slate-500 mt-1">Effective January 2024</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mileage Entries</CardTitle>
                <CardDescription>Recent vehicle usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mileageEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{entry.purpose}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {entry.from} → {entry.to}
                        </div>
                        <div className="text-sm text-slate-500">{formatDate(entry.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{entry.distance} km</div>
                        <div className="text-sm text-slate-500">
                          @ {formatCurrency(entry.rate)}/km
                        </div>
                        <div className="font-medium" style={{ color: COLORS.primary }}>
                          {formatCurrency(entry.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <AppFeatures
              appName="Travel & Expense"
              appColor={COLORS.primary}
              features={[
                {
                  name: "Expense Report Management",
                  description: "Create, submit, and track expense reports with multi-level approval",
                  status: "active",
                  category: "Core Functionality"
                },
                {
                  name: "Cash Advance Requests",
                  description: "Request travel advances and track settlements",
                  status: "active",
                  category: "Core Functionality"
                },
                {
                  name: "Receipt Capture",
                  description: "Mobile OCR receipt scanning and automatic data extraction",
                  status: "active",
                  category: "Mobile Features"
                },
                {
                  name: "Mileage Tracking",
                  description: "Track personal vehicle usage with GPS integration",
                  status: "active",
                  category: "Expense Management"
                },
                {
                  name: "Per Diem Calculation",
                  description: "Automated per diem based on location and duration",
                  status: "active",
                  category: "Expense Management"
                },
                {
                  name: "Policy Compliance",
                  description: "Real-time policy checking and violation flagging",
                  status: "active",
                  category: "Compliance"
                },
                {
                  name: "Multi-Currency Support",
                  description: "Handle expenses in multiple currencies with auto-conversion",
                  status: "active",
                  category: "Financial Management"
                },
                {
                  name: "Credit Card Integration",
                  description: "Import corporate card transactions automatically",
                  status: "beta",
                  category: "Integrations"
                },
                {
                  name: "Approval Workflows",
                  description: "Configurable multi-level approval chains",
                  status: "active",
                  category: "Workflow"
                },
                {
                  name: "Settlement Processing",
                  description: "Track advance settlements and reimbursements",
                  status: "active",
                  category: "Financial Management"
                },
                {
                  name: "Analytics Dashboard",
                  description: "Spend analytics and expense trends",
                  status: "active",
                  category: "Analytics"
                },
                {
                  name: "Travel Booking",
                  description: "Integrated travel booking for flights, hotels, and cars",
                  status: "planned",
                  category: "Travel Management"
                },
                {
                  name: "Delegate Access",
                  description: "Allow assistants to manage expenses on behalf of others",
                  status: "beta",
                  category: "User Management"
                },
                {
                  name: "SAP ERP Integration",
                  description: "Real-time sync with SAP Finance modules",
                  status: "planned",
                  category: "Integrations"
                },
                {
                  name: "Audit Trail",
                  description: "Complete audit history of all transactions",
                  status: "active",
                  category: "Compliance"
                }
              ]}
              quickActions={[
                {
                  label: "Submit Expense",
                  description: "Create new expense report",
                  icon: "📝"
                },
                {
                  label: "Request Advance",
                  description: "Get cash advance for trip",
                  icon: "💰"
                },
                {
                  label: "Scan Receipt",
                  description: "Mobile OCR capture",
                  icon: "📸"
                },
                {
                  label: "View Reports",
                  description: "Track submission status",
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
