import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { RateCard } from './RateCardManager';

export interface QuoteLine {
  id: string;
  rateCardId?: string;
  role: string;
  discipline: string;
  seniorityLevel: string;
  unitOfMeasure: string;
  quantity: number;
  clientRate: number;
  costRate?: number;
  marginPct?: number;
  currency: string;
  description?: string;
  vendorName?: string;
}

export interface ProjectQuote {
  id: string;
  quoteCode: string;
  clientName: string;
  brandName: string;
  campaignType: string;
  markets: string[];
  deliverables: string[];
  durationWeeks: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'sent';
  lines: QuoteLine[];
  totalClientAmount: number;
  totalCostAmount?: number;
  totalMarginPct?: number;
  createdAt: Date;
  createdBy: string;
  fdApprovedBy?: string;
  fdApprovedAt?: Date;
}

interface ProjectQuoteBuilderProps {
  quote?: ProjectQuote;
  userRole: 'am' | 'fd';
  availableRateCards: RateCard[];
  onSave: (quote: Partial<ProjectQuote>) => void;
  onCancel: () => void;
  onAskRateAdvisor?: () => void;
}

export function ProjectQuoteBuilder({
  quote,
  userRole,
  availableRateCards,
  onSave,
  onCancel,
  onAskRateAdvisor,
}: ProjectQuoteBuilderProps) {
  const [clientName, setClientName] = useState(quote?.clientName || '');
  const [brandName, setBrandName] = useState(quote?.brandName || '');
  const [campaignType, setCampaignType] = useState(quote?.campaignType || '');
  const [deliverables, setDeliverables] = useState(quote?.deliverables.join(', ') || '');
  const [lines, setLines] = useState<QuoteLine[]>(quote?.lines || []);

  const isFD = userRole === 'fd';

  const addLineFromRateCard = (rateCard: RateCard) => {
    const newLine: QuoteLine = {
      id: `line-${Date.now()}`,
      rateCardId: rateCard.id,
      role: rateCard.role,
      discipline: rateCard.discipline,
      seniorityLevel: rateCard.seniorityLevel,
      unitOfMeasure: rateCard.unitOfMeasure,
      quantity: 1,
      clientRate: rateCard.clientRate,
      costRate: isFD ? rateCard.costRate : undefined,
      marginPct: isFD ? rateCard.marginPct : undefined,
      currency: rateCard.currency,
      vendorName: isFD ? rateCard.vendorName : undefined,
    };
    setLines([...lines, newLine]);
  };

  const addCustomLine = () => {
    const newLine: QuoteLine = {
      id: `line-${Date.now()}`,
      role: 'Custom Item',
      discipline: 'other',
      seniorityLevel: 'mid',
      unitOfMeasure: 'project',
      quantity: 1,
      clientRate: 0,
      currency: 'PHP',
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (index: number, field: keyof QuoteLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate margin if FD and cost/client rates change
    if (isFD && (field === 'clientRate' || field === 'costRate')) {
      const line = updated[index];
      if (line.costRate && line.clientRate) {
        line.marginPct = ((line.clientRate - line.costRate) / line.clientRate) * 100;
      }
    }

    setLines(updated);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const totalClientAmount = lines.reduce((sum, line) => sum + line.quantity * line.clientRate, 0);
    const totalCostAmount = isFD
      ? lines.reduce((sum, line) => sum + line.quantity * (line.costRate || 0), 0)
      : undefined;
    const totalMarginPct =
      isFD && totalClientAmount > 0
        ? ((totalClientAmount - (totalCostAmount || 0)) / totalClientAmount) * 100
        : undefined;

    onSave({
      clientName,
      brandName,
      campaignType,
      deliverables: deliverables.split(',').map((d) => d.trim()),
      lines,
      totalClientAmount,
      totalCostAmount,
      totalMarginPct,
    });
  };

  const totalClientAmount = lines.reduce((sum, line) => sum + line.quantity * line.clientRate, 0);
  const totalCostAmount = isFD ? lines.reduce((sum, line) => sum + line.quantity * (line.costRate || 0), 0) : 0;
  const totalMarginPct = isFD && totalClientAmount > 0 ? ((totalClientAmount - totalCostAmount) / totalClientAmount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
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
            <Label>Campaign Type</Label>
            <Input
              placeholder="e.g., TVC + Digital"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Deliverables</Label>
            <Textarea
              placeholder="e.g., 30s TVC, Cutdowns, Social assets (comma-separated)"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Lines</CardTitle>
            <div className="flex gap-2">
              {onAskRateAdvisor && (
                <Button size="sm" variant="outline" onClick={onAskRateAdvisor}>
                  🤖 Ask Rate Advisor
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={addCustomLine}>
                + Custom Line
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No lines yet. Add from rate cards or use the Rate Advisor.
            </p>
          ) : (
            lines.map((line, idx) => (
              <Card key={line.id} className="border-l-4" style={{ borderLeftColor: '#0EA5E9' }}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{line.role}</div>
                      <div className="text-xs text-muted-foreground">
                        {line.discipline} • {line.seniorityLevel}
                      </div>
                    </div>
                    {isFD && line.marginPct !== undefined && (
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor:
                            line.marginPct > 30 ? '#10B98120' : line.marginPct > 15 ? '#F59E0B20' : '#EF444420',
                          color: line.marginPct > 30 ? '#10B981' : line.marginPct > 15 ? '#F59E0B' : '#EF4444',
                        }}
                      >
                        {line.marginPct.toFixed(1)}% margin
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input value={line.unitOfMeasure} disabled className="capitalize" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Client Rate</Label>
                      <Input
                        type="number"
                        value={line.clientRate}
                        onChange={(e) => updateLine(idx, 'clientRate', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* FD-only cost fields */}
                  {isFD && (
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                      {line.vendorName && (
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Vendor</Label>
                          <Input value={line.vendorName} disabled className="text-xs" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">Cost Rate</Label>
                        <Input
                          type="number"
                          value={line.costRate || 0}
                          onChange={(e) => updateLine(idx, 'costRate', Number(e.target.value))}
                          className="text-orange-600"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Total Cost</Label>
                        <div className="h-9 flex items-center px-3 bg-orange-50 rounded-md text-sm text-orange-700">
                          ₱{(line.quantity * (line.costRate || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs">Total Client Amount</Label>
                    <div className="h-9 flex items-center px-3 bg-blue-50 rounded-md text-sm text-blue-700">
                      ₱{(line.quantity * line.clientRate).toLocaleString()}
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => removeLine(idx)} className="w-full text-red-500">
                    Remove Line
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-lg">
            <span>Total Client Amount:</span>
            <span className="text-blue-700">₱{totalClientAmount.toLocaleString()}</span>
          </div>
          {isFD && (
            <>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Cost:</span>
                <span className="text-orange-600">₱{totalCostAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span>Overall Margin:</span>
                <span
                  className="text-xl"
                  style={{
                    color: totalMarginPct > 30 ? '#10B981' : totalMarginPct > 15 ? '#F59E0B' : '#EF4444',
                  }}
                >
                  {totalMarginPct.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!clientName || lines.length === 0} className="flex-1">
          Save Quote
        </Button>
      </div>
    </div>
  );
}
