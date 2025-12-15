# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api
import json


class CanvasWidget(models.Model):
    """
    Canvas Widget model aligned with Clarity 16.1.1.
    Supports Number Tile, Progress Ring, Pie Chart, Bar Chart, and Table widgets.
    """
    _name = 'ipai.canvas.widget'
    _description = 'Canvas Widget'
    _order = 'position_y, position_x, id'

    name = fields.Char(
        string='Widget Name',
        compute='_compute_name',
        store=True,
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

    # Widget Type
    widget_type = fields.Selection([
        ('number_tile', 'Number Tile'),
        ('progress_ring', 'Progress Ring'),
        ('pie', 'Pie Chart'),
        ('bar', 'Bar Chart'),
        ('table', 'Table'),
    ], string='Widget Type', required=True, default='number_tile')

    # Display
    title = fields.Char(
        string='Title',
        required=True,
    )
    color = fields.Char(
        string='Color',
        default='#0078D4',
        help='Hex color code for the widget',
    )
    icon = fields.Char(
        string='Icon',
        help='Icon name (e.g., lucide icon name)',
    )

    # Data Source
    target_model = fields.Selection([
        ('project.task', 'Tasks'),
        ('ipai.task.todo', 'To-Dos'),
        ('ipai.project.phase', 'Phases'),
        # Extensible for custom sub-objects
    ], string='Target Object', required=True, default='project.task')

    # Aggregation
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
        ('currency', 'Currency'),
        ('hours', 'Hours'),
    ], string='Format', default='number')

    # Grouping & Sorting
    group_by_field = fields.Char(
        string='Group By Field',
        help='Field name to group by (e.g., stage_id, state)',
    )
    aggregate_field = fields.Char(
        string='Aggregate Field',
        help='Field to aggregate (e.g., planned_hours)',
    )
    sort_order = fields.Selection([
        ('asc', 'Ascending'),
        ('desc', 'Descending'),
    ], string='Sort Order', default='desc')
    sort_by = fields.Char(
        string='Sort By',
        help='Field to sort by',
    )
    limit = fields.Integer(
        string='Limit',
        default=10,
        help='Maximum number of items/groups to show',
    )

    # Filters (stored as JSON)
    filters_json = fields.Text(
        string='Filters (JSON)',
        default='[]',
        help='JSON array of filter conditions',
    )

    # Table Widget specific
    table_columns_json = fields.Text(
        string='Table Columns (JSON)',
        default='[]',
        help='JSON array of column definitions for table widget',
    )

    # Progress Ring specific
    target_value = fields.Float(
        string='Target Value',
        help='Target value for progress ring (100%)',
    )
    actual_field = fields.Char(
        string='Actual Field',
        help='Field containing actual value',
    )

    # Layout/Position
    col_span = fields.Integer(
        string='Column Span',
        default=1,
        help='Width in grid columns (1 or 2)',
    )
    row_span = fields.Integer(
        string='Row Span',
        default=1,
    )
    position_x = fields.Integer(
        string='Position X',
        default=0,
        help='Grid column position (0-based)',
    )
    position_y = fields.Integer(
        string='Position Y',
        default=0,
        help='Grid row position (0-based)',
    )

    # Owner
    created_by_id = fields.Many2one(
        'res.users',
        string='Created By',
        default=lambda self: self.env.user,
    )

    active = fields.Boolean(
        string='Active',
        default=True,
    )

    @api.depends('title', 'widget_type')
    def _compute_name(self):
        """Compute display name."""
        for widget in self:
            widget.name = f'{widget.title} ({widget.widget_type})'

    @api.onchange('widget_type')
    def _onchange_widget_type(self):
        """Set default col_span based on widget type."""
        if self.widget_type in ['number_tile', 'progress_ring']:
            self.col_span = 1
        else:
            self.col_span = 2

    def get_filters(self):
        """Parse and return filters as list."""
        try:
            return json.loads(self.filters_json or '[]')
        except json.JSONDecodeError:
            return []

    def set_filters(self, filters):
        """Set filters from list."""
        self.filters_json = json.dumps(filters)

    def get_table_columns(self):
        """Parse and return table columns."""
        try:
            return json.loads(self.table_columns_json or '[]')
        except json.JSONDecodeError:
            return []

    def get_widget_config(self):
        """
        Return widget configuration for React frontend.
        """
        return {
            'id': self.id,
            'type': self.widget_type,
            'title': self.title,
            'color': self.color,
            'icon': self.icon,
            'target_model': self.target_model,
            'operation': self.operation,
            'format': self.format_type,
            'group_by': self.group_by_field,
            'aggregate_field': self.aggregate_field,
            'sort_order': self.sort_order,
            'sort_by': self.sort_by,
            'limit': self.limit,
            'filters': self.get_filters(),
            'table_columns': self.get_table_columns(),
            'target_value': self.target_value,
            'actual_field': self.actual_field,
            'layout': {
                'col_span': self.col_span,
                'row_span': self.row_span,
                'x': self.position_x,
                'y': self.position_y,
            },
        }

    def evaluate_data(self):
        """
        Evaluate widget data based on configuration.
        Returns data formatted for the specific widget type.
        """
        self.ensure_one()

        # Get the target model
        Model = self.env[self.target_model]

        # Build domain from filters
        domain = [('project_id', '=', self.project_id.id)]
        for f in self.get_filters():
            if f.get('field') and f.get('operator') and 'value' in f:
                domain.append((f['field'], f['operator'], f['value']))

        # Execute query based on widget type
        if self.widget_type == 'number_tile':
            return self._evaluate_number_tile(Model, domain)
        elif self.widget_type == 'progress_ring':
            return self._evaluate_progress_ring(Model, domain)
        elif self.widget_type == 'pie':
            return self._evaluate_pie_chart(Model, domain)
        elif self.widget_type == 'bar':
            return self._evaluate_bar_chart(Model, domain)
        elif self.widget_type == 'table':
            return self._evaluate_table(Model, domain)

        return {}

    def _evaluate_number_tile(self, Model, domain):
        """Evaluate data for number tile widget."""
        if self.operation == 'count':
            value = Model.search_count(domain)
        else:
            records = Model.search(domain)
            if not records:
                value = 0
            else:
                field = self.aggregate_field or 'id'
                values = records.mapped(field)
                values = [v for v in values if isinstance(v, (int, float))]

                if self.operation == 'sum':
                    value = sum(values)
                elif self.operation == 'avg':
                    value = sum(values) / len(values) if values else 0
                elif self.operation == 'min':
                    value = min(values) if values else 0
                elif self.operation == 'max':
                    value = max(values) if values else 0
                else:
                    value = 0

        return {
            'type': 'number_tile',
            'value': value,
            'format': self.format_type,
        }

    def _evaluate_progress_ring(self, Model, domain):
        """Evaluate data for progress ring widget."""
        records = Model.search(domain)
        actual_field = self.actual_field or 'percent_complete'
        target = self.target_value or 100

        if records:
            actual = sum(records.mapped(actual_field)) / len(records)
        else:
            actual = 0

        percentage = (actual / target * 100) if target else 0

        return {
            'type': 'progress_ring',
            'value': actual,
            'target': target,
            'percentage': min(100, percentage),
            'format': self.format_type,
        }

    def _evaluate_pie_chart(self, Model, domain):
        """Evaluate data for pie chart widget."""
        if not self.group_by_field:
            return {'type': 'pie', 'data': []}

        records = Model.search(domain)
        grouped = {}

        for record in records:
            key = getattr(record, self.group_by_field, False)
            if hasattr(key, 'name'):
                key = key.name
            elif hasattr(key, 'id'):
                key = str(key.id)
            key = str(key) if key else 'Undefined'

            if key not in grouped:
                grouped[key] = 0

            if self.operation == 'count':
                grouped[key] += 1
            elif self.aggregate_field:
                val = getattr(record, self.aggregate_field, 0)
                if isinstance(val, (int, float)):
                    grouped[key] += val

        # Sort and limit
        items = sorted(
            grouped.items(),
            key=lambda x: x[1],
            reverse=(self.sort_order == 'desc')
        )[:self.limit]

        return {
            'type': 'pie',
            'data': [{'name': k, 'value': v} for k, v in items],
        }

    def _evaluate_bar_chart(self, Model, domain):
        """Evaluate data for bar chart widget."""
        # Similar to pie chart but formatted for bar visualization
        pie_data = self._evaluate_pie_chart(Model, domain)
        return {
            'type': 'bar',
            'data': pie_data.get('data', []),
        }

    def _evaluate_table(self, Model, domain):
        """Evaluate data for table widget."""
        columns = self.get_table_columns()
        if not columns:
            # Default columns
            columns = [
                {'field': 'name', 'label': 'Name'},
                {'field': 'state', 'label': 'Status'},
            ]

        # Build sort
        order = f'{self.sort_by or "id"} {self.sort_order or "asc"}'

        records = Model.search(domain, limit=self.limit, order=order)

        rows = []
        for record in records:
            row = {'id': record.id}
            for col in columns:
                field = col.get('field')
                value = getattr(record, field, None)
                if hasattr(value, 'name'):
                    value = value.name
                elif hasattr(value, 'id'):
                    value = str(value.id)
                row[field] = value
            rows.append(row)

        return {
            'type': 'table',
            'columns': columns,
            'rows': rows,
            'total': Model.search_count(domain),
        }

    @api.model
    def create_from_config(self, canvas_id, config):
        """
        Create widget from React frontend configuration.

        Args:
            canvas_id: ID of parent canvas
            config: Widget configuration dict
        """
        vals = {
            'canvas_id': canvas_id,
            'widget_type': config.get('type', 'number_tile'),
            'title': config.get('title', 'New Widget'),
            'color': config.get('color', '#0078D4'),
            'icon': config.get('icon'),
            'target_model': config.get('target_model', 'project.task'),
            'operation': config.get('operation', 'count'),
            'format_type': config.get('format', 'number'),
            'group_by_field': config.get('group_by'),
            'aggregate_field': config.get('aggregate_field'),
            'sort_order': config.get('sort_order', 'desc'),
            'sort_by': config.get('sort_by'),
            'limit': config.get('limit', 10),
            'filters_json': json.dumps(config.get('filters', [])),
            'table_columns_json': json.dumps(config.get('table_columns', [])),
            'target_value': config.get('target_value', 100),
            'actual_field': config.get('actual_field'),
            'col_span': config.get('layout', {}).get('col_span', 1),
            'row_span': config.get('layout', {}).get('row_span', 1),
            'position_x': config.get('layout', {}).get('x', 0),
            'position_y': config.get('layout', {}).get('y', 0),
        }
        return self.create(vals)
