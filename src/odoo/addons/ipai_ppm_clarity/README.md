# IPAI PPM Clarity Canvas

**Clarity 16.1.1 Canvas & Task Engine Parity for Odoo 18 CE**

A comprehensive Project Portfolio Management module implementing Clarity-inspired Canvas dashboards and Work Breakdown Structure (WBS) task management.

## Features

### Canvas Dashboard

- **Widget Types**: Number Tile, Progress Ring, Pie Chart, Bar Chart, Table
- **Layouts**: 4, 6, or 8 column grid layouts
- **Saved Views**: Per-user view configurations with sharing
- **Real-time Data**: Dynamic widget data evaluation
- **Configuration Mode**: Drag-and-drop widget arrangement

### Task Management

- **WBS Hierarchy**: Work Breakdown Structure codes and levels
- **Task Types**: Task, Phase, Milestone, Summary
- **Progress Tracking**: Percent complete, ETC hours, total effort
- **Dependencies**: FS, SS, FF, SF with lag support

### Autoschedule (CPM)

- **Critical Path Method**: Forward and backward pass calculation
- **Float Calculation**: Total float/slack for each task
- **Critical Path**: Automatic identification of critical tasks
- **Tentative Schedule**: Draft scheduling with publish/discard workflow
- **Constraints**: Locked tasks, date constraints, resource awareness

### Phases & To-Dos

- **Project Phases**: Top-level task groupings
- **To-Do Items**: Granular checklist items within tasks
- **Status Tracking**: Draft, In Progress, On Hold, Completed, Cancelled

### Task Links & Conversations (Clarity 16.1.1)

- **Links**: Add external URLs to tasks with descriptions
- **Conversations**: Collaborate on tasks with threaded discussions
- **@Mentions**: Tag users with notifications and activity scheduling
- **Baseline Tracking**: Track original schedule vs current schedule

### Widget Library (Clarity 16.1.1)

- **My Widgets**: Personal widget collection
- **Shared Library**: Organization-wide widget templates
- **Target Widgets**: Goals and constraints with status indicators
- **Linked Widgets**: Cross-dashboard widget references

### Subprojects (Clarity 16.1.1)

- **Master Projects**: Create hierarchical project structures
- **Proxy Tasks**: Automatic summary tasks in master timeline
- **Aggregated Progress**: Roll-up of subproject metrics
- **Bi-directional Links**: View parent projects from child

### Baselines (Clarity 16.1.1)

- **Schedule Baselines**: Capture snapshots for comparison
- **Task Snapshots**: WBS-level baseline data preservation
- **Variance Tracking**: Calculate schedule slippage
- **Multiple Revisions**: Track baseline history with versioning

## Installation

### Requirements

- Odoo 18 Community Edition
- Python 3.10+
- PostgreSQL 14+

### Install Module

1. Copy the module to your Odoo addons directory:
   ```bash
   cp -r ipai_ppm_clarity /path/to/odoo/addons/
   ```

2. Update the module list in Odoo:
   ```bash
   ./odoo-bin -u all -d your_database
   ```

3. Install the module from Apps menu or:
   ```bash
   ./odoo-bin -i ipai_ppm_clarity -d your_database
   ```

## Module Structure

```
ipai_ppm_clarity/
├── __manifest__.py          # Module manifest
├── __init__.py
├── models/
│   ├── project_phase.py     # Phase model
│   ├── project_task_ext.py  # Extended task model
│   ├── task_todo.py         # To-Do items
│   ├── task_dependency.py   # Dependencies
│   ├── canvas.py            # Canvas dashboard
│   ├── canvas_widget.py     # Widget definitions
│   ├── canvas_view.py       # Saved views
│   └── project_project_ext.py
├── services/
│   └── autoschedule_service.py  # CPM algorithm
├── views/
│   ├── project_phase_views.xml
│   ├── project_task_views.xml
│   ├── task_todo_views.xml
│   ├── task_dependency_views.xml
│   ├── canvas_views.xml
│   ├── canvas_widget_views.xml
│   ├── canvas_view_views.xml
│   └── menus.xml
├── security/
│   ├── ir.model.access.csv
│   └── ipai_ppm_clarity_security.xml
├── data/
│   ├── canvas_widget_types.xml
│   ├── demo_project_data.xml
│   └── demo_canvas_data.xml
└── static/
    └── src/
        ├── css/clarity_theme.css
        └── js/canvas_widget.js
```

## Data Models

### ipai.project.phase

Project phases for organizing tasks.

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Phase name |
| project_id | Many2one | Parent project |
| start_date | Date | Phase start |
| end_date | Date | Phase end |
| state | Selection | draft/in_progress/on_hold/completed/cancelled |
| progress | Float | Computed from tasks |

### project.task (Extended)

Extended task model with Clarity fields.

| Field | Type | Description |
|-------|------|-------------|
| phase_id | Many2one | Parent phase |
| task_type | Selection | task/phase/milestone/summary |
| wbs_code | Char | WBS code (e.g., "1.2.3") |
| wbs_level | Integer | Hierarchy level |
| duration_days | Float | Task duration |
| percent_complete | Float | 0-100 completion |
| is_critical | Boolean | On critical path |
| float_days | Float | Total float/slack |
| locked | Boolean | Exclude from autoschedule |

### ipai.task.dependency

Task dependency relationships.

| Field | Type | Description |
|-------|------|-------------|
| predecessor_id | Many2one | Predecessor task |
| successor_id | Many2one | Successor task |
| dependency_type | Selection | FS/SS/FF/SF |
| lag_days | Integer | Lag (+ delay, - lead) |

### ipai.canvas

Project canvas dashboard.

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Canvas name |
| project_id | Many2one | Parent project |
| layout_columns | Selection | 4/6/8 columns |
| is_default | Boolean | Default canvas for project |
| widget_ids | One2many | Canvas widgets |
| view_ids | One2many | Saved views |

### ipai.canvas.widget

Canvas widget configuration.

| Field | Type | Description |
|-------|------|-------------|
| widget_type | Selection | number_tile/progress_ring/pie/bar/table |
| title | Char | Widget title |
| target_model | Selection | Data source model |
| operation | Selection | count/sum/avg/min/max |
| group_by_field | Char | Field for grouping |
| filters_json | Text | JSON filter conditions |

### ipai.task.link

External links associated with tasks.

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Link display name |
| url | Char | External URL |
| task_id | Many2one | Parent task |
| description | Text | Optional description |

### ipai.task.conversation

Threaded discussions on tasks.

| Field | Type | Description |
|-------|------|-------------|
| task_id | Many2one | Parent task |
| author_id | Many2one | Message author |
| message | Html | Conversation message |
| mentioned_user_ids | Many2many | @mentioned users |
| parent_id | Many2one | Reply-to reference |

### ipai.subproject

Master project to subproject linkages.

| Field | Type | Description |
|-------|------|-------------|
| master_project_id | Many2one | Parent/master project |
| child_project_id | Many2one | Linked subproject |
| proxy_task_id | Many2one | Auto-created summary task |
| progress | Float | Aggregated from subproject tasks |

### ipai.project.baseline

Project schedule baseline snapshots.

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Baseline name |
| project_id | Many2one | Parent project |
| revision | Integer | Baseline version number |
| is_current | Boolean | Active baseline flag |
| baseline_start | Date | Captured project start |
| baseline_finish | Date | Captured project finish |
| task_snapshot_ids | One2many | Task-level snapshots |

### ipai.widget.library

Reusable widget templates.

| Field | Type | Description |
|-------|------|-------------|
| name | Char | Widget name |
| widget_type | Selection | Widget type configuration |
| in_library | Boolean | Shared in library flag |
| created_by_id | Many2one | Widget owner |

## Usage

### Creating a Canvas

1. Open a project
2. Click "Canvases" stat button
3. Create new canvas with name and layout
4. Enter Configure mode
5. Add widgets from the palette

### Running Autoschedule

1. Open project form
2. Click "Autoschedule (Draft)" button
3. Review tentative dates in task form
4. Click "Publish" to apply or "Discard" to cancel

### Adding Dependencies

1. Open task form
2. Go to "Dependencies" tab
3. Add predecessor with type (FS/SS/FF/SF) and lag

## Widget Types

### Number Tile
Single metric value (count, sum, average, etc.)

### Progress Ring
Circular progress indicator with target

### Pie Chart
Proportional data visualization grouped by field

### Bar Chart
Comparative horizontal bars

### Table
Scrollable data table with configurable columns

## API Endpoints

The module exposes JSON-RPC methods for the React frontend:

- `get_canvas_config(canvas_id)` - Get full canvas configuration
- `evaluate_widget_data(widget_id)` - Get widget data
- `update_canvas_layout(canvas_id, layout_columns, widget_positions)`
- `save_canvas_view(canvas_id, name, config)`
- `run_autoschedule(project_id, tentative)`

## Security Groups

- **Clarity Canvas Editor** - Create/edit widgets
- **Clarity Scheduler** - Run autoschedule, manage critical path

## Dependencies

- `project` - Odoo Project Management
- `hr_timesheet` - For resource/effort tracking
- `resource` - For resource constraints
- `mail` - For activity tracking

## License

LGPL-3

## Support

For questions and issues, contact IPAI/TBWA development team.
