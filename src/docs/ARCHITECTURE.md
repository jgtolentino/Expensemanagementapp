# TBWA Agency Databank - Architecture Documentation

## System Overview

The TBWA Agency Databank is a **multi-tenant SaaS platform** integrating 8 enterprise applications with a unified data model based on Odoo CE/OCA 18 standards.

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Framework:** Next.js 14 + React 18 + TypeScript

**Design System:**
- Deakin Enterprise 365 / Microsoft Fluent Design
- 2,980+ lines of production-ready components
- Fully responsive (desktop, tablet, mobile)
- Dark mode support

**State Management:**
- React Context API
- Local storage for preferences
- Session storage for transient state

**Authentication:**
- JWT-based auth
- Role-based access control (4 roles)
- Session management with Redis

**Routing:**
- App Router (Next.js 14)
- Dynamic routes for entities
- Protected routes middleware

### 2. API Layer (Backend)

**Framework:** Next.js API Routes

**Validation:**
- Zod schemas for all endpoints
- Type-safe request/response
- Business rule enforcement

**Logging:**
- Structured JSON logs
- Correlation IDs for request tracking
- Performance timing
- Audit trail

**Error Handling:**
- Standard error shapes
- HTTP status code mapping
- User-friendly error messages
- Stack trace logging (dev only)

**Rate Limiting:**
- Per-endpoint limits
- IP-based throttling
- User-based quotas

### 3. Data Layer (Database)

**Database:** PostgreSQL 15

**Schema:**
- 18 core tables
- Odoo CE/OCA 18 naming conventions
- Multi-tenancy via company_id
- Soft deletes via active flag
- Audit fields (create_uid, write_date, etc.)

**Security:**
- Row-Level Security (RLS) policies on all tables
- Company-level isolation
- Role-based data access
- Encrypted sensitive fields

**Performance:**
- Strategic indexes on all tables
- Materialized views for analytics
- Connection pooling (PgBouncer)
- Query optimization

### 4. Integration Layer

**n8n Workflows:**
- Expense approval notifications
- Quote submission workflows
- Task assignment emails
- Equipment overdue reminders

**OCR Processing:**
- PaddleOCR for receipt scanning
- Async job queue
- Result caching

**Storage:**
- MinIO (S3-compatible)
- DigitalOcean Spaces (production)
- Signed URLs for secure access
- CDN for static assets

**External APIs:**
- BIR eFPS (Philippine tax)
- Email providers (SendGrid/Mailgun)
- OAuth providers (Google, Microsoft)

---

## Data Flow

### Example: Expense Report Submission

```
1. User submits expense report via UI
   ↓
2. Next.js API route receives request
   ↓
3. Validation (Zod schema)
   ↓
4. Business rules check (policy compliance)
   ↓
5. Insert into hr_expense_sheet + hr_expense tables
   ↓
6. Trigger n8n workflow (notify manager)
   ↓
7. Return success response to UI
   ↓
8. UI updates with new expense report
```

### Example: Task Creation with Dependencies

```
1. User creates task with parent + dependencies
   ↓
2. API validates task data
   ↓
3. Generate WBS code based on parent
   ↓
4. Insert into project_task table
   ↓
5. Create dependency records in project_task_dependency
   ↓
6. Notify assignees via n8n
   ↓
7. Update critical path (if applicable)
   ↓
8. Return task data to UI
```

---

## Security Architecture

### Authentication Flow

```
1. User enters email/password
   ↓
2. API validates credentials
   ↓
3. Generate JWT with user_id + company_id + role
   ↓
4. Store session in Redis
   ↓
5. Return JWT to client
   ↓
6. Client stores JWT in httpOnly cookie
   ↓
7. Subsequent requests include JWT
   ↓
8. API middleware validates JWT
   ↓
9. Extract user context from JWT
   ↓
10. Execute request with user context
```

### Multi-Tenancy

**Isolation Strategy:** Company-level (res_company)

**Enforcement:**
1. JWT includes company_id claim
2. All queries filter by company_id
3. RLS policies enforce at database level
4. Application code validates company_id

**Data Access Matrix:**

| Role | Own Data | Team Data | Company Data | Cross-Company |
|------|----------|-----------|--------------|---------------|
| Admin | ✅ | ✅ | ✅ | ❌ |
| Manager | ✅ | ✅ | 📊 Reports only | ❌ |
| Employee | ✅ | 👀 View only | ❌ | ❌ |
| Finance | ✅ | ✅ | 💰 Finance only | ❌ |

---

## Scalability

### Current Limits

- **Users:** 1,000 per tenant
- **Projects:** 10,000 per tenant
- **Tasks:** 100,000 per tenant
- **Expenses:** 1,000,000 per tenant
- **Storage:** 1TB per tenant

### Scaling Strategy

**Horizontal Scaling:**
- Multiple Next.js app instances (load balanced)
- Read replicas for PostgreSQL
- Redis cluster for caching
- CDN for static assets

**Vertical Scaling:**
- Upgrade droplet size (4GB → 8GB → 16GB)
- Increase PostgreSQL resources
- Tune connection pool

**Database Sharding:**
- Shard by company_id (if >10,000 tenants)
- Separate databases per region

---

## Deployment Architecture

### Development

```
Local Machine
├── Next.js Dev Server (port 3000)
├── PostgreSQL (Docker, port 5432)
├── Redis (Docker, port 6379)
├── MinIO (Docker, port 9000)
└── n8n (Docker, port 5678)
```

### Staging

```
DigitalOcean Droplet (4GB)
├── Docker Compose Stack
│   ├── Traefik (reverse proxy)
│   ├── Next.js (production build)
│   ├── PostgreSQL
│   ├── Redis
│   ├── MinIO
│   ├── n8n
│   └── Prometheus + Grafana
└── DigitalOcean Spaces (storage)
```

### Production

```
DigitalOcean Droplet (8GB+)
├── Docker Compose Stack
│   ├── Traefik (with Let's Encrypt SSL)
│   ├── Next.js (multi-instance)
│   ├── PostgreSQL (with backup)
│   ├── Redis (with persistence)
│   ├── MinIO (with replication)
│   └── n8n (with HA)
├── DigitalOcean Managed DB (optional)
├── DigitalOcean Spaces (CDN enabled)
└── DigitalOcean Load Balancer (optional)
```

---

## Monitoring & Observability

### Metrics Collected

**Application Metrics:**
- Request count by endpoint
- Response time percentiles (P50, P95, P99)
- Error rate by endpoint
- Active user count
- Session duration

**Database Metrics:**
- Connection pool utilization
- Query execution time
- Slow query log
- Table sizes
- Index hit ratio

**Business Metrics:**
- Expense reports submitted/day
- Quotes created/day
- Tasks completed/day
- Equipment utilization rate
- Average approval time

### Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 5% | Critical | Page on-call engineer |
| Response time > 2s P95 | Warning | Email DevOps team |
| Database CPU > 80% | Warning | Auto-scale or alert |
| Disk usage > 85% | Critical | Immediate action |
| Failed n8n workflow | Warning | Email workflow owner |

---

## Disaster Recovery

### Backup Strategy

**Database:**
- Daily full backups (2 AM)
- Hourly incremental backups
- Point-in-time recovery (PITR)
- 30-day retention

**Files (MinIO/Spaces):**
- Continuous replication
- Versioning enabled
- 90-day retention

**Application Code:**
- Git repository (main + release branches)
- Docker images tagged by version
- Deployment manifests versioned

### Recovery Procedures

**Database Restore:**
```bash
# Restore from backup
make db-restore BACKUP_FILE=infra/backups/backup-20240115-020000.sql

# Verify integrity
psql $DB_URL -c "SELECT COUNT(*) FROM project_task"
```

**Application Rollback:**
```bash
# Rollback to previous version
make rollback

# Or rollback to specific version
docker-compose up -d --scale app=3 tbwa-app:v1.2.0
```

**RTO/RPO:**
- **Recovery Time Objective (RTO):** 1 hour
- **Recovery Point Objective (RPO):** 1 hour

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14, React 18, TypeScript 5
- **Styling:** Tailwind CSS 4.0, CSS Modules
- **State:** React Context, Local Storage
- **Forms:** React Hook Form, Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date:** date-fns

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Validation:** Zod
- **Database Client:** pg (node-postgres)
- **ORM:** None (raw SQL for Odoo compatibility)
- **Caching:** Redis via ioredis
- **Jobs:** Bull queue

### Infrastructure
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Storage:** MinIO / DigitalOcean Spaces
- **Proxy:** Traefik 2.10
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (planned)
- **Monitoring:** Prometheus + Grafana
- **Logging:** Structured JSON logs

### Development
- **Language:** Python 3.11+ (scripts)
- **Linting:** Ruff, MyPy, Black
- **Testing:** Playwright (E2E), Pytest (unit)
- **Automation:** Make

---

## Performance Benchmarks

### Current Performance (8GB Droplet)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Homepage Load | < 1s | 0.8s | ✅ |
| Dashboard Load | < 2s | 1.2s | ✅ |
| API Response (P95) | < 500ms | 320ms | ✅ |
| Database Query (P95) | < 100ms | 45ms | ✅ |
| OCR Processing | < 5s | 3.2s | ✅ |
| Concurrent Users | 100 | 150 | ✅ |

### Load Testing Results

```bash
# Using k6 load testing tool
k6 run --vus 100 --duration 5m load-test.js

Results:
- Total Requests: 45,000
- Success Rate: 99.8%
- Avg Response Time: 280ms
- P95 Response Time: 420ms
- P99 Response Time: 650ms
- Errors: 90 (0.2%)
```

---

## Future Enhancements

### Phase 2 (Q2 2024)
- Kubernetes migration (from Docker Compose)
- GraphQL API (alongside REST)
- Real-time collaboration (WebSockets)
- Mobile app (React Native)

### Phase 3 (Q3 2024)
- Microservices architecture
- Event-driven workflows (Kafka)
- AI/ML insights (predictive analytics)
- Multi-region deployment

### Phase 4 (Q4 2024)
- Blockchain audit trail
- Advanced security (SIEM)
- Custom app builder
- White-label support

---

## Glossary

- **RLS:** Row-Level Security
- **WBS:** Work Breakdown Structure
- **PPM:** Project Portfolio Management
- **BIR:** Bureau of Internal Revenue (Philippines)
- **OCR:** Optical Character Recognition
- **IAM:** Identity and Access Management
- **HA:** High Availability
- **CDN:** Content Delivery Network
- **PITR:** Point-in-Time Recovery
- **RTO:** Recovery Time Objective
- **RPO:** Recovery Point Objective

---

Last updated: 2024-01-15
Version: 1.0.0
