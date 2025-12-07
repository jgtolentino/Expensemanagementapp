# Finance PPM RAG Assistant - Data Model

**Phase:** 2 - Canonical Knowledge & Data Model  
**Date:** 2025-12-07

---

## Overview

This document defines the **single source-of-truth schema** for Finance PPM knowledge and metrics. All tables use the `finance_ppm.*` schema in Supabase Postgres.

**Design Principles:**
1. **Separation of Concerns**: Projects (operational) vs Financials (analytical)
2. **Temporal Accuracy**: Monthly snapshots for historical analysis
3. **RAG-Ready**: Knowledge tables optimized for vector search
4. **Integration-Friendly**: Foreign keys to `procure.*`, `te.*`, `gear.*`
5. **Role-Based Access**: RLS policies enforce Finance vs non-Finance visibility

---

## Schema: `finance_ppm`

### Core Project & Finance Tables

#### `finance_ppm.projects`
```sql
CREATE SCHEMA IF NOT EXISTS finance_ppm;

CREATE TABLE finance_ppm.projects (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code      text UNIQUE NOT NULL,
  project_name      text NOT NULL,
  client_name       text NOT NULL,
  brand_name        text,
  status            text NOT NULL CHECK (status IN ('planned','active','on_hold','closed','cancelled')),
  start_date        date,
  end_date          date,
  owner_employee_id uuid,  -- FK to employees table (future)
  portfolio         text,   -- e.g. 'Consumer Tech', 'Healthcare', 'Finance'
  service_line      text,   -- e.g. 'Creative', 'Digital', 'Strategy'
  region            text NOT NULL DEFAULT 'PH',
  billing_type      text CHECK (billing_type IN ('fixed_fee','retainer','time_materials','milestone')),
  
  -- Integration fields
  procure_quote_id  uuid REFERENCES procure.project_quotes(id),  -- Link to original quote
  
  -- Metadata
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  notes             text
);

CREATE INDEX idx_finance_ppm_projects_code ON finance_ppm.projects(project_code);
CREATE INDEX idx_finance_ppm_projects_client ON finance_ppm.projects(client_name);
CREATE INDEX idx_finance_ppm_projects_status ON finance_ppm.projects(status);
CREATE INDEX idx_finance_ppm_projects_portfolio ON finance_ppm.projects(portfolio);
CREATE INDEX idx_finance_ppm_projects_quote ON finance_ppm.projects(procure_quote_id);
```

**Purpose:** Master project list. One row = one project. Grain: project.

**Data Sources:**
- Manually created or imported from Procure quotes
- Synced from Odoo Projects module (future)

---

#### `finance_ppm.project_financials`
```sql
CREATE TABLE finance_ppm.project_financials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  period_month    date NOT NULL,  -- YYYY-MM-01 (first day of month)
  
  -- Budgets
  budget_amount   numeric(12,2) NOT NULL DEFAULT 0,
  forecast_amount numeric(12,2),
  
  -- Actuals
  actual_cost     numeric(12,2) NOT NULL DEFAULT 0,
  revenue         numeric(12,2) NOT NULL DEFAULT 0,
  
  -- Derived metrics
  margin_pct      numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN revenue > 0 THEN ((revenue - actual_cost) / revenue) * 100
      ELSE 0
    END
  ) STORED,
  
  variance_amount numeric(12,2) GENERATED ALWAYS AS (budget_amount - actual_cost) STORED,
  variance_pct    numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN budget_amount > 0 THEN ((budget_amount - actual_cost) / budget_amount) * 100
      ELSE 0
    END
  ) STORED,
  
  -- Finance-specific
  wip_amount      numeric(12,2) DEFAULT 0,  -- Work in progress
  ar_amount       numeric(12,2) DEFAULT 0,  -- Accounts receivable
  ap_amount       numeric(12,2) DEFAULT 0,  -- Accounts payable
  billed_amount   numeric(12,2) DEFAULT 0,  -- Invoiced to client
  collected_amount numeric(12,2) DEFAULT 0, -- Cash collected
  
  -- Currency
  currency        text NOT NULL DEFAULT 'PHP',
  
  -- Metadata
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  notes           text,
  
  CONSTRAINT unique_project_period UNIQUE (project_id, period_month)
);

CREATE INDEX idx_finance_ppm_financials_project ON finance_ppm.project_financials(project_id);
CREATE INDEX idx_finance_ppm_financials_period ON finance_ppm.project_financials(period_month);
CREATE INDEX idx_finance_ppm_financials_margin ON finance_ppm.project_financials(margin_pct);
```

**Purpose:** Monthly financial snapshots per project. Grain: project + month.

**Data Sources:**
- Actual costs: Aggregated from `te.expense_lines` (linked via `project_id`)
- Revenue: From invoicing system (manual or API)
- WIP/AR/AP: Finance close process (manual entry or sync)

---

#### `finance_ppm.rate_cards`
```sql
-- Note: This can be a view over procure.rate_cards or a separate table
CREATE TABLE finance_ppm.rate_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role            text NOT NULL,
  discipline      text NOT NULL,
  seniority_level text NOT NULL,
  market          text NOT NULL,
  
  client_rate     numeric(12,2) NOT NULL,
  cost_rate       numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'PHP',
  
  effective_from  date NOT NULL,
  effective_to    date,
  
  source_system   text NOT NULL DEFAULT 'finance_ppm',  -- or 'odoo', 'procure'
  source_id       uuid,  -- FK to procure.rate_cards if applicable
  
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_ppm_rate_cards_role ON finance_ppm.rate_cards(role, discipline, seniority_level);
CREATE INDEX idx_finance_ppm_rate_cards_market ON finance_ppm.rate_cards(market);
CREATE INDEX idx_finance_ppm_rate_cards_effective ON finance_ppm.rate_cards(effective_from, effective_to);
```

**Purpose:** Rate cards for resource costing. Can reference Procure app rates.

**Alternative:** Use a view:
```sql
CREATE VIEW finance_ppm.rate_cards AS
SELECT 
  id,
  role_name AS role,
  discipline,
  seniority_level,
  market,
  client_rate,
  cost_rate,
  currency,
  effective_from,
  effective_to,
  'procure' AS source_system,
  id AS source_id
FROM procure.rate_cards
WHERE state = 'active';
```

---

#### `finance_ppm.month_end_tasks`
```sql
CREATE TABLE finance_ppm.month_end_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name     text NOT NULL,
  category      text NOT NULL CHECK (category IN ('AR','AP','WIP','Accruals','Reconciliation','Reporting','Other')),
  description   text,
  owner_role    text,  -- 'Finance Controller', 'Finance Manager', etc.
  is_recurring  boolean NOT NULL DEFAULT true,
  checklist_ref text,  -- Link to Notion page ID or local doc
  
  -- Recurrence
  recurrence_pattern text,  -- e.g. 'monthly', 'quarterly'
  
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_ppm_month_end_tasks_category ON finance_ppm.month_end_tasks(category);
```

**Purpose:** Master list of month-end close tasks. Grain: task template.

---

#### `finance_ppm.month_end_task_completions`
```sql
CREATE TABLE finance_ppm.month_end_task_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       uuid NOT NULL REFERENCES finance_ppm.month_end_tasks(id),
  period_month  date NOT NULL,  -- YYYY-MM-01
  
  status        text NOT NULL CHECK (status IN ('pending','in_progress','completed','blocked')),
  completed_by  uuid,  -- FK to users
  completed_at  timestamptz,
  
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_task_period UNIQUE (task_id, period_month)
);

CREATE INDEX idx_finance_ppm_task_completions_task ON finance_ppm.month_end_task_completions(task_id);
CREATE INDEX idx_finance_ppm_task_completions_period ON finance_ppm.month_end_task_completions(period_month);
CREATE INDEX idx_finance_ppm_task_completions_status ON finance_ppm.month_end_task_completions(status);
```

**Purpose:** Track completion of tasks per period. Grain: task + month.

---

### Knowledge & Embedding Tables

#### `finance_ppm.knowledge_documents`
```sql
CREATE TABLE finance_ppm.knowledge_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  doc_type        text NOT NULL CHECK (doc_type IN ('SOP','PRD','Spec','Checklist','Policy','MeetingNotes','Playbook','Guide')),
  
  -- Source
  source          text NOT NULL CHECK (source IN ('notion','local','manual')),
  source_id       text,  -- Notion page ID, file path, or other identifier
  
  -- Content
  content         text,  -- Full text (optional, can be reconstructed from chunks)
  
  -- Metadata
  tags            text[] DEFAULT '{}',
  client_name     text,  -- Optional: client-specific docs
  portfolio       text,  -- Optional: portfolio-specific docs
  
  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_synced_at  timestamptz,
  
  -- RAG status
  embedding_status text CHECK (embedding_status IN ('pending','in_progress','completed','failed'))
);

CREATE INDEX idx_finance_ppm_knowledge_docs_type ON finance_ppm.knowledge_documents(doc_type);
CREATE INDEX idx_finance_ppm_knowledge_docs_source ON finance_ppm.knowledge_documents(source, source_id);
CREATE INDEX idx_finance_ppm_knowledge_docs_tags ON finance_ppm.knowledge_documents USING GIN(tags);
CREATE INDEX idx_finance_ppm_knowledge_docs_client ON finance_ppm.knowledge_documents(client_name);
```

**Purpose:** Master list of knowledge documents. Grain: document.

**Data Sources:**
- Notion Finance PPM workspace (synced daily)
- Local markdown files in `docs/finance/`
- Manual uploads

---

#### `finance_ppm.knowledge_chunks`
```sql
CREATE TABLE finance_ppm.knowledge_chunks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES finance_ppm.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index   int NOT NULL,
  
  -- Content
  content       text NOT NULL,
  
  -- Metadata (JSONB for flexibility)
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example metadata:
  -- {
  --   "section_heading": "Month-End WIP Review",
  --   "page_number": 3,
  --   "author": "Sarah Johnson",
  --   "last_updated": "2025-12-01"
  -- }
  
  -- Embedding
  embedding     vector(1536),  -- OpenAI ada-002 or equivalent
  
  created_at    timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index)
);

CREATE INDEX idx_finance_ppm_knowledge_chunks_doc ON finance_ppm.knowledge_chunks(document_id);
CREATE INDEX idx_finance_ppm_knowledge_chunks_embedding ON finance_ppm.knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Purpose:** Chunked documents with embeddings. Grain: chunk.

**Chunking Strategy:**
- Chunk size: 512-1024 tokens
- Overlap: 100 tokens
- Respect semantic boundaries (paragraphs, sections)

---

### Analytics Views

#### `finance_ppm.v_project_overview`
```sql
CREATE VIEW finance_ppm.v_project_overview AS
SELECT
  p.id AS project_id,
  p.project_code,
  p.project_name,
  p.client_name,
  p.brand_name,
  p.status,
  p.portfolio,
  p.service_line,
  p.billing_type,
  
  -- Latest financials (most recent month)
  pf.period_month AS latest_period,
  pf.budget_amount,
  pf.forecast_amount,
  pf.actual_cost,
  pf.revenue,
  pf.margin_pct,
  pf.variance_amount,
  pf.variance_pct,
  pf.wip_amount,
  pf.ar_amount,
  
  -- Risk indicators
  CASE 
    WHEN pf.margin_pct < 15 THEN 'high'
    WHEN pf.margin_pct < 20 THEN 'medium'
    ELSE 'low'
  END AS risk_level,
  
  CASE 
    WHEN pf.variance_pct < -10 THEN true  -- Over budget by 10%+
    ELSE false
  END AS is_over_budget,
  
  CASE 
    WHEN pf.ar_amount > 0 AND EXTRACT(days FROM CURRENT_DATE - pf.period_month) > 60 THEN true
    ELSE false
  END AS has_ar_aging_issue
  
FROM finance_ppm.projects p
LEFT JOIN LATERAL (
  SELECT *
  FROM finance_ppm.project_financials pf
  WHERE pf.project_id = p.id
  ORDER BY pf.period_month DESC
  LIMIT 1
) pf ON true
WHERE p.status IN ('active', 'on_hold');
```

**Purpose:** Latest project snapshot. Used by AI assistant for project queries.

---

#### `finance_ppm.v_portfolio_overview`
```sql
CREATE VIEW finance_ppm.v_portfolio_overview AS
SELECT
  p.portfolio,
  p.client_name,
  p.service_line,
  p.region,
  
  COUNT(DISTINCT p.id) AS project_count,
  SUM(pf.revenue) AS total_revenue,
  SUM(pf.actual_cost) AS total_cost,
  AVG(pf.margin_pct) AS avg_margin,
  SUM(pf.wip_amount) AS total_wip,
  SUM(pf.ar_amount) AS total_ar,
  
  -- Risk counts
  COUNT(CASE WHEN pf.margin_pct < 15 THEN 1 END) AS projects_at_risk,
  COUNT(CASE WHEN pf.variance_pct < -10 THEN 1 END) AS projects_over_budget
  
FROM finance_ppm.projects p
JOIN finance_ppm.project_financials pf ON pf.project_id = p.id
WHERE p.status IN ('active', 'on_hold')
  AND pf.period_month = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.portfolio, p.client_name, p.service_line, p.region;
```

**Purpose:** Portfolio-level rollups. Used for Leadership queries.

---

#### `finance_ppm.v_month_end_status`
```sql
CREATE VIEW finance_ppm.v_month_end_status AS
WITH current_period AS (
  SELECT DATE_TRUNC('month', CURRENT_DATE)::date AS period_month
)
SELECT
  cp.period_month,
  
  -- Task completion
  COUNT(mt.id) AS total_tasks,
  COUNT(CASE WHEN mtc.status = 'completed' THEN 1 END) AS completed_tasks,
  ROUND(
    (COUNT(CASE WHEN mtc.status = 'completed' THEN 1 END)::numeric / NULLIF(COUNT(mt.id), 0)) * 100,
    1
  ) AS completion_pct,
  
  -- By category
  jsonb_object_agg(
    mt.category,
    jsonb_build_object(
      'total', COUNT(mt.id),
      'completed', COUNT(CASE WHEN mtc.status = 'completed' THEN 1 END)
    )
  ) AS completion_by_category,
  
  -- Blocked tasks
  COUNT(CASE WHEN mtc.status = 'blocked' THEN 1 END) AS blocked_tasks
  
FROM current_period cp
CROSS JOIN finance_ppm.month_end_tasks mt
LEFT JOIN finance_ppm.month_end_task_completions mtc 
  ON mtc.task_id = mt.id AND mtc.period_month = cp.period_month
GROUP BY cp.period_month;
```

**Purpose:** Month-end close readiness. Used for Finance role queries.

---

#### `finance_ppm.v_profitability_analysis`
```sql
CREATE VIEW finance_ppm.v_profitability_analysis AS
SELECT
  DATE_TRUNC('month', pf.period_month) AS period,
  p.client_name,
  p.portfolio,
  p.service_line,
  
  SUM(pf.revenue) AS total_revenue,
  SUM(pf.actual_cost) AS total_cost,
  SUM(pf.revenue - pf.actual_cost) AS total_profit,
  
  CASE 
    WHEN SUM(pf.revenue) > 0 
    THEN ((SUM(pf.revenue) - SUM(pf.actual_cost)) / SUM(pf.revenue)) * 100
    ELSE 0
  END AS profit_margin_pct,
  
  COUNT(DISTINCT p.id) AS project_count
  
FROM finance_ppm.projects p
JOIN finance_ppm.project_financials pf ON pf.project_id = p.id
WHERE pf.period_month >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1, 2, 3, 4
ORDER BY 1 DESC, total_profit DESC;
```

**Purpose:** Historical profitability analysis. Used for trends and charts.

---

#### `finance_ppm.v_wip_summary`
```sql
CREATE VIEW finance_ppm.v_wip_summary AS
SELECT
  pf.period_month,
  p.client_name,
  p.project_code,
  p.project_name,
  pf.wip_amount,
  
  -- WIP aging
  EXTRACT(days FROM CURRENT_DATE - pf.period_month)::int AS days_old,
  CASE 
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 30 THEN '0-30 days'
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 60 THEN '30-60 days'
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 90 THEN '60-90 days'
    ELSE '90+ days'
  END AS wip_age_bucket
  
FROM finance_ppm.project_financials pf
JOIN finance_ppm.projects p ON p.id = pf.project_id
WHERE pf.wip_amount > 0
  AND p.status IN ('active', 'on_hold')
ORDER BY pf.wip_amount DESC;
```

**Purpose:** WIP aging report. Critical for month-end close.

---

#### `finance_ppm.v_ar_aging`
```sql
CREATE VIEW finance_ppm.v_ar_aging AS
SELECT
  p.client_name,
  p.project_code,
  p.project_name,
  pf.ar_amount,
  pf.period_month AS invoice_period,
  
  -- AR aging
  EXTRACT(days FROM CURRENT_DATE - pf.period_month)::int AS days_outstanding,
  CASE 
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 30 THEN 'Current'
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 60 THEN '30-60 days'
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) < 90 THEN '60-90 days'
    ELSE '90+ days'
  END AS ar_age_bucket,
  
  CASE 
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) > 60 THEN 'high'
    WHEN EXTRACT(days FROM CURRENT_DATE - pf.period_month) > 30 THEN 'medium'
    ELSE 'low'
  END AS collection_risk
  
FROM finance_ppm.project_financials pf
JOIN finance_ppm.projects p ON p.id = pf.project_id
WHERE pf.ar_amount > 0
ORDER BY days_outstanding DESC, pf.ar_amount DESC;
```

**Purpose:** AR aging report. Critical for cash flow management.

---

## Integration with Other Apps

### Link to Procure (Vendor Rates & Quotes)

```sql
-- Already implemented via FK:
ALTER TABLE finance_ppm.projects 
  ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);

-- View: Compare quote (budget) vs actual
CREATE VIEW finance_ppm.v_quote_vs_actual AS
SELECT
  p.id AS project_id,
  p.project_code,
  pq.quote_code,
  pq.total_client_amount AS quoted_amount,
  pf.actual_cost,
  (pq.total_client_amount - pf.actual_cost) AS variance
FROM finance_ppm.projects p
LEFT JOIN procure.project_quotes pq ON pq.id = p.procure_quote_id
LEFT JOIN LATERAL (
  SELECT SUM(actual_cost) AS actual_cost
  FROM finance_ppm.project_financials
  WHERE project_id = p.id
) pf ON true;
```

### Link to T&E (Actual Expenses)

```sql
-- Add project linkage to T&E expense lines
ALTER TABLE te.expense_lines 
  ADD COLUMN finance_ppm_project_id uuid REFERENCES finance_ppm.projects(id);

CREATE INDEX idx_te_expense_lines_project ON te.expense_lines(finance_ppm_project_id);

-- Aggregate T&E expenses into project financials
CREATE OR REPLACE FUNCTION finance_ppm.aggregate_te_expenses(p_project_id uuid, p_period_month date)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(el.amount), 0)
  FROM te.expense_lines el
  JOIN te.expense_reports er ON er.id = el.expense_report_id
  WHERE el.finance_ppm_project_id = p_project_id
    AND DATE_TRUNC('month', er.report_date) = p_period_month
    AND er.status IN ('approved', 'closed');
$$ LANGUAGE sql STABLE;
```

### Link to Gearroom (Equipment Costs)

```sql
-- Add project linkage to gear checkouts
ALTER TABLE gear.checkouts 
  ADD COLUMN finance_ppm_project_id uuid REFERENCES finance_ppm.projects(id);

CREATE INDEX idx_gear_checkouts_project ON gear.checkouts(finance_ppm_project_id);

-- View: Equipment costs by project
CREATE VIEW finance_ppm.v_project_equipment_costs AS
SELECT
  p.id AS project_id,
  p.project_code,
  COUNT(DISTINCT co.item_id) AS equipment_count,
  SUM(i.current_value * (co.return_date - co.checkout_date) / 365.0) AS estimated_equipment_cost
FROM finance_ppm.projects p
JOIN gear.checkouts co ON co.finance_ppm_project_id = p.id
JOIN gear.items i ON i.id = co.item_id
WHERE co.status = 'returned'
GROUP BY p.id;
```

---

## Row-Level Security (RLS)

### Core Principles
1. **All users** can see project list and basic info
2. **Finance role only** can see cost, margin, WIP, AR/AP
3. **PM/Account roles** can see revenue and high-level status
4. **Leadership role** can see portfolio aggregates but not line-item costs

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE finance_ppm.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Projects: All authenticated users can view
CREATE POLICY view_projects ON finance_ppm.projects
  FOR SELECT
  USING (auth.role() IN ('authenticated'));

-- Financials: Finance role full access
CREATE POLICY finance_view_financials ON finance_ppm.project_financials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND role IN ('finance', 'leadership')
    )
  );

-- Knowledge: All can view, but client-specific docs filtered
CREATE POLICY view_knowledge ON finance_ppm.knowledge_documents
  FOR SELECT
  USING (
    client_name IS NULL  -- Global docs
    OR client_name IN (
      SELECT client_name 
      FROM finance_ppm.projects 
      WHERE owner_employee_id = auth.uid()
    )
  );
```

### Field-Level Security (Application Layer)

Since Postgres RLS doesn't support field-level restrictions, implement in API:

```typescript
// API endpoint example
export async function getProjectOverview(projectId: string, userRole: Role) {
  const query = supabase
    .from('v_project_overview')
    .select('*')
    .eq('project_id', projectId)
    .single();
  
  const { data } = await query;
  
  if (userRole === 'Finance' || userRole === 'Leadership') {
    return data; // Full access
  } else if (userRole === 'PM' || userRole === 'Account') {
    // Exclude sensitive fields
    const { actual_cost, margin_pct, wip_amount, ar_amount, ...safe } = data;
    return safe;
  } else {
    // Basic info only
    const { project_code, project_name, client_name, status } = data;
    return { project_code, project_name, client_name, status };
  }
}
```

---

## Data Sources & ETL

### Source 1: Procure Quotes → Projects
```sql
-- Insert project from approved Procure quote
INSERT INTO finance_ppm.projects (
  project_code, project_name, client_name, brand_name, 
  status, billing_type, procure_quote_id
)
SELECT
  CONCAT('PRJ-', pq.quote_code),
  CONCAT(pq.client_name, ' - ', pq.brand_name),
  pq.client_name,
  pq.brand_name,
  'planned',
  'fixed_fee',
  pq.id
FROM procure.project_quotes pq
WHERE pq.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM finance_ppm.projects WHERE procure_quote_id = pq.id
  );
```

### Source 2: T&E Expenses → Actual Costs
```sql
-- Monthly job: Aggregate T&E expenses into project financials
INSERT INTO finance_ppm.project_financials (
  project_id, period_month, actual_cost
)
SELECT
  el.finance_ppm_project_id,
  DATE_TRUNC('month', er.report_date)::date,
  SUM(el.amount)
FROM te.expense_lines el
JOIN te.expense_reports er ON er.id = el.expense_report_id
WHERE er.status IN ('approved', 'closed')
  AND el.finance_ppm_project_id IS NOT NULL
GROUP BY 1, 2
ON CONFLICT (project_id, period_month) 
DO UPDATE SET 
  actual_cost = EXCLUDED.actual_cost,
  updated_at = now();
```

### Source 3: Notion Workspace → Knowledge Documents
```python
# Notion sync job (Python)
import notion_client
from datetime import datetime
import os

def sync_finance_ppm_notion_workspace():
    notion = notion_client.Client(auth=os.environ["NOTION_API_TOKEN"])
    workspace_id = os.environ["FINANCE_PPM_NOTION_WORKSPACE_ID"]
    
    # Query all pages in Finance PPM workspace
    pages = notion.search(
        filter={"property": "object", "value": "page"},
        query="Finance PPM"
    ).get("results")
    
    for page in pages:
        doc = {
            "title": page["properties"]["title"]["title"][0]["plain_text"],
            "source": "notion",
            "source_id": page["id"],
            "doc_type": extract_doc_type(page),
            "tags": extract_tags(page),
            "content": extract_content(notion, page["id"]),
            "last_synced_at": datetime.utcnow()
        }
        
        upsert_knowledge_document(doc)
        chunk_and_embed_document(doc)

def extract_doc_type(page):
    # Example: Extract doc_type from a property
    return page["properties"].get("doc_type", {}).get("select", {}).get("name", "Guide")

def extract_tags(page):
    # Example: Extract tags from a multi-select property
    return [tag["name"] for tag in page["properties"].get("tags", {}).get("multi_select", [])]

def extract_content(notion, page_id):
    # Example: Extract content from a page
    page = notion.pages.retrieve(page_id)
    content = ""
    for block in page["blocks"]:
        if block["type"] == "paragraph":
            content += " ".join([text["plain_text"] for text in block["paragraph"]["rich_text"]]) + "\n"
    return content

def upsert_knowledge_document(doc):
    # Example: Upsert document into knowledge_documents table
    query = """
    INSERT INTO finance_ppm.knowledge_documents (title, doc_type, source, tags, content, last_synced_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (source_id) DO UPDATE SET
    title = EXCLUDED.title,
    doc_type = EXCLUDED.doc_type,
    source = EXCLUDED.source,
    tags = EXCLUDED.tags,
    content = EXCLUDED.content,
    last_synced_at = EXCLUDED.last_synced_at;
    """
    supabase_client.execute(query, (
        doc["title"], doc["doc_type"], doc["source"], doc["tags"], doc["content"], doc["last_synced_at"]
    ))

def chunk_and_embed_document(doc):
    # Example: Chunk document and embed each chunk
    chunks = chunk_text(doc["content"])
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)  # Assume a function to get embedding
        query = """
        INSERT INTO finance_ppm.knowledge_chunks (document_id, chunk_index, content, embedding)
        VALUES (%s, %s, %s, %s);
        """
        supabase_client.execute(query, (
            doc["id"], i, chunk, embedding
        ))

def chunk_text(text, max_chunk_size=512, overlap=100):
    # Example: Simple text chunking
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chunk_size, len(text))
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def get_embedding(text):
    # Example: Get embedding from a model
    import openai
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response["data"][0]["embedding"]
```

---

## Sample Seed Data

### Projects
```sql
INSERT INTO finance_ppm.projects (project_code, project_name, client_name, brand_name, status, portfolio, service_line, billing_type) VALUES
  ('PRJ-ACME-001', 'Acme Brand X Campaign', 'Acme Corp', 'Brand X', 'active', 'Consumer Tech', 'Creative', 'fixed_fee'),
  ('PRJ-ACME-002', 'Acme Digital Transformation', 'Acme Corp', 'Brand Y', 'active', 'Consumer Tech', 'Digital', 'time_materials'),
  ('PRJ-HEALTH-001', 'HealthCo Wellness Campaign', 'HealthCo', 'Wellness', 'active', 'Healthcare', 'Strategy', 'retainer'),
  ('PRJ-FIN-001', 'FinanceBank Rebranding', 'Finance Bank', NULL, 'active', 'Finance', 'Creative', 'milestone'),
  ('PRJ-RETAIL-001', 'RetailCo Holiday Campaign', 'RetailCo', 'Holiday', 'on_hold', 'Retail', 'Production', 'fixed_fee');
```

### Project Financials (Current Month)
```sql
INSERT INTO finance_ppm.project_financials (project_id, period_month, budget_amount, actual_cost, revenue, wip_amount, ar_amount) 
SELECT 
  p.id,
  DATE_TRUNC('month', CURRENT_DATE)::date,
  CASE p.project_code
    WHEN 'PRJ-ACME-001' THEN 5000000
    WHEN 'PRJ-ACME-002' THEN 3000000
    WHEN 'PRJ-HEALTH-001' THEN 2500000
    WHEN 'PRJ-FIN-001' THEN 4000000
    WHEN 'PRJ-RETAIL-001' THEN 1500000
  END,
  CASE p.project_code
    WHEN 'PRJ-ACME-001' THEN 3900000
    WHEN 'PRJ-ACME-002' THEN 2800000
    WHEN 'PRJ-HEALTH-001' THEN 2100000
    WHEN 'PRJ-FIN-001' THEN 4200000
    WHEN 'PRJ-RETAIL-001' THEN 1200000
  END,
  CASE p.project_code
    WHEN 'PRJ-ACME-001' THEN 4800000
    WHEN 'PRJ-ACME-002' THEN 3500000
    WHEN 'PRJ-HEALTH-001' THEN 2600000
    WHEN 'PRJ-FIN-001' THEN 5000000
    WHEN 'PRJ-RETAIL-001' THEN 1400000
  END,
  CASE p.project_code
    WHEN 'PRJ-ACME-001' THEN 200000
    WHEN 'PRJ-ACME-002' THEN 150000
    WHEN 'PRJ-HEALTH-001' THEN 100000
    WHEN 'PRJ-FIN-001' THEN 300000
    WHEN 'PRJ-RETAIL-001' THEN 50000
  END,
  CASE p.project_code
    WHEN 'PRJ-ACME-001' THEN 350000
    WHEN 'PRJ-ACME-002' THEN 200000
    WHEN 'PRJ-HEALTH-001' THEN 150000
    WHEN 'PRJ-FIN-001' THEN 400000
    WHEN 'PRJ-RETAIL-001' THEN 100000
  END
FROM finance_ppm.projects p;
```

### Month-End Tasks
```sql
INSERT INTO finance_ppm.month_end_tasks (task_name, category, description, owner_role, is_recurring) VALUES
  ('WIP Review and Validation', 'WIP', 'Review all active projects and validate WIP balances', 'Finance Controller', true),
  ('AR Reconciliation', 'AR', 'Match invoices to payments and update AR aging', 'Finance Manager', true),
  ('AP Accruals', 'AP', 'Estimate and record AP accruals for unbilled vendor invoices', 'Finance Controller', true),
  ('Unbilled Scope Review', 'Accruals', 'Identify delivered but not invoiced scope', 'Project Accountant', true),
  ('Bank Reconciliation', 'Reconciliation', 'Reconcile all bank accounts', 'Finance Manager', true),
  ('Project Margin Analysis', 'Reporting', 'Analyze project margins and flag at-risk projects', 'Finance Director', true),
  ('Revenue Recognition Check', 'Reporting', 'Validate revenue recognition compliance', 'Finance Controller', true),
  ('Client Invoice Review', 'AR', 'Review and approve all client invoices', 'Finance Director', true);
```

### Knowledge Documents (Sample)
```sql
INSERT INTO finance_ppm.knowledge_documents (title, doc_type, source, tags, content) VALUES
  ('Finance PPM Overview', 'Guide', 'local', ARRAY['overview', 'getting-started'], 
   'Finance PPM is the central hub for project financials, margin analysis, and month-end close...'),
  
  ('Month-End Close SOP', 'SOP', 'notion', ARRAY['month-end', 'close', 'process'], 
   'Standard Operating Procedure for Month-End Close:\n1. WIP Review (Days 1-3)\n2. AR Reconciliation (Days 4-5)...'),
  
  ('WIP Calculation Guide', 'Guide', 'local', ARRAY['wip', 'accounting', 'finance'], 
   'Work-in-Progress (WIP) represents costs incurred but not yet billed to clients...'),
  
  ('Project Acme Finance Playbook', 'Playbook', 'notion', ARRAY['client-specific', 'acme'], 
   'Client: Acme Corp\nInvoicing: Monthly in arrears\nPayment Terms: Net 45\nSpecial Notes: All invoices require PO...'),
  
  ('Rate Governance Policy', 'Policy', 'local', ARRAY['rates', 'governance', 'margins'], 
   'All project budgets must maintain minimum 15% margin. Rate cards must be reviewed quarterly...');
```

---

## Query Patterns & Examples

### Pattern 1: Project Health Query
```sql
-- AI Tool: project_snapshot(project_code)
SELECT *
FROM finance_ppm.v_project_overview
WHERE project_code = 'PRJ-ACME-001';

-- Result: Budget, actual, margin, WIP, AR, risk level
```

### Pattern 2: Portfolio Risk Query
```sql
-- AI Tool: portfolio_snapshot(filter='at_risk')
SELECT *
FROM finance_ppm.v_portfolio_overview
WHERE avg_margin < 15 OR projects_over_budget > 0
ORDER BY avg_margin ASC;
```

### Pattern 3: Month-End Readiness
```sql
-- AI Tool: month_end_status(period)
SELECT *
FROM finance_ppm.v_month_end_status
WHERE period_month = DATE_TRUNC('month', CURRENT_DATE);

-- Result: completion_pct, blocked_tasks, completion_by_category
```

### Pattern 4: Knowledge Lookup
```sql
-- AI RAG: Vector search over knowledge_chunks
SELECT 
  kd.title,
  kc.content,
  kc.embedding <=> query_embedding AS similarity
FROM finance_ppm.knowledge_chunks kc
JOIN finance_ppm.knowledge_documents kd ON kd.id = kc.document_id
WHERE kd.tags && ARRAY['month-end']
  AND kc.embedding <=> query_embedding < 0.8
ORDER BY similarity ASC
LIMIT 5;
```

---

## Performance Considerations

### Indexing Strategy
```sql
-- Critical indexes for AI queries
CREATE INDEX idx_projects_status_portfolio ON finance_ppm.projects(status, portfolio);
CREATE INDEX idx_financials_period_project ON finance_ppm.project_financials(period_month DESC, project_id);
CREATE INDEX idx_knowledge_chunks_embedding_hnsw ON finance_ppm.knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops);  -- Faster than ivfflat for < 1M rows
```

### Materialized Views (Optional)
```sql
-- For heavy aggregate queries
CREATE MATERIALIZED VIEW finance_ppm.mv_portfolio_summary AS
SELECT * FROM finance_ppm.v_portfolio_overview;

CREATE INDEX idx_mv_portfolio_client ON finance_ppm.mv_portfolio_summary(client_name);

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY finance_ppm.mv_portfolio_summary;
```

---

## Migration Scripts

### Migration 001: Core Schema
```sql
-- supabase/migrations/20251207_001_finance_ppm_core.sql
CREATE SCHEMA IF NOT EXISTS finance_ppm;

-- (Include all CREATE TABLE statements from above)

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON finance_ppm.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financials_updated_at 
  BEFORE UPDATE ON finance_ppm.project_financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration 002: Views & RLS
```sql
-- supabase/migrations/20251207_002_finance_ppm_views_rls.sql

-- (Include all CREATE VIEW statements)

-- Enable RLS
ALTER TABLE finance_ppm.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.project_financials ENABLE ROW LEVEL SECURITY;

-- (Include all CREATE POLICY statements)
```

### Migration 003: Integration
```sql
-- supabase/migrations/20251207_003_finance_ppm_integration.sql

-- Link to Procure
ALTER TABLE finance_ppm.projects 
  ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);

-- Link to T&E
ALTER TABLE te.expense_lines 
  ADD COLUMN finance_ppm_project_id uuid REFERENCES finance_ppm.projects(id);

-- Link to Gearroom
ALTER TABLE gear.checkouts 
  ADD COLUMN finance_ppm_project_id uuid REFERENCES finance_ppm.projects(id);

-- (Include integration views)
```

---

**Status:** Phase 2 Complete ✅  
**Next:** Phase 3 - RAG Infrastructure (Embeddings, Search, Tools)  
**Tables:** 7 core + 6 views  
**Integration Points:** Procure, T&E, Gearroom