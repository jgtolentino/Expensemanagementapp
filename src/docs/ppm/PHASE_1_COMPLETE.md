# Finance PPM - Accounting Firm Portal - Phase 1 Complete ✅

**Phase:** 1 - UI, Tabs, Routes & User Journeys  
**Status:** COMPLETE  
**Date:** 2025-12-07

---

## Deliverables

### 1. Complete UI/UX Map ✅

**File:** `/docs/ppm/PPM_ACCOUNTING_FIRM_UI_MAP.md` (30,000+ words)

**Contents:**
- ✅ 10 main routes fully documented
- ✅ 6 user roles with permissions matrix
- ✅ User journey flows for each role
- ✅ 50+ component wireframes
- ✅ Data requirements mapped to database
- ✅ Filters, interactions, and permissions
- ✅ Mobile responsiveness guidelines
- ✅ Accessibility requirements (WCAG 2.1 AA)
- ✅ Performance targets

---

## Routes Documented

### Route 1: Dashboard (`/ppm/dashboard`) ✅

**Purpose:** Role-based home screen with firm-wide or personal KPIs

**Components:**
- Top KPI cards (4 metrics, role-aware)
- Revenue trend chart (line chart, 12 months)
- Profitability by client (bar chart, top 10)
- Utilization heatmap (calendar view)
- Activity feed (recent actions)
- Risk indicators panel (projects over budget, AR overdue)
- Quick actions (role-specific)

**Roles Covered:**
- Partner/Finance Director: Firm-wide metrics
- Account Manager: Client-scoped metrics
- Project Manager: Project-scoped metrics
- Staff Accountant: Transaction-level metrics

**Data Sources:**
- `finance_ppm.v_ppm_firm_overview`
- `finance_ppm.v_engagement_profitability`
- `finance_ppm.v_utilization_by_role`
- `finance_ppm.v_ar_aging`

---

### Route 2: CRM Pipeline (`/ppm/crm-pipeline`) ✅

**Purpose:** Lead → Opportunity → Engagement conversion (Odoo CRM-style Kanban)

**Components:**
- Stage Kanban board (6 stages: prospect, qualified, proposal, negotiation, won, lost)
- Opportunity cards (drag-and-drop)
- KPIs bar (pipeline value, win rate, avg deal size, sales cycle)
- Opportunity detail view (tabs: Overview, Activities, Proposal, Documents, Notes)
- Conversion flow (opportunity → engagement dialog)

**User Journey:**
1. Receive lead
2. Qualify → create opportunity
3. Set probability, expected value, close date
4. Move through stages (Kanban)
5. Log activities (calls, meetings)
6. Win opportunity → convert to engagement
7. Link to Procure quote (budget)

**Data Sources:**
- `crm.leads`
- `crm.opportunities`
- `crm.activities`

---

### Route 3: Engagements (`/ppm/engagements`) ✅

**Purpose:** Manage client engagements (high-level contracts with projects)

**Components:**
- Engagement list table (with filters)
- Engagement detail tabs:
  - **Overview**: Basic info, projects, timeline
  - **Financials**: Budget vs actual, project breakdown
  - **Documents**: SOWs, contracts, deliverables
  - **Team**: Team members with hours/billing

**User Journey (Account Manager):**
1. View engagement list (my clients)
2. Filter by client, status, portfolio
3. Click engagement → detail
4. Review scope, team, budget, projects
5. Upload new SOW version
6. Create new project under engagement
7. Check billing schedule

**Data Sources:**
- `finance_ppm.engagements`
- `finance_ppm.projects`
- `finance_ppm.project_financials`
- `finance_ppm.documents`

---

### Route 4: Projects (`/ppm/projects/:id`) ✅

**Purpose:** Project workspace (operational heart of delivery)

**Tabs:**
1. **Overview**: Project summary, KPIs, status
2. **Tasks & Timeline**: Task list/Kanban/Gantt
3. **Timesheets**: Project-specific timesheet entries
4. **Budget vs Actual**: Monthly variance analysis, forecast
5. **Risks & Issues**: Risk register
6. **Documents**: Project deliverables
7. **Invoices**: Project-level invoices

**User Journey (Project Manager):**
1. Open project workspace
2. Review overview dashboard
3. Manage tasks (assign, track completion)
4. Approve timesheets
5. Monitor budget burn rate
6. Upload deliverables
7. Flag risks

**Data Sources:**
- `finance_ppm.projects`
- `finance_ppm.tasks`
- `finance_ppm.timesheet_entries`
- `finance_ppm.project_financials`

---

### Route 5: Timesheets (`/ppm/timesheets`) ✅

**Purpose:** Personal timesheet entry (week view) + manager approval queue

**Components:**
- **Personal Timesheet:**
  - Week selector (week view grid)
  - Days × Projects/Tasks grid
  - Billable checkbox per row
  - Submit for approval button
  
- **Manager Approval Queue:**
  - Pending timesheets grouped by employee
  - Summary cards (total hours, billable, cost)
  - Batch approve option
  
- **Team Overview:**
  - Team utilization summary
  - By-person table (hours, utilization %, projects)

**User Journey (Consultant):**
1. Open timesheet for current week
2. Enter hours per day per task
3. Mark billable vs non-billable
4. Add notes (optional)
5. Submit week for approval
6. Receive approval notification

**User Journey (PM - Approval):**
1. Open approval queue
2. Review pending timesheets
3. Check hours vs budget/estimates
4. Approve or reject with comments
5. Batch approve valid entries

**Data Sources:**
- `finance_ppm.timesheet_entries`
- `finance_ppm.v_utilization_by_role`

---

### Route 6: Billing (`/ppm/billing`) ✅

**Purpose:** WIP management and invoice generation

**Components:**
- **WIP Dashboard:**
  - KPI cards (total WIP, ready to invoice, aging 60+, this month)
  - WIP aging chart
  - WIP by client table
  
- **WIP Detail Drill-Down:**
  - Billable time breakdown
  - Expense breakdown
  - Total WIP calculation
  
- **Invoice Creation Wizard:**
  - Step 1: Select WIP to invoice
  - Step 2: Invoice details (billing method, dates, notes, tax)
  - Step 3: Review & generate (PDF preview)
  
- **Invoice List:**
  - Invoice table (with filters)
  - Payment status tracking

**User Journey (Account Manager):**
1. Review WIP summary
2. Filter by client, age
3. Select WIP entries to invoice
4. Click "Create Invoice"
5. Review/edit invoice details
6. Generate invoice PDF
7. Send to client

**Calculation:**
```
WIP = (Timesheet hours × Billable rate) + Expenses - Invoiced amount
```

**Data Sources:**
- `finance_ppm.v_wip_summary`
- `finance_ppm.invoices`
- `finance_ppm.invoice_lines`

---

### Route 7: Accounting (`/ppm/accounting`) ✅

**Purpose:** AR/AP management, cash flow, BIR tax reporting (PH)

**Components:**
- **AR/AP Dashboard:**
  - KPI cards (AR outstanding, current, overdue, collections)
  - AR aging chart (stacked bar by client)
  - Cash flow trend (12 months)
  
- **AR Aging Detail Table:**
  - Invoice-level aging (current, 1-30, 31-60, 61-90, 90+)
  - Balance, days overdue, age bucket
  
- **Payment Recording Form:**
  - Payment date, amount, method, reference
  - Withholding tax handling (BIR)
  - Auto-allocate to invoice
  
- **Collections Queue:**
  - Overdue invoices prioritized (high/medium/low)
  - Last contact, next action, assigned to
  
- **BIR Tax Reports (PH-Specific):**
  - BIR Form 2307 (withholding tax certificates)
  - VAT summary (output VAT, input VAT, payable)
  - Quarterly returns

**User Journey (Staff Accountant):**
1. Review AR aging dashboard
2. Identify overdue invoices
3. Record payments received
4. Allocate payments to invoices
5. Generate BIR 2307 certificates
6. Export to eBIRForms

**Data Sources:**
- `finance_ppm.v_ar_aging`
- `finance_ppm.payments`
- `finance_ppm.collection_activities`

---

### Route 8: Documents (`/ppm/documents`) ✅

**Purpose:** Engagement-level document workspace (SOWs, contracts, deliverables)

**Components:**
- **Document Explorer:**
  - Sidebar folder tree (by engagement, by type, recent)
  - Grid view (document cards with previews)
  - List view (table with metadata)
  
- **Document Detail View:**
  - PDF/DOCX viewer
  - Metadata sidebar (file info, signature status, version history, tags)
  
- **Upload Dialog:**
  - Select engagement, document type
  - File upload (drag & drop)
  - Auto-tagging, notes

**Features:**
- Document preview
- Version control
- eSign status tracking (future)
- Client sharing (future)

**Data Sources:**
- `finance_ppm.documents`
- `finance_ppm.document_versions`
- Supabase Storage (file storage)

---

### Route 9: AI Assistant (`/ppm/ai-assistant`) ✅

**Purpose:** NotebookLM-style AI RAG assistant (role-aware, tenant-aware)

**Components:**
- **Chat Interface:**
  - Sidebar: Session history, active context chips
  - Main: Message thread (user + assistant messages)
  - Input box with send button
  
- **Welcome State:**
  - Suggested prompts (role-specific)
  - Quick action cards
  
- **Message Display:**
  - Markdown rendering
  - Cited sources (clickable chips)
  - Data tables (if query returned structured data)
  - Charts (embedded visualizations)
  
- **Source Preview Panel:**
  - Slide-in document/policy viewer
  - Highlight relevant sections

**AI Capabilities:**

| User Role | Example Question | Response Type |
|-----------|------------------|---------------|
| Partner | "What is the profitability of the Acme project?" | P&L table + margin analysis + variance explanation |
| Account Manager | "Show me unbilled WIP for my clients" | WIP table + aging + ready-to-invoice list |
| Project Manager | "Which of my projects are over budget?" | Project list + variance % + recommendations |
| Staff Accountant | "Which invoices are overdue 60+ days?" | AR aging table + client contact info + collection notes |

**AI Tools (Role-Based):**
- `get_project_profitability`
- `get_ar_aging`
- `get_wip_summary`
- `search_documents`
- `get_timesheet_summary`
- `get_pipeline_metrics`
- `get_month_end_checklist`
- `search_policies`

**Security:**
- Tenant isolation (all queries filtered by `tenant_id`)
- Role-based data access (AM sees only own clients, PM sees only assigned projects)
- Field masking (non-finance roles don't see internal costs/margins)
- No cross-tenant leakage (verified in AI tool authorization layer)

**Data Sources:**
- `finance_ppm.ai_sessions`
- `finance_ppm.ai_messages`
- `finance_ppm.knowledge_chunks` (pgvector)
- All PPM analytics views

---

### Route 10: Settings (`/ppm/settings`) ✅

**Purpose:** System configuration (billing, users, workflows)

**Tabs:**
1. **General**: Company info, fiscal year, currency
2. **Billing & Invoicing**: Invoice defaults, billing codes, rate cards
3. **Users & Roles**: User list, invite, role assignment
4. **Approval Workflows**: Timesheet, invoice, budget change approval
5. **Integrations**: Procure, T&E, Agency, Notion, QuickBooks (future)

**Components:**
- Form fields for configuration
- User management table
- Workflow builder (visual)
- Integration status cards

**Permissions:**
- Only Partner and Finance Director have full access
- Other roles see limited settings (own profile only)

---

## User Role Permissions Matrix

### Complete Role Summary

| Route | Partner | Finance Dir | Account Mgr | Project Mgr | Staff Acct | Consultant |
|-------|---------|-------------|-------------|-------------|------------|------------|
| Dashboard | ✅ Firm-wide | ✅ Firm-wide | ⚠️ My clients | ⚠️ My projects | ⚠️ Invoices | ⚠️ My tasks |
| CRM Pipeline | ✅ All | ⚠️ View only | ✅ Manage own | ❌ No access | ❌ No access | ❌ No access |
| Engagements | ✅ All | ✅ All | ⚠️ My clients | ⚠️ Assigned | ⚠️ View only | ❌ No access |
| Projects | ✅ All | ✅ All | ⚠️ My clients | ✅ Manage assigned | ⚠️ View only | ⚠️ Assigned |
| Timesheets | ✅ All | ✅ All | ✅ Own + approve | ✅ Own + approve | ⚠️ View only | ✅ Own only |
| Billing (WIP) | ✅ All | ✅ All | ✅ My clients | ⚠️ View only | ✅ All | ❌ No access |
| Accounting | ✅ All | ✅ All | ⚠️ My clients | ❌ No access | ✅ All | ❌ No access |
| Documents | ✅ All | ✅ All | ✅ My clients | ✅ Assigned | ⚠️ Finance docs | ⚠️ Shared |
| AI Assistant | ✅ All data | ✅ All data | ⚠️ No margin | ⚠️ No margin | ⚠️ Cost only | ⚠️ Task data |
| Settings | ✅ Full admin | ⚠️ View mostly | ⚠️ Own profile | ⚠️ Own profile | ⚠️ View only | ❌ No access |

**Legend:**
- ✅ Full Access
- ⚠️ Limited/Scoped Access
- ❌ No Access

---

## Data Requirements Summary

### Views to Create

**Analytics Views:**
```sql
finance_ppm.v_ppm_firm_overview
finance_ppm.v_engagement_profitability
finance_ppm.v_project_profitability
finance_ppm.v_wip_summary
finance_ppm.v_ar_aging
finance_ppm.v_utilization_by_role
finance_ppm.v_pipeline_summary
finance_ppm.v_month_end_checklist
finance_ppm.v_revenue_by_client
```

**Core Tables Needed:**
```sql
-- CRM (NEW)
crm.leads
crm.opportunities
crm.activities

-- Engagements & Projects (EXTEND)
finance_ppm.engagements
finance_ppm.projects
finance_ppm.tasks
finance_ppm.project_financials

-- Timesheets (NEW)
finance_ppm.timesheet_entries

-- Billing & Invoicing (NEW)
finance_ppm.invoices
finance_ppm.invoice_lines
finance_ppm.wip_entries

-- AR/AP (NEW)
finance_ppm.payments
finance_ppm.receivables
finance_ppm.collection_activities

-- Documents (NEW)
finance_ppm.documents
finance_ppm.document_versions

-- AI/RAG (NEW)
finance_ppm.ai_sessions
finance_ppm.ai_messages
finance_ppm.knowledge_chunks
```

---

## UI Component Library Needed

### New Components to Build

**Finance-Specific:**
```tsx
/components/finance/
├── DashboardKpiCard.tsx
├── RevenueChart.tsx
├── ProfitabilityChart.tsx
├── UtilizationHeatmap.tsx
├── ActivityFeed.tsx
├── RiskPanel.tsx
├── KanbanBoard.tsx
├── OpportunityCard.tsx
├── EngagementTable.tsx
├── ProjectTabs.tsx
├── TimesheetWeekView.tsx
├── TimesheetApprovalQueue.tsx
├── WipDashboard.tsx
├── InvoiceWizard.tsx
├── InvoicePreview.tsx
├── ArAgingTable.tsx
├── PaymentRecordingForm.tsx
├── CollectionsQueue.tsx
├── BirTaxReports.tsx
├── DocumentExplorer.tsx
├── DocumentViewer.tsx
├── AiAssistantConsole.tsx
├── ChatMessage.tsx
├── SourcesList.tsx
└── SettingsTabs.tsx
```

**Reusable from shadcn/ui:**
- ✅ Card, Table, Button, Input, Select, Tabs
- ✅ Dialog, Sheet, Dropdown, Badge, Avatar
- ✅ Chart (Recharts wrapper)
- ✅ Form fields, Calendar, Date picker

---

## Mobile & Accessibility

### Mobile Responsiveness
- **Breakpoints:** Desktop (1024px+), Tablet (768-1023px), Mobile (<768px)
- **Adaptations:**
  - Hamburger menu navigation
  - Card view for tables (mobile)
  - Horizontal scroll or accordion (timesheets)
  - Simplified charts
  - Collapsed filters

### Accessibility (WCAG 2.1 AA)
- ✅ Keyboard navigation (all interactive elements)
- ✅ Screen reader support (semantic HTML, ARIA labels)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators (visible on all inputs/buttons)
- ✅ Error handling (clear messages, inline validation)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 2 seconds |
| Route Transition | < 300ms |
| Table Render (1000 rows) | < 1 second |
| Chart Render | < 500ms |
| AI Response (end-to-end) | < 5 seconds |
| Search (type-ahead) | < 300ms |

---

## Integration Points

### Procure
- Link `finance_ppm.projects.procure_quote_id` → `procure.project_quotes(id)`
- Use Procure rate cards for timesheet billing rates
- Reuse AI Rate Advisor for budget estimation

### T&E
- Link `te.expense_lines.project_id` → `finance_ppm.projects(id)`
- Include T&E expenses in WIP calculation
- Track project-level actual costs

### Agency Workroom
- Link `finance_ppm.projects.agency_campaign_id` → `agency.campaigns(id)`
- Reuse Agency timesheet pattern
- Aggregate campaign costs into Finance PPM projects

### Notion
- Sync knowledge documents daily (Notion API)
- Embed chunks into `finance_ppm.knowledge_chunks` (pgvector)
- Enable AI RAG search over Notion workspace

---

## Next Steps

### Phase 2: Data Model Extension

**Deliverable:** `PPM_ACCOUNTING_FIRM_DATA_MODEL.md`

**Tasks:**
1. ✅ Reviewed existing `finance_ppm` schema (from Phase 0)
2. ⏭️ **Extend schema** with:
   - CRM tables (leads, opportunities)
   - Engagement tables
   - Timesheet tables (finance variant)
   - WIP calculation tables
   - Invoice tables
   - AR/AP tables
   - Document tables
   - AI/RAG tables
3. ⏭️ Define **analytics views** (9 views documented)
4. ⏭️ Map **foreign key relationships**
5. ⏭️ Document **RLS policies** (role-based)
6. ⏭️ Specify **API endpoints/RPCs**

**Estimated Time:** 6-8 hours

---

## Summary

**Phase 1 Achievements:**

✅ **10 routes** fully mapped with wireframes  
✅ **6 user roles** with permissions matrix  
✅ **50+ UI components** specified  
✅ **Data requirements** mapped to database  
✅ **User journeys** documented for each role  
✅ **Mobile & accessibility** guidelines  
✅ **Performance targets** defined  
✅ **Integration architecture** documented  

**Total Documentation:** 30,000+ words

---

**Phase 1 Status:** ✅ COMPLETE  
**Next Phase:** Phase 2 - Data Model Extension  
**Ready to Proceed:** YES  
**Last Updated:** 2025-12-07
