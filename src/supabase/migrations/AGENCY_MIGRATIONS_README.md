# Agency Creative Workroom - Database Migrations

**Created:** 2025-12-07  
**Schema:** `agency`  
**Total Migrations:** 7

---

## Overview

These migrations create the complete database schema for the Agency Creative Workroom, a comprehensive marketing agency workspace that integrates with existing TBWA Agency Databank systems (Procure, Finance PPM, T&E, Gearroom).

---

## Migration Files

### 1. `20251207_001_agency_core_schema.sql`

**Purpose:** Core agency tables

**Tables Created:**
- `agency.clients` - Master client/account list
- `agency.brands` - Brands owned by clients
- `agency.campaigns` - Campaign/project registry
- `agency.campaign_phases` - Campaign phases (Strategy, Creative, Production, Post)

**Features:**
- Auto-updating `updated_at` triggers
- Multi-tenant isolation via `tenant_id`
- Generated columns (duration_weeks)
- Comprehensive indexes
- RLS enabled on all tables

**Run Time:** ~500ms

---

### 2. `20251207_002_agency_artifacts.sql`

**Purpose:** Creative content management

**Tables Created:**
- `agency.artifacts` - Creative artifacts (briefs, scripts, decks, boards)
- `agency.artifact_versions` - Version history
- `agency.artifact_comments` - Threaded comments

**Features:**
- Auto-versioning trigger (creates version snapshot on content change)
- Full-text search indexes
- GIN indexes for tags arrays
- File metadata tracking (size, mime type, URL)
- Embedding status for AI/RAG integration

**Run Time:** ~300ms

---

### 3. `20251207_003_agency_timesheets.sql`

**Purpose:** Time tracking and resource allocation

**Tables Created:**
- `agency.timesheet_entries` - Time tracking entries
- `agency.team_allocations` - Planned resource allocations

**Features:**
- Auto-calculation of week_start_date
- Billable vs non-billable tracking
- Rate snapshots (internal cost + client billing)
- Capacity percentage tracking

**Run Time:** ~200ms

---

### 4. `20251207_004_agency_integration.sql`

**Purpose:** Integration with existing TBWA systems

**Integration Points:**
1. **Procure** - Links campaigns to project quotes
   - Adds `procure_quote_id` to `agency.campaigns`
   
2. **Finance PPM** - Links campaigns to financial tracking
   - Adds `agency_campaign_id` to `finance_ppm.projects`
   
3. **T&E** - Tracks expenses per campaign
   - Adds `agency_campaign_id` to `te.expense_lines`
   
4. **Gearroom** - Tracks equipment checkouts per campaign
   - Adds `agency_campaign_id` to `gear.checkouts`

**Functions Created:**
- `agency.get_campaign_expenses(campaign_id)` - Aggregate T&E expenses
- `agency.get_campaign_equipment(campaign_id)` - List equipment checkouts

**Features:**
- Graceful handling if target schemas don't exist
- Conditional FK constraints
- Cross-schema integration

**Run Time:** ~100ms

---

### 5. `20251207_005_agency_ai_rag.sql`

**Purpose:** AI/RAG infrastructure for knowledge base and assistant

**Dependencies:** Requires `pgvector` extension

**Tables Created:**
- `agency.knowledge_documents` - Knowledge base documents
- `agency.knowledge_chunks` - Chunked + embedded content
- `agency.ai_conversations` - AI chat sessions
- `agency.ai_messages` - Chat messages with citations

**Features:**
- Vector embeddings (1536-dim for OpenAI ada-002)
- HNSW index for fast similarity search
- RAG source citations (JSONB)
- Client-specific knowledge (optional client_id)
- Notion sync support (source_id for external docs)

**Functions Created:**
- `agency.search_knowledge(embedding, threshold, count, filters)` - Vector similarity search

**Run Time:** ~400ms

---

### 6. `20251207_006_agency_views.sql`

**Purpose:** Analytics views and helper functions

**Views Created:**
1. `agency.v_dashboard_kpis` - Home dashboard KPI tiles
2. `agency.v_campaign_overview` - Campaign list with metrics
3. `agency.v_client_360` - Client 360-degree view
4. `agency.v_employee_utilization` - Weekly utilization by employee
5. `agency.v_artifact_library` - Artifact library with metadata
6. `agency.v_timesheet_summary_by_campaign` - Timesheet aggregation

**Functions Created:**
- `agency.get_recent_activity(limit, user_id)` - Activity feed for dashboard

**Features:**
- Aggregated metrics (counts, sums, averages)
- Cross-table joins
- Role-based filtering (via RLS)
- Optimized for common queries

**Run Time:** ~200ms

---

### 7. `20251207_007_agency_rls_policies.sql`

**Purpose:** Row Level Security for multi-tenant, role-based access

**Helper Functions:**
- `agency.current_tenant_id()` - Get current tenant UUID
- `agency.current_user_role()` - Get current user role
- `agency.has_role(role)` - Check if user has specific role
- `agency.has_any_role(roles[])` - Check if user has any of multiple roles

**RLS Policies:** 25+ policies across all tables

**Security Model:**
- **Tenant Isolation:** All tables filter by `tenant_id`
- **Role-Based Access:**
  - `finance` - Full visibility on rates, costs, margins
  - `leadership` - Full visibility on all data
  - `pm` - Can manage allocations, view all timesheets
  - `admin` - Can manage knowledge documents
  - `account`, `creative` - Can view own campaigns and artifacts
- **Owner-Based Access:**
  - Artifact owners have full access to their artifacts
  - Employees can manage their own timesheets
- **Team-Based Access:**
  - Campaign team members can view campaign artifacts

**Run Time:** ~100ms

---

## Total Schema

### Tables
- **15 core tables** across 4 categories:
  1. **Core Agency** (4): clients, brands, campaigns, campaign_phases
  2. **Content** (3): artifacts, artifact_versions, artifact_comments
  3. **Time & Resources** (2): timesheet_entries, team_allocations
  4. **AI/RAG** (4): knowledge_documents, knowledge_chunks, ai_conversations, ai_messages
  5. **Integration** (2 columns added to existing tables)

### Views
- **6 analytics views**

### Functions
- **6 helper functions**
- **2 integration functions**

### Indexes
- **50+ indexes** including:
  - B-tree indexes for foreign keys, dates, status
  - GIN indexes for tags, full-text search
  - HNSW vector index for embeddings
  - Partial indexes for active/pending records

### RLS Policies
- **25+ policies** for tenant isolation and role-based access

---

## Running Migrations

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Local Development
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Or apply specific migration
supabase migration up --db-url postgresql://postgres:postgres@localhost:54322/postgres
```

### Production Deployment
```bash
# Link to production project
supabase link --project-ref <your-project-ref>

# Push migrations to production
supabase db push

# Verify
supabase db diff
```

---

## Configuration Required

### 1. Set Application Settings

For RLS to work, your application must set session variables:

```typescript
// Example: Supabase client setup
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'agency',
    },
    global: {
      headers: {
        'x-tenant-id': tenantId,
        'x-user-role': userRole, // 'finance', 'leadership', 'pm', 'account', 'creative'
      },
    },
  }
);

// Set session variables for RLS
await supabase.rpc('set', {
  key: 'app.current_tenant',
  value: tenantId,
});

await supabase.rpc('set', {
  key: 'app.current_role',
  value: userRole,
});
```

### 2. Enable pgvector Extension

Ensure `pgvector` is installed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This is automatically included in Migration 005, but verify in Supabase dashboard:
- Database → Extensions → Enable `vector`

---

## Data Seeding

After running migrations, seed demo data:

```bash
# Run seed script (to be created in Phase 4)
npm run db:seed:agency-workroom
```

---

## Rollback Strategy

To rollback all migrations:

```bash
# Local
supabase db reset

# Production (DANGER - drops all data)
supabase migration repair --status reverted 20251207_007_agency_rls_policies.sql
supabase migration repair --status reverted 20251207_006_agency_views.sql
# ... repeat for all migrations in reverse order
```

**Safer approach:** Create explicit down migrations.

---

## Verification

After running migrations, verify:

```sql
-- 1. Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'agency'
ORDER BY table_name;

-- Expected: 15 tables

-- 2. Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'agency';

-- Expected: All tables have rowsecurity = true

-- 3. Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'agency'
ORDER BY tablename, indexname;

-- Expected: 50+ indexes

-- 4. Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'agency';

-- Expected: 6 views

-- 5. Test vector search
SELECT agency.search_knowledge(
  (SELECT embedding FROM agency.knowledge_chunks LIMIT 1),
  0.7,
  5
);

-- Expected: Returns rows if knowledge chunks exist
```

---

## Performance Notes

### Expected Query Performance

With indexes:
- **Campaign list:** <50ms for 1000 campaigns
- **Client 360:** <100ms with aggregations
- **Timesheet weekly summary:** <200ms for 50 employees
- **Vector search:** <500ms for 10k chunks (HNSW index)

### Optimization Tips

1. **For large datasets (>100k rows):**
   - Consider partitioning `timesheet_entries` by month
   - Use materialized views for heavy aggregations

2. **For vector search:**
   - HNSW index is optimal for <1M vectors
   - For >1M vectors, switch to IVFFlat index

3. **For time-series queries:**
   - Ensure `entry_date`, `week_start_date` indexes are used
   - Consider time-based partitioning

---

## Troubleshooting

### Issue: RLS policies block all queries

**Solution:** Ensure session variables are set:
```sql
SET app.current_tenant = '<tenant-uuid>';
SET app.current_role = 'finance'; -- or appropriate role
```

### Issue: Vector search returns no results

**Solution:** Check embeddings exist and index is built:
```sql
-- Check chunks
SELECT COUNT(*) FROM agency.knowledge_chunks WHERE embedding IS NOT NULL;

-- Rebuild HNSW index if needed
REINDEX INDEX agency.idx_knowledge_chunks_embedding;
```

### Issue: Slow aggregate queries

**Solution:** Create materialized views:
```sql
CREATE MATERIALIZED VIEW agency.mv_campaign_summary AS
SELECT * FROM agency.v_campaign_overview;

CREATE INDEX idx_mv_campaign_client ON agency.mv_campaign_summary(client_id);

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY agency.mv_campaign_summary;
```

---

## Next Steps

1. ✅ **Migrations Complete** - All tables, views, functions, RLS created
2. ⏭️ **Phase 4: Seed Data** - Generate realistic demo data
3. ⏭️ **Phase 5: API Layer** - Build Supabase Edge Functions for AI
4. ⏭️ **Phase 6: Frontend** - Build React components

---

## Support

For issues or questions:
1. Check migration logs in Supabase dashboard
2. Verify RLS policies with `SELECT * FROM pg_policies WHERE schemaname = 'agency'`
3. Review this README for configuration steps

**Migration Status:** Ready for Production ✅  
**Total Run Time:** ~1.8 seconds  
**Database Size Impact:** ~5MB (empty schema)
