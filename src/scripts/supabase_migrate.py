#!/usr/bin/env python3
"""
Apply Supabase migrations for TBWA Agency Databank
This script reads .env.local and applies all SQL migrations
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# Load environment from .env.local
load_dotenv('.env.local')

def get_database_url():
    """Extract database URL from Supabase URL"""
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    
    if not supabase_url:
        print("❌ Error: VITE_SUPABASE_URL not found in .env.local")
        sys.exit(1)
    
    # Extract project ref from Supabase URL
    # Format: https://PROJECT_REF.supabase.co
    project_ref = supabase_url.replace('https://', '').replace('.supabase.co', '')
    
    # Ask for database password
    print(f"📝 Supabase Project: {project_ref}")
    print("")
    print("To get your database password:")
    print("  1. Go to https://supabase.com/dashboard")
    print(f"  2. Select project: {project_ref}")
    print("  3. Go to Settings → Database")
    print("  4. Copy the password from 'Connection string'")
    print("")
    
    db_password = input("Enter your Supabase database password: ").strip()
    
    if not db_password:
        print("❌ Error: Password is required")
        sys.exit(1)
    
    # Construct connection string
    db_url = f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres"
    
    return db_url

def apply_migrations(db_url):
    """Apply all SQL migrations"""
    migrations_dir = Path('supabase/migrations')
    
    if not migrations_dir.exists():
        print(f"❌ Error: Migrations directory not found: {migrations_dir}")
        sys.exit(1)
    
    # Get all migration files
    migration_files = sorted(migrations_dir.glob('*.sql'))
    
    if not migration_files:
        print("⚠️  No migration files found")
        return
    
    print(f"📦 Found {len(migration_files)} migration(s)")
    print("")
    
    # Connect to database
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("✅ Connected to Supabase")
        print("")
        
        # Apply each migration
        for migration_file in migration_files:
            print(f"📄 Applying: {migration_file.name}...")
            
            try:
                with open(migration_file, 'r') as f:
                    sql = f.read()
                
                cursor.execute(sql)
                conn.commit()
                
                print(f"   ✅ Applied successfully")
                
            except Exception as e:
                conn.rollback()
                print(f"   ❌ Failed: {e}")
                print("")
                print("Migration failed. Previous migrations were applied successfully.")
                sys.exit(1)
        
        cursor.close()
        conn.close()
        
        print("")
        print("=" * 60)
        print("✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!")
        print("=" * 60)
        print("")
        print("Your Supabase database now has:")
        print("  • 18 Odoo-compliant tables")
        print("  • Row-Level Security (RLS) policies")
        print("  • Multi-tenant isolation")
        print("  • Complete audit trail")
        print("")
        print("Next step: Run 'make db-seed' to add demo data")
        
    except psycopg2.Error as e:
        print(f"❌ Database connection error: {e}")
        print("")
        print("Troubleshooting:")
        print("  1. Verify your password is correct")
        print("  2. Check if your IP is allowed in Supabase")
        print("     (Settings → Database → Connection pooling)")
        print("  3. Ensure you're using the postgres user password")
        sys.exit(1)

def main():
    print("=" * 60)
    print("TBWA Agency Databank - Supabase Migration")
    print("=" * 60)
    print("")
    
    db_url = get_database_url()
    apply_migrations(db_url)

if __name__ == '__main__':
    main()
