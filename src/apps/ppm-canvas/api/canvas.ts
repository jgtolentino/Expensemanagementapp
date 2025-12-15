/**
 * IPAI PPM Clarity - Canvas API Client
 * Handles communication with Odoo backend for Canvas operations
 */

import type {
  Canvas,
  CanvasView,
  WidgetConfig,
  WidgetData,
  Task,
  Phase,
  Project,
  WBSNode,
  ApiResponse,
  WidgetFilter,
} from '../types/canvas';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_ODOO_API_URL || '/api/clarity';

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API call failed: ${endpoint}`, error);
    return { success: false, error: message };
  }
}

// === Canvas API ===

/**
 * Get canvas configuration for a project
 */
export async function getCanvas(canvasId: number): Promise<ApiResponse<Canvas>> {
  return apiCall<Canvas>(`/canvas/${canvasId}`);
}

/**
 * Get default canvas for a project
 */
export async function getProjectCanvas(projectId: number): Promise<ApiResponse<Canvas>> {
  return apiCall<Canvas>(`/project/${projectId}/canvas`);
}

/**
 * Update canvas configuration
 */
export async function updateCanvas(
  canvasId: number,
  updates: Partial<Canvas>
): Promise<ApiResponse<Canvas>> {
  return apiCall<Canvas>(`/canvas/${canvasId}`, 'PUT', updates);
}

/**
 * Update canvas layout
 */
export async function updateCanvasLayout(
  canvasId: number,
  layoutColumns: number,
  widgetPositions: Array<{
    widget_id: number;
    position_x: number;
    position_y: number;
    col_span: number;
    row_span: number;
  }>
): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/canvas/${canvasId}/layout`, 'PUT', {
    layout_columns: layoutColumns,
    widget_positions: widgetPositions,
  });
}

// === Widget API ===

/**
 * Get widget data
 */
export async function getWidgetData(widgetId: number): Promise<ApiResponse<WidgetData>> {
  return apiCall<WidgetData>(`/widget/${widgetId}/data`);
}

/**
 * Create a new widget
 */
export async function createWidget(
  canvasId: number,
  config: Partial<WidgetConfig>
): Promise<ApiResponse<WidgetConfig>> {
  return apiCall<WidgetConfig>(`/canvas/${canvasId}/widget`, 'POST', config);
}

/**
 * Update widget configuration
 */
export async function updateWidget(
  widgetId: number,
  config: Partial<WidgetConfig>
): Promise<ApiResponse<WidgetConfig>> {
  return apiCall<WidgetConfig>(`/widget/${widgetId}`, 'PUT', config);
}

/**
 * Delete widget
 */
export async function deleteWidget(widgetId: number): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/widget/${widgetId}`, 'DELETE');
}

// === Saved Views API ===

/**
 * Get user views for a canvas
 */
export async function getCanvasViews(canvasId: number): Promise<ApiResponse<CanvasView[]>> {
  return apiCall<CanvasView[]>(`/canvas/${canvasId}/views`);
}

/**
 * Save current canvas state as a view
 */
export async function saveCanvasView(
  canvasId: number,
  name: string,
  config: {
    layout_columns: number;
    search_text?: string;
    filters?: WidgetFilter[];
    widgets?: Record<string, unknown>;
  },
  options?: {
    is_default?: boolean;
    is_favorite?: boolean;
  }
): Promise<ApiResponse<CanvasView>> {
  return apiCall<CanvasView>(`/canvas/${canvasId}/views`, 'POST', {
    name,
    config,
    ...options,
  });
}

/**
 * Apply a saved view
 */
export async function applyCanvasView(viewId: number): Promise<ApiResponse<{
  canvas_id: number;
  view_id: number;
  layout_columns: number;
  search_text?: string;
  filters: WidgetFilter[];
  widget_config: Record<string, unknown>;
}>> {
  return apiCall(`/view/${viewId}/apply`, 'POST');
}

/**
 * Update a saved view
 */
export async function updateCanvasView(
  viewId: number,
  updates: Partial<CanvasView>
): Promise<ApiResponse<CanvasView>> {
  return apiCall<CanvasView>(`/view/${viewId}`, 'PUT', updates);
}

/**
 * Delete a saved view
 */
export async function deleteCanvasView(viewId: number): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/view/${viewId}`, 'DELETE');
}

// === Tasks API ===

/**
 * Get tasks for a project
 */
export async function getProjectTasks(
  projectId: number,
  filters?: {
    phase_id?: number;
    task_type?: string;
    is_critical?: boolean;
    search?: string;
  }
): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall<Task[]>(`/project/${projectId}/tasks${query}`);
}

/**
 * Get WBS tree for a project
 */
export async function getWBSTree(projectId: number): Promise<ApiResponse<WBSNode[]>> {
  return apiCall<WBSNode[]>(`/project/${projectId}/wbs`);
}

/**
 * Update task
 */
export async function updateTask(
  taskId: number,
  updates: Partial<Task>
): Promise<ApiResponse<Task>> {
  return apiCall<Task>(`/task/${taskId}`, 'PUT', updates);
}

/**
 * Bulk update tasks
 */
export async function bulkUpdateTasks(
  taskIds: number[],
  updates: Partial<Task>
): Promise<ApiResponse<Task[]>> {
  return apiCall<Task[]>('/tasks/bulk', 'PUT', {
    task_ids: taskIds,
    updates,
  });
}

/**
 * Shift task dates
 */
export async function shiftTaskDates(
  taskIds: number[],
  days: number
): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>('/tasks/shift-dates', 'POST', {
    task_ids: taskIds,
    days,
  });
}

// === Phases API ===

/**
 * Get phases for a project
 */
export async function getProjectPhases(projectId: number): Promise<ApiResponse<Phase[]>> {
  return apiCall<Phase[]>(`/project/${projectId}/phases`);
}

/**
 * Update phase
 */
export async function updatePhase(
  phaseId: number,
  updates: Partial<Phase>
): Promise<ApiResponse<Phase>> {
  return apiCall<Phase>(`/phase/${phaseId}`, 'PUT', updates);
}

// === Autoschedule API ===

/**
 * Run autoschedule (tentative)
 */
export async function runAutoschedule(
  projectId: number,
  tentative: boolean = true
): Promise<ApiResponse<{
  success: boolean;
  tasks_scheduled: number;
  critical_count: number;
}>> {
  return apiCall(`/project/${projectId}/autoschedule`, 'POST', { tentative });
}

/**
 * Publish tentative schedule
 */
export async function publishSchedule(projectId: number): Promise<ApiResponse<{
  tasks_updated: number;
}>> {
  return apiCall(`/project/${projectId}/schedule/publish`, 'POST');
}

/**
 * Discard tentative schedule
 */
export async function discardSchedule(projectId: number): Promise<ApiResponse<boolean>> {
  return apiCall(`/project/${projectId}/schedule/discard`, 'POST');
}

/**
 * Get critical path
 */
export async function getCriticalPath(projectId: number): Promise<ApiResponse<number[]>> {
  return apiCall<number[]>(`/project/${projectId}/critical-path`);
}

// === Project API ===

/**
 * Get project
 */
export async function getProject(projectId: number): Promise<ApiResponse<Project>> {
  return apiCall<Project>(`/project/${projectId}`);
}

/**
 * Update project settings
 */
export async function updateProjectSettings(
  projectId: number,
  settings: Partial<Project>
): Promise<ApiResponse<Project>> {
  return apiCall<Project>(`/project/${projectId}/settings`, 'PUT', settings);
}

// === Dependencies API ===

/**
 * Create task dependency
 */
export async function createDependency(
  predecessorId: number,
  successorId: number,
  dependencyType: string = 'FS',
  lagDays: number = 0
): Promise<ApiResponse<{ id: number }>> {
  return apiCall('/dependency', 'POST', {
    predecessor_id: predecessorId,
    successor_id: successorId,
    dependency_type: dependencyType,
    lag_days: lagDays,
  });
}

/**
 * Delete dependency
 */
export async function deleteDependency(dependencyId: number): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/dependency/${dependencyId}`, 'DELETE');
}

// === To-Dos API ===

/**
 * Get task to-dos
 */
export async function getTaskTodos(taskId: number): Promise<ApiResponse<Array<{
  id: number;
  name: string;
  state: 'open' | 'done';
  due_date?: string;
  owner_name?: string;
  priority: string;
}>>> {
  return apiCall(`/task/${taskId}/todos`);
}

/**
 * Mark to-do as done
 */
export async function markTodoDone(todoId: number): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/todo/${todoId}/done`, 'POST');
}

/**
 * Reopen to-do
 */
export async function reopenTodo(todoId: number): Promise<ApiResponse<boolean>> {
  return apiCall<boolean>(`/todo/${todoId}/reopen`, 'POST');
}

// === Export API object ===
export const canvasApi = {
  // Canvas
  getCanvas,
  getProjectCanvas,
  updateCanvas,
  updateCanvasLayout,

  // Widgets
  getWidgetData,
  createWidget,
  updateWidget,
  deleteWidget,

  // Views
  getCanvasViews,
  saveCanvasView,
  applyCanvasView,
  updateCanvasView,
  deleteCanvasView,

  // Tasks
  getProjectTasks,
  getWBSTree,
  updateTask,
  bulkUpdateTasks,
  shiftTaskDates,

  // Phases
  getProjectPhases,
  updatePhase,

  // Autoschedule
  runAutoschedule,
  publishSchedule,
  discardSchedule,
  getCriticalPath,

  // Project
  getProject,
  updateProjectSettings,

  // Dependencies
  createDependency,
  deleteDependency,

  // To-Dos
  getTaskTodos,
  markTodoDone,
  reopenTodo,
};

export default canvasApi;
