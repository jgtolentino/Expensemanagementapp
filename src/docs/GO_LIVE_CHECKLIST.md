# Go-Live Checklist - TBWA Agency Databank

This is the **final gate** before production deployment. All items must be ✅ before running `make go-live`.

---

## Pre-Flight Checks (T-7 Days)

### Infrastructure
- [ ] DigitalOcean droplet provisioned (8GB RAM minimum)
- [ ] Domain DNS configured (A records, CNAME)
- [ ] SSL certificates obtained (Let's Encrypt via Traefik)
- [ ] Firewall rules configured (ports 80, 443, 5432, 6379)
- [ ] Backup storage configured (DigitalOcean Spaces)
- [ ] Monitoring dashboards accessible (Grafana)
- [ ] Alert channels configured (email, Slack)

### Database
- [ ] Production database created
- [ ] All 18 tables created via migrations
- [ ] RLS policies applied and tested
- [ ] Indexes created per INDEX_PLAN.md
- [ ] Materialized views created
- [ ] Backup schedule configured (daily at 2 AM)
- [ ] Point-in-time recovery (PITR) enabled
- [ ] Connection pooling configured (PgBouncer)
- [ ] Replication configured (read replicas)

### Application
- [ ] All 8 apps deployed and accessible
- [ ] Environment variables configured
- [ ] Feature flags reviewed
- [ ] API rate limiting enabled
- [ ] CORS policies configured
- [ ] Session management tested
- [ ] Authentication working (4 demo users)
- [ ] Role-based access working
- [ ] File uploads working (receipts, assets)
- [ ] Email notifications working

### Integration
- [ ] n8n workflows deployed and tested
- [ ] OCR service responding (PaddleOCR)
- [ ] MinIO storage accessible
- [ ] Redis caching working
- [ ] Keycloak SSO configured (if using)
- [ ] Webhook endpoints tested
- [ ] External API integrations verified

### Testing
- [ ] All 34 E2E tests passing
- [ ] Unit tests passing (>70% coverage)
- [ ] Load testing completed (100 concurrent users)
- [ ] Security scan completed (no high/critical)
- [ ] Performance benchmarks met:
  - [ ] Dashboard load < 2s P95
  - [ ] API response < 500ms P95
  - [ ] Database queries < 100ms P95
- [ ] Browser compatibility verified (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified

### Documentation
- [ ] User guide complete (all 8 apps)
- [ ] API documentation published
- [ ] Operations runbook complete
- [ ] Incident response playbook ready
- [ ] Rollback procedure documented
- [ ] FAQ updated
- [ ] Video tutorials recorded (optional)

### Security
- [ ] RLS policies audited
- [ ] API keys rotated
- [ ] Secrets stored securely (not in git)
- [ ] SQL injection testing passed
- [ ] XSS testing passed
- [ ] CSRF protection enabled
- [ ] Rate limiting tested
- [ ] Audit logging verified
- [ ] Encryption at rest verified
- [ ] HTTPS enforced (no HTTP)

### Compliance
- [ ] Data retention policy documented
- [ ] GDPR compliance verified (right to deletion, export)
- [ ] PII encryption reviewed
- [ ] Terms of Service updated
- [ ] Privacy Policy updated
- [ ] Cookie consent implemented
- [ ] Data processing agreement signed (if applicable)

---

## Deployment Day (T-0)

### Pre-Deployment (08:00 AM)
- [ ] **Announce maintenance window** (email, Slack)
- [ ] Team on standby (DevOps, Product, Support)
- [ ] Rollback plan reviewed
- [ ] Backup of current state created

### Deployment Steps (09:00 AM)

#### Step 1: Infrastructure
```bash
# Provision infrastructure
make infra-bootstrap ENV=prod

# Verify services
make stack-status
```
- [ ] All services running
- [ ] Health checks passing

#### Step 2: Database Migration
```bash
# Run migrations
make db-migrate

# Verify schema
psql $DB_URL -c "\dt"
```
- [ ] All 18 tables exist
- [ ] RLS policies active
- [ ] Indexes created

#### Step 3: Application Deployment
```bash
# Deploy production stack
make stack-prod

# Verify apps
curl https://databank.tbwa.com.ph/api/health
```
- [ ] All 8 apps responding
- [ ] Health endpoint returns 200

#### Step 4: Smoke Tests (Automated)
```bash
# Run smoke tests
make uat
```
- [ ] Login flow working
- [ ] Create expense report working
- [ ] Create task working
- [ ] Create quote working
- [ ] Equipment checkout working

#### Step 5: Data Migration (If Applicable)
```bash
# Migrate from old system
python scripts/migrate_data.py --source OLD_DB --target $DB_URL
```
- [ ] Data migrated successfully
- [ ] Record counts verified
- [ ] Data integrity checks passed

#### Step 6: DNS Cutover (10:00 AM)
- [ ] DNS records updated
- [ ] TTL reduced to 300s
- [ ] Propagation monitored (use whatsmydns.net)
- [ ] Old system remains accessible (fallback)

---

## Post-Deployment (10:30 AM)

### Immediate Verification (10:30 - 11:00 AM)
- [ ] Login as all 4 demo users
- [ ] Create 1 expense report
- [ ] Create 1 quote
- [ ] Create 1 task
- [ ] Checkout 1 equipment
- [ ] Verify email notifications sent
- [ ] Check audit logs
- [ ] Monitor error rates (should be 0%)

### Extended Monitoring (11:00 AM - 2:00 PM)
- [ ] Monitor Grafana dashboards
- [ ] Watch error logs (no spikes)
- [ ] Check database CPU/memory (normal levels)
- [ ] Verify backup ran successfully
- [ ] Monitor user feedback (support tickets)
- [ ] Check performance metrics (meet SLAs)

### User Acceptance (2:00 PM - 5:00 PM)
- [ ] Internal team testing (10 users)
- [ ] Power users testing (5 users)
- [ ] Collect feedback
- [ ] Address critical issues (if any)

---

## Post-Launch (T+1 to T+7)

### Day 1
- [ ] Monitor for 24 hours straight
- [ ] Review logs for errors
- [ ] Check backup completed
- [ ] Verify all integrations working
- [ ] Send "launch successful" email

### Day 2-3
- [ ] Reduce monitoring intensity to 8 hours/day
- [ ] Collect user feedback
- [ ] Fix minor bugs (non-critical)
- [ ] Update documentation based on feedback

### Day 4-7
- [ ] Monitor business hours only
- [ ] Review performance metrics
- [ ] Plan improvements for v1.1
- [ ] Conduct retrospective meeting

---

## Rollback Procedure

If critical issues arise, execute rollback:

```bash
# Stop production stack
make stack-down

# Restore database from backup
make db-restore BACKUP_FILE=infra/backups/backup-YYYYMMDD-HHMMSS.sql

# Revert DNS records
# (manually in DigitalOcean/Cloudflare dashboard)

# Start old system
# (depends on your previous setup)

# Announce rollback
# (email, Slack)
```

### Rollback Triggers
Execute rollback if:
- ❌ Login failure rate > 10%
- ❌ API error rate > 5%
- ❌ Critical data loss detected
- ❌ Security breach detected
- ❌ Database corruption detected
- ❌ More than 3 critical bugs reported

---

## Success Criteria

Go-live is considered successful when:
- ✅ All smoke tests passing
- ✅ Zero critical bugs
- ✅ Error rate < 1%
- ✅ 90% of users can login and perform basic tasks
- ✅ Performance SLAs met
- ✅ No security incidents
- ✅ Backup completed successfully
- ✅ Monitoring dashboards green

---

## Sign-Off

Once all checklist items are ✅, obtain sign-off from:

- [ ] **Product Owner:** __________________ Date: __________
- [ ] **Tech Lead:** __________________ Date: __________
- [ ] **DevOps:** __________________ Date: __________
- [ ] **QA Lead:** __________________ Date: __________

**Official Go-Live Time:** __________ (PST)

**Release Version:** v1.0.0

**Release Notes:** [Link to CHANGELOG.md]

---

## Support Contacts

**During Launch (8 AM - 6 PM):**
- DevOps: devops@tbwa.com / +63-XXX-XXX-XXXX
- Product: product@tbwa.com / +63-XXX-XXX-XXXX
- Support: support@tbwa.com / +63-XXX-XXX-XXXX

**After Hours (Emergency Only):**
- On-call Engineer: +63-XXX-XXX-XXXX
- Escalation: cto@tbwa.com / +63-XXX-XXX-XXXX

---

## Post-Mortem

Schedule post-mortem meeting within 7 days:
- Date: __________
- Time: __________
- Attendees: Product, DevOps, QA, Support
- Topics: What went well, what didn't, improvements for next release
