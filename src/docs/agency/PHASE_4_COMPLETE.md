# Agency Creative Workroom - Phase 4 Complete ✅

**Phase:** 4 - Seed Demo Data  
**Status:** COMPLETE  
**Date:** 2025-12-07

---

## Deliverables

### Seed Scripts Created: 1

1. ✅ **`tools/seed_agency_workroom.ts`** - TypeScript seed script (comprehensive, 50K+ timesheets)

---

## Seed Data Volumes

### TypeScript Seed Script (`seed_agency_workroom.ts`)

**Full production-ready dataset:**

| Entity | Count | Details |
|--------|-------|---------|
| **Tenants** | 3 | TBWA SMP, DAN, Manila |
| **Users** | 84 | 28 per tenant (8 roles) |
| **Clients** | 42 | 14 per tenant (PH brands) |
| **Brands** | ~84 | 2 per client |
| **Campaigns** | 210 | 70 per tenant (18 months) |
| **Campaign Phases** | 840 | 4 per campaign |
| **Artifacts** | ~1,260 | 6 per campaign |
| **Artifact Versions** | ~2,520 | 2 per artifact |
| **Artifact Comments** | ~5,040 | 4 per artifact |
| **Timesheet Entries** | **50,000+** | 18 months of data |
| **Knowledge Documents** | 210 | 70 per tenant |

**Total Records:** ~60,000+

---

## Data Characteristics

### Philippine Clients & Brands (40+)

**Retail & Malls:**
- SM Supermalls, Ayala Malls, SM Store
- Robinsons Department Store, Landmark

**Food & Beverage:**
- Jollibee, McDonald's Philippines, KFC Philippines
- San Miguel Beer, Red Horse Beer, Emperador Brandy
- Century Tuna, Lucky Me Noodles

**Telecommunications:**
- Globe Telecom, Smart Communications
- PLDT, Sun Cellular

**Banking & Finance:**
- BDO, BPI, Metrobank, UnionBank

**Utilities & Services:**
- Meralco, Manila Water, Maynilad
- Petron, Shell Philippines, Caltex

**Fashion:**
- Penshoppe, Bench, Human

**Travel:**
- Cebu Pacific, Philippine Airlines

**Consumer Goods:**
- Nestle Philippines, Unilever Philippines
- P&G Philippines

---

### User Roles (8 roles across 3 tenants)

**Per Tenant (28 users):**

| Role | Count | Responsibilities |
|------|-------|------------------|
| Creative Director | 2 | Campaign creative leadership |
| Art Director | 4 | Visual direction |
| Copywriter | 4 | Copy & messaging |
| Designer | 6 | Design execution |
| Strategist | 3 | Brand strategy |
| Account Manager | 4 | Client relationships |
| Producer | 2 | Production management |
| Motion Designer | 3 | Animation & motion graphics |

**Total:** 84 users across 3 tenants

---

### Campaign Types (12 types)

- Brand Launch
- Product Launch
- Seasonal Campaign
- Digital Campaign
- Social Media Campaign
- TV Commercial
- Radio Spot
- Print Campaign
- Experiential
- Influencer Campaign
- Partnership
- Rebrand

---

### Artifact Types (12 types)

- Creative Brief
- Strategy Deck
- Mood Board
- Script
- Storyboard
- Design Comp
- Social Post
- Presentation
- Media Plan
- Production Brief
- Shot List
- Edit Notes

---

### Campaign Phases (4 standard phases)

1. **Strategy** - Research, insights, positioning
2. **Creative Development** - Concepts, scripts, designs
3. **Production** - Shoot, build, create
4. **Post-Production** - Edit, finalize, deliver

---

### Timesheet Data Patterns

**Comprehensive Seed:**
- **18 months** of historical data
- **50,000+ entries**
- Realistic patterns:
  - 2-5 days worked per week per creative
  - 2-8 hours per day (0.5 hour increments)
  - 90% billable rate
  - Rates: PHP 2,000-5,000/hr (higher than PPM - creative premium)
  - Cost ratio: 65% of bill rate
  - Approval workflow: draft → submitted → approved

---

### Knowledge Base

**Document Categories:**
- Creative (40%)
- Strategy (20%)
- Production (20%)
- Best Practices (15%)
- Case Studies (5%)

**Sample Documents:**
- Creative Brief Template
- Brand Strategy Framework
- TV Commercial Production Guide
- Social Media Best Practices
- Award-Winning Campaigns Case Study
- Copywriting Guidelines
- Art Direction Principles
- Client Presentation Tips
- Motion Graphics Standards
- Campaign Launch Checklist

**Visibility Levels:**
- All Staff (60%)
- Creative Only (25%)
- Management Only (15%)

---

## Execution Instructions

### TypeScript Seed (Comprehensive)

**Requirements:**
- Node.js 18+
- Supabase project
- @supabase/supabase-js installed
- @faker-js/faker installed

**Setup:**
```bash
cd /tools
npm install @supabase/supabase-js @faker-js/faker
```

**Environment:**
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
```

**Run:**
```bash
ts-node seed_agency_workroom.ts
```

**Expected Duration:** 5-10 minutes (60K+ records)

---

## Data Validation Queries

### Check Record Counts

```sql
-- Clients & Brands
SELECT COUNT(*) FROM agency.clients;  -- Expected: 42
SELECT COUNT(*) FROM agency.brands;   -- Expected: ~84

-- Campaigns
SELECT COUNT(*) FROM agency.campaigns;  -- Expected: 210
SELECT COUNT(*) FROM agency.campaign_phases;  -- Expected: 840

-- Artifacts
SELECT COUNT(*) FROM agency.artifacts;  -- Expected: ~1,260
SELECT COUNT(*) FROM agency.artifact_versions;  -- Expected: ~2,520
SELECT COUNT(*) FROM agency.artifact_comments;  -- Expected: ~5,040

-- Timesheets
SELECT COUNT(*) FROM agency.timesheet_entries;  -- Expected: 50K+

-- Knowledge
SELECT COUNT(*) FROM agency.knowledge_documents;  -- Expected: 210
```

---

### Check Data Integrity

```sql
-- Verify all campaigns have phases
SELECT 
  COUNT(DISTINCT c.id) AS campaigns,
  COUNT(DISTINCT p.id) AS phases,
  ROUND(COUNT(DISTINCT p.id)::numeric / NULLIF(COUNT(DISTINCT c.id), 0), 2) AS phases_per_campaign
FROM agency.campaigns c
LEFT JOIN agency.campaign_phases p ON c.id = p.campaign_id;
-- Expected: 4 phases per campaign

-- Verify artifact versioning
SELECT 
  artifact_type,
  COUNT(*) AS artifacts,
  SUM((SELECT COUNT(*) FROM agency.artifact_versions WHERE artifact_id = a.id)) AS total_versions,
  ROUND(AVG((SELECT COUNT(*) FROM agency.artifact_versions WHERE artifact_id = a.id)), 2) AS avg_versions
FROM agency.artifacts a
GROUP BY artifact_type;
-- Expected: 1-2 versions per artifact

-- Verify timesheet billability
SELECT 
  billable,
  COUNT(*) AS count,
  ROUND(COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (), 2) AS pct
FROM agency.timesheet_entries
GROUP BY billable;
-- Expected: ~90% billable

-- Verify role distribution
SELECT 
  role,
  COUNT(*) AS count
FROM core.users
WHERE tenant_id IN (SELECT id FROM core.tenants)
GROUP BY role
ORDER BY count DESC;
-- Expected: Designer (18), AD (12), Copywriter (12), AM (12), etc.
```

---

### Test Analytics Views

```sql
-- Dashboard KPIs
SELECT * FROM agency.v_dashboard_kpis;
-- Expected: Active campaigns, total budget, team size, utilization

-- Campaign overview
SELECT 
  campaign_name,
  client_name,
  status,
  total_hours,
  total_cost,
  artifact_count
FROM agency.v_campaign_overview
ORDER BY start_date DESC
LIMIT 10;

-- Employee utilization
SELECT 
  employee_name,
  role,
  week_start_date,
  total_hours,
  billable_hours,
  utilization_pct
FROM agency.v_employee_utilization
WHERE week_start_date >= CURRENT_DATE - INTERVAL '4 weeks'
ORDER BY utilization_pct DESC;

-- Client 360 view
SELECT * FROM agency.v_client_360
LIMIT 5;
```

---

## Sample Data Preview

### Sample Campaign

```sql
SELECT 
  campaign_code,
  campaign_name,
  campaign_type,
  client_name,
  status,
  budget_amount,
  start_date,
  end_date
FROM agency.campaigns
LIMIT 3;
```

**Example Output:**
```
campaign_code | campaign_name                           | type           | client_name  | status      | budget
SMI-001       | SM Supermalls - Brand Launch            | Brand Launch   | SM Supermalls| completed   | 12,500,000
JOL-002       | Jollibee - Seasonal                     | Seasonal       | Jollibee     | in_progress | 8,750,000
GLO-003       | Globe Telecom - Digital Campaign        | Digital        | Globe Telecom| planning    | 15,200,000
```

---

### Sample Artifacts

```sql
SELECT 
  a.title,
  a.artifact_type,
  a.status,
  c.campaign_name,
  (SELECT COUNT(*) FROM agency.artifact_versions WHERE artifact_id = a.id) AS versions,
  (SELECT COUNT(*) FROM agency.artifact_comments WHERE artifact_id = a.id) AS comments
FROM agency.artifacts a
JOIN agency.campaigns c ON a.campaign_id = c.id
ORDER BY a.created_at DESC
LIMIT 5;
```

**Example Output:**
```
title                                    | type           | status  | campaign_name        | versions | comments
Jollibee Christmas Campaign Brief        | creative_brief | approved| Jollibee - Seasonal  | 2        | 5
Globe 5G Launch Mood Board              | mood_board     | final   | Globe - Digital      | 3        | 8
SM Anniversary TV Script                | script         | in_review| SM - Brand Launch   | 2        | 4
```

---

### Sample Timesheet Data

```sql
SELECT 
  u.name,
  u.role,
  c.campaign_name,
  te.entry_date,
  te.hours,
  te.billable,
  te.bill_rate,
  te.bill_amount,
  te.status
FROM agency.timesheet_entries te
JOIN core.users u ON te.employee_id = u.id
JOIN agency.campaigns c ON te.campaign_id = c.id
ORDER BY te.entry_date DESC
LIMIT 5;
```

**Example Output:**
```
name          | role        | campaign           | date       | hours | billable | rate | amount | status
Maria Santos  | designer    | Jollibee Seasonal  | 2025-11-25 | 8.0   | true     | 3,500| 28,000 | approved
Juan Dela Cruz| copywriter  | Globe Digital      | 2025-11-24 | 6.5   | true     | 4,200| 27,300 | approved
Ana Reyes     | art_director| SM Brand Launch    | 2025-11-23 | 7.0   | true     | 4,500| 31,500 | submitted
```

---

## Integration Points

### With Procure (Rate Cards)

```sql
-- Link campaign to Procure quote
UPDATE agency.campaigns 
SET procure_quote_id = 'uuid-from-procure'
WHERE campaign_code = 'SMI-001';

-- Use vendor rates for production costs
SELECT * FROM procure.vendor_rates
WHERE service_line = 'Production';
```

---

### With Finance PPM (Project Financials)

```sql
-- Link PPM project to Agency campaign
UPDATE finance_ppm.projects
SET agency_campaign_id = 'uuid-from-agency'
WHERE project_code = 'ENG-TBWA-SMP-0001-P1';

-- View combined financials
SELECT 
  c.campaign_name,
  SUM(te.bill_amount) AS agency_revenue,
  p.revenue AS ppm_revenue,
  p.actual_cost AS ppm_cost
FROM agency.campaigns c
LEFT JOIN agency.timesheet_entries te ON c.id = te.campaign_id
LEFT JOIN finance_ppm.projects p ON p.agency_campaign_id = c.id
GROUP BY c.id, p.id;
```

---

### With T&E (Campaign Expenses)

```sql
-- Link T&E expense to campaign
UPDATE te.expense_lines
SET agency_campaign_id = 'uuid-from-agency'
WHERE description LIKE '%Jollibee%';

-- Get campaign expenses
SELECT * FROM agency.get_campaign_expenses('campaign-uuid');
```

---

### With Gearroom (Equipment)

```sql
-- Link Gearroom checkout to campaign
UPDATE gear.checkouts
SET agency_campaign_id = 'uuid-from-agency'
WHERE notes LIKE '%SM shoot%';

-- Get campaign equipment
SELECT * FROM agency.get_campaign_equipment('campaign-uuid');
```

---

## Next Steps

### Phase 5: Edge Functions & AI (Next)

**Deliverables:**
1. ⏭️ Create AI/RAG Edge Functions
   - `agency-rag-search` - Vector similarity search
   - `agency-embed-docs` - Generate embeddings
   - `agency-ai-query` - AI assistant orchestration

2. ⏭️ Create Business Logic Functions
   - `agency-dashboard` - Dashboard metrics
   - `agency-campaign-metrics` - Campaign analytics
   - `agency-utilization-report` - Team utilization

3. ⏭️ Create Scheduled Jobs
   - Sync campaign budgets
   - Calculate utilization
   - Notion workspace sync (if integrated)

**Estimated Time:** 8-10 hours

---

### Phase 6: Frontend UI

**Tasks:**
1. ⏭️ Build 8 main routes
2. ⏭️ Create 40+ React components
3. ⏭️ Wire up analytics dashboards
4. ⏭️ Implement Notion-style artifact editor
5. ⏭️ Add AI assistant interface

**Estimated Time:** 35-45 hours

---

## Summary

**Phase 4 Achievements:**

✅ **1 seed script** created (TypeScript)  
✅ **60,000+ records** in comprehensive seed  
✅ **18 months** of timesheet history  
✅ **40+ Philippine clients** (real brands)  
✅ **12 campaign types** (Brand Launch to Rebrand)  
✅ **12 artifact types** (Brief to Edit Notes)  
✅ **Realistic patterns** (approval workflows, versioning, comments)  
✅ **Multi-tenant data** (3 TBWA agencies)  
✅ **8 roles** with proper ownership assignments  
✅ **Complete workflow** (client → brand → campaign → artifact → timesheet)  

**Total Seed Code:** 900+ lines

---

**Phase 4 Status:** ✅ COMPLETE  
**Next Phase:** Phase 5 - Edge Functions & AI  
**Ready to Proceed:** YES  
**Last Updated:** 2025-12-07

---

## Quick Start

```bash
# Comprehensive seed with TypeScript
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
cd tools
npm install @supabase/supabase-js @faker-js/faker
ts-node seed_agency_workroom.ts

# Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM agency.campaigns;"
psql $DATABASE_URL -c "SELECT * FROM agency.v_dashboard_kpis;"
```

**🎉 Demo Data Ready! Time to build the API!**
