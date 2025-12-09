// /lib/data/planner-stats.ts
// Live Statistics Calculator for Production CSV Data
// Bridges PLANNER_RAW_DATA into Dashboard Metrics

import { PLANNER_RAW_DATA, PLANNER_DATA_META } from './planner-projects';
import { DataMeta } from './ppm-data-model';

// ==========================================
// 1. REAL-TIME PORTFOLIO STATISTICS
// ==========================================

export interface LivePortfolioStats {
  projectCount: number;
  taskCount: number;
  completedTaskCount: number;
  progressPercent: number;
  checklistItemCount: number;
  completedChecklistCount: number;
  checklistProgressPercent: number;
  bucketCount: number;
  averageTasksPerProject: number;
  meta: DataMeta;
}

/**
 * Calculate real statistics from CSV-imported Planner data
 * @returns Live statistics tagged as 'production'
 */
export function getPortfolioRealStats(): LivePortfolioStats {
  // 1. Count Total Projects
  const totalProjects = PLANNER_RAW_DATA.length; // Current: 2 (Tax Filing, Month-End Closing)

  // 2. Count Total Tasks and Buckets
  let totalTasks = 0;
  let completedTasks = 0;
  let totalBuckets = 0;
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;

  PLANNER_RAW_DATA.forEach(plan => {
    totalBuckets += plan.buckets.length;

    plan.buckets.forEach(bucket => {
      totalTasks += bucket.tasks.length;

      bucket.tasks.forEach(task => {
        const totalChecks = task.checklist.length;
        const checkedCount = task.checklist.filter(c => c.is_checked).length;

        totalChecklistItems += totalChecks;
        completedChecklistItems += checkedCount;

        // Task is "complete" if ALL checklist items are checked
        if (totalChecks > 0 && totalChecks === checkedCount) {
          completedTasks++;
        }
      });
    });
  });

  // 3. Calculate Percentages
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const checklistProgressPercent = totalChecklistItems === 0 ? 0 : Math.round((completedChecklistItems / totalChecklistItems) * 100);
  const avgTasksPerProject = totalProjects === 0 ? 0 : Math.round(totalTasks / totalProjects);

  return {
    projectCount: totalProjects,
    taskCount: totalTasks,
    completedTaskCount: completedTasks,
    progressPercent: progressPercent,
    checklistItemCount: totalChecklistItems,
    completedChecklistCount: completedChecklistItems,
    checklistProgressPercent: checklistProgressPercent,
    bucketCount: totalBuckets,
    averageTasksPerProject: avgTasksPerProject,
    meta: {
      ...PLANNER_DATA_META,
      source: 'production', // ✅ This is REAL data from CSV
    }
  };
}

// ==========================================
// 2. PROJECT-LEVEL BREAKDOWN
// ==========================================

export interface LiveProjectSummary {
  id: string;
  title: string;
  bucketCount: number;
  taskCount: number;
  completedTaskCount: number;
  progressPercent: number;
  checklistItemCount: number;
  completedChecklistCount: number;
  meta: DataMeta;
}

/**
 * Get detailed breakdown for each project
 * @returns Array of project summaries with real stats
 */
export function getProjectBreakdown(): LiveProjectSummary[] {
  return PLANNER_RAW_DATA.map(plan => {
    let taskCount = 0;
    let completedTaskCount = 0;
    let checklistItemCount = 0;
    let completedChecklistCount = 0;

    plan.buckets.forEach(bucket => {
      taskCount += bucket.tasks.length;

      bucket.tasks.forEach(task => {
        const totalChecks = task.checklist.length;
        const checkedCount = task.checklist.filter(c => c.is_checked).length;

        checklistItemCount += totalChecks;
        completedChecklistCount += checkedCount;

        // Task is complete if all checklist items are checked
        if (totalChecks > 0 && totalChecks === checkedCount) {
          completedTaskCount++;
        }
      });
    });

    const progressPercent = taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);

    return {
      id: plan.plan_id,
      title: plan.plan_title,
      bucketCount: plan.buckets.length,
      taskCount: taskCount,
      completedTaskCount: completedTaskCount,
      progressPercent: progressPercent,
      checklistItemCount: checklistItemCount,
      completedChecklistCount: completedChecklistCount,
      meta: {
        ...PLANNER_DATA_META,
        source: 'production',
      }
    };
  });
}

// ==========================================
// 3. BUCKET-LEVEL STATISTICS
// ==========================================

export interface LiveBucketStats {
  projectId: string;
  projectTitle: string;
  bucketName: string;
  taskCount: number;
  completedTaskCount: number;
  checklistItemCount: number;
  completedChecklistCount: number;
  progressPercent: number;
}

/**
 * Get statistics for each bucket across all projects
 * @returns Detailed bucket-level breakdown
 */
export function getBucketStats(): LiveBucketStats[] {
  const bucketStats: LiveBucketStats[] = [];

  PLANNER_RAW_DATA.forEach(plan => {
    plan.buckets.forEach(bucket => {
      let checklistItemCount = 0;
      let completedChecklistCount = 0;
      let completedTaskCount = 0;

      bucket.tasks.forEach(task => {
        const totalChecks = task.checklist.length;
        const checkedCount = task.checklist.filter(c => c.is_checked).length;

        checklistItemCount += totalChecks;
        completedChecklistCount += checkedCount;

        if (totalChecks > 0 && totalChecks === checkedCount) {
          completedTaskCount++;
        }
      });

      const progressPercent = bucket.tasks.length === 0 ? 0 : Math.round((completedTaskCount / bucket.tasks.length) * 100);

      bucketStats.push({
        projectId: plan.plan_id,
        projectTitle: plan.plan_title,
        bucketName: bucket.bucket_name,
        taskCount: bucket.tasks.length,
        completedTaskCount: completedTaskCount,
        checklistItemCount: checklistItemCount,
        completedChecklistCount: completedChecklistCount,
        progressPercent: progressPercent,
      });
    });
  });

  return bucketStats;
}

// ==========================================
// 4. TASK-LEVEL DETAILS (For Grid View)
// ==========================================

export interface LiveTaskDetail {
  projectId: string;
  projectTitle: string;
  bucketName: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  startDate: string;
  assignees: string[];
  labels: string[];
  checklistItemCount: number;
  completedChecklistCount: number;
  progressPercent: number;
  isComplete: boolean;
}

/**
 * Get detailed task-level data for grid views and reports
 * @returns Flattened task list with all metadata
 */
export function getTaskDetails(): LiveTaskDetail[] {
  const taskDetails: LiveTaskDetail[] = [];

  PLANNER_RAW_DATA.forEach(plan => {
    plan.buckets.forEach(bucket => {
      bucket.tasks.forEach(task => {
        const totalChecks = task.checklist.length;
        const checkedCount = task.checklist.filter(c => c.is_checked).length;
        const progressPercent = totalChecks === 0 ? 0 : Math.round((checkedCount / totalChecks) * 100);
        const isComplete = totalChecks > 0 && totalChecks === checkedCount;

        taskDetails.push({
          projectId: plan.plan_id,
          projectTitle: plan.plan_title,
          bucketName: bucket.bucket_name,
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.due_date,
          startDate: task.start_date,
          assignees: task.assigned_to,
          labels: task.labels,
          checklistItemCount: totalChecks,
          completedChecklistCount: checkedCount,
          progressPercent: progressPercent,
          isComplete: isComplete,
        });
      });
    });
  });

  return taskDetails;
}

// ==========================================
// 5. HEALTH SCORE CALCULATION
// ==========================================

/**
 * Calculate overall health score based on completion and overdue tasks
 * @returns Health score (0-100)
 */
export function calculateHealthScore(): number {
  const stats = getPortfolioRealStats();
  const today = new Date().toISOString().split('T')[0];
  
  // Base score from completion rate
  let healthScore = stats.checklistProgressPercent;
  
  // Penalize for overdue tasks
  const taskDetails = getTaskDetails();
  const overdueTasks = taskDetails.filter(task => task.dueDate < today && !task.isComplete);
  const overdueRatio = taskDetails.length === 0 ? 0 : (overdueTasks.length / taskDetails.length);
  
  // Reduce health score by up to 30 points for overdue tasks
  healthScore -= Math.round(overdueRatio * 30);
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, healthScore));
}

// ==========================================
// 6. EXPORT CURRENT STATS (Auto-calculated)
// ==========================================

// Export live stats for immediate use
export const LIVE_PORTFOLIO_STATS = getPortfolioRealStats();
export const LIVE_PROJECT_BREAKDOWN = getProjectBreakdown();
export const LIVE_BUCKET_STATS = getBucketStats();
export const LIVE_TASK_DETAILS = getTaskDetails();
export const LIVE_HEALTH_SCORE = calculateHealthScore();

// ==========================================
// 7. SUMMARY REPORT (For Console/Debugging)
// ==========================================

export function printPortfolioSummary(): void {
  console.log('='.repeat(60));
  console.log('📊 FINANCE CLARITY PPM - LIVE PRODUCTION STATISTICS');
  console.log('='.repeat(60));
  console.log(`Source: ${PLANNER_DATA_META.filename}`);
  console.log(`Last Updated: ${PLANNER_DATA_META.lastUpdated}`);
  console.log(`Data Source: 🟢 PRODUCTION`);
  console.log('-'.repeat(60));
  
  const stats = getPortfolioRealStats();
  console.log(`Total Projects:       ${stats.projectCount}`);
  console.log(`Total Buckets:        ${stats.bucketCount}`);
  console.log(`Total Tasks:          ${stats.taskCount}`);
  console.log(`Completed Tasks:      ${stats.completedTaskCount}`);
  console.log(`Task Progress:        ${stats.progressPercent}%`);
  console.log(`Total Checklist Items:${stats.checklistItemCount}`);
  console.log(`Completed Items:      ${stats.completedChecklistCount}`);
  console.log(`Checklist Progress:   ${stats.checklistProgressPercent}%`);
  console.log(`Health Score:         ${calculateHealthScore()}/100`);
  console.log('-'.repeat(60));
  
  const projects = getProjectBreakdown();
  console.log('Projects:');
  projects.forEach(project => {
    console.log(`  • ${project.title}`);
    console.log(`    Tasks: ${project.completedTaskCount}/${project.taskCount} (${project.progressPercent}%)`);
    console.log(`    Buckets: ${project.bucketCount}`);
  });
  
  console.log('='.repeat(60));
}
