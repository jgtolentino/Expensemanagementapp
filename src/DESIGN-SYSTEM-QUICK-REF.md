# Deakin Enterprise 365 Design System - Quick Reference

**Copy-paste ready snippets for Finance PPM**

---

## 🎨 Colors

```tsx
// Brand
bg-deakin-primary    // #0078d4 (Primary Blue)
bg-deakin-purple     // #4b38b3 (Planner Purple)
bg-deakin-teal       // #00b294 (Fabric Teal)
bg-deakin-gold       // #f2c811 (Finance Gold)

// Semantic
bg-semantic-success bg-semantic-successSoft    // Green
bg-semantic-warning bg-semantic-warningSoft    // Yellow
bg-semantic-danger bg-semantic-dangerSoft      // Red

// Text
text-gray-950  text-gray-900  text-gray-600  text-gray-300

// Charts
getChartColor(0)  // #0078d4 (Blue)
getChartColor(1)  // #4b38b3 (Purple)
getChartColor(2)  // #00b294 (Teal)
```

---

## 📐 Spacing

```tsx
p-1   // 4px
p-2   // 8px
p-3   // 12px
p-4   // 16px
p-6   // 24px
p-8   // 32px

gap-2  gap-4  gap-6  // For flex/grid
```

---

## 🔲 Components

### KPI Card

```tsx
<div className="rounded-lg bg-white shadow-level-1 border border-gray-200 p-4">
  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    Total Tasks
  </div>
  <div className="mt-1 text-2xl font-bold text-gray-950">36</div>
  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-semantic-successSoft text-semantic-success px-2 py-0.5 text-[11px]">
    ▲ +8%
  </div>
</div>
```

### Tag/Badge

```tsx
<span className="px-2 py-0.5 rounded-full bg-semantic-successSoft text-semantic-success text-xs">
  Complete
</span>
```

### Button

```tsx
<button className="px-4 py-2 rounded-md bg-gradient-to-br from-deakin-primary to-blue-700 text-white font-semibold text-sm shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all">
  Create Task
</button>
```

### Data Table

```tsx
<table className="w-full text-sm">
  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
    <tr>
      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
        Header
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-t border-gray-200 hover:bg-gray-50">
      <td className="px-3 py-2 text-gray-900">Cell</td>
    </tr>
  </tbody>
</table>
```

---

## 📊 Charts

### Bar Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { applyDeakinAxisProps, applyDeakinGridProps, applyDeakinTooltipProps, getChartColor } from '@/lib/deakinChartTheme';

<BarChart data={data}>
  <CartesianGrid {...applyDeakinGridProps()} />
  <XAxis dataKey="name" {...applyDeakinAxisProps()} />
  <YAxis {...applyDeakinAxisProps()} />
  <Tooltip {...applyDeakinTooltipProps()} />
  <Bar dataKey="value" fill={getChartColor(0)} radius={[4, 4, 0, 0]} />
</BarChart>
```

---

## 🚀 Setup

### React

```tsx
// In main.tsx
import '/styles/deakin-fluent-theme.css'
```

### Odoo

```bash
./odoo-bin -d db_name -i ipai_finance_ppm
```

---

## 📚 Docs

- **Complete Spec:** `/docs/finance-ppm/DESIGN-SYSTEM.md`
- **Implementation:** `/docs/finance-ppm/DESIGN-SYSTEM-IMPLEMENTATION.md`
- **Summary:** `/docs/finance-ppm/DESIGN-SYSTEM-SUMMARY.md`
