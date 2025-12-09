# 🎉 Complete Setup Guide - TBWA PPM Data Import

## ✅ **What You Have Now**

You now have a **complete, production-ready ETL pipeline** with **two different workflows**!

### **Your Supabase Project**
```
✅ Project ID:   hpegxxklscpboucovbug
✅ Project URL:  https://hpegxxklscpboucovbug.supabase.co
✅ Database:     PostgreSQL with Odoo-compatible schema
✅ Storage:      Ready for Excel file uploads
✅ RLS:          Multi-tenant row-level security enabled
```

### **Your Files**

```
deployment/
├── 📋 Documentation
│   ├── COMPLETE_SETUP_GUIDE.md    ← You are here!
│   ├── WORKFLOWS.md               ← Comparison of two workflows
│   ├── QUICKSTART.md              ← 5-minute quick start
│   ├── YOUR_PROJECT_SETUP.md      ← Project-specific guide
│   └── README.md                  ← Full technical docs
│
├── 🗄️  Database Schema
│   └── 001_create_tables.sql      ← Run this first in Supabase SQL Editor
│
├── 🚀 Workflow A: Excel Upload Pipeline (Production)
│   ├── run_full_pipeline.py       ← Master orchestrator (run this!)
│   ├── upload_excel.py            ← Step 1: Upload Excel to cloud
│   ├── extract_csv.py             ← Step 2: Extract CSVs from Excel
│   └── etl_import.py              ← Step 3: Import data to database
│
├── 📁 Workflow B: Direct CSV Import (Development)
│   └── etl_import.py              ← Single script for CSV import
│
├── 📊 Sample Data
│   └── data/
│       ├── sample_portfolios.csv
│       ├── sample_risks.csv
│       ├── sample_time_entries.csv
│       └── sample_checklists.csv
│
└── ⚙️  Configuration
    ├── .env.example               ← Template (copy to .env)
    └── requirements.txt           ← Python dependencies
```

---

## 🎯 **Choose Your Workflow**

### **Workflow A: Excel Upload Pipeline** ⭐ Recommended for Production

**Perfect for:**
- ✅ Production deployments
- ✅ Team collaboration
- ✅ Automated updates
- ✅ Monthly data refreshes

**Process:**
```
Your Excel File → Supabase Storage → Extract CSVs → Import to Database
```

**Commands:**
```bash
# One command runs everything!
python run_full_pipeline.py
```

**[See detailed guide →](WORKFLOWS.md#workflow-a-excel-upload-pipeline-production)**

---

### **Workflow B: Direct CSV Import** 📁 Simple & Quick

**Perfect for:**
- ✅ Local development
- ✅ One-time imports
- ✅ Quick testing

**Process:**
```
Export CSVs from Excel → Import to Database
```

**Commands:**
```bash
# Single import command
python etl_import.py
```

**[See detailed guide →](WORKFLOWS.md#workflow-b-direct-csv-import-quick--simple)**

---

## 🚀 **Quick Start (5 Minutes)**

### **Step 1: Database Schema (1 minute)**

```bash
# 1. Go to Supabase SQL Editor
open https://supabase.com/dashboard/project/hpegxxklscpboucovbug/sql

# 2. Open 001_create_tables.sql in your editor
# 3. Copy entire file contents
# 4. Paste into SQL Editor
# 5. Click "Run"

# Expected result: "Success. No rows returned"
```

✅ **This creates:**
- `project_portfolio` table (portfolios/projects)
- `project_risk` table (risk register)
- `account_analytic_line` table (time tracking)
- Helper functions (`calculate_risk_score`, etc.)
- Views (`portfolio_summary`, `risk_matrix`, `time_by_task`)

---

### **Step 2: Environment Setup (1 minute)**

```bash
# Navigate to deployment folder
cd deployment

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Get your Service Role Key:
# 1. Go to: https://supabase.com/dashboard/project/hpegxxklscpboucovbug/settings/api
# 2. Scroll to "Project API keys"
# 3. Copy the "service_role" key (click eye icon)

# Edit .env and paste your key
nano .env  # or vim, code, notepad, etc.

# Your .env should look like:
# SUPABASE_URL=https://hpegxxklscpboucovbug.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# DEFAULT_COMPANY_ID=00000000-0000-0000-0000-000000000001
```

---

### **Step 3A: Run Full Pipeline (3 minutes)** ⭐ Recommended

```bash
# Make sure ppm-oca.xlsx is in ./data/ folder
ls -la data/ppm-oca.xlsx

# Run the complete pipeline
python run_full_pipeline.py

# Type 'yes' when prompted
# Watch it upload → extract → import!
```

**This will:**
1. Upload `ppm-oca.xlsx` to Supabase Storage bucket
2. Download and extract 4 CSV files
3. Import all data into database tables
4. Show summary with record counts

---

### **Step 3B: OR Use Sample Data (2 minutes)** 📊

If you don't have `ppm-oca.xlsx` yet, use the included sample data:

```bash
# Rename sample files to match expected names
cd data
mv sample_portfolios.csv "ppm-oca.xlsx - Portfolios.csv"
mv sample_risks.csv "ppm-oca.xlsx - Risk_Register.csv"
mv sample_time_entries.csv "ppm-oca.xlsx - Time_Entries.csv"
cd ..

# Run import
python etl_import.py

# Type 'yes' when prompted
```

**Sample data includes:**
- 3 portfolios (Finance Ops, Compliance, BI)
- 8 risks across portfolios
- 14 time entries totaling $9,950
- 24 checklist items for 6 tasks

---

### **Step 4: Verify Import (1 minute)** ✅

#### **Option A: Supabase Table Editor**

```bash
# Open Table Editor
open https://supabase.com/dashboard/project/hpegxxklscpboucovbug/editor

# Check each table:
# • project_portfolio    → Should have 3 rows
# • project_risk         → Should have 8 rows
# • account_analytic_line → Should have 14 rows
```

#### **Option B: SQL Query**

```sql
-- Run in SQL Editor
SELECT 
  (SELECT COUNT(*) FROM project_portfolio) as portfolios,
  (SELECT COUNT(*) FROM project_risk) as risks,
  (SELECT COUNT(*) FROM account_analytic_line) as time_entries;

-- Expected result:
-- portfolios | risks | time_entries
-- -----------+-------+-------------
--      3     |   8   |     14
```

#### **Option C: View Portfolio Summary**

```sql
SELECT * FROM portfolio_summary;
```

**Expected result:**
```
name                          | budget_total | actual_spend | remaining_budget | budget_utilization_percent
-----------------------------+--------------+--------------+------------------+---------------------------
Finance Operations Portfolio  |   850000.00  |    6120.00   |    843880.00     |           0.72
Compliance & Risk Management  |   450000.00  |       0.00   |    450000.00     |           0.00
Business Intelligence         |   620000.00  |    3830.00   |    616170.00     |           0.62
```

---

## 📊 **What Data Gets Imported**

### **Portfolios Table** (`project_portfolio`)

Stores projects and portfolios with budget tracking:

```sql
SELECT id, name, budget_total, start_date, end_date, active
FROM project_portfolio;
```

**Fields:**
- `id` - UUID primary key
- `name` - Portfolio name (unique)
- `description` - Text description
- `is_portfolio` - Boolean flag
- `budget_total` - Total allocated budget
- `start_date` / `end_date` - Project timeline
- `active` - Current status
- `company_id` - Multi-tenant identifier

---

### **Risks Table** (`project_risk`)

Stores risk register with automatic scoring:

```sql
SELECT risk_id, title, probability, impact, risk_score, exposure_level
FROM project_risk
ORDER BY risk_score DESC;
```

**Fields:**
- `id` - UUID primary key
- `risk_id` - Human-readable ID (e.g., RISK-001)
- `title` - Risk description
- `portfolio_id` - Links to project_portfolio
- `category` - Risk category (Financial, Operational, etc.)
- `probability` - Very Low | Low | Medium | High | Very High
- `impact` - Very Low | Low | Medium | High | Very High
- `risk_score` - Auto-calculated (1-25)
- `exposure_level` - Auto-calculated (Low/Medium/High/Critical)
- `status` - Open | Mitigated | Closed
- `owner` - Person responsible
- `mitigation_plan` - Action plan

**Auto-calculated fields update via triggers:**
```sql
-- Example: High probability (4) × Medium impact (3) = Risk score 12
-- Exposure level automatically set to "Medium"
```

---

### **Time Entries Table** (`account_analytic_line`)

Stores time tracking with cost calculations:

```sql
SELECT entry_id, employee_name, hours, hourly_rate, total_cost, billable
FROM account_analytic_line
ORDER BY total_cost DESC;
```

**Fields:**
- `id` - UUID primary key
- `entry_id` - Human-readable ID (e.g., TIME-001)
- `task_id` - Links to task (e.g., TAX-001)
- `employee_name` - Person who worked
- `date` - Date of work
- `hours` - Hours worked
- `hourly_rate` - Rate per hour
- `total_cost` - Auto-calculated (hours × rate)
- `description` - Work description
- `billable` - Boolean flag
- `company_id` - Multi-tenant identifier

**Auto-calculated field:**
```sql
total_cost = hours * hourly_rate
-- Example: 8 hours × $85/hr = $680
```

---

### **Checklist Items** (JSON in KV Store)

Stored as JSON arrays in `kv_store_7fad9ebd`:

```sql
SELECT key, value 
FROM kv_store_7fad9ebd 
WHERE key LIKE 'checklist_%';
```

**Format:**
```json
{
  "key": "checklist_TAX-001",
  "value": [
    {
      "id": "CHECK-001",
      "content": "Gather Q4 financial statements",
      "is_checked": true
    },
    {
      "id": "CHECK-002",
      "content": "Calculate depreciation",
      "is_checked": false
    }
  ]
}
```

---

## 🔍 **Useful SQL Queries**

### **Portfolio Budget Overview**

```sql
SELECT * FROM portfolio_summary;
```

Shows budget vs actual, utilization %, and risk counts.

---

### **Risk Matrix**

```sql
SELECT * FROM risk_matrix;
```

Groups risks by probability/impact with exposure levels.

---

### **Time Tracking by Task**

```sql
SELECT * FROM time_by_task 
ORDER BY total_cost DESC;
```

Shows total hours, costs, and billable split by task.

---

### **Top 10 Highest Risks**

```sql
SELECT risk_id, title, probability, impact, risk_score, exposure_level, status
FROM project_risk
ORDER BY risk_score DESC
LIMIT 10;
```

---

### **Budget Utilization Alert (Over 75%)**

```sql
SELECT name, budget_total, actual_spend, 
       ROUND((actual_spend / NULLIF(budget_total, 0) * 100)::numeric, 2) as utilization_pct
FROM project_portfolio
WHERE (actual_spend / NULLIF(budget_total, 0)) > 0.75
ORDER BY utilization_pct DESC;
```

---

### **Open Risks by Category**

```sql
SELECT category, COUNT(*) as risk_count, 
       AVG(risk_score) as avg_score
FROM project_risk
WHERE status = 'Open'
GROUP BY category
ORDER BY risk_count DESC;
```

---

## 🔄 **Updating Data**

### **Option 1: Full Re-import**

```bash
# Update your ppm-oca.xlsx file
# Then re-run the pipeline
python run_full_pipeline.py

# The import uses upsert logic (update if exists, insert if new)
# Based on unique constraints:
# - Portfolios: name
# - Risks: risk_id
# - Time entries: entry_id
```

---

### **Option 2: Incremental Updates**

```bash
# Add new rows to your CSV files
# Run import again - new rows will be added
python etl_import.py
```

---

### **Option 3: Manual SQL Updates**

```sql
-- Update a specific portfolio budget
UPDATE project_portfolio
SET budget_total = 900000
WHERE name = 'Finance Operations Portfolio';

-- Update risk status
UPDATE project_risk
SET status = 'Mitigated', mitigation_plan = 'New control implemented'
WHERE risk_id = 'RISK-001';

-- Add new time entry
INSERT INTO account_analytic_line (
  entry_id, task_id, employee_name, date, hours, hourly_rate, billable, company_id
) VALUES (
  'TIME-015', 'TAX-001', 'Senior Accountant', '2024-12-09', 6, 95, true,
  '00000000-0000-0000-0000-000000000001'
);
```

---

## 🐛 **Troubleshooting**

### **"Invalid API key" Error**

```bash
# Make sure you're using SERVICE_ROLE_KEY (not ANON_KEY)
# Check your .env file
cat .env

# Should show:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# (starts with eyJ and is very long)

# If you see YOUR_SERVICE_ROLE_KEY_HERE, you need to update it:
# 1. Go to Project Settings → API
# 2. Copy the service_role key
# 3. Paste into .env
```

---

### **"Table does not exist" Error**

```bash
# You need to run the SQL schema first
# 1. Open 001_create_tables.sql
# 2. Copy all contents
# 3. Paste into Supabase SQL Editor
# 4. Click "Run"
# 5. Should see "Success. No rows returned"
```

---

### **"File not found" Error**

```bash
# Check that Excel/CSV files exist
ls -la data/

# For Workflow A (Excel), you need:
# - ppm-oca.xlsx

# For Workflow B (CSV), you need:
# - ppm-oca.xlsx - Portfolios.csv
# - ppm-oca.xlsx - Risk_Register.csv
# - ppm-oca.xlsx - Time_Entries.csv
# - ppm-oca.xlsx - Checklist_Items.csv

# If missing, use sample data:
mv data/sample_portfolios.csv "data/ppm-oca.xlsx - Portfolios.csv"
mv data/sample_risks.csv "data/ppm-oca.xlsx - Risk_Register.csv"
mv data/sample_time_entries.csv "data/ppm-oca.xlsx - Time_Entries.csv"
```

---

### **"Module not found" Error**

```bash
# Install all dependencies
pip install -r requirements.txt

# Or install individually:
pip install pandas supabase python-dotenv openpyxl
```

---

### **Data Imported But Not Showing in Tables**

```bash
# Check RLS policies - service role key should bypass RLS
# But if using ANON key, you'll need to add policies

# Quick check - count rows using service role
python -c "
from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
print('Portfolios:', len(sb.table('project_portfolio').select('*').execute().data))
print('Risks:', len(sb.table('project_risk').select('*').execute().data))
print('Time:', len(sb.table('account_analytic_line').select('*').execute().data))
"
```

---

## 🎯 **Next Steps**

### **1. Connect React Frontend**

```typescript
// Install Supabase client
npm install @supabase/supabase-js

// Create client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hpegxxklscpboucovbug.supabase.co',
  'your-anon-key'  // Use ANON key in frontend (not service role!)
);

// Fetch portfolios
const { data: portfolios } = await supabase
  .from('project_portfolio')
  .select('*');

// Fetch risk matrix view
const { data: riskMatrix } = await supabase
  .from('risk_matrix')
  .select('*');
```

---

### **2. Set Up Scheduled Imports**

```bash
# Create a cron job to run imports daily
crontab -e

# Add line (runs at 2 AM daily):
0 2 * * * cd /path/to/deployment && python run_full_pipeline.py
```

---

### **3. Add More Data Sources**

Extend the ETL to import:
- Invoices & billing
- Resource allocations
- Project tasks
- Client information

---

### **4. Build Dashboards**

Use the views to create analytics:
- Portfolio health dashboard
- Risk heatmap
- Time tracking reports
- Budget burn-down charts

---

## 📚 **Complete Documentation Index**

```
deployment/
├── COMPLETE_SETUP_GUIDE.md    ← You are here! Complete A-Z guide
├── WORKFLOWS.md               ← Compare Excel vs CSV workflows
├── QUICKSTART.md              ← 5-minute quick start
├── YOUR_PROJECT_SETUP.md      ← Project-specific hpegxxklscpboucovbug guide
└── README.md                  ← Full technical documentation
```

**Read in this order:**
1. **COMPLETE_SETUP_GUIDE.md** (this file) - Overview and quick start
2. **YOUR_PROJECT_SETUP.md** - Your specific project setup
3. **WORKFLOWS.md** - Choose your import workflow
4. **QUICKSTART.md** - Fast track setup
5. **README.md** - Deep dive technical details

---

## ✅ **Checklist**

Before running imports, make sure:

```
✅ Database schema deployed (001_create_tables.sql)
✅ .env file created with SUPABASE_SERVICE_ROLE_KEY
✅ Python dependencies installed (pip install -r requirements.txt)
✅ Excel file or CSV files in ./data/ folder
✅ Tested Supabase connection (can access Table Editor)
```

**Ready to import:**

```bash
# For production (Excel pipeline):
python run_full_pipeline.py

# For development (CSV import):
python etl_import.py
```

---

## 🎉 **You're All Set!**

You now have everything you need to import your TBWA PPM data into Supabase!

**Your complete ETL ecosystem:**
- ✅ Database schema with auto-calculations
- ✅ Two flexible import workflows
- ✅ Sample data for testing
- ✅ Production-ready scripts
- ✅ Comprehensive documentation

**Questions?** Check the troubleshooting section or review the inline comments in each script!

**Happy importing! 🚀**
