# Strict Production Mode - Feature Flag Implementation

## 🛑 Overview

**Strict Production Mode** is a feature flag system that **completely hides** all dashboard widgets and features that are not supported by actual CSV data. This transforms the dashboard from a "prototype with mock data" to a "lean production tool" showing only real, verifiable information.

**Implementation Date:** December 9, 2025  
**Status:** ✅ Production Ready  
**Philosophy:** "If it's not in the CSV, it's not on the dashboard"

---

## 🎯 The Problem

### Before: Confusing Mixed Dashboard

```
Financial Systems Modernization

Active Projects: 3           🟠 MOCK (Hardcoded)
Total Budget: ₱8,500,000     🟠 MOCK (Hardcoded)
Health Score: 92/100         🟠 MOCK (Hardcoded)
Risk Exposure: Medium        🟠 MOCK (Hardcoded)
Strategic Theme: Digital     🟠 MOCK (Hardcoded)

Problem: Stakeholders can't tell what's real vs demo data!
```

### After: Clean Production Dashboard

```
Financial Systems Modernization     🟢 PRODUCTION ONLY

Active Projects: 2           🟢 LIVE (From CSV)
Total Tasks: 6               🟢 LIVE (From CSV)
Active Assignments: 5        🟢 LIVE (From CSV)
Checklist Progress: 8%       🟢 LIVE (From CSV)

Projects:
1. Tax Filing Project 2026   🟢 LIVE
2. Month-End Closing Tasks   🟢 LIVE

Budget/Risks/Strategy widgets: HIDDEN (not in CSV)

Result: Zero confusion - everything shown is real!
```

---

## 📊 Data Availability Audit

### ✅ Available in CSV (Enabled Features)

| Data Type | CSV Column | Feature |
|-----------|------------|---------|
| **Projects** | File Name | Project List, Project Cards |
| **Phases** | Phase/Bucket | Kanban Board, Phase Progress |
| **Tasks** | Task Name | Task List, Task Metrics |
| **Checklists** | Checklist Items | Completion Tracking |
| **Dates** | Start/End Date | Timeline View, Overdue Alerts |
| **Assignments** | Assigned To | Resource Allocation, Team Stats |
| **Labels** | Labels | Tag Distribution |

### ❌ Missing from CSV (Disabled Features)

| Data Type | Missing Column | Hidden Widget |
|-----------|---------------|---------------|
| **Budget** | Budget/Cost | Financial Cards, Budget Charts |
| **CAPEX/OPEX** | Classification | CAPEX/OPEX Split Widget |
| **Risks** | Risk Register | Risk Matrix, Exposure Charts |
| **Strategy** | Strategic Theme | Strategy Alignment Widget |
| **Currency** | Currency | Multi-Currency Widget |
| **Rates** | Resource Rate | Cost Allocation |
| **Health** | Various | Health Score (insufficient inputs) |

---

## 🏗️ Architecture

### File Structure

```
finance-clarity-ppm/
│
├── lib/config/
│   └── feature-flags.ts              🆕 Feature flag configuration (600 lines)
│
├── lib/data/
│   ├── planner-projects.ts           ✅ CSV data storage
│   ├── planner-stats.ts              ✅ Statistics engine
│   └── dashboard-live.ts             ✅ Hybrid data model
│
├── components/
│   ├── portfolio-dashboard-strict.tsx 🆕 Strict production UI (450 lines)
│   ├── portfolio-dashboard-live.tsx   ✅ Hybrid UI (production + mock)
│   └── portfolio-dashboard.tsx        ✅ Legacy UI (all mock)
│
└── docs/
    └── STRICT_PRODUCTION_MODE.md      🆕 This document
```

### Dashboard Evolution

```
Level 1: portfolio-dashboard.tsx (Legacy)
  └── Shows: All mock data with 🟠 MOCK badges
  └── Purpose: Demo/prototype mode
  └── Status: Deprecated

Level 2: portfolio-dashboard-live.tsx (Hybrid)
  └── Shows: Real CSV data + Mock financials
  └── Purpose: Transition mode
  └── Status: Active (for financial data migration)

Level 3: portfolio-dashboard-strict.tsx (Production) ⭐ NEW
  └── Shows: ONLY real CSV data
  └── Purpose: Production mode
  └── Status: Recommended for stakeholder use
```

---

## 🔧 Feature Flag Configuration

### `/lib/config/feature-flags.ts`

The feature flag system defines 3 modes:

#### 1. **STRICT_PRODUCTION_MODE** (Default) ⭐ RECOMMENDED

```typescript
export const FEATURE_FLAGS: FeatureFlagConfig = {
  modules: {
    task_management: true,       // ✅ Have Task Name column
    kanban_board: true,          // ✅ Have Phase/Bucket column
    gantt_timeline: true,        // ✅ Have Start/End Date columns
    resource_allocation: true,   // ✅ Have Assigned To column
    checklist_tracking: true,    // ✅ Have Checklist Items
  },

  financials: {
    enabled: false,              // ❌ No budget columns
    features: {
      budget_tracking: false,
      capex_opex: false,
      multi_currency: false,
      variance_analysis: false,
    }
  },

  risks: {
    enabled: false,              // ❌ No risk register file
    features: {
      risk_register: false,
      exposure_matrix: false,
    }
  },

  strategy: {
    enabled: false,              // ❌ No strategy mapping
    features: {
      theme_alignment: false,
      okr_tracking: false,
    }
  },

  dashboard: {
    show_financial_cards: false,       // ❌ Hide budget widgets
    show_budget_charts: false,         // ❌ Hide financial charts
    show_risk_matrix: false,           // ❌ Hide risk widgets
    show_strategy_alignment: false,    // ❌ Hide strategy cards
    show_health_score: false,          // ❌ Hide (insufficient data)
    show_task_metrics: true,           // ✅ Show task stats
    show_timeline_view: true,          // ✅ Show dates
    show_team_allocation: true,        // ✅ Show assignees
  },
};
```

#### 2. **DEMO_MODE** (For Presentations)

```typescript
export const DEMO_MODE: FeatureFlagConfig = {
  // Enable everything (including mock data)
  financials: { enabled: true },
  risks: { enabled: true },
  strategy: { enabled: true },
  // Show all widgets
  dashboard: {
    show_financial_cards: true,
    show_risk_matrix: true,
    show_strategy_alignment: true,
    // ... all true
  }
};
```

#### 3. **HYBRID_MODE** (Partial Data)

```typescript
export const HYBRID_MODE: FeatureFlagConfig = {
  // Enable financials with 🟠 MOCK badge
  financials: { enabled: true },
  // Disable risks/strategy
  risks: { enabled: false },
  strategy: { enabled: false },
  // Show financial widgets with mock badges
  dashboard: {
    show_financial_cards: true,  // With 🟠 MOCK badge
    show_risk_matrix: false,
    show_strategy_alignment: false,
  }
};
```

### Switching Modes

```typescript
// In /lib/config/feature-flags.ts:

// Default: Strict Production Mode
export const ACTIVE_MODE = FEATURE_FLAGS;

// To switch to Demo Mode:
// export const ACTIVE_MODE = DEMO_MODE;

// To switch to Hybrid Mode:
// export const ACTIVE_MODE = HYBRID_MODE;
```

---

## 📊 Strict Production Dashboard

### `/components/portfolio-dashboard-strict.tsx`

#### What's Shown

1. **Header Section**
   ```
   Financial Systems Modernization     🟢 PRODUCTION ONLY
   Task Command Center - Production Data Only
   Mode: STRICT_PRODUCTION_MODE
   ```

2. **KPI Cards (4 cards, all real)**
   ```
   Active Projects: 2       🟢 LIVE
   Total Tasks: 6           🟢 LIVE
   Active Assignments: 5    🟢 LIVE
   Checklist Progress: 8%   🟢 LIVE
   ```

3. **Timeline Status**
   ```
   Overdue: 0 tasks         🟢 LIVE (calculated from due dates)
   Due This Week: 3 tasks   🟢 LIVE
   On Track: 3 tasks        🟢 LIVE
   ```

4. **Project Cards (2 projects)**
   ```
   Tax Filing Project 2026
     Status: In Progress | RAG: Red
     Tasks: 1/3 (33%)
     Checklist: 2/15 (13%)
     Assignees: 3 | Labels: 2
     Progress bars showing real completion
     
   Month-End Closing Tasks
     Status: Not Started | RAG: Red
     Tasks: 0/3 (0%)
     Checklist: 0/9 (0%)
     Assignees: 2 | Labels: 1
     Progress bars showing real completion
   ```

5. **Feature Flag Status Alert**
   ```
   ℹ️ Strict Production Mode Active
   
   Hidden features (not in CSV):
   • Budget Tracking
   • Risk Management
   • Strategy Alignment
   • Health Score
   ```

6. **Data Source Summary**
   ```
   🟢 Available Data (CSV):
     • File: ppm-oca.xlsx
     • Projects: 2
     • Tasks: 6
     • Checklist Items: 24
     • Assignees: 5
     • Labels: 3
   
   ❌ Not Available (Hidden):
     • Budget/Financial Data
     • Risk Register
     • Strategic Theme Mapping
     • Health Score
   ```

#### What's Hidden

- ❌ Total Budget card
- ❌ Total Spend card
- ❌ Budget Variance chart
- ❌ CAPEX/OPEX split widget
- ❌ Risk Matrix
- ❌ Risk Exposure cards
- ❌ Strategic Theme widget
- ❌ Health Score card (insufficient inputs)
- ❌ Financial Performance chart
- ❌ Multi-Currency widget

---

## 🎯 Usage

### Basic Usage

```tsx
import { PortfolioDashboardStrict } from './components/portfolio-dashboard-strict';

function App() {
  return <PortfolioDashboardStrict />;
}
```

### Check Feature Flags

```typescript
import { 
  shouldShowWidget, 
  areFinancialsEnabled,
  getCurrentMode 
} from './lib/config/feature-flags';

// Check if a widget should be shown
if (shouldShowWidget('show_financial_cards')) {
  // Show financial cards
}

// Check if financials are enabled
if (areFinancialsEnabled()) {
  // Show financial section
} else {
  // Hide financial section
}

// Get current mode
const mode = getCurrentMode(); // "STRICT_PRODUCTION_MODE"
```

### Conditional Rendering in Components

```tsx
import { FEATURE_FLAGS, shouldShowWidget } from './lib/config/feature-flags';

function MyComponent() {
  return (
    <div>
      {/* Always show task metrics */}
      {shouldShowWidget('show_task_metrics') && (
        <TaskMetricsCard />
      )}
      
      {/* Only show if financials enabled */}
      {FEATURE_FLAGS.financials.enabled && (
        <BudgetCard />
      )}
      
      {/* Only show if risks enabled */}
      {FEATURE_FLAGS.risks.enabled && (
        <RiskMatrix />
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Visual Verification

1. **Open Strict Production Dashboard**
   ```
   Navigate to: Finance PPM → Portfolio Dashboard (Strict)
   ```

2. **Verify Header**
   - [ ] See "🟢 PRODUCTION ONLY" badge
   - [ ] See "Mode: STRICT_PRODUCTION_MODE"
   - [ ] No mock data warnings

3. **Verify KPI Cards**
   - [ ] See exactly 4 cards (Projects, Tasks, Assignments, Progress)
   - [ ] All cards show 🟢 LIVE DATA badge
   - [ ] No budget/financial cards visible
   - [ ] No health score card visible

4. **Verify Timeline Section**
   - [ ] See "Timeline Status" widget
   - [ ] Shows overdue/upcoming/on-track counts
   - [ ] All calculated from CSV dates

5. **Verify Project Cards**
   - [ ] See exactly 2 project cards
   - [ ] Tax Filing Project 2026 visible
   - [ ] Month-End Closing Tasks visible
   - [ ] Progress bars show real percentages
   - [ ] Assignee and label counts shown

6. **Verify Hidden Features**
   - [ ] No budget widgets visible
   - [ ] No risk matrix visible
   - [ ] No strategy alignment widget
   - [ ] No health score card
   - [ ] Feature flag alert explains what's hidden

### Code Tests

```typescript
import { 
  FEATURE_FLAGS, 
  shouldShowWidget,
  getCurrentMode,
  getEnabledFeatures,
  getDisabledFeatures 
} from './lib/config/feature-flags';

// Test 1: Check current mode
expect(getCurrentMode()).toBe('STRICT_PRODUCTION_MODE');

// Test 2: Verify financials disabled
expect(FEATURE_FLAGS.financials.enabled).toBe(false);
expect(shouldShowWidget('show_financial_cards')).toBe(false);

// Test 3: Verify tasks enabled
expect(FEATURE_FLAGS.modules.task_management).toBe(true);
expect(shouldShowWidget('show_task_metrics')).toBe(true);

// Test 4: Get enabled features
const enabled = getEnabledFeatures();
expect(enabled).toContain('Task Management');
expect(enabled).toContain('Kanban Board');
expect(enabled).not.toContain('Financials');

// Test 5: Get disabled features
const disabled = getDisabledFeatures();
expect(disabled).toContain('Budget Tracking');
expect(disabled).toContain('Risk Management');
```

---

## 📋 Comparison Matrix

| Feature | Legacy Dashboard | Hybrid Dashboard | Strict Production | Notes |
|---------|------------------|------------------|-------------------|-------|
| **Projects** | 3 (mock) | 2 (real) | 2 (real) | CSV-backed |
| **Tasks** | 8 (mock) | 6 (real) | 6 (real) | CSV-backed |
| **Budget Cards** | Shown (mock) | Shown (mock) | **HIDDEN** | Not in CSV |
| **Financial Charts** | Shown (mock) | Shown (mock) | **HIDDEN** | Not in CSV |
| **Risk Matrix** | Shown (mock) | **HIDDEN** | **HIDDEN** | Not in CSV |
| **Strategy Widget** | Shown (mock) | **HIDDEN** | **HIDDEN** | Not in CSV |
| **Health Score** | Shown (mock) | Shown (calc) | **HIDDEN** | Insufficient inputs |
| **Task Metrics** | Shown (mock) | Shown (real) | Shown (real) | CSV-backed |
| **Timeline View** | Shown (mock) | Shown (real) | Shown (real) | CSV-backed |
| **Team Allocation** | Shown (mock) | Shown (real) | Shown (real) | CSV-backed |
| **Mock Data Badges** | 🟠 Many | 🟠 Some | 🟠 **NONE** | All real |
| **Production Badges** | 🟢 None | 🟢 Many | 🟢 **ALL** | 100% real |

---

## 🎯 Benefits

### 1. **Zero Confusion** ✅
- Stakeholders see only real data
- No risk of mistaking demos for actuals
- Clear "PRODUCTION ONLY" badge

### 2. **Audit Compliance** ✅
- Every metric is traceable to CSV
- No fabricated numbers
- Data lineage is clear

### 3. **Lean UI** ✅
- No clutter from unsupported features
- Focused on what matters: tasks & progress
- Faster page load (fewer widgets)

### 4. **Maintainability** ✅
- Feature flags centralized
- Easy to enable features when data available
- No hardcoded show/hide logic

### 5. **Progressive Enhancement** ✅
- Start with tasks only
- Add financials when budget CSV available
- Add risks when risk register imported
- Dashboard grows with data

---

## 🔄 Migration Path

### Phase 1: Current State (Strict Production)
```
✅ Tasks & Checklists
✅ Timeline & Dates
✅ Assignments
❌ Financials
❌ Risks
❌ Strategy
```

### Phase 2: Add Financials (Hybrid Mode)
```
✅ Tasks & Checklists
✅ Timeline & Dates
✅ Assignments
✅ Financials (import budget CSV)
❌ Risks
❌ Strategy

Action: Import budget.csv → Set HYBRID_MODE
```

### Phase 3: Add Risks (Extended Hybrid)
```
✅ Tasks & Checklists
✅ Timeline & Dates
✅ Assignments
✅ Financials
✅ Risks (import risk register)
❌ Strategy

Action: Import risks.csv → Enable risks in flags
```

### Phase 4: Full Production (All Features)
```
✅ Tasks & Checklists
✅ Timeline & Dates
✅ Assignments
✅ Financials
✅ Risks
✅ Strategy (import strategy mapping)

Action: Import strategy.csv → Set DEMO_MODE
```

---

## 📚 Helper Functions

```typescript
// Get current mode name
getCurrentMode() → "STRICT_PRODUCTION_MODE" | "HYBRID_MODE" | "DEMO_MODE"

// Get enabled features
getEnabledFeatures() → ["Task Management", "Kanban Board", ...]

// Get disabled features
getDisabledFeatures() → ["Budget Tracking", "Risk Management", ...]

// Get data availability summary
getDataAvailabilitySummary() → {
  available: [...],
  missing: [...]
}

// Check specific widget
shouldShowWidget('show_financial_cards') → false

// Check module
isModuleEnabled('task_management') → true

// Print summary to console
printFeatureFlagSummary()
```

---

## 🚀 Implementation Steps

### Step 1: Enable Strict Production Mode

```tsx
// In your main Finance PPM app:
import { PortfolioDashboardStrict } from './components/portfolio-dashboard-strict';

function FinancePPMApp() {
  return <PortfolioDashboardStrict />;
}
```

### Step 2: Verify Configuration

```typescript
import { printFeatureFlagSummary } from './lib/config/feature-flags';

// In browser console:
printFeatureFlagSummary();

// Output:
// ============================================
// 🛑 FEATURE FLAGS - STRICT PRODUCTION MODE
// ============================================
// Current Mode: STRICT_PRODUCTION_MODE
// --------------------------------------------
// ✅ ENABLED FEATURES:
//   • Task Management
//   • Kanban Board
//   • Timeline View
//   • Resource Allocation
// --------------------------------------------
// ❌ DISABLED FEATURES:
//   • Budget Tracking
//   • Risk Management
//   • Strategy Alignment
//   • Health Score
// ============================================
```

### Step 3: Test Dashboard

1. Open Finance PPM app
2. Navigate to Portfolio Dashboard
3. Verify only 4 KPI cards visible (no budget/financial cards)
4. Verify 2 project cards visible (Tax Filing, Closing)
5. Verify no risk matrix or strategy widgets
6. Verify "PRODUCTION ONLY" badge in header

---

## 📖 Related Documentation

- [Live Dashboard Integration](/docs/LIVE_DASHBOARD_INTEGRATION.md)
- [Data Source Indicator Guide](/docs/DATA_SOURCE_INDICATOR_GUIDE.md)
- [PPM Data Model Guide](/docs/PPM_DATA_MODEL_GUIDE.md)
- [Planner Integration Guide](/docs/PLANNER_INTEGRATION_GUIDE.md)

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Maintained By:** PPM Development Team

**🛑 The dashboard now operates in Strict Production Mode - showing ONLY what's real, hiding what's not!**
