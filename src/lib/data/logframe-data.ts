// lib/data/logframe-data.ts
// Finance Clarity PPM - LogFrame Data Module
// Logical Framework for TBWA SMP Finance Operations

export interface LogFrameLevel {
  level: 'Goal' | 'Outcome' | 'Immediate Objective' | 'Output' | 'Activity';
  code: string;
  objectiveDescription: string;
  indicators: string[];
  meansOfVerification: string[];
  assumptions: string[];
  linkedKPIs?: string[]; // KPI IDs
  linkedTasks?: string[]; // Task IDs
  linkedRisks?: string[]; // Risk IDs
}

export interface LogFrameObjective {
  id: string;
  level: LogFrameLevel['level'];
  code: string;
  title: string;
  description: string;
  indicators: LogFrameIndicator[];
  meansOfVerification: string[];
  assumptions: string[];
  children?: LogFrameObjective[];
  progress?: number;
  status?: 'On Track' | 'At Risk' | 'Behind' | 'Complete';
}

export interface LogFrameIndicator {
  id: string;
  name: string;
  target: string;
  actual?: string;
  unit: string;
  linkedKPI?: string;
}

// TBWA SMP Finance LogFrame
export const logFrameStructure: LogFrameObjective[] = [
  {
    id: 'GOAL-001',
    level: 'Goal',
    code: '',
    title: 'Finance Operations Excellence',
    description: 'Ensure 100% compliant and timely month-end closing and tax filing for TBWA SMP Finance.',
    indicators: [
      {
        id: 'IND-GOAL-001',
        name: 'On-time Submission Rate',
        target: '100%',
        actual: '92%',
        unit: '%',
        linkedKPI: 'KPI-001',
      },
      {
        id: 'IND-GOAL-002',
        name: 'BIR Compliance Rate',
        target: '100%',
        actual: '100%',
        unit: '%',
        linkedKPI: 'KPI-007',
      },
    ],
    meansOfVerification: [
      'Approved BIR receipts',
      'External audit reports',
      'Internal compliance tracker',
    ],
    assumptions: [
      'Finance systems remain stable',
      'Government portals operational',
      'Regulatory requirements unchanged',
    ],
    progress: 92,
    status: 'On Track',
    children: [
      {
        id: 'OUTCOME-001',
        level: 'Outcome',
        code: '',
        title: 'Streamlined Cross-Functional Coordination',
        description: 'Streamlined coordination between Finance, Payroll, Tax, and Treasury teams.',
        indicators: [
          {
            id: 'IND-OUTCOME-001',
            name: 'Average Process Delay',
            target: '<1 day',
            actual: '0.3 days',
            unit: 'days',
            linkedKPI: 'KPI-009',
          },
          {
            id: 'IND-OUTCOME-002',
            name: 'Team Collaboration Score',
            target: '90%',
            actual: '87%',
            unit: '%',
          },
        ],
        meansOfVerification: [
          'Task tracker completion logs',
          'Notion workflow logs',
          'Team survey results',
        ],
        assumptions: [
          'All teams follow established deadlines',
          'Communication channels remain effective',
          'Resources adequately allocated',
        ],
        progress: 87,
        status: 'On Track',
        children: [
          {
            id: 'IM1',
            level: 'Immediate Objective',
            code: 'IM1',
            title: 'Month-End Closing',
            description: 'Accurate and timely closing of books and reconciliations, including journal entries, accruals, WIP, and TB sign-off.',
            indicators: [
              {
                id: 'IND-IM1-001',
                name: 'TB Reconciliation Rate',
                target: '100%',
                actual: '98%',
                unit: '%',
                linkedKPI: 'KPI-006',
              },
              {
                id: 'IND-IM1-002',
                name: 'Number of Closing Adjustments',
                target: '<10',
                actual: '8',
                unit: 'count',
              },
              {
                id: 'IND-IM1-003',
                name: 'Days to Close',
                target: '7 WD',
                actual: '7.3 WD',
                unit: 'days',
                linkedKPI: 'KPI-009',
              },
            ],
            meansOfVerification: [
              'Reconciliation sheets',
              'GL transaction logs',
              'TB sign-off documents',
              'Audit trail reports',
            ],
            assumptions: [
              'Source data complete and accurate',
              'All entries reviewed by deadline',
              'System uptime maintained',
              'No major unexpected transactions',
            ],
            progress: 83,
            status: 'On Track',
            children: [
              {
                id: 'OUTPUT-IM1',
                level: 'Output',
                code: '',
                title: 'Month-End Deliverables',
                description: '1. Journal entries and accruals finalized\n2. WIP schedule reconciled\n3. TB reviewed and approved',
                indicators: [
                  {
                    id: 'IND-OUTPUT-IM1-001',
                    name: 'Journal Entries Posted',
                    target: '100%',
                    actual: '95%',
                    unit: '%',
                  },
                  {
                    id: 'IND-OUTPUT-IM1-002',
                    name: 'Accruals Accuracy',
                    target: '95%',
                    actual: '94%',
                    unit: '%',
                    linkedKPI: 'KPI-008',
                  },
                ],
                meansOfVerification: [
                  'Completed task count per calendar',
                  'Monthly compliance sheet',
                  'WBS Master task log',
                ],
                assumptions: [
                  'Timely reviews and approvals',
                  'Supporting documents available',
                ],
                progress: 85,
                status: 'On Track',
                children: [
                  {
                    id: 'ACTIVITY-IM1',
                    level: 'Activity',
                    code: '',
                    title: 'Month-End Closing Activities',
                    description: '- Reconcile ledgers (Phase I)\n- Post accruals (Phase II)\n- Prepare WIP and TB (Phase III)\n- Finalize balances (Phase IV)\n- Approve entries (TB Sign-off)',
                    indicators: [
                      {
                        id: 'IND-ACTIVITY-IM1-001',
                        name: 'Daily Completion Rate',
                        target: '100%',
                        actual: '85%',
                        unit: '%',
                        linkedKPI: 'KPI-003',
                      },
                    ],
                    meansOfVerification: [
                      'Month-close calendar',
                      'Full Task Schedule',
                      'WBS Master progress tracking',
                    ],
                    assumptions: [
                      'No data loss or corruption',
                      'Team availability maintained',
                      'No system downtime',
                    ],
                    progress: 83,
                    status: 'On Track',
                  },
                ],
              },
            ],
          },
          {
            id: 'IM2',
            level: 'Immediate Objective',
            code: 'IM2',
            title: 'Tax Filing Compliance',
            description: 'Complete, on-time tax filing for payroll, VAT, and withholding taxes.',
            indicators: [
              {
                id: 'IND-IM2-001',
                name: 'BIR Filing Timeliness',
                target: '100%',
                actual: '100%',
                unit: '%',
                linkedKPI: 'KPI-007',
              },
              {
                id: 'IND-IM2-002',
                name: 'Tax Calculation Accuracy',
                target: '100%',
                actual: '99.5%',
                unit: '%',
              },
            ],
            meansOfVerification: [
              'BIR confirmation receipts',
              'eFPS filing screenshots',
              'Tax filing tracker',
            ],
            assumptions: [
              'Government portals operational',
              'Tax rates and regulations stable',
              'Supporting documentation complete',
            ],
            progress: 100,
            status: 'Complete',
            children: [
              {
                id: 'OUTPUT-IM2',
                level: 'Output',
                code: '',
                title: 'Tax Filing Deliverables',
                description: '1. All BIR forms filed\n2. Tax payments processed\n3. Receipts archived',
                indicators: [
                  {
                    id: 'IND-OUTPUT-IM2-001',
                    name: 'Forms Filed vs Required',
                    target: '100%',
                    actual: '100%',
                    unit: '%',
                  },
                ],
                meansOfVerification: [
                  'Filing rate vs deadline tracker',
                  'BIR portal confirmations',
                  'Tax compliance sheet',
                ],
                assumptions: [
                  'Portals accessible during filing window',
                  'Payment systems operational',
                ],
                progress: 100,
                status: 'Complete',
                children: [
                  {
                    id: 'ACTIVITY-IM2',
                    level: 'Activity',
                    code: '',
                    title: 'Tax Filing Activities',
                    description: '- Compute VAT (CT-0003, CT-0004)\n- Prepare 1601C, 0619E forms\n- Route for approvals\n- File returns via eFPS\n- Upload proof of filing',
                    indicators: [
                      {
                        id: 'IND-ACTIVITY-IM2-001',
                        name: 'Filing Rate vs Deadline',
                        target: '100%',
                        actual: '100%',
                        unit: '%',
                      },
                    ],
                    meansOfVerification: [
                      'Tax filing tracker',
                      'Task completion logs',
                      'eFPS transaction history',
                    ],
                    assumptions: [
                      'eFPS portals accessible',
                      'Tax calculations verified',
                      'Approvers available',
                    ],
                    progress: 100,
                    status: 'Complete',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Utility functions
export function getLogFrameByLevel(level: LogFrameLevel['level']): LogFrameObjective[] {
  const results: LogFrameObjective[] = [];
  
  function traverse(obj: LogFrameObjective) {
    if (obj.level === level) {
      results.push(obj);
    }
    if (obj.children) {
      obj.children.forEach(child => traverse(child));
    }
  }
  
  logFrameStructure.forEach(obj => traverse(obj));
  return results;
}

export function getLogFrameById(id: string): LogFrameObjective | null {
  function search(obj: LogFrameObjective): LogFrameObjective | null {
    if (obj.id === id) return obj;
    if (obj.children) {
      for (const child of obj.children) {
        const found = search(child);
        if (found) return found;
      }
    }
    return null;
  }
  
  for (const obj of logFrameStructure) {
    const found = search(obj);
    if (found) return found;
  }
  return null;
}

export function getAllIndicators(): LogFrameIndicator[] {
  const indicators: LogFrameIndicator[] = [];
  
  function traverse(obj: LogFrameObjective) {
    indicators.push(...obj.indicators);
    if (obj.children) {
      obj.children.forEach(child => traverse(child));
    }
  }
  
  logFrameStructure.forEach(obj => traverse(obj));
  return indicators;
}

export function getLinkedTasks(objectiveId: string): string[] {
  const objective = getLogFrameById(objectiveId);
  if (!objective) return [];
  
  // Map LogFrame objectives to task IDs
  const taskMap: Record<string, string[]> = {
    'IM1': ['CT-0001', 'CT-0002', 'CT-0007', 'CT-0008', 'CT-0024', 'CT-0025', 'CT-0036'],
    'IM2': ['CT-0003', 'CT-0004'],
    'ACTIVITY-IM1': ['CT-0001', 'CT-0002', 'CT-0007', 'CT-0008', 'CT-0024', 'CT-0025', 'CT-0036'],
    'ACTIVITY-IM2': ['CT-0003', 'CT-0004'],
  };
  
  return taskMap[objectiveId] || [];
}

export function getLinkedKPIs(objectiveId: string): string[] {
  const objective = getLogFrameById(objectiveId);
  if (!objective) return [];
  
  return objective.indicators
    .filter(ind => ind.linkedKPI)
    .map(ind => ind.linkedKPI!);
}

export function calculateObjectiveProgress(objective: LogFrameObjective): number {
  if (objective.children && objective.children.length > 0) {
    const childProgress = objective.children.reduce((sum, child) => {
      return sum + calculateObjectiveProgress(child);
    }, 0);
    return childProgress / objective.children.length;
  }
  return objective.progress || 0;
}
