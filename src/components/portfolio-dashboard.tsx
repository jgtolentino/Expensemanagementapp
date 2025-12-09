// components/portfolio-dashboard.tsx
// Portfolio Dashboard Component - Financial Systems Modernization

import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Target,
  BarChart3,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Users,
  Calendar,
  Shield,
  Grid3x3,
  Heart,
  LayoutDashboard,
  Calculator,
  Link,
  Plug
} from 'lucide-react';
import { PortfolioDashboardResponse } from '../lib/data/ppm-data-model';
import { DataSourceBadge } from './ui/DataSourceBadge';
import { MOCK_DATA_META } from '../lib/data/ppm-sample-data';

interface PortfolioDashboardProps {
  data: PortfolioDashboardResponse;
}

export function PortfolioDashboard({ data }: PortfolioDashboardProps) {
  const { meta, portfolio, features_module, projects, risks, financial_records } = data;

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to get RAG color
  const getRAGColorClass = (color: string) => {
    switch (color) {
      case 'Green': return 'bg-green-100 text-green-800 border-green-300';
      case 'Amber': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Red': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Helper function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'Declining': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'Stable': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get feature icon
  const getFeatureIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Calculator, DollarSign, TrendingUp, BarChart3, AlertTriangle, 
      Grid3x3, Shield, LayoutDashboard, Heart, Target, Plug, Link, Briefcase
    };
    const Icon = icons[iconName] || CheckCircle2;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl text-gray-900">{portfolio.name}</h1>
              <DataSourceBadge 
                source={MOCK_DATA_META.source} 
                lastUpdated={MOCK_DATA_META.lastUpdated}
                showTooltip={true}
              />
            </div>
            <p className="text-gray-600 mb-4">{portfolio.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Owner: <span className="font-medium">{portfolio.owner}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Phase: <span className="font-medium">{portfolio.phase}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Theme: <span className="font-medium">{portfolio.strategic_theme}</span></span>
              </div>
            </div>
          </div>

          {/* RAG Status Badge */}
          <div className={`px-6 py-3 rounded-lg border-2 ${getRAGColorClass(portfolio.kpi.rag_color)}`}>
            <div className="text-center">
              <div className="text-sm font-medium mb-1">Status</div>
              <div className="font-bold">{portfolio.kpi.status}</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{meta.system_status}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-gray-600">Health Score</span>
            </div>
            {getTrendIcon(portfolio.kpi.trend)}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{portfolio.kpi.health_score}</div>
          <div className="text-xs text-gray-500">Trend: {portfolio.kpi.trend}</div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(portfolio.financials.total_budget)}
          </div>
          <div className="text-xs text-gray-500">
            Spent: {formatCurrency(portfolio.financials.total_spent)}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Active Projects</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{portfolio.stats.project_count}</div>
          <div className="text-xs text-gray-500">Projects in portfolio</div>
        </div>

        {/* Risks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-600">Risk Exposure</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{portfolio.stats.risk_count}</div>
          <div className="text-xs text-red-600">
            {portfolio.stats.high_exposure_risks} high exposure
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPEX/CAPEX Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            OPEX/CAPEX Classification
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">CAPEX</span>
                <span className="text-sm font-medium text-gray-900">{portfolio.financials.capex_split}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${portfolio.financials.capex_split}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Capital Expenditure: {formatCurrency(portfolio.financials.total_budget * portfolio.financials.capex_split / 100)}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">OPEX</span>
                <span className="text-sm font-medium text-gray-900">{portfolio.financials.opex_split}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${portfolio.financials.opex_split}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Operational Expenditure: {formatCurrency(portfolio.financials.total_budget * portfolio.financials.opex_split / 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Variance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Budget Variance Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Planned Budget</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(portfolio.financials.total_budget)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Actual Spent</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(portfolio.financials.total_spent)}
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Variance</span>
                <span className={`text-sm font-bold ${portfolio.financials.budget_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolio.financials.budget_variance)}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-right mt-1">
                {portfolio.financials.budget_variance >= 0 ? 'Under' : 'Over'} budget
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Active Projects ({projects?.length || 0})
        </h3>
        
        <div className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{project.code}</span>
                    <span className="text-sm font-semibold text-gray-900">{project.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{project.description}</p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500">Budget</div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(project.budget_php)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Progress</div>
                  <div className="text-sm font-medium text-gray-900">{project.progress_percent}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Health Score</div>
                  <div className="text-sm font-medium text-gray-900">{project.health_score}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Manager</div>
                  <div className="text-sm font-medium text-gray-900">{project.project_manager}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Risk Register ({risks?.length || 0})
        </h3>
        
        <div className="space-y-3">
          {risks?.map((risk) => (
            <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{risk.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      risk.exposure_level === 'Critical' ? 'bg-red-100 text-red-800' :
                      risk.exposure_level === 'High' ? 'bg-orange-100 text-orange-800' :
                      risk.exposure_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.exposure_level} Exposure
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <div className="text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{risk.category}</div>
                </div>
                <div>
                  <div className="text-gray-500">Probability</div>
                  <div className="font-medium text-gray-900">{risk.probability}</div>
                </div>
                <div>
                  <div className="text-gray-500">Impact</div>
                  <div className="font-medium text-gray-900">{risk.impact}</div>
                </div>
                <div>
                  <div className="text-gray-500">Score</div>
                  <div className="font-medium text-gray-900">{risk.exposure_score}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className={`font-medium ${
                    risk.mitigation_status === 'Mitigated' ? 'text-green-600' :
                    risk.mitigation_status === 'Open' ? 'text-amber-600' :
                    'text-gray-600'
                  }`}>
                    {risk.mitigation_status}
                  </div>
                </div>
              </div>
              
              {risk.mitigation_plan && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-900 mb-1">Mitigation Plan</div>
                  <div className="text-xs text-blue-800">{risk.mitigation_plan}</div>
                  {risk.mitigation_owner && (
                    <div className="text-xs text-blue-600 mt-1">
                      Owner: {risk.mitigation_owner}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Active Features
          </h3>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">{meta.features_summary.active} Active</span>
            <span className="text-blue-600 font-medium">{meta.features_summary.beta} Beta</span>
            <span className="text-gray-600 font-medium">{meta.features_summary.planned} Planned</span>
          </div>
        </div>

        {/* Features by Category */}
        {Object.entries(features_module).map(([category, features]) => {
          if (features.length === 0) return null;
          
          return (
            <div key={category} className="mb-6 last:mb-0">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                {category.replace('_', ' ')} ({features.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div 
                    key={feature.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        feature.category === 'Financial' ? 'bg-green-100 text-green-600' :
                        feature.category === 'Risk' ? 'bg-red-100 text-red-600' :
                        feature.category === 'Analytics' ? 'bg-purple-100 text-purple-600' :
                        feature.category === 'Integration' ? 'bg-blue-100 text-blue-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        {getFeatureIcon(feature.icon || 'CheckCircle2')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                          {feature.status === 'Active' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{feature.description}</p>
                        {feature.odoo_module && (
                          <div className="text-xs text-gray-500 mt-1">
                            Module: <span className="font-mono">{feature.odoo_module}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}