# Frontend Development Guide

Complete guide to building pages and features for Finance PPM in Odoo 18 CE + OCA.

---

## Prerequisites

Before you start developing:

- ✅ Read [Architecture Overview](./02-ARCHITECTURE.md)
- ✅ Complete [Quick Start Guide](./01-QUICK-START.md)
- ✅ Review [Type Reference](./14-TYPE-REFERENCE.md)
- ✅ Understand Odoo 18 CE XML views and QWeb templates

---

## Development Environment Setup

### 1. Install Odoo Development Dependencies

```bash
# Install Odoo 18 CE
git clone https://github.com/odoo/odoo.git --branch 18.0 --depth 1
cd odoo

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install ipai_finance_ppm module
cd addons
git clone https://github.com/your-org/ipai_finance_ppm.git
```

### 2. Configure Development Database

```bash
# Create development database
createdb finance_ppm_dev

# Run Odoo with module
./odoo-bin -d finance_ppm_dev -i ipai_finance_ppm --dev=all
```

### 3. Enable Developer Mode

1. Navigate to Settings → General Settings
2. Scroll to "Developer Tools"
3. Click "Activate the developer mode"

---

## Creating a New View

### 1. WBS Tree View (Hierarchical Tasks)

**File:** `views/project_task_wbs_views.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- WBS Tree View -->
    <record id="view_task_wbs_tree" model="ir.ui.view">
        <field name="name">project.task.wbs.tree</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <tree string="WBS Structure" 
                  decoration-bf="x_task_type == 'phase'"
                  decoration-info="x_task_type == 'checklist'"
                  decoration-success="progress == 100"
                  decoration-warning="progress > 0 and progress < 100"
                  decoration-danger="date_deadline < current_date and progress < 100">
                
                <!-- Hierarchy -->
                <field name="x_wbs_code" string="WBS"/>
                <field name="x_task_ref" string="ID"/>
                <field name="name" string="Task Name"/>
                <field name="x_task_type" invisible="1"/>
                
                <!-- Dates -->
                <field name="date_start" string="Start"/>
                <field name="date_deadline" string="Due"/>
                <field name="x_duration" string="Days"/>
                
                <!-- Progress -->
                <field name="progress" widget="progressbar" string="% Complete"/>
                <field name="stage_id" string="Stage"/>
                
                <!-- RACI -->
                <field name="user_ids" widget="many2many_tags" string="R"/>
                <field name="x_accountable_id" string="A"/>
                
                <!-- Status Indicators -->
                <field name="kanban_state" widget="state_selection"/>
            </tree>
        </field>
    </record>
    
    <!-- WBS Gantt View -->
    <record id="view_task_wbs_gantt" model="ir.ui.view">
        <field name="name">project.task.wbs.gantt</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <gantt string="WBS Gantt" 
                   date_start="date_start" 
                   date_stop="date_deadline"
                   default_group_by="x_task_type"
                   dependency_field="depend_on_ids"
                   color="stage_id">
                
                <field name="x_wbs_code"/>
                <field name="name"/>
                <field name="user_ids"/>
                <field name="progress"/>
                <field name="stage_id"/>
            </gantt>
        </field>
    </record>
    
    <!-- WBS Form View -->
    <record id="view_task_wbs_form" model="ir.ui.view">
        <field name="name">project.task.wbs.form</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <form string="Task">
                <header>
                    <field name="stage_id" widget="statusbar" 
                           options="{'clickable': '1', 'fold_field': 'fold'}"/>
                </header>
                
                <sheet>
                    <div class="oe_title">
                        <h1>
                            <field name="name" placeholder="Task Name"/>
                        </h1>
                        <h2>
                            <field name="x_task_ref" readonly="1" class="text-muted"/>
                        </h2>
                    </div>
                    
                    <group>
                        <group name="wbs_info" string="WBS Information">
                            <field name="x_wbs_code" readonly="1"/>
                            <field name="x_wbs_level" readonly="1"/>
                            <field name="x_task_type"/>
                            <field name="parent_id" domain="[('x_task_type', '=', 'phase')]"/>
                        </group>
                        
                        <group name="scheduling" string="Scheduling">
                            <field name="date_start"/>
                            <field name="date_deadline"/>
                            <field name="x_duration"/>
                            <field name="progress" widget="progressbar"/>
                        </group>
                    </group>
                    
                    <group>
                        <group name="raci" string="RACI Assignments">
                            <field name="user_ids" widget="many2many_tags" 
                                   string="Responsible (R)"/>
                            <field name="x_accountable_id" string="Accountable (A)"/>
                            <field name="x_consulted_ids" widget="many2many_tags" 
                                   string="Consulted (C)"/>
                            <field name="x_informed_ids" widget="many2many_tags" 
                                   string="Informed (I)"/>
                        </group>
                        
                        <group name="dependencies" string="Dependencies">
                            <field name="depend_on_ids" widget="many2many_tags"/>
                        </group>
                    </group>
                    
                    <notebook>
                        <page name="description" string="Description">
                            <field name="description" placeholder="Task details..."/>
                        </page>
                        
                        <page name="checklists" string="Checklists">
                            <field name="child_ids" context="{'default_parent_id': active_id, 'default_x_task_type': 'checklist'}">
                                <tree editable="bottom">
                                    <field name="x_task_ref"/>
                                    <field name="name"/>
                                    <field name="progress" widget="progressbar"/>
                                    <field name="user_ids" widget="many2many_tags"/>
                                </tree>
                            </field>
                        </page>
                        
                        <page name="timesheets" string="Timesheets">
                            <field name="timesheet_ids">
                                <tree editable="bottom">
                                    <field name="date"/>
                                    <field name="employee_id"/>
                                    <field name="name"/>
                                    <field name="unit_amount" string="Hours"/>
                                </tree>
                            </field>
                        </page>
                    </notebook>
                </sheet>
                
                <div class="oe_chatter">
                    <field name="message_follower_ids" widget="mail_followers"/>
                    <field name="message_ids" widget="mail_thread"/>
                </div>
            </form>
        </field>
    </record>
    
    <!-- Action -->
    <record id="action_project_task_wbs" model="ir.actions.act_window">
        <field name="name">WBS Structure</field>
        <field name="res_model">project.task</field>
        <field name="view_mode">tree,gantt,form,kanban</field>
        <field name="context">{
            'search_default_group_by_phase': 1,
        }</field>
        <field name="domain">[]</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first task in the WBS structure
            </p>
        </field>
    </record>
    
    <!-- Menu Item -->
    <menuitem id="menu_project_task_wbs"
              name="WBS Structure"
              parent="project.menu_main_pm"
              action="action_project_task_wbs"
              sequence="10"/>
</odoo>
```

---

## Creating a Dashboard Widget

### 1. Month-End Closing Dashboard

**File:** `views/dashboard_views.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Dashboard KPI Widgets -->
    <record id="view_finance_ppm_dashboard" model="ir.ui.view">
        <field name="name">finance.ppm.dashboard</field>
        <field name="model">project.project</field>
        <field name="arch" type="xml">
            <dashboard>
                <view type="graph" ref="view_task_progress_graph"/>
                <view type="pivot" ref="view_task_pivot"/>
                
                <group col="4">
                    <!-- Total Tasks -->
                    <aggregate name="total_tasks" 
                               field="task_count" 
                               group_operator="sum"
                               string="Total Tasks"/>
                    
                    <!-- Completed Tasks -->
                    <aggregate name="completed_tasks" 
                               field="task_count" 
                               domain="[('progress', '=', 100)]"
                               string="Completed"/>
                    
                    <!-- In Progress -->
                    <aggregate name="in_progress_tasks" 
                               field="task_count" 
                               domain="[('progress', '>', 0), ('progress', '<', 100)]"
                               string="In Progress"/>
                    
                    <!-- Overdue -->
                    <aggregate name="overdue_tasks" 
                               field="task_count" 
                               domain="[('date_deadline', '<', context_today().strftime('%Y-%m-%d')), ('progress', '<', 100)]"
                               string="Overdue"
                               widget="integer"
                               help="Tasks past due date"/>
                </group>
                
                <group col="2">
                    <!-- Progress by Phase -->
                    <widget name="phase_progress" 
                            title="Progress by Phase"
                            graph_type="bar"
                            measure="progress"
                            group_by="x_task_type"/>
                    
                    <!-- Milestone Timeline -->
                    <widget name="milestone_timeline"
                            title="Upcoming Milestones"
                            graph_type="timeline"
                            date_field="date_deadline"
                            domain="[('x_task_type', '=', 'milestone')]"/>
                </group>
            </dashboard>
        </field>
    </record>
</odoo>
```

---

## Creating a Custom Report

### 1. WBS Export Report

**File:** `reports/wbs_export_report.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Report Template -->
    <template id="report_wbs_export_document">
        <t t-call="web.html_container">
            <t t-call="web.external_layout">
                <div class="page">
                    <h2>WBS Structure - <span t-field="docs.name"/></h2>
                    
                    <table class="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>WBS Code</th>
                                <th>Task ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Start</th>
                                <th>Due</th>
                                <th>Progress</th>
                                <th>R</th>
                                <th>A</th>
                            </tr>
                        </thead>
                        <tbody>
                            <t t-foreach="docs.task_ids.sorted(lambda t: t.x_wbs_code)" t-as="task">
                                <tr t-att-class="'table-primary' if task.x_task_type == 'phase' else ''">
                                    <td><span t-field="task.x_wbs_code"/></td>
                                    <td><span t-field="task.x_task_ref"/></td>
                                    <td>
                                        <span t-if="task.x_wbs_level == 1" class="fw-bold">
                                            <span t-field="task.name"/>
                                        </span>
                                        <span t-else="" t-field="task.name"/>
                                    </td>
                                    <td><span t-field="task.x_task_type"/></td>
                                    <td><span t-field="task.date_start"/></td>
                                    <td><span t-field="task.date_deadline"/></td>
                                    <td>
                                        <div class="progress" style="height: 20px;">
                                            <div class="progress-bar" 
                                                 role="progressbar" 
                                                 t-att-style="'width: %s%%' % task.progress"
                                                 t-att-aria-valuenow="task.progress">
                                                <span t-esc="'%.0f%%' % task.progress"/>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <t t-foreach="task.user_ids" t-as="user">
                                            <span t-field="user.name" class="badge bg-secondary"/>
                                        </t>
                                    </td>
                                    <td><span t-field="task.x_accountable_id.name"/></td>
                                </tr>
                            </t>
                        </tbody>
                    </table>
                </div>
            </t>
        </t>
    </template>
    
    <!-- Report Action -->
    <record id="action_report_wbs_export" model="ir.actions.report">
        <field name="name">WBS Export</field>
        <field name="model">project.project</field>
        <field name="report_type">qweb-pdf</field>
        <field name="report_name">ipai_finance_ppm.report_wbs_export_document</field>
        <field name="report_file">ipai_finance_ppm.report_wbs_export_document</field>
        <field name="binding_model_id" ref="project.model_project_project"/>
        <field name="binding_type">report</field>
    </record>
</odoo>
```

---

## Working with RACI Assignments

### 1. RACI Matrix View

**File:** `views/raci_matrix_view.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- RACI Matrix Pivot View -->
    <record id="view_task_raci_pivot" model="ir.ui.view">
        <field name="name">project.task.raci.pivot</field>
        <field name="model">project.task</field>
        <field name="arch" type="xml">
            <pivot string="RACI Matrix">
                <field name="name" type="row"/>
                <field name="x_accountable_id" type="col"/>
                <field name="id" type="measure"/>
            </pivot>
        </field>
    </record>
    
    <!-- RACI Action -->
    <record id="action_task_raci_matrix" model="ir.actions.act_window">
        <field name="name">RACI Matrix</field>
        <field name="res_model">project.task</field>
        <field name="view_mode">pivot,tree,form</field>
        <field name="context">{}</field>
    </record>
</odoo>
```

---

## JavaScript/OWL Components

### 1. WBS Tree Widget

**File:** `static/src/js/wbs_tree_widget.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class WBSTreeWidget extends Component {
    static template = "ipai_finance_ppm.WBSTreeWidget";
    static props = ["*"];
    
    setup() {
        this.tasks = this.props.value || [];
    }
    
    getTaskClass(task) {
        const classes = ['wbs-task'];
        if (task.x_task_type === 'phase') {
            classes.push('wbs-phase');
        } else if (task.x_task_type === 'milestone') {
            classes.push('wbs-milestone');
        }
        if (task.progress === 100) {
            classes.push('wbs-complete');
        }
        return classes.join(' ');
    }
    
    getIndentation(level) {
        return `padding-left: ${level * 20}px`;
    }
}

registry.category("fields").add("wbs_tree", {
    component: WBSTreeWidget,
});
```

**Template:** `static/src/xml/wbs_tree_widget.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="ipai_finance_ppm.WBSTreeWidget" owl="1">
        <div class="wbs-tree-widget">
            <t t-foreach="tasks" t-as="task" t-key="task.id">
                <div t-att-class="getTaskClass(task)" 
                     t-att-style="getIndentation(task.x_wbs_level)">
                    <span class="wbs-code"><t t-esc="task.x_wbs_code"/></span>
                    <span class="wbs-name"><t t-esc="task.name"/></span>
                    <span class="wbs-progress">
                        <div class="progress">
                            <div class="progress-bar" 
                                 t-att-style="'width: ' + task.progress + '%'">
                                <t t-esc="task.progress"/>%
                            </div>
                        </div>
                    </span>
                </div>
            </t>
        </div>
    </t>
</templates>
```

---

## Best Practices

### 1. Naming Conventions

**XML IDs:**
```xml
<!-- Views -->
view_model_viewtype              <!-- view_task_wbs_tree -->

<!-- Actions -->
action_model_name                <!-- action_project_task_wbs -->

<!-- Menu Items -->
menu_module_name                 <!-- menu_finance_ppm_wbs -->
```

**Python Fields:**
```python
# Custom fields start with x_
x_wbs_code = fields.Char('WBS Code')
x_task_type = fields.Selection(...)

# Standard fields follow Odoo conventions
name = fields.Char('Name', required=True)
date_start = fields.Date('Start Date')
```

### 2. Performance Optimization

**Eager Loading:**
```python
# Instead of
for task in self.env['project.task'].search([]):
    print(task.user_ids.mapped('name'))  # N+1 queries

# Use
tasks = self.env['project.task'].search([])
tasks = tasks.with_prefetch(tasks._fields.keys())
for task in tasks:
    print(task.user_ids.mapped('name'))  # Single query
```

**Batch Operations:**
```python
# Instead of
for task in tasks:
    task.write({'progress': 100})

# Use
tasks.write({'progress': 100})
```

### 3. Security (RLS)

**Access Rules:**
```xml
<record id="rule_task_tenant_isolation" model="ir.rule">
    <field name="name">Task: Tenant Isolation</field>
    <field name="model_id" ref="project.model_project_task"/>
    <field name="domain_force">[('project_id.tenant_id', '=', user.tenant_id.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>
```

---

## Testing

### 1. Unit Tests

**File:** `tests/test_wbs_structure.py`

```python
from odoo.tests import TransactionCase

class TestWBSStructure(TransactionCase):
    
    def setUp(self):
        super().setUp()
        self.Project = self.env['project.project']
        self.Task = self.env['project.task']
        
        # Create test project
        self.project = self.Project.create({
            'name': 'Test Month-End Closing',
        })
    
    def test_wbs_code_generation(self):
        """Test WBS code auto-generation"""
        phase = self.Task.create({
            'name': 'Phase I',
            'project_id': self.project.id,
            'x_task_type': 'phase',
        })
        
        self.assertEqual(phase.x_wbs_code, '1.0')
        
        task = self.Task.create({
            'name': 'Task 1',
            'project_id': self.project.id,
            'parent_id': phase.id,
            'x_task_type': 'task',
        })
        
        self.assertEqual(task.x_wbs_code, '1.1.1')
    
    def test_raci_assignments(self):
        """Test RACI field assignments"""
        user1 = self.env.ref('base.user_demo')
        user2 = self.env.ref('base.user_admin')
        
        task = self.Task.create({
            'name': 'Test Task',
            'project_id': self.project.id,
            'user_ids': [(6, 0, [user1.id])],
            'x_accountable_id': user2.id,
        })
        
        self.assertIn(user1, task.user_ids)
        self.assertEqual(task.x_accountable_id, user2)
```

### 2. Integration Tests

**File:** `tests/test_wbs_import.py`

```python
import csv
from io import StringIO
from odoo.tests import TransactionCase

class TestWBSImport(TransactionCase):
    
    def test_csv_import(self):
        """Test importing WBS from CSV"""
        csv_data = StringIO("""
id,name,x_wbs_code,x_task_type,parent_id/id,date_start,date_deadline
task_phase_1,Phase I,1.0,phase,,2025-12-01,2025-12-01
task_001,Task 1,1.1.1,task,task_phase_1,2025-12-01,2025-12-01
        """)
        
        self.env['project.task'].load(csv_data.read())
        
        phase = self.env.ref('__import__.task_phase_1')
        task = self.env.ref('__import__.task_001')
        
        self.assertEqual(phase.x_task_type, 'phase')
        self.assertEqual(task.parent_id, phase)
```

---

## Debugging Tips

### 1. Enable Debug Logging

```python
import logging
_logger = logging.getLogger(__name__)

class ProjectTask(models.Model):
    _inherit = 'project.task'
    
    def create(self, vals):
        _logger.info('Creating task with values: %s', vals)
        task = super().create(vals)
        _logger.info('Created task: %s (ID: %s)', task.name, task.id)
        return task
```

### 2. Use pdb Debugger

```python
def compute_wbs_code(self):
    import pdb; pdb.set_trace()  # Breakpoint
    # Your code here
```

### 3. Check SQL Queries

```python
# In Odoo shell
self._cr.execute("SELECT * FROM project_task WHERE x_wbs_code LIKE '1.%'")
results = self._cr.dictfetchall()
print(results)
```

---

## Next Steps

- **Read:** [Database Schema](./08-DATABASE-SCHEMA.md)
- **Review:** [API Integration Guide](./05-API-INTEGRATION.md)
- **Explore:** [Component Library](./07-COMPONENT-LIBRARY.md)

---

**Last Updated:** 2025-12-07  
**Version:** 1.0 - Frontend Development Guide
