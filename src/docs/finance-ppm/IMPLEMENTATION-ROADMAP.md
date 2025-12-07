# Finance PPM Implementation Roadmap

**Complete guide to implementing Finance Clarity PPM Workspace in Odoo 18 CE + OCA**

---

## Executive Summary

You are building a **Finance Clarity PPM Workspace** that replicates Clarity PPM functionality using:

- **Odoo 18 CE + OCA modules** (backend ERP/PPM)
- **No Notion** (all data lives in Odoo)
- **Scout Dashboard** patterns (AI assistant, RBAC, multi-tenant if needed)

**Current Data:**
- ✅ 496 recurring monthly closing tasks (CT-0001 to CT-0036 × 13+ periods)
- ✅ RACI assignments (Directory lookup)
- ✅ 2 Objectives + 8 Key Results (LogFrame)
- ✅ Odoo field mapping specification

**Gaps:**
- ❌ WBS hierarchy (Phase → Milestone → Task → Checklist)
- ❌ Task dependencies (predecessors)
- ❌ Start dates, durations, % complete
- ❌ Risk register, budget data, timesheets

---

## Roadmap Overview

| Phase | Deliverable | Duration | Status |
|-------|-------------|----------|--------|
| **Phase 1** | WBS Structure Design | 1 week | ✅ Complete |
| **Phase 2** | Odoo Module Development | 2-3 weeks | ⏭️ Next |
| **Phase 3** | Data Migration | 1 week | ⏭️ Pending |
| **Phase 4** | Dashboard & Reports | 2 weeks | ⏭️ Pending |
| **Phase 5** | AI Assistant Integration | 1-2 weeks | ⏭️ Pending |
| **Phase 6** | Testing & Training | 1 week | ⏭️ Pending |
| **Total** | **Full Implementation** | **8-10 weeks** | **~10% Complete** |

---

## Phase 1: WBS Structure Design ✅

**Status:** COMPLETE

**Deliverables:**
- ✅ WBS hierarchy specification (4 levels: Project → Phase → Milestone/Task → Checklist)
- ✅ WBS numbering scheme (1.0, 1.1.1, 1.1.1.1)
- ✅ RACI integration pattern
- ✅ Dependency mapping strategy
- ✅ Odoo field mapping

**Documents Created:**
- `WBS-STRUCTURE-SPECIFICATION.md` (complete hierarchy design)
- `ODOO-IMPORT-TEMPLATES.md` (CSV templates + import guide)
- `IMPLEMENTATION-ROADMAP.md` (this document)

**Next:** Move to Phase 2 (Module Development)

---

## Phase 2: Odoo Module Development ⏭️

**Duration:** 2-3 weeks  
**Team:** 1 Odoo developer + 1 finance SME

### 2.1 Custom Module: `ipai_finance_ppm`

**Goal:** Extend Odoo project module with Finance PPM concepts.

**Structure:**
```
/odoo/addons/ipai_finance_ppm/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── project_task.py          # WBS, RACI, custom fields
│   ├── project_milestone.py     # Extended milestones
│   ├── risk_register.py         # FC-07 Risks
│   ├── financial_plan.py        # FC-05 Budgets
│   └── okr.py                   # FC-11 OKRs/KPIs
├── views/
│   ├── project_task_views.xml   # Gantt, Kanban, WBS tree
│   ├── milestone_views.xml
│   ├── risk_views.xml
│   └── menu.xml
├── security/
│   ├── ir.model.access.csv
│   └── ir_rule.xml              # RBAC policies
├── data/
│   ├── task_types.xml           # Stages: Prep, Review, Approval, Close
│   ├── project_template.xml     # MEC template
│   └── okr_data.xml             # Seed OKRs from LogFrame
└── reports/
    ├── status_report.xml
    └── wbs_export.xml
```

### 2.2 Key Models to Implement

#### 2.2.1 `project.task` Extensions

**File:** `models/project_task.py`

```python
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ProjectTask(models.Model):
    _inherit = 'project.task'
    
    # === WBS Fields ===
    x_wbs_code = fields.Char(
        'WBS Code', 
        index=True, 
        help='Hierarchical code (e.g., 1.1.1)'
    )
    x_wbs_level = fields.Integer(
        'WBS Level', 
        help='0=Project, 1=Phase, 2=Milestone, 3=Task, 4=Checklist'
    )
    x_task_type = fields.Selection([
        ('phase', 'Phase'),
        ('task', 'Task'),
        ('checklist', 'Checklist'),
    ], string='Task Type', default='task', required=True)
    
    # === RACI Fields ===
    x_accountable_id = fields.Many2one(
        'res.users', 
        string='Accountable (A)',
        help='Single owner who approves/signs off'
    )
    x_consulted_ids = fields.Many2many(
        'res.users', 
        'task_consulted_rel', 
        'task_id', 
        'user_id',
        string='Consulted (C)',
        help='Provides input before decision'
    )
    x_informed_ids = fields.Many2many(
        'res.users', 
        'task_informed_rel', 
        'task_id', 
        'user_id',
        string='Informed (I)',
        help='Notified after decision'
    )
    
    # === Extended Fields ===
    x_duration = fields.Integer('Duration (Days)')
    x_task_ref = fields.Char('Task Reference', index=True)  # CT-0001
    x_period = fields.Char('Closing Period')  # Dec 2025
    x_working_day = fields.Char('Working Day')  # WD1, WD2, etc.
    
    # === Computed Fields ===
    is_phase = fields.Boolean(
        'Is Phase', 
        compute='_compute_is_phase', 
        store=True
    )
    
    @api.depends('x_task_type')
    def _compute_is_phase(self):
        for task in self:
            task.is_phase = (task.x_task_type == 'phase')
    
    @api.constrains('x_wbs_code')
    def _check_wbs_code_unique(self):
        for task in self:
            if task.x_wbs_code:
                duplicate = self.search([
                    ('id', '!=', task.id),
                    ('project_id', '=', task.project_id.id),
                    ('x_wbs_code', '=', task.x_wbs_code)
                ])
                if duplicate:
                    raise ValidationError(_(
                        'WBS Code %s must be unique within project %s'
                    ) % (task.x_wbs_code, task.project_id.name))
    
    def action_view_wbs_tree(self):
        """Open hierarchical WBS tree view"""
        return {
            'type': 'ir.actions.act_window',
            'name': 'WBS Structure',
            'res_model': 'project.task',
            'view_mode': 'tree,form',
            'domain': [('project_id', '=', self.project_id.id)],
            'context': {
                'search_default_group_by_phase': 1,
                'default_project_id': self.project_id.id,
            },
        }
```

#### 2.2.2 Risk Register

**File:** `models/risk_register.py`

```python
from odoo import models, fields

class RiskRegister(models.Model):
    _name = 'ipai.risk.register'
    _description = 'Risk Register (FC-07)'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    
    name = fields.Char('Risk Title', required=True)
    description = fields.Text('Risk Description')
    
    # Linkage
    project_id = fields.Many2one('project.project', 'Project', required=True)
    task_ids = fields.Many2many('project.task', string='Related Tasks')
    
    # Assessment
    probability = fields.Selection([
        ('very_low', 'Very Low (10%)'),
        ('low', 'Low (30%)'),
        ('medium', 'Medium (50%)'),
        ('high', 'High (70%)'),
        ('very_high', 'Very High (90%)'),
    ], string='Probability', default='medium')
    
    impact = fields.Selection([
        ('very_low', 'Very Low'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ], string='Impact', default='medium')
    
    exposure = fields.Float('Risk Exposure', compute='_compute_exposure', store=True)
    
    # Management
    owner_id = fields.Many2one('res.users', 'Risk Owner')
    mitigation_plan = fields.Text('Mitigation Plan')
    status = fields.Selection([
        ('open', 'Open'),
        ('mitigating', 'Mitigating'),
        ('closed', 'Closed'),
        ('realized', 'Realized'),
    ], string='Status', default='open', tracking=True)
    
    @api.depends('probability', 'impact')
    def _compute_exposure(self):
        prob_map = {
            'very_low': 0.1, 'low': 0.3, 'medium': 0.5, 
            'high': 0.7, 'very_high': 0.9
        }
        impact_map = {
            'very_low': 1, 'low': 2, 'medium': 3, 
            'high': 4, 'very_high': 5
        }
        for risk in self:
            prob = prob_map.get(risk.probability, 0.5)
            imp = impact_map.get(risk.impact, 3)
            risk.exposure = prob * imp
```

#### 2.2.3 Financial Plan

**File:** `models/financial_plan.py`

```python
from odoo import models, fields

class FinancialPlan(models.Model):
    _name = 'ipai.financial.plan'
    _description = 'Financial Plan (FC-05)'
    
    name = fields.Char('Plan Name', required=True)
    project_id = fields.Many2one('project.project', 'Project', required=True)
    
    # Budgets
    total_budget = fields.Monetary('Total Budget', currency_field='currency_id')
    capex_budget = fields.Monetary('CAPEX Budget', currency_field='currency_id')
    opex_budget = fields.Monetary('OPEX Budget', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)
    
    # Actuals
    actual_cost = fields.Monetary('Actual Cost', compute='_compute_actuals', store=True)
    variance = fields.Monetary('Variance', compute='_compute_actuals', store=True)
    
    # Period
    fiscal_year = fields.Char('Fiscal Year')
    period = fields.Char('Period')  # e.g., "Dec 2025"
    
    @api.depends('total_budget', 'project_id.analytic_account_id')
    def _compute_actuals(self):
        for plan in self:
            if plan.project_id.analytic_account_id:
                analytic_lines = self.env['account.analytic.line'].search([
                    ('account_id', '=', plan.project_id.analytic_account_id.id)
                ])
                plan.actual_cost = sum(analytic_lines.mapped('amount'))
                plan.variance = plan.total_budget - plan.actual_cost
            else:
                plan.actual_cost = 0.0
                plan.variance = plan.total_budget
```

#### 2.2.4 OKR Model

**File:** `models/okr.py`

```python
from odoo import models, fields, api

class Objective(models.Model):
    _name = 'ipai.okr.objective'
    _description = 'Objective (FC-11)'
    
    name = fields.Char('Objective', required=True)
    description = fields.Text('Description')
    owner_id = fields.Many2one('res.users', 'Owner')
    
    key_result_ids = fields.One2many('ipai.okr.key_result', 'objective_id', 'Key Results')
    
    # Linkage
    project_ids = fields.Many2many('project.project', string='Projects')


class KeyResult(models.Model):
    _name = 'ipai.okr.key_result'
    _description = 'Key Result (FC-11)'
    
    name = fields.Char('Key Result', required=True)
    objective_id = fields.Many2one('ipai.okr.objective', 'Objective', required=True)
    
    # Metrics
    start_value = fields.Float('Start Value')
    current_value = fields.Float('Current Value')
    target_value = fields.Float('Target Value')
    
    progress_pct = fields.Float('Progress %', compute='_compute_progress', store=True)
    
    # Status
    confidence = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], string='Confidence', default='medium')
    
    status = fields.Selection([
        ('not_started', 'Not Started'),
        ('on_track', 'On Track'),
        ('at_risk', 'At Risk'),
        ('behind', 'Behind'),
        ('complete', 'Complete'),
    ], string='Status', default='not_started')
    
    @api.depends('start_value', 'current_value', 'target_value')
    def _compute_progress(self):
        for kr in self:
            if kr.target_value != kr.start_value:
                kr.progress_pct = ((kr.current_value - kr.start_value) / 
                                   (kr.target_value - kr.start_value)) * 100
            else:
                kr.progress_pct = 0.0
```

### 2.3 Views to Create

#### 2.3.1 WBS Tree View

**File:** `views/project_task_views.xml`

```xml
<odoo>
    <record id="view_task_wbs_tree" model="ir.ui.view">
        <field name="name">project.task.wbs.tree</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <tree string="WBS Structure" 
                  decoration-bf="x_task_type == 'phase'"
                  decoration-info="x_task_type == 'checklist'">
                <field name="x_wbs_code"/>
                <field name="x_task_ref"/>
                <field name="name"/>
                <field name="x_task_type"/>
                <field name="date_start"/>
                <field name="date_deadline"/>
                <field name="x_duration"/>
                <field name="progress" widget="progressbar"/>
                <field name="user_ids" widget="many2many_tags"/>
                <field name="x_accountable_id"/>
                <field name="stage_id"/>
            </tree>
        </field>
    </record>
    
    <record id="view_task_wbs_gantt" model="ir.ui.view">
        <field name="name">project.task.wbs.gantt</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <gantt string="WBS Gantt" 
                   date_start="date_start" 
                   date_stop="date_deadline"
                   default_group_by="x_task_type"
                   dependency_field="depend_on_ids">
                <field name="x_wbs_code"/>
                <field name="name"/>
                <field name="user_ids"/>
                <field name="progress"/>
            </gantt>
        </field>
    </record>
</odoo>
```

### 2.4 Security (RBAC)

**File:** `security/ir.model.access.csv`

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_task_manager,project.task.manager,model_project_task,project.group_project_manager,1,1,1,1
access_task_user,project.task.user,model_project_task,project.group_project_user,1,1,1,0
access_risk_manager,ipai.risk.manager,model_ipai_risk_register,project.group_project_manager,1,1,1,1
access_risk_user,ipai.risk.user,model_ipai_risk_register,project.group_project_user,1,0,0,0
```

---

## Phase 3: Data Migration ⏭️

**Duration:** 1 week  
**Team:** 1 data analyst + 1 Odoo developer

### 3.1 Prepare Source Data

**From:** Your Google Sheet / Excel "Full Task Schedule"

**Actions:**

1. **Add WBS Columns:**
   - R: WBS Code (formula from WBS-STRUCTURE-SPECIFICATION.md)
   - S: Level (0-4)
   - T: Type (Phase/Milestone/Task/Checklist)
   - U: Parent WBS
   - V: Predecessor
   - W: Start Date
   - X: Duration

2. **Expand Checklists:**
   - Parse "Detailed Checklist" column (P)
   - Create separate rows for each checklist item (Level 4)
   - Link to parent task via Parent WBS

3. **Validate Data:**
   - Check all WBS codes are unique
   - Verify RACI codes map to Directory
   - Ensure predecessor references exist

### 3.2 Generate CSV Files

**Tool:** Python script or Google Sheets export

```python
import pandas as pd

# Load source data
df = pd.read_excel('Full_Task_Schedule.xlsx')

# Generate phases
phases = df[df['Type'] == 'Phase'][['WBS Code', 'Name', 'Start Date', 'Due Date', 'Accountable']].copy()
phases.to_csv('05_phases.csv', index=False)

# Generate tasks
tasks = df[df['Type'] == 'Task'][['WBS Code', 'Task ID', 'Name', 'Parent WBS', 'Predecessor', ...]].copy()
tasks.to_csv('07_tasks.csv', index=False)

# ... etc.
```

### 3.3 Import into Odoo

**Follow:** `ODOO-IMPORT-TEMPLATES.md` import procedure

**Steps:**
1. Install `ipai_finance_ppm` module
2. Import CSVs in sequence (project → phases → milestones → tasks → checklists → dependencies)
3. Validate data (SQL queries from import guide)
4. Fix errors and re-import if needed

---

## Phase 4: Dashboard & Reports ⏭️

**Duration:** 2 weeks  
**Team:** 1 Odoo developer + 1 report designer

### 4.1 Dashboards to Create

#### 4.1.1 Executive Dashboard

**Widgets:**
- Total tasks (by status, by phase)
- Overdue tasks
- Upcoming milestones
- Risk exposure by project
- Budget variance
- OKR progress

**Tool:** Odoo `board` module + `mis_builder`

#### 4.1.2 Project Manager Dashboard

**Views:**
- Gantt chart (WBS with dependencies)
- Kanban board (tasks by stage)
- Resource allocation (RACI matrix)
- Milestone timeline
- Risk register

#### 4.1.3 Finance Dashboard

**Reports:**
- Budget vs Actual by phase
- Cost breakdown (CAPEX/OPEX)
- Forecast to complete
- Variance analysis

**Tool:** `mis_builder` + custom reports

### 4.2 Standard Reports

1. **WBS Export** (hierarchical task list with all fields)
2. **Status Report** (RAG status, commentary, milestones)
3. **RACI Matrix** (tasks × users)
4. **Dependency Map** (visual network diagram)
5. **Risk Register** (risks by probability/impact)

---

## Phase 5: AI Assistant Integration ⏭️

**Duration:** 1-2 weeks  
**Team:** 1 AI engineer + 1 Odoo developer

### 5.1 Architecture

**Pattern:** Scout Dashboard AI Assistant

**Components:**

1. **Odoo External API:**
   - Expose task, milestone, risk, budget data via REST/JSON-RPC
   - RBAC enforcement (user can only see their tasks/projects)

2. **Supabase + RAG:**
   - Store Odoo data snapshot in Supabase (nightly sync)
   - Embed task descriptions, risk mitigation plans
   - pgvector HNSW index for similarity search

3. **AI Assistant (Ask Suqi for Finance PPM):**
   - GPT-4 Turbo with function calling
   - Tools:
     - `get_my_tasks` - User's tasks (Responsible or Accountable)
     - `get_project_status` - Project summary (phases, milestones, risks)
     - `get_overdue_tasks` - Tasks past due date
     - `get_budget_variance` - Budget vs actual
     - `search_tasks` - RAG search over task descriptions
     - `create_risk` - Add new risk to register
     - `update_task_status` - Mark task complete

### 5.2 Implementation

**Backend:** Edge Function (Deno on Supabase)

```typescript
// /supabase/functions/finance-ppm-ai/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { message, context } = await req.json()
  
  // Call OpenAI with function calling
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    tools: [
      { type: 'function', function: getMyTasksTool },
      { type: 'function', function: getProjectStatusTool },
      // ...
    ]
  })
  
  // Execute tool calls
  const tool_calls = response.choices[0].message.tool_calls || []
  for (const tool_call of tool_calls) {
    if (tool_call.function.name === 'get_my_tasks') {
      // Query Odoo API or Supabase mirror
      const tasks = await getMyTasks(context.user_id)
      // Send results back to GPT
    }
  }
  
  return new Response(JSON.stringify({ response }))
})
```

**Frontend:** Chat interface (React)

```tsx
// /src/components/ai/AiAssistantPanel.tsx

import { useAiAssistant } from '@/hooks/useAiAssistant'

export function AiAssistantPanel() {
  const { messages, sendMessage, isLoading } = useAiAssistant()
  
  return (
    <div className="ai-panel">
      <MessageList messages={messages} />
      <InputBar onSend={sendMessage} loading={isLoading} />
    </div>
  )
}
```

---

## Phase 6: Testing & Training ⏭️

**Duration:** 1 week  
**Team:** 1 QA + 1 trainer + finance team

### 6.1 Testing Checklist

- [ ] **WBS Hierarchy:** All tasks correctly nested
- [ ] **RACI:** Correct assignments, notifications work
- [ ] **Dependencies:** Gantt chart shows correct predecessors
- [ ] **Milestones:** Appear at correct dates, gate reviews work
- [ ] **Risks:** Can create, update, link to tasks
- [ ] **Budgets:** Actuals pulled from analytic lines
- [ ] **OKRs:** Progress calculated correctly
- [ ] **AI Assistant:** Answers questions accurately
- [ ] **Permissions:** RBAC enforced (users see only their data)
- [ ] **Performance:** Page load < 2s, Gantt renders < 3s

### 6.2 Training Plan

**Audience:** Finance team (CKVC, RIM, BOM, JPAL, etc.)

**Sessions:**

1. **Session 1: Overview** (1 hour)
   - What is Finance PPM in Odoo?
   - Tour of dashboards and views
   - How it differs from current process

2. **Session 2: Task Management** (2 hours)
   - Creating/updating tasks
   - Setting RACI assignments
   - Using Gantt and Kanban views
   - Marking tasks complete

3. **Session 3: Risks & Budgets** (1 hour)
   - Adding risks
   - Linking risks to tasks
   - Reviewing budget variance
   - Updating financial plans

4. **Session 4: AI Assistant** (1 hour)
   - Asking questions
   - Getting task lists
   - Understanding responses
   - Best practices

5. **Session 5: Reporting** (1 hour)
   - Generating status reports
   - Exporting WBS
   - Dashboards for managers

### 6.3 Go-Live Checklist

- [ ] All users created with correct roles
- [ ] December 2025 closing tasks imported
- [ ] RACI matrix validated
- [ ] OKRs from LogFrame imported
- [ ] Dashboards configured
- [ ] AI assistant tested
- [ ] Training completed
- [ ] Rollback plan prepared

---

## Success Criteria

### Phase 2 (Module Development)

- [ ] `ipai_finance_ppm` module installs without errors
- [ ] All custom fields appear in UI
- [ ] WBS tree view displays hierarchy correctly
- [ ] Gantt chart shows dependencies
- [ ] Risk register CRUD works
- [ ] OKR progress calculates

### Phase 3 (Data Migration)

- [ ] All 496 tasks imported
- [ ] WBS codes unique and sequential
- [ ] RACI assignments correct (spot check 10%)
- [ ] Predecessors linked (validate critical path)
- [ ] Milestones at correct dates

### Phase 4 (Dashboards)

- [ ] Executive dashboard shows KPIs
- [ ] Project manager Gantt chart loads in < 3s
- [ ] Reports generate without errors
- [ ] Export to CSV/PDF works

### Phase 5 (AI Assistant)

- [ ] AI answers "What are my tasks?" correctly
- [ ] AI retrieves project status
- [ ] AI can create risks
- [ ] Response time < 5s

### Phase 6 (Testing & Training)

- [ ] 90% of test cases pass
- [ ] 100% of users trained
- [ ] No critical bugs
- [ ] Performance targets met

---

## Risk Register (Implementation Risks)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OCA modules incompatible with Odoo 18 CE | Medium | High | Test on staging first, have fallback plan |
| Data migration errors (WBS codes duplicate) | Medium | Medium | Validate data before import, have rollback CSVs |
| AI assistant integration complex | Low | Medium | Start with simple tools, iterate |
| User adoption low (prefer Excel) | High | High | Strong training, show value early, executive sponsorship |
| Performance issues (Gantt slow with 500+ tasks) | Medium | Medium | Optimize queries, use pagination, cache views |

---

## Budget Estimate

| Phase | Resource | Days | Rate (USD) | Cost |
|-------|----------|------|-----------|------|
| **Phase 2** | Senior Odoo Dev | 15 | $800/day | $12,000 |
| **Phase 3** | Data Analyst | 5 | $600/day | $3,000 |
| **Phase 4** | Odoo Dev + Designer | 10 | $700/day | $7,000 |
| **Phase 5** | AI Engineer | 7 | $900/day | $6,300 |
| **Phase 6** | QA + Trainer | 5 | $500/day | $2,500 |
| **Contingency** | 15% | — | — | $4,620 |
| **Total** | | **42 days** | | **$35,420** |

---

## Next Immediate Actions

### Week 1: Setup & Planning

**Day 1-2:**
1. [ ] Setup Odoo 18 CE development environment
2. [ ] Install OCA dependencies:
   - `project_milestone`
   - `project_task_dependency`
   - `project_role`
   - `mis_builder`
   - `account_budget_oca`
3. [ ] Create `ipai_finance_ppm` module skeleton

**Day 3-4:**
4. [ ] Implement `project.task` extensions (WBS, RACI fields)
5. [ ] Create WBS tree view + Gantt view
6. [ ] Test with 5-10 sample tasks

**Day 5:**
7. [ ] Add WBS columns (R-X) to Full Task Schedule
8. [ ] Populate first 20 rows with WBS codes, levels, types
9. [ ] Validate WBS hierarchy logic

### Week 2: Data Preparation

**Day 6-8:**
10. [ ] Expand all 496 tasks with WBS columns
11. [ ] Break out checklists into separate rows
12. [ ] Map all RACI codes to Directory users
13. [ ] Identify task predecessors (critical path)

**Day 9-10:**
14. [ ] Generate CSV files (phases, tasks, checklists, dependencies)
15. [ ] Validate CSVs against Odoo import format
16. [ ] Test import on staging environment

---

## Appendices

### Appendix A: FC-01 to FC-12 Module Mapping

| Suite Module | Odoo Models | OCA Modules | Status |
|--------------|-------------|-------------|--------|
| FC-01 Portfolio | `project.project`, `account.analytic.account` | `project_portfolio` | ⏭️ Future |
| FC-02 Projects & Tasks | `project.task`, `project.milestone` | `project_milestone`, `project_task_dependency` | ✅ Phase 2 |
| FC-03 Resources | `hr.employee`, `res.users` | `project_role`, `project_resource_allocation` | ⏭️ Future |
| FC-04 Timesheets | `account.analytic.line`, `hr_timesheet` | `timesheet_grid` | ⏭️ Future |
| FC-05 Budgets | `account.budget`, `ipai.financial.plan` | `account_budget_oca`, `mis_builder` | ✅ Phase 2 |
| FC-06 Contracts | `sale.order`, `contract` | `contract`, `sale_timesheet` | ⏭️ Future |
| FC-07 Risks | `ipai.risk.register` | Custom | ✅ Phase 2 |
| FC-08 Dashboards | `board`, `mis.report` | `mis_builder`, `web_dashboard` | ✅ Phase 4 |
| FC-09 Collaboration | `mail.message`, `mail.activity` | Core | ⏭️ Future |
| FC-10 Templates | `project.template`, `ipai.baseline` | Custom | ⏭️ Future |
| FC-11 OKRs | `ipai.okr.objective`, `ipai.okr.key_result` | Custom | ✅ Phase 2 |
| FC-12 Integration | `ipai.integration.log` | Custom | ⏭️ Future |

### Appendix B: Document References

| Document | Purpose | Status |
|----------|---------|--------|
| `WBS-STRUCTURE-SPECIFICATION.md` | WBS hierarchy design | ✅ Complete |
| `ODOO-IMPORT-TEMPLATES.md` | CSV templates + import guide | ✅ Complete |
| `IMPLEMENTATION-ROADMAP.md` | This document (full plan) | ✅ Complete |
| `Full Task Schedule.xlsx` | Source data (496 tasks) | ✅ Exists, needs WBS columns |
| `Odoo OCA Mapping.xlsx` | Field mappings | ✅ Complete |
| `LogFrame.xlsx` | OKRs/KPIs | ✅ Exists, needs import |
| `Directory.xlsx` | RACI users | ✅ Complete |

---

**Ready to proceed with Phase 2 (Module Development)?**

**Next Step:** Create `ipai_finance_ppm` module skeleton and implement `project.task` extensions.

---

**Last Updated:** 2025-12-07  
**Version:** 1.0 - Implementation Roadmap  
**Owner:** Finance PPM Implementation Team
