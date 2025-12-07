# Agency Creative Workroom - UI/UX Map

**Phase:** 1 - UI, Routes & User Journeys  
**Date:** 2025-12-07

---

## Overview

This document defines the complete UI/UX structure for the Agency Creative Workroom, inspired by Odoo's Marketing Agency package and Notion's collaborative workspace, optimized for advertising agency workflows.

**Design Philosophy:**
- **Notion-style** pages and databases for artifacts
- **Odoo-inspired** business workflows (CRM → Project → Timesheet → Invoice)
- **AI-first** with assistant pinned to right sidebar
- **Role-aware** visibility (Account Manager vs Finance vs Creative)

---

## Route Structure

### Primary Routes

| Route | Purpose | Primary Users | Key Features |
|-------|---------|---------------|--------------|
| `/agency` | Home Dashboard | All | KPI tiles, recent activity, AI panel |
| `/agency/clients` | Client 360 | Account, Finance | Client list, accounts, contacts, spend |
| `/agency/campaigns` | Campaign Hub | All | Kanban/list of active campaigns |
| `/agency/artifacts` | Content Library | Creative, Account | Notion-style artifact database |
| `/agency/rates` | Rate Cards & Budgets | Account, Finance | Rate governance, budget templates |
| `/agency/timesheets` | Time Tracking | All | Timesheet entry, approvals |
| `/agency/capacity` | Resource Planning | PM, Leadership | Utilization, allocation, forecasts |
| `/agency/analytics` | Executive Dashboard | Finance, Leadership | Revenue, profitability, trends |

---

## Route 1: Agency Home Dashboard

### URL
`/agency`

### Purpose
Central command center showing agency health, alerts, and quick actions

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header: TBWA Agency Workroom                    [User Menu] │
├─────────────────────────────────────────────────────────────┤
│  KPI Tiles (4 across)                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │Active  │ │Campaign│ │Monthly │ │Team    │               │
│  │Clients │ │Revenue │ │Margin  │ │Util %  │               │
│  │   32   │ │ ₱85M   │ │ 24.5%  │ │  78%   │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
├─────────────────────────────────────────────────────────────┤
│  Main Content (2 columns)                    │ AI Assistant │
│  ┌──────────────────┬─────────────────────┐  │ Panel        │
│  │ Today's          │ Critical Approvals  │  │ (sticky)     │
│  │ Deliverables     │ • Brief - Acme      │  │              │
│  │ • Script due     │ • Budget - HealthCo │  │ 🤖 Ask me... │
│  │ • Deck v3        │ • Deck - RetailCo   │  │              │
│  ├──────────────────┼─────────────────────┤  │              │
│  │ Recent Activity  │ Upcoming Deadlines  │  │              │
│  │ Sarah added deck │ Dec 10: Pitch       │  │              │
│  │ John logged 8hrs │ Dec 12: Campaign    │  │              │
│  └──────────────────┴─────────────────────┘  │              │
└──────────────────────────────────────────────┴──────────────┘
```

### Components

#### 1. KPI Tiles (Top Row)
```tsx
<KPITilesRow>
  <KPITile
    label="Active Clients"
    value={32}
    change="+3 vs last month"
    trend="up"
    icon={<Users />}
    onClick={() => navigate('/agency/clients')}
  />
  <KPITile
    label="Campaign Revenue"
    value="₱85M"
    subtitle="YTD"
    change="+12% vs last year"
    trend="up"
    icon={<TrendingUp />}
  />
  <KPITile
    label="Monthly Margin"
    value="24.5%"
    severity={margin >= 25 ? 'success' : 'warning'}
    icon={<PieChart />}
  />
  <KPITile
    label="Team Utilization"
    value="78%"
    subtitle="billable hours"
    icon={<Clock />}
  />
</KPITilesRow>
```

#### 2. Activity Feed
```tsx
<ActivityFeed>
  {activities.map(activity => (
    <ActivityItem key={activity.id}>
      <Avatar user={activity.user} />
      <div>
        <p>{activity.message}</p>
        <time>{formatRelative(activity.timestamp)}</time>
      </div>
      {activity.type === 'artifact_added' && (
        <Badge>New Artifact</Badge>
      )}
    </ActivityItem>
  ))}
</ActivityFeed>
```

#### 3. AI Assistant Panel (Right Sidebar - Persistent)
```tsx
<AIAssistantPanel position="right">
  <AvatarIcon>🤖</AvatarIcon>
  <WelcomeMessage>
    Hi {user.name}! I can help you with campaigns, budgets, artifacts, and more.
  </WelcomeMessage>
  
  <QuickActions>
    <Button size="sm" variant="ghost">
      📊 Summarize this month
    </Button>
    <Button size="sm" variant="ghost">
      💰 Suggest campaign rates
    </Button>
    <Button size="sm" variant="ghost">
      📝 Draft a brief
    </Button>
  </QuickActions>
  
  <ChatInterface>
    <MessageList messages={messages} />
    <PromptInput
      placeholder="Ask about campaigns, budgets, artifacts..."
      onSubmit={handleAIQuery}
    />
  </ChatInterface>
</AIAssistantPanel>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/dashboard/kpis
  → { active_clients, campaign_revenue_ytd, monthly_margin, team_utilization }

GET /api/agency/dashboard/activity?limit=10
  → [ { user, action, entity_type, entity_id, timestamp } ]

GET /api/agency/dashboard/deliverables?status=upcoming
  → [ { artifact, deadline, owner, campaign } ]

GET /api/agency/dashboard/approvals?status=pending
  → [ { type, item, requester, deadline } ]
```

**Database Views:**
```sql
agency.v_dashboard_kpis
agency.v_recent_activity
agency.v_upcoming_deliverables
agency.v_pending_approvals
```

---

## Route 2: Clients & Accounts

### URL
`/agency/clients`

### Purpose
CRM-style client management with 360-degree view

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Clients                              [+ New Client]  Search │
├─────────────────────────────────────────────────────────────┤
│  Filters: [All Sectors ▾] [All Regions ▾] [Active ▾]        │
├───────────────────────────────┬─────────────────────────────┤
│  Client List (Left Panel)    │  Client 360 (Right Panel)   │
│                               │                              │
│  ┌─────────────────────────┐ │  Acme Corporation            │
│  │ Acme Corporation        │ │  Sector: FMCG | Region: PH   │
│  │ Sector: FMCG            │ │                              │
│  │ 3 Brands | 5 Campaigns  │ │  ┌──────────────────────┐   │
│  │ ₱25M YTD Revenue        │ │  │ Overview             │   │
│  └─────────────────────────┘ │  │ • 3 Brands           │   │
│                               │  │ • 5 Active Campaigns │   │
│  ┌─────────────────────────┐ │  │ • ₱25M Revenue YTD   │   │
│  │ HealthCo                │ │  └──────────────────────┘   │
│  │ Sector: Healthcare      │ │                              │
│  │ 2 Brands | 3 Campaigns  │ │  Tabs:                       │
│  │ ₱12M YTD Revenue        │ │  [Brands] [Campaigns]        │
│  └─────────────────────────┘ │  [Contacts] [Financials]     │
│                               │                              │
│  ... more clients ...         │  [Content per tab]           │
└───────────────────────────────┴─────────────────────────────┘
```

### Components

#### 1. Client List (Table)
```tsx
<ClientsTable
  columns={[
    'Client Name',
    'Sector',
    'Brands',
    'Active Campaigns',
    'YTD Revenue',
    'Retention Type',
    'Status'
  ]}
  data={clients}
  filters={{
    sector: ['FMCG', 'Finance', 'Telco', 'Tech', 'NGO'],
    region: ['PH', 'SEA', 'APAC'],
    retention_type: ['Retainer', 'Project'],
    status: ['Active', 'Inactive']
  }}
  onRowClick={(client) => setSelectedClient(client)}
  sortable
  searchable
/>
```

#### 2. Client 360 Panel (Right)
```tsx
<Client360Panel client={selectedClient}>
  <ClientHeader>
    <ClientLogo src={client.logo_url} />
    <div>
      <h2>{client.client_name}</h2>
      <p>{client.sector} | {client.region}</p>
    </div>
    <Button onClick={() => openEditClientDialog(client)}>
      Edit
    </Button>
  </ClientHeader>
  
  <KPISummary>
    <Metric label="Brands" value={client.brand_count} />
    <Metric label="Active Campaigns" value={client.active_campaigns} />
    <Metric label="YTD Revenue" value={formatCurrency(client.revenue_ytd)} />
    <Metric label="Avg Margin" value={`${client.avg_margin}%`} />
  </KPISummary>
  
  <Tabs>
    <Tab label="Brands">
      <BrandsList clientId={client.id} />
    </Tab>
    <Tab label="Campaigns">
      <CampaignsTimeline clientId={client.id} />
    </Tab>
    <Tab label="Contacts">
      <ContactsList clientId={client.id} />
    </Tab>
    <Tab label="Financials" visibleTo={['finance', 'leadership']}>
      <FinancialsTable clientId={client.id} />
    </Tab>
  </Tabs>
  
  <AIActionBar>
    <Button variant="ghost" onClick={() => askAI(`Summarize ${client.client_name}`)}>
      🤖 Ask AI about this client
    </Button>
  </AIActionBar>
</Client360Panel>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/clients
  ?sector=FMCG
  &region=PH
  &status=active

Response:
{
  clients: Array<{
    id, client_code, client_name, sector, region,
    brand_count, active_campaigns, revenue_ytd, avg_margin,
    retention_type, status
  }>
}

GET /api/agency/clients/:id/360

Response:
{
  client: {...},
  brands: [...],
  campaigns: [...],
  contacts: [...],
  financials: {...} // Finance-only
}
```

**Database Views:**
```sql
agency.v_client_overview
agency.v_client_brands
agency.v_client_campaigns
agency.v_client_financials -- RLS protected
```

---

## Route 3: Campaigns & Projects

### URL
`/agency/campaigns`

### Purpose
Kanban/list view of all campaigns with project management features

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Campaigns                    [+ New Campaign]  [Views: ▾]   │
├─────────────────────────────────────────────────────────────┤
│  Filters: [Client ▾] [Brand ▾] [Type ▾] [Status ▾]          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ Pipeline │ Planning │ Active   │ Review   │ Completed│   │
│  │          │          │          │          │          │   │
│  │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐│   │
│  │ │Acme  │ │ │Health│ │ │Retail│ │ │Fin   │ │ │NGO   ││   │
│  │ │Brand │ │ │Wellness││ │Holiday││ │Re-   │ │ │Cause ││   │
│  │ │Launch│ │ │Camp  │ │ │Camp  │ │ │brand │ │ │Camp  ││   │
│  │ │      │ │ │      │ │ │      │ │ │      │ │ │      ││   │
│  │ │₱5M   │ │ │₱2.5M │ │ │₱1.5M │ │ │₱4M   │ │ │₱800K ││   │
│  │ │80%   │ │ │70%   │ │ │On    │ │ │Review│ │ │Done  ││   │
│  │ │margin│ │ │margin│ │ │track │ │ │due   │ │ │      ││   │
│  │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘│   │
│  │          │          │          │          │          │   │
│  │ Drag →   │ Drag →   │          │          │          │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Campaign Kanban Board
```tsx
<KanbanBoard>
  {columns.map(column => (
    <KanbanColumn key={column.status} title={column.title}>
      {campaigns
        .filter(c => c.status === column.status)
        .map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onDragStart={() => handleDragStart(campaign)}
            onDrop={(newStatus) => updateCampaignStatus(campaign, newStatus)}
            onClick={() => navigate(`/agency/campaigns/${campaign.id}`)}
          />
        ))}
    </KanbanColumn>
  ))}
</KanbanBoard>
```

#### 2. Campaign Card
```tsx
<CampaignCard campaign={campaign}>
  <CardHeader>
    <Badge variant={getCampaignTypeBadge(campaign.type)}>
      {campaign.type}
    </Badge>
    <h4>{campaign.campaign_name}</h4>
    <p className="text-xs">{campaign.client_name} | {campaign.brand_name}</p>
  </CardHeader>
  
  <CardContent>
    <MetricRow>
      <span>Budget:</span>
      <span className="font-medium">{formatCurrency(campaign.budget)}</span>
    </MetricRow>
    {userRole === 'finance' && (
      <MetricRow>
        <span>Margin:</span>
        <span className={getMarginColor(campaign.margin_pct)}>
          {campaign.margin_pct}%
        </span>
      </MetricRow>
    )}
    <MetricRow>
      <span>Deadline:</span>
      <span>{formatDate(campaign.end_date)}</span>
    </MetricRow>
  </CardContent>
  
  <CardFooter>
    <AvatarGroup users={campaign.team} max={3} />
    <div className="flex gap-1">
      <IconButton icon={<FileText />} tooltip="5 artifacts" />
      <IconButton icon={<MessageSquare />} tooltip="12 comments" />
    </div>
  </CardFooter>
</CampaignCard>
```

#### 3. Campaign Detail View (Modal or Full Page)
```tsx
<CampaignDetailView campaign={selectedCampaign}>
  <Header>
    <Breadcrumb>
      <Link to="/agency/campaigns">Campaigns</Link>
      <span>/</span>
      <span>{campaign.campaign_name}</span>
    </Breadcrumb>
    <Actions>
      <Button onClick={() => askAI(`Summarize ${campaign.campaign_name}`)}>
        🤖 Ask AI
      </Button>
      <Button variant="outline" onClick={() => openEditDialog(campaign)}>
        Edit
      </Button>
    </Actions>
  </Header>
  
  <Tabs>
    <Tab label="Overview">
      <CampaignOverview campaign={campaign} />
    </Tab>
    <Tab label="Brief">
      <BriefViewer campaignId={campaign.id} editable />
    </Tab>
    <Tab label="Scope">
      <ScopeDocument campaignId={campaign.id} />
    </Tab>
    <Tab label="Budget">
      <BudgetBuilder campaignId={campaign.id} userRole={userRole} />
    </Tab>
    <Tab label="Timeline">
      <CampaignTimeline campaignId={campaign.id} />
    </Tab>
    <Tab label="Team">
      <TeamAllocation campaignId={campaign.id} />
    </Tab>
    <Tab label="Artifacts">
      <ArtifactsList campaignId={campaign.id} />
    </Tab>
    <Tab label="Financials" visibleTo={['finance']}>
      <CampaignFinancials campaignId={campaign.id} />
    </Tab>
  </Tabs>
</CampaignDetailView>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/campaigns
  ?client_id=...
  &status=active
  &type=launch

Response:
{
  campaigns: Array<{
    id, campaign_code, campaign_name,
    client_id, client_name, brand_id, brand_name,
    type, status, start_date, end_date,
    budget, margin_pct, team, artifact_count
  }>
}

GET /api/agency/campaigns/:id

Response:
{
  campaign: {...},
  brief: {...},
  scope: {...},
  budget: {...},
  timeline: [...],
  team: [...],
  artifacts: [...],
  financials: {...} // Finance-only
}

PUT /api/agency/campaigns/:id/status
  { status: 'active' }
```

**Database Views:**
```sql
agency.v_campaign_overview
agency.v_campaign_team
agency.v_campaign_artifacts
agency.v_campaign_financials -- RLS protected
```

---

## Route 4: Creative Artifacts & Content Library

### URL
`/agency/artifacts`

### Purpose
Notion-style database of all creative work (briefs, scripts, decks, boards)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Artifacts                    [+ New Artifact]  [Views: ▾]   │
├─────────────────────────────────────────────────────────────┤
│  Filters: [Type ▾] [Client ▾] [Campaign ▾] [Status ▾]       │
│  Search: [Search artifacts...]                     [Tags ▾]  │
├─────────────────────────────────────────────────────────────┤
│  View Mode: [Table] [Gallery] [Timeline]                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Table View:                                                  │
│  ┌──────┬────────┬────────┬────────┬──────┬──────┬────────┐ │
│  │ Type │ Title  │Campaign│ Client │Status│Owner │Updated │ │
│  ├──────┼────────┼────────┼────────┼──────┼──────┼────────┤ │
│  │📝Brief│Acme Q1 │Acme    │ Acme   │App..│Sarah │2h ago  │ │
│  │      │Launch  │Brand X │  Corp  │roved │      │        │ │
│  ├──────┼────────┼────────┼────────┼──────┼──────┼────────┤ │
│  │📜Script│Health │Wellness│HealthCo│Draft │John  │1d ago  │ │
│  │      │TVC 30s │Camp    │        │      │      │        │ │
│  ├──────┼────────┼────────┼────────┼──────┼──────┼────────┤ │
│  │📊Deck │Retail  │Holiday │RetailCo│Review│Lisa  │3d ago  │ │
│  │      │Pitch v3│Camp    │        │      │      │        │ │
│  └──────┴────────┴────────┴────────┴──────┴──────┴────────┘ │
│                                                               │
│  Gallery View (when selected):                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ [thumb] │ │ [thumb] │ │ [thumb] │ │ [thumb] │           │
│  │ Brief   │ │ Script  │ │ Deck    │ │ Board   │           │
│  │ Acme Q1 │ │ Health  │ │ Retail  │ │ Finance │           │
│  │ ★★★★★   │ │ ★★★★☆   │ │ ★★★☆☆   │ │ ★★★★★   │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Artifact Table
```tsx
<ArtifactsTable
  columns={[
    { key: 'type', label: 'Type', render: (row) => <ArtifactTypeIcon type={row.artifact_type} /> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'campaign', label: 'Campaign', link: true },
    { key: 'client', label: 'Client' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'owner', label: 'Owner', render: (row) => <Avatar user={row.owner} /> },
    { key: 'updated_at', label: 'Updated', format: 'relative' }
  ]}
  data={artifacts}
  onRowClick={(artifact) => openArtifactViewer(artifact)}
  multiSelect
  actions={[
    { label: 'Download', icon: <Download />, onClick: handleDownload },
    { label: 'Share', icon: <Share />, onClick: handleShare },
    { label: 'Archive', icon: <Archive />, onClick: handleArchive }
  ]}
/>
```

#### 2. Artifact Viewer (Notion-style Page)
```tsx
<ArtifactViewer artifact={selectedArtifact}>
  <Header>
    <IconPicker
      value={artifact.icon}
      onChange={(icon) => updateArtifact({ icon })}
    />
    <EditableTitle
      value={artifact.title}
      onChange={(title) => updateArtifact({ title })}
    />
  </Header>
  
  <Metadata>
    <MetaRow label="Type" value={artifact.artifact_type} editable />
    <MetaRow label="Campaign" value={artifact.campaign_name} linkTo={`/agency/campaigns/${artifact.campaign_id}`} />
    <MetaRow label="Client" value={artifact.client_name} />
    <MetaRow label="Status" value={<StatusDropdown value={artifact.status} onChange={handleStatusChange} />} />
    <MetaRow label="Owner" value={<UserPicker value={artifact.owner_id} onChange={handleOwnerChange} />} />
    <MetaRow label="Tags" value={<TagPicker tags={artifact.tags} onChange={handleTagsChange} />} />
  </Metadata>
  
  <ContentEditor>
    {artifact.artifact_type === 'brief' && (
      <BriefEditor content={artifact.content} onChange={handleContentChange} />
    )}
    {artifact.artifact_type === 'script' && (
      <ScriptEditor content={artifact.content} onChange={handleContentChange} />
    )}
    {artifact.artifact_type === 'deck' && (
      <DeckViewer fileUrl={artifact.content_url} />
    )}
    {/* ... other artifact types */}
  </ContentEditor>
  
  <Comments>
    <CommentThread artifactId={artifact.id} />
  </Comments>
  
  <AIActionBar>
    <Button variant="ghost" onClick={() => askAI(`Summarize this ${artifact.artifact_type}`)}>
      🤖 Summarize
    </Button>
    <Button variant="ghost" onClick={() => askAI(`Suggest improvements for this ${artifact.artifact_type}`)}>
      🤖 Suggest improvements
    </Button>
    <Button variant="ghost" onClick={() => askAI(`Draft similar brief based on this`)}>
      🤖 Draft similar
    </Button>
  </AIActionBar>
</ArtifactViewer>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/artifacts
  ?type=brief
  &client_id=...
  &campaign_id=...
  &status=approved
  &tags[]=brand-launch,tvc

Response:
{
  artifacts: Array<{
    id, artifact_code, title, artifact_type,
    campaign_id, campaign_name, client_id, client_name,
    status, owner_id, owner_name, tags, icon,
    content_preview, content_url,
    created_at, updated_at, version
  }>
}

GET /api/agency/artifacts/:id

Response:
{
  artifact: {...},
  content: string | object,
  versions: [...],
  comments: [...]
}

PUT /api/agency/artifacts/:id
  { title, content, status, tags }
```

**Database:**
```sql
agency.artifacts
agency.artifact_versions -- for version history
agency.artifact_comments
```

---

## Route 5: Rates & Budget Templates

### URL
`/agency/rates`

### Purpose
Rate card management and budget template building (SAP SRM-style)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Rate Cards & Budgets            [Tabs: Rate Cards | Budgets]│
├─────────────────────────────────────────────────────────────┤
│  Rate Cards Tab:                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ Filters: [Discipline ▾] [Seniority ▾] [Market ▾]     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────┬───────┬──────────┬─────────┬──────────┬──────┐ │
│  │ Role    │ Level │Discipline│ Market  │Client Rt │Margin│ │
│  ├─────────┼───────┼──────────┼─────────┼──────────┼──────┤ │
│  │Account  │Senior │Strategy  │ PH      │₱28k/day  │ 28%  │ │
│  │Strategist│      │          │         │          │      │ │
│  ├─────────┼───────┼──────────┼─────────┼──────────┼──────┤ │
│  │Creative │Director│Creative │ PH      │₱38k/day  │ 26%  │ │
│  │Director │       │          │         │          │      │ │
│  ├─────────┼───────┼──────────┼─────────┼──────────┼──────┤ │
│  │Art      │Senior │Creative  │ PH      │₱25k/day  │ 28%  │ │
│  │Director │       │          │         │          │      │ │
│  └─────────┴───────┴──────────┴─────────┴──────────┴──────┘ │
│                                                               │
│  For Account Managers: Cost Rate & Vendor columns HIDDEN     │
│  For Finance: Full visibility including vendor names & costs │
└─────────────────────────────────────────────────────────────┘
```

**Budgets Tab:**
```
┌─────────────────────────────────────────────────────────────┐
│  Budget Templates                    [+ New Template]        │
├─────────────────────────────────────────────────────────────┤
│  Templates:                                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ TVC Campaign Budget Template                             ││
│  │ Phases: Strategy | Creative | Production | Post          ││
│  │                                                           ││
│  │ Strategy Phase:                                           ││
│  │ - Brand Strategist (Senior) x 10 days  @ ₱28k = ₱280k    ││
│  │ - Account Director x 5 days @ ₱35k = ₱175k               ││
│  │ Subtotal: ₱455k                                           ││
│  │                                                           ││
│  │ Creative Phase:                                           ││
│  │ - Creative Director x 15 days @ ₱38k = ₱570k             ││
│  │ - Art Director (Senior) x 20 days @ ₱25k = ₱500k         ││
│  │ - Copywriter (Senior) x 20 days @ ₱22k = ₱440k           ││
│  │ Subtotal: ₱1.51M                                          ││
│  │                                                           ││
│  │ Total Budget: ₱5.2M  |  Margin: 27.5% (Finance-only)     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Rate Card Table (with RLS)
```tsx
<RateCardTable
  columns={[
    'Role',
    'Level',
    'Discipline',
    'Market',
    'Unit',
    'Client Rate',
    ...(userRole === 'finance' ? ['Cost Rate', 'Vendor', 'Margin %'] : [])
  ]}
  data={rateCards}
  userRole={userRole}
  onEdit={(rateCard) => openEditDialog(rateCard)}
  permissions={{
    canEdit: userRole === 'finance',
    canViewCosts: userRole === 'finance'
  }}
/>
```

#### 2. Budget Builder (Procure-style)
```tsx
<BudgetBuilder
  campaignId={campaignId}
  template={selectedTemplate}
  userRole={userRole}
>
  <PhasesTabs>
    {phases.map(phase => (
      <Tab key={phase.id} label={phase.name}>
        <BudgetLineItems
          phaseId={phase.id}
          lines={phase.lines}
          rateCards={availableRateCards}
          onAddLine={() => openRateCardPicker(phase.id)}
          onEditLine={(line) => handleEditLine(line)}
          onDeleteLine={(line) => handleDeleteLine(line)}
        />
        
        <PhaseTotal>
          <span>Phase Total:</span>
          <span>{formatCurrency(phase.total_client)}</span>
        </PhaseTotal>
        
        {userRole === 'finance' && (
          <>
            <PhaseTotal className="text-muted-foreground">
              <span>Phase Cost:</span>
              <span>{formatCurrency(phase.total_cost)}</span>
            </PhaseTotal>
            <PhaseTotal>
              <span>Phase Margin:</span>
              <span className={getMarginColor(phase.margin_pct)}>
                {phase.margin_pct}%
              </span>
            </PhaseTotal>
          </>
        )}
      </Tab>
    ))}
  </PhasesTabs>
  
  <BudgetSummary>
    <div>Total Budget: {formatCurrency(totalClient)}</div>
    {userRole === 'finance' && (
      <>
        <div>Total Cost: {formatCurrency(totalCost)}</div>
        <div>Overall Margin: {overallMargin}%</div>
      </>
    )}
  </BudgetSummary>
  
  <AIActionBar>
    <Button variant="ghost" onClick={() => askAI('Suggest reasonable rates for this campaign')}>
      🤖 Suggest Rates
    </Button>
    <Button variant="ghost" onClick={() => askAI('Review this budget for risks')}>
      🤖 Review Budget
    </Button>
  </AIActionBar>
</BudgetBuilder>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/rate-cards
  ?discipline=creative
  &market=PH
  &user_role=finance  // Determines field visibility

Response (Account Manager):
{
  rate_cards: Array<{
    id, role, discipline, seniority_level, market,
    unit_of_measure, client_rate, currency
    // cost_rate, vendor_id, vendor_name EXCLUDED
  }>
}

Response (Finance):
{
  rate_cards: Array<{
    id, role, discipline, seniority_level, market,
    unit_of_measure, client_rate, cost_rate, margin_pct,
    vendor_id, vendor_name, currency
    // FULL VISIBILITY
  }>
}

GET /api/agency/budget-templates/:id
POST /api/agency/budgets
  { campaign_id, phases: [...] }
```

**Database Views:**
```sql
-- Reuse from Procure
agency.v_rate_cards_am     -- Account Manager view (client rates only)
agency.v_rate_cards_fd     -- Finance Director view (full)
agency.v_budget_templates
```

---

*Continuing with remaining routes (Timesheets, Capacity, Analytics) in next message due to length...*

**Status:** Phase 1 In Progress 🔄  
**Completed:** 5/8 routes  
**Next:** Timesheets, Capacity, Analytics routes

---

## Route 6: Timesheets & Time Tracking

### URL
`/agency/timesheets`

### Purpose
Log billable and non-billable hours per campaign/project

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Timesheets                      Week: Dec 2-8, 2025 [< >]   │
├─────────────────────────────────────────────────────────────┤
│  My Timesheet                               [Submit for Approval]│
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┬────┬────┬────┬────┬────┬────┬────┬─────────┐ │
│  │Campaign  │Mon │Tue │Wed │Thu │Fri │Sat │Sun │Total    │ │
│  ├──────────┼────┼────┼────┼────┼────┼────┼────┼─────────┤ │
│  │Acme Brand│ 6h │ 8h │ 4h │ 6h │ 8h │ -  │ -  │ 32h (B) │ │
│  │X Launch  │    │    │    │    │    │    │    │         │ │
│  ├──────────┼────┼────┼────┼────┼────┼────┼────┼─────────┤ │
│  │HealthCo  │ 2h │ -  │ 4h │ 2h │ -  │ -  │ -  │  8h (B) │ │
│  │Wellness  │    │    │    │    │    │    │    │         │ │
│  ├──────────┼────┼────┼────┼────┼────┼────┼────┼─────────┤ │
│  │Internal  │ -  │ -  │ -  │ -  │ -  │ 4h │ -  │  4h (NB)│ │
│  │Meetings  │    │    │    │    │    │    │    │         │ │
│  ├──────────┼────┼────┼────┼────┼────┼────┼────┼─────────┤ │
│  │+ Add Row │    │    │    │    │    │    │    │         │ │
│  └──────────┴────┴────┴────┴────┴────┴────┴────┴─────────┘ │
│  Daily Totals: 8h | 8h | 8h | 8h | 8h | 4h | 0h = 44h      │
│  Billable: 40h  |  Non-Billable: 4h  |  Target: 40h         │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Timesheet Grid
```tsx
<TimesheetGrid
  weekStartDate={weekStart}
  userId={currentUser.id}
  entries={timesheetEntries}
  onCellChange={(campaignId, date, hours) => handleCellChange(campaignId, date, hours)}
  onAddRow={() => openCampaignPicker()}
  editable={timesheetStatus !== 'submitted'}
>
  {entries.map(entry => (
    <TimesheetRow key={entry.id}>
      <CellCampaign>{entry.campaign_name}</CellCampaign>
      {daysOfWeek.map(day => (
        <CellHours
          key={day}
          value={entry.hours[day]}
          onChange={(hours) => handleCellChange(entry.id, day, hours)}
          editable
        />
      ))}
      <CellTotal billable={entry.billable}>
        {entry.total_hours}h {entry.billable ? '(B)' : '(NB)'}
      </CellTotal>
    </TimesheetRow>
  ))}
</TimesheetGrid>
```

#### 2. Approval View (Manager)
```tsx
<TimesheetApprovalQueue manager={currentUser}>
  {pendingTimesheets.map(timesheet => (
    <TimesheetApprovalCard key={timesheet.id}>
      <Header>
        <Avatar user={timesheet.employee} />
        <div>
          <h4>{timesheet.employee_name}</h4>
          <p>Week of {formatDate(timesheet.week_start)}</p>
        </div>
      </Header>
      
      <Summary>
        <Metric label="Total Hours" value={timesheet.total_hours} />
        <Metric label="Billable" value={timesheet.billable_hours} />
        <Metric label="Non-Billable" value={timesheet.non_billable_hours} />
        <Metric label="Utilization" value={`${timesheet.utilization_pct}%`} />
      </Summary>
      
      <Actions>
        <Button
          size="sm"
          variant="outline"
          onClick={() => viewTimesheetDetail(timesheet)}
        >
          Review
        </Button>
        <Button
          size="sm"
          onClick={() => approveTimesheet(timesheet.id)}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => rejectTimesheet(timesheet.id)}
        >
          Reject
        </Button>
      </Actions>
    </TimesheetApprovalCard>
  ))}
</TimesheetApprovalQueue>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/timesheets
  ?employee_id=...
  &week_start=2025-12-02

Response:
{
  entries: Array<{
    id, employee_id, campaign_id, campaign_name,
    date, hours, billable, task, notes
  }>,
  summary: {
    total_hours, billable_hours, non_billable_hours,
    utilization_pct, target_hours
  }
}

POST /api/agency/timesheets/submit
  { week_start, entries: [...] }

POST /api/agency/timesheets/:id/approve
POST /api/agency/timesheets/:id/reject
  { reason }
```

**Database:**
```sql
agency.timesheet_entries
agency.v_timesheet_summary
agency.v_pending_approvals
```

---

## Route 7: Capacity & Resource Planning

### URL
`/agency/capacity`

### Purpose
View team utilization, allocation, and capacity forecasts

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Capacity Planning                      Period: Dec 2025 [▾] │
├─────────────────────────────────────────────────────────────┤
│  KPIs:                                                        │
│  ┌───────────┬───────────┬───────────┬───────────┐          │
│  │Team Util  │Billable   │Bench      │Overallocated│        │
│  │  78%      │  85%      │  3 people │  2 people   │        │
│  └───────────┴───────────┴───────────┴───────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Team Allocation (Heatmap):                                  │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │ Employee │ Week 1 │ Week 2 │ Week 3 │ Week 4 │ Total  │  │
│  ├──────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │Sarah J.  │ 100%🔴│  80% 🟢│  60% 🟢│ 120%🔴│  90%   │  │
│  │(Creative)│ Acme   │ Acme   │ Health │ Acme+  │        │  │
│  │          │        │        │        │ Retail │        │  │
│  ├──────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │John D.   │  60% 🟢│  80% 🟢│  40% 🡐│  60% 🟢│  60%   │  │
│  │(Strategy)│ Health │ Health │        │ Retail │        │  │
│  ├──────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │Lisa M.   │   0% 🡐│   0% 🡐│  80% 🟢│  80% 🟢│  40%   │  │
│  │(Producer)│        │        │ Retail │ Retail │        │  │
│  └──────────┴────────┴────────┴────────┴────────┴────────┘  │
│                                                               │
│  🟢 Under 80%  |  🡐 0% (Bench)  |  🔴 Over 100% (Risk)      │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Capacity Heatmap
```tsx
<CapacityHeatmap
  employees={team}
  period={selectedPeriod}
  granularity="week"
>
  {employees.map(employee => (
    <HeatmapRow key={employee.id}>
      <EmployeeCell>
        <Avatar user={employee} />
        <div>
          <div>{employee.name}</div>
          <div className="text-xs">{employee.role}</div>
        </div>
      </EmployeeCell>
      
      {weeks.map(week => {
        const allocation = employee.allocations[week];
        const color = getUtilizationColor(allocation.utilization_pct);
        
        return (
          <AllocationCell
            key={week}
            utilization={allocation.utilization_pct}
            color={color}
            onClick={() => openAllocationDetail(employee, week)}
          >
            <div className="font-medium">{allocation.utilization_pct}%</div>
            <div className="text-xs">
              {allocation.campaigns.map(c => c.campaign_code).join(', ')}
            </div>
          </AllocationCell>
        );
      })}
      
      <TotalCell>
        {employee.avg_utilization}%
      </TotalCell>
    </HeatmapRow>
  ))}
</CapacityHeatmap>
```

#### 2. Allocation Detail Modal
```tsx
<AllocationDetailModal employee={selectedEmployee} week={selectedWeek}>
  <Header>
    <h3>{employee.name} - Week of {formatDate(week)}</h3>
  </Header>
  
  <AllocationBreakdown>
    <p>Total Capacity: 40 hours</p>
    <Divider />
    {allocations.map(alloc => (
      <AllocationItem key={alloc.campaign_id}>
        <div>
          <strong>{alloc.campaign_name}</strong>
          <p className="text-xs">{alloc.task}</p>
        </div>
        <div>
          {alloc.planned_hours}h ({alloc.pct_of_capacity}%)
        </div>
      </AllocationItem>
    ))}
    <Divider />
    <AllocationTotal>
      Total: {totalHours}h ({totalPct}%)
    </AllocationTotal>
  </AllocationBreakdown>
  
  <Actions>
    <Button onClick={() => openReallocationTool(employee, week)}>
      Adjust Allocation
    </Button>
  </Actions>
</AllocationDetailModal>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/capacity
  ?period=2025-12
  &team_id=...
  &role=creative

Response:
{
  summary: {
    team_utilization_pct,
    billable_pct,
    bench_count,
    overallocated_count
  },
  employees: Array<{
    id, name, role,
    weekly_allocations: {
      week: date,
      utilization_pct,
      campaigns: [ { campaign_id, campaign_code, hours, pct } ]
    }
  }>
}
```

**Database Views:**
```sql
agency.v_capacity_summary
agency.v_employee_utilization
agency.v_weekly_allocations
```

---

## Route 8: Analytics & Executive Dashboard

### URL
`/agency/analytics`

### Purpose
Executive-level insights: revenue, profitability, trends

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Analytics                            Period: YTD 2025 [▾]   │
├─────────────────────────────────────────────────────────────┤
│  Executive KPIs:                                              │
│  ┌───────────┬───────────┬───────────┬───────────┐          │
│  │Total      │YTD        │Avg        │Top        │          │
│  │Revenue    │Margin     │Utilization│Client     │          │
│  │₱285M      │  24.8%    │  76%      │Acme ₱85M  │          │
│  └───────────┴───────────┴───────────┴───────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Charts Grid (2x2):                                          │
│  ┌─────────────────────┬─────────────────────┐              │
│  │Revenue by Client    │ Margin Trend        │              │
│  │ [Bar Chart]         │ [Line Chart]        │              │
│  │                     │                     │              │
│  │                     │                     │              │
│  ├─────────────────────┼─────────────────────┤              │
│  │Campaign Profitability│ Utilization by Role│              │
│  │ [Scatter Plot]      │ [Heatmap]           │              │
│  │                     │                     │              │
│  │                     │                     │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Analytics Dashboard
```tsx
<AnalyticsDashboard period={selectedPeriod}>
  <KPITilesRow>
    <KPITile
      label="Total Revenue"
      value={formatCurrency(kpis.total_revenue)}
      change={`+${kpis.revenue_growth}% YoY`}
      trend="up"
    />
    <KPITile
      label="YTD Margin"
      value={`${kpis.ytd_margin}%`}
      severity={kpis.ytd_margin >= 25 ? 'success' : 'warning'}
    />
    <KPITile
      label="Avg Utilization"
      value={`${kpis.avg_utilization}%`}
    />
    <KPITile
      label="Top Client"
      value={kpis.top_client_name}
      subtitle={formatCurrency(kpis.top_client_revenue)}
    />
  </KPITilesRow>
  
  <ChartsGrid>
    <Chart
      title="Revenue by Client"
      type="bar"
      data={revenueByClient}
      xAxis="client_name"
      yAxis="revenue"
      onBarClick={(client) => drillDown('client', client)}
    />
    
    <Chart
      title="Margin Trend"
      type="line"
      data={marginTrend}
      xAxis="period"
      yAxis="margin_pct"
      benchmark={25}
    />
    
    <Chart
      title="Campaign Profitability"
      type="scatter"
      data={campaignProfitability}
      xAxis="revenue"
      yAxis="margin_pct"
      sizeBy="duration_weeks"
      colorBy="client_name"
    />
    
    <Chart
      title="Utilization by Role"
      type="heatmap"
      data={utilizationByRole}
      xAxis="period"
      yAxis="role"
      valueAxis="utilization_pct"
    />
  </ChartsGrid>
  
  <AIInsights>
    <Card>
      <CardHeader>
        <CardTitle>🤖 AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Insight severity="info">
          "Creative team utilization dropped 8% this month - likely due to holiday seasonality."
        </Insight>
        <Insight severity="warning">
          "3 campaigns showing margin below 15% threshold. Finance review recommended."
        </Insight>
        <Insight severity="success">
          "Acme Corp revenue up 25% QoQ. Consider upsell opportunities."
        </Insight>
      </CardContent>
    </Card>
  </AIInsights>
</AnalyticsDashboard>
```

### Data Requirements

**APIs:**
```typescript
GET /api/agency/analytics/kpis
  ?period=2025-YTD

Response:
{
  total_revenue, ytd_margin, avg_utilization,
  top_client_name, top_client_revenue,
  revenue_growth, margin_vs_target
}

GET /api/agency/analytics/charts/:chart_name
  ?period=2025-YTD
  &group_by=client

Response (example: revenue_by_client):
{
  data: [ { client_name, revenue, campaign_count } ]
}
```

**Database Views:**
```sql
analytics.v_agency_kpis
analytics.v_revenue_by_client
analytics.v_margin_trend
analytics.v_campaign_profitability
analytics.v_utilization_by_role
```

---

## User Journeys

### Journey 1: Account Manager - Create Campaign with Budget

**Persona:** Sarah, Senior Account Manager  
**Goal:** Create new campaign and build client-facing budget

**Steps:**
1. Login → Navigate to `/agency/campaigns`
2. Click "+ New Campaign"
3. Fill form:
   - Client: Acme Corp
   - Brand: Brand X
   - Campaign Name: "Q1 2025 Launch"
   - Type: Brand Launch
   - Dates: Jan 1 - Mar 31, 2025
4. Navigate to "Budget" tab
5. Click "Use Template" → Select "Brand Launch Template"
6. Review pre-populated phases:
   - Strategy: Brand Strategist (10 days @ ₱28k = ₱280k)
   - Creative: CD, AD, CW roles
   - Production: Producer, Director
   - Post: Editor, Finisher
7. Adjust quantities as needed
8. See total: ₱5.2M (no cost/margin visible to AM)
9. Click "Ask AI" → "Are these rates reasonable for PH market?"
10. AI responds: "Yes, within industry standards..."
11. Click "Submit for Finance Approval"
12. Finance Director reviews, approves
13. Campaign status → "Active"

**Key Interactions:**
- Template-driven budget building
- AI rate validation (client-facing rates only)
- Finance approval workflow
- No vendor cost visibility

---

### Journey 2: Creative Director - Add Artifacts to Campaign

**Persona:** John, Creative Director  
**Goal:** Upload campaign brief and creative deck

**Steps:**
1. Navigate to `/agency/campaigns` → Select "Acme Q1 Launch"
2. Go to "Artifacts" tab
3. Click "+ New Artifact"
4. Select type: "Brief"
5. Fill form:
   - Title: "Acme Q1 Launch Brief v1"
   - Owner: John
   - Tags: brand-launch, tvc, digital
6. Use Notion-style editor to write brief:
   - Background
   - Objectives
   - Target Audience
   - Key Messages
   - Deliverables
7. Click "Save"
8. Artifact appears in campaign artifacts list
9. Later: Upload deck (PDF)
   - Type: "Deck"
   - Upload file → Stored in Supabase Storage
10. Click "Ask AI" → "Summarize this brief"
11. AI reads brief content, provides summary
12. Share summary with team via Slack (future)

**Key Interactions:**
- Notion-style artifact editing
- File uploads
- AI summarization
- Tagging and organization

---

### Journey 3: Finance Director - Review Campaign Profitability

**Persona:** Lisa, Finance Director  
**Goal:** Analyze campaign margins and flag at-risk projects

**Steps:**
1. Navigate to `/agency/analytics`
2. Set period: "Q4 2025"
3. Review KPIs:
   - YTD Margin: 22.3% (⚠️ Below 25% target)
4. Click "Campaign Profitability" chart
5. See scatter plot: Revenue vs Margin
6. Notice 3 campaigns below 15% margin line
7. Click on outlier: "RetailCo Holiday Campaign"
8. Drill down to campaign detail
9. Go to "Financials" tab (Finance-only)
10. Review budget vs actual:
    - Budget: ₱1.5M
    - Actual Cost: ₱1.4M
    - Revenue: ₱1.6M
    - Margin: 12.5% (🔴 Below threshold)
11. Click "Ask AI" → "Why is margin low on this campaign?"
12. AI analyzes:
    - "Scope creep detected: 30% more hours logged than budgeted"
    - "Recommendation: Review SOW with client for additional billing"
13. Lisa schedules meeting with Account Manager
14. Together, they draft change order for client

**Key Interactions:**
- Analytics drill-down
- Finance-only visibility
- AI root cause analysis
- Cross-functional collaboration

---

## Technical Requirements Summary

### Frontend Stack
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS (TBWA theme)
- **UI:** Shadcn/ui + custom agency components
- **Charts:** Recharts
- **Forms:** React Hook Form
- **State:** React Query + Zustand
- **Drag & Drop:** @dnd-kit/core (Kanban)

### Backend Stack
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth + RLS
- **Storage:** Supabase Storage (artifacts)
- **Functions:** Supabase Edge Functions (AI)
- **Vector:** pgvector (RAG embeddings)

### APIs Required (Summary)
```
/api/agency/dashboard/*       - Home KPIs, activity
/api/agency/clients/*          - Client 360, brands
/api/agency/campaigns/*        - Campaigns, CRUD
/api/agency/artifacts/*        - Artifact library
/api/agency/rate-cards/*       - Rate governance
/api/agency/budgets/*          - Budget templates
/api/agency/timesheets/*       - Time tracking
/api/agency/capacity/*         - Resource planning
/api/agency/analytics/*        - Charts, insights
/api/agency/ai/*               - AI assistant
```

### Color Palette (Agency Workroom)
- **Primary:** `#EC4899` (Pink - Creative)
- **Secondary:** `#8B5CF6` (Purple - Premium)
- **Accent:** `#F59E0B` (Amber - Energy)
- **Success:** `#10B981` (Green)
- **Warning:** `#F59E0B` (Amber)
- **Danger:** `#EF4444` (Red)

---

**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 - Data Model Design  
**Total Routes:** 8  
**Total Components:** 50+  
**Total APIs:** 30+  
**User Roles:** 4 (Account Manager, Creative, Finance, Leadership)