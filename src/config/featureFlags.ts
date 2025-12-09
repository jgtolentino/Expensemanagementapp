// config/featureFlags.ts
// Feature flag management for TBWA Agency Databank
// Controls which apps and features are enabled

interface FeatureFlags {
  // Core Apps (8 applications)
  rateCardPro: boolean;
  expense: boolean;
  gearroom: boolean;
  ppm: boolean;
  procure: boolean;
  creative: boolean;
  wiki: boolean;
  bi: boolean;

  // Additional Features
  bir: boolean; // Philippine BIR tax integration
  srm: boolean; // Supplier Relationship Management
  ocr: boolean; // OCR receipt processing
  n8nWorkflows: boolean; // n8n automation
  emailNotifications: boolean; // Email notifications

  // Advanced Features
  autoschedule: boolean; // PPM auto-scheduler
  creditCardIntegration: boolean; // Corporate card integration
  travelBooking: boolean; // Integrated travel booking
  aiInsights: boolean; // AI-powered insights (BI)
  mobileApp: boolean; // Mobile app features

  // Beta Features
  voiceAssistant: boolean; // Voice commands
  blockchainAudit: boolean; // Blockchain audit trail
  predictiveAnalytics: boolean; // ML predictions
}

// Get feature flag from environment variable
function getFlag(key: string, defaultValue: boolean = false): boolean {
  const envKey = `FEATURE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue === undefined) {
    return defaultValue;
  }

  return envValue === 'true' || envValue === '1';
}

// Feature flags configuration
export const featureFlags: FeatureFlags = {
  // Core Apps - All enabled by default in production
  rateCardPro: getFlag('rateCardPro', true),
  expense: getFlag('expense', true),
  gearroom: getFlag('gearroom', true),
  ppm: getFlag('ppm', true),
  procure: getFlag('procure', true),
  creative: getFlag('creative', true),
  wiki: getFlag('wiki', true),
  bi: getFlag('bi', true),

  // Additional Features
  bir: getFlag('bir', true),
  srm: getFlag('srm', true),
  ocr: getFlag('ocr', true),
  n8nWorkflows: getFlag('n8nWorkflows', true),
  emailNotifications: getFlag('emailNotifications', true),

  // Advanced Features (can be toggled)
  autoschedule: getFlag('autoschedule', true),
  creditCardIntegration: getFlag('creditCardIntegration', false), // Coming soon
  travelBooking: getFlag('travelBooking', false), // Coming soon
  aiInsights: getFlag('aiInsights', false), // Beta
  mobileApp: getFlag('mobileApp', false), // Coming soon

  // Beta Features (disabled by default)
  voiceAssistant: getFlag('voiceAssistant', false),
  blockchainAudit: getFlag('blockchainAudit', false),
  predictiveAnalytics: getFlag('predictiveAnalytics', false),
};

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature] === true;
}

// Helper function to get all enabled features
export function getEnabledFeatures(): Partial<FeatureFlags> {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

// Helper function to get disabled features
export function getDisabledFeatures(): Partial<FeatureFlags> {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => !enabled)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

// App visibility based on feature flags
export interface AppConfig {
  id: string;
  name: string;
  enabled: boolean;
  beta?: boolean;
  comingSoon?: boolean;
}

export const appConfigs: AppConfig[] = [
  {
    id: 'ratecard',
    name: 'Rate Card Pro',
    enabled: featureFlags.rateCardPro,
  },
  {
    id: 'te',
    name: 'Travel & Expense',
    enabled: featureFlags.expense,
  },
  {
    id: 'gear',
    name: 'Gearroom',
    enabled: featureFlags.gearroom,
  },
  {
    id: 'financeppm',
    name: 'Finance PPM',
    enabled: featureFlags.ppm,
  },
  {
    id: 'procure',
    name: 'Procure',
    enabled: featureFlags.procure,
  },
  {
    id: 'creative',
    name: 'Creative Workroom',
    enabled: featureFlags.creative,
  },
  {
    id: 'wiki',
    name: 'Wiki & Docs',
    enabled: featureFlags.wiki,
  },
  {
    id: 'bi',
    name: 'Business Intelligence',
    enabled: featureFlags.bi,
  },
];

// Get only enabled apps
export function getEnabledApps(): AppConfig[] {
  return appConfigs.filter(app => app.enabled);
}

// Environment-based overrides
export function applyEnvironmentOverrides(): void {
  if (process.env.NODE_ENV === 'development') {
    // In development, enable all features for testing
    Object.keys(featureFlags).forEach(key => {
      (featureFlags as any)[key] = true;
    });
    console.log('🚧 Development mode: All features enabled');
  }

  if (process.env.NODE_ENV === 'staging') {
    // In staging, enable beta features
    featureFlags.aiInsights = true;
    featureFlags.predictiveAnalytics = true;
    console.log('🧪 Staging mode: Beta features enabled');
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, enforce production flags
    featureFlags.voiceAssistant = false;
    featureFlags.blockchainAudit = false;
    console.log('🚀 Production mode: Stable features only');
  }
}

// Initialize feature flags
applyEnvironmentOverrides();

// Log enabled features on startup
if (typeof window === 'undefined') {
  // Server-side only
  console.log('Feature Flags:', {
    enabled: Object.keys(getEnabledFeatures()).length,
    disabled: Object.keys(getDisabledFeatures()).length,
    apps: getEnabledApps().map(a => a.name).join(', '),
  });
}

// Type-safe feature flag checker with TypeScript
export function requireFeature(feature: keyof FeatureFlags): void {
  if (!isFeatureEnabled(feature)) {
    throw new Error(`Feature "${feature}" is not enabled. Enable it in environment variables.`);
  }
}

// React hook for feature flags (if using React)
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

// Middleware helper for API routes
export function requireFeatureMiddleware(feature: keyof FeatureFlags) {
  return (req: any, res: any, next: any) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: `Feature "${feature}" is not enabled`,
        },
      });
    }
    next();
  };
}
