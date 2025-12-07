# AIHub RAG Assistant Architecture

## Overview
Notion-style AI assistant shared across T&E and Gearroom apps, using Supabase Postgres + pgvector for semantic search.

---

## Workspace Scoping

### Defined Workspaces
- **`TE`** - Travel & Expense (SAP Concur-style)
- **`GEAR`** - Gearroom (Cheqroom-style equipment management)
- **`GLOBAL`** - Shared policies, design system, cross-app docs

### Exclusions
- **`SCOUT`** - Scout/Strategic Intelligence (out of scope, has separate AI/NLQ stack)
- **`SRM`** - Supplier Relationship Management (future)

---

## Database Schema

### `aihub.knowledge_chunks`
```sql
CREATE SCHEMA IF NOT EXISTS aihub;

CREATE TABLE aihub.knowledge_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace    text NOT NULL CHECK (workspace IN ('TE','GEAR','GLOBAL')),
  source_type  text NOT NULL,      -- 'SPEC', 'DOC', 'OCR', 'SQL_VIEW_DOC', 'POLICY'
  source_table text,               -- e.g. 'spec.te-concur', 'ocr.documents'
  source_id    text,               -- path, UUID, or other identifier
  chunk_index  int NOT NULL,
  content      text NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding    vector(1536),       -- OpenAI ada-002 or equivalent
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_aihub_chunks_workspace ON aihub.knowledge_chunks(workspace);
CREATE INDEX idx_aihub_chunks_source_type ON aihub.knowledge_chunks(source_type);
CREATE INDEX idx_aihub_chunks_embedding ON aihub.knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### `aihub.sessions`
```sql
CREATE TABLE aihub.sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace  text NOT NULL CHECK (workspace IN ('TE','GEAR','GLOBAL')),
  user_id    uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title      text,
  metadata   jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_aihub_sessions_workspace ON aihub.sessions(workspace);
CREATE INDEX idx_aihub_sessions_user ON aihub.sessions(user_id);
```

### `aihub.messages`
```sql
CREATE TABLE aihub.messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES aihub.sessions(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user','assistant','system')),
  content    text NOT NULL,
  citations  jsonb DEFAULT '[]'::jsonb,
  metadata   jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_aihub_messages_session ON aihub.messages(session_id);
CREATE INDEX idx_aihub_messages_created ON aihub.messages(created_at DESC);
```

---

## Knowledge Source Types

### 1. **SPEC** - Specification Documents
- Source: Markdown files in `spec/te-concur/**`, `spec/gearroom/**`
- Chunking: 500-1000 tokens with 100-token overlap
- Metadata:
  ```json
  {
    "file_path": "spec/te-concur/prd.md",
    "section": "Analytics Dashboard",
    "page_number": 5,
    "last_updated": "2025-12-07"
  }
  ```

### 2. **DOC** - Documentation
- Source: `docs/te/**`, `docs/gear/**`, `docs/policies/**`
- Includes: User guides, policy docs, training materials
- Metadata:
  ```json
  {
    "doc_type": "policy",
    "title": "Travel Policy - 2025",
    "version": "1.2",
    "effective_date": "2025-01-01"
  }
  ```

### 3. **OCR** - Receipt/Document Extractions
- Source: `ocr.extractions` joined to `ocr.documents`
- For T&E: receipts from expense reports
- For Gearroom: maintenance docs, service invoices
- Metadata:
  ```json
  {
    "merchant": "Grab Philippines",
    "amount": 450.00,
    "date": "2025-11-15",
    "category": "Transportation",
    "expense_report_id": "uuid",
    "ocr_confidence": 0.95
  }
  ```

### 4. **SQL_VIEW_DOC** - View Documentation
- Auto-generated descriptions of analytics views
- Example for `te.v_cash_advance_overview`:
  ```markdown
  ## te.v_cash_advance_overview
  
  Cash advance overview with settlement tracking.
  
  **Columns:**
  - employee_name: Full name of requestor
  - status: Current advance status
  - outstanding_amount: Remaining unsettled balance
  - days_outstanding: Days since disbursement
  
  **Use Cases:**
  - Track outstanding cash advances by employee
  - Identify aging advances (>30, >60, >90 days)
  - Calculate settlement rates
  ```

### 5. **POLICY** - Governance & Compliance
- Expense policies, approval thresholds, per diem rates
- Travel policies, booking guidelines
- Equipment usage policies, checkout rules

---

## ETL: Building the Corpus

### Script: `tools/build_aihub_corpus.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Workspace mapping
const WORKSPACE_MAP = {
  'spec/te-concur': 'TE',
  'spec/gearroom': 'GEAR',
  'docs/te': 'TE',
  'docs/gear': 'GEAR',
  'docs/policies': 'GLOBAL',
  'docs/design-system': 'GLOBAL',
};

async function chunkMarkdown(content: string, maxTokens = 800): Promise<string[]> {
  // Simple paragraph-based chunking with overlap
  const paragraphs = content.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (estimateTokens(currentChunk + para) > maxTokens) {
      chunks.push(currentChunk);
      currentChunk = para;
    } else {
      currentChunk += '\n\n' + para;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

async function processSpecFiles() {
  for (const [dirPath, workspace] of Object.entries(WORKSPACE_MAP)) {
    const files = walkDir(dirPath, '.md');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const chunks = await chunkMarkdown(content);
      
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedText(chunks[i]);
        
        await supabase.from('aihub.knowledge_chunks').insert({
          workspace,
          source_type: dirPath.startsWith('spec/') ? 'SPEC' : 'DOC',
          source_id: file,
          chunk_index: i,
          content: chunks[i],
          embedding,
          metadata: {
            file_path: file,
            section: extractSection(chunks[i]),
          },
        });
      }
      
      console.log(`Processed: ${file} (${chunks.length} chunks)`);
    }
  }
}

async function processOCRData() {
  // Pull OCR extractions for T&E receipts
  const { data: ocrDocs } = await supabase
    .from('ocr.extractions')
    .select('*, document:ocr.documents(*)')
    .eq('document.source_type', 'te_receipt');
  
  for (const doc of ocrDocs || []) {
    const content = `
Receipt from ${doc.merchant} on ${doc.tx_date}
Amount: ${doc.total_amount} ${doc.currency}
Category: ${doc.document.metadata?.category}
Raw text: ${doc.raw_text}
    `.trim();
    
    const embedding = await embedText(content);
    
    await supabase.from('aihub.knowledge_chunks').insert({
      workspace: 'TE',
      source_type: 'OCR',
      source_table: 'ocr.extractions',
      source_id: doc.id,
      chunk_index: 0,
      content,
      embedding,
      metadata: {
        merchant: doc.merchant,
        amount: doc.total_amount,
        date: doc.tx_date,
        ocr_document_id: doc.document_id,
      },
    });
  }
}

async function generateViewDocs() {
  const views = [
    { name: 'te.v_cash_advance_overview', workspace: 'TE' },
    { name: 'te.v_expense_report_summary', workspace: 'TE' },
    { name: 'analytics.v_te_cash_flow', workspace: 'TE' },
    { name: 'analytics.v_advance_aging', workspace: 'TE' },
    { name: 'gear.v_utilization', workspace: 'GEAR' },
  ];
  
  for (const view of views) {
    // In production, auto-generate from INFORMATION_SCHEMA or manual docs
    const docContent = `
## ${view.name}

Analytics view for ${view.workspace} workspace.

**Purpose:** [Auto-generated description]
**Columns:** [List columns from view definition]
**Use Cases:** [Common queries/patterns]
    `.trim();
    
    const embedding = await embedText(docContent);
    
    await supabase.from('aihub.knowledge_chunks').insert({
      workspace: view.workspace,
      source_type: 'SQL_VIEW_DOC',
      source_id: view.name,
      chunk_index: 0,
      content: docContent,
      embedding,
      metadata: { view_name: view.name },
    });
  }
}

// Main execution
async function main() {
  console.log('Building AIHub corpus...');
  await processSpecFiles();
  await processOCRData();
  await generateViewDocs();
  console.log('Corpus build complete!');
}

main();
```

---

## RAG Query API

### Endpoint: `POST /aihub/query`

#### Request
```json
{
  "workspace": "TE",
  "session_id": "optional-uuid",
  "query": "Explain my T&E spend vs policy breaches last month.",
  "context_filters": {
    "employee_id": "uuid",
    "department_id": "uuid",
    "date_from": "2025-11-01",
    "date_to": "2025-11-30"
  },
  "mode": "assistant"  // 'assistant' | 'docs-only' | 'sql-help'
}
```

#### Response
```json
{
  "session_id": "uuid",
  "answer": "Based on your expense reports, you spent ₱12,450 last month...",
  "citations": [
    {
      "source_type": "SPEC",
      "source_id": "spec/te-concur/prd.md#analytics",
      "snippet": "Analytics dashboard shows spend by category...",
      "score": 0.87
    },
    {
      "source_type": "SQL_VIEW_DOC",
      "source_id": "te.v_cash_flow",
      "snippet": "Cash flow view calculates net reimbursable...",
      "score": 0.82
    }
  ],
  "debug_retrieval": [
    { "score": 0.87, "workspace": "TE", "source_type": "SPEC" },
    { "score": 0.82, "workspace": "TE", "source_type": "SQL_VIEW_DOC" }
  ]
}
```

### Implementation (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client
from openai import OpenAI
import numpy as np

app = FastAPI()
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

class QueryRequest(BaseModel):
    workspace: str
    session_id: str | None = None
    query: str
    context_filters: dict = {}
    mode: str = "assistant"

@app.post("/aihub/query")
async def query_assistant(req: QueryRequest):
    # 1. Embed the query
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=req.query
    ).data[0].embedding
    
    # 2. Retrieve top chunks
    response = supabase.rpc('match_knowledge_chunks', {
        'query_embedding': query_embedding,
        'workspace_filter': req.workspace,
        'match_threshold': 0.7,
        'match_count': 10
    }).execute()
    
    chunks = response.data
    
    # 3. Build LLM prompt
    context = "\n\n".join([c['content'] for c in chunks])
    
    system_prompt = f"""You are the {req.workspace} workspace assistant.
Use the following context to answer the user's question.
If you can't answer from the context, say so clearly.

Context:
{context}
"""
    
    # 4. Call LLM
    completion = openai_client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.query}
        ]
    )
    
    answer = completion.choices[0].message.content
    
    # 5. Format citations
    citations = [
        {
            "source_type": c['source_type'],
            "source_id": c['source_id'],
            "snippet": c['content'][:200] + "...",
            "score": c['similarity']
        }
        for c in chunks[:3]
    ]
    
    return {
        "session_id": req.session_id or str(uuid.uuid4()),
        "answer": answer,
        "citations": citations,
        "debug_retrieval": [
            {"score": c['similarity'], "workspace": c['workspace'], "source_type": c['source_type']}
            for c in chunks
        ]
    }
```

### Postgres Function: `match_knowledge_chunks`

```sql
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  workspace_filter text,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  workspace text,
  source_type text,
  source_id text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.workspace,
    kc.source_type,
    kc.source_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM aihub.knowledge_chunks kc
  WHERE 
    kc.workspace = workspace_filter
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## React Component: `AiAssistantPanel`

```tsx
// apps/shared/components/AiAssistantPanel.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

type Workspace = 'TE' | 'GEAR';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

interface AiAssistantPanelProps {
  workspace: Workspace;
  initialQuestion?: string;
  initialContext?: Record<string, any>;
}

export function AiAssistantPanel({ workspace, initialQuestion, initialContext }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/aihub/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace,
          query: input,
          context_filters: initialContext,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
      };

      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">
          {workspace === 'TE' ? '✈️ T&E Assistant' : '📦 Gear Assistant'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Ask anything about {workspace === 'TE' ? 'expenses' : 'equipment'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[80%] p-3 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <p className="text-sm">{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  <p>Sources:</p>
                  <ul className="list-disc pl-4">
                    {msg.citations.map((cite, i) => (
                      <li key={i}>{cite.source_type}: {cite.source_id}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        ))}
        {loading && <p className="text-sm text-muted-foreground">Thinking...</p>}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${workspace === 'TE' ? 'expenses, cash advances, policies...' : 'equipment, checkouts, utilization...'}`}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendQuery()}
            rows={2}
          />
          <Button onClick={sendQuery} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Integration in T&E App

```tsx
// TEApp.tsx
import { AiAssistantPanel } from './components/AiAssistantPanel';

export default function TEApp() {
  const [showAI, setShowAI] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      {/* Main content */}
      {/* ... */}

      {/* AI Assistant Slide-over */}
      {showAI && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50">
          <Button
            className="absolute top-4 right-4"
            variant="ghost"
            onClick={() => setShowAI(false)}
          >
            ✕
          </Button>
          <AiAssistantPanel
            workspace="TE"
            initialContext={{
              employee_id: user?.id,
              department_id: user?.department_id,
            }}
          />
        </div>
      )}

      {/* Floating AI Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
        onClick={() => setShowAI(true)}
      >
        🤖 Ask AI
      </Button>
    </div>
  );
}
```

---

## Skills & Intent Detection

### Basic Skills for TE Workspace

```python
def detect_intent(query: str) -> str:
    """Detect user intent from query"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ['summarize', 'summary', 'overview']):
        return 'summarize'
    
    if any(word in query_lower for word in ['cash advance', 'outstanding', 'settle']):
        return 'cash_advance_info'
    
    if any(word in query_lower for word in ['compare', 'vs', 'versus', 'trend']):
        return 'compare_periods'
    
    if any(word in query_lower for word in ['policy', 'allowed', 'limit', 'rule']):
        return 'policy_lookup'
    
    return 'general_qa'

def handle_skill(intent: str, query: str, context: dict, chunks: list):
    """Execute specific skill based on intent"""
    
    if intent == 'cash_advance_info':
        # Query te.v_cash_advance_overview for user's advances
        # Format as natural language response
        pass
    
    elif intent == 'compare_periods':
        # Query analytics.v_te_cash_flow for time comparisons
        pass
    
    elif intent == 'policy_lookup':
        # Prioritize POLICY source_type chunks
        pass
    
    else:
        # Standard RAG flow
        pass
```

---

## Testing

```bash
# Build corpus
npm run aihub:build-corpus

# Test query
curl -X POST http://localhost:8000/aihub/query \
  -H "Content-Type: application/json" \
  -d '{
    "workspace": "TE",
    "query": "What is the cash advance settlement policy?"
  }'
```

---

## Performance Optimization

1. **Index Strategy**
   - IVFFlat index on embeddings (lists=100 for ~10K chunks)
   - Composite index on (workspace, source_type)

2. **Caching**
   - Cache frequent queries in Redis
   - Pre-compute common analytics (monthly spend, top spenders)

3. **Chunk Size**
   - Target 500-800 tokens per chunk
   - 100-token overlap for continuity

4. **Retrieval Tuning**
   - Top-K = 10 for context
   - Similarity threshold = 0.7
   - Re-rank by recency for time-sensitive queries

---

## Future Enhancements

1. **NL-to-SQL** (Phase 2)
   - Generate SQL from natural language for analytics queries
   - Execute against views, return formatted results

2. **Proactive Suggestions**
   - "You have 3 outstanding advances over 60 days"
   - "Reminder: Submit expense report for Nov travel"

3. **Multi-turn Conversations**
   - Track session context across messages
   - "Tell me more about that policy" → knows which policy

4. **Voice Input** (Mobile)
   - Dictate expense descriptions, amounts
   - Voice-activated assistant on mobile app
