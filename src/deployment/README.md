# 🚀 TBWA PPM - Production Deployment Guide

## 📋 **Overview**

This folder contains scripts to deploy your Figma Make prototype to a **real Supabase database** with full CSV data import.

**What's included:**
- ✅ SQL schema creation script
- ✅ Python ETL import script
- ✅ Sample .env template
- ✅ Data validation queries

---

## 🎯 **Two-Track Approach**

### **Track 1: Figma Make (Current) ✅ WORKING NOW**

Your app is **already functional** in Figma Make using TypeScript data files:
- `/lib/data/csv-production-data.ts` - All CSV data in TypeScript
- `/lib/config/feature-flags.ts` - All features enabled
- Dashboard fully operational with Risk Matrix, Financials, Portfolios

**You can use this immediately without any database setup!**

### **Track 2: Production Deployment (This Folder) 🚀 FOR LATER**

When you're ready to deploy to a real Supabase instance (outside Figma Make):
1. Run the SQL script to create tables
2. Run the Python script to import CSV data
3. Connect your React app to the live database

---

## 📦 **Prerequisites**

### **For Supabase Setup:**
- Supabase account (https://supabase.com)
- Project created with PostgreSQL database
- Service Role API key (from Project Settings → API)

### **For Python Script:**
- Python 3.8+
- pip (Python package manager)

---

## 🔧 **Step-by-Step Deployment**

### **Step 1: Prepare Your Environment**

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your credentials:**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

   **Where to find these:**
   - Go to your Supabase project
   - Settings → API
   - Copy "Project URL" and "service_role" key

---

### **Step 2: Create Database Tables**

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy contents of `001_create_tables.sql`**

3. **Paste and run the script**

4. **Verify tables created:**
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('project_portfolio', 'project_risk', 'account_analytic_line');
   ```

   Should return 3 rows.

---

### **Step 3: Prepare CSV Files**

1. **Create `data/` folder:**
   ```bash
   mkdir data
   ```

2. **Place your CSV files in the folder:**
   ```
   data/
   ├── ppm-oca.xlsx - Portfolios.csv
   ├── ppm-oca.xlsx - Risk_Register.csv
   ├── ppm-oca.xlsx - Time_Entries.csv
   └── ppm-oca.xlsx - Checklist_Items.csv
   ```

3. **Verify CSV format matches expected columns:**

   **Portfolios.csv should have:**
   - Portfolio Name
   - Description
   - Budget
   - Start Date
   - End Date

   **Risk_Register.csv should have:**
   - Risk ID (e.g., RISK-001)
   - Risk Title
   - Description
   - Portfolio Name
   - Category
   - Probability (Low/Medium/High/Very High/Very Low)
   - Impact (Low/Medium/High/Very High/Very Low)
   - Status (Open/Mitigated/Accepted/Closed)
   - Owner
   - Mitigation Plan
   - Identified Date
   - Review Date

   **Time_Entries.csv should have:**
   - Entry ID (e.g., TIME-001)
   - Task ID (e.g., TAX-001)
   - Employee
   - Date
   - Hours
   - Hourly Rate
   - Description
   - Billable (TRUE/FALSE)

   **Checklist_Items.csv should have:**
   - Task ID
   - Checklist ID
   - Item Content
   - Is Completed (TRUE/FALSE)

---

### **Step 4: Run ETL Import**

1. **Run the import script:**
   ```bash
   python etl_import.py
   ```

2. **Confirm when prompted:**
   ```
   Continue? (yes/no): yes
   ```

3. **Watch the progress:**
   ```
   📁 IMPORTING PORTFOLIOS
   ✅ Finance Operations Portfolio
   ✅ Compliance & Risk Management
   ✅ Business Intelligence & Analytics

   ⚠️  IMPORTING RISKS
   ✅ RISK-001: Tax Filing Deadline Miss
   ✅ RISK-002: Incomplete Financial Records
   ...

   ⏱️  IMPORTING TIME ENTRIES
   ✅ TIME-001: Accountant - 8h @ $85/h
   ✅ TIME-002: Accountant - 6h @ $85/h
   ...

   ✅ PROCESSING CHECKLIST ITEMS
   ✅ TAX-001: 5 items
   ✅ TAX-002: 5 items
   ...

   🎉 IMPORT COMPLETE!
   ```

---

### **Step 5: Verify Data Import**

Run these queries in Supabase SQL Editor:

```sql
-- Check portfolio count
SELECT COUNT(*) as portfolio_count FROM project_portfolio;
-- Should return 3

-- Check risk count
SELECT COUNT(*) as risk_count FROM project_risk;
-- Should return 8

-- Check time entries
SELECT COUNT(*) as time_entries FROM account_analytic_line;
-- Should return 14

-- Check total cost
SELECT SUM(total_cost) as total_cost FROM account_analytic_line;
-- Should return ~$9,950

-- View portfolio summary
SELECT * FROM portfolio_summary;

-- View risk matrix
SELECT * FROM risk_matrix;

-- View time by task
SELECT * FROM time_by_task;
```

---

## 🔌 **Connect React App to Database**

### **Option 1: Use Supabase Client (Recommended)**

1. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase client:**
   ```typescript
   // /lib/supabase/client.ts
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. **Fetch data in components:**
   ```typescript
   // Fetch portfolios
   const { data: portfolios } = await supabase
     .from('project_portfolio')
     .select('*');

   // Fetch risks
   const { data: risks } = await supabase
     .from('project_risk')
     .select('*')
     .eq('status', 'Open');

   // Fetch time entries
   const { data: timeEntries } = await supabase
     .from('account_analytic_line')
     .select('*')
     .order('date', { ascending: false });
   ```

### **Option 2: Use TypeScript Data Files (Current)**

Keep using `/lib/data/csv-production-data.ts` - it already works!

This is perfect for:
- ✅ Development/prototyping
- ✅ Offline work
- ✅ Fast iteration
- ✅ No database setup needed

---

## 🧪 **Validation Queries**

After import, run these to validate data integrity:

```sql
-- 1. Check for orphaned risks (no portfolio)
SELECT COUNT(*) FROM project_risk WHERE portfolio_id IS NULL;
-- Should be minimal

-- 2. Check risk score calculations
SELECT 
  risk_id, 
  probability, 
  impact, 
  risk_score,
  exposure_level
FROM project_risk
ORDER BY risk_score DESC;

-- 3. Check time entry totals by task
SELECT 
  task_id,
  COUNT(*) as entries,
  SUM(hours) as total_hours,
  SUM(total_cost) as total_cost
FROM account_analytic_line
GROUP BY task_id
ORDER BY total_cost DESC;

-- 4. Check budget utilization
SELECT 
  name,
  budget_total,
  actual_spend,
  remaining_budget,
  budget_utilization_percent
FROM portfolio_summary
ORDER BY budget_utilization_percent DESC;

-- 5. Check risk exposure distribution
SELECT 
  exposure_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM project_risk
WHERE status != 'Closed'
GROUP BY exposure_level
ORDER BY 
  CASE exposure_level
    WHEN 'Critical' THEN 1
    WHEN 'High' THEN 2
    WHEN 'Medium' THEN 3
    WHEN 'Low' THEN 4
  END;
```

---

## 🔒 **Security Considerations**

### **RLS Policies**

The SQL script includes basic Row Level Security policies. For production:

1. **Set up user authentication** (Supabase Auth)
2. **Configure company_id properly** for multi-tenancy
3. **Test RLS policies:**
   ```sql
   -- Test as user (not service role)
   SET ROLE authenticated;
   SET app.current_company_id = 'your-company-uuid';
   SELECT * FROM project_portfolio; -- Should only see own company
   ```

### **API Keys**

- ⚠️ **Never commit** `.env` file to git
- ⚠️ **Never use** Service Role key in frontend
- ✅ **Use** Anon key for frontend (respects RLS)
- ✅ **Use** Service Role only for backend/ETL scripts

---

## 📊 **Expected Data Counts**

After successful import:

```
Portfolios:        3 records
Risks:             8 records
Time Entries:      14 records
Checklist Items:   24 items (embedded in tasks)

Total Budget:      $1,920,000
Total Spend:       $9,950
Total Hours:       99 hours
Budget Utilization: 0.52%

Risk Breakdown:
  Critical: 0
  High:     3
  Medium:   4
  Low:      1

Open Risks:        5
Mitigated Risks:   2
Accepted Risks:    1
```

---

## 🐛 **Troubleshooting**

### **"Table does not exist" error**
- Ensure SQL script ran successfully
- Check table names match: `project_portfolio`, `project_risk`, `account_analytic_line`

### **"Permission denied" error**
- Verify you're using Service Role key (not Anon key)
- Check RLS policies aren't blocking the import

### **"File not found" error**
- Ensure `data/` folder exists
- Check CSV filenames match exactly (including spaces)

### **"Invalid UUID" error**
- Check `DEFAULT_COMPANY_ID` in script is valid UUID
- Generate new UUID: `SELECT gen_random_uuid();` in SQL editor

### **Data not appearing in app**
- Verify data inserted: `SELECT COUNT(*) FROM project_risk;`
- Check frontend is querying correct table names
- Ensure RLS policies allow SELECT for authenticated users

---

## 📞 **Support**

### **Files in this folder:**
- `001_create_tables.sql` - Database schema
- `etl_import.py` - Python import script
- `requirements.txt` - Python dependencies
- `.env.example` - Environment template
- `README.md` - This file

### **Figma Make files (already working):**
- `/lib/data/csv-production-data.ts` - TypeScript data layer
- `/lib/config/feature-flags.ts` - Feature toggles
- `/components/planner/*` - Planner UI components
- `/FinancePPMApp.tsx` - Dashboard

---

## ✅ **Deployment Checklist**

- [ ] Python 3.8+ installed
- [ ] pip dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created with Supabase credentials
- [ ] SQL script executed in Supabase
- [ ] Tables verified (3 tables created)
- [ ] CSV files placed in `data/` folder
- [ ] CSV columns match expected format
- [ ] ETL script executed (`python etl_import.py`)
- [ ] Data counts verified (3 portfolios, 8 risks, 14 time entries)
- [ ] Validation queries passed
- [ ] RLS policies tested
- [ ] React app connected to database (optional - TypeScript files work too!)

---

## 🎉 **Success!**

Once deployed, your Finance PPM app will have:

✅ **Full database backend** with PostgreSQL  
✅ **Production CSV data** imported  
✅ **Row Level Security** enabled  
✅ **Helper functions** for calculations  
✅ **Materialized views** for performance  
✅ **Real-time capabilities** (Supabase Realtime)  

**Your prototype is now production-ready! 🚀**

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0  
**Status:** ✅ READY FOR DEPLOYMENT
