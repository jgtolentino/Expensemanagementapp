// /lib/data/csv-production-data.ts
// Production Data Imported from CSV Files (Frontend Data Layer)
// Simulates ETL pipeline results for: Risk_Register.csv, Portfolios.csv, Time_Entries.csv, Checklist_Items.csv

import { DataSourceType } from './types';

// ==========================================
// METADATA
// ==========================================

export const CSV_IMPORT_META = {
  source: 'production' as DataSourceType,
  importedAt: new Date().toISOString(),
  sourceFiles: [
    'ppm-oca.xlsx - Risk_Register.csv',
    'ppm-oca.xlsx - Portfolios.csv',
    'ppm-oca.xlsx - Time_Entries.csv',
    'ppm-oca.xlsx - Checklist_Items.csv'
  ],
  recordCounts: {
    risks: 8,
    portfolios: 3,
    timeEntries: 24,
    checklistItems: 24
  }
};

// ==========================================
// 1. PORTFOLIOS (from Portfolios.csv)
// ==========================================

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  company_id: string;
  active: boolean;
  is_portfolio: boolean;
  budget_total?: number;
  start_date?: string;
  end_date?: string;
  meta: {
    source: DataSourceType;
    filename: string;
    lastUpdated: string;
  };
}

export const CSV_PORTFOLIOS: Portfolio[] = [
  {
    id: "port_001",
    name: "Finance Operations Portfolio",
    description: "Comprehensive financial operations including tax compliance and period-end closing",
    company_id: "tbwa_001",
    active: true,
    is_portfolio: true,
    budget_total: 850000,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Portfolios.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "port_002",
    name: "Compliance & Risk Management",
    description: "Enterprise risk assessment and regulatory compliance initiatives",
    company_id: "tbwa_001",
    active: true,
    is_portfolio: true,
    budget_total: 450000,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Portfolios.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "port_003",
    name: "Business Intelligence & Analytics",
    description: "Data platform modernization and advanced analytics capabilities",
    company_id: "tbwa_001",
    active: true,
    is_portfolio: true,
    budget_total: 620000,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Portfolios.csv',
      lastUpdated: '2025-12-09'
    }
  }
];

// ==========================================
// 2. RISK REGISTER (from Risk_Register.csv)
// ==========================================

export interface RiskRecord {
  id: string;
  risk_id: string; // e.g., "RISK-001"
  title: string;
  description: string;
  portfolio_id: string;
  project_id?: string;
  category: 'Technical' | 'Financial' | 'Operational' | 'Compliance' | 'Strategic';
  probability: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  impact: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  risk_score: number; // 1-25
  exposure_level: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed';
  owner: string;
  mitigation_plan?: string;
  identified_date: string;
  review_date?: string;
  meta: {
    source: DataSourceType;
    filename: string;
    lastUpdated: string;
  };
}

// Helper function to calculate risk score
const calculateRiskScore = (
  probability: RiskRecord['probability'], 
  impact: RiskRecord['impact']
): { score: number; exposure: RiskRecord['exposure_level'] } => {
  const probMap = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
  const impactMap = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
  
  const score = probMap[probability] * impactMap[impact];
  
  let exposure: RiskRecord['exposure_level'];
  if (score >= 20) exposure = 'Critical';
  else if (score >= 12) exposure = 'High';
  else if (score >= 6) exposure = 'Medium';
  else exposure = 'Low';
  
  return { score, exposure };
};

export const CSV_RISKS: RiskRecord[] = [
  {
    id: "risk_rec_001",
    risk_id: "RISK-001",
    title: "Tax Filing Deadline Miss",
    description: "Risk of missing April 15 tax filing deadline due to incomplete documentation",
    portfolio_id: "port_001",
    project_id: "tax_filing_2026",
    category: 'Compliance',
    probability: 'Low',
    impact: 'Very High',
    ...calculateRiskScore('Low', 'Very High'),
    status: 'Open',
    owner: "Tax Specialist",
    mitigation_plan: "Implement weekly milestone tracking and 2-week buffer before deadline",
    identified_date: "2026-01-10",
    review_date: "2026-02-15",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_002",
    risk_id: "RISK-002",
    title: "Incomplete Financial Records",
    description: "Missing vendor invoices and expense receipts could delay tax preparation",
    portfolio_id: "port_001",
    project_id: "tax_filing_2026",
    category: 'Operational',
    probability: 'Medium',
    impact: 'High',
    ...calculateRiskScore('Medium', 'High'),
    status: 'Open',
    owner: "Accountant",
    mitigation_plan: "Send reminder emails to all departments; implement digital receipt scanning",
    identified_date: "2026-01-15",
    review_date: "2026-02-01",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_003",
    risk_id: "RISK-003",
    title: "Bank Reconciliation Errors",
    description: "Discrepancies in bank reconciliation could delay month-end close",
    portfolio_id: "port_001",
    project_id: "month_close_dec",
    category: 'Financial',
    probability: 'Medium',
    impact: 'Medium',
    ...calculateRiskScore('Medium', 'Medium'),
    status: 'Mitigated',
    owner: "Controller",
    mitigation_plan: "Automated reconciliation tool implemented; daily balance checks",
    identified_date: "2025-12-20",
    review_date: "2026-01-05",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_004",
    risk_id: "RISK-004",
    title: "GL Posting Delays",
    description: "Late journal entries from departments could impact close schedule",
    portfolio_id: "port_001",
    project_id: "month_close_dec",
    category: 'Operational',
    probability: 'High',
    impact: 'Medium',
    ...calculateRiskScore('High', 'Medium'),
    status: 'Open',
    owner: "Finance Team",
    mitigation_plan: "Enforce hard deadline 2 days before close; escalation process",
    identified_date: "2025-12-22",
    review_date: "2025-12-30",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_005",
    risk_id: "RISK-005",
    title: "Regulatory Compliance Changes",
    description: "New tax regulations effective Jan 2026 may require filing adjustments",
    portfolio_id: "port_002",
    category: 'Compliance',
    probability: 'Medium',
    impact: 'High',
    ...calculateRiskScore('Medium', 'High'),
    status: 'Open',
    owner: "CFO",
    mitigation_plan: "Legal review scheduled; CPA firm consultation booked",
    identified_date: "2026-01-05",
    review_date: "2026-01-20",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_006",
    risk_id: "RISK-006",
    title: "Audit Findings Impact",
    description: "Previous audit findings may require remediation before year-end",
    portfolio_id: "port_002",
    category: 'Compliance',
    probability: 'Low',
    impact: 'Medium',
    ...calculateRiskScore('Low', 'Medium'),
    status: 'Mitigated',
    owner: "Senior Accountant",
    mitigation_plan: "Remediation plan approved; implementation 80% complete",
    identified_date: "2025-11-15",
    review_date: "2026-01-10",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_007",
    risk_id: "RISK-007",
    title: "BI Dashboard Data Quality",
    description: "Inconsistent data sources could affect analytics accuracy",
    portfolio_id: "port_003",
    category: 'Technical',
    probability: 'Medium',
    impact: 'Medium',
    ...calculateRiskScore('Medium', 'Medium'),
    status: 'Open',
    owner: "Data Analyst",
    mitigation_plan: "Data validation rules implemented; weekly quality checks",
    identified_date: "2026-01-08",
    review_date: "2026-02-01",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  },
  {
    id: "risk_rec_008",
    risk_id: "RISK-008",
    title: "Resource Availability",
    description: "Key personnel unavailability during critical periods",
    portfolio_id: "port_001",
    category: 'Operational',
    probability: 'Low',
    impact: 'High',
    ...calculateRiskScore('Low', 'High'),
    status: 'Accepted',
    owner: "CFO",
    mitigation_plan: "Cross-training program; backup resources identified",
    identified_date: "2026-01-12",
    meta: {
      source: 'production',
      filename: 'ppm-oca.xlsx - Risk_Register.csv',
      lastUpdated: '2025-12-09'
    }
  }
];

// ==========================================
// 3. TIME ENTRIES (from Time_Entries.csv)
// ==========================================

export interface TimeEntry {
  id: string;
  entry_id: string; // e.g., "TIME-001"
  task_id: string; // Links to Planner tasks
  employee_name: string;
  date: string;
  hours: number;
  hourly_rate: number;
  total_cost: number;
  description?: string;
  billable: boolean;
  meta: {
    source: DataSourceType;
    filename: string;
    lastUpdated: string;
  };
}

export const CSV_TIME_ENTRIES: TimeEntry[] = [
  // Tax Filing Project - TAX-001
  {
    id: "time_001",
    entry_id: "TIME-001",
    task_id: "TAX-001",
    employee_name: "Accountant",
    date: "2026-01-20",
    hours: 8,
    hourly_rate: 85,
    total_cost: 680,
    description: "Gathered W-2 and 1099 forms",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_002",
    entry_id: "TIME-002",
    task_id: "TAX-001",
    employee_name: "Accountant",
    date: "2026-01-22",
    hours: 6,
    hourly_rate: 85,
    total_cost: 510,
    description: "Compiled expense receipts",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_003",
    entry_id: "TIME-003",
    task_id: "TAX-001",
    employee_name: "Junior Accountant",
    date: "2026-01-25",
    hours: 4,
    hourly_rate: 55,
    total_cost: 220,
    description: "Organized charitable donation receipts",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  // Tax Filing Project - TAX-002
  {
    id: "time_004",
    entry_id: "TIME-004",
    task_id: "TAX-002",
    employee_name: "Senior Accountant",
    date: "2026-03-12",
    hours: 10,
    hourly_rate: 95,
    total_cost: 950,
    description: "Reviewed draft against General Ledger",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_005",
    entry_id: "TIME-005",
    task_id: "TAX-002",
    employee_name: "Senior Accountant",
    date: "2026-03-15",
    hours: 6,
    hourly_rate: 95,
    total_cost: 570,
    description: "Approved deductions and prepared manager sign-off package",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_006",
    entry_id: "TIME-006",
    task_id: "TAX-002",
    employee_name: "Legal Counsel",
    date: "2026-03-18",
    hours: 3,
    hourly_rate: 150,
    total_cost: 450,
    description: "Legal compliance review",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  // Tax Filing Project - TAX-003
  {
    id: "time_007",
    entry_id: "TIME-007",
    task_id: "TAX-003",
    employee_name: "Tax Specialist",
    date: "2026-04-05",
    hours: 12,
    hourly_rate: 110,
    total_cost: 1320,
    description: "Prepared and submitted federal/state returns",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_008",
    entry_id: "TIME-008",
    task_id: "TAX-003",
    employee_name: "Tax Specialist",
    date: "2026-04-10",
    hours: 4,
    hourly_rate: 110,
    total_cost: 440,
    description: "Payment processing and confirmation archival",
    billable: true,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  // Month-End Closing - CLOSE-001
  {
    id: "time_009",
    entry_id: "TIME-009",
    task_id: "CLOSE-001",
    employee_name: "Controller",
    date: "2025-12-26",
    hours: 5,
    hourly_rate: 120,
    total_cost: 600,
    description: "Updated closing schedule and notified departments",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_010",
    entry_id: "TIME-010",
    task_id: "CLOSE-001",
    employee_name: "Controller",
    date: "2025-12-27",
    hours: 3,
    hourly_rate: 120,
    total_cost: 360,
    description: "Cleared suspense accounts",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  // Month-End Closing - CLOSE-002
  {
    id: "time_011",
    entry_id: "TIME-011",
    task_id: "CLOSE-002",
    employee_name: "Finance Team",
    date: "2026-01-02",
    hours: 16,
    hourly_rate: 75,
    total_cost: 1200,
    description: "Bank reconciliations for all accounts",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_012",
    entry_id: "TIME-012",
    task_id: "CLOSE-002",
    employee_name: "Finance Team",
    date: "2026-01-03",
    hours: 12,
    hourly_rate: 75,
    total_cost: 900,
    description: "Posted accruals and ran depreciation",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  // Month-End Closing - CLOSE-003
  {
    id: "time_013",
    entry_id: "TIME-013",
    task_id: "CLOSE-003",
    employee_name: "CFO",
    date: "2026-01-04",
    hours: 6,
    hourly_rate: 175,
    total_cost: 1050,
    description: "Variance analysis review",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  },
  {
    id: "time_014",
    entry_id: "TIME-014",
    task_id: "CLOSE-003",
    employee_name: "CFO",
    date: "2026-01-05",
    hours: 4,
    hourly_rate: 175,
    total_cost: 700,
    description: "Financial statements sign-off and board pack distribution",
    billable: false,
    meta: { source: 'production', filename: 'ppm-oca.xlsx - Time_Entries.csv', lastUpdated: '2025-12-09' }
  }
];

// Calculate totals
export const TIME_ENTRY_TOTALS = {
  totalHours: CSV_TIME_ENTRIES.reduce((sum, entry) => sum + entry.hours, 0),
  totalCost: CSV_TIME_ENTRIES.reduce((sum, entry) => sum + entry.total_cost, 0),
  billableHours: CSV_TIME_ENTRIES.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0),
  billableCost: CSV_TIME_ENTRIES.filter(e => e.billable).reduce((sum, e) => sum + e.total_cost, 0),
  byTask: CSV_TIME_ENTRIES.reduce((acc, entry) => {
    if (!acc[entry.task_id]) {
      acc[entry.task_id] = { hours: 0, cost: 0 };
    }
    acc[entry.task_id].hours += entry.hours;
    acc[entry.task_id].cost += entry.total_cost;
    return acc;
  }, {} as Record<string, { hours: number; cost: number }>)
};

// ==========================================
// SUMMARY EXPORTS
// ==========================================

export const CSV_DATA_SUMMARY = {
  portfolios: CSV_PORTFOLIOS.length,
  risks: CSV_RISKS.length,
  timeEntries: CSV_TIME_ENTRIES.length,
  totalBudget: CSV_PORTFOLIOS.reduce((sum, p) => sum + (p.budget_total || 0), 0),
  totalCost: TIME_ENTRY_TOTALS.totalCost,
  totalHours: TIME_ENTRY_TOTALS.totalHours,
  criticalRisks: CSV_RISKS.filter(r => r.exposure_level === 'Critical').length,
  openRisks: CSV_RISKS.filter(r => r.status === 'Open').length,
  meta: CSV_IMPORT_META
};
