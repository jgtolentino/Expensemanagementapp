// /lib/data/dashboard-live.ts
// Live Dashboard Data Using Real Production CSV Statistics
// Replaces Mock Data with Actual Planner Project Metrics

import { 
  getPortfolioRealStats, 
  getProjectBreakdown,
  calculateHealthScore,
  PLANNER_DATA_META 
} from './planner-stats';
import { MOCK_DATA_META } from './ppm-sample-data';
import { DataMeta } from './ppm-data-model';

// ==========================================
// 1. FETCH LIVE STATISTICS
// ==========================================

const liveStats = getPortfolioRealStats();
const liveProjects = getProjectBreakdown();
const liveHealthScore = calculateHealthScore();

// ==========================================
// 2. HYBRID DASHBOARD RESPONSE
// ==========================================

/**
 * Portfolio Dashboard with HYBRID data:
 * - 🟢 PRODUCTION: Project counts, task counts, progress (from CSV)
 * - 🟠 MOCK: Budget figures (CSV has no financial data)
 */
export interface DashboardMetric {
  value: number | string;
  meta: DataMeta;
  label?: string;
}

export const PORTFOLIO_LIVE_METRICS = {
  // ==========================================
  // 🟢 PRODUCTION METRICS (From CSV)
  // ==========================================
  
  activeProjects: {
    value: liveStats.projectCount, // Real count: 2
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Active Projects'
  } as DashboardMetric,

  totalTasks: {
    value: liveStats.taskCount, // Real count from CSV
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Total Tasks'
  } as DashboardMetric,

  completedTasks: {
    value: liveStats.completedTaskCount,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Completed Tasks'
  } as DashboardMetric,

  taskProgress: {
    value: `${liveStats.progressPercent}%`,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Task Completion Rate'
  } as DashboardMetric,

  checklistItems: {
    value: liveStats.checklistItemCount,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Total Checklist Items'
  } as DashboardMetric,

  checklistProgress: {
    value: `${liveStats.checklistProgressPercent}%`,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Checklist Completion'
  } as DashboardMetric,

  healthScore: {
    value: liveHealthScore,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Portfolio Health Score'
  } as DashboardMetric,

  bucketCount: {
    value: liveStats.bucketCount,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production' as const,
    },
    label: 'Total Buckets/Phases'
  } as DashboardMetric,

  // ==========================================
  // 🟠 MOCK METRICS (CSV Has No Financial Data)
  // ==========================================

  totalBudget: {
    value: 0,
    meta: {
      ...MOCK_DATA_META,
      source: 'mock' as const,
      lastUpdated: 'No budget data in CSV'
    },
    label: 'Total Budget'
  } as DashboardMetric,

  totalSpent: {
    value: 0,
    meta: {
      ...MOCK_DATA_META,
      source: 'mock' as const,
      lastUpdated: 'No budget data in CSV'
    },
    label: 'Total Spent'
  } as DashboardMetric,

  budgetVariance: {
    value: 0,
    meta: {
      ...MOCK_DATA_META,
      source: 'mock' as const,
      lastUpdated: 'No budget data in CSV'
    },
    label: 'Budget Variance'
  } as DashboardMetric,
};

// ==========================================
// 3. PROJECT LIST (Real Data from CSV)
// ==========================================

export interface LiveProjectCard {
  id: string;
  title: string;
  code: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  taskCount: number;
  completedTaskCount: number;
  bucketCount: number;
  checklistItemCount: number;
  ragStatus: 'Green' | 'Amber' | 'Red';
  meta: DataMeta;
}

export const LIVE_PROJECT_LIST: LiveProjectCard[] = liveProjects.map(project => {
  // Determine status based on progress
  let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
  if (project.progressPercent === 100) {
    status = 'Completed';
  } else if (project.progressPercent > 0) {
    status = 'In Progress';
  }

  // Determine RAG status based on progress
  let ragStatus: 'Green' | 'Amber' | 'Red' = 'Green';
  if (project.progressPercent < 50) {
    ragStatus = 'Red';
  } else if (project.progressPercent < 80) {
    ragStatus = 'Amber';
  }

  return {
    id: project.id,
    title: project.title,
    code: project.id.toUpperCase(),
    status: status,
    progress: project.progressPercent,
    taskCount: project.taskCount,
    completedTaskCount: project.completedTaskCount,
    bucketCount: project.bucketCount,
    checklistItemCount: project.checklistItemCount,
    ragStatus: ragStatus,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production',
    }
  };
});

// ==========================================
// 4. COMPLETE DASHBOARD VIEW (Hybrid)
// ==========================================

export const PORTFOLIO_LIVE_VIEW = {
  meta: {
    system_status: "Odoo 18 CE + OCA Compatible",
    data_source: "Hybrid (Production + Mock)",
    last_sync: new Date().toISOString(),
    csv_import_date: PLANNER_DATA_META.lastUpdated,
    csv_filename: PLANNER_DATA_META.filename,
  },

  portfolio: {
    id: "port_fin_mod_01",
    code: "FIN-MOD-2025",
    name: "Financial Systems Modernization",
    description: "Enterprise-wide financial systems upgrade and process automation initiative",
    owner: "CKVC",
    phase: "Execution",
    strategic_theme: "Digital Transformation",

    // 🟢 REAL STATISTICS (From CSV)
    stats: {
      project_count: PORTFOLIO_LIVE_METRICS.activeProjects.value,
      task_count: PORTFOLIO_LIVE_METRICS.totalTasks.value,
      completed_tasks: PORTFOLIO_LIVE_METRICS.completedTasks.value,
      bucket_count: PORTFOLIO_LIVE_METRICS.bucketCount.value,
      checklist_items: PORTFOLIO_LIVE_METRICS.checklistItems.value,
      completion_rate: liveStats.checklistProgressPercent,
    },

    // KPI Dashboard Card
    kpi: {
      status: liveHealthScore >= 80 ? 'On Track' : liveHealthScore >= 60 ? 'At Risk' : 'Critical',
      rag_color: liveHealthScore >= 80 ? 'Green' : liveHealthScore >= 60 ? 'Amber' : 'Red',
      health_score: liveHealthScore,
      trend: 'Stable', // TODO: Calculate based on historical data
    },

    // 🟠 MOCK FINANCIALS (CSV Has No Budget Data)
    financials: {
      total_budget: 0,
      total_spent: 0,
      budget_variance: 0,
      capex_split: 0,
      opex_split: 0,
      meta: {
        ...MOCK_DATA_META,
        source: 'mock',
        lastUpdated: 'No financial data in CSV - awaiting budget import'
      }
    },
  },

  // 🟢 REAL PROJECT LIST
  projects: LIVE_PROJECT_LIST,

  // Generate timestamp
  generated_at: new Date().toISOString(),
};

// ==========================================
// 5. SUMMARY CARD DATA (For Quick View)
// ==========================================

export const DASHBOARD_SUMMARY_CARDS = [
  {
    title: 'Active Projects',
    value: liveStats.projectCount,
    icon: 'Briefcase',
    color: 'blue',
    meta: PORTFOLIO_LIVE_METRICS.activeProjects.meta,
    subtext: `${liveStats.bucketCount} buckets total`
  },
  {
    title: 'Total Tasks',
    value: liveStats.taskCount,
    icon: 'CheckSquare',
    color: 'green',
    meta: PORTFOLIO_LIVE_METRICS.totalTasks.meta,
    subtext: `${liveStats.completedTaskCount} completed`
  },
  {
    title: 'Health Score',
    value: `${liveHealthScore}/100`,
    icon: 'Heart',
    color: liveHealthScore >= 80 ? 'green' : liveHealthScore >= 60 ? 'amber' : 'red',
    meta: PORTFOLIO_LIVE_METRICS.healthScore.meta,
    subtext: liveHealthScore >= 80 ? 'On Track' : liveHealthScore >= 60 ? 'At Risk' : 'Critical'
  },
  {
    title: 'Completion Rate',
    value: `${liveStats.checklistProgressPercent}%`,
    icon: 'TrendingUp',
    color: 'indigo',
    meta: PORTFOLIO_LIVE_METRICS.checklistProgress.meta,
    subtext: `${liveStats.completedChecklistCount}/${liveStats.checklistItemCount} items`
  },
];

// ==========================================
// 6. PROJECT DETAIL CARDS (With Real Data)
// ==========================================

export const DETAILED_PROJECT_CARDS = liveProjects.map(project => ({
  id: project.id,
  title: project.title,
  code: project.id.toUpperCase(),
  description: `${project.bucketCount} workstreams, ${project.taskCount} tasks`,
  
  // Progress metrics
  progress: {
    tasks: {
      completed: project.completedTaskCount,
      total: project.taskCount,
      percent: project.progressPercent
    },
    checklist: {
      completed: project.completedChecklistCount,
      total: project.checklistItemCount,
      percent: project.checklistItemCount === 0 ? 0 : Math.round((project.completedChecklistCount / project.checklistItemCount) * 100)
    }
  },

  // Status indicators
  status: project.progressPercent === 100 ? 'Completed' : project.progressPercent > 0 ? 'In Progress' : 'Not Started',
  ragStatus: project.progressPercent >= 80 ? 'Green' : project.progressPercent >= 50 ? 'Amber' : 'Red',

  // Metadata
  meta: {
    ...PLANNER_DATA_META,
    source: 'production' as const,
  }
}));

// ==========================================
// 7. EXPORT UTILITIES
// ==========================================

/**
 * Get a specific metric by key
 */
export function getLiveMetric(key: keyof typeof PORTFOLIO_LIVE_METRICS): DashboardMetric {
  return PORTFOLIO_LIVE_METRICS[key];
}

/**
 * Check if a metric is from production data
 */
export function isProductionMetric(metric: DashboardMetric): boolean {
  return metric.meta.source === 'production';
}

/**
 * Get all production metrics only
 */
export function getProductionMetrics(): Record<string, DashboardMetric> {
  return Object.fromEntries(
    Object.entries(PORTFOLIO_LIVE_METRICS)
      .filter(([_, metric]) => metric.meta.source === 'production')
  );
}

/**
 * Get all mock metrics only
 */
export function getMockMetrics(): Record<string, DashboardMetric> {
  return Object.fromEntries(
    Object.entries(PORTFOLIO_LIVE_METRICS)
      .filter(([_, metric]) => metric.meta.source === 'mock')
  );
}

// ==========================================
// 8. CONSOLE SUMMARY (For Debugging)
// ==========================================

export function printDashboardSummary(): void {
  console.log('='.repeat(70));
  console.log('📊 LIVE DASHBOARD SUMMARY - FINANCE CLARITY PPM');
  console.log('='.repeat(70));
  console.log(`Portfolio: ${PORTFOLIO_LIVE_VIEW.portfolio.name}`);
  console.log(`Data Source: Hybrid (Production CSV + Mock Financials)`);
  console.log(`CSV File: ${PLANNER_DATA_META.filename}`);
  console.log(`Last Updated: ${PLANNER_DATA_META.lastUpdated}`);
  console.log('-'.repeat(70));
  console.log('🟢 PRODUCTION METRICS (From CSV):');
  console.log(`  • Active Projects:    ${PORTFOLIO_LIVE_METRICS.activeProjects.value}`);
  console.log(`  • Total Tasks:        ${PORTFOLIO_LIVE_METRICS.totalTasks.value}`);
  console.log(`  • Completed Tasks:    ${PORTFOLIO_LIVE_METRICS.completedTasks.value}`);
  console.log(`  • Task Progress:      ${PORTFOLIO_LIVE_METRICS.taskProgress.value}`);
  console.log(`  • Checklist Items:    ${PORTFOLIO_LIVE_METRICS.checklistItems.value}`);
  console.log(`  • Checklist Progress: ${PORTFOLIO_LIVE_METRICS.checklistProgress.value}`);
  console.log(`  • Health Score:       ${PORTFOLIO_LIVE_METRICS.healthScore.value}/100`);
  console.log('-'.repeat(70));
  console.log('🟠 MOCK METRICS (No Financial Data in CSV):');
  console.log(`  • Total Budget:       ₱${PORTFOLIO_LIVE_METRICS.totalBudget.value.toLocaleString()}`);
  console.log(`  • Note: ${PORTFOLIO_LIVE_METRICS.totalBudget.meta.lastUpdated}`);
  console.log('-'.repeat(70));
  console.log('📋 PROJECTS:');
  LIVE_PROJECT_LIST.forEach((project, index) => {
    console.log(`  ${index + 1}. ${project.title}`);
    console.log(`     Status: ${project.status} | Progress: ${project.progress}% | RAG: ${project.ragStatus}`);
    console.log(`     Tasks: ${project.completedTaskCount}/${project.taskCount} | Buckets: ${project.bucketCount}`);
  });
  console.log('='.repeat(70));
}

// Auto-print summary in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // printDashboardSummary(); // Uncomment to see summary in console
}
