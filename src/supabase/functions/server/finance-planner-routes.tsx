import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Finance Planner Data Structure
interface FinancePlannerChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
}

interface FinancePlannerTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  start_date: string;
  labels: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_to: string[];
  checklist: FinancePlannerChecklistItem[];
  progress: number;
  attachments?: number;
  comments?: number;
}

interface FinancePlannerBucket {
  bucket_id: string;
  bucket_name: string;
  color: string;
  tasks: FinancePlannerTask[];
}

interface FinancePlannerPlan {
  plan_id: string;
  plan_title: string;
  plan_icon: string;
  plan_color: string;
  description: string;
  is_pinned: boolean;
  category: 'Finance' | 'HR' | 'Compliance';
  buckets: FinancePlannerBucket[];
  created_at: string;
  owner: string;
}

// Initialize Finance Planner data in KV store
app.post("/import", async (c) => {
  try {
    const { plans } = await c.req.json();
    
    if (!plans || !Array.isArray(plans)) {
      return c.json({ error: "Invalid data format. Expected { plans: [...] }" }, 400);
    }

    // Store each plan with a unique key
    const importResults = [];
    for (const plan of plans) {
      const key = `finance_planner:plan:${plan.plan_id}`;
      await kv.set(key, plan);
      importResults.push({ plan_id: plan.plan_id, status: 'imported' });
    }

    // Store metadata about the import
    await kv.set('finance_planner:meta:last_import', {
      timestamp: new Date().toISOString(),
      plan_count: plans.length,
      task_count: plans.reduce((sum: number, p: FinancePlannerPlan) => 
        sum + p.buckets.reduce((bSum, b) => bSum + b.tasks.length, 0), 0
      )
    });

    return c.json({ 
      success: true, 
      message: `Imported ${plans.length} plans successfully`,
      results: importResults 
    });
  } catch (error) {
    console.error("Error importing Finance Planner data:", error);
    return c.json({ error: "Failed to import data", details: error.message }, 500);
  }
});

// Get all plans
app.get("/plans", async (c) => {
  try {
    const planKeys = await kv.getByPrefix('finance_planner:plan:');
    return c.json({ plans: planKeys, count: planKeys.length });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return c.json({ error: "Failed to fetch plans", details: error.message }, 500);
  }
});

// Get a specific plan
app.get("/plans/:planId", async (c) => {
  try {
    const planId = c.req.param('planId');
    const plan = await kv.get(`finance_planner:plan:${planId}`);
    
    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }
    
    return c.json({ plan });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return c.json({ error: "Failed to fetch plan", details: error.message }, 500);
  }
});

// Update a task within a plan
app.put("/plans/:planId/buckets/:bucketId/tasks/:taskId", async (c) => {
  try {
    const planId = c.req.param('planId');
    const bucketId = c.req.param('bucketId');
    const taskId = c.req.param('taskId');
    const updates = await c.req.json();
    
    // Get the plan
    const plan = await kv.get(`finance_planner:plan:${planId}`);
    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }
    
    // Find and update the task
    let taskFound = false;
    for (const bucket of plan.buckets) {
      if (bucket.bucket_id === bucketId) {
        const taskIndex = bucket.tasks.findIndex((t: FinancePlannerTask) => t.id === taskId);
        if (taskIndex !== -1) {
          bucket.tasks[taskIndex] = { ...bucket.tasks[taskIndex], ...updates };
          taskFound = true;
          break;
        }
      }
    }
    
    if (!taskFound) {
      return c.json({ error: "Task not found" }, 404);
    }
    
    // Save the updated plan
    await kv.set(`finance_planner:plan:${planId}`, plan);
    
    return c.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json({ error: "Failed to update task", details: error.message }, 500);
  }
});

// Toggle checklist item
app.put("/plans/:planId/buckets/:bucketId/tasks/:taskId/checklist/:checklistId", async (c) => {
  try {
    const planId = c.req.param('planId');
    const bucketId = c.req.param('bucketId');
    const taskId = c.req.param('taskId');
    const checklistId = c.req.param('checklistId');
    
    // Get the plan
    const plan = await kv.get(`finance_planner:plan:${planId}`);
    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }
    
    // Find and toggle the checklist item
    let itemFound = false;
    for (const bucket of plan.buckets) {
      if (bucket.bucket_id === bucketId) {
        const task = bucket.tasks.find((t: FinancePlannerTask) => t.id === taskId);
        if (task && task.checklist) {
          const itemIndex = task.checklist.findIndex((item: FinancePlannerChecklistItem) => item.id === checklistId);
          if (itemIndex !== -1) {
            task.checklist[itemIndex].is_checked = !task.checklist[itemIndex].is_checked;
            
            // Recalculate progress
            const checkedItems = task.checklist.filter((item: FinancePlannerChecklistItem) => item.is_checked).length;
            task.progress = Math.round((checkedItems / task.checklist.length) * 100);
            
            itemFound = true;
            break;
          }
        }
      }
    }
    
    if (!itemFound) {
      return c.json({ error: "Checklist item not found" }, 404);
    }
    
    // Save the updated plan
    await kv.set(`finance_planner:plan:${planId}`, plan);
    
    return c.json({ success: true, message: "Checklist item toggled successfully" });
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    return c.json({ error: "Failed to toggle checklist item", details: error.message }, 500);
  }
});

// Get import metadata
app.get("/meta", async (c) => {
  try {
    const meta = await kv.get('finance_planner:meta:last_import');
    return c.json({ meta: meta || { message: "No imports yet" } });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return c.json({ error: "Failed to fetch metadata", details: error.message }, 500);
  }
});

// Delete all Finance Planner data (for testing/reset)
app.delete("/reset", async (c) => {
  try {
    const planKeys = await kv.getByPrefix('finance_planner:');
    const deletePromises = planKeys.map((item) => kv.del(item.key));
    await Promise.all(deletePromises);
    
    return c.json({ 
      success: true, 
      message: `Deleted ${planKeys.length} records` 
    });
  } catch (error) {
    console.error("Error resetting Finance Planner data:", error);
    return c.json({ error: "Failed to reset data", details: error.message }, 500);
  }
});

// Get statistics
app.get("/stats", async (c) => {
  try {
    const plans = await kv.getByPrefix('finance_planner:plan:');
    
    let totalTasks = 0;
    let completedTasks = 0;
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    
    for (const planItem of plans) {
      const plan = planItem.value as FinancePlannerPlan;
      for (const bucket of plan.buckets) {
        totalTasks += bucket.tasks.length;
        for (const task of bucket.tasks) {
          if (task.progress === 100) completedTasks++;
          if (task.checklist) {
            totalChecklistItems += task.checklist.length;
            completedChecklistItems += task.checklist.filter(item => item.is_checked).length;
          }
        }
      }
    }
    
    return c.json({
      total_plans: plans.length,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      total_checklist_items: totalChecklistItems,
      completed_checklist_items: completedChecklistItems,
      overall_completion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch (error) {
    console.error("Error calculating stats:", error);
    return c.json({ error: "Failed to calculate stats", details: error.message }, 500);
  }
});

export default app;
