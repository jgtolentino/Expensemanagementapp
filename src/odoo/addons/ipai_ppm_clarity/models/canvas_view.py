# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
import json


class CanvasView(models.Model):
    """
    Canvas Saved View model aligned with Clarity 16.1.1.
    Allows users to save and share canvas configurations.
    """
    _name = 'ipai.canvas.view'
    _description = 'Canvas Saved View'
    _order = 'is_default desc, is_favorite desc, name'

    name = fields.Char(
        string='View Name',
        required=True,
    )
    canvas_id = fields.Many2one(
        'ipai.canvas',
        string='Canvas',
        required=True,
        ondelete='cascade',
        index=True,
    )
    project_id = fields.Many2one(
        related='canvas_id.project_id',
        string='Project',
        store=True,
    )

    # Owner
    user_id = fields.Many2one(
        'res.users',
        string='Owner',
        default=lambda self: self.env.user,
        required=True,
    )

    # Flags
    is_default = fields.Boolean(
        string='Default View',
        default=False,
        help='This view loads by default for this user',
    )
    is_favorite = fields.Boolean(
        string='Favorite',
        default=False,
    )
    is_shared = fields.Boolean(
        string='Shared',
        default=False,
        help='Allow other users to see this view (read-only)',
    )

    # Configuration snapshot
    config_json = fields.Text(
        string='Configuration',
        required=True,
        default='{}',
        help='JSON snapshot of canvas layout and widget configurations',
    )

    # Layout stored separately for quick access
    layout_columns = fields.Selection([
        ('4', '4 Columns'),
        ('6', '6 Columns'),
        ('8', '8 Columns'),
    ], string='Layout')

    # Search/filter state
    search_text = fields.Char(
        string='Search Text',
        help='Saved search text',
    )
    filters_json = fields.Text(
        string='Filters',
        default='[]',
        help='JSON array of active filters',
    )

    # Timestamps
    create_date = fields.Datetime(
        string='Created',
        readonly=True,
    )
    write_date = fields.Datetime(
        string='Last Modified',
        readonly=True,
    )

    active = fields.Boolean(
        string='Active',
        default=True,
    )

    def get_config(self):
        """Parse and return configuration."""
        try:
            return json.loads(self.config_json or '{}')
        except json.JSONDecodeError:
            return {}

    def set_config(self, config):
        """Set configuration from dict."""
        self.config_json = json.dumps(config)

    def get_filters(self):
        """Parse and return filters."""
        try:
            return json.loads(self.filters_json or '[]')
        except json.JSONDecodeError:
            return []

    def get_view_config(self):
        """
        Return view configuration for React frontend.
        """
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id.id,
            'user_name': self.user_id.name,
            'is_default': self.is_default,
            'is_favorite': self.is_favorite,
            'is_shared': self.is_shared,
            'is_owner': self.user_id.id == self.env.user.id,
            'layout_columns': int(self.layout_columns) if self.layout_columns else None,
            'search_text': self.search_text,
            'filters': self.get_filters(),
            'config': self.get_config(),
            'created': self.create_date.isoformat() if self.create_date else None,
            'modified': self.write_date.isoformat() if self.write_date else None,
        }

    def action_set_default(self):
        """Set this view as default for current user."""
        # Unset other defaults for this user on this canvas
        self.search([
            ('canvas_id', '=', self.canvas_id.id),
            ('user_id', '=', self.env.user.id),
            ('id', '!=', self.id),
            ('is_default', '=', True),
        ]).write({'is_default': False})

        self.is_default = True
        return True

    def action_toggle_favorite(self):
        """Toggle favorite status."""
        self.is_favorite = not self.is_favorite
        return True

    def action_toggle_shared(self):
        """Toggle shared status (only owner can do this)."""
        if self.user_id.id == self.env.user.id:
            self.is_shared = not self.is_shared
        return True

    def apply_view(self):
        """
        Apply this saved view to the canvas.
        Returns the canvas with view configuration applied.
        """
        self.ensure_one()
        config = self.get_config()

        # Update canvas layout if saved in view
        if self.layout_columns:
            self.canvas_id.layout_columns = self.layout_columns

        # Return config for frontend to apply widget positions/visibility
        return {
            'canvas_id': self.canvas_id.id,
            'view_id': self.id,
            'layout_columns': int(self.layout_columns) if self.layout_columns else int(self.canvas_id.layout_columns),
            'search_text': self.search_text,
            'filters': self.get_filters(),
            'widget_config': config.get('widgets', {}),
        }

    @api.model
    def save_current_view(self, canvas_id, name, config, is_default=False, is_favorite=False):
        """
        Save current canvas state as a new view.

        Args:
            canvas_id: ID of the canvas
            name: View name
            config: Configuration dict containing:
                - layout_columns
                - search_text
                - filters
                - widgets (positions, visibility, etc.)
            is_default: Set as default view
            is_favorite: Mark as favorite
        """
        canvas = self.env['ipai.canvas'].browse(canvas_id)
        if not canvas.exists():
            return False

        view = self.create({
            'name': name,
            'canvas_id': canvas_id,
            'user_id': self.env.user.id,
            'layout_columns': str(config.get('layout_columns', 6)),
            'search_text': config.get('search_text', ''),
            'filters_json': json.dumps(config.get('filters', [])),
            'config_json': json.dumps(config),
            'is_default': is_default,
            'is_favorite': is_favorite,
        })

        if is_default:
            view.action_set_default()

        return view.get_view_config()

    @api.model
    def get_user_views(self, canvas_id):
        """
        Get all views available to current user for a canvas.
        Includes own views and shared views from others.
        """
        domain = [
            ('canvas_id', '=', canvas_id),
            '|',
            ('user_id', '=', self.env.user.id),
            ('is_shared', '=', True),
        ]
        views = self.search(domain)
        return [v.get_view_config() for v in views]
