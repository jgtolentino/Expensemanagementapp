# Scout × SariCoach Retail OS - Documentation Wiki

**Welcome to the Scout × SariCoach Retail OS documentation!**

This is a production-ready, hybrid data + agentic AI platform for sari-sari retail analytics in the Philippines, built on **React + TypeScript + Supabase + Odoo CE/OCA 18**.

---

## 📚 Documentation Index

### Getting Started
1. [**Quick Start Guide**](./01-QUICK-START.md) - Get up and running in 15 minutes
2. [**Architecture Overview**](./02-ARCHITECTURE.md) - Understand the system design
3. [**Environment Setup**](./03-ENVIRONMENT-SETUP.md) - Configure your development environment

### Development
4. [**Frontend Development Guide**](./04-FRONTEND-DEV.md) - Build pages and components
5. [**API Integration Guide**](./05-API-INTEGRATION.md) - Work with backend APIs
6. [**State Management**](./06-STATE-MANAGEMENT.md) - Filters, auth, and global state
7. [**Component Library**](./07-COMPONENT-LIBRARY.md) - Reusable UI components

### Backend
8. [**Database Schema**](./08-DATABASE-SCHEMA.md) - Tables, types, and relationships
9. [**Edge Functions**](./09-EDGE-FUNCTIONS.md) - API endpoints and usage
10. [**Odoo Integration**](./10-ODOO-INTEGRATION.md) - POS → Scout data flow

### Operations
11. [**Deployment Guide**](./11-DEPLOYMENT.md) - Production deployment checklist
12. [**Security & RBAC**](./12-SECURITY-RBAC.md) - Multi-tenant isolation and roles
13. [**Monitoring & Observability**](./13-MONITORING.md) - Logs, metrics, alerts

### Reference
14. [**Type Reference**](./14-TYPE-REFERENCE.md) - TypeScript types catalog
15. [**API Reference**](./15-API-REFERENCE.md) - Complete API documentation
16. [**Troubleshooting**](./16-TROUBLESHOOTING.md) - Common issues and solutions

---

## 🎯 What is Scout × SariCoach?

**Scout Dashboard** is a retail analytics platform for sari-sari stores (Philippine corner stores), providing:

- 📊 **Transaction Trends** - Volume, revenue, basket size, duration analysis
- 📦 **Product Mix Analytics** - Category distribution, Pareto analysis, substitutions
- 👥 **Consumer Behavior** - Purchase funnels, request methods, acceptance rates
- 📈 **Consumer Profiling** - Demographics, income segments, behavior traits
- 🗺️ **Geo Intelligence** - Regional performance, store locations, market penetration
- 🤖 **AI Assistant (Ask Suqi)** - GPT-4-powered insights with 7 function-calling tools

**SariCoach** is the AI coaching layer that provides:

- 🍼 **Tantrum Tamer Mode** - Behavioral intervention tracking
- 🔄 **Scan & Switch Conquesting** - Brand substitution flows
- 📦 **Predictive Stock** - AI-powered demand forecasting (weather + events)
- 🎯 **Brand Command Center** - Real-time ad slot management

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript 5.3** - UI framework with type safety
- **Vite 5** - Build tool and dev server
- **TanStack Query** - Server state management (caching, refetching)
- **Zustand** - Client state management (filters, preferences)
- **Tailwind CSS 3** - Utility-first styling
- **Recharts** - Chart library
- **Leaflet** - Maps (geo intelligence)

### Backend
- **Supabase** - Backend-as-a-Service (Postgres + Auth + Edge Functions)
- **PostgreSQL 15** - Database with pgvector extension
- **Deno** - Edge Functions runtime (TypeScript on the edge)
- **OpenAI GPT-4 Turbo** - AI assistant + embeddings
- **Odoo CE/OCA 18** - ERP/POS system (source of truth)

### Infrastructure
- **Vercel/Netlify** - Frontend hosting
- **Supabase Cloud** - Backend hosting
- **Odoo Cloud/Self-hosted** - ERP hosting

---

## 🚀 Quick Links

### For Developers
- [**Quick Start**](./01-QUICK-START.md) - Clone, install, run
- [**Frontend Dev Guide**](./04-FRONTEND-DEV.md) - Build your first page
- [**Component Library**](./07-COMPONENT-LIBRARY.md) - Available components

### For DevOps
- [**Deployment Guide**](./11-DEPLOYMENT.md) - Production deployment
- [**Environment Setup**](./03-ENVIRONMENT-SETUP.md) - Environment variables
- [**Monitoring**](./13-MONITORING.md) - Observability setup

### For Architects
- [**Architecture Overview**](./02-ARCHITECTURE.md) - System design
- [**Database Schema**](./08-DATABASE-SCHEMA.md) - Data model
- [**Security & RBAC**](./12-SECURITY-RBAC.md) - Multi-tenant security

### For API Consumers
- [**API Reference**](./15-API-REFERENCE.md) - Endpoint documentation
- [**Type Reference**](./14-TYPE-REFERENCE.md) - Request/response types
- [**API Integration**](./05-API-INTEGRATION.md) - Usage examples

---

## 📊 Current Status

| Component | Status | Completion |
|-----------|--------|------------|
| **Backend** | ✅ Production-Ready | 100% |
| └─ Database Schema | ✅ Complete | 18 tables, 14 enums |
| └─ Edge Functions | ✅ Complete | 7 APIs, 1,631 lines |
| └─ RBAC + Security | ✅ Complete | 14 RLS policies, 4 roles |
| └─ Indexes | ✅ Complete | 40+ indexes |
| └─ Seed Data | ✅ Complete | 18,431 transactions |
| **Frontend Core** | ✅ Production-Ready | 100% |
| └─ TypeScript Types | ✅ Complete | 900+ lines |
| └─ API Client | ✅ Complete | 500+ lines |
| └─ TanStack Hooks | ✅ Complete | 250+ lines |
| └─ Zustand Store | ✅ Complete | 300+ lines |
| └─ Auth Context | ✅ Complete | 250+ lines |
| **Frontend Pages** | ⏳ In Progress | 5% |
| └─ Dashboard Overview | ✅ Prototype | Needs migration |
| └─ Transaction Trends | ⏭️ Planned | Not started |
| └─ Product Mix | ⏭️ Planned | Not started |
| └─ Consumer Behavior | ⏭️ Planned | Not started |
| └─ Consumer Profiling | ⏭️ Planned | Not started |
| └─ Geo Intelligence | ⏭️ Planned | Not started |
| └─ Data Dictionary | ⏭️ Planned | Not started |
| **Features** | ⏳ In Progress | 10% |
| └─ AI Assistant Panel | ⏭️ Backend Ready | Frontend not started |
| └─ Advanced Filters | ⏳ Basic UI | Needs enhancement |
| └─ Retail OS Landing | ⏭️ Planned | Not started |
| **Charts** | ⏳ In Progress | 10% |
| └─ KpiCard | ✅ Complete | Working |
| └─ Other 7 Components | ⏭️ Planned | Not started |
| **Overall** | ⏳ 75% Complete | Backend + Core Done |

---

## 🎓 Learning Path

### New to the Project?

1. **Start Here:** [Quick Start Guide](./01-QUICK-START.md)
2. **Understand the System:** [Architecture Overview](./02-ARCHITECTURE.md)
3. **Setup Your Environment:** [Environment Setup](./03-ENVIRONMENT-SETUP.md)
4. **Build Your First Feature:** [Frontend Dev Guide](./04-FRONTEND-DEV.md)

### Want to Contribute?

1. **Read the Architecture:** [Architecture Overview](./02-ARCHITECTURE.md)
2. **Review the Type System:** [Type Reference](./14-TYPE-REFERENCE.md)
3. **Check Available Components:** [Component Library](./07-COMPONENT-LIBRARY.md)
4. **Follow Development Guide:** [Frontend Dev Guide](./04-FRONTEND-DEV.md)

### Need to Deploy?

1. **Environment Setup:** [Environment Setup](./03-ENVIRONMENT-SETUP.md)
2. **Security Review:** [Security & RBAC](./12-SECURITY-RBAC.md)
3. **Deployment Steps:** [Deployment Guide](./11-DEPLOYMENT.md)
4. **Setup Monitoring:** [Monitoring](./13-MONITORING.md)

---

## 🤝 Support

### Common Questions
- **"How do I add a new page?"** → [Frontend Dev Guide](./04-FRONTEND-DEV.md)
- **"How do I call an API?"** → [API Integration Guide](./05-API-INTEGRATION.md)
- **"How do filters work?"** → [State Management](./06-STATE-MANAGEMENT.md)
- **"How do I deploy?"** → [Deployment Guide](./11-DEPLOYMENT.md)
- **"Something's broken!"** → [Troubleshooting](./16-TROUBLESHOOTING.md)

### Getting Help
- 📖 Check the [Troubleshooting Guide](./16-TROUBLESHOOTING.md)
- 🔍 Search the documentation (Ctrl+F)
- 💬 Ask in the team Slack channel
- 🐛 Report bugs in the issue tracker

---

## 📄 License

Proprietary - TBWA Agency Databank / IPAI Retail Intelligence

---

**Last Updated:** 2025-12-07  
**Documentation Version:** 1.0  
**Project Version:** Phase 6 (Frontend Implementation)
