#!/usr/bin/env python3
"""
TBWA PPM - Full ETL Pipeline Orchestrator
Runs the complete pipeline: Upload → Extract → Import

Prerequisites:
  pip install pandas openpyxl supabase python-dotenv

Usage:
  1. Place ppm-oca.xlsx in ./data/ folder
  2. Create .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
  3. Run: python run_full_pipeline.py
"""

import sys
import subprocess
from datetime import datetime

# ============================================
# PIPELINE STEPS
# ============================================

STEPS = [
    {
        "name": "Upload Excel to Supabase Storage",
        "script": "upload_excel.py",
        "description": "Uploads ppm-oca.xlsx to cloud storage"
    },
    {
        "name": "Extract CSV Sheets",
        "script": "extract_csv.py",
        "description": "Downloads Excel and extracts 4 CSV files"
    },
    {
        "name": "Import to Database",
        "script": "etl_import.py",
        "description": "Imports CSV data into Supabase tables"
    }
]

# ============================================
# EXECUTION
# ============================================

def run_pipeline():
    """Runs all pipeline steps in sequence"""
    
    print("=" * 70)
    print("TBWA PPM - FULL ETL PIPELINE")
    print("=" * 70)
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\nPipeline steps:")
    for i, step in enumerate(STEPS, 1):
        print(f"  {i}. {step['name']}")
        print(f"     → {step['description']}")
    
    print("\n" + "=" * 70)
    
    # Ask for confirmation
    response = input("\n🚀 Ready to run the full pipeline? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Pipeline cancelled")
        return
    
    # Run each step
    for i, step in enumerate(STEPS, 1):
        print("\n" + "=" * 70)
        print(f"STEP {i}/{len(STEPS)}: {step['name']}")
        print("=" * 70)
        
        try:
            # Run the script
            result = subprocess.run(
                [sys.executable, step['script']],
                check=True,
                capture_output=False,  # Show output in real-time
                text=True
            )
            
            print(f"\n✅ Step {i} completed successfully")
            
        except subprocess.CalledProcessError as e:
            print(f"\n❌ Step {i} failed with error")
            print(f"   Script: {step['script']}")
            print(f"   Error: {e}")
            print(f"\n💡 Fix the error and run the pipeline again")
            return
        except FileNotFoundError:
            print(f"\n❌ Script not found: {step['script']}")
            print(f"   Make sure you're in the /deployment directory")
            return
        except KeyboardInterrupt:
            print(f"\n\n⚠️  Pipeline interrupted by user")
            return
    
    # Success!
    print("\n" + "=" * 70)
    print("🎉 PIPELINE COMPLETE!")
    print("=" * 70)
    print(f"\nFinished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n✅ All {len(STEPS)} steps completed successfully:")
    print(f"   1. Excel file uploaded to Supabase Storage")
    print(f"   2. CSV files extracted to ./data/")
    print(f"   3. Data imported to database tables")
    print(f"\n🌐 Your database is now populated with production data!")
    print(f"\n💡 Next steps:")
    print(f"   • View data in Supabase Table Editor")
    print(f"   • Run SQL queries to verify data")
    print(f"   • Connect your React frontend to Supabase")

# ============================================
# ALTERNATIVE: RUN INDIVIDUAL STEPS
# ============================================

def show_menu():
    """Shows interactive menu for running individual steps"""
    
    print("=" * 70)
    print("TBWA PPM - ETL Pipeline Menu")
    print("=" * 70)
    print("\nChoose an option:")
    print("\n  1. Run full pipeline (Upload → Extract → Import)")
    print("  2. Upload Excel file only")
    print("  3. Extract CSV files only (requires upload first)")
    print("  4. Import data only (requires CSV files)")
    print("  0. Exit")
    
    choice = input("\nEnter option (0-4): ").strip()
    
    if choice == "1":
        run_pipeline()
    elif choice == "2":
        subprocess.run([sys.executable, "upload_excel.py"])
    elif choice == "3":
        subprocess.run([sys.executable, "extract_csv.py"])
    elif choice == "4":
        subprocess.run([sys.executable, "etl_import.py"])
    elif choice == "0":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid option")

# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    # Check if any command-line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--menu":
            show_menu()
        elif sys.argv[1] == "--help":
            print(__doc__)
        else:
            print(f"❌ Unknown argument: {sys.argv[1]}")
            print(f"\nUsage:")
            print(f"  python run_full_pipeline.py         → Run full pipeline")
            print(f"  python run_full_pipeline.py --menu  → Show interactive menu")
            print(f"  python run_full_pipeline.py --help  → Show this help")
    else:
        # Default: run full pipeline
        run_pipeline()
