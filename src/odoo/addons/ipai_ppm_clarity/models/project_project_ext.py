# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class ProjectProjectClarity(models.Model):
    """
    Extended project.project with Clarity Canvas and Autoschedule features.
    """
    _inherit = 'project.project'

    # Phases
    phase_ids = fields.One2many(
        'ipai.project.phase',
        'project_id',
        string='Phases',
    )
    phase_count = fields.Integer(
        string='Phase Count',
        compute='_compute_phase_count',
    )

    # Canvas
    canvas_ids = fields.One2many(
        'ipai.canvas',
        'project_id',
        string='Canvases',
    )
    canvas_count = fields.Integer(
        string='Canvas Count',
        compute='_compute_canvas_count',
    )
    default_canvas_id = fields.Many2one(
        'ipai.canvas',
        string='Default Canvas',
        compute='_compute_default_canvas',
    )

    # Autoschedule settings
    autoschedule_enabled = fields.Boolean(
        string='Autoschedule Enabled',
        default=True,
    )
    schedule_from = fields.Selection([
        ('start', 'Project Start Date'),
        ('finish', 'Project Finish Date'),
    ], string='Schedule From', default='start')
    project_start_date = fields.Date(
        string='Project Start Date',
    )
    project_finish_date = fields.Date(
        string='Project Finish Date',
    )

    # Autoschedule constraints
    ignore_tasks_before = fields.Date(
        string='Ignore Tasks Before',
        help='Autoschedule ignores tasks starting before this date',
    )
    ignore_tasks_after = fields.Date(
        string='Ignore Tasks After',
        help='Autoschedule ignores tasks starting after this date',
    )
    respect_resource_constraints = fields.Boolean(
        string='Respect Resource Constraints',
        default=False,
        help='Consider resource availability during autoschedule',
    )

    # Tentative schedule status
    has_tentative_schedule = fields.Boolean(
        string='Has Tentative Schedule',
        compute='_compute_has_tentative_schedule',
    )

    # Critical path summary
    critical_path_length = fields.Float(
        string='Critical Path Length (Days)',
        compute='_compute_critical_path',
    )
    critical_task_count = fields.Integer(
        string='Critical Tasks',
        compute='_compute_critical_path',
    )

    @api.depends('phase_ids')
    def _compute_phase_count(self):
        """Count phases."""
        for project in self:
            project.phase_count = len(project.phase_ids)

    @api.depends('canvas_ids')
    def _compute_canvas_count(self):
        """Count canvases."""
        for project in self:
            project.canvas_count = len(project.canvas_ids)

    @api.depends('canvas_ids', 'canvas_ids.is_default')
    def _compute_default_canvas(self):
        """Find default canvas."""
        for project in self:
            default = project.canvas_ids.filtered(lambda c: c.is_default)
            project.default_canvas_id = default[0] if default else False

    @api.depends('task_ids', 'task_ids.tentative_active')
    def _compute_has_tentative_schedule(self):
        """Check if any tasks have tentative schedule."""
        for project in self:
            project.has_tentative_schedule = any(
                project.task_ids.mapped('tentative_active')
            )

    @api.depends('task_ids', 'task_ids.is_critical', 'task_ids.duration_days')
    def _compute_critical_path(self):
        """Compute critical path metrics."""
        for project in self:
            critical_tasks = project.task_ids.filtered(lambda t: t.is_critical)
            project.critical_task_count = len(critical_tasks)
            project.critical_path_length = sum(critical_tasks.mapped('duration_days'))

    def action_view_phases(self):
        """Open phases view."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Phases - {self.name}',
            'res_model': 'ipai.project.phase',
            'view_mode': 'tree,form',
            'domain': [('project_id', '=', self.id)],
            'context': {
                'default_project_id': self.id,
            },
        }

    def action_view_canvas(self):
        """Open default canvas or canvas list."""
        self.ensure_one()
        if self.default_canvas_id:
            return {
                'type': 'ir.actions.act_window',
                'name': self.default_canvas_id.name,
                'res_model': 'ipai.canvas',
                'view_mode': 'form',
                'res_id': self.default_canvas_id.id,
            }
        return {
            'type': 'ir.actions.act_window',
            'name': f'Canvases - {self.name}',
            'res_model': 'ipai.canvas',
            'view_mode': 'tree,form',
            'domain': [('project_id', '=', self.id)],
            'context': {
                'default_project_id': self.id,
            },
        }

    def action_create_canvas(self):
        """Create a new canvas for this project."""
        self.ensure_one()
        canvas = self.env['ipai.canvas'].create({
            'name': f'{self.name} Canvas',
            'project_id': self.id,
            'is_default': not self.canvas_ids,
        })
        return {
            'type': 'ir.actions.act_window',
            'name': canvas.name,
            'res_model': 'ipai.canvas',
            'view_mode': 'form',
            'res_id': canvas.id,
        }

    def action_autoschedule_tentative(self):
        """Run autoschedule and store as tentative."""
        self.ensure_one()
        service = self.env['ipai.autoschedule.service']
        return service.run_autoschedule(self, tentative=True)

    def action_autoschedule_publish(self):
        """Publish tentative schedule to actual dates."""
        self.ensure_one()
        tasks_with_tentative = self.task_ids.filtered(lambda t: t.tentative_active)
        tasks_with_tentative.publish_tentative_schedule()
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Schedule Published',
                'message': f'{len(tasks_with_tentative)} tasks updated.',
                'type': 'success',
            },
        }

    def action_autoschedule_discard(self):
        """Discard tentative schedule."""
        self.ensure_one()
        tasks_with_tentative = self.task_ids.filtered(lambda t: t.tentative_active)
        tasks_with_tentative.discard_tentative_schedule()
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Schedule Discarded',
                'message': 'Tentative schedule has been discarded.',
                'type': 'warning',
            },
        }

    def action_run_autoschedule(self):
        """Run autoschedule directly (no tentative)."""
        self.ensure_one()
        service = self.env['ipai.autoschedule.service']
        return service.run_autoschedule(self, tentative=False)

    def get_wbs_tree(self):
        """
        Get tasks organized as WBS tree for Timeline view.
        Returns hierarchical structure of phases and tasks.
        """
        self.ensure_one()
        result = []

        # Get phases with their tasks
        for phase in self.phase_ids.sorted('sequence'):
            phase_data = {
                'id': f'phase_{phase.id}',
                'type': 'phase',
                'name': phase.name,
                'start': phase.start_date.isoformat() if phase.start_date else None,
                'end': phase.end_date.isoformat() if phase.end_date else None,
                'progress': phase.progress,
                'children': [],
            }

            # Add tasks in this phase
            for task in phase.task_ids.filtered(lambda t: t.active).sorted('wbs_sort'):
                task_data = self._task_to_wbs_node(task)
                phase_data['children'].append(task_data)

            result.append(phase_data)

        # Add unphased tasks
        unphased_tasks = self.task_ids.filtered(
            lambda t: t.active and not t.phase_id
        ).sorted('wbs_sort')

        for task in unphased_tasks:
            result.append(self._task_to_wbs_node(task))

        return result

    def _task_to_wbs_node(self, task):
        """Convert task to WBS tree node."""
        return {
            'id': f'task_{task.id}',
            'type': task.task_type,
            'name': task.name,
            'wbs_code': task.wbs_code,
            'start': task.planned_date_begin.isoformat() if task.planned_date_begin else None,
            'end': task.date_deadline.isoformat() if task.date_deadline else None,
            'progress': task.percent_complete,
            'is_critical': task.is_critical,
            'is_milestone': task.is_milestone,
            'locked': task.locked,
            'predecessor_count': task.predecessor_count,
            'successor_count': task.successor_count,
            'children': [
                self._task_to_wbs_node(child)
                for child in task.child_ids.filtered(lambda t: t.active).sorted('wbs_sort')
            ] if task.child_ids else [],
        }
