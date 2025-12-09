// /lib/data/planner-projects.ts

import { DataSourceType } from './types';

export interface PlannerChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
}

export interface PlannerTask {
  id: string;
  title: string;
  due_date: string;
  start_date: string;
  labels: string[];
  assigned_to: string[];
  checklist: PlannerChecklistItem[];
  meta: {
    source: DataSourceType;
    lastUpdated: string;
    filename: string;
  };
}

export interface PlannerBucket {
  bucket_name: string;
  tasks: PlannerTask[];
}

export interface PlannerProject {
  plan_id: string;
  plan_title: string;
  buckets: PlannerBucket[];
}

const META_PROD: { source: DataSourceType; lastUpdated: string; filename: string } = {
  source: 'production',
  lastUpdated: new Date().toISOString().split('T')[0],
  filename: 'ppm-oca.xlsx'
};

export const PLANNER_RAW_DATA: PlannerProject[] = [
  {
    plan_id: "tax_filing_2026",
    plan_title: "Tax Filing Project 2026",
    buckets: [
      {
        bucket_name: "Preparation",
        tasks: [
          {
            id: "TAX-001",
            title: "Gather Documents",
            due_date: "2026-02-28",
            start_date: "2026-01-15",
            labels: ["Finance", "Critical"],
            assigned_to: ["Accountant"],
            meta: META_PROD,
            checklist: [
               { id: "chk_t1_1", content: "Collect P&L statements", is_checked: false },
               { id: "chk_t1_2", content: "Review expense reports", is_checked: false },
               { id: "chk_t1_3", content: "Gather vendor invoices", is_checked: false },
               { id: "chk_t1_4", content: "Verify payroll records", is_checked: false },
               { id: "chk_t1_5", content: "Confirm fixed asset registry", is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_name: "Review",
        tasks: [
           {
            id: "TAX-002",
            title: "Review Draft",
            due_date: "2026-03-20",
            start_date: "2026-03-10",
            labels: ["Finance", "Review"],
            assigned_to: ["Senior Accountant"],
            meta: META_PROD,
            checklist: [
               { id: "chk_t2_1", content: "Check vs General Ledger", is_checked: false },
               { id: "chk_t2_2", content: "Approve deductions", is_checked: false },
               { id: "chk_t2_3", content: "Manager sign-off", is_checked: false },
               { id: "chk_t2_4", content: "Legal review", is_checked: false },
               { id: "chk_t2_5", content: "Finalize adjustments", is_checked: false }
            ]
           }
        ]
      },
      {
        bucket_name: "Filing",
        tasks: [
           {
            id: "TAX-003",
            title: "File Taxes",
            due_date: "2026-04-15",
            start_date: "2026-04-01",
            labels: ["Compliance", "Critical"],
            assigned_to: ["Tax Specialist"],
            meta: META_PROD,
            checklist: [
               { id: "chk_t3_1", content: "Submit federal return", is_checked: false },
               { id: "chk_t3_2", content: "Submit state return", is_checked: false },
               { id: "chk_t3_3", content: "Pay tax liability", is_checked: false },
               { id: "chk_t3_4", content: "Archive confirmation receipt", is_checked: false },
               { id: "chk_t3_5", content: "Notify stakeholders", is_checked: false }
            ]
           }
        ]
      }
    ]
  },
  {
    plan_id: "month_close_dec",
    plan_title: "Month-End Closing Tasks",
    buckets: [
      {
        bucket_name: "Preparation",
        tasks: [
          {
            id: "CLOSE-001",
            title: "Prepare Checklist",
            due_date: "2025-12-28",
            start_date: "2025-12-26",
            labels: ["Accounting"],
            assigned_to: ["Controller"],
            meta: META_PROD,
            checklist: [
               { id: "chk_c1_1", content: "Update closing schedule", is_checked: true },
               { id: "chk_c1_2", content: "Notify department heads", is_checked: false },
               { id: "chk_c1_3", content: "Clear suspense accounts", is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_name: "Execution",
        tasks: [
          {
            id: "CLOSE-002",
            title: "Execute Close",
            due_date: "2026-01-03",
            start_date: "2026-01-01",
            labels: ["Accounting", "High Priority"],
            assigned_to: ["Finance Team"],
            meta: META_PROD,
            checklist: [
               { id: "chk_c2_1", content: "Reconcile bank accounts", is_checked: false },
               { id: "chk_c2_2", content: "Post accruals", is_checked: false },
               { id: "chk_c2_3", content: "Run depreciation", is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_name: "Review & Approval",
        tasks: [
          {
            id: "CLOSE-003",
            title: "Final Review",
            due_date: "2026-01-05",
            start_date: "2026-01-04",
            labels: ["Management"],
            assigned_to: ["CFO"],
            meta: META_PROD,
            checklist: [
               { id: "chk_c3_1", content: "Review Variance Analysis", is_checked: false },
               { id: "chk_c3_2", content: "Sign off on financial statements", is_checked: false },
               { id: "chk_c3_3", content: "Distribute board pack", is_checked: false }
            ]
          }
        ]
      }
    ]
  }
];

// Legacy exports for backwards compatibility
export const taxFilingProject = PLANNER_RAW_DATA[0];
export const closingTaskProject = PLANNER_RAW_DATA[1];
export const allPlannerProjects = PLANNER_RAW_DATA;

// Export tasks arrays for tasks-enhanced.ts compatibility
export const taxFilingTasks = PLANNER_RAW_DATA[0].buckets.flatMap(bucket => 
  bucket.tasks.map(task => ({
    ...task,
    bucket: bucket.bucket_name
  }))
);

export const closingTasks = PLANNER_RAW_DATA[1].buckets.flatMap(bucket => 
  bucket.tasks.map(task => ({
    ...task,
    bucket: bucket.bucket_name
  }))
);

// Metadata export
export const PLANNER_DATA_META = {
  source: 'production' as DataSourceType,
  filename: META_PROD.filename,
  lastUpdated: META_PROD.lastUpdated,
  importedBy: 'System'
};