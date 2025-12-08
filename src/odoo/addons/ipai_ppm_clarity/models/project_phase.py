# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
from datetime import timedelta


class ProjectPhase(models.Model):
    """
    Project Phase model aligned with Clarity 16.1.1 phase concept.
    Phases are top-level groupings of tasks within a project.
    """
    _name = 'ipai.project.phase'
    _description = 'Project Phase'
    _order = 'sequence, start_date, id'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(
        string='Phase Name',
        required=True,
        tracking=True,
    )
    description = fields.Html(
        string='Description',
    )
    project_id = fields.Many2one(
        'project.project',
        string='Project',
        required=True,
        ondelete='cascade',
        index=True,
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )

    # Dates
    start_date = fields.Date(
        string='Start Date',
        tracking=True,
    )
    end_date = fields.Date(
        string='End Date',
        tracking=True,
    )
    planned_start = fields.Date(
        string='Planned Start',
    )
    planned_end = fields.Date(
        string='Planned End',
    )

    # Computed dates from tasks
    computed_start = fields.Date(
        string='Computed Start',
        compute='_compute_dates_from_tasks',
        store=True,
    )
    computed_end = fields.Date(
        string='Computed End',
        compute='_compute_dates_from_tasks',
        store=True,
    )

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='draft', tracking=True)

    # Progress
    progress = fields.Float(
        string='Progress (%)',
        compute='_compute_progress',
        store=True,
        group_operator='avg',
    )

    # Effort tracking
    planned_hours = fields.Float(
        string='Planned Hours',
        compute='_compute_effort',
        store=True,
    )
    actual_hours = fields.Float(
        string='Actual Hours',
        compute='_compute_effort',
        store=True,
    )
    etc_hours = fields.Float(
        string='ETC Hours',
        compute='_compute_effort',
        store=True,
        help='Estimate to Complete',
    )
    eac_hours = fields.Float(
        string='EAC Hours',
        compute='_compute_effort',
        store=True,
        help='Estimate at Completion (Actual + ETC)',
    )

    # Related tasks
    task_ids = fields.One2many(
        'project.task',
        'phase_id',
        string='Tasks',
    )
    task_count = fields.Integer(
        string='Task Count',
        compute='_compute_task_count',
    )

    # Owner
    manager_id = fields.Many2one(
        'res.users',
        string='Phase Manager',
        tracking=True,
    )

    # Display
    color = fields.Integer(
        string='Color Index',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )

    @api.depends('task_ids', 'task_ids.date_deadline', 'task_ids.planned_date_begin')
    def _compute_dates_from_tasks(self):
        """Compute phase dates from child tasks."""
        for phase in self:
            tasks = phase.task_ids.filtered(lambda t: t.active)
            if tasks:
                start_dates = tasks.mapped('planned_date_begin')
                end_dates = tasks.mapped('date_deadline')

                valid_starts = [d for d in start_dates if d]
                valid_ends = [d for d in end_dates if d]

                phase.computed_start = min(valid_starts).date() if valid_starts else False
                phase.computed_end = max(valid_ends).date() if valid_ends else False
            else:
                phase.computed_start = False
                phase.computed_end = False

    @api.depends('task_ids', 'task_ids.progress')
    def _compute_progress(self):
        """Compute phase progress as average of task progress."""
        for phase in self:
            tasks = phase.task_ids.filtered(lambda t: t.active)
            if tasks:
                phase.progress = sum(tasks.mapped('progress')) / len(tasks)
            else:
                phase.progress = 0.0

    @api.depends('task_ids', 'task_ids.planned_hours', 'task_ids.effective_hours', 'task_ids.etc_hours')
    def _compute_effort(self):
        """Compute phase effort metrics from child tasks."""
        for phase in self:
            tasks = phase.task_ids.filtered(lambda t: t.active)
            phase.planned_hours = sum(tasks.mapped('planned_hours'))
            phase.actual_hours = sum(tasks.mapped('effective_hours'))
            phase.etc_hours = sum(tasks.mapped('etc_hours'))
            phase.eac_hours = phase.actual_hours + phase.etc_hours

    @api.depends('task_ids')
    def _compute_task_count(self):
        """Count active tasks in phase."""
        for phase in self:
            phase.task_count = len(phase.task_ids.filtered(lambda t: t.active))

    def action_start(self):
        """Start the phase."""
        self.write({'state': 'in_progress'})
        return True

    def action_complete(self):
        """Mark phase as completed."""
        self.write({'state': 'completed'})
        return True

    def action_cancel(self):
        """Cancel the phase."""
        self.write({'state': 'cancelled'})
        return True

    def action_hold(self):
        """Put phase on hold."""
        self.write({'state': 'on_hold'})
        return True

    def action_view_tasks(self):
        """Open tasks view for this phase."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Tasks - {self.name}',
            'res_model': 'project.task',
            'view_mode': 'tree,form,kanban,calendar,gantt',
            'domain': [('phase_id', '=', self.id)],
            'context': {
                'default_phase_id': self.id,
                'default_project_id': self.project_id.id,
            },
        }
