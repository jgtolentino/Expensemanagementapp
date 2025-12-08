// MCP Marketplace Types
export type MCPCategory =
  | 'financial'
  | 'media'
  | 'health'
  | 'retail'
  | 'transportation'
  | 'productivity'
  | 'analytics'
  | 'data-enrichment'
  | 'ai-models';

export interface MCPProvider {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  logoInitials?: string;
  website?: string;
  categories: MCPCategory[];
  isFeatured: boolean;
  isPartnerConnect: boolean;
  isVerified: boolean;
}

export interface MCPProduct {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  categories: MCPCategory[];
  tags: string[];
  pricing: MCPPricing;
  capabilities: MCPCapability[];
  documentationUrl?: string;
  isFree: boolean;
  isInstantlyAvailable: boolean;
  isNew: boolean;
  rating?: number;
  reviewCount?: number;
  installCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MCPPricing {
  type: 'free' | 'paid' | 'freemium' | 'contact-sales';
  startingPrice?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly' | 'usage-based';
}

export interface MCPCapability {
  id: string;
  name: string;
  description: string;
  type: 'tool' | 'resource' | 'prompt';
}

export interface MCPInstallation {
  id: string;
  productId: string;
  tenantId: string;
  installedAt: string;
  status: 'active' | 'suspended' | 'pending';
  configuration: Record<string, unknown>;
}

export const CATEGORY_LABELS: Record<MCPCategory, string> = {
  'financial': 'Financial',
  'media': 'Media',
  'health': 'Health and Life Sciences',
  'retail': 'Retail',
  'transportation': 'Transportation and Logistics',
  'productivity': 'Productivity',
  'analytics': 'Analytics',
  'data-enrichment': 'Data Enrichment',
  'ai-models': 'AI Models',
};

export const CATEGORY_ICONS: Record<MCPCategory, string> = {
  'financial': 'dollar-sign',
  'media': 'film',
  'health': 'heart-pulse',
  'retail': 'shopping-cart',
  'transportation': 'truck',
  'productivity': 'zap',
  'analytics': 'bar-chart-2',
  'data-enrichment': 'database',
  'ai-models': 'brain',
};
