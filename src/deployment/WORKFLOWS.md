# 🔄 TBWA PPM - ETL Workflows Guide

You now have **two different workflows** for importing data into your Supabase database. Choose the one that fits your needs!

---

## 📋 **Workflow Comparison**

| Feature | **Workflow A: Excel Upload** | **Workflow B: Direct CSV Import** |
|---------|------------------------------|-----------------------------------|
| **Best for** | Production, cloud-based | Local development, quick testing |
| **Excel file** | Uploaded to Supabase Storage | Stays on your computer |
| **CSV files** | Auto-generated from Excel | Manual export from Excel |
| **Steps** | 3 scripts (Upload → Extract → Import) | 1 script (Import only) |
| **Repeatable** | ✅ Yes - just re-run pipeline | ⚠️ Must re-export CSVs manually |
| **Team use** | ✅ Yes - shared storage | ❌ Each person needs Excel file |
| **Storage** | Uses Supabase Storage bucket | Uses local ./data/ folder |

---

## 🚀 **Workflow A: Excel Upload Pipeline (Production)**

**Best for:** Production environments, team collaboration, automated updates

### **Overview**

```
ppm-oca.xlsx (Local)
    ↓ upload_excel.py
Supabase Storage Bucket
    ↓ extract_csv.py
CSV Files (./data/)
    ↓ etl_import.py
Database Tables
```

### **Setup (One-time)**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env file
cp .env.example .env
nano .env  # Add your SUPABASE_SERVICE_ROLE_KEY

# 3. Place your Excel file
# Put ppm-oca.xlsx in ./data/ folder
```

### **Option 1: Run Full Pipeline (Easiest)**

```bash
# Runs all 3 steps automatically
python run_full_pipeline.py
```

**This will:**
1. ✅ Upload `ppm-oca.xlsx` to Supabase Storage bucket `make-7fad9ebd-etl`
2. ✅ Extract 4 CSV files (Portfolios, Risk_Register, Time_Entries, Checklist_Items)
3. ✅ Import data into database tables

### **Option 2: Run Individual Steps**

```bash
# Step 1: Upload Excel to cloud storage
python upload_excel.py

# Step 2: Download Excel and extract CSVs
python extract_csv.py

# Step 3: Import CSVs to database
python etl_import.py
```

### **Option 3: Interactive Menu**

```bash
python run_full_pipeline.py --menu
```

Choose:
- `1` - Run full pipeline
- `2` - Upload Excel only
- `3` - Extract CSVs only
- `4` - Import data only

### **Benefits**

✅ **Cloud-based**: Excel file stored in Supabase Storage (accessible from anywhere)  
✅ **Repeatable**: Update Excel → Re-run pipeline → Fresh data imported  
✅ **Team-friendly**: Multiple developers can access same Excel file  
✅ **Automated**: One command runs entire pipeline  
✅ **Auditable**: Storage keeps file history with timestamps  

### **File Structure**

```
deployment/
├── data/
│   ├── ppm-oca.xlsx                          ← Your Excel file (upload source)
│   ├── ppm-oca.xlsx - Portfolios.csv         ← Auto-generated
│   ├── ppm-oca.xlsx - Risk_Register.csv      ← Auto-generated
│   ├── ppm-oca.xlsx - Time_Entries.csv       ← Auto-generated
│   └── ppm-oca.xlsx - Checklist_Items.csv    ← Auto-generated
├── upload_excel.py         ← Step 1 script
├── extract_csv.py          ← Step 2 script
├── etl_import.py           ← Step 3 script
└── run_full_pipeline.py    ← Master orchestrator
```

---

## 📁 **Workflow B: Direct CSV Import (Quick & Simple)**

**Best for:** Local development, one-time imports, testing

### **Overview**

```
ppm-oca.xlsx (Excel)
    ↓ Manual export to CSV
CSV Files (./data/)
    ↓ etl_import.py
Database Tables
```

### **Setup**

```bash
# 1. Install dependencies
pip install pandas supabase python-dotenv

# 2. Create .env file
cp .env.example .env
nano .env  # Add your SUPABASE_SERVICE_ROLE_KEY

# 3. Export CSV files from Excel manually:
#    - Open ppm-oca.xlsx in Excel/Google Sheets
#    - Export each sheet as CSV
#    - Name files exactly:
#      • ppm-oca.xlsx - Portfolios.csv
#      • ppm-oca.xlsx - Risk_Register.csv
#      • ppm-oca.xlsx - Time_Entries.csv
#      • ppm-oca.xlsx - Checklist_Items.csv
#    - Place in ./data/ folder
```

### **Run Import**

```bash
# Single command to import all CSV files
python etl_import.py
```

### **Benefits**

✅ **Simple**: Only one script to run  
✅ **Fast**: No upload/download steps  
✅ **Local**: No cloud storage needed  
✅ **Lightweight**: Fewer dependencies  

### **Drawbacks**

⚠️ **Manual CSV export**: Must re-export CSVs when Excel changes  
⚠️ **Not team-friendly**: Each developer needs their own CSV files  
⚠️ **No version control**: Hard to track which Excel version was imported  

### **File Structure**

```
deployment/
├── data/
│   ├── ppm-oca.xlsx - Portfolios.csv         ← Manually exported
│   ├── ppm-oca.xlsx - Risk_Register.csv      ← Manually exported
│   ├── ppm-oca.xlsx - Time_Entries.csv       ← Manually exported
│   └── ppm-oca.xlsx - Checklist_Items.csv    ← Manually exported
└── etl_import.py       ← Import script
```

---

## 🎯 **Which Workflow Should I Use?**

### **Use Workflow A (Excel Upload Pipeline) if:**

✅ You're deploying to production  
✅ Multiple people need to run imports  
✅ You want to automate the entire process  
✅ Excel file updates frequently  
✅ You need audit trail of imports  

**Example:** Monthly financial data updates from accounting team

---

### **Use Workflow B (Direct CSV Import) if:**

✅ You're just testing locally  
✅ One-time data migration  
✅ You already have CSV files  
✅ Don't need cloud storage  
✅ Want simplest possible setup  

**Example:** Initial database seeding during development

---

## 🔧 **Troubleshooting**

### **"Bucket does not exist" error**

```bash
# The upload script will create the bucket automatically
# But if it fails, create manually in Supabase Dashboard:
# Storage → New Bucket → Name: "make-7fad9ebd-etl" → Private
```

### **"File not found" error**

```bash
# Make sure Excel file exists
ls -la data/ppm-oca.xlsx

# If missing, place your Excel file there
cp /path/to/your/ppm-oca.xlsx deployment/data/
```

### **"ModuleNotFoundError: openpyxl"**

```bash
# Install missing dependency
pip install openpyxl
```

### **CSV files have wrong column names**

Check that your Excel sheets match expected structure:

**Portfolios sheet should have:**
- Portfolio Name
- Description
- Budget
- Start Date
- End Date

**Risk_Register sheet should have:**
- Risk ID
- Risk Title
- Portfolio Name
- Category
- Probability
- Impact
- Status
- Owner
- Mitigation Plan
- Identified Date
- Review Date

**Time_Entries sheet should have:**
- Entry ID
- Task ID
- Employee
- Date
- Hours
- Hourly Rate
- Description
- Billable

**Checklist_Items sheet should have:**
- Task ID
- Checklist ID
- Item Content
- Is Completed

---

## 📊 **Sample Data**

Both workflows include sample data in `/deployment/data/`:

```
✅ sample_portfolios.csv      → 3 portfolios
✅ sample_risks.csv            → 8 risks
✅ sample_time_entries.csv     → 14 time entries
✅ sample_checklists.csv       → 24 checklist items
```

**To use sample data:**

```bash
# Option 1: Rename sample files
cd deployment/data
mv sample_portfolios.csv "ppm-oca.xlsx - Portfolios.csv"
mv sample_risks.csv "ppm-oca.xlsx - Risk_Register.csv"
mv sample_time_entries.csv "ppm-oca.xlsx - Time_Entries.csv"

# Option 2: Update etl_import.py to read from sample files
# Edit line 98 in etl_import.py:
df_projects = pd.read_csv('data/sample_portfolios.csv')
```

---

## 🎉 **Quick Start Commands**

### **For Production (Workflow A):**

```bash
cd deployment
pip install -r requirements.txt
cp .env.example .env
nano .env  # Add SUPABASE_SERVICE_ROLE_KEY
# Place ppm-oca.xlsx in ./data/
python run_full_pipeline.py
```

### **For Development (Workflow B):**

```bash
cd deployment
pip install pandas supabase python-dotenv
cp .env.example .env
nano .env  # Add SUPABASE_SERVICE_ROLE_KEY
# Export CSV files from Excel to ./data/
python etl_import.py
```

---

## 📚 **Related Documentation**

- **QUICKSTART.md** - 5-minute quick start guide
- **README.md** - Full technical documentation
- **YOUR_PROJECT_SETUP.md** - Project-specific setup for hpegxxklscpboucovbug
- **001_create_tables.sql** - Database schema (run first!)

---

**Need help?** Check the troubleshooting section or review the inline comments in each script!
