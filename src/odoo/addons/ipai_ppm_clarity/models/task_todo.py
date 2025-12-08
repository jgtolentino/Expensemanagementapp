# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class TaskTodo(models.Model):
    """
    To-Do Item model aligned with Clarity 16.1.1.
    To-Dos are granular checklist items within a task.
    """
    _name = 'ipai.task.todo'
    _description = 'Task To-Do Item'
    _order = 'sequence, due_date, id'
    _inherit = ['mail.thread']

    name = fields.Char(
        string='To-Do',
        required=True,
        tracking=True,
    )
    description = fields.Text(
        string='Description',
    )
    task_id = fields.Many2one(
        'project.task',
        string='Task',
        required=True,
        ondelete='cascade',
        index=True,
    )
    project_id = fields.Many2one(
        related='task_id.project_id',
        string='Project',
        store=True,
        index=True,
    )

    # Status
    state = fields.Selection([
        ('open', 'Open'),
        ('done', 'Done'),
    ], string='Status', default='open', tracking=True)

    # Dates
    due_date = fields.Date(
        string='Due Date',
        tracking=True,
    )
    completed_date = fields.Date(
        string='Completed Date',
    )

    # Assignment
    owner_id = fields.Many2one(
        'res.users',
        string='Owner',
        tracking=True,
    )

    # Priority
    priority = fields.Selection([
        ('0', 'Low'),
        ('1', 'Normal'),
        ('2', 'High'),
        ('3', 'Urgent'),
    ], string='Priority', default='1')

    # Ordering
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )

    # Display
    color = fields.Integer(
        string='Color',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )

    # Computed
    is_overdue = fields.Boolean(
        string='Is Overdue',
        compute='_compute_is_overdue',
    )

    @api.depends('due_date', 'state')
    def _compute_is_overdue(self):
        """Check if to-do is overdue."""
        today = fields.Date.today()
        for todo in self:
            todo.is_overdue = (
                todo.state == 'open' and
                todo.due_date and
                todo.due_date < today
            )

    def action_done(self):
        """Mark to-do as done."""
        self.write({
            'state': 'done',
            'completed_date': fields.Date.today(),
        })
        return True

    def action_reopen(self):
        """Reopen to-do."""
        self.write({
            'state': 'open',
            'completed_date': False,
        })
        return True

    @api.model
    def create(self, vals):
        """Override create to set defaults."""
        if not vals.get('owner_id'):
            vals['owner_id'] = self.env.user.id
        return super().create(vals)
