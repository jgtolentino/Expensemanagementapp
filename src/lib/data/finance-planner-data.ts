// /lib/data/finance-planner-data.ts
// Finance Planner - Microsoft Planner-inspired finance workflows
// Maps Plan → Bucket → Task model to BIR Tax Filing, Month-end Closing, Employee Onboarding/Offboarding

import { DataSourceType } from './types';

export interface FinancePlannerChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
}

export interface FinancePlannerTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  start_date: string;
  labels: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_to: string[];
  checklist: FinancePlannerChecklistItem[];
  progress: number; // 0-100
  attachments?: number;
  comments?: number;
  meta: {
    source: DataSourceType;
    lastUpdated: string;
    filename: string;
  };
}

export interface FinancePlannerBucket {
  bucket_id: string;
  bucket_name: string;
  color: string; // For visual distinction
  tasks: FinancePlannerTask[];
}

export interface FinancePlannerPlan {
  plan_id: string;
  plan_title: string;
  plan_icon: string; // Icon name from lucide-react
  plan_color: string;
  description: string;
  is_pinned: boolean;
  category: 'Finance' | 'HR' | 'Compliance';
  buckets: FinancePlannerBucket[];
  created_at: string;
  owner: string;
}

export interface FinancePlannerTemplate {
  template_id: string;
  template_name: string;
  category: 'Finance' | 'HR' | 'Project Management' | 'Business';
  description: string;
  preview_image?: string;
  benefits: string[];
  default_buckets: string[];
}

const META_PROD: { source: DataSourceType; lastUpdated: string; filename: string } = {
  source: 'production',
  lastUpdated: new Date().toISOString().split('T')[0],
  filename: 'finance-planner-data.ts'
};

// ==========================================
// FINANCE PLANS
// ==========================================

export const FINANCE_PLANNER_PLANS: FinancePlannerPlan[] = [
  // Plan 1: BIR Tax Filing
  {
    plan_id: 'plan_bir_2026',
    plan_title: 'BIR Tax Filing 2026',
    plan_icon: 'FileText',
    plan_color: '#0EA5E9', // Blue
    description: 'Philippine Bureau of Internal Revenue tax compliance and filing workflow',
    is_pinned: true,
    category: 'Finance',
    created_at: '2026-01-01',
    owner: 'CKVC',
    buckets: [
      {
        bucket_id: 'bir_prep',
        bucket_name: 'Preparation',
        color: '#F59E0B', // Amber
        tasks: [
          {
            id: 'TAX-001',
            title: 'Gather Q4 Financial Statements',
            description: 'Collect all financial records for Q4 2025 tax preparation',
            due_date: '2026-01-28',
            start_date: '2026-01-15',
            labels: ['1601C', 'Withholding Tax'],
            priority: 'High',
            assigned_to: ['Accountant', 'Junior Accountant'],
            progress: 40,
            attachments: 3,
            comments: 2,
            meta: META_PROD,
            checklist: [
              { id: 'chk_tax001_1', content: 'Collect P&L statements from all departments', is_checked: true },
              { id: 'chk_tax001_2', content: 'Review and verify expense reports', is_checked: true },
              { id: 'chk_tax001_3', content: 'Gather vendor invoices and receipts', is_checked: false },
              { id: 'chk_tax001_4', content: 'Verify payroll records and withholding', is_checked: false },
              { id: 'chk_tax001_5', content: 'Confirm fixed asset registry updates', is_checked: false }
            ]
          },
          {
            id: 'TAX-002',
            title: 'Prepare 2550Q VAT Quarterly Return',
            description: 'Quarterly VAT declaration for Q4 2025',
            due_date: '2026-02-10',
            start_date: '2026-01-20',
            labels: ['2550Q', 'VAT'],
            priority: 'Critical',
            assigned_to: ['Tax Specialist'],
            progress: 20,
            attachments: 1,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_tax002_1', content: 'Calculate output VAT from sales', is_checked: true },
              { id: 'chk_tax002_2', content: 'Calculate input VAT from purchases', is_checked: false },
              { id: 'chk_tax002_3', content: 'Reconcile VAT accounts in GL', is_checked: false },
              { id: 'chk_tax002_4', content: 'Complete 2550Q form in eBIRForms', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'bir_review',
        bucket_name: 'Report Approval',
        color: '#8B5CF6', // Purple
        tasks: [
          {
            id: 'TAX-003',
            title: 'Review Draft Tax Returns',
            description: 'Manager and legal review of prepared tax documents',
            due_date: '2026-02-20',
            start_date: '2026-02-11',
            labels: ['Review', '1601C'],
            priority: 'High',
            assigned_to: ['Senior Accountant', 'Legal Counsel'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_tax003_1', content: 'Cross-check calculations against GL', is_checked: false },
              { id: 'chk_tax003_2', content: 'Verify all deductions are properly documented', is_checked: false },
              { id: 'chk_tax003_3', content: 'Manager sign-off on draft returns', is_checked: false },
              { id: 'chk_tax003_4', content: 'Legal review for compliance', is_checked: false },
              { id: 'chk_tax003_5', content: 'Finalize adjustments if needed', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'bir_payment',
        bucket_name: 'Payment Approval',
        color: '#10B981', // Green
        tasks: [
          {
            id: 'TAX-004',
            title: 'Approve Tax Payment',
            description: 'CFO approval for tax payment processing',
            due_date: '2026-03-10',
            start_date: '2026-03-01',
            labels: ['Payment', 'Finance'],
            priority: 'Critical',
            assigned_to: ['CFO', 'Controller'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_tax004_1', content: 'CFO review of total tax liability', is_checked: false },
              { id: 'chk_tax004_2', content: 'Verify sufficient cash/credit for payment', is_checked: false },
              { id: 'chk_tax004_3', content: 'Obtain CFO authorization signature', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'bir_filing',
        bucket_name: 'Filing & Payment',
        color: '#EF4444', // Red (deadline)
        tasks: [
          {
            id: 'TAX-005',
            title: 'File 1601C via eBIRForms',
            description: 'Electronic filing of monthly withholding tax return',
            due_date: '2026-03-15',
            start_date: '2026-03-11',
            labels: ['1601C', 'Compliance', 'Critical'],
            priority: 'Critical',
            assigned_to: ['Tax Specialist'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_tax005_1', content: 'Upload 1601C form to eBIRForms', is_checked: false },
              { id: 'chk_tax005_2', content: 'Submit electronically and receive confirmation', is_checked: false },
              { id: 'chk_tax005_3', content: 'Process payment via authorized bank', is_checked: false },
              { id: 'chk_tax005_4', content: 'Save receipts and filing confirmations', is_checked: false }
            ]
          }
        ]
      }
    ]
  },

  // Plan 2: Month-end Closing
  {
    plan_id: 'plan_close_jan26',
    plan_title: 'Month-end Closing - January 2026',
    plan_icon: 'Calendar',
    plan_color: '#D97706', // Orange
    description: 'Monthly financial close process with reconciliations and reporting',
    is_pinned: true,
    category: 'Finance',
    created_at: '2026-01-25',
    owner: 'Controller',
    buckets: [
      {
        bucket_id: 'close_preclose',
        bucket_name: 'Pre-Close',
        color: '#F59E0B',
        tasks: [
          {
            id: 'CLOSE-001',
            title: 'Bank Reconciliations',
            description: 'Reconcile all bank accounts as of month-end',
            due_date: '2026-02-02',
            start_date: '2026-02-01',
            labels: ['Reconciliation', 'Priority'],
            priority: 'High',
            assigned_to: ['Accountant'],
            progress: 60,
            attachments: 5,
            comments: 3,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close001_1', content: 'Download bank statements for all accounts', is_checked: true },
              { id: 'chk_close001_2', content: 'Match transactions in GL vs bank', is_checked: true },
              { id: 'chk_close001_3', content: 'Identify and investigate discrepancies', is_checked: true },
              { id: 'chk_close001_4', content: 'Record outstanding checks and deposits', is_checked: false },
              { id: 'chk_close001_5', content: 'Sign-off on final reconciliation', is_checked: false }
            ]
          },
          {
            id: 'CLOSE-002',
            title: 'Accounts Receivable Aging',
            description: 'Review AR aging and provision for doubtful accounts',
            due_date: '2026-02-03',
            start_date: '2026-02-01',
            labels: ['AR', 'Collections'],
            priority: 'Medium',
            assigned_to: ['Junior Accountant', 'Collections Manager'],
            progress: 30,
            attachments: 2,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close002_1', content: 'Generate AR aging report from system', is_checked: true },
              { id: 'chk_close002_2', content: 'Review overdue accounts (>90 days)', is_checked: true },
              { id: 'chk_close002_3', content: 'Calculate bad debt provision', is_checked: false },
              { id: 'chk_close002_4', content: 'Update allowance for doubtful accounts', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'close_adjustments',
        bucket_name: 'Adjustments',
        color: '#8B5CF6',
        tasks: [
          {
            id: 'CLOSE-003',
            title: 'Accruals & Deferrals',
            description: 'Record month-end accrual and deferral entries',
            due_date: '2026-02-04',
            start_date: '2026-02-03',
            labels: ['JE', 'Accruals'],
            priority: 'High',
            assigned_to: ['Senior Accountant'],
            progress: 10,
            attachments: 1,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close003_1', content: 'Accrue salaries and benefits for period', is_checked: true },
              { id: 'chk_close003_2', content: 'Defer prepaid expenses (rent, insurance)', is_checked: false },
              { id: 'chk_close003_3', content: 'Record depreciation for fixed assets', is_checked: false },
              { id: 'chk_close003_4', content: 'Review and post all journal entries', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'close_review',
        bucket_name: 'Review',
        color: '#10B981',
        tasks: [
          {
            id: 'CLOSE-004',
            title: 'Financial Statements Review',
            description: 'Manager review of draft financial statements',
            due_date: '2026-02-06',
            start_date: '2026-02-05',
            labels: ['Review', 'Financial Statements'],
            priority: 'High',
            assigned_to: ['Controller'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close004_1', content: 'Review P&L for anomalies and trends', is_checked: false },
              { id: 'chk_close004_2', content: 'Review balance sheet for accuracy', is_checked: false },
              { id: 'chk_close004_3', content: 'Compare actuals vs budget and prior month', is_checked: false },
              { id: 'chk_close004_4', content: 'Identify and resolve variances', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'close_signoff',
        bucket_name: 'Sign-off',
        color: '#06B6D4',
        tasks: [
          {
            id: 'CLOSE-005',
            title: 'CFO Final Approval',
            description: 'CFO sign-off on final financial statements',
            due_date: '2026-02-07',
            start_date: '2026-02-07',
            labels: ['Approval', 'Final'],
            priority: 'Critical',
            assigned_to: ['CFO'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close005_1', content: 'CFO review of final statements', is_checked: false },
              { id: 'chk_close005_2', content: 'Obtain CFO authorization', is_checked: false },
              { id: 'chk_close005_3', content: 'Lock period in accounting system', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'close_reporting',
        bucket_name: 'Reporting',
        color: '#EF4444',
        tasks: [
          {
            id: 'CLOSE-006',
            title: 'Distribute Financial Reports',
            description: 'Send finalized reports to stakeholders',
            due_date: '2026-02-10',
            start_date: '2026-02-08',
            labels: ['Reporting', 'Communication'],
            priority: 'Medium',
            assigned_to: ['Finance Team'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_close006_1', content: 'Prepare executive summary deck', is_checked: false },
              { id: 'chk_close006_2', content: 'Email reports to management team', is_checked: false },
              { id: 'chk_close006_3', content: 'Upload to shared drive / BI dashboard', is_checked: false },
              { id: 'chk_close006_4', content: 'Schedule monthly review meeting', is_checked: false }
            ]
          }
        ]
      }
    ]
  },

  // Plan 3: Employee Onboarding
  {
    plan_id: 'plan_onboard_001',
    plan_title: 'Employee Onboarding',
    plan_icon: 'UserPlus',
    plan_color: '#10B981', // Green
    description: 'Comprehensive employee onboarding process from offer acceptance to first day',
    is_pinned: true,
    category: 'HR',
    created_at: '2026-01-15',
    owner: 'HR Manager',
    buckets: [
      {
        bucket_id: 'onboard_postoffer',
        bucket_name: 'Post-Offer Acceptance',
        color: '#10B981',
        tasks: [
          {
            id: 'ONBOARD-001',
            title: 'Send Welcome Package',
            description: 'Send welcome email with onboarding instructions',
            due_date: '2026-01-20',
            start_date: '2026-01-18',
            labels: ['HR', 'Communication'],
            priority: 'High',
            assigned_to: ['HR Coordinator'],
            progress: 100,
            attachments: 2,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_onboard001_1', content: 'Prepare welcome letter from CEO', is_checked: true },
              { id: 'chk_onboard001_2', content: 'Include first day instructions', is_checked: true },
              { id: 'chk_onboard001_3', content: 'Send company handbook PDF', is_checked: true },
              { id: 'chk_onboard001_4', content: 'Request document requirements', is_checked: true }
            ]
          }
        ]
      },
      {
        bucket_id: 'onboard_tech',
        bucket_name: 'Technology',
        color: '#0EA5E9',
        tasks: [
          {
            id: 'ONBOARD-002',
            title: 'Setup IT Accounts',
            description: 'Create email, network access, and software licenses',
            due_date: '2026-01-25',
            start_date: '2026-01-22',
            labels: ['IT', 'Access'],
            priority: 'Critical',
            assigned_to: ['IT Support'],
            progress: 70,
            attachments: 1,
            comments: 2,
            meta: META_PROD,
            checklist: [
              { id: 'chk_onboard002_1', content: 'Create company email account', is_checked: true },
              { id: 'chk_onboard002_2', content: 'Setup network and VPN access', is_checked: true },
              { id: 'chk_onboard002_3', content: 'Provision software licenses (MS Office, etc.)', is_checked: true },
              { id: 'chk_onboard002_4', content: 'Configure laptop/workstation', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'onboard_paperwork',
        bucket_name: 'Paperwork',
        color: '#F59E0B',
        tasks: [
          {
            id: 'ONBOARD-003',
            title: 'Complete HR Documents',
            description: 'Process employment contract and government forms',
            due_date: '2026-01-27',
            start_date: '2026-01-23',
            labels: ['HR', 'Compliance'],
            priority: 'High',
            assigned_to: ['HR Specialist'],
            progress: 50,
            attachments: 5,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_onboard003_1', content: 'Sign employment contract', is_checked: true },
              { id: 'chk_onboard003_2', content: 'Complete BIR 2316 tax form', is_checked: true },
              { id: 'chk_onboard003_3', content: 'Process SSS/PhilHealth/Pag-IBIG registration', is_checked: false },
              { id: 'chk_onboard003_4', content: 'Setup payroll direct deposit', is_checked: false },
              { id: 'chk_onboard003_5', content: 'Add to company health insurance', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'onboard_orientation',
        bucket_name: 'Orientation',
        color: '#8B5CF6',
        tasks: [
          {
            id: 'ONBOARD-004',
            title: 'First Day Orientation',
            description: 'Welcome orientation and team introductions',
            due_date: '2026-02-01',
            start_date: '2026-02-01',
            labels: ['HR', 'Training'],
            priority: 'Critical',
            assigned_to: ['HR Manager', 'Department Manager'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_onboard004_1', content: 'Welcome meeting with HR', is_checked: false },
              { id: 'chk_onboard004_2', content: 'Office tour and facility walkthrough', is_checked: false },
              { id: 'chk_onboard004_3', content: 'Team introductions', is_checked: false },
              { id: 'chk_onboard004_4', content: 'Review role expectations and goals', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'onboard_feedback',
        bucket_name: 'Feedback',
        color: '#EC4899',
        tasks: [
          {
            id: 'ONBOARD-005',
            title: '30-Day Check-in',
            description: 'First month feedback session',
            due_date: '2026-03-01',
            start_date: '2026-02-28',
            labels: ['HR', 'Feedback'],
            priority: 'Medium',
            assigned_to: ['HR Manager'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_onboard005_1', content: 'Schedule 30-day review meeting', is_checked: false },
              { id: 'chk_onboard005_2', content: 'Gather feedback on onboarding experience', is_checked: false },
              { id: 'chk_onboard005_3', content: 'Address any concerns or questions', is_checked: false }
            ]
          }
        ]
      }
    ]
  },

  // Plan 4: Employee Offboarding
  {
    plan_id: 'plan_offboard_001',
    plan_title: 'Employee Offboarding',
    plan_icon: 'UserMinus',
    plan_color: '#EF4444', // Red
    description: 'Employee exit process with knowledge transfer and asset return',
    is_pinned: true,
    category: 'HR',
    created_at: '2026-01-10',
    owner: 'HR Manager',
    buckets: [
      {
        bucket_id: 'offboard_notice',
        bucket_name: 'Notice Period',
        color: '#F59E0B',
        tasks: [
          {
            id: 'OFFBOARD-001',
            title: 'Process Resignation',
            description: 'Accept resignation and begin exit process',
            due_date: '2026-01-12',
            start_date: '2026-01-10',
            labels: ['HR', 'Admin'],
            priority: 'High',
            assigned_to: ['HR Manager'],
            progress: 100,
            attachments: 1,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_offboard001_1', content: 'Accept resignation letter', is_checked: true },
              { id: 'chk_offboard001_2', content: 'Confirm last working day', is_checked: true },
              { id: 'chk_offboard001_3', content: 'Notify department manager', is_checked: true },
              { id: 'chk_offboard001_4', content: 'Initiate exit checklist', is_checked: true }
            ]
          }
        ]
      },
      {
        bucket_id: 'offboard_knowledge',
        bucket_name: 'Knowledge Transfer',
        color: '#8B5CF6',
        tasks: [
          {
            id: 'OFFBOARD-002',
            title: 'Document Handover',
            description: 'Transfer responsibilities and documentation',
            due_date: '2026-01-25',
            start_date: '2026-01-15',
            labels: ['Knowledge Transfer'],
            priority: 'High',
            assigned_to: ['Department Manager', 'Departing Employee'],
            progress: 40,
            attachments: 3,
            comments: 2,
            meta: META_PROD,
            checklist: [
              { id: 'chk_offboard002_1', content: 'Document current projects and status', is_checked: true },
              { id: 'chk_offboard002_2', content: 'Train replacement/team on responsibilities', is_checked: true },
              { id: 'chk_offboard002_3', content: 'Transfer passwords and access info', is_checked: false },
              { id: 'chk_offboard002_4', content: 'Complete knowledge transfer sessions', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'offboard_it',
        bucket_name: 'IT & Assets',
        color: '#0EA5E9',
        tasks: [
          {
            id: 'OFFBOARD-003',
            title: 'Return Company Property',
            description: 'Collect all company-owned equipment and assets',
            due_date: '2026-01-30',
            start_date: '2026-01-28',
            labels: ['IT', 'Assets'],
            priority: 'Critical',
            assigned_to: ['IT Support', 'Admin'],
            progress: 20,
            attachments: 0,
            comments: 1,
            meta: META_PROD,
            checklist: [
              { id: 'chk_offboard003_1', content: 'Return laptop/desktop computer', is_checked: true },
              { id: 'chk_offboard003_2', content: 'Return mobile phone and accessories', is_checked: false },
              { id: 'chk_offboard003_3', content: 'Return ID badge and access cards', is_checked: false },
              { id: 'chk_offboard003_4', content: 'Revoke all system access and accounts', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'offboard_final',
        bucket_name: 'Final Settlement',
        color: '#10B981',
        tasks: [
          {
            id: 'OFFBOARD-004',
            title: 'Process Final Pay',
            description: 'Calculate and process final salary and benefits',
            due_date: '2026-02-05',
            start_date: '2026-02-01',
            labels: ['Payroll', 'Finance'],
            priority: 'High',
            assigned_to: ['Payroll Specialist', 'HR Specialist'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_offboard004_1', content: 'Calculate final salary and unused leave', is_checked: false },
              { id: 'chk_offboard004_2', content: 'Process final payroll', is_checked: false },
              { id: 'chk_offboard004_3', content: 'Issue Certificate of Employment', is_checked: false },
              { id: 'chk_offboard004_4', content: 'Provide BIR 2316 (Annual Tax Form)', is_checked: false }
            ]
          }
        ]
      },
      {
        bucket_id: 'offboard_exit',
        bucket_name: 'Exit Interview',
        color: '#EC4899',
        tasks: [
          {
            id: 'OFFBOARD-005',
            title: 'Conduct Exit Interview',
            description: 'Final feedback session before departure',
            due_date: '2026-01-30',
            start_date: '2026-01-29',
            labels: ['HR', 'Feedback'],
            priority: 'Medium',
            assigned_to: ['HR Manager'],
            progress: 0,
            attachments: 0,
            comments: 0,
            meta: META_PROD,
            checklist: [
              { id: 'chk_offboard005_1', content: 'Schedule exit interview meeting', is_checked: false },
              { id: 'chk_offboard005_2', content: 'Gather feedback on work experience', is_checked: false },
              { id: 'chk_offboard005_3', content: 'Document learnings for process improvement', is_checked: false }
            ]
          }
        ]
      }
    ]
  }
];

// ==========================================
// FINANCE PLANNER TEMPLATES
// ==========================================

export const FINANCE_PLANNER_TEMPLATES: FinancePlannerTemplate[] = [
  {
    template_id: 'tpl_bir_filing',
    template_name: 'BIR Tax Filing Plan',
    category: 'Finance',
    description: 'Philippine tax compliance workflow with BIR forms (1601C, 2550Q, etc.)',
    benefits: [
      'Never miss a tax deadline',
      'Built-in 4/2/1 day lead time',
      'Automated checklists for each form',
      'Tracks preparation → approval → filing → payment'
    ],
    default_buckets: ['Preparation', 'Report Approval', 'Payment Approval', 'Filing & Payment']
  },
  {
    template_id: 'tpl_month_close',
    template_name: 'Month-end Closing Plan',
    category: 'Finance',
    description: 'Financial period-end close process with reconciliations and reporting',
    benefits: [
      'Standardized close process',
      'Bank & AR reconciliations',
      'Accruals and adjustments tracking',
      'Sign-off and distribution workflows'
    ],
    default_buckets: ['Pre-Close', 'Adjustments', 'Review', 'Sign-off', 'Reporting']
  },
  {
    template_id: 'tpl_vat_quarterly',
    template_name: 'VAT Quarterly Return',
    category: 'Finance',
    description: 'Quarterly VAT declaration (2550Q) with input/output VAT tracking',
    benefits: [
      'Q1, Q2, Q3, Q4 tracking',
      'Input VAT vs Output VAT calculation',
      'GL reconciliation built-in',
      'eBIRForms filing checklist'
    ],
    default_buckets: ['Preparation', 'Review', 'Filing']
  },
  {
    template_id: 'tpl_annual_tax',
    template_name: 'Annual Income Tax Return',
    category: 'Finance',
    description: 'Annual corporate tax filing (1702 form) with audit preparation',
    benefits: [
      'Year-end audit readiness',
      'Comprehensive documentation checklist',
      'Multi-stakeholder approval flow',
      'Post-filing document archiving'
    ],
    default_buckets: ['Preparation', 'Audit', 'Review', 'Filing', 'Archive']
  },
  {
    template_id: 'tpl_employee_onboard',
    template_name: 'Employee Onboarding',
    category: 'HR',
    description: 'New hire onboarding from offer acceptance to first 30 days',
    benefits: [
      'Smooth first-day experience',
      'IT setup automation',
      'Compliance documentation tracking',
      '30-day feedback loop'
    ],
    default_buckets: ['Post-Offer Acceptance', 'Technology', 'Paperwork', 'Orientation', 'Feedback']
  },
  {
    template_id: 'tpl_employee_offboard',
    template_name: 'Employee Offboarding',
    category: 'HR',
    description: 'Employee exit process with knowledge transfer and asset return',
    benefits: [
      'Knowledge preservation',
      'Asset recovery tracking',
      'Final pay automation',
      'Exit interview insights'
    ],
    default_buckets: ['Notice Period', 'Knowledge Transfer', 'IT & Assets', 'Final Settlement', 'Exit Interview']
  }
];

// ==========================================
// VIEW HELPERS
// ==========================================

export const getPinnedPlans = (): FinancePlannerPlan[] => {
  return FINANCE_PLANNER_PLANS.filter(plan => plan.is_pinned);
};

export const getPlansByCategory = (category: 'Finance' | 'HR' | 'Compliance'): FinancePlannerPlan[] => {
  return FINANCE_PLANNER_PLANS.filter(plan => plan.category === category);
};

export const getPlanById = (planId: string): FinancePlannerPlan | undefined => {
  return FINANCE_PLANNER_PLANS.find(plan => plan.plan_id === planId);
};

export const getTemplatesByCategory = (category: string): FinancePlannerTemplate[] => {
  return FINANCE_PLANNER_TEMPLATES.filter(tpl => tpl.category === category);
};

// ==========================================
// STATISTICS
// ==========================================

export const getFinancePlannerStats = () => {
  const totalTasks = FINANCE_PLANNER_PLANS.reduce((sum, plan) => 
    sum + plan.buckets.reduce((bSum, bucket) => bSum + bucket.tasks.length, 0), 0
  );

  const completedTasks = FINANCE_PLANNER_PLANS.reduce((sum, plan) =>
    sum + plan.buckets.reduce((bSum, bucket) =>
      bSum + bucket.tasks.filter(t => t.progress === 100).length, 0
    ), 0
  );

  const overdueTasks = FINANCE_PLANNER_PLANS.reduce((sum, plan) =>
    sum + plan.buckets.reduce((bSum, bucket) =>
      bSum + bucket.tasks.filter(t => new Date(t.due_date) < new Date() && t.progress < 100).length, 0
    ), 0
  );

  const criticalTasks = FINANCE_PLANNER_PLANS.reduce((sum, plan) =>
    sum + plan.buckets.reduce((bSum, bucket) =>
      bSum + bucket.tasks.filter(t => t.priority === 'Critical' && t.progress < 100).length, 0
    ), 0
  );

  return {
    totalPlans: FINANCE_PLANNER_PLANS.length,
    pinnedPlans: getPinnedPlans().length,
    totalTasks,
    completedTasks,
    overdueTasks,
    criticalTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
};
