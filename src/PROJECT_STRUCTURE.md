# Rate Card Pro - Project Structure

Complete end-to-end quote management system with role-based authorization.

## Architecture

```
rate-card-pro/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main FastAPI application
│   ├── auth.py                # JWT authentication
│   ├── security.py            # Authorization middleware
│   ├── database.py            # SQLite database setup
│   ├── requirements.txt       # Python dependencies
│   ├── run.sh                 # Startup script
│   └── README.md              # Backend documentation
│
├── frontend/                   # React web client (mobile-first)
│   ├── RateCardApp.tsx        # Main application component
│   ├── types.ts               # TypeScript type definitions
│   ├── lib/
│   │   └── api.ts             # API client with mock data
│   └── ratecard/
│       ├── LoginScreen.tsx    # Authentication screen
│       ├── Dashboard.tsx      # Dashboard with stats
│       ├── RequestForm.tsx    # Quote creation form
│       ├── RequestList.tsx    # List of quotes
│       └── RequestDetail.tsx  # Quote detail & approval
│
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD pipeline
│
└── PROJECT_STRUCTURE.md       # This file
```

## Features

### Authentication & Authorization
- **JWT-based authentication** (HS256)
- **Two roles**: AM (Account Manager) and FD (Finance Director)
- **Role-based access control** on all endpoints
- **Secure password hashing** with bcrypt

### Account Manager (AM) Features
- Create draft quotes with line items
- Submit quotes for approval
- View own quotes only
- Track submission status
- Dashboard with personal metrics

### Finance Director (FD) Features
- Review submitted quotes
- Edit totals if needed
- Approve or reject quotes
- View all submitted/reviewed quotes
- Generate PDF for approved quotes
- Dashboard with organization-wide metrics

### Quote Management
- **Line items** with quantity, rate, and subtotal
- **Automatic calculations** (subtotal, tax, grand total)
- **Role tier presets** (Junior Dev, Senior Dev, etc.)
- **Project codes** and client names
- **Notes** and additional metadata
- **Approval workflow** with event logging

### PDF Generation
- Auto-generate PDF on approval
- Downloadable via `/pdf/{id}` endpoint
- Branded with company theme
- Includes all line items and totals
- Uses WeasyPrint for professional output

### Mobile-First Design
- Responsive layout for all screen sizes
- Touch-friendly interface
- Optimized for mobile devices
- Progressive enhancement for desktop

### Theming
- **Primary**: `#386641` (Green)
- **Background**: `#F2F7F2` (Light green)
- **Accent**: `#D4AC0D` (Gold)
- **Text**: `#111` (Near black)

## Database Schema

### users
- id, email, name, role (AM|FD), password_hash, active

### requests
- id, name, project_code, client_name, am_email, state, totals_json, notes

### request_items
- id, request_id, description, qty, rate, subtotal, position

### approval_snapshot
- id, request_id, version_no, locked_totals_json, approved_at

### approval_events
- id, request_id, actor_email, action, note, at

### role_tiers
- id, name, hourly_rate, active

## State Machine

```
draft → submitted → fd_review → approved
                              ↘ rejected
```

## API Endpoints

### Auth
- `POST /auth/login` - Login and get JWT
- `POST /seed_admin` - Seed admin users (dev only)

### Requests
- `POST /requests` - Create request (AM only)
- `GET /requests` - List requests (role-filtered)
- `GET /requests/{id}` - Get request details
- `POST /requests/{id}/submit` - Submit for approval (AM only)

### Approvals (FD only)
- `POST /approvals/{id}/review` - Review and edit
- `POST /approvals/{id}/approve` - Approve request
- `POST /approvals/{id}/reject` - Reject request

### Utilities
- `GET /roles` - Get role tiers
- `GET /pdf/{id}` - Generate PDF for approved request
- `GET /healthz` - Health check

## Getting Started

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
bash run.sh
```

Server runs on `http://localhost:8080`

### Seed Demo Users

```bash
curl -X POST http://localhost:8080/seed_admin
```

**Users created:**
- AM: `am@example.com` / `am123`
- FD: `fd@example.com` / `admin123`

### Frontend Setup

The frontend is integrated into the web application. No separate setup needed.

### Demo Login

Click "Login as AM" or "Login as FD" buttons on the login screen for quick access.

## Deployment

### Environment Variables

```bash
export RC_JWT_SECRET="your-production-secret-key"
export RC_DB_PATH="./data/ratecard.sqlite"
```

### Production Checklist

- [ ] Change JWT secret
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Enable monitoring
- [ ] Configure backup strategy

## CI/CD

GitHub Actions workflow includes:
1. Backend health check
2. Frontend type checking
3. Integration test (create → submit → approve → PDF)

## Security Considerations

- JWT tokens expire after 8 hours
- Passwords hashed with bcrypt
- Role-based endpoint protection
- AM can only modify own drafts
- FD can approve/edit submitted requests
- All state transitions logged

## Future Enhancements

- [ ] Email notifications on approval/rejection
- [ ] Multi-currency support
- [ ] PDF customization options
- [ ] Bulk approval actions
- [ ] Advanced reporting dashboard
- [ ] Audit trail export
- [ ] SSO integration (replace password auth)
- [ ] Mobile native apps (Expo React Native)
- [ ] Real-time WebSocket updates

## License

Proprietary - All rights reserved
