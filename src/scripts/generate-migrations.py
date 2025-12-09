#!/usr/bin/env python3
"""
Migration Generator Script
==========================
Converts Spec Kit schema.yml files to SQL migrations for Supabase Postgres

Usage:
    python scripts/generate-migrations.py --spec spec/ipai-erp/core/schema.yml
    python scripts/generate-migrations.py --spec spec/ipai-erp/modules/finance_planner/schema.yml
    python scripts/generate-migrations.py --all  # Generate all migrations
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
import yaml
from datetime import datetime

class MigrationGenerator:
    def __init__(self, spec_file: Path):
        self.spec_file = spec_file
        self.spec = self.load_spec()
        self.schema_namespace = self.spec.get('schema_namespace', 'public')
        self.module = self.spec.get('module', 'unknown')
        
    def load_spec(self) -> Dict[str, Any]:
        """Load and parse YAML spec file"""
        with open(self.spec_file, 'r') as f:
            return yaml.safe_load(f)
    
    def generate_migration(self) -> str:
        """Generate complete SQL migration from spec"""
        sql_parts = []
        
        # Header
        sql_parts.append(self._generate_header())
        
        # Create schema
        sql_parts.append(self._generate_schema())
        
        # Create tables
        for table_name, table_def in self.spec.get('tables', {}).items():
            sql_parts.append(self._generate_table(table_name, table_def))
        
        # Create indexes
        for table_name, table_def in self.spec.get('tables', {}).items():
            sql_parts.append(self._generate_indexes(table_name, table_def))
        
        # Create constraints
        for table_name, table_def in self.spec.get('tables', {}).items():
            sql_parts.append(self._generate_constraints(table_name, table_def))
        
        # Create functions
        for func_name, func_def in self.spec.get('functions', {}).items():
            sql_parts.append(self._generate_function(func_name, func_def))
        
        # Create triggers
        trigger_defs = self.spec.get('triggers', {})
        if trigger_defs:
            sql_parts.append(self._generate_triggers(trigger_defs))
        
        # Create views
        for view_name, view_def in self.spec.get('views', {}).items():
            sql_parts.append(self._generate_view(view_name, view_def))
        
        # Enable RLS
        for table_name, table_def in self.spec.get('tables', {}).items():
            if table_def.get('rls_enabled', False):
                sql_parts.append(self._generate_rls(table_name))
        
        # Create RLS policies
        for table_name, policies in self.spec.get('rls_policies', {}).items():
            sql_parts.append(self._generate_rls_policies(table_name, policies))
        
        # Footer
        sql_parts.append(self._generate_footer())
        
        return '\n\n'.join(filter(None, sql_parts))
    
    def _generate_header(self) -> str:
        """Generate migration header"""
        timestamp = datetime.now().isoformat()
        return f"""-- =============================================
-- Migration: {self.module}
-- Schema: {self.schema_namespace}
-- Generated: {timestamp}
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search"""
    
    def _generate_schema(self) -> str:
        """Generate CREATE SCHEMA statement"""
        return f"""-- Create schema
CREATE SCHEMA IF NOT EXISTS {self.schema_namespace};"""
    
    def _generate_table(self, table_name: str, table_def: Dict[str, Any]) -> str:
        """Generate CREATE TABLE statement"""
        full_table_name = f"{self.schema_namespace}.{table_name}"
        description = table_def.get('description', '')
        
        sql = [f"-- Table: {full_table_name}"]
        if description:
            sql.append(f"-- {description}")
        
        sql.append(f"CREATE TABLE IF NOT EXISTS {full_table_name} (")
        
        columns = []
        for col_name, col_def in table_def.get('columns', {}).items():
            columns.append(self._generate_column(col_name, col_def))
        
        sql.append("  " + ",\n  ".join(columns))
        sql.append(");")
        
        # Add table comment
        if description:
            sql.append(f"COMMENT ON TABLE {full_table_name} IS '{description}';")
        
        # Add column comments
        for col_name, col_def in table_def.get('columns', {}).items():
            if col_def.get('description'):
                sql.append(f"COMMENT ON COLUMN {full_table_name}.{col_name} IS '{col_def['description']}';")
        
        return '\n'.join(sql)
    
    def _generate_column(self, col_name: str, col_def: Dict[str, Any]) -> str:
        """Generate column definition"""
        parts = [col_name]
        
        # Data type
        col_type = col_def['type'].upper()
        
        # Handle arrays
        if col_type.endswith('[]'):
            col_type = col_type[:-2] + '[]'
        
        parts.append(col_type)
        
        # Default value
        if 'default' in col_def:
            default = col_def['default']
            if default == 'gen_random_uuid()':
                parts.append('DEFAULT gen_random_uuid()')
            elif default == 'now()':
                parts.append('DEFAULT NOW()')
            elif isinstance(default, str):
                parts.append(f"DEFAULT {default}")
            else:
                parts.append(f"DEFAULT {default}")
        
        # Nullable
        if not col_def.get('nullable', True):
            parts.append('NOT NULL')
        
        # Unique
        if col_def.get('unique', False):
            parts.append('UNIQUE')
        
        # Foreign key
        if 'references' in col_def:
            ref_table = col_def['references']
            on_delete = col_def.get('on_delete', 'NO ACTION').upper()
            parts.append(f"REFERENCES {ref_table} ON DELETE {on_delete}")
        
        return ' '.join(parts)
    
    def _generate_indexes(self, table_name: str, table_def: Dict[str, Any]) -> str:
        """Generate CREATE INDEX statements"""
        full_table_name = f"{self.schema_namespace}.{table_name}"
        indexes = table_def.get('indexes', [])
        
        if not indexes:
            return ""
        
        sql = [f"-- Indexes for {full_table_name}"]
        
        for idx, index_def in enumerate(indexes, 1):
            columns = index_def['columns']
            unique = 'UNIQUE ' if index_def.get('unique', False) else ''
            index_name = f"idx_{table_name}_{'_'.join(columns)}_{idx}"
            
            sql.append(
                f"CREATE {unique}INDEX IF NOT EXISTS {index_name} "
                f"ON {full_table_name} ({', '.join(columns)});"
            )
        
        return '\n'.join(sql)
    
    def _generate_constraints(self, table_name: str, table_def: Dict[str, Any]) -> str:
        """Generate ALTER TABLE constraints"""
        full_table_name = f"{self.schema_namespace}.{table_name}"
        constraints = table_def.get('constraints', [])
        
        if not constraints:
            return ""
        
        sql = [f"-- Constraints for {full_table_name}"]
        
        for constraint in constraints:
            constraint_type = constraint['type']
            constraint_name = constraint.get('name', f"chk_{table_name}_{len(sql)}")
            
            if constraint_type == 'check':
                condition = constraint['condition']
                sql.append(
                    f"ALTER TABLE {full_table_name} "
                    f"ADD CONSTRAINT {constraint_name} CHECK ({condition});"
                )
            elif constraint_type == 'unique':
                columns = constraint['columns']
                sql.append(
                    f"ALTER TABLE {full_table_name} "
                    f"ADD CONSTRAINT {constraint_name} UNIQUE ({', '.join(columns)});"
                )
        
        return '\n'.join(sql)
    
    def _generate_function(self, func_name: str, func_def: Dict[str, Any]) -> str:
        """Generate CREATE FUNCTION statement"""
        full_func_name = f"{self.schema_namespace}.{func_name}"
        
        # Build parameter list
        params = []
        for param in func_def.get('parameters', []):
            params.append(f"{param['name']} {param['type']}")
        param_str = ', '.join(params)
        
        returns = func_def['returns']
        language = func_def.get('language', 'plpgsql').upper()
        security = func_def.get('security', 'invoker').upper()
        body = func_def.get('body', '')
        
        sql = f"""-- Function: {full_func_name}
CREATE OR REPLACE FUNCTION {full_func_name}({param_str})
RETURNS {returns}
LANGUAGE {language}
SECURITY {security}
AS $$
{body}
$$;"""
        
        return sql
    
    def _generate_triggers(self, trigger_defs: Dict[str, Any]) -> str:
        """Generate CREATE TRIGGER statements"""
        sql = ["-- Triggers"]
        
        for trigger_name, trigger_def in trigger_defs.items():
            # Generate trigger function first
            function_body = trigger_def.get('function', '')
            if function_body:
                sql.append(function_body)
            
            # Generate triggers for each table
            for table_name in trigger_def.get('tables', []):
                full_table_name = f"{self.schema_namespace}.{table_name}"
                event = trigger_def.get('event', 'BEFORE UPDATE')
                
                sql.append(
                    f"CREATE TRIGGER {trigger_name}_{table_name}\n"
                    f"  {event} ON {full_table_name}\n"
                    f"  FOR EACH ROW\n"
                    f"  EXECUTE FUNCTION {self.schema_namespace}.{trigger_name}();"
                )
        
        return '\n\n'.join(sql)
    
    def _generate_view(self, view_name: str, view_def: Dict[str, Any]) -> str:
        """Generate CREATE VIEW statement"""
        full_view_name = f"{self.schema_namespace}.{view_name}"
        description = view_def.get('description', '')
        sql_query = view_def.get('sql', '')
        
        sql = [f"-- View: {full_view_name}"]
        if description:
            sql.append(f"-- {description}")
        
        sql.append(f"CREATE OR REPLACE VIEW {full_view_name} AS")
        sql.append(sql_query)
        sql.append(";")
        
        return '\n'.join(sql)
    
    def _generate_rls(self, table_name: str) -> str:
        """Generate ENABLE ROW LEVEL SECURITY statement"""
        full_table_name = f"{self.schema_namespace}.{table_name}"
        return f"ALTER TABLE {full_table_name} ENABLE ROW LEVEL SECURITY;"
    
    def _generate_rls_policies(self, table_name: str, policies: List[Dict[str, Any]]) -> str:
        """Generate CREATE POLICY statements"""
        full_table_name = f"{self.schema_namespace}.{table_name}"
        
        sql = [f"-- RLS Policies for {full_table_name}"]
        
        for policy in policies:
            policy_name = policy['name']
            using_clause = policy.get('using', 'true')
            check_clause = policy.get('with_check', using_clause)
            command = policy.get('command', 'ALL')
            
            sql.append(
                f"CREATE POLICY {policy_name} ON {full_table_name}\n"
                f"  FOR {command}\n"
                f"  USING ({using_clause})"
            )
            
            if check_clause and command != 'SELECT':
                sql[-1] += f"\n  WITH CHECK ({check_clause})"
            
            sql[-1] += ";"
        
        return '\n\n'.join(sql)
    
    def _generate_footer(self) -> str:
        """Generate migration footer"""
        return f"""-- =============================================
-- End of migration: {self.module}
-- ============================================="""
    
    def save_migration(self, output_dir: Path):
        """Save generated migration to file"""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate migration version (timestamp-based)
        version = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"{version}_{self.module}_{self.schema_namespace}.sql"
        output_file = output_dir / filename
        
        migration_sql = self.generate_migration()
        
        with open(output_file, 'w') as f:
            f.write(migration_sql)
        
        print(f"✅ Generated migration: {output_file}")
        return output_file


def find_all_spec_files() -> List[Path]:
    """Find all schema.yml files in spec/ directory"""
    spec_dir = Path('spec')
    if not spec_dir.exists():
        print(f"❌ Spec directory not found: {spec_dir}")
        return []
    
    spec_files = list(spec_dir.rglob('schema.yml')) + list(spec_dir.rglob('*-schema.yml'))
    return spec_files


def main():
    parser = argparse.ArgumentParser(description='Generate SQL migrations from Spec Kits')
    parser.add_argument(
        '--spec',
        type=Path,
        help='Path to schema.yml file'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate migrations for all spec files'
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=Path('migrations'),
        help='Output directory for migrations (default: migrations/)'
    )
    
    args = parser.parse_args()
    
    if not args.spec and not args.all:
        parser.error('Either --spec or --all must be specified')
    
    spec_files = []
    if args.all:
        spec_files = find_all_spec_files()
        if not spec_files:
            print("❌ No spec files found")
            sys.exit(1)
        print(f"Found {len(spec_files)} spec files")
    else:
        if not args.spec.exists():
            print(f"❌ Spec file not found: {args.spec}")
            sys.exit(1)
        spec_files = [args.spec]
    
    # Generate migrations
    for spec_file in spec_files:
        print(f"\n📄 Processing: {spec_file}")
        
        try:
            generator = MigrationGenerator(spec_file)
            generator.save_migration(args.output)
        except Exception as e:
            print(f"❌ Error generating migration for {spec_file}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n✅ Done! Migrations saved to: {args.output}")
    print("\nNext steps:")
    print("1. Review generated SQL files")
    print("2. Apply migrations to Supabase:")
    print(f"   psql $DATABASE_URL -f {args.output}/<migration_file>.sql")
    print("3. Update migration version tracking table")


if __name__ == '__main__':
    main()
