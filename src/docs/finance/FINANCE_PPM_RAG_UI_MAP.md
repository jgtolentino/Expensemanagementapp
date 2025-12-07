# Finance PPM RAG Assistant - UI/UX Map

**Phase:** 1 - UI, Routes & User Journeys  
**Date:** 2025-12-07

---

## Overview

This document defines the complete UI/UX structure for the Finance PPM AI RAG Assistant, modeled after Notion's AI but optimized for advertising agency finance, project management, and leadership needs.

---

## Route Structure

### Primary Routes

| Route | Purpose | Primary Users | Key Features |
|-------|---------|---------------|--------------|
| `/finance-ppm` | Home Dashboard | All | KPI tiles, alerts, recent AI queries |
| `/finance-ppm/assistant` | AI Console | All | Chat interface with RAG + tools |
| `/finance-ppm/knowledge` | Knowledge Browser | Finance, PM | Document explorer with search |
| `/finance-ppm/projects` | Projects & Portfolio | Finance, PM, Leadership | Project list, financials, AI panel |
| `/finance-ppm/analytics` | Finance Insights | Finance, Leadership | Charts, margins, WIP, AR/AP |
| `/finance-ppm/admin` | Configuration | Finance (Admin) | Data sources, RAG config, sync jobs |

---

## Route 1: Home Dashboard

### URL
`/finance-ppm`

### Purpose
Landing page showing system health, key alerts, and quick actions

### Components

#### 1. KPI Tiles (Top Row)
```tsx
<KPITile
  title="Projects at Risk"
  value={12}
  change="+3 vs last month"
  trend="up"
  severity="warning"
  icon={<AlertTriangle />}
  onClick={() => navigate('/finance-ppm/projects?filter=at-risk')}
/>
```

**KPI Tiles:**
- **Projects at Risk** (margin <15%, over budget, or overdue)
- **Month-End Readiness** (% complete of month-end tasks)
- **Portfolio Margin** (avg margin across active projects)
- **Unbilled Scope** (delivered but not invoiced)
- **Over-Budget Projects** (actual > budget)
- **WIP Balance** (work in progress amount)

#### 2. AI Recent Queries Panel
```tsx
<Card title="Recent AI Answers">
  <QueryHistoryList
    queries={[
      {
        question: "What is the profitability of Project Acme?",
        timestamp: "2 hours ago",
        answeredBy: "Finance PPM AI",
        pinned: true
      }
    ]}
    onRevisit={(query) => navigate('/finance-ppm/assistant', { state: { query } })}
  />
</Card>
```

#### 3. Quick Actions
```tsx
<Card title="Quick Actions">
  <Button onClick={() => navigate('/finance-ppm/assistant')}>
    Ask AI Assistant
  </Button>
  <Button variant="outline" onClick={() => navigate('/finance-ppm/projects')}>
    View All Projects
  </Button>
  <Button variant="outline" onClick={() => navigate('/finance-ppm/analytics')}>
    Financial Insights
  </Button>
</Card>
```

#### 4. Alerts & Notifications
```tsx
<AlertsBanner>
  <Alert severity="high">
    3 projects need month-end review before close (2 days remaining)
  </Alert>
  <Alert severity="medium">
    5 rate cards expire this month - review needed
  </Alert>
</AlertsBanner>
```

### Data Requirements

**APIs:**
```typescript
GET /api/finance-ppm/home/kpis
  → { projectsAtRisk, monthEndReadiness, portfolioMargin, ... }

GET /api/finance-ppm/home/recent-queries?user_id=...
  → [ { question, answer_summary, timestamp, sources } ]

GET /api/finance-ppm/home/alerts
  → [ { type, severity, message, action_url } ]
```

**Database Views:**
- `finance_ppm.v_home_dashboard_kpis`
- `aihub.sessions` (recent queries)
- `finance_ppm.v_alerts` (computed alerts)

---

## Route 2: AI Assistant Console

### URL
`/finance-ppm/assistant`

### Purpose
Main AI interaction interface with RAG + live tools

### Components

#### 1. Chat Interface (Main Panel)
```tsx
<AIConsole>
  <MessageList messages={messages} />
  <PromptInput
    placeholder="Ask about projects, budgets, month-end tasks..."
    onSubmit={handleQuery}
    multiline={true}
  />
</AIConsole>
```

**Message Types:**
- User question
- AI answer (with tables, charts embedded)
- System message (e.g., "Searching knowledge base...")
- Error message

**Answer Format:**
```tsx
<AIAnswer>
  <AnswerText>{answer}</AnswerText>
  
  {tables.length > 0 && (
    <DataTables tables={tables} />
  )}
  
  <SourcesCited>
    <DocsUsed docs={sources.documents} />
    <MetricsUsed tools={sources.tools} />
  </SourcesCited>
  
  <SuggestedFollowUps questions={suggestedQuestions} />
</AIAnswer>
```

#### 2. Context Selector (Top Bar)
```tsx
<ContextSelector>
  <ScopeDropdown
    value={scope}
    options={['Project', 'Portfolio', 'Client', 'Month-End', 'Rate Governance']}
    onChange={setScope}
  />
  
  <RoleDropdown
    value={role}
    options={['Finance', 'PM', 'Account Mgmt', 'Leadership']}
    onChange={setRole}
  />
  
  {scope === 'Project' && (
    <ProjectSearch onSelect={setSelectedProject} />
  )}
</ContextSelector>
```

**Scope Behaviours:**
- **Project**: AI answers scoped to single project financials
- **Portfolio**: AI answers about client/brand/service line rollups
- **Client**: AI answers about specific client relationship
- **Month-End**: AI answers about close process, tasks, readiness
- **Rate Governance**: AI answers about rate cards, margins, vendor performance

**Role Behaviours:**
- **Finance**: Full financial visibility (costs, margins, WIP, AR/AP)
- **PM**: Project-focused (scope, deadlines, resources, risk)
- **Account Mgmt**: Client-focused (deliverables, satisfaction, growth)
- **Leadership**: Strategic (portfolio health, profitability, capacity)

#### 3. Sources Panel (Right Sidebar)
```tsx
<SourcesPanel>
  <Tab value="documents">
    <DocumentsList
      docs={retrievedDocs}
      onOpen={(doc) => navigate('/finance-ppm/knowledge', { state: { doc } })}
    />
  </Tab>
  
  <Tab value="metrics">
    <MetricsList
      tools={toolsUsed}
      data={toolResults}
    />
  </Tab>
  
  <Tab value="history">
    <QueryHistory sessions={recentSessions} />
  </Tab>
</SourcesPanel>
```

### Example Queries & Expected Behaviour

#### Query 1: Generic Knowledge
**Input:**
```
"What is the month-end close process for advertising clients?"
```

**AI Behaviour:**
1. Classify intent: `knowledge_lookup`
2. RAG search: `doc_type=['SOP','Checklist']` + `tags=['month-end']`
3. Return: Summarize 3-5 relevant docs
4. Sources: Show doc titles + links

**Output:**
```
The month-end close process for advertising clients involves:
1. **WIP Review** - Validate work-in-progress balances...
2. **AR Reconciliation** - Match invoices to payments...
3. **Accruals** - Estimate unbilled scope...

📄 Sources:
- Month-End Close SOP (Finance PPM Playbook)
- WIP Calculation Guide
- AR Management Best Practices
```

#### Query 2: Project-Specific Financial
**Input:**
```
"Show me the financial health of Project Acme Brand X"
```

**Context:**
- Scope: Project
- Selected Project: "PRJ-ACME-001"

**AI Behaviour:**
1. Classify intent: `project_health`
2. Call tool: `project_snapshot(project_code="PRJ-ACME-001")`
3. RAG search: Project-specific docs (optional)
4. Return: Metrics table + narrative

**Output:**
```
Project Acme Brand X is currently **22% under budget** with healthy margins.

| Metric | Value | Status |
|--------|-------|--------|
| Budget | PHP 5,000,000 | ✅ |
| Actual Cost | PHP 3,900,000 | ✅ |
| Revenue | PHP 4,800,000 | ✅ |
| Margin % | 18.8% | ⚠️ Below target (20%) |
| WIP | PHP 200,000 | ✅ |
| AR | PHP 350,000 | ⚠️ 45 days overdue |

**Key Insights:**
- Project is on track financially but margin is slightly below target
- AR aging needs attention - follow up with client on invoice #INV-2024-089

🔧 Data from: Project Snapshot Tool (live DB)
📄 Related docs: Project Acme Finance Playbook
```

#### Query 3: Leadership Strategic
**Input:**
```
"Which portfolios are underperforming and need intervention?"
```

**Context:**
- Role: Leadership

**AI Behaviour:**
1. Classify intent: `portfolio_risk_assessment`
2. Call tool: `portfolio_snapshot(filter="at_risk")`
3. Return: Portfolio comparison table + recommendations

**Output:**
```
2 portfolios require immediate attention:

| Portfolio | Avg Margin | Projects At Risk | Total Value | Risk Level |
|-----------|------------|------------------|-------------|------------|
| Consumer Tech | 12.3% | 4/8 | PHP 15M | 🔴 High |
| Healthcare | 16.7% | 2/6 | PHP 8M | 🟡 Medium |

**Consumer Tech Issues:**
- 50% of projects below 15% margin threshold
- 2 projects significantly over budget
- Resource allocation inefficiency detected

**Recommended Actions:**
1. Review rate cards for Consumer Tech vertical
2. Audit scope creep on high-risk projects
3. Consider portfolio rebalancing

🔧 Data from: Portfolio Snapshot Tool
📊 View full analytics: [Finance PPM Analytics]
```

### Data Requirements

**APIs:**
```typescript
POST /api/finance-ppm/assistant/query
Request:
{
  message: string,
  role: 'Finance' | 'PM' | 'Account' | 'Leadership',
  context: {
    scope: 'Project' | 'Portfolio' | 'Client' | 'Month-End' | 'Rate Governance',
    project_code?: string,
    client_name?: string,
    period?: string
  }
}

Response:
{
  answer: string,
  sources: {
    documents: Array<{
      document_id: string,
      title: string,
      score: number,
      snippet: string
    }>,
    tools: Record<string, any>
  },
  tables?: Array<Table>,
  charts?: Array<Chart>,
  suggested_followups: string[]
}
```

**Tools:**
```typescript
POST /api/finance-ppm/tools/project_snapshot
POST /api/finance-ppm/tools/portfolio_snapshot
POST /api/finance-ppm/tools/month_end_status
POST /api/finance-ppm/tools/rate_card_analysis
```

---

## Route 3: Knowledge Browser

### URL
`/finance-ppm/knowledge`

### Purpose
Explore Finance PPM knowledge base (docs, SOPs, policies)

### Components

#### 1. Document Tree/List
```tsx
<KnowledgeBrowser>
  <Sidebar>
    <TreeView
      items={documentTree}
      onSelect={setSelectedDoc}
    />
    
    <FilterPanel>
      <DocTypeFilter options={['SOP', 'Policy', 'Checklist', 'Playbook']} />
      <TagFilter tags={knownTags} />
      <DateFilter />
    </FilterPanel>
  </Sidebar>
  
  <MainPanel>
    <DocumentViewer doc={selectedDoc} />
  </MainPanel>
</KnowledgeBrowser>
```

#### 2. Document Viewer
```tsx
<DocumentViewer>
  <DocumentHeader>
    <Title>{doc.title}</Title>
    <Metadata>
      <Badge>{doc.doc_type}</Badge>
      <Tags tags={doc.tags} />
      <LastSynced>Synced {formatDate(doc.last_synced_at)}</LastSynced>
    </Metadata>
  </DocumentHeader>
  
  <DocumentContent>
    <MarkdownRenderer content={doc.content} />
  </DocumentContent>
  
  <DocumentActions>
    <Button onClick={() => openInNotion(doc.source_id)}>
      Open in Notion
    </Button>
    <Button variant="outline" onClick={() => askAIAboutDoc(doc)}>
      Ask AI About This Doc
    </Button>
  </DocumentActions>
</DocumentViewer>
```

#### 3. Search Bar
```tsx
<SearchBar
  placeholder="Search knowledge base..."
  onSearch={handleSearch}
  filters={['doc_type', 'tags', 'date_range']}
/>
```

### Data Requirements

**APIs:**
```typescript
GET /api/finance-ppm/knowledge/documents
  ?doc_type=SOP
  &tags=month-end,wip
  &search=revenue+recognition

Response:
{
  documents: Array<{
    id: string,
    title: string,
    doc_type: string,
    tags: string[],
    source: 'notion' | 'local',
    source_id: string,
    last_synced_at: string,
    preview: string
  }>
}

GET /api/finance-ppm/knowledge/documents/:id

Response:
{
  id: string,
  title: string,
  content: string,
  metadata: object,
  chunks: Array<{ chunk_index, content, embedding_status }>
}
```

**Database:**
- `finance_ppm.knowledge_documents`
- `finance_ppm.knowledge_chunks` (via join)

---

## Route 4: Projects & Portfolios

### URL
`/finance-ppm/projects`

### Purpose
View and analyze projects with financial KPIs

### Components

#### 1. Projects List (Table)
```tsx
<ProjectsTable
  columns={[
    'Project Code',
    'Client',
    'Brand',
    'Status',
    'Budget',
    'Actual Cost',
    'Margin %',
    'Risk Level',
    'Actions'
  ]}
  data={projects}
  filters={{
    status: ['Active', 'On Hold', 'Closed'],
    client: clientList,
    risk_level: ['High', 'Medium', 'Low']
  }}
  onRowClick={(project) => setSelectedProject(project)}
/>
```

#### 2. Project Detail Panel (Right)
```tsx
<ProjectDetailPanel project={selectedProject}>
  <FinancialSnapshot>
    <MetricCard label="Budget" value={formatCurrency(project.budget)} />
    <MetricCard label="Actual Cost" value={formatCurrency(project.actual_cost)} />
    <MetricCard label="Revenue" value={formatCurrency(project.revenue)} />
    <MetricCard label="Margin %" value={`${project.margin_pct}%`} severity={getMarginSeverity(project.margin_pct)} />
  </FinancialSnapshot>
  
  <AIProjectPanel>
    <Button onClick={() => askAIAboutProject(project)}>
      Ask AI About This Project
    </Button>
    <RecentAIAnswers projectId={project.id} />
  </AIProjectPanel>
  
  <Tabs>
    <Tab label="Financials">
      <FinancialTimeline data={project.financials_by_month} />
    </Tab>
    <Tab label="Resources">
      <ResourceAllocation data={project.resources} />
    </Tab>
    <Tab label="Documents">
      <LinkedDocuments projectId={project.id} />
    </Tab>
  </Tabs>
</ProjectDetailPanel>
```

#### 3. Portfolio View Toggle
```tsx
<ViewToggle
  options={['Projects', 'Portfolios', 'Clients']}
  value={view}
  onChange={setView}
/>

{view === 'Portfolios' && (
  <PortfolioRollup
    groupBy="client"
    showMetrics={['total_value', 'avg_margin', 'projects_at_risk']}
  />
)}
```

### Data Requirements

**APIs:**
```typescript
GET /api/finance-ppm/projects
  ?status=active
  &client=Acme
  &risk_level=high
  
Response:
{
  projects: Array<{
    id, project_code, project_name, client_name, brand_name,
    status, budget, actual_cost, revenue, margin_pct, risk_level
  }>
}

GET /api/finance-ppm/projects/:id/details

Response:
{
  project: {...},
  financials_by_month: Array<{ month, budget, actual, variance }>,
  resources: Array<{ role, name, allocation_pct, rate }>,
  linked_documents: Array<{ doc_id, title }>
}
```

**Database Views:**
- `finance_ppm.v_project_overview`
- `finance_ppm.v_project_financials_timeline`
- `finance_ppm.v_project_resources`

---

## Route 5: Analytics (Finance Insights)

### URL
`/finance-ppm/analytics`

### Purpose
Visual dashboards for Finance and Leadership

### Components

#### 1. KPI Tiles (Top)
```tsx
<KPITilesRow>
  <KPITile title="Total Portfolio Value" value="PHP 85M" />
  <KPITile title="Avg Margin" value="19.3%" trend="up" />
  <KPITile title="WIP Balance" value="PHP 12M" />
  <KPITile title="AR Outstanding" value="PHP 8.5M" severity="warning" />
</KPITilesRow>
```

#### 2. Charts Grid
```tsx
<ChartsGrid>
  <Chart title="Margin by Client" type="bar" data={marginByClient} />
  <Chart title="Spend vs Budget Trend" type="line" data={spendTrend} />
  <Chart title="Portfolio Distribution" type="pie" data={portfolioMix} />
  <Chart title="WIP Aging" type="stacked-bar" data={wipAging} />
</ChartsGrid>
```

#### 3. AI Annotations
```tsx
<AIInsightsBanner>
  <Insight severity="info">
    "Consumer Tech portfolio margin declined 3.2% this quarter - likely due to scope creep on Project X and Y."
    <Button size="sm" onClick={() => askAI("Why did Consumer Tech margin decline?")}>
      Ask AI for details
    </Button>
  </Insight>
</AIInsightsBanner>
```

### Data Requirements

**APIs:**
```typescript
GET /api/finance-ppm/analytics/kpis
GET /api/finance-ppm/analytics/charts/:chart_name
  ?period=last_12_months
  &group_by=client
```

**Database Views:**
- `analytics.v_portfolio_kpis`
- `analytics.v_margin_by_client`
- `analytics.v_spend_budget_trend`
- `analytics.v_wip_aging`
- `analytics.v_ar_aging`

---

## Route 6: Admin / Configuration

### URL
`/finance-ppm/admin`

### Purpose
Configure data sources, RAG settings, sync jobs

### Components

#### 1. Data Sources
```tsx
<DataSourcesPanel>
  <NotionWorkspaceConfig
    workspaceId={config.notion_workspace_id}
    apiToken={config.notion_api_token}
    lastSync={config.last_notion_sync}
    onSync={() => triggerNotionSync()}
  />
  
  <OdooIntegrationConfig
    enabled={config.odoo_enabled}
    endpoint={config.odoo_endpoint}
  />
  
  <SupabaseSchemaMapping
    schemas={['procure', 'te', 'gear', 'finance_ppm']}
    enabled={config.enabled_schemas}
  />
</DataSourcesPanel>
```

#### 2. RAG Configuration
```tsx
<RAGConfigPanel>
  <EmbeddingModelSelector
    model={config.embedding_model}
    options={['text-embedding-ada-002', 'text-embedding-3-small']}
  />
  
  <ChunkingSettings
    chunkSize={config.chunk_size}
    overlap={config.overlap}
  />
  
  <RecencyPreference
    weight={config.recency_weight}
    description="Boost recent documents in search results"
  />
</RAGConfigPanel>
```

#### 3. Role-Based Access
```tsx
<RBACPanel>
  <RoleDefinitions
    roles={['Finance', 'PM', 'Account', 'Leadership']}
    permissions={permissionsMatrix}
  />
  
  <FieldVisibilityRules
    tables={['projects', 'financials', 'rate_cards']}
    rules={fieldRules}
  />
</RBACPanel>
```

### Data Requirements

**APIs:**
```typescript
GET /api/finance-ppm/admin/config
PUT /api/finance-ppm/admin/config

POST /api/finance-ppm/admin/sync/notion
POST /api/finance-ppm/admin/sync/embeddings
```

---

## User Journeys

### Journey 1: Finance Director - Month-End Close

**Persona:** Sarah, Finance Director  
**Goal:** Verify month-end readiness for Acme client

**Steps:**
1. Login → Navigate to `/finance-ppm`
2. See alert: "Acme month-end: 3 tasks pending"
3. Click → Navigate to `/finance-ppm/assistant`
4. Set context: Scope=Month-End, Client=Acme
5. Ask: "What's the status of month-end close for Acme?"
6. AI returns:
   - Task completion: 12/15 done
   - Outstanding: WIP review, AR reconciliation, accruals
   - Links to relevant checklists from Notion
7. Sarah clicks checklist link → Knowledge Browser
8. Reviews checklist, marks tasks complete
9. Returns to dashboard, sees readiness updated to 100%

**Key Interactions:**
- Alert → AI Console (context-aware)
- AI answer → Knowledge Browser (seamless navigation)
- Real-time task status updates

---

### Journey 2: Project Manager - Project Health Check

**Persona:** Miguel, Project Manager  
**Goal:** Understand if Project X is on track

**Steps:**
1. Navigate to `/finance-ppm/projects`
2. Filter by "My Projects"
3. Select Project X (sees yellow risk indicator)
4. Click "Ask AI About This Project"
5. AI Console opens with pre-filled context
6. AI answers:
   - Project is 15% over budget
   - Margin dropped to 14% (below 15% threshold)
   - Resource costs higher than planned
   - Suggests reviewing rate card for Senior Designer role
7. Miguel clicks rate card link → Opens Procure app
8. Reviews rate, sees vendor charges increased
9. Returns to Finance PPM, logs note in project

**Key Interactions:**
- Projects list → AI Console (auto-context)
- AI answer → Procure app (cross-app navigation)
- Multi-app workflow (Finance PPM → Procure → back)

---

### Journey 3: Leadership - Portfolio Review

**Persona:** Lisa, Managing Director  
**Goal:** Quarterly portfolio health review

**Steps:**
1. Navigate to `/finance-ppm/analytics`
2. Review portfolio margin chart (sees Consumer Tech trending down)
3. Click chart → Drill down to project list
4. Click "Ask AI" button
5. Ask: "Why is Consumer Tech margin declining?"
6. AI returns:
   - Analysis of 4 projects in portfolio
   - 2 projects have scope creep
   - 1 project using expensive vendor rates
   - 1 project has AR aging issues
   - Recommends reviewing SOWs and vendor contracts
7. Lisa clicks "View detailed report" → Opens PDF export
8. Schedules follow-up with Finance and Account teams

**Key Interactions:**
- Analytics → AI Console (explain chart behaviour)
- AI insight → Actionable recommendations
- Export to PDF for offline review

---

## Technical Requirements Summary

### Frontend Stack
- React 18 + TypeScript
- Tailwind CSS (TBWA theme)
- Chart.js / Recharts for visualizations
- React Query for data fetching
- Zustand for state management

### Backend Stack
- Supabase Postgres (database + RLS)
- Supabase Edge Functions (RAG, tools)
- FastAPI (optional, for complex orchestration)
- pgvector for embeddings
- OpenAI API (embeddings + LLM)

### APIs Required (Summary)
```
/api/finance-ppm/home/*           - Dashboard KPIs
/api/finance-ppm/assistant/*      - AI console
/api/finance-ppm/knowledge/*      - Knowledge browser
/api/finance-ppm/projects/*       - Projects & portfolios
/api/finance-ppm/analytics/*      - Charts & metrics
/api/finance-ppm/admin/*          - Configuration
/api/finance-ppm/tools/*          - Live data tools
```

---

**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 - Database Schema Design  
**Total Routes:** 6  
**Total Components:** 40+  
**Total APIs:** 25+
