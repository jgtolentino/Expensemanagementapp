/**
 * IPAI PPM Clarity - Canvas React Hooks
 * Custom hooks for Canvas state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { canvasApi } from '../api/canvas';
import type {
  Canvas,
  CanvasView,
  WidgetConfig,
  WidgetData,
  Task,
  Phase,
  WBSNode,
  TaskFilters,
  TaskViewMode,
} from '../types/canvas';

// === useCanvas Hook ===
export function useCanvas(canvasId: number | null) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCanvas = useCallback(async () => {
    if (!canvasId) return;

    setLoading(true);
    setError(null);

    const result = await canvasApi.getCanvas(canvasId);

    if (result.success && result.data) {
      setCanvas(result.data);
    } else {
      setError(result.error || 'Failed to load canvas');
    }

    setLoading(false);
  }, [canvasId]);

  useEffect(() => {
    fetchCanvas();
  }, [fetchCanvas]);

  const updateLayout = useCallback(async (
    layoutColumns: number,
    widgetPositions: Array<{
      widget_id: number;
      position_x: number;
      position_y: number;
      col_span: number;
      row_span: number;
    }>
  ) => {
    if (!canvasId) return false;

    const result = await canvasApi.updateCanvasLayout(canvasId, layoutColumns, widgetPositions);

    if (result.success) {
      await fetchCanvas();
    }

    return result.success;
  }, [canvasId, fetchCanvas]);

  return {
    canvas,
    loading,
    error,
    refresh: fetchCanvas,
    updateLayout,
  };
}

// === useWidgetData Hook ===
export function useWidgetData(widgetId: number) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await canvasApi.getWidgetData(widgetId);

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to load widget data');
    }

    setLoading(false);
  }, [widgetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// === useCanvasViews Hook ===
export function useCanvasViews(canvasId: number | null) {
  const [views, setViews] = useState<CanvasView[]>([]);
  const [activeView, setActiveView] = useState<CanvasView | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchViews = useCallback(async () => {
    if (!canvasId) return;

    setLoading(true);
    const result = await canvasApi.getCanvasViews(canvasId);

    if (result.success && result.data) {
      setViews(result.data);
      // Set default view as active
      const defaultView = result.data.find(v => v.is_default);
      if (defaultView && !activeView) {
        setActiveView(defaultView);
      }
    }

    setLoading(false);
  }, [canvasId, activeView]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  const applyView = useCallback(async (viewId: number) => {
    const result = await canvasApi.applyCanvasView(viewId);
    if (result.success) {
      const view = views.find(v => v.id === viewId);
      if (view) {
        setActiveView(view);
      }
      return result.data;
    }
    return null;
  }, [views]);

  const saveView = useCallback(async (
    name: string,
    config: Record<string, unknown>,
    options?: { is_default?: boolean; is_favorite?: boolean }
  ) => {
    if (!canvasId) return null;

    const result = await canvasApi.saveCanvasView(
      canvasId,
      name,
      config as Parameters<typeof canvasApi.saveCanvasView>[2],
      options
    );

    if (result.success) {
      await fetchViews();
      return result.data;
    }

    return null;
  }, [canvasId, fetchViews]);

  return {
    views,
    activeView,
    loading,
    applyView,
    saveView,
    refresh: fetchViews,
    setActiveView,
  };
}

// === useProjectTasks Hook ===
export function useProjectTasks(projectId: number | null, initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    const result = await canvasApi.getProjectTasks(projectId, filters);

    if (result.success && result.data) {
      setTasks(result.data);
    } else {
      setError(result.error || 'Failed to load tasks');
    }

    setLoading(false);
  }, [projectId, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
    const result = await canvasApi.updateTask(taskId, updates);

    if (result.success) {
      await fetchTasks();
      return true;
    }

    return false;
  }, [fetchTasks]);

  const bulkUpdate = useCallback(async (taskIds: number[], updates: Partial<Task>) => {
    const result = await canvasApi.bulkUpdateTasks(taskIds, updates);

    if (result.success) {
      await fetchTasks();
      return true;
    }

    return false;
  }, [fetchTasks]);

  const shiftDates = useCallback(async (taskIds: number[], days: number) => {
    const result = await canvasApi.shiftTaskDates(taskIds, days);

    if (result.success) {
      await fetchTasks();
      return true;
    }

    return false;
  }, [fetchTasks]);

  // Computed values
  const criticalTasks = useMemo(
    () => tasks.filter(t => t.is_critical),
    [tasks]
  );

  const milestones = useMemo(
    () => tasks.filter(t => t.task_type === 'milestone'),
    [tasks]
  );

  return {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    updateTask,
    bulkUpdate,
    shiftDates,
    refresh: fetchTasks,
    criticalTasks,
    milestones,
  };
}

// === useWBSTree Hook ===
export function useWBSTree(projectId: number | null) {
  const [tree, setTree] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const fetchTree = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    const result = await canvasApi.getWBSTree(projectId);

    if (result.success && result.data) {
      setTree(result.data);
      // Expand first level by default
      const firstLevel = new Set(result.data.map(n => n.id));
      setExpandedNodes(firstLevel);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set<string>();

    const collectIds = (nodes: WBSNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };

    collectIds(tree);
    setExpandedNodes(allIds);
  }, [tree]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Flatten tree for rendering
  const flatNodes = useMemo(() => {
    const result: Array<WBSNode & { level: number; hasChildren: boolean }> = [];

    const flatten = (nodes: WBSNode[], level: number) => {
      nodes.forEach(node => {
        result.push({
          ...node,
          level,
          hasChildren: node.children.length > 0,
        });

        if (expandedNodes.has(node.id) && node.children.length > 0) {
          flatten(node.children, level + 1);
        }
      });
    };

    flatten(tree, 0);
    return result;
  }, [tree, expandedNodes]);

  return {
    tree,
    flatNodes,
    loading,
    expandedNodes,
    toggleNode,
    expandAll,
    collapseAll,
    refresh: fetchTree,
  };
}

// === useProjectPhases Hook ===
export function useProjectPhases(projectId: number | null) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhases = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    const result = await canvasApi.getProjectPhases(projectId);

    if (result.success && result.data) {
      setPhases(result.data);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const updatePhase = useCallback(async (phaseId: number, updates: Partial<Phase>) => {
    const result = await canvasApi.updatePhase(phaseId, updates);

    if (result.success) {
      await fetchPhases();
      return true;
    }

    return false;
  }, [fetchPhases]);

  return {
    phases,
    loading,
    updatePhase,
    refresh: fetchPhases,
  };
}

// === useAutoschedule Hook ===
export function useAutoschedule(projectId: number | null) {
  const [running, setRunning] = useState(false);
  const [hasTentative, setHasTentative] = useState(false);

  const runSchedule = useCallback(async (tentative: boolean = true) => {
    if (!projectId) return null;

    setRunning(true);
    const result = await canvasApi.runAutoschedule(projectId, tentative);
    setRunning(false);

    if (result.success && result.data) {
      if (tentative) {
        setHasTentative(true);
      }
      return result.data;
    }

    return null;
  }, [projectId]);

  const publish = useCallback(async () => {
    if (!projectId) return false;

    const result = await canvasApi.publishSchedule(projectId);

    if (result.success) {
      setHasTentative(false);
      return true;
    }

    return false;
  }, [projectId]);

  const discard = useCallback(async () => {
    if (!projectId) return false;

    const result = await canvasApi.discardSchedule(projectId);

    if (result.success) {
      setHasTentative(false);
      return true;
    }

    return false;
  }, [projectId]);

  return {
    running,
    hasTentative,
    runSchedule,
    publish,
    discard,
    setHasTentative,
  };
}

// === useTaskViewMode Hook ===
export function useTaskViewMode(initialMode: TaskViewMode = 'grid') {
  const [viewMode, setViewMode] = useState<TaskViewMode>(initialMode);

  return { viewMode, setViewMode };
}
