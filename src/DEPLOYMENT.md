# Rate Card Pro - Deployment Guide

Complete guide for deploying the Rate Card Pro system in production.

## Quick Start

### Development

```bash
# 1. Clone repository
git clone https://github.com/yourorg/rate-card-pro.git
cd rate-card-pro

# 2. Start backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
bash run.sh

# 3. Seed admin users
curl -X POST http://localhost:8080/seed_admin

# 4. In another terminal, start frontend
cd ..
npm install
npm run dev
```

### Quick Test

1. **Login as AM**: `am@example.com` / `am123`
2. **Create a quote** with line items
3. **Submit** for approval
4. **Logout** and login as FD: `fd@example.com` / `admin123`
5. **Approve** the quote
6. **Download PDF** via the button

## Backend Deployment

### Option 1: Docker

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz-subset0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Initialize database
RUN python -c "from database import init_db; init_db()"

ENV RC_JWT_SECRET="change-me-in-production"
ENV RC_DB_PATH="/data/ratecard.sqlite"

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

`backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - RC_JWT_SECRET=${JWT_SECRET}
      - RC_DB_PATH=/data/ratecard.sqlite
    volumes:
      - ./data:/data
    restart: unless-stopped
```

Run:
```bash
cd backend
docker-compose up -d
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/ratecard-api.service`:

```ini
[Unit]
Description=Rate Card Pro API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ratecard-pro/backend
Environment="RC_JWT_SECRET=your-secret-key"
Environment="RC_DB_PATH=/var/lib/ratecard/ratecard.sqlite"
ExecStart=/opt/ratecard-pro/backend/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ratecard-api
sudo systemctl start ratecard-api
sudo systemctl status ratecard-api
```

### Option 3: Cloud Platforms

#### Railway.app
1. Connect GitHub repo
2. Set environment variables:
   - `RC_JWT_SECRET`
   - `RC_DB_PATH=/data/ratecard.sqlite`
3. Railway auto-detects Python and runs uvicorn

#### Render.com
1. Create new Web Service
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

#### Fly.io

Create `backend/fly.toml`:

```toml
app = "ratecard-pro-api"

[build]
  builder = "paketobuildpacks/builder:base"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[env]
  RC_DB_PATH = "/data/ratecard.sqlite"

[mounts]
  source = "ratecard_data"
  destination = "/data"
```

Deploy:
```bash
fly launch
fly volumes create ratecard_data --size 1
fly deploy
```

## Database Migration to PostgreSQL

For production, use PostgreSQL instead of SQLite.

### Install PostgreSQL adapter

Add to `requirements.txt`:
```
psycopg2-binary==2.9.9
```

### Update database.py

```python
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "sqlite:///./ratecard.sqlite"
)

# PostgreSQL URL format: postgresql://user:password@host:port/dbname
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define models here...
```

### Heroku PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
heroku config:set RC_JWT_SECRET="your-secret"
```

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel
```

Set environment variables:
- `VITE_API_URL=https://your-backend.com`

### Option 2: Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Static Hosting (AWS S3, Cloudflare Pages)

```bash
npm run build
# Upload dist/ folder to hosting provider
```

## Nginx Reverse Proxy

### Configuration

Create `/etc/nginx/sites-available/ratecard`:

```nginx
server {
    listen 80;
    server_name ratecard.yourdomain.com;

    # Frontend
    location / {
        root /var/www/ratecard-pro/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ratecard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ratecard.yourdomain.com
```

## Environment Variables

### Backend

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RC_JWT_SECRET` | JWT signing secret | `dev-secret-change-in-production` | Yes (prod) |
| `RC_DB_PATH` | SQLite database path | `./ratecard.sqlite` | No |
| `DATABASE_URL` | PostgreSQL URL | - | No |
| `PORT` | Server port | `8080` | No |

### Frontend

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` | Yes |

## Monitoring & Logging

### Application Logs

Backend logs to stdout. Capture with:

```bash
# Systemd
journalctl -u ratecard-api -f

# Docker
docker logs -f ratecard-api
```

### Health Checks

```bash
# API health
curl http://localhost:8080/healthz

# Database check
curl http://localhost:8080/roles
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor: `https://api.yourdomain.com/healthz`

## Backup Strategy

### SQLite Backup

```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp /var/lib/ratecard/ratecard.sqlite /backups/ratecard_$TIMESTAMP.sqlite
find /backups -name "ratecard_*.sqlite" -mtime +30 -delete
```

Cron job:
```cron
0 2 * * * /opt/ratecard-pro/backup.sh
```

### PostgreSQL Backup

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Security Hardening

### 1. Change Default Secrets

```bash
export RC_JWT_SECRET=$(openssl rand -hex 32)
```

### 2. Enable CORS Properly

In `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domain
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### 3. Rate Limiting

Install:
```bash
pip install slowapi
```

Add to `main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, req: LoginRequest):
    ...
```

### 4. HTTPS Only

Force HTTPS in production:

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

if os.environ.get("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

## Performance Optimization

### 1. Database Indexing

```sql
CREATE INDEX idx_requests_am_email ON requests(am_email);
CREATE INDEX idx_requests_state ON requests(state);
CREATE INDEX idx_request_items_request_id ON request_items(request_id);
```

### 2. Caching

Use Redis for session storage:

```bash
pip install redis
```

### 3. CDN for Frontend

Use Cloudflare or AWS CloudFront to serve static assets.

## Rollback Procedure

### Backend Rollback

```bash
# Docker
docker-compose down
docker-compose up -d --build previous-version

# Systemd
cd /opt/ratecard-pro/backend
git checkout previous-version
systemctl restart ratecard-api
```

### Database Rollback

```bash
# Restore from backup
cp /backups/ratecard_20251017.sqlite /var/lib/ratecard/ratecard.sqlite
systemctl restart ratecard-api
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
journalctl -u ratecard-api -n 100

# Test manually
cd /opt/ratecard-pro/backend
source .venv/bin/activate
python main.py
```

### PDF generation fails

Install system dependencies:
```bash
sudo apt-get install libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0
```

### Database locked (SQLite)

Switch to PostgreSQL for production or add:
```python
# database.py
conn = sqlite3.connect(DB_PATH, timeout=20)
```

## Support

For issues:
1. Check logs: `journalctl -u ratecard-api -f`
2. Verify environment variables
3. Test API: `curl http://localhost:8080/healthz`
4. Check GitHub Issues
5. Contact DevOps team

## License

Proprietary - Internal use only
