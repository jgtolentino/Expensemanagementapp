# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
from datetime import datetime, timedelta
import json


class ProjectBaseline(models.Model):
    """
    Project Baseline model aligned with Clarity 16.1.1.
    Captures a snapshot of the project schedule for comparison.
    """
    _name = 'ipai.project.baseline'
    _description = 'Project Baseline'
    _order = 'create_date desc'

    name = fields.Char(
        string='Baseline Name',
        required=True,
    )
    project_id = fields.Many2one(
        'project.project',
        string='Project',
        required=True,
        ondelete='cascade',
        index=True,
    )
    description = fields.Text(
        string='Description',
    )

    # Baseline metadata
    is_current = fields.Boolean(
        string='Is Current Baseline',
        default=False,
    )
    revision = fields.Integer(
        string='Revision',
        default=1,
    )

    # Project snapshot
    baseline_start = fields.Date(
        string='Baseline Start',
    )
    baseline_finish = fields.Date(
        string='Baseline Finish',
    )
    baseline_cost = fields.Float(
        string='Baseline Cost',
    )
    baseline_hours = fields.Float(
        string='Baseline Hours',
    )

    # Task snapshots
    task_snapshot_ids = fields.One2many(
        'ipai.baseline.task.snapshot',
        'baseline_id',
        string='Task Snapshots',
    )

    # Created info
    created_by_id = fields.Many2one(
        'res.users',
        string='Created By',
        default=lambda self: self.env.user,
    )

    def action_set_current(self):
        """Set this baseline as the current baseline."""
        # Unset other current baselines
        self.search([
            ('project_id', '=', self.project_id.id),
            ('id', '!=', self.id),
            ('is_current', '=', True),
        ]).write({'is_current': False})

        self.is_current = True

        # Apply baseline dates to tasks
        for snapshot in self.task_snapshot_ids:
            if snapshot.task_id.exists():
                snapshot.task_id.write({
                    'baseline_start': snapshot.start_date,
                    'baseline_finish': snapshot.finish_date,
                    'baseline_duration': snapshot.duration_days,
                })

        return True

    @api.model
    def create_baseline(self, project_id, name, description=''):
        """Create a new baseline capturing current project state."""
        project = self.env['project.project'].browse(project_id)
        if not project.exists():
            return False

        # Get next revision number
        existing = self.search([
            ('project_id', '=', project_id)
        ], order='revision desc', limit=1)
        revision = (existing.revision + 1) if existing else 1

        # Calculate totals
        tasks = project.task_ids.filtered(lambda t: t.active)
        total_hours = sum(tasks.mapped('planned_hours'))
        total_cost = 0  # Would calculate from task costs

        # Create baseline
        baseline = self.create({
            'name': name,
            'project_id': project_id,
            'description': description,
            'revision': revision,
            'baseline_start': project.project_start_date,
            'baseline_finish': project.project_finish_date,
            'baseline_hours': total_hours,
            'baseline_cost': total_cost,
        })

        # Create task snapshots
        TaskSnapshot = self.env['ipai.baseline.task.snapshot']
        for task in tasks:
            TaskSnapshot.create({
                'baseline_id': baseline.id,
                'task_id': task.id,
                'task_name': task.name,
                'wbs_code': task.wbs_code,
                'start_date': task.planned_date_begin,
                'finish_date': task.date_deadline,
                'duration_days': task.duration_days,
                'planned_hours': task.planned_hours,
                'percent_complete': task.percent_complete,
            })

        return baseline


class BaselineTaskSnapshot(models.Model):
    """Snapshot of a task at baseline time."""
    _name = 'ipai.baseline.task.snapshot'
    _description = 'Baseline Task Snapshot'

    baseline_id = fields.Many2one(
        'ipai.project.baseline',
        string='Baseline',
        required=True,
        ondelete='cascade',
    )
    task_id = fields.Many2one(
        'project.task',
        string='Task',
        ondelete='set null',
    )
    task_name = fields.Char(
        string='Task Name',
    )
    wbs_code = fields.Char(
        string='WBS Code',
    )

    # Snapshot data
    start_date = fields.Datetime(
        string='Start Date',
    )
    finish_date = fields.Datetime(
        string='Finish Date',
    )
    duration_days = fields.Float(
        string='Duration (Days)',
    )
    planned_hours = fields.Float(
        string='Planned Hours',
    )
    percent_complete = fields.Float(
        string='Percent Complete',
    )

    # Variance (computed when comparing)
    start_variance_days = fields.Float(
        string='Start Variance',
        compute='_compute_variance',
    )
    finish_variance_days = fields.Float(
        string='Finish Variance',
        compute='_compute_variance',
    )

    @api.depends('task_id', 'start_date', 'finish_date')
    def _compute_variance(self):
        for snapshot in self:
            start_var = 0
            finish_var = 0

            if snapshot.task_id.exists():
                if snapshot.start_date and snapshot.task_id.planned_date_begin:
                    delta = snapshot.task_id.planned_date_begin - snapshot.start_date
                    start_var = delta.days

                if snapshot.finish_date and snapshot.task_id.date_deadline:
                    delta = snapshot.task_id.date_deadline - snapshot.finish_date
                    finish_var = delta.days

            snapshot.start_variance_days = start_var
            snapshot.finish_variance_days = finish_var


class ProjectBaselineExt(models.Model):
    """Extend project with baseline support."""
    _inherit = 'project.project'

    baseline_ids = fields.One2many(
        'ipai.project.baseline',
        'project_id',
        string='Baselines',
    )
    baseline_count = fields.Integer(
        string='Baseline Count',
        compute='_compute_baseline_count',
    )
    current_baseline_id = fields.Many2one(
        'ipai.project.baseline',
        string='Current Baseline',
        compute='_compute_current_baseline',
    )

    @api.depends('baseline_ids')
    def _compute_baseline_count(self):
        for project in self:
            project.baseline_count = len(project.baseline_ids)

    @api.depends('baseline_ids', 'baseline_ids.is_current')
    def _compute_current_baseline(self):
        for project in self:
            current = project.baseline_ids.filtered(lambda b: b.is_current)
            project.current_baseline_id = current[0] if current else False

    def action_create_baseline(self):
        """Create a new baseline."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Create Baseline',
            'res_model': 'ipai.baseline.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_project_id': self.id,
            },
        }

    def action_view_baselines(self):
        """View all baselines."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Project Baselines',
            'res_model': 'ipai.project.baseline',
            'view_mode': 'tree,form',
            'domain': [('project_id', '=', self.id)],
            'context': {
                'default_project_id': self.id,
            },
        }

    def action_compare_baseline(self):
        """Compare current schedule to baseline."""
        self.ensure_one()
        if not self.current_baseline_id:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'No Baseline',
                    'message': 'Please create and set a current baseline first.',
                    'type': 'warning',
                },
            }

        # Return action to show timeline with baseline comparison
        return {
            'type': 'ir.actions.act_window',
            'name': 'Compare to Baseline',
            'res_model': 'project.task',
            'view_mode': 'tree',
            'domain': [('project_id', '=', self.id)],
            'context': {
                'compare_baseline': True,
                'baseline_id': self.current_baseline_id.id,
            },
        }


class BaselineWizard(models.TransientModel):
    """Wizard for creating baselines."""
    _name = 'ipai.baseline.wizard'
    _description = 'Create Baseline Wizard'

    project_id = fields.Many2one(
        'project.project',
        string='Project',
        required=True,
    )
    name = fields.Char(
        string='Baseline Name',
        required=True,
        default=lambda self: f'Baseline {datetime.now().strftime("%Y-%m-%d")}',
    )
    description = fields.Text(
        string='Description',
    )
    set_as_current = fields.Boolean(
        string='Set as Current Baseline',
        default=True,
    )

    def action_create(self):
        """Create the baseline."""
        self.ensure_one()
        baseline = self.env['ipai.project.baseline'].create_baseline(
            self.project_id.id,
            self.name,
            self.description,
        )

        if self.set_as_current and baseline:
            baseline.action_set_current()

        return {'type': 'ir.actions.act_window_close'}
