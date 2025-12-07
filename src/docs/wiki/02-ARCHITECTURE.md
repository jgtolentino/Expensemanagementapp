# Architecture Overview

Comprehensive guide to the Scout × SariCoach Retail OS architecture.

---

## System Overview

Scout × SariCoach is a **hybrid data + agentic AI platform** for sari-sari retail analytics, built on a modern, production-grade stack:

```
┌─────────────────────────────────────────────────────────────┐
│                    SCOUT × SARICOACH                        │
│                  Retail OS Dashboard                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │         React Frontend (SPA)          │
        │  TanStack Query + Zustand + Tailwind  │
        └───────────────────────────────────────┘
                            │
                            ▼ HTTPS + JWT
        ┌───────────────────────────────────────┐
        │      Supabase Edge Functions          │
        │    (7 Analytics APIs + AI Assistant)  │
        └───────────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
    ┌─────────────────────┐   ┌──────────────────┐
    │  Postgres + RLS     │   │   OpenAI GPT-4   │
    │  18 Tables          │   │   + Embeddings   │
    │  pgvector (HNSW)    │   └──────────────────┘
    └─────────────────────┘
                 ▲
                 │ ETL (webhook/cron)
    ┌─────────────────────┐
    │   Odoo CE/OCA 18    │
    │   POS + Inventory   │
    │   (Source of Truth) │
    └─────────────────────┘
```

---

## Architecture Principles

### 1. Multi-Tenant by Design

**Every query is filtered by `tenant_id` at the database level using Row Level Security (RLS).**

```sql
-- RLS Policy Example
create policy "tenant_isolation_select_transactions"
  on scout.transactions
  for select
  using (tenant_id = scout.current_tenant_id());
```

**Benefits:**
- ✅ Zero-trust data isolation
- ✅ Cannot accidentally leak data between tenants
- ✅ Enforced at database, not application layer

### 2. Type-Safe End-to-End

**Every data flow is strongly typed from database → API → React:**

```typescript
// Database schema (TypeScript types generated)
interface Transaction {
  id: string
  store_id: string
  timestamp: string
  // ...
}

// API response (typed)
interface TransactionTrendsView {
  kpis: { daily_revenue: number }
  time_series: TimeSeriesPoint[]
}

// React component (typed)
const { data } = useTransactionTrends(filters)
//     ^^^^
//     TransactionTrendsView (auto-complete + type checking)
```

**Benefits:**
- ✅ Catch errors at compile-time
- ✅ IDE auto-complete everywhere
- ✅ Refactor with confidence

### 3. Server State vs Client State

**Server State (TanStack Query):**
- Data from APIs (transactions, products, customers)
- Automatic caching (5-min stale time)
- Background refetching
- Optimistic updates

**Client State (Zustand):**
- UI preferences (selected filters, date range)
- Persisted to LocalStorage
- Single source of truth

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Automatic cache invalidation
- ✅ Offline-first for UI state

### 4. Role-Based Access Control (RBAC)

**4 Roles with different permissions:**

| Role | Tenants | Stores | Products | Transactions | AI | Experiments |
|------|---------|--------|----------|--------------|----|----|
| **super_admin** | All | All | All | All | Full | Full |
| **analyst** | Own | All (read) | All (read) | All (read) | Full | View only |
| **brand_sponsor** | Own | All (read) | Own brands only | Filtered by brand | Limited | None |
| **store_owner** | Own | Own stores only | All (read) | Own store only | Basic | None |

**Implementation:**
```typescript
const { hasRole, isSuperAdmin } = useAuth()

// Conditional rendering
{isSuperAdmin && <AdminPanel />}

// Backend filtering
const { data } = await supabase
  .from('transactions')
  .select('*')
  // RLS automatically filters by tenant + role
```

---

## Frontend Architecture

### Component Hierarchy

```
App (AuthProvider)
 └─ AppShell
     ├─ TopBar
     ├─ SidebarNav
     ├─ MainContent (Routes)
     │   ├─ DashboardOverview
     │   ├─ TransactionTrends
     │   ├─ ProductMix
     │   ├─ ConsumerBehavior
     │   ├─ ConsumerProfiling
     │   ├─ GeoIntelligence
     │   └─ DataDictionary
     └─ RightPanel (Filters + AI)
         ├─ AdvancedFilters
         └─ AiAssistantPanel
```

### State Flow

```
User Interaction
       │
       ▼
┌──────────────────┐
│  UI Component    │  (e.g., DateRangePicker)
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Zustand Store   │  setTimeRange(range)
│  (filterStore)   │  
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  React Component │  const filters = useFilterStore()
│  (Page)          │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  TanStack Query  │  useTransactionTrends(filters)
│  Hook            │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  API Client      │  POST /api/scout/transaction-trends
│  (apiClient)     │  Body: { brands: [...], dates: [...] }
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Edge Function   │  Validates JWT, filters by tenant
│  (Supabase)      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Database Query  │  SELECT ... WHERE tenant_id = $1
│  (Postgres+RLS)  │  (RLS enforces tenant isolation)
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Response        │  { kpis: {...}, time_series: [...] }
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  TanStack Cache  │  Stores for 5 minutes
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  UI Re-render    │  data.kpis, data.time_series
└──────────────────┘
```

### Folder Structure Philosophy

**By Feature, Not by Type:**

```
src/
├── api/              # API client (by responsibility)
│   ├── client.ts     # HTTP client + auth
│   └── scout.ts      # Scout API endpoints
│
├── hooks/            # React hooks (by domain)
│   └── useScout.ts   # All Scout analytics hooks
│
├── stores/           # Zustand stores (by domain)
│   └── filterStore.ts # Global filter state
│
├── contexts/         # React contexts (by concern)
│   └── AuthContext.tsx # Auth + RBAC
│
├── types/            # TypeScript types (by domain)
│   ├── entities.ts   # Database entities
│   ├── analytics.ts  # Analytics views
│   └── filters.ts    # Filter state
│
└── routes/           # Pages (by route)
    ├── DashboardOverview.tsx
    └── TransactionTrends.tsx
```

**Benefits:**
- ✅ Easy to find related code
- ✅ Clear ownership
- ✅ Scalable to 100+ files

---

## Backend Architecture

### Database Schema (Medallion Pattern)

**Bronze Layer (Raw):**
- Future: `raw_ingest_odoo_pos_orders`
- Future: `raw_ingest_receipts_ocr`

**Silver Layer (Cleaned):**
- `scout.transactions` - Validated, typed transactions
- `scout.customers` - PII anonymized
- `scout.products` - Deduplicated SKUs

**Gold Layer (Analytics):**
- `scout.v_transaction_trends` - Materialized view
- `scout.v_product_mix` - Materialized view
- `scout.v_consumer_behavior` - Materialized view
- `scout.v_consumer_profiling` - Materialized view
- `scout.v_geo_intelligence` - Materialized view

**Metadata:**
- `scout.tenants` - Tenant registry
- `scout.user_roles` - RBAC mappings
- `scout.data_quality_checks` - DQ rules

### Edge Functions (APIs)

**7 Analytics Endpoints:**

| Function | Method | Purpose | Latency Target |
|----------|--------|---------|----------------|
| `scout-dashboard` | GET | Executive KPIs | <500ms |
| `scout-transaction-trends` | POST | Time series analysis | <800ms |
| `scout-product-analytics` | POST | Category/SKU/substitutions | <800ms |
| `scout-consumer-analytics` | POST | Behavior/profiling | <800ms |
| `scout-geo-intelligence` | POST | Regional/store maps | <1000ms |
| `scout-rag-search` | POST | Vector similarity | <1500ms |
| `scout-ai-query` | POST | AI assistant | <5000ms |

**Function Structure:**
```typescript
Deno.serve(async (req) => {
  // 1. CORS headers
  if (req.method === 'OPTIONS') return new Response(null, { headers })
  
  // 2. Auth (JWT validation)
  const authHeader = req.headers.get('Authorization')
  const { data: { user }, error } = await supabase.auth.getUser(authHeader)
  if (error) return new Response('Unauthorized', { status: 401 })
  
  // 3. Get tenant_id from user
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  
  // 4. Parse request body (filters)
  const body = await req.json()
  
  // 5. Query database (RLS auto-filters by tenant_id)
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('timestamp', body.start_date)
    .lte('timestamp', body.end_date)
  
  // 6. Transform & return
  return new Response(JSON.stringify({ kpis, time_series }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  })
})
```

### Indexes Strategy

**40+ Indexes for Sub-Second Queries:**

**OLTP (Dashboards):**
```sql
-- Store + date range (most common)
create index idx_transactions_store_date
  on scout.transactions (store_id, timestamp desc);

-- SKU + date (product performance)
create index idx_transactions_sku_date
  on scout.transactions (product_id, timestamp desc);
```

**OLAP (Analytics):**
```sql
-- Category + date (category mix)
create index idx_transactions_category_date
  on scout.transactions (product_category, timestamp desc);

-- Region + date (geo intelligence)
create index idx_transactions_region_date
  on scout.transactions (region, timestamp desc);
```

**Vector (RAG):**
```sql
-- HNSW for fast similarity search
create index idx_knowledge_chunks_embedding_hnsw
  on scout.knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
```

---

## Security Architecture

### Defense in Depth

**Layer 1: Network (HTTPS)**
- All traffic encrypted (TLS 1.3)
- Supabase enforces HTTPS

**Layer 2: Authentication (JWT)**
- Supabase Auth with JWT tokens
- 1-hour expiry, 30-day refresh
- Email/password + OAuth (Google, Facebook)

**Layer 3: Authorization (RBAC)**
- 4 roles with different permissions
- Role checks in Edge Functions
- UI conditionally rendered

**Layer 4: Database (RLS)**
- Row-level security on all tables
- Tenant isolation enforced
- Cannot query across tenants

**Layer 5: PII Protection**
- Customer emails hashed (SHA-256 + salt)
- No plaintext PII stored
- Anonymization after 90 days

### Tenant Isolation

**Every table has `tenant_id`:**
```sql
alter table scout.transactions add column tenant_id uuid references scout.tenants(id);
create index idx_transactions_tenant on scout.transactions (tenant_id);
```

**RLS enforces filtering:**
```sql
create policy "tenant_isolation_select_transactions"
  on scout.transactions for select
  using (tenant_id = scout.current_tenant_id());
```

**Helper function:**
```sql
create function scout.current_tenant_id() returns uuid as $$
  select tenant_id from scout.user_roles
  where user_id = auth.uid() limit 1;
$$ language sql security definer;
```

**Result:**
```sql
-- User queries:
select * from scout.transactions;

-- Database executes:
select * from scout.transactions
where tenant_id = (
  select tenant_id from scout.user_roles
  where user_id = auth.uid() limit 1
);
```

---

## AI Architecture

### Ask Suqi (AI Assistant)

**Components:**

1. **Frontend:**
   - Chat interface (message list + input)
   - Tool call visualization
   - Context injection (current page + filters)

2. **Backend (Edge Function):**
   - Receives message + context
   - Calls OpenAI GPT-4 Turbo with function calling
   - Executes tool calls (7 analytics tools)
   - Returns formatted response

3. **Tools:**
   - `get_transaction_trends` - Time series data
   - `get_product_performance` - SKU rankings
   - `get_consumer_segments` - Demographics
   - `get_regional_performance` - Geo data
   - `get_basket_analysis` - Basket composition
   - `get_store_locations` - Store map data
   - `search_scout_knowledge` - RAG search

**Flow:**
```
User: "What are my top 5 products this month?"
  │
  ▼
Frontend: Send to /scout-ai-query with context
  │
  ▼
Edge Function: Call OpenAI GPT-4 with function calling
  │
  ▼
GPT-4: "I should use get_product_performance tool"
  │
  ▼
Edge Function: Execute tool (query database)
  │
  ▼
Edge Function: Send results back to GPT-4
  │
  ▼
GPT-4: "Based on the data, your top 5 products are: 1. Coca-Cola..."
  │
  ▼
Frontend: Display formatted message
```

### RAG (Retrieval Augmented Generation)

**Knowledge Base:**
- Documents chunked (500 tokens each)
- Embedded with `text-embedding-ada-002`
- Stored in `scout.knowledge_chunks` with pgvector

**Search:**
```typescript
// 1. Embed user query
const queryEmbedding = await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: userQuery,
})

// 2. Vector similarity search
const { data: chunks } = await supabase.rpc('match_knowledge_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 5,
})

// 3. Inject into GPT-4 context
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [
    { role: 'system', content: `Context: ${chunks.map(c => c.content).join('\n')}` },
    { role: 'user', content: userQuery },
  ],
})
```

---

## Data Flow Examples

### Example 1: Dashboard Load

```
1. User navigates to /
2. <DashboardOverview> component mounts
3. useFilterStore() retrieves current filters
4. useDashboardOverview(filters) hook is called
5. TanStack Query checks cache (miss)
6. API call: POST /api/scout/dashboard { filters }
7. Edge Function validates JWT, extracts tenant_id
8. Database query (RLS filters by tenant_id)
9. Results returned to Edge Function
10. Edge Function transforms & returns JSON
11. TanStack Query caches response
12. Component re-renders with data
13. KPI cards, tables display
```

### Example 2: Filter Change

```
1. User selects "Last 7 Days" in filter panel
2. setTimeRangePreset('last_7_days') called
3. filterStore updates state
4. LocalStorage updated
5. All components using useFilterStore() re-render
6. useTransactionTrends(filters) detects filter change
7. Query key changed → cache miss
8. New API call with updated filters
9. Data fetched and displayed
```

### Example 3: AI Query

```
1. User types "Show me rainy day performance"
2. handleSend() called
3. useAskScoutAi() mutation triggered
4. POST /api/scout/ai/ask {
     message: "...",
     context: { route, filters }
   }
5. Edge Function receives request
6. Calls OpenAI GPT-4 with function calling
7. GPT-4 decides to call get_transaction_trends
8. Edge Function executes tool (queries DB)
9. Tool results sent back to GPT-4
10. GPT-4 generates natural language response
11. Response returned to frontend
12. Message displayed in chat
```

---

## Performance Optimizations

### 1. Database

- ✅ **40+ indexes** for sub-second queries
- ✅ **Materialized views** for expensive aggregations
- ✅ **Connection pooling** (Supabase handles)
- ✅ **Query plan optimization** (EXPLAIN ANALYZE)

### 2. API (Edge Functions)

- ✅ **Deployed to edge** (low latency worldwide)
- ✅ **Streaming responses** (future)
- ✅ **Caching headers** (future)

### 3. Frontend

- ✅ **TanStack Query caching** (5-min stale time)
- ✅ **Code splitting** (Vite automatic)
- ✅ **Lazy loading** (React.lazy for charts)
- ✅ **Optimistic updates** (future)

### 4. Monitoring

- ⏭️ **OpenTelemetry** (planned)
- ⏭️ **Grafana dashboards** (planned)
- ⏭️ **SLO tracking** (P95 latency, error rate)

---

## Scalability Considerations

### Current Capacity

**Database:**
- ✅ Handles 18,431 transactions (seed data)
- ✅ Can scale to 1M+ with current indexes
- ✅ Partitioning ready (by month) for >10M

**Edge Functions:**
- ✅ Auto-scale (Supabase handles)
- ✅ Cold starts <100ms

**Frontend:**
- ✅ Static site (Vercel/Netlify CDN)
- ✅ Handles unlimited concurrent users

### Future Optimizations

**For 10M+ Transactions:**
- Table partitioning by month
- Incremental materialized view refresh
- Hot/cold storage (archive old data to S3)

**For 1000+ Tenants:**
- Database sharding by tenant_id
- Dedicated connection pools per tenant
- Tenant-specific caching

**For Real-Time:**
- WebSocket connections (Supabase Realtime)
- Change Data Capture (CDC) from Odoo
- Streaming analytics (Apache Flink)

---

## Next Steps

**To learn more about specific aspects:**

- **Database Schema** → [Database Schema](./08-DATABASE-SCHEMA.md)
- **Edge Functions** → [Edge Functions](./09-EDGE-FUNCTIONS.md)
- **Frontend Development** → [Frontend Dev Guide](./04-FRONTEND-DEV.md)
- **API Integration** → [API Integration Guide](./05-API-INTEGRATION.md)
- **Security & RBAC** → [Security & RBAC](./12-SECURITY-RBAC.md)

---

**Last Updated:** 2025-12-07  
**Architecture Version:** 2.0 (Production-Ready)
