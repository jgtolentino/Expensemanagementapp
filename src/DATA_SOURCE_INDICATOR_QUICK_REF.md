# Data Source Indicator - Quick Reference Card

## 🚀 Quick Start (30 Seconds)

### Import and Use
```typescript
import { DataSourceBadge } from './components/ui/DataSourceBadge';
import { MOCK_DATA_META } from './lib/data/ppm-sample-data';
import { PLANNER_DATA_META } from './lib/data/planner-projects';

// Production data
<DataSourceBadge source="production" filename="ppm-oca.xlsx" />

// Mock data
<DataSourceBadge source="mock" lastUpdated="Static Demo" />
```

---

## 🎨 Badge Types

### 🟢 LIVE DATA (Production)
```tsx
<DataSourceBadge source="production" filename="ppm-oca.xlsx" />
```
- Green background
- Pulsing dot (3s animation)
- Shows source filename
- Use for: CSV imports, real data

### 🟠 MOCK DATA (Simulation)
```tsx
<DataSourceBadge source="mock" lastUpdated="Static Demo" />
```
- Amber background
- Solid dot (no animation)
- Shows "Static Demo"
- Use for: Hardcoded placeholders, demo data

---

## 📋 Usage Patterns

### Pattern 1: Tag Production Data
```typescript
const PRODUCTION_META = {
  source: 'production',
  filename: 'ppm-oca.xlsx',
  lastUpdated: new Date().toISOString(),
  importedBy: 'System'
};

const tasks = csvData.map(item => ({
  ...item,
  meta: PRODUCTION_META
}));
```

### Pattern 2: Tag Mock Data
```typescript
const MOCK_META = {
  source: 'mock',
  lastUpdated: 'Static Demo',
  filename: undefined
};

const demoPortfolio = {
  budget: 8500000,
  meta: MOCK_META
};
```

### Pattern 3: Display Badge
```tsx
<div className="flex items-center gap-2">
  <h1>{portfolio.name}</h1>
  <DataSourceBadge 
    source={portfolio.meta.source}
    filename={portfolio.meta.filename}
    showTooltip={true}
  />
</div>
```

---

## 🎯 Where to Place Badges

| Location | Badge Type | Priority |
|----------|------------|----------|
| **Dashboard Headers** | Both | ⭐⭐⭐ Critical |
| **Financial Figures** | Both | ⭐⭐⭐ Critical |
| **Kanban Projects** | Production | ⭐⭐ High |
| **Task Cards** | Production | ⭐⭐ High |
| **Reports** | Both | ⭐⭐⭐ Critical |

---

## 🔧 Component Variants

### Full Badge (Default)
```tsx
<DataSourceBadge 
  source="production" 
  filename="ppm-oca.xlsx"
  lastUpdated="2025-12-09"
  showTooltip={true}
/>
```

### Compact Dot
```tsx
<DataSourceDot source="production" />
```

### Icon Only
```tsx
<DataSourceIcon source="production" filename="ppm-oca.xlsx" />
```

---

## ✅ DO / ❌ DON'T

### DO ✅
```tsx
// ✅ Show badge for financial figures
<div>
  Budget: ₱8.5M 
  <DataSourceBadge source="mock" />
</div>

// ✅ Include filename for production
<DataSourceBadge 
  source="production" 
  filename="ppm-oca.xlsx"
/>

// ✅ Use tooltips for context
<DataSourceBadge showTooltip={true} />
```

### DON'T ❌
```tsx
// ❌ Don't hide badges for key metrics
<div>Budget: ₱8.5M</div> // Missing badge!

// ❌ Don't use generic labels
<Badge>Data</Badge> // Too vague

// ❌ Don't forget timestamps
meta: { source: 'production' } // Missing lastUpdated!
```

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] Badge displays next to portfolio name
- [ ] Green badge has pulsing animation
- [ ] Amber badge has no animation
- [ ] Filename shows for production data
- [ ] Tooltip appears on hover
- [ ] Badge is responsive on mobile

### Data Tests
```typescript
// Production data
expect(PLANNER_DATA_META.source).toBe('production');
expect(PLANNER_DATA_META.filename).toBe('ppm-oca.xlsx');

// Mock data
expect(MOCK_DATA_META.source).toBe('mock');
expect(MOCK_DATA_META.lastUpdated).toBe('Static Demo');
```

---

## 📊 Current Data Sources

| Source | Type | Records | File |
|--------|------|---------|------|
| Tax Filing | 🟢 Production | 3 tasks | ppm-oca.xlsx |
| Month-End Closing | 🟢 Production | 3 tasks | ppm-oca.xlsx |
| Portfolio Dashboard | 🟠 Mock | 1 portfolio | Hardcoded |
| Financial Records | 🟠 Mock | 7 records | Hardcoded |
| Risk Register | 🟠 Mock | 5 risks | Hardcoded |

---

## 🔗 Quick Links

- **Full Guide:** `/docs/DATA_SOURCE_INDICATOR_GUIDE.md`
- **Summary:** `/DATA_SOURCE_INDICATOR_SUMMARY.md`
- **Component:** `/components/ui/DataSourceBadge.tsx`
- **Data Model:** `/lib/data/ppm-data-model.ts`

---

## 💡 Tips

1. **Always tag new data** - Every data point needs a source
2. **Production = Green** - Real CSV imports
3. **Mock = Amber** - Demo/placeholder data
4. **Show prominently** - Don't hide badges
5. **Update timestamps** - Keep data fresh

---

**Version:** 1.0.0  
**Status:** ✅ Ready to Use  
**Last Updated:** December 9, 2025
