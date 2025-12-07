# -*- coding: utf-8 -*-
{
    "name": "InsightPulse Finance PPM",
    "summary": "Finance PPM workspace with Deakin Enterprise 365 theme",
    "description": """
        Finance Project Portfolio Management
        ====================================
        
        Complete WBS structure for month-end financial close process.
        
        Features:
        - 4-level WBS hierarchy (Project → Phase → Milestone/Task → Checklist)
        - RACI assignments (Responsible, Accountable, Consulted, Informed)
        - OKR tracking (Objectives & Key Results)
        - Risk register
        - Financial planning & budgeting
        - Deakin Enterprise 365 / Microsoft Fluent design theme
        
        Compatible with:
        - Odoo 18 CE
        - OCA Project modules
        - React/TypeScript frontend (optional)
    """,
    "version": "18.0.1.0.0",
    "category": "Project Management",
    "author": "InsightPulse AI",
    "website": "https://github.com/your-org/ipai_finance_ppm",
    "license": "LGPL-3",
    
    "depends": [
        "base",
        "web",
        "project",
        "hr_timesheet",
        "account",
    ],
    
    "data": [
        # Security
        "security/ir.model.access.csv",
        
        # Data
        "data/project_task_type.xml",
        
        # Views
        "views/project_task_views.xml",
        "views/project_project_views.xml",
        "views/menu_items.xml",
    ],
    
    "assets": {
        "web.assets_backend": [
            # Deakin Enterprise 365 Theme
            "ipai_finance_ppm/static/src/css/deakin_fluent_theme.css",
        ],
    },
    
    "demo": [],
    
    "installable": True,
    "application": True,
    "auto_install": False,
}
