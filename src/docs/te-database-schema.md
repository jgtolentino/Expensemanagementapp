# Travel & Expense (T&E) Database Schema

## Overview
SAP Concur-style expense management system with cash advances, settlement workflows, and analytics.

---

## Core Schemas

### `te` - Travel & Expense Core

#### `te.employees`
```sql
CREATE TABLE te.employees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  full_name       text NOT NULL,
  employee_code   text UNIQUE NOT NULL,
  department_id   uuid REFERENCES te.departments(id),
  manager_id      uuid REFERENCES te.employees(id),
  role            text NOT NULL CHECK (role IN ('employee','manager','finance')),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_department ON te.employees(department_id);
CREATE INDEX idx_employees_manager ON te.employees(manager_id);
```

#### `te.departments`
```sql
CREATE TABLE te.departments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text UNIQUE NOT NULL,
  cost_center_id  uuid REFERENCES te.cost_centers(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

#### `te.cost_centers`
```sql
CREATE TABLE te.cost_centers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  name            text NOT NULL,
  gl_account      text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

## Expense Reports

#### `te.expense_reports`
```sql
CREATE TABLE te.expense_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code     text UNIQUE NOT NULL,
  employee_id     uuid NOT NULL REFERENCES te.employees(id),
  status          text NOT NULL CHECK (status IN ('draft','submitted','approved','rejected','paid','cancelled')),
  purpose         text NOT NULL,
  period_start    date NOT NULL,
  period_end      date NOT NULL,
  total_amount    numeric(12,2) NOT NULL DEFAULT 0,
  approved_amount numeric(12,2),
  currency        text NOT NULL DEFAULT 'PHP',
  created_at      timestamptz NOT NULL DEFAULT now(),
  submitted_at    timestamptz,
  approved_at     timestamptz,
  approved_by     uuid REFERENCES te.employees(id),
  paid_at         timestamptz,
  rejection_reason text,
  notes           text
);

CREATE INDEX idx_expense_reports_employee ON te.expense_reports(employee_id);
CREATE INDEX idx_expense_reports_status ON te.expense_reports(status);
CREATE INDEX idx_expense_reports_submitted ON te.expense_reports(submitted_at);
```

#### `te.expense_lines`
```sql
CREATE TABLE te.expense_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       uuid NOT NULL REFERENCES te.expense_reports(id) ON DELETE CASCADE,
  line_number     int NOT NULL,
  tx_date         date NOT NULL,
  category        text NOT NULL,
  merchant        text NOT NULL,
  description     text,
  amount          numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'PHP',
  receipt_id      uuid REFERENCES te.receipts(id),
  is_billable     boolean DEFAULT false,
  project_id      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_report_line UNIQUE (report_id, line_number)
);

CREATE INDEX idx_expense_lines_report ON te.expense_lines(report_id);
CREATE INDEX idx_expense_lines_category ON te.expense_lines(category);
```

#### `te.receipts`
```sql
CREATE TABLE te.receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_line_id uuid REFERENCES te.expense_lines(id),
  storage_url     text NOT NULL,
  file_name       text NOT NULL,
  file_size_kb    int,
  mime_type       text,
  ocr_document_id uuid REFERENCES ocr.documents(id),
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_receipts_expense_line ON te.receipts(expense_line_id);
CREATE INDEX idx_receipts_ocr_doc ON te.receipts(ocr_document_id);
```

---

## Cash Advances

#### `te.cash_advances`
```sql
CREATE TABLE te.cash_advances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code    text UNIQUE NOT NULL,
  employee_id     uuid NOT NULL REFERENCES te.employees(id),
  trip_id         uuid REFERENCES te.trips(id),
  status          text NOT NULL CHECK (status IN ('draft','submitted','approved','rejected','disbursed','settled','cancelled')),
  requested_amount numeric(12,2) NOT NULL,
  approved_amount  numeric(12,2),
  currency         text NOT NULL DEFAULT 'PHP',
  purpose          text NOT NULL,
  needed_date      date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  submitted_at     timestamptz,
  approved_at      timestamptz,
  approved_by      uuid REFERENCES te.employees(id),
  disbursed_at     timestamptz,
  settled_at       timestamptz,
  rejection_reason text
);

CREATE INDEX idx_cash_advances_employee ON te.cash_advances(employee_id);
CREATE INDEX idx_cash_advances_status ON te.cash_advances(status);
CREATE INDEX idx_cash_advances_disbursed ON te.cash_advances(disbursed_at);
```

#### `te.cash_advance_settlements`
```sql
CREATE TABLE te.cash_advance_settlements (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_advance_id    uuid NOT NULL REFERENCES te.cash_advances(id),
  expense_report_id  uuid NOT NULL REFERENCES te.expense_reports(id),
  settled_amount     numeric(12,2) NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_settlement UNIQUE (cash_advance_id, expense_report_id)
);

CREATE INDEX idx_settlements_cash_advance ON te.cash_advance_settlements(cash_advance_id);
CREATE INDEX idx_settlements_expense_report ON te.cash_advance_settlements(expense_report_id);
```

#### `te.cash_advance_gl_links`
```sql
CREATE TABLE te.cash_advance_gl_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_advance_id  uuid NOT NULL REFERENCES te.cash_advances(id),
  gl_account_code  text NOT NULL,
  cost_center_id   uuid REFERENCES te.cost_centers(id),
  posted_at        timestamptz,
  journal_ref      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---

## Trips (Optional)

#### `te.trips`
```sql
CREATE TABLE te.trips (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_code       text UNIQUE NOT NULL,
  employee_id     uuid NOT NULL REFERENCES te.employees(id),
  destination     text NOT NULL,
  purpose         text NOT NULL,
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  status          text NOT NULL CHECK (status IN ('planned','approved','in_progress','completed','cancelled')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

## OCR Integration

### `ocr` - Shared OCR Schema

#### `ocr.documents`
```sql
CREATE SCHEMA IF NOT EXISTS ocr;

CREATE TABLE ocr.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type   text NOT NULL CHECK (source_type IN ('te_receipt','gear_doc','srm_invoice')),
  source_id     uuid NOT NULL,
  storage_url   text NOT NULL,
  status        text NOT NULL CHECK (status IN ('pending','processing','completed','failed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  error_message text
);

CREATE INDEX idx_ocr_documents_source ON ocr.documents(source_type, source_id);
CREATE INDEX idx_ocr_documents_status ON ocr.documents(status);
```

#### `ocr.extractions`
```sql
CREATE TABLE ocr.extractions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES ocr.documents(id) ON DELETE CASCADE,
  raw_text      text,
  total_amount  numeric(12,2),
  currency      text,
  merchant      text,
  tx_date       date,
  tax_amount    numeric(12,2),
  json_payload  jsonb,
  confidence    numeric(3,2),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ocr_extractions_document ON ocr.extractions(document_id);
```

---

## Analytics Views

### `te.v_cash_advance_overview`
```sql
CREATE VIEW te.v_cash_advance_overview AS
SELECT
  ca.id,
  ca.request_code,
  ca.employee_id,
  e.full_name AS employee_name,
  e.employee_code,
  d.name AS department,
  ca.status,
  ca.requested_amount,
  ca.approved_amount,
  COALESCE(SUM(s.settled_amount), 0) AS settled_amount,
  COALESCE(ca.approved_amount, 0) - COALESCE(SUM(s.settled_amount), 0) AS outstanding_amount,
  ca.disbursed_at,
  CASE 
    WHEN ca.disbursed_at IS NULL THEN NULL
    WHEN ca.status = 'settled' THEN 0
    ELSE EXTRACT(days FROM now() - ca.disbursed_at)::int
  END AS days_outstanding,
  ca.created_at
FROM te.cash_advances ca
LEFT JOIN te.cash_advance_settlements s ON s.cash_advance_id = ca.id
JOIN te.employees e ON e.id = ca.employee_id
LEFT JOIN te.departments d ON d.id = e.department_id
GROUP BY ca.id, e.full_name, e.employee_code, d.name;
```

### `te.v_expense_report_summary`
```sql
CREATE VIEW te.v_expense_report_summary AS
SELECT
  er.id,
  er.report_code,
  er.employee_id,
  e.full_name AS employee_name,
  e.employee_code,
  d.name AS department,
  er.status,
  er.purpose,
  er.period_start,
  er.period_end,
  COUNT(el.id) AS line_count,
  er.total_amount,
  COALESCE(SUM(s.settled_amount), 0) AS cash_advance_applied,
  er.total_amount - COALESCE(SUM(s.settled_amount), 0) AS net_reimbursable,
  er.created_at,
  er.submitted_at,
  er.approved_at
FROM te.expense_reports er
JOIN te.employees e ON e.id = er.employee_id
LEFT JOIN te.departments d ON d.id = e.department_id
LEFT JOIN te.expense_lines el ON el.report_id = er.id
LEFT JOIN te.cash_advance_settlements s ON s.expense_report_id = er.id
GROUP BY er.id, e.full_name, e.employee_code, d.name;
```

### `analytics.v_te_cash_flow`
```sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE VIEW analytics.v_te_cash_flow AS
SELECT
  DATE_TRUNC('month', er.submitted_at) AS period,
  d.name AS department,
  d.id AS department_id,
  COUNT(DISTINCT er.id) AS report_count,
  SUM(er.total_amount) AS total_expenses,
  SUM(COALESCE(ca_settled.settled_amount, 0)) AS total_covered_by_advances,
  SUM(er.total_amount) - SUM(COALESCE(ca_settled.settled_amount, 0)) AS net_reimbursable,
  AVG(er.total_amount) AS avg_report_amount
FROM te.expense_reports er
JOIN te.employees emp ON emp.id = er.employee_id
JOIN te.departments d ON d.id = emp.department_id
LEFT JOIN (
  SELECT 
    expense_report_id, 
    SUM(settled_amount) AS settled_amount
  FROM te.cash_advance_settlements
  GROUP BY expense_report_id
) ca_settled ON ca_settled.expense_report_id = er.id
WHERE er.status IN ('approved', 'paid')
GROUP BY 1, 2, 3
ORDER BY 1 DESC;
```

### `analytics.v_advance_aging`
```sql
CREATE VIEW analytics.v_advance_aging AS
SELECT
  CASE
    WHEN days_outstanding <= 30 THEN '0-30 days'
    WHEN days_outstanding <= 60 THEN '31-60 days'
    WHEN days_outstanding <= 90 THEN '61-90 days'
    ELSE '90+ days'
  END AS aging_bucket,
  COUNT(*) AS advance_count,
  SUM(outstanding_amount) AS total_outstanding
FROM te.v_cash_advance_overview
WHERE status = 'disbursed' AND outstanding_amount > 0
GROUP BY 1
ORDER BY 
  CASE aging_bucket
    WHEN '0-30 days' THEN 1
    WHEN '31-60 days' THEN 2
    WHEN '61-90 days' THEN 3
    ELSE 4
  END;
```

### `analytics.v_category_spend`
```sql
CREATE VIEW analytics.v_category_spend AS
SELECT
  el.category,
  COUNT(*) AS transaction_count,
  SUM(el.amount) AS total_amount,
  AVG(el.amount) AS avg_amount,
  COUNT(DISTINCT er.employee_id) AS unique_employees,
  COUNT(DISTINCT er.id) AS unique_reports
FROM te.expense_lines el
JOIN te.expense_reports er ON er.id = el.report_id
WHERE er.status IN ('approved', 'paid')
GROUP BY el.category
ORDER BY total_amount DESC;
```

---

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE te.expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE te.cash_advances ENABLE ROW LEVEL SECURITY;

-- Employees can see their own reports
CREATE POLICY employee_own_reports ON te.expense_reports
  FOR SELECT
  USING (employee_id = auth.uid());

-- Managers can see their team's reports
CREATE POLICY manager_team_reports ON te.expense_reports
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM te.employees WHERE manager_id = auth.uid()
    )
  );

-- Finance can see all submitted/approved reports
CREATE POLICY finance_all_reports ON te.expense_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM te.employees 
      WHERE id = auth.uid() AND role = 'finance'
    )
    AND status IN ('submitted', 'approved', 'rejected', 'paid')
  );
```

---

## Sample Seed Data

```sql
-- Departments
INSERT INTO te.departments (id, name, code) VALUES
  ('dept-1', 'Sales', 'SALES'),
  ('dept-2', 'Marketing', 'MKT'),
  ('dept-3', 'Operations', 'OPS'),
  ('dept-4', 'Finance', 'FIN');

-- Employees
INSERT INTO te.employees (id, email, full_name, employee_code, department_id, role) VALUES
  ('emp-1', 'maria.santos@company.com', 'Maria Santos', 'EMP001', 'dept-1', 'employee'),
  ('emp-2', 'juan.manager@company.com', 'Juan Manager', 'MGR001', 'dept-1', 'manager'),
  ('emp-3', 'finance@company.com', 'Finance Director', 'FIN001', 'dept-4', 'finance');
```

---

## Migration Order

1. Create schemas: `te`, `ocr`, `analytics`
2. Create core tables: `employees`, `departments`, `cost_centers`
3. Create expense tables: `expense_reports`, `expense_lines`, `receipts`
4. Create cash advance tables: `cash_advances`, `cash_advance_settlements`
5. Create OCR tables: `ocr.documents`, `ocr.extractions`
6. Create views: `v_cash_advance_overview`, `v_expense_report_summary`, analytics views
7. Enable RLS and create policies
8. Seed initial data

---

## Future Extensions

### For Gearroom Integration
- Link `te.expense_lines` to `gear.items` via `gear_item_id` for equipment-related expenses
- Track equipment rental/maintenance costs in T&E

### For SRM Integration
- Link `te.expense_lines` to `srm.purchase_orders` for procurement expenses
- Track vendor payments through T&E system

### For AI RAG Assistant
- Populate `aihub.knowledge_chunks` from:
  - T&E policy documents
  - Spec Kit documentation
  - OCR-extracted receipt data
  - View documentation (e.g., `te.v_cash_flow` usage)
