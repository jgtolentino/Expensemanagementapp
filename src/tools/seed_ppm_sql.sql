-- =====================================================================
-- Finance PPM - Accounting Firm Portal - SQL Seed Script
-- Phase 4: Generate demo data (SQL version)
-- 
-- Usage: psql $DATABASE_URL -f tools/seed_ppm_sql.sql
-- =====================================================================

-- =====================================================================
-- Helper Functions for Seed Data
-- =====================================================================

CREATE OR REPLACE FUNCTION random_between(min_val int, max_val int)
RETURNS int AS $$
BEGIN
  RETURN floor(random() * (max_val - min_val + 1) + min_val);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION random_date(start_date date, end_date date)
RETURNS date AS $$
BEGIN
  RETURN start_date + (random() * (end_date - start_date))::int;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION random_element(arr text[])
RETURNS text AS $$
BEGIN
  RETURN arr[1 + floor(random() * array_length(arr, 1))];
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. Seed Tenants
-- =====================================================================

DO $$
DECLARE
  v_tenant_smp uuid := gen_random_uuid();
  v_tenant_dan uuid := gen_random_uuid();
  v_tenant_manila uuid := gen_random_uuid();
BEGIN
  -- Store tenant IDs in temp table for reference
  CREATE TEMP TABLE IF NOT EXISTS temp_tenants (
    id uuid PRIMARY KEY,
    slug text,
    name text
  );

  INSERT INTO temp_tenants VALUES
    (v_tenant_smp, 'tbwa-smp', 'TBWA\Santiago Mangada Puno'),
    (v_tenant_dan, 'tbwa-dan', 'TBWA\Digital Arts Network'),
    (v_tenant_manila, 'tbwa-manila', 'TBWA\Manila');

  -- Insert into actual tenants table (assuming core.tenants exists)
  -- INSERT INTO core.tenants (id, name, slug, region, currency, created_at)
  -- SELECT id, name, slug, 'PH', 'PHP', '2020-01-01'::date
  -- FROM temp_tenants;

  RAISE NOTICE '✅ Created 3 tenants';
END $$;

-- =====================================================================
-- 2. Seed Users (6 roles × 3 tenants = 54 users)
-- =====================================================================

DO $$
DECLARE
  v_tenant record;
  v_role text;
  v_count int;
  v_user_id uuid;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS temp_users (
    id uuid PRIMARY KEY,
    tenant_id uuid,
    email text,
    name text,
    role text,
    created_at timestamptz
  );

  FOR v_tenant IN SELECT * FROM temp_tenants LOOP
    -- Partner (1)
    v_user_id := gen_random_uuid();
    INSERT INTO temp_users VALUES (
      v_user_id,
      v_tenant.id,
      'partner@' || v_tenant.slug || '.com',
      'Partner ' || v_tenant.slug,
      'partner',
      '2020-01-15'
    );

    -- Finance Director (1)
    v_user_id := gen_random_uuid();
    INSERT INTO temp_users VALUES (
      v_user_id,
      v_tenant.id,
      'finance@' || v_tenant.slug || '.com',
      'Finance Director ' || v_tenant.slug,
      'finance_director',
      '2020-01-15'
    );

    -- Account Managers (4)
    FOR v_count IN 1..4 LOOP
      v_user_id := gen_random_uuid();
      INSERT INTO temp_users VALUES (
        v_user_id,
        v_tenant.id,
        'am' || v_count || '@' || v_tenant.slug || '.com',
        'Account Manager ' || v_count,
        'account_manager',
        random_date('2020-02-01', '2023-01-01')
      );
    END LOOP;

    -- Project Managers (4)
    FOR v_count IN 1..4 LOOP
      v_user_id := gen_random_uuid();
      INSERT INTO temp_users VALUES (
        v_user_id,
        v_tenant.id,
        'pm' || v_count || '@' || v_tenant.slug || '.com',
        'Project Manager ' || v_count,
        'project_manager',
        random_date('2020-02-01', '2023-01-01')
      );
    END LOOP;

    -- Staff Accountants (2)
    FOR v_count IN 1..2 LOOP
      v_user_id := gen_random_uuid();
      INSERT INTO temp_users VALUES (
        v_user_id,
        v_tenant.id,
        'accountant' || v_count || '@' || v_tenant.slug || '.com',
        'Staff Accountant ' || v_count,
        'staff_accountant',
        random_date('2020-03-01', '2022-01-01')
      );
    END LOOP;

    -- Consultants (6)
    FOR v_count IN 1..6 LOOP
      v_user_id := gen_random_uuid();
      INSERT INTO temp_users VALUES (
        v_user_id,
        v_tenant.id,
        'consultant' || v_count || '@' || v_tenant.slug || '.com',
        'Consultant ' || v_count,
        'consultant',
        random_date('2020-06-01', '2024-01-01')
      );
    END LOOP;
  END LOOP;

  -- Insert into actual users table (assuming core.users exists)
  -- INSERT INTO core.users (id, tenant_id, email, name, role, created_at)
  -- SELECT id, tenant_id, email, name, role, created_at
  -- FROM temp_users;

  RAISE NOTICE '✅ Created % users', (SELECT COUNT(*) FROM temp_users);
END $$;

-- =====================================================================
-- 3. Seed CRM Data (Leads, Opportunities, Activities)
-- =====================================================================

DO $$
DECLARE
  v_tenant record;
  v_lead_id uuid;
  v_opp_id uuid;
  v_owner_id uuid;
  v_client_names text[] := ARRAY[
    'SM Investments', 'Ayala Corporation', 'Jollibee Foods', 'Globe Telecom',
    'BDO Unibank', 'Meralco', 'Petron Corporation', 'San Miguel Corporation'
  ];
  v_service_lines text[] := ARRAY['Creative', 'Digital', 'Strategy', 'Media', 'Social'];
  v_lead_count int;
BEGIN
  FOR v_tenant IN SELECT * FROM temp_tenants LOOP
    -- Get an account manager for this tenant
    SELECT id INTO v_owner_id FROM temp_users 
    WHERE tenant_id = v_tenant.id AND role = 'account_manager' 
    LIMIT 1;

    -- Create 20 leads per tenant
    FOR v_lead_count IN 1..20 LOOP
      v_lead_id := gen_random_uuid();
      
      INSERT INTO crm.leads (
        id, tenant_id, lead_name, company_name, contact_name, contact_email,
        source, status, priority, owner_id, created_at
      ) VALUES (
        v_lead_id,
        v_tenant.id,
        random_element(v_client_names) || ' - ' || random_element(v_service_lines) || ' Inquiry',
        random_element(v_client_names),
        'Contact ' || v_lead_count,
        'contact' || v_lead_count || '@client.com',
        random_element(ARRAY['website', 'referral', 'event', 'inbound']),
        random_element(ARRAY['new', 'contacted', 'qualified', 'converted']),
        random_element(ARRAY['low', 'medium', 'high']),
        v_owner_id,
        random_date('2023-01-01', '2025-11-01')
      );

      -- Convert some leads to opportunities
      IF random() > 0.5 THEN
        v_opp_id := gen_random_uuid();
        
        INSERT INTO crm.opportunities (
          id, tenant_id, lead_id, opportunity_name, client_name,
          expected_value, probability, stage, status, service_line,
          owner_id, created_at
        ) VALUES (
          v_opp_id,
          v_tenant.id,
          v_lead_id,
          random_element(v_client_names) || ' - ' || random_element(v_service_lines),
          random_element(v_client_names),
          random_between(500000, 10000000),
          random_between(20, 80),
          random_element(ARRAY['prospect', 'qualified', 'proposal', 'negotiation', 'won']),
          'active',
          random_element(v_service_lines),
          v_owner_id,
          random_date('2023-01-01', '2025-11-01')
        );

        UPDATE crm.leads SET converted_to_opportunity_id = v_opp_id WHERE id = v_lead_id;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Created leads and opportunities';
END $$;

-- =====================================================================
-- 4. Seed Engagements and Projects
-- =====================================================================

DO $$
DECLARE
  v_tenant record;
  v_eng_id uuid;
  v_proj_id uuid;
  v_owner_id uuid;
  v_partner_id uuid;
  v_pm_id uuid;
  v_client_names text[] := ARRAY[
    'SM Investments', 'Ayala Corporation', 'Jollibee Foods', 'Globe Telecom',
    'BDO Unibank', 'Meralco', 'Petron Corporation', 'San Miguel Corporation'
  ];
  v_eng_count int;
  v_proj_count int;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS temp_engagements (
    id uuid PRIMARY KEY,
    tenant_id uuid,
    engagement_code text,
    client_name text
  );

  CREATE TEMP TABLE IF NOT EXISTS temp_projects (
    id uuid PRIMARY KEY,
    tenant_id uuid,
    engagement_id uuid,
    project_code text
  );

  FOR v_tenant IN SELECT * FROM temp_tenants LOOP
    SELECT id INTO v_partner_id FROM temp_users WHERE tenant_id = v_tenant.id AND role = 'partner' LIMIT 1;
    SELECT id INTO v_owner_id FROM temp_users WHERE tenant_id = v_tenant.id AND role = 'account_manager' LIMIT 1;
    SELECT id INTO v_pm_id FROM temp_users WHERE tenant_id = v_tenant.id AND role = 'project_manager' LIMIT 1;

    -- Create 10 engagements per tenant
    FOR v_eng_count IN 1..10 LOOP
      v_eng_id := gen_random_uuid();
      
      INSERT INTO finance_ppm.engagements (
        id, tenant_id, engagement_code, engagement_name, client_name,
        engagement_type, service_line, region, contract_value, currency,
        status, owner_id, partner_id, start_date, end_date, created_at
      ) VALUES (
        v_eng_id,
        v_tenant.id,
        'ENG-' || upper(v_tenant.slug) || '-' || lpad(v_eng_count::text, 4, '0'),
        random_element(v_client_names) || ' - Campaign',
        random_element(v_client_names),
        random_element(ARRAY['project', 'retainer', 'time_materials']),
        random_element(ARRAY['Creative', 'Digital', 'Strategy']),
        'PH',
        random_between(1000000, 25000000),
        'PHP',
        'active',
        v_owner_id,
        v_partner_id,
        random_date('2023-01-01', '2025-01-01'),
        random_date('2025-06-01', '2026-12-31'),
        random_date('2023-01-01', '2025-01-01')
      );

      INSERT INTO temp_engagements VALUES (v_eng_id, v_tenant.id, 'ENG-' || upper(v_tenant.slug) || '-' || lpad(v_eng_count::text, 4, '0'), random_element(v_client_names));

      -- Create 2-3 projects per engagement
      FOR v_proj_count IN 1..random_between(2, 3) LOOP
        v_proj_id := gen_random_uuid();
        
        INSERT INTO finance_ppm.projects (
          id, tenant_id, engagement_id, project_code, project_name,
          billing_type, status, owner_id, start_date, end_date, created_at
        ) VALUES (
          v_proj_id,
          v_tenant.id,
          v_eng_id,
          'ENG-' || upper(v_tenant.slug) || '-' || lpad(v_eng_count::text, 4, '0') || '-P' || v_proj_count,
          random_element(v_client_names) || ' - Phase ' || v_proj_count,
          random_element(ARRAY['fixed_fee', 'time_materials', 'milestone']),
          'active',
          v_pm_id,
          random_date('2023-01-01', '2025-01-01'),
          random_date('2025-06-01', '2026-06-01'),
          random_date('2023-01-01', '2025-01-01')
        );

        INSERT INTO temp_projects VALUES (v_proj_id, v_tenant.id, v_eng_id, 'ENG-' || upper(v_tenant.slug) || '-' || lpad(v_eng_count::text, 4, '0') || '-P' || v_proj_count);
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Created % engagements and % projects', 
    (SELECT COUNT(*) FROM temp_engagements),
    (SELECT COUNT(*) FROM temp_projects);
END $$;

-- =====================================================================
-- 5. Seed Sample Timesheets (simplified - 1000 entries)
-- =====================================================================

DO $$
DECLARE
  v_project record;
  v_consultant_id uuid;
  v_entry_count int;
BEGIN
  FOR v_project IN SELECT * FROM temp_projects LIMIT 20 LOOP
    -- Get a consultant for this tenant
    SELECT id INTO v_consultant_id FROM temp_users 
    WHERE tenant_id = v_project.tenant_id AND role = 'consultant' 
    LIMIT 1;

    -- Create 50 timesheet entries per project
    FOR v_entry_count IN 1..50 LOOP
      INSERT INTO finance_ppm.timesheet_entries (
        id, tenant_id, employee_id, project_id,
        entry_date, week_start_date, hours, billable,
        cost_rate, bill_rate, status, created_at
      ) VALUES (
        gen_random_uuid(),
        v_project.tenant_id,
        v_consultant_id,
        v_project.id,
        random_date('2024-01-01', '2025-11-30'),
        random_date('2024-01-01', '2025-11-30'), -- Will be auto-corrected by trigger
        (random_between(4, 10) * 0.5),
        random() > 0.15, -- 85% billable
        random_between(1500, 3000),
        random_between(2000, 4000),
        random_element(ARRAY['approved', 'approved', 'submitted']),
        random_date('2024-01-01', '2025-11-30')
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Created sample timesheet entries';
END $$;

-- =====================================================================
-- 6. Seed Sample Invoices
-- =====================================================================

DO $$
DECLARE
  v_project record;
  v_engagement record;
  v_invoice_id uuid;
  v_staff_id uuid;
  v_subtotal numeric;
  v_tax_amount numeric;
BEGIN
  FOR v_project IN SELECT * FROM temp_projects LIMIT 20 LOOP
    SELECT * INTO v_engagement FROM temp_engagements WHERE id = v_project.engagement_id;
    
    SELECT id INTO v_staff_id FROM temp_users 
    WHERE tenant_id = v_project.tenant_id AND role = 'staff_accountant' 
    LIMIT 1;

    v_subtotal := random_between(200000, 3000000);
    v_tax_amount := v_subtotal * 0.12; -- 12% VAT

    v_invoice_id := gen_random_uuid();
    
    INSERT INTO finance_ppm.invoices (
      id, tenant_id, invoice_number, invoice_date, due_date,
      project_id, engagement_id, client_name,
      subtotal, tax_rate, tax_amount, total_amount, currency,
      paid_amount, status, created_by, created_at
    ) VALUES (
      v_invoice_id,
      v_project.tenant_id,
      'INV-' || lpad((random_between(1, 999999))::text, 6, '0'),
      random_date('2024-01-01', '2025-10-31'),
      random_date('2024-02-01', '2025-11-30'),
      v_project.id,
      v_engagement.id,
      v_engagement.client_name,
      v_subtotal,
      12.00,
      v_tax_amount,
      v_subtotal + v_tax_amount,
      'PHP',
      0,
      'sent',
      v_staff_id,
      random_date('2024-01-01', '2025-10-31')
    );
  END LOOP;

  RAISE NOTICE '✅ Created sample invoices';
END $$;

-- =====================================================================
-- 7. Seed Knowledge Documents (simplified)
-- =====================================================================

DO $$
DECLARE
  v_tenant record;
  v_doc_id uuid;
  v_doc_count int;
  v_titles text[] := ARRAY[
    'Month-End Close Procedures',
    'WIP Calculation Guide',
    'BIR 2307 Filing Instructions',
    'Timesheet Entry Best Practices',
    'Invoice Generation Workflow'
  ];
BEGIN
  FOR v_tenant IN SELECT * FROM temp_tenants LOOP
    FOR v_doc_count IN 1..10 LOOP
      v_doc_id := gen_random_uuid();
      
      INSERT INTO finance_ppm.knowledge_documents (
        id, tenant_id, source_type, title, content,
        category, visibility, sync_status, created_at
      ) VALUES (
        v_doc_id,
        v_tenant.id,
        'policy',
        random_element(v_titles) || ' ' || v_doc_count,
        'This is a sample knowledge document with detailed procedures...',
        random_element(ARRAY['finance', 'legal', 'operations']),
        'internal',
        'active',
        random_date('2023-01-01', '2025-01-01')
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Created sample knowledge documents';
END $$;

-- =====================================================================
-- Cleanup
-- =====================================================================

DROP FUNCTION IF EXISTS random_between(int, int);
DROP FUNCTION IF EXISTS random_date(date, date);
DROP FUNCTION IF EXISTS random_element(text[]);

-- =====================================================================
-- Summary
-- =====================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Seed script completed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Tenants: %', (SELECT COUNT(*) FROM temp_tenants);
  RAISE NOTICE '  - Users: %', (SELECT COUNT(*) FROM temp_users);
  RAISE NOTICE '  - Leads: %', (SELECT COUNT(*) FROM crm.leads);
  RAISE NOTICE '  - Opportunities: %', (SELECT COUNT(*) FROM crm.opportunities);
  RAISE NOTICE '  - Engagements: %', (SELECT COUNT(*) FROM temp_engagements);
  RAISE NOTICE '  - Projects: %', (SELECT COUNT(*) FROM temp_projects);
  RAISE NOTICE '  - Timesheets: %', (SELECT COUNT(*) FROM finance_ppm.timesheet_entries);
  RAISE NOTICE '  - Invoices: %', (SELECT COUNT(*) FROM finance_ppm.invoices);
  RAISE NOTICE '  - Knowledge Docs: %', (SELECT COUNT(*) FROM finance_ppm.knowledge_documents);
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database is ready for testing!';
END $$;
