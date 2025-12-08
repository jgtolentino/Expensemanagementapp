# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class Subproject(models.Model):
    """
    Subproject model aligned with Clarity 16.1.1.
    Links child projects as proxy tasks in the master project timeline.
    """
    _name = 'ipai.subproject'
    _description = 'Subproject Link'
    _order = 'sequence, id'

    name = fields.Char(
        string='Name',
        compute='_compute_name',
        store=True,
    )
    master_project_id = fields.Many2one(
        'project.project',
        string='Master Project',
        required=True,
        ondelete='cascade',
        index=True,
    )
    child_project_id = fields.Many2one(
        'project.project',
        string='Subproject',
        required=True,
        ondelete='cascade',
        index=True,
        domain="[('id', '!=', master_project_id)]",
    )
    proxy_task_id = fields.Many2one(
        'project.task',
        string='Proxy Task',
        help='Task in master project representing this subproject',
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )

    # Aggregated fields from subproject
    start_date = fields.Date(
        related='child_project_id.project_start_date',
        string='Start Date',
    )
    finish_date = fields.Date(
        related='child_project_id.project_finish_date',
        string='Finish Date',
    )
    task_count = fields.Integer(
        string='Tasks',
        compute='_compute_task_count',
    )
    progress = fields.Float(
        string='Progress',
        compute='_compute_progress',
    )

    @api.depends('child_project_id', 'child_project_id.name')
    def _compute_name(self):
        for record in self:
            record.name = record.child_project_id.name if record.child_project_id else 'New Subproject'

    @api.depends('child_project_id', 'child_project_id.task_ids')
    def _compute_task_count(self):
        for record in self:
            if record.child_project_id:
                record.task_count = len(record.child_project_id.task_ids)
            else:
                record.task_count = 0

    @api.depends('child_project_id', 'child_project_id.task_ids', 'child_project_id.task_ids.percent_complete')
    def _compute_progress(self):
        for record in self:
            if record.child_project_id and record.child_project_id.task_ids:
                tasks = record.child_project_id.task_ids
                record.progress = sum(tasks.mapped('percent_complete')) / len(tasks)
            else:
                record.progress = 0

    @api.model
    def create(self, vals):
        """Create subproject link and proxy task."""
        record = super().create(vals)

        # Create proxy task in master project
        if record.master_project_id and record.child_project_id:
            proxy_task = self.env['project.task'].create({
                'name': f'[Subproject] {record.child_project_id.name}',
                'project_id': record.master_project_id.id,
                'is_subproject': True,
                'task_type': 'summary',
                'planned_date_begin': record.child_project_id.project_start_date,
                'date_deadline': record.child_project_id.project_finish_date,
            })
            record.proxy_task_id = proxy_task.id

        return record

    def unlink(self):
        """Delete proxy tasks when subproject link is removed."""
        proxy_tasks = self.mapped('proxy_task_id')
        result = super().unlink()
        proxy_tasks.unlink()
        return result

    def action_open_subproject(self):
        """Open the subproject."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': self.child_project_id.name,
            'res_model': 'project.project',
            'view_mode': 'form',
            'res_id': self.child_project_id.id,
        }


class ProjectSubprojects(models.Model):
    """Extend project.project with subproject support."""
    _inherit = 'project.project'

    subproject_ids = fields.One2many(
        'ipai.subproject',
        'master_project_id',
        string='Subprojects',
    )
    subproject_count = fields.Integer(
        string='Subproject Count',
        compute='_compute_subproject_count',
    )
    is_master_project = fields.Boolean(
        string='Is Master Project',
        compute='_compute_is_master_project',
    )
    parent_project_ids = fields.One2many(
        'ipai.subproject',
        'child_project_id',
        string='Parent Projects',
    )

    @api.depends('subproject_ids')
    def _compute_subproject_count(self):
        for project in self:
            project.subproject_count = len(project.subproject_ids)

    @api.depends('subproject_ids')
    def _compute_is_master_project(self):
        for project in self:
            project.is_master_project = len(project.subproject_ids) > 0

    def action_add_subprojects(self):
        """Open wizard to add subprojects."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Add Subprojects',
            'res_model': 'ipai.subproject.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_master_project_id': self.id,
            },
        }

    def action_view_subprojects(self):
        """View all subprojects."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Subprojects',
            'res_model': 'ipai.subproject',
            'view_mode': 'tree,form',
            'domain': [('master_project_id', '=', self.id)],
            'context': {
                'default_master_project_id': self.id,
            },
        }


class SubprojectWizard(models.TransientModel):
    """Wizard for adding subprojects."""
    _name = 'ipai.subproject.wizard'
    _description = 'Add Subprojects Wizard'

    master_project_id = fields.Many2one(
        'project.project',
        string='Master Project',
        required=True,
    )
    project_ids = fields.Many2many(
        'project.project',
        string='Projects to Add',
        domain="[('id', '!=', master_project_id)]",
    )

    def action_add(self):
        """Add selected projects as subprojects."""
        self.ensure_one()
        Subproject = self.env['ipai.subproject']

        for project in self.project_ids:
            # Check if already a subproject
            existing = Subproject.search([
                ('master_project_id', '=', self.master_project_id.id),
                ('child_project_id', '=', project.id),
            ])
            if not existing:
                Subproject.create({
                    'master_project_id': self.master_project_id.id,
                    'child_project_id': project.id,
                })

        return {'type': 'ir.actions.act_window_close'}
