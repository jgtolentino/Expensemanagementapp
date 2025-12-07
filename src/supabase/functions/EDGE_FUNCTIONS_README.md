# Finance PPM - Edge Functions Documentation

**Phase:** 5 - Edge Functions & AI  
**Status:** Complete  
**Date:** 2025-12-07

---

## Overview

This directory contains **6 Supabase Edge Functions** (Deno runtime) for the Finance PPM Accounting Firm portal.

**Categories:**
- **Business Logic** (3 functions): Dashboard, WIP calculation, Invoice generation
- **AI/RAG** (2 functions): Vector search, AI assistant query
- **Scheduled Jobs** (1 function): Nightly maintenance tasks

---

## Edge Functions

### 1. `finance-ppm-dashboard` 📊

**Purpose:** Get role-based dashboard KPIs and metrics

**Method:** GET  
**Auth:** Required (JWT)  
**Path:** `/functions/v1/finance-ppm-dashboard`

**Query Parameters:**
- `period` (optional): 'month' | 'quarter' | 'year'

**Response:**
```json
{
  "success": true,
  "data": {
    "firm_overview": {
      "active_engagements": 47,
      "active_projects": 112,
      "total_wip": 8500000,
      "ar_outstanding": 12300000,
      "revenue_last_30d": 15600000,
      "avg_utilization": 78
    },
    "recent_activity": {
      "recent_invoices": [...],
      "pending_timesheets": [...],
      "overdue_invoices": [...]
    },
    "charts": {
      "revenue_trend": [...],
      "utilization_by_role": [...],
      "pipeline_by_stage": [...]
    }
  }
}
```

**Features:**
- Fetches from `analytics.v_ppm_firm_overview`
- Role-based filtering (RLS enforced)
- Recent activity lists (last 10-20 items)
- Chart data for dashboards

**Usage:**
```bash
curl -X GET 'https://your-project.supabase.co/functions/v1/finance-ppm-dashboard?period=month' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

### 2. `finance-ppm-wip-calculate` 💰

**Purpose:** Calculate Work-in-Progress for projects

**Method:** POST  
**Auth:** Required (JWT - finance roles only)  
**Path:** `/functions/v1/finance-ppm-wip-calculate`

**Request Body:**
```json
{
  "project_id": "uuid-here", // optional - if not provided, calculates all active projects
  "as_of_date": "2025-12-07" // optional - defaults to today
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculation_date": "2025-12-07",
    "projects_processed": 25,
    "total_wip": 8500000,
    "ready_to_invoice_count": 12,
    "results": [
      {
        "project_id": "...",
        "project_code": "ENG-TBWA-SMP-0001-P1",
        "project_name": "SM Investments - Creative Campaign",
        "time_wip": 850000,
        "expense_wip": 0,
        "fee_wip": 0,
        "total_wip": 850000,
        "oldest_entry_date": "2025-10-15",
        "age_days": 53,
        "ready_to_invoice": true
      }
    ]
  }
}
```

**Features:**
- Calculates unbilled time (approved timesheets not yet invoiced)
- Calculates unbilled expenses (from T&E app - future)
- Calculates aging buckets (0-30, 31-60, 61-90, 90+ days)
- Flags projects ready to invoice
- Upserts into `finance_ppm.wip_entries`

**Permissions:**
- Partner, Finance Director, Staff Accountant only

**Usage:**
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-wip-calculate' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"project_id": "uuid-here"}'
```

---

### 3. `finance-ppm-invoice-generate` 🧾

**Purpose:** Generate invoice from WIP entries

**Method:** POST  
**Auth:** Required (JWT - finance roles only)  
**Path:** `/functions/v1/finance-ppm-invoice-generate`

**Request Body:**
```json
{
  "project_id": "uuid-here", // required
  "invoice_date": "2025-12-07", // optional - defaults to today
  "due_date": "2026-01-06", // optional - defaults to +30 days
  "timesheet_entry_ids": ["uuid1", "uuid2"], // optional - if not provided, uses all unbilled
  "notes": "Q4 2025 Services" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid-here",
    "invoice_number": "INV-000123",
    "invoice_date": "2025-12-07",
    "due_date": "2026-01-06",
    "client_name": "SM Investments",
    "subtotal": 850000,
    "tax_amount": 102000,
    "total_amount": 952000,
    "line_count": 15,
    "timesheet_count": 45
  }
}
```

**Features:**
- Fetches project and engagement details
- Aggregates unbilled timesheets
- Calculates subtotal, VAT (12%), and total
- Generates unique invoice number (INV-XXXXXX)
- Creates invoice header and lines
- Links invoice lines to source timesheets
- Sets status to 'draft' (requires manual review before sending)

**VAT Calculation:**
- Standard rate: 12% (Philippines)
- Subtotal = Sum of all timesheet bill_amounts
- Tax amount = Subtotal × 12%
- Total = Subtotal + Tax

**Permissions:**
- Partner, Finance Director, Staff Accountant only

**Usage:**
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-invoice-generate' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "project_id": "uuid-here",
    "notes": "Q4 2025 Professional Services"
  }'
```

---

### 4. `finance-ppm-rag-search` 🔍

**Purpose:** Search knowledge base using vector similarity (pgvector)

**Method:** POST  
**Auth:** Required (JWT)  
**Path:** `/functions/v1/finance-ppm-rag-search`

**Request Body:**
```json
{
  "query": "How do I calculate WIP?", // required
  "limit": 5, // optional - default 5
  "category": "finance" // optional - filter by category
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "How do I calculate WIP?",
    "results_count": 3,
    "results": [
      {
        "chunk_id": "uuid-here",
        "document_id": "uuid-here",
        "document_title": "WIP Calculation Guide",
        "chunk_text": "Work in Progress (WIP) represents unbilled work...",
        "similarity": 0.87,
        "metadata": {
          "category": "finance",
          "role_access": ["partner", "finance_director"]
        }
      }
    ]
  }
}
```

**Features:**
- Generates embedding using OpenAI ada-002 (1536 dims)
- Vector similarity search with pgvector (cosine distance)
- Role-based filtering (respects document visibility)
- Category filtering
- Returns top N most relevant chunks

**Permissions:**
- All authenticated users
- Results filtered by role and visibility

**Environment Variables:**
- `OPENAI_API_KEY` - Required

**Usage:**
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-rag-search' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"query": "How do I calculate WIP?", "limit": 3}'
```

---

### 5. `finance-ppm-ai-query` 🤖

**Purpose:** AI assistant with RAG and tool calling

**Method:** POST  
**Auth:** Required (JWT)  
**Path:** `/functions/v1/finance-ppm-ai-query`

**Request Body:**
```json
{
  "session_id": "uuid-here", // optional - creates new if not provided
  "message": "What is the profitability of project ENG-TBWA-SMP-0001-P1?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-here",
    "message": "Based on the data, project ENG-TBWA-SMP-0001-P1 has a margin of 22.5% with total revenue of ₱2,150,000...",
    "sources": [
      {
        "type": "document",
        "id": "uuid-here",
        "title": "Project Profitability Analysis",
        "excerpt": "Analyzing project profitability requires..."
      }
    ],
    "tool_calls": [
      {
        "tool": "get_project_profitability",
        "params": { "project_code": "ENG-TBWA-SMP-0001-P1" },
        "result": { ... }
      }
    ]
  }
}
```

**Features:**
- GPT-4 Turbo with RAG (retrieval-augmented generation)
- Vector search for relevant knowledge base docs
- Tool calling for live data access
- Session-based conversation history
- Sources citation
- Role-aware responses

**Available Tools:**
1. **`get_project_profitability`** - Get P&L for a project
2. **`get_wip_summary`** - Get WIP by client or all
3. **`get_ar_aging`** - Get AR aging report

**Workflow:**
1. User sends message
2. Generate embedding for query
3. Search knowledge base (top 3 relevant docs)
4. Build context with knowledge + conversation history
5. Call GPT-4 with tools available
6. If GPT-4 calls tools, execute and return results
7. Get final GPT-4 response with tool results
8. Save message and return to user

**Permissions:**
- All authenticated users
- Tool results filtered by role (via RLS)

**Environment Variables:**
- `OPENAI_API_KEY` - Required

**Usage:**
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-ai-query' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Show me all projects with WIP over 1 million"
  }'
```

---

### 6. `finance-ppm-scheduled-jobs` ⏰

**Purpose:** Run nightly/scheduled maintenance tasks

**Method:** POST  
**Auth:** Internal (cron secret)  
**Path:** `/functions/v1/finance-ppm-scheduled-jobs`

**Request Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-12-07T02:00:00Z",
    "jobs": [
      {
        "name": "wip_calculation",
        "status": "completed",
        "projects_processed": 112,
        "errors": 0
      },
      {
        "name": "mark_overdue_invoices",
        "status": "completed",
        "invoices_marked": 8
      },
      {
        "name": "update_project_financials",
        "status": "completed",
        "projects_updated": 112
      },
      {
        "name": "cleanup_old_drafts",
        "status": "completed",
        "timesheets_deleted": 23
      }
    ],
    "summary": {
      "total_jobs": 4,
      "successful": 4,
      "failed": 0
    }
  }
}
```

**Jobs Executed:**

1. **WIP Calculation** - Calculate WIP for all active projects
2. **Mark Overdue Invoices** - Update status for invoices past due date
3. **Update Project Financials** - Rollup monthly actuals
4. **Cleanup Old Drafts** - Delete draft timesheets > 3 months old

**Scheduling:**

Use Supabase Cron or external scheduler (GitHub Actions, Vercel Cron, etc.):

**Supabase pg_cron:**
```sql
-- Run nightly at 2 AM UTC
SELECT cron.schedule(
  'finance-ppm-nightly-jobs',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/finance-ppm-scheduled-jobs',
      headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
    ) AS request_id;
  $$
);
```

**GitHub Actions (`.github/workflows/nightly-jobs.yml`):**
```yaml
name: Finance PPM Nightly Jobs

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM UTC daily

jobs:
  run-scheduled-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Call scheduled jobs
        run: |
          curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-scheduled-jobs' \
            -H 'Authorization: Bearer ${{ secrets.CRON_SECRET }}'
```

**Environment Variables:**
- `CRON_SECRET` - Required (set in Supabase secrets)

---

## Environment Variables

**Required for all functions:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-provided)

**Required for AI/RAG functions:**
- `OPENAI_API_KEY` - OpenAI API key

**Required for scheduled jobs:**
- `CRON_SECRET` - Secret for cron authentication

**Set in Supabase:**
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set CRON_SECRET=your-random-secret-here
```

---

## Deployment

### Deploy all functions:
```bash
supabase functions deploy finance-ppm-dashboard
supabase functions deploy finance-ppm-wip-calculate
supabase functions deploy finance-ppm-invoice-generate
supabase functions deploy finance-ppm-rag-search
supabase functions deploy finance-ppm-ai-query
supabase functions deploy finance-ppm-scheduled-jobs
```

### Deploy single function:
```bash
supabase functions deploy finance-ppm-dashboard
```

### Test locally:
```bash
supabase functions serve finance-ppm-dashboard --env-file .env.local

# Call locally
curl -X GET 'http://localhost:54321/functions/v1/finance-ppm-dashboard' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Testing

### Test Dashboard:
```bash
# Get JWT token from Supabase Auth
export JWT_TOKEN="eyJhbGc..."

curl -X GET 'https://your-project.supabase.co/functions/v1/finance-ppm-dashboard' \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Test WIP Calculation:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-wip-calculate' \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### Test Invoice Generation:
```bash
# Get a project ID first
export PROJECT_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM finance_ppm.projects LIMIT 1")

curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-invoice-generate' \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"project_id\": \"$PROJECT_ID\"}"
```

### Test RAG Search:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-rag-search' \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query": "How do I calculate WIP?"}'
```

### Test AI Query:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-ai-query' \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"message": "What projects have WIP over 500k?"}'
```

### Test Scheduled Jobs:
```bash
export CRON_SECRET="your-secret"

curl -X POST 'https://your-project.supabase.co/functions/v1/finance-ppm-scheduled-jobs' \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Error Handling

All functions return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (validation error, missing params)
- `401` - Unauthorized (missing/invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `500` - Server error

---

## Performance Considerations

**Dashboard:**
- Uses pre-computed analytics views
- Response time: ~500ms
- Cache on client: 60 seconds

**WIP Calculation:**
- Processes 100-200 projects in ~30 seconds
- Run nightly via scheduled jobs
- Manual trigger for specific project: ~1-2 seconds

**Invoice Generation:**
- Processes 50-200 timesheets in ~2-3 seconds
- Atomic transaction (rollback on error)

**RAG Search:**
- OpenAI embedding: ~500ms
- Vector search: ~100ms
- Total: ~600-800ms

**AI Query:**
- Embedding + search: ~600ms
- GPT-4 call: ~2-5 seconds
- Tool execution: ~500ms per tool
- Total: ~3-10 seconds (depending on tools)

**Scheduled Jobs:**
- Runtime: ~5-10 minutes for 1000 projects
- Run at 2 AM UTC (low traffic)

---

## Troubleshooting

### "Missing authorization header"
- Ensure JWT token is included in `Authorization: Bearer <token>` header
- Get token from Supabase Auth: `supabase.auth.getSession()`

### "Unauthorized - invalid cron secret"
- For scheduled jobs, use `CRON_SECRET` in Authorization header
- Set secret: `supabase secrets set CRON_SECRET=your-secret`

### "Insufficient permissions"
- WIP calculation and invoice generation require finance roles (partner, finance_director, staff_accountant)
- Check user role in database

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota and billing

### "Project not found"
- Verify project_id exists and belongs to user's tenant
- Check RLS policies are allowing access

---

## Next Steps

**Phase 6: Frontend UI**
1. Build 10 main routes
2. Create 50+ React components
3. Wire up Edge Functions to UI
4. Implement dashboards with charts
5. Add AI assistant chat interface

**Estimated Time:** 40-60 hours

---

## Summary

**Phase 5 Achievements:**

✅ **6 Edge Functions** created (Deno runtime)  
✅ **Business logic** (Dashboard, WIP, Invoice)  
✅ **AI/RAG** (Vector search, GPT-4 assistant)  
✅ **Scheduled jobs** (Nightly maintenance)  
✅ **Tool calling** (3 AI tools for live data)  
✅ **Role-based access** (RLS enforced in all functions)  
✅ **Error handling** (Consistent response format)  
✅ **PH tax compliance** (VAT 12%, withholding tax)  

**Total Edge Function Code:** 1,500+ lines

---

**Phase 5 Status:** ✅ COMPLETE  
**Next Phase:** Phase 6 - Frontend UI  
**Last Updated:** 2025-12-07
