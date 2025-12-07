# Finance PPM - Accounting Firm Portal - Migration Guide

**Migration Prefix:** `20251207_10X_ppm_*.sql`  
**Total Migrations:** 8 files  
**Status:** Phase 3 Complete ✅

---

## Overview

These migrations create the complete database schema for the Finance PPM (Project & Portfolio Management) Accounting Firm portal, inspired by Odoo's Accounting Firm package.

**Workflow Coverage:** Lead → Opportunity → Engagement → Project → Timesheets → WIP → Invoice → Payment

---

## Migration Files (Ordered)

### 1. `20251207_100_ppm_crm_schema.sql`
**Purpose:** Create CRM schema for lead and opportunity pipeline

**Objects Created:**
- Schema: `crm`
- Tables: `crm.leads`, `crm.opportunities`, `crm.activities` (3 tables)
- Indexes: 18 indexes
- Triggers: 3 auto-update triggers
- Foreign Keys: `lead_id → leads(id)`, `opportunity_id → opportunities(id)`

**Features:**
- Lead capture and qualification
- Opportunity tracking with probability and expected value
- Activity logging (calls, meetings, emails)
- Weighted value calculation (expected_value × probability)
- Stage progression (prospect → qualified → proposal → negotiation → won/lost)

---

### 2. `20251207_101_ppm_engagements_projects.sql`
**Purpose:** Create core PPM tables (engagements, projects, tasks, financials)

**Objects Created:**
- Schema: `finance_ppm`
- Tables: `finance_ppm.engagements`, `finance_ppm.projects`, `finance_ppm.tasks`, `finance_ppm.project_financials` (4 tables)
- Indexes: 32 indexes
- Triggers: 4 auto-update triggers
- Generated Columns: `margin_amount`, `margin_pct`, `variance_amount`, `variance_pct`
- Foreign Keys: `engagement_id → engagements(id)`, `project_id → projects(id)`, `crm_opportunity_id → crm.opportunities(id)`

**Features:**
- Engagement-level contracts (parent to projects)
- Project-level delivery tracking
- Task management with estimates
- Monthly financial snapshots (budget vs actual, margin, variance)
- Integration points: `procure_quote_id`, `agency_campaign_id`

---

### 3. `20251207_102_ppm_timesheets.sql`
**Purpose:** Create timesheet tracking for billable time

**Objects Created:**
- Tables: `finance_ppm.timesheet_entries` (1 table)
- Indexes: 10 indexes
- Triggers: 3 triggers (week_start_date auto-calc, update_updated_at, sync task.actual_hours)
- Generated Columns: `cost_amount`, `bill_amount`
- Helper Functions: `get_employee_billing_rate`, `calculate_project_time_wip`

**Features:**
- Billable time tracking per employee × project × task × date
- Approval workflow (draft → submitted → approved → rejected)
- Rate card integration (cost_rate, bill_rate)
- Auto-calculate week_start_date (Monday of week)
- Auto-update task.actual_hours when timesheets approved
- WIP calculation support

---

### 4. `20251207_103_ppm_invoicing.sql`
**Purpose:** Create invoicing, payments, WIP, and AR collection tables

**Objects Created:**
- Tables: `finance_ppm.invoices`, `finance_ppm.invoice_lines`, `finance_ppm.payments`, `finance_ppm.wip_entries`, `finance_ppm.collection_activities` (5 tables)
- Indexes: 34 indexes
- Triggers: 4 triggers (auto-update paid_amount on payment, mark overdue)
- Generated Columns: `balance` (invoices), `net_amount` (payments), `total_wip`, `age_bucket` (wip_entries)
- Helper Function: `mark_invoices_overdue` (scheduled job)

**Features:**
- Invoice generation from WIP
- Multiple billing methods (T&M, fixed fee, milestone, retainer)
- PH-specific: Withholding tax support, BIR Form 2307 certificates, VAT 12%
- Payment recording with auto-allocation
- WIP calculation and aging (0-30, 31-60, 61-90, 90+ days)
- AR collection tracking
- Auto-update invoice status (sent → partial → paid → overdue)

---

### 5. `20251207_104_ppm_documents.sql`
**Purpose:** Create document management for engagements

**Objects Created:**
- Tables: `finance_ppm.documents`, `finance_ppm.document_versions` (2 tables)
- Indexes: 11 indexes
- Triggers: 2 triggers (auto-update, auto-version on replace)
- Helper Function: `get_engagement_documents`

**Features:**
- Document metadata (SOWs, contracts, POs, reports, deliverables)
- Version control (auto-create version history on replace)
- eSign status tracking (not_required, pending, signed, declined)
- Document tagging and categorization
- Supabase Storage integration

---

### 6. `20251207_105_ppm_ai_rag.sql`
**Purpose:** Create AI/RAG tables with pgvector for knowledge base

**Objects Created:**
- Extension: `vector` (pgvector)
- Tables: `finance_ppm.knowledge_documents`, `finance_ppm.knowledge_chunks`, `finance_ppm.ai_sessions`, `finance_ppm.ai_messages` (4 tables)
- Indexes: 13 indexes (including ivfflat vector index)
- Vector Index: `ivfflat` on `knowledge_chunks.embedding` (1536 dims, 100 lists)
- Triggers: 3 triggers (auto-update, auto-generate session title)
- Functions: `search_knowledge` (vector similarity with RBAC), `chunk_document_text`

**Features:**
- Knowledge document storage (Notion, local docs, policies, SOPs)
- Text chunking and vector embeddings (OpenAI ada-002, 1536 dims)
- Vector similarity search with role-based access control
- AI chat session management
- Message history with sources and structured data (tables, charts)
- Tool call tracking
- Visibility levels (public, internal, finance_only, partner_only)

---

### 7. `20251207_106_ppm_analytics_views.sql`
**Purpose:** Create 9 analytics views for dashboards and reports

**Objects Created:**
- Schema: `analytics`
- Views: 9 analytics views

**Views:**
1. **`v_ppm_firm_overview`** - Firm-wide KPIs (active engagements, WIP, AR, utilization)
2. **`v_engagement_profitability`** - Engagement-level P&L (margin, variance, WIP, AR)
3. **`v_wip_summary`** - WIP by project (time, expenses, aging, ready to invoice)
4. **`v_ar_aging`** - AR aging analysis (age buckets, collection tracking)
5. **`v_utilization_by_role`** - Team utilization (hours, capacity, billable %)
6. **`v_pipeline_summary`** - CRM pipeline metrics (by stage, win rate)
7. **`v_project_profitability`** - Project-level P&L (margin, variance, completion %)
8. **`v_revenue_by_client`** - Client revenue ranking (YTD, margin, AR, WIP)
9. **`v_month_end_checklist`** - Month-end close status (timesheets, WIP, invoicing)

**Features:**
- Pre-aggregated metrics for dashboard performance
- Tenant-aware (all views respect RLS on base tables)
- Role-aware (sensitive data masked via RLS)
- Optimized for reporting and analytics

---

### 8. `20251207_107_ppm_rls_policies.sql` ⭐
**Purpose:** Create comprehensive RLS policies for multi-tenant, role-based access

**Objects Created:**
- RLS Policies: 40+ policies across 19 tables
- Helper Functions: `current_tenant_id`, `current_user_id`, `current_role`, `has_role`
- Role-Aware Views: `v_projects_role_aware`, `v_timesheets_role_aware`

**RLS Strategy:**

**Tenant Isolation (All Tables):**
```sql
tenant_id = auth.current_tenant_id()
```

**Role-Based Access (6 Roles):**

| Role | Access Scope | Margin Visibility | Typical Policies |
|------|--------------|-------------------|------------------|
| **Partner** | Firm-wide | ✅ Yes | Full SELECT/UPDATE on all tables |
| **Finance Director** | Firm-wide | ✅ Yes | Full SELECT/UPDATE on all tables |
| **Account Manager** | Own clients only | ❌ No | WHERE owner_id = current_user_id() |
| **Project Manager** | Assigned projects | ❌ No | WHERE project.owner_id = current_user_id() |
| **Staff Accountant** | All invoices/payments | ⚠️ Cost only | SELECT on invoices/payments, no projects |
| **Consultant** | Own tasks/timesheets | ❌ No | WHERE employee_id = current_user_id() |

**Field Masking:**
- `actual_cost`, `cost_rate`, `cost_amount` - Finance roles only
- `margin_pct`, `margin_amount` - Finance roles only
- `bill_rate`, `bill_amount` - Finance roles only

**Session Variables Required:**
```sql
SET app.current_tenant = '<tenant_uuid>';
SET app.current_user_id = '<user_uuid>';
SET app.current_role = 'partner' | 'finance_director' | 'account_manager' | ...;
```

---

## Database Statistics

**Total Objects Created:**
- **Schemas:** 2 (crm, finance_ppm) + 1 (analytics)
- **Tables:** 19 core tables
- **Views:** 9 analytics views + 2 role-aware views
- **Indexes:** 100+ indexes (including 1 pgvector ivfflat)
- **Triggers:** 17 triggers
- **Functions:** 10+ helper functions
- **RLS Policies:** 40+ policies
- **Generated Columns:** 10+ auto-calculated columns

**Table Breakdown:**
- CRM: 3 tables (leads, opportunities, activities)
- Core PPM: 11 tables (engagements, projects, tasks, financials, timesheets, invoices, etc.)
- Documents: 2 tables (documents, document_versions)
- AI/RAG: 4 tables (knowledge_documents, knowledge_chunks, ai_sessions, ai_messages)
- WIP/AR: 3 tables (wip_entries, payments, collection_activities)

---

## Execution Order

**IMPORTANT:** Migrations must be run in order (100 → 107) due to foreign key dependencies.

**Recommended Execution:**
```bash
# Run all migrations in order
psql $DATABASE_URL -f /supabase/migrations/20251207_100_ppm_crm_schema.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_101_ppm_engagements_projects.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_102_ppm_timesheets.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_103_ppm_invoicing.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_104_ppm_documents.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_105_ppm_ai_rag.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_106_ppm_analytics_views.sql
psql $DATABASE_URL -f /supabase/migrations/20251207_107_ppm_rls_policies.sql
```

**OR** use Supabase CLI:
```bash
supabase db push
```

---

## Testing RLS Policies

**Test with different roles:**

```sql
-- Test as Partner (full access)
SET app.current_tenant = 'tenant-uuid-here';
SET app.current_user_id = 'partner-user-uuid';
SET app.current_role = 'partner';

SELECT * FROM finance_ppm.engagements; -- Should see all
SELECT * FROM finance_ppm.v_projects_role_aware; -- Should see margin_pct

-- Test as Account Manager (client-scoped)
SET app.current_tenant = 'tenant-uuid-here';
SET app.current_user_id = 'am-user-uuid';
SET app.current_role = 'account_manager';

SELECT * FROM finance_ppm.engagements; -- Should see only owned
SELECT * FROM finance_ppm.v_projects_role_aware; -- margin_pct should be NULL

-- Test as Consultant (own tasks only)
SET app.current_tenant = 'tenant-uuid-here';
SET app.current_user_id = 'consultant-user-uuid';
SET app.current_role = 'consultant';

SELECT * FROM finance_ppm.tasks; -- Should see only assigned tasks
SELECT * FROM finance_ppm.timesheet_entries; -- Should see only own timesheets
```

---

## Rollback Strategy

**Since migrations are idempotent and non-destructive:**
- `CREATE IF NOT EXISTS` ensures re-running is safe
- `CREATE OR REPLACE` for views/functions
- No `DROP` statements (except for trigger recreation)

**Manual Rollback (if needed):**
```sql
-- Drop in reverse order
DROP SCHEMA IF EXISTS analytics CASCADE;
DROP SCHEMA IF EXISTS finance_ppm CASCADE;
DROP SCHEMA IF EXISTS crm CASCADE;
DROP EXTENSION IF EXISTS vector;
```

⚠️ **Warning:** This will delete all data. Only use in development.

---

## Integration Points

### Procure App
```sql
-- Link project to Procure quote
finance_ppm.projects.procure_quote_id → procure.project_quotes.id
```

### Agency Workroom
```sql
-- Link project to Agency campaign
finance_ppm.projects.agency_campaign_id → agency.campaigns.id
```

### T&E App
```sql
-- Link invoice line to T&E expense
finance_ppm.invoice_lines.expense_line_id → te.expense_lines.id
```

### Gearroom
```sql
-- (Future integration for equipment costs on projects)
```

---

## Next Steps (Phase 4+)

### Phase 4: Seed Demo Data
- Generate 100+ leads, 80-120 engagements, 150+ projects
- Create 50,000+ timesheet entries
- Generate 300+ invoices with payments
- Seed knowledge base (100+ documents, 5,000+ chunks)
- **Script:** `tools/seed_ppm_accounting_firm.ts`

### Phase 5: AI/RAG Edge Functions
- `finance-ppm-rag-search` - Vector similarity search
- `finance-ppm-embed-docs` - Embedding pipeline
- `finance-ppm-query` - Orchestration
- `finance-ppm-tools` - Live data tools
- `finance-ppm-notion-sync` - Daily sync job

### Phase 6: Frontend UI
- Implement 10 main routes (Dashboard, CRM, Engagements, Projects, Timesheets, Billing, Accounting, Documents, AI Assistant, Settings)
- Build 50+ React components (`/components/finance/`)
- Wire up analytics views to dashboards
- Implement role-based UI visibility

---

## Troubleshooting

### pgvector Extension Not Available
```sql
-- Install pgvector extension
CREATE EXTENSION vector;

-- If error, install on server first:
-- Ubuntu/Debian: sudo apt-get install postgresql-15-pgvector
-- OR use Supabase (pgvector pre-installed)
```

### RLS Policies Blocking Queries
```sql
-- Check current session variables
SELECT 
  current_setting('app.current_tenant', true) AS tenant,
  current_setting('app.current_user_id', true) AS user_id,
  current_setting('app.current_role', true) AS role;

-- Set missing variables
SET app.current_tenant = 'your-tenant-uuid';
SET app.current_user_id = 'your-user-uuid';
SET app.current_role = 'partner';
```

### Foreign Key Violations
- Ensure migrations run in order (100 → 107)
- Check that referenced tables exist before creating foreign keys

---

## Migration Validation

**After running all migrations, verify:**

```sql
-- Count tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema IN ('crm', 'finance_ppm');
-- Expected: 19 tables

-- Count views
SELECT COUNT(*) FROM information_schema.views 
WHERE table_schema = 'analytics';
-- Expected: 9 views

-- Count RLS policies
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname IN ('crm', 'finance_ppm');
-- Expected: 40+ policies

-- Verify pgvector index
SELECT indexname FROM pg_indexes 
WHERE indexname LIKE '%embedding%';
-- Expected: idx_finance_ppm_knowledge_chunks_embedding
```

---

## Support

**Documentation:**
- Phase 0: `/docs/ppm/PPM_ACCOUNTING_FIRM_CURRENT_STATE.md`
- Phase 1: `/docs/ppm/PPM_ACCOUNTING_FIRM_UI_MAP.md`
- Phase 2: `/docs/ppm/PPM_ACCOUNTING_FIRM_DATA_MODEL.md`

**Status:** Phase 3 Complete ✅  
**Last Updated:** 2025-12-07
