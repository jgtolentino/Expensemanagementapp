/**
 * IPAI PPM Clarity - Canvas Types
 * TypeScript type definitions for Canvas, Widgets, and Tasks
 */

// === Widget Types ===
export type WidgetType = 'number_tile' | 'progress_ring' | 'pie' | 'bar' | 'table';

export type OperationType = 'count' | 'sum' | 'avg' | 'min' | 'max';

export type FormatType = 'number' | 'percentage' | 'currency' | 'hours';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export type TaskType = 'task' | 'phase' | 'milestone' | 'summary';

export type SortOrder = 'asc' | 'desc';

// === Widget Configuration ===
export interface WidgetFilter {
  field: string;
  operator: string;
  value: unknown;
}

export interface TableColumn {
  field: string;
  label: string;
  width?: number;
}

export interface WidgetLayout {
  col_span: number;
  row_span: number;
  x: number;
  y: number;
}

export interface WidgetConfig {
  id: number;
  type: WidgetType;
  title: string;
  color: string;
  icon?: string;
  target_model: string;
  operation: OperationType;
  format: FormatType;
  group_by?: string;
  aggregate_field?: string;
  sort_order: SortOrder;
  sort_by?: string;
  limit: number;
  filters: WidgetFilter[];
  table_columns: TableColumn[];
  target_value?: number;
  actual_field?: string;
  layout: WidgetLayout;
}

// === Widget Data Types ===
export interface NumberTileData {
  type: 'number_tile';
  value: number;
  format: FormatType;
}

export interface ProgressRingData {
  type: 'progress_ring';
  value: number;
  target: number;
  percentage: number;
  format: FormatType;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface PieChartData {
  type: 'pie';
  data: ChartDataItem[];
}

export interface BarChartData {
  type: 'bar';
  data: ChartDataItem[];
}

export interface TableData {
  type: 'table';
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  total: number;
}

export type WidgetData = NumberTileData | ProgressRingData | PieChartData | BarChartData | TableData;

// === Canvas Types ===
export interface CanvasView {
  id: number;
  name: string;
  user_id: number;
  user_name: string;
  is_default: boolean;
  is_favorite: boolean;
  is_shared: boolean;
  is_owner: boolean;
  layout_columns?: number;
  search_text?: string;
  filters: WidgetFilter[];
  config: Record<string, unknown>;
  created?: string;
  modified?: string;
}

export interface Canvas {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  project_name: string;
  layout_columns: number;
  is_default: boolean;
  config_mode: boolean;
  widgets: WidgetConfig[];
  views: CanvasView[];
  widget_count: number;
  chart_widget_count: number;
  table_widget_count: number;
}

// === Task Types ===
export interface TaskDependency {
  id: number;
  predecessor_id: number;
  predecessor_name: string;
  successor_id: number;
  successor_name: string;
  dependency_type: DependencyType;
  lag_days: number;
}

export interface TaskTodo {
  id: number;
  name: string;
  task_id: number;
  due_date?: string;
  owner_id?: number;
  owner_name?: string;
  state: 'open' | 'done';
  priority: '0' | '1' | '2' | '3';
  is_overdue: boolean;
}

export interface Task {
  id: number;
  name: string;
  project_id: number;
  phase_id?: number;
  phase_name?: string;
  task_type: TaskType;
  wbs_code?: string;
  wbs_level: number;

  // Dates
  start_date?: string;
  end_date?: string;
  duration_days: number;

  // Progress
  percent_complete: number;
  etc_hours: number;
  total_effort: number;
  planned_hours: number;
  actual_hours: number;

  // CPM
  is_critical: boolean;
  float_days: number;
  early_start?: string;
  early_finish?: string;
  late_start?: string;
  late_finish?: string;

  // Tentative Schedule
  tentative_start?: string;
  tentative_finish?: string;
  tentative_active: boolean;

  // Constraints
  locked: boolean;
  constraint_type?: string;
  constraint_date?: string;

  // Assignment
  user_ids: number[];
  user_names: string[];
  resource_id?: number;

  // Relations
  predecessor_count: number;
  successor_count: number;
  todo_count: number;
  todo_done_count: number;

  // Hierarchy
  parent_id?: number;
  child_ids: number[];

  // Display
  gantt_color?: number;
}

// === Phase Types ===
export interface Phase {
  id: number;
  name: string;
  project_id: number;
  description?: string;
  sequence: number;
  state: 'draft' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

  // Dates
  start_date?: string;
  end_date?: string;
  computed_start?: string;
  computed_end?: string;

  // Progress
  progress: number;

  // Effort
  planned_hours: number;
  actual_hours: number;
  etc_hours: number;
  eac_hours: number;

  // Relations
  task_count: number;
  task_ids: number[];

  // Owner
  manager_id?: number;
  manager_name?: string;

  color?: number;
}

// === Project Types ===
export interface Project {
  id: number;
  name: string;

  // Phases & Canvas
  phase_ids: number[];
  phase_count: number;
  canvas_ids: number[];
  canvas_count: number;
  default_canvas_id?: number;

  // Autoschedule
  autoschedule_enabled: boolean;
  schedule_from: 'start' | 'finish';
  project_start_date?: string;
  project_finish_date?: string;

  // Constraints
  ignore_tasks_before?: string;
  ignore_tasks_after?: string;
  respect_resource_constraints: boolean;

  // Status
  has_tentative_schedule: boolean;
  critical_path_length: number;
  critical_task_count: number;
}

// === WBS Tree Node ===
export interface WBSNode {
  id: string;
  type: TaskType | 'phase';
  name: string;
  wbs_code?: string;
  start?: string;
  end?: string;
  progress: number;
  is_critical?: boolean;
  is_milestone?: boolean;
  locked?: boolean;
  predecessor_count?: number;
  successor_count?: number;
  children: WBSNode[];
}

// === API Response Types ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WidgetDataResponse {
  widget_id: number;
  data: WidgetData;
}

// === View State ===
export type TaskViewMode = 'grid' | 'board' | 'timeline' | 'list';

export interface TaskFilters {
  phase_id?: number;
  task_type?: TaskType;
  is_critical?: boolean;
  is_milestone?: boolean;
  locked?: boolean;
  search?: string;
}

export interface CanvasState {
  canvas: Canvas | null;
  activeView: CanvasView | null;
  configMode: boolean;
  searchText: string;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  phases: Phase[];
  viewMode: TaskViewMode;
  filters: TaskFilters;
  selectedTaskIds: number[];
  loading: boolean;
  error: string | null;
}
