# Odoo 18 CE + OCA Import Templates for Finance PPM

Complete CSV templates and import procedures for the Finance PPM WBS structure.

---

## Prerequisites

### Odoo Modules Required

```python
# /odoo/addons/ipai_finance_ppm/__manifest__.py
{
    'name': 'IPAI Finance PPM',
    'version': '18.0.1.0.0',
    'depends': [
        'base',
        'project',
        'hr',
        'hr_timesheet',
        'analytic',
        'account',
        'project_milestone',          # OCA
        'project_task_dependency',    # OCA
        'project_role',               # OCA
        'mis_builder',                # OCA
        'account_budget_oca',         # OCA
    ],
}
```

### Custom Fields to Add

```python
# /odoo/addons/ipai_finance_ppm/models/project_task.py

from odoo import models, fields

class ProjectTask(models.Model):
    _inherit = 'project.task'
    
    # WBS Fields
    x_wbs_code = fields.Char('WBS Code', index=True)
    x_wbs_level = fields.Integer('WBS Level')
    x_task_type = fields.Selection([
        ('phase', 'Phase'),
        ('task', 'Task'),
        ('checklist', 'Checklist'),
    ], string='Task Type', default='task')
    
    # RACI Fields
    x_accountable_id = fields.Many2one('res.users', string='Accountable (A)')
    x_consulted_ids = fields.Many2many('res.users', 'task_consulted_rel', 
                                       string='Consulted (C)')
    x_informed_ids = fields.Many2many('res.users', 'task_informed_rel', 
                                      string='Informed (I)')
    
    # Extended Fields
    x_duration = fields.Integer('Duration (Days)')
    x_task_ref = fields.Char('Task Reference', index=True)  # CT-0001, etc.
    x_period = fields.Char('Closing Period')  # Dec 2025
    is_phase = fields.Boolean('Is Phase', compute='_compute_is_phase', store=True)
    
    @api.depends('x_task_type')
    def _compute_is_phase(self):
        for task in self:
            task.is_phase = (task.x_task_type == 'phase')
```

---

## CSV Template 1: Master Data Setup

### 1.1 Project Record

**File:** `01_project.csv`

```csv
id,name,use_tasks,privacy_visibility,analytic_account_id/id
project_mec_2025,Month-End Financial Close 2025,True,portal,analytic_mec_2025
```

### 1.2 Analytic Account

**File:** `02_analytic_account.csv`

```csv
id,name,code,plan_id/id
analytic_mec_2025,MEC-2025,MEC-2025,analytic.analytic_plan_projects
```

### 1.3 Task Stages

**File:** `03_project_task_type.csv`

```csv
id,name,sequence,fold
stage_prep,Preparation,1,False
stage_review,Review,2,False
stage_approval,Approval,3,False
stage_close,Close,4,False
stage_done,Done,5,True
```

### 1.4 Users (RACI Directory)

**File:** `04_res_users.csv`

```csv
id,login,name,email,groups_id/id
user_ckvc,ckvc,Cherry Kate VC,ckvc@example.com,"base.group_user,project.group_project_manager"
user_rim,rim,RIM,rim@example.com,"base.group_user,project.group_project_user"
user_bom,bom,BOM,bom@example.com,"base.group_user,project.group_project_user"
user_jpal,jpal,JPAL,jpal@example.com,"base.group_user,project.group_project_user"
```

---

## CSV Template 2: WBS Structure

### 2.1 Phases (Level 1)

**File:** `05_phases.csv`

```csv
id,external_id,name,project_id/id,x_wbs_code,x_wbs_level,x_task_type,date_start,date_deadline,x_accountable_id/id,stage_id/id,sequence
phase_001,PH-001,I. Initial & Compliance,project_mec_2025,1.0,1,phase,2025-12-01,2025-12-01,user_ckvc,stage_prep,10
phase_002,PH-002,II. Accruals & Amortization,project_mec_2025,2.0,1,phase,2025-12-02,2025-12-02,user_ckvc,stage_prep,20
phase_003,PH-003,III. WIP,project_mec_2025,3.0,1,phase,2025-12-03,2025-12-04,user_ckvc,stage_prep,30
phase_004,PH-004,IV. Final Adjustments & Review,project_mec_2025,4.0,1,phase,2025-12-05,2025-12-05,user_ckvc,stage_prep,40
phase_005,PH-005,V. Approval & Reporting,project_mec_2025,5.0,1,phase,2025-12-06,2025-12-06,user_ckvc,stage_prep,50
phase_006,PH-006,VI. Close & Archive,project_mec_2025,6.0,1,phase,2025-12-07,2025-12-07,user_ckvc,stage_prep,60
```

### 2.2 Milestones (Level 2)

**File:** `06_milestones.csv`

```csv
id,external_id,name,project_id/id,deadline,is_reached
milestone_001,MS-001,✓ Compliance Tasks Complete,project_mec_2025,2025-12-01,False
milestone_002,MS-002,✓ All Accruals Posted,project_mec_2025,2025-12-02,False
milestone_003,MS-003,✓ WIP Reconciled,project_mec_2025,2025-12-04,False
milestone_004,MS-004,✓ Adjustments Complete,project_mec_2025,2025-12-05,False
milestone_005,MS-005,✓ Regional Reports Submitted,project_mec_2025,2025-12-06,False
milestone_006,MS-006,✓ TB Signed Off,project_mec_2025,2025-12-05,False
milestone_007,MS-007,✓ Period Closed,project_mec_2025,2025-12-07,False
```

### 2.3 Tasks (Level 3)

**File:** `07_tasks.csv`

```csv
id,external_id,name,project_id/id,parent_id/id,x_wbs_code,x_wbs_level,x_task_type,x_task_ref,date_start,date_deadline,x_duration,progress,kanban_state,stage_id/id,user_ids/id,x_accountable_id/id,x_consulted_ids/id,x_informed_ids/id,description
task_001,CT-0001,Process Payroll Final Pay SL Conversions,project_mec_2025,phase_001,1.1.1,3,task,CT-0001,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Post payroll, final pay, and sick leave conversion journal entries"
task_002,CT-0002,Calculate Tax Provision and PPB Provision,project_mec_2025,phase_001,1.1.2,3,task,CT-0002,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Compute tax accruals and PPB provision"
task_003,CT-0003,Record SSS & PHIC Contributions,project_mec_2025,phase_001,1.1.3,3,task,CT-0003,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Post statutory contributions"
task_004,CT-0004,Input Suppliers & Process Withholding Tax,project_mec_2025,phase_001,1.1.4,3,task,CT-0004,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Record supplier invoices and withholding tax"
task_005,CT-0005,Liquidate Cash Advances,project_mec_2025,phase_001,1.1.5,3,task,CT-0005,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Process cash advance liquidations"
task_006,CT-0006,Generate Aging Reports,project_mec_2025,phase_001,1.1.6,3,task,CT-0006,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","AR/AP aging analysis"
task_007,CT-0007,Adjust Output VAT,project_mec_2025,phase_001,1.1.7,3,task,CT-0007,2025-12-01,2025-12-01,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Adjust output VAT for the period"
task_008,CT-0008,Record Consultancy Fees and General Expense Accruals,project_mec_2025,phase_002,2.1.1,3,task,CT-0008,2025-12-02,2025-12-02,1,0,normal,stage_prep,user_rim,user_ckvc,"user_rim","user_bom","Accrue consultancy fees and general expenses"
task_009,CT-0009,Amortize Prepaid Expenses,project_mec_2025,phase_002,2.1.2,3,task,CT-0009,2025-12-02,2025-12-02,1,0,normal,stage_prep,user_bom,user_ckvc,"user_rim","user_bom","Amortize prepaid expenses for the period"
task_010,CT-0010,Depreciation Run,project_mec_2025,phase_002,2.1.3,3,task,CT-0010,2025-12-02,2025-12-02,1,0,normal,stage_prep,user_bom,user_ckvc,"user_rim","user_bom","Run monthly depreciation"
```

*(Continue for all 37 tasks...)*

### 2.4 Checklists (Level 4)

**File:** `08_checklists.csv`

```csv
id,external_id,name,project_id/id,parent_id/id,x_wbs_code,x_wbs_level,x_task_type,date_start,date_deadline,x_duration,user_ids/id,stage_id/id
checklist_001,CL-0001,☐ Gather payroll data from HR,project_mec_2025,task_001,1.1.1.1,4,checklist,2025-12-01,2025-12-01,1,user_rim,stage_prep
checklist_002,CL-0002,☐ Verify Final Pay computations,project_mec_2025,task_001,1.1.1.2,4,checklist,2025-12-01,2025-12-01,1,user_rim,stage_prep
checklist_003,CL-0003,☐ Process SL conversions,project_mec_2025,task_001,1.1.1.3,4,checklist,2025-12-01,2025-12-01,1,user_rim,stage_prep
checklist_004,CL-0004,☐ Post journal entry to GL,project_mec_2025,task_001,1.1.1.4,4,checklist,2025-12-01,2025-12-01,1,user_rim,stage_prep
```

---

## CSV Template 3: Task Dependencies

### 3.1 Dependencies (Finish-to-Start)

**File:** `09_dependencies.csv`

```csv
task_id/id,depend_on_ids/id,dependency_type
task_002,task_001,finish_start
task_003,task_002,finish_start
task_004,task_003,finish_start
task_005,task_004,finish_start
task_006,task_005,finish_start
task_007,task_006,finish_start
task_008,milestone_001,finish_start
task_009,task_008,finish_start
task_010,task_009,finish_start
task_012,milestone_002,finish_start
task_037,task_018,finish_start
```

**Note:** Odoo OCA `project_task_dependency` stores dependencies in a many2many table. Use the `project.task.dependency` model:

```csv
# Alternative format if using project.task.dependency directly
id,task_id/id,depend_on_id/id,dependency_type
dep_001,task_002,task_001,0
dep_002,task_003,task_002,0
```

*Dependency type codes:*
- `0` = Finish-to-Start (FS)
- `1` = Start-to-Start (SS)
- `2` = Finish-to-Finish (FF)
- `3` = Start-to-Finish (SF)

---

## Import Procedure

### Step 1: Prepare Odoo Environment

```bash
# Install required OCA modules
pip3 install -r requirements.txt

# Update module list
./odoo-bin -c odoo.conf -u all -d your_database --stop-after-init

# Install custom module
./odoo-bin -c odoo.conf -i ipai_finance_ppm -d your_database --stop-after-init
```

### Step 2: Import CSVs in Sequence

**Order matters!** Import in this sequence:

1. **Project & Analytic Account**
   ```bash
   # UI: Settings → Technical → Database Structure → Import
   # Or use CLI:
   ./odoo-bin shell -c odoo.conf -d your_database
   ```
   
   ```python
   import csv
   import base64
   from odoo import api, SUPERUSER_ID
   
   env = api.Environment(cr, SUPERUSER_ID, {})
   
   # Import project
   with open('01_project.csv', 'rb') as f:
       env['project.project'].load(f.read().decode('utf-8'))
   
   # Import analytic account
   with open('02_analytic_account.csv', 'rb') as f:
       env['account.analytic.account'].load(f.read().decode('utf-8'))
   ```

2. **Stages**
   ```python
   with open('03_project_task_type.csv', 'rb') as f:
       env['project.task.type'].load(f.read().decode('utf-8'))
   ```

3. **Users** (if not existing)
   ```python
   with open('04_res_users.csv', 'rb') as f:
       env['res.users'].load(f.read().decode('utf-8'))
   ```

4. **Phases** (Level 1)
   ```python
   with open('05_phases.csv', 'rb') as f:
       env['project.task'].load(f.read().decode('utf-8'))
   ```

5. **Milestones** (Level 2)
   ```python
   with open('06_milestones.csv', 'rb') as f:
       env['project.milestone'].load(f.read().decode('utf-8'))
   ```

6. **Tasks** (Level 3)
   ```python
   with open('07_tasks.csv', 'rb') as f:
       env['project.task'].load(f.read().decode('utf-8'))
   ```

7. **Checklists** (Level 4)
   ```python
   with open('08_checklists.csv', 'rb') as f:
       env['project.task'].load(f.read().decode('utf-8'))
   ```

8. **Dependencies**
   ```python
   with open('09_dependencies.csv', 'rb') as f:
       env['project.task.dependency'].load(f.read().decode('utf-8'))
   ```

### Step 3: Validate Import

**Run validation SQL:**

```sql
-- Check WBS hierarchy
SELECT 
    x_wbs_code,
    x_wbs_level,
    x_task_type,
    name,
    parent_id,
    stage_id
FROM project_task
WHERE project_id = (SELECT id FROM project_project WHERE name = 'Month-End Financial Close 2025')
ORDER BY x_wbs_code;

-- Check RACI assignments
SELECT 
    pt.name AS task_name,
    u_r.name AS responsible,
    u_a.name AS accountable
FROM project_task pt
LEFT JOIN res_users u_r ON pt.user_ids = u_r.id  -- Note: user_ids is many2many
LEFT JOIN res_users u_a ON pt.x_accountable_id = u_a.id
WHERE pt.project_id = (SELECT id FROM project_project WHERE name = 'Month-End Financial Close 2025')
LIMIT 10;

-- Check dependencies
SELECT 
    t1.name AS task,
    t2.name AS depends_on,
    dep.dependency_type
FROM project_task_dependency dep
JOIN project_task t1 ON dep.task_id = t1.id
JOIN project_task t2 ON dep.depend_on_id = t2.id
WHERE t1.project_id = (SELECT id FROM project_project WHERE name = 'Month-End Financial Close 2025');
```

---

## Troubleshooting

### Issue 1: External ID Not Found

**Error:** `External ID not found in the system: user_ckvc`

**Solution:** 
1. Check if user exists: `SELECT id, login FROM res_users WHERE login = 'ckvc';`
2. Use database ID instead of external ID in CSV
3. Or create user first with external ID

### Issue 2: Parent Not Found

**Error:** `Task parent_id not found`

**Solution:**
1. Import phases before tasks
2. Use `parent_id/id` with correct external ID reference
3. Check that parent task was imported successfully

### Issue 3: Many2many Field Import

**Error:** `user_ids field not importing`

**Solution:**
- Use comma-separated external IDs: `"user_rim,user_bom"`
- Or use colon-separated: `user_rim:user_bom`
- Check Odoo documentation for your version's many2many CSV format

### Issue 4: Custom Fields Not Found

**Error:** `Field 'x_wbs_code' does not exist`

**Solution:**
1. Install `ipai_finance_ppm` module first
2. Update module: `./odoo-bin -u ipai_finance_ppm`
3. Check field is defined in `models/project_task.py`

---

## Alternative: UI Import via Odoo Interface

### Step-by-Step UI Import

1. **Navigate:** Settings → Technical → Database Structure → Import

2. **Select Model:** Choose `project.task`

3. **Upload CSV:** Click "Load File" and select `07_tasks.csv`

4. **Map Columns:**
   - Odoo will auto-map based on column headers
   - Verify mappings:
     - `id` → Database ID
     - `name` → Name
     - `x_wbs_code` → WBS Code
     - `user_ids/id` → Assignees

5. **Test Import:** Click "Test" to validate

6. **Import:** Click "Import" if validation passes

7. **Check Results:** Navigate to Project → Tasks to verify

---

## Export from Odoo

### Export Tasks to CSV

```python
# In Odoo shell
tasks = env['project.task'].search([
    ('project_id.name', '=', 'Month-End Financial Close 2025')
])

# Export fields
fields_to_export = [
    'id', 'x_task_ref', 'name', 'x_wbs_code', 'x_wbs_level', 'x_task_type',
    'parent_id', 'date_start', 'date_deadline', 'x_duration', 'progress',
    'stage_id', 'user_ids', 'x_accountable_id'
]

tasks.export_data(fields_to_export)
```

---

## Next Steps

1. **Generate Full CSV Files:**
   - Expand `07_tasks.csv` to include all 37 tasks (CT-0001 to CT-0037)
   - Expand `08_checklists.csv` with all detailed checklist items

2. **Automate Recurring Imports:**
   - Create Python script to generate CSVs for each new month
   - Use Odoo external API or odoorpc library

3. **Link to OKRs:**
   - Import LogFrame data as MIS Builder KPIs
   - Link tasks to OKRs via analytic accounts

4. **Setup Dashboards:**
   - Configure Gantt view for WBS visualization
   - Setup Kanban boards per phase

---

**Last Updated:** 2025-12-07  
**Version:** 1.0 - Odoo Import Templates
