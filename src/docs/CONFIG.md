# Configuration Guide - TBWA Agency Databank

All environment variables required for production deployment.

## Required Environment Variables

### Database (Supabase)

```bash
# Supabase Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only, never expose

# Direct PostgreSQL Connection (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### Authentication

```bash
# JWT Secret (must match Supabase)
JWT_SECRET=your-jwt-secret-here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### Storage (DigitalOcean Spaces / S3-compatible)

```bash
# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET=tbwa-databank
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_REGION=sgp1

# Or use Supabase Storage
STORAGE_BUCKET=tbwa-databank
```

### n8n Workflows

```bash
# n8n Instance
N8N_URL=https://n8n.your-domain.com
N8N_API_KEY=your-n8n-api-key

# Webhook URLs
N8N_WEBHOOK_EXPENSE_APPROVED=https://n8n.your-domain.com/webhook/expense-approved
N8N_WEBHOOK_QUOTE_SUBMITTED=https://n8n.your-domain.com/webhook/quote-submitted
N8N_WEBHOOK_TASK_ASSIGNED=https://n8n.your-domain.com/webhook/task-assigned
N8N_WEBHOOK_EQUIPMENT_OVERDUE=https://n8n.your-domain.com/webhook/equipment-overdue
```

### OCR Service

```bash
# OCR Provider (choose one)
OCR_PROVIDER=tesseract # tesseract, google, aws

# Google Cloud Vision (if using Google)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# AWS Textract (if using AWS)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-southeast-1
```

### Email Service

```bash
# SendGrid
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@tbwa-databank.com
SENDGRID_FROM_NAME=TBWA Databank

# Or Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.your-domain.com
```

### BIR (Philippines Tax)

```bash
# BIR eFPS Integration (optional)
BIR_EFPS_USERNAME=your-bir-username
BIR_EFPS_PASSWORD=your-bir-password
BIR_TIN=your-company-tin
```

### Application Settings

```bash
# Environment
NODE_ENV=production # development, staging, production
APP_URL=https://databank.tbwa.com.ph
API_URL=https://api.databank.tbwa.com.ph

# Logging
LOG_LEVEL=info # debug, info, warn, error
LOG_FORMAT=json # json, pretty

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret
SESSION_TIMEOUT=86400 # 24 hours in seconds
```

### Feature Flags

```bash
# App Modules
FEATURE_RATE_CARD_PRO=true
FEATURE_EXPENSE=true
FEATURE_GEARROOM=true
FEATURE_PPM=true
FEATURE_PROCURE=true
FEATURE_CREATIVE=true
FEATURE_WIKI=true
FEATURE_BI=true

# Additional Features
FEATURE_BIR=true
FEATURE_SRM=true
FEATURE_OCR=true
FEATURE_N8N_WORKFLOWS=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

### Monitoring & Observability

```bash
# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# LogRocket (optional)
LOGROCKET_APP_ID=your-logrocket-app-id

# DataDog (optional)
DATADOG_API_KEY=your-datadog-api-key
DATADOG_APP_KEY=your-datadog-app-key
```

### Redis (Caching & Queues)

```bash
# Redis Connection
REDIS_URL=redis://default:password@your-redis-host:6379

# Cache TTL (seconds)
CACHE_TTL_SHORT=300 # 5 minutes
CACHE_TTL_MEDIUM=3600 # 1 hour
CACHE_TTL_LONG=86400 # 24 hours
```

### Background Jobs

```bash
# Job Queue
QUEUE_PROVIDER=redis # redis, pg-boss, bullmq

# Job Concurrency
JOB_CONCURRENCY=5

# Retry Settings
JOB_MAX_RETRIES=3
JOB_RETRY_DELAY=60000 # 1 minute in ms
```

---

## Environment-Specific Configurations

### Development (.env.development)

```bash
NODE_ENV=development
APP_URL=http://localhost:3000
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Use local Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=local-anon-key

# Disable external services
FEATURE_OCR=false
FEATURE_N8N_WORKFLOWS=false
FEATURE_EMAIL_NOTIFICATIONS=false
```

### Staging (.env.staging)

```bash
NODE_ENV=staging
APP_URL=https://staging.databank.tbwa.com.ph
LOG_LEVEL=debug
LOG_FORMAT=json

# Use staging Supabase
SUPABASE_URL=https://staging-project.supabase.co

# Enable all features for testing
FEATURE_RATE_CARD_PRO=true
FEATURE_EXPENSE=true
FEATURE_GEARROOM=true
FEATURE_PPM=true
FEATURE_PROCURE=true
FEATURE_CREATIVE=true
FEATURE_WIKI=true
FEATURE_BI=true
FEATURE_BIR=true
FEATURE_SRM=true
FEATURE_OCR=true
FEATURE_N8N_WORKFLOWS=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

### Production (.env.production)

```bash
NODE_ENV=production
APP_URL=https://databank.tbwa.com.ph
LOG_LEVEL=info
LOG_FORMAT=json

# Production Supabase
SUPABASE_URL=https://prod-project.supabase.co

# All features enabled
FEATURE_RATE_CARD_PRO=true
FEATURE_EXPENSE=true
FEATURE_GEARROOM=true
FEATURE_PPM=true
FEATURE_PROCURE=true
FEATURE_CREATIVE=true
FEATURE_WIKI=true
FEATURE_BI=true
FEATURE_BIR=true
FEATURE_SRM=true
FEATURE_OCR=true
FEATURE_N8N_WORKFLOWS=true
FEATURE_EMAIL_NOTIFICATIONS=true

# Production-only settings
SENTRY_TRACES_SAMPLE_RATE=0.01 # Lower sampling in prod
RATE_LIMIT_MAX_REQUESTS=50 # Stricter rate limiting
```

---

## Validation

Run this script to validate required env vars at startup:

```typescript
// lib/config/validate.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // App
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  APP_URL: z.string().url(),
  
  // Optional services
  OCR_PROVIDER: z.enum(['tesseract', 'google', 'aws']).optional(),
  N8N_URL: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().optional(),
});

export function validateConfig() {
  try {
    ConfigSchema.parse(process.env);
    console.log('✅ Configuration validated successfully');
  } catch (err) {
    console.error('❌ Configuration validation failed:', err);
    process.exit(1);
  }
}
```

Call `validateConfig()` in your main entry point (e.g., `pages/_app.tsx` or server startup).

---

## Secrets Management

### Development
- Use `.env.local` (gitignored)
- Never commit secrets to git

### Production
- Use environment variables in Vercel/DigitalOcean App Platform
- Or use secret management service:
  - HashiCorp Vault
  - AWS Secrets Manager
  - Google Secret Manager
  - Doppler

### Rotation Policy
- Rotate secrets every 90 days
- Document rotation in `SECURITY.md`
- Use different keys per environment

---

## Feature Flag Management

Feature flags are controlled via environment variables. To toggle features:

1. **Development**: Edit `.env.local`
2. **Staging**: Update staging deployment config
3. **Production**: Use gradual rollout:
   - Deploy with flag OFF
   - Test internally
   - Enable for 10% users
   - Monitor metrics
   - Enable for 100% users

---

## Default Values

If env var is not set, these defaults apply:

```typescript
// lib/config/defaults.ts
export const DEFAULT_CONFIG = {
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
  RATE_LIMIT_WINDOW: 15,
  RATE_LIMIT_MAX_REQUESTS: 100,
  SESSION_TIMEOUT: 86400,
  CACHE_TTL_SHORT: 300,
  CACHE_TTL_MEDIUM: 3600,
  CACHE_TTL_LONG: 86400,
  JOB_CONCURRENCY: 5,
  JOB_MAX_RETRIES: 3,
};
```

---

## Health Check

Create a health check endpoint that verifies all critical services:

```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
    n8n: await checkN8n(),
  };
  
  const allHealthy = Object.values(checks).every(c => c.healthy);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  });
}
```

Access at: `https://databank.tbwa.com.ph/api/health`

---

## Troubleshooting

### "Supabase connection failed"
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check firewall rules
- Verify RLS policies

### "OCR not working"
- Check `OCR_PROVIDER` is set
- Verify provider credentials
- Check file size limits

### "Emails not sending"
- Verify `SENDGRID_API_KEY`
- Check sender domain verification
- Review SendGrid activity log

### "Feature flag not working"
- Restart application after env var change
- Verify env var name (case-sensitive)
- Check feature flag middleware

---

## Security Best Practices

1. **Never log secrets** - Redact in logs
2. **Use HTTPS** - All URLs must use HTTPS in production
3. **Rotate regularly** - 90-day rotation policy
4. **Least privilege** - Each service gets minimum required permissions
5. **Audit access** - Log all secret accesses
6. **Encrypt at rest** - Use encrypted environment variable stores

---

## References

- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/local-development#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [12-Factor App Config](https://12factor.net/config)
