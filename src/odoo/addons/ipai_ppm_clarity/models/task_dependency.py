# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
from odoo.exceptions import ValidationError


class TaskDependency(models.Model):
    """
    Task Dependency model aligned with Clarity 16.1.1.
    Supports FS (Finish-to-Start), SS (Start-to-Start),
    FF (Finish-to-Finish), SF (Start-to-Finish) dependencies with lag.
    """
    _name = 'ipai.task.dependency'
    _description = 'Task Dependency'
    _rec_name = 'display_name'

    predecessor_id = fields.Many2one(
        'project.task',
        string='Predecessor',
        required=True,
        ondelete='cascade',
        index=True,
    )
    successor_id = fields.Many2one(
        'project.task',
        string='Successor',
        required=True,
        ondelete='cascade',
        index=True,
    )

    dependency_type = fields.Selection([
        ('FS', 'Finish to Start'),
        ('SS', 'Start to Start'),
        ('FF', 'Finish to Finish'),
        ('SF', 'Start to Finish'),
    ], string='Type', default='FS', required=True,
       help="""
       FS: Successor starts after predecessor finishes
       SS: Successor starts when predecessor starts
       FF: Successor finishes when predecessor finishes
       SF: Successor finishes after predecessor starts
       """)

    lag_days = fields.Integer(
        string='Lag (Days)',
        default=0,
        help='Positive = delay, Negative = lead time',
    )

    # Related fields for display
    predecessor_name = fields.Char(
        related='predecessor_id.name',
        string='Predecessor Name',
    )
    successor_name = fields.Char(
        related='successor_id.name',
        string='Successor Name',
    )
    project_id = fields.Many2one(
        related='predecessor_id.project_id',
        string='Project',
        store=True,
    )

    display_name = fields.Char(
        string='Name',
        compute='_compute_display_name',
        store=True,
    )

    # Validity
    is_valid = fields.Boolean(
        string='Is Valid',
        compute='_compute_is_valid',
        help='Dependency is valid if tasks are in same project',
    )

    @api.depends('predecessor_id', 'successor_id', 'dependency_type', 'lag_days')
    def _compute_display_name(self):
        """Generate display name for dependency."""
        for dep in self:
            lag_str = ''
            if dep.lag_days > 0:
                lag_str = f'+{dep.lag_days}d'
            elif dep.lag_days < 0:
                lag_str = f'{dep.lag_days}d'

            dep.display_name = f'{dep.predecessor_id.name or "?"} → {dep.successor_id.name or "?"} ({dep.dependency_type}{lag_str})'

    @api.depends('predecessor_id', 'successor_id')
    def _compute_is_valid(self):
        """Check if dependency is valid (same project)."""
        for dep in self:
            dep.is_valid = (
                dep.predecessor_id.project_id == dep.successor_id.project_id
                if dep.predecessor_id and dep.successor_id
                else False
            )

    @api.constrains('predecessor_id', 'successor_id')
    def _check_no_self_dependency(self):
        """Prevent task depending on itself."""
        for dep in self:
            if dep.predecessor_id == dep.successor_id:
                raise ValidationError(
                    'A task cannot depend on itself.'
                )

    @api.constrains('predecessor_id', 'successor_id')
    def _check_same_project(self):
        """Ensure tasks are in the same project."""
        for dep in self:
            if dep.predecessor_id.project_id != dep.successor_id.project_id:
                raise ValidationError(
                    'Dependencies must be between tasks in the same project.'
                )

    @api.constrains('predecessor_id', 'successor_id')
    def _check_no_duplicate(self):
        """Prevent duplicate dependencies."""
        for dep in self:
            existing = self.search([
                ('predecessor_id', '=', dep.predecessor_id.id),
                ('successor_id', '=', dep.successor_id.id),
                ('id', '!=', dep.id),
            ])
            if existing:
                raise ValidationError(
                    f'A dependency from "{dep.predecessor_id.name}" to '
                    f'"{dep.successor_id.name}" already exists.'
                )

    def check_circular_dependency(self):
        """
        Check for circular dependencies.
        Returns True if circular dependency detected.
        """
        self.ensure_one()
        visited = set()

        def dfs(task_id):
            if task_id in visited:
                return True
            visited.add(task_id)

            successors = self.search([
                ('predecessor_id', '=', task_id)
            ]).mapped('successor_id')

            for succ in successors:
                if dfs(succ.id):
                    return True

            visited.remove(task_id)
            return False

        return dfs(self.successor_id.id)

    @api.model
    def create(self, vals):
        """Override create to check for circular dependencies."""
        dep = super().create(vals)
        if dep.check_circular_dependency():
            raise ValidationError(
                'This dependency would create a circular reference.'
            )
        return dep
