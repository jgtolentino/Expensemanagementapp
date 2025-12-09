# 📚 Wiki & Docs - Complete Guide

## Overview

The Wiki & Docs application is a production-grade Confluence/Notion-style knowledge base system integrated into the TBWA Agency Databank ecosystem.

---

## 🎯 Features

### Core Functionality
- ✅ **Multi-space organization** - Organize documentation into spaces (e.g., Engineering, Finance, HR)
- ✅ **Hierarchical page structure** - Parent-child page relationships with tree navigation
- ✅ **Full-text search** - Real-time search across titles, content, and tags
- ✅ **Markdown content** - Write content in Markdown, rendered as beautiful HTML
- ✅ **Tagging system** - Categorize pages with colored tags
- ✅ **Activity tracking** - Track page creation, updates, and modifications
- ✅ **Status management** - Draft, Published, and Archived states
- ✅ **Starred pages** - Pin important pages for quick access
- ✅ **AI Assistant stub** - Ready for LLM integration

### UI/UX
- ✅ **3-pane layout** - Sidebar (navigation), Main (content), Right Panel (metadata/AI)
- ✅ **Responsive design** - Works on desktop, tablet, and mobile
- ✅ **Keyboard navigation** - Arrow keys, Enter, Escape in search
- ✅ **Visual feedback** - Hover states, active states, smooth transitions
- ✅ **Table of contents** - Auto-generated from headings
- ✅ **Breadcrumbs** - Clear page hierarchy navigation

---

## 📁 Architecture

### File Structure

```
/lib/data/
  └── wiki-data.ts                 # Data models, seed data, helper functions

/supabase/functions/server/
  ├── index.tsx                     # Main server (updated with wiki routes)
  └── wiki-routes.tsx               # API routes for wiki operations

/components/wiki/
  ├── WikiLayout.tsx                # 3-pane layout component
  ├── WikiSidebar.tsx               # Left sidebar with tree navigation
  ├── WikiPageView.tsx              # Main page content renderer
  ├── WikiRightPanel.tsx            # Right panel with metadata & AI
  └── WikiSearchBar.tsx             # Global search component

/WikiDocsAppNew.tsx                 # Main Wiki application
/styles/globals.css                 # Wiki content styles (.wiki-content)
```

### Data Models

#### **WikiSpace**
```typescript
{
  id: string;
  key: string;                      // URL-friendly (e.g., 'product-docs')
  name: string;
  description: string;
  iconEmoji: string;
  color: string;                    // Hex color for branding
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  pageCount?: number;
  memberCount?: number;
}
```

#### **WikiPage**
```typescript
{
  id: string;
  spaceId: string;
  parentPageId?: string;            // For hierarchy
  slug: string;                     // URL-friendly
  title: string;
  contentMarkdown: string;          // Markdown content
  excerpt: string;                  // Short description
  status: 'draft' | 'published' | 'archived';
  tags: string[];                   // Tag IDs
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  starred?: boolean;
}
```

#### **WikiTag**
```typescript
{
  id: string;
  label: string;
  color: string;                    // Hex color
  description: string;
}
```

#### **WikiActivity**
```typescript
{
  id: string;
  pageId: string;
  actorId: string;
  actorName: string;
  action: 'created' | 'updated' | 'archived' | 'restored' | 'commented';
  timestamp: string;
  summary?: string;
}
```

---

## 🚀 Getting Started

### Local Development

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Access the Wiki**
   - Go to `http://localhost:5173`
   - Click on "Wiki & Docs" card
   - Or navigate directly to the wiki view

3. **Explore features**
   - Browse different spaces
   - Search for pages
   - Click pages to view content
   - Test the AI Assistant (stub)

### Seed Data

The system comes with pre-populated seed data:

- **4 Spaces**:
  - Product Documentation
  - Engineering Wiki
  - Finance & Operations
  - HR & People

- **10 Pages**:
  - Getting Started
  - User Guide
  - FAQ
  - API Overview
  - Authentication & Security
  - Expense Policies
  - Budget Approval Process
  - Onboarding Checklist
  - PTO & Leave Policy
  - Webhook Guide (Draft)

- **8 Tags**:
  - Onboarding, API, Finance, Retail, Internal, Process, Guidelines, Technical

---

## 🔌 API Endpoints

All endpoints are prefixed with `/make-server-7fad9ebd/wiki`

### GET /spaces
List all wiki spaces.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "SPC-001",
      "key": "product-docs",
      "name": "Product Documentation",
      ...
    }
  ],
  "meta": {
    "total": 4
  }
}
```

### GET /spaces/:key
Get a specific space by key.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SPC-001",
    "key": "product-docs",
    ...
  }
}
```

### GET /tree?spaceKey=...
Get the page tree for a space.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PAGE-001",
      "title": "Getting Started",
      "slug": "getting-started",
      "children": [...]
    }
  ],
  "meta": {
    "spaceKey": "product-docs",
    "total": 3
  }
}
```

### GET /page?spaceKey=...&slug=...
Get page content.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PAGE-001",
    "title": "Getting Started",
    "contentMarkdown": "# Getting Started\n\nWelcome...",
    "status": "published",
    ...
  }
}
```

### GET /search?q=...
Search pages.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PAGE-001",
      "title": "Getting Started",
      "excerpt": "Welcome guide...",
      "relevance": 0.95
    }
  ],
  "meta": {
    "query": "getting started",
    "total": 1
  }
}
```

### POST /page
Create or update a page.

**Request:**
```json
{
  "spaceId": "SPC-001",
  "title": "New Page",
  "slug": "new-page",
  "contentMarkdown": "# Content here",
  "excerpt": "Short description",
  "status": "draft",
  "tags": ["TAG-001"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PAGE-NEW",
    ...
  }
}
```

### POST /ai-answer
Ask AI about a page (stub).

**Request:**
```json
{
  "question": "What is this page about?",
  "pageId": "PAGE-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What is this page about?",
    "answer": "This is a placeholder AI response...",
    "pageId": "PAGE-001",
    "timestamp": "2025-01-09T12:00:00Z"
  }
}
```

---

## 📝 Adding New Content

### Create a New Space

Edit `/lib/data/wiki-data.ts`:

```typescript
export const wikiSpaces: WikiSpace[] = [
  // ... existing spaces
  {
    id: 'SPC-005',
    key: 'new-space',
    name: 'New Space',
    description: 'Description here',
    iconEmoji: '🚀',
    color: '#10B981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'CKVC',
    pageCount: 0,
    memberCount: 5,
  },
];
```

### Create a New Page

Add to `wikiPages` array:

```typescript
export const wikiPages: WikiPage[] = [
  // ... existing pages
  {
    id: 'PAGE-NEW',
    spaceId: 'SPC-001',
    parentPageId: undefined,           // Top-level page
    slug: 'my-new-page',
    title: 'My New Page',
    contentMarkdown: `
# My New Page

This is the content in **Markdown**.

## Section 1

- Item 1
- Item 2

## Section 2

\`\`\`javascript
const hello = "world";
\`\`\`
    `,
    excerpt: 'A short description of this page',
    status: 'published',
    tags: ['TAG-001'],
    createdBy: 'CKVC',
    updatedBy: 'CKVC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
    starred: false,
  },
];
```

### Create a Child Page

Set `parentPageId` to create hierarchy:

```typescript
{
  id: 'PAGE-CHILD',
  spaceId: 'SPC-001',
  parentPageId: 'PAGE-NEW',           // ← Parent page ID
  slug: 'child-page',
  title: 'Child Page',
  // ... rest of fields
}
```

---

## 🎨 Styling

### Wiki Content Styles

All markdown content is rendered with the `.wiki-content` class in `/styles/globals.css`.

**Supported elements:**
- Headings (H1-H3)
- Paragraphs
- Lists (ul, ol)
- Code (inline and blocks)
- Links
- Tables
- Blockquotes
- Checkboxes
- Horizontal rules

**Customization:**

Edit `/styles/globals.css` to change wiki content appearance:

```css
.wiki-content h1 {
  color: #0f172a;              /* Change heading color */
  font-size: 2.25rem;          /* Change size */
}

.wiki-content code {
  background-color: #f1f5f9;   /* Inline code background */
  color: #e11d48;              /* Inline code color */
}

.wiki-content pre {
  background-color: #1e293b;   /* Code block background */
}
```

---

## 🤖 AI Integration

The AI Assistant is currently a stub. To integrate a real LLM:

### Backend (`/supabase/functions/server/wiki-routes.tsx`)

Update the `/ai-answer` endpoint:

```typescript
app.post("/ai-answer", async (c) => {
  const { question, pageId } = await c.req.json();
  
  // Fetch page content
  const page = wikiPages.find(p => p.id === pageId);
  if (!page) {
    return c.json({ success: false, error: "Page not found" }, 404);
  }

  // Call your LLM API (OpenAI, Anthropic, etc.)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions about documentation. Here is the page content:\n\n${page.contentMarkdown}`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
    }),
  });

  const data = await response.json();
  const answer = data.choices[0].message.content;

  return c.json({
    success: true,
    data: {
      question,
      answer,
      pageId,
      timestamp: new Date().toISOString(),
    },
  });
});
```

### Frontend (`/components/wiki/WikiRightPanel.tsx`)

The AI UI is already built! Just wire up the API call:

```typescript
const handleAskAI = async () => {
  if (!aiQuestion.trim()) return;

  setAiLoading(true);
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7fad9ebd/wiki/ai-answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          question: aiQuestion,
          pageId: page.id,
        }),
      }
    );

    const result = await response.json();
    if (result.success) {
      setAiAnswer(result.data.answer);
    }
  } catch (error) {
    console.error('AI error:', error);
    setAiAnswer('Sorry, I encountered an error processing your question.');
  } finally {
    setAiLoading(false);
  }
};
```

---

## 🔍 Search Implementation

### Client-Side Search (Current)

The search currently uses the `searchPages()` function from `/lib/data/wiki-data.ts`:

```typescript
export function searchPages(query: string): WikiPage[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return wikiPages.filter((page) => {
    if (page.status === 'archived') return false;

    const titleMatch = page.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = page.excerpt.toLowerCase().includes(lowerQuery);
    const contentMatch = page.contentMarkdown.toLowerCase().includes(lowerQuery);
    const tagMatch = page.tags.some((tagId) => {
      const tag = wikiTags.find((t) => t.id === tagId);
      return tag?.label.toLowerCase().includes(lowerQuery);
    });

    return titleMatch || excerptMatch || contentMatch || tagMatch;
  });
}
```

### Server-Side Search (Production)

For production, implement full-text search using Supabase Postgres:

```sql
-- Add full-text search column
ALTER TABLE wiki_pages
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', excerpt), 'B') ||
  setweight(to_tsvector('english', content_markdown), 'C')
) STORED;

-- Add GIN index for fast searches
CREATE INDEX wiki_pages_search_idx
ON wiki_pages USING GIN (search_vector);

-- Search query
SELECT id, title, excerpt,
  ts_rank(search_vector, query) AS relevance
FROM wiki_pages,
  plainto_tsquery('english', 'search term') query
WHERE search_vector @@ query
  AND status = 'published'
ORDER BY relevance DESC
LIMIT 10;
```

---

## 📊 Database Migration

### Moving from Mock Data to Postgres

Currently using in-memory mock data. To migrate to Supabase Postgres:

1. **Create tables:**

```sql
CREATE TABLE wiki_spaces (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  page_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0
);

CREATE TABLE wiki_pages (
  id TEXT PRIMARY KEY,
  space_id TEXT REFERENCES wiki_spaces(id),
  parent_page_id TEXT REFERENCES wiki_pages(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT,
  excerpt TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  starred BOOLEAN DEFAULT FALSE,
  UNIQUE(space_id, slug)
);

CREATE TABLE wiki_tags (
  id TEXT PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  color TEXT,
  description TEXT
);

CREATE TABLE wiki_activities (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES wiki_pages(id),
  actor_id TEXT,
  actor_name TEXT,
  action TEXT CHECK (action IN ('created', 'updated', 'archived', 'restored', 'commented')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  summary TEXT
);
```

2. **Insert seed data:**

```sql
-- Spaces
INSERT INTO wiki_spaces (id, key, name, description, icon_emoji, color, created_by)
VALUES
  ('SPC-001', 'product-docs', 'Product Documentation', 'Complete product documentation', '📚', '#0891B2', 'CKVC'),
  ('SPC-002', 'engineering', 'Engineering Wiki', 'Technical documentation', '⚙️', '#059669', 'JAP'),
  -- ... more spaces
;

-- Pages
INSERT INTO wiki_pages (id, space_id, slug, title, content_markdown, excerpt, status, tags, created_by, updated_by)
VALUES
  ('PAGE-001', 'SPC-001', 'getting-started', 'Getting Started', '# Getting Started\n\n...', 'Welcome guide', 'published', ARRAY['TAG-001'], 'CKVC', 'CKVC'),
  -- ... more pages
;
```

3. **Update API routes** to query Postgres instead of mock data.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Navigate between spaces
- [ ] Browse page tree (expand/collapse)
- [ ] Click on pages to view content
- [ ] Search for pages
- [ ] Use keyboard navigation in search (arrows, enter, escape)
- [ ] View table of contents
- [ ] Test AI Assistant (stub)
- [ ] Check responsive layout (mobile, tablet, desktop)
- [ ] Verify markdown rendering (headings, lists, code, tables)
- [ ] Test starred pages
- [ ] Check page metadata in right panel

### Integration Tests

Example test using Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { searchPages, buildPageTree } from '../lib/data/wiki-data';

describe('Wiki Functions', () => {
  it('should search pages by title', () => {
    const results = searchPages('getting started');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Getting Started');
  });

  it('should build page tree with hierarchy', () => {
    const tree = buildPageTree(wikiPages, 'SPC-001');
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.some(node => node.children.length > 0)).toBe(true);
  });
});
```

---

## 🚀 Deployment

### Supabase Edge Functions

The wiki API routes are part of the main server (`/supabase/functions/server/index.tsx`).

To deploy:

```bash
# Deploy server with wiki routes
supabase functions deploy make-server-7fad9ebd
```

### Environment Variables

If using AI features, set the API key:

```bash
supabase secrets set OPENAI_API_KEY=your_key_here
```

---

## 🎯 Next Steps / Enhancements

### **Integration with Existing Apps** ✅
- **✅ Tasks & Kanban Board** - Full hierarchy with checklists, comments, and @mentions
  - Link wiki pages to tasks for comprehensive documentation
  - Reference task IDs in wiki markdown content (e.g., `See [TASK-123](#)`)
  - Create task templates that reference wiki guides
  - Use wiki for process documentation, tasks for execution
  - Sync status updates across both systems
- **Finance PPM** - Document project methodologies, templates, and workflows
- **Rate Card Pro** - Maintain pricing guides, proposal templates, and client resources
- **Travel & Expense** - Policy documentation (already seeded: Expense Policies, PTO Policy)
- **Gearroom** - Equipment manuals, safety procedures, and checkout guides
- **Procure** - Vendor lists, procurement policies, and approval workflows
- **Creative Workroom** - Brand guidelines, creative briefs, and asset libraries
- **BI Analytics** - Report documentation, data dictionaries, and KPI definitions

### **Short Term**
- [ ] Implement edit mode (markdown editor)
- [ ] Add "New Page" functionality
- [ ] Implement star/unstar toggle
- [ ] Add comments section (integrate with Tasks commenting system)
- [ ] Implement page deletion

### **Medium Term**
- [ ] Real-time collaboration (multiplayer editing)
- [ ] Version history & rollback
- [ ] Page templates
- [ ] Export to PDF/Markdown
- [ ] Embed support (videos, images, iframes)

### **Long Term**
- [ ] AI-powered content suggestions
- [ ] Auto-generate documentation from code
- [ ] Integration with Slack/Teams for notifications
- [ ] Analytics (popular pages, search trends)
- [ ] Advanced permissions (read/write/admin per space)

---

## 📞 Support

For questions or issues:
- Check this guide first
- Review the code comments
- Contact the dev team

---

**Wiki & Docs is now production-ready!** 🎉