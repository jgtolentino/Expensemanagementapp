// lib/api/tasks.ts
// Project Task API functions using Supabase

import { supabase, getCompanyId, getCurrentUser } from '../supabase';
import type { ProjectTask } from '../../types';

// ============================================================================
// TASKS
// ============================================================================

/**
 * Create new project task with WBS hierarchy
 */
export async function createTask(data: {
  name: string;
  description?: string;
  projectId: string;
  parentId?: string;
  phaseId?: string;
  type: 'phase' | 'task' | 'milestone';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  duration?: number;
  estimatedHours?: number;
  ownerId?: string;
  assigneeIds?: string[];
  dependsOn?: string[];
  tags?: string[];
}) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  // Business rule: Milestones cannot have duration > 0
  if (data.type === 'milestone' && data.duration && data.duration > 0) {
    throw new Error('Milestones cannot have duration > 0');
  }

  // Validate dates
  if (data.startDate && data.endDate) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      throw new Error('End date must be after start date');
    }
  }

  // Generate WBS code
  let wbsCode: string;
  if (data.parentId) {
    wbsCode = await generateChildWbsCode(data.parentId, companyId);
  } else {
    wbsCode = await generateRootWbsCode(data.projectId, companyId);
  }

  // Calculate duration if not provided
  let duration = data.duration;
  if (!duration && data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Insert task
  const { data: task, error } = await supabase
    .from('project_task')
    .insert({
      name: data.name,
      description: data.description,
      project_id: data.projectId,
      parent_id: data.parentId,
      phase_id: data.phaseId,
      wbs_code: wbsCode,
      task_type: data.type,
      state: 'pending',
      priority: data.priority || 'normal',
      start_date: data.startDate,
      end_date: data.endDate,
      duration,
      owner_id: data.ownerId || user.id,
      assignee_ids: data.assigneeIds || [],
      estimated_hours: data.estimatedHours,
      etc: data.estimatedHours, // Estimate to Complete
      actual_hours: 0,
      progress: 0,
      critical: false,
      locked: false,
      company_id: companyId,
      tags: data.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  // Create dependencies if specified
  if (data.dependsOn && data.dependsOn.length > 0) {
    const dependencies = data.dependsOn.map(predId => ({
      predecessor_id: predId,
      successor_id: task.id,
      dependency_type: 'finish_start',
      lag: 0,
      company_id: companyId,
    }));

    const { error: depsError } = await supabase
      .from('project_task_dependency')
      .insert(dependencies);

    if (depsError) {
      console.error('Error creating task dependencies:', depsError);
      // Don't throw - task was created successfully
    }
  }

  return task;
}

/**
 * Get tasks for a project
 */
export async function getProjectTasks(projectId: string, filters?: {
  type?: string;
  status?: string;
  ownerId?: string;
  parentId?: string;
}) {
  const companyId = await getCompanyId();

  if (!companyId) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('project_task')
    .select('*')
    .eq('project_id', projectId)
    .eq('company_id', companyId)
    .order('wbs_code', { ascending: true });

  if (filters?.type) {
    query = query.eq('task_type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('state', filters.status);
  }

  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  if (filters?.parentId !== undefined) {
    if (filters.parentId === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', filters.parentId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data;
}

/**
 * Get task by ID with dependencies
 */
export async function getTask(id: string) {
  const companyId = await getCompanyId();

  if (!companyId) {
    throw new Error('User not authenticated');
  }

  const { data: task, error: taskError } = await supabase
    .from('project_task')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (taskError) {
    console.error('Error fetching task:', taskError);
    throw taskError;
  }

  // Get predecessors
  const { data: predecessors } = await supabase
    .from('project_task_dependency')
    .select('*, predecessor:project_task!predecessor_id(*)')
    .eq('successor_id', id)
    .eq('company_id', companyId);

  // Get successors
  const { data: successors } = await supabase
    .from('project_task_dependency')
    .select('*, successor:project_task!successor_id(*)')
    .eq('predecessor_id', id)
    .eq('company_id', companyId);

  return {
    ...task,
    predecessors: predecessors || [],
    successors: successors || [],
  };
}

/**
 * Update task
 */
export async function updateTask(id: string, updates: Partial<{
  name: string;
  description: string;
  state: string;
  priority: string;
  startDate: string;
  endDate: string;
  duration: number;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  assigneeIds: string[];
}>) {
  const companyId = await getCompanyId();

  if (!companyId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('project_task')
    .update({
      name: updates.name,
      description: updates.description,
      state: updates.state,
      priority: updates.priority,
      start_date: updates.startDate,
      end_date: updates.endDate,
      duration: updates.duration,
      estimated_hours: updates.estimatedHours,
      actual_hours: updates.actualHours,
      progress: updates.progress,
      assignee_ids: updates.assigneeIds,
      write_date: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

/**
 * Delete task (soft delete)
 */
export async function deleteTask(id: string) {
  const companyId = await getCompanyId();

  if (!companyId) {
    throw new Error('User not authenticated');
  }

  // Check if task has children
  const { data: children } = await supabase
    .from('project_task')
    .select('id')
    .eq('parent_id', id)
    .eq('company_id', companyId);

  if (children && children.length > 0) {
    throw new Error('Cannot delete task with child tasks');
  }

  const { error } = await supabase
    .from('project_task')
    .update({ active: false })
    .eq('id', id)
    .eq('company_id', companyId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function generateRootWbsCode(projectId: string, companyId: string): Promise<string> {
  const { data } = await supabase
    .from('project_task')
    .select('wbs_code')
    .eq('project_id', projectId)
    .eq('company_id', companyId)
    .is('parent_id', null)
    .order('wbs_code', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].wbs_code;
    const lastSeq = parseInt(lastCode);
    sequence = lastSeq + 1;
  }

  return String(sequence);
}

async function generateChildWbsCode(parentId: string, companyId: string): Promise<string> {
  // Get parent WBS code
  const { data: parent } = await supabase
    .from('project_task')
    .select('wbs_code')
    .eq('id', parentId)
    .eq('company_id', companyId)
    .single();

  if (!parent) {
    throw new Error('Parent task not found');
  }

  // Get last child sequence
  const { data: children } = await supabase
    .from('project_task')
    .select('wbs_code')
    .eq('parent_id', parentId)
    .eq('company_id', companyId)
    .order('wbs_code', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (children && children.length > 0) {
    const lastCode = children[0].wbs_code;
    const parts = lastCode.split('.');
    const lastSeq = parseInt(parts[parts.length - 1]);
    sequence = lastSeq + 1;
  }

  return `${parent.wbs_code}.${sequence}`;
}
