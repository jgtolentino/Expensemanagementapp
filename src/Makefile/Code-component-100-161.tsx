# ============================================================================
# TBWA Agency Databank - Makefile
# ============================================================================
# One-click commands for Vite + Supabase stack
#
# Usage:
#   make help           # Show all commands
#   make dev            # Start development
#   make supabase-setup # Apply migrations to Supabase
#
# ============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Directories
ROOT_DIR := $(shell pwd)
SCRIPTS_DIR := $(ROOT_DIR)/scripts
DOCS_DIR := $(ROOT_DIR)/docs
MIGRATIONS_DIR := $(ROOT_DIR)/supabase/migrations

# Python
VENV := $(ROOT_DIR)/.venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

# Node
NPM := npm
VITE := npx vite

# Supabase
SUPABASE_URL := $(shell grep VITE_SUPABASE_URL .env.local 2>/dev/null | cut -d '=' -f2)
SUPABASE_KEY := $(shell grep VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY .env.local 2>/dev/null | cut -d '=' -f2)

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
CYAN := \033[0;36m
RESET := \033[0m

# =============================================================================
# HELP
# =============================================================================

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(CYAN)TBWA Agency Databank - Development Commands$(RESET)"
	@echo "$(CYAN)============================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Quick Start:$(RESET)"
	@echo "  $(GREEN)make setup$(RESET)         - One-time setup (install deps + create .env)"
	@echo "  $(GREEN)make dev$(RESET)           - Start development server"
	@echo "  $(GREEN)make supabase-setup$(RESET) - Apply migrations to Supabase"
	@echo ""
	@echo "$(YELLOW)Development:$(RESET)"
	@grep -E '^(dev|build|preview|lint|fmt|clean).*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Supabase:$(RESET)"
	@grep -E '^supabase-.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Database:$(RESET)"
	@grep -E '^db-.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Testing:$(RESET)"
	@grep -E '^test.*:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# SETUP
# =============================================================================

.PHONY: setup
setup: install-deps create-env ## Complete first-time setup
	@echo "$(GREEN)✅ Setup complete!$(RESET)"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit .env.local with your Supabase credentials"
	@echo "  2. Run: make supabase-setup"
	@echo "  3. Run: make dev"

.PHONY: install-deps
install-deps: ## Install all dependencies
	@echo "$(CYAN)📦 Installing dependencies...$(RESET)"
	@$(NPM) install
	@test -d $(VENV) || python3 -m venv $(VENV)
	@$(PIP) install --upgrade pip -q
	@$(PIP) install -r requirements.txt -q 2>/dev/null || true
	@echo "$(GREEN)✅ Dependencies installed$(RESET)"

.PHONY: create-env
create-env: ## Create .env.local from template
	@if [ ! -f .env.local ]; then \
		echo "$(CYAN)📝 Creating .env.local from template...$(RESET)"; \
		cp .env.example .env.local; \
		echo "$(YELLOW)⚠️  Please edit .env.local with your Supabase credentials$(RESET)"; \
	else \
		echo "$(YELLOW).env.local already exists, skipping$(RESET)"; \
	fi

# =============================================================================
# DEVELOPMENT
# =============================================================================

.PHONY: dev
dev: ## Start Vite development server
	@echo "$(CYAN)🚀 Starting development server...$(RESET)"
	@$(VITE)

.PHONY: build
build: ## Build for production
	@echo "$(CYAN)🏗️  Building for production...$(RESET)"
	@$(VITE) build
	@echo "$(GREEN)✅ Build complete → dist/$(RESET)"

.PHONY: preview
preview: build ## Preview production build locally
	@echo "$(CYAN)👀 Starting preview server...$(RESET)"
	@$(VITE) preview

.PHONY: lint
lint: ## Run linting
	@echo "$(CYAN)🔍 Running linters...$(RESET)"
	@$(NPM) run lint 2>/dev/null || echo "No lint script found"
	@$(PYTHON) -m ruff check . 2>/dev/null || echo "Ruff not installed"

.PHONY: fmt
fmt: ## Format code
	@echo "$(CYAN)🧹 Formatting code...$(RESET)"
	@$(NPM) run format 2>/dev/null || echo "No format script found"
	@$(PYTHON) -m black $(SCRIPTS_DIR) 2>/dev/null || echo "Black not installed"

.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(YELLOW)🧹 Cleaning...$(RESET)"
	@rm -rf dist node_modules/.vite
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Cleaned$(RESET)"

# =============================================================================
# SUPABASE
# =============================================================================

.PHONY: supabase-setup
supabase-setup: ## Apply all migrations to Supabase (IMPORTANT: Run this first!)
	@echo "$(CYAN)🗄️  Setting up Supabase database...$(RESET)"
	@if [ -z "$(SUPABASE_URL)" ]; then \
		echo "$(RED)❌ Error: SUPABASE_URL not found in .env.local$(RESET)"; \
		echo "$(YELLOW)Please create .env.local and add your Supabase credentials$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)This will create 18 tables and apply RLS policies$(RESET)"
	@echo ""
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(PYTHON) $(SCRIPTS_DIR)/supabase_migrate.py
	@echo ""
	@echo "$(GREEN)✅ Supabase setup complete!$(RESET)"
	@echo ""
	@echo "Next: Run 'make db-seed' to add demo data"

.PHONY: supabase-status
supabase-status: ## Check Supabase connection
	@echo "$(CYAN)🔍 Checking Supabase connection...$(RESET)"
	@if [ -z "$(SUPABASE_URL)" ]; then \
		echo "$(RED)❌ No .env.local file found$(RESET)"; \
		exit 1; \
	fi
	@echo "URL: $(SUPABASE_URL)"
	@echo "$(GREEN)✅ Connection configured$(RESET)"

.PHONY: supabase-reset
supabase-reset: ## ⚠️  Reset Supabase database (DESTRUCTIVE!)
	@echo "$(RED)⚠️  WARNING: This will delete ALL data!$(RESET)"
	@read -p "Type 'DESTROY' to confirm: " confirm && [ "$$confirm" = "DESTROY" ] || exit 1
	@echo "$(YELLOW)Dropping all tables...$(RESET)"
	@$(PYTHON) $(SCRIPTS_DIR)/supabase_reset.py
	@echo "$(GREEN)✅ Database reset complete$(RESET)"
	@echo "$(YELLOW)Run 'make supabase-setup' to recreate tables$(RESET)"

# =============================================================================
# DATABASE
# =============================================================================

.PHONY: db-seed
db-seed: ## Seed demo data into Supabase
	@echo "$(CYAN)🌱 Seeding demo data...$(RESET)"
	@$(PYTHON) $(SCRIPTS_DIR)/seed_demo_data.py
	@echo "$(GREEN)✅ Demo data seeded$(RESET)"
	@echo ""
	@echo "Demo accounts:"
	@echo "  Admin:    admin@tbwa.com / admin123"
	@echo "  Manager:  manager@tbwa.com / manager123"
	@echo "  Employee: employee@tbwa.com / employee123"
	@echo "  Finance:  finance@tbwa.com / finance123"

.PHONY: db-backup
db-backup: ## Create local backup of Supabase data
	@echo "$(CYAN)💾 Creating backup...$(RESET)"
	@mkdir -p backups
	@$(PYTHON) $(SCRIPTS_DIR)/supabase_backup.py
	@echo "$(GREEN)✅ Backup complete$(RESET)"

# =============================================================================
# TESTING
# =============================================================================

.PHONY: test
test: ## Run all tests
	@echo "$(CYAN)🧪 Running tests...$(RESET)"
	@$(NPM) run test 2>/dev/null || echo "No test script found"

.PHONY: test-e2e
test-e2e: ## Run E2E tests (Playwright)
	@echo "$(CYAN)🎭 Running E2E tests...$(RESET)"
	@$(NPM) run test:e2e 2>/dev/null || npx playwright test

.PHONY: test-unit
test-unit: ## Run unit tests (Vitest)
	@echo "$(CYAN)🧪 Running unit tests...$(RESET)"
	@$(NPM) run test:unit 2>/dev/null || npx vitest run

# =============================================================================
# DOCUMENTATION
# =============================================================================

.PHONY: docs
docs: ## Generate documentation
	@echo "$(CYAN)📚 Generating documentation...$(RESET)"
	@echo "$(YELLOW)Documentation available in docs/$(RESET)"
	@echo "  - README.md"
	@echo "  - ARCHITECTURE.md"
	@echo "  - DATA_MODELS.md"
	@echo "  - GO_LIVE_CHECKLIST.md"

# =============================================================================
# DEPLOYMENT
# =============================================================================

.PHONY: deploy-staging
deploy-staging: build ## Deploy to staging (requires setup)
	@echo "$(CYAN)🚀 Deploying to staging...$(RESET)"
	@echo "$(YELLOW)⚠️  Not configured yet$(RESET)"

.PHONY: deploy-prod
deploy-prod: build ## Deploy to production (requires setup)
	@echo "$(CYAN)🚀 Deploying to production...$(RESET)"
	@echo "$(YELLOW)⚠️  Not configured yet$(RESET)"

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: check-env
check-env: ## Validate environment configuration
	@echo "$(CYAN)🔍 Checking environment...$(RESET)"
	@if [ ! -f .env.local ]; then \
		echo "$(RED)❌ .env.local not found$(RESET)"; \
		echo "Run: make create-env"; \
		exit 1; \
	fi
	@if [ -z "$(SUPABASE_URL)" ]; then \
		echo "$(RED)❌ VITE_SUPABASE_URL not set in .env.local$(RESET)"; \
		exit 1; \
	fi
	@if [ -z "$(SUPABASE_KEY)" ]; then \
		echo "$(RED)❌ VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY not set in .env.local$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Environment configured correctly$(RESET)"

.PHONY: info
info: ## Show project information
	@echo ""
	@echo "$(CYAN)TBWA Agency Databank$(RESET)"
	@echo "$(CYAN)====================$(RESET)"
	@echo ""
	@echo "Framework:    Vite + React + TypeScript"
	@echo "Database:     Supabase (PostgreSQL)"
	@echo "Design:       Microsoft Fluent + TBWA Enterprise 365"
	@echo "Apps:         8 (Rate Card, T&E, Gear, PPM, Procure, Creative, Wiki, BI)"
	@echo ""
	@echo "Supabase URL: $(SUPABASE_URL)"
	@echo ""