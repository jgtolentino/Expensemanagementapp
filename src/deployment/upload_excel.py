#!/usr/bin/env python3
"""
TBWA PPM - Excel File Upload Script
Uploads ppm-oca.xlsx to Supabase Storage bucket

Prerequisites:
  pip install supabase python-dotenv

Usage:
  1. Make sure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
  2. Place ppm-oca.xlsx in ./data/ folder
  3. Run: python upload_excel.py
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# ============================================
# 1. SETUP
# ============================================

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use Service Role Key to bypass RLS policies since the bucket is private
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# 2. CONFIG
# ============================================

BUCKET_NAME = "make-7fad9ebd-etl"  # Using TBWA naming convention
LOCAL_FILE_PATH = "data/ppm-oca.xlsx"  # The file on your computer
DESTINATION_PATH = "uploads/ppm-oca.xlsx"  # Where it goes in the bucket

# ============================================
# 3. BUCKET CREATION (IDEMPOTENT)
# ============================================

def ensure_bucket_exists():
    """Creates the bucket if it doesn't exist (safe to run multiple times)"""
    print(f"🔄 Checking if bucket '{BUCKET_NAME}' exists...")
    
    try:
        # List all buckets
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if BUCKET_NAME in bucket_names:
            print(f"   ✅ Bucket '{BUCKET_NAME}' already exists")
            return True
        else:
            print(f"   📦 Creating bucket '{BUCKET_NAME}'...")
            supabase.storage.create_bucket(
                BUCKET_NAME,
                options={
                    "public": False,  # Private bucket for security
                    "file_size_limit": 52428800  # 50MB limit
                }
            )
            print(f"   ✅ Bucket '{BUCKET_NAME}' created successfully")
            return True
            
    except Exception as e:
        print(f"   ❌ Error checking/creating bucket: {e}")
        return False

# ============================================
# 4. FILE UPLOAD
# ============================================

def upload_file():
    """Uploads the Excel file to Supabase Storage"""
    print(f"\n🚀 Uploading '{LOCAL_FILE_PATH}' to bucket '{BUCKET_NAME}'...")
    
    # Check if file exists locally
    if not os.path.exists(LOCAL_FILE_PATH):
        print(f"❌ Error: File not found at '{LOCAL_FILE_PATH}'")
        print(f"   Please place your ppm-oca.xlsx file in the ./data/ folder")
        return False
    
    file_size = os.path.getsize(LOCAL_FILE_PATH)
    print(f"   📄 File size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
    
    try:
        # Read file as binary
        with open(LOCAL_FILE_PATH, 'rb') as f:
            file_bytes = f.read()
            
        # Upload to Supabase Storage
        # 'upsert=True' overwrites the file if it already exists (good for updates)
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=DESTINATION_PATH,
            file=file_bytes,
            file_options={
                "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "upsert": "true"
            }
        )
        
        print(f"   ✅ Success! File uploaded")
        print(f"   🔗 Storage path: {BUCKET_NAME}/{DESTINATION_PATH}")
        
        # Generate a signed URL (valid for 1 hour)
        signed_url = supabase.storage.from_(BUCKET_NAME).create_signed_url(
            DESTINATION_PATH,
            expires_in=3600  # 1 hour
        )
        
        if signed_url:
            print(f"   🔐 Signed URL (expires in 1 hour):")
            print(f"      {signed_url['signedURL'][:80]}...")
        
        return True
            
    except Exception as e:
        print(f"   ❌ Error uploading file: {e}")
        return False

# ============================================
# 5. MAIN EXECUTION
# ============================================

def main():
    print("=" * 60)
    print("TBWA PPM - Excel File Upload to Supabase Storage")
    print("=" * 60)
    
    # Step 1: Ensure bucket exists
    if not ensure_bucket_exists():
        print("\n❌ Failed to create/access bucket. Exiting.")
        return
    
    # Step 2: Upload file
    if not upload_file():
        print("\n❌ Upload failed. Exiting.")
        return
    
    print("\n" + "=" * 60)
    print("🎉 UPLOAD COMPLETE!")
    print("=" * 60)
    print(f"\n✅ Your Excel file is now stored in Supabase Storage")
    print(f"📦 Bucket: {BUCKET_NAME}")
    print(f"📄 Path:   {DESTINATION_PATH}")
    print(f"\n💡 Next steps:")
    print(f"   1. Extract CSV sheets from Excel (use extract_csv.py)")
    print(f"   2. Run ETL import (use etl_import.py)")

if __name__ == "__main__":
    main()
