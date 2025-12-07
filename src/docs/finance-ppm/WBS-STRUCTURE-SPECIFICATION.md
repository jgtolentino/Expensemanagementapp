# WBS Structure Specification for Finance PPM (Odoo 18 CE + OCA)

**Project:** Month-End Financial Close  
**Framework:** FC-02 Projects, Phases, Milestones & Tasks  
**Target System:** Odoo 18 CE + OCA (`project`, `project_milestone`, `project_task_dependency`)

---

## WBS Hierarchy Design

### Level Definition

| Level | Type | Odoo Model | Purpose | Example |
|-------|------|------------|---------|---------|
| **0** | Project | `project.project` | Top-level container | Month-End Closing |
| **1** | Phase | `project.task` (is_phase=TRUE) | Major work packages | I. Initial & Compliance |
| **2** | Milestone | `project.milestone` | Gate reviews / key deliverables | ✓ Compliance Tasks Complete |
| **3** | Task | `project.task` | Actionable work items | Process Payroll, Final Pay, SL |
| **4** | Checklist | `project.task` (subtask) OR `mail.activity` | Micro-actions | ☐ Gather payroll data |

---

## New Columns to Add to "Full Task Schedule"

### Column Mapping (R-X)

| Column | Field Name | Type | Formula/Value | Odoo Field | Purpose |
|--------|------------|------|---------------|------------|---------|
| **R** | WBS Code | Text | Auto-generated | `x_wbs_code` | Hierarchical ID (1.0, 1.1.1, 1.1.1.1) |
| **S** | Level | Number | Calculated | `x_wbs_level` | 0-4 depth indicator |
| **T** | Type | Dropdown | Phase/Milestone/Task/Checklist | `x_task_type` | Record type |
| **U** | Parent WBS | Lookup | References parent | `parent_id` | Links to parent task |
| **V** | Predecessor | Text | Previous Task ID | `depend_on_ids` | Task dependencies |
| **W** | Start Date | Date | =K2-Duration | `date_start` | Planned start |
| **X** | Duration | Number | Based on WD# grouping | `x_duration` | Days to complete |

---

## WBS Code Generation Logic

### Formula for Column R (WBS Code)

```excel
=IF(T2="Project", "0.0",
  IF(T2="Phase", TEXT(COUNTIF($T$2:T2,"Phase"), "0.0"),
    IF(T2="Milestone", 
      TEXT(COUNTIF($T$2:T2,"Phase"), "0") & "." & TEXT(COUNTIFS($T$2:T2,"Milestone",$U$2:U2,U2), "0"),
      IF(T2="Task",
        TEXT(COUNTIF($T$2:T2,"Phase"), "0") & "." & TEXT(COUNTIFS($T$2:T2,"Task",$U$2:U2,U2), "0") & "." & TEXT(COUNTIFS($T$2:T2,"Task",$U$2:U2,U2,$B$2:B2,B2), "0"),
        IF(T2="Checklist",
          U2 & "." & TEXT(COUNTIFS($T$2:T2,"Checklist",$U$2:U2,U2), "0"),
          "")))))
```

### Example WBS Codes

| Type | WBS Code | Name |
|------|----------|------|
| Project | 0.0 | Month-End Closing |
| Phase | 1.0 | I. Initial & Compliance |
| Milestone | 1.1 | ✓ Compliance Tasks Complete |
| Task | 1.1.1 | Process Payroll, Final Pay, SL Conversions |
| Checklist | 1.1.1.1 | ☐ Gather payroll data |
| Checklist | 1.1.1.2 | ☐ Verify Final Pay |
| Checklist | 1.1.1.3 | ☐ Process SL conversions |
| Task | 1.1.2 | Calculate Tax Provision and PPB Provision |
| Phase | 2.0 | II. Accruals & Amortization |
| Milestone | 2.1 | ✓ All Accruals Posted |

---

## Level Calculation Logic

### Formula for Column S (Level)

```excel
=IF(T2="Project", 0,
  IF(T2="Phase", 1,
    IF(T2="Milestone", 2,
      IF(T2="Task", 3,
        IF(T2="Checklist", 4, "")))))
```

---

## Parent WBS Lookup Logic

### Formula for Column U (Parent WBS)

For **Phases**: Leave blank (parent is Project)  
For **Milestones**: Reference the Phase WBS code (e.g., "1.0")  
For **Tasks**: Reference the Phase WBS code (e.g., "1.0")  
For **Checklists**: Reference the parent Task WBS code (e.g., "1.1.1")

```excel
=IF(T2="Phase", "0.0",
  IF(T2="Milestone", 
    VLOOKUP(...find parent phase...),
    IF(OR(T2="Task", T2="Checklist"),
      [...lookup parent...],
      "")))
```

---

## Complete WBS Hierarchy Example

### Month-End Closing (WD1-WD7)

```
0.0 [PROJECT] Month-End Financial Close (Dec 2025)
│
├─ 1.0 [PHASE] I. Initial & Compliance (WD1)
│  ├─ 1.1 [MILESTONE] ✓ Compliance Tasks Complete
│  │  ├─ 1.1.1 [TASK] CT-0001: Process Payroll, Final Pay, SL Conversions
│  │  │  ├─ 1.1.1.1 [CHECKLIST] ☐ Gather payroll data from HR
│  │  │  ├─ 1.1.1.2 [CHECKLIST] ☐ Verify Final Pay computations
│  │  │  ├─ 1.1.1.3 [CHECKLIST] ☐ Process SL conversions
│  │  │  └─ 1.1.1.4 [CHECKLIST] ☐ Post journal entry to GL
│  │  ├─ 1.1.2 [TASK] CT-0002: Calculate Tax Provision and PPB Provision
│  │  ├─ 1.1.3 [TASK] CT-0003: Record SSS & PHIC Contributions
│  │  ├─ 1.1.4 [TASK] CT-0004: Input Suppliers & Process Withholding Tax
│  │  ├─ 1.1.5 [TASK] CT-0005: Liquidate Cash Advances
│  │  ├─ 1.1.6 [TASK] CT-0006: Generate Aging Reports
│  │  └─ 1.1.7 [TASK] CT-0007: Adjust Output VAT
│  │
│  └─ [No more milestones in Phase I]
│
├─ 2.0 [PHASE] II. Accruals & Amortization (WD2)
│  ├─ 2.1 [MILESTONE] ✓ All Accruals Posted
│  │  ├─ 2.1.1 [TASK] CT-0008: Record Consultancy Fees
│  │  ├─ 2.1.2 [TASK] CT-0009: Amortize Prepaid Expenses
│  │  ├─ 2.1.3 [TASK] CT-0010: Depreciation Run
│  │  └─ 2.1.4 [TASK] CT-0011: Review & Adjust Amortization Schedules
│  │
│  └─ [No more milestones in Phase II]
│
├─ 3.0 [PHASE] III. WIP (Work-in-Progress) (WD3-WD4)
│  ├─ 3.1 [MILESTONE] ✓ WIP Reconciled
│  │  ├─ 3.1.1 [TASK] CT-0012: Extract WIP from TimeLive
│  │  ├─ 3.1.2 [TASK] CT-0013: Reconcile WIP Schedule to GL
│  │  └─ 3.1.3 [TASK] CT-0014: Calculate Realized Project Profit/Loss
│  │
│  └─ [No more milestones in Phase III]
│
├─ 4.0 [PHASE] IV. Final Adjustments & Review (WD5)
│  ├─ 4.1 [MILESTONE] ✓ Adjustments Complete
│  │  ├─ 4.1.1 [TASK] CT-0015: Reclassify Current vs Non-Current Assets/Liab
│  │  ├─ 4.1.2 [TASK] CT-0016: Update Aging Reports
│  │  ├─ 4.1.3 [TASK] CT-0017: Review Intercompany Balances
│  │  └─ 4.1.4 [TASK] CT-0018: Record Other Adjustments
│  │
│  └─ 4.2 [MILESTONE] ✓ TB Signed Off
│     └─ 4.2.1 [TASK] CT-0037: Final TB Review and Sign-off
│
├─ 5.0 [PHASE] V. Approval & Reporting (WD6)
│  ├─ 5.1 [MILESTONE] ✓ Regional Reports Submitted
│  │  ├─ 5.1.1 [TASK] CT-0019: Flash Report (P&L, TB, BS)
│  │  ├─ 5.1.2 [TASK] CT-0020: Wages & Labor Report
│  │  ├─ 5.1.3 [TASK] CT-0021: Revenue Report
│  │  └─ 5.1.4 [TASK] CT-0022: Submit to Regional Office
│  │
│  └─ [No more milestones in Phase V]
│
└─ 6.0 [PHASE] VI. Close & Archive (WD7)
   └─ 6.1 [MILESTONE] ✓ Period Closed
      ├─ 6.1.1 [TASK] CT-0035: Lock Period in System
      ├─ 6.1.2 [TASK] CT-0036: Archive Documents
      └─ 6.1.3 [TASK] CT-0023: Post-Close Retrospective
```

---

## RACI Integration

### How to Map RACI from Directory to WBS

| RACI Role | WBS Level | Odoo Field | Behavior |
|-----------|-----------|------------|----------|
| **R** (Responsible) | Task, Checklist | `user_ids` | Multiple assignees OK |
| **A** (Accountable) | Phase, Milestone, Task | `x_accountable_id` | Single owner (many2one) |
| **C** (Consulted) | Task | `x_consulted_ids` | Many2many users |
| **I** (Informed) | Milestone, Phase | `x_informed_ids` | Many2many users |

### Example RACI Application

| WBS Code | Name | R | A | C | I |
|----------|------|---|---|---|---|
| 1.0 | Phase I | — | CKVC | — | — |
| 1.1 | ✓ Compliance Complete | RIM | CKVC | — | BOM |
| 1.1.1 | CT-0001: Process Payroll | RIM | CKVC | RIM | BOM |
| 1.1.1.1 | ☐ Gather payroll data | RIM | — | — | — |

---

## Predecessor/Dependency Logic

### Dependency Types (Odoo OCA `project_task_dependency`)

| Type | Code | Meaning | Example |
|------|------|---------|---------|
| Finish-to-Start | FS | Task B starts when A finishes | Most common |
| Start-to-Start | SS | Task B starts when A starts | Parallel work |
| Finish-to-Finish | FF | Task B finishes when A finishes | Coordinated completion |
| Start-to-Finish | SF | Task B finishes when A starts | Rare |

### Example Dependencies

| Task | Predecessor | Type | Meaning |
|------|-------------|------|---------|
| CT-0002 | CT-0001 | FS | Can't calc tax until payroll posted |
| CT-0008 | 1.1 (Milestone) | FS | Can't start accruals until compliance done |
| CT-0037 | CT-0036 | FS | TB review after all adjustments |

---

## Duration & Start Date Calculation

### Working Days (WD#) to Duration

Your tasks are grouped by Working Day (WD1-WD7). Convert to duration:

| WD Group | Tasks | Duration (Days) | Logic |
|----------|-------|-----------------|-------|
| WD1 | CT-0001 to CT-0007 | 1 | All done same day |
| WD2 | CT-0008 to CT-0011 | 1 | All done same day |
| WD3-WD4 | CT-0012 to CT-0014 | 2 | Spans 2 days |
| WD5 | CT-0015 to CT-0018, CT-0037 | 1 | All done same day |
| WD6 | CT-0019 to CT-0022 | 1 | All done same day |
| WD7 | CT-0035, CT-0036, CT-0023 | 1 | All done same day |

### Start Date Formula (Column W)

```excel
=IF(V2="", K2-X2, 
  VLOOKUP(V2, B:K, 10, FALSE))
```

*Logic: If no predecessor, start = due date - duration. If predecessor exists, start = predecessor's due date.*

---

## Seed Data Example (First 10 Rows)

| A (WBS) | B (ID) | C (Lvl) | D (Type) | E (Name) | F (Desc) | G (Parent) | H (Pred) | I (Start) | J (Due) | K (Dur) | L (% Done) | M (Status) | N (Stage) | O (R) | P (A) | Q (C) | R (I) |
|---------|--------|---------|----------|----------|----------|------------|----------|-----------|---------|---------|------------|-----------|-----------|-------|-------|-------|-------|
| 0.0 | PROJ-001 | 0 | Project | Month-End Closing Dec 2025 | Recurring monthly financial close | — | — | 2025-12-01 | 2025-12-07 | 7 | 0 | Not Started | — | — | CKVC | — | — |
| 1.0 | PH-001 | 1 | Phase | I. Initial & Compliance | Statutory & regulatory tasks | 0.0 | — | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | Preparation | — | CKVC | — | — |
| 1.1 | MS-001 | 2 | Milestone | ✓ Compliance Tasks Complete | Gate: All statutory items posted | 1.0 | — | — | 2025-12-01 | — | — | Not Reached | — | RIM | CKVC | — | BOM |
| 1.1.1 | CT-0001 | 3 | Task | Process Payroll, Final Pay, SL Conversions | Post payroll-related entries | 1.0 | — | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | Preparation | RIM | CKVC | RIM | BOM |
| 1.1.1.1 | CL-0001 | 4 | Checklist | ☐ Gather payroll data from HR | Collect payroll register | 1.1.1 | — | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | — | RIM | — | — | — |
| 1.1.1.2 | CL-0002 | 4 | Checklist | ☐ Verify Final Pay computations | Validate final pay calculations | 1.1.1 | 1.1.1.1 | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | — | RIM | — | — | — |
| 1.1.1.3 | CL-0003 | 4 | Checklist | ☐ Process SL conversions | Convert SL to vacation leave | 1.1.1 | 1.1.1.2 | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | — | RIM | — | — | — |
| 1.1.1.4 | CL-0004 | 4 | Checklist | ☐ Post journal entry to GL | Record payroll JE | 1.1.1 | 1.1.1.3 | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | — | RIM | — | — | — |
| 1.1.2 | CT-0002 | 3 | Task | Calculate Tax Provision and PPB Provision | Compute tax accruals | 1.0 | 1.1.1 | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | Preparation | RIM | CKVC | RIM | BOM |
| 1.1.3 | CT-0003 | 3 | Task | Record SSS & PHIC Contributions | Post statutory contributions | 1.0 | 1.1.2 | 2025-12-01 | 2025-12-01 | 1 | 0 | Not Started | Preparation | RIM | CKVC | RIM | BOM |

---

## Milestones Definition

### Key Milestones (Gate Reviews)

| Milestone ID | Name | Phase | Due (WD#) | Deliverable | Approval Required |
|-------------|------|-------|-----------|-------------|-------------------|
| MS-001 | Compliance Complete | I | WD1 | All statutory items posted | CKVC |
| MS-002 | Accruals Posted | II | WD2 | All accruals & depreciation complete | CKVC |
| MS-003 | WIP Reconciled | III | WD4 | WIP schedule balanced | CKVC |
| MS-004 | Adjustments Complete | IV | WD5 | All reclasses done | CKVC |
| MS-005 | Regional Reports Submitted | V | WD6 | Flash, W&L, Revenue reports sent | CKVC |
| MS-006 | TB Signed Off | IV | WD5 | Final TB approved | CKVC (A) + BOM (I) |
| MS-007 | Period Closed | VI | WD7 | System locked, docs archived | CKVC |

---

## Odoo Import CSV Structure

### project.task CSV Format

```csv
id,external_id,name,project_id/id,parent_id/id,x_wbs_code,x_wbs_level,x_task_type,date_start,date_deadline,x_duration,progress,kanban_state,stage_id/id,user_ids/id,x_accountable_id/id,x_consulted_ids/id,x_informed_ids/id,depend_on_ids/id,description
task_001,CT-0001,Process Payroll Final Pay SL Conversions,project_mec,task_phase_001,1.1.1,3,task,2025-12-01,2025-12-01,1,0,normal,stage_prep,base.user_rim,base.user_ckvc,"base.user_rim","base.user_bom",,Post payroll-related journal entries
task_002,CT-0002,Calculate Tax Provision and PPB Provision,project_mec,task_phase_001,1.1.2,3,task,2025-12-01,2025-12-01,1,0,normal,stage_prep,base.user_rim,base.user_ckvc,"base.user_rim","base.user_bom",task_001,Compute tax accruals
```

### project.milestone CSV Format

```csv
id,external_id,name,project_id/id,deadline,is_reached
milestone_001,MS-001,Compliance Tasks Complete,project_mec,2025-12-01,False
milestone_002,MS-002,All Accruals Posted,project_mec,2025-12-02,False
milestone_003,MS-003,WIP Reconciled,project_mec,2025-12-04,False
```

---

## Implementation Steps

### Step 1: Add Columns to Existing Sheet

1. Insert columns R-X after your existing columns
2. Add headers:
   - R: WBS Code
   - S: Level
   - T: Type
   - U: Parent WBS
   - V: Predecessor
   - W: Start Date
   - X: Duration

### Step 2: Populate Type Column

For each task row, assign:
- **Phase** for major sections (I, II, III, IV, V, VI)
- **Milestone** for gate reviews (end of each phase)
- **Task** for CT-#### items
- **Checklist** for detailed sub-steps (from "Detailed Checklist" column)

### Step 3: Calculate WBS Codes

Use formula from section above or manually assign:
- 1.0, 2.0, 3.0... for Phases
- 1.1, 2.1, 3.1... for Milestones
- 1.1.1, 1.1.2... for Tasks
- 1.1.1.1, 1.1.1.2... for Checklists

### Step 4: Link Predecessors

Review task sequences and add predecessor Task IDs where:
- One task must finish before another starts
- Tasks depend on milestone completion

### Step 5: Create Odoo Import CSVs

Export columns to CSV matching Odoo field names (see Import CSV Structure above)

---

## Next Actions

1. **Manual Data Entry:** Add Type column (T) values for all 496 rows
2. **Formula Application:** Apply WBS Code, Level, Parent WBS formulas
3. **Dependency Mapping:** Identify and populate Predecessor column
4. **Checklist Expansion:** Break "Detailed Checklist" text into separate Checklist rows
5. **Validation:** Ensure all WBS codes are unique, levels are consistent
6. **Export:** Generate Odoo-ready CSV files

---

**Last Updated:** 2025-12-07  
**Version:** 1.0 - Initial WBS Specification
