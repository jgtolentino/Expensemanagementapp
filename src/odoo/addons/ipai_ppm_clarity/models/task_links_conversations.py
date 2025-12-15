# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class TaskLink(models.Model):
    """
    Task Links model aligned with Clarity 16.1.1.
    Allows adding helpful links to external sites for tasks.
    """
    _name = 'ipai.task.link'
    _description = 'Task Link'
    _order = 'sequence, id'

    name = fields.Char(
        string='Link Name',
        required=True,
        help='User-friendly name for the link',
    )
    url = fields.Char(
        string='URL',
        required=True,
        help='External URL',
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
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
    )
    description = fields.Text(
        string='Description',
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )


class TaskConversation(models.Model):
    """
    Task Conversations model for collaboration.
    Allows stakeholders to discuss tasks with @mentions.
    """
    _name = 'ipai.task.conversation'
    _description = 'Task Conversation'
    _order = 'create_date desc'
    _inherit = ['mail.thread']

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
    )
    author_id = fields.Many2one(
        'res.users',
        string='Author',
        default=lambda self: self.env.user,
        required=True,
    )
    message = fields.Html(
        string='Message',
        required=True,
    )
    mentioned_user_ids = fields.Many2many(
        'res.users',
        string='Mentioned Users',
        help='Users mentioned with @',
    )
    parent_id = fields.Many2one(
        'ipai.task.conversation',
        string='Reply To',
        ondelete='cascade',
    )
    reply_ids = fields.One2many(
        'ipai.task.conversation',
        'parent_id',
        string='Replies',
    )

    def post_conversation(self, task_id, message, mentioned_user_ids=None):
        """Post a new conversation and notify mentioned users."""
        conversation = self.create({
            'task_id': task_id,
            'message': message,
            'mentioned_user_ids': [(6, 0, mentioned_user_ids or [])],
        })

        # Notify mentioned users
        if mentioned_user_ids:
            task = self.env['project.task'].browse(task_id)
            for user_id in mentioned_user_ids:
                user = self.env['res.users'].browse(user_id)
                # Create activity/notification
                task.activity_schedule(
                    'mail.mail_activity_data_todo',
                    user_id=user_id,
                    summary=f'You were mentioned in a conversation on {task.name}',
                    note=message,
                )

        return conversation


class ProjectTaskLinks(models.Model):
    """Extend project.task with links and conversations."""
    _inherit = 'project.task'

    link_ids = fields.One2many(
        'ipai.task.link',
        'task_id',
        string='Links',
    )
    link_count = fields.Integer(
        string='Link Count',
        compute='_compute_link_count',
    )
    conversation_ids = fields.One2many(
        'ipai.task.conversation',
        'task_id',
        string='Conversations',
    )
    conversation_count = fields.Integer(
        string='Conversation Count',
        compute='_compute_conversation_count',
    )

    # Unit of measure preference (FTE/Hours/Days)
    effort_unit = fields.Selection([
        ('hours', 'Hours'),
        ('days', 'Days'),
        ('fte', 'FTE'),
    ], string='Effort Unit', default='hours')

    # Baseline comparison fields
    baseline_start = fields.Datetime(
        string='Baseline Start',
        help='Original planned start from baseline',
    )
    baseline_finish = fields.Datetime(
        string='Baseline Finish',
        help='Original planned finish from baseline',
    )
    baseline_duration = fields.Float(
        string='Baseline Duration',
        help='Original planned duration from baseline',
    )
    baseline_variance_days = fields.Float(
        string='Variance (Days)',
        compute='_compute_baseline_variance',
        help='Difference from baseline in days',
    )

    @api.depends('link_ids')
    def _compute_link_count(self):
        for task in self:
            task.link_count = len(task.link_ids)

    @api.depends('conversation_ids')
    def _compute_conversation_count(self):
        for task in self:
            task.conversation_count = len(task.conversation_ids)

    @api.depends('planned_date_begin', 'baseline_start', 'date_deadline', 'baseline_finish')
    def _compute_baseline_variance(self):
        for task in self:
            variance = 0
            if task.date_deadline and task.baseline_finish:
                delta = task.date_deadline - task.baseline_finish
                variance = delta.days
            task.baseline_variance_days = variance

    def action_view_links(self):
        """View task links."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Links - {self.name}',
            'res_model': 'ipai.task.link',
            'view_mode': 'tree,form',
            'domain': [('task_id', '=', self.id)],
            'context': {
                'default_task_id': self.id,
            },
        }

    def action_view_conversations(self):
        """View task conversations."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Conversations - {self.name}',
            'res_model': 'ipai.task.conversation',
            'view_mode': 'tree,form',
            'domain': [('task_id', '=', self.id)],
            'context': {
                'default_task_id': self.id,
            },
        }

    def save_baseline(self):
        """Save current schedule as baseline."""
        for task in self:
            task.write({
                'baseline_start': task.planned_date_begin,
                'baseline_finish': task.date_deadline,
                'baseline_duration': task.duration_days,
            })
        return True

    def clear_baseline(self):
        """Clear baseline data."""
        self.write({
            'baseline_start': False,
            'baseline_finish': False,
            'baseline_duration': 0,
        })
        return True
