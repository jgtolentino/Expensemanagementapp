# TBWA Agency Databank - Complete User Journeys

## 🎯 Overview

This document maps all user journeys across the 7 integrated applications with authentication, navigation, and feature access flows.

## 🔐 Authentication Routes

### Route: `/` (Unauthenticated)
**Screen:** Login Screen  
**Components:** `LoginScreen.tsx`

```
┌─────────────────────────────────┐
│      TBWA Agency Databank       │
│   Sign in to access workspace   │
├─────────────────────────────────┤
│  Email:    [________________]   │
│  Password: [________________]   │
│                                 │
│  [        Sign In         ]    │
├─────────────────────────────────┤
│  Demo Accounts:                 │
│  • Admin                        │
│  • Finance Director             │
│  • Account Manager              │
│  • Employee                     │
└─────────────────────────────────┘
```

**User Actions:**
1. Enter email and password
2. OR click demo account to auto-fill
3. Click "Sign In"
4. → Redirects to App Launcher

### Route: `/` (Authenticated)
**Screen:** App Launcher  
**Components:** `App.tsx` (AppContent)

```
┌──────────────────────────────────────────────┐
│  TBWA Agency Databank           👤 User Menu │
│  Select an application to continue           │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │   📊   │  │   ✈️   │  │   📦   │        │
│  │ Rate   │  │Travel &│  │Gearroom│        │
│  │  Card  │  │Expense │  │        │        │
│  └────────┘  └────────┘  └────────┘        │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │   💼   │  │   🛒   │  │   🎨   │        │
│  │Finance │  │Procure │  │Creative│        │
│  │  PPM   │  │        │  │Workroom│        │
│  └────────┘  └────────┘  └────────┘        │
│                                              │
│  ┌────────┐                                 │
│  │   📚   │                                 │
│  │ Wiki & │                                 │
│  │  Docs  │                                 │
│  └────────┘                                 │
└──────────────────────────────────────────────┘
```

**User Actions:**
1. Click any app card
2. → Opens selected app
3. Click User Menu (top-right)
4. → View profile, settings, logout

---

## 📊 App 1: Rate Card Pro

### Route: `/ratecard`
**Users:** Finance Director, Account Manager, All Users  
**Components:** `RateCardProApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Rate Card Pro
Quote & Proposal Management System

[Dashboard] [My Requests] [Analytics]
```

### User Journey: Finance Director

**Step 1: Login as FD**
```
Email: fd.finance@tbwa-smp.com
Password: demo123
```

**Step 2: Open Rate Card Pro**
```
App Launcher → Click "Rate Card Pro" card
```

**Step 3: View Dashboard**
```
Dashboard Tab:
- Pending Requests (3)
- Recent Quotes
- Monthly Analytics

Actions:
• Review request: "Nike Campaign Q4"
• View line items (12 items)
• Check total: ₱450,000
• Approve or Reject
```

**Step 4: Navigate to Requests**
```
My Requests Tab:
- All pending approvals
- Filter by status
- Sort by date/amount

Actions:
• Click request to view details
• Approve with comments
• Request changes
```

**Step 5: Return to Launcher**
```
Click "← All Apps" button
→ Returns to App Launcher
```

### User Journey: Account Manager

**Step 1: Login as AM**
```
Email: am.client@tbwa-smp.com
Password: demo123
```

**Step 2: Open Rate Card Pro**

**Step 3: Create New Quote**
```
Dashboard → "New Request" button

Form:
• Client: [Select client]
• Project: [Enter name]
• Line Items: [Add services]
• Total: Auto-calculated
• Submit for Approval
```

**Step 4: Track Status**
```
My Requests Tab:
- View submitted quotes
- Check approval status
- View FD feedback
```

---

## ✈️ App 2: Travel & Expense

### Route: `/te`
**Users:** All Employees  
**Components:** `TEApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Travel & Expense
SAP Concur-style Expense Management

[Expense Reports] [Cash Advance] [Analytics]
```

### User Journey: Employee

**Step 1: Create Expense Report**
```
Expense Reports Tab → "New Report" button

Form:
• Report Name: "Manila Business Trip"
• Date Range: Dec 1-3, 2024
• Purpose: Client meetings

Expenses:
1. Hotel: ₱6,500
2. Meals: ₱2,400
3. Transportation: ₱1,200
Total: ₱10,100

Actions:
• Upload receipts (OCR)
• Add expense items
• Submit for approval
```

**Step 2: Request Cash Advance**
```
Cash Advance Tab → "New Request"

Form:
• Amount: ₱20,000
• Purpose: Upcoming conference
• Travel dates
• Submit
```

**Step 3: View Analytics**
```
Analytics Tab:
- Monthly spend: ₱45,320
- Category breakdown
- Pending settlements
- Approval trends
```

---

## 📦 App 3: Gearroom

### Route: `/gear`
**Users:** All Employees  
**Components:** `GearApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Gearroom
Cheqroom-style Equipment Management

[Catalog] [My Items] [Check-out] [Analytics]
```

### User Journey: Employee

**Step 1: Browse Equipment**
```
Catalog Tab:
- Search: "camera"
- Filter by: Available, Category
- Results: Canon EOS R5, Sony A7 III, etc.
```

**Step 2: Check Out Equipment**
```
Select Item: Canon EOS R5
→ Click "Check Out"

Form:
• Purpose: Product photoshoot
• Return date: Dec 15, 2024
• Project: Client ABC
• Submit
```

**Step 3: View My Items**
```
My Items Tab:
- Currently checked out: 2 items
- Return status
- Maintenance history
```

---

## 💼 App 4: Finance PPM

### Route: `/financeppm`
**Users:** Finance Director, Project Managers  
**Components:** `FinancePPMApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Finance PPM
Finance Clarity Project Portfolio Management

[Dashboard] [Projects] [Resources] [Financials]
```

### User Journey: Finance Director

**Step 1: View Portfolio Dashboard**
```
Dashboard Tab:

Metrics:
• Total Projects: 24
• Active: 16
• Total Budget: ₱3.45M
• Spent: ₱2.19M
• Utilization: 78%
• At Risk: 3

Active Projects:
1. Brand Refresh Campaign (65% complete)
2. Digital Transformation (42% complete)
3. Q4 Product Launch (15% complete)
```

**Step 2: Review Projects**
```
Projects Tab:
- Project list view
- WBS structure
- Gantt chart
- Dependencies
- Milestones

Actions:
• View project details
• Update status
• Adjust timeline
```

**Step 3: Resource Planning**
```
Resources Tab:
- Team allocation
- Capacity planning
- Skill matrix
- Utilization rates

Actions:
• Assign resources
• View availability
• Manage timesheets
```

**Step 4: Financial Tracking**
```
Financials Tab:
- Budget vs Actual
- Forecasting
- Cost tracking
- Billing status

Actions:
• Review financials
• Approve budgets
• Generate reports
```

---

## 🛒 App 5: Procure

### Route: `/procure`
**Users:** All Employees  
**Components:** `ProcureApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Procure
SAP Ariba-style Procurement & Internal Shop

[Catalog] [My Requisitions] [Suppliers] [Analytics]
```

### User Journey: Employee

**Step 1: Search Catalog**
```
Catalog Tab:
- Search: "photography services"
- Filters: Category, Rating, Price

Results:
• Professional Photography - ₱8,500/day
• Video Production - ₱45,000/project
• Graphic Design - ₱3,500/hour
```

**Step 2: Add to Cart & Create Requisition**
```
Select Service: Professional Photography
→ Click "Add to Cart"
→ "New Requisition"

Form:
• Supplier: Creative Studios PH
• Service: Photography (8 days)
• Amount: ₱68,000
• Project: Q4 Campaign
• Justification: Product shoot
• Submit for Approval
```

**Step 3: Track Requisitions**
```
My Requisitions Tab:
- PR-2024-001: Approved
- PR-2024-002: Pending Approval
- PR-2024-003: In Review

Actions:
• View details
• Track status
• View approval chain
```

**Step 4: View Suppliers**
```
Suppliers Tab:
- Approved suppliers list
- Rate cards
- Performance ratings
- Contract details

Actions:
• View rate card
• Contact supplier
• View history
```

**Step 5: Spend Analytics**
```
Analytics Tab:
- Category breakdown
- Supplier performance
- Savings opportunities
- Budget tracking
```

---

## 🎨 App 6: Creative Workroom

### Route: `/creative`
**Users:** Creative Team, Designers, Copywriters  
**Components:** `CreativeWorkroomApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Creative Workroom
Creative Project Collaboration Workspace

[Projects] [Briefs] [Asset Library] [Approvals]
```

### User Journey: Creative Designer

**Step 1: View Projects**
```
Projects Tab:

Active Projects:
1. Summer Campaign 2025
   - Status: In Progress
   - Phase: Concept Development
   - Assets: 24
   - Team: Designer, Copywriter, Art Director

2. Product Launch Video
   - Status: Review
   - Phase: Post-Production
```

**Step 2: Review Brief**
```
Briefs Tab:

Brief: Social Media Campaign
• Client: BrandCo
• Type: Social Media
• Objective: Increase Gen Z awareness
• Deliverables: 20 social posts
• Deadline: Jan 10, 2025

Actions:
• View full brief
• Download assets
• Start work
```

**Step 3: Upload Assets**
```
Asset Library Tab:

Upload:
• File: Summer_Hero_v3.psd
• Project: Summer Campaign 2025
• Type: Image
• Tags: social, hero, concept

Actions:
• Upload file
• Add metadata
• Create version
```

**Step 4: Submit for Approval**
```
Approvals Tab:

Submit:
• Asset: Summer Campaign Concept A
• Project: Summer Campaign 2025
• Reviewer: Art Director
• Comments: First round concepts

Status: Pending Approval
```

---

## 📚 App 7: Wiki & Docs

### Route: `/wiki`
**Users:** All Users  
**Components:** `WikiDocsApp.tsx`

### Navigation Tabs
```
← All Apps                              👤 User Menu

Wiki & Docs
Confluence/Notion-style Knowledge Base

[Home] [All Pages] [Recent] [Starred]
```

### User Journey: Any User

**Step 1: View Workspaces**
```
Home Tab:

Workspaces:
📚 Company Wiki (124 pages, 45 members)
📁 Project Documentation (89 pages, 23 members)
📢 Marketing Playbook (56 pages, 18 members)
⚙️ Engineering Docs (142 pages, 32 members)

Popular Templates:
📝 Meeting Notes
📋 Project Brief
📊 Weekly Report
📄 Product Spec
```

**Step 2: Search Pages**
```
Search: "API integration"

Results:
• API Integration Guide
• REST API Documentation
• Authentication Setup
• Webhook Configuration
```

**Step 3: View Recent Pages**
```
Recent Tab:

Recently Updated:
1. Q4 2024 Campaign Strategy
   - Marketing Playbook
   - Modified: 2 hours ago
   - Tags: Strategy, Q4, Campaign

2. API Integration Guide
   - Engineering Docs
   - Modified: 5 hours ago
   - Tags: API, Integration, Technical
```

**Step 4: Manage Starred Pages**
```
Starred Tab:

Favorites:
⭐ Brand Guidelines 2025
⭐ Q4 Campaign Strategy
⭐ Client Communication Guidelines

Actions:
• Open page
• Unstar
• Share
```

**Step 5: Create New Page**
```
Home → "New Page" button

Template: Select template or blank
Workspace: Company Wiki
Title: [Enter title]
Content: [Rich text editor]
Tags: [Add tags]
Publish
```

---

## 🔄 Complete Multi-App User Journey

### Scenario: Full Day Workflow

**8:00 AM - Login**
```
1. Open app
2. Login as: employee@tbwa-smp.com
3. → App Launcher
```

**8:15 AM - Check Emails (Wiki & Docs)**
```
4. Open Wiki & Docs
5. Search: "client onboarding"
6. Read documentation
7. ← Back to Launcher
```

**9:00 AM - Team Meeting (Creative Workroom)**
```
8. Open Creative Workroom
9. Review brief: Summer Campaign
10. Check project status
11. View asset library
12. ← Back to Launcher
```

**10:00 AM - Work on Design (Creative Workroom)**
```
13. Open Creative Workroom
14. Upload new concepts
15. Submit for approval
16. ← Back to Launcher
```

**11:00 AM - Request Equipment (Gearroom)**
```
17. Open Gearroom
18. Search: camera
19. Check out: Canon EOS R5
20. ← Back to Launcher
```

**1:00 PM - Submit Expenses (Travel & Expense)**
```
21. Open T&E
22. Create expense report
23. Upload receipts
24. Submit for approval
25. ← Back to Launcher
```

**2:00 PM - Order Supplies (Procure)**
```
26. Open Procure
27. Search: printing services
28. Create requisition
29. Submit
30. ← Back to Launcher
```

**3:00 PM - Project Review (Finance PPM)**
```
31. Open Finance PPM
32. View project dashboard
33. Check budget status
34. Update timeline
35. ← Back to Launcher
```

**4:00 PM - Client Quote (Rate Card Pro)**
```
36. Open Rate Card Pro
37. Create new quote
38. Add line items
39. Submit for FD approval
40. ← Back to Launcher
```

**5:00 PM - Logout**
```
41. Click User Menu
42. Click "Log out"
43. → Back to Login Screen
```

---

## 📊 Route Summary

| Route | App | Auth Required | Primary Users |
|-------|-----|---------------|---------------|
| `/` | Login / Launcher | ❌ / ✅ | All |
| `/ratecard` | Rate Card Pro | ✅ | FD, AM, All |
| `/te` | Travel & Expense | ✅ | All Employees |
| `/gear` | Gearroom | ✅ | All Employees |
| `/financeppm` | Finance PPM | ✅ | FD, PM |
| `/procure` | Procure | ✅ | All Employees |
| `/creative` | Creative Workroom | ✅ | Creative Team |
| `/wiki` | Wiki & Docs | ✅ | All Users |

---

## ✅ Testing Coverage

All routes and user journeys are covered by integration tests:

- ✅ 6 Authentication tests
- ✅ 4 App Launcher tests
- ✅ 3 Rate Card Pro tests
- ✅ 3 Travel & Expense tests
- ✅ 2 Gearroom tests
- ✅ 4 Finance PPM tests
- ✅ 4 Procure tests
- ✅ 4 Creative Workroom tests
- ✅ 4 Wiki & Docs tests
- ✅ 1 End-to-end multi-app test

**Total: 34 integration tests**

Run tests: `npm test`

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready
