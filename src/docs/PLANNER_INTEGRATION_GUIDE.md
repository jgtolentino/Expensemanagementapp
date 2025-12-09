# 📋 Microsoft Planner Integration Guide

## Overview

This guide explains how the Microsoft Planner data model (Buckets → Tasks → Checklists) has been integrated into the TBWA Databank **Tasks & Kanban Board** system.

---

## 🎯 Planner Data Model

Microsoft Planner uses a three-tier hierarchy:

1. **Buckets** (Columns/Phases) - Group related tasks
2. **Task Cards** - Main deliverables with metadata
3. **Checklists** - Granular steps inside each task

This structure prevents UI clutter by keeping detailed steps inside task cards rather than creating hundreds of tiny tasks.

---

## 🏗️ Architecture

### File Structure

```
/lib/data/
  ├── planner-projects.ts        # Planner JSON → TaskEnhanced converter
  └── tasks-enhanced.ts           # Main task data model (updated)

/FinancePPMApp.tsx                # Tasks view (uses allTasksEnhanced)
/components/KanbanBoardImproved.tsx # Kanban UI component
/components/TaskDetailView.tsx     # Task detail modal
```

### Data Flow

```
Planner JSON (Raw)
    ↓
convertPlannerToTaskEnhanced()
    ↓
TaskEnhanced objects
    ↓
Combined with existing tasks
    ↓
Displayed in Kanban Board
```

---

## 📊 Current Projects

### 1. Tax Filing Project 2026

**Timeline:** January 15, 2026 - April 15, 2026 (90 days)  
**Status:** Not Started  
**Priority:** Critical

**Buckets:**
- **Preparation** - Document gathering (Jan 15 - Feb 28)
- **Review** - Draft review and verification (Mar 10 - Mar 20)
- **Filing** - Final submission (Apr 1 - Apr 15)

**Key Tasks:**
- Gather Documents (5 checklist items)
- Review Draft (5 checklist items)
- File Taxes (5 checklist items)

**Assigned To:**
- Accountant (Preparation)
- Senior Accountant (Review)
- Tax Specialist (Filing)

---

### 2. Month-End Closing Tasks

**Timeline:** December 26, 2025 - January 5, 2026 (10 days)  
**Status:** Not Started  
**Priority:** High

**Buckets:**
- **Preparation** - Close checklist setup
- **Execution** - Financial close process
- **Review & Approval** - Final sign-off

**Key Tasks:**
- Prepare Closing Checklist (3 items)
- Execute Month-End Close (3 items)
- Final Review and Sign-Off (3 items)

**Assigned To:**
- Finance Manager
- Accounting Team
- CFO

---

## 🔄 Data Transformation

### Planner JSON Format

```json
{
  "plan_title": "Tax Filing Project",
  "buckets": [
    {
      "bucket_name": "Preparation",
      "tasks": [
        {
          "title": "Gather Documents",
          "due_date": "2/28/2026",
          "start_date": "1/15/2026",
          "labels": ["Tax", "Documentation"],
          "assigned_to": ["Accountant"],
          "checklist": [
            {
              "content": "Collect W-2 forms",
              "is_checked": false
            }
          ],
          "priority": "high"
        }
      ]
    }
  ]
}
```

### TaskEnhanced Mapping

| Planner Field | TaskEnhanced Field | Notes |
|---------------|-------------------|-------|
| `plan_title` | Phase `name` | Creates a parent phase |
| `bucket_name` | Task `tags[]` | Added as tag for grouping |
| `title` | Task `name` | Main task name |
| `due_date` | Task `endDate` | ISO date format |
| `start_date` | Task `startDate` | ISO date format |
| `labels` | Task `tags[]` | Array of tags |
| `assigned_to` | Task `owner`, `assignee` | Primary assignee |
| `checklist[]` | Task `subtasks[]` | Each becomes a subtask |
| `checklist[].content` | Subtask `name` & `checklist[0].text` | Duplicated for compatibility |
| `checklist[].is_checked` | Subtask `status`, `progress` | completed/not_started |

---

## 📝 Adding New Planner Projects

### Step 1: Create Planner JSON

Add to `/lib/data/planner-projects.ts`:

```typescript
export const myNewProject: PlannerProject = {
  plan_title: "My New Project",
  buckets: [
    {
      bucket_name: "Phase 1",
      tasks: [
        {
          title: "Task 1",
          due_date: "2026-06-30",
          start_date: "2026-06-01",
          labels: ["Label1", "Label2"],
          assigned_to: ["Owner Name"],
          checklist: [
            {
              content: "Step 1",
              is_checked: false
            },
            {
              content: "Step 2",
              is_checked: false
            }
          ],
          description: "Task description here",
          priority: "high"
        }
      ]
    }
  ]
};
```

### Step 2: Convert to TaskEnhanced

```typescript
// In planner-projects.ts
export const myNewProjectTasks = convertPlannerToTaskEnhanced(
  myNewProject, 
  'PROJ' // Project code prefix
);
```

### Step 3: Create Phase Object

```typescript
// In tasks-enhanced.ts
export const myNewPhase: TaskEnhanced = {
  id: 'PHASE-PROJ',
  code: 'PROJ',
  name: 'My New Project',
  description: 'Project description',
  type: 'phase',
  status: 'not_started',
  priority: 'high',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  progress: 0,
  duration: 29,
  owner: 'Project Manager',
  raci: {
    responsible: ['Team Member'],
    accountable: ['Project Manager'],
    consulted: [],
    informed: [],
  },
  comments: [],
  tags: ['Project', 'New'],
  createdBy: 'System',
  createdAt: new Date().toISOString(),
  children: myNewProjectTasks as any[],
};
```

### Step 4: Add to Combined Tasks

```typescript
// In tasks-enhanced.ts
export const allTasksEnhanced: TaskEnhanced[] = [
  ...sampleTasksEnhanced,
  taxFilingPhase,
  closingPhase,
  myNewPhase, // Add your new phase here
];
```

---

## 🎨 UI Features

### Kanban Board View

The integrated projects appear as **Phase cards** in the Kanban Board with:

- ✅ Phase name as the main card title
- ✅ Date range display
- ✅ Priority badge
- ✅ Progress indicator
- ✅ Expand/collapse to view child tasks
- ✅ Click to view task details

### Task Detail View

Clicking a task opens a modal showing:

- **Checklist Items** - All granular steps
- **Progress** - Auto-calculated from checklist
- **Assignments** - Owner and assignees
- **Dates** - Start, end, and actuals
- **Tags** - Including bucket name
- **Comments** - @mentions supported
- **Subtasks** - Full hierarchy

### Bucket Grouping

Tasks can be grouped by bucket using the `tags` array:

```typescript
// Filter tasks by bucket
const preparationTasks = allTasks.filter(task => 
  task.tags?.includes('Preparation')
);
```

---

## 🔍 Helper Functions

### Get All Tasks from Projects

```typescript
import { getAllTasks, allTasksEnhanced } from './lib/data/tasks-enhanced';

const flatTaskList = getAllTasks(allTasksEnhanced);
console.log(`Total tasks: ${flatTaskList.length}`);
```

### Filter by Status

```typescript
import { getTasksByStatus } from './lib/data/tasks-enhanced';

const notStartedTasks = getTasksByStatus(allTasksEnhanced, 'not_started');
const inProgressTasks = getTasksByStatus(allTasksEnhanced, 'in_progress');
const completedTasks = getTasksByStatus(allTasksEnhanced, 'completed');
```

### Filter by Assignee

```typescript
import { getTasksByAssignee } from './lib/data/tasks-enhanced';

const myTasks = getTasksByAssignee(allTasksEnhanced, 'Accountant');
```

### Get Overdue Tasks

```typescript
import { getOverdueTasks } from './lib/data/tasks-enhanced';

const overdue = getOverdueTasks(allTasksEnhanced);
```

### Get Due Soon Tasks

```typescript
import { getDueSoonTasks } from './lib/data/tasks-enhanced';

const dueSoon = getDueSoonTasks(allTasksEnhanced, 7); // Next 7 days
```

---

## 🚀 Usage in Components

### Kanban Board

```tsx
import { allTasksEnhanced } from './lib/data/tasks-enhanced';
import KanbanBoardImproved from './components/KanbanBoardImproved';

<KanbanBoardImproved
  tasks={allTasksEnhanced}
  onTaskClick={(task) => console.log(task)}
  onStatusChange={(taskId, newStatus) => {
    // Handle status change
  }}
/>
```

### Task Detail Modal

```tsx
import TaskDetailView from './components/TaskDetailView';

const [selectedTask, setSelectedTask] = useState<TaskEnhanced | null>(null);

<TaskDetailView
  task={selectedTask}
  isOpen={!!selectedTask}
  onClose={() => setSelectedTask(null)}
  onUpdate={(updatedTask) => {
    // Handle task update
  }}
/>
```

---

## 📋 Checklist & Comments Integration

### Checklists

Each task's checklist items are stored in `subtasks[].checklist[]`:

```typescript
task.subtasks?.forEach(subtask => {
  console.log(`Subtask: ${subtask.name}`);
  subtask.checklist.forEach(item => {
    console.log(`  - [${item.completed ? 'x' : ' '}] ${item.text}`);
  });
});
```

### Comments with @Mentions

Comments support @mentions for team collaboration:

```typescript
const newComment: Comment = {
  id: 'COM-NEW',
  author: 'CurrentUser',
  text: 'Need input from @TeamMember on this checklist item',
  mentions: ['TeamMember'],
  createdAt: new Date().toISOString(),
};

task.comments.push(newComment);
```

---

## 🔄 Migration from CSV

If you have WBS data in CSV format, you can convert it to Planner JSON using this mapping:

| CSV Column | Planner Field |
|------------|---------------|
| Phase / WBS Level 1 | `bucket_name` |
| Task Name / Activity | `title` |
| Start Date | `start_date` |
| End Date / Due Date | `due_date` |
| Assigned To / Owner | `assigned_to[]` |
| Sub-task / Child | `checklist[].content` |
| Department / Category | `labels[]` |
| Priority | `priority` |

**Example Python Script:**

```python
import csv
import json

planner_data = {
    "plan_title": "Project Name",
    "buckets": []
}

with open('wbs.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Group by phase/bucket
        bucket = next((b for b in planner_data["buckets"] 
                      if b["bucket_name"] == row["Phase"]), None)
        
        if not bucket:
            bucket = {"bucket_name": row["Phase"], "tasks": []}
            planner_data["buckets"].append(bucket)
        
        # Add task
        bucket["tasks"].append({
            "title": row["Task Name"],
            "due_date": row["Due Date"],
            "start_date": row["Start Date"],
            "labels": [row["Department"]],
            "assigned_to": [row["Assigned To"]],
            "checklist": [
                {"content": row["Sub-task"], "is_checked": False}
            ],
            "priority": row.get("Priority", "medium").lower()
        })

print(json.dumps(planner_data, indent=2))
```

---

## ✅ Best Practices

### 1. Bucket Naming
- Use clear, phase-based names: "Preparation", "Execution", "Review"
- Keep bucket count manageable (3-7 buckets per project)
- Use consistent naming across projects

### 2. Task Granularity
- **Task Cards** = Main deliverables (1-2 weeks duration)
- **Checklist Items** = Granular steps (hours to days)
- Avoid creating tasks for every small step

### 3. Checklist Design
- Keep 3-10 items per task (anything more should be split)
- Make items actionable and specific
- Use consistent verb-noun format: "Review report", "Submit form"

### 4. Assignment Strategy
- Assign tasks to individuals, not teams
- Use RACI for clarity (Responsible, Accountable, Consulted, Informed)
- @Mention specific people in comments for actions

### 5. Status Management
- `not_started` → Task not begun
- `in_progress` → At least one checklist item completed
- `completed` → All checklist items checked
- `at_risk` → Behind schedule or blocked
- `blocked` → Cannot proceed (dependency issue)

---

## 🎯 Next Steps

### Short Term
- [ ] Add ability to create new tasks via UI
- [ ] Implement drag-and-drop bucket sorting
- [ ] Add task templates for common workflows
- [ ] Export tasks to PDF/Excel

### Medium Term
- [ ] Real-time collaboration (WebSockets)
- [ ] File attachments on tasks
- [ ] Recurring task templates
- [ ] Gantt chart view

### Long Term
- [ ] Integration with Microsoft Planner API (import/export)
- [ ] AI-powered task suggestions
- [ ] Automatic time tracking
- [ ] Resource capacity planning

---

## 📞 Support

For questions or issues with Planner integration:

1. Check this guide
2. Review `/lib/data/planner-projects.ts` for examples
3. Inspect existing task structures in `/lib/data/tasks-enhanced.ts`
4. Contact the development team

---

**The Planner integration is now live in your Tasks & Kanban Board!** 🎉

All new Planner-style projects will automatically appear alongside your existing tasks, with full support for buckets, checklists, and @mentions.
