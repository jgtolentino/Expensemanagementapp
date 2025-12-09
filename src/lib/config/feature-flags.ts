// /lib/config/feature-flags.ts
// Feature Flags Configuration - Strict Production Mode
// Controls which dashboard widgets are visible based on actual CSV data availability

/**
 * FEATURE FLAG PHILOSOPHY: "Truth in Data"
 * 
 * Only enable features that are backed by REAL data from CSV imports.
 * If a CSV column doesn't exist, the feature is DISABLED.
 * 
 * Data Availability Audit (from ppm-oca.xlsx):
 * ✅ AVAILABLE:
 *    - Projects/Plans (Tax Filing, Month-End Closing)
 *    - Phases/Buckets (6 total)
 *    - Tasks & Cards (6 total)
 *    - Checklist Items (24 total)
 *    - Dates (Start Date, Due Date)
 *    - Assignments (Assigned To)
 *    - Labels
 *    - Risk Register (8 risks) ⭐ NEW!
 *    - Portfolios (3 portfolios) ⭐ NEW!
 *    - Time Entries (14 entries) ⭐ NEW!
 *    - Financial Data (from Time Entries) ⭐ NEW!
 * 
 * ❌ MISSING:
 *    - CAPEX/OPEX Classification
 *    - Multi-Currency
 *    - Strategic Themes
 *    - OKR Mapping
 */

export interface FeatureFlagConfig {
  // Core modules (backed by CSV data)
  modules: {
    task_management: boolean;
    kanban_board: boolean;
    gantt_timeline: boolean;
    resource_allocation: boolean;
    checklist_tracking: boolean;
  };

  // Financial features (NOT in CSV)
  financials: {
    enabled: boolean;
    features: {
      budget_tracking: boolean;
      capex_opex: boolean;
      multi_currency: boolean;
      variance_analysis: boolean;
      cost_allocation: boolean;
      financial_forecasting: boolean;
    };
  };

  // Risk management (NOT in CSV)
  risks: {
    enabled: boolean;
    features: {
      risk_register: boolean;
      exposure_matrix: boolean;
      mitigation_tracking: boolean;
      risk_scoring: boolean;
    };
  };

  // Strategy alignment (NOT in CSV)
  strategy: {
    enabled: boolean;
    features: {
      theme_alignment: boolean;
      okr_tracking: boolean;
      strategic_initiatives: boolean;
    };
  };

  // Analytics (PARTIAL - only task-based)
  analytics: {
    enabled: boolean;
    features: {
      task_completion_rate: boolean;    // ✅ Can calculate from CSV
      timeline_tracking: boolean;        // ✅ Can calculate from dates
      assignment_distribution: boolean;  // ✅ Can calculate from assignees
      label_distribution: boolean;       // ✅ Can calculate from labels
      budget_variance: boolean;          // ❌ No budget data
      health_score: boolean;             // ❌ Too many missing inputs
      roi_analysis: boolean;             // ❌ No financial data
    };
  };

  // Dashboard widgets
  dashboard: {
    show_financial_cards: boolean;
    show_budget_charts: boolean;
    show_risk_matrix: boolean;
    show_strategy_alignment: boolean;
    show_health_score: boolean;
    show_task_metrics: boolean;
    show_timeline_view: boolean;
    show_team_allocation: boolean;
  };

  // Data quality indicators
  data_quality: {
    show_production_badge: boolean;
    show_mock_data_warnings: boolean;
    hide_zero_value_metrics: boolean;
  };
}

// ==========================================
// STRICT PRODUCTION MODE (Default)
// ==========================================

export const FEATURE_FLAGS: FeatureFlagConfig = {
  // 🟢 CORE MODULES (Backed by CSV)
  modules: {
    task_management: true,       // ✅ We have Task Name column
    kanban_board: true,          // ✅ We have Phase/Bucket column
    gantt_timeline: true,        // ✅ We have Start/End Date columns
    resource_allocation: true,   // ✅ We have Assigned To column
    checklist_tracking: true,    // ✅ We have Checklist Items
  },

  // 🟢 FINANCIALS (ENABLED - Time Entries CSV Provides Cost Data) ⭐ NEW!
  financials: {
    enabled: true,               // ✅ We have Time_Entries.csv
    features: {
      budget_tracking: true,     // ✅ Can calculate from hours * rate
      capex_opex: false,         // ❌ No classification column
      multi_currency: false,     // ❌ No currency column
      variance_analysis: true,   // ✅ Can compare budget vs actual
      cost_allocation: true,     // ✅ Can group by task/project
      financial_forecasting: false, // ❌ Need historical data
    }
  },

  // 🟢 RISKS (ENABLED - Risk Register CSV Available) ⭐ NEW!
  risks: {
    enabled: true,               // ✅ We have Risk_Register.csv
    features: {
      risk_register: true,       // ✅ 8 risks with full details
      exposure_matrix: true,     // ✅ Probability × Impact matrix
      mitigation_tracking: true, // ✅ Mitigation plans included
      risk_scoring: true,        // ✅ Risk scores calculated
    }
  },

  // 🔴 STRATEGY (DISABLED - No Strategy Data in CSV)
  strategy: {
    enabled: false,              // ❌ No strategy mapping file
    features: {
      theme_alignment: false,    // ❌ No strategic theme column
      okr_tracking: false,       // ❌ No OKR file
      strategic_initiatives: false, // ❌ No initiative mapping
    }
  },

  // 🟢 ANALYTICS (ENHANCED - More Metrics Available) ⭐ UPGRADED!
  analytics: {
    enabled: true,               // ✅ Enable analytics
    features: {
      task_completion_rate: true,      // ✅ Calculate from checklist
      timeline_tracking: true,          // ✅ Calculate from dates
      assignment_distribution: true,    // ✅ Calculate from assignees
      label_distribution: true,         // ✅ Calculate from labels
      budget_variance: true,            // ✅ Budget vs actual from time entries
      health_score: true,               // ✅ Can calculate from multiple inputs
      roi_analysis: false,              // ❌ Need revenue data
    }
  },

  // 🟢 DASHBOARD WIDGETS (Show Production Features) ⭐ UPGRADED!
  dashboard: {
    show_financial_cards: true,        // ✅ Show cost/budget cards
    show_budget_charts: true,          // ✅ Show financial charts
    show_risk_matrix: true,            // ✅ Show risk widgets
    show_strategy_alignment: false,    // ❌ Hide strategy cards
    show_health_score: true,           // ✅ Show health metrics
    show_task_metrics: true,           // ✅ Show task completion
    show_timeline_view: true,          // ✅ Show Gantt/dates
    show_team_allocation: true,        // ✅ Show assignee distribution
  },

  // 🏷️ DATA QUALITY INDICATORS
  data_quality: {
    show_production_badge: true,       // ✅ Show 🟢 PRODUCTION badge
    show_mock_data_warnings: false,    // ❌ Hide (no mock data visible)
    hide_zero_value_metrics: false,    // ✅ Show all metrics (we have real data now!)
  }
};

// ==========================================
// ALTERNATIVE MODES (For Future Use)
// ==========================================

/**
 * DEMO MODE - Show everything (including mock data)
 * Use this for presentations or UI testing
 */
export const DEMO_MODE: FeatureFlagConfig = {
  modules: {
    task_management: true,
    kanban_board: true,
    gantt_timeline: true,
    resource_allocation: true,
    checklist_tracking: true,
  },
  financials: {
    enabled: true,  // Show mock data
    features: {
      budget_tracking: true,
      capex_opex: true,
      multi_currency: true,
      variance_analysis: true,
      cost_allocation: true,
      financial_forecasting: true,
    }
  },
  risks: {
    enabled: true,  // Show mock data
    features: {
      risk_register: true,
      exposure_matrix: true,
      mitigation_tracking: true,
      risk_scoring: true,
    }
  },
  strategy: {
    enabled: true,  // Show mock data
    features: {
      theme_alignment: true,
      okr_tracking: true,
      strategic_initiatives: true,
    }
  },
  analytics: {
    enabled: true,
    features: {
      task_completion_rate: true,
      timeline_tracking: true,
      assignment_distribution: true,
      label_distribution: true,
      budget_variance: true,
      health_score: true,
      roi_analysis: true,
    }
  },
  dashboard: {
    show_financial_cards: true,
    show_budget_charts: true,
    show_risk_matrix: true,
    show_strategy_alignment: true,
    show_health_score: true,
    show_task_metrics: true,
    show_timeline_view: true,
    show_team_allocation: true,
  },
  data_quality: {
    show_production_badge: true,
    show_mock_data_warnings: true,  // Show 🟠 MOCK badges
    hide_zero_value_metrics: false,
  }
};

/**
 * HYBRID MODE - Show production + explicitly marked mock sections
 * Use this when you have partial data (e.g., tasks + budget)
 */
export const HYBRID_MODE: FeatureFlagConfig = {
  modules: {
    task_management: true,
    kanban_board: true,
    gantt_timeline: true,
    resource_allocation: true,
    checklist_tracking: true,
  },
  financials: {
    enabled: true,  // Show with 🟠 MOCK badge
    features: {
      budget_tracking: true,
      capex_opex: true,
      multi_currency: false,
      variance_analysis: true,
      cost_allocation: false,
      financial_forecasting: false,
    }
  },
  risks: {
    enabled: false,
    features: {
      risk_register: false,
      exposure_matrix: false,
      mitigation_tracking: false,
      risk_scoring: false,
    }
  },
  strategy: {
    enabled: false,
    features: {
      theme_alignment: false,
      okr_tracking: false,
      strategic_initiatives: false,
    }
  },
  analytics: {
    enabled: true,
    features: {
      task_completion_rate: true,
      timeline_tracking: true,
      assignment_distribution: true,
      label_distribution: true,
      budget_variance: true,  // Show with 🟠 MOCK badge
      health_score: false,
      roi_analysis: false,
    }
  },
  dashboard: {
    show_financial_cards: true,   // Show with 🟠 MOCK badge
    show_budget_charts: true,     // Show with 🟠 MOCK badge
    show_risk_matrix: false,
    show_strategy_alignment: false,
    show_health_score: false,
    show_task_metrics: true,
    show_timeline_view: true,
    show_team_allocation: true,
  },
  data_quality: {
    show_production_badge: true,
    show_mock_data_warnings: true,  // Show 🟠 MOCK badges
    hide_zero_value_metrics: false,
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if a module is enabled
 */
export function isModuleEnabled(module: keyof FeatureFlagConfig['modules']): boolean {
  return FEATURE_FLAGS.modules[module];
}

/**
 * Check if financials are enabled
 */
export function areFinancialsEnabled(): boolean {
  return FEATURE_FLAGS.financials.enabled;
}

/**
 * Check if risks are enabled
 */
export function areRisksEnabled(): boolean {
  return FEATURE_FLAGS.risks.enabled;
}

/**
 * Check if strategy is enabled
 */
export function isStrategyEnabled(): boolean {
  return FEATURE_FLAGS.strategy.enabled;
}

/**
 * Check if a specific analytics feature is enabled
 */
export function isAnalyticsFeatureEnabled(feature: keyof FeatureFlagConfig['analytics']['features']): boolean {
  return FEATURE_FLAGS.analytics.enabled && FEATURE_FLAGS.analytics.features[feature];
}

/**
 * Check if a dashboard widget should be shown
 */
export function shouldShowWidget(widget: keyof FeatureFlagConfig['dashboard']): boolean {
  return FEATURE_FLAGS.dashboard[widget];
}

/**
 * Get current mode name
 */
export function getCurrentMode(): string {
  if (FEATURE_FLAGS.financials.enabled && FEATURE_FLAGS.risks.enabled) {
    return 'DEMO_MODE';
  } else if (FEATURE_FLAGS.financials.enabled && !FEATURE_FLAGS.risks.enabled) {
    return 'HYBRID_MODE';
  } else {
    return 'STRICT_PRODUCTION_MODE';
  }
}

/**
 * Get list of enabled features
 */
export function getEnabledFeatures(): string[] {
  const enabled: string[] = [];
  
  if (FEATURE_FLAGS.modules.task_management) enabled.push('Task Management');
  if (FEATURE_FLAGS.modules.kanban_board) enabled.push('Kanban Board');
  if (FEATURE_FLAGS.modules.gantt_timeline) enabled.push('Timeline View');
  if (FEATURE_FLAGS.modules.resource_allocation) enabled.push('Resource Allocation');
  if (FEATURE_FLAGS.modules.checklist_tracking) enabled.push('Checklist Tracking');
  
  if (FEATURE_FLAGS.financials.enabled) enabled.push('Financials');
  if (FEATURE_FLAGS.risks.enabled) enabled.push('Risk Management');
  if (FEATURE_FLAGS.strategy.enabled) enabled.push('Strategy Alignment');
  
  return enabled;
}

/**
 * Get list of disabled features
 */
export function getDisabledFeatures(): string[] {
  const disabled: string[] = [];
  
  if (!FEATURE_FLAGS.financials.enabled) disabled.push('Budget Tracking');
  if (!FEATURE_FLAGS.risks.enabled) disabled.push('Risk Management');
  if (!FEATURE_FLAGS.strategy.enabled) disabled.push('Strategy Alignment');
  if (!FEATURE_FLAGS.analytics.features.health_score) disabled.push('Health Score');
  
  return disabled;
}

/**
 * Get CSV data availability summary
 */
export function getDataAvailabilitySummary() {
  return {
    available: [
      'Projects/Plans (2)',
      'Phases/Buckets (6)',
      'Tasks (6)',
      'Checklist Items (24)',
      'Start/End Dates',
      'Assignments',
      'Labels'
    ],
    missing: [
      'Budgets/Financials',
      'Risks',
      'Strategic Themes',
      'CAPEX/OPEX',
      'Multi-Currency',
      'Resource Rates'
    ]
  };
}

// ==========================================
// EXPORT CURRENT MODE
// ==========================================

// Default: Use STRICT_PRODUCTION_MODE
// To switch modes, change this line:
export const ACTIVE_MODE = FEATURE_FLAGS; // STRICT_PRODUCTION_MODE
// export const ACTIVE_MODE = DEMO_MODE;   // For presentations
// export const ACTIVE_MODE = HYBRID_MODE; // For partial data

// ==========================================
// CONSOLE SUMMARY (For Debugging)
// ==========================================

export function printFeatureFlagSummary(): void {
  console.log('='.repeat(70));
  console.log('🛑 FEATURE FLAGS - STRICT PRODUCTION MODE');
  console.log('='.repeat(70));
  console.log(`Current Mode: ${getCurrentMode()}`);
  console.log('-'.repeat(70));
  console.log('✅ ENABLED FEATURES:');
  getEnabledFeatures().forEach(feature => console.log(`  • ${feature}`));
  console.log('-'.repeat(70));
  console.log('❌ DISABLED FEATURES (No CSV Data):');
  getDisabledFeatures().forEach(feature => console.log(`  • ${feature}`));
  console.log('-'.repeat(70));
  console.log('📊 CSV DATA AVAILABILITY:');
  console.log('Available:');
  getDataAvailabilitySummary().available.forEach(item => console.log(`  ✅ ${item}`));
  console.log('Missing:');
  getDataAvailabilitySummary().missing.forEach(item => console.log(`  ❌ ${item}`));
  console.log('='.repeat(70));
}

// Auto-print in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Uncomment to see feature flag summary on load:
  // printFeatureFlagSummary();
}