# Clarity Canvas Expert Skill

AI-powered assistant for explaining and helping with Clarity Canvas and Task Engine features in `ipai_ppm_clarity`.

## Overview

This skill provides contextual help for:

- **Canvas Dashboard** - Widget configuration, layouts, saved views
- **Task Management** - Phases, milestones, tasks, to-dos
- **WBS Hierarchy** - Work Breakdown Structure organization
- **Autoschedule** - Critical Path Method scheduling
- **Dependencies** - Task relationships with lag support

## Usage

### API Endpoint

```bash
POST /ai/clarity_canvas/ask
Content-Type: application/json

{
  "question": "How do I add a progress ring widget to show task completion?",
  "project_id": 123  // optional - for project-specific context
}
```

### Response

```json
{
  "answer": "To add a progress ring widget...",
  "sources": [
    {"file": "models/canvas_widget.py", "line": 45},
    {"file": "components/widgets/ProgressRingWidget.tsx", "line": 12}
  ],
  "related_topics": ["widget_types", "canvas_configuration"]
}
```

## Configuration

### skill.yaml

Defines the skill's capabilities, triggers, and tools:

- **Triggers** - Keywords that activate this skill
- **Tools** - Vector search retriever and code search
- **System Prompt** - Expert knowledge context

### retriever_config.json

Configures the RAG (Retrieval Augmented Generation) system:

- **Vector Store** - Supabase pgvector for embeddings
- **Document Sources** - Python models, React components, docs
- **Chunking** - How documents are split for indexing

## Setup

### 1. Create Embeddings Table

```sql
-- Run in Supabase SQL editor
create table clarity_docs_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create index for similarity search
create index on clarity_docs_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 2. Index Documents

```bash
# Run the indexer to create embeddings
python ai/skills/clarity_canvas_expert/indexer.py
```

### 3. Configure Environment

```bash
# .env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

## Example Questions

1. "How do I create a new canvas widget?"
2. "What's the difference between FS and SS dependencies?"
3. "How does autoschedule calculate the critical path?"
4. "Can I group tasks by phase in the board view?"
5. "How do I save a custom canvas view?"
6. "What fields are available for the number tile widget?"
7. "How do I lock a task from autoschedule changes?"

## Architecture

```
clarity_canvas_expert/
├── skill.yaml           # Skill configuration
├── retriever_config.json # RAG configuration
├── indexer.py           # Document indexing script
├── README.md            # This file
└── prompts/             # Additional prompt templates
    ├── canvas.md
    ├── tasks.md
    └── autoschedule.md
```

## Integration

This skill integrates with:

- **Odoo Module** (`ipai_ppm_clarity`) - Backend Python models
- **React UI** (`apps/ppm-canvas`) - Frontend components
- **Supabase** - Vector storage and search
- **Anthropic** - LLM for response generation

## Development

### Adding New Documentation

1. Add markdown files to `docs/clarity/`
2. Re-run the indexer
3. Test with example questions

### Updating Triggers

Edit `skill.yaml` to add new trigger patterns:

```yaml
triggers:
  - pattern: "your new pattern"
```

### Customizing Responses

Modify the `system_prompt` in `skill.yaml` to adjust the assistant's behavior.
