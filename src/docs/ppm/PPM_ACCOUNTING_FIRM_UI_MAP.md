# Finance PPM - Accounting Firm Portal - UI/UX Map

**Phase:** 1 - UI, Tabs, Routes & User Journeys  
**Date:** 2025-12-07

---

## Overview

This document defines the **complete UI/UX structure** for the Finance PPM Accounting Firm portal, modeled after Odoo's Accounting Firm package. It covers 10 main routes, 6 user roles, and the complete user journey from lead to cash.

**Design Philosophy:**
- **Odoo-inspired:** Clean, functional, data-dense interfaces
- **Role-aware:** Each role sees tailored dashboards and permissions
- **Integration-first:** Seamless links to Procure, T&E, Agency Workroom, Gearroom
- **NotebookLM AI:** AI assistant embedded throughout for context-aware help

**TBWA Theme:**
- **Primary Color:** `#D4AC0D` (Gold)
- **Background:** `#F2F7F2` (Light mint)
- **Text:** `#386641` (Dark green)
- **Icon:** 🧠 (Brain)

---

## Navigation Structure

### Top-Level App Launcher
Located in `/App.tsx` - Main application switcher

```tsx
[Rate Card Pro] [T&E] [Gearroom] [Procure] [Finance PPM] [Agency Workroom]
                                              ↑
                                        Click to enter
```

### Finance PPM Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [🧠 Finance PPM]  Search...           🔔 Notifications  👤  │ Header
├─────────────────────────────────────────────────────────────┤
│ Sidebar              │ Main Content Area                    │
│                      │                                       │
│ 📊 Dashboard         │  (Route-specific content)            │
│ 💼 CRM Pipeline      │                                       │
│ 🤝 Engagements       │                                       │
│ 📁 Projects          │                                       │
│ ⏱️ Timesheets        │                                       │
│ 💰 Billing           │                                       │
│ 📈 Accounting        │                                       │
│ 📄 Documents         │                                       │
│ 🤖 AI Assistant      │                                       │
│ ⚙️ Settings          │                                       │
│                      │                                       │
│ ─────────────        │                                       │
│ Recent Projects      │                                       │
│ • Q4 Budget          │                                       │
│ • Brand Refresh      │                                       │
└──────────────────────┴───────────────────────────────────────┘
```

---

## Route 1: Dashboard (`/ppm/dashboard`)

### Purpose
Role-based home screen with firm-wide or personal KPIs, activity feed, and quick actions.

### URL Pattern
- `/ppm/dashboard`
- Default landing page after login

### User Journey

**Partner/Finance Director:**
1. Lands on dashboard
2. Sees firm-wide metrics (all clients, all projects)
3. Reviews risk indicators (projects over budget, AR overdue)
4. Drills into problem areas (click engagement → detail)

**Account Manager:**
1. Lands on dashboard
2. Sees client-scoped metrics (my clients only)
3. Reviews pipeline (opportunities → engagements)
4. Checks WIP ready to invoice

**Project Manager:**
1. Lands on dashboard
2. Sees project-scoped metrics (assigned projects)
3. Reviews task completion, budget burn
4. Checks upcoming deadlines

**Staff Accountant:**
1. Lands on dashboard
2. Sees transaction-level metrics (invoices, payments)
3. Reviews AR aging, WIP summary
4. Processes pending invoices

### Components

#### Top KPI Cards (Role-Aware)

**Partner View:**
```tsx
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Active       │ Total WIP    │ Utilization  │ AR Aging     │
│ Engagements  │              │              │              │
│              │              │              │              │
│    47        │   ₱8.5M      │    78%       │   ₱2.3M      │
│ +3 this qtr  │ +12% vs LM   │ ▲ 2% MoM     │ 30+ days     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Account Manager View:**
```tsx
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ My Clients   │ My WIP       │ Win Rate     │ Upcoming     │
│              │              │              │ Invoices     │
│              │              │              │              │
│    12        │   ₱1.2M      │    65%       │      8       │
│ 2 active opp │ Ready to inv │ This quarter │ Due this wk  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Project Manager View:**
```tsx
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ My Projects  │ Tasks Due    │ Budget Burn  │ Team Hours   │
│              │ This Week    │              │              │
│              │              │              │              │
│     5        │     18       │    67%       │    142       │
│ 3 on track   │ 2 overdue    │ 3 mos in     │ This week    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Data Requirements
```sql
-- Partner KPIs
SELECT COUNT(*) AS active_engagements 
FROM finance_ppm.engagements 
WHERE status = 'active' AND tenant_id = ?

SELECT SUM(wip_amount) AS total_wip
FROM finance_ppm.v_wip_summary
WHERE tenant_id = ?

SELECT AVG(utilization_pct) AS avg_utilization
FROM finance_ppm.v_utilization_by_role
WHERE period_month = CURRENT_DATE - INTERVAL '1 month'

SELECT SUM(amount) AS ar_aging_30plus
FROM finance_ppm.v_ar_aging
WHERE age_bucket IN ('30-60','60-90','90+')
```

#### Charts & Visualizations

**Revenue Trend (Line Chart)**
```tsx
<RevenueChart 
  data={monthlyRevenue}  // Last 12 months
  metrics={['revenue', 'target', 'forecast']}
  height={200}
/>
```

**Profitability by Client (Bar Chart)**
```tsx
<ProfitabilityChart
  data={clientProfitability}  // Top 10 clients by margin
  sort="margin_pct"
  height={250}
/>
```

**Utilization Heatmap (Calendar)**
```tsx
<UtilizationHeatmap
  data={teamUtilization}  // By person, by week
  threshold={{ low: 60, target: 75, high: 90 }}
/>
```

#### Activity Feed

```tsx
<ActivityFeed>
  {activities.map(activity => (
    <ActivityItem>
      <Avatar user={activity.user} />
      <div>
        <strong>{activity.user_name}</strong> {activity.action}
        <a href={activity.link}>{activity.object_name}</a>
        <span className="text-gray-500">{activity.timestamp}</span>
      </div>
    </ActivityItem>
  ))}
</ActivityFeed>
```

**Examples:**
- "Sarah Chen **approved timesheet** for Week 48 - Project Alpha - 2 hours ago"
- "Mark Santos **created invoice** INV-2024-1234 for ₱125,000 - 5 hours ago"
- "System **flagged engagement** Acme Rebranding as **over budget** - 1 day ago"

#### Risk Indicators Panel

```tsx
<RiskPanel>
  <RiskCard severity="high">
    <AlertTriangle className="text-red-600" />
    <div>
      <h4>3 Projects Over Budget</h4>
      <p>Total variance: ₱450K</p>
      <Button variant="link">Review →</Button>
    </div>
  </RiskCard>
  
  <RiskCard severity="medium">
    <Clock className="text-yellow-600" />
    <div>
      <h4>5 Invoices Overdue 60+ Days</h4>
      <p>Total AR at risk: ₱780K</p>
      <Button variant="link">Collections →</Button>
    </div>
  </RiskCard>
</RiskPanel>
```

#### Quick Actions (Role-Based)

**Partner:**
- "View Portfolio Health Report"
- "Review Month-End Checklist"
- "Run Profitability Analysis"

**Account Manager:**
- "Create New Opportunity"
- "Generate Invoice from WIP"
- "Update Client Status"

**Project Manager:**
- "Enter Timesheet"
- "Create Task"
- "Update Project Status"

### Permissions Matrix

| Role | View Dashboard | View All Engagements | View Margins | Edit |
|------|----------------|----------------------|--------------|------|
| Partner | ✅ Full | ✅ All | ✅ Yes | ✅ All |
| Finance Director | ✅ Full | ✅ All | ✅ Yes | ✅ All |
| Account Manager | ✅ Scoped | ⚠️ My Clients | ❌ No | ⚠️ My Clients |
| Project Manager | ✅ Scoped | ⚠️ My Projects | ❌ No | ⚠️ My Projects |
| Staff Accountant | ✅ Limited | ✅ All | ⚠️ Cost Only | ⚠️ Invoices/Payments |
| Consultant | ✅ Minimal | ❌ No | ❌ No | ⚠️ My Tasks |

---

## Route 2: CRM Pipeline (`/ppm/crm-pipeline`)

### Purpose
Manage sales pipeline from lead capture → opportunity qualification → engagement conversion. Odoo CRM-style Kanban board.

### URL Pattern
- `/ppm/crm-pipeline`
- `/ppm/crm-pipeline/leads` (list view)
- `/ppm/crm-pipeline/opportunities` (Kanban view)
- `/ppm/crm-pipeline/lead/:id` (lead detail)
- `/ppm/crm-pipeline/opportunity/:id` (opportunity detail)

### User Journey

**Account Manager (Primary User):**
1. Receives lead (web form, referral, event)
2. Qualifies lead → creates opportunity
3. Sets probability, expected value, close date
4. Moves opportunity through stages (Kanban)
5. Logs activities (calls, meetings, proposals sent)
6. Wins opportunity → converts to engagement
7. Links engagement to Procure quote (budget)

### Components

#### Stage Kanban Board

```tsx
<KanbanBoard>
  <KanbanColumn stage="prospect" count={12}>
    {/* Drag-and-drop opportunity cards */}
  </KanbanColumn>
  
  <KanbanColumn stage="qualified" count={8}>
    {/* ... */}
  </KanbanColumn>
  
  <KanbanColumn stage="proposal" count={5}>
    {/* ... */}
  </KanbanColumn>
  
  <KanbanColumn stage="negotiation" count={3}>
    {/* ... */}
  </KanbanColumn>
  
  <KanbanColumn stage="won" count={15}>
    {/* ... */}
  </KanbanColumn>
  
  <KanbanColumn stage="lost" count={7}>
    {/* ... */}
  </KanbanColumn>
</KanbanBoard>
```

#### Opportunity Card

```tsx
<OpportunityCard>
  <div className="flex justify-between">
    <h4>Acme Corp - Brand Refresh</h4>
    <Badge>₱2.5M</Badge>
  </div>
  
  <div className="text-sm text-gray-600">
    <div>Probability: 60%</div>
    <div>Close Date: Jan 15, 2025</div>
    <div>Owner: Sarah Chen</div>
  </div>
  
  <Progress value={60} className="mt-2" />
  
  <div className="flex gap-2 mt-2">
    <Button size="sm" variant="outline">Call</Button>
    <Button size="sm" variant="outline">Email</Button>
  </div>
</OpportunityCard>
```

#### KPIs Bar

```tsx
<CrmKpis>
  <KpiCard>
    <label>Pipeline Value</label>
    <value>₱18.5M</value>
    <sublabel>Weighted: ₱9.2M</sublabel>
  </KpiCard>
  
  <KpiCard>
    <label>Win Rate</label>
    <value>65%</value>
    <sublabel>Last 6 months</sublabel>
  </KpiCard>
  
  <KpiCard>
    <label>Avg Deal Size</label>
    <value>₱1.8M</value>
    <sublabel>This quarter</sublabel>
  </KpiCard>
  
  <KpiCard>
    <label>Sales Cycle</label>
    <value>45 days</value>
    <sublabel>Median</sublabel>
  </KpiCard>
</CrmKpis>
```

#### Opportunity Detail View

**Tabs:**
- **Overview** - Summary, contact info, timeline
- **Activities** - Calls, meetings, emails (log & schedule)
- **Proposal** - Link to Procure quote
- **Documents** - Pitch decks, proposals, contracts
- **Notes** - Internal notes

**Fields:**
```tsx
<OpportunityDetail>
  <Section title="Basic Information">
    <Field label="Opportunity Name" value="Acme Corp - Brand Refresh" />
    <Field label="Client" value="Acme Corporation" />
    <Field label="Contact" value="John Doe (CEO)" />
    <Field label="Owner" value="Sarah Chen" />
  </Section>
  
  <Section title="Commercial">
    <Field label="Expected Value" value="₱2,500,000" editable />
    <Field label="Probability" value="60%" editable />
    <Field label="Expected Close" value="2025-01-15" editable />
    <Field label="Service Line" value="Creative" />
  </Section>
  
  <Section title="Qualification">
    <Field label="Budget Confirmed?" value={true} type="checkbox" />
    <Field label="Decision Maker?" value={true} type="checkbox" />
    <Field label="Timeline Defined?" value={false} type="checkbox" />
  </Section>
  
  <Section title="Actions">
    <Button variant="primary">Convert to Engagement</Button>
    <Button variant="outline">Link Procure Quote</Button>
    <Button variant="outline">Schedule Meeting</Button>
  </Section>
</OpportunityDetail>
```

#### Conversion Flow

```tsx
<ConvertToEngagementDialog>
  <p>Convert opportunity "Acme Corp - Brand Refresh" to engagement?</p>
  
  <Form>
    <SelectField 
      label="Link Procure Quote" 
      options={procureQuotes}
      help="Pre-fill budget from existing quote"
    />
    
    <TextField 
      label="Engagement Name" 
      defaultValue="Acme Corp - Brand Refresh 2025"
    />
    
    <SelectField 
      label="Engagement Type"
      options={['Project-based', 'Retainer', 'Time & Materials']}
    />
    
    <DateField label="Start Date" />
    <DateField label="End Date" />
    
    <Button type="submit">Create Engagement</Button>
  </Form>
</ConvertToEngagementDialog>
```

#### Data Sources

```sql
-- Kanban board data
SELECT 
  o.id,
  o.name,
  o.expected_value,
  o.probability,
  o.close_date,
  o.stage,
  o.owner_id,
  u.name AS owner_name
FROM crm.opportunities o
JOIN core.users u ON o.owner_id = u.id
WHERE o.tenant_id = ? 
  AND o.status = 'active'
ORDER BY o.stage_order, o.expected_value DESC;

-- Pipeline metrics
SELECT
  stage,
  COUNT(*) AS count,
  SUM(expected_value) AS total_value,
  SUM(expected_value * probability / 100) AS weighted_value
FROM crm.opportunities
WHERE tenant_id = ? AND status = 'active'
GROUP BY stage;

-- Win rate
SELECT 
  COUNT(*) FILTER (WHERE stage = 'won') AS won_count,
  COUNT(*) FILTER (WHERE stage IN ('won','lost')) AS total_closed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE stage = 'won') / 
    NULLIF(COUNT(*) FILTER (WHERE stage IN ('won','lost')), 0), 1) AS win_rate_pct
FROM crm.opportunities
WHERE tenant_id = ?
  AND close_date >= CURRENT_DATE - INTERVAL '6 months';
```

### Permissions

| Role | View Pipeline | Create Opportunity | Edit Any | Convert to Engagement |
|------|---------------|--------------------|---------|-----------------------|
| Partner | ✅ All | ✅ Yes | ✅ Yes | ✅ Yes |
| Finance Director | ✅ All | ❌ No | ❌ No | ❌ No |
| Account Manager | ⚠️ Own + Team | ✅ Yes | ⚠️ Own | ✅ Own |
| Project Manager | ❌ No | ❌ No | ❌ No | ❌ No |

---

## Route 3: Engagements (`/ppm/engagements`)

### Purpose
Manage client engagements (high-level contracts) that contain one or more projects. Track SOWs, billing schedules, overall engagement health.

### URL Pattern
- `/ppm/engagements` (list view)
- `/ppm/engagements/:id` (detail view with tabs)

### User Journey

**Account Manager:**
1. Views engagement list (my clients)
2. Filters by client, status, portfolio
3. Clicks engagement → detail view
4. Reviews scope, team, budget, projects
5. Uploads new SOW version
6. Creates new project under engagement
7. Checks billing schedule (retainer vs project)

**Partner:**
1. Views all engagements (firm-wide)
2. Sorts by profitability, revenue
3. Identifies at-risk engagements
4. Drills into engagement → projects → financials

### Components

#### Engagement List Table

```tsx
<EngagementTable>
  <TableHeader>
    <Column>Engagement</Column>
    <Column>Client</Column>
    <Column>Type</Column>
    <Column>Start Date</Column>
    <Column>Revenue YTD</Column>
    <Column>Margin %</Column>
    <Column>Status</Column>
    <Column>Actions</Column>
  </TableHeader>
  
  <TableRow>
    <Cell>
      <a href="/ppm/engagements/abc-123">Acme Brand Refresh 2025</a>
    </Cell>
    <Cell>Acme Corporation</Cell>
    <Cell>
      <Badge variant="blue">Project</Badge>
    </Cell>
    <Cell>Jan 1, 2025</Cell>
    <Cell>₱2,150,000</Cell>
    <Cell className={margin >= 20 ? 'text-green-600' : 'text-red-600'}>
      22.5%
    </Cell>
    <Cell>
      <Badge variant="green">Active</Badge>
    </Cell>
    <Cell>
      <DropdownMenu>
        <MenuItem>View Details</MenuItem>
        <MenuItem>Create Project</MenuItem>
        <MenuItem>Generate Invoice</MenuItem>
      </DropdownMenu>
    </Cell>
  </TableRow>
</EngagementTable>
```

#### Filters

```tsx
<FilterBar>
  <SelectFilter 
    label="Client" 
    options={clients} 
    multi
  />
  
  <SelectFilter 
    label="Status" 
    options={['Active','On Hold','Closed','Cancelled']}
    multi
  />
  
  <SelectFilter 
    label="Portfolio" 
    options={['Consumer Tech','Healthcare','Finance','FMCG']}
  />
  
  <SelectFilter 
    label="Service Line" 
    options={['Creative','Digital','Strategy','Production']}
  />
  
  <DateRangeFilter 
    label="Start Date" 
  />
  
  <NumberRangeFilter 
    label="Revenue" 
    min={0} 
    max={10000000}
  />
</FilterBar>
```

#### Engagement Detail - Overview Tab

```tsx
<EngagementOverview>
  <Grid cols={3}>
    {/* Left Column - Basic Info */}
    <Section title="Engagement Details">
      <Field label="Engagement Name" value="Acme Brand Refresh 2025" />
      <Field label="Client" value="Acme Corporation" />
      <Field label="Type" value="Project-based" />
      <Field label="Status" value="Active" badge />
      <Field label="Owner" value="Sarah Chen" avatar />
      <Field label="Start Date" value="2025-01-01" />
      <Field label="End Date" value="2025-12-31" />
    </Section>
    
    <Section title="Commercial">
      <Field label="Total Contract Value" value="₱5,000,000" />
      <Field label="Revenue YTD" value="₱2,150,000" />
      <Field label="Budget Remaining" value="₱2,850,000" />
      <Field label="Margin %" value="22.5%" highlight />
    </Section>
    
    {/* Middle Column - Projects */}
    <Section title="Projects" span={2}>
      <ProjectList>
        <ProjectCard>
          <h4>Phase 1: Discovery & Strategy</h4>
          <Progress value={100} />
          <span>Completed</span>
        </ProjectCard>
        
        <ProjectCard>
          <h4>Phase 2: Creative Development</h4>
          <Progress value={65} />
          <span>In Progress - 65%</span>
        </ProjectCard>
        
        <ProjectCard>
          <h4>Phase 3: Production & Launch</h4>
          <Progress value={0} />
          <span>Not Started</span>
        </ProjectCard>
      </ProjectList>
      
      <Button variant="outline" className="mt-4">
        + Add Project
      </Button>
    </Section>
  </Grid>
  
  {/* Bottom - Timeline */}
  <Section title="Engagement Timeline">
    <Timeline>
      <TimelineEvent date="2024-11-15" icon="✅">
        Opportunity won - converted to engagement
      </TimelineEvent>
      <TimelineEvent date="2024-12-01" icon="📄">
        SOW signed by client
      </TimelineEvent>
      <TimelineEvent date="2025-01-01" icon="🚀">
        Engagement started - Phase 1 kickoff
      </TimelineEvent>
      <TimelineEvent date="2025-03-15" icon="💰">
        First invoice issued - ₱1.25M
      </TimelineEvent>
      <TimelineEvent date="2025-06-30" icon="⏳" current>
        Phase 2 in progress
      </TimelineEvent>
    </Timeline>
  </Section>
</EngagementOverview>
```

#### Engagement Detail - Financials Tab

```tsx
<EngagementFinancials>
  {/* Summary Cards */}
  <Grid cols={4}>
    <MetricCard>
      <label>Contract Value</label>
      <value>₱5.0M</value>
    </MetricCard>
    
    <MetricCard>
      <label>Billed to Date</label>
      <value>₱2.15M</value>
      <sublabel>43% of contract</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Actual Cost</label>
      <value>₱1.67M</value>
      <sublabel role="partner">22.5% margin</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>WIP (Unbilled)</label>
      <value>₱325K</value>
      <sublabel>Ready to invoice</sublabel>
    </MetricCard>
  </Grid>
  
  {/* Budget vs Actual Chart */}
  <ChartSection title="Budget vs Actual (Monthly)">
    <BarChart 
      data={monthlyFinancials}
      series={['budget', 'actual', 'variance']}
      height={300}
    />
  </ChartSection>
  
  {/* Project Breakdown Table */}
  <TableSection title="Project Breakdown">
    <Table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Budget</th>
          <th>Actual Cost</th>
          <th>Revenue</th>
          <th>Margin %</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Phase 1: Discovery</td>
          <td>₱1.0M</td>
          <td className="text-red-600">₱1.1M</td>
          <td>₱1.25M</td>
          <td>12%</td>
          <td><Badge>Closed</Badge></td>
        </tr>
        <tr>
          <td>Phase 2: Creative</td>
          <td>₱2.5M</td>
          <td>₱1.6M</td>
          <td>₱2.0M</td>
          <td>20%</td>
          <td><Badge variant="blue">Active</Badge></td>
        </tr>
      </tbody>
    </Table>
  </TableSection>
</EngagementFinancials>
```

#### Engagement Detail - Documents Tab

```tsx
<EngagementDocuments>
  <Toolbar>
    <Button variant="primary">
      <Upload className="w-4 h-4 mr-2" />
      Upload Document
    </Button>
    
    <SelectFilter label="Type" options={['SOW','MSA','PO','Report','Deliverable']} />
    <SearchInput placeholder="Search documents..." />
  </Toolbar>
  
  <DocumentGrid>
    <DocumentCard>
      <FileIcon type="pdf" />
      <div>
        <h4>SOW - Acme Brand Refresh v2.pdf</h4>
        <p className="text-sm text-gray-600">
          Uploaded by Sarah Chen • Dec 1, 2024
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="green">Signed</Badge>
          <Badge variant="outline">Client Approved</Badge>
        </div>
      </div>
      <DropdownMenu>
        <MenuItem>Download</MenuItem>
        <MenuItem>View History</MenuItem>
        <MenuItem>Request Signature</MenuItem>
      </DropdownMenu>
    </DocumentCard>
    
    <DocumentCard>
      <FileIcon type="docx" />
      <div>
        <h4>Project Brief - Phase 2.docx</h4>
        <p className="text-sm text-gray-600">
          Uploaded by Mark Santos • Jan 15, 2025
        </p>
        <Badge variant="yellow">Draft</Badge>
      </div>
    </DocumentCard>
  </DocumentGrid>
</EngagementDocuments>
```

#### Engagement Detail - Team Tab

```tsx
<EngagementTeam>
  <TeamMemberList>
    <TeamMember>
      <Avatar user="Sarah Chen" />
      <div>
        <h4>Sarah Chen</h4>
        <p className="text-sm text-gray-600">Account Director</p>
      </div>
      <Badge>Owner</Badge>
      <div className="text-sm">
        120 hours • ₱180K billed
      </div>
    </TeamMember>
    
    <TeamMember>
      <Avatar user="Mark Santos" />
      <div>
        <h4>Mark Santos</h4>
        <p className="text-sm text-gray-600">Creative Director</p>
      </div>
      <div className="text-sm">
        85 hours • ₱127.5K billed
      </div>
    </TeamMember>
    
    <TeamMember>
      <Avatar user="Lisa Wong" />
      <div>
        <h4>Lisa Wong</h4>
        <p className="text-sm text-gray-600">Senior Designer</p>
      </div>
      <div className="text-sm">
        156 hours • ₱156K billed
      </div>
    </TeamMember>
  </TeamMemberList>
  
  <Button variant="outline">
    + Add Team Member
  </Button>
</EngagementTeam>
```

#### Data Sources

```sql
-- Engagement list
SELECT 
  e.id,
  e.engagement_name,
  e.client_name,
  e.type,
  e.start_date,
  e.status,
  SUM(pf.revenue) AS revenue_ytd,
  AVG(pf.margin_pct) AS avg_margin_pct
FROM finance_ppm.engagements e
LEFT JOIN finance_ppm.projects p ON e.id = p.engagement_id
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
WHERE e.tenant_id = ?
  AND (? = 'partner' OR e.owner_id = ?)  -- Role-based filter
GROUP BY e.id
ORDER BY revenue_ytd DESC;

-- Engagement detail with projects
SELECT 
  p.id,
  p.project_name,
  p.status,
  SUM(pf.budget_amount) AS total_budget,
  SUM(pf.actual_cost) AS total_cost,
  SUM(pf.revenue) AS total_revenue,
  AVG(pf.margin_pct) AS margin_pct
FROM finance_ppm.projects p
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
WHERE p.engagement_id = ?
GROUP BY p.id
ORDER BY p.created_at;
```

### Permissions

| Role | View Engagements | View Margin | Edit | Create Project | Upload Docs |
|------|------------------|-------------|------|----------------|-------------|
| Partner | ✅ All | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Finance Director | ✅ All | ✅ Yes | ⚠️ Financials Only | ❌ No | ❌ No |
| Account Manager | ⚠️ Own Clients | ❌ No | ⚠️ Own | ✅ Yes | ✅ Yes |
| Project Manager | ⚠️ Assigned | ❌ No | ⚠️ Projects Only | ❌ No | ✅ Yes |

---

## Route 4: Projects (`/ppm/projects/:id`)

### Purpose
Project workspace with tabs for tasks, timesheets, budget vs actual, risks, documents, invoices. The operational heart of project delivery.

### URL Pattern
- `/ppm/projects` (project list - similar to engagements)
- `/ppm/projects/:id` (project detail with tabs)

### Tabs Structure

```tsx
<ProjectTabs>
  <Tab id="overview">Overview</Tab>
  <Tab id="tasks">Tasks & Timeline</Tab>
  <Tab id="timesheets">Timesheets</Tab>
  <Tab id="budget">Budget vs Actual</Tab>
  <Tab id="risks">Risks & Issues</Tab>
  <Tab id="documents">Documents</Tab>
  <Tab id="invoices">Invoices</Tab>
</ProjectTabs>
```

### Tab 1: Overview

```tsx
<ProjectOverview>
  <Grid cols={3}>
    {/* Header with status */}
    <Section span={3}>
      <div className="flex justify-between items-start">
        <div>
          <h2>Phase 2: Creative Development</h2>
          <p className="text-gray-600">
            Engagement: Acme Brand Refresh 2025 • Client: Acme Corporation
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="blue">Active</Badge>
          <Button variant="outline">Edit Project</Button>
        </div>
      </div>
    </Section>
    
    {/* KPI Cards */}
    <MetricCard>
      <label>Budget</label>
      <value>₱2.5M</value>
      <Progress value={65} />
      <sublabel>₱1.6M spent (65%)</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Timeline</label>
      <value>4 months</value>
      <Progress value={50} />
      <sublabel>2 months remaining</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Team</label>
      <value>8 members</value>
      <AvatarGroup users={teamMembers} max={5} />
    </MetricCard>
    
    {/* Project Details */}
    <Section span={2} title="Project Information">
      <FieldGrid cols={2}>
        <Field label="Project Code" value="PRJ-2025-042" />
        <Field label="Owner" value="Mark Santos" avatar />
        <Field label="Start Date" value="Feb 1, 2025" />
        <Field label="End Date" value="May 31, 2025" />
        <Field label="Billing Type" value="Time & Materials" />
        <Field label="Service Line" value="Creative" />
      </FieldGrid>
    </Section>
    
    {/* Quick Stats */}
    <Section title="Status">
      <StatsList>
        <Stat label="Tasks Completed" value="24 / 40" pct={60} />
        <Stat label="Hours Logged" value="520 / 800" pct={65} />
        <Stat label="Invoiced" value="₱1.2M / ₱2.5M" pct={48} />
      </StatsList>
      
      <Alert variant="warning" className="mt-4">
        <AlertTriangle className="w-4 h-4" />
        <div>
          <strong>Budget Alert:</strong> On track to exceed budget by 8%
        </div>
      </Alert>
    </Section>
  </Grid>
</ProjectOverview>
```

### Tab 2: Tasks & Timeline

```tsx
<ProjectTasks>
  <Toolbar>
    <Button variant="primary">+ New Task</Button>
    <ViewToggle options={['List', 'Kanban', 'Gantt']} selected="List" />
    <SelectFilter label="Status" options={['All','To Do','In Progress','Done']} />
    <SelectFilter label="Assignee" options={teamMembers} />
  </Toolbar>
  
  {/* Task List */}
  <TaskTable>
    <TableHeader>
      <Column width="40%">Task</Column>
      <Column>Assignee</Column>
      <Column>Due Date</Column>
      <Column>Est. Hours</Column>
      <Column>Actual Hours</Column>
      <Column>Status</Column>
      <Column>Actions</Column>
    </TableHeader>
    
    <TaskRow priority="high">
      <Cell>
        <Checkbox />
        <span className="ml-2">Finalize brand color palette</span>
      </Cell>
      <Cell><Avatar user="Lisa Wong" size="sm" /></Cell>
      <Cell className="text-red-600">Dec 10 (overdue)</Cell>
      <Cell>16h</Cell>
      <Cell>18h</Cell>
      <Cell><Badge variant="yellow">In Progress</Badge></Cell>
      <Cell>
        <IconButton icon={<MoreVertical />} />
      </Cell>
    </TaskRow>
    
    <TaskRow>
      <Cell>
        <Checkbox />
        <span className="ml-2">Design logo variations</span>
      </Cell>
      <Cell><Avatar user="Mark Santos" size="sm" /></Cell>
      <Cell>Dec 15</Cell>
      <Cell>24h</Cell>
      <Cell>12h</Cell>
      <Cell><Badge variant="blue">In Progress</Badge></Cell>
      <Cell>
        <IconButton icon={<MoreVertical />} />
      </Cell>
    </TaskRow>
  </TaskTable>
  
  {/* Gantt Timeline (if view = 'Gantt') */}
  <GanttChart 
    tasks={tasks}
    startDate={projectStartDate}
    endDate={projectEndDate}
    height={400}
  />
</ProjectTasks>
```

### Tab 3: Timesheets

```tsx
<ProjectTimesheets>
  <Toolbar>
    <DateRangePicker label="Period" defaultValue="This Month" />
    <SelectFilter label="Team Member" options={teamMembers} />
    <SelectFilter label="Billable" options={['All','Billable','Non-Billable']} />
    <Button variant="outline">Export to CSV</Button>
  </Toolbar>
  
  {/* Summary Cards */}
  <Grid cols={4}>
    <MetricCard>
      <label>Total Hours</label>
      <value>520</value>
      <sublabel>This month</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Billable Hours</label>
      <value>468</value>
      <sublabel>90% billable</sublabel>
    </MetricCard>
    
    <MetricCard role="partner">
      <label>Cost</label>
      <value>₱780K</value>
      <sublabel>Internal cost</sublabel>
    </MetricCard>
    
    <MetricCard role="partner">
      <label>Billed Value</label>
      <value>₱1.17M</value>
      <sublabel>50% margin</sublabel>
    </MetricCard>
  </Grid>
  
  {/* Timesheet Table */}
  <TimesheetTable>
    <TableHeader>
      <Column>Date</Column>
      <Column>Team Member</Column>
      <Column>Task</Column>
      <Column>Hours</Column>
      <Column>Billable</Column>
      <Column role="partner">Cost Rate</Column>
      <Column role="partner">Bill Rate</Column>
      <Column>Status</Column>
    </TableHeader>
    
    <TimesheetRow>
      <Cell>Dec 5, 2024</Cell>
      <Cell><Avatar user="Lisa Wong" size="sm" /> Lisa Wong</Cell>
      <Cell>Brand color palette finalization</Cell>
      <Cell>8.0</Cell>
      <Cell><Badge variant="green">Yes</Badge></Cell>
      <Cell role="partner">₱1,000/hr</Cell>
      <Cell role="partner">₱2,500/hr</Cell>
      <Cell><Badge>Approved</Badge></Cell>
    </TimesheetRow>
    
    <TimesheetRow>
      <Cell>Dec 6, 2024</Cell>
      <Cell><Avatar user="Mark Santos" size="sm" /> Mark Santos</Cell>
      <Cell>Logo design - iteration 3</Cell>
      <Cell>6.5</Cell>
      <Cell><Badge variant="green">Yes</Badge></Cell>
      <Cell role="partner">₱1,500/hr</Cell>
      <Cell role="partner">₱3,500/hr</Cell>
      <Cell><Badge variant="yellow">Pending</Badge></Cell>
    </TimesheetRow>
  </TimesheetTable>
</ProjectTimesheets>
```

### Tab 4: Budget vs Actual

```tsx
<ProjectBudget>
  {/* Summary */}
  <Grid cols={5}>
    <MetricCard>
      <label>Budget</label>
      <value>₱2.5M</value>
    </MetricCard>
    
    <MetricCard>
      <label>Forecast</label>
      <value>₱2.7M</value>
      <sublabel className="text-red-600">+8% variance</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Actual Cost</label>
      <value>₱1.6M</value>
      <sublabel>65% of budget</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Remaining</label>
      <value>₱900K</value>
      <Progress value={35} variant="success" />
    </MetricCard>
    
    <MetricCard>
      <label>Burn Rate</label>
      <value>₱400K/mo</value>
      <sublabel>2.25 months left</sublabel>
    </MetricCard>
  </Grid>
  
  {/* Variance Chart */}
  <ChartSection title="Budget vs Actual by Month">
    <ComboChart 
      data={monthlyBudgetActual}
      bars={['budget', 'actual']}
      line="variance_pct"
      height={300}
    />
  </ChartSection>
  
  {/* Budget Lines Table */}
  <TableSection title="Budget Breakdown">
    <Table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Budget</th>
          <th>Actual</th>
          <th>Forecast</th>
          <th>Variance</th>
          <th>Variance %</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Labor - Creative</td>
          <td>₱1.5M</td>
          <td>₱980K</td>
          <td>₱1.62M</td>
          <td className="text-red-600">-₱120K</td>
          <td className="text-red-600">-8%</td>
        </tr>
        <tr>
          <td>Labor - Strategy</td>
          <td>₱600K</td>
          <td>₱400K</td>
          <td>₱580K</td>
          <td className="text-green-600">+₱20K</td>
          <td className="text-green-600">+3%</td>
        </tr>
        <tr>
          <td>Vendor - Photography</td>
          <td>₱300K</td>
          <td>₱180K</td>
          <td>₱300K</td>
          <td>₱0</td>
          <td>0%</td>
        </tr>
        <tr>
          <td>Production Costs</td>
          <td>₱100K</td>
          <td>₱40K</td>
          <td>₱100K</td>
          <td>₱0</td>
          <td>0%</td>
        </tr>
      </tbody>
    </Table>
  </TableSection>
</ProjectBudget>
```

### Data Sources

```sql
-- Project overview
SELECT 
  p.*,
  e.engagement_name,
  e.client_name,
  SUM(pf.budget_amount) AS total_budget,
  SUM(pf.actual_cost) AS total_cost,
  SUM(pf.revenue) AS total_revenue,
  AVG(pf.margin_pct) AS margin_pct,
  COUNT(t.id) AS total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') AS completed_tasks
FROM finance_ppm.projects p
JOIN finance_ppm.engagements e ON p.engagement_id = e.id
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
LEFT JOIN finance_ppm.tasks t ON p.id = t.project_id
WHERE p.id = ?
GROUP BY p.id, e.id;

-- Timesheets for project
SELECT 
  ts.id,
  ts.entry_date,
  ts.hours,
  ts.billable,
  ts.cost_rate,
  ts.bill_rate,
  ts.status,
  u.name AS employee_name,
  t.task_name
FROM finance_ppm.timesheet_entries ts
JOIN core.users u ON ts.employee_id = u.id
LEFT JOIN finance_ppm.tasks t ON ts.task_id = t.id
WHERE ts.project_id = ?
  AND ts.entry_date BETWEEN ? AND ?
ORDER BY ts.entry_date DESC, u.name;

-- Budget vs actual by month
SELECT 
  period_month,
  SUM(budget_amount) AS budget,
  SUM(actual_cost) AS actual,
  SUM(forecast_amount) AS forecast,
  SUM(variance_amount) AS variance,
  AVG(variance_pct) AS variance_pct
FROM finance_ppm.project_financials
WHERE project_id = ?
GROUP BY period_month
ORDER BY period_month;
```

---

## Route 5: Timesheets (`/ppm/timesheets`)

### Purpose
Personal timesheet entry interface (week view) + manager approval queue. Track billable hours for WIP calculation.

### URL Pattern
- `/ppm/timesheets` (personal timesheet)
- `/ppm/timesheets/approvals` (manager approval queue)
- `/ppm/timesheets/team` (team overview - managers only)

### User Journey

**Consultant/Creative (Timesheet Entry):**
1. Opens timesheet for current week
2. Sees grid: days × projects/tasks
3. Enters hours per day per task
4. Marks billable vs non-billable
5. Adds notes (optional)
6. Submits week for approval
7. Receives approval notification

**Project Manager (Approval):**
1. Opens approval queue
2. Sees pending timesheets from team
3. Reviews hours vs budget/task estimates
4. Approves or rejects with comments
5. Batch approve all valid entries

### Components

#### Personal Timesheet (Week View)

```tsx
<TimesheetWeekView>
  <WeekSelector>
    <Button variant="ghost" onClick={previousWeek}>
      <ChevronLeft />
    </Button>
    <span>Week of Dec 2 - Dec 8, 2024</span>
    <Button variant="ghost" onClick={nextWeek}>
      <ChevronRight />
    </Button>
    <Button variant="outline" onClick={selectToday}>
      Today
    </Button>
  </WeekSelector>
  
  {/* Summary Bar */}
  <SummaryBar>
    <Metric label="Total Hours" value="42.5" />
    <Metric label="Billable" value="38.0" />
    <Metric label="Non-Billable" value="4.5" />
    <Metric label="Status" value={
      <Badge variant={isSubmitted ? 'green' : 'yellow'}>
        {isSubmitted ? 'Submitted' : 'Draft'}
      </Badge>
    } />
  </SummaryBar>
  
  {/* Timesheet Grid */}
  <TimesheetGrid>
    <table>
      <thead>
        <tr>
          <th className="w-1/4">Project / Task</th>
          <th>Mon 12/2</th>
          <th>Tue 12/3</th>
          <th>Wed 12/4</th>
          <th>Thu 12/5</th>
          <th>Fri 12/6</th>
          <th>Sat 12/7</th>
          <th>Sun 12/8</th>
          <th>Total</th>
          <th>Bill?</th>
        </tr>
      </thead>
      <tbody>
        {/* Project row */}
        <tr className="bg-gray-50">
          <td colSpan={10}>
            <strong>Acme Brand Refresh - Phase 2</strong>
          </td>
        </tr>
        
        {/* Task rows */}
        <tr>
          <td className="pl-8">Brand color palette</td>
          <td><Input type="number" step="0.5" value={8} /></td>
          <td><Input type="number" step="0.5" value={7.5} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={2.5} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td className="font-bold">18.0</td>
          <td><Checkbox checked /></td>
        </tr>
        
        <tr>
          <td className="pl-8">Logo design iterations</td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={8} /></td>
          <td><Input type="number" step="0.5" value={6.5} /></td>
          <td><Input type="number" step="0.5" value={5.5} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td className="font-bold">20.0</td>
          <td><Checkbox checked /></td>
        </tr>
        
        {/* Another project */}
        <tr className="bg-gray-50">
          <td colSpan={10}>
            <strong>Internal - Team Meeting</strong>
          </td>
        </tr>
        
        <tr>
          <td className="pl-8">Weekly standup</td>
          <td><Input type="number" step="0.5" value={0.5} /></td>
          <td><Input type="number" step="0.5" value={0.5} /></td>
          <td><Input type="number" step="0.5" value={0.5} /></td>
          <td><Input type="number" step="0.5" value={0.5} /></td>
          <td><Input type="number" step="0.5" value={0.5} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td><Input type="number" step="0.5" value={0} /></td>
          <td className="font-bold">2.5</td>
          <td><Checkbox /></td>
        </tr>
        
        {/* Add row button */}
        <tr>
          <td colSpan={10}>
            <Button variant="ghost" size="sm" onClick={addRow}>
              + Add Task
            </Button>
          </td>
        </tr>
        
        {/* Totals row */}
        <tr className="border-t-2 font-bold">
          <td>Daily Totals</td>
          <td>8.5</td>
          <td>8.0</td>
          <td>8.5</td>
          <td>7.0</td>
          <td>8.5</td>
          <td>0</td>
          <td>0</td>
          <td>40.5</td>
          <td>-</td>
        </tr>
      </tbody>
    </table>
  </TimesheetGrid>
  
  {/* Actions */}
  <div className="flex justify-between mt-4">
    <div className="flex gap-2">
      <Button variant="outline">Copy Previous Week</Button>
      <Button variant="outline">Save Draft</Button>
    </div>
    
    <Button variant="primary" onClick={submitTimesheet}>
      Submit for Approval
    </Button>
  </div>
</TimesheetWeekView>
```

#### Manager Approval Queue

```tsx
<TimesheetApprovals>
  <Toolbar>
    <SelectFilter label="Employee" options={teamMembers} />
    <SelectFilter label="Week" options={recentWeeks} />
    <SelectFilter label="Status" options={['Pending','Approved','Rejected']} />
    <Button variant="outline">Batch Approve All</Button>
  </Toolbar>
  
  {/* Pending timesheets grouped by employee */}
  <ApprovalList>
    {employees.map(employee => (
      <EmployeeTimesheetCard key={employee.id}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={employee} size="lg" />
            <div>
              <h4>{employee.name}</h4>
              <p className="text-sm text-gray-600">Week of Dec 2-8, 2024</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => reject(employee.timesheetId)}>
              Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => approve(employee.timesheetId)}>
              Approve
            </Button>
          </div>
        </div>
        
        {/* Summary */}
        <Grid cols={4} className="mb-4">
          <MetricCard size="sm">
            <label>Total Hours</label>
            <value>40.5</value>
          </MetricCard>
          <MetricCard size="sm">
            <label>Billable</label>
            <value>38.0</value>
          </MetricCard>
          <MetricCard size="sm">
            <label>Projects</label>
            <value>3</value>
          </MetricCard>
          <MetricCard size="sm">
            <label>Cost</label>
            <value>₱60,750</value>
          </MetricCard>
        </Grid>
        
        {/* Hour breakdown */}
        <Table size="sm">
          <thead>
            <tr>
              <th>Project / Task</th>
              <th>Hours</th>
              <th>Billable</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Acme Brand Refresh - Color palette</td>
              <td>18.0</td>
              <td><Badge variant="green">Yes</Badge></td>
              <td className="text-sm text-gray-600">Final approval pending</td>
            </tr>
            <tr>
              <td>Acme Brand Refresh - Logo design</td>
              <td>20.0</td>
              <td><Badge variant="green">Yes</Badge></td>
              <td>-</td>
            </tr>
            <tr>
              <td>Internal - Team meetings</td>
              <td>2.5</td>
              <td><Badge variant="gray">No</Badge></td>
              <td>-</td>
            </tr>
          </tbody>
        </Table>
      </EmployeeTimesheetCard>
    ))}
  </ApprovalList>
</TimesheetApprovals>
```

#### Team Overview (Managers)

```tsx
<TimesheetTeamOverview>
  <DateRangePicker defaultValue="This Month" />
  
  {/* Team utilization summary */}
  <Grid cols={4}>
    <MetricCard>
      <label>Team Hours</label>
      <value>1,240</value>
      <sublabel>This month</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Avg Utilization</label>
      <value>78%</value>
      <sublabel>Target: 75%</sublabel>
    </MetricCard>
    
    <MetricCard>
      <label>Billable %</label>
      <value>92%</value>
      <sublabel>Excellent</sublabel>
    </MetricCard>
    
    <MetricCard role="partner">
      <label>Billed Value</label>
      <value>₱3.1M</value>
      <sublabel>This month</sublabel>
    </MetricCard>
  </Grid>
  
  {/* By person table */}
  <Table>
    <thead>
      <tr>
        <th>Team Member</th>
        <th>Role</th>
        <th>Total Hours</th>
        <th>Billable Hours</th>
        <th>Utilization %</th>
        <th>Projects</th>
        <th role="partner">Billed Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><Avatar user="Lisa Wong" size="sm" /> Lisa Wong</td>
        <td>Senior Designer</td>
        <td>156</td>
        <td>148</td>
        <td className="text-green-600">82%</td>
        <td>4</td>
        <td role="partner">₱444K</td>
      </tr>
      <tr>
        <td><Avatar user="Mark Santos" size="sm" /> Mark Santos</td>
        <td>Creative Director</td>
        <td>142</td>
        <td>128</td>
        <td className="text-green-600">79%</td>
        <td>6</td>
        <td role="partner">₱568K</td>
      </tr>
      {/* More rows... */}
    </tbody>
  </Table>
</TimesheetTeamOverview>
```

### Data Sources

```sql
-- Personal timesheet for week
SELECT 
  ts.id,
  ts.entry_date,
  ts.hours,
  ts.billable,
  ts.notes,
  ts.status,
  p.project_name,
  t.task_name
FROM finance_ppm.timesheet_entries ts
JOIN finance_ppm.projects p ON ts.project_id = p.id
LEFT JOIN finance_ppm.tasks t ON ts.task_id = t.id
WHERE ts.employee_id = ?
  AND ts.week_start_date = ?
ORDER BY p.project_name, t.task_name;

-- Approval queue for manager
SELECT 
  u.id AS employee_id,
  u.name AS employee_name,
  ts.week_start_date,
  ts.status,
  SUM(ts.hours) AS total_hours,
  SUM(ts.hours) FILTER (WHERE ts.billable = true) AS billable_hours,
  SUM(ts.hours * ts.cost_rate) AS total_cost
FROM finance_ppm.timesheet_entries ts
JOIN core.users u ON ts.employee_id = u.id
JOIN finance_ppm.projects p ON ts.project_id = p.id
WHERE p.owner_id = ?  -- Manager's projects
  AND ts.status = 'submitted'
GROUP BY u.id, u.name, ts.week_start_date
ORDER BY ts.week_start_date DESC;

-- Team utilization
SELECT 
  u.id,
  u.name,
  u.role,
  SUM(ts.hours) AS total_hours,
  SUM(ts.hours) FILTER (WHERE ts.billable = true) AS billable_hours,
  ROUND(100.0 * SUM(ts.hours) / 160, 1) AS utilization_pct,  -- 160 = monthly capacity
  COUNT(DISTINCT ts.project_id) AS project_count,
  SUM(ts.hours * ts.bill_rate) AS billed_value
FROM core.users u
LEFT JOIN finance_ppm.timesheet_entries ts 
  ON u.id = ts.employee_id 
  AND ts.entry_date BETWEEN ? AND ?
WHERE u.tenant_id = ?
  AND u.role IN ('creative', 'consultant', 'designer')
GROUP BY u.id, u.name, u.role
ORDER BY utilization_pct DESC;
```

### Permissions

| Role | Enter Own Timesheet | View Team | Approve | View Cost/Bill Rates |
|------|---------------------|-----------|---------|----------------------|
| Partner | ✅ Yes | ✅ All | ✅ Yes | ✅ Yes |
| Finance Director | ❌ No | ✅ All | ❌ No | ✅ Yes |
| Account Manager | ✅ Yes | ⚠️ Own Clients | ⚠️ Own Projects | ❌ No |
| Project Manager | ✅ Yes | ⚠️ Assigned Projects | ✅ Assigned | ❌ No |
| Consultant | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

**[Document continues with Routes 6-10...]**

*Due to length limits, I'll continue in the next response. Let me know if you'd like me to complete the remaining routes:*

- Route 6: Billing (WIP & Invoicing)
- Route 7: Accounting (AR/AP)
- Route 8: Documents
- Route 9: AI Assistant
- Route 10: Settings

Should I continue? 🚀
