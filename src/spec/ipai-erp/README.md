# ipai ERP SaaS - Spec Kit Documentation

**Full-stack SaaS ERP with Odoo 18 CE + OCA + ipai_* Smart Delta on shared Postgres**

---

## Overview

The ipai ERP SaaS platform delivers **Enterprise-level features** through a carefully architected combination of:

- **Odoo 18 CE** – UI, workflows, reports
- **OCA modules** – Community enhancements
- **ipai_* Smart Delta** – AI + custom business logic
- **Shared Postgres (Supabase)** – Single source of truth
- **Spec Kits** – Canonical schema definitions

### Architecture Principles

1. **One Canonical Truth**: All data lives in shared Postgres schemas
2. **CE + OCA = Feature Surface**: Odoo provides interaction layer
3. **ipai_* = AI Layer**: Smart Delta augments with AI/custom logic
4. **Spec Kit = Source of Truth**: Schema definitions drive migrations
5. **Multi-Tenant by Design**: `core.tenant` → workspace → domain data

---

## Directory Structure

```
spec/ipai-erp/
├── registry.yml                    # Master module registry
├── README.md                       # This file
│
├── core/                           # Core SaaS spine
│   ├── schema.yml                  # Core schemas (tenant, user, subscription)
│   ├── auth-schema.yml            # Auth & RBAC
│   ├── idp-schema.yml             # IDP (documents, OCR, RAG)
│   └── audit-schema.yml           # Audit trails
│
├── modules/                        # Domain modules
│   ├── finance_planner/
│   │   ├── schema.yml             # Finance Planner (BIR, month-end, onboarding)
│   │   └── README.md
│   ├── te_tax/
│   │   ├── schema.yml             # BIR tax engine
│   │   └── README.md
│   ├── finance_ppm/
│   │   ├── schema.yml             # Finance PPM
│   │   └── README.md
│   ├── crm_sdr/
│   │   └── schema.yml             # Auto-SDR (Arkie)
│   ├── subscription_saas/
│   │   └── schema.yml             # SaaS subscriptions
│   ├── helpdesk_ai/
│   │   └── schema.yml             # AI helpdesk
│   ├── ppm_planner_bridge/
│   │   └── schema.yml             # PPM ↔ Planner bridge
│   ├── hr_onboarding/
│   │   └── schema.yml             # HR onboarding/offboarding
│   ├── scout_retail_core/
│   │   └── schema.yml             # Scout retail
│   ├── creative_ops/
│   │   └── schema.yml             # Creative operations (CES, LIONS)
│   └── ...
│
└── integration/
    ├── odoo-mapping.yml            # Odoo ↔ Supabase mapping
    └── api-routes.yml             # Supabase Edge Function routes
```

---

## Core Schemas

### `core.tenant`
Root multi-tenant entity (maps to `res.company` in Odoo)

**Key fields:**
- `slug` – URL-safe tenant identifier
- `plan_id` – Current subscription plan
- `status` – trial | active | suspended | cancelled
- `odoo_company_id` – Link to Odoo

### `core.user_profile`
Extended user profile (extends Supabase `auth.users`)

**Key fields:**
- `tenant_id` – Parent tenant
- `employee_code` – e.g., CKVC, RIM, BOM
- `role` – admin | finance_director | finance_manager | supervisor | user
- `odoo_user_id`, `odoo_employee_id` – Odoo links

### `core.workspace`
Sub-organization units (divisions, departments, teams)

### `core.subscription`
Tenant subscription instances

### `core.plan`
Subscription plan definitions (Free, Pro, Enterprise)

---

## Domain Schemas

### Finance Domain

#### `finance_compliance.*` (Finance Planner)
Microsoft Planner-inspired task management for:
- **BIR Calendar** – All BIR filings (1601-C, 2550Q, 1702, etc.)
- **Month-End Closing** – Structured closing workflows
- **Onboarding/Offboarding** – HR workflows using planner

**Key tables:**
- `fin_plan` – Top-level plan (calendar, closing, etc.)
- `fin_bucket` – Status buckets (To Do, In Progress, Done)
- `fin_task` – Individual tasks with RACI
- `fin_checklist_item` – Checklist within tasks
- `bir_form`, `bir_filing`, `bir_task` – BIR compliance
- `month_end_period`, `month_end_task` – Month-end closing

#### `te_tax.*` (Tax Engine)
Philippine BIR tax rules, rates, schedules

#### `finance_ppm.*` (Finance PPM)
Project portfolio management with finance integration

### CRM & Sales Domain

#### `crm_sdr.*` (Auto-SDR / Arkie)
AI-powered outbound sales sequences

#### `subscription_saas.*`
SaaS subscription management with entitlements

#### `helpdesk_ai.*`
AI-powered helpdesk (auto-triage, suggestions)

### Retail Domain

#### `scout.*` (Scout Retail)
Product, store, transaction, KPI tracking

### Creative Ops Domain

#### `creative_ops.*`
Campaign effectiveness, CES scores, LIONS metrics

---

## Integration: Odoo ↔ Supabase

The system uses **three sync patterns**:

### Pattern 1: Table Override (Recommended for Core)
Odoo model reads/writes **directly** to Supabase table:

```python
class CoreTenant(models.Model):
    _name = 'core.tenant'
    _table = 'core.tenant'  # Use Supabase table directly
    
    id = fields.Char(string='UUID')
    name = fields.Char()
    slug = fields.Char()
    # ... fields match Supabase schema
```

**Pros:** Single source of truth, no sync lag  
**Cons:** Requires careful schema design

### Pattern 2: Sync Methods (Recommended for Domain)
Odoo model syncs via custom methods:

```python
class ProjectTask(models.Model):
    _inherit = 'project.task'
    
    x_fin_task_uuid = fields.Char()
    
    def write(self, vals):
        res = super().write(vals)
        self._sync_to_supabase()
        return res
    
    def _sync_to_supabase(self):
        # Call Supabase Edge Function
        pass
```

**Pros:** Full control, familiar patterns  
**Cons:** Potential sync lag, requires conflict resolution

### Pattern 3: Postgres Triggers
Database-level triggers propagate changes:

```sql
CREATE TRIGGER user_profile_to_odoo
AFTER UPDATE ON core.user_profile
FOR EACH ROW
EXECUTE FUNCTION sync_user_profile_to_res_users();
```

**Pros:** Real-time, guaranteed consistency  
**Cons:** Complex, hard to debug

---

## Schema Development Workflow

### 1. Define Schema in Spec Kit

Create `spec/ipai-erp/modules/my_module/schema.yml`:

```yaml
version: "1.0.0"
schema_namespace: "my_module"
module: "ipai_my_module"
depends_on:
  - ipai_core_saas

tables:
  my_table:
    description: "My table description"
    primary_key: id
    rls_enabled: true
    
    columns:
      id:
        type: uuid
        default: gen_random_uuid()
        nullable: false
      # ... more columns
```

### 2. Register Module

Add to `spec/ipai-erp/registry.yml`:

```yaml
my_domain_modules:
  ipai_my_module:
    type: ipai_smart_delta
    description: "My module description"
    schemas:
      - my_module.my_table
    odoo_models:
      - my.odoo.model
    spec_kit: "spec/ipai-erp/modules/my_module/schema.yml"
    dependencies:
      - ipai_core_saas
```

### 3. Validate Spec

```bash
python scripts/validate-spec-kits.py --spec spec/ipai-erp/modules/my_module/schema.yml
```

### 4. Generate Migration

```bash
python scripts/generate-migrations.py --spec spec/ipai-erp/modules/my_module/schema.yml
```

### 5. Apply Migration

```bash
psql $SUPABASE_DATABASE_URL -f migrations/<timestamp>_ipai_my_module_my_module.sql
```

### 6. Create Odoo Module

Create `addons/ipai_my_module/models/my_model.py`:

```python
from odoo import models, fields

class MyModel(models.Model):
    _name = 'my_module.my_table'
    _table = 'my_module.my_table'  # Use Supabase table
    
    id = fields.Char(required=True)
    # ... fields match schema.yml
```

---

## CI/CD Guardrails

### 1. Spec Kit Presence Check
**Rule:** Every `ipai_*` module MUST have a `spec_kit` defined in `registry.yml`

**Enforcement:**
```bash
python scripts/validate-spec-kits.py --all
```

### 2. Schema Migration Sync
**Rule:** All `schema.yml` changes MUST generate SQL migrations

**Enforcement:**
```bash
git diff spec/ | grep -q "\.yml" && python scripts/generate-migrations.py --all
```

### 3. Schema Audit on Deploy
**Rule:** Deployed DB schema MUST match spec_kit definitions

**Enforcement:**
```bash
python scripts/audit-schema.py --database $SUPABASE_URL
```

### 4. Dependency Validation
**Rule:** Module dependencies MUST be satisfied in deployment order

**Enforcement:**
```bash
python scripts/validate-spec-kits.py --check-dependencies
```

### 5. RLS Policy Enforcement
**Rule:** All tenant-scoped tables MUST have RLS policies

**Enforcement:**
```bash
python scripts/validate-spec-kits.py --check-rls
```

---

## Deployment Topology

```
┌─────────────────────────────────────────────────────────┐
│                  Supabase Postgres                      │
│  ┌──────────┬──────────────┬────────────┬───────────┐  │
│  │   core   │ finance_comp │  te_tax    │  scout    │  │
│  │ (tenant, │ (fin_plan,   │ (tax_rule, │ (product, │  │
│  │  user,   │  bir_filing, │  rate,     │  store,   │  │
│  │  subs)   │  month_end)  │  schedule) │  trans)   │  │
│  └──────────┴──────────────┴────────────┴───────────┘  │
└─────────────────────────────────────────────────────────┘
           │                            │
           │                            │
  ┌────────▼────────┐         ┌────────▼────────┐
  │  Odoo 18 CE     │         │  Supabase Edge  │
  │  (UI, Workflow) │         │  Functions      │
  │                 │         │  (Hono API)     │
  │ - res.company   │         │                 │
  │ - res.users     │         │ - /api/bir      │
  │ - project.task  │         │ - /api/month-end│
  │ - account.move  │         │ - /api/planner  │
  └─────────────────┘         └─────────────────┘
           │                            │
           └────────────┬───────────────┘
                        │
                ┌───────▼────────┐
                │  React + Vite  │
                │  Finance UI    │
                │                │
                │ - BIR Calendar │
                │ - Planner      │
                │ - Dashboards   │
                └────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Month 1-2)
**Modules:**
- `ipai_core_saas`
- `ipai_core_auth`
- `ipai_idp_documents`
- `ipai_audit_log`
- `ipai_finance_planner` ✅ (YOU ARE HERE)
- `ipai_te_tax`
- `ipai_finance_ppm`

**Deliverables:**
- ✅ Core schemas deployed
- ✅ Finance Planner schema complete
- ✅ Seed data (BIR forms, month-end templates)
- Frontend UI (React) – **NEXT STEP**

### Phase 2: CRM & Sales (Month 3-4)
**Modules:**
- `ipai_crm_sdr`
- `ipai_subscription_saas`
- `ipai_helpdesk_ai`

### Phase 3: Projects & HR (Month 5-6)
**Modules:**
- `ipai_ppm_planner_bridge`
- `ipai_ppm_ai`
- `ipai_hr_core`
- `ipai_hr_onboarding`
- `ipai_hr_ai_coach`

### Phase 4: Verticals (Month 7-9)
**Modules:**
- `ipai_scout_retail_core`
- `ipai_scout_ai_bi`
- `ipai_creative_ops`
- `ipai_creative_ai`

### Phase 5: Content (Month 10-12)
**Modules:**
- `ipai_knowledge_ai`
- `ipai_marketing_site`

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/ipai-erp.git
cd ipai-erp
```

### 2. Install Dependencies
```bash
pip install pyyaml  # For Python scripts
npm install         # For frontend
```

### 3. Validate Spec Kits
```bash
python scripts/validate-spec-kits.py --all
```

### 4. Generate Migrations
```bash
python scripts/generate-migrations.py --all
```

### 5. Deploy to Supabase
```bash
# Set your Supabase connection string
export SUPABASE_DATABASE_URL="postgresql://..."

# Apply migrations
psql $SUPABASE_DATABASE_URL -f migrations/core/*.sql
psql $SUPABASE_DATABASE_URL -f migrations/finance_planner/*.sql
```

### 6. Load Seed Data
```bash
psql $SUPABASE_DATABASE_URL -f docs/seed-data.sql
psql $SUPABASE_DATABASE_URL -f docs/generate-bir-calendar-2026.sql
```

### 7. Deploy Edge Functions
```bash
cd supabase/functions
supabase functions deploy make-server-7fad9ebd
```

### 8. Run Frontend
```bash
npm run dev
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `registry.yml` | Master module registry (Enterprise parity map) |
| `core/schema.yml` | Core SaaS spine (tenant, user, subscription) |
| `modules/finance_planner/schema.yml` | Finance Planner (BIR, month-end, onboarding) |
| `integration/odoo-mapping.yml` | Odoo ↔ Supabase sync patterns |
| `scripts/generate-migrations.py` | Convert schema.yml → SQL migrations |
| `scripts/validate-spec-kits.py` | Validate spec files against registry |
| `docs/seed-data.sql` | Seed data (BIR forms, users, templates) |
| `docs/generate-bir-calendar-2026.sql` | 2026 BIR filing calendar |
| `docs/finance-compliance-data-model.md` | Complete data model documentation |

---

## Support & Contributing

**Questions?** Open an issue or contact the platform team.

**Contributing:**
1. Create feature branch: `git checkout -b feature/my-module`
2. Add spec kit: `spec/ipai-erp/modules/my_module/schema.yml`
3. Register in `registry.yml`
4. Validate: `python scripts/validate-spec-kits.py --spec ...`
5. Generate migration: `python scripts/generate-migrations.py --spec ...`
6. Submit PR

---

## License

Proprietary – InsightPulseAI © 2025
