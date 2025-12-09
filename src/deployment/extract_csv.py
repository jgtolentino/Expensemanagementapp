#!/usr/bin/env python3
"""
TBWA PPM - CSV Extraction Script
Downloads Excel file from Supabase Storage and extracts CSV sheets

Prerequisites:
  pip install pandas openpyxl supabase python-dotenv

Usage:
  1. First run upload_excel.py to upload ppm-oca.xlsx
  2. Run: python extract_csv.py
  3. CSV files will be created in ./data/ folder
"""

import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# ============================================
# 1. SETUP
# ============================================

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# 2. CONFIG
# ============================================

BUCKET_NAME = "make-7fad9ebd-etl"
REMOTE_FILE_PATH = "uploads/ppm-oca.xlsx"
LOCAL_EXCEL_PATH = "data/ppm-oca.xlsx"
OUTPUT_DIR = "data"

# Sheet name mappings (Excel sheet → CSV filename)
SHEET_MAPPINGS = {
    "Portfolios": "ppm-oca.xlsx - Portfolios.csv",
    "Risk_Register": "ppm-oca.xlsx - Risk_Register.csv",
    "Time_Entries": "ppm-oca.xlsx - Time_Entries.csv",
    "Checklist_Items": "ppm-oca.xlsx - Checklist_Items.csv"
}

# ============================================
# 3. DOWNLOAD FROM STORAGE
# ============================================

def download_excel():
    """Downloads Excel file from Supabase Storage"""
    print(f"📥 Downloading '{REMOTE_FILE_PATH}' from bucket '{BUCKET_NAME}'...")
    
    try:
        # Download file bytes
        response = supabase.storage.from_(BUCKET_NAME).download(REMOTE_FILE_PATH)
        
        if not response:
            print(f"   ❌ File not found in storage")
            print(f"   💡 Run 'python upload_excel.py' first to upload the file")
            return False
        
        # Save to local file
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        with open(LOCAL_EXCEL_PATH, 'wb') as f:
            f.write(response)
        
        file_size = len(response)
        print(f"   ✅ Downloaded {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
        print(f"   💾 Saved to: {LOCAL_EXCEL_PATH}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error downloading file: {e}")
        return False

# ============================================
# 4. EXTRACT CSV SHEETS
# ============================================

def extract_csvs():
    """Extracts CSV files from Excel sheets"""
    print(f"\n📊 Extracting CSV sheets from '{LOCAL_EXCEL_PATH}'...")
    
    if not os.path.exists(LOCAL_EXCEL_PATH):
        print(f"   ❌ Excel file not found at '{LOCAL_EXCEL_PATH}'")
        return False
    
    try:
        # Read Excel file
        excel_file = pd.ExcelFile(LOCAL_EXCEL_PATH, engine='openpyxl')
        
        print(f"   📋 Found {len(excel_file.sheet_names)} sheets:")
        for sheet in excel_file.sheet_names:
            print(f"      • {sheet}")
        
        print(f"\n   🔄 Extracting sheets...")
        
        extracted_count = 0
        
        for sheet_name, csv_filename in SHEET_MAPPINGS.items():
            if sheet_name in excel_file.sheet_names:
                # Read sheet
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                # Save as CSV
                csv_path = os.path.join(OUTPUT_DIR, csv_filename)
                df.to_csv(csv_path, index=False)
                
                print(f"      ✅ {sheet_name} → {csv_filename} ({len(df)} rows)")
                extracted_count += 1
            else:
                print(f"      ⚠️  Sheet '{sheet_name}' not found in Excel file")
        
        print(f"\n   ✅ Extracted {extracted_count} CSV files")
        return True
        
    except Exception as e:
        print(f"   ❌ Error extracting CSVs: {e}")
        return False

# ============================================
# 5. VERIFY OUTPUT
# ============================================

def verify_csvs():
    """Verifies that CSV files were created and shows preview"""
    print(f"\n🔍 Verifying CSV files...")
    
    all_exist = True
    
    for sheet_name, csv_filename in SHEET_MAPPINGS.items():
        csv_path = os.path.join(OUTPUT_DIR, csv_filename)
        
        if os.path.exists(csv_path):
            file_size = os.path.getsize(csv_path)
            df = pd.read_csv(csv_path)
            
            print(f"\n   ✅ {csv_filename}")
            print(f"      Size:    {file_size:,} bytes")
            print(f"      Rows:    {len(df)}")
            print(f"      Columns: {len(df.columns)}")
            print(f"      Preview: {', '.join(df.columns[:5].tolist())}...")
        else:
            print(f"\n   ❌ {csv_filename} - NOT FOUND")
            all_exist = False
    
    return all_exist

# ============================================
# 6. MAIN EXECUTION
# ============================================

def main():
    print("=" * 60)
    print("TBWA PPM - CSV Extraction from Excel")
    print("=" * 60)
    
    # Step 1: Download Excel file from Supabase Storage
    if not download_excel():
        print("\n❌ Download failed. Exiting.")
        print("\n💡 Make sure you've run 'python upload_excel.py' first")
        return
    
    # Step 2: Extract CSV sheets
    if not extract_csvs():
        print("\n❌ Extraction failed. Exiting.")
        return
    
    # Step 3: Verify output
    if not verify_csvs():
        print("\n⚠️  Some CSV files are missing")
    
    print("\n" + "=" * 60)
    print("🎉 CSV EXTRACTION COMPLETE!")
    print("=" * 60)
    print(f"\n✅ CSV files are ready in the '{OUTPUT_DIR}/' folder")
    print(f"\n💡 Next step: Run 'python etl_import.py' to import data")

if __name__ == "__main__":
    main()
