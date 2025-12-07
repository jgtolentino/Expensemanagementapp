# TBWA Agency Databank - Documentation

## Overview

Enterprise-grade application suite for agency operations, currently featuring:

1. **Rate Card Pro** - Quote & proposal management (AM/FD workflow)
2. **Travel & Expense (T&E)** - SAP Concur-style expense management
3. **Gearroom** - Cheqroom-style equipment management
4. **Procure** - SAP SRM-style vendor rate governance
5. **Coming Soon:** Scout (Strategic Intelligence)

---

## Quick Start

### Launch Applications

```bash
npm install
npm run dev
```

Access the launcher at `http://localhost:5173`

### Available Apps

- **Rate Card Pro** - Quote creation, approval workflows, line items, analytics
- **Travel & Expense** - Expense reports, cash advances, settlement, SAP-style analytics
- **Gearroom** - Equipment catalog, check-out/check-in, maintenance tracking, utilization analytics
- **Procure** - Vendor rate cards, AI Rate Advisor, project quotes with role-based visibility

---

## Architecture

### Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend (Future):** FastAPI (Python) + Node.js
- **Database:** Supabase Postgres + pgvector
- **Storage:** Supabase Storage
- **AI/ML:** OpenAI Embeddings + Claude/GPT-4 for RAG
- **OCR:** Self-hosted PaddleOCR microservice

### Workspace Structure

```
/
├── App.tsx                     # 4-app launcher
├── RateCardProApp.tsx          # Rate Card Pro application
├── TEApp.tsx                   # Travel & Expense application
├── GearApp.tsx                 # Gearroom application
├── ProcureApp.tsx              # Procure application ⭐ NEW
├── components/
│   ├── te/                     # T&E specific components
│   │   ├── ExpenseReportForm.tsx
│   │   ├── CashAdvanceForm.tsx
│   │   └── TEAnalyticsDashboard.tsx
│   ├── gear/                   # Gearroom specific components
│   │   ├── ItemCatalog.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── GearAnalyticsDashboard.tsx
│   ├── procure/                # Procure specific components ⭐ NEW
│   │   ├── RateCardManager.tsx
│   │   ├── ProjectQuoteBuilder.tsx
│   │   └── RateAdvisorWizard.tsx
│   ├── ui/                     # Shared UI components
│   └── FeatureShowcase.tsx     # Marketing showcase
├── docs/
│   ├── README.md               # This file
│   ├── te-database-schema.md   # T&E database design
│   ├── gear-database-schema.md # Gearroom database design
│   ├── procure-database-schema.md # ⭐ Procure database design
│   ├── aihub-rag-assistant.md  # AI assistant architecture
│   └── ocr-integration.md      # OCR service documentation
└── styles/
    └── globals.css
```

---

## Documentation Index

### Core Documentation

1. **[T&E Database Schema](./te-database-schema.md)**
   - Complete PostgreSQL schema for Travel & Expense
   - Cash advances, settlements, expense reports
   - Analytics views, RLS policies
   - Sample seed data

2. **[Gearroom Database Schema](./gear-database-schema.md)**
   - Complete PostgreSQL schema for Equipment Management
   - Check-out/check-in workflows, reservations
   - Maintenance tracking, deposits
   - Utilization analytics, kit management

3. **[Procure Database Schema](./procure-database-schema.md)**
   - Complete PostgreSQL schema for Vendor Rate Governance
   - Vendor rate cards, project quotes
   - AI Rate Advisor, contract management
   - Compliance checks

4. **[AIHub RAG Assistant](./aihub-rag-assistant.md)**
   - Notion-style AI assistant architecture
   - Workspace scoping (TE, GEAR, GLOBAL)
   - Knowledge corpus building (ETL)
   - RAG query API and React components

5. **[OCR Integration](./ocr-integration.md)**
   - Self-hosted OCR microservice
   - PaddleOCR + LLM field extraction
   - T&E receipt processing
   - Gearroom maintenance document processing

---

## Database Design

### Core Schemas

- **`te.*`** - Travel & Expense core tables
  - `employees`, `departments`, `cost_centers`
  - `expense_reports`, `expense_lines`, `receipts`
  - `cash_advances`, `cash_advance_settlements`

- **`gear.*`** - Gearroom equipment management
  - `items`, `categories`, `locations`, `users`
  - `checkouts`, `reservations`, `deposits`
  - `maintenance_jobs`, `maintenance_history`
  - `kits`, `kit_items`

- **`ocr.*`** - Shared OCR processing
  - `documents` - OCR job tracking
  - `extractions` - Extracted fields

- **`aihub.*`** - AI RAG Assistant
  - `knowledge_chunks` - Vector embeddings
  - `sessions`, `messages` - Chat history

- **`analytics.*`** - Cross-app analytics views
  - `v_te_cash_flow` - T&E cash flow analysis
  - `v_advance_aging` - Cash advance aging
  - `v_category_spend` - Expense category trends
  - `v_gear_utilization_cost` - Equipment ROI
  - `v_gear_expense_tracking` - Gear-related expenses

### View Diagram

```
┌────────────────────────────────────────────────────┐
│              Application Layer                     │
│  Rate Card Pro  │  T&E App  │  Gearroom  │  Scout │
└────────────────────────────────────────────────────┘
                   │          │          │
                   ▼          ▼          ▼
┌────────────────────────────────────────────────────┐
│              Shared Services                       │
│  AIHub RAG  │  OCR Service  │  Analytics           │
└────────────────────────────────────────────────────┘
                   │          │          │
                   ▼          ▼          ▼
┌────────────────────────────────────────────────────┐
│         Supabase Postgres + Storage                │
│  te.*  │  gear.*  │  ocr.*  │  aihub.*  │  analytics.* │
└────────────────────────────────────────────────────┘
```

---

## Key Features

### Rate Card Pro
- ✅ Dual-role authentication (AM/FD)
- ✅ Quote creation with line items
- ✅ Approval workflows
- ✅ Dashboard analytics
- ✅ Mobile-first responsive design
- ✅ Feature showcase page

### Travel & Expense
- ✅ Expense report creation
- ✅ Multi-category expense lines
- ✅ Cash advance requests
- ✅ Settlement workflows
- ✅ SAP-style analytics dashboard
- ✅ Receipt management (ready for OCR)
- 🔄 OCR integration (documented, not deployed)
- 🔄 AI RAG assistant (documented, not deployed)

### Gearroom
- ✅ Equipment catalog with filtering
- ✅ Check-out/check-in workflows
- ✅ Reservation system
- ✅ Deposit management
- ✅ Maintenance tracking
- ✅ Utilization analytics
- ✅ Category/location management
- ✅ Overdue alerts
- 🔄 QR code scanning (future)
- 🔄 AI assistant (future)

### Procure
- ✅ Vendor rate cards
- ✅ AI Rate Advisor
- ✅ Project quotes with role-based visibility
- ✅ Vendor management
- ✅ Contract management
- ✅ Compliance checks

### AI & Automation (Future)
- 🔜 Notion-style RAG assistant (TE & Gear workspaces)
- 🔜 Self-hosted OCR for receipts
- 🔜 Natural language expense queries
- 🔜 Proactive policy compliance alerts
- 🔜 Predictive maintenance for equipment

---

## Development Roadmap

### Phase 1: Core T&E ✅ COMPLETE
- [x] Basic T&E UI (expenses, cash advances, analytics)
- [x] Database schema documentation
- [x] Integration with Rate Card Pro launcher

### Phase 2: Gearroom ✅ COMPLETE
- [x] Equipment catalog with search/filters
- [x] Check-out/check-in workflows
- [x] Maintenance tracking UI
- [x] Utilization analytics dashboard
- [x] Database schema documentation

### Phase 3: AI & OCR (Next)
- [ ] Deploy AIHub RAG service
- [ ] Build knowledge corpus (specs + docs)
- [ ] Integrate AI assistant panel in T&E & Gear UI
- [ ] Deploy self-hosted OCR microservice
- [ ] Wire OCR to receipt uploads & maintenance docs

### Phase 4: Advanced Features
- [ ] NL-to-SQL for analytics queries
- [ ] Mobile camera OCR
- [ ] Multi-workspace search
- [ ] Audit trails & compliance reporting
- [ ] QR code equipment tracking
- [ ] Predictive maintenance ML models

---

## Configuration

### Environment Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI (for embeddings + LLM)
OPENAI_API_KEY=sk-...

# OCR Service
OCR_SERVICE_URL=http://localhost:8001

# Optional: Claude API
ANTHROPIC_API_KEY=sk-ant-...
```

### Database Setup

```bash
# 1. Run migrations (future)
npm run db:migrate

# 2. Seed sample data
npm run db:seed

# 3. Build AI corpus
npm run aihub:build-corpus
```

---

## Testing

### Run Tests
```bash
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests (Playwright)
```

### Manual Testing

1. **Rate Card Pro**
   - Login as AM → Create quote → Submit
   - Login as FD → Approve quote
   - Check dashboard analytics

2. **T&E App**
   - Login as Employee → Create expense report
   - Add expense lines (various categories)
   - Request cash advance
   - Login as Manager → Approve report
   - Check analytics dashboard

3. **Gearroom App**
   - Login as User → View equipment catalog
   - Check-out equipment → Return equipment
   - Track maintenance jobs
   - Check utilization analytics

4. **Procure App**
   - Login as Admin → Manage vendor rate cards
   - Use AI Rate Advisor to get rate recommendations
   - Create project quotes with role-based visibility

---

## Deployment

### Production Checklist

- [ ] Set up Supabase production project
- [ ] Configure RLS policies
- [ ] Deploy OCR microservice (Docker)
- [ ] Deploy AIHub RAG service (FastAPI)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Load test OCR service
- [ ] Backup strategy for embeddings

### Docker Compose (Microservices)

```yaml
version: '3.8'
services:
  ocr-service:
    build: ./ocr-service
    ports: ["8001:8000"]
    environment: [...]
  
  aihub-service:
    build: ./aihub-service
    ports: ["8002:8000"]
    environment: [...]
  
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: [ocr-service, aihub-service]
```

---

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow Airbnb React style guide
- Use Prettier for formatting
- ESLint for linting

### Commit Messages
```
feat(te): add cash advance settlement UI
fix(ocr): handle low-quality receipts
docs(aihub): update RAG architecture
```

### Pull Request Process
1. Create feature branch from `main`
2. Write tests for new features
3. Update documentation
4. Submit PR with clear description
5. Pass CI checks + code review

---

## Support & Resources

### Internal Contacts
- **Platform Team:** platform@tbwa.com
- **Product Owner:** product@tbwa.com
- **DevOps:** devops@tbwa.com

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- [LangChain (RAG)](https://python.langchain.com/docs/use_cases/question_answering/)

---

## License

Proprietary - TBWA Worldwide © 2025

---

## Changelog

### 2025-12-07
- ✅ Initial T&E app implementation
- ✅ Gearroom app implementation
- ✅ Procure app implementation (SAP SRM-style vendor rate governance)
- ✅ Rate Card Pro integration
- ✅ App launcher with 4 apps
- ✅ Complete documentation suite (T&E + Gearroom + Procure)
- ✅ Database schema designs (T&E + Gearroom + Procure)
- ✅ AI RAG architecture
- ✅ OCR integration plan
- ✅ AI Rate Advisor (stubbed for Procure)

### Future Releases
- 2025-Q1: AI assistant + OCR deployment
- 2025-Q2: Mobile apps (iOS/Android)
- 2025-Q3: Scout integration (optional)
- 2025-Q4: Advanced analytics & predictive features