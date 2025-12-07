# Scout Dashboard - Current State Analysis (Phase 0)

**Date:** 2025-12-07  
**Status:** NEW APPLICATION (Greenfield)  
**Type:** Retail Analytics Platform

---

## Executive Summary

**Scout Dashboard** is a **retail analytics platform** for Philippine sari-sari stores and retail outlets, providing transaction intelligence, product mix analysis, consumer behavior tracking, and geographical market penetration insights.

**Current State:** Not yet implemented in this repo. This document establishes the baseline for Phases 1-6.

---

## Application Overview

### Purpose
Scout Dashboard provides **real-time retail analytics** for:
- **Brand managers** monitoring product performance across outlets
- **Sales teams** tracking regional coverage and market penetration
- **Strategic planners** analyzing consumer behavior and trends
- **Operations** optimizing inventory and distribution

### Core Functionality
1. **Transaction Trends** - Volume, revenue, basket size over time
2. **Product Mix & SKU Analytics** - Category performance, Pareto analysis
3. **Consumer Behavior** - Purchase funnels, request methods, acceptance rates
4. **Consumer Profiling** - Demographics, age/gender, location, segments
5. **Geographical Intelligence** - Regional performance, store coverage
6. **Data Dictionary** - Transaction data model explorer

---

## Reference Implementation

**External Production URL:** `https://scout-dashboard-xi.vercel.app/`

This external app demonstrates the target UI/UX. Key observations:

### Navigation Structure
- Left sidebar with 6 main tabs
- Right filter panel (brands, categories, locations, time range)
- "Ask Suqi" AI side panel for natural language queries

### Dashboard Pages
1. **Transaction Trends**
   - Tabs: Volume, Revenue, Basket Size, Duration
   - Charts: Daily trends, time-of-day distribution, day-of-week patterns

2. **Product Mix & SKU Analytics**
   - Tabs: Category Mix, Pareto Analysis, Substitutions, Basket Analysis
   - Charts: Category distribution pie, top SKUs bar chart, basket composition

3. **Consumer Behavior Analytics**
   - Tabs: Purchase Funnel, Request Methods, Acceptance Rates, Behavior Traits
   - Charts: Funnel visualization, method breakdown, acceptance trends

4. **Consumer Profiling**
   - Tabs: Demographics, Age & Gender, Location, Segment Behavior
   - Charts: Gender split, age distribution, urban vs rural, income segments

5. **Geographical Intelligence**
   - Tabs: Regional Performance, Store Locations, Demographics, Market Penetration
   - Charts: Regional revenue map, store distribution, coverage metrics

6. **Scout Dashboard Transactions – Data Dictionary**
   - Data model explorer
   - Field definitions and relationships

---

## Current Repo State

### Existing Structure
```
/
├── AgencyApp.tsx
├── FinancePPMApp.tsx
├── GearApp.tsx
├── ProcureApp.tsx
├── TEApp.tsx
├── RateCardApp.tsx
├── components/
├── supabase/
│   ├── functions/
│   └── migrations/
├── docs/
│   ├── agency/
│   ├── ppm/
│   └── scout/ (NEW)
└── tools/
```

### Scout Dashboard Status

**Files:** None (greenfield)  
**Database Schema:** None (to be created)  
**Migrations:** None (to be created)  
**Seed Data:** None (to be created)  
**Edge Functions:** None (to be created)  
**Frontend Components:** None (to be created)

---

## Integration Points (Planned)

### With Existing Apps

**With Agency Workroom:**
```sql
-- Link Scout retail data to Agency campaigns
agency.campaigns.scout_campaign_id → scout.campaigns.id
```

**With Procure:**
```sql
-- Link Scout products to Procure vendor rates
scout.products.procure_item_id → procure.catalog_items.id
```

**With Finance PPM:**
```sql
-- Link Scout analytics to PPM projects
finance_ppm.projects.scout_study_id → scout.market_studies.id
```

**Shared Infrastructure:**
- `core.tenants` - Multi-tenant isolation
- `core.users` - Unified user directory
- `ai.*` - Shared RAG/NLQ infrastructure (OpenAI + pgvector)

---

## Data Sources (Philippine Retail Context)

### Geographical Hierarchy
```
Island Groups (3): Luzon, Visayas, Mindanao
  └─ Regions (17): NCR, CALABARZON, Central Luzon, etc.
      └─ Provinces (81): Manila, Rizal, Bulacan, etc.
          └─ Cities (146): Quezon City, Makati, etc.
              └─ Barangays (42,000+)
```

### Store Types
- **Sari-sari stores** - Traditional neighborhood stores (500K+ nationwide)
- **Mini-marts** - Small convenience stores
- **Supermarkets** - Modern retail chains
- **Wholesalers** - Distribution centers

### Product Categories (from screenshots)
1. **Beverage** (~35% of transactions)
2. **Snacks** (~25%)
3. **Tobacco** (~15%)
4. **Household** (~12%)
5. **Personal Care** (~8%)
6. **Others** (~5%)

### Consumer Segments
- **Income:** High, Middle, Low
- **Location:** Urban, Rural
- **Gender:** Male, Female, Unknown
- **Age:** 18-24, 25-34, 35-44, 45-54, 55+

---

## Target Metrics (from UI screenshots)

### Transaction Trends Page
- **Daily Volume:** Count of transactions per day
- **Daily Revenue:** Total sales amount per day
- **Avg Basket Size:** Items per transaction
- **Avg Transaction Duration:** Time spent per purchase
- **Peak Hours:** Transactions by time of day
- **Day of Week Patterns:** Volume distribution across weekdays

### Product Mix Page
- **Category Distribution:** % of revenue by category
- **Pareto Analysis:** 80/20 rule (top SKUs driving revenue)
- **Top Brands:** Revenue by brand
- **Substitution Matrix:** Product switching behavior
- **Basket Composition:** Average items per basket by category

### Consumer Behavior Page
- **Purchase Funnel:** Visit → Browse → Request → Suggestion → Purchase
- **Conversion Rates:** % at each funnel stage
- **Request Methods:** Voice, Text, Gesture breakdown
- **Acceptance Rates:** % accepting recommendations
- **Behavior Traits:** Impulse vs planned purchasing

### Consumer Profiling Page
- **Gender Split:** Male/Female distribution
- **Age Distribution:** Breakdown by age group
- **Income Segments:** High/Middle/Low distribution
- **Urban vs Rural:** Location-based segmentation
- **Top Locations:** Revenue by city/province

### Geographical Intelligence Page
- **Regional Revenue:** Total sales by region
- **Market Penetration:** % of stores covered per region
- **Store Distribution:** Count of stores by province
- **Growth Trends:** YoY regional growth rates
- **Coverage Map:** Geographical heatmap

---

## Filters (Right Panel)

### Available Filters
1. **Brands** - Multi-select dropdown
2. **Categories** - Product category multi-select
3. **Locations** - Region/Province/City hierarchy
4. **Time & Temporal Analysis**
   - Date range picker
   - Preset ranges (Last 7d, 30d, 90d, YTD)
   - Day of week selector
   - Time of day selector
5. **Advanced Filters**
   - Store type
   - Consumer segment
   - Basket size range
   - Transaction amount range
6. **Display Options**
   - Chart type (Line, Bar, Area)
   - Aggregation (Daily, Weekly, Monthly)
   - Show/hide legends

### Filter Application
- Filters apply globally across all pages
- Real-time updates (debounced)
- URL query params for sharing filtered views
- "Reset" button to clear all filters

---

## AI/NLQ Integration

### "Ask Suqi" Side Panel

**Purpose:** Natural language query interface for retail insights

**Sample Queries:**
- "What are the top-selling brands in Metro Manila?"
- "Show me consumer behavior trends for tobacco products"
- "Which regions have the highest growth this quarter?"
- "Compare basket sizes between urban and rural areas"

**Implementation:**
- OpenAI GPT-4 for query understanding
- RAG over Scout knowledge base (product guides, market reports)
- Tool calling for live data queries
- Streaming responses with chart generation

**Tools Available:**
1. `get_transaction_trends` - Time series data
2. `get_product_performance` - SKU/brand analytics
3. `get_consumer_segments` - Profiling data
4. `get_regional_performance` - Geo intelligence
5. `search_scout_knowledge` - RAG search

---

## Technology Stack (Planned)

### Frontend
- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Shadcn/ui
- **Charts:** Recharts
- **State:** Zustand (global), TanStack Query (server state)
- **Forms:** React Hook Form

### Backend
- **Database:** PostgreSQL 15+ (Supabase)
- **Schema:** `scout.*` domain
- **Extensions:** pgvector (embeddings), PostGIS (geo queries)
- **Edge Functions:** Deno runtime (Supabase)
- **AI:** OpenAI GPT-4 Turbo + ada-002 embeddings

### Deployment
- **Frontend:** Vercel (Vite preset)
- **Database:** Supabase (managed)
- **Edge Functions:** Supabase Edge Runtime
- **Environment:** Multi-tenant with RLS

---

## Data Model (High-Level)

### Core Tables (Planned)

**`scout.transactions`** (Fact table, 18K+ rows)
- Transaction events with full context
- Grain: One row per item in a basket
- Keys: store_id, customer_id, basket_id, product_id

**`scout.stores`** (Dimension, 250+ rows)
- Store master data
- Full geo hierarchy (barangay → region)

**`scout.customers`** (Dimension, 10K+ rows)
- Consumer profiles
- Segmentation attributes

**`scout.products`** (Dimension, 400+ rows)
- Product/SKU master
- Category hierarchy

**`scout.brands`** (Dimension, 50+ rows)
- Brand master data

### Analytics Views (Planned)

- `scout.v_transaction_trends`
- `scout.v_product_mix`
- `scout.v_consumer_behavior`
- `scout.v_consumer_profiling`
- `scout.v_geo_intelligence`

---

## Seed Data Requirements

### Volume Targets

| Entity | Count | Notes |
|--------|-------|-------|
| **Stores** | 250+ | Across 17 regions |
| **Customers** | 10,000+ | Realistic age/gender/income distribution |
| **Brands** | 40-50 | Major Philippine brands (San Miguel, Nestlé, etc.) |
| **Products** | 300-400 | SKUs across 6 categories |
| **Transactions** | 18,000+ | 365-day window, realistic patterns |
| **Baskets** | 6,000+ | Avg 3 items per basket |

### Data Characteristics

**Temporal Distribution:**
- Higher volume on weekends
- Peak hours: 7-9am, 12-1pm, 5-7pm
- Seasonal variations (Christmas spike, summer dip)

**Geographic Distribution:**
- Metro Manila (NCR): 40% of transactions
- CALABARZON: 20%
- Central Luzon: 15%
- Other regions: 25%

**Product Distribution (Pareto):**
- Top 20% of SKUs = 80% of revenue
- Beverages and snacks dominate
- Tobacco concentrated in specific segments

**Consumer Distribution:**
- Urban 65%, Rural 35%
- Middle income 50%, Low 35%, High 15%
- Age 25-44: 60% of transactions

---

## Performance Requirements

### Query Response Times

| View | Target | Max Records |
|------|--------|-------------|
| Dashboard KPIs | <200ms | Aggregates |
| Transaction Trends | <500ms | 365 daily rows |
| Product Mix | <400ms | 50-100 SKUs |
| Consumer Profiling | <300ms | Segment aggregates |
| Geo Intelligence | <600ms | 17 regions |
| AI Query | <5s | Including RAG + GPT-4 |

### Filters Performance
- All filters should apply in <300ms
- Debounce user input (300ms delay)
- Use indexed columns for filtering

---

## Security & Access Control

### Roles (Planned)

1. **Brand Manager** - View all data for assigned brands
2. **Sales Regional Manager** - View assigned regions only
3. **Analyst** - Full read access
4. **Executive** - Dashboard views only
5. **Admin** - Full system access

### RLS Policies
- All `scout.*` tables filtered by `tenant_id`
- Brand managers see only their brands
- Regional managers see only their regions
- Customers never see other customers' PII

---

## API Structure (Planned)

### Edge Functions

1. **`scout-dashboard`** (GET)
   - Dashboard overview metrics
   - Response: KPIs + recent trends

2. **`scout-transaction-trends`** (POST)
   - Time series analysis
   - Filters: date range, brands, categories, locations

3. **`scout-product-analytics`** (POST)
   - Product mix and SKU performance
   - Filters: categories, brands, time range

4. **`scout-consumer-analytics`** (POST)
   - Behavior and profiling data
   - Filters: segments, locations, time range

5. **`scout-geo-intelligence`** (POST)
   - Regional performance and coverage
   - Filters: regions, store types, time range

6. **`scout-rag-search`** (POST)
   - Vector similarity search
   - Input: query, limit, category

7. **`scout-ai-query`** (POST)
   - AI assistant with RAG + tools
   - Input: session_id, message

---

## Migration Strategy

### Schema Creation Order

1. **Core schema + enums**
   - Create `scout` schema
   - Enums: time_of_day, income_segment, urban_rural, store_type, product_category

2. **Dimension tables**
   - `scout.stores`
   - `scout.customers`
   - `scout.brands`
   - `scout.products`

3. **Fact tables**
   - `scout.transactions`

4. **Analytics views**
   - 5 main dashboard views

5. **AI/RAG tables**
   - `scout.knowledge_documents`
   - `scout.knowledge_chunks` (with pgvector)
   - `scout.ai_conversations`
   - `scout.ai_messages`

6. **RLS policies**
   - Tenant isolation
   - Role-based filtering

---

## Risks & Considerations

### Data Privacy
- **PII Protection:** Customer data must be anonymized in demo seeds
- **GDPR/DPA Compliance:** Real production would need consent management
- **Data Retention:** Define TTL policies for transaction data

### Performance
- **Large Transaction Volume:** 18K is demo scale; production could be millions
- **Aggregation Cost:** Pre-compute daily aggregates via materialized views
- **Geo Queries:** PostGIS indexes required for fast regional filtering

### Integration Complexity
- **External Data Sources:** Scout may pull from external retail APIs
- **Real-time Updates:** Websockets/polling for live dashboard updates
- **Export Formats:** Excel, CSV, PDF generation for reports

---

## Next Steps (Phase 1)

1. ✅ Phase 0 complete (this document)
2. ⏭️ **Phase 1:** UI/UX Map - Document all 6 pages + filters + AI panel
3. ⏭️ **Phase 2:** Data Model - Full table/view definitions
4. ⏭️ **Phase 3:** Migrations - SQL scripts for schema creation
5. ⏭️ **Phase 4:** Seed Data - 18K+ realistic Philippine retail transactions
6. ⏭️ **Phase 5:** Edge Functions - 7 API endpoints
7. ⏭️ **Phase 6:** Frontend UI - React components + wiring

---

## Reuse-First Checklist

Before building Scout Dashboard, we will:

### Q1: Which existing schemas/tables/models to inspect for reuse?
- ✅ Agency Workroom (campaign structure, timesheets)
- ✅ Finance PPM (analytics views, profitability calculations)
- ✅ T&E (expense categories, geography)
- ✅ Gearroom (inventory tracking patterns)
- ✅ RAG infrastructure (pgvector, OpenAI patterns)

### Q2: Which ones to reuse or extend?
- ✅ **Reuse:** `core.tenants`, `core.users` (multi-tenant foundation)
- ✅ **Reuse:** RAG pattern (knowledge_documents + chunks + pgvector)
- ✅ **Reuse:** Edge Function structure (CORS, auth, error handling)
- ✅ **Reuse:** AI assistant orchestration (GPT-4 + tool calling)
- ✅ **Extend:** Geography hierarchy (add Philippine-specific regions)

### Q3: New tables/models to introduce?
- ✅ `scout.transactions` - Core fact table
- ✅ `scout.stores` - Retail outlet dimension
- ✅ `scout.customers` - Consumer profiles
- ✅ `scout.products` - Product/SKU master
- ✅ `scout.brands` - Brand dimension
- ✅ 5 analytics views for dashboards

**Justification:** Scout is a NEW domain (retail analytics) with no overlap with finance/agency/procurement/equipment workflows. Domain-specific tables required.

### Q4: Impact on canonical domains?
- ✅ **NO changes** to existing domains (finance, agency, procure, gear, te)
- ✅ **Additive only:** New `scout` schema alongside existing
- ✅ **Integration columns:** Add FK columns to existing apps (optional, Phase 2)

---

## Summary

**Scout Dashboard Current State:**
- ✅ **Status:** Greenfield application (not yet implemented)
- ✅ **Reference:** External prod at `https://scout-dashboard-xi.vercel.app/`
- ✅ **Scope:** 6 dashboard pages, 7 Edge Functions, 18K+ seed records
- ✅ **Integration:** Links to Agency, Procure, Finance PPM (optional)
- ✅ **Timeline:** Phases 1-6 estimated 50-70 hours

**Ready to proceed to Phase 1: UI/UX Mapping** ✅

---

**Last Updated:** 2025-12-07  
**Next Phase:** Phase 1 - UI/Routes/User Journeys  
**Estimated Effort:** 4-6 hours for Phase 1
