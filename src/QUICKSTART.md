# 🚀 TBWA Databank - Quick Start Guide

Get up and running in **5 minutes** with your **Vite + Supabase** stack.

---

## ✅ Your Current Setup

You already have:
- ✅ Supabase project created
- ✅ `.env.example` configured with credentials:
  - URL: `https://spdtwktxdalcfigzeqrz.supabase.co`
  - Key: `sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX`

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies (2 min)

```bash
make setup
```

This will:
- Install npm packages (React, Vite, Supabase, etc.)
- Create Python virtual environment
- Install Python dependencies (psycopg2, etc.)
- Create `.env.local` from template

✅ **Verify**: You should see `✅ Setup complete!`

---

### Step 2: Configure Environment (1 min)

Your `.env.local` should already have:

```bash
VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX
```

✅ **Verify**: Run `make check-env` to confirm

---

### Step 3: Setup Supabase Database (2 min)

This is the **most important step**. It creates all 18 tables and RLS policies.

```bash
make supabase-setup
```

You'll be prompted for your **Supabase database password**:

**How to get it:**
1. Go to https://supabase.com/dashboard
2. Select your project (`spdtwktxdalcfigzeqrz`)
3. Go to **Settings → Database**
4. Scroll to **Connection string**
5. Click **Copy** on the password field
6. Paste when prompted

The script will:
- ✅ Create 18 Odoo-compliant tables
- ✅ Apply Row-Level Security (RLS) policies
- ✅ Set up multi-tenant isolation
- ✅ Create audit trail

✅ **Verify**: You should see `✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!`

---

### Step 4: Seed Demo Data (30 sec)

```bash
make db-seed
```

This creates:
- 4 demo user accounts
- 3 sample clients
- 3 sample projects
- 15 sample tasks
- Sample expense reports
- Sample quotes
- Sample equipment

✅ **Verify**: You'll see demo account credentials printed

---

### Step 5: Start Development Server (10 sec)

```bash
make dev
```

Access at: **http://localhost:5173**

✅ **Verify**: You should see the login screen

---

## 🔑 Login

Use any of these demo accounts:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@tbwa.com | admin123 | Full access to all apps |
| Manager | manager@tbwa.com | manager123 | Manage projects, approve expenses |
| Employee | employee@tbwa.com | employee123 | Submit expenses, log time |
| Finance | finance@tbwa.com | finance123 | Financial approvals, reports |

---

## 🎯 What to Try

### Travel & Expense
1. Login as **employee@tbwa.com**
2. Click **Travel & Expense** → **Dashboard**
3. Click **Submit Expense**
4. Fill out expense report with sample data
5. Submit for approval

### Finance PPM
1. Click **Finance PPM** → **Dashboard**
2. View sample projects
3. Click **Jollibee National Campaign 2024**
4. See WBS hierarchy with tasks

### Gearroom
1. Click **Gearroom** → **Dashboard**
2. View equipment inventory
3. Click **Canon EOS R5**
4. Click **Checkout** to borrow equipment

### Rate Card Pro
1. Login as **manager@tbwa.com**
2. Click **Rate Card Pro** → **Dashboard**
3. View sample quotes
4. Create new quote for client

---

## 🛠️ Common Commands

```bash
# Development
make dev              # Start dev server
make build            # Build for production
make preview          # Preview production build

# Database
make supabase-setup   # Apply migrations (one-time)
make db-seed          # Seed demo data
make supabase-status  # Check Supabase connection

# Testing
make test             # Run all tests
make test-e2e         # Run E2E tests (Playwright)
make test-unit        # Run unit tests (Vitest)

# Code Quality
make lint             # Run linters
make fmt              # Format code
make clean            # Clean build artifacts

# Utilities
make check-env        # Validate environment
make info             # Show project info
make help             # Show all commands
```

---

## 🔍 Verify Everything Works

### 1. Check Supabase Tables

Go to Supabase dashboard:
1. https://supabase.com/dashboard
2. Select project `spdtwktxdalcfigzeqrz`
3. Go to **Table Editor**
4. You should see 18 tables:
   - `res_company`
   - `res_users`
   - `project_project`
   - `project_task`
   - `hr_expense_sheet`
   - `hr_expense`
   - etc.

### 2. Check RLS Policies

1. In Supabase, go to **Authentication → Policies**
2. Select any table (e.g., `project_task`)
3. You should see RLS policies like:
   - "Users can view accessible tasks"
   - "Users can create tasks"
   - etc.

### 3. Check Demo Data

1. In Supabase, go to **Table Editor → res_users**
2. You should see 4 demo users
3. Click **project_project** → See 3 sample projects

---

## 🐛 Troubleshooting

### Problem: "VITE_SUPABASE_URL not found"

**Solution:**
```bash
# Verify .env.local exists
ls -la .env.local

# If not, create it
make create-env

# Manually add your credentials
nano .env.local
```

### Problem: "Database connection error"

**Solution:**
1. Verify password is correct
2. Check Supabase dashboard → Settings → Database
3. Ensure your IP is allowed (it should be by default)
4. Try resetting database password in Supabase

### Problem: "Table already exists"

**Solution:**
You already ran migrations. To start fresh:
```bash
# ⚠️ WARNING: This deletes all data!
make supabase-reset

# Then re-run setup
make supabase-setup
make db-seed
```

### Problem: "Cannot connect to localhost:5173"

**Solution:**
```bash
# Check if Vite is running
ps aux | grep vite

# If not, start it
make dev

# Check if port is in use
lsof -i :5173
```

---

## 📚 Next Steps

### Learn the System
1. **Read the docs:**
   - [Architecture](docs/ARCHITECTURE.md) - System design
   - [Data Models](docs/DATA_MODELS.md) - Database schema
   - [Release Checklist](docs/RELEASE_CHECKLIST.md) - Production readiness

2. **Explore the code:**
   - `lib/supabase.ts` - Supabase client setup
   - `lib/api/expenses.ts` - Expense API functions
   - `lib/api/tasks.ts` - Task API functions
   - `components/te/` - Travel & Expense components

### Add Features
1. **Create new API functions:**
   - Copy `lib/api/expenses.ts` as template
   - Add to your component
   - Import and use

2. **Add new components:**
   - Follow existing pattern in `components/`
   - Use shadcn/ui components from `components/ui/`
   - Import Fluent Design styles from `styles/globals.css`

### Deploy to Production
1. **Review checklist:**
   ```bash
   cat docs/GO_LIVE_CHECKLIST.md
   ```

2. **Build and deploy:**
   ```bash
   make build
   # Deploy dist/ folder to your hosting (Vercel, Netlify, etc.)
   ```

---

## 🎉 You're Ready!

Your TBWA Agency Databank is now fully configured with:

✅ **8 Applications** - All apps accessible and working
✅ **18 Database Tables** - Odoo-compliant schema with RLS
✅ **4 Demo Users** - Test all user roles
✅ **Sample Data** - Projects, tasks, expenses, quotes
✅ **Production-Ready** - 85% complete, ready to customize

**Next:** Start customizing for your specific needs!

---

## 📞 Need Help?

- **Documentation:** Check `/docs` folder
- **Code Examples:** Look at existing components
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

Happy coding! 🚀
