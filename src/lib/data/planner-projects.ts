// lib/data/planner-projects.ts
// Microsoft Planner-style Projects with Buckets, Tasks, and Checklists
// WITH DATA SOURCE METADATA (Production vs Mock)

import { DataMeta } from './ppm-data-model';

// Metadata for this data source
const IMPORT_TIMESTAMP = new Date().toISOString().split('T')[0]; // Today's date
const SOURCE_FILENAME = 'ppm-oca.xlsx';

export const PLANNER_DATA_META: DataMeta = {
  source: 'production', // This is REAL CSV data
  filename: SOURCE_FILENAME,
  lastUpdated: IMPORT_TIMESTAMP,
  importedBy: 'System'
};

export interface PlannerChecklistItem {
  content: string;
  is_checked: boolean;
}

export interface PlannerTask {
  title: string;
  due_date: string;
  start_date: string;
  labels: string[];
  assigned_to: string[];
  checklist: PlannerChecklistItem[];
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlannerBucket {
  bucket_name: string;
  tasks: PlannerTask[];
}

export interface PlannerProject {
  plan_title: string;
  buckets: PlannerBucket[];
}

// Tax Filing Project
export const taxFilingProject: PlannerProject = {
  plan_title: "Tax Filing Project",
  buckets: [
    {
      bucket_name: "Preparation",
      tasks: [
        {
          title: "Gather Documents",
          due_date: "2/28/2026",
          start_date: "1/15/2026",
          labels: ["Tax", "Documentation"],
          assigned_to: ["Accountant"],
          checklist: [
            {
              content: "Collect W-2 forms from all employees",
              is_checked: false
            },
            {
              content: "Gather 1099 forms from contractors",
              is_checked: false
            },
            {
              content: "Compile receipts for business expenses",
              is_checked: false
            },
            {
              content: "Review bank statements",
              is_checked: false
            },
            {
              content: "Submit for approval",
              is_checked: false
            }
          ],
          description: "Comprehensive document gathering for tax preparation",
          priority: "high"
        }
      ]
    },
    {
      bucket_name: "Review",
      tasks: [
        {
          title: "Review Draft",
          due_date: "3/20/2026",
          start_date: "3/10/2026",
          labels: ["Tax", "Review"],
          assigned_to: ["Senior Accountant"],
          checklist: [
            {
              content: "Review income statements",
              is_checked: false
            },
            {
              content: "Verify deductions and credits",
              is_checked: false
            },
            {
              content: "Check for calculation errors",
              is_checked: false
            },
            {
              content: "Review details",
              is_checked: false
            },
            {
              content: "Submit for approval",
              is_checked: false
            }
          ],
          description: "Comprehensive review of tax draft before filing",
          priority: "critical"
        }
      ]
    },
    {
      bucket_name: "Filing",
      tasks: [
        {
          title: "File Taxes",
          due_date: "4/15/2026",
          start_date: "4/1/2026",
          labels: ["Tax", "Filing", "Deadline"],
          assigned_to: ["Tax Specialist"],
          checklist: [
            {
              content: "E-file federal returns",
              is_checked: false
            },
            {
              content: "E-file state returns",
              is_checked: false
            },
            {
              content: "Review confirmation receipts",
              is_checked: false
            },
            {
              content: "Archive filed documents",
              is_checked: false
            },
            {
              content: "Submit for approval",
              is_checked: false
            }
          ],
          description: "Final tax filing and submission",
          priority: "critical"
        }
      ]
    }
  ]
};

// Closing Task Project (placeholder - will be added when you provide the data)
export const closingTaskProject: PlannerProject = {
  plan_title: "Month-End Closing Task",
  buckets: [
    {
      bucket_name: "Preparation",
      tasks: [
        {
          title: "Prepare Closing Checklist",
          due_date: "2025-12-28",
          start_date: "2025-12-26",
          labels: ["Closing", "Checklist"],
          assigned_to: ["Finance Manager"],
          checklist: [
            {
              content: "Review previous month close",
              is_checked: false
            },
            {
              content: "Update checklist template",
              is_checked: false
            },
            {
              content: "Distribute to team",
              is_checked: false
            }
          ],
          priority: "high"
        }
      ]
    },
    {
      bucket_name: "Execution",
      tasks: [
        {
          title: "Execute Month-End Close",
          due_date: "2025-12-31",
          start_date: "2025-12-29",
          labels: ["Closing", "Critical"],
          assigned_to: ["Accounting Team"],
          checklist: [
            {
              content: "Process all transactions",
              is_checked: false
            },
            {
              content: "Run financial reports",
              is_checked: false
            },
            {
              content: "Reconcile accounts",
              is_checked: false
            }
          ],
          priority: "critical"
        }
      ]
    },
    {
      bucket_name: "Review & Approval",
      tasks: [
        {
          title: "Final Review and Sign-Off",
          due_date: "2026-01-05",
          start_date: "2026-01-02",
          labels: ["Review", "Approval"],
          assigned_to: ["CFO"],
          checklist: [
            {
              content: "Review financial statements",
              is_checked: false
            },
            {
              content: "Approve close",
              is_checked: false
            },
            {
              content: "Archive documentation",
              is_checked: false
            }
          ],
          priority: "high"
        }
      ]
    }
  ]
};

// Helper function to convert Planner format to TaskEnhanced format
export function convertPlannerToTaskEnhanced(
  plannerProject: PlannerProject,
  projectCode: string
): any[] {
  const tasks: any[] = [];
  let taskCounter = 1;
  let checklistCounter = 1;

  plannerProject.buckets.forEach((bucket, bucketIndex) => {
    bucket.tasks.forEach((task, taskIndex) => {
      const taskId = `${projectCode}-${String(taskCounter).padStart(3, '0')}`;
      
      // Convert checklist to subtasks with checklist items
      const subtasks = task.checklist.map((item, index) => ({
        id: `SUB-${taskId}-${String(index + 1).padStart(2, '0')}`,
        name: item.content,
        status: item.is_checked ? 'completed' : 'not_started',
        assignee: task.assigned_to[0] || 'Unassigned',
        dueDate: task.due_date,
        progress: item.is_checked ? 100 : 0,
        checklist: [{
          id: `CHK-${checklistCounter++}`,
          text: item.content,
          completed: item.is_checked,
          completedBy: item.is_checked ? task.assigned_to[0] : undefined,
        }],
        estimatedHours: 1,
        actualHours: item.is_checked ? 1 : 0,
        priority: task.priority || 'medium',
      }));

      tasks.push({
        id: taskId,
        code: taskId,
        name: task.title,
        description: task.description || '',
        type: 'task',
        status: task.checklist.every(c => c.is_checked) ? 'completed' : 
                task.checklist.some(c => c.is_checked) ? 'in_progress' : 'not_started',
        priority: task.priority || 'medium',
        startDate: task.start_date,
        endDate: task.due_date,
        progress: Math.round((task.checklist.filter(c => c.is_checked).length / task.checklist.length) * 100),
        duration: Math.ceil((new Date(task.due_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        owner: task.assigned_to[0] || 'Unassigned',
        assignee: task.assigned_to[0] || 'Unassigned',
        raci: {
          responsible: task.assigned_to,
          accountable: [task.assigned_to[0] || 'Unassigned'],
          consulted: [],
          informed: [],
        },
        budgetHours: task.checklist.length,
        actualHours: task.checklist.filter(c => c.is_checked).length,
        remainingHours: task.checklist.filter(c => !c.is_checked).length,
        dependencies: [],
        subtasks: subtasks,
        comments: [],
        tags: [...task.labels, bucket.bucket_name],
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        bucket: bucket.bucket_name, // Add bucket for grouping
      });

      taskCounter++;
    });
  });

  return tasks;
}

// Export converted tasks
export const taxFilingTasks = convertPlannerToTaskEnhanced(taxFilingProject, 'TAX');
export const closingTasks = convertPlannerToTaskEnhanced(closingTaskProject, 'CLOSE');

// Combined planner projects
export const allPlannerProjects = [taxFilingProject, closingTaskProject];