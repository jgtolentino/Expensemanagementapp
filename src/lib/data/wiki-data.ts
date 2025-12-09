// Wiki & Docs Data Layer
// Complete data model for Confluence/Notion-style knowledge base

export interface WikiSpace {
  id: string;
  key: string; // URL-friendly key like 'product-docs'
  name: string;
  description: string;
  iconEmoji: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  pageCount?: number;
  memberCount?: number;
}

export interface WikiTag {
  id: string;
  label: string;
  color: string;
  description: string;
}

export type PageStatus = 'draft' | 'published' | 'archived';

export interface WikiPage {
  id: string;
  spaceId: string;
  parentPageId?: string; // For hierarchy
  slug: string; // URL-friendly slug
  title: string;
  contentMarkdown: string; // Main content in markdown
  excerpt: string; // Short description
  status: PageStatus;
  tags: string[]; // Tag IDs
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  starred?: boolean;
  children?: WikiPage[]; // Nested pages for tree view
}

export interface WikiActivity {
  id: string;
  pageId: string;
  actorId: string;
  actorName: string;
  action: 'created' | 'updated' | 'archived' | 'restored' | 'commented';
  timestamp: string;
  summary?: string;
}

export interface WikiPageTreeNode extends WikiPage {
  children: WikiPageTreeNode[];
  level: number;
  isExpanded?: boolean;
}

// ===== SEED DATA =====

export const wikiTags: WikiTag[] = [
  { id: 'TAG-001', label: 'Onboarding', color: '#10B981', description: 'New hire onboarding content' },
  { id: 'TAG-002', label: 'API', color: '#3B82F6', description: 'API documentation' },
  { id: 'TAG-003', label: 'Finance', color: '#D97706', description: 'Finance and accounting' },
  { id: 'TAG-004', label: 'Retail', color: '#EC4899', description: 'Retail operations' },
  { id: 'TAG-005', label: 'Internal', color: '#6B7280', description: 'Internal use only' },
  { id: 'TAG-006', label: 'Process', color: '#8B5CF6', description: 'Process documentation' },
  { id: 'TAG-007', label: 'Guidelines', color: '#EF4444', description: 'Guidelines and standards' },
  { id: 'TAG-008', label: 'Technical', color: '#0EA5E9', description: 'Technical documentation' },
];

export const wikiSpaces: WikiSpace[] = [
  {
    id: 'SPC-001',
    key: 'product-docs',
    name: 'Product Documentation',
    description: 'Complete product documentation and user guides',
    iconEmoji: '📚',
    color: '#0891B2',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-01-08T14:30:00Z',
    createdBy: 'CKVC',
    pageCount: 24,
    memberCount: 15,
  },
  {
    id: 'SPC-002',
    key: 'engineering',
    name: 'Engineering Wiki',
    description: 'Technical documentation, API references, and architecture guides',
    iconEmoji: '⚙️',
    color: '#059669',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2025-01-09T11:20:00Z',
    createdBy: 'JAP',
    pageCount: 42,
    memberCount: 12,
  },
  {
    id: 'SPC-003',
    key: 'finance',
    name: 'Finance & Operations',
    description: 'Financial policies, procedures, and operational guidelines',
    iconEmoji: '💰',
    color: '#D97706',
    createdAt: '2024-03-10T08:30:00Z',
    updatedAt: '2025-01-07T16:45:00Z',
    createdBy: 'CKVC',
    pageCount: 18,
    memberCount: 8,
  },
  {
    id: 'SPC-004',
    key: 'hr',
    name: 'HR & People',
    description: 'Human resources policies, benefits, and team information',
    iconEmoji: '👥',
    color: '#8B5CF6',
    createdAt: '2024-04-05T09:15:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    createdBy: 'RIM',
    pageCount: 16,
    memberCount: 20,
  },
];

export const wikiPages: WikiPage[] = [
  // Product Docs Space
  {
    id: 'PAGE-001',
    spaceId: 'SPC-001',
    slug: 'getting-started',
    title: 'Getting Started',
    contentMarkdown: `# Getting Started

Welcome to the TBWA Agency Databank! This guide will help you get up and running quickly.

## What is TBWA Databank?

TBWA Agency Databank is a comprehensive ecosystem of 8 integrated applications designed to streamline agency operations:

- **Rate Card Pro** - Manage pricing and proposals
- **Travel & Expense** - Track expenses and travel requests
- **Gearroom** - Equipment checkout and inventory
- **Finance PPM** - Project portfolio management
- **Procure** - Procurement and purchasing
- **Creative Workroom** - Creative project management
- **BI Analytics** - Business intelligence dashboards
- **Wiki & Docs** - Knowledge base (you're here!)

## Quick Start

1. **Sign In** - Use your agency credentials
2. **Explore Apps** - Click on any app card from the launcher
3. **Search** - Use the global search to find what you need
4. **Get Help** - Visit our FAQ or contact support

## Key Features

### Unified Authentication
Single sign-on across all 8 applications with role-based access control.

### Real-time Collaboration
Work together with your team in real-time across all modules.

### Mobile Responsive
Access everything from desktop, tablet, or mobile devices.

## Next Steps

- Read the [User Guide](#user-guide)
- Watch [Video Tutorials](#tutorials)
- Join our [Community](#community)

---

*Last updated: January 9, 2025 by CKVC*
`,
    excerpt: 'Welcome guide for new users of the TBWA Agency Databank platform',
    status: 'published',
    tags: ['TAG-001'],
    createdBy: 'CKVC',
    updatedBy: 'CKVC',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2025-01-09T10:00:00Z',
    viewCount: 245,
    starred: true,
  },
  {
    id: 'PAGE-002',
    spaceId: 'SPC-001',
    parentPageId: 'PAGE-001',
    slug: 'user-guide',
    title: 'User Guide',
    contentMarkdown: `# User Guide

## Navigation

The TBWA Databank uses a launcher-based navigation system. Click on any app tile to access that module.

## Common Tasks

### Creating a New Record
1. Navigate to the relevant app
2. Click "New" or "Create"
3. Fill in the required fields
4. Click "Save"

### Searching
Use the search bar in the top-right corner of each app to find records quickly.

### Exporting Data
Most apps support CSV and Excel export via the "Export" button.

## Tips & Tricks

- Use keyboard shortcuts: \`Cmd/Ctrl + K\` to open quick search
- Star important pages for quick access
- Customize your dashboard layout
`,
    excerpt: 'Complete user guide for navigating and using the platform',
    status: 'published',
    tags: ['TAG-001'],
    createdBy: 'CKVC',
    updatedBy: 'JAP',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2025-01-08T14:20:00Z',
    viewCount: 189,
  },
  {
    id: 'PAGE-003',
    spaceId: 'SPC-001',
    slug: 'faq',
    title: 'Frequently Asked Questions',
    contentMarkdown: `# Frequently Asked Questions

## General

### How do I reset my password?
Contact your system administrator or use the "Forgot Password" link on the login page.

### Which browsers are supported?
We support the latest versions of Chrome, Firefox, Safari, and Edge.

### Is there a mobile app?
The web application is fully responsive and works on mobile browsers. Native apps are coming soon.

## Rate Card Pro

### How do I create a new rate card?
Navigate to Rate Card Pro > New Rate Card > Fill in the details > Save.

### Can I clone an existing rate card?
Yes! Open any rate card and click the "Clone" button.

## Travel & Expense

### What receipts do I need to submit?
All expenses over $25 require receipts. Upload them when creating your expense report.

### How long does approval take?
Most expense reports are approved within 2-3 business days.

## Finance PPM

### How do I track project progress?
Use the Tasks & Kanban view to see real-time progress across all projects.

### Can I assign multiple people to a task?
Yes! Use the RACI assignment feature to assign Responsible, Accountable, Consulted, and Informed roles.

---

**Still have questions?** Contact support@tbwa.com
`,
    excerpt: 'Common questions and answers about the TBWA Databank platform',
    status: 'published',
    tags: ['TAG-001'],
    createdBy: 'RIM',
    updatedBy: 'RIM',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2025-01-05T09:30:00Z',
    viewCount: 312,
    starred: true,
  },

  // Engineering Space
  {
    id: 'PAGE-004',
    spaceId: 'SPC-002',
    slug: 'api-overview',
    title: 'API Overview',
    contentMarkdown: `# API Overview

The TBWA Databank API provides programmatic access to all platform features.

## Base URL

\`\`\`
https://api.tbwa-databank.com/v1
\`\`\`

## Authentication

All API requests require an API key in the Authorization header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.tbwa-databank.com/v1/expenses
\`\`\`

## Endpoints

### Expenses
- \`GET /expenses\` - List all expenses
- \`POST /expenses\` - Create new expense
- \`GET /expenses/:id\` - Get expense details
- \`PUT /expenses/:id\` - Update expense
- \`DELETE /expenses/:id\` - Delete expense

### Projects
- \`GET /projects\` - List all projects
- \`POST /projects\` - Create new project
- \`GET /projects/:id\` - Get project details

### Tasks
- \`GET /tasks\` - List all tasks
- \`POST /tasks\` - Create new task
- \`PATCH /tasks/:id\` - Update task status

## Rate Limiting

- 1000 requests per hour per API key
- Rate limit headers included in all responses

## Response Format

All responses are JSON:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
\`\`\`

## Error Handling

Errors return appropriate HTTP status codes:

- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found
- \`429\` - Rate Limit Exceeded
- \`500\` - Server Error
`,
    excerpt: 'Complete API reference and authentication guide',
    status: 'published',
    tags: ['TAG-002', 'TAG-008'],
    createdBy: 'JAP',
    updatedBy: 'JAP',
    createdAt: '2024-02-05T13:00:00Z',
    updatedAt: '2025-01-09T11:20:00Z',
    viewCount: 156,
    starred: true,
  },
  {
    id: 'PAGE-005',
    spaceId: 'SPC-002',
    parentPageId: 'PAGE-004',
    slug: 'authentication',
    title: 'Authentication & Security',
    contentMarkdown: `# Authentication & Security

## API Key Management

Generate API keys from your user settings:

1. Go to Settings > API Keys
2. Click "Generate New Key"
3. Copy the key immediately (it won't be shown again)
4. Store securely in your environment variables

## OAuth 2.0

For third-party integrations, use OAuth 2.0:

\`\`\`
GET /oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_CALLBACK
\`\`\`

## Security Best Practices

- Never commit API keys to version control
- Rotate keys every 90 days
- Use environment-specific keys (dev, staging, prod)
- Monitor API usage for suspicious activity
- Enable IP whitelisting for production keys

## CORS

CORS is enabled for whitelisted domains only. Contact support to add your domain.
`,
    excerpt: 'API authentication methods and security guidelines',
    status: 'published',
    tags: ['TAG-002', 'TAG-008', 'TAG-007'],
    createdBy: 'JAP',
    updatedBy: 'JMSM',
    createdAt: '2024-02-06T09:00:00Z',
    updatedAt: '2025-01-07T15:00:00Z',
    viewCount: 98,
  },

  // Finance Space
  {
    id: 'PAGE-006',
    spaceId: 'SPC-003',
    slug: 'expense-policies',
    title: 'Expense Policies',
    contentMarkdown: `# Expense Policies

## Reimbursable Expenses

### Meals & Entertainment
- **Limit:** $75 per person per meal
- **Receipts:** Required for all expenses over $25
- **Alcohol:** Limited to client entertainment only

### Travel
- **Flights:** Economy class for domestic, premium economy for international over 6 hours
- **Hotels:** Up to $250/night in major cities, $150/night elsewhere
- **Ground Transport:** Uber/taxi for airport transfers, public transit encouraged

### Equipment & Supplies
- **Office Supplies:** Up to $500/month without approval
- **Technology:** Requires IT approval for purchases over $1000

## Non-Reimbursable

- Personal entertainment
- Commuting costs (home to office)
- Parking tickets or traffic violations
- Lost or stolen personal items

## Submission Requirements

1. Submit within 30 days of expense date
2. Attach all receipts
3. Include business purpose
4. Get manager approval

## Processing Timeline

- **Standard:** 5-7 business days
- **Urgent:** 2-3 business days (with manager approval)

## Questions?

Contact finance@tbwa.com or your manager.
`,
    excerpt: 'Company expense reimbursement policies and procedures',
    status: 'published',
    tags: ['TAG-003', 'TAG-006'],
    createdBy: 'CKVC',
    updatedBy: 'CKVC',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2025-01-07T16:45:00Z',
    viewCount: 234,
    starred: true,
  },
  {
    id: 'PAGE-007',
    spaceId: 'SPC-003',
    slug: 'budget-approval',
    title: 'Budget Approval Process',
    contentMarkdown: `# Budget Approval Process

## Approval Thresholds

| Amount | Approval Required |
|--------|-------------------|
| $0 - $5,000 | Manager |
| $5,001 - $25,000 | Department Head |
| $25,001 - $100,000 | VP Finance |
| $100,000+ | CFO + Board |

## Process Steps

1. **Submit Request** via Finance PPM
2. **Manager Review** (1-2 days)
3. **Finance Review** (2-3 days)
4. **Executive Approval** (if required, 3-5 days)
5. **Purchase Order Issued**

## Required Documentation

- Detailed budget breakdown
- Business justification
- Vendor quotes (3 preferred)
- ROI analysis for capital expenditures

## Tracking

Track your requests in Finance PPM under "Budget Requests".
`,
    excerpt: 'Budget request and approval workflow guidelines',
    status: 'published',
    tags: ['TAG-003', 'TAG-006'],
    createdBy: 'CKVC',
    updatedBy: 'BOM',
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2025-01-06T13:00:00Z',
    viewCount: 145,
  },

  // HR Space
  {
    id: 'PAGE-008',
    spaceId: 'SPC-004',
    slug: 'onboarding-checklist',
    title: 'New Hire Onboarding Checklist',
    contentMarkdown: `# New Hire Onboarding Checklist

## Before Day One

### HR Tasks
- [ ] Send welcome email
- [ ] Create user accounts (email, Slack, Databank)
- [ ] Order equipment (laptop, monitor, accessories)
- [ ] Prepare workspace
- [ ] Add to org chart
- [ ] Enroll in benefits

### Manager Tasks
- [ ] Assign onboarding buddy
- [ ] Schedule first week meetings
- [ ] Prepare training plan
- [ ] Set up team intro

## Day One

### Morning
- [ ] Office tour
- [ ] IT setup and training
- [ ] Benefits overview
- [ ] Sign paperwork

### Afternoon
- [ ] Team introductions
- [ ] Review role and expectations
- [ ] First assignment
- [ ] Q&A session

## Week One

- [ ] Complete security training
- [ ] Complete diversity & inclusion training
- [ ] Shadow team members
- [ ] Review key processes
- [ ] Set 30/60/90 day goals

## Month One

- [ ] One-on-one with manager
- [ ] Peer feedback session
- [ ] Department overview meetings
- [ ] First project assignment

## Resources

- [Employee Handbook](#)
- [IT Support Guide](#)
- [Benefits Portal](#)
- [Team Directory](#)
`,
    excerpt: 'Complete checklist for onboarding new team members',
    status: 'published',
    tags: ['TAG-001', 'TAG-006'],
    createdBy: 'RIM',
    updatedBy: 'RIM',
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    viewCount: 178,
    starred: true,
  },
  {
    id: 'PAGE-009',
    spaceId: 'SPC-004',
    slug: 'pto-policy',
    title: 'PTO & Leave Policy',
    contentMarkdown: `# PTO & Leave Policy

## Paid Time Off

### Accrual
- **0-2 years:** 15 days per year
- **3-5 years:** 20 days per year
- **6+ years:** 25 days per year

### Usage
- Accrued monthly (prorated first year)
- Maximum carryover: 5 days
- Request at least 2 weeks in advance

## Holidays

We observe 12 company holidays:
- New Year's Day
- MLK Day
- Presidents' Day
- Memorial Day
- Independence Day
- Labor Day
- Thanksgiving (2 days)
- Christmas (2 days)
- 2 Floating Holidays

## Sick Leave

- Unlimited sick days
- Doctor's note required after 3 consecutive days
- Communicate with manager as soon as possible

## Parental Leave

- **Primary caregiver:** 12 weeks paid
- **Secondary caregiver:** 6 weeks paid
- **Adoption:** Same as birth

## Requesting Time Off

1. Submit request in HR system
2. Manager approves
3. Add to team calendar
4. Update Slack status

## Blackout Periods

Limited PTO during:
- End of quarter (last week)
- Major product launches
- Annual planning (December)
`,
    excerpt: 'Comprehensive guide to time off and leave policies',
    status: 'published',
    tags: ['TAG-006', 'TAG-005'],
    createdBy: 'RIM',
    updatedBy: 'LAS',
    createdAt: '2024-04-15T10:30:00Z',
    updatedAt: '2024-12-20T14:00:00Z',
    viewCount: 267,
  },

  // Draft page example
  {
    id: 'PAGE-010',
    spaceId: 'SPC-002',
    slug: 'webhook-guide',
    title: 'Webhook Integration Guide',
    contentMarkdown: `# Webhook Integration Guide

*This page is currently being written...*

## Overview

Webhooks allow you to receive real-time notifications when events occur in the TBWA Databank.

## Coming Soon

- Event types
- Payload examples
- Setup instructions
- Security best practices
`,
    excerpt: 'Guide for setting up and using webhooks (DRAFT)',
    status: 'draft',
    tags: ['TAG-002', 'TAG-008'],
    createdBy: 'JAP',
    updatedBy: 'JAP',
    createdAt: '2025-01-08T16:00:00Z',
    updatedAt: '2025-01-08T16:00:00Z',
    viewCount: 5,
  },
];

export const wikiActivities: WikiActivity[] = [
  {
    id: 'ACT-001',
    pageId: 'PAGE-001',
    actorId: 'CKVC',
    actorName: 'Chris Kendrick',
    action: 'updated',
    timestamp: '2025-01-09T10:00:00Z',
    summary: 'Updated platform description and app list',
  },
  {
    id: 'ACT-002',
    pageId: 'PAGE-004',
    actorId: 'JAP',
    actorName: 'Jose Padilla',
    action: 'updated',
    timestamp: '2025-01-09T11:20:00Z',
    summary: 'Added new endpoints and error codes',
  },
  {
    id: 'ACT-003',
    pageId: 'PAGE-010',
    actorId: 'JAP',
    actorName: 'Jose Padilla',
    action: 'created',
    timestamp: '2025-01-08T16:00:00Z',
    summary: 'Created draft for webhook documentation',
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * Build a tree structure from flat pages array
 */
export function buildPageTree(pages: WikiPage[], spaceId?: string): WikiPageTreeNode[] {
  const filteredPages = spaceId
    ? pages.filter((p) => p.spaceId === spaceId && p.status !== 'archived')
    : pages.filter((p) => p.status !== 'archived');

  const pageMap = new Map<string, WikiPageTreeNode>();
  const rootPages: WikiPageTreeNode[] = [];

  // First pass: create all nodes
  filteredPages.forEach((page) => {
    pageMap.set(page.id, { ...page, children: [], level: 0 });
  });

  // Second pass: build hierarchy
  filteredPages.forEach((page) => {
    const node = pageMap.get(page.id)!;
    if (page.parentPageId) {
      const parent = pageMap.get(page.parentPageId);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        rootPages.push(node);
      }
    } else {
      rootPages.push(node);
    }
  });

  // Sort by title
  const sortTree = (nodes: WikiPageTreeNode[]) => {
    nodes.sort((a, b) => a.title.localeCompare(b.title));
    nodes.forEach((node) => sortTree(node.children));
  };
  sortTree(rootPages);

  return rootPages;
}

/**
 * Get a page by space key and slug
 */
export function getPageBySlug(spaceKey: string, slug: string): WikiPage | undefined {
  const space = wikiSpaces.find((s) => s.key === spaceKey);
  if (!space) return undefined;

  return wikiPages.find((p) => p.spaceId === space.id && p.slug === slug);
}

/**
 * Get all pages in a space
 */
export function getSpacePages(spaceId: string): WikiPage[] {
  return wikiPages.filter((p) => p.spaceId === spaceId && p.status !== 'archived');
}

/**
 * Search pages by query
 */
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

/**
 * Get recent pages (sorted by update time)
 */
export function getRecentPages(limit: number = 10): WikiPage[] {
  return [...wikiPages]
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

/**
 * Get starred pages
 */
export function getStarredPages(): WikiPage[] {
  return wikiPages.filter((p) => p.starred && p.status === 'published');
}

/**
 * Get space by key
 */
export function getSpaceByKey(key: string): WikiSpace | undefined {
  return wikiSpaces.find((s) => s.key === key);
}

/**
 * Get tag by ID
 */
export function getTagById(id: string): WikiTag | undefined {
  return wikiTags.find((t) => t.id === id);
}

/**
 * Get page breadcrumb trail
 */
export function getPageBreadcrumbs(pageId: string): WikiPage[] {
  const breadcrumbs: WikiPage[] = [];
  let currentPage = wikiPages.find((p) => p.id === pageId);

  while (currentPage) {
    breadcrumbs.unshift(currentPage);
    if (currentPage.parentPageId) {
      currentPage = wikiPages.find((p) => p.id === currentPage!.parentPageId);
    } else {
      currentPage = undefined;
    }
  }

  return breadcrumbs;
}

/**
 * Get page activity
 */
export function getPageActivity(pageId: string): WikiActivity[] {
  return wikiActivities
    .filter((a) => a.pageId === pageId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
