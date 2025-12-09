// lib/data/tasks-enhanced.ts
// Finance Clarity PPM - Enhanced Task Structure with Full Hierarchy

import { taxFilingTasks, closingTasks } from './planner-projects';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface Subtask {
  id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
  dueDate?: string;
  progress: number;
  checklist: ChecklistItem[];
  estimatedHours?: number;
  actualHours?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Comment {
  id: string;
  author: string; // team member code
  text: string;
  mentions: string[]; // team member codes
  createdAt: string;
  edited?: boolean;
  editedAt?: string;
}

export interface TaskEnhanced {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'phase' | 'milestone' | 'task';
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk' | 'blocked' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Dates
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Progress
  progress: number;
  duration: number;
  
  // Assignment
  owner: string; // Primary owner (team member code)
  assignee?: string; // Current assignee
  raci: {
    responsible: string[];
    accountable: string[];
    consulted: string[];
    informed: string[];
  };
  
  // Financials
  budgetHours?: number;
  actualHours?: number;
  remainingHours?: number;
  
  // Dependencies
  dependencies?: string[]; // Task IDs
  blockedBy?: string[];
  blocking?: string[];
  
  // Hierarchy
  parentId?: string;
  children?: TaskEnhanced[];
  subtasks?: Subtask[];
  
  // Collaboration
  comments: Comment[];
  attachments?: string[];
  tags?: string[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export const sampleTasksEnhanced: TaskEnhanced[] = [
  {
    id: 'PHASE-001',
    code: '1.0',
    name: 'I. Initial & Compliance',
    type: 'phase',
    status: 'in_progress',
    priority: 'high',
    startDate: '2025-01-02',
    endDate: '2025-01-10',
    progress: 78,
    duration: 8,
    owner: 'CKVC',
    raci: {
      responsible: ['CKVC', 'JAP'],
      accountable: ['CKVC'],
      consulted: ['RIM'],
      informed: ['LAS', 'BOM'],
    },
    comments: [],
    createdBy: 'CKVC',
    createdAt: '2024-12-15T08:00:00Z',
    children: [
      {
        id: 'TASK-001',
        code: 'CT-0001',
        name: 'Process Payroll & Statutory Withholdings',
        description: 'Calculate and process monthly payroll including SSS, PhilHealth, HDMF contributions',
        type: 'task',
        status: 'completed',
        priority: 'critical',
        startDate: '2025-01-02',
        endDate: '2025-01-03',
        actualStartDate: '2025-01-02',
        actualEndDate: '2025-01-03',
        progress: 100,
        duration: 1,
        owner: 'JPAL',
        assignee: 'JPAL',
        raci: {
          responsible: ['JPAL'],
          accountable: ['CKVC'],
          consulted: ['RIM'],
          informed: ['RMQB'],
        },
        budgetHours: 8,
        actualHours: 7.5,
        remainingHours: 0,
        dependencies: [],
        comments: [
          {
            id: 'COM-001',
            author: 'JPAL',
            text: 'Payroll processing completed. All statutory contributions verified by @RIM',
            mentions: ['RIM'],
            createdAt: '2025-01-03T16:30:00Z',
          },
        ],
        subtasks: [
          {
            id: 'SUB-001-01',
            name: 'Calculate gross pay and deductions',
            status: 'completed',
            assignee: 'JPAL',
            dueDate: '2025-01-02',
            progress: 100,
            checklist: [
              { id: 'CHK-001-01-01', text: 'Review timesheets', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T10:00:00Z' },
              { id: 'CHK-001-01-02', text: 'Calculate overtime', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T11:00:00Z' },
              { id: 'CHK-001-01-03', text: 'Apply deductions', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T12:00:00Z' },
            ],
            estimatedHours: 3,
            actualHours: 2.5,
          },
          {
            id: 'SUB-001-02',
            name: 'Compute SSS, PhilHealth, HDMF',
            status: 'completed',
            assignee: 'JPAL',
            dueDate: '2025-01-02',
            progress: 100,
            checklist: [
              { id: 'CHK-001-02-01', text: 'Calculate SSS contributions', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T13:00:00Z' },
              { id: 'CHK-001-02-02', text: 'Calculate PhilHealth', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T14:00:00Z' },
              { id: 'CHK-001-02-03', text: 'Calculate HDMF', completed: true, completedBy: 'JPAL', completedAt: '2025-01-02T15:00:00Z' },
              { id: 'CHK-001-02-04', text: 'Verify total contributions', completed: true, completedBy: 'RIM', completedAt: '2025-01-03T09:00:00Z' },
            ],
            estimatedHours: 2,
            actualHours: 2,
          },
          {
            id: 'SUB-001-03',
            name: 'Generate payroll register',
            status: 'completed',
            assignee: 'JPAL',
            dueDate: '2025-01-03',
            progress: 100,
            checklist: [
              { id: 'CHK-001-03-01', text: 'Export payroll data', completed: true, completedBy: 'JPAL', completedAt: '2025-01-03T10:00:00Z' },
              { id: 'CHK-001-03-02', text: 'Review with @CKVC', completed: true, assignee: 'CKVC', completedBy: 'CKVC', completedAt: '2025-01-03T14:00:00Z' },
              { id: 'CHK-001-03-03', text: 'Get final approval', completed: true, assignee: 'CKVC', completedBy: 'CKVC', completedAt: '2025-01-03T16:00:00Z' },
            ],
            estimatedHours: 3,
            actualHours: 3,
          },
        ],
        createdBy: 'CKVC',
        createdAt: '2024-12-15T08:00:00Z',
        lastModifiedBy: 'JPAL',
        lastModifiedAt: '2025-01-03T16:30:00Z',
      },
      {
        id: 'TASK-002',
        code: 'CT-0002',
        name: 'Calculate Tax Provision (Income Tax)',
        description: 'Compute monthly income tax provision based on revenue and expenses',
        type: 'task',
        status: 'in_progress',
        priority: 'high',
        startDate: '2025-01-03',
        endDate: '2025-01-05',
        actualStartDate: '2025-01-03',
        progress: 65,
        duration: 2,
        owner: 'JAP',
        assignee: 'JAP',
        raci: {
          responsible: ['JAP'],
          accountable: ['CKVC'],
          consulted: ['RIM', 'JMSM'],
          informed: ['RMQB'],
        },
        budgetHours: 6,
        actualHours: 4,
        remainingHours: 2,
        dependencies: ['TASK-001'],
        comments: [
          {
            id: 'COM-002',
            author: 'JAP',
            text: 'Working on Q4 tax computation. Need revenue breakdown from @JMSM by EOD.',
            mentions: ['JMSM'],
            createdAt: '2025-01-03T14:00:00Z',
          },
          {
            id: 'COM-003',
            author: 'JMSM',
            text: '@JAP Revenue breakdown sent via email. Let me know if you need clarification.',
            mentions: ['JAP'],
            createdAt: '2025-01-03T15:30:00Z',
          },
        ],
        subtasks: [
          {
            id: 'SUB-002-01',
            name: 'Gather revenue and expense data',
            status: 'completed',
            assignee: 'JMSM',
            dueDate: '2025-01-03',
            progress: 100,
            checklist: [
              { id: 'CHK-002-01-01', text: 'Extract revenue data', completed: true, completedBy: 'JMSM', completedAt: '2025-01-03T11:00:00Z' },
              { id: 'CHK-002-01-02', text: 'Extract expense data', completed: true, completedBy: 'JMSM', completedAt: '2025-01-03T13:00:00Z' },
              { id: 'CHK-002-01-03', text: 'Reconcile totals', completed: true, completedBy: 'JMSM', completedAt: '2025-01-03T15:00:00Z' },
            ],
            estimatedHours: 2,
            actualHours: 2,
          },
          {
            id: 'SUB-002-02',
            name: 'Calculate taxable income',
            status: 'in_progress',
            assignee: 'JAP',
            dueDate: '2025-01-04',
            progress: 70,
            checklist: [
              { id: 'CHK-002-02-01', text: 'Apply tax adjustments', completed: true, completedBy: 'JAP', completedAt: '2025-01-04T10:00:00Z' },
              { id: 'CHK-002-02-02', text: 'Compute taxable income', completed: true, completedBy: 'JAP', completedAt: '2025-01-04T12:00:00Z' },
              { id: 'CHK-002-02-03', text: 'Review with @RIM', completed: false, assignee: 'RIM' },
            ],
            estimatedHours: 3,
            actualHours: 2,
            priority: 'high',
          },
          {
            id: 'SUB-002-03',
            name: 'Prepare tax provision journal entry',
            status: 'not_started',
            assignee: 'JAP',
            dueDate: '2025-01-05',
            progress: 0,
            checklist: [
              { id: 'CHK-002-03-01', text: 'Draft JE', completed: false },
              { id: 'CHK-002-03-02', text: 'Get approval from @CKVC', completed: false, assignee: 'CKVC' },
              { id: 'CHK-002-03-03', text: 'Post to GL', completed: false },
            ],
            estimatedHours: 1,
            priority: 'high',
          },
        ],
        createdBy: 'CKVC',
        createdAt: '2024-12-15T08:00:00Z',
        lastModifiedBy: 'JAP',
        lastModifiedAt: '2025-01-04T12:30:00Z',
      },
      {
        id: 'TASK-003',
        code: 'CT-0003',
        name: 'Compile Input VAT & Reconcile Supplier Invoices',
        description: 'Gather all input VAT, validate supplier invoices, ensure completeness',
        type: 'task',
        status: 'in_progress',
        priority: 'critical',
        startDate: '2025-01-04',
        endDate: '2025-01-08',
        actualStartDate: '2025-01-04',
        progress: 45,
        duration: 4,
        owner: 'JLI',
        assignee: 'JLI',
        raci: {
          responsible: ['JLI'],
          accountable: ['JAP'],
          consulted: ['BOM'],
          informed: ['CKVC', 'RMQB'],
        },
        budgetHours: 12,
        actualHours: 5,
        remainingHours: 7,
        dependencies: [],
        comments: [
          {
            id: 'COM-004',
            author: 'JLI',
            text: 'Waiting for 3 supplier invoices. @BOM can you follow up with vendors?',
            mentions: ['BOM'],
            createdAt: '2025-01-05T10:00:00Z',
          },
          {
            id: 'COM-005',
            author: 'BOM',
            text: '@JLI Following up today. Should have them by tomorrow.',
            mentions: ['JLI'],
            createdAt: '2025-01-05T11:30:00Z',
          },
        ],
        subtasks: [
          {
            id: 'SUB-003-01',
            name: 'Collect all supplier invoices',
            status: 'in_progress',
            assignee: 'JLI',
            dueDate: '2025-01-06',
            progress: 80,
            checklist: [
              { id: 'CHK-003-01-01', text: 'Check email for invoices', completed: true, completedBy: 'JLI', completedAt: '2025-01-04T09:00:00Z' },
              { id: 'CHK-003-01-02', text: 'Download from supplier portals', completed: true, completedBy: 'JLI', completedAt: '2025-01-04T14:00:00Z' },
              { id: 'CHK-003-01-03', text: 'Follow up on missing invoices', completed: false, assignee: 'BOM' },
              { id: 'CHK-003-01-04', text: 'Organize by vendor', completed: true, completedBy: 'JLI', completedAt: '2025-01-05T16:00:00Z' },
            ],
            estimatedHours: 4,
            actualHours: 3,
            priority: 'high',
          },
          {
            id: 'SUB-003-02',
            name: 'Validate VAT details',
            status: 'not_started',
            assignee: 'JLI',
            dueDate: '2025-01-07',
            progress: 0,
            checklist: [
              { id: 'CHK-003-02-01', text: 'Check TIN validity', completed: false },
              { id: 'CHK-003-02-02', text: 'Verify VAT amounts', completed: false },
              { id: 'CHK-003-02-03', text: 'Match to purchase orders', completed: false },
            ],
            estimatedHours: 4,
            priority: 'high',
          },
          {
            id: 'SUB-003-03',
            name: 'Create VAT summary report',
            status: 'not_started',
            assignee: 'JAP',
            dueDate: '2025-01-08',
            progress: 0,
            checklist: [
              { id: 'CHK-003-03-01', text: 'Compile all input VAT', completed: false },
              { id: 'CHK-003-03-02', text: 'Generate summary by vendor', completed: false },
              { id: 'CHK-003-03-03', text: 'Review with @CKVC', completed: false, assignee: 'CKVC' },
            ],
            estimatedHours: 4,
            priority: 'critical',
          },
        ],
        tags: ['VAT', 'Tax', 'Critical'],
        createdBy: 'CKVC',
        createdAt: '2024-12-15T08:00:00Z',
        lastModifiedBy: 'JLI',
        lastModifiedAt: '2025-01-05T16:30:00Z',
      },
    ],
  },
];

export function getAllTasks(tasks: TaskEnhanced[]): TaskEnhanced[] {
  const allTasks: TaskEnhanced[] = [];
  
  function collect(task: TaskEnhanced) {
    allTasks.push(task);
    if (task.children) {
      task.children.forEach(child => collect(child));
    }
  }
  
  tasks.forEach(task => collect(task));
  return allTasks;
}

export function getTasksByStatus(
  tasks: TaskEnhanced[],
  status: TaskEnhanced['status']
): TaskEnhanced[] {
  return getAllTasks(tasks).filter(task => task.status === status);
}

export function getTasksByAssignee(
  tasks: TaskEnhanced[],
  assigneeCode: string
): TaskEnhanced[] {
  return getAllTasks(tasks).filter(
    task => task.assignee === assigneeCode || task.owner === assigneeCode
  );
}

export function getOverdueTasks(tasks: TaskEnhanced[]): TaskEnhanced[] {
  const today = new Date().toISOString().split('T')[0];
  return getAllTasks(tasks).filter(
    task => 
      task.status !== 'completed' && 
      task.endDate < today
  );
}

export function getDueSoonTasks(tasks: TaskEnhanced[], days: number = 3): TaskEnhanced[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  
  return getAllTasks(tasks).filter(
    task => 
      task.status !== 'completed' && 
      task.endDate >= todayStr &&
      task.endDate <= futureDateStr
  );
}

export function getTaskProgress(task: TaskEnhanced): number {
  if (task.subtasks && task.subtasks.length > 0) {
    const totalProgress = task.subtasks.reduce((sum, st) => sum + st.progress, 0);
    return Math.round(totalProgress / task.subtasks.length);
  }
  return task.progress;
}

export function getChecklistProgress(subtask: Subtask): number {
  if (subtask.checklist.length === 0) return 0;
  const completed = subtask.checklist.filter(item => item.completed).length;
  return Math.round((completed / subtask.checklist.length) * 100);
}

// Add Planner-style projects
// Tax Filing Project Phase
export const taxFilingPhase: TaskEnhanced = {
  id: 'PHASE-TAX',
  code: 'TAX',
  name: 'Tax Filing Project 2026',
  description: 'Complete tax preparation, review, and filing for FY 2026',
  type: 'phase',
  status: 'not_started',
  priority: 'critical',
  startDate: '2026-01-15',
  endDate: '2026-04-15',
  progress: 0,
  duration: 90,
  owner: 'Tax Specialist',
  raci: {
    responsible: ['Accountant', 'Senior Accountant', 'Tax Specialist'],
    accountable: ['Tax Specialist'],
    consulted: ['CKVC'],
    informed: ['CFO'],
  },
  comments: [],
  tags: ['Tax', '2026', 'Critical'],
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  children: taxFilingTasks as any[],
};

// Month-End Closing Project Phase
export const closingPhase: TaskEnhanced = {
  id: 'PHASE-CLOSE',
  code: 'CLOSE',
  name: 'Month-End Closing Tasks',
  description: 'Complete month-end financial close process',
  type: 'phase',
  status: 'not_started',
  priority: 'high',
  startDate: '2025-12-26',
  endDate: '2026-01-05',
  progress: 0,
  duration: 10,
  owner: 'Finance Manager',
  raci: {
    responsible: ['Finance Manager', 'Accounting Team'],
    accountable: ['CFO'],
    consulted: ['CKVC'],
    informed: ['Executive Team'],
  },
  comments: [],
  tags: ['Closing', 'Financial', 'Monthly'],
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  children: closingTasks as any[],
};

// Combined tasks including planner projects
export const allTasksEnhanced: TaskEnhanced[] = [
  ...sampleTasksEnhanced,
  taxFilingPhase,
  closingPhase,
];