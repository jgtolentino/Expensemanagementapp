# Finance PPM RAG Infrastructure

**Phase:** 3 - Embeddings, RAG Pipeline & Search API  
**Date:** 2025-12-07

---

## Overview

This document specifies the complete RAG (Retrieval-Augmented Generation) infrastructure for Finance PPM, including:
1. **Embedding pipeline** - Sync, chunk, embed documents
2. **Vector search API** - Semantic document retrieval
3. **Live data tools** - Project/portfolio metrics
4. **Orchestration layer** - Combine RAG + tools for AI answers

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Question                             │
│ "What is the profitability of Project Acme Brand X?"        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Orchestration Layer                             │
│  POST /api/finance-ppm/assistant/query                       │
│                                                               │
│  1. Intent Classification                                    │
│     → "project_health"                                       │
│                                                               │
│  2. Retrieval Plan                                           │
│     → RAG: Search docs with tag="project-management"         │
│     → Tool: project_snapshot("PRJ-ACME-001")                 │
│                                                               │
│  3. Execute in Parallel                                      │
│     ├─→ RAG Search ──→ Retrieved Docs                        │
│     └─→ Tool Call ───→ Live Metrics                          │
│                                                               │
│  4. Compose Answer                                           │
│     → LLM (GPT-4/Claude) + Context                           │
│     → Format: Text + Tables + Sources                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Answer                                  │
│  "Project Acme Brand X is 22% under budget with..."         │
│  [Table: Budget vs Actual]                                  │
│  Sources: Project Snapshot Tool, Finance Playbook           │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 1: Embedding Pipeline

### 1.1 Notion Sync Job

**Purpose:** Sync Finance PPM Notion workspace daily

**File:** `tools/sync_finance_ppm_notion_docs.ts`

```typescript
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface NotionPage {
  id: string;
  properties: any;
  last_edited_time: string;
}

async function syncNotionWorkspace() {
  const workspaceId = process.env.FINANCE_PPM_NOTION_WORKSPACE_ID;
  
  console.log('🔄 Starting Notion sync for Finance PPM...');
  
  // Query all pages
  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'page',
    },
    query: 'Finance PPM',
  });
  
  const pages = response.results as NotionPage[];
  console.log(`📄 Found ${pages.length} pages`);
  
  for (const page of pages) {
    await syncPage(page);
  }
  
  console.log('✅ Notion sync complete');
}

async function syncPage(page: NotionPage) {
  const title = extractTitle(page);
  const docType = extractDocType(page);
  const tags = extractTags(page);
  const content = await extractContent(page.id);
  
  const { data: existingDoc } = await supabase
    .from('finance_ppm.knowledge_documents')
    .select('id, last_synced_at')
    .eq('source_id', page.id)
    .single();
  
  const lastEditedTime = new Date(page.last_edited_time);
  
  if (existingDoc) {
    const lastSynced = new Date(existingDoc.last_synced_at);
    
    if (lastEditedTime <= lastSynced) {
      console.log(`⏭️  Skipping ${title} (no changes)`);
      return;
    }
    
    // Update existing doc
    await supabase
      .from('finance_ppm.knowledge_documents')
      .update({
        title,
        doc_type: docType,
        tags,
        content,
        last_synced_at: new Date().toISOString(),
        embedding_status: 'pending',
      })
      .eq('id', existingDoc.id);
    
    console.log(`🔄 Updated ${title}`);
  } else {
    // Insert new doc
    const { data: newDoc } = await supabase
      .from('finance_ppm.knowledge_documents')
      .insert({
        title,
        doc_type: docType,
        source: 'notion',
        source_id: page.id,
        tags,
        content,
        last_synced_at: new Date().toISOString(),
        embedding_status: 'pending',
      })
      .select()
      .single();
    
    console.log(`✨ Created ${title}`);
  }
}

function extractTitle(page: NotionPage): string {
  const titleProp = page.properties.title || page.properties.Title || page.properties.Name;
  if (!titleProp) return 'Untitled';
  
  const titleArray = titleProp.title || titleProp.rich_text;
  if (!titleArray || titleArray.length === 0) return 'Untitled';
  
  return titleArray.map((t: any) => t.plain_text).join('');
}

function extractDocType(page: NotionPage): string {
  const docTypeProp = page.properties.doc_type || page.properties.DocType || page.properties.Type;
  if (!docTypeProp) return 'Guide';
  
  return docTypeProp.select?.name || 'Guide';
}

function extractTags(page: NotionPage): string[] {
  const tagsProp = page.properties.tags || page.properties.Tags;
  if (!tagsProp) return [];
  
  return (tagsProp.multi_select || []).map((tag: any) => tag.name);
}

async function extractContent(pageId: string): Promise<string> {
  const blocks = [];
  let cursor;
  
  while (true) {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    
    blocks.push(...response.results);
    
    if (!response.has_more) break;
    cursor = response.next_cursor;
  }
  
  return blocks
    .map((block: any) => blockToText(block))
    .filter(Boolean)
    .join('\n\n');
}

function blockToText(block: any): string {
  const type = block.type;
  
  if (type === 'paragraph') {
    return block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'heading_1') {
    return '# ' + block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'heading_2') {
    return '## ' + block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'heading_3') {
    return '### ' + block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'bulleted_list_item') {
    return '- ' + block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'numbered_list_item') {
    return '1. ' + block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
  } else if (type === 'code') {
    return '```\n' + block.code.rich_text.map((t: any) => t.plain_text).join('') + '\n```';
  }
  
  return '';
}

// Run sync
syncNotionWorkspace().catch(console.error);
```

**Scheduler:**
```typescript
// Cron job (run daily at 2 AM)
// crontab: 0 2 * * * cd /path/to/project && npm run sync:notion
```

---

### 1.2 Chunking & Embedding Service

**Purpose:** Chunk documents and generate embeddings

**File:** `supabase/functions/finance-ppm-embed-docs/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_KEY')!
);

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: string;
  tags: string[];
}

serve(async (req) => {
  try {
    // Get pending documents
    const { data: docs } = await supabase
      .from('finance_ppm.knowledge_documents')
      .select('*')
      .eq('embedding_status', 'pending')
      .limit(10);
    
    if (!docs || docs.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending documents' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`📝 Processing ${docs.length} documents...`);
    
    for (const doc of docs) {
      await processDocument(doc);
    }
    
    return new Response(JSON.stringify({ processed: docs.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function processDocument(doc: Document) {
  console.log(`🔄 Processing: ${doc.title}`);
  
  // Mark as in_progress
  await supabase
    .from('finance_ppm.knowledge_documents')
    .update({ embedding_status: 'in_progress' })
    .eq('id', doc.id);
  
  try {
    // Delete old chunks
    await supabase
      .from('finance_ppm.knowledge_chunks')
      .delete()
      .eq('document_id', doc.id);
    
    // Chunk the document
    const chunks = chunkText(doc.content, {
      maxTokens: 512,
      overlap: 100,
    });
    
    console.log(`  📦 Created ${chunks.length} chunks`);
    
    // Embed each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      const embedding = await getEmbedding(chunk.content);
      
      await supabase
        .from('finance_ppm.knowledge_chunks')
        .insert({
          document_id: doc.id,
          chunk_index: i,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding,
        });
    }
    
    // Mark as completed
    await supabase
      .from('finance_ppm.knowledge_documents')
      .update({ embedding_status: 'completed' })
      .eq('id', doc.id);
    
    console.log(`  ✅ Completed: ${doc.title}`);
  } catch (error) {
    console.error(`  ❌ Failed: ${doc.title}`, error);
    
    await supabase
      .from('finance_ppm.knowledge_documents')
      .update({ embedding_status: 'failed' })
      .eq('id', doc.id);
  }
}

interface ChunkOptions {
  maxTokens: number;
  overlap: number;
}

interface Chunk {
  content: string;
  metadata: Record<string, any>;
}

function chunkText(text: string, options: ChunkOptions): Chunk[] {
  const { maxTokens, overlap } = options;
  
  // Simple sentence-based chunking
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const chunks: Chunk[] = [];
  
  let currentChunk = '';
  let currentTokenCount = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);
    
    if (currentTokenCount + sentenceTokens > maxTokens && currentChunk) {
      // Push current chunk
      chunks.push({
        content: currentChunk.trim(),
        metadata: {},
      });
      
      // Start new chunk with overlap
      const overlapSentences = currentChunk.split(/[.!?]+/).slice(-2).join('. ');
      currentChunk = overlapSentences + '. ' + sentence;
      currentTokenCount = estimateTokens(currentChunk);
    } else {
      currentChunk += '. ' + sentence;
      currentTokenCount += sentenceTokens;
    }
  }
  
  // Push final chunk
  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {},
    });
  }
  
  return chunks;
}

function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  
  return response.data[0].embedding;
}
```

**Deploy:**
```bash
supabase functions deploy finance-ppm-embed-docs
```

**Trigger:**
```sql
-- Auto-trigger embedding when document is synced
CREATE OR REPLACE FUNCTION trigger_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function (via HTTP or pg_net)
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/finance-ppm-embed-docs',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_key')),
    body := jsonb_build_object('document_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_document_insert
  AFTER INSERT OR UPDATE ON finance_ppm.knowledge_documents
  FOR EACH ROW
  WHEN (NEW.embedding_status = 'pending')
  EXECUTE FUNCTION trigger_embedding();
```

---

## Component 2: Vector Search API

### 2.1 RAG Search Endpoint

**Purpose:** Semantic search over knowledge base

**File:** `supabase/functions/finance-ppm-rag-search/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_KEY')!
);

interface SearchRequest {
  query: string;
  scope?: string[];
  filters?: {
    client_name?: string;
    doc_type?: string[];
    tags?: string[];
  };
  top_k?: number;
}

interface SearchResult {
  document_id: string;
  title: string;
  doc_type: string;
  score: number;
  content_snippet: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  try {
    const body: SearchRequest = await req.json();
    const { query, filters = {}, top_k = 8 } = body;
    
    console.log(`🔍 Searching for: "${query}"`);
    
    // Get query embedding
    const queryEmbedding = await getEmbedding(query);
    
    // Build SQL filters
    let filterSQL = '';
    const filterParams: any = {};
    
    if (filters.client_name) {
      filterSQL += ' AND kd.client_name = :client_name';
      filterParams.client_name = filters.client_name;
    }
    
    if (filters.doc_type && filters.doc_type.length > 0) {
      filterSQL += ' AND kd.doc_type = ANY(:doc_types)';
      filterParams.doc_types = filters.doc_type;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filterSQL += ' AND kd.tags && :tags';
      filterParams.tags = filters.tags;
    }
    
    // Vector search
    const { data: chunks, error } = await supabase.rpc('search_finance_ppm_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: top_k * 2, // Get more chunks initially
      filter_sql: filterSQL,
      filter_params: filterParams,
    });
    
    if (error) throw error;
    
    // Group by document and rank
    const resultsByDoc = new Map<string, SearchResult>();
    
    for (const chunk of chunks || []) {
      const existing = resultsByDoc.get(chunk.document_id);
      
      if (!existing) {
        resultsByDoc.set(chunk.document_id, {
          document_id: chunk.document_id,
          title: chunk.title,
          doc_type: chunk.doc_type,
          score: chunk.similarity,
          content_snippet: chunk.content.substring(0, 300) + '...',
          metadata: chunk.metadata,
        });
      }
    }
    
    // Take top_k documents
    const results = Array.from(resultsByDoc.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, top_k);
    
    console.log(`  ✅ Found ${results.length} documents`);
    
    return new Response(
      JSON.stringify({
        query,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  
  return response.data[0].embedding;
}
```

**Helper Function (Postgres):**

```sql
CREATE OR REPLACE FUNCTION search_finance_ppm_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  filter_sql text DEFAULT '',
  filter_params jsonb DEFAULT '{}'
)
RETURNS TABLE (
  document_id uuid,
  chunk_id uuid,
  content text,
  similarity float,
  title text,
  doc_type text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      kd.id AS document_id,
      kc.id AS chunk_id,
      kc.content,
      1 - (kc.embedding <=> $1) AS similarity,
      kd.title,
      kd.doc_type,
      kc.metadata
    FROM finance_ppm.knowledge_chunks kc
    JOIN finance_ppm.knowledge_documents kd ON kd.id = kc.document_id
    WHERE kd.embedding_status = ''completed''
      AND (1 - (kc.embedding <=> $1)) > $2
      %s
    ORDER BY similarity DESC
    LIMIT $3
  ', filter_sql)
  USING query_embedding, match_threshold, match_count;
END;
$$;
```

---

## Component 3: Live Data Tools

### 3.1 Project Snapshot Tool

**File:** `supabase/functions/finance-ppm-tools/project_snapshot.ts`

```typescript
export async function projectSnapshot(
  supabase: SupabaseClient,
  projectCode: string
) {
  const { data, error } = await supabase
    .from('finance_ppm.v_project_overview')
    .select('*')
    .eq('project_code', projectCode)
    .single();
  
  if (error || !data) {
    throw new Error(`Project not found: ${projectCode}`);
  }
  
  return {
    tool: 'project_snapshot',
    input: { project_code: projectCode },
    output: {
      project_code: data.project_code,
      project_name: data.project_name,
      client_name: data.client_name,
      status: data.status,
      budget: data.budget_amount,
      actual_cost: data.actual_cost,
      revenue: data.revenue,
      margin_pct: data.margin_pct,
      wip: data.wip_amount,
      ar: data.ar_amount,
      risk_level: data.risk_level,
      is_over_budget: data.is_over_budget,
      currency: 'PHP',
    },
  };
}
```

### 3.2 Portfolio Snapshot Tool

```typescript
export async function portfolioSnapshot(
  supabase: SupabaseClient,
  filters: {
    portfolio?: string;
    client_name?: string;
    at_risk_only?: boolean;
  } = {}
) {
  let query = supabase
    .from('finance_ppm.v_portfolio_overview')
    .select('*');
  
  if (filters.portfolio) {
    query = query.eq('portfolio', filters.portfolio);
  }
  
  if (filters.client_name) {
    query = query.eq('client_name', filters.client_name);
  }
  
  if (filters.at_risk_only) {
    query = query.or('avg_margin.lt.15,projects_over_budget.gt.0');
  }
  
  const { data, error } = await query.order('avg_margin', { ascending: true });
  
  if (error) throw error;
  
  return {
    tool: 'portfolio_snapshot',
    input: filters,
    output: {
      portfolios: data,
      summary: {
        total_portfolios: data.length,
        at_risk_count: data.filter((p) => p.avg_margin < 15 || p.projects_over_budget > 0).length,
      },
    },
  };
}
```

### 3.3 Month-End Status Tool

```typescript
export async function monthEndStatus(
  supabase: SupabaseClient,
  period: string // YYYY-MM
) {
  const periodDate = new Date(period + '-01').toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('finance_ppm.v_month_end_status')
    .select('*')
    .eq('period_month', periodDate)
    .single();
  
  if (error) throw error;
  
  return {
    tool: 'month_end_status',
    input: { period },
    output: {
      period_month: data.period_month,
      total_tasks: data.total_tasks,
      completed_tasks: data.completed_tasks,
      completion_pct: data.completion_pct,
      completion_by_category: data.completion_by_category,
      blocked_tasks: data.blocked_tasks,
      readiness_level:
        data.completion_pct >= 90
          ? 'ready'
          : data.completion_pct >= 70
          ? 'on_track'
          : 'at_risk',
    },
  };
}
```

### 3.4 Tools Manifest

**File:** `spec/finance-ppm/FINANCE_PPM_TOOLS.yaml`

```yaml
tools:
  - name: project_snapshot
    description: Get financial snapshot for a specific project
    input_schema:
      type: object
      properties:
        project_code:
          type: string
          description: Project code (e.g., PRJ-ACME-001)
      required:
        - project_code
    output_schema:
      type: object
      properties:
        project_code: string
        project_name: string
        client_name: string
        budget: number
        actual_cost: number
        revenue: number
        margin_pct: number
        wip: number
        ar: number
        risk_level: string
    permissions:
      - finance
      - pm
      - leadership

  - name: portfolio_snapshot
    description: Get portfolio-level rollup of projects
    input_schema:
      type: object
      properties:
        portfolio:
          type: string
        client_name:
          type: string
        at_risk_only:
          type: boolean
    output_schema:
      type: object
      properties:
        portfolios: array
        summary: object
    permissions:
      - finance
      - leadership

  - name: month_end_status
    description: Get month-end close readiness status
    input_schema:
      type: object
      properties:
        period:
          type: string
          description: YYYY-MM format
      required:
        - period
    output_schema:
      type: object
      properties:
        period_month: string
        total_tasks: number
        completed_tasks: number
        completion_pct: number
        readiness_level: string
    permissions:
      - finance

  - name: rate_card_analysis
    description: Analyze rate cards for a role/discipline
    input_schema:
      type: object
      properties:
        role:
          type: string
        discipline:
          type: string
        market:
          type: string
    output_schema:
      type: object
      properties:
        rate_cards: array
        median_client_rate: number
        median_cost_rate: number
        median_margin_pct: number
    permissions:
      - finance
      - pm
```

---

## Component 4: Assistant Orchestration

### 4.1 Query Endpoint

**File:** `supabase/functions/finance-ppm-query/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';
import { projectSnapshot, portfolioSnapshot, monthEndStatus } from './tools.ts';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_KEY')!
);

interface QueryRequest {
  message: string;
  role: 'Finance' | 'PM' | 'Account' | 'Leadership';
  context?: {
    scope?: string;
    project_code?: string;
    client_name?: string;
    period?: string;
  };
}

serve(async (req) => {
  try {
    const body: QueryRequest = await req.json();
    const { message, role, context = {} } = body;
    
    console.log(`💬 Query from ${role}: "${message}"`);
    
    // Step 1: Classify intent
    const intent = await classifyIntent(message, context);
    console.log(`  🎯 Intent: ${intent.type}`);
    
    // Step 2: Build retrieval plan
    const plan = buildRetrievalPlan(intent, context, role);
    console.log(`  📋 Plan: RAG=${plan.useRAG}, Tools=${plan.tools.join(', ')}`);
    
    // Step 3: Execute RAG + Tools in parallel
    const [ragResults, toolResults] = await Promise.all([
      plan.useRAG ? executeRAG(message, plan.ragFilters) : Promise.resolve([]),
      executeTools(plan.tools, context),
    ]);
    
    console.log(`  📚 RAG: ${ragResults.length} docs`);
    console.log(`  🔧 Tools: ${Object.keys(toolResults).length} called`);
    
    // Step 4: Compose answer with LLM
    const answer = await composeAnswer({
      message,
      role,
      intent,
      ragResults,
      toolResults,
    });
    
    console.log(`  ✅ Answer generated`);
    
    return new Response(JSON.stringify(answer), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function classifyIntent(message: string, context: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an intent classifier for a Finance PPM AI assistant. Classify the user's query into one of these intents:
- project_health: Ask about a specific project's financial health
- portfolio_analysis: Ask about portfolio or client-level analysis
- month_end_query: Ask about month-end close process or readiness
- rate_governance: Ask about rate cards, margins, or vendor rates
- knowledge_lookup: General "how-to" or policy questions

Return JSON: { "type": "<intent>", "confidence": 0-1, "entities": {} }`,
      },
      {
        role: 'user',
        content: `Query: "${message}"\nContext: ${JSON.stringify(context)}`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(response.choices[0].message.content);
}

function buildRetrievalPlan(intent: any, context: any, role: string) {
  const plan: any = {
    useRAG: false,
    ragFilters: {},
    tools: [],
  };
  
  switch (intent.type) {
    case 'project_health':
      plan.useRAG = true;
      plan.ragFilters = { tags: ['project-management', 'finance'] };
      plan.tools = ['project_snapshot'];
      break;
    
    case 'portfolio_analysis':
      plan.useRAG = true;
      plan.ragFilters = { tags: ['portfolio', 'client-management'] };
      plan.tools = ['portfolio_snapshot'];
      break;
    
    case 'month_end_query':
      plan.useRAG = true;
      plan.ragFilters = { tags: ['month-end', 'close', 'accounting'] };
      if (role === 'Finance') {
        plan.tools = ['month_end_status'];
      }
      break;
    
    case 'rate_governance':
      plan.useRAG = true;
      plan.ragFilters = { tags: ['rates', 'governance', 'vendors'] };
      plan.tools = ['rate_card_analysis'];
      break;
    
    case 'knowledge_lookup':
      plan.useRAG = true;
      plan.ragFilters = {};
      break;
  }
  
  return plan;
}

async function executeRAG(query: string, filters: any) {
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/finance-ppm-rag-search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_KEY')}`,
      },
      body: JSON.stringify({
        query,
        filters,
        top_k: 5,
      }),
    }
  );
  
  const data = await response.json();
  return data.results || [];
}

async function executeTools(tools: string[], context: any) {
  const results: Record<string, any> = {};
  
  for (const tool of tools) {
    try {
      switch (tool) {
        case 'project_snapshot':
          if (context.project_code) {
            results[tool] = await projectSnapshot(supabase, context.project_code);
          }
          break;
        
        case 'portfolio_snapshot':
          results[tool] = await portfolioSnapshot(supabase, {
            client_name: context.client_name,
          });
          break;
        
        case 'month_end_status':
          if (context.period) {
            results[tool] = await monthEndStatus(supabase, context.period);
          } else {
            const now = new Date();
            const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            results[tool] = await monthEndStatus(supabase, period);
          }
          break;
      }
    } catch (error) {
      console.error(`Tool ${tool} failed:`, error);
      results[tool] = { error: error.message };
    }
  }
  
  return results;
}

async function composeAnswer(params: any) {
  const { message, role, ragResults, toolResults } = params;
  
  // Build context for LLM
  const contextParts = [];
  
  if (ragResults.length > 0) {
    contextParts.push('# Knowledge Base Context\n');
    ragResults.forEach((doc: any, i: number) => {
      contextParts.push(`## Document ${i + 1}: ${doc.title}\n${doc.content_snippet}\n`);
    });
  }
  
  if (Object.keys(toolResults).length > 0) {
    contextParts.push('\n# Live Data\n');
    for (const [tool, result] of Object.entries(toolResults)) {
      contextParts.push(`## ${tool}\n${JSON.stringify(result.output, null, 2)}\n`);
    }
  }
  
  const context = contextParts.join('\n');
  
  // Generate answer
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a Finance PPM AI assistant for an advertising agency. Your role is to answer questions about project financials, portfolios, month-end close, and rate governance.

Rules:
1. Use data from Live Data tools for all numeric facts (budgets, margins, WIP, AR)
2. Use Knowledge Base for process explanations, policies, and how-to
3. Never hallucinate numbers - if data is missing, say so
4. Format tables using Markdown
5. Cite sources at the end
6. Suggest 2-3 follow-up questions
7. Adjust detail level based on user role: ${role}

User Role Guidelines:
- Finance: Full financial details (costs, margins, WIP, AR/AP)
- PM: Project-focused (scope, timeline, risk, high-level budget)
- Leadership: Strategic (portfolio health, trends, key risks)
- Account: Client-focused (deliverables, satisfaction, revenue)`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nUser Question: ${message}\n\nProvide a comprehensive answer with tables where appropriate.`,
      },
    ],
  });
  
  const answerText = response.choices[0].message.content;
  
  // Extract tables (simplified)
  const tables = extractTables(answerText);
  
  // Build sources
  const sources = {
    documents: ragResults.map((doc: any) => ({
      document_id: doc.document_id,
      title: doc.title,
      score: doc.score,
    })),
    tools: toolResults,
  };
  
  // Suggest follow-ups
  const suggested_followups = extractFollowUps(answerText);
  
  return {
    answer: answerText,
    tables,
    sources,
    suggested_followups,
  };
}

function extractTables(text: string): any[] {
  // Simple Markdown table extraction (improve with proper parser)
  const tables = [];
  const lines = text.split('\n');
  
  let inTable = false;
  let currentTable: string[] = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      inTable = true;
      currentTable.push(line);
    } else if (inTable && !line.trim().startsWith('|')) {
      if (currentTable.length > 2) {
        tables.push({
          markdown: currentTable.join('\n'),
        });
      }
      currentTable = [];
      inTable = false;
    }
  }
  
  return tables;
}

function extractFollowUps(text: string): string[] {
  // Extract follow-up questions (look for numbered lists near end)
  const followUpSection = text.match(/follow[\s-]up.*?:\s*\n([\s\S]*?)($|\n\n)/i);
  if (!followUpSection) return [];
  
  const lines = followUpSection[1].split('\n');
  return lines
    .filter((line) => /^\d+\./.test(line.trim()))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .slice(0, 3);
}
```

---

**Status:** Phase 3 Complete ✅  
**Next:** Phase 4 - Build UI Components  
**Components:** 4 (Sync, Embed, Search, Orchestration)  
**APIs:** 4 endpoints

I'll continue with Phase 4 and build the actual UI components. Would you like me to proceed?