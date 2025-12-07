-- ============================================================================
-- Scout Dashboard - Governance & RBAC (Layer 5)
-- Migration 011
-- 
-- Purpose:
-- - Multi-tenant isolation (tenant_id enforcement)
-- - Role-based access control (super_admin, analyst, brand_sponsor, store_owner)
-- - PII handling (customer_email hashing, retention policies)
-- - Row-level security policies
-- 
-- Created: 2025-12-07
-- ============================================================================

-- ============================================================================
-- 1. TENANTS
-- ============================================================================

create table if not exists scout.tenants (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_-]+$'),
  name text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table scout.tenants is 'Organization tenants (TBWA, brand sponsors, store clusters)';
comment on column scout.tenants.code is 'Unique tenant identifier (e.g., tbwa, coca-cola, ncr-coop)';
comment on column scout.tenants.settings is 'Tenant-specific configuration (retention policies, feature flags)';

-- Seed initial tenants
insert into scout.tenants (code, name, settings) values
  ('tbwa', 'TBWA Agency Databank', '{"retention_days": 365, "features": {"ai_assistant": true, "experiments": true}}'::jsonb),
  ('demo', 'Demo Tenant', '{"retention_days": 90, "features": {"ai_assistant": true, "experiments": false}}'::jsonb)
on conflict (code) do nothing;

-- ============================================================================
-- 2. ROLES
-- ============================================================================

create type scout.role as enum (
  'super_admin',    -- Full access to all tenants (TBWA core team)
  'analyst',        -- Read-only analytics across all stores (TBWA analysts)
  'brand_sponsor',  -- View only products from specific brands (Coca-Cola, Unilever)
  'store_owner'     -- View only own store data (sari-sari store owners)
);

comment on type scout.role is 'User role hierarchy for RBAC';

-- ============================================================================
-- 3. USER ROLES
-- ============================================================================

create table if not exists scout.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tenant_id uuid not null references scout.tenants(id) on delete cascade,
  role scout.role not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique (user_id, tenant_id, role)
);

comment on table scout.user_roles is 'Many-to-many mapping of users to tenants and roles';
comment on column scout.user_roles.metadata is 'Role-specific constraints (e.g., {"store_ids": [...], "brand_ids": [...]})';

create index idx_user_roles_user_tenant on scout.user_roles (user_id, tenant_id);
create index idx_user_roles_tenant on scout.user_roles (tenant_id);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Get current user's tenant_id
create or replace function scout.current_tenant_id()
returns uuid
language sql
security definer
set search_path = public, scout
stable
as $$
  select ur.tenant_id
  from scout.user_roles ur
  where ur.user_id = auth.uid()
  limit 1;
$$;

comment on function scout.current_tenant_id is 'Returns the tenant_id for the authenticated user';

-- Get current user's role
create or replace function scout.current_user_role()
returns scout.role
language sql
security definer
set search_path = public, scout
stable
as $$
  select ur.role
  from scout.user_roles ur
  where ur.user_id = auth.uid()
    and ur.tenant_id = scout.current_tenant_id()
  limit 1;
$$;

comment on function scout.current_user_role is 'Returns the role for the authenticated user in current tenant';

-- Check if user has role
create or replace function scout.user_has_role(required_role scout.role)
returns boolean
language sql
security definer
set search_path = public, scout
stable
as $$
  select exists (
    select 1
    from scout.user_roles ur
    where ur.user_id = auth.uid()
      and ur.tenant_id = scout.current_tenant_id()
      and ur.role = required_role
  );
$$;

comment on function scout.user_has_role is 'Check if current user has specified role in current tenant';

-- Get user's accessible store IDs (for store_owner role)
create or replace function scout.current_user_store_ids()
returns uuid[]
language sql
security definer
set search_path = public, scout
stable
as $$
  select coalesce(
    (
      select array_agg((jsonb_array_elements_text(ur.metadata->'store_ids'))::uuid)
      from scout.user_roles ur
      where ur.user_id = auth.uid()
        and ur.tenant_id = scout.current_tenant_id()
        and ur.role = 'store_owner'
    ),
    '{}'::uuid[]
  );
$$;

comment on function scout.current_user_store_ids is 'Returns array of store_ids accessible to current user (for store_owner role)';

-- Get user's accessible brand IDs (for brand_sponsor role)
create or replace function scout.current_user_brand_ids()
returns uuid[]
language sql
security definer
set search_path = public, scout
stable
as $$
  select coalesce(
    (
      select array_agg((jsonb_array_elements_text(ur.metadata->'brand_ids'))::uuid)
      from scout.user_roles ur
      where ur.user_id = auth.uid()
        and ur.tenant_id = scout.current_tenant_id()
        and ur.role = 'brand_sponsor'
    ),
    '{}'::uuid[]
  );
$$;

comment on function scout.current_user_brand_ids is 'Returns array of brand_ids accessible to current user (for brand_sponsor role)';

-- ============================================================================
-- 5. ADD TENANT_ID TO CORE TABLES
-- ============================================================================

-- Add tenant_id column to core tables (if not already present)
do $$
begin
  -- stores
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'stores' and column_name = 'tenant_id'
  ) then
    alter table scout.stores add column tenant_id uuid references scout.tenants(id);
    
    -- Backfill with demo tenant
    update scout.stores set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    
    alter table scout.stores alter column tenant_id set not null;
    create index idx_stores_tenant on scout.stores (tenant_id);
  end if;

  -- customers
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'customers' and column_name = 'tenant_id'
  ) then
    alter table scout.customers add column tenant_id uuid references scout.tenants(id);
    update scout.customers set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.customers alter column tenant_id set not null;
    create index idx_customers_tenant on scout.customers (tenant_id);
  end if;

  -- products
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'products' and column_name = 'tenant_id'
  ) then
    alter table scout.products add column tenant_id uuid references scout.tenants(id);
    update scout.products set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.products alter column tenant_id set not null;
    create index idx_products_tenant on scout.products (tenant_id);
  end if;

  -- brands
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'brands' and column_name = 'tenant_id'
  ) then
    alter table scout.brands add column tenant_id uuid references scout.tenants(id);
    update scout.brands set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.brands alter column tenant_id set not null;
    create index idx_brands_tenant on scout.brands (tenant_id);
  end if;

  -- transactions
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'transactions' and column_name = 'tenant_id'
  ) then
    alter table scout.transactions add column tenant_id uuid references scout.tenants(id);
    update scout.transactions set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.transactions alter column tenant_id set not null;
    create index idx_transactions_tenant on scout.transactions (tenant_id);
  end if;

  -- baskets
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'baskets' and column_name = 'tenant_id'
  ) then
    alter table scout.baskets add column tenant_id uuid references scout.tenants(id);
    update scout.baskets set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.baskets alter column tenant_id set not null;
    create index idx_baskets_tenant on scout.baskets (tenant_id);
  end if;

  -- substitutions
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'substitutions' and column_name = 'tenant_id'
  ) then
    alter table scout.substitutions add column tenant_id uuid references scout.tenants(id);
    update scout.substitutions set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
    where tenant_id is null;
    alter table scout.substitutions alter column tenant_id set not null;
    create index idx_substitutions_tenant on scout.substitutions (tenant_id);
  end if;

  -- knowledge_base
  if exists (select 1 from information_schema.tables where table_schema = 'scout' and table_name = 'knowledge_base') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'scout' and table_name = 'knowledge_base' and column_name = 'tenant_id'
    ) then
      alter table scout.knowledge_base add column tenant_id uuid references scout.tenants(id);
      update scout.knowledge_base set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
      where tenant_id is null;
      alter table scout.knowledge_base alter column tenant_id set not null;
      create index idx_knowledge_base_tenant on scout.knowledge_base (tenant_id);
    end if;
  end if;

  -- knowledge_chunks
  if exists (select 1 from information_schema.tables where table_schema = 'scout' and table_name = 'knowledge_chunks') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'scout' and table_name = 'knowledge_chunks' and column_name = 'tenant_id'
    ) then
      alter table scout.knowledge_chunks add column tenant_id uuid references scout.tenants(id);
      update scout.knowledge_chunks set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
      where tenant_id is null;
      alter table scout.knowledge_chunks alter column tenant_id set not null;
      create index idx_knowledge_chunks_tenant on scout.knowledge_chunks (tenant_id);
    end if;
  end if;

  -- ai_conversations
  if exists (select 1 from information_schema.tables where table_schema = 'scout' and table_name = 'ai_conversations') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'scout' and table_name = 'ai_conversations' and column_name = 'tenant_id'
    ) then
      alter table scout.ai_conversations add column tenant_id uuid references scout.tenants(id);
      update scout.ai_conversations set tenant_id = (select id from scout.tenants where code = 'demo' limit 1)
      where tenant_id is null;
      alter table scout.ai_conversations alter column tenant_id set not null;
      create index idx_ai_conversations_tenant on scout.ai_conversations (tenant_id);
    end if;
  end if;

  -- ai_messages (inherits tenant_id via conversation)
end $$;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all core tables
alter table scout.stores enable row level security;
alter table scout.customers enable row level security;
alter table scout.products enable row level security;
alter table scout.brands enable row level security;
alter table scout.transactions enable row level security;
alter table scout.baskets enable row level security;
alter table scout.substitutions enable row level security;

-- Stores: tenant isolation + store_owner filtering
drop policy if exists "tenant_isolation_select_stores" on scout.stores;
create policy "tenant_isolation_select_stores"
  on scout.stores
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      -- super_admin, analyst, brand_sponsor: see all stores
      scout.current_user_role() in ('super_admin', 'analyst', 'brand_sponsor')
      or
      -- store_owner: see only assigned stores
      (scout.current_user_role() = 'store_owner' and id = any(scout.current_user_store_ids()))
    )
  );

drop policy if exists "tenant_isolation_insert_stores" on scout.stores;
create policy "tenant_isolation_insert_stores"
  on scout.stores
  for insert
  with check (
    tenant_id = scout.current_tenant_id()
    and scout.current_user_role() in ('super_admin', 'analyst')
  );

-- Customers: tenant isolation + store-based filtering
drop policy if exists "tenant_isolation_select_customers" on scout.customers;
create policy "tenant_isolation_select_customers"
  on scout.customers
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst', 'brand_sponsor')
      or
      (scout.current_user_role() = 'store_owner' and store_id = any(scout.current_user_store_ids()))
    )
  );

-- Products: tenant isolation + brand filtering
drop policy if exists "tenant_isolation_select_products" on scout.products;
create policy "tenant_isolation_select_products"
  on scout.products
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst', 'store_owner')
      or
      (scout.current_user_role() = 'brand_sponsor' and brand_id = any(scout.current_user_brand_ids()))
    )
  );

-- Brands: tenant isolation + brand filtering
drop policy if exists "tenant_isolation_select_brands" on scout.brands;
create policy "tenant_isolation_select_brands"
  on scout.brands
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst', 'store_owner')
      or
      (scout.current_user_role() = 'brand_sponsor' and id = any(scout.current_user_brand_ids()))
    )
  );

-- Transactions: tenant isolation + store/brand filtering
drop policy if exists "tenant_isolation_select_transactions" on scout.transactions;
create policy "tenant_isolation_select_transactions"
  on scout.transactions
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst')
      or
      (scout.current_user_role() = 'store_owner' and store_id = any(scout.current_user_store_ids()))
      or
      (scout.current_user_role() = 'brand_sponsor' and brand_id = any(scout.current_user_brand_ids()))
    )
  );

drop policy if exists "tenant_isolation_insert_transactions" on scout.transactions;
create policy "tenant_isolation_insert_transactions"
  on scout.transactions
  for insert
  with check (
    tenant_id = scout.current_tenant_id()
    and scout.current_user_role() in ('super_admin', 'analyst')
  );

-- Baskets: tenant isolation + store filtering
drop policy if exists "tenant_isolation_select_baskets" on scout.baskets;
create policy "tenant_isolation_select_baskets"
  on scout.baskets
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst', 'brand_sponsor')
      or
      (scout.current_user_role() = 'store_owner' and store_id = any(scout.current_user_store_ids()))
    )
  );

-- Substitutions: tenant isolation
drop policy if exists "tenant_isolation_select_substitutions" on scout.substitutions;
create policy "tenant_isolation_select_substitutions"
  on scout.substitutions
  for select
  using (
    tenant_id = scout.current_tenant_id()
    and (
      scout.current_user_role() in ('super_admin', 'analyst')
      or
      (scout.current_user_role() = 'brand_sponsor' and (
        original_brand_id = any(scout.current_user_brand_ids())
        or substitute_brand_id = any(scout.current_user_brand_ids())
      ))
    )
  );

-- ============================================================================
-- 7. PII HANDLING (Customer Email Hashing)
-- ============================================================================

-- Hash customer email for privacy
create or replace function scout.hash_customer_email(email text)
returns text
language plpgsql
as $$
declare
  salt text;
begin
  -- Get salt from Supabase vault (or use fixed salt for demo)
  salt := coalesce(
    current_setting('app.customer_email_salt', true),
    'scout_default_salt_2025'
  );
  
  return encode(digest(email || salt, 'sha256'), 'hex');
end;
$$;

comment on function scout.hash_customer_email is 'Hash customer email for PII protection (SHA-256 with salt)';

-- Add email_hash column to customers (if not exists)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'customers' and column_name = 'email_hash'
  ) then
    alter table scout.customers add column email_hash text;
    create index idx_customers_email_hash on scout.customers (email_hash);
  end if;
end $$;

-- Trigger to auto-hash email on insert/update
create or replace function scout.trigger_hash_customer_email()
returns trigger
language plpgsql
as $$
begin
  if NEW.email is not null and NEW.email != '' then
    NEW.email_hash := scout.hash_customer_email(NEW.email);
    -- Clear plaintext email after hashing (optional)
    -- NEW.email := null;
  end if;
  return NEW;
end;
$$;

drop trigger if exists hash_customer_email_trigger on scout.customers;
create trigger hash_customer_email_trigger
  before insert or update on scout.customers
  for each row
  execute function scout.trigger_hash_customer_email();

-- ============================================================================
-- 8. DATA RETENTION POLICIES
-- ============================================================================

create table if not exists scout.data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  retention_days integer not null,
  deletion_strategy text not null check (deletion_strategy in ('hard_delete', 'soft_delete', 'archive_to_s3')),
  last_run_at timestamptz,
  created_at timestamptz default now()
);

comment on table scout.data_retention_policies is 'Data retention policies per table';

-- Default retention policies
insert into scout.data_retention_policies (table_name, retention_days, deletion_strategy) values
  ('transactions', 365, 'archive_to_s3'),
  ('baskets', 365, 'archive_to_s3'),
  ('customers', 90, 'soft_delete'),
  ('ai_conversations', 30, 'hard_delete'),
  ('ai_messages', 30, 'hard_delete')
on conflict do nothing;

-- Function to apply retention policies (to be called by cron job)
create or replace function scout.apply_retention_policies()
returns void
language plpgsql
security definer
as $$
declare
  policy record;
  delete_sql text;
begin
  for policy in
    select * from scout.data_retention_policies
    where retention_days > 0
  loop
    if policy.deletion_strategy = 'hard_delete' then
      delete_sql := format(
        'delete from scout.%I where created_at < now() - interval ''%s days''',
        policy.table_name,
        policy.retention_days
      );
      execute delete_sql;
      
      update scout.data_retention_policies
      set last_run_at = now()
      where id = policy.id;
    end if;
    
    -- TODO: Implement soft_delete and archive_to_s3 strategies
  end loop;
end;
$$;

comment on function scout.apply_retention_policies is 'Apply data retention policies (called by cron job)';

-- ============================================================================
-- 9. AUDIT LOG (Optional - for super_admin visibility)
-- ============================================================================

create table if not exists scout.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references scout.tenants(id),
  user_id uuid,
  action text not null,
  table_name text,
  record_id uuid,
  changes jsonb,
  created_at timestamptz default now()
);

comment on table scout.audit_log is 'Audit trail for sensitive operations';

create index idx_audit_log_tenant_user on scout.audit_log (tenant_id, user_id);
create index idx_audit_log_created on scout.audit_log (created_at desc);

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on scout schema
grant usage on schema scout to authenticated, anon;

-- Grant select on tenants (public data)
grant select on scout.tenants to authenticated, anon;

-- Grant select on user_roles (users can see their own roles)
grant select on scout.user_roles to authenticated;

-- Core tables: RLS handles access control
grant select on scout.stores to authenticated;
grant select on scout.customers to authenticated;
grant select on scout.products to authenticated;
grant select on scout.brands to authenticated;
grant select on scout.transactions to authenticated;
grant select on scout.baskets to authenticated;
grant select on scout.substitutions to authenticated;

-- Insert permissions (controlled by RLS)
grant insert on scout.transactions to authenticated;
grant insert on scout.baskets to authenticated;

-- Execute permissions for helper functions
grant execute on function scout.current_tenant_id to authenticated;
grant execute on function scout.current_user_role to authenticated;
grant execute on function scout.user_has_role to authenticated;
grant execute on function scout.current_user_store_ids to authenticated;
grant execute on function scout.current_user_brand_ids to authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify RLS is enabled
do $$
declare
  missing_rls text[];
begin
  select array_agg(tablename)
  into missing_rls
  from pg_tables
  where schemaname = 'scout'
    and tablename in ('stores', 'customers', 'products', 'brands', 'transactions', 'baskets', 'substitutions')
    and not rowsecurity;
    
  if array_length(missing_rls, 1) > 0 then
    raise warning 'RLS not enabled on tables: %', missing_rls;
  else
    raise notice 'RLS enabled on all core tables ✅';
  end if;
end $$;
