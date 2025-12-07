# Finance PPM - Accounting Firm Portal - Phase 0 Summary

**Date:** 2025-12-07  
**Phase:** 0 - Context Discovery ✅ COMPLETE

---

## What We Discovered

### Current State

**6 Applications in TBWA Agency Databank:**

| # | Application | Status | Database | Frontend | AI/RAG |
|---|-------------|--------|----------|----------|--------|
| 1 | Rate Card Pro | ✅ Operational | ✅ | ✅ | ❌ |
| 2 | Travel & Expense | ✅ Operational | ✅ | ✅ | ✅ |
| 3 | Gearroom | ✅ Operational | ✅ | ✅ | ✅ |
| 4 | Procure | ✅ Operational | ✅ | ✅ | ✅ |
| 5 | Finance PPM | ⚠️ Placeholder | ⚠️ Docs only | ⚠️ Placeholder | ✅ Infrastructure |
| 6 | Agency Workroom | ⚠️ DB Complete | ✅ Deployed | ⚠️ Placeholder | ✅ Schema ready |

### Finance PPM Current State

**What Exists:**
- ✅ Placeholder UI (`/FinancePPMApp.tsx`) - Notion-style sidebar nav
- ✅ Database schema documented (`/docs/finance/FINANCE_PPM_RAG_DATA_MODEL.md`)
- ✅ RAG infrastructure (AIHub with pgvector) - reusable
- ✅ Integration points identified (Procure, T&E, Gearroom, Agency)
- ✅ Project financials model (budget vs actual, margin, variance)

**What's Missing:**
- ❌ **Migrations not deployed** (schema only in docs)
- ❌ **No CRM/Pipeline** (Lead → Opportunity → Engagement)
- ❌ **No Timesheets** (billable time tracking for finance projects)
- ❌ **No WIP tracking** (work in progress calculation)
- ❌ **No Invoicing** (invoice generation, billing methods)
- ❌ **No AR/AP** (accounts receivable/payable management)
- ❌ **No Document workspace** (SOWs, contracts, eSign)
- ❌ **No role-based dashboards** (Partner, AM, PM, Staff)
- ❌ **No accounting firm workflows** (Odoo-style lead-to-cash)

---

## Gap Analysis: What We Need to Build

### 1. CRM & Pipeline (NEW)

**Entities:**
- `crm.leads` - Prospect/lead master
- `crm.opportunities` - Sales opportunities with probability, expected value
- `crm.activities` - Follow-up tasks, calls, meetings

**Workflows:**
- Lead capture → Qualification → Opportunity → Won/Lost
- Probability-weighted revenue forecasting
- Opportunity → Engagement conversion

**UI:**
- `/ppm/crm-pipeline` - Kanban board (prospect, qualified, proposal, negotiation, won, lost)
- Lead detail view, opportunity detail view
- Activity timeline

### 2. Engagement Management (NEW)

**Entities:**
- `finance_ppm.engagements` - High-level client engagement (parent to projects)
- `finance_ppm.engagement_contracts` - SOWs, MSAs, WOs
- `finance_ppm.billing_schedules` - Retainer schedules, milestone billing

**Workflows:**
- Opportunity → Engagement conversion
- Contract upload, eSign integration
- Engagement → Project breakdown

**UI:**
- `/ppm/engagements` - Engagement list with filters
- Engagement detail (scope, team, billing, projects, documents)

### 3. Timesheets (EXTEND from Agency)

**Current:** `agency.timesheet_entries` exists for agency campaigns  
**Need:** Similar for finance projects, with:
- Link to `finance_ppm.projects` instead of `agency.campaigns`
- Rate card integration (lookup from `procure.rate_cards`)
- Billable vs non-billable classification
- Approval workflow (staff → PM → finance)

**UI:**
- `/ppm/timesheets` - Personal timesheet grid (week view)
- Manager approval queue
- Billable hours analytics

### 4. WIP Tracking (NEW)

**Entities:**
- `finance_ppm.wip_entries` - WIP calculation snapshots

**Calculation:**
```
WIP = (Timesheet hours × Billable rate) + Expenses - Invoiced amount
```

**Workflows:**
- Auto-calculate WIP nightly
- WIP aging (0-30, 31-60, 61-90, 90+ days)
- WIP → Invoice conversion

**UI:**
- `/ppm/billing` - WIP listing with filters
- WIP detail by project
- "Create Invoice" button

### 5. Invoicing (NEW)

**Entities:**
- `finance_ppm.invoices` - Invoice header
- `finance_ppm.invoice_lines` - Line items (time, expenses, fees)
- `finance_ppm.invoice_payments` - Payment tracking

**Billing Methods:**
- **Time & Materials** - Bill actuals from timesheets
- **Fixed Fee** - Bill based on milestones
- **Retainer** - Recurring monthly billing
- **Milestone** - Bill when deliverable approved

**UI:**
- Invoice list, invoice detail
- Invoice PDF generation
- Payment recording

### 6. AR/AP Management (NEW)

**Entities:**
- `finance_ppm.receivables` - AR tracking
- `finance_ppm.payments` - Payment receipts
- `finance_ppm.collection_activities` - Follow-up actions

**Workflows:**
- AR aging buckets (current, 30, 60, 90, 90+)
- Payment allocation to invoices
- Collection reminders

**UI:**
- `/ppm/accounting` - AR aging dashboard
- Payment recording form
- Collection tracker

### 7. Document Workspace (NEW)

**Entities:**
- `finance_ppm.documents` - Document metadata
- Integration with Supabase Storage

**Features:**
- Per-engagement document folders
- Document tagging (contract, sow, po, report)
- Version control
- eSign status tracking

**UI:**
- `/ppm/documents` - Document explorer (folder tree)
- Document upload, preview, download
- eSign initiation

### 8. Role-Based Dashboards (NEW)

**Partner/Finance Director Dashboard:**
- Firm-wide KPIs (active engagements, WIP, billed vs unbilled, utilization, AR aging)
- Profitability by client/portfolio
- Risk indicators (projects over budget, AR overdue)

**Account Manager Dashboard:**
- Client pipeline (my clients only)
- WIP ready to invoice
- Upcoming deadlines

**Project Manager Dashboard:**
- Project status (assigned projects)
- Task completion %
- Budget burn rate

**Staff Accountant Dashboard:**
- WIP summary
- AR aging
- Invoice queue

**UI:**
- `/ppm/dashboard` with role-based widgets

---

## Reusable Assets

### From Agency Workroom ✅

**Tables to Reuse Pattern:**
- `agency.timesheet_entries` → Create `finance_ppm.timesheet_entries`
- `agency.clients` → Link `finance_ppm.engagements.client_id`
- `agency.knowledge_documents` → Pattern for `finance_ppm.knowledge_documents`

**7 SQL Migrations (15 tables, 6 views, 50+ indexes, 38+ RLS policies):**
- Clean migration structure
- RLS templates
- Audit triggers
- Auto-versioning pattern

### From Procure ✅

**Tables to Link:**
- `procure.project_quotes` → `finance_ppm.projects.procure_quote_id`
- `procure.rate_cards` → Use for timesheet rate lookup
- `procure.vendors` → Link for vendor invoices

**AI Rate Advisor:**
- Reuse `RateAdvisorWizard` logic
- Extend to engagement budgeting

### From T&E ✅

**Tables to Link:**
- `te.expense_lines.agency_campaign_id` → Also link to `finance_ppm.projects`

**UI Components:**
- `ExpenseReportForm` → Pattern for timesheet entry
- `TEAnalyticsDashboard` → Pattern for finance dashboards

### AIHub RAG ✅

**Infrastructure Ready:**
- `aihub.knowledge_chunks` (pgvector)
- `aihub.sessions`, `aihub.messages`
- Embedding pipeline (OpenAI ada-002)
- Notion sync capability

**To Extend:**
- Add `FINANCE_PPM` workspace
- Add accounting-specific knowledge docs
- Implement finance-aware tools (get_project_profitability, get_wip_summary, get_ar_aging)

---

## Technology Decisions

### Database
- **PostgreSQL** (Supabase) ✅
- **pgvector** for embeddings ✅
- **Schema:** `finance_ppm.*` (new), `crm.*` (new)
- **Multi-tenant:** `tenant_id` on all tables ✅
- **RLS:** Role-based policies ✅

### Frontend
- **React + TypeScript** ✅
- **Tailwind CSS + shadcn/ui** ✅
- **Color:** `#D4AC0D` (Gold) ✅
- **Icon:** 🧠 (Brain) ✅

### AI/RAG
- **OpenAI GPT-4** for chat ✅
- **OpenAI ada-002** for embeddings ✅
- **pgvector** for similarity search ✅
- **Notion API** for knowledge sync ✅

---

## Odoo Accounting Firm Mapping

### Odoo Apps → TBWA Finance PPM

| Odoo App | TBWA Equivalent | Status |
|----------|-----------------|--------|
| **CRM** | `/ppm/crm-pipeline` | ❌ To build |
| **Sales** | Engagement conversion | ❌ To build |
| **Project** | `/ppm/projects/:id` | ⚠️ Partial (needs extension) |
| **Timesheets** | `/ppm/timesheets` | ❌ To build (reuse agency pattern) |
| **Accounting (Invoicing)** | `/ppm/billing` | ❌ To build |
| **Accounting (AR/AP)** | `/ppm/accounting` | ❌ To build |
| **Documents** | `/ppm/documents` | ❌ To build |
| **Sign** | eSign integration | ❌ To build (future) |

### Key Odoo Workflows Mapped

1. **Lead to Cash:**
   ```
   Lead (CRM) → Opportunity (CRM) → Engagement → Project → Timesheet → WIP → Invoice → Payment
   ```

2. **Project Delivery:**
   ```
   Engagement → Tasks → Time Entry → WIP → Invoice → Payment
   ```

3. **Month-End Close:**
   ```
   WIP Calculation → Revenue Recognition → AR Aging → Financial Reports
   ```

---

## Roles & Permissions

### 6 Roles Defined

1. **Partner / Finance Director** - Full P&L visibility, approvals
2. **Account Manager** - Client pipeline, WIP, billing
3. **Project Manager** - Project tasks, timesheets, budgets
4. **Staff Accountant** - Invoices, payments, reconciliations
5. **Creative / Consultant** - Task execution, time entry
6. **Client** - Portal access (invoices, docs, status)

### RLS Strategy

**Pattern:**
```sql
-- Tenant isolation (all roles)
WHERE tenant_id = current_setting('app.current_tenant')

-- Role-based visibility
AND (
  role = 'partner' OR role = 'finance_director'  -- Full access
  OR (role = 'account_manager' AND client_id IN (SELECT ...))  -- Client-scoped
  OR (role = 'project_manager' AND project_id IN (SELECT ...))  -- Project-scoped
  OR (role = 'consultant' AND employee_id = current_user_id)  -- Self-only
)

-- Field masking
SELECT
  CASE WHEN role IN ('partner', 'finance_director') THEN internal_cost ELSE NULL END AS internal_cost,
  ...
```

---

## Integration Architecture

```
┌──────────────┐
│  CRM (NEW)   │ Lead → Opportunity
└──────┬───────┘
       │ Convert
       ▼
┌──────────────┐
│  Engagement  │ SOW, Contract
│   (NEW)      │
└──────┬───────┘
       │ Create budget
       ▼
┌──────────────┐
│   PROCURE    │ Rate cards + Quote
│  (Existing)  │
└──────┬───────┘
       │ Create project
       ▼
┌─────────────────────┐
│  FINANCE PPM        │
│  Projects (Partial) │
└──────┬──────────────┘
       │
       ├─► Timesheets (NEW) → WIP (NEW)
       │
       ├─► T&E Expenses (Existing) → WIP
       │
       └─► Agency Campaigns (Link) → Costs
              │
              ▼
┌──────────────────┐
│  INVOICING (NEW) │ WIP → Invoice
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│  AR/AP (NEW) │ Payment → Cash
└──────────────┘
```

---

## Success Metrics

### Functional
- [ ] Partner can see firm-wide profitability by client
- [ ] AM can convert opportunity → engagement → project in <5 mins
- [ ] PM can see project budget burn rate in real-time
- [ ] Staff can generate invoice from WIP in <2 mins
- [ ] AI can answer "What is the margin on Project X?" with cited sources
- [ ] AI can answer "Show me AR aging for Client Y" with data table

### Non-Functional
- [ ] Dashboard loads in <2 seconds
- [ ] AI response in <5 seconds
- [ ] Support 50+ concurrent users
- [ ] 99.9% uptime during month-end close
- [ ] No cross-tenant data leakage (verified by security audit)

---

## Next Phase

### Phase 1: UI/UX Mapping

**Deliverable:** `PPM_ACCOUNTING_FIRM_UI_MAP.md`

**Tasks:**
1. Define all routes (10 main routes)
2. Document user journeys for each role
3. Define KPIs and metrics per view
4. Map data requirements to database schema
5. Wireframe key screens
6. Define filters, interactions, permissions

**Routes to Document:**
- `/ppm/dashboard` - Role-based home
- `/ppm/crm-pipeline` - Lead → Opportunity Kanban
- `/ppm/engagements` - Engagement list & detail
- `/ppm/projects/:id` - Project workspace (tabs: Overview, Tasks, Timesheets, Budget, Invoices, Docs)
- `/ppm/timesheets` - Personal timesheet + approvals
- `/ppm/billing` - WIP & invoicing
- `/ppm/accounting` - AR/AP cockpit
- `/ppm/documents` - Document workspace
- `/ppm/ai-assistant` - NotebookLM-style AI console
- `/ppm/settings` - Configuration

**Estimated Time:** 4-6 hours

---

## Files Created

- ✅ `/docs/ppm/PPM_ACCOUNTING_FIRM_CURRENT_STATE.md` (7,000+ words)
- ✅ `/docs/ppm/PHASE_0_SUMMARY.md` (This file)

---

**Phase 0 Status:** ✅ COMPLETE  
**Next:** Phase 1 - UI/UX Mapping  
**Ready to Proceed:** Yes  
**Last Updated:** 2025-12-07
