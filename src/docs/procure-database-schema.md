# Procure Database Schema

## Overview
SAP SRM-style vendor rate governance system for advertising agencies with AI-powered rate suggestions, role-based visibility (Account Manager vs Finance Director), and project quote management.

---

## Business Context

**Key Roles:**
- **Account Managers/Coordinators (AM/COOR)**: Build client quotes, see only client-facing rates
- **Finance Directors (FD)**: See vendor names, internal costs, margins, approve rates

**Core Concept:**
- Rate cards define vendor/consultant costs and client rates
- Strict role-based visibility (AM never sees costs/vendors)
- AI Rate Advisor suggests reasonable & customary rates
- FD approval required before client presentation

---

## Core Schema: `procure`

### `procure.rate_cards`
```sql
CREATE SCHEMA IF NOT EXISTS procure;

CREATE TABLE procure.rate_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  role_id         uuid REFERENCES hr.jobs(id),
  role_name       text NOT NULL,
  discipline      text NOT NULL CHECK (discipline IN ('strategy','creative','production','post','digital','social','media','other')),
  seniority_level text NOT NULL CHECK (seniority_level IN ('junior','mid','senior','director','executive')),
  market          text NOT NULL,
  vendor_id       uuid REFERENCES procure.vendors(id),
  product_id      uuid REFERENCES product.product(id),
  unit_of_measure text NOT NULL CHECK (unit_of_measure IN ('day','hour','project')),
  cost_rate       numeric(12,2) NOT NULL,
  client_rate     numeric(12,2) NOT NULL,
  margin_pct      numeric(5,2) GENERATED ALWAYS AS ((client_rate - cost_rate) / NULLIF(client_rate, 0) * 100) STORED,
  currency        text NOT NULL DEFAULT 'PHP',
  state           text NOT NULL CHECK (state IN ('draft','active','archived')),
  effective_from  date,
  effective_to    date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_rate_card UNIQUE (role_id, seniority_level, discipline, market, vendor_id, unit_of_measure, effective_from)
);

CREATE INDEX idx_rate_cards_role ON procure.rate_cards(role_id);
CREATE INDEX idx_rate_cards_discipline ON procure.rate_cards(discipline);
CREATE INDEX idx_rate_cards_vendor ON procure.rate_cards(vendor_id);
CREATE INDEX idx_rate_cards_state ON procure.rate_cards(state);
CREATE INDEX idx_rate_cards_market ON procure.rate_cards(market);
```

### `procure.vendors`
```sql
CREATE TABLE procure.vendors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  vendor_code     text UNIQUE NOT NULL,
  vendor_type     text CHECK (vendor_type IN ('freelance','agency','consultancy','production_house','post_house')),
  contact_email   text,
  contact_phone   text,
  tax_id          text,
  payment_terms   text,
  is_active       boolean NOT NULL DEFAULT true,
  rating          numeric(2,1) CHECK (rating >= 1 AND rating <= 5),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_code ON procure.vendors(vendor_code);
CREATE INDEX idx_vendors_type ON procure.vendors(vendor_type);
```

---

## Project Quotes

### `procure.project_quotes`
```sql
CREATE TABLE procure.project_quotes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_code        text UNIQUE NOT NULL,
  client_name       text NOT NULL,
  brand_name        text,
  campaign_type     text NOT NULL,
  markets           text[] NOT NULL,
  deliverables      text[] NOT NULL,
  duration_weeks    int,
  status            text NOT NULL CHECK (status IN ('draft','submitted','approved','rejected','sent','won','lost')),
  total_client_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_cost_amount   numeric(12,2),
  total_margin_pct    numeric(5,2),
  currency            text NOT NULL DEFAULT 'PHP',
  created_by          uuid NOT NULL REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  submitted_at        timestamptz,
  fd_approved_by      uuid REFERENCES auth.users(id),
  fd_approved_at      timestamptz,
  sent_to_client_at   timestamptz,
  notes               text
);

CREATE INDEX idx_project_quotes_client ON procure.project_quotes(client_name);
CREATE INDEX idx_project_quotes_status ON procure.project_quotes(status);
CREATE INDEX idx_project_quotes_created_by ON procure.project_quotes(created_by);
CREATE INDEX idx_project_quotes_fd_approved ON procure.project_quotes(fd_approved_by);
```

### `procure.quote_lines`
```sql
CREATE TABLE procure.quote_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        uuid NOT NULL REFERENCES procure.project_quotes(id) ON DELETE CASCADE,
  line_number     int NOT NULL,
  rate_card_id    uuid REFERENCES procure.rate_cards(id),
  role_name       text NOT NULL,
  discipline      text NOT NULL,
  seniority_level text NOT NULL,
  unit_of_measure text NOT NULL,
  quantity        numeric(10,2) NOT NULL,
  client_rate     numeric(12,2) NOT NULL,
  cost_rate       numeric(12,2),
  margin_pct      numeric(5,2) GENERATED ALWAYS AS ((client_rate - COALESCE(cost_rate, 0)) / NULLIF(client_rate, 0) * 100) STORED,
  currency        text NOT NULL DEFAULT 'PHP',
  description     text,
  vendor_id       uuid REFERENCES procure.vendors(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_quote_line UNIQUE (quote_id, line_number)
);

CREATE INDEX idx_quote_lines_quote ON procure.quote_lines(quote_id);
CREATE INDEX idx_quote_lines_rate_card ON procure.quote_lines(rate_card_id);
CREATE INDEX idx_quote_lines_vendor ON procure.quote_lines(vendor_id);

-- Trigger to update quote totals
CREATE OR REPLACE FUNCTION update_quote_totals() RETURNS trigger AS $$
BEGIN
  UPDATE procure.project_quotes
  SET 
    total_client_amount = (
      SELECT COALESCE(SUM(quantity * client_rate), 0)
      FROM procure.quote_lines
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    ),
    total_cost_amount = (
      SELECT COALESCE(SUM(quantity * COALESCE(cost_rate, 0)), 0)
      FROM procure.quote_lines
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    ),
    total_margin_pct = (
      SELECT 
        CASE 
          WHEN SUM(quantity * client_rate) > 0 
          THEN (SUM(quantity * client_rate) - SUM(quantity * COALESCE(cost_rate, 0))) / SUM(quantity * client_rate) * 100
          ELSE 0
        END
      FROM procure.quote_lines
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    )
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_lines_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON procure.quote_lines
  FOR EACH ROW EXECUTE FUNCTION update_quote_totals();
```

---

## AI Rate Advisor

### `procure.rate_advisor_sessions`
```sql
CREATE TABLE procure.rate_advisor_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  user_role     text NOT NULL CHECK (user_role IN ('am','fd')),
  project_brief jsonb NOT NULL,
  requested_roles jsonb NOT NULL,
  recommendations jsonb,
  status        text NOT NULL CHECK (status IN ('pending','completed','failed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  error_message text
);

CREATE INDEX idx_rate_advisor_user ON procure.rate_advisor_sessions(user_id);
CREATE INDEX idx_rate_advisor_status ON procure.rate_advisor_sessions(status);
```

### `procure.rate_history`
```sql
CREATE TABLE procure.rate_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id    uuid NOT NULL REFERENCES procure.rate_cards(id),
  change_type     text NOT NULL CHECK (change_type IN ('created','updated','archived')),
  old_cost_rate   numeric(12,2),
  new_cost_rate   numeric(12,2),
  old_client_rate numeric(12,2),
  new_client_rate numeric(12,2),
  changed_by      uuid REFERENCES auth.users(id),
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_history_card ON procure.rate_history(rate_card_id);
CREATE INDEX idx_rate_history_changed_by ON procure.rate_history(changed_by);
```

---

## Analytics Views

### `procure.v_rate_card_summary`
```sql
CREATE VIEW procure.v_rate_card_summary AS
SELECT
  rc.id,
  rc.name,
  rc.role_name,
  rc.discipline,
  rc.seniority_level,
  rc.market,
  v.name AS vendor_name,
  rc.unit_of_measure,
  rc.cost_rate,
  rc.client_rate,
  rc.margin_pct,
  rc.currency,
  rc.state,
  COUNT(DISTINCT ql.quote_id) AS times_used,
  SUM(ql.quantity) AS total_quantity_quoted,
  AVG(ql.client_rate) AS avg_quoted_client_rate
FROM procure.rate_cards rc
LEFT JOIN procure.vendors v ON v.id = rc.vendor_id
LEFT JOIN procure.quote_lines ql ON ql.rate_card_id = rc.id
GROUP BY rc.id, v.name;
```

### `procure.v_quote_summary`
```sql
CREATE VIEW procure.v_quote_summary AS
SELECT
  pq.id,
  pq.quote_code,
  pq.client_name,
  pq.brand_name,
  pq.campaign_type,
  pq.status,
  pq.total_client_amount,
  pq.total_cost_amount,
  pq.total_margin_pct,
  pq.currency,
  COUNT(ql.id) AS line_count,
  u_created.email AS created_by_email,
  u_fd.email AS fd_approved_by_email,
  pq.created_at,
  pq.fd_approved_at
FROM procure.project_quotes pq
LEFT JOIN procure.quote_lines ql ON ql.quote_id = pq.id
LEFT JOIN auth.users u_created ON u_created.id = pq.created_by
LEFT JOIN auth.users u_fd ON u_fd.id = pq.fd_approved_by
GROUP BY pq.id, u_created.email, u_fd.email;
```

### `analytics.v_rate_governance_metrics`
```sql
CREATE VIEW analytics.v_rate_governance_metrics AS
SELECT
  DATE_TRUNC('month', pq.created_at) AS period,
  pq.campaign_type,
  COUNT(DISTINCT pq.id) AS quote_count,
  SUM(pq.total_client_amount) AS total_quoted_value,
  AVG(pq.total_margin_pct) AS avg_margin,
  COUNT(CASE WHEN pq.status = 'won' THEN 1 END) AS won_count,
  SUM(CASE WHEN pq.status = 'won' THEN pq.total_client_amount ELSE 0 END) AS won_value,
  AVG(EXTRACT(days FROM pq.fd_approved_at - pq.created_at)) AS avg_approval_days
FROM procure.project_quotes pq
WHERE pq.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;
```

### `analytics.v_vendor_performance`
```sql
CREATE VIEW analytics.v_vendor_performance AS
SELECT
  v.id AS vendor_id,
  v.name AS vendor_name,
  v.vendor_type,
  COUNT(DISTINCT ql.quote_id) AS quotes_participated,
  SUM(ql.quantity * ql.cost_rate) AS total_cost_value,
  AVG(ql.margin_pct) AS avg_margin,
  COUNT(DISTINCT rc.id) AS active_rate_cards,
  MAX(ql.created_at) AS last_quoted_date
FROM procure.vendors v
LEFT JOIN procure.rate_cards rc ON rc.vendor_id = v.id AND rc.state = 'active'
LEFT JOIN procure.quote_lines ql ON ql.vendor_id = v.id
WHERE v.is_active = true
GROUP BY v.id
ORDER BY total_cost_value DESC;
```

### `analytics.v_discipline_spend`
```sql
CREATE VIEW analytics.v_discipline_spend AS
SELECT
  ql.discipline,
  COUNT(DISTINCT ql.quote_id) AS quote_count,
  SUM(ql.quantity * ql.client_rate) AS total_client_spend,
  SUM(ql.quantity * COALESCE(ql.cost_rate, 0)) AS total_cost,
  AVG(ql.margin_pct) AS avg_margin,
  SUM(ql.quantity) AS total_quantity
FROM procure.quote_lines ql
JOIN procure.project_quotes pq ON pq.id = ql.quote_id
WHERE pq.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY ql.discipline
ORDER BY total_client_spend DESC;
```

---

## Row-Level Security (RLS)

### Core Principles
- **AM/COOR**: Can see all active rate cards but NOT vendor_id, cost_rate, margin_pct
- **FD**: Full visibility to all fields
- Both can see their own quotes; FD can see all quotes

```sql
-- Enable RLS
ALTER TABLE procure.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE procure.project_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procure.quote_lines ENABLE ROW LEVEL SECURITY;

-- Rate Cards: AM can read active cards
CREATE POLICY am_view_active_rate_cards ON procure.rate_cards
  FOR SELECT
  USING (
    state = 'active' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND role IN ('am', 'coor')
    )
  );

-- Rate Cards: FD full access
CREATE POLICY fd_full_rate_cards ON procure.rate_cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND role = 'fd'
    )
  );

-- Quotes: Users can see their own quotes
CREATE POLICY user_own_quotes ON procure.project_quotes
  FOR SELECT
  USING (created_by = auth.uid());

-- Quotes: FD can see all quotes
CREATE POLICY fd_all_quotes ON procure.project_quotes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND role = 'fd'
    )
  );

-- Quote Lines: Follow parent quote visibility
CREATE POLICY quote_lines_visibility ON procure.quote_lines
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM procure.project_quotes pq
      WHERE pq.id = quote_id 
        AND (pq.created_by = auth.uid() OR EXISTS (
          SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'fd'
        ))
    )
  );
```

### Field-Level Security (Application Layer)
Since Postgres RLS doesn't support field-level restrictions, implement in API:

```python
# FastAPI endpoint example
@app.get("/api/rate-cards")
def get_rate_cards(user: User = Depends(get_current_user)):
    query = db.query(RateCard).filter(RateCard.state == 'active')
    
    if user.role in ['am', 'coor']:
        # Exclude sensitive fields for AM
        return [
            {
                "id": rc.id,
                "name": rc.name,
                "role_name": rc.role_name,
                "discipline": rc.discipline,
                "seniority_level": rc.seniority_level,
                "market": rc.market,
                "unit_of_measure": rc.unit_of_measure,
                "client_rate": rc.client_rate,
                "currency": rc.currency,
                # vendor_id, cost_rate, margin_pct EXCLUDED
            }
            for rc in query.all()
        ]
    elif user.role == 'fd':
        # Full access for FD
        return query.all()
```

---

## AI Rate Advisor Contract

### API Endpoint: `POST /api/procure/rate-advisor/estimate`

**Request:**
```json
{
  "user_role": "am",
  "project_brief": {
    "client_name": "Acme Corp",
    "brand_name": "Brand X",
    "campaign_type": "TVC + Digital",
    "markets": ["PH"],
    "deliverables": ["30s TVC", "Cutdowns", "Social assets"],
    "duration_weeks": 8
  },
  "line_items": [
    {
      "discipline": "creative",
      "role": "Art Director",
      "seniority": "senior",
      "market": "PH",
      "unit": "day",
      "quantity": 10
    }
  ]
}
```

**Response (AM):**
```json
{
  "session_id": "uuid",
  "mode": "client_budget_builder",
  "recommended_items": [
    {
      "discipline": "creative",
      "role_label": "Senior Art Director",
      "unit": "day",
      "quantity": 10,
      "client_rate": 25000,
      "currency": "PHP",
      "total_client_amount": 250000,
      "notes": "Within reasonable & customary range for PH TVC campaigns."
    }
  ],
  "warnings": []
}
```

**Response (FD):**
```json
{
  "session_id": "uuid",
  "mode": "governance",
  "recommended_items": [
    {
      "discipline": "creative",
      "role_label": "Senior Art Director",
      "unit": "day",
      "quantity": 10,
      "client_rate": 25000,
      "cost_rate": 18000,
      "margin_pct": 28.0,
      "currency": "PHP",
      "total_client_amount": 250000,
      "total_cost_amount": 180000,
      "is_outlier": false,
      "vendor_suggestion": "Creative Collective PH",
      "notes": "Near median of historical rates for this role/market."
    }
  ],
  "warnings": [
    "Producer rate exceeds 90th percentile for PH by ~20%; consider adjusting."
  ]
}
```

### Implementation Logic
```python
def rate_advisor_estimate(request: RateAdvisorRequest) -> RateAdvisorResponse:
    recommendations = []
    
    for item in request.line_items:
        # Query historical rate cards
        rate_cards = db.query(RateCard).filter(
            RateCard.role_name.ilike(f"%{item.role}%"),
            RateCard.discipline == item.discipline,
            RateCard.seniority_level == item.seniority,
            RateCard.market == item.market,
            RateCard.state == 'active'
        ).all()
        
        if not rate_cards:
            # Insufficient data
            recommendations.append({
                "role_label": item.role,
                "notes": "Insufficient data for this role/market combination.",
                "is_outlier": True
            })
            continue
        
        # Calculate median/p90 rates
        client_rates = [rc.client_rate for rc in rate_cards]
        cost_rates = [rc.cost_rate for rc in rate_cards]
        
        median_client = statistics.median(client_rates)
        median_cost = statistics.median(cost_rates) if request.user_role == 'fd' else None
        
        recommendation = {
            "discipline": item.discipline,
            "role_label": f"{item.seniority.capitalize()} {item.role}",
            "unit": item.unit,
            "quantity": item.quantity,
            "client_rate": median_client,
            "currency": "PHP",
            "total_client_amount": median_client * item.quantity,
        }
        
        if request.user_role == 'fd':
            recommendation.update({
                "cost_rate": median_cost,
                "margin_pct": ((median_client - median_cost) / median_client) * 100,
                "total_cost_amount": median_cost * item.quantity,
                "is_outlier": check_if_outlier(median_client, client_rates),
            })
        
        recommendations.append(recommendation)
    
    return RateAdvisorResponse(
        mode="governance" if request.user_role == 'fd' else "client_budget_builder",
        recommended_items=recommendations,
        warnings=generate_warnings(recommendations)
    )
```

---

## Sample Seed Data

```sql
-- Vendors
INSERT INTO procure.vendors (id, name, vendor_code, vendor_type) VALUES
  ('vendor-1', 'Creative Collective PH', 'CCPH', 'agency'),
  ('vendor-2', 'Wordsmith Studios', 'WS', 'freelance'),
  ('vendor-3', 'Strategy First Consulting', 'SFC', 'consultancy'),
  ('vendor-4', 'PH Production House', 'PHPH', 'production_house'),
  ('vendor-5', 'Post House Manila', 'PHM', 'post_house');

-- Rate Cards
INSERT INTO procure.rate_cards (name, role_name, discipline, seniority_level, market, vendor_id, unit_of_measure, cost_rate, client_rate, state) VALUES
  ('Senior Art Director - PH', 'Art Director', 'creative', 'senior', 'PH', 'vendor-1', 'day', 18000, 25000, 'active'),
  ('Senior Copywriter - PH', 'Copywriter', 'creative', 'senior', 'PH', 'vendor-2', 'day', 16000, 22000, 'active'),
  ('Creative Director - PH', 'Creative Director', 'creative', 'director', 'PH', 'vendor-1', 'day', 28000, 38000, 'active'),
  ('Brand Strategist - Senior - PH', 'Brand Strategist', 'strategy', 'senior', 'PH', 'vendor-3', 'day', 20000, 28000, 'active'),
  ('Producer - Mid - PH', 'Producer', 'production', 'mid', 'PH', 'vendor-4', 'day', 14000, 19000, 'active');
```

---

## Integration with Other Apps

### T&E Integration
Link project costs to expense reports:
```sql
ALTER TABLE te.expense_lines ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);
ALTER TABLE te.expense_lines ADD COLUMN procure_vendor_id uuid REFERENCES procure.vendors(id);

-- Track actual spend vs quoted
CREATE VIEW analytics.v_quote_vs_actual AS
SELECT
  pq.id AS quote_id,
  pq.quote_code,
  pq.client_name,
  pq.total_client_amount AS quoted_amount,
  SUM(el.amount) AS actual_expense,
  pq.total_client_amount - COALESCE(SUM(el.amount), 0) AS variance
FROM procure.project_quotes pq
LEFT JOIN te.expense_lines el ON el.procure_quote_id = pq.id
GROUP BY pq.id;
```

### Gearroom Integration
Track equipment used in projects:
```sql
ALTER TABLE gear.checkouts ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);

-- Equipment costs in project quotes
CREATE VIEW analytics.v_project_equipment_costs AS
SELECT
  pq.id AS quote_id,
  pq.quote_code,
  COUNT(DISTINCT co.item_id) AS equipment_used,
  STRING_AGG(DISTINCT i.name, ', ') AS equipment_list
FROM procure.project_quotes pq
JOIN gear.checkouts co ON co.procure_quote_id = pq.id
JOIN gear.items i ON i.id = co.item_id
GROUP BY pq.id;
```

---

## Future Enhancements

1. **AI-Powered Anomaly Detection**
   - Flag quotes with margin < 15% automatically
   - Suggest vendor alternatives for better margins
   - Predict quote win probability based on historical data

2. **Dynamic Pricing**
   - Surge pricing during peak seasons
   - Volume discounts for long-term projects
   - Market-adjusted rates (inflation, currency)

3. **Vendor Scorecards**
   - Track on-time delivery
   - Quality ratings from AMs
   - Cost variance tracking

4. **Budget Templates**
   - Pre-built templates by campaign type
   - Industry benchmarks (APAC, SEA, PH)
   - One-click budget generation

5. **Contract Management**
   - MSA/SOW generation from approved quotes
   - Auto-renewal tracking
   - Compliance checks
