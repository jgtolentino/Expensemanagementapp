# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
import json


class WidgetLibrary(models.Model):
    """
    Widget Library model aligned with Clarity 16.1.1.
    Allows sharing widgets across users with proper access control.
    """
    _name = 'ipai.widget.library'
    _description = 'Widget Library'
    _order = 'name'

    name = fields.Char(
        string='Widget Name',
        required=True,
    )
    description = fields.Text(
        string='Description',
    )

    # Widget configuration (copy of canvas widget fields)
    widget_type = fields.Selection([
        ('number_tile', 'Number Tile'),
        ('progress_ring', 'Progress Ring'),
        ('pie', 'Pie Chart'),
        ('bar', 'Bar Chart'),
        ('table', 'Table'),
        ('target', 'Target'),
        ('linked', 'Linked'),
    ], string='Widget Type', required=True)

    target_model = fields.Selection([
        ('project.task', 'Tasks'),
        ('ipai.task.todo', 'To-Dos'),
        ('ipai.project.phase', 'Phases'),
    ], string='Target Object', required=True, default='project.task')

    operation = fields.Selection([
        ('count', 'Count'),
        ('sum', 'Sum'),
        ('avg', 'Average'),
        ('min', 'Minimum'),
        ('max', 'Maximum'),
    ], string='Operation', default='count')

    format_type = fields.Selection([
        ('number', 'Number'),
        ('percentage', 'Percentage'),
    ], string='Format', default='number')

    color = fields.Char(
        string='Color',
        default='#0078D4',
    )

    group_by_field = fields.Char(
        string='Group By',
    )
    aggregate_field = fields.Char(
        string='Sum/Average Field',
    )
    sort_order = fields.Selection([
        ('asc', 'Ascending'),
        ('desc', 'Descending'),
    ], string='Sort Order', default='desc')

    filters_json = fields.Text(
        string='Filters (JSON)',
        default='[]',
    )

    # Ownership
    created_by_id = fields.Many2one(
        'res.users',
        string='Created By',
        default=lambda self: self.env.user,
    )
    in_library = fields.Boolean(
        string='In Widget Library',
        default=False,
        help='If True, widget is shared in the library for all users',
    )

    active = fields.Boolean(
        string='Active',
        default=True,
    )

    def get_widget_config(self):
        """Return widget configuration for creating canvas widgets."""
        return {
            'type': self.widget_type,
            'title': self.name,
            'color': self.color,
            'target_model': self.target_model,
            'operation': self.operation,
            'format': self.format_type,
            'group_by': self.group_by_field,
            'aggregate_field': self.aggregate_field,
            'sort_order': self.sort_order,
            'filters': json.loads(self.filters_json or '[]'),
        }

    def create_canvas_widget(self, canvas_id, position_x=0, position_y=0):
        """Create a canvas widget from this library widget."""
        config = self.get_widget_config()
        config['layout'] = {
            'col_span': 1 if self.widget_type in ['number_tile', 'progress_ring'] else 2,
            'row_span': 1,
            'x': position_x,
            'y': position_y,
        }
        return self.env['ipai.canvas.widget'].create_from_config(canvas_id, config)


class CanvasWidgetLibraryExt(models.Model):
    """Extend canvas widget with library reference."""
    _inherit = 'ipai.canvas.widget'

    library_widget_id = fields.Many2one(
        'ipai.widget.library',
        string='Library Widget',
        help='Source widget from library',
    )

    def add_to_library(self):
        """Add this widget to the shared library."""
        self.ensure_one()
        return self.env['ipai.widget.library'].create({
            'name': self.title,
            'widget_type': self.widget_type,
            'target_model': self.target_model,
            'operation': self.operation,
            'format_type': self.format_type,
            'color': self.color,
            'group_by_field': self.group_by_field,
            'aggregate_field': self.aggregate_field,
            'sort_order': self.sort_order,
            'filters_json': self.filters_json,
            'in_library': True,
        })


class TargetWidget(models.Model):
    """
    Target Widget for Roadmaps.
    Displays targets as goals or constraints.
    """
    _name = 'ipai.target.widget'
    _description = 'Target Widget'

    name = fields.Char(
        string='Name',
        required=True,
    )
    canvas_id = fields.Many2one(
        'ipai.canvas',
        string='Canvas',
        required=True,
        ondelete='cascade',
    )

    target_type = fields.Selection([
        ('goal', 'Goal'),
        ('constraint', 'Constraint'),
    ], string='Target Type', default='goal')

    target_field = fields.Char(
        string='Target Field',
        help='Field to track (e.g., budget, planned_cost)',
    )
    target_value = fields.Float(
        string='Target Value',
    )
    actual_value = fields.Float(
        string='Actual Value',
        compute='_compute_actual_value',
    )
    variance = fields.Float(
        string='Variance',
        compute='_compute_variance',
    )
    status = fields.Selection([
        ('on_track', 'On Track'),
        ('at_risk', 'At Risk'),
        ('off_track', 'Off Track'),
    ], string='Status', compute='_compute_status')

    color = fields.Char(
        string='Color',
        default='#107C10',
    )

    @api.depends('target_field', 'canvas_id')
    def _compute_actual_value(self):
        for record in self:
            # Would compute actual from project data
            record.actual_value = 0

    @api.depends('target_value', 'actual_value')
    def _compute_variance(self):
        for record in self:
            if record.target_value:
                record.variance = record.actual_value - record.target_value
            else:
                record.variance = 0

    @api.depends('variance', 'target_type', 'target_value')
    def _compute_status(self):
        for record in self:
            if not record.target_value:
                record.status = 'on_track'
                continue

            pct = abs(record.variance) / record.target_value * 100

            if record.target_type == 'goal':
                # For goals, being over target is good
                if record.variance >= 0:
                    record.status = 'on_track'
                elif pct < 10:
                    record.status = 'at_risk'
                else:
                    record.status = 'off_track'
            else:
                # For constraints, being under target is good
                if record.variance <= 0:
                    record.status = 'on_track'
                elif pct < 10:
                    record.status = 'at_risk'
                else:
                    record.status = 'off_track'
