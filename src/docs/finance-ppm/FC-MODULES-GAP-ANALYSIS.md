# Finance PPM (FC-01 → FC-12) - Gap Analysis & Population Plan

**Opus 4.5 BETA Status Review**

---

## Executive Summary

**What We Have:** Strong foundation in FC-02 (WBS/Tasks), FC-03 (RACI), FC-10 (Checklists), FC-11 (OKRs), FC-12 (Odoo Mapping)

**What We Need:** 7 new data sheets + technical field extensions to complete the 12-module suite

**Completion:** ~40% → Target: 100% production-ready for Odoo 18 CE/OCA import

---

## 1. Current State Analysis (Module by Module)

### FC-01: Portfolio & Strategy Hub

**Status:** ❌ **Not Yet Instantiated** (0%)

**What Exists:**
- Implied portfolio structure (TBWA\SMP Finance Operations)
- High-level objective in LogFrame (OBJ-001, OBJ-002)

**What's Missing:**
- Portfolio master table
- Investment/Program hierarchy
- Strategic roadmap with gates
- Benefits register

**Required New Sheet:** `Portfolio_Hub`

| Portfolio ID | Name                        | Type        | Owner | Horizon | Status |
|--------------|-----------------------------

|-------------|-------|---------|--------|
| FIN-PORT-001 | TBWA\SMP Finance Operations | Operational | CKVC  | 2025    | Active |
| FIN-PORT-002 | TBWA\SMP Compliance & Tax   | Compliance  | CKVC  | 2025    | Active |

**Investment Hierarchy:**

| Investment ID       | Portfolio ID | Name                        | Level   | Owner | Status |
|---------------------|--------------|-----------------------------| --------|-------|--------|
| FIN-INV-2025-MEC    | FIN-PORT-001 | Month-End Closing 2025      | Program | CKVC  | Active |
| FIN-INV-2025-MEC-MN | FIN-INV-2025-MEC | Monthly Close – Philippines | Project | RIM   | Active |

**Strategic Roadmap:**

| Roadmap ID | Investment ID    | Milestone Name              | Target Month | WD# | Gate   |
|------------|------------------|-----------------------------|--------------|-----|--------|
| RM-001     | FIN-INV-2025-MEC | WD+5 Close Achieved Monthly | 2025-12      | 5   | MS-006 |
| RM-002     | FIN-INV-2025-MEC | Zero Audit Findings Q4      | 2025-12      | 7   | MS-007 |

**Odoo Mapping:**
- `ipai_finance_ppm.portfolio` (custom)
- `project.project` (parent_id for hierarchy)
- `project.milestone` (linked to gates)

---

### FC-02: Projects, Phases, Milestones & Tasks

**Status:** ✅ **Strong Foundation** (85%)

**What Exists:**
- **Full Task Schedule:** CT-0001 through CT-0036
- **4 Phases:** I–IV with clear WD boundaries
- **7 Milestones:** MS-001 through MS-007
- **188 WBS rows:** 1 project + 4 phases + 7 milestones + 36 tasks + 144 checklists
- **RACI assignments:** Complete for all tasks

**What's Missing (Technical Fields):**

Add these columns to `Full Task Schedule`:

| Field Name       | Example Value        | Type    | Purpose                          |
|------------------|----------------------|---------|----------------------------------|
| `project_id`     | PRJ-MEC-2025-M12     | String  | Link to project registry         |
| `wbs_code`       | 1.1.1                | String  | Hierarchical code                |
| `wbs_level`      | 3 (Task)             | Integer | 1=Phase, 2=Milestone, 3=Task     |
| `parent_wbs`     | 1.1                  | String  | Parent WBS for hierarchy         |
| `predecessor_id` | CT-0001              | String  | FS (Finish-to-Start) dependency  |
| `start_date`     | 2025-12-02           | Date    | WD-based calculation             |
| `duration_days`  | 1                    | Integer | Mostly 1 for finance tasks       |
| `pct_complete`   | 100                  | Integer | Based on status (Complete=100)   |
| `critical_path`  | TRUE                 | Boolean | Flag for WD+5 constraint         |

**Concrete Example (Enhanced CT-0001):**

| project_id       | wbs_code | task_id | wbs_level | parent_wbs | type | name                                       | phase | stage       | wd  | predecessor_id | start_date | duration | pct_complete | responsible | accountable | status   |
|------------------|----------|---------|-----------|------------|------|--------------------------------------------|-------|-------------|-----|----------------|------------|----------|--------------|-------------|-------------|----------|
| PRJ-MEC-2025-M12 | 1.1.1    | CT-0001 | 3         | 1.1        | Task | Process Payroll, Final Pay, SL Conversions | I     | Preparation | 1   | —              | 2025-12-02 | 1        | 100          | RIM         | CKVC        | Complete |
| PRJ-MEC-2025-M12 | 1.1.2    | CT-0002 | 3         | 1.1        | Task | Calculate Tax Provision and PPB Provision  | I     | Preparation | 1   | CT-0001        | 2025-12-02 | 1        | 100          | RIM         | CKVC        | Complete |

**Odoo Mapping:**
- ✅ `project.task` (already mapped)
- ✅ `project.project` (already mapped)
- ⚠️ Add: `project_phase` (OCA addon)
- ⚠️ Add: `project.milestone` (custom or OCA)

---

### FC-03: Resource, Role & Capacity Planning

**Status:** ✅ **RACI Complete, Missing Capacity** (70%)

**What Exists:**
- **Directory Sheet:** All RACI codes → Names → Emails
  - CKVC, RIM, BOM, LAS, JAP, JLI, JRMO, JMSM, JPAL, RMQB, CSD
- **RACI Assignments:** R/A/C/I mapped to every task

**What's Missing:**

**1. Role Definitions**

Add to `Directory` or create `Roles` sheet:

| Employee Code | Name             | Email                      | Role                     | Team         | FTE | WD Capacity |
|---------------|------------------|----------------------------|--------------------------|--------------|-----|-------------|
| CKVC          | Khalil Veracruz  | khalil.veracruz@omc.com    | Finance Director (A)     | Finance Lead | 1.0 | 7           |
| RIM           | Rey Meran        | rey.meran@omc.com          | Finance Manager (R)      | GL / MEC     | 1.0 | 7           |
| BOM           | Beng Manalo      | beng.manalo@omc.com        | Finance Manager          | Treasury/WIP | 1.0 | 7           |
| LAS           | Amor Lasaga      | amor.lasaga@omc.com        | Senior Accountant        | Expenses/AP  | 1.0 | 7           |
| JLI           | Jenny Li         | jenny.li@omc.com           | VAT Specialist           | Tax/VAT      | 1.0 | 7           |
| JRMO          | Jerome Olarte    | jerome.olarte@omc.com      | Accountant               | WIP/OOP      | 1.0 | 7           |
| JPAL          | Jinky Paladin    | jinky.paladin@omc.com      | Accountant               | Reporting    | 1.0 | 7           |
| RMQB          | Sally Brillantes | sally.brillantes@omc.com   | Controller               | Governance   | 1.0 | 7           |
| CSD           | Cliff Dejecacion | cliff.dejecacion@omc.com   | CFO / Regional Oversight | Exec         | 0.3 | 2           |

**2. Capacity Curves**

Create `Resource_Capacity` sheet:

| Period  | Employee Code | Planned Hours | Allocated Hours | % Utilization | Notes                   |
|---------|---------------|---------------|-----------------|---------------|-------------------------|
| 2025-12 | RIM           | 56            | 52              | 93%           | MEC lead                |
| 2025-12 | JLI           | 56            | 48              | 86%           | VAT heavy month         |
| 2025-12 | JRMO          | 56            | 60              | 107%          | ⚠️ WIP overload (WD3-4) |

**Odoo Mapping:**
- ✅ `hr.employee` (already in Odoo core)
- ✅ `res.users` (already in Odoo core)
- ⚠️ Add: `project_role` (OCA addon)
- ⚠️ Add: `ipai_finance_ppm_capacity` (custom model)

---

### FC-04: Time, Timesheets & Expenses

**Status:** ❌ **No Data Yet** (0%)

**What's Missing:** Everything

**Required New Sheets:**

**1. `Time_Entries`**

| Entry ID | Period  | Date       | Employee | Task ID | Hours | Billable | Notes                      |
|----------|---------|------------|----------|---------|-------|----------|----------------------------|
| TE-0001  | 2025-12 | 2025-12-02 | RIM      | CT-0001 | 4.0   | No       | Payroll and SL conversions |
| TE-0002  | 2025-12 | 2025-12-02 | JLI      | CT-0003 | 3.5   | No       | Input VAT compilation      |
| TE-0003  | 2025-12 | 2025-12-03 | JRMO     | CT-0023 | 6.0   | No       | WIP roll-forward           |

**2. `Expenses`**

| Expense ID | Date       | Employee | Category     | Amount | Project ID       | Notes         |
|------------|------------|----------|--------------|--------|------------------|---------------|
| EX-0001    | 2025-12-03 | BOM      | Bank Charges | 2,500  | PRJ-MEC-2025-M12 | MEC bank fees |
| EX-0002    | 2025-12-05 | LAS      | Travel       | 1,200  | PRJ-MEC-2025-M12 | Audit meeting |

**Odoo Mapping:**
- `hr_timesheet` (OCA addon)
- `hr.expense` (Odoo core)
- `account.analytic.line` (time entries)

---

### FC-05: Financial Plans, Budgets & Forecasts

**Status:** ❌ **No Data Yet** (0%)

**What's Missing:** Budget/forecast tables

**Required New Sheet:** `Financial_Plans`

**Per-Phase Budget Lines:**

| Plan ID       | Project ID       | Version | Cost Type | Phase                   | Period  | Amount  | Currency | Notes                  |
|---------------|------------------|---------|-----------|-------------------------|---------|---------|----------|------------------------|
| FP-2025-12-01 | PRJ-MEC-2025-M12 | V1      | OPEX      | I. Initial & Compliance | 2025-12 | 120,000 | PHP      | Payroll + compliance   |
| FP-2025-12-02 | PRJ-MEC-2025-M12 | V1      | OPEX      | II. Accruals & Amort.   | 2025-12 | 80,000  | PHP      | Accruals + depreciation|
| FP-2025-12-03 | PRJ-MEC-2025-M12 | V1      | OPEX      | III. WIP & OOP          | 2025-12 | 60,000  | PHP      | WIP reconciliation     |
| FP-2025-12-04 | PRJ-MEC-2025-M12 | V1      | OPEX      | IV. Final Adjustments   | 2025-12 | 40,000  | PHP      | Close + reporting      |

**Benefit Profiles:**

| Benefit ID | Portfolio ID | Name                                | Type       | Planned Value | Period  | Owner |
|------------|--------------|-------------------------------------|------------|---------------|---------|-------|
| BEN-001    | FIN-PORT-001 | Reduced MEC cycle from WD+7 to WD+5 | Process    | 2 days saved  | 2025-Q4 | CKVC  |
| BEN-002    | FIN-PORT-002 | Zero VAT penalties in 2026          | Compliance | PHP 0 penalty | 2026    | JLI   |

**Odoo Mapping:**
- `account.analytic.account` (Odoo core)
- `account_budget` (OCA addon)
- `ipai_finance_ppm_finplan` (custom)

---

### FC-06: Agreements, Contracts & Billing Rules

**Status:** ❌ **No Data Yet** (0%)

**What's Missing:** Contract/SLA register

**Required New Sheet:** `Agreements_Contracts`

**Internal SLAs:**

| Agreement ID | Type     | Counterparty  | Scope                                 | Start      | End        | Billing Type | Owner |
|--------------|----------|---------------|---------------------------------------|------------|------------|--------------|-------|
| AGR-INT-001  | Internal | TBWA\SMP Ops  | Month-end close WD+5, Flash by WD+6   | 2025-01-01 | 2025-12-31 | N/A          | CKVC  |
| AGR-EXT-001  | External | Omnicom Group | Reporting package to regional finance | 2025-01-01 | 2025-12-31 | N/A          | CSD   |

**Billing Rules (If Turning Finance into BPO Service):**

| Rule ID | Agreement ID | Service        | Unit       | Rate | Currency | Notes                     |
|---------|--------------|----------------|------------|------|----------|---------------------------|
| BR-001  | AGR-INT-001  | Month-End Close| Per Period | 0    | PHP      | Internal – no charge back |

**Odoo Mapping:**
- `contract` (OCA addon)
- `sale.order` (Odoo core for billing)
- `ipai_finance_ppm_agreements` (custom)

---

### FC-07: Risks, Issues, Changes & Audit

**Status:** ❌ **No Data Yet** (0%)

**What's Missing:** Risk/issue register

**Required New Sheet:** `Risk_Issue_Register`

**Realistic Risks from Finance Tasks:**

| ID     | Type   | Title                                       | Linked Task | Owner | Probability | Impact | Exposure | Status      | Target WD | Mitigation                          |
|--------|--------|---------------------------------------------|-------------|-------|-------------|--------|----------|-------------|-----------|-------------------------------------|
| R-001  | Risk   | Late CA liquidations can delay MEC          | CT-0005     | RIM   | High        | Medium | High     | Open        | WD+1      | Daily CA follow-up with employees   |
| R-002  | Risk   | VAT report misstatement due to missing docs | CT-0003     | JLI   | Medium      | High   | High     | Open        | WD+1      | Pre-close VAT doc checklist         |
| R-003  | Risk   | WIP schedule not reconciling to GL          | CT-0025     | JRMO  | Medium      | High   | High     | Open        | WD+3      | Weekly WIP reconciliation           |
| I-001  | Issue  | December WIP schedule variance PHP 2.5M     | CT-0025     | JRMO  | —           | High   | High     | In Progress | WD+4      | Root cause analysis in progress     |
| CR-001 | Change | Move Flash report due date to WD+6          | CT-0036     | CKVC  | —           | Medium | —        | Proposed    | WD+6      | Awaiting CSD approval               |

**Audit Findings:**

| Finding ID | Area | Description                                  | Risk ID | Owner | Due Date   | Status |
|------------|------|----------------------------------------------|---------|-------|------------|--------|
| AF-001     | MEC  | No formal evidence of CT-0001 checklist used | R-001   | RIM   | 2025-12-31 | Open   |

**Odoo Mapping:**
- `project_risk` (OCA addon or custom)
- `project_issue` (OCA addon or custom)
- `ipai_finance_ppm_audit` (custom)

---

### FC-08: Status Reports, Dashboards & Widgets Library

**Status:** ⚠️ **Partial** (40%)

**What Exists:**
- **LogFrame OKRs:** OBJ-001, OBJ-002 with progress metrics
- **Implied KPIs:** WD+5 close, zero VAT penalties

**What's Missing:**
- **Status snapshot register**
- **KPI master catalog**
- **Widget/report library**

**Required New Sheets:**

**1. `Status_Reports`**

| Status ID  | Date       | Project ID       | Period  | RAG | Summary                                    | Risks Key   | Next Steps                          |
|------------|------------|------------------|---------|-----|--------------------------------------------|-------------|-------------------------------------|
| SR-2025-12 | 2025-12-08 | PRJ-MEC-2025-M12 | 2025-12 | 🟡  | WD+1: Compliance on track, VAT in progress | R-001,R-002 | Complete VAT entries, reconcile WIP |
| SR-2025-11 | 2025-11-30 | PRJ-MEC-2025-M11 | 2025-11 | 🟢  | November close achieved WD+5               | None        | Carry learnings to December         |

**2. `KPI_Registry`**

| KPI ID  | Name                      | Formula                             | Owner | Target | Actual | Period  | Status |
|---------|---------------------------|-------------------------------------|-------|--------|--------|---------|--------|
| KPI-001 | MEC Cycle Time (WD)       | Max(WD of all CT tasks) - WD0       | RIM   | ≤ 5    | —      | 2025-12 | TBD    |
| KPI-002 | VAT Filing Timeliness (%) | On-time VAT filings / Total periods | JLI   | 100%   | 100%   | 2025-11 | 🟢     |
| KPI-003 | Audit Findings Count      | Count(AF-*)                         | CKVC  | 0      | 1      | 2025-Q4 | 🟡     |

**Odoo Mapping:**
- `mis_report` (OCA Management Information System)
- `mis_report_instance` (snapshots)
- `ipai_finance_ppm_status` (custom)

---

### FC-09: Collaboration (Conversations, Links, Documents)

**Status:** ❌ **No Data Yet** (0%)

**What's Missing:** Conversation/link log

**Required New Sheet:** `Conversations_Links`

| Conv ID  | Date       | Project ID       | Task ID | Type         | Summary                                      | Link                      | Author |
|----------|------------|------------------|---------|--------------|----------------------------------------------|---------------------------|--------|
| CONV-001 | 2025-12-02 | PRJ-MEC-2025-M12 | CT-0003 | Comment      | JLI flagged missing VAT invoices from vendor | (link to email / doc)     | JLI    |
| CONV-002 | 2025-12-03 | PRJ-MEC-2025-M12 | CT-0025 | Discussion   | WIP variance analysis – need client input    | (link to Teams chat)      | JRMO   |
| LINK-001 | 2025-12-01 | PRJ-MEC-2025-M12 | CT-0036 | Flash Report | December Flash template                      | (link to GDrive template) | JPAL   |
| DOC-001  | 2025-12-01 | PRJ-MEC-2025-M12 | CT-0001 | Checklist    | Payroll checklist evidence                   | (link to Notion/GDrive)   | RIM    |

**Odoo Mapping:**
- `mail.message` (Odoo core – chatter)
- `mail.activity` (Odoo core – tasks/reminders)
- `ipai_finance_ppm_collab` (custom for links)

---

### FC-10: Templates, Checklists & Baselines

**Status:** ✅ **Checklists Done, Missing Baselines** (60%)

**What Exists:**
- **Detailed Checklist:** All 144 checklist items for CT-0001–CT-0036

**What's Missing:**
- **Baseline snapshots**
- **Template library**

**Required New Sheet:** `Baselines`

| Baseline ID      | Period  | Project ID       | Scope                 | Captured On | Source             | Status   |
|------------------|---------|------------------|-----------------------|-------------|--------------------|----------|
| BL-2025-12-SCHED | 2025-12 | PRJ-MEC-2025-M12 | Schedule + WD mapping | 2025-12-01  | Full Task Schedule | Approved |
| BL-2025-12-BUDG  | 2025-12 | PRJ-MEC-2025-M12 | Budget plan V1        | 2025-11-25  | Financial_Plans    | Approved |

**Template Library:**

| Template ID | Name                   | Category       | Path/Link              | Owner |
|-------------|------------------------|----------------|------------------------|-------|
| TPL-001     | MEC Task Schedule      | Schedule       | /templates/mec_wbs.xlsx| RIM   |
| TPL-002     | VAT Compliance Checklist| Compliance    | /templates/vat_check   | JLI   |
| TPL-003     | Flash Report Template  | Reporting      | /templates/flash.pptx  | JPAL  |

**Odoo Mapping:**
- `project.task.type` (Odoo core – for templates)
- `ipai_finance_ppm_baselines` (custom)

---

### FC-11: AI Assistant & RAG Control Plane

**Status:** ✅ **OKRs + Mapping Done, Missing Prompts** (50%)

**What Exists:**
- **LogFrame:** OBJ-001, OBJ-002 with progress tracking
- **Odoo OCA Mapping:** Complete model/field mapping

**What's Missing:**
- **RBAC/Context profiles**
- **Prompt library**
- **RAG configuration**

**Required New Sheet:** `AI_Control_Plane`

**Context Profiles:**

| Profile ID | Name                    | Scope                     | Data Sources                                             |
|------------|-------------------------|---------------------------|----------------------------------------------------------|
| PROF-FIN   | Finance Specialist      | MEC, VAT, BIR, audit      | Full Task Schedule, Risk_Issue_Register, Financial_Plans |
| PROF-PM    | Project Manager – MEC   | Tasks, WBS, RACI, KPIs    | WBS Master, Status_Reports                               |
| PROF-EXEC  | Executive Summary (CFO) | Portfolio, benefits, KPIs | Portfolio_Hub, Status_Reports, KPI Registry              |

**Prompt Library:**

| Prompt ID | Name                  | Profile   | Instruction (short label)                    | Template                                                           |
|-----------|-----------------------|-----------|----------------------------------------------|--------------------------------------------------------------------|
| PR-001    | Draft MEC WD+1 status | PROF-PM   | Summarize completed CT-0001–CT-0007 vs plan  | "Generate WD+1 status report for {period} with RAG assessment"    |
| PR-002    | VAT risk check        | PROF-FIN  | Inspect tasks tagged `VAT & Taxes` & risks   | "List all VAT-related tasks and open risks for {period}"           |
| PR-003    | Close readiness check | PROF-EXEC | Answer "Are we safe to close books by WD+5?" | "Assess MEC readiness for WD+5 close based on task progress & risks"|

**Odoo Mapping:**
- `ipai_finance_ppm_ai_bridge` (custom – RAG connector)
- `ipai_finance_ppm_prompt` (custom – prompt library)

---

### FC-12: Integration & Schema Catalog

**Status:** ✅ **Concept Mapping Done, Missing Pipeline** (50%)

**What Exists:**
- **Odoo OCA Mapping:** Complete field-level mapping for project.task, project.project, etc.

**What's Missing:**
- **Integration connector inventory**
- **Sync log/pipeline status**

**Required New Sheet:** `Integration_Catalog`

| Connector ID   | System         | Direction | Entity        | Source Table/Model           | Target Model / API               | Owner | Status |
|----------------|----------------|-----------|---------------|------------------------------|----------------------------------|-------|--------|
| INT-ODOO-001   | Odoo 18 CE     | Inbound   | Tasks         | Full Task Schedule           | project.task                     | RIM   | Active |
| INT-ODOO-002   | Odoo 18 CE     | Inbound   | Phases & WBS  | WBS Master                   | project_phase, project.milestone | RIM   | Active |
| INT-ODOO-003   | Odoo 18 CE     | Inbound   | RACI          | Directory                    | hr.employee, project.assignment  | RIM   | Active |
| INT-RAG-001    | Supabase RAG   | Outbound  | MEC Knowledge | All Opus sheets              | ipai_finance_ppm_ai_bridge       | Jake  | Planned|
| INT-REPORT-001 | BI / Dashboard | Outbound  | KPIs / Status | Status_Reports, KPI Registry | Superset/Supabase views          | Jake  | Planned|

**Sync Logs:**

| Sync ID      | Connector ID | Timestamp           | Records | Status  | Errors |
|--------------|--------------|---------------------|---------|---------|--------|
| SYN-001      | INT-ODOO-001 | 2025-12-01 08:00:00 | 36      | Success | 0      |
| SYN-002      | INT-ODOO-002 | 2025-12-01 08:05:00 | 4       | Success | 0      |

**Odoo Mapping:**
- `ipai_finance_ppm_integration` (custom)
- `ipai_finance_ppm_sync_log` (custom)

---

## 2. Concrete To-Do List to Complete Opus 4.5 BETA

### Priority 1: Lock Foundation (FC-02, FC-03)

**Tasks:**
1. ✅ Add technical fields to `Full Task Schedule`:
   - `project_id`, `wbs_code`, `wbs_level`, `parent_wbs`, `predecessor_id`, `start_date`, `duration_days`, `pct_complete`
2. ✅ Enhance `Directory` with role + team columns
3. ✅ Create `Resource_Capacity` sheet with utilization tracking

**Deliverable:** Enhanced WBS Master ready for Odoo import

---

### Priority 2: Create Missing Data Sheets (FC-01, FC-07, FC-08)

**Tasks:**
1. ✅ Create `Portfolio_Hub` sheet
   - 2-3 portfolios
   - Investment hierarchy
   - Strategic roadmap
2. ✅ Create `Risk_Issue_Register` sheet
   - 5-10 realistic risks from MEC process
   - 2-3 active issues
   - Link to tasks
3. ✅ Create `Status_Reports` + `KPI_Registry` sheets
   - At least 1 status snapshot for 2025-12
   - 3-5 KPIs with targets

**Deliverable:** Core governance + monitoring data

---

### Priority 3: Add Finance Layer (FC-05)

**Tasks:**
1. ✅ Create `Financial_Plans` sheet
   - Per-phase budget lines
   - Benefit profiles
2. ✅ Link budgets to WBS phases

**Deliverable:** Budget visibility for finance dashboards

---

### Priority 4: Add Integration Catalog (FC-12)

**Tasks:**
1. ✅ Create `Integration_Catalog` sheet
   - Odoo connectors
   - RAG bridge
   - BI reporting
2. ✅ Add sync log tracking

**Deliverable:** Integration transparency for DevOps

---

### Priority 5: Optional Enhancements (FC-04, FC-06, FC-09, FC-10, FC-11)

**Tasks (Lower Priority for BETA):**
1. ⚠️ `Time_Entries` – Can start with empty structure
2. ⚠️ `Expenses` – Can start with empty structure
3. ⚠️ `Agreements_Contracts` – Add internal SLAs only
4. ⚠️ `Conversations_Links` – Add 2-3 sample links
5. ⚠️ `Baselines` – Snapshot current WBS as BL-2025-12-SCHED
6. ⚠️ `AI_Control_Plane` – Add 3 profiles + 3-5 prompts

**Deliverable:** Complete FC suite structure (even if some sheets are 10% populated)

---

## 3. Odoo 18 CE/OCA Import Strategy

### Phase 1: Core Models (Weeks 1-2)

**Import Order:**
1. `Portfolio_Hub` → `project.project` (with parent_id hierarchy)
2. `Full Task Schedule` (enhanced) → `project.task` + `project_phase`
3. `Directory` → `hr.employee` + `res.users`
4. `Resource_Capacity` → Custom `ipai_finance_ppm_capacity`

**OCA Addons Required:**
- `project_phase` (or custom)
- `project_milestone` (or custom)
- `project_timeline` (Gantt view)

---

### Phase 2: Governance & Monitoring (Weeks 3-4)

**Import Order:**
1. `Risk_Issue_Register` → Custom `project_risk`, `project_issue`
2. `Status_Reports` → Custom `ipai_finance_ppm_status`
3. `KPI_Registry` → `mis_report` (OCA MIS Builder)
4. `Financial_Plans` → `account_budget` (OCA)

**OCA Addons Required:**
- `mis_builder` (Management Information System)
- `account_budget_oca`

---

### Phase 3: AI & Integration (Week 5)

**Import Order:**
1. `AI_Control_Plane` → Custom `ipai_finance_ppm_ai_bridge`
2. `Integration_Catalog` → Custom `ipai_finance_ppm_integration`

---

## 4. Next Step: CSV Export Templates

Would you like me to generate **Odoo CSV import templates** with exact column headers for each FC module?

**Example Template Structure:**

**`project_task_import.csv`:**
```csv
id,name,wbs_code,wbs_level,parent_id/id,project_id/id,user_ids/id,stage_id/id,date_deadline,progress,responsible_id/id,accountable_id/id
CT-0001,Process Payroll...,1.1.1,3,PHASE-I,PRJ-MEC-2025-M12,RIM,stage_preparation,2025-12-02,100,RIM,CKVC
```

Let me know if you want:
- ✅ **CSV templates for all FC modules**
- ✅ **Python import scripts** (using Odoo XML-RPC)
- ✅ **SQL migration files** (for direct PostgreSQL load)

---

**Status:** Ready to complete Opus 4.5 BETA → 100% production-ready! 🚀

**Last Updated:** 2025-12-07  
**Version:** Opus 4.5 BETA  
**Completion:** 40% → Target: 100%
