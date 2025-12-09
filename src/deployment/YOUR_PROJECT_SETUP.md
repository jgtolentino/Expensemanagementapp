# 🚀 Your Supabase Project - Ready to Import!

## ✅ **Project Confirmed**

```
Project ID:  hpegxxklscpboucovbug
Project URL: https://hpegxxklscpboucovbug.supabase.co
Status:      ✅ Connected
SQL Schema:  ✅ Deployed (Tables created)
```

---

## 🔑 **Step 1: Get Your Service Role Key (2 minutes)**

You're currently at: **Project Settings → Edge Functions → Secrets**

**But you need the API key, not Edge Function secrets!**

### **Go to the correct location:**

1. In your Supabase dashboard, click **Settings** (⚙️ icon in left sidebar)
2. Click **API** (not "Edge Functions")
3. Scroll down to **Project API keys** section
4. Find the **`service_role`** key (it says "secret" next to it)
5. Click **Copy** button

**It should look like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhw...
```

⚠️ **Important:** Use the `service_role` key, NOT the `anon` key!

---

## 📝 **Step 2: Create .env File (1 minute)**

```bash
# Navigate to deployment folder
cd deployment

# Copy template
cp .env.example .env

# Edit the file
nano .env  # or use vim, code, notepad, etc.
```

**Paste your SERVICE_ROLE_KEY:**

```env
SUPABASE_URL=https://hpegxxklscpboucovbug.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
DEFAULT_COMPANY_ID=00000000-0000-0000-0000-000000000001
```

**Save and exit:**
- In nano: `Ctrl+O`, `Enter`, `Ctrl+X`
- In vim: `:wq`

---

## 🚀 **Step 3: Run the Import (1 minute)**

```bash
# Make sure you're in the deployment folder
cd deployment

# Run the ETL script
python etl_import.py
```

**You'll see:**
```
🚀🚀🚀 TBWA PPM - ETL IMPORT PIPELINE 🚀🚀🚀

Connecting to Supabase: https://hpegxxklscpboucovbug.supabase.co
Company ID: 00000000-0000-0000-0000-000000000001

⚠️  WARNING: This will insert/update data in your database!

Continue? (yes/no): 
```

**Type:** `yes` and press Enter

---

## 📊 **Expected Output**

```
📂 STEP 1: IMPORTING PROJECTS/PORTFOLIOS
Found 3 portfolios to import...
   ✅ Finance Operations Portfolio
   ✅ Compliance & Risk Management
   ✅ Business Intelligence & Analytics

✅ Successfully processed 3 portfolios.

🔄 BUILDING LOOKUP MAPS
🔄 Fetching map for project_portfolio...
   ✅ Found 3 project_portfolio records

⚠️  STEP 2: IMPORTING RISK REGISTER
Found 8 risks to import...
   ✅ RISK-001: Tax Filing Deadline Miss
   ✅ RISK-002: Incomplete Financial Records
   ✅ RISK-003: Bank Reconciliation Errors
   ✅ RISK-004: GL Posting Delays
   ✅ RISK-005: Regulatory Compliance Changes
   ✅ RISK-006: Audit Findings Impact
   ✅ RISK-007: BI Dashboard Data Quality
   ✅ RISK-008: Resource Availability

✅ Successfully inserted 8 risks.

⏱️  STEP 3: IMPORTING TIME ENTRIES
Found 14 time entries to import...
   ✅ TIME-001: Accountant - 8.0h @ $85.0/h
   ✅ TIME-002: Accountant - 6.0h @ $85.0/h
   ✅ TIME-003: Junior Accountant - 4.0h @ $55.0/h
   ✅ TIME-004: Senior Accountant - 10.0h @ $95.0/h
   ✅ TIME-005: Senior Accountant - 6.0h @ $95.0/h
   ✅ TIME-006: Legal Counsel - 3.0h @ $150.0/h
   ✅ TIME-007: Tax Specialist - 12.0h @ $110.0/h
   ✅ TIME-008: Tax Specialist - 4.0h @ $110.0/h
   ✅ TIME-009: Controller - 5.0h @ $120.0/h
   ✅ TIME-010: Controller - 3.0h @ $120.0/h
   ✅ TIME-011: Finance Team - 16.0h @ $75.0/h
   ✅ TIME-012: Finance Team - 12.0h @ $75.0/h
   ✅ TIME-013: CFO - 6.0h @ $175.0/h
   ✅ TIME-014: CFO - 4.0h @ $175.0/h

✅ Successfully inserted 14 time entries.
📊 Total Hours: 99.0h
💰 Total Cost: $9,950.00

✅ STEP 4: PROCESSING CHECKLIST ITEMS
Found 24 checklist items to process...
Grouping into 6 tasks...
   ✅ TAX-001: 5 items
   ✅ TAX-002: 5 items
   ✅ TAX-003: 4 items
   ✅ CLOSE-001: 3 items
   ✅ CLOSE-002: 4 items
   ✅ CLOSE-003: 3 items

✅ Successfully processed checklists for 6 tasks.

============================================================
🎉 ETL IMPORT COMPLETE!
============================================================

📊 Summary:
  • Portfolios:    3
  • Risks:         8
  • Time Entries:  14
  • Total Cost:    $9,950.00

✅ Your database is now populated with production data!
🌐 You can now connect your React frontend to Supabase
```

---

## ✅ **Step 4: Verify Data (30 seconds)**

### **In Supabase Dashboard:**

1. Go to **Table Editor** (icon in left sidebar)
2. Click on **`project_portfolio`** → Should see 3 rows
3. Click on **`project_risk`** → Should see 8 rows
4. Click on **`account_analytic_line`** → Should see 14 rows

### **Or run SQL queries:**

Click **SQL Editor** → **New Query** → Run:

```sql
-- Check record counts
SELECT 
  (SELECT COUNT(*) FROM project_portfolio) as portfolios,
  (SELECT COUNT(*) FROM project_risk) as risks,
  (SELECT COUNT(*) FROM account_analytic_line) as time_entries;
```

**Expected result:**
```
portfolios | risks | time_entries
-----------+-------+-------------
     3     |   8   |     14
```

---

## 📊 **View Your Data**

### **Portfolio Summary:**

```sql
SELECT * FROM portfolio_summary;
```

**Shows:**
- Budget vs Actual spend
- Risk counts
- Utilization percentages

### **Risk Matrix:**

```sql
SELECT * FROM risk_matrix;
```

**Shows:**
- Risk distribution by probability/impact
- Exposure levels
- Risk counts per cell

### **Time Tracking:**

```sql
SELECT * FROM time_by_task ORDER BY total_cost DESC;
```

**Shows:**
- Hours and costs by task
- Billable vs non-billable
- Average rates

---

## 🎯 **Your Complete Setup**

```
✅ Supabase Project:     hpegxxklscpboucovbug
✅ Database Schema:      Deployed (3 tables)
✅ RLS Policies:         Active
✅ Helper Functions:     Installed
✅ Views:                Created
✅ Sample Data:          Ready to import

⏳ Next: Get service_role key → Create .env → Run import
```

---

## 🔗 **Quick Links for Your Project**

**Your Supabase Dashboard:**
https://supabase.com/dashboard/project/hpegxxklscpboucovbug

**Get API Keys:**
https://supabase.com/dashboard/project/hpegxxklscpboucovbug/settings/api

**Table Editor:**
https://supabase.com/dashboard/project/hpegxxklscpboucovbug/editor

**SQL Editor:**
https://supabase.com/dashboard/project/hpegxxklscpboucovbug/sql

---

## 🐛 **Troubleshooting**

### **"Invalid API key" error:**

```bash
# Make sure you copied the service_role key (not anon key)
# It should be much longer than the anon key
# Check your .env file:
cat .env
```

### **"Module not found" error:**

```bash
# Install dependencies
pip install pandas supabase python-dotenv
```

### **"CSV file not found" error:**

```bash
# Check files exist
ls -la data/

# Should show:
# sample_portfolios.csv
# sample_risks.csv  
# sample_time_entries.csv
```

---

## 🎉 **You're Ready!**

**Current status:**
```
[████████████████████████████░░] 95%

✅ Project connected
✅ Schema deployed
✅ Scripts configured
⏳ Get API key
⏳ Run import
```

**One command away from a fully populated database! 🚀**

---

**Next Step:** Get your `service_role` key from Settings → API → service_role → Copy
