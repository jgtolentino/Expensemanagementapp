# Database Schema Documentation

Complete database schema for Finance PPM (Odoo 18 CE + OCA + Custom Extensions).

---

## Schema Overview

The Finance PPM database follows a **multi-tenant, star schema** design with:

- **12 Core Tables** (Odoo CE + OCA)
- **8 Custom Extension Tables** (`ipai_finance_ppm_*`)
- **4 Views** (Materialized analytics)
- **40+ Indexes** (Performance optimization)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   res_users     │
│  (Odoo Core)    │
└────────┬────────┘
         │
         │ Many-to-One
         ▼
┌─────────────────────────┐        ┌──────────────────────┐
│  project_project        │◄───────┤  project_milestone   │
│  (Odoo Core)            │        │  (OCA)               │
└────────┬────────────────┘        └──────────────────────┘
         │
         │ One-to-Many
         ▼
┌─────────────────────────┐        ┌──────────────────────┐
│  project_task           │◄───────┤  project_task        │
│  (Odoo Core + Custom)   │ parent │  _dependency         │
│                         │        │  (OCA)               │
│  + x_wbs_code           │        └──────────────────────┘
│  + x_wbs_level          │
│  + x_task_type          │
│  + x_task_ref           │
│  + x_accountable_id     │
│  + x_consulted_ids      │
│  + x_informed_ids       │
│  + x_duration           │
│  + x_period             │
└────────┬────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ hr_timesheet     │  │ mail_activity    │
│ (Odoo Core)      │  │ (Checklists)     │
└──────────────────┘  └──────────────────┘
         │
         ▼
┌──────────────────┐
│ account_analytic │
│ _line            │
│ (Costs)          │
└──────────────────┘
```

---

## Core Tables (Odoo CE + OCA)

### 1. `project_project`

**Purpose:** Top-level project container (Level 0 in WBS)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Project name (e.g., "Month-End Closing Dec 2025") |
| `active` | boolean | DEFAULT TRUE | Active status |
| `user_id` | integer | FK → res_users | Project manager |
| `analytic_account_id` | integer | FK → account_analytic_account | Linked cost center |
| `date_start` | date | | Project start date |
| `date` | date | | Project end date |
| `create_date` | timestamp | | Created timestamp |
| `write_date` | timestamp | | Last modified timestamp |

**Indexes:**
```sql
CREATE INDEX idx_project_active ON project_project(active) WHERE active = TRUE;
CREATE INDEX idx_project_user ON project_project(user_id);
```

---

### 2. `project_task`

**Purpose:** Tasks, phases, and checklists (Levels 1, 3, 4 in WBS)

#### Core Fields (Odoo CE)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Task name |
| `project_id` | integer | FK → project_project | Parent project |
| `parent_id` | integer | FK → project_task | Parent task (for hierarchy) |
| `sequence` | integer | DEFAULT 10 | Display order |
| `stage_id` | integer | FK → project_task_type | Current stage |
| `date_start` | date | | Planned start date |
| `date_deadline` | date | | Planned due date |
| `date_end` | date | | Actual completion date |
| `user_ids` | many2many | → res_users | Responsible users (R in RACI) |
| `progress` | float | CHECK (progress >= 0 AND progress <= 100) | % Complete (0-100) |
| `description` | text | | Detailed description |
| `active` | boolean | DEFAULT TRUE | Active status |
| `kanban_state` | varchar(20) | CHECK IN ('normal', 'done', 'blocked') | Visual indicator |

#### Custom Fields (`ipai_finance_ppm`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `x_wbs_code` | varchar(50) | UNIQUE (project_id, x_wbs_code) | Hierarchical code (1.0, 1.1.1) |
| `x_wbs_level` | integer | CHECK (x_wbs_level >= 0 AND x_wbs_level <= 4) | 0=Project, 1=Phase, 2=Milestone, 3=Task, 4=Checklist |
| `x_task_type` | varchar(20) | CHECK IN ('phase', 'task', 'checklist') | Task type |
| `x_task_ref` | varchar(50) | UNIQUE (project_id, x_task_ref) | External reference (CT-0001, PH-001) |
| `x_accountable_id` | integer | FK → res_users | Accountable user (A in RACI) |
| `x_consulted_ids` | many2many | → res_users | Consulted users (C in RACI) |
| `x_informed_ids` | many2many | → res_users | Informed users (I in RACI) |
| `x_duration` | integer | | Estimated duration (days) |
| `x_period` | varchar(50) | | Closing period (e.g., "Dec 2025") |
| `x_working_day` | varchar(10) | | Working day (WD1-WD7) |

**Indexes:**
```sql
-- Core indexes
CREATE INDEX idx_task_project ON project_task(project_id);
CREATE INDEX idx_task_parent ON project_task(parent_id);
CREATE INDEX idx_task_deadline ON project_task(date_deadline);

-- WBS indexes
CREATE INDEX idx_task_wbs_code ON project_task(x_wbs_code);
CREATE INDEX idx_task_wbs_level ON project_task(x_wbs_level);
CREATE INDEX idx_task_type ON project_task(x_task_type);
CREATE INDEX idx_task_ref ON project_task(x_task_ref);

-- Performance indexes
CREATE INDEX idx_task_active_deadline ON project_task(active, date_deadline) 
    WHERE active = TRUE;
CREATE INDEX idx_task_incomplete ON project_task(progress) 
    WHERE progress < 100;
```

**Triggers:**
```sql
-- Auto-generate WBS code on insert
CREATE OR REPLACE FUNCTION generate_wbs_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.x_wbs_code IS NULL THEN
        IF NEW.x_task_type = 'phase' THEN
            -- Generate phase code: 1.0, 2.0, etc.
            NEW.x_wbs_code := (
                SELECT COALESCE(MAX(CAST(SUBSTRING(x_wbs_code FROM '^(\d+)\.') AS INTEGER)), 0) + 1
                FROM project_task
                WHERE project_id = NEW.project_id AND x_task_type = 'phase'
            ) || '.0';
        ELSIF NEW.parent_id IS NOT NULL THEN
            -- Generate child code based on parent
            NEW.x_wbs_code := (
                SELECT parent.x_wbs_code || '.' || (
                    SELECT COUNT(*) + 1
                    FROM project_task
                    WHERE parent_id = NEW.parent_id
                )
                FROM project_task parent
                WHERE parent.id = NEW.parent_id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_wbs_code
BEFORE INSERT ON project_task
FOR EACH ROW
EXECUTE FUNCTION generate_wbs_code();
```

---

### 3. `project_milestone` (OCA)

**Purpose:** Key deliverables and gate reviews (Level 2 in WBS)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Milestone name |
| `project_id` | integer | FK → project_project | Parent project |
| `deadline` | date | | Target completion date |
| `is_reached` | boolean | DEFAULT FALSE | Completion status |
| `description` | text | | Milestone description |
| `create_date` | timestamp | | Created timestamp |

**Indexes:**
```sql
CREATE INDEX idx_milestone_project ON project_milestone(project_id);
CREATE INDEX idx_milestone_deadline ON project_milestone(deadline);
CREATE INDEX idx_milestone_unreached ON project_milestone(is_reached) 
    WHERE is_reached = FALSE;
```

---

### 4. `project_task_dependency` (OCA)

**Purpose:** Task predecessor/successor relationships

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `task_id` | integer | FK → project_task | Dependent task |
| `depend_on_id` | integer | FK → project_task | Predecessor task |
| `dependency_type` | integer | CHECK IN (0, 1, 2, 3) | 0=FS, 1=SS, 2=FF, 3=SF |

**Indexes:**
```sql
CREATE INDEX idx_dependency_task ON project_task_dependency(task_id);
CREATE INDEX idx_dependency_depend ON project_task_dependency(depend_on_id);
CREATE UNIQUE INDEX idx_dependency_unique ON project_task_dependency(task_id, depend_on_id);
```

**Dependency Types:**
- `0` = Finish-to-Start (FS) - Task B starts when A finishes
- `1` = Start-to-Start (SS) - Task B starts when A starts
- `2` = Finish-to-Finish (FF) - Task B finishes when A finishes
- `3` = Start-to-Finish (SF) - Task B finishes when A starts

---

### 5. `project_task_type` (Odoo CE)

**Purpose:** Task stages (Preparation, Review, Approval, Close)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(100) | NOT NULL | Stage name |
| `sequence` | integer | DEFAULT 10 | Display order |
| `fold` | boolean | DEFAULT FALSE | Collapsed in kanban |
| `description` | text | | Stage description |

**Seed Data:**
```sql
INSERT INTO project_task_type (name, sequence, fold) VALUES
('Preparation', 10, FALSE),
('Review', 20, FALSE),
('Approval', 30, FALSE),
('Close', 40, FALSE),
('Done', 50, TRUE);
```

---

### 6. `hr_timesheet` (Odoo CE)

**Purpose:** Time tracking on tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | | Description of work |
| `date` | date | NOT NULL | Date of work |
| `task_id` | integer | FK → project_task | Related task |
| `project_id` | integer | FK → project_project | Related project |
| `employee_id` | integer | FK → hr_employee | Employee |
| `unit_amount` | float | CHECK (unit_amount >= 0) | Hours worked |
| `account_id` | integer | FK → account_analytic_account | Cost center |

**Indexes:**
```sql
CREATE INDEX idx_timesheet_task ON hr_timesheet(task_id);
CREATE INDEX idx_timesheet_date ON hr_timesheet(date);
CREATE INDEX idx_timesheet_employee ON hr_timesheet(employee_id);
```

---

## Custom Extension Tables

### 7. `ipai_risk_register`

**Purpose:** Risk management (FC-07)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Risk title |
| `description` | text | | Risk description |
| `project_id` | integer | FK → project_project | Related project |
| `task_ids` | many2many | → project_task | Related tasks |
| `probability` | varchar(20) | CHECK IN ('very_low', 'low', 'medium', 'high', 'very_high') | Likelihood |
| `impact` | varchar(20) | CHECK IN ('very_low', 'low', 'medium', 'high', 'very_high') | Severity |
| `exposure` | float | | Calculated risk exposure |
| `owner_id` | integer | FK → res_users | Risk owner |
| `mitigation_plan` | text | | Mitigation strategy |
| `status` | varchar(20) | CHECK IN ('open', 'mitigating', 'closed', 'realized') | Current status |
| `create_date` | timestamp | | Created timestamp |
| `write_date` | timestamp | | Last modified timestamp |

**Computed Field:**
```python
@api.depends('probability', 'impact')
def _compute_exposure(self):
    prob_map = {'very_low': 0.1, 'low': 0.3, 'medium': 0.5, 'high': 0.7, 'very_high': 0.9}
    impact_map = {'very_low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very_high': 5}
    for risk in self:
        risk.exposure = prob_map.get(risk.probability, 0.5) * impact_map.get(risk.impact, 3)
```

---

### 8. `ipai_financial_plan`

**Purpose:** Budget planning and tracking (FC-05)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Plan name |
| `project_id` | integer | FK → project_project | Related project |
| `total_budget` | numeric(12,2) | | Total budget amount |
| `capex_budget` | numeric(12,2) | | Capital expenditure budget |
| `opex_budget` | numeric(12,2) | | Operating expenditure budget |
| `currency_id` | integer | FK → res_currency | Currency |
| `actual_cost` | numeric(12,2) | COMPUTED | Actual costs incurred |
| `variance` | numeric(12,2) | COMPUTED | Budget variance |
| `fiscal_year` | varchar(10) | | Fiscal year (e.g., "FY2025") |
| `period` | varchar(50) | | Period (e.g., "Dec 2025") |
| `create_date` | timestamp | | Created timestamp |
| `write_date` | timestamp | | Last modified timestamp |

**Computed Fields:**
```python
@api.depends('total_budget', 'project_id.analytic_account_id')
def _compute_actuals(self):
    for plan in self:
        if plan.project_id.analytic_account_id:
            lines = self.env['account.analytic.line'].search([
                ('account_id', '=', plan.project_id.analytic_account_id.id)
            ])
            plan.actual_cost = sum(lines.mapped('amount'))
            plan.variance = plan.total_budget - plan.actual_cost
```

---

### 9. `ipai_okr_objective`

**Purpose:** Objectives (FC-11)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Objective name |
| `description` | text | | Objective description |
| `owner_id` | integer | FK → res_users | Objective owner |
| `project_ids` | many2many | → project_project | Linked projects |
| `create_date` | timestamp | | Created timestamp |

---

### 10. `ipai_okr_key_result`

**Purpose:** Key Results (FC-11)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique identifier |
| `name` | varchar(255) | NOT NULL | Key result name |
| `objective_id` | integer | FK → ipai_okr_objective | Parent objective |
| `start_value` | float | | Starting value |
| `current_value` | float | | Current value |
| `target_value` | float | | Target value |
| `progress_pct` | float | COMPUTED | Progress percentage |
| `confidence` | varchar(20) | CHECK IN ('low', 'medium', 'high') | Confidence level |
| `status` | varchar(20) | CHECK IN ('not_started', 'on_track', 'at_risk', 'behind', 'complete') | Status |
| `create_date` | timestamp | | Created timestamp |

---

## Analytics Views

### 11. `v_task_progress_summary`

**Purpose:** Task progress rollup by phase

```sql
CREATE OR REPLACE VIEW v_task_progress_summary AS
SELECT
    pt.project_id,
    pt.parent_id AS phase_id,
    parent.name AS phase_name,
    COUNT(pt.id) AS total_tasks,
    COUNT(CASE WHEN pt.progress = 100 THEN 1 END) AS completed_tasks,
    COUNT(CASE WHEN pt.progress > 0 AND pt.progress < 100 THEN 1 END) AS in_progress_tasks,
    COUNT(CASE WHEN pt.progress = 0 THEN 1 END) AS not_started_tasks,
    AVG(pt.progress) AS avg_progress,
    COUNT(CASE WHEN pt.date_deadline < CURRENT_DATE AND pt.progress < 100 THEN 1 END) AS overdue_tasks
FROM project_task pt
LEFT JOIN project_task parent ON pt.parent_id = parent.id
WHERE pt.x_task_type = 'task'
GROUP BY pt.project_id, pt.parent_id, parent.name;
```

---

### 12. `v_raci_matrix`

**Purpose:** RACI assignments matrix

```sql
CREATE OR REPLACE VIEW v_raci_matrix AS
SELECT
    pt.id AS task_id,
    pt.name AS task_name,
    pt.x_wbs_code,
    u_r.id AS responsible_id,
    u_r.name AS responsible_name,
    pt.x_accountable_id AS accountable_id,
    u_a.name AS accountable_name
FROM project_task pt
LEFT JOIN project_task_res_users_rel r ON r.project_task_id = pt.id
LEFT JOIN res_users u_r ON r.res_users_id = u_r.id
LEFT JOIN res_users u_a ON pt.x_accountable_id = u_a.id
WHERE pt.active = TRUE;
```

---

## Sample Queries

### 1. Get all tasks in a project with RACI

```sql
SELECT
    pt.x_wbs_code,
    pt.x_task_ref,
    pt.name,
    pt.date_start,
    pt.date_deadline,
    pt.progress,
    STRING_AGG(DISTINCT u_r.name, ', ') AS responsible,
    u_a.name AS accountable
FROM project_task pt
LEFT JOIN project_task_res_users_rel r ON r.project_task_id = pt.id
LEFT JOIN res_users u_r ON r.res_users_id = u_r.id
LEFT JOIN res_users u_a ON pt.x_accountable_id = u_a.id
WHERE pt.project_id = 1
GROUP BY pt.id, pt.x_wbs_code, pt.x_task_ref, pt.name, pt.date_start, pt.date_deadline, pt.progress, u_a.name
ORDER BY pt.x_wbs_code;
```

### 2. Get overdue tasks

```sql
SELECT
    pt.x_task_ref,
    pt.name,
    pt.date_deadline,
    pt.progress,
    CURRENT_DATE - pt.date_deadline AS days_overdue,
    u.name AS responsible
FROM project_task pt
LEFT JOIN project_task_res_users_rel r ON r.project_task_id = pt.id
LEFT JOIN res_users u ON r.res_users_id = u.id
WHERE pt.date_deadline < CURRENT_DATE
    AND pt.progress < 100
    AND pt.active = TRUE
ORDER BY days_overdue DESC;
```

### 3. Get critical path

```sql
WITH RECURSIVE critical_path AS (
    -- Start with final task (TB Sign-off)
    SELECT
        id,
        name,
        x_wbs_code,
        date_start,
        date_deadline,
        ARRAY[id] AS path,
        0 AS depth
    FROM project_task
    WHERE x_task_ref = 'CT-0036'
    
    UNION ALL
    
    -- Recursively find predecessors
    SELECT
        pt.id,
        pt.name,
        pt.x_wbs_code,
        pt.date_start,
        pt.date_deadline,
        cp.path || pt.id,
        cp.depth + 1
    FROM project_task pt
    INNER JOIN project_task_dependency dep ON dep.depend_on_id = pt.id
    INNER JOIN critical_path cp ON dep.task_id = cp.id
    WHERE NOT pt.id = ANY(cp.path)  -- Avoid cycles
)
SELECT * FROM critical_path
ORDER BY depth;
```

---

## Next Steps

- **Read:** [Frontend Dev Guide](./04-FRONTEND-DEV-GUIDE.md)
- **Review:** [API Reference](./15-API-REFERENCE.md)
- **Implement:** [Odoo Import Templates](./ODOO-IMPORT-TEMPLATES.md)

---

**Last Updated:** 2025-12-07  
**Version:** 1.0 - Database Schema Documentation
