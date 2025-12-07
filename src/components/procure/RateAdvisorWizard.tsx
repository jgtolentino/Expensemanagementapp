import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export interface RateAdvisorRequest {
  userRole: 'am' | 'fd';
  projectBrief: {
    clientName: string;
    brandName: string;
    campaignType: string;
    markets: string[];
    deliverables: string[];
    durationWeeks: number;
  };
  lineItems: Array<{
    discipline: string;
    role: string;
    seniority: string;
    market: string;
    unit: string;
    quantity: number;
  }>;
}

export interface RateAdvisorResponse {
  mode: 'client_budget_builder' | 'governance';
  recommendedItems: Array<{
    discipline: string;
    roleLabel: string;
    unit: string;
    quantity: number;
    clientRate: number;
    costRate?: number;
    marginPct?: number;
    currency: string;
    totalClientAmount: number;
    totalCostAmount?: number;
    isOutlier?: boolean;
    notes?: string;
  }>;
  warnings: string[];
}

interface RateAdvisorWizardProps {
  userRole: 'am' | 'fd';
  onApplyRecommendations: (recommendations: RateAdvisorResponse) => void;
  onCancel: () => void;
}

export function RateAdvisorWizard({ userRole, onApplyRecommendations, onCancel }: RateAdvisorWizardProps) {
  const [step, setStep] = useState<'brief' | 'roles' | 'results'>('brief');
  const [loading, setLoading] = useState(false);

  // Brief fields
  const [clientName, setClientName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [markets, setMarkets] = useState('PH');
  const [deliverables, setDeliverables] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(8);

  // Role selection
  const [selectedRoles, setSelectedRoles] = useState<
    Array<{ discipline: string; role: string; seniority: string; quantity: number }>
  >([]);

  // Results
  const [recommendations, setRecommendations] = useState<RateAdvisorResponse | null>(null);

  const commonRoles = [
    { discipline: 'strategy', role: 'Brand Strategist', seniority: 'senior' },
    { discipline: 'creative', role: 'Creative Director', seniority: 'director' },
    { discipline: 'creative', role: 'Art Director', seniority: 'senior' },
    { discipline: 'creative', role: 'Copywriter', seniority: 'senior' },
    { discipline: 'production', role: 'Producer', seniority: 'mid' },
    { discipline: 'post', role: 'Editor', seniority: 'senior' },
    { discipline: 'digital', role: 'Digital Designer', seniority: 'mid' },
    { discipline: 'social', role: 'Social Media Manager', seniority: 'mid' },
  ];

  const toggleRole = (roleObj: { discipline: string; role: string; seniority: string }) => {
    const exists = selectedRoles.find((r) => r.role === roleObj.role);
    if (exists) {
      setSelectedRoles(selectedRoles.filter((r) => r.role !== roleObj.role));
    } else {
      setSelectedRoles([...selectedRoles, { ...roleObj, quantity: 5 }]);
    }
  };

  const updateRoleQuantity = (role: string, quantity: number) => {
    setSelectedRoles(selectedRoles.map((r) => (r.role === role ? { ...r, quantity } : r)));
  };

  const handleGetRecommendations = async () => {
    setLoading(true);

    // Simulate AI call - in production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response
    const mockResponse: RateAdvisorResponse = {
      mode: userRole === 'am' ? 'client_budget_builder' : 'governance',
      recommendedItems: selectedRoles.map((role) => {
        const baseCost = role.seniority === 'director' ? 25000 : role.seniority === 'senior' ? 18000 : 12000;
        const baseClient = role.seniority === 'director' ? 35000 : role.seniority === 'senior' ? 25000 : 16000;

        return {
          discipline: role.discipline,
          roleLabel: role.role,
          unit: 'day',
          quantity: role.quantity,
          clientRate: baseClient,
          costRate: userRole === 'fd' ? baseCost : undefined,
          marginPct: userRole === 'fd' ? ((baseClient - baseCost) / baseClient) * 100 : undefined,
          currency: 'PHP',
          totalClientAmount: baseClient * role.quantity,
          totalCostAmount: userRole === 'fd' ? baseCost * role.quantity : undefined,
          isOutlier: false,
          notes: 'Within reasonable & customary range for PH campaigns.',
        };
      }),
      warnings:
        userRole === 'fd'
          ? ['Producer rate exceeds 90th percentile for PH by ~15%; consider adjusting.']
          : [],
    };

    setRecommendations(mockResponse);
    setLoading(false);
    setStep('results');
  };

  if (step === 'brief') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Advisor - Project Brief</CardTitle>
          <CardDescription>Tell us about the project to get AI-powered rate suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Name *</Label>
              <Input
                placeholder="e.g., Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                placeholder="e.g., Brand X"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Campaign Type *</Label>
            <Input
              placeholder="e.g., TVC + Digital"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Markets</Label>
              <Input placeholder="e.g., PH, SEA" value={markets} onChange={(e) => setMarkets(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (weeks)</Label>
              <Input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deliverables</Label>
            <Textarea
              placeholder="e.g., 30s TVC, Cutdowns, Social assets"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => setStep('roles')}
              disabled={!clientName || !campaignType}
              className="flex-1"
            >
              Next: Select Roles →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'roles') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Required Roles</CardTitle>
          <CardDescription>Choose roles and set estimated quantities (days)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {commonRoles.map((roleObj) => {
              const isSelected = selectedRoles.some((r) => r.role === roleObj.role);
              return (
                <Badge
                  key={roleObj.role}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer p-3 text-sm justify-center"
                  onClick={() => toggleRole(roleObj)}
                >
                  {roleObj.role} ({roleObj.seniority})
                </Badge>
              );
            })}
          </div>

          {selectedRoles.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Set Quantities (days)</Label>
              {selectedRoles.map((role) => (
                <div key={role.role} className="flex items-center gap-3">
                  <div className="flex-1 text-sm">{role.role}</div>
                  <Input
                    type="number"
                    value={role.quantity}
                    onChange={(e) => updateRoleQuantity(role.role, Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('brief')} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={handleGetRecommendations}
              disabled={selectedRoles.length === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'results' && recommendations) {
    const totalClient = recommendations.recommendedItems.reduce((sum, item) => sum + item.totalClientAmount, 0);
    const totalCost =
      userRole === 'fd'
        ? recommendations.recommendedItems.reduce((sum, item) => sum + (item.totalCostAmount || 0), 0)
        : 0;
    const overallMargin = userRole === 'fd' && totalClient > 0 ? ((totalClient - totalCost) / totalClient) * 100 : 0;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Based on {recommendations.recommendedItems.length} roles for {clientName || 'your project'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-1">
                <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                {recommendations.warnings.map((warn, idx) => (
                  <p key={idx} className="text-xs text-yellow-700">
                    • {warn}
                  </p>
                ))}
              </div>
            )}

            {recommendations.recommendedItems.map((item, idx) => (
              <Card key={idx} className="bg-gray-50">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{item.roleLabel}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.discipline} • {item.quantity} {item.unit}s
                      </div>
                    </div>
                    {item.isOutlier && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Outlier
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Rate:</span>
                      <span>₱{item.clientRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">₱{item.totalClientAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {userRole === 'fd' && item.costRate && (
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost Rate:</span>
                        <span className="text-orange-600">₱{item.costRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin:</span>
                        <span
                          className="font-medium"
                          style={{
                            color:
                              (item.marginPct || 0) > 30
                                ? '#10B981'
                                : (item.marginPct || 0) > 15
                                ? '#F59E0B'
                                : '#EF4444',
                          }}
                        >
                          {item.marginPct?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-lg">
              <span>Total Client Budget:</span>
              <span className="text-blue-700">₱{totalClient.toLocaleString()}</span>
            </div>
            {userRole === 'fd' && (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Cost:</span>
                  <span className="text-orange-600">₱{totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span>Overall Margin:</span>
                  <span
                    className="text-xl"
                    style={{
                      color: overallMargin > 30 ? '#10B981' : overallMargin > 15 ? '#F59E0B' : '#EF4444',
                    }}
                  >
                    {overallMargin.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Discard
          </Button>
          <Button onClick={() => onApplyRecommendations(recommendations)} className="flex-1">
            Apply to Quote
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
