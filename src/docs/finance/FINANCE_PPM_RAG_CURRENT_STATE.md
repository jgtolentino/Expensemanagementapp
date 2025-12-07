# Finance PPM RAG Assistant - Current State Analysis

**Date:** 2025-12-07  
**Repo:** TBWA Agency Databank  
**Target:** Finance PPM AI RAG Assistant

---

## Executive Summary

The TBWA Agency Databank currently has **4 operational apps** (Rate Card Pro, T&E, Gearroom, Procure) with a **5th app slot** available. The repo has comprehensive **AIHub RAG infrastructure** designed for T&E and Gearroom workspaces, which can be extended to support Finance PPM.

**Key Finding:** 80% of the RAG infrastructure already exists and can be reused. We need to:
1. Add `FINANCE_PPM` workspace to AIHub
2. Create Finance PPM-specific database schema
3. Build Finance PPM UI components
4. Integrate with existing Procure app (vendor rates, project quotes)

---

## Repo Structure Analysis

### Existing Apps
```
/App.tsx                     # Main launcher (4 apps currently)
/RateCardProApp.tsx          # Rate Card Pro
/TEApp.tsx                   # Travel & Expense
/GearApp.tsx                 # Gearroom
/ProcureApp.tsx              # Procure (vendor rate governance)
```

### Components Structure
```
/components/
├── te/                      # T&E specific
├── gear/                    # Gearroom specific
├── procure/                 # Procure specific
│   ├── RateCardManager.tsx
│   ├── ProjectQuoteBuilder.tsx
│   └── RateAdvisorWizard.tsx (AI-powered)
└── ui/                      # Shared UI primitives
```

### Documentation
```
/docs/
├── README.md                # Master documentation
├── aihub-rag-assistant.md   # ✅ Existing RAG architecture
├── te-database-schema.md
├── gear-database-schema.md
├── procure-database-schema.md
├── ocr-integration.md
└── finance/                 # ⭐ NEW - To be created
```

---

## Existing AIHub RAG Infrastructure

### Database Schema (Supabase Postgres)

**Already Implemented:**
```sql
aihub.knowledge_chunks       -- Vector embeddings (pgvector)
aihub.sessions               -- Chat sessions
aihub.messages               -- Chat history
```

**Current Workspaces:**
- `TE` - Travel & Expense
- `GEAR` - Gearroom
- `GLOBAL` - Shared policies

**Extension Required:**
- Add `FINANCE_PPM` workspace

### Knowledge Source Types (Already Defined)

1. **SPEC** - Specification documents (Markdown in `spec/`)
2. **DOC** - Documentation (`docs/`)
3. **OCR** - OCR-extracted text (receipts, invoices)
4. **SQL_VIEW_DOC** - Database view documentation
5. **POLICY** - Policy documents

### Embedding Infrastructure

**Model:** OpenAI ada-002 (vector 1536 dimensions)  
**Search:** pgvector with `ivfflat` index  
**Chunking:** 500-1000 tokens with 100-token overlap

---

## Finance PPM-Related Assets

### Existing Finance Data (via Procure App)

**Procure Schema** (`procure.*`):
```sql
procure.rate_cards           -- Vendor/consultant rates
procure.vendors              -- Vendor master data
procure.project_quotes       -- Client project quotes
procure.quote_lines          -- Budget line items
procure.rate_advisor_sessions -- AI recommendation history
```

**Key Views:**
- `procure.v_rate_card_summary` - Rate card usage stats
- `procure.v_quote_summary` - Quote KPIs
- `analytics.v_rate_governance_metrics` - Monthly metrics
- `analytics.v_vendor_performance` - Vendor scorecards
- `analytics.v_discipline_spend` - Category analysis

### Missing Finance PPM Components

**❌ Not Yet Implemented:**
1. Project financial tracking (budget vs actual, WIP, AR/AP)
2. Portfolio rollups (client/brand/service line)
3. Month-end close process tracking
4. Revenue recognition status
5. Profitability analytics
6. Resource capacity planning
7. Finance PPM UI/UX

---

## Integration Points

### 1. Procure → Finance PPM

**Current State:**
- Procure has project quotes with client rates and cost rates
- Vendor rate cards with margin calculations
- AI Rate Advisor for budget estimation

**Integration Opportunity:**
- Use Procure quotes as **project budgets**
- Link actual costs from T&E expense reports
- Track budget vs actual variance
- Feed into Finance PPM profitability analysis

### 2. T&E → Finance PPM

**Current State:**
- T&E has expense reports, cash advances, analytics
- Complete expense line items with categories
- Analytics views for spend tracking

**Integration Opportunity:**
- Link T&E expenses to Finance PPM projects
- Track project-level actual costs
- Feed into WIP calculations
- Support month-end accruals

### 3. Gearroom → Finance PPM

**Current State:**
- Equipment checkout tracking
- Maintenance costs
- Utilization analytics

**Integration Opportunity:**
- Track equipment costs by project
- Include in project cost analysis
- Depreciation tracking

---

## Knowledge Sources for Finance PPM

### Local Documentation (To Be Created)

**Required:**
```
docs/finance/
├── month-end-close-sop.md
├── revenue-recognition-policy.md
├── wip-calculation-guide.md
├── ar-ap-management.md
├── project-profitability-analysis.md
├── rate-governance-policy.md (link to Procure)
└── finance-ppm-glossary.md
```

### Notion Workspace (External)

**Finance PPM Notion Workspace:**
- URL: `https://notion.so/tbwa-finance-ppm/` (to be configured)
- Content:
  - Client financial playbooks
  - Project close-out checklists
  - Month-end task templates
  - Finance team SOPs
  - Meeting notes & decisions

**Sync Strategy:**
- Daily scheduled sync via Notion API
- Store in `finance_ppm.knowledge_documents`
- Auto-chunk and embed

### Live Database Views

**Finance PPM Metrics (To Be Created):**
```sql
finance_ppm.v_project_overview       -- Project health snapshot
finance_ppm.v_portfolio_overview     -- Portfolio rollups
finance_ppm.v_month_end_status       -- Close readiness
finance_ppm.v_profitability_analysis -- Margin analysis
finance_ppm.v_wip_summary            -- Work-in-progress
finance_ppm.v_ar_aging               -- Accounts receivable
```

---

## Technical Requirements

### Frontend (React + TypeScript)

**Theme:** TBWA branding (already established)  
**Color Scheme:** Suggest `#16A34A` (Green) for Finance PPM to distinguish from:
- Rate Card Pro: `#386641`
- T&E: `#0070F2`
- Gearroom: `#7C3AED`
- Procure: `#0EA5E9`

**Components Needed:**
```tsx
/FinancePPMApp.tsx                   # Main app
/components/finance/
├── AIAssistantConsole.tsx           # Chat interface
├── KnowledgeBrowser.tsx             # Document explorer
├── ProjectFinancialsTable.tsx       # Project metrics
├── PortfolioAnalytics.tsx           # Portfolio dashboard
├── MonthEndTracker.tsx              # Close progress
├── ProfitabilityChart.tsx           # Margin analysis
└── FinancePPMHome.tsx               # Landing page
```

### Backend (Supabase + FastAPI)

**Supabase Functions:**
```
supabase/functions/
├── finance-ppm-rag-search/          # Vector search
├── finance-ppm-embed-docs/          # Embedding pipeline
├── finance-ppm-query/               # Orchestration
└── finance-ppm-tools/               # Live data tools
```

**FastAPI Services (Optional):**
```python
backend/finance_ppm/
├── rag_service.py                   # RAG orchestration
├── notion_sync.py                   # Notion → Postgres
├── tools.py                         # Project/portfolio tools
└── prompts.py                       # LLM prompts
```

---

## Migration Path

### Phase 0 ✅ (This Document)
- Current state analysis
- Integration point identification
- Requirements gathering

### Phase 1 (UI/UX Design)
- [ ] Create wireframes for 6 main routes
- [ ] Document user journeys (Finance/PM/Leadership roles)
- [ ] Define data requirements per view

### Phase 2 (Database Schema)
- [ ] Create `finance_ppm` schema
- [ ] Design core tables (projects, financials, tasks)
- [ ] Create analytics views
- [ ] Seed demo data

### Phase 3 (RAG Infrastructure)
- [ ] Extend AIHub to support `FINANCE_PPM` workspace
- [ ] Create Notion sync job
- [ ] Build embedding pipeline
- [ ] Implement vector search API

### Phase 4 (Tools & Live Data)
- [ ] Implement project snapshot tool
- [ ] Implement portfolio snapshot tool
- [ ] Implement month-end status tool
- [ ] Create tool manifest

### Phase 5 (Assistant Orchestration)
- [ ] Build query orchestration service
- [ ] Implement intent classification
- [ ] Wire RAG + tools together
- [ ] Add role-based access control

### Phase 6 (Testing & Launch)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Demo video
- [ ] Documentation
- [ ] Production deployment

---

## Risk Assessment

### High Priority Risks

1. **Data Integration Complexity** 🔴
   - Risk: Linking Procure quotes, T&E expenses, and Finance PPM projects
   - Mitigation: Use foreign keys carefully, create integration views

2. **Notion API Rate Limits** 🟡
   - Risk: Daily sync may hit API limits for large workspaces
   - Mitigation: Implement incremental sync, cache frequently accessed pages

3. **Financial Data Security** 🔴
   - Risk: Finance PPM has confidential margin/cost data
   - Mitigation: Strict RLS policies, role-based field masking

### Medium Priority Risks

4. **LLM Accuracy for Finance** 🟡
   - Risk: AI may hallucinate financial numbers
   - Mitigation: Force tool usage for all numeric data, no free-form generation

5. **Embedding Quality** 🟡
   - Risk: Finance jargon may not embed well
   - Mitigation: Fine-tune chunking strategy, add finance-specific metadata

---

## Success Criteria

### Functional
- [ ] Finance user can ask "What is the profitability of Project X?" and get accurate answer
- [ ] PM can ask "Show me month-end tasks for Acme client" and see checklist from Notion
- [ ] Leadership can ask "Which portfolios are at risk?" and see data table + explanation
- [ ] All answers cite sources (docs + metrics)
- [ ] No hallucinated numbers

### Non-Functional
- [ ] RAG search response time <2 seconds
- [ ] Tool execution <1 second
- [ ] End-to-end query response <5 seconds
- [ ] Support 50+ concurrent users
- [ ] 99.9% uptime for finance close periods

---

## Next Steps

1. ✅ **Phase 0 Complete** - This document
2. ⏭️ **Phase 1 Start** - Create `FINANCE_PPM_RAG_UI_MAP.md`
   - Document all routes and views
   - Define data requirements
   - Map user journeys
3. **Stakeholder Review** - Get Finance team approval on UX
4. **Database Design** - Start Phase 2 migrations

---

## Appendix: Existing Code References

### AIHub RAG (Reusable)
- `/docs/aihub-rag-assistant.md` - Full architecture
- Schema: `aihub.knowledge_chunks`, `aihub.sessions`, `aihub.messages`

### Procure App (Finance Data Source)
- `/ProcureApp.tsx` - Rate cards, project quotes
- `/docs/procure-database-schema.md` - Schema reference
- Components: `RateCardManager`, `ProjectQuoteBuilder`, `RateAdvisorWizard`

### T&E App (Cost Data Source)
- `/TEApp.tsx` - Expense reports, analytics
- `/docs/te-database-schema.md` - Schema reference

### Analytics Views (Cross-App)
```sql
analytics.v_rate_governance_metrics  -- Procure
analytics.v_te_cash_flow             -- T&E
analytics.v_gear_utilization_cost    -- Gearroom
```

---

**Status:** Phase 0 Complete ✅  
**Next:** Phase 1 - UI/UX Mapping  
**Owner:** Platform Team  
**Last Updated:** 2025-12-07
