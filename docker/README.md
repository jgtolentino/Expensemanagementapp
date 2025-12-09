# InsightPulse AI Enterprise - Docker Deployment

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your settings
nano .env

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f odoo

# 5. Access Odoo
open http://localhost:8069
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `odoo` | 8069 | Odoo ERP Server |
| `db` | 5432 | PostgreSQL Database |
| `canvas-ui` | 3000 | React Canvas Dashboard (dev profile) |
| `redis` | 6379 | Session Cache (production profile) |

## Profiles

```bash
# Development (includes Canvas UI hot reload)
docker-compose --profile dev up -d

# Production (includes Redis cache)
docker-compose --profile production up -d

# Both profiles
docker-compose --profile dev --profile production up -d
```

## Installed Modules

### Core IPAI Modules

| Module | Description | Parity Target |
|--------|-------------|---------------|
| `ipai_ppm_clarity` | Clarity 16.1.1 Canvas & PPM | 95% Clarity PPM |
| `ipai_finance_ssc` | Shared Services Finance | 95% SAP S/4HANA |
| `ipai_bir_compliance` | Philippines BIR Compliance | Local Regulations |
| `ipai_security_audit` | SOC 2 / ISO 27001 Audit | Enterprise Security |

### Clarity 16.1.1 Features (ipai_ppm_clarity)

- Canvas Dashboard with configurable widgets
- Number Tile, Progress Ring, Pie, Bar, Table widgets
- Widget Library (My Widgets vs Shared)
- Target Widgets with variance tracking
- WBS Hierarchy with autoschedule (CPM)
- Task Dependencies (FS/SS/FF/SF + lag)
- Phases, Milestones, Tasks, To-Dos
- Task Links and Conversations
- Subprojects with proxy tasks
- Baselines with schedule variance

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | insightpulse | Database name |
| `POSTGRES_USER` | odoo | Database user |
| `POSTGRES_PASSWORD` | odoo | Database password |
| `ODOO_PORT` | 8069 | HTTP port |
| `INSTALL_MODULES` | ipai_ppm_clarity | Modules to install |
| `AUTO_UPGRADE` | true | Auto-upgrade on start |

## Commands

```bash
# Rebuild after code changes
docker-compose build odoo

# Restart with rebuild
docker-compose up -d --build

# Execute Odoo CLI
docker-compose exec odoo odoo --help

# Database backup
docker-compose exec db pg_dump -U odoo insightpulse > backup.sql

# Database restore
docker-compose exec -T db psql -U odoo insightpulse < backup.sql

# Shell access
docker-compose exec odoo bash

# Install specific module
docker-compose exec odoo odoo -d insightpulse -i ipai_ppm_clarity --stop-after-init

# Upgrade module
docker-compose exec odoo odoo -d insightpulse -u ipai_ppm_clarity --stop-after-init
```

## Production Deployment

1. **Set secure passwords** in `.env`
2. **Enable workers** in `config/odoo.conf`:
   ```ini
   workers = 4
   max_cron_threads = 2
   ```
3. **Use production profile**:
   ```bash
   docker-compose --profile production up -d
   ```
4. **Configure reverse proxy** (nginx/traefik)
5. **Enable HTTPS** with certificates
6. **Set up monitoring** (Prometheus/Grafana)

## Health Checks

```bash
# Check Odoo health
curl http://localhost:8069/web/health

# Check database
docker-compose exec db pg_isready -U odoo

# Check all services
docker-compose ps
```

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL logs
docker-compose logs db

# Verify database exists
docker-compose exec db psql -U odoo -l
```

### Module installation errors
```bash
# Check Odoo logs
docker-compose logs odoo

# Manual module install with verbose output
docker-compose exec odoo odoo -d insightpulse -i ipai_ppm_clarity --stop-after-init --log-level=debug
```

### Permission issues
```bash
# Fix addon permissions
docker-compose exec odoo chown -R odoo:odoo /mnt/extra-addons
```
