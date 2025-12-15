# -*- coding: utf-8 -*-
# Part of IPAI PPM Clarity. See LICENSE file for full copyright and licensing details.

"""
Autoschedule Service implementing Clarity 16.1.1 Critical Path Method (CPM).

The autoschedule algorithm:
1. Forward Pass: Calculate Early Start (ES) and Early Finish (EF) for each task
2. Backward Pass: Calculate Late Start (LS) and Late Finish (LF) for each task
3. Float Calculation: Total Float = LS - ES = LF - EF
4. Critical Path: Tasks with zero float are on the critical path

Dependency Types:
- FS (Finish-to-Start): Successor starts after predecessor finishes
- SS (Start-to-Start): Successor starts when predecessor starts
- FF (Finish-to-Finish): Successor finishes when predecessor finishes
- SF (Start-to-Finish): Successor finishes after predecessor starts
"""

from odoo import models, api, fields
from datetime import datetime, timedelta
from collections import defaultdict
import logging

_logger = logging.getLogger(__name__)


class AutoscheduleService(models.AbstractModel):
    """
    Service for running Critical Path Method autoschedule on project tasks.
    Aligned with Clarity 16.1.1 autoschedule behaviors.
    """
    _name = 'ipai.autoschedule.service'
    _description = 'Autoschedule CPM Service'

    def run_autoschedule(self, project, tentative=True):
        """
        Run autoschedule on a project.

        Args:
            project: project.project record
            tentative: If True, store results in tentative fields;
                      if False, update actual dates directly

        Returns:
            Action result (notification or view)
        """
        _logger.info(f'Running autoschedule for project {project.name} (tentative={tentative})')

        # Get schedulable tasks (not locked, within date constraints)
        tasks = self._get_schedulable_tasks(project)

        if not tasks:
            return self._notification('No Tasks to Schedule',
                                     'No schedulable tasks found.',
                                     'warning')

        # Build dependency graph
        graph = self._build_dependency_graph(tasks)

        # Determine project start date
        if project.schedule_from == 'finish' and project.project_finish_date:
            # Backward scheduling from finish date
            result = self._schedule_from_finish(tasks, graph, project.project_finish_date)
        else:
            # Forward scheduling from start date
            start_date = project.project_start_date or fields.Date.today()
            result = self._schedule_from_start(tasks, graph, start_date)

        # Calculate critical path
        self._calculate_critical_path(tasks, result)

        # Apply results
        self._apply_schedule(tasks, result, tentative)

        # Return notification
        critical_count = len([t for t in tasks if result.get(t.id, {}).get('is_critical')])
        return self._notification(
            'Autoschedule Complete' if not tentative else 'Tentative Schedule Created',
            f'{len(tasks)} tasks scheduled. {critical_count} tasks on critical path.',
            'success'
        )

    def _get_schedulable_tasks(self, project):
        """Get tasks that can be scheduled."""
        domain = [
            ('project_id', '=', project.id),
            ('active', '=', True),
            ('locked', '=', False),
        ]

        # Apply date constraints if set
        if project.ignore_tasks_before:
            domain.append(('planned_date_begin', '>=', project.ignore_tasks_before))
        if project.ignore_tasks_after:
            domain.append(('planned_date_begin', '<=', project.ignore_tasks_after))

        return self.env['project.task'].search(domain)

    def _build_dependency_graph(self, tasks):
        """
        Build dependency graph from tasks.

        Returns:
            dict with:
            - predecessors: {task_id: [(pred_id, type, lag), ...]}
            - successors: {task_id: [(succ_id, type, lag), ...]}
            - roots: [task_ids with no predecessors]
            - leaves: [task_ids with no successors]
        """
        task_ids = set(tasks.ids)
        predecessors = defaultdict(list)
        successors = defaultdict(list)

        dependencies = self.env['ipai.task.dependency'].search([
            '|',
            ('predecessor_id', 'in', list(task_ids)),
            ('successor_id', 'in', list(task_ids)),
        ])

        for dep in dependencies:
            if dep.predecessor_id.id in task_ids and dep.successor_id.id in task_ids:
                predecessors[dep.successor_id.id].append(
                    (dep.predecessor_id.id, dep.dependency_type, dep.lag_days)
                )
                successors[dep.predecessor_id.id].append(
                    (dep.successor_id.id, dep.dependency_type, dep.lag_days)
                )

        roots = [t.id for t in tasks if t.id not in predecessors]
        leaves = [t.id for t in tasks if t.id not in successors]

        return {
            'predecessors': dict(predecessors),
            'successors': dict(successors),
            'roots': roots,
            'leaves': leaves,
        }

    def _schedule_from_start(self, tasks, graph, start_date):
        """
        Forward scheduling from project start date.

        Uses Forward Pass to calculate Early Start/Early Finish,
        then Backward Pass for Late Start/Late Finish.
        """
        task_map = {t.id: t for t in tasks}
        result = {}

        # Initialize result dict
        for task in tasks:
            result[task.id] = {
                'early_start': None,
                'early_finish': None,
                'late_start': None,
                'late_finish': None,
                'float_days': 0,
                'is_critical': False,
            }

        # Convert start_date to datetime
        project_start = datetime.combine(start_date, datetime.min.time())

        # === FORWARD PASS ===
        # Process tasks in topological order
        processed = set()
        queue = list(graph['roots'])

        while queue:
            task_id = queue.pop(0)
            if task_id in processed:
                continue

            task = task_map.get(task_id)
            if not task:
                continue

            # Check if all predecessors are processed
            preds = graph['predecessors'].get(task_id, [])
            if not all(p[0] in processed for p in preds):
                queue.append(task_id)  # Re-queue
                continue

            # Calculate Early Start
            if not preds:
                # Root task starts at project start
                early_start = project_start
            else:
                # ES = max of all predecessor constraints
                candidate_starts = []
                for pred_id, dep_type, lag in preds:
                    pred_result = result[pred_id]
                    candidate = self._calculate_dependency_date(
                        pred_result['early_start'],
                        pred_result['early_finish'],
                        dep_type,
                        lag,
                        is_start=True
                    )
                    if candidate:
                        candidate_starts.append(candidate)

                early_start = max(candidate_starts) if candidate_starts else project_start

            # Calculate Early Finish
            duration = task.duration_days or 0
            if task.is_milestone:
                duration = 0

            early_finish = early_start + timedelta(days=duration)

            result[task_id]['early_start'] = early_start
            result[task_id]['early_finish'] = early_finish

            processed.add(task_id)

            # Add successors to queue
            for succ_id, _, _ in graph['successors'].get(task_id, []):
                if succ_id not in processed:
                    queue.append(succ_id)

        # === BACKWARD PASS ===
        # Find project end (max early finish)
        all_finishes = [r['early_finish'] for r in result.values() if r['early_finish']]
        project_end = max(all_finishes) if all_finishes else project_start

        # Process tasks in reverse topological order
        processed = set()
        queue = list(graph['leaves'])

        while queue:
            task_id = queue.pop(0)
            if task_id in processed:
                continue

            task = task_map.get(task_id)
            if not task:
                continue

            # Check if all successors are processed
            succs = graph['successors'].get(task_id, [])
            if not all(s[0] in processed for s in succs):
                queue.append(task_id)
                continue

            # Calculate Late Finish
            if not succs:
                # Leaf task finishes at project end
                late_finish = project_end
            else:
                # LF = min of all successor constraints
                candidate_finishes = []
                for succ_id, dep_type, lag in succs:
                    succ_result = result[succ_id]
                    candidate = self._calculate_dependency_date(
                        succ_result['late_start'],
                        succ_result['late_finish'],
                        dep_type,
                        lag,
                        is_start=False
                    )
                    if candidate:
                        candidate_finishes.append(candidate)

                late_finish = min(candidate_finishes) if candidate_finishes else project_end

            # Calculate Late Start
            duration = task.duration_days or 0
            if task.is_milestone:
                duration = 0

            late_start = late_finish - timedelta(days=duration)

            result[task_id]['late_start'] = late_start
            result[task_id]['late_finish'] = late_finish

            processed.add(task_id)

            # Add predecessors to queue
            for pred_id, _, _ in graph['predecessors'].get(task_id, []):
                if pred_id not in processed:
                    queue.append(pred_id)

        return result

    def _schedule_from_finish(self, tasks, graph, finish_date):
        """
        Backward scheduling from project finish date.
        Starts with backward pass, then forward pass.
        """
        task_map = {t.id: t for t in tasks}
        result = {}

        for task in tasks:
            result[task.id] = {
                'early_start': None,
                'early_finish': None,
                'late_start': None,
                'late_finish': None,
                'float_days': 0,
                'is_critical': False,
            }

        project_end = datetime.combine(finish_date, datetime.min.time())

        # === BACKWARD PASS FIRST ===
        processed = set()
        queue = list(graph['leaves'])

        while queue:
            task_id = queue.pop(0)
            if task_id in processed:
                continue

            task = task_map.get(task_id)
            if not task:
                continue

            succs = graph['successors'].get(task_id, [])
            if not all(s[0] in processed for s in succs):
                queue.append(task_id)
                continue

            if not succs:
                late_finish = project_end
            else:
                candidate_finishes = []
                for succ_id, dep_type, lag in succs:
                    succ_result = result[succ_id]
                    candidate = self._calculate_dependency_date(
                        succ_result['late_start'],
                        succ_result['late_finish'],
                        dep_type,
                        lag,
                        is_start=False
                    )
                    if candidate:
                        candidate_finishes.append(candidate)
                late_finish = min(candidate_finishes) if candidate_finishes else project_end

            duration = task.duration_days or 0
            if task.is_milestone:
                duration = 0

            late_start = late_finish - timedelta(days=duration)

            result[task_id]['late_start'] = late_start
            result[task_id]['late_finish'] = late_finish
            result[task_id]['early_start'] = late_start
            result[task_id]['early_finish'] = late_finish

            processed.add(task_id)

            for pred_id, _, _ in graph['predecessors'].get(task_id, []):
                if pred_id not in processed:
                    queue.append(pred_id)

        return result

    def _calculate_dependency_date(self, start, finish, dep_type, lag, is_start):
        """
        Calculate date based on dependency type.

        Args:
            start: Predecessor/Successor start date
            finish: Predecessor/Successor finish date
            dep_type: FS, SS, FF, SF
            lag: Lag days (positive or negative)
            is_start: True if calculating start (forward), False for finish (backward)
        """
        lag_delta = timedelta(days=lag)

        if is_start:
            # Forward pass - calculating successor start
            if dep_type == 'FS':
                return finish + lag_delta if finish else None
            elif dep_type == 'SS':
                return start + lag_delta if start else None
            elif dep_type == 'FF':
                return finish + lag_delta if finish else None
            elif dep_type == 'SF':
                return start + lag_delta if start else None
        else:
            # Backward pass - calculating predecessor finish
            if dep_type == 'FS':
                return start - lag_delta if start else None
            elif dep_type == 'SS':
                return start - lag_delta if start else None
            elif dep_type == 'FF':
                return finish - lag_delta if finish else None
            elif dep_type == 'SF':
                return finish - lag_delta if finish else None

        return None

    def _calculate_critical_path(self, tasks, result):
        """
        Calculate float and mark critical tasks.
        Critical Path = tasks where Total Float = 0
        """
        for task in tasks:
            task_result = result.get(task.id, {})
            es = task_result.get('early_start')
            ls = task_result.get('late_start')

            if es and ls:
                float_days = (ls - es).days
                task_result['float_days'] = float_days
                task_result['is_critical'] = (float_days == 0)
            else:
                task_result['float_days'] = 0
                task_result['is_critical'] = False

    def _apply_schedule(self, tasks, result, tentative):
        """Apply schedule results to tasks."""
        for task in tasks:
            task_result = result.get(task.id, {})

            es = task_result.get('early_start')
            ef = task_result.get('early_finish')
            ls = task_result.get('late_start')
            lf = task_result.get('late_finish')

            vals = {
                'early_start': es,
                'early_finish': ef,
                'late_start': ls,
                'late_finish': lf,
                'float_days': task_result.get('float_days', 0),
                'is_critical': task_result.get('is_critical', False),
            }

            if tentative:
                vals['tentative_start'] = es
                vals['tentative_finish'] = ef
                vals['tentative_active'] = True
            else:
                vals['planned_date_begin'] = es
                vals['date_deadline'] = ef

            task.write(vals)

    def _notification(self, title, message, notif_type='info'):
        """Return notification action."""
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': title,
                'message': message,
                'type': notif_type,
                'sticky': False,
            },
        }

    @api.model
    def get_critical_path(self, project_id):
        """
        Get the critical path for a project.

        Returns:
            List of task IDs on the critical path in order
        """
        project = self.env['project.project'].browse(project_id)
        if not project.exists():
            return []

        critical_tasks = project.task_ids.filtered(
            lambda t: t.active and t.is_critical
        ).sorted('early_start')

        return critical_tasks.ids

    @api.model
    def recalculate_wbs_codes(self, project_id):
        """
        Recalculate WBS codes for all tasks in a project.
        Called after task hierarchy changes.
        """
        project = self.env['project.project'].browse(project_id)
        if not project.exists():
            return False

        # Get top-level tasks (no parent)
        root_tasks = project.task_ids.filtered(
            lambda t: t.active and not t.parent_id
        ).sorted('sequence')

        counter = [0]

        def assign_wbs(task, prefix=''):
            counter[0] += 1
            code = f'{prefix}{counter[0]}' if prefix else str(counter[0])
            task.wbs_code = code
            task.wbs_level = len(code.split('.'))

            child_counter = [0]
            for child in task.child_ids.filtered(lambda t: t.active).sorted('sequence'):
                child_counter[0] += 1
                child_code = f'{code}.{child_counter[0]}'
                child.wbs_code = child_code
                child.wbs_level = len(child_code.split('.'))

                # Recursive for deeper hierarchy
                for grandchild in child.child_ids.filtered(lambda t: t.active).sorted('sequence'):
                    assign_wbs(grandchild, f'{child_code}.')

        for task in root_tasks:
            assign_wbs(task)

        return True
