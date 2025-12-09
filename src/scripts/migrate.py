#!/usr/bin/env python3
"""
Database migration script for TBWA Agency Databank
Applies SQL migrations and tracks migration state in Odoo-style
"""

import argparse
import hashlib
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Migration tracking table (Odoo-style)
MIGRATION_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS ir_migration (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by VARCHAR(256),
    execution_time_ms INTEGER,
    state VARCHAR(20) DEFAULT 'success' CHECK (state IN ('success', 'failed', 'running')),
    error_message TEXT,
    create_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_name ON ir_migration(name);
CREATE INDEX IF NOT EXISTS idx_migration_state ON ir_migration(state);
CREATE INDEX IF NOT EXISTS idx_migration_applied_at ON ir_migration(applied_at DESC);
"""


class MigrationRunner:
    """Database migration runner"""

    def __init__(self, db_url: str, migrations_dir: str = "migrations"):
        self.db_url = db_url
        self.migrations_dir = Path(migrations_dir)
        self.conn: Optional[psycopg2.extensions.connection] = None

    def connect(self):
        """Connect to database"""
        print(f"🔌 Connecting to database...")
        try:
            self.conn = psycopg2.connect(self.db_url)
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            print("✅ Connected")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            sys.exit(1)

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

    def ensure_migration_table(self):
        """Create migration tracking table if not exists"""
        print("📋 Ensuring migration tracking table exists...")
        cursor = self.conn.cursor()
        cursor.execute(MIGRATION_TABLE_SQL)
        cursor.close()
        print("✅ Migration table ready")

    def get_applied_migrations(self) -> set:
        """Get list of applied migrations"""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT name FROM ir_migration WHERE state = 'success' ORDER BY applied_at"
        )
        applied = {row[0] for row in cursor.fetchall()}
        cursor.close()
        return applied

    def get_pending_migrations(self) -> List[Path]:
        """Get list of pending migration files"""
        if not self.migrations_dir.exists():
            print(f"⚠️  Migrations directory not found: {self.migrations_dir}")
            return []

        # Get all .sql files
        all_migrations = sorted(self.migrations_dir.glob("*.sql"))

        # Filter out already applied
        applied = self.get_applied_migrations()
        pending = [m for m in all_migrations if m.name not in applied]

        return pending

    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA-256 checksum of file"""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def extract_version(self, filename: str) -> str:
        """Extract version from migration filename (e.g., 001_rls_policies.sql -> 001)"""
        return filename.split("_")[0] if "_" in filename else "000"

    def apply_migration(self, file_path: Path) -> bool:
        """Apply a single migration file"""
        migration_name = file_path.name
        version = self.extract_version(migration_name)
        checksum = self.calculate_checksum(file_path)

        print(f"\n📦 Applying migration: {migration_name}")
        print(f"   Version: {version}")
        print(f"   Checksum: {checksum[:12]}...")

        cursor = self.conn.cursor()

        # Mark as running
        cursor.execute(
            """
            INSERT INTO ir_migration (name, version, checksum, state, applied_by)
            VALUES (%s, %s, %s, 'running', current_user)
            ON CONFLICT (name) DO UPDATE SET state = 'running'
            """,
            (migration_name, version, checksum),
        )

        start_time = datetime.now()

        try:
            # Read and execute migration
            with open(file_path, "r") as f:
                sql = f.read()

            # Execute migration
            cursor.execute(sql)

            # Calculate execution time
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)

            # Mark as success
            cursor.execute(
                """
                UPDATE ir_migration
                SET state = 'success',
                    applied_at = NOW(),
                    execution_time_ms = %s,
                    error_message = NULL
                WHERE name = %s
                """,
                (execution_time, migration_name),
            )

            print(f"   ✅ Applied successfully in {execution_time}ms")
            cursor.close()
            return True

        except Exception as e:
            # Mark as failed
            error_msg = str(e)
            cursor.execute(
                """
                UPDATE ir_migration
                SET state = 'failed',
                    error_message = %s
                WHERE name = %s
                """,
                (error_msg, migration_name),
            )

            print(f"   ❌ Migration failed: {error_msg}")
            cursor.close()
            return False

    def run(self, dry_run: bool = False, target_version: Optional[str] = None) -> int:
        """Run all pending migrations"""
        self.connect()
        self.ensure_migration_table()

        applied = self.get_applied_migrations()
        pending = self.get_pending_migrations()

        print(f"\n📊 Migration Status:")
        print(f"   Applied: {len(applied)}")
        print(f"   Pending: {len(pending)}")

        if not pending:
            print("\n✅ No pending migrations. Database is up to date.")
            self.close()
            return 0

        if dry_run:
            print("\n🔍 Dry run mode - would apply:")
            for migration in pending:
                print(f"   - {migration.name}")
            self.close()
            return 0

        # Apply migrations
        print(f"\n🚀 Applying {len(pending)} migration(s)...")
        success_count = 0
        failed_count = 0

        for migration_file in pending:
            # Check target version
            if target_version:
                migration_version = self.extract_version(migration_file.name)
                if migration_version > target_version:
                    print(f"⏭️  Skipping {migration_file.name} (after target version)")
                    continue

            if self.apply_migration(migration_file):
                success_count += 1
            else:
                failed_count += 1
                # Stop on first failure
                break

        self.close()

        print(f"\n📈 Migration Summary:")
        print(f"   ✅ Success: {success_count}")
        print(f"   ❌ Failed: {failed_count}")

        if failed_count > 0:
            print(f"\n❌ Migration failed. Database may be in inconsistent state.")
            print(f"   Review error above and fix migration file.")
            return 1

        print(f"\n✅ All migrations applied successfully!")
        return 0


def main():
    parser = argparse.ArgumentParser(description="TBWA Databank Migration Runner")
    parser.add_argument(
        "--url",
        type=str,
        default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/odoo"),
        help="Database connection URL",
    )
    parser.add_argument(
        "--migrations-dir",
        type=str,
        default="migrations",
        help="Directory containing migration files",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be applied without executing",
    )
    parser.add_argument(
        "--target-version",
        type=str,
        help="Apply migrations up to this version (e.g., 005)",
    )

    args = parser.parse_args()

    print("=" * 80)
    print("TBWA Agency Databank - Database Migration Runner")
    print("=" * 80)

    runner = MigrationRunner(args.url, args.migrations_dir)
    exit_code = runner.run(dry_run=args.dry_run, target_version=args.target_version)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
