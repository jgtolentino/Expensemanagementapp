-- =============================================
-- BIR Filing Calendar 2026 - Complete Schedule
-- =============================================
-- This generates all BIR filings for 2026 based on official BIR deadlines
-- Includes internal cut-off dates (Prep, SFM Review, FD Approval)

-- Organization: TBWA (use your actual org ID)
-- Assigned users: BOM (responsible), RIM (reviewer), CKVC (approver)

-- =============================================
-- 1. MONTHLY FILINGS: 1601-C / 0619-E
-- =============================================
-- Form: Withholding Tax on Compensation
-- Frequency: Monthly
-- Deadline: 10th of following month (or next business day)

-- December 2025 → Due January 15, 2026 (Jan 10 is Saturday)
INSERT INTO bir_filings (
  organization_id,
  bir_form_id,
  period_type,
  period_year,
  period_month,
  period_start_date,
  period_end_date,
  bir_deadline_date,
  prep_start_date,
  prep_due_date,
  sfm_review_due_date,
  fd_approval_due_date,
  filing_target_date,
  responsible_user_id,
  reviewer_user_id,
  approver_user_id,
  status,
  workflow_stage
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'f0000001-0000-0000-0000-000000000001', -- 1601-C
  'monthly',
  2025,
  12,
  '2025-12-01',
  '2025-12-31',
  '2026-01-15', -- BIR deadline (adjusted from Jan 10 Sat)
  '2026-01-05', -- prep start (D-10 BD)
  '2026-01-09', -- prep due (D-6 BD)
  '2026-01-12', -- SFM review (D-3 BD)
  '2026-01-13', -- FD approval (D-2 BD)
  '2026-01-14', -- filing target (D-1 BD)
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- BOM
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- RIM
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- CKVC
  'draft',
  'preparation'
);

-- January 2026 → Due February 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 1, '2026-01-01', '2026-01-31', '2026-02-10', '2026-01-31', '2026-02-04', '2026-02-06', '2026-02-09', '2026-02-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- February 2026 → Due March 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 2, '2026-02-01', '2026-02-28', '2026-03-10', '2026-03-02', '2026-03-04', '2026-03-06', '2026-03-09', '2026-03-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- March 2026 → Due April 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 3, '2026-03-01', '2026-03-31', '2026-04-10', '2026-04-01', '2026-04-06', '2026-04-08', '2026-04-09', '2026-04-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- April 2026 → Due May 10, 2026 (May 10 is Sunday → May 12 Monday)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 4, '2026-04-01', '2026-04-30', '2026-05-12', '2026-05-04', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- May 2026 → Due June 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 5, '2026-05-01', '2026-05-31', '2026-06-10', '2026-06-02', '2026-06-04', '2026-06-08', '2026-06-09', '2026-06-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- June 2026 → Due July 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 6, '2026-06-01', '2026-06-30', '2026-07-10', '2026-07-02', '2026-07-06', '2026-07-08', '2026-07-09', '2026-07-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- July 2026 → Due August 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 7, '2026-07-01', '2026-07-31', '2026-08-10', '2026-08-03', '2026-08-04', '2026-08-06', '2026-08-07', '2026-08-07', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- August 2026 → Due September 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 8, '2026-08-01', '2026-08-31', '2026-09-10', '2026-09-02', '2026-09-04', '2026-09-08', '2026-09-09', '2026-09-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- September 2026 → Due October 12, 2026 (Oct 10 is Saturday)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 9, '2026-09-01', '2026-09-30', '2026-10-12', '2026-10-05', '2026-10-06', '2026-10-08', '2026-10-09', '2026-10-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- October 2026 → Due November 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 10, '2026-10-01', '2026-10-31', '2026-11-10', '2026-11-02', '2026-11-04', '2026-11-06', '2026-11-09', '2026-11-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- November 2026 → Due December 10, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_month, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000001-0000-0000-0000-000000000001', 'monthly', 2026, 11, '2026-11-01', '2026-11-30', '2026-12-10', '2026-12-02', '2026-12-04', '2026-12-08', '2026-12-09', '2026-12-09', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- =============================================
-- 2. QUARTERLY FILINGS: 1601-EQ
-- =============================================
-- Form: Expanded Withholding Tax
-- Frequency: Quarterly
-- Deadline: Last day of month following quarter

-- Q4 2025 → Due January 30, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000003-0000-0000-0000-000000000003', 'quarterly', 2025, 4, '2025-10-01', '2025-12-31', '2026-01-30', '2026-01-20', '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q1 2026 → Due April 30, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000003-0000-0000-0000-000000000003', 'quarterly', 2026, 1, '2026-01-01', '2026-03-31', '2026-04-30', '2026-04-18', '2026-04-24', '2026-04-28', '2026-04-29', '2026-04-29', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q2 2026 → Due July 31, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000003-0000-0000-0000-000000000003', 'quarterly', 2026, 2, '2026-04-01', '2026-06-30', '2026-07-31', '2026-07-21', '2026-07-27', '2026-07-29', '2026-07-30', '2026-07-30', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q3 2026 → Due October 30, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000003-0000-0000-0000-000000000003', 'quarterly', 2026, 3, '2026-07-01', '2026-09-30', '2026-10-30', '2026-10-20', '2026-10-26', '2026-10-28', '2026-10-29', '2026-10-29', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- =============================================
-- 3. QUARTERLY FILINGS: 2550Q (VAT)
-- =============================================
-- Form: Quarterly VAT Return
-- Frequency: Quarterly
-- Deadline: 25th of month following quarter

-- Q1 2026 → Due April 27, 2026 (Apr 25 is Saturday)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000004-0000-0000-0000-000000000004', 'quarterly', 2026, 1, '2026-01-01', '2026-03-31', '2026-04-27', '2026-04-15', '2026-04-21', '2026-04-23', '2026-04-24', '2026-04-24', '99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q2 2026 → Due July 27, 2026 (Jul 25 is Saturday)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000004-0000-0000-0000-000000000004', 'quarterly', 2026, 2, '2026-04-01', '2026-06-30', '2026-07-27', '2026-07-15', '2026-07-21', '2026-07-23', '2026-07-24', '2026-07-24', '99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q3 2026 → Due October 26, 2026 (Oct 25 is Sunday)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000004-0000-0000-0000-000000000004', 'quarterly', 2026, 3, '2026-07-01', '2026-09-30', '2026-10-26', '2026-10-14', '2026-10-20', '2026-10-22', '2026-10-23', '2026-10-23', '99999999-9999-9999-9999-999999999999', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- =============================================
-- 4. QUARTERLY FILINGS: 1702Q (Income Tax)
-- =============================================
-- Form: Quarterly Income Tax Return
-- Frequency: Quarterly (Q2 and Q3 only; Q1 is part of 1702-RT annual)
-- Deadline: 60 days after quarter end

-- Q2 2026 → Due May 30, 2026 (60 days after Jun 30)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000005-0000-0000-0000-000000000005', 'quarterly', 2026, 2, '2026-04-01', '2026-06-30', '2026-05-30', '2026-05-20', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- Q3 2026 → Due August 29, 2026 (60 days after Sep 30; but BIR allows until Aug 29)
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_quarter, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000005-0000-0000-0000-000000000005', 'quarterly', 2026, 3, '2026-07-01', '2026-09-30', '2026-08-29', '2026-08-19', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- =============================================
-- 5. ANNUAL FILING: 1702-RT (Annual Income Tax)
-- =============================================
-- Form: Annual Income Tax Return
-- Frequency: Annual
-- Deadline: April 15 following year

-- Annual 2025 → Due April 15, 2026
INSERT INTO bir_filings (organization_id, bir_form_id, period_type, period_year, period_start_date, period_end_date, bir_deadline_date, prep_start_date, prep_due_date, sfm_review_due_date, fd_approval_due_date, filing_target_date, responsible_user_id, reviewer_user_id, approver_user_id, status, workflow_stage) VALUES
('11111111-1111-1111-1111-111111111111', 'f0000006-0000-0000-0000-000000000006', 'annual', 2025, '2025-01-01', '2025-12-31', '2026-04-15', '2026-04-03', '2026-04-09', '2026-04-11', '2026-04-14', '2026-04-14', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 'preparation');

-- =============================================
-- Summary:
-- - 12 monthly 1601-C filings (Dec 2025 + Jan-Nov 2026)
-- - 4 quarterly 1601-EQ filings (Q4 2025, Q1-Q3 2026)
-- - 3 quarterly 2550Q VAT filings (Q1-Q3 2026)
-- - 2 quarterly 1702Q income tax (Q2-Q3 2026)
-- - 1 annual 1702-RT (2025)
-- TOTAL: 22 BIR filings for 2026
--
-- Each filing will auto-generate 4 tasks:
-- 1. Preparation (BOM)
-- 2. SFM Review (RIM)
-- 3. FD Approval (CKVC)
-- 4. Filing & Payment (BOM + Treasury)
-- =============================================
