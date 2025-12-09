-- =============================================
-- TBWA Finance Compliance System - Seed Data
-- =============================================

-- 1. Organizations
INSERT INTO organizations (id, name, code, tax_identification_number, rdo_code, currency_code, active) VALUES
('11111111-1111-1111-1111-111111111111', 'TBWA\Santiago Mangada Puno', 'TBWA', '000-123-456-000', ''RDO39', 'PHP', TRUE),
('22222222-2222-2222-2222-222222222222', 'Omnicom Media Group', 'OMC', '000-789-012-000', 'RDO39', 'PHP', TRUE);

-- 2. Roles
INSERT INTO roles (code, name, description, color) VALUES
('responsible', 'Responsible', 'Person who performs the work', '#3B82F6'),
('approver', 'Approver', 'Person who approves the work', '#10B981'),
('reviewer', 'Reviewer', 'Person who reviews the work', '#F59E0B'),
('informed', 'Informed', 'Person who needs to be notified', '#6B7280');

-- 3. User Profiles (from your RACI matrix)
INSERT INTO user_profiles (id, organization_id, employee_code, full_name, email, position, role, active) VALUES
-- Finance leadership
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'CKVC', 'Khalil Vera Cruz', 'khalil.veracruz@omc.com', 'Finance Director', 'finance_director', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'RIM', 'Rey Meran', 'rey.meran@omc.com', 'Senior Finance Manager', 'finance_manager', TRUE),

-- Finance supervisors
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'BOM', 'Beng Manalo', 'beng.manalo@omc.com', 'Finance Supervisor', 'supervisor', TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'LAS', 'Amor Lasaga', 'amor.lasaga@omc.com', 'Treasury Supervisor', 'supervisor', TRUE),

-- Finance staff
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'JAP', 'Jane Perez', 'jane.perez@omc.com', 'Accounting Associate', 'user', TRUE),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'JPAL', 'Jerald Loterte', 'jerald.loterte@omc.com', 'Accounting Associate', 'user', TRUE),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'JLI', 'Jasmin Ignacio', 'jasmin.ignacio@omc.com', 'Tax Associate', 'user', TRUE),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'JRMO', 'Jhoee Oliva', 'jhoee.oliva@omc.com', 'Accounting Associate', 'user', TRUE),
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'JMSM', 'Joshua Santos', 'joshua.santos@omc.com', 'Accounting Associate', 'user', TRUE),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'RMQB', 'Sally Brillantes', 'sally.brillantes@omc.com', 'AP Associate', 'user', TRUE);

-- 4. Departments
INSERT INTO departments (id, organization_id, code, name, head_user_id, active) VALUES
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'FIN', 'Finance & Accounting', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TRUE),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'TAX', 'Tax Compliance', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TRUE),
('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'TRY', 'Treasury', 'dddddddd-dddd-dddd-dddd-dddddddddddd', TRUE);

-- 5. BIR Forms Master Data
INSERT INTO bir_forms (id, code, name, description, form_type, frequency, filing_method, requires_alphalist, penalty_rate_per_day, penalty_max_percent, sort_order, active) VALUES
-- Monthly withholding
('f0000001-0000-0000-0000-000000000001', '1601C', 'Monthly Remittance Return - Compensation', 'Withholding tax on compensation (salaries, wages, allowances)', 'withholding', 'monthly', 'ebir', TRUE, 0.0025, 25, 1, TRUE),
('f0000002-0000-0000-0000-000000000002', '0619E', 'Monthly Remittance Form of Tax Withheld on Compensation', 'Accompanies 1601-C for detailed list of employees', 'withholding', 'monthly', 'ebir', TRUE, 0.0025, 25, 2, TRUE),

-- Quarterly expanded withholding
('f0000003-0000-0000-0000-000000000003', '1601EQ', 'Quarterly Remittance Return - Expanded Withholding Tax', 'Expanded withholding tax on suppliers, professionals, etc.', 'withholding', 'quarterly', 'efps', TRUE, 0.0025, 25, 3, TRUE),

-- Quarterly VAT
('f0000004-0000-0000-0000-000000000004', '2550Q', 'Quarterly Value-Added Tax Return', 'Quarterly VAT declaration and payment', 'vat', 'quarterly', 'efps', FALSE, 0.0025, 25, 4, TRUE),

-- Quarterly income tax
('f0000005-0000-0000-0000-000000000005', '1702Q', 'Quarterly Income Tax Return', 'Quarterly corporate income tax', 'income_tax', 'quarterly', 'efps', FALSE, 0.0025, 25, 5, TRUE),

-- Annual income tax
('f0000006-0000-0000-0000-000000000006', '1702RT', 'Annual Income Tax Return - Regular (Non-MSME)', 'Annual corporate income tax return', 'income_tax', 'annual', 'efps', FALSE, 0.0025, 25, 6, TRUE),
('f0000007-0000-0000-0000-000000000007', '1702EX', 'Annual Income Tax Return - Exempt', 'For exempt corporations', 'income_tax', 'annual', 'efps', FALSE, 0.0025, 25, 7, TRUE);

-- 6. Calendar Dates (2026 PH Holidays) - sample
INSERT INTO calendar_dates (organization_id, date, year, month, day, day_of_week, is_working_day, is_weekend, is_holiday, holiday_type, holiday_name, country_code) VALUES
-- January 2026
('11111111-1111-1111-1111-111111111111', '2026-01-01', 2026, 1, 1, 4, FALSE, FALSE, TRUE, 'regular_holiday', 'New Year''s Day', 'PH'),
('11111111-1111-1111-1111-111111111111', '2026-01-03', 2026, 1, 3, 6, FALSE, TRUE, FALSE, NULL, NULL, 'PH'),
('11111111-1111-1111-1111-111111111111', '2026-01-04', 2026, 1, 4, 0, FALSE, TRUE, FALSE, NULL, NULL, 'PH'),

-- April 2026
('11111111-1111-1111-1111-111111111111', '2026-04-02', 2026, 4, 2, 4, FALSE, FALSE, TRUE, 'regular_holiday', 'Maundy Thursday', 'PH'),
('11111111-1111-1111-1111-111111111111', '2026-04-03', 2026, 4, 3, 5, FALSE, FALSE, TRUE, 'regular_holiday', 'Good Friday', 'PH'),
('11111111-1111-1111-1111-111111111111', '2026-04-09', 2026, 4, 9, 4, FALSE, FALSE, TRUE, 'regular_holiday', 'Araw ng Kagitingan (Bataan Day)', 'PH'),

-- May 2026
('11111111-1111-1111-1111-111111111111', '2026-05-01', 2026, 5, 1, 5, FALSE, FALSE, TRUE, 'regular_holiday', 'Labor Day', 'PH'),

-- June 2026
('11111111-1111-1111-1111-111111111111', '2026-06-12', 2026, 6, 12, 5, FALSE, FALSE, TRUE, 'regular_holiday', 'Independence Day', 'PH'),

-- August 2026
('11111111-1111-1111-1111-111111111111', '2026-08-31', 2026, 8, 31, 1, FALSE, FALSE, TRUE, 'regular_holiday', 'National Heroes Day', 'PH'),

-- November 2026
('11111111-1111-1111-1111-111111111111', '2026-11-30', 2026, 11, 30, 1, FALSE, FALSE, TRUE, 'regular_holiday', 'Bonifacio Day', 'PH'),

-- December 2026
('11111111-1111-1111-1111-111111111111', '2026-12-25', 2026, 12, 25, 5, FALSE, FALSE, TRUE, 'regular_holiday', 'Christmas Day', 'PH'),
('11111111-1111-1111-1111-111111111111', '2026-12-30', 2026, 12, 30, 3, FALSE, FALSE, TRUE, 'regular_holiday', 'Rizal Day', 'PH');

-- Generate working days for 2026 (sample - you'd generate all days programmatically)
-- This is a placeholder - in production, use a script to generate all 365 days

-- 7. BIR Checklist Templates - 1601C Preparation
INSERT INTO bir_checklist_templates (bir_form_id, task_type, sequence, label, category, is_required) VALUES
-- Preparation phase
('f0000001-0000-0000-0000-000000000001', 'preparation', 1, 'Download payroll register from HRIS/accounting system', 'data_gathering', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 2, 'Extract salaries, allowances, bonuses, and other compensation', 'data_gathering', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 3, 'Reconcile payroll register total vs GL account (Salaries Expense)', 'computation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 4, 'Apply tax tables and compute withholding tax per employee', 'computation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 5, 'Prepare alphalist (0619-E) with employee TINs and amounts', 'form_filling', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 6, 'Fill out 1601-C form with total tax withheld', 'form_filling', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 7, 'Prepare check voucher / payment request with correct GL codes', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 8, 'Attach all working papers and save in compliance folder', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 9, 'Self-review checklist: correct period, TIN, amounts, signatures', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'preparation', 10, 'Route to SFM for review (change Kanban status & tag SFM)', 'documentation', TRUE),

-- SFM Review phase
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 1, 'Validate tax base matches GL (spot check large items)', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 2, 'Recompute tax for sample employees (5-10% sample)', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 3, 'Check period covered is correct (e.g., Dec 2025)', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 4, 'Confirm alphalist is complete and formatted correctly', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 5, 'Verify prior month adjustments are reflected if any', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 6, 'Check that penalties/interest are computed if late filing', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 7, 'Approve or send back with comments in Kanban', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 8, 'Lock working file (read-only) and mark "Approved by SFM"', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'sfm_review', 9, 'Route to FD for payment approval (tag CKVC)', 'documentation', TRUE),

-- FD Approval phase
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 1, 'Review approved BIR form and payment request for reasonableness', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 2, 'Confirm budget/cash is available (coordinate with Treasury)', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 3, 'Verify payee details, bank account, and amount are correct', 'validation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 4, 'Approve funding via sign-off / digital workflow', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 5, 'Route signed CV/payment instruction to Treasury', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'fd_approval', 6, 'Mark Kanban status "For Filing & Payment"', 'documentation', TRUE),

-- Filing & Payment phase
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 1, 'File the return via eBIR/eFPS or over-the-counter', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 2, 'Generate and save BIR confirmation (email, PDF, screenshot)', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 3, 'Execute payment (online banking, check, OTC)', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 4, 'Collect bank proof (debit memo, validated slip)', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 5, 'Attach all proofs to Kanban card and archive in compliance folder', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 6, 'Update tax register/tracker (date filed, OR/ACK number, amount)', 'documentation', TRUE),
('f0000001-0000-0000-0000-000000000001', 'filing_payment', 7, 'Change Kanban status to "Done - Filed & Paid"', 'documentation', TRUE);

-- 8. Month-End Task Templates (from your Excel sheet - sample)
INSERT INTO month_end_task_templates (id, organization_id, wbs_code, task_category, task_name, detailed_description, default_responsible_code, default_reviewer_code, default_approver_code, preparation_days, review_days, approval_days, sla_description, estimated_hours, color_code, department, active, sort_order) VALUES

-- Payroll & Personnel (RIM)
('t0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'IM1.1', 'Payroll & Personnel', 'Post payroll journal entry', 'Post payroll JV including salaries, benefits, withholdings; post final pay, SL conversions, early retirement if applicable', 'RIM', 'CKVC', 'CKVC', 1.0, 0.5, 0.5, 'Complete by WD +1', 3.0, '#3B82F6', 'Finance', TRUE, 1),

('t0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'IM1.2', 'Tax & Provisions', 'Compute and record tax provision and PPD', 'Calculate monthly tax provision; record prepaid tax if applicable; reconcile with Q1/Q2/Q3 payments', 'RIM', 'CKVC', 'CKVC', 2.0, 0.5, 0.5, 'Complete by WD +2', 4.0, '#3B82F6', 'Finance', TRUE, 2),

('t0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'IM1.3', 'Rent & Leases', 'Record recurring rent and amortization', 'Post monthly rent expense; amortize prepaid rent; record lease liability adjustments under IFRS 16', 'RIM', 'CKVC', 'CKVC', 2.0, 0.5, 0.5, 'Complete by WD +2', 2.0, '#3B82F6', 'Finance', TRUE, 3),

-- Accruals & Expenses (BOM)
('t0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'IM1.4', 'Accruals & Expenses', 'Record accruals for suppliers not yet billed', 'Book accruals for utilities, telecom, professional fees, and other expenses incurred but not invoiced; attach supporting schedules', 'BOM', 'CKVC', 'CKVC', 3.0, 0.5, 0.5, 'Complete by WD +3', 5.0, '#10B981', 'Finance', TRUE, 4),

-- WIP/OOP Management (JPAL)
('t0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'IM1.5', 'WIP/OOP Management', 'Recognize billable WIP / OOP and reclass to client projects', 'Review unbilled WIP; recognize billable WIP/OOP; reclassify to client project codes; prepare WIP aging report', 'JPAL', 'BOM', 'CKVC', 3.0, 1.0, 0.5, 'Complete by WD +3', 6.0, '#F59E0B', 'Finance', TRUE, 5),

-- VAT & Taxes (JLI)
('t0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'IM2.1', 'VAT & Taxes', 'Prepare and record monthly VAT report', 'Extract sales and purchase journals; compute input/output VAT; prepare monthly VAT report; book VAT payable/recoverable', 'JLI', 'LAS', 'CKVC', 4.0, 1.0, 0.5, '4 BD before VAT deadline', 5.0, '#EF4444', 'Tax', TRUE, 6),

-- Accruals (JRMO)
('t0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'IM2.2', 'Accruals', 'Compile documents and book accruals', 'Gather all accrual documents; coordinate with project teams for unbilled costs; book accrual entries with proper GL coding', 'JRMO', 'JPAL', 'CKVC', 3.0, 1.0, 0.5, 'Complete by WD +3', 4.0, '#8B5CF6', 'Finance', TRUE, 7),

-- Cash Advances / Liquidations (RMQB)
('t0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'IM2.3', 'Cash Advances / Liquidations', 'Process CA liquidation summaries', 'Compile all CA liquidation forms; verify receipts and approvals; post liquidation entries; clear CA balances', 'RMQB', 'LAS', 'CKVC', 4.0, 1.0, 0.5, 'Complete by WD +4', 5.0, '#EC4899', 'Finance', TRUE, 8),

-- Bank Reconciliation (LAS)
('t0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'IM3.1', 'Bank Reconciliation', 'Reconcile all bank accounts', 'Download bank statements; match deposits and checks; identify reconciling items; prepare bank rec report for all accounts', 'LAS', 'BOM', 'CKVC', 2.0, 1.0, 0.5, 'Complete by WD +2', 4.0, '#14B8A6', 'Treasury', TRUE, 9),

-- AR Aging (JAP)
('t0000010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'IM3.2', 'AR Aging & Provisioning', 'Prepare AR aging and bad debt provision', 'Generate AR aging report by client; assess collectibility; compute allowance for bad debts; book provision entry', 'JAP', 'BOM', 'CKVC', 3.0, 1.0, 0.5, 'Complete by WD +3', 4.0, '#F97316', 'Finance', TRUE, 10),

-- AP Aging (RMQB)
('t0000011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'IM3.3', 'AP Aging', 'Prepare AP aging report', 'Generate AP aging by supplier; reconcile AP subledger vs GL; identify overdue payables; prepare payment schedule', 'RMQB', 'LAS', 'CKVC', 3.0, 1.0, 0.5, 'Complete by WD +3', 3.0, '#EC4899', 'Finance', TRUE, 11),

-- Intercompany Recon (RIM)
('t0000012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'IM4.1', 'Intercompany Reconciliation', 'Reconcile intercompany balances', 'Match interco receivables/payables with sister companies; resolve discrepancies; confirm balances via email/IC confirmation form', 'RIM', 'CKVC', 'CKVC', 3.0, 1.0, 0.5, 'Complete by WD +3', 3.0, '#3B82F6', 'Finance', TRUE, 12),

-- Fixed Assets (JMSM)
('t0000013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'IM4.2', 'Fixed Assets Depreciation', 'Compute and post monthly depreciation', 'Run depreciation calculation; review new additions and disposals; post depreciation JE; update FA register', 'JMSM', 'BOM', 'CKVC', 2.0, 1.0, 0.5, 'Complete by WD +2', 2.0, '#6366F1', 'Finance', TRUE, 13),

-- Prepayments (JPAL)
('t0000014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'IM4.3', 'Prepayments Amortization', 'Amortize prepaid expenses', 'Review prepaid schedule; amortize insurance, rent, licenses, subscriptions; post amortization entries', 'JPAL', 'BOM', 'CKVC', 2.0, 1.0, 0.5, 'Complete by WD +2', 2.0, '#F59E0B', 'Finance', TRUE, 14),

-- Trial Balance (RIM)
('t0000015-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'IM5.1', 'Finalize Trial Balance', 'Finalize and lock trial balance', 'Review all adjusting entries posted; verify all reconciliations complete; run final TB; lock GL period in ERP', 'RIM', 'CKVC', 'CKVC', 5.0, 1.0, 0.5, 'Complete by WD +5', 3.0, '#3B82F6', 'Finance', TRUE, 15),

-- Financial Statements (CKVC)
('t0000016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'IM5.2', 'Prepare Financial Statements', 'Generate P&L, Balance Sheet, Cash Flow', 'Generate financial statements from locked TB; apply PFRS formatting; prepare management commentary; circulate to leadership', 'CKVC', NULL, NULL, 6.0, 0, 0, 'Complete by WD +6', 6.0, '#10B981', 'Finance', TRUE, 16);

-- 9. Month-End Checklist Templates (sample for one template)
INSERT INTO month_end_checklist_templates (template_id, sequence, label, category, is_required) VALUES
-- For IM1.1 Payroll JE
('t0000001-0000-0000-0000-000000000001', 1, 'Download payroll register from HRIS/Odoo HR', 'data_gathering', TRUE),
('t0000001-0000-0000-0000-000000000001', 2, 'Reconcile payroll register total vs GL Salaries Expense account', 'validation', TRUE),
('t0000001-0000-0000-0000-000000000001', 3, 'Check for final pay, separation pay, unused leave conversions', 'data_gathering', FALSE),
('t0000001-0000-0000-0000-000000000001', 4, 'Prepare payroll JE with correct GL codes (per department/project)', 'documentation', TRUE),
('t0000001-0000-0000-0000-000000000001', 5, 'Attach payroll register and supporting docs to JE', 'documentation', TRUE),
('t0000001-0000-0000-0000-000000000001', 6, 'Post JE in Odoo Accounting module', 'documentation', TRUE),
('t0000001-0000-0000-0000-000000000001', 7, 'Verify JE balances (debit = credit)', 'validation', TRUE),
('t0000001-0000-0000-0000-000000000001', 8, 'Route to CKVC for review and approval', 'documentation', TRUE);

-- For IM2.1 VAT Report
('t0000006-0000-0000-0000-000000000006', 1, 'Extract Sales Journal (OR/SI) for the month', 'data_gathering', TRUE),
('t0000006-0000-0000-0000-000000000006', 2, 'Extract Purchase Journal (AP/Vendor Bills) for the month', 'data_gathering', TRUE),
('t0000006-0000-0000-0000-000000000006', 3, 'Compute Output VAT (Sales × 12%)', 'computation', TRUE),
('t0000006-0000-0000-0000-000000000006', 4, 'Compute Input VAT (Purchases × 12%) - only from VAT-registered suppliers', 'computation', TRUE),
('t0000006-0000-0000-0000-000000000006', 5, 'Identify zero-rated and exempt sales if any', 'computation', TRUE),
('t0000006-0000-0000-0000-000000000006', 6, 'Prepare monthly VAT report (summary and schedule)', 'documentation', TRUE),
('t0000006-0000-0000-0000-000000000006', 7, 'Book VAT entry: Dr. Output VAT, Cr. Input VAT, Cr/Dr. VAT Payable', 'documentation', TRUE),
('t0000006-0000-0000-0000-000000000006', 8, 'Attach VAT schedules to JE and save in tax folder', 'documentation', TRUE),
('t0000006-0000-0000-0000-000000000006', 9, 'Route to LAS for review', 'documentation', TRUE);

-- 10. Document Templates
INSERT INTO document_templates (id, organization_id, name, description, template_type, storage_path, filename, file_format, category, active, sort_order) VALUES
('dt000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'BIR 1601-C Working File', 'Excel template for computing withholding tax on compensation', 'bir_working_file', 'templates/bir-1601c-working-file.xlsx', 'bir-1601c-working-file.xlsx', 'xlsx', 'BIR', TRUE, 1),
('dt000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Check Voucher Template', 'Standard CV/payment request form', 'payment_voucher', 'templates/check-voucher.xlsx', 'check-voucher.xlsx', 'xlsx', 'Finance', TRUE, 2),
('dt000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Month-End Checklist', 'Master checklist for month-end closing', 'checklist', 'templates/month-end-checklist.xlsx', 'month-end-checklist.xlsx', 'xlsx', 'Finance', TRUE, 3),
('dt000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'VAT Report Template', 'Monthly VAT summary and schedules', 'bir_working_file', 'templates/vat-report-template.xlsx', 'vat-report-template.xlsx', 'xlsx', 'Tax', TRUE, 4);

-- =============================================
-- End of seed data
-- =============================================

-- NOTES:
-- 1. Update UUIDs in user_profiles with actual Supabase auth.users IDs after user signup
-- 2. Generate full calendar_dates for 2026 (all 365 days) using a script
-- 3. Add more BIR checklist templates for other forms (1601EQ, 2550Q, 1702Q, etc.)
-- 4. Add remaining month-end task templates from your Excel sheet
-- 5. Upload actual document templates to Supabase Storage and update storage_path
