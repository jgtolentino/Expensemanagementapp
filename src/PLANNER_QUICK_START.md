# Planner Views - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Import the Main Component

```tsx
import { PlannerView } from './components/planner/PlannerView';

function App() {
  return <PlannerView />;
}
```

**That's it!** The Planner view is now active with both Board and Grid modes.

---

## 📊 What You Get

### **2 Projects (Auto-loaded from CSV)**
1. **Tax Filing Project** (3 buckets, 3 tasks, 15 checklist items)
2. **Month-End Closing Task** (3 buckets, 3 tasks, 9 checklist items)

### **2 View Modes**
1. **Board View** (Kanban with horizontal scrolling)
2. **Grid View** (Table with grouping and sorting)

### **1 Detail Modal**
- Interactive checklist (click to toggle items)
- Real-time progress tracking
- Full task metadata

---

## 🎯 Key Interactions

| Action | Result |
|--------|--------|
| Click project tab | Switch between Tax Filing and Closing |
| Click Board/Grid button | Toggle view mode |
| Click task card (Board) | Open task detail modal |
| Click task row (Grid) | Open task detail modal |
| Click checklist item (Modal) | Toggle completion, update progress |
| Click bucket header (Grid) | Collapse/expand group |
| Check checkbox (Grid) | Select task for bulk action |

---

## 📁 Component Structure

```
/components/planner/
├── PlannerView.tsx          ← Main container (import this)
├── BoardView.tsx            ← Kanban board
├── GridView.tsx             ← List/table view
└── TaskDetailModal.tsx      ← Task details

/lib/data/
└── planner-projects.ts      ← Data source (CSV imports)
```

---

## 🎨 Customization

### Change Colors

```tsx
// In BoardView.tsx or GridView.tsx

// Priority border colors
border-red-600     → border-purple-600    (critical)
border-orange-500  → border-pink-500      (high)

// Status colors
bg-green-600       → bg-emerald-600       (completed)
bg-blue-600        → bg-indigo-600        (in progress)
```

### Add More Projects

```typescript
// In planner-projects.ts

export const newProject: PlannerProject = {
  plan_title: "Q4 Planning",
  buckets: [
    {
      bucket_name: "Budget Review",
      tasks: [...]
    }
  ]
};

// Add to exports
export const PLANNER_RAW_DATA = [
  taxFilingProject, 
  closingTaskProject,
  newProject  // ← Add here
];
```

---

## ✅ Validation Checklist

Before going live, verify:

- [ ] See 2 project tabs (Tax Filing, Closing)
- [ ] Board view shows bucket columns
- [ ] Grid view shows table with groups
- [ ] Clicking task opens detail modal
- [ ] Checklist items toggle when clicked
- [ ] Progress bar updates in real-time
- [ ] Production badges visible (🟢 LIVE DATA)
- [ ] Dates match CSV (Apr 15, 2026 for Tax Filing)

---

## 🐛 Troubleshooting

### Issue: "PLANNER_RAW_DATA is not defined"
**Fix:** Make sure you have this export in `planner-projects.ts`:
```typescript
export const PLANNER_RAW_DATA = allPlannerProjects;
```

### Issue: "Cannot read property 'buckets' of undefined"
**Fix:** Check that your project has the `buckets` array:
```typescript
export const myProject: PlannerProject = {
  plan_title: "My Project",
  buckets: []  // ← Must be array, not undefined
};
```

### Issue: Task cards not showing
**Fix:** Verify tasks have all required fields:
```typescript
{
  id: "TASK-001",           // ← Required
  title: "Task Name",       // ← Required
  due_date: "2026-12-31",   // ← Required
  start_date: "2026-01-01", // ← Required
  labels: [],               // ← Required (can be empty)
  assigned_to: [],          // ← Required (can be empty)
  checklist: []             // ← Required (can be empty)
}
```

---

## 📖 Full Documentation

- **Implementation Guide:** `/docs/PLANNER_VIEWS_GUIDE.md` (600 lines)
- **Complete Summary:** `/PLANNER_VIEWS_SUMMARY.md` (400 lines)
- **This Quick Start:** `/PLANNER_QUICK_START.md`

---

## 🎉 You're Ready!

```tsx
import { PlannerView } from './components/planner/PlannerView';

<PlannerView />
```

**Done!** Your Microsoft Planner-style views are now live. 🚀
