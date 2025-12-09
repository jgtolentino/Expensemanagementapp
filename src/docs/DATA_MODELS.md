# TBWA Agency Databank - Data Models (Odoo CE/OCA 18 Compliant)

This document defines all 18 core tables following Odoo CE/OCA 18 naming conventions and data model standards.

## Standard Odoo Fields (Applied to All Tables)

Every table includes these standard Odoo fields:

```sql
-- Identity & Tenancy
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(256) NOT NULL, -- human-readable name/title
active BOOLEAN DEFAULT TRUE, -- soft delete flag

-- Multi-tenancy (Odoo res.company equivalent)
company_id UUID REFERENCES res_company(id), -- tenant_id
workspace_id UUID, -- user workspace context

-- Audit trail (Odoo standard)
create_uid UUID REFERENCES res_users(id), -- creator
create_date TIMESTAMP DEFAULT NOW(),
write_uid UUID REFERENCES res_users(id), -- last modifier
write_date TIMESTAMP DEFAULT NOW(),

-- Workflow state (when applicable)
state VARCHAR(50), -- workflow status
```

---

## 1. res_company (Tenants)

Multi-tenancy foundation. Maps to Odoo `res.company`.

```sql
CREATE TABLE res_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  
  -- Company details
  legal_name VARCHAR(256),
  tax_id VARCHAR(50), -- TIN/VAT number
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Contact
  email VARCHAR(256),
  phone VARCHAR(50),
  website VARCHAR(256),
  
  -- Address
  street VARCHAR(256),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(2), -- ISO country code
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- hex color
  
  -- Settings
  fiscal_year_end VARCHAR(5), -- MM-DD
  date_format VARCHAR(20),
  timezone VARCHAR(50),
  
  -- Odoo standard
  create_uid UUID,
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID,
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_active ON res_company(active);
CREATE INDEX idx_company_name ON res_company(name);
```

---

## 2. res_users (Users)

User accounts. Maps to Odoo `res.users`.

```sql
CREATE TABLE res_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Authentication
  email VARCHAR(256) NOT NULL UNIQUE,
  password_hash TEXT, -- hashed password
  auth_provider VARCHAR(50), -- 'local', 'google', 'microsoft'
  external_id VARCHAR(256), -- provider user ID
  
  -- Profile
  full_name VARCHAR(256),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  title VARCHAR(100), -- job title
  department VARCHAR(100),
  
  -- Role
  role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'employee', 'finance'
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  company_ids UUID[], -- multi-company access
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Preferences
  language VARCHAR(5) DEFAULT 'en',
  timezone VARCHAR(50),
  date_format VARCHAR(20),
  
  -- Odoo standard
  create_uid UUID,
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID,
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON res_users(email);
CREATE INDEX idx_users_company ON res_users(company_id);
CREATE INDEX idx_users_active ON res_users(active, is_active);
CREATE INDEX idx_users_role ON res_users(role);
```

---

## 3. project_project (Projects - PPM)

Project management. Maps to Odoo `project.project`.

```sql
CREATE TABLE project_project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Basic info
  code VARCHAR(50) UNIQUE, -- project code (auto-generated)
  description TEXT,
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, planning, in_progress, on_hold, completed, cancelled
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Dates
  start_date DATE,
  end_date DATE,
  baseline_start_date DATE,
  baseline_end_date DATE,
  
  -- Team
  project_manager_id UUID REFERENCES res_users(id),
  team_ids UUID[], -- assigned team members
  
  -- Client
  client_id UUID REFERENCES res_partner(id),
  client_contact_id UUID REFERENCES res_partner(id),
  
  -- Financial
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Progress
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Settings
  use_tasks BOOLEAN DEFAULT TRUE,
  use_timesheets BOOLEAN DEFAULT TRUE,
  allow_billable BOOLEAN DEFAULT TRUE,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  tags VARCHAR(50)[],
  color VARCHAR(7),
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_state ON project_project(state);
CREATE INDEX idx_project_company ON project_project(company_id);
CREATE INDEX idx_project_manager ON project_project(project_manager_id);
CREATE INDEX idx_project_dates ON project_project(start_date, end_date);
CREATE INDEX idx_project_client ON project_project(client_id);
```

---

## 4. project_task (Tasks - PPM)

WBS tasks with dependencies. Maps to Odoo `project.task`.

```sql
CREATE TABLE project_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Hierarchy
  project_id UUID REFERENCES project_project(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_task(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_task(id), -- parent phase
  wbs_code VARCHAR(50), -- e.g., "1.2.3"
  
  -- Type (Clarity-style)
  task_type VARCHAR(20) DEFAULT 'task', -- phase, milestone, task
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, at_risk, on_hold, cancelled
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- Dates
  start_date DATE,
  end_date DATE,
  duration INTEGER, -- in days
  baseline_start_date DATE,
  baseline_end_date DATE,
  
  -- Assignment
  owner_id UUID REFERENCES res_users(id),
  assignee_ids UUID[], -- assigned resources
  role_ids UUID[], -- assigned roles
  team_id UUID,
  
  -- Work tracking (Clarity ETC/Actuals)
  estimated_hours DECIMAL(10,2),
  etc DECIMAL(10,2), -- Estimate To Complete
  actual_hours DECIMAL(10,2) DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Critical path
  critical BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  
  -- Description
  description TEXT,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  sequence INTEGER DEFAULT 0,
  color VARCHAR(7),
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_task_project ON project_task(project_id);
CREATE INDEX idx_task_parent ON project_task(parent_id);
CREATE INDEX idx_task_state ON project_task(state);
CREATE INDEX idx_task_dates ON project_task(start_date, end_date);
CREATE INDEX idx_task_owner ON project_task(owner_id);
CREATE INDEX idx_task_critical ON project_task(critical);
CREATE INDEX idx_task_wbs ON project_task(wbs_code);
```

---

## 5. project_task_dependency (Task Dependencies - PPM)

Task relationships. Custom table for Clarity-style dependencies.

```sql
CREATE TABLE project_task_dependency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship
  predecessor_id UUID REFERENCES project_task(id) ON DELETE CASCADE,
  successor_id UUID REFERENCES project_task(id) ON DELETE CASCADE,
  
  -- Dependency type
  dependency_type VARCHAR(20) DEFAULT 'finish_start', -- finish_start, start_start, finish_finish, start_finish
  lag INTEGER DEFAULT 0, -- lag in days (negative = lead time)
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(predecessor_id, successor_id)
);

CREATE INDEX idx_dependency_predecessor ON project_task_dependency(predecessor_id);
CREATE INDEX idx_dependency_successor ON project_task_dependency(successor_id);
```

---

## 6. hr_expense (Expense Reports - T&E)

Expense management. Maps to Odoo `hr.expense`.

```sql
CREATE TABLE hr_expense (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, -- expense line name
  active BOOLEAN DEFAULT TRUE,
  
  -- Expense details
  expense_report_id UUID REFERENCES hr_expense_sheet(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL, -- airfare, meals, etc.
  merchant VARCHAR(256),
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Description
  description TEXT,
  
  -- Receipt
  receipt_url TEXT,
  receipt_attached BOOLEAN DEFAULT FALSE,
  
  -- Payment
  payment_method VARCHAR(50), -- corporate_card, personal_card, cash
  
  -- Policy compliance
  policy_compliant BOOLEAN DEFAULT TRUE,
  policy_violation_reason TEXT,
  compliance_status VARCHAR(20) DEFAULT 'compliant', -- compliant, warning, violation
  
  -- Mileage (if applicable)
  mileage DECIMAL(10,2),
  mileage_rate DECIMAL(10,2),
  from_location VARCHAR(256),
  to_location VARCHAR(256),
  vehicle_type VARCHAR(20), -- personal, company, rental
  
  -- Project allocation
  project_id UUID REFERENCES project_project(id),
  task_id UUID REFERENCES project_task(id),
  analytic_account_id UUID,
  
  -- Tax
  tax_amount DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2),
  vat_recoverable BOOLEAN DEFAULT FALSE,
  
  -- Employee
  employee_id UUID REFERENCES res_users(id),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Odoo standard
  state VARCHAR(50) DEFAULT 'draft',
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expense_report ON hr_expense(expense_report_id);
CREATE INDEX idx_expense_employee ON hr_expense(employee_id);
CREATE INDEX idx_expense_date ON hr_expense(date);
CREATE INDEX idx_expense_category ON hr_expense(category);
CREATE INDEX idx_expense_project ON hr_expense(project_id);
```

---

## 7. hr_expense_sheet (Expense Report Header - T&E)

Expense report submission. Maps to Odoo `hr.expense.sheet`.

```sql
CREATE TABLE hr_expense_sheet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, -- report name/purpose
  active BOOLEAN DEFAULT TRUE,
  
  -- Report details
  code VARCHAR(50) UNIQUE, -- auto-generated: EXP-2024-001
  purpose TEXT NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, submitted, pending_approval, approved, rejected, paid
  
  -- Employee
  employee_id UUID REFERENCES res_users(id),
  employee_name VARCHAR(256),
  department_id UUID,
  manager_id UUID REFERENCES res_users(id), -- approver
  
  -- Financial
  total_amount DECIMAL(15,2) DEFAULT 0 CHECK (total_amount >= 0),
  advance_amount DECIMAL(15,2) DEFAULT 0 CHECK (advance_amount >= 0),
  net_reimbursable DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Cash advance settlement
  cash_advance_id UUID REFERENCES hr_cash_advance(id),
  
  -- Policy
  policy_violations INTEGER DEFAULT 0,
  
  -- Dates
  submit_date TIMESTAMP,
  approval_date TIMESTAMP,
  payment_date TIMESTAMP,
  
  -- Approver
  approver_id UUID REFERENCES res_users(id),
  
  -- Comments
  comments TEXT[],
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expense_sheet_state ON hr_expense_sheet(state);
CREATE INDEX idx_expense_sheet_employee ON hr_expense_sheet(employee_id);
CREATE INDEX idx_expense_sheet_period ON hr_expense_sheet(period_start, period_end);
CREATE INDEX idx_expense_sheet_advance ON hr_expense_sheet(cash_advance_id);
CREATE INDEX idx_expense_sheet_company ON hr_expense_sheet(company_id);
```

---

## 8. hr_cash_advance (Cash Advances - T&E)

Travel advance requests. Custom table following Odoo patterns.

```sql
CREATE TABLE hr_cash_advance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, -- request purpose
  active BOOLEAN DEFAULT TRUE,
  
  -- Request details
  code VARCHAR(50) UNIQUE, -- auto-generated: CA-2024-001
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected, disbursed, settled
  
  -- Employee
  employee_id UUID REFERENCES res_users(id),
  employee_name VARCHAR(256),
  department_id UUID,
  manager_id UUID REFERENCES res_users(id),
  
  -- Financial
  requested_amount DECIMAL(15,2) NOT NULL CHECK (requested_amount > 0),
  approved_amount DECIMAL(15,2) CHECK (approved_amount >= 0),
  settled_amount DECIMAL(15,2) DEFAULT 0,
  outstanding_amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Trip details
  needed_date DATE NOT NULL,
  trip_start_date DATE NOT NULL,
  trip_end_date DATE NOT NULL,
  destination VARCHAR(256),
  
  -- Breakdown
  estimated_airfare DECIMAL(15,2),
  estimated_accommodation DECIMAL(15,2),
  estimated_meals DECIMAL(15,2),
  estimated_other DECIMAL(15,2),
  justification TEXT,
  
  -- Dates
  submit_date TIMESTAMP,
  approval_date TIMESTAMP,
  disbursement_date TIMESTAMP,
  settlement_date TIMESTAMP,
  
  -- Approver
  approver_id UUID REFERENCES res_users(id),
  
  -- Settlement
  settlement_report_id UUID REFERENCES hr_expense_sheet(id),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cash_advance_state ON hr_cash_advance(state);
CREATE INDEX idx_cash_advance_employee ON hr_cash_advance(employee_id);
CREATE INDEX idx_cash_advance_trip ON hr_cash_advance(trip_start_date);
CREATE INDEX idx_cash_advance_outstanding ON hr_cash_advance(outstanding_amount) WHERE outstanding_amount > 0;
```

---

## 9. sale_order (Quotes - Rate Card Pro)

Sales quotations. Maps to Odoo `sale.order`.

```sql
CREATE TABLE sale_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, -- quote name
  active BOOLEAN DEFAULT TRUE,
  
  -- Order details
  code VARCHAR(50) UNIQUE, -- auto-generated: QT-2024-001
  
  -- Workflow (dual-role AM → FD)
  state VARCHAR(50) DEFAULT 'draft', -- draft, sent, pending_am, pending_fd, approved, rejected, won, lost
  
  -- Client
  partner_id UUID REFERENCES res_partner(id), -- client
  partner_contact_id UUID REFERENCES res_partner(id),
  
  -- Dates
  quote_date DATE DEFAULT CURRENT_DATE,
  validity_date DATE NOT NULL, -- valid until
  expected_close_date DATE,
  
  -- Ownership
  account_manager_id UUID REFERENCES res_users(id),
  sales_team_id UUID,
  
  -- Project
  project_id UUID REFERENCES project_project(id),
  opportunity_id UUID,
  
  -- Financial
  subtotal DECIMAL(15,2) DEFAULT 0,
  total_discount DECIMAL(15,2) DEFAULT 0,
  total_tax DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Probability (forecast)
  probability DECIMAL(5,2) CHECK (probability >= 0 AND probability <= 100),
  
  -- Terms
  payment_terms TEXT,
  delivery_terms TEXT,
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_quote_id UUID REFERENCES sale_order(id),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sale_order_state ON sale_order(state);
CREATE INDEX idx_sale_order_partner ON sale_order(partner_id);
CREATE INDEX idx_sale_order_am ON sale_order(account_manager_id);
CREATE INDEX idx_sale_order_dates ON sale_order(quote_date, validity_date);
CREATE INDEX idx_sale_order_company ON sale_order(company_id);
```

---

## 10. sale_order_line (Quote Lines - Rate Card Pro)

Quote line items. Maps to Odoo `sale.order.line`.

```sql
CREATE TABLE sale_order_line (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Quote
  order_id UUID REFERENCES sale_order(id) ON DELETE CASCADE,
  
  -- Product/Service
  description TEXT,
  line_type VARCHAR(20) DEFAULT 'service', -- service, product, media, production, talent, markup, discount
  pricing_model VARCHAR(20) DEFAULT 'fixed', -- fixed, hourly, daily, monthly, unit, percentage
  
  -- Pricing
  quantity DECIMAL(15,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  cost_price DECIMAL(15,2),
  margin DECIMAL(5,2), -- margin %
  discount DECIMAL(5,2), -- discount %
  
  -- Tax
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  taxable BOOLEAN DEFAULT TRUE,
  
  -- Total
  subtotal DECIMAL(15,2), -- quantity * unit_price
  total DECIMAL(15,2), -- subtotal - discount + tax
  
  -- Project allocation
  project_id UUID REFERENCES project_project(id),
  task_id UUID REFERENCES project_task(id),
  phase_id UUID REFERENCES project_task(id),
  
  -- Resources
  resource_id UUID REFERENCES res_users(id),
  role_id UUID,
  supplier_id UUID REFERENCES res_partner(id),
  
  -- Hierarchy
  parent_line_id UUID REFERENCES sale_order_line(id),
  sequence INTEGER DEFAULT 0,
  
  -- Rate card reference
  rate_card_id UUID REFERENCES product_pricelist_item(id),
  
  -- Notes
  notes TEXT,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sale_line_order ON sale_order_line(order_id);
CREATE INDEX idx_sale_line_project ON sale_order_line(project_id);
CREATE INDEX idx_sale_line_sequence ON sale_order_line(order_id, sequence);
```

---

## 11. product_pricelist_item (Rate Cards - Rate Card Pro)

Standard pricing. Maps to Odoo `product.pricelist.item`.

```sql
CREATE TABLE product_pricelist_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Rate details
  line_type VARCHAR(20), -- service, product, etc.
  pricing_model VARCHAR(20), -- fixed, hourly, etc.
  standard_rate DECIMAL(15,2) NOT NULL CHECK (standard_rate >= 0),
  cost_rate DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Description
  description TEXT,
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  
  -- Client/Industry specific
  partner_id UUID REFERENCES res_partner(id), -- client-specific
  industry_id UUID,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Markup rules
  agency_markup DECIMAL(5,2), -- % markup
  minimum_margin DECIMAL(5,2), -- % margin
  
  -- Quantity constraints
  minimum_quantity DECIMAL(15,2),
  maximum_quantity DECIMAL(15,2),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Metadata
  category VARCHAR(100),
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_card_type ON product_pricelist_item(line_type);
CREATE INDEX idx_rate_card_validity ON product_pricelist_item(valid_from, valid_until);
CREATE INDEX idx_rate_card_partner ON product_pricelist_item(partner_id);
CREATE INDEX idx_rate_card_default ON product_pricelist_item(is_default) WHERE is_default = TRUE;
```

---

## 12. stock_equipment (Equipment - Gearroom)

Equipment inventory. Maps to Odoo `stock.equipment` (or custom).

```sql
CREATE TABLE stock_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Equipment details
  code VARCHAR(50) UNIQUE,
  category VARCHAR(100), -- camera, lighting, audio, etc.
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'available', -- available, checked_out, maintenance, retired
  
  -- Location
  location VARCHAR(256),
  warehouse_id UUID,
  
  -- Financial
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  current_value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER,
  
  -- Checkout
  checked_out_by UUID REFERENCES res_users(id),
  checkout_date TIMESTAMP,
  due_date TIMESTAMP,
  
  -- Tracking
  total_checkouts INTEGER DEFAULT 0,
  utilization_rate DECIMAL(5,2), -- % time checked out
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  image_url TEXT,
  description TEXT,
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_equipment_state ON stock_equipment(state);
CREATE INDEX idx_equipment_category ON stock_equipment(category);
CREATE INDEX idx_equipment_checkout ON stock_equipment(checked_out_by);
CREATE INDEX idx_equipment_maintenance ON stock_equipment(next_maintenance_date);
```

---

## 13. purchase_order (Purchase Orders - Procure)

Procurement. Maps to Odoo `purchase.order`.

```sql
CREATE TABLE purchase_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- PO details
  code VARCHAR(50) UNIQUE, -- PO-2024-001
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, ordered, received, cancelled
  
  -- Supplier
  partner_id UUID REFERENCES res_partner(id),
  partner_contact_id UUID REFERENCES res_partner(id),
  
  -- Dates
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  
  -- Requester
  requester_id UUID REFERENCES res_users(id),
  approver_id UUID REFERENCES res_users(id),
  
  -- Financial
  total_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Project allocation
  project_id UUID REFERENCES project_project(id),
  cost_center_id UUID,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_po_state ON purchase_order(state);
CREATE INDEX idx_po_supplier ON purchase_order(partner_id);
CREATE INDEX idx_po_project ON purchase_order(project_id);
```

---

## 14. res_partner (Clients/Suppliers)

Business partners. Maps to Odoo `res.partner`.

```sql
CREATE TABLE res_partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Type
  partner_type VARCHAR(20) DEFAULT 'client', -- client, supplier, both
  is_company BOOLEAN DEFAULT TRUE,
  
  -- Contact
  email VARCHAR(256),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  website VARCHAR(256),
  
  -- Address
  street VARCHAR(256),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(2),
  
  -- Tax
  tax_id VARCHAR(50), -- TIN/VAT
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Metadata
  industry VARCHAR(100),
  tags VARCHAR(50)[],
  notes TEXT,
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_partner_type ON res_partner(partner_type);
CREATE INDEX idx_partner_name ON res_partner(name);
CREATE INDEX idx_partner_company ON res_partner(company_id);
```

---

## 15. wiki_page (Wiki/Docs)

Knowledge base. Custom table following Odoo patterns.

```sql
CREATE TABLE wiki_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, -- page title
  active BOOLEAN DEFAULT TRUE,
  
  -- Content
  content TEXT, -- rich text/markdown
  summary TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES wiki_page(id),
  workspace_id UUID,
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  
  -- Author
  author_id UUID REFERENCES res_users(id),
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  allowed_user_ids UUID[],
  allowed_group_ids UUID[],
  
  -- Versioning
  version INTEGER DEFAULT 1,
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Metadata
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wiki_parent ON wiki_page(parent_id);
CREATE INDEX idx_wiki_author ON wiki_page(author_id);
CREATE INDEX idx_wiki_state ON wiki_page(state);
CREATE INDEX idx_wiki_search ON wiki_page USING gin(to_tsvector('english', name || ' ' || COALESCE(content, '')));
```

---

## 16. creative_asset (Creative Workroom)

Creative assets. Custom table.

```sql
CREATE TABLE creative_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Asset details
  asset_type VARCHAR(50), -- image, video, pdf, etc.
  file_url TEXT NOT NULL,
  file_size BIGINT, -- bytes
  mime_type VARCHAR(100),
  
  -- Project
  project_id UUID REFERENCES project_project(id),
  campaign_id UUID,
  
  -- Workflow
  state VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, final
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_asset_id UUID REFERENCES creative_asset(id),
  
  -- Owner
  owner_id UUID REFERENCES res_users(id),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  tags VARCHAR(50)[],
  description TEXT,
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_project ON creative_asset(project_id);
CREATE INDEX idx_asset_type ON creative_asset(asset_type);
CREATE INDEX idx_asset_state ON creative_asset(state);
```

---

## 17. bi_dashboard (Business Intelligence)

BI dashboards. Custom table.

```sql
CREATE TABLE bi_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  -- Dashboard details
  description TEXT,
  dashboard_type VARCHAR(50), -- executive, finance, operations, custom
  
  -- Layout
  layout_config JSONB, -- widget positions and configurations
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  allowed_user_ids UUID[],
  allowed_role_ids VARCHAR(50)[],
  
  -- Owner
  owner_id UUID REFERENCES res_users(id),
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  workspace_id UUID,
  
  -- Metadata
  tags VARCHAR(50)[],
  
  -- Odoo standard
  create_uid UUID REFERENCES res_users(id),
  create_date TIMESTAMP DEFAULT NOW(),
  write_uid UUID REFERENCES res_users(id),
  write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dashboard_owner ON bi_dashboard(owner_id);
CREATE INDEX idx_dashboard_type ON bi_dashboard(dashboard_type);
```

---

## 18. mail_message (Chatter/Comments)

Activity feed. Maps to Odoo `mail.message`.

```sql
CREATE TABLE mail_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target record (polymorphic)
  model VARCHAR(100) NOT NULL, -- 'project.task', 'hr.expense.sheet', etc.
  res_id UUID NOT NULL, -- ID of the target record
  
  -- Message details
  subject VARCHAR(256),
  body TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'comment', -- email, comment, notification
  
  -- Author
  author_id UUID REFERENCES res_users(id),
  author_name VARCHAR(256),
  author_email VARCHAR(256),
  
  -- Parent message (for threading)
  parent_id UUID REFERENCES mail_message(id),
  
  -- Recipients
  partner_ids UUID[], -- notified partners
  
  -- Attachments
  attachment_ids UUID[],
  
  -- Multi-tenancy
  company_id UUID REFERENCES res_company(id),
  
  -- Odoo standard
  create_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_model_res ON mail_message(model, res_id);
CREATE INDEX idx_message_author ON mail_message(author_id);
CREATE INDEX idx_message_parent ON mail_message(parent_id);
CREATE INDEX idx_message_created ON mail_message(create_date DESC);
```

---

## Materialized Views (Analytics)

### mv_project_metrics

```sql
CREATE MATERIALIZED VIEW mv_project_metrics AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.state,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.state = 'completed') AS completed_tasks,
  AVG(t.progress) AS avg_progress,
  SUM(t.actual_hours) AS total_hours,
  p.budget,
  p.spent,
  (p.spent / NULLIF(p.budget, 0) * 100) AS budget_utilization
FROM project_project p
LEFT JOIN project_task t ON t.project_id = p.id
WHERE p.active = TRUE
GROUP BY p.id;

CREATE UNIQUE INDEX ON mv_project_metrics(project_id);
```

### mv_expense_summary

```sql
CREATE MATERIALIZED VIEW mv_expense_summary AS
SELECT 
  DATE_TRUNC('month', e.date) AS month,
  e.employee_id,
  e.category,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount,
  SUM(CASE WHEN e.policy_compliant = FALSE THEN 1 ELSE 0 END) AS violations
FROM hr_expense e
WHERE e.active = TRUE
GROUP BY DATE_TRUNC('month', e.date), e.employee_id, e.category;

CREATE INDEX ON mv_expense_summary(month, employee_id);
```

---

## Constraints & Business Rules

1. **Check Constraints**
   - All amounts >= 0
   - Progress between 0-100
   - Valid state transitions
   - Date ranges (start < end)

2. **Foreign Keys**
   - CASCADE on child records
   - SET NULL on optional references
   - RESTRICT on critical references

3. **Unique Constraints**
   - Code fields (auto-generated)
   - Email (users)
   - Name+Company (certain tables)

4. **Triggers**
   - `write_date` auto-update on UPDATE
   - Code auto-generation
   - Audit trail creation
   - State transition validation

---

## Next Steps

1. Apply schema to Supabase
2. Create RLS policies
3. Build indexes per `INDEX_PLAN.md`
4. Set up materialized view refresh schedules
5. Create API endpoints using validation schemas
6. Implement state machine for workflows
