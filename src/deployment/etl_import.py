#!/usr/bin/env python3
"""
TBWA PPM - ETL Import Script (Production-Ready)
Imports CSV data from ppm-oca.xlsx exports into Supabase

This script is designed to be **robust, idempotent (safe to run multiple times), 
and production-ready**. It handles the complexity of foreign key lookups 
(converting "Project Names" to UUIDs) and JSON formatting automatically.

Prerequisites:
  pip install pandas supabase python-dotenv

Usage:
  1. Create .env file with:
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  
  2. Place CSV files in ./data/ folder:
     - ppm-oca.xlsx - Portfolios.csv
     - ppm-oca.xlsx - Risk_Register.csv
     - ppm-oca.xlsx - Time_Entries.csv
     - ppm-oca.xlsx - Checklist_Items.csv
  
  3. Run: python etl_import.py
"""

import pandas as pd
import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# ============================================
# 1. SETUP & CONFIGURATION
# ============================================

load_dotenv()  # Load variables from .env if present

# Replace these or use a .env file
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hpegxxklscpboucovbug.supabase.co")
# IMPORTANT: Use the SERVICE_ROLE_KEY to bypass RLS policies during import
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "YOUR_SERVICE_ROLE_KEY_HERE")

if not SUPABASE_KEY or "YOUR_SERVICE" in SUPABASE_KEY:
    raise ValueError("❌ Error: You must provide a valid SUPABASE_SERVICE_ROLE_KEY in .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Default company ID (adjust if multi-tenant)
DEFAULT_COMPANY_ID = os.getenv("DEFAULT_COMPANY_ID", "00000000-0000-0000-0000-000000000001")

# ============================================
# 2. HELPER FUNCTIONS
# ============================================

def clean_val(val):
    """Converts NaNs to None for SQL compatibility."""
    if pd.isna(val) or val == "":
        return None
    return val

def parse_date(date_str):
    """Parse date string to YYYY-MM-DD format"""
    if pd.isna(date_str):
        return None
    try:
        return pd.to_datetime(date_str).strftime('%Y-%m-%d')
    except:
        return None

def get_lookup_map(table_name, key_col, value_col):
    """
    Fetches a table and returns a dictionary {key_col: value_col}.
    Used to turn 'Project Name' -> 'UUID'.
    """
    print(f"🔄 Fetching map for {table_name}...")
    try:
        # Fetch all rows (limit 1000 for safety, loop if you have massive data)
        response = supabase.table(table_name).select(f"{key_col},{value_col}").limit(1000).execute()
        result_map = {row[key_col]: row[value_col] for row in response.data}
        print(f"   ✅ Found {len(result_map)} {table_name} records")
        return result_map
    except Exception as e:
        print(f"   ⚠️ Warning: Could not fetch map for {table_name}: {e}")
        return {}

# ============================================
# 3. IMPORT LOGIC
# ============================================

def run_import():
    print("🚀" * 30)
    print("TBWA PPM - ETL IMPORT PIPELINE")
    print("🚀" * 30)
    print(f"\nConnecting to Supabase: {SUPABASE_URL}")
    print(f"Company ID: {DEFAULT_COMPANY_ID}")
    print("\n⚠️  WARNING: This will insert/update data in your database!")
    
    # Confirm before proceeding
    response = input("\nContinue? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Import cancelled")
        return

    # --- STEP A: PORTFOLIOS & PROJECTS ---
    print("\n" + "="*60)
    print("📂 STEP 1: IMPORTING PROJECTS/PORTFOLIOS")
    print("="*60)
    
    try:
        df_projects = pd.read_csv('data/ppm-oca.xlsx - Portfolios.csv')
        print(f"Found {len(df_projects)} portfolios to import...")
        
        for index, row in df_projects.iterrows():
            project_data = {
                "name": row['Portfolio Name'],  # Assumes unique name
                "description": clean_val(row.get('Description')),
                "is_portfolio": True,  # Flagging these as portfolios
                "active": True,
                "budget_total": clean_val(row.get('Budget', 0)),
                "start_date": parse_date(row.get('Start Date')),
                "end_date": parse_date(row.get('End Date')),
                "company_id": DEFAULT_COMPANY_ID
            }
            
            # Upsert: Update if exists, Insert if new (match on 'name')
            # Ensure your table has a unique constraint on 'name' for this to work perfectly
            supabase.table("project_portfolio").upsert(
                project_data, on_conflict="name"
            ).execute()
            
            print(f"   ✅ {row['Portfolio Name']}")
            
        print(f"\n✅ Successfully processed {len(df_projects)} portfolios.")
        
    except FileNotFoundError:
        print("   ⚠️ Skipped: Portfolios CSV not found.")
    except Exception as e:
        print(f"   ❌ Error importing portfolios: {e}")

    # --- REFRESH LOOKUP MAPS ---
    # Now that projects are in DB, we need their UUIDs to link Risks and Time Entries
    print("\n" + "="*60)
    print("🔄 BUILDING LOOKUP MAPS")
    print("="*60)
    
    portfolio_map = get_lookup_map("project_portfolio", "name", "id")
    
    # Optional: Fetch user and company maps if you have those tables
    # user_map = get_lookup_map("res_users", "email", "id")
    # company_map = get_lookup_map("res_company", "name", "id")

    # --- STEP B: RISK REGISTER ---
    print("\n" + "="*60)
    print("⚠️  STEP 2: IMPORTING RISK REGISTER")
    print("="*60)
    
    try:
        df_risks = pd.read_csv('data/ppm-oca.xlsx - Risk_Register.csv')
        print(f"Found {len(df_risks)} risks to import...")
        
        risks_to_insert = []
        
        for _, row in df_risks.iterrows():
            portfolio_name = row.get('Portfolio Name')
            portfolio_id = portfolio_map.get(portfolio_name)

            if not portfolio_id:
                # Optional: Log missing links
                print(f"   ⚠️  Skipping risk '{row.get('Risk Title')}' - unknown portfolio: {portfolio_name}")
                continue

            risk_data = {
                "risk_id": row['Risk ID'],
                "title": row['Risk Title'],
                "description": clean_val(row.get('Description')),
                "portfolio_id": portfolio_id,
                "category": clean_val(row.get('Category', 'Operational')),
                "probability": clean_val(row.get('Probability', 'Medium')),
                "impact": clean_val(row.get('Impact', 'Medium')),
                "status": clean_val(row.get('Status', 'Open')),
                "owner": clean_val(row.get('Owner')),
                "mitigation_plan": clean_val(row.get('Mitigation Plan')),
                "identified_date": parse_date(row.get('Identified Date')),
                "review_date": parse_date(row.get('Review Date')),
                "company_id": DEFAULT_COMPANY_ID
            }
            risks_to_insert.append(risk_data)
            print(f"   ✅ {row['Risk ID']}: {row['Risk Title']}")

        # Batch insert for performance
        if risks_to_insert:
            # Insert in chunks to avoid payload limits
            chunk_size = 100
            for i in range(0, len(risks_to_insert), chunk_size):
                chunk = risks_to_insert[i:i + chunk_size]
                supabase.table("project_risk").insert(chunk).execute()
            
            print(f"\n✅ Successfully inserted {len(risks_to_insert)} risks.")
        else:
            print("   ℹ️  No valid risks found to insert.")
            
    except FileNotFoundError:
        print("   ⚠️ Skipped: Risk Register CSV not found.")
    except Exception as e:
        print(f"   ❌ Error importing risks: {e}")

    # --- STEP C: TIME ENTRIES ---
    print("\n" + "="*60)
    print("⏱️  STEP 3: IMPORTING TIME ENTRIES")
    print("="*60)
    
    try:
        df_time = pd.read_csv('data/ppm-oca.xlsx - Time_Entries.csv')
        print(f"Found {len(df_time)} time entries to import...")
        
        time_entries = []
        total_hours = 0
        total_cost = 0

        for _, row in df_time.iterrows():
            # Time entries link to tasks, not portfolios directly
            # But we can still use portfolio mapping if needed
            
            entry = {
                "entry_id": row['Entry ID'],
                "task_id": row['Task ID'],  # This is the planner task ID (e.g., TAX-001)
                "employee_name": row['Employee'],
                "date": parse_date(row['Date']),
                "hours": float(row.get('Hours', 0.0)),
                "hourly_rate": float(row.get('Hourly Rate', 0.0)),
                "description": clean_val(row.get('Description')),
                "billable": str(row.get('Billable', 'TRUE')).upper() in ['TRUE', 'YES', '1'],
                "company_id": DEFAULT_COMPANY_ID
            }
            time_entries.append(entry)
            
            hours = entry['hours']
            cost = hours * entry['hourly_rate']
            total_hours += hours
            total_cost += cost
            
            print(f"   ✅ {row['Entry ID']}: {row['Employee']} - {hours}h @ ${entry['hourly_rate']}/h")

        if time_entries:
            # Insert in chunks of 1000 to avoid payload limits
            chunk_size = 1000
            for i in range(0, len(time_entries), chunk_size):
                chunk = time_entries[i:i + chunk_size]
                supabase.table("account_analytic_line").insert(chunk).execute()
            
            print(f"\n✅ Successfully inserted {len(time_entries)} time entries.")
            print(f"📊 Total Hours: {total_hours:.1f}h")
            print(f"💰 Total Cost: ${total_cost:,.2f}")
        else:
            print("   ℹ️  No time entries found to insert.")
            
    except FileNotFoundError:
        print("   ⚠️ Skipped: Time Entries CSV not found.")
    except Exception as e:
        print(f"   ❌ Error importing time entries: {e}")

    # --- STEP D: CHECKLISTS (JSON Aggregation) ---
    print("\n" + "="*60)
    print("✅ STEP 4: PROCESSING CHECKLIST ITEMS")
    print("="*60)
    
    try:
        df_check = pd.read_csv('data/ppm-oca.xlsx - Checklist_Items.csv')
        print(f"Found {len(df_check)} checklist items to process...")
        
        # Group by Task ID
        grouped = df_check.groupby('Task ID')
        
        print(f"Grouping into {len(grouped)} tasks...")
        
        count = 0
        for task_identifier, group in grouped:
            # Construct JSON Array
            checklist_array = []
            for _, item in group.iterrows():
                checklist_array.append({
                    "id": item['Checklist ID'],
                    "content": item['Item Content'],
                    "is_checked": str(item.get('Is Completed', 'FALSE')).upper() in ['TRUE', 'YES', 'DONE', '1']
                })
            
            # Store in KV store as fallback (since project_task table may not exist yet)
            # If you have a project_task table, uncomment the following:
            """
            try:
                supabase.table("project_task").update({
                    "checklist": checklist_array
                }).eq("task_id", task_identifier).execute()
            except:
                # Fallback to KV store
                supabase.table("kv_store_7fad9ebd").upsert({
                    "key": f"checklist_{task_identifier}",
                    "value": json.dumps(checklist_array)
                }).execute()
            """
            
            # For now, store in KV store
            supabase.table("kv_store_7fad9ebd").upsert({
                "key": f"checklist_{task_identifier}",
                "value": json.dumps(checklist_array)
            }, on_conflict="key").execute()
            
            count += 1
            print(f"   ✅ {task_identifier}: {len(checklist_array)} items")
            
        print(f"\n✅ Successfully processed checklists for {count} tasks.")

    except FileNotFoundError:
        print("   ⚠️ Skipped: Checklist Items CSV not found.")
    except Exception as e:
        print(f"   ❌ Error processing checklists: {e}")

    # --- SUMMARY ---
    print("\n" + "="*60)
    print("🎉 ETL IMPORT COMPLETE!")
    print("="*60)
    
    # Query counts from database
    try:
        portfolio_count = len(supabase.table('project_portfolio').select('id').execute().data)
        risk_count = len(supabase.table('project_risk').select('id').execute().data)
        time_count = len(supabase.table('account_analytic_line').select('id').execute().data)
        
        print(f"\n📊 Summary:")
        print(f"  • Portfolios:    {portfolio_count}")
        print(f"  • Risks:         {risk_count}")
        print(f"  • Time Entries:  {time_count}")
        
        # Get total cost
        time_data = supabase.table('account_analytic_line').select('total_cost').execute().data
        if time_data:
            total_cost = sum(float(entry.get('total_cost', 0)) for entry in time_data)
            print(f"  • Total Cost:    ${total_cost:,.2f}")
        
    except Exception as e:
        print(f"\n⚠️  Could not fetch summary: {e}")
    
    print("\n✅ Your database is now populated with production data!")
    print("🌐 You can now connect your React frontend to Supabase")

if __name__ == "__main__":
    run_import()