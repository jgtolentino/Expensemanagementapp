# PPM Data Model - Quick Reference Card

## 🚀 Quick Start (2 Minutes)

### 1. Open the Dashboard
```
Finance PPM App → Portfolio Dashboard (NEW badge)
```

### 2. Import What You Need
```typescript
// Types
import { Portfolio, Risk, FinancialRecord } from './lib/data/ppm-data-model';

// Sample Data
import { portfolioDashboard } from './lib/data/ppm-sample-data';

// Component
import { PortfolioDashboard } from './components/portfolio-dashboard';

// Helper Functions
import { 
  calculateRiskExposure,
  calculateBudgetVariance,
  calculateRAGStatus 
} from './lib/data/ppm-data-model';
```

### 3. Use in Your Component
```typescript
<PortfolioDashboard data={portfolioDashboard} />
```

---

## 📊 Data Model Cheat Sheet

### Strategic Theme
```typescript
{
  id: "theme_001",
  name: "Digital Transformation",
  owner_id: "CKVC",
  active: true
}
```

### Portfolio
```typescript
{
  id: "port_001",
  name: "Financial Systems Modernization",
  status: "On Track" | "At Risk" | "Critical",
  health_score: 92,
  rag_color: "Green" | "Amber" | "Red",
  total_budget_php: 8500000,
  capex_split_percent: 60,
  opex_split_percent: 40
}
```

### Financial Record
```typescript
{
  id: "fin_001",
  portfolio_id: "port_001",
  category: "Software" | "Hardware" | "Services",
  type: "CAPEX" | "OPEX",
  currency: "PHP" | "USD" | "EUR",
  budget_amount: 1500000,
  actual_spent: 0,
  fiscal_year: 2025
}
```

### Risk
```typescript
{
  id: "risk_001",
  title: "Integration Failure Risk",
  probability: "Low" | "Medium" | "High",
  impact: "Low" | "Medium" | "High",
  exposure_score: 6,
  exposure_level: "High",
  mitigation_status: "Open" | "Mitigated" | "Closed"
}
```

### Project
```typescript
{
  id: "proj_001",
  code: "PROJ-001",
  name: "ERP System Upgrade",
  portfolio_id: "port_001",
  status: "In Progress",
  health_score: 92,
  budget_php: 3500000,
  progress_percent: 15
}
```

---

## 🔧 Helper Functions

### Calculate Risk Exposure
```typescript
const { score, level } = calculateRiskExposure("High", "High");
// score: 9, level: "Critical"
```

### Calculate Budget Variance
```typescript
const { variance, variancePercent } = calculateBudgetVariance(8500000, 0);
// variance: 8500000, variancePercent: 100
```

### Calculate RAG Status
```typescript
const { status, ragColor } = calculateRAGStatus(92, 5);
// status: "On Track", ragColor: "Green"
```

### Aggregate Metrics
```typescript
const metrics = aggregatePortfolioMetrics(projects, financialRecords, risks);
// Returns: { totalBudget, totalSpent, projectCount, riskCount, ... }
```

---

## 🎯 Common Tasks

### Add a New Portfolio
```typescript
const newPortfolio: Portfolio = {
  id: "port_002",
  name: "Customer Experience Program",
  description: "Enhance customer satisfaction",
  status: "On Track",
  health_score: 85,
  rag_color: "Green",
  phase: "Execution",
  owner_id: "CCO",
  strategic_theme_id: "theme_003",
  total_budget_php: 5000000,
  total_spent_php: 1200000,
  budget_variance: 3800000,
  budget_variance_percent: 76,
  project_count: 2,
  risk_count: 3,
  high_exposure_risks: 1,
  capex_split_percent: 40,
  opex_split_percent: 60,
  trend: "Improving",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

### Add a New Financial Record
```typescript
const newFinancialRecord: FinancialRecord = {
  id: "fin_008",
  portfolio_id: "port_001",
  project_id: "proj_001",
  category: "Software",
  type: "CAPEX",
  currency: "PHP",
  budget_amount: 500000,
  actual_spent: 0,
  committed_amount: 500000,
  variance_amount: 500000,
  variance_percent: 100,
  fiscal_year: 2025,
  fiscal_quarter: 2,
  description: "Additional licenses",
  approval_status: "Draft",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

### Add a New Risk
```typescript
const newRisk: Risk = {
  id: "risk_006",
  portfolio_id: "port_001",
  project_id: "proj_001",
  title: "Vendor Lock-in Risk",
  description: "Dependency on single vendor",
  category: "Strategic",
  probability: "Medium",
  impact: "High",
  ...calculateRiskExposure("Medium", "High"),
  mitigation_status: "Open",
  mitigation_plan: "Negotiate flexible exit clauses",
  identified_by: "Procurement Team",
  identified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

---

## 📐 Risk Exposure Matrix

```
           Impact →
           Low (1)  Medium (2)  High (3)
         ┌─────────┬───────────┬─────────┐
Prob  Low│    1    │     2     │    3    │ Low
 ↓   (1) │  Green  │   Green   │  Yellow │
         ├─────────┼───────────┼─────────┤
    Med │    2    │     4     │    6    │ Medium
    (2) │  Green  │  Yellow   │  Orange │
         ├─────────┼───────────┼─────────┤
   High │    3    │     6     │    9    │ High/Critical
    (3) │ Yellow  │  Orange   │   Red   │
         └─────────┴───────────┴─────────┘

Score 1-2: Low Exposure (Green)
Score 3-4: Medium Exposure (Yellow)
Score 6: High Exposure (Orange)
Score 9: Critical Exposure (Red)
```

---

## 🎨 RAG Status Rules

### Green (On Track)
- Health Score: ≥ 85
- Budget Variance: ≤ 10%
- All risks mitigated or low

### Amber (At Risk)
- Health Score: 70-84
- Budget Variance: 10-20%
- Some medium risks open

### Red (Critical)
- Health Score: < 70
- Budget Variance: > 20%
- High or critical risks open

---

## 💰 OPEX vs CAPEX

### CAPEX (Capital Expenditure)
- Software licenses (perpetual)
- Hardware purchases
- Major system implementations
- Infrastructure upgrades
- **Depreciates over time**

### OPEX (Operational Expenditure)
- Software subscriptions (SaaS)
- Training and consulting
- Maintenance and support
- Cloud service fees
- **Expensed immediately**

---

## 🔗 API Endpoints (Planned)

```
GET    /api/portfolios
GET    /api/portfolios/{id}
GET    /api/portfolios/{id}/dashboard
POST   /api/portfolios
PUT    /api/portfolios/{id}
DELETE /api/portfolios/{id}

GET    /api/portfolios/{id}/projects
GET    /api/portfolios/{id}/financials
GET    /api/portfolios/{id}/risks
GET    /api/portfolios/{id}/kpis

POST   /api/financials
PUT    /api/financials/{id}
DELETE /api/financials/{id}

POST   /api/risks
PUT    /api/risks/{id}
DELETE /api/risks/{id}
```

---

## 🗂️ File Locations

```
Data Models:
  /lib/data/ppm-data-model.ts       # Types & helpers
  /lib/data/ppm-sample-data.ts      # Sample data

Components:
  /components/portfolio-dashboard.tsx  # Dashboard UI

Documentation:
  /docs/PPM_DATA_MODEL_GUIDE.md     # Complete guide
  /PPM_DATA_MODEL_SUMMARY.md        # Implementation summary
  /PPM_QUICK_REFERENCE.md           # This file

Integration:
  /FinancePPMApp.tsx                # Main app (updated)
```

---

## 🎯 Sample Dashboard URL

```
http://localhost:5173
  → Click "Finance PPM"
    → Click "Portfolio Dashboard" (NEW)
      → View "Financial Systems Modernization"
```

---

## 📊 Current Sample Data

### Portfolio: Financial Systems Modernization
```
Budget:     ₱8,500,000
Spent:      ₱0
Variance:   100%
Projects:   3
Risks:      5 (1 high exposure)
Health:     92/100
Status:     On Track (Green)
CAPEX:      60% (₱5.1M)
OPEX:       40% (₱3.4M)
```

### Projects
1. ERP System Upgrade - ₱3.5M (15%)
2. Financial Reporting - ₱2M (10%)
3. Payment Gateway - ₱3M (5%)

### Risks
1. Integration Failure - High (6)
2. Budget Overrun - Medium (4)
3. Resource Availability - Medium (3) ✓ Mitigated
4. Data Quality - Medium (4)
5. Security Compliance - Medium (3)

---

## 🔐 Odoo Integration

### Required Modules
```bash
# Core
project
account

# OCA (Odoo Community Association)
project_portfolio
account_budget_oca
project_risk
project_kpi
analytic_tag_dimension
base_rest
```

### Install Command
```bash
# Via Odoo Shell
odoo-bin -d your_database -i project_portfolio,account_budget_oca,project_risk

# Via Web UI
Apps → Search → Install
```

---

## 🎨 Color Codes (Tailwind)

```css
Primary:   text-amber-600   bg-amber-100   border-amber-300
Success:   text-green-600   bg-green-100   border-green-300
Warning:   text-yellow-600  bg-yellow-100  border-yellow-300
Danger:    text-red-600     bg-red-100     border-red-300
Info:      text-blue-600    bg-blue-100    border-blue-300
Purple:    text-purple-600  bg-purple-100  border-purple-300

RAG Colors:
Green:     bg-green-100 text-green-800 border-green-300
Amber:     bg-amber-100 text-amber-800 border-amber-300
Red:       bg-red-100 text-red-800 border-red-300
```

---

## 🧪 Testing Checklist

```
□ Open Finance PPM App
□ Click "Portfolio Dashboard" button
□ Verify header displays correctly
□ Check KPI cards (4 cards)
□ Verify OPEX/CAPEX bars
□ Check budget variance table
□ View projects list (3 projects)
□ Check progress bars
□ View risk register (5 risks)
□ Verify exposure levels
□ Check active features (14 features)
□ Test responsive layout
□ Verify all icons load
□ Check navigation breadcrumb
```

---

## 💡 Pro Tips

### Performance
```typescript
// Cache dashboard data
const dashboardData = useMemo(
  () => portfolioDashboard,
  [portfolioDashboard]
);

// Lazy load detail views
const DetailView = lazy(() => import('./components/DetailView'));
```

### Type Safety
```typescript
// Always use types from ppm-data-model.ts
import type { Portfolio, Risk } from './lib/data/ppm-data-model';

// Use helper functions for calculations
const ragStatus = calculateRAGStatus(healthScore, variance);
```

### Data Validation
```typescript
// Validate before saving
if (portfolio.health_score < 0 || portfolio.health_score > 100) {
  throw new Error('Health score must be between 0 and 100');
}

// Use Zod for runtime validation
import { z } from 'zod';
const PortfolioSchema = z.object({
  health_score: z.number().min(0).max(100),
  // ...
});
```

---

## 📞 Quick Links

- **Full Guide:** `/docs/PPM_DATA_MODEL_GUIDE.md`
- **Summary:** `/PPM_DATA_MODEL_SUMMARY.md`
- **Code:** `/lib/data/ppm-data-model.ts`
- **Sample Data:** `/lib/data/ppm-sample-data.ts`
- **Component:** `/components/portfolio-dashboard.tsx`

---

## ✨ Keyboard Shortcuts (Future)

```
Cmd/Ctrl + K    → Search portfolios
Cmd/Ctrl + N    → New portfolio
Cmd/Ctrl + E    → Edit mode
Cmd/Ctrl + S    → Save changes
Cmd/Ctrl + /    → Show help
Esc             → Close modal
```

---

**Version:** 1.0.0  
**Last Updated:** December 9, 2025  
**Status:** Production Ready ✅
