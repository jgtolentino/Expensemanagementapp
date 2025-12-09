# 🚀 Quick Start Guide - Production Deployment

## ⚡ **5-Minute Setup**

### **Prerequisites Checklist**

```bash
✅ Python 3.8+ installed
✅ Supabase account created
✅ Supabase project created
✅ CSV files ready
```

---

## 📝 **Step 1: Install Dependencies (1 min)**

```bash
# Navigate to deployment folder
cd deployment

# Install Python packages
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed pandas-2.0.0 supabase-2.0.0 python-dotenv-1.0.0
```

---

## 🔑 **Step 2: Configure Environment (2 min)**

### **A. Get Your Supabase Keys**

1. Go to: https://supabase.com/dashboard
2. Open your project
3. Click **Settings** → **API**
4. Copy two values:
   - **Project URL**: `https://pczdvipmohybviiiabee.supabase.co`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...` (long secret key)

### **B. Create .env File**

```bash
# Copy template
cp .env.example .env

# Edit with your editor
nano .env  # or vim, code, etc.
```

**Paste your credentials:**
```env
SUPABASE_URL=https://pczdvipmohybviiiabee.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
DEFAULT_COMPANY_ID=00000000-0000-0000-0000-000000000001
```

**Save and exit.**

---

## 🗄️ **Step 3: Create Database Tables (1 min)**

### **A. Open Supabase SQL Editor**

1. Go to your Supabase project
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### **B. Run Schema Script**

```sql
-- Copy entire contents of: 001_create_tables.sql
-- Paste into SQL Editor
-- Click "Run" button (or press Cmd/Ctrl + Enter)
```

**Expected output:**
```
NOTICE: ✅ Tables created successfully!
NOTICE: ✅ RLS policies enabled
NOTICE: ✅ Helper functions created
NOTICE: ✅ Views created
```

### **C. Verify Tables Created**

Run this verification query:
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('project_portfolio', 'project_risk', 'account_analytic_line');
```

**Should return 3 rows.**

---

## 📂 **Step 4: Prepare CSV Files (30 sec)**

### **Option A: Use Sample Data**

```bash
# Sample files are already in deployment/data/ folder
# Ready to import!
```

### **Option B: Use Your Own Data**

```bash
# Place your CSV files in deployment/data/
# Ensure filenames match exactly:
data/
├── ppm-oca.xlsx - Portfolios.csv
├── ppm-oca.xlsx - Risk_Register.csv
├── ppm-oca.xlsx - Time_Entries.csv
└── ppm-oca.xlsx - Checklist_Items.csv
```

**Column Requirements:**

**Portfolios.csv:**
- Portfolio Name (required)
- Description (optional)
- Budget (optional)
- Start Date (optional)
- End Date (optional)

**Risk_Register.csv:**
- Risk ID (required, e.g., RISK-001)
- Risk Title (required)
- Portfolio Name (required - must match Portfolios.csv)
- Probability (Low/Medium/High/Very Low/Very High)
- Impact (Low/Medium/High/Very Low/Very High)
- Status (Open/Mitigated/Accepted/Closed)

**Time_Entries.csv:**
- Entry ID (required, e.g., TIME-001)
- Task ID (required, e.g., TAX-001)
- Employee (required)
- Date (required, YYYY-MM-DD)
- Hours (required, decimal)
- Hourly Rate (required, decimal)
- Billable (TRUE/FALSE)

---

## 🚀 **Step 5: Run Import (1 min)**

```bash
# Execute ETL script
python etl_import.py
```

**Interactive prompts:**
```
🚀🚀🚀 TBWA PPM - ETL IMPORT PIPELINE 🚀🚀🚀

Connecting to Supabase: https://pczdvipmohybviiiabee.supabase.co
Company ID: 00000000-0000-0000-0000-000000000001

⚠️  WARNING: This will insert/update data in your database!

Continue? (yes/no): yes  ← Type 'yes' and press Enter
```

**Watch the progress:**
```
📂 STEP 1: IMPORTING PROJECTS/PORTFOLIOS
Found 3 portfolios to import...
   ✅ Finance Operations Portfolio
   ✅ Compliance & Risk Management
   ✅ Business Intelligence & Analytics
✅ Successfully processed 3 portfolios.

⚠️  STEP 2: IMPORTING RISK REGISTER
Found 8 risks to import...
   ✅ RISK-001: Tax Filing Deadline Miss
   ✅ RISK-002: Incomplete Financial Records
   ...
✅ Successfully inserted 8 risks.

⏱️  STEP 3: IMPORTING TIME ENTRIES
Found 14 time entries to import...
   ✅ TIME-001: Accountant - 8h @ $85/h
   ✅ TIME-002: Accountant - 6h @ $85/h
   ...
✅ Successfully inserted 14 time entries.
📊 Total Hours: 99.0h
💰 Total Cost: $9,950.00

✅ STEP 4: PROCESSING CHECKLIST ITEMS
Found 24 checklist items to process...
   ✅ TAX-001: 5 items
   ✅ TAX-002: 5 items
   ...
✅ Successfully processed checklists for 6 tasks.

🎉 ETL IMPORT COMPLETE!

📊 Summary:
  • Portfolios:    3
  • Risks:         8
  • Time Entries:  14
  • Total Cost:    $9,950.00

✅ Your database is now populated with production data!
```

---

## ✅ **Step 6: Verify Data (30 sec)**

### **Run Validation Queries in Supabase:**

```sql
-- 1. Check record counts
SELECT 
  (SELECT COUNT(*) FROM project_portfolio) as portfolios,
  (SELECT COUNT(*) FROM project_risk) as risks,
  (SELECT COUNT(*) FROM account_analytic_line) as time_entries;

-- Expected: 3 portfolios, 8 risks, 14 time_entries

-- 2. View portfolio summary
SELECT * FROM portfolio_summary;

-- 3. View risk matrix
SELECT * FROM risk_matrix;

-- 4. View time by task
SELECT * FROM time_by_task;
```

**All queries should return data!**

---

## 🎉 **Success!**

You now have:

✅ **3 tables** created in Supabase  
✅ **8 risks** imported with exposure levels  
✅ **3 portfolios** with budgets ($1.92M total)  
✅ **14 time entries** ($9,950 total cost)  
✅ **24 checklist items** stored  
✅ **Auto-calculated** risk scores  
✅ **Helper views** for reporting  

---

## 🔧 **Troubleshooting**

### **Error: "Module not found"**
```bash
# Install dependencies again
pip install pandas supabase python-dotenv
```

### **Error: "Invalid API key"**
```bash
# Check .env file has correct SERVICE_ROLE_KEY
# NOT the anon key!
# Should start with: eyJhbGciOiJIUzI1NiIs...
```

### **Error: "Table does not exist"**
```bash
# Run SQL script first in Supabase SQL Editor
# File: 001_create_tables.sql
```

### **Error: "CSV file not found"**
```bash
# Ensure data/ folder exists in deployment/
# Check filenames match exactly (including spaces)
ls -la data/
```

### **Data not showing in app**
```bash
# Verify RLS policies allow SELECT
# Run this in Supabase:
SELECT * FROM project_portfolio;
# Should return data

# If empty, check company_id matches
SELECT * FROM project_portfolio WHERE company_id IS NULL;
```

---

## 🔄 **Re-running the Import**

The script is **idempotent** (safe to run multiple times):

```bash
# Portfolios: Will UPDATE existing records (upsert by name)
# Risks: Will INSERT new risks (may create duplicates if risk_id changes)
# Time Entries: Will INSERT new entries (may create duplicates if entry_id changes)
# Checklists: Will UPDATE existing records (upsert by task_id)
```

**To avoid duplicates:**
1. Delete existing data first:
   ```sql
   DELETE FROM account_analytic_line;
   DELETE FROM project_risk;
   DELETE FROM project_portfolio;
   ```

2. Run import again:
   ```bash
   python etl_import.py
   ```

---

## 📞 **Next Steps**

### **Connect React App to Database**

```typescript
// Install Supabase client
npm install @supabase/supabase-js

// Create client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pczdvipmohybviiiabee.supabase.co',
  'your-anon-key-here'  // Use ANON key, not service role!
);

// Fetch portfolios
const { data } = await supabase
  .from('project_portfolio')
  .select('*');
```

### **Enable Authentication**

Follow Supabase Auth guide:
- https://supabase.com/docs/guides/auth

### **Add More Data**

- Edit CSV files
- Re-run import
- New data appears automatically

---

## 🎯 **Summary**

**Total Time:** ~5 minutes  
**Complexity:** Low  
**Result:** Full production database with CSV data  

**You're ready to build! 🚀**

---

**Questions?** Check `/deployment/README.md` for detailed documentation.
