# Finance PPM - Accounting Firm Portal - Current State Analysis

**Date:** 2025-12-07  
**Repo:** TBWA Agency Databank  
**Target:** Finance PPM (Accounting Firm-Style Portal)  
**Phase:** 0 - Context Discovery

---

## Executive Summary

The TBWA Agency Databank has **6 applications** with varying states of completion. This document analyzes the **Finance PPM** application to transform it into a comprehensive **Odoo Accounting Firm–style portal** covering the full engagement lifecycle: **lead → engagement → project → timesheets → WIP → invoice → cash**.

**Current State:**
- ✅ **Placeholder UI exists** (`/FinancePPMApp.tsx`)
- ✅ **Database schema designed** (`finance_ppm.*` schema documented)
- ✅ **RAG infrastructure exists** (AIHub with pgvector)
- ✅ **Integration points identified** (Procure, T&E, Gearroom, Agency Workroom)
- ❌ **Migrations not deployed** (schema exists only in docs)
- ❌ **No accounting-firm specific features** (CRM, WIP, invoicing, AR/AP)
- ❌ **No frontend implementation** (only placeholder UI)

**Gap Analysis:**
- Need to extend from **project financials** → **full accounting firm workflows**
- Need to add **CRM/pipeline**, **timesheets**, **WIP tracking**, **invoicing**, **AR/AP**
- Need to implement **role-based access** (Partner, Finance Director, Account Manager, PM, Staff)
- Need to build **NotebookLM-style AI assistant** with accounting context

---

## Repository Structure

### Current Applications (6)

| App | File | Status | Color | Icon |
|-----|------|--------|-------|------|
| **Rate Card Pro** | `/RateCardProApp.tsx` | ✅ Operational | #386641 Green | 📊 |
| **Travel & Expense** | `/TEApp.tsx` | ✅ Operational | #0070F2 Blue | ✈️ |
| **Gearroom** | `/GearApp.tsx` | ✅ Operational | #7C3AED Purple | 📦 |
| **Procure** | `/ProcureApp.tsx` | ✅ Operational | #0EA5E9 Sky | 💼 |
| **Finance PPM** | `/FinancePPMApp.tsx` | ⚠️ Placeholder | #D4AC0D Gold | 🧠 |
| **Agency Workroom** | `/AgencyApp.tsx` | ⚠️ DB Complete | #EC4899 Pink | 🎨 |

### Component Structure

```
/components/
├── te/                          # ✅ T&E components
│   ├── ExpenseReportForm.tsx
│   ├── CashAdvanceForm.tsx
│   └── TEAnalyticsDashboard.tsx
├── gear/                        # ✅ Gearroom components
│   ├── ItemCatalog.tsx
│   ├── CheckoutForm.tsx
│   └── GearAnalyticsDashboard.tsx
├── procure/                     # ✅ Procure components
│   ├── RateCardManager.tsx
│   ├── ProjectQuoteBuilder.tsx
│   └── RateAdvisorWizard.tsx (AI-powered)
├── finance/                     # ❌ NOT YET CREATED
│   └── (needs to be built)
└── ui/                          # ✅ Shared UI library
```

### Documentation

```
/docs/
├── README.md
├── aihub-rag-assistant.md       # ✅ Existing RAG architecture
├── te-database-schema.md        # ✅ T&E schema
├── gear-database-schema.md      # ✅ Gearroom schema
├── procure-database-schema.md   # ✅ Procure schema
├── agency/                      # ✅ Agency Workroom (Phase 3 complete)
│   ├── AGENCY_WORKROOM_DATA_MODEL.md
│   ├── AGENCY_WORKROOM_UI_MAP.md
│   └── PHASE_3_COMPLETE.md
├── finance/                     # ⚠️ PARTIAL - Needs extension
│   ├── FINANCE_PPM_RAG_CURRENT_STATE.md      # ✅ Exists
│   ├── FINANCE_PPM_RAG_DATA_MODEL.md         # ✅ Exists (partial)
│   ├── FINANCE_PPM_RAG_INFRASTRUCTURE.md     # ✅ Exists
│   └── FINANCE_PPM_RAG_UI_MAP.md             # ✅ Exists (minimal)
└── ppm/                         # ⭐ NEW - This directory
    └── PPM_ACCOUNTING_FIRM_CURRENT_STATE.md  # This file
```

---

## Existing Database Schemas

### Current Supabase Migrations

#### ✅ **Agency Workroom** (Complete - 15 tables)
```
/supabase/migrations/
├── 20251207_001_agency_core_schema.sql
├── 20251207_002_agency_artifacts.sql
├── 20251207_003_agency_timesheets.sql
├── 20251207_004_agency_integration.sql
├── 20251207_005_agency_ai_rag.sql
├── 20251207_006_agency_views.sql
└── 20251207_007_agency_rls_policies.sql
```

**Tables:**
- `agency.clients`, `agency.brands`, `agency.campaigns`, `agency.campaign_phases`
- `agency.artifacts`, `agency.artifact_versions`, `agency.artifact_comments`
- `agency.timesheet_entries`, `agency.team_allocations`
- `agency.knowledge_documents`, `agency.knowledge_chunks`
- `agency.ai_conversations`, `agency.ai_messages`

**Integration Points:**
- `agency.campaigns.procure_quote_id` → `procure.project_quotes`
- `finance_ppm.projects.agency_campaign_id` → `agency.campaigns` (planned)
- `te.expense_lines.agency_campaign_id` → `agency.campaigns`
- `gear.checkouts.agency_campaign_id` → `agency.campaigns`

#### ⚠️ **Finance PPM** (Documented, Not Deployed)

**Schema:** `finance_ppm` (from `/docs/finance/FINANCE_PPM_RAG_DATA_MODEL.md`)

**Planned Tables:**
1. `finance_ppm.projects` - Project master
2. `finance_ppm.project_financials` - Monthly snapshots (budget, actual, revenue, margin, WIP)
3. `finance_ppm.tasks` - Project tasks
4. `finance_ppm.knowledge_documents` - Notion-synced docs
5. `finance_ppm.knowledge_chunks` - Vector embeddings
6. `finance_ppm.conversations` - AI chat sessions
7. `finance_ppm.messages` - Chat history

**Views Planned:**
- `finance_ppm.v_project_overview` - Project health
- `finance_ppm.v_portfolio_overview` - Portfolio rollups
- `finance_ppm.v_month_end_status` - Close readiness
- `finance_ppm.v_profitability_analysis` - Margin analysis

#### ✅ **Procure** (Operational - Finance Data Source)

**Schema:** `procure.*`

**Tables:**
- `procure.rate_cards` - Vendor/consultant rates
- `procure.vendors` - Vendor master
- `procure.project_quotes` - Client quotes with budget lines
- `procure.quote_lines` - Budget line items
- `procure.rate_advisor_sessions` - AI rate recommendations

**Analytics Views:**
- `analytics.v_rate_governance_metrics`
- `analytics.v_vendor_performance`
- `analytics.v_discipline_spend`

#### ✅ **T&E** (Operational - Cost Data Source)

**Schema:** `te.*`

**Tables:**
- `te.expense_reports`
- `te.expense_lines`
- `te.cash_advances`

**Analytics Views:**
- `analytics.v_te_cash_flow`

#### ✅ **Gearroom** (Operational - Asset Cost Source)

**Schema:** `gear.*`

**Tables:**
- `gear.items`
- `gear.checkouts`
- `gear.maintenance`

**Analytics Views:**
- `analytics.v_gear_utilization_cost`

---

## Gap Analysis: Project Financials → Accounting Firm

### Existing Capabilities (Finance PPM as designed)

✅ **Project Tracking:**
- Project master with client, status, dates, billing type
- Monthly financial snapshots (budget vs actual)
- Integration with Procure quotes
- Margin and variance calculations

✅ **RAG/AI Infrastructure:**
- Knowledge documents with vector embeddings
- AI conversation history
- Notion sync capability

✅ **Analytics:**
- Project profitability views
- Portfolio rollups
- Month-end status tracking

### Missing Capabilities (For Full Accounting Firm)

#### ❌ **CRM & Pipeline Management**
- No lead/opportunity tracking
- No sales pipeline (prospect → won → engagement)
- No probability-weighted revenue forecasting
- No opportunity conversion tracking

**Odoo Reference:** `crm` module - Leads/Opportunities pipeline

#### ❌ **Engagement & Contract Management**
- No engagement entity (higher level than project)
- No SOW/contract tracking
- No billing schedule definition
- No retainer vs project vs T&M distinction at engagement level

**Odoo Reference:** `project` + `sale` integration

#### ❌ **Timesheets (Billable Time Tracking)**
- Agency has `agency.timesheet_entries` but not integrated with Finance PPM
- No timesheet approval workflow
- No billable vs non-billable classification for invoicing
- No rate lookup from rate cards

**Odoo Reference:** `hr_timesheet` module

#### ❌ **WIP (Work in Progress) Tracking**
- Placeholder field exists in `project_financials.wip_amount`
- No calculation logic (time * rate + expenses)
- No WIP aging buckets
- No WIP-to-invoice conversion workflow

**Odoo Reference:** `account` module - WIP accounting

#### ❌ **Invoicing & Revenue Recognition**
- No invoice entity
- No invoice line items
- No billing methods (T&M, fixed fee, milestone, retainer)
- No revenue recognition status
- No integration with AR/AP

**Odoo Reference:** `account` module - Invoicing

#### ❌ **AR/AP Management**
- No invoice payment tracking
- No AR aging analysis
- No collection status
- No cash receipts

**Odoo Reference:** `account` module - Receivables/Payables

#### ❌ **BIR Tax & Compliance (PH-specific)**
- No tax basis calculation
- No withholding tax tracking
- No BIR reporting support

**Odoo Reference:** `l10n_ph` - Philippines localization

#### ❌ **Document Management & eSign**
- No document workspace per engagement
- No document versioning
- No eSign workflow integration
- No SOW/WO/PO tracking

**Odoo Reference:** `documents` + `sign` modules

#### ❌ **Resource Capacity Planning**
- No resource allocation/availability tracking
- No utilization forecasting
- No capacity vs demand analysis

**Odoo Reference:** `project_forecast` module

#### ❌ **Multi-Role Dashboards**
- No Partner/Finance Director dashboard
- No Account Manager/PM dashboard
- No Staff Accountant dashboard
- No role-based KPI tiles

**Odoo Reference:** Role-based views in Accounting Firm package

---

## Existing AI/RAG Infrastructure

### AIHub Architecture (Reusable)

**Database Schema:**
```sql
aihub.knowledge_chunks       -- Vector embeddings (pgvector, 1536 dims)
aihub.sessions               -- Chat sessions
aihub.messages               -- Chat history
```

**Current Workspaces:**
- `TE` - Travel & Expense
- `GEAR` - Gearroom
- `GLOBAL` - Shared policies

**Extension Required:**
- Add `FINANCE_PPM` workspace
- Add `ACCOUNTING` workspace

**Embedding Model:** OpenAI ada-002  
**Vector Index:** pgvector with ivfflat  
**Chunking:** 500-1000 tokens, 100-token overlap

### Integration with Procure AI

**Existing AI Capabilities in Procure:**
- `RateAdvisorWizard` - AI-powered rate recommendations
- Rate card analysis
- Budget estimation

**Reuse Opportunity:**
- Use same RAG infrastructure
- Share rate governance knowledge base
- Integrate AI rate suggestions into Finance PPM project budgeting

---

## Integration Architecture

### Data Flow: Procure → Finance PPM → T&E → Agency

```
┌─────────────────┐
│  CRM/Pipeline   │ (NEW - To be built)
│  Lead → Opp     │
└────────┬────────┘
         │ Convert to engagement
         ▼
┌─────────────────┐
│  PROCURE        │ (Existing)
│  Project Quote  │ Rate cards + Budget estimation
└────────┬────────┘
         │ Create finance project
         ▼
┌─────────────────────────────┐
│  FINANCE PPM                │ (To be extended)
│  Engagement/Project         │
│  Budget baseline            │
└────┬────────────────────┬───┘
     │                    │
     │ Actual costs       │ Link campaign
     ▼                    ▼
┌──────────┐         ┌─────────────────┐
│   T&E    │         │ AGENCY WORKROOM │ (Existing)
│ Expenses │         │  Campaigns      │
└──────────┘         │  Timesheets     │
                     └─────────────────┘
     │                    │
     └────────┬───────────┘
              │ Aggregate actuals
              ▼
┌─────────────────────────┐
│  FINANCE PPM            │
│  WIP Calculation        │
│  Invoice Generation     │
│  Revenue Recognition    │
└─────────────────────────┘
```

### Foreign Key Relationships

**Existing:**
```sql
-- Procure → Finance PPM
finance_ppm.projects.procure_quote_id → procure.project_quotes(id)

-- Finance PPM ← Agency
finance_ppm.projects.agency_campaign_id → agency.campaigns(id)

-- Agency → T&E
te.expense_lines.agency_campaign_id → agency.campaigns(id)

-- Agency → Gearroom
gear.checkouts.agency_campaign_id → agency.campaigns(id)
```

**To Be Added:**
```sql
-- CRM → Finance PPM
finance_ppm.engagements.crm_opportunity_id → crm.opportunities(id)

-- Finance PPM → Timesheets
finance_ppm.timesheet_entries.project_id → finance_ppm.projects(id)

-- Finance PPM → Invoices
finance_ppm.invoices.project_id → finance_ppm.projects(id)

-- Finance PPM → WIP
finance_ppm.wip_entries.project_id → finance_ppm.projects(id)

-- Finance PPM → Documents
finance_ppm.documents.engagement_id → finance_ppm.engagements(id)
```

---

## Existing PPM-Related Tables (To Reuse)

### Agency Workroom Timesheets

**Table:** `agency.timesheet_entries`

**Columns:**
- `employee_id`, `campaign_id`, `phase_id`
- `entry_date`, `week_start_date`
- `hours`, `billable`
- `internal_cost_rate`, `client_billing_rate`
- `status` (draft, submitted, approved, rejected)

**Reuse Strategy:**
- ✅ Keep for agency campaigns
- ✅ Create similar `finance_ppm.timesheet_entries` for finance projects
- ✅ Eventually unify schemas under `core.timesheets`

### Procure Rate Cards

**Table:** `procure.rate_cards`

**Columns:**
- Rate card versions
- Role-based rates (internal cost + client billing)
- Currency support
- Effective dates

**Reuse Strategy:**
- ✅ Use as source of truth for billable rates
- ✅ Link timesheet entries to rate cards
- ✅ Use for WIP valuation

---

## Multi-Tenancy & RBAC

### Tenant Isolation (Existing Pattern)

All existing schemas use `tenant_id` for multi-tenancy:
- `agency.*` tables have `tenant_id`
- RLS policies enforce tenant isolation
- Session variables: `app.current_tenant`

**To Implement:**
- All `finance_ppm.*` tables must have `tenant_id`
- RLS policies on all tables
- Session variable enforcement

### Role Definitions (To Be Implemented)

**Accounting Firm Roles:**

1. **Partner / Finance Director** (`partner`, `finance_director`)
   - Full visibility: all engagements, all clients, full P&L
   - Can see internal costs, margins, rates
   - Can approve budgets, invoices, write-offs
   - Dashboard: firm-wide KPIs, portfolio health, profitability

2. **Account Manager / Engagement Lead** (`account_manager`)
   - Client-level visibility: own clients only
   - Can see blended rates (not internal costs)
   - Can manage engagements, projects, scope
   - Dashboard: client pipeline, WIP, billing, AR

3. **Project Manager / Producer** (`project_manager`)
   - Project-level visibility: assigned projects only
   - Can see budgets, not margins
   - Can manage tasks, timesheets, deliverables
   - Dashboard: project status, capacity, deadlines

4. **Staff Accountant / Finance SSC** (`staff_accountant`)
   - Transaction-level visibility: invoices, payments, reconciliations
   - Can see AR/AP aging
   - Can process invoices, payments
   - Dashboard: WIP, AR aging, collections

5. **Creative / Consultant** (`consultant`, `creative`)
   - Task-level visibility: assigned tasks only
   - Can log time, upload deliverables
   - Cannot see rates or margins
   - Dashboard: my tasks, my timesheets

6. **Client (Portal User)** (`client`)
   - Engagement-level visibility: own company only
   - Can see approved scope, invoices, milestones
   - Cannot see internal costs or rates
   - Dashboard: project status, invoices, documents

**RLS Implementation:**
- Role stored in `auth.jwt()` claims or `core.users.role`
- Session variable: `app.current_role`
- RLS policies check both `tenant_id` AND `role`
- Views apply role-based field masking (e.g. hide `internal_cost` for non-finance)

---

## Knowledge Sources for Finance PPM

### Local Documentation (To Be Created)

**Required Docs:**
```
docs/ppm/
├── accounting-firm-overview.md          # Odoo Accounting Firm workflows
├── crm-pipeline-sop.md                  # Lead → Engagement process
├── engagement-management-guide.md       # SOW, contracts, scope
├── timesheet-policy.md                  # Time tracking rules
├── wip-calculation-guide.md             # WIP methodology
├── invoicing-procedures.md              # Billing methods, cycles
├── revenue-recognition-policy.md        # RevRec rules
├── ar-management-sop.md                 # Collections, aging
├── month-end-close-checklist.md         # Close procedures
├── bir-tax-compliance.md                # PH tax requirements
└── finance-ppm-glossary.md              # Terminology
```

### Notion Workspace (External - To Be Synced)

**Finance PPM Notion Workspace:**
- URL: `https://notion.so/tbwa-finance-ppm/` (to be configured)
- Content types:
  - Client financial playbooks
  - Engagement templates (SOWs, WOs)
  - Project close-out checklists
  - Month-end task templates
  - Finance team SOPs
  - Meeting notes & decisions

**Sync Strategy:**
- Daily scheduled sync via Notion API
- Store in `finance_ppm.knowledge_documents`
- Auto-chunk and embed with pgvector
- Metadata: `doc_type`, `client_id`, `engagement_id`, `role_access_level`

### Live Database Views (Analytics Context)

**To Be Created:**
```sql
finance_ppm.v_firm_overview          -- Firm-wide KPIs
finance_ppm.v_pipeline_summary       -- CRM pipeline metrics
finance_ppm.v_engagement_list        -- Active engagements
finance_ppm.v_project_profitability  -- Project P&L
finance_ppm.v_wip_summary            -- WIP by project/client
finance_ppm.v_ar_aging               -- AR aging buckets
finance_ppm.v_revenue_by_client      -- Client revenue ranking
finance_ppm.v_utilization_by_role    -- Resource utilization
finance_ppm.v_month_end_checklist    -- Close status
```

---

## Technology Stack

### Frontend
- **Framework:** React + TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **State:** React hooks + Supabase client
- **Charts:** Recharts
- **Theme:** TBWA branding
- **Color:** `#D4AC0D` (Gold) for Finance PPM

### Backend
- **Database:** Supabase Postgres
- **Vector DB:** pgvector extension
- **Edge Functions:** Supabase Functions (TypeScript)
- **AI:** OpenAI GPT-4 + ada-002 embeddings
- **External Sync:** Notion API

### Infrastructure
- **Hosting:** Supabase (database + edge functions)
- **Auth:** Supabase Auth with JWT
- **Storage:** Supabase Storage (documents)
- **CI/CD:** GitHub Actions

---

## Success Criteria

### Functional Requirements

#### Must Have (MVP)
- [ ] CRM pipeline: Lead → Opportunity → Engagement conversion
- [ ] Project budget baseline from Procure quotes
- [ ] Timesheet entry with billable/non-billable classification
- [ ] WIP calculation (time × rate + expenses)
- [ ] Invoice generation from WIP
- [ ] AR aging analysis
- [ ] Partner dashboard with firm-wide KPIs
- [ ] AI assistant can answer: "What is the profitability of Project X?"
- [ ] AI assistant can answer: "Show me AR aging for Client Y"
- [ ] Role-based access control (Partner sees margins, PM does not)

#### Should Have (Phase 2)
- [ ] Document workspace per engagement
- [ ] eSign workflow integration
- [ ] Revenue recognition tracking
- [ ] Resource capacity planning
- [ ] Multi-currency support (PHP, USD, EUR)
- [ ] BIR tax basis reporting (PH-specific)
- [ ] Budget vs actual variance alerts
- [ ] Automated month-end close checklist

#### Nice to Have (Future)
- [ ] Client portal (view invoices, docs, milestones)
- [ ] Mobile app for timesheet entry
- [ ] Advanced forecasting (ML-based)
- [ ] Integration with accounting systems (QuickBooks, Xero)
- [ ] Automated invoice reminders
- [ ] Payment gateway integration

### Non-Functional Requirements

- [ ] Multi-tenant: 50+ tenants supported
- [ ] Performance: Dashboard loads in <2 seconds
- [ ] AI response time: <5 seconds end-to-end
- [ ] Uptime: 99.9% (especially during month-end close)
- [ ] Security: No cross-tenant data leakage
- [ ] Compliance: GDPR/PDPA compliant (data retention, right to delete)
- [ ] Audit trail: All financial transactions logged

---

## Risk Assessment

### High Priority Risks 🔴

1. **Data Model Complexity**
   - Risk: Accounting firm workflows are complex (CRM → engagement → project → WIP → invoice)
   - Mitigation: Phase implementation, start with core entities, iterate

2. **Financial Data Accuracy**
   - Risk: AI may hallucinate financial numbers
   - Mitigation: Force tool usage for all numeric data, no free-form generation, always cite source

3. **Multi-Tenant Security**
   - Risk: Sensitive financial data must not leak across tenants
   - Mitigation: Rigorous RLS testing, automated security tests, penetration testing

4. **Notion API Rate Limits**
   - Risk: Daily sync may hit API limits for large workspaces
   - Mitigation: Incremental sync, cache, exponential backoff

### Medium Priority Risks 🟡

5. **Integration Complexity**
   - Risk: Linking Procure, T&E, Agency Workroom, Finance PPM
   - Mitigation: Well-defined foreign keys, integration views, idempotent migrations

6. **Role-Based Access Complexity**
   - Risk: 6 roles with different visibility rules
   - Mitigation: RLS templates, comprehensive test matrix, role-based views

7. **BIR Tax Compliance (PH)**
   - Risk: PH tax rules are complex and changing
   - Mitigation: Consult with PH accounting experts, modular tax module, annual review

---

## Next Steps

### Phase 0 ✅ (This Document)
- [x] Analyze existing codebase
- [x] Identify reusable components
- [x] Document gaps
- [x] Define success criteria

### Phase 1 (UI/UX Design) - NEXT
- [ ] Create `PPM_ACCOUNTING_FIRM_UI_MAP.md`
- [ ] Define all routes (Dashboard, CRM, Engagements, Projects, Timesheets, Billing, Accounting, Documents, AI Assistant, Settings)
- [ ] Document user journeys for each role
- [ ] Define KPIs and metrics per view
- [ ] Wireframe key screens

### Phase 2 (Data Model Extension)
- [ ] Create `PPM_ACCOUNTING_FIRM_DATA_MODEL.md`
- [ ] Extend `finance_ppm` schema with:
  - CRM tables (`crm.leads`, `crm.opportunities`)
  - Engagement tables (`finance_ppm.engagements`)
  - Timesheet tables (`finance_ppm.timesheet_entries`)
  - WIP tables (`finance_ppm.wip_entries`)
  - Invoice tables (`finance_ppm.invoices`, `finance_ppm.invoice_lines`)
  - AR/AP tables (`finance_ppm.payments`, `finance_ppm.receivables`)
  - Document tables (`finance_ppm.documents`)
- [ ] Define analytics views
- [ ] Define API surface

### Phase 3 (Migrations)
- [ ] Implement idempotent Supabase migrations
- [ ] Create all tables with `tenant_id`
- [ ] Create analytics views
- [ ] Add RLS policies

### Phase 4 (Seed Data)
- [ ] Generate realistic accounting firm demo data
- [ ] 100-200 leads/opportunities
- [ ] 80-120 engagements
- [ ] 50k+ timesheet entries
- [ ] WIP, invoices, payments

### Phase 5-8
- [ ] AI/RAG implementation
- [ ] RBAC implementation
- [ ] Frontend wiring
- [ ] Testing & go-live

---

## Appendix: Odoo Accounting Firm Reference

### Odoo Apps Used in Accounting Firm Package

1. **CRM** - Lead/opportunity pipeline
2. **Sales** - Quotations, sales orders
3. **Project** - Project management, tasks, timesheets
4. **Accounting** - Invoicing, AR/AP, WIP, revenue recognition
5. **Documents** - Document management, tagging
6. **Sign** - eSignature workflows
7. **Timesheets** - Time tracking, approval
8. **Employees** - Staff master data
9. **Contacts** - Client/vendor contacts

### Key Workflows

1. **Lead to Cash:**
   Lead → Opportunity (CRM) → Quotation (Sales) → Engagement/Project (Project) → Timesheet (Timesheets) → WIP (Accounting) → Invoice (Accounting) → Payment (Accounting)

2. **Project Delivery:**
   Engagement → Tasks (Project) → Time Entry (Timesheets) → Deliverable Upload (Documents) → Client Approval → Invoice

3. **Month-End Close:**
   WIP Calculation → Revenue Recognition → AR Aging → Collections → Financial Statements

---

**Status:** Phase 0 Complete ✅  
**Next:** Phase 1 - UI/UX Mapping  
**Owner:** Platform Team  
**Last Updated:** 2025-12-07
