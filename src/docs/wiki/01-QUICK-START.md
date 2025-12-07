# Quick Start Guide

Get the Scout × SariCoach Retail OS up and running in **15 minutes**.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **npm 9+** (comes with Node.js)
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **Supabase Account** ([Sign up](https://supabase.com/))
- ✅ **Code Editor** (VS Code recommended)

**Optional (for backend work):**
- Supabase CLI ([Install](https://supabase.com/docs/guides/cli))
- Odoo CE/OCA 18 instance

---

## Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-org/scout-dashboard.git
cd scout-dashboard/scout-dashboard-frontend

# Or if you only have the frontend folder
cd scout-dashboard-frontend
```

---

## Step 2: Install Dependencies

```bash
npm install
```

**This installs:**
- React 18 + TypeScript
- TanStack Query (server state)
- Zustand (client state)
- Recharts (charts)
- Tailwind CSS (styling)
- Supabase client

**Installation time:** ~2-3 minutes

---

## Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**Edit `.env` with your actual values:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (Backend Gateway)
VITE_API_BASE_URL=https://your-api.example.com/api

# Optional: Environment
VITE_ENV=development
```

### Where to Find These Values

#### Supabase URL and Anon Key

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### API Base URL

**If using Supabase Edge Functions directly:**
```bash
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
```

**If using a custom API gateway:**
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

**For local development (if backend is running locally):**
```bash
VITE_API_BASE_URL=http://localhost:54321/functions/v1
```

---

## Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 432 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Open your browser:** http://localhost:3000

---

## Step 5: Verify Installation

You should see:

✅ **Top Bar** with "Scout Dashboard" logo  
✅ **Left Sidebar** with 7 navigation links  
✅ **Main Content** with Dashboard Overview page  
✅ **KPI Cards** (may show loading state if backend not connected)  

**If you see errors:**
- Check browser console (F12)
- Verify `.env` file has correct values
- See [Troubleshooting Guide](./16-TROUBLESHOOTING.md)

---

## Step 6: (Optional) Setup Backend

### Option A: Use Existing Supabase Project

If you already have a Supabase project with Scout schema:

1. ✅ Ensure all migrations are applied
2. ✅ Edge Functions are deployed
3. ✅ Environment variables are set

### Option B: Setup New Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
cd ../supabase
supabase db reset

# Deploy Edge Functions
supabase functions deploy

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### Option C: Local Development (Supabase Local)

```bash
# Start Supabase locally
cd ../supabase
supabase start

# Apply migrations
supabase db reset

# Edge Functions will be available at:
# http://localhost:54321/functions/v1
```

**Then update `.env`:**
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:54321/functions/v1
```

---

## Step 7: Test API Connection

### Test Dashboard Endpoint

**Open browser console (F12) and run:**

```javascript
// Test Supabase connection
const { data, error } = await window.supabase.auth.getSession()
console.log('Session:', data, error)

// Test API endpoint
const response = await fetch('https://your-project.supabase.co/functions/v1/scout-dashboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({})
})
const data = await response.json()
console.log('Dashboard data:', data)
```

**Expected response:**
```json
{
  "overview": {
    "total_baskets": 6410,
    "total_revenue": 425000,
    "unique_customers": 10000,
    "active_stores": 250,
    ...
  },
  "top_categories": [...],
  "top_regions": [...],
  "top_products": [...]
}
```

---

## Step 8: (Optional) Create Test User

### Using Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email/password
4. Click **Create User**

### Using SQL

```sql
-- Insert a demo user into scout.user_roles
insert into scout.user_roles (user_id, tenant_id, role, metadata)
values (
  'user-uuid-from-auth',
  (select id from scout.tenants where code = 'demo'),
  'analyst',
  '{}'::jsonb
);
```

### Sign In

On the frontend, you can sign in with:

```typescript
import { useAuth } from '@/contexts/AuthContext'

const { signIn } = useAuth()
await signIn('demo@example.com', 'password123')
```

---

## Next Steps

Now that you're up and running:

### Learn the Codebase

1. **Understand the Architecture** → [Architecture Overview](./02-ARCHITECTURE.md)
2. **Explore the Types** → [Type Reference](./14-TYPE-REFERENCE.md)
3. **Review State Management** → [State Management](./06-STATE-MANAGEMENT.md)

### Build Your First Feature

1. **Read the Frontend Dev Guide** → [Frontend Dev Guide](./04-FRONTEND-DEV.md)
2. **Check Available Components** → [Component Library](./07-COMPONENT-LIBRARY.md)
3. **Learn API Integration** → [API Integration Guide](./05-API-INTEGRATION.md)

### Explore the Data

1. **Review Database Schema** → [Database Schema](./08-DATABASE-SCHEMA.md)
2. **Test Edge Functions** → [Edge Functions](./09-EDGE-FUNCTIONS.md)
3. **Understand Odoo Integration** → [Odoo Integration](./10-ODOO-INTEGRATION.md)

---

## Common Issues

### "Cannot find module '@/lib/supabase'"

**Solution:** TypeScript path alias not configured.

Check `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Missing environment variables"

**Solution:** Ensure `.env` file exists and has all required variables.

```bash
# Check if .env exists
ls -la .env

# If not, copy from example
cp .env.example .env
```

### "API requests failing with CORS errors"

**Solution:** Configure CORS in Supabase Edge Functions.

Each Edge Function should have:
```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

return new Response(JSON.stringify(data), {
  headers: { ...headers, 'Content-Type': 'application/json' },
})
```

### "Blank page, no errors"

**Solution:** Check browser console (F12) for React errors.

Common causes:
- Missing environment variables
- TypeScript errors (check `npm run build`)
- Auth context issues (user not signed in)

---

## Development Workflow

### Making Changes

1. **Edit a file** in `/src`
2. **Save** (Ctrl+S)
3. **Browser auto-refreshes** (Vite HMR)
4. **Check browser console** for errors

### Creating a New Page

```bash
# Create the page file
touch src/routes/MyNewPage.tsx

# Add route in App.tsx
# <Route path="/my-new-page" element={<MyNewPage />} />

# Add navigation link in SidebarNav.tsx
```

### Adding a New Component

```bash
# Create component file
touch src/components/charts/MyChart.tsx

# Import and use in a page
# import MyChart from '@/components/charts/MyChart'
```

### Running Type Checks

```bash
# Check TypeScript errors
npm run build

# Or use watch mode
npx tsc --watch --noEmit
```

---

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code (if using Prettier)
npm run format

# Type check
npx tsc --noEmit

# Install new dependency
npm install package-name

# Uninstall dependency
npm uninstall package-name
```

---

## Project Structure

```
scout-dashboard-frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component with routes
│   ├── index.css             # Global styles
│   │
│   ├── api/                  # API client layer
│   │   ├── client.ts         # HTTP client
│   │   └── scout.ts          # Scout API endpoints
│   │
│   ├── components/           # React components
│   │   ├── layout/           # Layout components
│   │   ├── charts/           # Chart components
│   │   └── ui/               # UI primitives
│   │
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Auth + RBAC
│   │
│   ├── hooks/                # Custom hooks
│   │   └── useScout.ts       # TanStack Query hooks
│   │
│   ├── lib/                  # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── store.ts          # Zustand store (legacy)
│   │   └── utils.ts          # Helper functions
│   │
│   ├── routes/               # Page components
│   │   ├── DashboardOverview.tsx
│   │   ├── TransactionTrends.tsx
│   │   └── ...
│   │
│   ├── stores/               # Zustand stores
│   │   └── filterStore.ts    # Global filter state
│   │
│   └── types/                # TypeScript types
│       ├── entities.ts       # Entity types
│       ├── analytics.ts      # Analytics types
│       └── filters.ts        # Filter types
│
├── public/                   # Static assets
├── .env                      # Environment variables (not in Git)
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── tailwind.config.js        # Tailwind config
```

---

## What's Next?

✅ **You're all set!** You now have a working Scout × SariCoach development environment.

**Recommended next steps:**

1. **Read the [Architecture Overview](./02-ARCHITECTURE.md)** to understand the system
2. **Follow the [Frontend Dev Guide](./04-FRONTEND-DEV.md)** to build your first feature
3. **Check the [Component Library](./07-COMPONENT-LIBRARY.md)** for available components

**Need help?** See the [Troubleshooting Guide](./16-TROUBLESHOOTING.md)

---

**Last Updated:** 2025-12-07  
**Estimated Time:** 15 minutes (excluding backend setup)
