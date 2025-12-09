// lib/data/ppm-sample-data.ts
// Sample Data for PPM System - Production Ready
// Based on "Financial Systems Modernization" Portfolio
// DATA SOURCE: MOCK (For demonstration purposes)

import {
  StrategicTheme,
  Portfolio,
  FinancialRecord,
  Risk,
  SystemFeature,
  Project,
  PortfolioDashboardResponse,
  calculateRiskExposure,
  calculateBudgetVariance,
  calculateRAGStatus,
  aggregatePortfolioMetrics,
  DataMeta,
} from './ppm-data-model';

// Metadata for mock data
export const MOCK_DATA_META: DataMeta = {
  source: 'mock',
  lastUpdated: 'Static Demo',
  filename: undefined,
  importedBy: 'System'
};

// ==========================================
// 1. STRATEGIC THEMES
// ==========================================

export const strategicThemes: StrategicTheme[] = [
  {
    id: "theme_001",
    name: "Digital Transformation",
    description: "Comprehensive digital transformation initiative to modernize business processes, systems, and capabilities",
    owner_id: "CKVC",
    active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "theme_002",
    name: "Operational Excellence",
    description: "Initiatives focused on improving operational efficiency, reducing costs, and enhancing service quality",
    owner_id: "COO",
    active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "theme_003",
    name: "Customer Experience Enhancement",
    description: "Programs aimed at improving customer satisfaction, engagement, and loyalty",
    owner_id: "CCO",
    active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  }
];

// ==========================================
// 2. PROJECTS
// ==========================================

export const projects: Project[] = [
  {
    id: "proj_001",
    code: "PROJ-001",
    name: "ERP System Upgrade",
    description: "Upgrade from Odoo 16 to Odoo 18 CE with OCA modules integration",
    portfolio_id: "port_001",
    strategic_theme_id: "theme_001",
    status: "In Progress",
    priority: "Critical",
    health_score: 92,
    start_date: "2025-01-15",
    end_date: "2025-12-31",
    budget_php: 3500000,
    spent_php: 0,
    project_manager: "Maria Santos",
    team_members: ["Juan Cruz", "Ana Reyes", "Carlos Mendoza"],
    progress_percent: 15,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-12-09T00:00:00Z",
  },
  {
    id: "proj_002",
    code: "PROJ-002",
    name: "Financial Reporting Automation",
    description: "Implement automated financial reporting and analytics dashboard using BI tools",
    portfolio_id: "port_001",
    strategic_theme_id: "theme_001",
    status: "In Progress",
    priority: "High",
    health_score: 88,
    start_date: "2025-02-01",
    end_date: "2025-09-30",
    budget_php: 2000000,
    spent_php: 0,
    project_manager: "Roberto Tan",
    team_members: ["Lisa Garcia", "Miguel Torres"],
    progress_percent: 10,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-12-09T00:00:00Z",
  },
  {
    id: "proj_003",
    code: "PROJ-003",
    name: "Payment Gateway Integration",
    description: "Integrate multiple payment gateways for improved cash flow management",
    portfolio_id: "port_001",
    strategic_theme_id: "theme_001",
    status: "Planning",
    priority: "High",
    health_score: 95,
    start_date: "2025-03-01",
    end_date: "2025-10-31",
    budget_php: 3000000,
    spent_php: 0,
    project_manager: "Sofia Diaz",
    team_members: ["Ramon Flores", "Elena Santos"],
    progress_percent: 5,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-12-09T00:00:00Z",
  }
];

// ==========================================
// 3. FINANCIAL RECORDS
// ==========================================

export const financialRecords: FinancialRecord[] = [
  // ERP System Upgrade - Software Licenses (CAPEX)
  {
    id: "fin_001",
    portfolio_id: "port_001",
    project_id: "proj_001",
    category: "Software",
    type: "CAPEX",
    currency: "PHP",
    budget_amount: 1500000,
    actual_spent: 0,
    committed_amount: 1500000,
    variance_amount: 1500000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 1,
    description: "Odoo 18 CE licenses and OCA module subscriptions",
    cost_center: "IT-SYSTEMS",
    gl_account: "1200-Software-Assets",
    approval_status: "Approved",
    approved_by: "CKVC",
    approved_at: "2025-01-05T00:00:00Z",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  
  // ERP System Upgrade - Implementation Services (CAPEX)
  {
    id: "fin_002",
    portfolio_id: "port_001",
    project_id: "proj_001",
    category: "Services",
    type: "CAPEX",
    currency: "PHP",
    budget_amount: 1200000,
    actual_spent: 0,
    committed_amount: 600000,
    variance_amount: 1200000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 2,
    description: "Implementation and customization services",
    cost_center: "IT-SYSTEMS",
    gl_account: "1200-Software-Assets",
    approval_status: "Approved",
    approved_by: "CKVC",
    approved_at: "2025-01-05T00:00:00Z",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  
  // ERP System Upgrade - Training (OPEX)
  {
    id: "fin_003",
    portfolio_id: "port_001",
    project_id: "proj_001",
    category: "Training",
    type: "OPEX",
    currency: "PHP",
    budget_amount: 800000,
    actual_spent: 0,
    committed_amount: 0,
    variance_amount: 800000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 3,
    description: "End-user training and change management",
    cost_center: "IT-TRAINING",
    gl_account: "6100-Training-Expense",
    approval_status: "Approved",
    approved_by: "CKVC",
    approved_at: "2025-01-05T00:00:00Z",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  
  // Financial Reporting - BI Software (CAPEX)
  {
    id: "fin_004",
    portfolio_id: "port_001",
    project_id: "proj_002",
    category: "Software",
    type: "CAPEX",
    currency: "PHP",
    budget_amount: 1000000,
    actual_spent: 0,
    committed_amount: 1000000,
    variance_amount: 1000000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 1,
    description: "Business Intelligence and reporting tools",
    cost_center: "IT-SYSTEMS",
    gl_account: "1200-Software-Assets",
    approval_status: "Approved",
    approved_by: "CFO",
    approved_at: "2025-01-10T00:00:00Z",
    created_at: "2025-01-08T00:00:00Z",
    updated_at: "2025-01-10T00:00:00Z",
  },
  
  // Financial Reporting - Consulting (OPEX)
  {
    id: "fin_005",
    portfolio_id: "port_001",
    project_id: "proj_002",
    category: "Consulting",
    type: "OPEX",
    currency: "PHP",
    budget_amount: 1000000,
    actual_spent: 0,
    committed_amount: 500000,
    variance_amount: 1000000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 2,
    description: "BI consulting and dashboard design services",
    cost_center: "FINANCE",
    gl_account: "6200-Consulting-Expense",
    approval_status: "Approved",
    approved_by: "CFO",
    approved_at: "2025-01-10T00:00:00Z",
    created_at: "2025-01-08T00:00:00Z",
    updated_at: "2025-01-10T00:00:00Z",
  },
  
  // Payment Gateway - Integration Platform (CAPEX)
  {
    id: "fin_006",
    portfolio_id: "port_001",
    project_id: "proj_003",
    category: "Software",
    type: "CAPEX",
    currency: "PHP",
    budget_amount: 1800000,
    actual_spent: 0,
    committed_amount: 1800000,
    variance_amount: 1800000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 2,
    description: "Payment gateway integration platform and APIs",
    cost_center: "IT-SYSTEMS",
    gl_account: "1200-Software-Assets",
    approval_status: "Approved",
    approved_by: "CFO",
    approved_at: "2025-01-12T00:00:00Z",
    created_at: "2025-01-10T00:00:00Z",
    updated_at: "2025-01-12T00:00:00Z",
  },
  
  // Payment Gateway - Implementation Services (CAPEX)
  {
    id: "fin_007",
    portfolio_id: "port_001",
    project_id: "proj_003",
    category: "Services",
    type: "CAPEX",
    currency: "PHP",
    budget_amount: 1200000,
    actual_spent: 0,
    committed_amount: 600000,
    variance_amount: 1200000,
    variance_percent: 100,
    fiscal_year: 2025,
    fiscal_quarter: 3,
    description: "Payment gateway implementation and testing",
    cost_center: "IT-SYSTEMS",
    gl_account: "1200-Software-Assets",
    approval_status: "Approved",
    approved_by: "CFO",
    approved_at: "2025-01-12T00:00:00Z",
    created_at: "2025-01-10T00:00:00Z",
    updated_at: "2025-01-12T00:00:00Z",
  }
];

// Calculate CAPEX/OPEX split
const totalBudget = financialRecords.reduce((sum, fr) => sum + fr.budget_amount, 0);
const capexBudget = financialRecords.filter(fr => fr.type === "CAPEX").reduce((sum, fr) => sum + fr.budget_amount, 0);
const opexBudget = financialRecords.filter(fr => fr.type === "OPEX").reduce((sum, fr) => sum + fr.budget_amount, 0);
const capexSplitPercent = Math.round((capexBudget / totalBudget) * 100);
const opexSplitPercent = Math.round((opexBudget / totalBudget) * 100);

// ==========================================
// 4. RISK REGISTER
// ==========================================

export const risks: Risk[] = [
  {
    id: "risk_001",
    portfolio_id: "port_001",
    project_id: "proj_001",
    title: "Integration Failure Risk",
    description: "Risk of incompatibility between legacy systems and new Odoo 18 modules during migration",
    category: "Technical",
    probability: "Medium",
    impact: "High",
    ...calculateRiskExposure("Medium", "High"),
    mitigation_status: "Open",
    mitigation_plan: "Conduct thorough compatibility testing in staging environment before production deployment",
    mitigation_owner: "Maria Santos",
    mitigation_deadline: "2025-06-30",
    identified_by: "Technical Team",
    identified_at: "2025-01-15T00:00:00Z",
    affected_areas: ["Timeline", "Budget", "Quality"],
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
  
  {
    id: "risk_002",
    portfolio_id: "port_001",
    project_id: "proj_001",
    title: "Budget Overrun Risk",
    description: "Potential for scope creep leading to budget overruns due to additional customization requests",
    category: "Financial",
    probability: "Medium",
    impact: "Medium",
    ...calculateRiskExposure("Medium", "Medium"),
    mitigation_status: "Open",
    mitigation_plan: "Implement strict change control process and maintain contingency reserve of 15%",
    mitigation_owner: "CKVC",
    mitigation_deadline: "2025-03-31",
    identified_by: "Project Management Office",
    identified_at: "2025-01-20T00:00:00Z",
    affected_areas: ["Budget"],
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z",
  },
  
  {
    id: "risk_003",
    portfolio_id: "port_001",
    project_id: "proj_001",
    title: "Resource Availability Risk",
    description: "Key technical resources may not be available during critical implementation phases",
    category: "Resource",
    probability: "Low",
    impact: "High",
    ...calculateRiskExposure("Low", "High"),
    mitigation_status: "Mitigated",
    mitigation_plan: "Secured external consulting resources and cross-trained internal team members",
    mitigation_owner: "HR Department",
    mitigation_deadline: "2025-02-28",
    identified_by: "Maria Santos",
    identified_at: "2025-01-10T00:00:00Z",
    affected_areas: ["Timeline", "Quality"],
    created_at: "2025-01-10T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  
  {
    id: "risk_004",
    portfolio_id: "port_001",
    project_id: "proj_002",
    title: "Data Quality Risk",
    description: "Historical financial data may have quality issues that affect reporting accuracy",
    category: "Operational",
    probability: "Medium",
    impact: "Medium",
    ...calculateRiskExposure("Medium", "Medium"),
    mitigation_status: "Open",
    mitigation_plan: "Conduct data quality audit and implement data cleansing procedures",
    mitigation_owner: "Roberto Tan",
    mitigation_deadline: "2025-04-30",
    identified_by: "Finance Team",
    identified_at: "2025-02-01T00:00:00Z",
    affected_areas: ["Quality"],
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  
  {
    id: "risk_005",
    portfolio_id: "port_001",
    project_id: "proj_003",
    title: "Security Compliance Risk",
    description: "Payment gateway integration may not meet PCI-DSS compliance requirements",
    category: "Compliance",
    probability: "Low",
    impact: "High",
    ...calculateRiskExposure("Low", "High"),
    mitigation_status: "Open",
    mitigation_plan: "Engage certified security auditor and implement all PCI-DSS requirements from design phase",
    mitigation_owner: "Sofia Diaz",
    mitigation_deadline: "2025-05-31",
    identified_by: "Compliance Team",
    identified_at: "2025-03-01T00:00:00Z",
    affected_areas: ["Compliance", "Timeline"],
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-01T00:00:00Z",
  }
];

// ==========================================
// 5. SYSTEM FEATURES
// ==========================================

export const systemFeatures: SystemFeature[] = [
  // FINANCIAL MANAGEMENT FEATURES
  {
    id: "feat_001",
    category: "Financial",
    name: "Financial Planning & Budgeting",
    description: "Budget allocation, tracking, and variance analysis across portfolios and projects with multi-year planning capabilities",
    status: "Active",
    is_enabled: true,
    icon: "Calculator",
    color: "#10B981",
    documentation_url: "/docs/financial-planning",
    requires_modules: ["account_budget_oca", "analytic_tag_dimension"],
    available_since: "Odoo 18.0",
    odoo_module: "account_budget_oca",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_002",
    category: "Financial",
    name: "Multi-Currency Support",
    description: "Budget and financial tracking in PHP and other currencies with automatic exchange rate updates",
    status: "Active",
    is_enabled: true,
    icon: "DollarSign",
    color: "#10B981",
    documentation_url: "/docs/multi-currency",
    requires_modules: ["account"],
    available_since: "Odoo 18.0",
    odoo_module: "account",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_003",
    category: "Financial",
    name: "OPEX/CAPEX Classification",
    description: "Automatic classification and tracking of operational and capital expenditures with fiscal year management",
    status: "Active",
    is_enabled: true,
    icon: "TrendingUp",
    color: "#10B981",
    documentation_url: "/docs/opex-capex",
    requires_modules: ["account_budget_oca"],
    available_since: "Odoo 18.0",
    odoo_module: "account_budget_oca",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_004",
    category: "Financial",
    name: "Variance Analysis",
    description: "Real-time budget vs. actual variance tracking with automated alerts and reporting",
    status: "Active",
    is_enabled: true,
    icon: "BarChart3",
    color: "#10B981",
    documentation_url: "/docs/variance-analysis",
    requires_modules: ["account_budget_oca"],
    available_since: "Odoo 18.0",
    odoo_module: "account_budget_oca",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  // RISK MANAGEMENT FEATURES
  {
    id: "feat_005",
    category: "Risk",
    name: "Risk Register",
    description: "Comprehensive risk identification, assessment, and tracking with full audit trail",
    status: "Active",
    is_enabled: true,
    icon: "AlertTriangle",
    color: "#EF4444",
    documentation_url: "/docs/risk-register",
    requires_modules: ["project_risk"],
    available_since: "Odoo 18.0",
    odoo_module: "project_risk",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_006",
    category: "Risk",
    name: "Risk Exposure Matrix",
    description: "Probability × Impact risk assessment with dynamic exposure scoring and heat map visualization",
    status: "Active",
    is_enabled: true,
    icon: "Grid3x3",
    color: "#EF4444",
    documentation_url: "/docs/risk-matrix",
    requires_modules: ["project_risk"],
    available_since: "Odoo 18.0",
    odoo_module: "project_risk",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_007",
    category: "Risk",
    name: "Mitigation Tracking",
    description: "Track risk mitigation plans, owners, and deadlines with automated reminders",
    status: "Active",
    is_enabled: true,
    icon: "Shield",
    color: "#EF4444",
    documentation_url: "/docs/mitigation-tracking",
    requires_modules: ["project_risk"],
    available_since: "Odoo 18.0",
    odoo_module: "project_risk",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  // ANALYTICS FEATURES
  {
    id: "feat_008",
    category: "Analytics",
    name: "Portfolio Dashboards",
    description: "Executive-level portfolio health dashboards with RAG status indicators and trend analysis",
    status: "Active",
    is_enabled: true,
    icon: "LayoutDashboard",
    color: "#8B5CF6",
    documentation_url: "/docs/portfolio-dashboards",
    requires_modules: ["project_portfolio"],
    available_since: "Odoo 18.0",
    odoo_module: "project_portfolio",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_009",
    category: "Analytics",
    name: "Health Score Tracking",
    description: "Automated portfolio and project health scoring based on multiple KPIs",
    status: "Active",
    is_enabled: true,
    icon: "Heart",
    color: "#8B5CF6",
    documentation_url: "/docs/health-scoring",
    requires_modules: ["project_portfolio"],
    available_since: "Odoo 18.0",
    odoo_module: "project_portfolio",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_010",
    category: "Analytics",
    name: "KPI Management",
    description: "Define, track, and report on custom KPIs at portfolio, project, and task levels",
    status: "Active",
    is_enabled: true,
    icon: "Target",
    color: "#8B5CF6",
    documentation_url: "/docs/kpi-management",
    requires_modules: ["project_kpi"],
    available_since: "Odoo 18.0",
    odoo_module: "project_kpi",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  // INTEGRATION FEATURES
  {
    id: "feat_011",
    category: "Integration",
    name: "Odoo 18 CE + OCA",
    description: "Full integration with Odoo 18 Community Edition and OCA (Odoo Community Association) modules",
    status: "Active",
    is_enabled: true,
    icon: "Plug",
    color: "#3B82F6",
    documentation_url: "/docs/odoo-integration",
    requires_modules: ["base", "project", "account"],
    available_since: "Odoo 18.0",
    odoo_module: "base",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_012",
    category: "Integration",
    name: "API Connectivity",
    description: "RESTful API for integration with external systems and custom applications",
    status: "Active",
    is_enabled: true,
    icon: "Link",
    color: "#3B82F6",
    documentation_url: "/docs/api-connectivity",
    requires_modules: ["base_rest"],
    available_since: "Odoo 18.0",
    odoo_module: "base_rest",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  // CORE FEATURES
  {
    id: "feat_013",
    category: "Core",
    name: "Project Portfolio Management",
    description: "Hierarchical portfolio management with strategic alignment and resource optimization",
    status: "Active",
    is_enabled: true,
    icon: "Briefcase",
    color: "#6366F1",
    documentation_url: "/docs/portfolio-management",
    requires_modules: ["project_portfolio"],
    available_since: "Odoo 18.0",
    odoo_module: "project_portfolio",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  
  {
    id: "feat_014",
    category: "Core",
    name: "Strategic Theme Alignment",
    description: "Link portfolios and projects to strategic themes for enterprise-wide alignment",
    status: "Active",
    is_enabled: true,
    icon: "Target",
    color: "#6366F1",
    documentation_url: "/docs/strategic-alignment",
    requires_modules: ["project_portfolio"],
    available_since: "Odoo 18.0",
    odoo_module: "project_portfolio",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  }
];

// Count features by status
const activeFeatures = systemFeatures.filter(f => f.status === "Active").length;
const betaFeatures = systemFeatures.filter(f => f.status === "Beta").length;
const plannedFeatures = systemFeatures.filter(f => f.status === "Planned").length;

// ==========================================
// 6. PORTFOLIO
// ==========================================

// Calculate aggregated metrics
const metrics = aggregatePortfolioMetrics(projects, financialRecords, risks);
const variance = calculateBudgetVariance(metrics.totalBudget, metrics.totalSpent);
const ragStatus = calculateRAGStatus(metrics.averageHealthScore, variance.variancePercent);

export const financialModernizationPortfolio: Portfolio = {
  id: "port_001",
  name: "Financial Systems Modernization",
  description: "ERP and financial systems upgrade program",
  
  // Status & Health
  status: ragStatus.status,
  health_score: Math.round(metrics.averageHealthScore),
  trend: "Stable",
  rag_color: ragStatus.ragColor,
  
  // Phase & Ownership
  phase: "Planning",
  owner_id: "CKVC",
  owner_name: "Chief Knowledge & Value Creation Officer",
  strategic_theme_id: "theme_001",
  strategic_theme_name: "Digital Transformation",
  
  // Aggregates
  total_budget_php: metrics.totalBudget,
  total_spent_php: metrics.totalSpent,
  budget_variance: variance.variance,
  budget_variance_percent: variance.variancePercent,
  project_count: metrics.projectCount,
  risk_count: metrics.riskCount,
  high_exposure_risks: metrics.highExposureRisks,
  
  // OPEX/CAPEX Split
  capex_split_percent: capexSplitPercent,
  opex_split_percent: opexSplitPercent,
  
  // Timestamps
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-12-09T00:00:00Z",
  start_date: "2025-01-15",
  end_date: "2025-12-31",
};

// ==========================================
// 7. DASHBOARD RESPONSE
// ==========================================

export const portfolioDashboard: PortfolioDashboardResponse = {
  meta: {
    system_status: "Odoo 18 CE + OCA Compatible",
    features_summary: {
      active: activeFeatures,
      beta: betaFeatures,
      planned: plannedFeatures,
    },
  },
  
  portfolio: {
    id: financialModernizationPortfolio.id,
    name: financialModernizationPortfolio.name,
    description: financialModernizationPortfolio.description,
    owner: financialModernizationPortfolio.owner_id,
    phase: financialModernizationPortfolio.phase,
    strategic_theme: financialModernizationPortfolio.strategic_theme_name || "Digital Transformation",
    
    kpi: {
      status: financialModernizationPortfolio.status,
      health_score: financialModernizationPortfolio.health_score,
      rag_color: financialModernizationPortfolio.rag_color,
      trend: financialModernizationPortfolio.trend,
    },
    
    financials: {
      currency: "PHP",
      total_budget: financialModernizationPortfolio.total_budget_php,
      total_spent: financialModernizationPortfolio.total_spent_php,
      budget_variance: financialModernizationPortfolio.budget_variance,
      capex_split: financialModernizationPortfolio.capex_split_percent,
      opex_split: financialModernizationPortfolio.opex_split_percent,
    },
    
    stats: {
      project_count: financialModernizationPortfolio.project_count,
      risk_count: financialModernizationPortfolio.risk_count,
      high_exposure_risks: financialModernizationPortfolio.high_exposure_risks,
    },
  },
  
  features_module: {
    financial_management: systemFeatures.filter(f => f.category === "Financial"),
    risk_management: systemFeatures.filter(f => f.category === "Risk"),
    analytics: systemFeatures.filter(f => f.category === "Analytics"),
    integration: systemFeatures.filter(f => f.category === "Integration"),
    core: systemFeatures.filter(f => f.category === "Core"),
    reporting: systemFeatures.filter(f => f.category === "Reporting"),
  },
  
  projects: projects,
  risks: risks,
  financial_records: financialRecords,
};

// ==========================================
// 8. EXPORTS
// ==========================================

export {
  activeFeatures,
  betaFeatures,
  plannedFeatures,
  capexBudget,
  opexBudget,
  capexSplitPercent,
  opexSplitPercent,
  totalBudget,
};