# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.
{
    'name': 'IPAI PPM Clarity Canvas',
    'version': '18.0.1.0.0',
    'category': 'Project',
    'summary': 'Clarity 16.1.1 Canvas & Task Engine parity for Odoo 18 CE',
    'description': """
IPAI PPM Clarity Canvas
=======================

This module implements a Clarity-inspired Project Canvas and WBS (Work Breakdown Structure)
engine for Odoo 18 CE, providing:

**Canvas Features:**
- Dashboard widgets: Number Tiles, Progress Rings, Pie/Bar Charts, Tables
- 4/6/8 column layouts with drag-and-drop widget positioning
- Saved Views per user with sharing capabilities
- Widget filters and aggregations (Count, Sum, Average, Min, Max)

**Task Management:**
- Extended project tasks with WBS hierarchy
- Phases, Milestones, and To-Do Items
- Task dependencies (FS, SS, FF, SF) with lag support
- Autoschedule with Critical Path Method (CPM)
- Tentative scheduling with publish/discard workflow

**Clarity Parity:**
- Grid, Board, Timeline (Gantt), and Task List views
- Bulk editing and relative date shifting
- Resource constraints and scheduling options

Compatible with Odoo 18 Community Edition and OCA modules.
    """,
    'author': 'IPAI / TBWA',
    'website': 'https://ipai.tbwa.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'web',
        'project',
        'hr_timesheet',
        'resource',
    ],
    'data': [
        # Security
        'security/ir.model.access.csv',
        'security/ipai_ppm_clarity_security.xml',
        # Views
        'views/project_phase_views.xml',
        'views/project_task_views.xml',
        'views/task_todo_views.xml',
        'views/task_dependency_views.xml',
        'views/canvas_views.xml',
        'views/canvas_widget_views.xml',
        'views/canvas_view_views.xml',
        # Clarity 16.1.1 additional views
        'views/task_links_views.xml',
        'views/subproject_views.xml',
        'views/widget_library_views.xml',
        'views/baseline_views.xml',
        'views/menus.xml',
        # Data
        'data/canvas_widget_types.xml',
        'data/demo_project_data.xml',
    ],
    'demo': [
        'data/demo_canvas_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'ipai_ppm_clarity/static/src/css/clarity_theme.css',
            'ipai_ppm_clarity/static/src/js/canvas_widget.js',
        ],
    },
    'images': [
        'static/description/banner.png',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'sequence': 10,
    'external_dependencies': {
        'python': [],
    },
}
