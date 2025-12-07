# Agency Creative Workroom - Current State Analysis

**Date:** 2025-12-07  
**Repo:** TBWA Agency Databank  
**Target:** Agency Creative Workroom (Marketing Agency Workspace)

---

## Executive Summary

The TBWA Agency Databank currently has **5 operational apps** with infrastructure ready for a 6th app. The repo has comprehensive RAG infrastructure (Finance PPM), vendor rate governance (Procure), and project financial tracking - perfect foundations for an Agency Creative Workroom.

**Key Finding:** 70-80% of required infrastructure exists. We need to:
1. Create Agency-specific schemas (clients, campaigns, artifacts, timesheets)
2. Extend existing rate card infrastructure from Procure
3. Reuse Finance PPM's RAG assistant for agency-specific queries
4. Build Odoo Marketing Agency-inspired UI

---

## Current Repo Structure

### Existing Apps (5 operational)
```
/App.tsx                     # Launcher (4 apps + space for more)
/RateCardProApp.tsx          # Quote management
/TEApp.tsx                   # Travel & Expense
/GearApp.tsx                 # Equipment management
/ProcureApp.tsx              # Vendor rate governance
/FinancePPMApp.tsx           # Finance PPM with AI RAG (not yet in launcher)
```

### Component Structure
```
/components/
├── procure/                 # Rate cards, project quotes, AI advisor
│   ├── RateCardManager.tsx
│   ├── ProjectQuoteBuilder.tsx
│   └── RateAdvisorWizard.tsx
├── finance/                 # Finance PPM components (to be created)
├── te/                      # T&E components
├── gear/                    # Gearroom components
└── ui/                      # Shared UI (40+ components)
```

### Documentation
```
/docs/
├── README.md
├── aihub-rag-assistant.md          # ✅ RAG architecture
├── finance/                         # Finance PPM docs
│   ├── FINANCE_PPM_RAG_CURRENT_STATE.md
│   ├── FINANCE_PPM_RAG_DATA_MODEL.md
│   ├── FINANCE_PPM_RAG_INFRASTRUCTURE.md
│   └── FINANCE_PPM_RAG_UI_MAP.md
├── procure-database-schema.md      # ✅ Rate cards, vendors
├── te-database-schema.md
├── gear-database-schema.md
├── ocr-integration.md
└── agency/                          # ⭐ NEW - To be created
```

---

## Existing Infrastructure Reusable for Agency Workroom

### 1. Rate Card Infrastructure (Procure App)

**Schema:** `procure.*`

```sql
procure.rate_cards              -- Vendor/consultant rates
  - role_name, discipline, seniority_level, market
  - cost_rate (FD-only), client_rate, margin_pct
  - vendor_id (hidden from AMs)
  
procure.vendors                 -- Vendor master data
  - vendor_code, vendor_type, contact info
  
procure.project_quotes          -- Client quotes (can link to campaigns)
  - client_name, brand_name, campaign_type
  - total_client_amount, total_cost_amount, total_margin_pct
  
procure.quote_lines             -- Budget line items
  - role_name, discipline, quantity, client_rate, cost_rate
  - Links to rate_card_id
```

**Components:**
- `RateCardManager.tsx` - Browse & filter rate cards
- `ProjectQuoteBuilder.tsx` - Build budgets with line items
- `RateAdvisorWizard.tsx` - AI-powered rate suggestions

**Role-Based Visibility (Already Implemented):**
- Account Managers: See client rates only
- Finance Directors: See cost rates, margins, vendors

**Reusability:** 90% - Perfect for agency budget templates

---

### 2. Finance PPM Infrastructure

**Schema:** `finance_ppm.*`

```sql
finance_ppm.projects            -- Project master (can extend for campaigns)
  - project_code, client_name, brand_name
  - status, portfolio, service_line
  - procure_quote_id (link to original quote)
  
finance_ppm.project_financials  -- Monthly snapshots
  - budget_amount, actual_cost, revenue, margin_pct
  - wip_amount, ar_amount
  
finance_ppm.knowledge_documents -- RAG knowledge base
  - title, doc_type, source (notion/local)
  - tags, client_name, content
  
finance_ppm.knowledge_chunks    -- Embeddings
  - content, embedding vector(1536), metadata
```

**Components:** (To be built in Phase 5 of Finance PPM)
- AI Assistant Console
- Knowledge Browser
- Project Analytics

**Reusability:** 80% - RAG infrastructure perfect for agency artifacts

---

### 3. AIHub RAG Infrastructure

**Schema:** `aihub.*`

```sql
aihub.knowledge_chunks          -- Cross-app embeddings
  - workspace (TE, GEAR, GLOBAL, FINANCE_PPM)
  - source_type (SPEC, DOC, OCR, POLICY)
  - content, embedding vector(1536)
  
aihub.sessions                  -- Chat sessions
aihub.messages                  -- Chat history
```

**Extension Required:**
- Add `AGENCY` workspace
- Add source types: `BRIEF`, `SCRIPT`, `DECK`, `BOARD`, `LAYOUT`

---

### 4. T&E Expense Tracking

**Schema:** `te.*`

```sql
te.expense_reports              -- Expense reports
te.expense_lines                -- Individual expenses
  - Can link to finance_ppm_project_id
  - Can link to agency campaigns (future)
```

**Integration Opportunity:**
- Link expenses to campaigns for actual cost tracking
- Feed into project profitability analysis

---

## What's Missing (To Be Built)

### Agency-Specific Schemas

**Required New Tables:**

1. **Clients & Accounts** (`agency.clients`)
   ```sql
   - client_code, client_name, sector, region
   - retention_type (project/retainer)
   - primary_contact, billing_contact
   - rate_card_override_id
   ```

2. **Brands** (`agency.brands`)
   ```sql
   - client_id, brand_name, brand_code
   - launch_date, status
   ```

3. **Campaigns** (`agency.campaigns`)
   ```sql
   - campaign_code, campaign_name
   - client_id, brand_id
   - campaign_type (pitch, launch, sustain, activation)
   - start_date, end_date, status
   - budget_id (link to procure.project_quotes)
   ```

4. **Creative Artifacts** (`agency.artifacts`)
   ```sql
   - artifact_code, title, artifact_type
   - (brief, script, deck, layout, board, concept, storyboard)
   - campaign_id, client_id, brand_id
   - content (JSONB or TEXT), content_url
   - tags[], status, version
   ```

5. **Timesheets** (`agency.timesheets`)
   ```sql
   - employee_id, campaign_id, task
   - date, hours, billable, internal_cost_rate
   ```

6. **Campaign Phases/Workstreams** (`agency.campaign_phases`)
   ```sql
   - campaign_id, phase_name
   - (strategy, creative, production, post, media)
   - planned_hours, actual_hours
   ```

---

## Integration Points

### Procure → Agency
```sql
-- Link campaigns to approved quotes
ALTER TABLE agency.campaigns 
  ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);

-- Reuse rate cards for budget building
CREATE VIEW agency.v_rate_cards AS
  SELECT * FROM procure.rate_cards WHERE state = 'active';
```

### Finance PPM → Agency
```sql
-- Link campaigns to Finance PPM projects
ALTER TABLE finance_ppm.projects 
  ADD COLUMN agency_campaign_id uuid REFERENCES agency.campaigns(id);

-- Track campaign financials
CREATE VIEW agency.v_campaign_financials AS
  SELECT 
    c.campaign_code,
    pf.budget_amount,
    pf.actual_cost,
    pf.margin_pct
  FROM agency.campaigns c
  JOIN finance_ppm.projects p ON p.agency_campaign_id = c.id
  JOIN finance_ppm.project_financials pf ON pf.project_id = p.id;
```

### T&E → Agency
```sql
-- Link expenses to campaigns
ALTER TABLE te.expense_lines 
  ADD COLUMN agency_campaign_id uuid REFERENCES agency.campaigns(id);

-- Aggregate campaign costs
CREATE FUNCTION agency.aggregate_campaign_expenses(p_campaign_id uuid)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(el.amount), 0)
  FROM te.expense_lines el
  WHERE el.agency_campaign_id = p_campaign_id;
$$ LANGUAGE sql STABLE;
```

### AIHub → Agency
```sql
-- Extend AIHub for agency artifacts
INSERT INTO aihub.knowledge_chunks (workspace, source_type, content, embedding)
SELECT 
  'AGENCY',
  'BRIEF',
  a.content,
  generate_embedding(a.content)  -- Edge function
FROM agency.artifacts a
WHERE a.artifact_type = 'brief' AND a.status = 'approved';
```

---

## Existing Assets Inventory

### UI Components (Reusable)
```
✅ Card, Button, Input, Textarea, Select, Tabs
✅ Table, Badge, Dialog, Sheet, Popover
✅ Charts (Recharts integration)
✅ Skeleton loaders
✅ Toast notifications (Sonner)
✅ Form components
```

### Data Access Patterns (Established)
```typescript
// From existing apps
import { createClient } from '@supabase/supabase-js';

// Typical query pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false });
```

### RAG Patterns (Finance PPM)
```typescript
// Embedding generation
POST /functions/v1/finance-ppm-embed-docs

// Vector search
POST /functions/v1/finance-ppm-rag-search
{
  query: "What is the process for...",
  filters: { client_name, tags },
  top_k: 8
}

// Orchestration
POST /functions/v1/finance-ppm-query
{
  message: "Summarize Campaign X",
  role: "Account Manager",
  context: { campaign_id }
}
```

---

## Technology Stack (Confirmed)

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4 (custom TBWA theme)
- **UI Library:** Shadcn/ui (40+ components)
- **Charts:** Recharts
- **Forms:** React Hook Form
- **State:** React Query + Zustand
- **Icons:** Lucide React

### Backend
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth (RLS policies)
- **Storage:** Supabase Storage (for artifact files)
- **Functions:** Supabase Edge Functions (Deno)
- **Vector DB:** pgvector extension
- **AI:** OpenAI API (embeddings + GPT-4)

### Data Layer
- **ORM:** Supabase Client (typed)
- **Migrations:** Supabase CLI
- **Seeds:** TypeScript or SQL scripts

---

## Color Palette (App-Specific)

**Existing Apps:**
- Rate Card Pro: `#386641` (Forest Green)
- T&E: `#0070F2` (Blue)
- Gearroom: `#7C3AED` (Purple)
- Procure: `#0EA5E9` (Sky Blue)
- Finance PPM: `#16A34A` (Green)

**Proposed for Agency Workroom:**
- **Primary:** `#EC4899` (Pink) - Creative, vibrant
- **Secondary:** `#8B5CF6` (Purple) - Premium, agency
- **Accent:** `#F59E0B` (Amber) - Energy, campaigns

**Reasoning:** Pink/Purple conveys creativity and premium agency services, distinct from existing finance/operations apps.

---

## Current Gaps Analysis

### Critical (Must Build)

1. ❌ **Agency UI Components**
   - Client 360 view
   - Campaign Kanban board
   - Artifact library (Notion-style)
   - Timesheet entry form
   - Capacity planner

2. ❌ **Agency Database Schema**
   - `agency.clients`, `agency.brands`
   - `agency.campaigns`, `agency.campaign_phases`
   - `agency.artifacts`, `agency.artifact_versions`
   - `agency.timesheets`

3. ❌ **Agency RAG Content**
   - No seeded briefs, scripts, decks
   - No campaign templates
   - No agency playbooks

4. ❌ **Agency Analytics Views**
   - Revenue by client/brand
   - Utilization by employee
   - Campaign profitability
   - Rate realization

### Medium Priority (Can Reuse/Extend)

5. 🟡 **Rate Card Management**
   - Exists in Procure
   - Needs: Client-specific overrides, role-based visibility

6. 🟡 **Budget Templates**
   - Exists in Procure (project quotes)
   - Needs: Campaign-specific templates, phase breakdown

7. 🟡 **AI Assistant**
   - Exists in Finance PPM RAG
   - Needs: Agency-specific prompts, artifact summarization

### Low Priority (Nice to Have)

8. 🟢 **Social Media Integration**
   - Future: Pull posts from Meta/LinkedIn APIs
   - Tag posts to campaigns

9. 🟢 **Events Management**
   - Future: Track agency events, launches, activations
   - Link to campaigns

10. 🟢 **Advanced Automation**
    - Future: Workflow triggers (brief approved → create tasks)
    - Zapier/Make integrations

---

## Migration Strategy

### Phase 0 ✅ (This Document)
- Current state analysis
- Gap identification
- Reusability assessment

### Phase 1 (UI/UX Design)
- [ ] Create wireframes for 8 main routes
- [ ] Document user journeys (Account Manager, Creative, Finance)
- [ ] Map Odoo Marketing Agency workflows to our app

### Phase 2 (Database Schema)
- [ ] Create `agency` schema
- [ ] Design core tables (clients, campaigns, artifacts, timesheets)
- [ ] Create analytics views
- [ ] Design integration points with Procure/Finance PPM/T&E

### Phase 3 (Migrations)
- [ ] Write Supabase migrations
- [ ] Add indexes and constraints
- [ ] Set up RLS policies

### Phase 4 (Seed Data)
- [ ] Generate 30-40 demo clients
- [ ] Generate 150 demo campaigns
- [ ] Generate 800-1200 artifacts
- [ ] Populate timesheets (50k entries)

### Phase 5 (AI RAG)
- [ ] Extend AIHub for AGENCY workspace
- [ ] Embed artifacts into knowledge base
- [ ] Build agency-specific prompts
- [ ] Wire AI assistant into UI

### Phase 6 (Testing & Launch)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Demo video
- [ ] Documentation

---

## Success Metrics

### Functional
- [ ] Account Manager can create campaign with budget (no vendor cost visibility)
- [ ] Creative can add artifacts to campaign and tag them
- [ ] Finance can view full campaign P&L with margins
- [ ] AI can summarize campaign and suggest rates
- [ ] Timesheets feed into utilization dashboard

### Non-Functional
- [ ] All routes render <2 seconds
- [ ] AI assistant responds <5 seconds
- [ ] Support 100+ concurrent users
- [ ] 99.9% uptime

---

## Next Steps

1. ✅ **Phase 0 Complete** - This document
2. ⏭️ **Phase 1 Start** - Create `AGENCY_WORKROOM_UI_MAP.md`
   - Map all routes and views
   - Define components needed
   - Document user journeys
3. **Stakeholder Review** - Get creative team input on UX
4. **Database Design** - Start Phase 2 migrations

---

## Appendix: Odoo Marketing Agency Modules

**Reference:** Odoo CE/EE 18 Marketing Agency Package

### Included Modules
- **CRM** - Leads, opportunities, pipeline
- **Sales** - Quotations, orders, subscriptions
- **Project** - Tasks, milestones, timelines
- **Timesheets** - Time tracking, invoicing
- **Planning** - Resource allocation, shifts
- **Social Marketing** - Post scheduling, analytics
- **Invoicing** - Client billing, payment tracking
- **Events** - Event management, registrations

### Mapping to Our App
| Odoo Module | Our Equivalent | Status |
|-------------|----------------|--------|
| CRM | Clients & Accounts | ❌ To build |
| Sales | Procure (Project Quotes) | ✅ Exists |
| Project | Finance PPM (Projects) + Agency (Campaigns) | 🟡 Partial |
| Timesheets | Agency (Timesheets) | ❌ To build |
| Planning | Agency (Capacity) | ❌ To build |
| Social | Future integration | 🟢 Later |
| Invoicing | Finance PPM + Procure | 🟡 Partial |
| Events | Future | 🟢 Later |

---

**Status:** Phase 0 Complete ✅  
**Next:** Phase 1 - UI/UX Mapping  
**Reusability:** 70-80% of infrastructure exists  
**Estimated Effort:** 4-6 weeks for MVP
