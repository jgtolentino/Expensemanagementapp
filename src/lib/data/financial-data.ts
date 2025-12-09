// lib/data/financial-data.ts
// Finance Clarity PPM Sample Data Module
// This provides type-safe sample data for all Finance PPM entities

export interface FinancialPlan {
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
  owner: string;
  notes: string;
  analyticAccount: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskName: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  hours: number;
  billable: boolean;
  effortType: 'Execution' | 'Analysis' | 'Review' | 'Reporting' | 'Approval' | 'Data Collection';
  notes: string;
  projectPhase: string;
  status: 'Draft' | 'Submitted' | 'Approved';
}

export interface Risk {
  id: string;
  taskPhase: string;
  taskName: string;
  riskType: 'Compliance' | 'Operational' | 'Financial' | 'Technical' | 'Resource' | 'Governance';
  riskCategory: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  exposure: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigationPlan: string;
  owner: string;
  consulted: string;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed';
  dateIdentified: string;
  dateClosed?: string;
  reviewDate: string;
}

export interface KPI {
  id: string;
  name: string;
  category: string;
  formula: string;
  target: string;
  actual: string;
  variance: string;
  variancePercent: string;
  trend: 'Improving' | 'Stable' | 'Declining' | 'On Track' | 'At Risk';
  dataSource: string;
  owner: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  reviewDate: string;
  status: 'Active' | 'At Risk' | 'Inactive';
  notes: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  strategicTheme: string;
  strategicObjective: string;
  owner: string;
  sponsor: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  projectCount: number;
  totalBudget: number;
  actualSpend: number;
  forecast: number;
  budgetVariancePercent: number;
  healthScore: number | null;
  ragStatus: 'Green' | 'Yellow' | 'Red';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  businessUnit: string;
  region: string;
}

export interface Agreement {
  id: string;
  type: 'Internal SLA' | 'External SLA' | 'External MSA' | 'External Contract' | 'Internal Policy' | 'Intercompany';
  party: string;
  description: string;
  scope: string;
  startDate: string;
  endDate: string;
  renewalTerms: string;
  value: string;
  currency: string;
  owner: string;
  status: 'Active' | 'Expired' | 'Under Review' | 'Pending Renewal';
  reviewFrequency: string;
  lastReviewDate: string;
  nextReviewDate: string;
  linkedTasks: string;
  notes: string;
}

export interface ReferenceLink {
  id: string;
  taskPhase: string;
  taskName: string;
  type: 'Policy' | 'Template' | 'Reference' | 'Training' | 'Tool';
  category: string;
  name: string;
  description: string;
  url: string;
  owner: string;
  accessLevel: 'All' | 'Team' | 'Manager' | 'Executive';
  lastUpdated: string;
  status: 'Active' | 'Archived' | 'Under Review';
}

export interface Baseline {
  id: string;
  name: string;
  type: 'Schedule' | 'Budget' | 'Risk' | 'Scope';
  version: string;
  dateCreated: string;
  period: string;
  scope: string;
  owner: string;
  status: 'Draft' | 'Approved' | 'Superseded';
  approvedBy: string;
  description: string;
  changeLog: string;
  restoreInstructions: string;
}

// Sample Data

export const sampleFinancialPlans: FinancialPlan[] = [
  {
    id: 'FP-2025-01-001',
    projectWbs: '1.0',
    phaseName: 'I. Initial & Compliance',
    budgetType: 'OPEX',
    category: 'Payroll & Personnel',
    plannedAmount: 35000,
    actualSpend: 33240,
    forecast: 34500,
    variance: -500,
    variancePercent: -1.43,
    period: 'Jan 2025',
    status: 'Active',
    owner: 'RIM',
    notes: 'Payroll processing completed on time',
    analyticAccount: 'ACC-001',
  },
  {
    id: 'FP-2025-01-002',
    projectWbs: '1.0',
    phaseName: 'I. Initial & Compliance',
    budgetType: 'OPEX',
    category: 'Tax & Provisions',
    plannedAmount: 15000,
    actualSpend: 14850,
    forecast: 14900,
    variance: -100,
    variancePercent: -0.67,
    period: 'Jan 2025',
    status: 'Active',
    owner: 'RIM',
    notes: 'Tax provision calculated',
    analyticAccount: 'ACC-001',
  },
  // Add more as needed
];

export const sampleTimeEntries: TimeEntry[] = [
  {
    id: 'TE-2025-001',
    taskId: 'CT-0001',
    taskName: 'Process Payroll Final Pay SL Conversions',
    employeeCode: 'RIM',
    employeeName: 'Rey Meran',
    date: '2025-01-15',
    hours: 8.0,
    billable: false,
    effortType: 'Execution',
    notes: 'Processed payroll data and verified final pay calculations',
    projectPhase: '1.0',
    status: 'Approved',
  },
  {
    id: 'TE-2025-002',
    taskId: 'CT-0001',
    taskName: 'Process Payroll Final Pay SL Conversions',
    employeeCode: 'RIM',
    employeeName: 'Rey Meran',
    date: '2025-01-16',
    hours: 6.0,
    billable: false,
    effortType: 'Execution',
    notes: 'Completed SL conversions and posted journal entries',
    projectPhase: '1.0',
    status: 'Approved',
  },
  // Add more as needed
];

export const sampleRisks: Risk[] = [
  {
    id: 'RSK-001',
    taskPhase: 'CT-0004',
    taskName: 'Record monthly VAT Report entries',
    riskType: 'Compliance',
    riskCategory: 'Regulatory',
    description: 'VAT filing deadline may be missed due to data compilation delays',
    probability: 'High',
    impact: 'High',
    exposure: 'Critical',
    mitigationPlan: 'Add 1-day buffer; prioritize VAT data collection on WD1',
    owner: 'JAP',
    consulted: 'JPAL',
    status: 'Open',
    dateIdentified: '2025-01-10',
    reviewDate: '2025-01-25',
  },
  // Add more as needed
];

export const sampleKPIs: KPI[] = [
  {
    id: 'KPI-001',
    name: 'On-Time Period Close Rate',
    category: 'Cycle Time',
    formula: '(Periods closed on WD7 / Total periods) × 100',
    target: '100%',
    actual: '92%',
    variance: '-8%',
    variancePercent: '-8.0%',
    trend: 'Improving',
    dataSource: 'Full Task Schedule',
    owner: 'CKVC',
    frequency: 'Monthly',
    reviewDate: '2025-01-25',
    status: 'Active',
    notes: '3 of last 12 periods delayed by 1 day',
  },
  // Add more as needed
];

export const samplePortfolios: Portfolio[] = [
  {
    id: 'PF-001',
    name: 'Finance Operations Excellence 2025',
    description: 'Comprehensive finance process transformation and monthly close optimization',
    strategicTheme: 'Process Excellence',
    strategicObjective: 'Achieve 7-day month-end close with 100% on-time delivery',
    owner: 'CKVC',
    sponsor: 'CEO - TBWA SMP',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'Active',
    projectCount: 1,
    totalBudget: 2500000,
    actualSpend: 312350,
    forecast: 2480000,
    budgetVariancePercent: -0.8,
    healthScore: 85,
    ragStatus: 'Green',
    priority: 'Critical',
    businessUnit: 'Finance',
    region: 'Philippines',
  },
  // Add more as needed
];

// Utility functions

export function calculateVariance(actual: number, planned: number): number {
  return actual - planned;
}

export function calculateVariancePercent(actual: number, planned: number): number {
  if (planned === 0) return 0;
  return ((actual - planned) / planned) * 100;
}

export function getRAGStatus(variance: number, thresholds: { red: number; yellow: number }): 'Green' | 'Yellow' | 'Red' {
  const absVariance = Math.abs(variance);
  if (absVariance >= thresholds.red) return 'Red';
  if (absVariance >= thresholds.yellow) return 'Yellow';
  return 'Green';
}

export function getTrendFromData(dataPoints: number[]): 'Improving' | 'Stable' | 'Declining' {
  if (dataPoints.length < 2) return 'Stable';
  
  const recent = dataPoints.slice(-3);
  const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const previous = dataPoints.slice(-6, -3);
  const prevAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
  
  const change = ((avg - prevAvg) / prevAvg) * 100;
  
  if (change > 5) return 'Improving';
  if (change < -5) return 'Declining';
  return 'Stable';
}
