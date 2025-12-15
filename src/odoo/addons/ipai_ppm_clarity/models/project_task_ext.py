# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
from datetime import datetime, timedelta


class ProjectTaskClarity(models.Model):
    """
    Extended project.task with Clarity 16.1.1 parity features.
    Supports phases, milestones, WBS hierarchy, dependencies, and autoschedule.
    """
    _inherit = 'project.task'

    # === Phase & Hierarchy ===
    phase_id = fields.Many2one(
        'ipai.project.phase',
        string='Phase',
        index=True,
        tracking=True,
    )

    task_type = fields.Selection([
        ('task', 'Task'),
        ('phase', 'Phase'),
        ('milestone', 'Milestone'),
        ('summary', 'Summary Task'),
    ], string='Task Type', default='task', required=True, tracking=True)

    is_phase = fields.Boolean(
        string='Is Phase',
        compute='_compute_task_type_flags',
        store=True,
    )
    is_milestone = fields.Boolean(
        string='Is Milestone',
        compute='_compute_task_type_flags',
        store=True,
    )
    is_summary = fields.Boolean(
        string='Is Summary Task',
        compute='_compute_task_type_flags',
        store=True,
    )
    is_subproject = fields.Boolean(
        string='Is Subproject',
        default=False,
        help='If checked, this task acts as a proxy to a child project.',
    )

    # === WBS (Work Breakdown Structure) ===
    wbs_code = fields.Char(
        string='WBS Code',
        index=True,
        help='Work Breakdown Structure code (e.g., 1.2.3)',
    )
    wbs_level = fields.Integer(
        string='WBS Level',
        default=1,
        help='Hierarchy level (1 = top level)',
    )
    wbs_sort = fields.Char(
        string='WBS Sort Key',
        compute='_compute_wbs_sort',
        store=True,
        help='Sortable key for WBS ordering',
    )

    # === Scheduling ===
    duration_days = fields.Float(
        string='Duration (Days)',
        default=1.0,
        tracking=True,
    )
    percent_complete = fields.Float(
        string='Percent Complete',
        default=0.0,
        tracking=True,
        help='Task completion percentage (0-100)',
    )
    etc_hours = fields.Float(
        string='ETC Hours',
        compute='_compute_etc_hours',
        store=True,
        help='Estimate to Complete hours',
    )
    total_effort = fields.Float(
        string='Total Effort',
        compute='_compute_total_effort',
        store=True,
        help='Total effort = Actual + ETC',
    )

    # === Critical Path Fields ===
    is_critical = fields.Boolean(
        string='Is Critical',
        default=False,
        help='Task is on the critical path',
    )
    float_days = fields.Float(
        string='Float (Days)',
        default=0.0,
        help='Total float/slack in days',
    )
    early_start = fields.Datetime(
        string='Early Start',
        help='Earliest possible start date (CPM)',
    )
    early_finish = fields.Datetime(
        string='Early Finish',
        help='Earliest possible finish date (CPM)',
    )
    late_start = fields.Datetime(
        string='Late Start',
        help='Latest possible start date (CPM)',
    )
    late_finish = fields.Datetime(
        string='Late Finish',
        help='Latest possible finish date (CPM)',
    )

    # === Tentative Schedule (Draft) ===
    tentative_start = fields.Datetime(
        string='Tentative Start',
        help='Draft start date from tentative autoschedule',
    )
    tentative_finish = fields.Datetime(
        string='Tentative Finish',
        help='Draft finish date from tentative autoschedule',
    )
    tentative_active = fields.Boolean(
        string='Has Tentative Schedule',
        default=False,
        help='Indicates a tentative schedule exists',
    )

    # === Constraints ===
    locked = fields.Boolean(
        string='Locked',
        default=False,
        help='Locked tasks are not moved by autoschedule',
    )
    constraint_type = fields.Selection([
        ('asap', 'As Soon As Possible'),
        ('alap', 'As Late As Possible'),
        ('snet', 'Start No Earlier Than'),
        ('snlt', 'Start No Later Than'),
        ('fnet', 'Finish No Earlier Than'),
        ('fnlt', 'Finish No Later Than'),
        ('mso', 'Must Start On'),
        ('mfo', 'Must Finish On'),
    ], string='Constraint Type', default='asap')
    constraint_date = fields.Date(
        string='Constraint Date',
    )

    # === Dependencies ===
    predecessor_ids = fields.One2many(
        'ipai.task.dependency',
        'successor_id',
        string='Predecessors',
    )
    successor_ids = fields.One2many(
        'ipai.task.dependency',
        'predecessor_id',
        string='Successors',
    )
    predecessor_count = fields.Integer(
        string='Predecessor Count',
        compute='_compute_dependency_counts',
    )
    successor_count = fields.Integer(
        string='Successor Count',
        compute='_compute_dependency_counts',
    )

    # === To-Dos ===
    todo_ids = fields.One2many(
        'ipai.task.todo',
        'task_id',
        string='To-Do Items',
    )
    todo_count = fields.Integer(
        string='To-Do Count',
        compute='_compute_todo_count',
    )
    todo_done_count = fields.Integer(
        string='Completed To-Dos',
        compute='_compute_todo_count',
    )

    # === Owner/Assignment ===
    resource_id = fields.Many2one(
        'resource.resource',
        string='Resource',
        help='Assigned resource for scheduling',
    )

    # === Display ===
    gantt_color = fields.Integer(
        string='Gantt Color',
        default=0,
    )

    @api.depends('task_type')
    def _compute_task_type_flags(self):
        """Compute boolean flags from task_type selection."""
        for task in self:
            task.is_phase = task.task_type == 'phase'
            task.is_milestone = task.task_type == 'milestone'
            task.is_summary = task.task_type == 'summary'

    @api.depends('wbs_code')
    def _compute_wbs_sort(self):
        """Generate sortable WBS key (pads each level to 4 digits)."""
        for task in self:
            if task.wbs_code:
                parts = task.wbs_code.split('.')
                task.wbs_sort = '.'.join(p.zfill(4) for p in parts)
            else:
                task.wbs_sort = '9999'

    @api.depends('planned_hours', 'effective_hours', 'percent_complete')
    def _compute_etc_hours(self):
        """Compute Estimate to Complete hours."""
        for task in self:
            if task.planned_hours > 0:
                remaining_pct = max(0, 100 - task.percent_complete) / 100
                task.etc_hours = task.planned_hours * remaining_pct
            else:
                task.etc_hours = 0.0

    @api.depends('effective_hours', 'etc_hours')
    def _compute_total_effort(self):
        """Compute total effort (Actual + ETC)."""
        for task in self:
            task.total_effort = task.effective_hours + task.etc_hours

    @api.depends('predecessor_ids', 'successor_ids')
    def _compute_dependency_counts(self):
        """Count dependencies."""
        for task in self:
            task.predecessor_count = len(task.predecessor_ids)
            task.successor_count = len(task.successor_ids)

    @api.depends('todo_ids', 'todo_ids.state')
    def _compute_todo_count(self):
        """Count to-do items."""
        for task in self:
            todos = task.todo_ids
            task.todo_count = len(todos)
            task.todo_done_count = len(todos.filtered(lambda t: t.state == 'done'))

    @api.onchange('task_type')
    def _onchange_task_type(self):
        """Set defaults based on task type."""
        if self.task_type == 'milestone':
            self.duration_days = 0
        elif self.task_type == 'phase':
            self.is_summary = False

    def action_lock(self):
        """Lock task to prevent autoschedule changes."""
        self.write({'locked': True})
        return True

    def action_unlock(self):
        """Unlock task for autoschedule."""
        self.write({'locked': False})
        return True

    def action_mark_critical(self):
        """Manually mark task as critical."""
        self.write({'is_critical': True})
        return True

    def action_view_predecessors(self):
        """View predecessor dependencies."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Predecessors - {self.name}',
            'res_model': 'ipai.task.dependency',
            'view_mode': 'tree,form',
            'domain': [('successor_id', '=', self.id)],
            'context': {
                'default_successor_id': self.id,
            },
        }

    def action_view_successors(self):
        """View successor dependencies."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Successors - {self.name}',
            'res_model': 'ipai.task.dependency',
            'view_mode': 'tree,form',
            'domain': [('predecessor_id', '=', self.id)],
            'context': {
                'default_predecessor_id': self.id,
            },
        }

    def action_view_todos(self):
        """View to-do items for this task."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'To-Dos - {self.name}',
            'res_model': 'ipai.task.todo',
            'view_mode': 'tree,form',
            'domain': [('task_id', '=', self.id)],
            'context': {
                'default_task_id': self.id,
            },
        }

    def shift_dates(self, days):
        """
        Shift task dates by a number of days.
        Used for bulk date shifting like Clarity's relative date feature.
        """
        if not self.locked:
            if self.planned_date_begin:
                self.planned_date_begin += timedelta(days=days)
            if self.date_deadline:
                self.date_deadline += timedelta(days=days)
        return True

    def publish_tentative_schedule(self):
        """Publish tentative schedule to actual dates."""
        for task in self:
            if task.tentative_active:
                task.write({
                    'planned_date_begin': task.tentative_start,
                    'date_deadline': task.tentative_finish,
                    'tentative_active': False,
                })
        return True

    def discard_tentative_schedule(self):
        """Discard tentative schedule."""
        self.write({
            'tentative_start': False,
            'tentative_finish': False,
            'tentative_active': False,
        })
        return True
