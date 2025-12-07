# Gearroom Database Schema

## Overview
Cheqroom-style equipment management system with check-out/check-in workflows, maintenance tracking, reservations, and utilization analytics.

---

## Core Schema: `gear`

### `gear.items`
```sql
CREATE SCHEMA IF NOT EXISTS gear;

CREATE TABLE gear.items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code       text UNIQUE NOT NULL,
  name            text NOT NULL,
  category_id     uuid NOT NULL REFERENCES gear.categories(id),
  location_id     uuid NOT NULL REFERENCES gear.locations(id),
  status          text NOT NULL CHECK (status IN ('available','checked_out','in_maintenance','reserved','retired')),
  purchase_date   date,
  purchase_price  numeric(12,2),
  current_value   numeric(12,2),
  serial_number   text,
  manufacturer    text,
  model_number    text,
  description     text,
  image_url       text,
  condition       text CHECK (condition IN ('excellent','good','fair','poor')),
  warranty_expiry date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_items_category ON gear.items(category_id);
CREATE INDEX idx_gear_items_location ON gear.items(location_id);
CREATE INDEX idx_gear_items_status ON gear.items(status);
CREATE INDEX idx_gear_items_code ON gear.items(item_code);
```

### `gear.categories`
```sql
CREATE TABLE gear.categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text UNIQUE NOT NULL,
  parent_id       uuid REFERENCES gear.categories(id),
  description     text,
  icon            text,
  color           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_categories_parent ON gear.categories(parent_id);
```

### `gear.locations`
```sql
CREATE TABLE gear.locations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text UNIQUE NOT NULL,
  location_type   text CHECK (location_type IN ('studio','office','warehouse','external')),
  address         text,
  custodian_id    uuid REFERENCES gear.users(id),
  capacity        int,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_locations_custodian ON gear.locations(custodian_id);
```

### `gear.users`
```sql
CREATE TABLE gear.users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  full_name       text NOT NULL,
  employee_code   text UNIQUE,
  department_id   uuid REFERENCES gear.departments(id),
  role            text NOT NULL CHECK (role IN ('user','custodian','admin')),
  phone           text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_users_department ON gear.users(department_id);
CREATE INDEX idx_gear_users_role ON gear.users(role);
```

### `gear.departments`
```sql
CREATE TABLE gear.departments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text UNIQUE NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

## Check-out/Check-in

### `gear.checkouts`
```sql
CREATE TABLE gear.checkouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         uuid NOT NULL REFERENCES gear.items(id),
  user_id         uuid NOT NULL REFERENCES gear.users(id),
  checked_out_by  uuid NOT NULL REFERENCES gear.users(id),
  checkout_date   date NOT NULL,
  due_date        date NOT NULL,
  return_date     date,
  status          text NOT NULL CHECK (status IN ('active','returned','overdue','cancelled')),
  purpose         text NOT NULL,
  notes           text,
  condition_out   text CHECK (condition_out IN ('excellent','good','fair','poor')),
  condition_in    text CHECK (condition_in IN ('excellent','good','fair','poor')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_checkouts_item ON gear.checkouts(item_id);
CREATE INDEX idx_gear_checkouts_user ON gear.checkouts(user_id);
CREATE INDEX idx_gear_checkouts_status ON gear.checkouts(status);
CREATE INDEX idx_gear_checkouts_due_date ON gear.checkouts(due_date);

-- Trigger to update item status on checkout
CREATE OR REPLACE FUNCTION update_item_on_checkout() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE gear.items SET status = 'checked_out' WHERE id = NEW.item_id;
  ELSIF NEW.status = 'returned' THEN
    UPDATE gear.items SET status = 'available' WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkout_status_trigger
  AFTER INSERT OR UPDATE OF status ON gear.checkouts
  FOR EACH ROW EXECUTE FUNCTION update_item_on_checkout();
```

---

## Reservations

### `gear.reservations`
```sql
CREATE TABLE gear.reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         uuid NOT NULL REFERENCES gear.items(id),
  user_id         uuid NOT NULL REFERENCES gear.users(id),
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  status          text NOT NULL CHECK (status IN ('pending','confirmed','fulfilled','cancelled')),
  purpose         text NOT NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_gear_reservations_item ON gear.reservations(item_id);
CREATE INDEX idx_gear_reservations_user ON gear.reservations(user_id);
CREATE INDEX idx_gear_reservations_dates ON gear.reservations(start_date, end_date);
CREATE INDEX idx_gear_reservations_status ON gear.reservations(status);
```

---

## Deposits (Cash Handling)

### `gear.deposits`
```sql
CREATE TABLE gear.deposits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id     uuid REFERENCES gear.checkouts(id),
  reservation_id  uuid REFERENCES gear.reservations(id),
  user_id         uuid NOT NULL REFERENCES gear.users(id),
  amount          numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'PHP',
  status          text NOT NULL CHECK (status IN ('held','partially_refunded','refunded','forfeited')),
  reason          text,
  received_at     timestamptz NOT NULL DEFAULT now(),
  refunded_at     timestamptz,
  refunded_amount numeric(12,2),
  notes           text,
  
  CONSTRAINT checkout_or_reservation CHECK (
    (checkout_id IS NOT NULL AND reservation_id IS NULL) OR
    (checkout_id IS NULL AND reservation_id IS NOT NULL)
  )
);

CREATE INDEX idx_gear_deposits_checkout ON gear.deposits(checkout_id);
CREATE INDEX idx_gear_deposits_user ON gear.deposits(user_id);
CREATE INDEX idx_gear_deposits_status ON gear.deposits(status);
```

---

## Maintenance

### `gear.maintenance_jobs`
```sql
CREATE TABLE gear.maintenance_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         uuid NOT NULL REFERENCES gear.items(id),
  job_type        text NOT NULL CHECK (job_type IN ('repair','service','inspection','calibration','upgrade')),
  status          text NOT NULL CHECK (status IN ('pending','in_progress','completed','cancelled')),
  severity        text CHECK (severity IN ('low','medium','high','critical')),
  reported_by     uuid REFERENCES gear.users(id),
  assigned_to     uuid REFERENCES gear.users(id),
  vendor_name     text,
  issue_description text NOT NULL,
  resolution      text,
  cost            numeric(12,2),
  started_at      timestamptz,
  completed_at    timestamptz,
  next_service_date date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_maintenance_item ON gear.maintenance_jobs(item_id);
CREATE INDEX idx_gear_maintenance_status ON gear.maintenance_jobs(status);
CREATE INDEX idx_gear_maintenance_severity ON gear.maintenance_jobs(severity);

-- Trigger to update item status when maintenance job starts
CREATE OR REPLACE FUNCTION update_item_on_maintenance() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'in_progress' THEN
    UPDATE gear.items SET status = 'in_maintenance' WHERE id = NEW.item_id;
  ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    UPDATE gear.items SET status = 'available' WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_status_trigger
  AFTER INSERT OR UPDATE OF status ON gear.maintenance_jobs
  FOR EACH ROW EXECUTE FUNCTION update_item_on_maintenance();
```

### `gear.maintenance_history`
```sql
CREATE TABLE gear.maintenance_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         uuid NOT NULL REFERENCES gear.items(id),
  maintenance_job_id uuid REFERENCES gear.maintenance_jobs(id),
  service_date    date NOT NULL,
  service_type    text NOT NULL,
  performed_by    text,
  cost            numeric(12,2),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gear_maintenance_history_item ON gear.maintenance_history(item_id);
```

---

## Kits & Bundles

### `gear.kits`
```sql
CREATE TABLE gear.kits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  kit_code        text UNIQUE NOT NULL,
  description     text,
  category_id     uuid REFERENCES gear.categories(id),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE gear.kit_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id          uuid NOT NULL REFERENCES gear.kits(id) ON DELETE CASCADE,
  item_id         uuid NOT NULL REFERENCES gear.items(id),
  quantity        int NOT NULL DEFAULT 1,
  is_required     boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_kit_item UNIQUE (kit_id, item_id)
);

CREATE INDEX idx_gear_kit_items_kit ON gear.kit_items(kit_id);
CREATE INDEX idx_gear_kit_items_item ON gear.kit_items(item_id);
```

---

## Analytics Views

### `gear.v_utilization`
```sql
CREATE VIEW gear.v_utilization AS
SELECT
  i.id AS item_id,
  i.item_code,
  i.name AS item_name,
  c.name AS category,
  l.name AS location,
  i.status,
  COUNT(DISTINCT co.id) AS total_checkouts,
  SUM(CASE WHEN co.return_date IS NOT NULL 
    THEN EXTRACT(days FROM co.return_date - co.checkout_date)
    ELSE EXTRACT(days FROM CURRENT_DATE - co.checkout_date)
  END) AS total_days_checked_out,
  ROUND(
    SUM(CASE WHEN co.return_date IS NOT NULL 
      THEN EXTRACT(days FROM co.return_date - co.checkout_date)
      ELSE EXTRACT(days FROM CURRENT_DATE - co.checkout_date)
    END) / NULLIF(EXTRACT(days FROM CURRENT_DATE - i.created_at), 0) * 100,
    2
  ) AS utilization_percent,
  MAX(co.checkout_date) AS last_checkout_date,
  i.current_value
FROM gear.items i
LEFT JOIN gear.checkouts co ON co.item_id = i.id
JOIN gear.categories c ON c.id = i.category_id
JOIN gear.locations l ON l.id = i.location_id
GROUP BY i.id, c.name, l.name;
```

### `gear.v_overdue_checkouts`
```sql
CREATE VIEW gear.v_overdue_checkouts AS
SELECT
  co.id AS checkout_id,
  i.item_code,
  i.name AS item_name,
  u.full_name AS checked_out_to,
  co.checkout_date,
  co.due_date,
  EXTRACT(days FROM CURRENT_DATE - co.due_date)::int AS days_overdue,
  co.purpose,
  d.amount AS deposit_amount,
  d.status AS deposit_status
FROM gear.checkouts co
JOIN gear.items i ON i.id = co.item_id
JOIN gear.users u ON u.id = co.user_id
LEFT JOIN gear.deposits d ON d.checkout_id = co.id
WHERE co.status = 'active' AND co.due_date < CURRENT_DATE
ORDER BY co.due_date ASC;
```

### `gear.v_maintenance_summary`
```sql
CREATE VIEW gear.v_maintenance_summary AS
SELECT
  i.id AS item_id,
  i.item_code,
  i.name AS item_name,
  c.name AS category,
  COUNT(DISTINCT mj.id) AS total_maintenance_jobs,
  SUM(mj.cost) AS total_maintenance_cost,
  MAX(mj.completed_at) AS last_service_date,
  MIN(CASE WHEN mj.status = 'pending' THEN mj.severity END) AS pending_severity,
  COUNT(CASE WHEN mj.status IN ('pending','in_progress') THEN 1 END) AS open_jobs
FROM gear.items i
JOIN gear.categories c ON c.id = i.category_id
LEFT JOIN gear.maintenance_jobs mj ON mj.item_id = i.id
GROUP BY i.id, c.name;
```

### `analytics.v_gear_utilization_cost`
```sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE VIEW analytics.v_gear_utilization_cost AS
SELECT
  c.name AS category,
  COUNT(DISTINCT i.id) AS total_items,
  SUM(i.current_value) AS total_value,
  AVG(vu.utilization_percent) AS avg_utilization,
  SUM(ms.total_maintenance_cost) AS total_maintenance_cost,
  ROUND(
    SUM(ms.total_maintenance_cost) / NULLIF(SUM(i.current_value), 0) * 100,
    2
  ) AS maintenance_to_value_ratio
FROM gear.items i
JOIN gear.categories c ON c.id = i.category_id
LEFT JOIN gear.v_utilization vu ON vu.item_id = i.id
LEFT JOIN gear.v_maintenance_summary ms ON ms.item_id = i.id
WHERE i.status != 'retired'
GROUP BY c.name
ORDER BY total_value DESC;
```

### `gear.v_user_checkout_history`
```sql
CREATE VIEW gear.v_user_checkout_history AS
SELECT
  u.id AS user_id,
  u.full_name,
  u.department_id,
  d.name AS department,
  COUNT(DISTINCT co.id) AS total_checkouts,
  COUNT(CASE WHEN co.status = 'active' THEN 1 END) AS current_checkouts,
  COUNT(CASE WHEN co.status = 'overdue' THEN 1 END) AS overdue_checkouts,
  SUM(CASE WHEN co.return_date > co.due_date THEN 1 ELSE 0 END) AS late_returns,
  AVG(CASE WHEN co.return_date IS NOT NULL 
    THEN EXTRACT(days FROM co.return_date - co.checkout_date)
  END) AS avg_checkout_duration_days
FROM gear.users u
JOIN gear.departments d ON d.id = u.department_id
LEFT JOIN gear.checkouts co ON co.user_id = u.id
GROUP BY u.id, d.name;
```

---

## Integration with T&E

### Link Equipment to Expense Reports

```sql
-- Add gear_item_id to T&E expense lines
ALTER TABLE te.expense_lines ADD COLUMN gear_item_id uuid REFERENCES gear.items(id);
CREATE INDEX idx_te_expense_lines_gear_item ON te.expense_lines(gear_item_id);

-- Track equipment-related expenses
CREATE VIEW analytics.v_gear_expense_tracking AS
SELECT
  i.id AS item_id,
  i.item_code,
  i.name AS item_name,
  c.name AS category,
  COUNT(DISTINCT el.id) AS expense_count,
  SUM(el.amount) AS total_expenses,
  STRING_AGG(DISTINCT el.category, ', ') AS expense_categories
FROM gear.items i
JOIN gear.categories c ON c.id = i.category_id
LEFT JOIN te.expense_lines el ON el.gear_item_id = i.id
GROUP BY i.id, c.name;
```

---

## Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE gear.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear.checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear.reservations ENABLE ROW LEVEL SECURITY;

-- Users can view all items
CREATE POLICY view_items ON gear.items
  FOR SELECT
  USING (true);

-- Users can only see their own checkouts (unless custodian/admin)
CREATE POLICY view_own_checkouts ON gear.checkouts
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM gear.users 
      WHERE id = auth.uid() AND role IN ('custodian', 'admin')
    )
  );

-- Only custodians and admins can create checkouts
CREATE POLICY create_checkouts ON gear.checkouts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gear.users 
      WHERE id = auth.uid() AND role IN ('custodian', 'admin')
    )
  );
```

---

## Sample Seed Data

```sql
-- Categories
INSERT INTO gear.categories (id, name, code) VALUES
  ('cat-1', 'Cameras', 'CAM'),
  ('cat-2', 'Lighting', 'LGT'),
  ('cat-3', 'Audio', 'AUD'),
  ('cat-4', 'Computers', 'COMP'),
  ('cat-5', 'Accessories', 'ACC');

-- Locations
INSERT INTO gear.locations (id, name, code, location_type) VALUES
  ('loc-1', 'Main Studio', 'STUDIO-01', 'studio'),
  ('loc-2', 'Edit Suite', 'EDIT-01', 'office'),
  ('loc-3', 'Equipment Warehouse', 'WAREHOUSE', 'warehouse'),
  ('loc-4', 'Lighting Room', 'LIGHT-01', 'studio');

-- Departments
INSERT INTO gear.departments (id, name, code) VALUES
  ('dept-1', 'Creative', 'CRE'),
  ('dept-2', 'Production', 'PROD'),
  ('dept-3', 'Operations', 'OPS');

-- Users
INSERT INTO gear.users (id, email, full_name, employee_code, department_id, role) VALUES
  ('user-1', 'user@company.com', 'Regular User', 'EMP001', 'dept-1', 'user'),
  ('user-2', 'custodian@company.com', 'Equipment Custodian', 'CUST001', 'dept-3', 'custodian'),
  ('user-3', 'admin@company.com', 'Gear Admin', 'ADMIN001', 'dept-3', 'admin');

-- Sample Items
INSERT INTO gear.items (id, item_code, name, category_id, location_id, status, purchase_date, purchase_price, current_value, serial_number) VALUES
  ('item-1', 'CAM-045', 'Canon EOS R5', 'cat-1', 'loc-1', 'available', '2024-03-15', 185000, 165000, 'CR5-2024-0045'),
  ('item-2', 'CAM-023', 'Sony A7 III', 'cat-1', 'loc-1', 'checked_out', '2023-08-10', 95000, 75000, 'SA7-2023-0023'),
  ('item-3', 'COMP-012', 'MacBook Pro 16"', 'cat-4', 'loc-2', 'checked_out', '2024-01-20', 145000, 125000, 'MBP-2024-0012');
```

---

## Migration Order

1. Create `gear` schema
2. Create core tables: `categories`, `locations`, `departments`, `users`
3. Create `items` table
4. Create checkout/reservation tables: `checkouts`, `reservations`, `deposits`
5. Create maintenance tables: `maintenance_jobs`, `maintenance_history`
6. Create kit tables: `kits`, `kit_items`
7. Create triggers for status updates
8. Create analytics views
9. Enable RLS and create policies
10. Seed initial data

---

## Future Extensions

### AI RAG Integration
- Populate `aihub.knowledge_chunks` with:
  - Equipment manuals/specs
  - Maintenance history summaries
  - Usage guidelines per category
  - OCR-extracted maintenance invoices

### OCR for Maintenance Docs
- Link `gear.maintenance_jobs` to `ocr.documents`
- Extract vendor, cost, service date from invoices
- Auto-populate maintenance records

### Mobile App Features
- QR code scanning for quick checkout
- Mobile camera for condition photos (before/after)
- Push notifications for overdue items

### Advanced Analytics
- Predictive maintenance (ML on maintenance history)
- Cost-per-use calculations
- ROI tracking per item
- Utilization heatmaps by time/location
