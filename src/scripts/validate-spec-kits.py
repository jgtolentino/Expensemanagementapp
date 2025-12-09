#!/usr/bin/env python3
"""
Spec Kit Validator
==================
Validates schema.yml files against registry and enforces CI guardrails

Usage:
    python scripts/validate-spec-kits.py --spec spec/ipai-erp/core/schema.yml
    python scripts/validate-spec-kits.py --all  # Validate all specs
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Set, Any
import yaml

class SpecValidator:
    def __init__(self, registry_file: Path):
        self.registry_file = registry_file
        self.registry = self.load_registry()
        self.errors = []
        self.warnings = []
        
    def load_registry(self) -> Dict[str, Any]:
        """Load master registry"""
        with open(self.registry_file, 'r') as f:
            return yaml.safe_load(f)
    
    def validate_spec_file(self, spec_file: Path) -> bool:
        """Validate a single spec file"""
        print(f"\n📋 Validating: {spec_file}")
        
        try:
            with open(spec_file, 'r') as f:
                spec = yaml.safe_load(f)
        except Exception as e:
            self.errors.append(f"Failed to load {spec_file}: {e}")
            return False
        
        # Run validation checks
        self._check_required_fields(spec, spec_file)
        self._check_schema_namespace(spec, spec_file)
        self._check_table_definitions(spec, spec_file)
        self._check_rls_policies(spec, spec_file)
        self._check_dependencies(spec, spec_file)
        self._check_odoo_mapping(spec, spec_file)
        
        # Print results
        if self.errors:
            print(f"  ❌ {len(self.errors)} errors")
            for error in self.errors:
                print(f"     - {error}")
        
        if self.warnings:
            print(f"  ⚠️  {len(self.warnings)} warnings")
            for warning in self.warnings:
                print(f"     - {warning}")
        
        if not self.errors and not self.warnings:
            print("  ✅ Valid")
        
        return len(self.errors) == 0
    
    def _check_required_fields(self, spec: Dict, spec_file: Path):
        """Check required top-level fields"""
        required = ['version', 'schema_namespace', 'module']
        for field in required:
            if field not in spec:
                self.errors.append(f"Missing required field: {field}")
    
    def _check_schema_namespace(self, spec: Dict, spec_file: Path):
        """Validate schema namespace"""
        namespace = spec.get('schema_namespace')
        if not namespace:
            return
        
        # Check if namespace is registered
        registered_namespaces = set()
        for owner_data in self.registry.get('schema_ownership', {}).values():
            if isinstance(owner_data, dict):
                registered_namespaces.add(list(owner_data.keys())[0] if owner_data else None)
        
        # Schema ownership is a dict with schema name as key
        schema_ownership = self.registry.get('schema_ownership', {})
        if namespace not in schema_ownership:
            self.warnings.append(
                f"Schema namespace '{namespace}' not in registry.yml schema_ownership"
            )
    
    def _check_table_definitions(self, spec: Dict, spec_file: Path):
        """Validate table definitions"""
        tables = spec.get('tables', {})
        
        if not tables:
            self.warnings.append("No tables defined")
            return
        
        for table_name, table_def in tables.items():
            # Check primary key
            if 'primary_key' not in table_def:
                self.errors.append(f"Table {table_name}: missing primary_key")
            
            # Check columns
            columns = table_def.get('columns', {})
            if not columns:
                self.errors.append(f"Table {table_name}: no columns defined")
                continue
            
            # Validate primary key exists in columns
            pk = table_def.get('primary_key')
            if pk and pk not in columns:
                self.errors.append(f"Table {table_name}: primary_key '{pk}' not in columns")
            
            # Validate column definitions
            for col_name, col_def in columns.items():
                if 'type' not in col_def:
                    self.errors.append(f"Table {table_name}.{col_name}: missing type")
                
                # Check foreign key references
                if 'references' in col_def:
                    ref = col_def['references']
                    if not self._is_valid_reference(ref, spec):
                        self.warnings.append(
                            f"Table {table_name}.{col_name}: reference '{ref}' may not exist"
                        )
    
    def _is_valid_reference(self, ref: str, spec: Dict) -> bool:
        """Check if foreign key reference is valid"""
        # References can be:
        # 1. In the same schema: table_name(column)
        # 2. In another schema: schema.table_name(column)
        # 3. Special tables: auth.users, core.tenant, etc.
        
        special_tables = [
            'auth.users',
            'core.tenant',
            'core.user_profile',
            'core.workspace',
            'core.department',
            'core.team',
        ]
        
        ref_table = ref.split('(')[0]  # Extract table name before (column)
        
        # Check if it's a special table
        if ref_table in special_tables:
            return True
        
        # Check if it's in the current spec
        namespace = spec.get('schema_namespace')
        tables = spec.get('tables', {})
        
        if '.' in ref_table:
            # Cross-schema reference
            return True  # We'll trust cross-schema refs
        else:
            # Same schema reference
            table_name = ref_table
            return table_name in tables
    
    def _check_rls_policies(self, spec: Dict, spec_file: Path):
        """Validate RLS policies"""
        tables = spec.get('tables', {})
        rls_policies = spec.get('rls_policies', {})
        
        # Check that RLS-enabled tables have policies
        for table_name, table_def in tables.items():
            if table_def.get('rls_enabled', False):
                if table_name not in rls_policies:
                    self.warnings.append(
                        f"Table {table_name}: RLS enabled but no policies defined"
                    )
        
        # Check that policies reference existing tables
        for table_name in rls_policies.keys():
            if table_name not in tables:
                self.errors.append(
                    f"RLS policy for {table_name} but table not defined in this spec"
                )
    
    def _check_dependencies(self, spec: Dict, spec_file: Path):
        """Validate module dependencies"""
        module = spec.get('module')
        depends_on = spec.get('depends_on', [])
        
        if not module:
            return
        
        # Get all registered modules
        all_modules = set()
        for category in ['core_modules', 'finance_modules', 'crm_sales_modules', 
                         'project_modules', 'supply_chain_modules', 'hr_modules',
                         'content_modules', 'retail_modules', 'creative_modules']:
            modules = self.registry.get(category, {})
            all_modules.update(modules.keys())
        
        # Check dependencies exist
        for dep in depends_on:
            if dep not in all_modules and not dep.startswith('odoo_'):
                # Allow Odoo CE modules (starting with lowercase, no ipai_ prefix)
                if not dep.islower() or dep.startswith('ipai_'):
                    self.warnings.append(
                        f"Dependency '{dep}' not found in registry"
                    )
    
    def _check_odoo_mapping(self, spec: Dict, spec_file: Path):
        """Validate Odoo model mapping"""
        odoo_mapping = spec.get('odoo_mapping', {})
        
        if not odoo_mapping:
            # Not all specs need Odoo mapping
            return
        
        for table_ref, mapping in odoo_mapping.items():
            # Check required mapping fields
            if 'odoo_model' not in mapping:
                self.errors.append(
                    f"Odoo mapping for {table_ref}: missing odoo_model"
                )
            
            if 'sync_direction' not in mapping:
                self.warnings.append(
                    f"Odoo mapping for {table_ref}: missing sync_direction"
                )
            
            sync_dir = mapping.get('sync_direction')
            if sync_dir not in ['bidirectional', 'one_way', None]:
                self.errors.append(
                    f"Odoo mapping for {table_ref}: invalid sync_direction '{sync_dir}'"
                )


def main():
    parser = argparse.ArgumentParser(description='Validate Spec Kit schema files')
    parser.add_argument(
        '--spec',
        type=Path,
        help='Path to schema.yml file to validate'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Validate all spec files'
    )
    parser.add_argument(
        '--registry',
        type=Path,
        default=Path('spec/ipai-erp/registry.yml'),
        help='Path to registry.yml (default: spec/ipai-erp/registry.yml)'
    )
    
    args = parser.parse_args()
    
    # Check registry exists
    if not args.registry.exists():
        print(f"❌ Registry not found: {args.registry}")
        sys.exit(1)
    
    # Determine which specs to validate
    spec_files = []
    if args.all:
        spec_dir = Path('spec')
        spec_files = list(spec_dir.rglob('schema.yml')) + list(spec_dir.rglob('*-schema.yml'))
        # Exclude registry.yml
        spec_files = [f for f in spec_files if f.name != 'registry.yml']
        
        if not spec_files:
            print("❌ No spec files found")
            sys.exit(1)
        
        print(f"Found {len(spec_files)} spec files to validate")
    else:
        if not args.spec:
            parser.error('Either --spec or --all must be specified')
        
        if not args.spec.exists():
            print(f"❌ Spec file not found: {args.spec}")
            sys.exit(1)
        
        spec_files = [args.spec]
    
    # Validate specs
    validator = SpecValidator(args.registry)
    all_valid = True
    
    for spec_file in spec_files:
        is_valid = validator.validate_spec_file(spec_file)
        if not is_valid:
            all_valid = False
        
        # Reset error/warning lists for next file
        validator.errors = []
        validator.warnings = []
    
    # Summary
    print("\n" + "="*60)
    if all_valid:
        print("✅ All spec files are valid!")
        sys.exit(0)
    else:
        print("❌ Some spec files have errors")
        sys.exit(1)


if __name__ == '__main__':
    main()
