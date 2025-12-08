# Medallion Architecture Migrations

This directory contains the SQL migrations for implementing the Medallion data architecture pattern. The Medallion architecture organizes data into distinct layers based on the level of refinement and business readiness.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PLATINUM LAYER                               │
│  AI/ML Ready: Embeddings, NL2SQL Cache, Predictions, Agent Memory   │
├─────────────────────────────────────────────────────────────────────┤
│                          GOLD LAYER                                  │
│  Aggregated: Monthly Summaries, Compliance Metrics, Trends          │
├─────────────────────────────────────────────────────────────────────┤
│                         SILVER LAYER                                 │
│  Validated: Standardized Categories, Cleaned Data, BIR Mappings     │
├─────────────────────────────────────────────────────────────────────┤
│                         BRONZE LAYER                                 │
│  Raw: Unvalidated data from Odoo, OCR, LLM requests, MCP events     │
└─────────────────────────────────────────────────────────────────────┘
```

## Migration Files

| File | Schema | Purpose |
|------|--------|---------|
| `20251208_300_medallion_bronze.sql` | bronze | Raw data ingestion tables |
| `20251208_301_medallion_silver.sql` | silver | Validated and standardized data |
| `20251208_302_medallion_gold.sql` | gold | Aggregated business metrics |
| `20251208_303_medallion_platinum.sql` | platinum | AI/ML-ready data with embeddings |

## Layer Details

### Bronze Layer (Raw Data)
- **Purpose**: Store raw, unvalidated data exactly as received from source systems
- **Tables**:
  - `bronze.raw_expenses` - Raw expense data from Odoo
  - `bronze.raw_ppm_tasks` - Raw PPM/project tasks
  - `bronze.raw_mcp_registrations` - MCP server installation events
  - `bronze.raw_receipt_ocr` - Raw OCR results from receipts
  - `bronze.raw_llm_requests` - AI observability logs

### Silver Layer (Validated Data)
- **Purpose**: Clean, validate, and standardize data for business use
- **Tables**:
  - `silver.validated_expenses` - Validated expenses with BIR categories
  - `silver.validated_ppm_tasks` - Standardized PPM tasks with compliance status
  - `silver.validated_mcp_installations` - Active MCP installations
  - `silver.validated_receipts` - Verified receipt data
  - `silver.bir_schedule` - BIR filing schedule reference

### Gold Layer (Aggregated Analytics)
- **Purpose**: Pre-computed aggregations for dashboards and reporting
- **Tables**:
  - `gold.monthly_expense_summary` - Monthly expense metrics by category/department
  - `gold.ppm_compliance_metrics` - BIR compliance tracking
  - `gold.category_trends` - Expense trends over time
  - `gold.mcp_usage_analytics` - MCP server usage metrics
  - `gold.employee_expense_patterns` - Individual spending patterns

### Platinum Layer (AI/ML Ready)
- **Purpose**: Vector embeddings and AI-ready data structures
- **Tables**:
  - `platinum.document_embeddings` - Vector embeddings for RAG
  - `platinum.nl2sql_cache` - Cached NL2SQL queries for GenieView
  - `platinum.expense_predictions` - ML predictions for categorization
  - `platinum.mcp_capability_embeddings` - Semantic search over MCP capabilities
  - `platinum.agent_memory` - Persistent memory for AI agents

## Applying Migrations

```bash
# Apply all medallion migrations in order
psql "$POSTGRES_URL" -f 20251208_300_medallion_bronze.sql
psql "$POSTGRES_URL" -f 20251208_301_medallion_silver.sql
psql "$POSTGRES_URL" -f 20251208_302_medallion_gold.sql
psql "$POSTGRES_URL" -f 20251208_303_medallion_platinum.sql
```

## Row-Level Security

All tables implement tenant isolation via RLS policies:

```sql
CREATE POLICY tenant_isolation ON schema.table_name
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

Set the tenant context before queries:

```sql
SET app.current_tenant_id = 'your-tenant-uuid';
```

## Data Flow

1. **Ingestion** → Data lands in Bronze layer via Supabase Edge Functions or direct inserts
2. **Validation** → Bronze data is processed and validated into Silver layer
3. **Aggregation** → Silver data is aggregated into Gold layer (scheduled jobs)
4. **Embedding** → Documents and queries are embedded in Platinum layer for AI features

## Dependencies

- PostgreSQL 15+ with pgvector extension
- Supabase with Row-Level Security enabled
- Core tenant/user tables (assumed to exist)

## Related Components

- **MCP Marketplace UI**: `src/components/marketplace/`
- **Expense Agent**: Uses Silver/Gold layers for classification
- **GenieView**: Uses Platinum layer for NL2SQL
- **BIR Task Creator**: Uses Silver layer for compliance tracking
