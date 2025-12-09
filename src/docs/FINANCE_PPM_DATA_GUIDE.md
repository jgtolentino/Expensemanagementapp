# Finance Clarity PPM - Sample Data Guide

## Overview

This guide explains all the sample data files created for your Finance Clarity PPM implementation. Each dataset is designed to integrate with Odoo 18 CE + OCA modules and follows Clarity PPM data models.

---

## 📁 Data Files Created

### 1. **Financial Plans** (`/data/financial-plans.csv`)

**Purpose:** Budget planning, tracking, and variance analysis by phase and category.

**Key Fields:**
- `Plan ID`: Unique identifier (FP-YYYY-MM-NNN)
- `Project WBS`: Links to phase (1.0, 2.0, 3.0, 4.0)
- `Budget Type`: OPEX or CAPEX
- `Planned Amount`: Budget allocation
- `Actual Spend`: Current spend
- `Forecast`: Projected final spend
- `Variance`: Actual - Planned
- `Variance %`: Percentage variance

**Sample Data:** 54 rows
- 18 rows for Jan 2025 (active period with actuals)
- 18 rows for Feb 2025 (planned, no actuals)
- 18 rows for Mar 2025 (planned, no actuals)

**Odoo Mapping:**
- Table: `account.analytic.line`, `mis.budget`, `mis.budget.item`
- OCA Module: `account_budget_oca`, `mis_builder`

**Formulas:**
```
Variance = Actual Spend - Planned Amount
Variance % = (Variance / Planned Amount) × 100
```

**Usage in App:**
```typescript
import { sampleFinancialPlans, calculateVariance } from './lib/data/financial-data';

// Get Phase II budget
const phase2Budget = sampleFinancialPlans.filter(
  plan => plan.projectWbs === '2.0' && plan.period === 'Jan 2025'
);

// Calculate total variance
const totalVariance = phase2Budget.reduce(
  (sum, plan) => sum + plan.variance, 0
);
```

---

### 2. **Time Entries** (`/data/time-entries.csv`)

**Purpose:** Track effort hours by task and employee for resource utilization and cost tracking.

**Key Fields:**
- `Entry ID`: Unique identifier (TE-YYYY-NNN)
- `Task ID`: Links to Full Task Schedule (CT-NNNN)
- `Employee Code`: Links to Directory (RIM, BOM, JPAL, etc.)
- `Hours`: Effort hours (decimal)
- `Billable`: Yes/No (always No for internal)
- `Effort Type`: Execution, Analysis, Review, Reporting, Approval
- `Status`: Draft, Submitted, Approved

**Sample Data:** 47 rows covering Jan 15-21, 2025
- Multiple entries per task showing task progression
- Different effort types per activity
- Status progression (Draft → Submitted → Approved)

**Odoo Mapping:**
- Table: `account.analytic.line`, `hr_timesheet`
- OCA Module: `hr_timesheet`, `timesheet_grid`

**Usage in App:**
```typescript
// Get total hours for a task
const taskHours = sampleTimeEntries
  .filter(entry => entry.taskId === 'CT-0001')
  .reduce((sum, entry) => sum + entry.hours, 0);

// Get resource utilization
const employeeHours = sampleTimeEntries
  .filter(entry => entry.employeeCode === 'RIM')
  .reduce((sum, entry) => sum + entry.hours, 0);
```

---

### 3. **Risk Register** (`/data/risk-register.csv`)

**Purpose:** Identify, assess, and mitigate project risks across all phases.

**Key Fields:**
- `Risk ID`: Unique identifier (RSK-NNN)
- `Task/Phase`: Links to task or phase
- `Risk Type`: Compliance, Operational, Financial, Technical, Resource, Governance
- `Probability`: Low, Medium, High
- `Impact`: Low, Medium, High, Critical
- `Exposure`: Low, Medium, High, Critical (Probability × Impact)
- `Mitigation Plan`: Response strategy
- `Status`: Open, Mitigated, Accepted, Closed

**Sample Data:** 25 rows
- 5 Critical exposure risks
- 10 High exposure risks
- 10 Medium/Low exposure risks
- Mix of Open (15), Mitigated (8), Accepted (2) status

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_risk`
- OCA Module: `project_risk` (if available)

**Risk Matrix:**
| Probability | Low Impact | Medium Impact | High Impact | Critical Impact |
|-------------|-----------|---------------|-------------|-----------------|
| **High**    | Medium    | High          | High        | **Critical**    |
| **Medium**  | Low       | Medium        | High        | High            |
| **Low**     | Low       | Low           | Medium      | Medium          |

---

### 4. **KPI Registry** (`/data/kpi-registry.csv`)

**Purpose:** Track key performance indicators for cycle time, financial accuracy, compliance, and resource utilization.

**Key Fields:**
- `KPI ID`: Unique identifier (KPI-NNN)
- `Name`: KPI name
- `Category`: Cycle Time, Financial, Risk Management, Resource, Compliance
- `Formula`: Calculation method
- `Target`: Goal threshold
- `Actual`: Current performance
- `Variance`: Actual - Target
- `Trend`: Improving, Stable, Declining, On Track, At Risk
- `Frequency`: Daily, Weekly, Monthly, Quarterly

**Sample Data:** 15 KPIs
- 3 Cycle Time KPIs
- 5 Financial KPIs
- 3 Data Quality KPIs
- 2 Compliance KPIs
- 2 Resource KPIs

**Top KPIs:**
1. **On-Time Period Close Rate** (Target: 100%, Actual: 92%)
2. **Budget Variance %** (Target: <5%, Actual: 1.8%)
3. **Task Completion Rate** (Target: 100%, Actual: 83%)
4. **High Risk Mitigation %** (Target: 80%, Actual: 60%)

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_kpi`
- OCA Module: `mis_builder` for calculations

---

### 5. **Portfolios** (`/data/portfolios.csv`)

**Purpose:** Group projects into strategic portfolios with objectives and health scores.

**Key Fields:**
- `Portfolio ID`: Unique identifier (PF-NNN)
- `Strategic Theme`: Process Excellence, Digital Transformation, Risk & Compliance
- `Strategic Objective`: High-level goal
- `Health Score`: 0-100 overall health
- `RAG Status`: Green, Yellow, Red
- `Total Budget`: Sum of all project budgets
- `Project Count`: Number of projects

**Sample Data:** 3 portfolios
1. **Finance Operations Excellence 2025** (Active, Green, 85 health score)
2. **Financial Systems Modernization** (Planning, Green)
3. **Compliance & Governance** (Active, Yellow, 80 health score)

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_portfolio`
- OCA Module: `project_portfolio`

---

### 6. **Agreements** (`/data/agreements.csv`)

**Purpose:** Track SLAs, contracts, and policies affecting finance operations.

**Key Fields:**
- `Agreement ID`: Unique identifier (AGR-NNN)
- `Type`: Internal SLA, External SLA, External MSA, External Contract, Internal Policy, Intercompany
- `Party/Counterparty`: Other party name
- `Value`: Contract value (if applicable)
- `Review Frequency`: Quarterly, Annually, etc.
- `Linked Tasks`: Related task IDs

**Sample Data:** 10 agreements
- 4 Internal SLAs
- 3 External Contracts
- 2 External SLA/MSA
- 1 Intercompany Agreement

**Key Agreements:**
- Monthly Close SLA (7 WD)
- External Audit Services (PwC)
- Payroll Provider (Sprout Solutions)
- Office Lease Agreement

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_agreements`
- OCA Module: `contract`, `contract_variable`

---

### 7. **Reference Links** (`/data/reference-links.csv`)

**Purpose:** Centralize access to policies, templates, SOPs, and system links.

**Key Fields:**
- `Link ID`: Unique identifier (LNK-NNN)
- `Task/Phase`: Related task or phase
- `Type`: Policy, Template, Reference, Training, Tool
- `Category`: Subcategory (HR Policy, Tax Policy, Workbook, etc.)
- `URL`: SharePoint or system URL
- `Access Level`: All, Team, Manager, Executive

**Sample Data:** 25 links
- 7 Policies (SOPs, procedures)
- 8 Templates (Excel workbooks)
- 6 References (external systems, portals)
- 2 Training (eLearning)
- 2 Tools (software, systems)

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_links`
- Could use `documents` module if available

---

### 8. **Baselines** (`/data/baselines.csv`)

**Purpose:** Capture snapshots of schedule, budget, and risks for version control and variance tracking.

**Key Fields:**
- `Baseline ID`: Unique identifier (BL-YYYY-MM-XXX)
- `Type`: Schedule, Budget, Risk, Scope
- `Version`: Semantic versioning (1.0, 2.0, etc.)
- `Status`: Draft, Approved, Superseded
- `Change Log`: Version history
- `Restore Instructions`: How to revert

**Sample Data:** 7 baselines
- 3 Approved baselines (Jan 2025 Schedule, Budget, Risk)
- 2 Draft baselines (Feb 2025 Schedule, Budget)
- 2 Annual/Quarterly baselines

**Odoo Mapping:**
- Custom table: `ipai_finance_ppm_baseline`

---

## 🔄 Data Integration with Odoo

### Import Sequence

1. **Master Data First:**
   - Portfolios → Projects → Phases → Tasks
   - Directory (users) → Time Entries
   - Financial Plans (link to phases)

2. **Transactional Data:**
   - Time Entries (ongoing)
   - Financial actuals updates

3. **Reference Data:**
   - Risks, KPIs, Agreements, Links, Baselines

### CSV Import to Odoo

```python
# Example: Import Financial Plans to Odoo
import csv
from odoo import api, models

@api.model
def import_financial_plans(self, filepath):
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            self.env['ipai.finance.ppm.finplan'].create({
                'name': row['Plan ID'],
                'phase_wbs': row['Project WBS'],
                'budget_type': row['Budget Type'],
                'planned_amount': float(row['Planned Amount']),
                'actual_spend': float(row['Actual Spend']),
                'forecast': float(row['Forecast']),
                'period': row['Period'],
                'state': row['Status'].lower(),
                'owner_id': self._get_user_by_code(row['Owner']),
            })
```

---

## 📊 Dashboard Queries

### Example: Budget Dashboard

```typescript
// Total Budget vs Actual by Phase
const budgetByPhase = sampleFinancialPlans
  .filter(p => p.period === 'Jan 2025')
  .reduce((acc, plan) => {
    if (!acc[plan.projectWbs]) {
      acc[plan.projectWbs] = { planned: 0, actual: 0 };
    }
    acc[plan.projectWbs].planned += plan.plannedAmount;
    acc[plan.projectWbs].actual += plan.actualSpend;
    return acc;
  }, {});

// Top 5 Over-Budget Categories
const overBudget = sampleFinancialPlans
  .filter(p => p.variance > 0)
  .sort((a, b) => b.variance - a.variance)
  .slice(0, 5);
```

### Example: Risk Heatmap

```typescript
// Group risks by Probability × Impact
const riskMatrix = sampleRisks.reduce((matrix, risk) => {
  const key = `${risk.probability}-${risk.impact}`;
  if (!matrix[key]) matrix[key] = [];
  matrix[key].push(risk);
  return matrix;
}, {});

// Count Critical exposure risks
const criticalRisks = sampleRisks.filter(r => r.exposure === 'Critical').length;
```

### Example: Resource Utilization

```typescript
// Hours by Employee
const utilizationByEmployee = sampleTimeEntries.reduce((acc, entry) => {
  if (!acc[entry.employeeCode]) {
    acc[entry.employeeCode] = { name: entry.employeeName, hours: 0 };
  }
  acc[entry.employeeCode].hours += entry.hours;
  return acc;
}, {});

// Top 5 Most Time-Consuming Tasks
const taskHours = sampleTimeEntries.reduce((acc, entry) => {
  if (!acc[entry.taskId]) {
    acc[entry.taskId] = { name: entry.taskName, hours: 0 };
  }
  acc[entry.taskId].hours += entry.hours;
  return acc;
}, {});
```

---

## 🔗 Linking Data

### WBS Master → Financial Plans
```typescript
// Link tasks to their budget lines
const taskWithBudget = wbsMaster
  .filter(task => task.type === 'Task')
  .map(task => ({
    ...task,
    budget: sampleFinancialPlans.find(
      plan => plan.projectWbs === task.parentWbs && 
              plan.category.includes(task.category)
    ),
  }));
```

### Full Task Schedule → Time Entries
```typescript
// Get total hours per task
const taskScheduleWithHours = fullTaskSchedule.map(task => ({
  ...task,
  totalHours: sampleTimeEntries
    .filter(entry => entry.taskId === task.taskId)
    .reduce((sum, entry) => sum + entry.hours, 0),
}));
```

### Risks → Tasks → KPIs
```typescript
// Calculate risk-based KPIs
const highRiskTasks = sampleRisks
  .filter(r => r.exposure === 'Critical' || r.exposure === 'High')
  .map(r => r.taskPhase);

const mitigatedCount = sampleRisks
  .filter(r => (r.exposure === 'High' || r.exposure === 'Critical') && 
               r.status === 'Mitigated').length;

const totalHighRisks = sampleRisks
  .filter(r => r.exposure === 'High' || r.exposure === 'Critical').length;

const mitigationRate = (mitigatedCount / totalHighRisks) * 100;
// This matches KPI-004: High Risk Mitigation % = 60%
```

---

## 📈 Next Steps

1. **Import to Google Sheets:**
   - Create new sheets for each CSV file
   - Copy/paste or import CSV data
   - Add formulas for calculated fields

2. **Connect to Odoo:**
   - Use Odoo's CSV import feature
   - Map CSV columns to Odoo model fields
   - Validate data integrity

3. **Build Dashboards:**
   - Use data in React components
   - Create charts with Recharts library
   - Implement filters and drill-downs

4. **Set Up Automation:**
   - Automate time entry reminders
   - Calculate KPIs daily/weekly
   - Generate reports automatically

---

## 🎯 Data Quality Notes

- All monetary amounts are in PHP (Philippine Peso)
- Dates follow YYYY-MM-DD format
- Employee codes match Directory sheet (RIM, BOM, JPAL, etc.)
- WBS codes match WBS Master (1.0, 2.0, 3.0, 4.0)
- Task IDs match Full Task Schedule (CT-0001 to CT-0036)
- All sample data is internally consistent and relational

---

## 📝 Formulas Reference

### Financial Calculations
```
Variance = Actual - Planned
Variance % = (Variance / Planned) × 100
Forecast Accuracy = 1 - ABS((Forecast - Actual) / Actual)
```

### KPI Calculations
```
On-Time Rate = (Completed On-Time / Total) × 100
Budget Adherence = 1 - ABS((Actual - Budget) / Budget)
Resource Utilization = (Actual Hours / Planned Hours) × 100
```

### Risk Scoring
```
Exposure = Probability × Impact
Risk Score = (Probability Value × Impact Value) / Max Score × 100
```

**Probability Values:** Low=1, Medium=2, High=3
**Impact Values:** Low=1, Medium=2, High=3, Critical=4
**Max Score:** 12 (High × Critical)

---

For questions or issues with the sample data, refer to the TypeScript module at `/lib/data/financial-data.ts` which includes type definitions and utility functions.
