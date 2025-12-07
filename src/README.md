# 🎯 Rate Card Pro

**Mobile-first quote management system with role-based approval workflows**

A complete end-to-end solution for creating, submitting, and approving rate card quotes with automatic PDF generation.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

## ✨ Features

### 🔐 Role-Based Authorization
- **Account Manager (AM)**: Create and submit quotes
- **Finance Director (FD)**: Review, approve, and generate PDFs
- JWT-based authentication with secure password hashing

### 📝 Quote Management
- Create quotes with multiple line items
- Auto-calculate totals (subtotal, tax, grand total)
- Quick-select from predefined role tiers
- Track project codes and client names
- Add notes and metadata

### ✅ Approval Workflow
```
Draft → Submitted → FD Review → Approved
                              ↘ Rejected
```

### 📄 PDF Generation
- Auto-generate professional PDFs on approval
- Branded with company theme colors
- Downloadable via secure endpoint
- Includes complete quote details

### 📱 Mobile-First Design
- Responsive across all devices
- Touch-friendly interface
- Optimized for smartphones and tablets
- Progressive enhancement for desktop

### 🎨 Theming
- **Primary**: `#386641` (Forest Green)
- **Background**: `#F2F7F2` (Mint Cream)
- **Accent**: `#D4AC0D` (Gold)
- Clean, professional appearance

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourorg/rate-card-pro.git
cd rate-card-pro

# 2. Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Initialize database and seed users
python -c "from database import init_db; init_db()"
bash run.sh &

# Wait for server to start, then seed admin users
curl -X POST http://localhost:8080/seed_admin

# 4. Frontend setup (in new terminal)
cd ..
npm install
npm run dev
```

### Demo Credentials

**Account Manager**
- Email: `am@example.com`
- Password: `am123`

**Finance Director**
- Email: `fd@example.com`
- Password: `admin123`

### Quick Demo Walkthrough

1. **Open** http://localhost:3000
2. **Click** "Login as AM"
3. **Create** a new quote:
   - Name: "Q4 Mobile App"
   - Add line item: "Senior Developer", 40 hours, ₱6,500/hr
   - Click "Create Quote"
4. **Submit** the quote for approval
5. **Logout** and click "Login as FD"
6. **View** the submitted quote
7. **Click** "Approve" and add a note
8. **Download** the generated PDF

## 📚 Documentation

- [Project Structure](./PROJECT_STRUCTURE.md) - Complete architecture overview
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Backend API](./backend/README.md) - API documentation
- [CI/CD Pipeline](./.github/workflows/ci.yml) - Automated testing

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── main.py          # FastAPI app with all endpoints
├── auth.py          # JWT token management
├── security.py      # Authorization middleware
├── database.py      # SQLite schema & initialization
└── requirements.txt # Python dependencies
```

**Key Technologies:**
- FastAPI for REST API
- SQLAlchemy for ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT authentication (HS256)
- WeasyPrint for PDF generation
- Bcrypt for password hashing

### Frontend (React)
```
frontend/
├── RateCardApp.tsx      # Main app component
├── types.ts             # TypeScript definitions
├── lib/api.ts           # API client
└── ratecard/
    ├── LoginScreen.tsx  # Authentication
    ├── Dashboard.tsx    # Stats dashboard
    ├── RequestForm.tsx  # Quote creation
    ├── RequestList.tsx  # Quote listing
    └── RequestDetail.tsx # Quote detail & approval
```

**Key Technologies:**
- React 18 with TypeScript
- Tailwind CSS for styling
- ShadCN UI components
- React Query (planned)
- Mobile-first responsive design

## 🗄️ Database Schema

### Core Tables

**users** - Authentication and roles
```sql
id, email, name, role (AM|FD), password_hash, active
```

**requests** - Rate card quotes
```sql
id, name, project_code, client_name, am_email, 
state (draft|submitted|fd_review|approved|rejected),
totals_json, notes, created_at, updated_at
```

**request_items** - Quote line items
```sql
id, request_id, description, qty, rate, subtotal, position
```

**approval_events** - Audit log
```sql
id, request_id, actor_email, action, note, at
```

**approval_snapshot** - Locked approved versions
```sql
id, request_id, version_no, locked_totals_json, approved_at
```

**role_tiers** - Predefined roles with rates
```sql
id, name, hourly_rate, active
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token
- `POST /seed_admin` - Seed admin users (dev only)

### Quotes (Requests)
- `POST /requests` - Create new quote (AM only)
- `GET /requests` - List quotes (role-filtered)
- `GET /requests/{id}` - Get quote details
- `POST /requests/{id}/submit` - Submit for approval (AM only)

### Approvals (FD only)
- `POST /approvals/{id}/review` - Mark as under review
- `POST /approvals/{id}/approve` - Approve and generate PDF
- `POST /approvals/{id}/reject` - Reject quote

### Utilities
- `GET /roles` - Get role tiers for quick selection
- `GET /pdf/{id}` - Download PDF for approved quote
- `GET /healthz` - Health check

## 🔒 Security

- **JWT Authentication**: Tokens expire after 8 hours
- **Password Hashing**: Bcrypt with automatic salt
- **Role-Based Access**: Endpoints protected by user role
- **Ownership Validation**: AMs can only modify own drafts
- **Audit Trail**: All actions logged to approval_events
- **CORS**: Configured for allowed origins only

## 🧪 Testing

### Run Tests

```bash
# Backend API tests
cd backend
source .venv/bin/activate
pytest

# Frontend type checking
npm run type-check

# Integration tests
npm run test:integration
```

### CI/CD

GitHub Actions workflow automatically:
1. Tests backend health
2. Type-checks frontend
3. Runs end-to-end integration test:
   - AM creates quote
   - AM submits quote
   - FD approves quote
   - PDF generation verified

## 📦 Deployment

### Development
```bash
bash run.sh  # Backend on :8080
npm run dev  # Frontend on :3000
```

### Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Docker deployment
- Cloud platform deployment (Railway, Render, Fly.io)
- PostgreSQL migration
- Nginx reverse proxy setup
- SSL certificates
- Monitoring and logging
- Backup strategies

### Quick Docker Deploy

```bash
cd backend
docker build -t ratecard-api .
docker run -p 8080:8080 \
  -e RC_JWT_SECRET="your-secret-key" \
  -v $(pwd)/data:/data \
  ratecard-api
```

## 🛠️ Development

### Project Structure
```
rate-card-pro/
├── backend/              # FastAPI backend
├── ratecard/             # Frontend components
├── components/           # Shared UI components
├── lib/                  # Utilities & API client
├── .github/workflows/    # CI/CD
└── docs/                 # Documentation
```

### Adding New Features

1. **Backend**: Add endpoint in `main.py`
2. **Frontend**: Create component in `ratecard/`
3. **Types**: Update `types.ts`
4. **API Client**: Add method in `lib/api.ts`
5. **Tests**: Add integration test in CI workflow

### Environment Variables

**Backend** (`backend/.env`):
```bash
RC_JWT_SECRET=your-secret-key
RC_DB_PATH=./ratecard.sqlite
```

**Frontend** (`.env.local`):
```bash
VITE_API_URL=http://localhost:8080
```

## 📊 Metrics & Monitoring

### Health Checks
```bash
# API health
curl http://localhost:8080/healthz

# Database check
curl http://localhost:8080/roles
```

### Logging

Backend logs to stdout:
```bash
# Follow logs (Docker)
docker logs -f ratecard-api

# Follow logs (Systemd)
journalctl -u ratecard-api -f
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.11+

# Verify dependencies
pip list

# Check database
ls -la ratecard.sqlite
```

**PDF generation fails**
```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get install libpango-1.0-0 libharfbuzz0b
```

**Frontend build errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

Proprietary - All rights reserved. Internal use only.

## 👥 Team

- **Backend**: Python/FastAPI team
- **Frontend**: React team
- **DevOps**: Infrastructure team
- **Product**: Product management

## 🗺️ Roadmap

### v1.1 (Q1 2026)
- [ ] Email notifications on approval/rejection
- [ ] PDF customization options
- [ ] Bulk approval actions
- [ ] Advanced analytics dashboard

### v1.2 (Q2 2026)
- [ ] Multi-currency support
- [ ] Real-time WebSocket updates
- [ ] Mobile native apps (Expo React Native)
- [ ] SSO integration

### v2.0 (Q3 2026)
- [ ] Workflow automation
- [ ] AI-powered quote suggestions
- [ ] Integration with accounting systems
- [ ] Multi-tenant support

## 📞 Support

- **Email**: support@yourcompany.com
- **Slack**: #rate-card-pro
- **Issues**: GitHub Issues
- **Docs**: Internal Wiki

---

**Made with ❤️ by the Engineering Team**
