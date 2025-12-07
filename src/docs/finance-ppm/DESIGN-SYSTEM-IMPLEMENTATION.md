# Deakin Enterprise 365 Design System - Implementation Guide

**Complete guide to using the Deakin/Fluent theme in Finance PPM**

---

## 📦 Files Delivered

### 1. Core Theme Files

| File | Location | Purpose |
|------|----------|---------|
| **CSS Theme** | `/styles/deakin-fluent-theme.css` | Complete design system with tokens + components |
| **Tailwind Config** | `/tailwind.config.ts` | Tailwind theme mapped to Deakin tokens |
| **Chart Theme** | `/lib/deakinChartTheme.ts` | Recharts configuration for data viz |

### 2. Odoo Integration

| File | Location | Purpose |
|------|----------|---------|
| **Manifest** | `/odoo/addons/ipai_finance_ppm/__manifest__.py` | Module definition + asset loading |
| **Views** | `/odoo/addons/ipai_finance_ppm/views/project_task_views.xml` | Themed tree/kanban views |
| **CSS (Odoo)** | `/odoo/addons/ipai_finance_ppm/static/src/css/deakin_fluent_theme.css` | Theme for Odoo backend |

---

## 🚀 Quick Start

### Option A: React/TypeScript App (Recommended for Finance PPM)

**1. Import the CSS**

```typescript
// In your main.tsx or App.tsx
import '/styles/deakin-fluent-theme.css'
```

**2. Use Tailwind classes**

```tsx
// KPI Dashboard
export function FinancePPMDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* KPI Card */}
      <div className="rounded-lg bg-white shadow-level-1 border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Total Tasks
        </div>
        <div className="mt-1 text-2xl font-bold text-gray-950">36</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-semantic-successSoft text-semantic-success px-2 py-0.5 text-[11px]">
          <span>▲</span>
          <span>+8% vs last month</span>
        </div>
      </div>
      
      {/* More KPI cards... */}
    </div>
  );
}
```

**3. Use Recharts with theme**

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DEAKIN_CHART_THEME,
  applyDeakinAxisProps,
  applyDeakinGridProps,
  applyDeakinTooltipProps,
  getChartColor,
} from "@/lib/deakinChartTheme";

export function TasksBarChart({ data }: { data: any[] }) {
  return (
    <div className="rounded-lg bg-white shadow-level-1 border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        Tasks by Phase
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid {...applyDeakinGridProps()} />
            <XAxis dataKey="phase" {...applyDeakinAxisProps()} />
            <YAxis {...applyDeakinAxisProps()} />
            <Tooltip {...applyDeakinTooltipProps()} />
            <Bar
              dataKey="count"
              fill={getChartColor(0)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

### Option B: Odoo Backend (For WBS Tree/Kanban Views)

**1. Install the module**

```bash
cd /path/to/odoo
./odoo-bin -d finance_ppm_db -i ipai_finance_ppm --dev=all
```

**2. Navigate to Finance PPM**

Go to: **Apps → Finance PPM → Dashboard**

**3. View styled components**

- **Tree View:** Uses `.data-table` styling with gradient headers
- **Kanban View:** Uses `.task-card` styling with tags and avatars
- **Empty States:** Uses `.empty-state` with centered hero layout

---

## 🎨 Design Tokens Reference

### Colors

#### Brand Colors

```css
--color-brand-primary: #0078d4   /* Primary Blue */
--color-brand-purple:  #4b38b3   /* Planner Purple */
--color-brand-teal:    #00b294   /* Fabric Teal */
--color-brand-black:   #000000   /* Deakin Black */
--color-brand-gold:    #f2c811   /* Finance Gold */
```

**Usage:**

```tsx
// Tailwind
<button className="bg-deakin-primary text-white">Primary Button</button>
<button className="bg-deakin-teal text-white">Teal Button</button>

// CSS
.custom-header { background: var(--color-brand-primary); }
```

#### Neutral Grays

```css
--color-gray-950: #111111   /* Almost Black */
--color-gray-900: #1f1f1f   /* Dark Gray */
--color-gray-600: #515151   /* Medium Gray */
--color-gray-300: #d4d4d4   /* Light Gray */
--color-gray-50:  #fafafa   /* Very Light Gray */
```

**Usage:**

```tsx
// Tailwind
<div className="bg-gray-50 border border-gray-200">
  <p className="text-gray-900">Primary text</p>
  <p className="text-gray-600">Secondary text</p>
</div>
```

#### Semantic Colors

```css
--color-success:       #107c10
--color-success-soft:  #e4f4e4
--color-warning:       #ffaa44
--color-warning-soft:  #fff4dd
--color-danger:        #a4262c
--color-danger-soft:   #f9d6d9
```

**Usage:**

```tsx
// Success badge
<span className="px-2 py-0.5 rounded-full bg-semantic-successSoft text-semantic-success text-xs">
  Complete
</span>

// Warning badge
<span className="px-2 py-0.5 rounded-full bg-semantic-warningSoft text-semantic-warning text-xs">
  At Risk
</span>

// Danger badge
<span className="px-2 py-0.5 rounded-full bg-semantic-dangerSoft text-semantic-danger text-xs">
  Overdue
</span>
```

#### Chart Colors

```css
--color-chart-1: #0078d4   /* Primary Blue */
--color-chart-2: #4b38b3   /* Planner Purple */
--color-chart-3: #00b294   /* Fabric Teal */
--color-chart-4: #f2c811   /* Finance Gold */
--color-chart-5: #ff8c00   /* Orange */
```

**Usage:**

```tsx
import { getChartColor } from '@/lib/deakinChartTheme';

<Bar dataKey="phase1" fill={getChartColor(0)} />
<Bar dataKey="phase2" fill={getChartColor(1)} />
<Bar dataKey="phase3" fill={getChartColor(2)} />
```

---

### Spacing

**4px base unit:**

```css
--space-1: 4px     /* 1 unit */
--space-2: 8px     /* 2 units */
--space-3: 12px    /* 3 units */
--space-4: 16px    /* 4 units */
--space-6: 24px    /* 6 units */
--space-8: 32px    /* 8 units */
```

**Tailwind usage:**

```tsx
<div className="p-4 gap-2">        {/* padding: 16px, gap: 8px */}
  <div className="mb-3">...</div>  {/* margin-bottom: 12px */}
</div>
```

---

### Shadows

```css
--shadow-level-1: 0 1px 3px rgba(0, 0, 0, 0.08)    /* Subtle */
--shadow-level-2: 0 4px 8px rgba(0, 0, 0, 0.12)    /* Card */
--shadow-level-3: 0 8px 16px rgba(0, 0, 0, 0.14)   /* Elevated */
--shadow-modal:   0 16px 32px rgba(0, 0, 0, 0.24)  /* Modal */
```

**Tailwind usage:**

```tsx
<div className="shadow-level-1">Card</div>
<div className="shadow-level-2 hover:shadow-level-3">Hover lift</div>
```

---

### Border Radius

```css
--radius-xs: 2px
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

**Tailwind usage:**

```tsx
<button className="rounded-md">Medium radius (8px)</button>
<div className="rounded-lg">Large radius (12px)</div>
```

---

## 🧩 Component Examples

### 1. KPI Card

```tsx
function KpiCard({ 
  label, 
  value, 
  change, 
  trend 
}: { 
  label: string; 
  value: string | number; 
  change: string; 
  trend: 'positive' | 'negative' | 'neutral';
}) {
  const trendColors = {
    positive: 'bg-semantic-successSoft text-semantic-success',
    negative: 'bg-semantic-dangerSoft text-semantic-danger',
    neutral: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <div className="rounded-lg bg-white shadow-level-1 border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-950">
        {value}
      </div>
      <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${trendColors[trend]}`}>
        <span>{trend === 'positive' ? '▲' : trend === 'negative' ? '▼' : '—'}</span>
        <span>{change}</span>
      </div>
    </div>
  );
}

// Usage
<KpiCard 
  label="Total Tasks" 
  value={36} 
  change="+8% vs last month" 
  trend="positive" 
/>
```

---

### 2. Data Table

```tsx
function TaskTable({ tasks }: { tasks: any[] }) {
  return (
    <div className="rounded-lg bg-white shadow-level-1 border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              WBS
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Task Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-900">{task.wbs}</td>
              <td className="px-3 py-2 text-gray-900">{task.name}</td>
              <td className="px-3 py-2">
                <span className="px-2 py-0.5 rounded-full bg-semantic-successSoft text-semantic-success text-xs">
                  {task.status}
                </span>
              </td>
              <td className="px-3 py-2 text-gray-900">{task.progress}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 3. Empty State

```tsx
function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-lg p-6 text-center bg-gradient-radial from-blue-50 via-gray-50 to-white shadow-level-1 border border-blue-100">
      <div className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </div>
      <div className="text-sm text-gray-600 mb-4">
        {description}
      </div>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-br from-deakin-primary to-blue-700 text-white font-semibold text-sm shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all"
      >
        {actionLabel}
      </button>
    </div>
  );
}

// Usage
<EmptyState
  title="No tasks yet"
  description="Create your first task to get started with the month-end closing process."
  actionLabel="Create Task"
  onAction={() => console.log('Create task')}
/>
```

---

### 4. Tag/Badge Component

```tsx
function Tag({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger';
}) {
  const variants = {
    default: 'border-gray-300 bg-gray-50 text-gray-700',
    gold: 'border-deakin-gold/45 bg-deakin-gold/10 text-yellow-800',
    success: 'border-semantic-success/45 bg-semantic-successSoft text-semantic-success',
    warning: 'border-semantic-warning/45 bg-semantic-warningSoft text-semantic-warning',
    danger: 'border-semantic-danger/45 bg-semantic-dangerSoft text-semantic-danger',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Usage
<Tag variant="gold">Finance</Tag>
<Tag variant="success">Complete</Tag>
<Tag variant="warning">At Risk</Tag>
<Tag variant="danger">Overdue</Tag>
```

---

## 📊 Chart Integration

### Complete BarChart Example

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  applyDeakinAxisProps,
  applyDeakinGridProps,
  applyDeakinTooltipProps,
  getChartColor,
} from "@/lib/deakinChartTheme";

const data = [
  { phase: "Phase I", tasks: 6 },
  { phase: "Phase II", tasks: 16 },
  { phase: "Phase III", tasks: 2 },
  { phase: "Phase IV", tasks: 12 },
];

export function PhaseBreakdownChart() {
  return (
    <div className="rounded-lg bg-white shadow-level-1 border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        Tasks by Phase
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid {...applyDeakinGridProps()} />
            <XAxis dataKey="phase" {...applyDeakinAxisProps()} />
            <YAxis {...applyDeakinAxisProps()} />
            <Tooltip {...applyDeakinTooltipProps()} />
            <Bar
              dataKey="tasks"
              fill={getChartColor(0)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### Multi-Series Chart

```tsx
<BarChart data={data}>
  <CartesianGrid {...applyDeakinGridProps()} />
  <XAxis dataKey="month" {...applyDeakinAxisProps()} />
  <YAxis {...applyDeakinAxisProps()} />
  <Tooltip {...applyDeakinTooltipProps()} />
  <Legend />
  
  <Bar dataKey="planned" fill={getChartColor(0)} radius={[4, 4, 0, 0]} />
  <Bar dataKey="actual" fill={getChartColor(1)} radius={[4, 4, 0, 0]} />
  <Bar dataKey="variance" fill={getChartColor(2)} radius={[4, 4, 0, 0]} />
</BarChart>
```

---

## 🔧 Customization

### Extend Tailwind Theme

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Add custom Finance PPM colors
        finance: {
          revenue: "#00b294",
          expense: "#a4262c",
          budget: "#f2c811",
        },
      },
    },
  },
};
```

### Custom CSS Classes

```css
/* In your custom CSS file */
.finance-revenue-card {
  background: linear-gradient(135deg, var(--color-brand-teal), #008272);
  color: white;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

---

## ✅ Production Checklist

- [ ] CSS theme imported in main app
- [ ] Tailwind config using Deakin tokens
- [ ] Chart theme imported and applied
- [ ] All KPI cards using design system
- [ ] Data tables styled consistently
- [ ] Empty states implemented
- [ ] Tags/badges using semantic colors
- [ ] Buttons using gradient variants
- [ ] Odoo module installed (if using Odoo)
- [ ] Responsive breakpoints tested

---

## 📚 Resources

- **Design System Docs:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
- **Full CSS:** [/styles/deakin-fluent-theme.css](/styles/deakin-fluent-theme.css)
- **Chart Theme:** [/lib/deakinChartTheme.ts](/lib/deakinChartTheme.ts)
- **Tailwind Config:** [/tailwind.config.ts](/tailwind.config.ts)

---

**Last Updated:** 2025-12-07  
**Version:** 2.0.0  
**Design System:** Deakin Enterprise 365 (Microsoft Fluent)
