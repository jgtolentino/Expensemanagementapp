// lib/validation/tasks.ts
// Task validation schemas for Finance PPM (Clarity-style)
// Follows Odoo project.task model

import { z } from 'zod';

// Task types matching Clarity PPM
export const TaskTypeSchema = z.enum(['phase', 'milestone', 'task']);
export const TaskStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'at_risk',
  'on_hold',
  'cancelled',
]);
export const TaskPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

// Task dependency types
export const DependencyTypeSchema = z.enum([
  'finish_start', // FS: predecessor must finish before successor can start
  'start_start', // SS: predecessor must start before successor can start
  'finish_finish', // FF: predecessor must finish before successor can finish
  'start_finish', // SF: predecessor must start before successor can finish
]);

// Create task (maps to Odoo project.task.create())
export const TaskCreateSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Task name is required').max(256),
  projectId: z.string().uuid('Invalid project ID'),

  // Optional fields
  description: z.string().optional(),
  type: TaskTypeSchema.default('task'),
  status: TaskStatusSchema.default('not_started'),
  priority: TaskPrioritySchema.default('normal'),

  // Dates (Clarity-style)
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(), // in days

  // Assignment
  ownerId: z.string().uuid().optional(), // task owner
  assigneeIds: z.array(z.string().uuid()).optional(), // assigned resources
  roleIds: z.array(z.string().uuid()).optional(), // assigned roles
  teamId: z.string().uuid().optional(), // assigned team

  // Work tracking (Clarity ETC/Actuals)
  estimatedHours: z.number().min(0).optional(), // Total estimated hours
  etc: z.number().min(0).optional(), // Estimate To Complete
  actualHours: z.number().min(0).default(0), // Actual hours logged
  progress: z.number().min(0).max(100).default(0), // % complete

  // Hierarchy (WBS)
  parentId: z.string().uuid().optional(), // parent task (for subtasks)
  phaseId: z.string().uuid().optional(), // parent phase
  wbsCode: z.string().optional(), // e.g., "1.2.3"

  // Dependencies
  dependsOn: z.array(z.string().uuid()).optional(), // predecessor task IDs
  blockedBy: z.array(z.string().uuid()).optional(), // blocking task IDs

  // Flags
  critical: z.boolean().default(false), // on critical path
  locked: z.boolean().default(false), // locked from autoschedule

  // Odoo standard fields
  active: z.boolean().default(true),
  companyId: z.string().uuid().optional(), // tenant_id
  workspaceId: z.string().uuid().optional(),

  // Custom fields
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// Update task (maps to Odoo project.task.write())
export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  id: z.string().uuid('Invalid task ID'),
});

// Bulk update tasks
export const TaskBulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one task ID required'),
  updates: TaskCreateSchema.partial(),
});

// Task dependency creation
export const TaskDependencyCreateSchema = z.object({
  predecessorId: z.string().uuid('Invalid predecessor task ID'),
  successorId: z.string().uuid('Invalid successor task ID'),
  type: DependencyTypeSchema.default('finish_start'),
  lag: z.number().int().default(0), // lag in days (can be negative for lead time)
});

// Task assignment
export const TaskAssignmentSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  resourceId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  allocatedHours: z.number().min(0).optional(),
  allocation: z.number().min(0).max(100).default(100), // % allocation
});

// Task status transition (workflow)
export const TaskStatusTransitionSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  status: TaskStatusSchema,
  comment: z.string().optional(),
  notify: z.boolean().default(true), // notify assignees
});

// Task checklist item (Clarity To-Do items)
export const TaskChecklistItemSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  name: z.string().min(1).max(256),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
});

// Task query/filter (for GET endpoints)
export const TaskQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  phaseId: z.string().uuid().optional(),
  status: z.union([TaskStatusSchema, z.array(TaskStatusSchema)]).optional(),
  assigneeId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  type: TaskTypeSchema.optional(),
  critical: z.boolean().optional(),
  overdue: z.boolean().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  endDateFrom: z.string().datetime().optional(),
  endDateTo: z.string().datetime().optional(),
  search: z.string().optional(), // full-text search on name/description
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  sortBy: z
    .enum(['name', 'startDate', 'endDate', 'priority', 'status', 'progress', 'wbsCode'])
    .default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Autoschedule request (Clarity autoschedule)
export const AutoscheduleRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  scheduleDate: z.string().datetime(), // date to begin scheduling
  scheduleFromFinish: z.boolean().default(false), // schedule backwards from finish
  considerResourceConstraints: z.boolean().default(true),
  honorConstraints: z.boolean().default(true),
  calculateSubnets: z.boolean().default(false), // separate critical paths
  startSuccessorsNextDay: z.boolean().default(false),
  ignoreTasksStartingBefore: z.string().datetime().optional(),
  ignoreTasksStartingAfter: z.string().datetime().optional(),
});

// Baseline comparison
export const BaselineCompareSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  baselineId: z.string().uuid('Invalid baseline ID'),
  includeVariance: z.boolean().default(true),
});

// Export types for use in application
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;
export type TaskDependency = z.infer<typeof TaskDependencyCreateSchema>;
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>;
export type AutoscheduleRequest = z.infer<typeof AutoscheduleRequestSchema>;
