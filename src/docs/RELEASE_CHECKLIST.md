# Release Gate – Phase 1 (PPM + Expense + BIR + All 8 Apps)

This checklist must be **100% green** before tagging a release for real users.

Legend  
✅ done 🟡 partial / needs work 🔴 missing

---

## 1. Logging

- [ ] Structured logger exists (`lib/logger.ts`) with:
  - [ ] `correlation_id` (or `request_id`)
  - [ ] `tenant_id`
  - [ ] `workspace_id`
- [ ] All Edge Functions use the logger:
  - [ ] task queue processor
  - [ ] BIR form validator / scheduler
  - [ ] expense OCR processor
  - [ ] rate card calculation engine
- [ ] All API routes use the logger:
  - [ ] `/api/tasks/*`
  - [ ] `/api/bir/*`
  - [ ] `/api/ocr/*`
  - [ ] `/api/expenses/*`
  - [ ] `/api/quotes/*`
  - [ ] `/api/procurement/*`
- [ ] Logs for errors + audits visible in one place (Supabase logs / DO console)

---

## 2. Input Validation & Security (App Layer)

- [ ] All POST/PATCH routes use explicit schema validation (Zod):
  - [ ] `/api/tasks/*` (Finance PPM)
  - [ ] `/api/bir/*` (T&E)
  - [ ] `/api/ocr/*` (T&E)
  - [ ] `/api/expenses/*` (T&E)
  - [ ] `/api/quotes/*` (Rate Card Pro)
  - [ ] `/api/equipment/*` (Gearroom)
  - [ ] `/api/procurement/*` (Procure)
  - [ ] `/api/creative/*` (Creative Workroom)
  - [ ] `/api/wiki/*` (Wiki/Docs)
- [ ] Validation errors return HTTP `400` with clear JSON payload
- [ ] Auth failures return `401` or `403` (never generic `500`)
- [ ] Basic rate limiting enabled for:
  - [ ] `/api/bir/*`
  - [ ] `/api/ocr/*`
  - [ ] `/api/tasks/*`
  - [ ] `/api/quotes/*`
- [ ] RLS is enabled on all tables (verified via SQL / Supabase advisor):
  - [ ] PPM tables
  - [ ] Expense tables
  - [ ] BIR tables
  - [ ] Rate card tables
  - [ ] Equipment tables
  - [ ] Procurement tables
  - [ ] Creative tables
  - [ ] Wiki tables
  - [ ] BI tables

---

## 3. Database Management (Odoo CE/OCA 18 Compliance)

- [ ] Canonical schema (Medallion + SRM + Odoo models) applied successfully in staging
- [ ] All tables follow Odoo naming rules:
  - [ ] snake_case naming
  - [ ] `tenant_id` (res.company in Odoo)
  - [ ] `workspace_id` (res.users context)
  - [ ] Standard Odoo fields: `create_uid`, `create_date`, `write_uid`, `write_date`
  - [ ] `active` boolean for soft deletes
  - [ ] `state` field for workflow states
- [ ] Index plan documented in `docs/INDEX_PLAN.md`
- [ ] Indexes created for:
  - [ ] BIR status / deadlines
  - [ ] Task queue (status + due_date)
  - [ ] OCR results lookup
  - [ ] SRM rate card lookups (supplier + validity)
  - [ ] Equipment availability (status + checkout_date)
  - [ ] Quote workflow (state + approval_date)
  - [ ] Wiki search (full-text indexes)
  - [ ] BI analytics (materialized views)
- [ ] `EXPLAIN ANALYZE` run for top 10 queries; no obvious seq-scan disasters
- [ ] Foreign key constraints in place with proper ON DELETE policies
- [ ] Check constraints for business rules (amounts > 0, valid dates, etc.)

---

## 4. Caching Strategy

- [ ] List of cacheable endpoints/views documented in `docs/CACHING.md`
- [ ] Read-only analytics views cached (Supabase / Postgres / Next.js):
  - [ ] PPM overview dashboard data
  - [ ] Expense analytics
  - [ ] BIR compliance summary
  - [ ] BI dashboard metrics
  - [ ] Rate card lookups
  - [ ] Equipment catalog
  - [ ] Wiki page content
- [ ] Routes that must remain live (task queues, status mutations) are **not** cached
- [ ] Cache invalidation strategy defined (time-based or event-based)
- [ ] CDN caching for static assets (images, documents, receipts)

---

## 5. Error Handling

- [ ] Standard error wrapper in place for Edge Functions and API routes
- [ ] All handlers return a stable JSON error shape, e.g.:
  - `{ "ok": false, "error": { "code": "BIR_DEADLINE_INVALID", "message": "…" } }`
- [ ] Internal exceptions are logged with stack traces but not leaked to clients
- [ ] HTTP mapping:
  - [ ] 400 – validation / bad input
  - [ ] 401 / 403 – auth / permission
  - [ ] 404 – resource not found
  - [ ] 409 – conflict (duplicates, state races)
  - [ ] 422 – unprocessable entity (business logic violation)
  - [ ] 500 – unexpected
- [ ] Error monitoring integration (Sentry / LogRocket)

---

## 6. Configuration & Feature Flags

- [ ] All required env vars documented in `docs/CONFIG.md`
- [ ] Missing/invalid env vars fail fast at startup (no silent defaults)
- [ ] `config/featureFlags.ts` (or equivalent) exists with:
  - [ ] `RATE_CARD_PRO_ENABLED`
  - [ ] `EXPENSE_ENABLED`
  - [ ] `GEARROOM_ENABLED`
  - [ ] `PPM_ENABLED`
  - [ ] `PROCURE_ENABLED`
  - [ ] `CREATIVE_ENABLED`
  - [ ] `WIKI_ENABLED`
  - [ ] `BI_ENABLED`
  - [ ] `BIR_ENABLED`
  - [ ] `SRM_ENABLED`
  - [ ] `OCR_ENABLED`
- [ ] Non-critical features respect flags (UI + backend checks)
- [ ] Multi-tenancy configuration per workspace

---

## 7. Testing Strategy

- [ ] Playwright E2E tests cover:
  - [ ] Login + tenant/workspace switch
  - [ ] Create → approve expense flow (T&E)
  - [ ] PPM project creation + tasks + WBS + dependencies
  - [ ] BIR schedule view + upcoming deadlines
  - [ ] Rate card quote creation + approval workflow
  - [ ] Equipment checkout/checkin flow (Gearroom)
  - [ ] Purchase requisition workflow (Procure)
  - [ ] Creative brief + asset upload (Creative Workroom)
  - [ ] Wiki page creation + search (Wiki/Docs)
  - [ ] BI dashboard data loading
- [ ] Unit tests for pure logic:
  - [ ] Tax/BIR calculations
  - [ ] OCR parsing / normalization
  - [ ] Date utilities / schedule logic
  - [ ] Rate card calculations
  - [ ] Equipment availability checks
  - [ ] WBS hierarchy operations
  - [ ] Dependency graph validation
- [ ] Test commands wired to CI:
  - [ ] `npm test` (unit + integration)
  - [ ] `npm run test:e2e` (Playwright)
  - [ ] `npm run test:load` (performance)
- [ ] CI blocks merges when any test fails
- [ ] Test coverage > 70% for critical paths

---

## 8. Deployment Process

- [ ] `package.json` (or Makefile) has:
  - [ ] `deploy:staging`
  - [ ] `deploy:prod`
  - [ ] `db:migrate`
  - [ ] `db:seed`
  - [ ] `db:backup`
- [ ] A single Go-Live doc exists: `docs/GO_LIVE_CHECKLIST.md`
  - [ ] Staging deploy steps
  - [ ] Data migration steps (Odoo → Supabase)
  - [ ] Rollback steps
  - [ ] DNS/SSL configuration
  - [ ] Environment variable setup
- [ ] Post-deploy smoke tests (automated):
  - [ ] CI pipeline runs Playwright against staging after deploy
  - [ ] Health check endpoints respond
  - [ ] Database connections verified
  - [ ] n8n workflows triggered
- [ ] Release is tagged and recorded:
  - [ ] git tag `vX.Y.Z`
  - [ ] `CHANGELOG.md` updated
  - [ ] Release notes published

---

## 9. API Design (Odoo-Compatible)

- [ ] Minimal docs exist:
  - [ ] `docs/api/API_TASKS.md` (Finance PPM)
  - [ ] `docs/api/API_BIR.md` (T&E)
  - [ ] `docs/api/API_OCR.md` (T&E)
  - [ ] `docs/api/API_EXPENSES.md` (T&E)
  - [ ] `docs/api/API_QUOTES.md` (Rate Card Pro)
  - [ ] `docs/api/API_EQUIPMENT.md` (Gearroom)
  - [ ] `docs/api/API_PROCUREMENT.md` (Procure)
  - [ ] `docs/api/API_CREATIVE.md` (Creative Workroom)
  - [ ] `docs/api/API_WIKI.md` (Wiki/Docs)
  - [ ] `docs/api/API_BI.md` (Business Intelligence)
- [ ] Each doc includes:
  - [ ] Endpoint list
  - [ ] Request/response JSON examples
  - [ ] Error codes
  - [ ] Rate limits
  - [ ] Authentication requirements
- [ ] Versioning strategy defined:
  - [ ] URL prefix (e.g. `/api/v1/...`)
- [ ] Breaking changes require version bump and migration note
- [ ] Odoo XML-RPC compatibility layer (optional)

---

## 10. Performance

- [ ] One "perf story" documented in `docs/PERFORMANCE_BASELINE.md`:
  - [ ] App launcher load time (P95)
  - [ ] Rate Card Pro dashboard load time (P95)
  - [ ] PPM WBS render time (P95)
  - [ ] Expense dashboard load time (P95)
  - [ ] BI dashboard load time (P95)
  - [ ] Wiki search response time (P95)
- [ ] Timing logs captured for:
  - [ ] OCR pipeline end-to-end
  - [ ] BIR job runs (per job + batch)
  - [ ] Task queue processing loop
  - [ ] Rate card calculations
  - [ ] WBS dependency resolution
  - [ ] BI query aggregations
- [ ] Reasonable budgets defined (and logged):
  - [ ] Dashboards < 2s P95
  - [ ] OCR/BIR jobs within acceptable SLA
  - [ ] API responses < 500ms P95
  - [ ] Database queries < 100ms P95

---

## 11. Data Models (Odoo CE/OCA 18 Standards)

- [ ] All 18 tables documented in `docs/DATA_MODELS.md`
- [ ] Models follow Odoo inheritance patterns:
  - [ ] `mail.thread` for chatter/comments
  - [ ] `mail.activity.mixin` for activities
  - [ ] `portal.mixin` for portal access
- [ ] Standard Odoo fields implemented:
  - [ ] `name` (char, required)
  - [ ] `active` (boolean, default=True)
  - [ ] `state` (selection, workflow)
  - [ ] `create_date`, `create_uid`
  - [ ] `write_date`, `write_uid`
  - [ ] `company_id` (tenant_id mapping)
- [ ] Proper constraints:
  - [ ] Unique constraints on codes
  - [ ] Check constraints on amounts
  - [ ] Valid state transitions
- [ ] Materialized views for analytics:
  - [ ] `mv_expense_summary`
  - [ ] `mv_project_metrics`
  - [ ] `mv_equipment_utilization`
  - [ ] `mv_procurement_spend`

---

## 12. Integration Layer

- [ ] n8n workflows documented in `docs/N8N_WORKFLOWS.md`
- [ ] Supabase Edge Functions deployed:
  - [ ] OCR processor
  - [ ] BIR scheduler
  - [ ] Email notifications
  - [ ] Report generator
- [ ] Webhooks configured:
  - [ ] Expense approval → notify approver
  - [ ] Quote approval → trigger procurement
  - [ ] Equipment overdue → send reminder
  - [ ] Task deadline → notify assignee
- [ ] External integrations tested:
  - [ ] Odoo ERP sync (if applicable)
  - [ ] Email provider (SendGrid/Mailgun)
  - [ ] Storage (DigitalOcean Spaces)
  - [ ] OCR service (Tesseract/Google Vision)

---

## 13. Security & Compliance

- [ ] RLS policies reviewed and tested
- [ ] API keys rotated and stored in secrets manager
- [ ] CORS configured properly
- [ ] Rate limiting enforced
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF tokens on state-changing operations
- [ ] Audit logs for sensitive operations:
  - [ ] Expense approval/rejection
  - [ ] Quote approval
  - [ ] Equipment checkout
  - [ ] Purchase order creation
  - [ ] BIR form submission
- [ ] Data retention policy documented
- [ ] GDPR compliance (right to deletion, export)
- [ ] PII encryption at rest

---

## 14. Monitoring & Observability

- [ ] Application metrics tracked:
  - [ ] Request count by endpoint
  - [ ] Error rate by endpoint
  - [ ] Response time percentiles
  - [ ] Active user count
  - [ ] Database connection pool utilization
- [ ] Business metrics tracked:
  - [ ] Expense reports submitted/day
  - [ ] Quotes created/day
  - [ ] Tasks completed/day
  - [ ] Equipment checkout rate
  - [ ] Average approval time
- [ ] Alerts configured for:
  - [ ] Error rate > 5%
  - [ ] Response time > 2s P95
  - [ ] Database CPU > 80%
  - [ ] Disk usage > 85%
  - [ ] Failed n8n workflows
- [ ] Dashboard exists (Grafana/DataDog/Supabase):
  - [ ] System health overview
  - [ ] Application metrics
  - [ ] Business KPIs

---

## 15. Documentation

- [ ] README.md updated with:
  - [ ] Architecture overview
  - [ ] Quick start guide
  - [ ] Environment setup
  - [ ] Common workflows
- [ ] Developer docs exist:
  - [ ] Code style guide
  - [ ] Git workflow
  - [ ] PR template
  - [ ] Local development setup
- [ ] User docs exist:
  - [ ] User guide for each app
  - [ ] FAQ
  - [ ] Troubleshooting
  - [ ] Video tutorials (optional)
- [ ] Operations docs exist:
  - [ ] Deployment runbook
  - [ ] Incident response playbook
  - [ ] Backup/restore procedures
  - [ ] Scaling guide

---

## Release Decision

- [ ] All sections above are ✅  
- [ ] Product owner + tech owner sign-off recorded in `CHANGELOG.md`
- [ ] Smoke tests passed in staging
- [ ] Performance baselines met
- [ ] Security review completed
- [ ] Data migration tested (if applicable)
- [ ] Rollback plan validated

---

**Release Tag:** `v1.0.0`  
**Release Date:** _________  
**Approved By:** _________  
**Notes:** _________
