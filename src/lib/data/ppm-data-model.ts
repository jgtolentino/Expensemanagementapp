// lib/data/ppm-data-model.ts
// Robust Relational Data Model for PPM System
// Compatible with Odoo 18 CE + OCA Standards

// ==========================================
// 0. DATA SOURCE METADATA (Truth Indicator)
// ==========================================

export type DataSourceType = 'production' | 'mock';

export interface DataMeta {
  source: DataSourceType;
  lastUpdated?: string;    // ISO date string or "Static Demo"
  filename?: string;       // e.g., "ppm-oca.xlsx"
  importedBy?: string;     // User who imported
  confidence?: number;     // 0-100 (for ML predictions)
}

// ==========================================
// 1. STRATEGIC ALIGNMENT LAYER
// ==========================================

export interface StrategicTheme {
  id: string;             // e.g., "theme_001"
  name: string;           // "Digital Transformation"
  description: string;
  owner_id: string;       // "CKVC"
  active: boolean;
  created_at: string;
  updated_at: string;
  portfolios?: Portfolio[]; // Relation to Portfolios
}

// ==========================================
// 2. PORTFOLIO CORE (Main Hub)
// ==========================================

export type PortfolioStatus = "On Track" | "At Risk" | "Critical";
export type PortfolioPhase = "Planning" | "Execution" | "Closing";
export type TrendIndicator = "Improving" | "Stable" | "Declining";
export type RAGColor = "Green" | "Amber" | "Red";

export interface Portfolio {
  id: string;             // "port_fin_mod_01"
  name: string;           // "Financial Systems Modernization"
  description: string;    // "ERP and financial systems upgrade program"
  
  // Status & Health
  status: PortfolioStatus; // RAG Status
  health_score: number;   // 0-100 (Powers the "Health Score Tracking")
  trend: TrendIndicator; 
  rag_color: RAGColor;
  
  // Phase & Ownership
  phase: PortfolioPhase;
  owner_id: string;       // "CKVC"
  owner_name?: string;    // "Chief Knowledge & Value Creation Officer"
  strategic_theme_id: string; // Link to "Digital Transformation"
  strategic_theme_name?: string;

  // Aggregates (Calculated Fields)
  total_budget_php: number; // 8,500,000
  total_spent_php: number;  // 0
  budget_variance: number;  // total_budget - total_spent
  budget_variance_percent: number;
  project_count: number;    // 3
  risk_count: number;       // 5
  high_exposure_risks: number; // 1
  
  // OPEX/CAPEX Split
  capex_split_percent: number; // 60
  opex_split_percent: number;  // 40
  
  // Timestamps
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
}

// ==========================================
// 3. FINANCIAL MANAGEMENT
// ==========================================

export type FinancialCategory = "Software" | "Hardware" | "Services" | "Consulting" | "Infrastructure" | "Training";
export type FinancialType = "CAPEX" | "OPEX";
export type Currency = "PHP" | "USD" | "EUR" | "GBP" | "SGD";

export interface FinancialRecord {
  id: string;
  portfolio_id: string;   // Link to parent Portfolio
  project_id?: string;    // Optional link to specific project
  
  // Classification
  category: FinancialCategory;
  type: FinancialType;    // Powers "OPEX/CAPEX Classification" feature
  
  // Money
  currency: Currency;     // Powers "Multi-Currency Support"
  budget_amount: number;
  actual_spent: number;
  committed_amount: number; // Future obligations
  variance_amount: number; // Calculated (Budget - Actual)
  variance_percent: number; // Calculated
  
  // Time Period
  fiscal_year: number;    // 2025
  fiscal_quarter?: number; // Q1, Q2, Q3, Q4
  fiscal_month?: number;  // 1-12
  
  // Additional Details
  description?: string;
  cost_center?: string;
  gl_account?: string;    // General Ledger Account (for Odoo integration)
  
  // Approval Tracking
  approval_status: "Draft" | "Submitted" | "Approved" | "Rejected";
  approved_by?: string;
  approved_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==========================================
// 4. RISK MANAGEMENT
// ==========================================

export type RiskProbability = "Low" | "Medium" | "High";
export type RiskImpact = "Low" | "Medium" | "High";
export type RiskStatus = "Open" | "Mitigated" | "Closed" | "Accepted";
export type RiskCategory = "Technical" | "Financial" | "Operational" | "Strategic" | "Compliance" | "Resource";

export interface Risk {
  id: string;
  portfolio_id: string;
  project_id?: string;    // Optional specific project
  
  // Core Information
  title: string;          // "Integration failure risk"
  description: string;
  category: RiskCategory;
  
  // Matrix Calculation
  probability: RiskProbability;
  impact: RiskImpact;
  exposure_score: number; // (Prob * Impact) -> Powers "Risk Exposure Matrix"
  exposure_level: "Low" | "Medium" | "High" | "Critical"; // Derived from score
  
  // Mitigation
  mitigation_status: RiskStatus;
  mitigation_plan?: string;
  mitigation_owner?: string;
  mitigation_deadline?: string;
  
  // Tracking
  identified_by: string;
  identified_at: string;
  last_reviewed_at?: string;
  closed_at?: string;
  
  // Additional Context
  affected_areas?: string[]; // e.g., ["Budget", "Timeline", "Quality"]
  related_risks?: string[];  // IDs of related risks
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==========================================
// 5. SYSTEM FEATURES (Meta-Configuration)
// ==========================================

export type FeatureCategory = "Core" | "Financial" | "Risk" | "Analytics" | "Integration" | "Reporting";
export type FeatureStatus = "Active" | "Beta" | "Planned" | "Deprecated";

export interface SystemFeature {
  id: string;
  category: FeatureCategory;
  name: string;           // e.g., "Multi-Currency Support"
  description: string;    // "Budget and financial tracking in PHP..."
  status: FeatureStatus;  // Powers the counts (14 Active, 0 Beta)
  is_enabled: boolean;
  
  // Additional Metadata
  icon?: string;
  color?: string;
  documentation_url?: string;
  requires_modules?: string[]; // e.g., ["account_budget_oca"]
  
  // Version Info
  available_since?: string; // "Odoo 18.0"
  odoo_module?: string;     // OCA module name
  
  created_at: string;
  updated_at: string;
}

// ==========================================
// 6. PROJECTS (Linked to Portfolio)
// ==========================================

export type ProjectStatus = "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface Project {
  id: string;
  code: string;           // "PROJ-001"
  name: string;
  description: string;
  
  // Hierarchy
  portfolio_id: string;   // Parent portfolio
  strategic_theme_id?: string;
  
  // Status & Priority
  status: ProjectStatus;
  priority: ProjectPriority;
  health_score: number;   // 0-100
  
  // Timeline
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  
  // Budget
  budget_php: number;
  spent_php: number;
  
  // Team
  project_manager: string;
  team_members?: string[];
  
  // Progress
  progress_percent: number; // 0-100
  
  // Odoo Integration
  odoo_project_id?: string; // Link to project.project
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ==========================================
// 7. DASHBOARD RESPONSE PAYLOAD
// ==========================================

export interface PortfolioDashboardResponse {
  meta: {
    system_status: string;    // "Odoo 18 CE + OCA Compatible"
    features_summary: {
      active: number;
      beta: number;
      planned: number;
    };
  };
  
  portfolio: {
    id: string;
    name: string;
    description: string;
    owner: string;
    phase: PortfolioPhase;
    strategic_theme: string;
    
    kpi: {
      status: PortfolioStatus;
      health_score: number;
      rag_color: RAGColor;
      trend: TrendIndicator;
    };
    
    financials: {
      currency: Currency;
      total_budget: number;
      total_spent: number;
      budget_variance: number;
      capex_split: number;    // Percentage
      opex_split: number;
    };
    
    stats: {
      project_count: number;
      risk_count: number;
      high_exposure_risks: number;
    };
  };
  
  features_module: {
    financial_management: SystemFeature[];
    risk_management: SystemFeature[];
    analytics: SystemFeature[];
    integration: SystemFeature[];
    core: SystemFeature[];
    reporting: SystemFeature[];
  };
  
  projects?: Project[];
  risks?: Risk[];
  financial_records?: FinancialRecord[];
}

// ==========================================
// 8. ODOO CE + OCA MAPPING
// ==========================================

export interface OdooMapping {
  entity: string;
  odoo_model: string;
  oca_module: string;
  notes: string;
}

export const ODOO_ENTITY_MAPPINGS: OdooMapping[] = [
  {
    entity: "Portfolio",
    odoo_model: "project.project (Parent) or account.analytic.account",
    oca_module: "project_portfolio",
    notes: "Use project.project for portfolio management with parent-child hierarchy"
  },
  {
    entity: "Projects",
    odoo_model: "project.project",
    oca_module: "Standard Odoo",
    notes: "Native Odoo project management"
  },
  {
    entity: "Financials",
    odoo_model: "crossovered.budget & account.move.line",
    oca_module: "account_budget_oca",
    notes: "Budget management with actuals from account moves"
  },
  {
    entity: "Risks",
    odoo_model: "Custom Model or project.risk",
    oca_module: "project_risk",
    notes: "Risk management with probability/impact matrix"
  },
  {
    entity: "Strategic Theme",
    odoo_model: "project.tags or analytic.plan",
    oca_module: "Standard Odoo",
    notes: "Use tags for thematic grouping or analytic plans for hierarchy"
  },
  {
    entity: "Financial Records",
    odoo_model: "account.analytic.line",
    oca_module: "analytic_tag_dimension",
    notes: "Track financial records with analytic dimensions"
  }
];

// ==========================================
// 9. HELPER FUNCTIONS
// ==========================================

/**
 * Calculate risk exposure score
 * Low = 1, Medium = 2, High = 3
 * Score = Probability * Impact
 */
export function calculateRiskExposure(
  probability: RiskProbability,
  impact: RiskImpact
): { score: number; level: "Low" | "Medium" | "High" | "Critical" } {
  const probMap: Record<RiskProbability, number> = { Low: 1, Medium: 2, High: 3 };
  const impactMap: Record<RiskImpact, number> = { Low: 1, Medium: 2, High: 3 };
  
  const score = probMap[probability] * impactMap[impact];
  
  let level: "Low" | "Medium" | "High" | "Critical";
  if (score <= 2) level = "Low";
  else if (score <= 4) level = "Medium";
  else if (score <= 6) level = "High";
  else level = "Critical";
  
  return { score, level };
}

/**
 * Calculate budget variance
 */
export function calculateBudgetVariance(
  budget: number,
  actual: number
): { variance: number; variancePercent: number } {
  const variance = budget - actual;
  const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
  
  return { variance, variancePercent };
}

/**
 * Calculate RAG status based on health score and variance
 */
export function calculateRAGStatus(
  healthScore: number,
  budgetVariancePercent: number
): { status: PortfolioStatus; ragColor: RAGColor } {
  let status: PortfolioStatus;
  let ragColor: RAGColor;
  
  // Health score below 70 or variance > 20% = Critical
  if (healthScore < 70 || Math.abs(budgetVariancePercent) > 20) {
    status = "Critical";
    ragColor = "Red";
  }
  // Health score 70-85 or variance 10-20% = At Risk
  else if (healthScore < 85 || Math.abs(budgetVariancePercent) > 10) {
    status = "At Risk";
    ragColor = "Amber";
  }
  // Otherwise = On Track
  else {
    status = "On Track";
    ragColor = "Green";
  }
  
  return { status, ragColor };
}

/**
 * Aggregate portfolio metrics from projects and financial records
 */
export function aggregatePortfolioMetrics(
  projects: Project[],
  financialRecords: FinancialRecord[],
  risks: Risk[]
): {
  totalBudget: number;
  totalSpent: number;
  projectCount: number;
  riskCount: number;
  highExposureRisks: number;
  averageHealthScore: number;
} {
  const totalBudget = financialRecords.reduce((sum, fr) => sum + fr.budget_amount, 0);
  const totalSpent = financialRecords.reduce((sum, fr) => sum + fr.actual_spent, 0);
  const projectCount = projects.length;
  const riskCount = risks.length;
  const highExposureRisks = risks.filter(r => 
    r.exposure_level === "High" || r.exposure_level === "Critical"
  ).length;
  const averageHealthScore = projectCount > 0
    ? projects.reduce((sum, p) => sum + p.health_score, 0) / projectCount
    : 100;
  
  return {
    totalBudget,
    totalSpent,
    projectCount,
    riskCount,
    highExposureRisks,
    averageHealthScore
  };
}

// ==========================================
// 10. TYPE EXPORTS
// ==========================================

export type {
  PortfolioStatus,
  PortfolioPhase,
  TrendIndicator,
  RAGColor,
  FinancialCategory,
  FinancialType,
  Currency,
  RiskProbability,
  RiskImpact,
  RiskStatus,
  RiskCategory,
  FeatureCategory,
  FeatureStatus,
  ProjectStatus,
  ProjectPriority,
};