// pages/api/tasks/create.ts
// Create new project task with WBS hierarchy
// Finance Clarity PPM

import type { NextApiRequest, NextApiResponse } from 'next';
import { logger, createLogContext, PerformanceTimer } from '@/lib/logger';
import { TaskCreateSchema } from '@/lib/validation/tasks';
import { requireFeature } from '@/config/featureFlags';

requireFeature('ppm');

interface ApiResponse {
  ok: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    issues?: any[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const ctx = createLogContext(req, { app: 'ppm' });
  const timer = new PerformanceTimer(ctx);

  logger.apiRequest('/api/tasks/create', req.method || 'POST', ctx);

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed' },
    });
  }

  try {
    // Validate input
    const parseResult = TaskCreateSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      logger.warn('Task validation failed', {
        ...ctx,
        issues: parseResult.error.issues,
      });
      
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task data',
          issues: parseResult.error.issues,
        },
      });
    }

    const taskData = parseResult.data;

    // Business rules
    if (taskData.type === 'milestone' && taskData.duration && taskData.duration > 0) {
      return res.status(422).json({
        ok: false,
        error: {
          code: 'MILESTONE_DURATION',
          message: 'Milestones cannot have duration > 0',
        },
      });
    }

    // Validate dates
    if (taskData.startDate && taskData.endDate) {
      if (new Date(taskData.endDate) < new Date(taskData.startDate)) {
        return res.status(422).json({
          ok: false,
          error: {
            code: 'INVALID_DATES',
            message: 'End date must be after start date',
          },
        });
      }
    }

    // Generate WBS code if task has parent
    let wbsCode = taskData.wbsCode;
    if (!wbsCode && taskData.parentId) {
      wbsCode = await generateWbsCode(taskData.parentId, ctx);
    } else if (!wbsCode) {
      wbsCode = await generateRootWbsCode(taskData.projectId, ctx);
    }

    // Calculate duration if not provided
    let duration = taskData.duration;
    if (!duration && taskData.startDate && taskData.endDate) {
      const start = new Date(taskData.startDate);
      const end = new Date(taskData.endDate);
      duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Prepare database record
    const task = {
      id: crypto.randomUUID(),
      name: taskData.name,
      description: taskData.description,
      project_id: taskData.projectId,
      parent_id: taskData.parentId,
      phase_id: taskData.phaseId,
      wbs_code: wbsCode,
      task_type: taskData.type,
      state: taskData.status,
      priority: taskData.priority || 'normal',
      start_date: taskData.startDate,
      end_date: taskData.endDate,
      duration,
      owner_id: taskData.ownerId,
      assignee_ids: taskData.assigneeIds || [],
      role_ids: taskData.roleIds || [],
      team_id: taskData.teamId,
      estimated_hours: taskData.estimatedHours,
      etc: taskData.etc || taskData.estimatedHours,
      actual_hours: taskData.actualHours || 0,
      progress: taskData.progress || 0,
      critical: taskData.critical || false,
      locked: taskData.locked || false,
      company_id: ctx.tenantId,
      workspace_id: ctx.workspaceId,
      create_uid: ctx.userId,
      create_date: new Date().toISOString(),
      write_uid: ctx.userId,
      write_date: new Date().toISOString(),
      active: true,
      tags: taskData.tags || [],
      sequence: 0,
    };

    // TODO: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('project_task')
    //   .insert(task)
    //   .select()
    //   .single();

    logger.info('Task created', {
      ...ctx,
      taskId: task.id,
      taskType: task.task_type,
      wbsCode,
    });

    // Log audit
    logger.audit('project_task', 'create', task.id, ctx);

    // Create dependencies if specified
    if (taskData.dependsOn && taskData.dependsOn.length > 0) {
      await createTaskDependencies(task.id, taskData.dependsOn, ctx);
    }

    // Notify assignees
    if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
      await notifyTaskAssignees(task.id, taskData.assigneeIds, ctx);
    }

    timer.endWithThreshold('Task creation completed', 1000);

    return res.status(201).json({
      ok: true,
      data: {
        id: task.id,
        name: task.name,
        wbsCode,
        type: task.task_type,
        status: task.state,
      },
    });

  } catch (error: any) {
    logger.error('Task creation failed', {
      ...ctx,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create task',
      },
    });
  }
}

// Generate WBS code for child task
async function generateWbsCode(parentId: string, ctx: any): Promise<string> {
  // TODO: Query parent task and get next sequence
  // const { data: parent } = await supabase
  //   .from('project_task')
  //   .select('wbs_code')
  //   .eq('id', parentId)
  //   .single();
  
  // const { count } = await supabase
  //   .from('project_task')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('parent_id', parentId);
  
  // For now, simulate
  const parentWbs = '1.1'; // parent.wbs_code
  const childSequence = Math.floor(Math.random() * 10) + 1;
  
  return `${parentWbs}.${childSequence}`;
}

// Generate root WBS code
async function generateRootWbsCode(projectId: string, ctx: any): Promise<string> {
  // TODO: Query project and get next root sequence
  // const { count } = await supabase
  //   .from('project_task')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('project_id', projectId)
  //   .is('parent_id', null);
  
  const rootSequence = Math.floor(Math.random() * 10) + 1;
  return String(rootSequence);
}

// Create task dependencies
async function createTaskDependencies(
  taskId: string,
  predecessorIds: string[],
  ctx: any
): Promise<void> {
  logger.info('Creating task dependencies', {
    ...ctx,
    taskId,
    predecessorCount: predecessorIds.length,
  });

  // TODO: Insert dependencies
  // const dependencies = predecessorIds.map(predId => ({
  //   id: crypto.randomUUID(),
  //   predecessor_id: predId,
  //   successor_id: taskId,
  //   dependency_type: 'finish_start',
  //   lag: 0,
  //   company_id: ctx.tenantId,
  //   create_uid: ctx.userId,
  //   create_date: new Date().toISOString(),
  // }));
  
  // await supabase.from('project_task_dependency').insert(dependencies);
}

// Notify assignees via n8n
async function notifyTaskAssignees(
  taskId: string,
  assigneeIds: string[],
  ctx: any
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_TASK_ASSIGNED;
  
  if (!webhookUrl) return;

  try {
    logger.info('Notifying task assignees', {
      ...ctx,
      taskId,
      assigneeCount: assigneeIds.length,
    });

    // TODO: Call webhook
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ taskId, assigneeIds, tenantId: ctx.tenantId }),
    // });

  } catch (error: any) {
    logger.error('Failed to notify assignees', { ...ctx, error: error.message });
  }
}
