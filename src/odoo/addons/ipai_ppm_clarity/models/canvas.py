# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
from odoo.exceptions import ValidationError
import json


class Canvas(models.Model):
    """
    Canvas model aligned with Clarity 16.1.1 Canvas.
    A Canvas is a customizable dashboard attached to a project with
    widgets (tiles, charts, tables) and saved views.
    """
    _name = 'ipai.canvas'
    _description = 'Project Canvas'
    _order = 'name'
    _inherit = ['mail.thread']

    name = fields.Char(
        string='Canvas Name',
        required=True,
        tracking=True,
    )
    description = fields.Text(
        string='Description',
    )
    project_id = fields.Many2one(
        'project.project',
        string='Project',
        required=True,
        ondelete='cascade',
        index=True,
    )

    # Layout
    layout_columns = fields.Selection([
        ('4', '4 Columns'),
        ('6', '6 Columns'),
        ('8', '8 Columns'),
    ], string='Layout', default='6', required=True,
       help='Number of columns in the canvas grid')

    # Widgets
    widget_ids = fields.One2many(
        'ipai.canvas.widget',
        'canvas_id',
        string='Widgets',
    )
    widget_count = fields.Integer(
        string='Widget Count',
        compute='_compute_widget_counts',
    )
    chart_widget_count = fields.Integer(
        string='Chart Widget Count',
        compute='_compute_widget_counts',
    )
    table_widget_count = fields.Integer(
        string='Table Widget Count',
        compute='_compute_widget_counts',
    )

    # Saved Views
    view_ids = fields.One2many(
        'ipai.canvas.view',
        'canvas_id',
        string='Saved Views',
    )
    view_count = fields.Integer(
        string='View Count',
        compute='_compute_view_count',
    )

    # Owner
    owner_id = fields.Many2one(
        'res.users',
        string='Owner',
        default=lambda self: self.env.user,
        tracking=True,
    )

    # Status
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    is_default = fields.Boolean(
        string='Is Default Canvas',
        default=False,
        help='Default canvas shown when opening project',
    )

    # Configuration state
    config_mode = fields.Boolean(
        string='Configure Mode',
        default=False,
        help='When True, canvas is in edit/configure mode',
    )

    # Layout config stored as JSON
    layout_config_json = fields.Text(
        string='Layout Configuration',
        default='{}',
        help='JSON storing layout preferences',
    )

    @api.depends('widget_ids', 'widget_ids.widget_type')
    def _compute_widget_counts(self):
        """Compute widget counts by type."""
        for canvas in self:
            widgets = canvas.widget_ids
            canvas.widget_count = len(widgets)

            chart_types = ['pie', 'bar', 'number_tile', 'progress_ring']
            canvas.chart_widget_count = len(
                widgets.filtered(lambda w: w.widget_type in chart_types)
            )
            canvas.table_widget_count = len(
                widgets.filtered(lambda w: w.widget_type == 'table')
            )

    @api.depends('view_ids')
    def _compute_view_count(self):
        """Count saved views."""
        for canvas in self:
            canvas.view_count = len(canvas.view_ids)

    @api.constrains('widget_ids')
    def _check_widget_limits(self):
        """
        Enforce Clarity widget limits:
        - Max 10 chart/table widgets per canvas
        - Max 7 table widgets per canvas
        """
        for canvas in self:
            if canvas.widget_count > 10:
                raise ValidationError(
                    'Maximum 10 widgets allowed per canvas.'
                )
            if canvas.table_widget_count > 7:
                raise ValidationError(
                    'Maximum 7 table widgets allowed per canvas.'
                )

    def action_toggle_config_mode(self):
        """Toggle configure mode."""
        self.config_mode = not self.config_mode
        return True

    def action_set_as_default(self):
        """Set this canvas as default for the project."""
        # Unset other defaults
        self.search([
            ('project_id', '=', self.project_id.id),
            ('id', '!=', self.id),
            ('is_default', '=', True),
        ]).write({'is_default': False})

        self.is_default = True
        return True

    def action_view_widgets(self):
        """Open widget management view."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Widgets - {self.name}',
            'res_model': 'ipai.canvas.widget',
            'view_mode': 'tree,form',
            'domain': [('canvas_id', '=', self.id)],
            'context': {
                'default_canvas_id': self.id,
            },
        }

    def action_view_saved_views(self):
        """Open saved views management."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Saved Views - {self.name}',
            'res_model': 'ipai.canvas.view',
            'view_mode': 'tree,form',
            'domain': [('canvas_id', '=', self.id)],
            'context': {
                'default_canvas_id': self.id,
            },
        }

    def get_canvas_config(self):
        """
        Return full canvas configuration for React frontend.
        Used by the Canvas API endpoint.
        """
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'project_id': self.project_id.id,
            'project_name': self.project_id.name,
            'layout_columns': int(self.layout_columns),
            'is_default': self.is_default,
            'config_mode': self.config_mode,
            'widgets': [w.get_widget_config() for w in self.widget_ids],
            'views': [v.get_view_config() for v in self.view_ids],
            'widget_count': self.widget_count,
            'chart_widget_count': self.chart_widget_count,
            'table_widget_count': self.table_widget_count,
        }

    def update_layout(self, layout_columns, widget_positions):
        """
        Update canvas layout and widget positions.

        Args:
            layout_columns: New column count (4, 6, or 8)
            widget_positions: List of {widget_id, position_x, position_y, col_span, row_span}
        """
        self.ensure_one()
        self.layout_columns = str(layout_columns)

        for pos in widget_positions:
            widget = self.env['ipai.canvas.widget'].browse(pos['widget_id'])
            if widget.exists() and widget.canvas_id == self:
                widget.write({
                    'position_x': pos.get('position_x', 0),
                    'position_y': pos.get('position_y', 0),
                    'col_span': pos.get('col_span', 1),
                    'row_span': pos.get('row_span', 1),
                })

        return True

    @api.model
    def create(self, vals):
        """Override create to handle default canvas."""
        canvas = super().create(vals)
        if canvas.is_default:
            canvas.action_set_as_default()
        return canvas
