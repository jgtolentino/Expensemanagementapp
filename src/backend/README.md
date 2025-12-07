# Rate Card Pro - Backend API

FastAPI backend for Rate Card Pro quote management system.

## Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database and run
bash run.sh
```

## Seed Admin Users

```bash
curl -X POST http://localhost:8080/seed_admin
```

This creates:
- **FD (Finance Director)**: `fd@example.com` / `admin123`
- **AM (Account Manager)**: `am@example.com` / `am123`

## API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token

### Requests (Quotes)
- `POST /requests` - Create new request (AM only)
- `GET /requests` - List requests (role-filtered)
- `GET /requests/{id}` - Get request details
- `POST /requests/{id}/submit` - Submit for approval (AM only)

### Approvals (FD only)
- `POST /approvals/{id}/review` - Review and edit
- `POST /approvals/{id}/approve` - Approve request
- `POST /approvals/{id}/reject` - Reject request

### PDF
- `GET /pdf/{id}` - Generate PDF for approved request

### Utilities
- `GET /roles` - Get role tiers for quotes
- `GET /healthz` - Health check

## Environment Variables

- `RC_JWT_SECRET` - JWT signing secret (default: "dev-secret-change-in-production")
- `RC_DB_PATH` - SQLite database path (default: "./ratecard.sqlite")

## Security

- JWT-based authentication (HS256)
- Role-based authorization (AM vs FD)
- All state transitions logged to `approval_events` table
