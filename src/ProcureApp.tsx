import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { RateCardManager, RateCard } from './components/procure/RateCardManager';
import { ProjectQuoteBuilder, ProjectQuote, QuoteLine } from './components/procure/ProjectQuoteBuilder';
import { RateAdvisorWizard, RateAdvisorResponse } from './components/procure/RateAdvisorWizard';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'am' | 'fd';
  department: string;
};

export default function ProcureApp() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showRateAdvisor, setShowRateAdvisor] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<ProjectQuote | null>(null);
  const [quoteLinesBuffer, setQuoteLinesBuffer] = useState<QuoteLine[]>([]);

  // Mock data - Rate Cards
  const [rateCards] = useState<RateCard[]>([
    {
      id: 'RC-001',
      name: 'Senior Art Director - PH',
      role: 'Art Director',
      discipline: 'creative',
      seniorityLevel: 'senior',
      market: 'PH',
      vendorId: 'vendor-1',
      vendorName: 'Creative Collective PH',
      productId: 'prod-ad-sr',
      productName: 'Art Director - Senior',
      unitOfMeasure: 'day',
      costRate: 18000,
      clientRate: 25000,
      marginPct: 28,
      currency: 'PHP',
      state: 'active',
    },
    {
      id: 'RC-002',
      name: 'Senior Copywriter - PH',
      role: 'Copywriter',
      discipline: 'creative',
      seniorityLevel: 'senior',
      market: 'PH',
      vendorId: 'vendor-2',
      vendorName: 'Wordsmith Studios',
      productId: 'prod-cw-sr',
      productName: 'Copywriter - Senior',
      unitOfMeasure: 'day',
      costRate: 16000,
      clientRate: 22000,
      marginPct: 27.3,
      currency: 'PHP',
      state: 'active',
    },
    {
      id: 'RC-003',
      name: 'Creative Director - PH',
      role: 'Creative Director',
      discipline: 'creative',
      seniorityLevel: 'director',
      market: 'PH',
      vendorId: 'vendor-1',
      vendorName: 'Creative Collective PH',
      productId: 'prod-cd-dir',
      productName: 'Creative Director',
      unitOfMeasure: 'day',
      costRate: 28000,
      clientRate: 38000,
      marginPct: 26.3,
      currency: 'PHP',
      state: 'active',
    },
    {
      id: 'RC-004',
      name: 'Brand Strategist - Senior - PH',
      role: 'Brand Strategist',
      discipline: 'strategy',
      seniorityLevel: 'senior',
      market: 'PH',
      vendorId: 'vendor-3',
      vendorName: 'Strategy First Consulting',
      productId: 'prod-strat-sr',
      productName: 'Brand Strategist - Senior',
      unitOfMeasure: 'day',
      costRate: 20000,
      clientRate: 28000,
      marginPct: 28.6,
      currency: 'PHP',
      state: 'active',
    },
    {
      id: 'RC-005',
      name: 'Producer - Mid - PH',
      role: 'Producer',
      discipline: 'production',
      seniorityLevel: 'mid',
      market: 'PH',
      vendorId: 'vendor-4',
      vendorName: 'PH Production House',
      productId: 'prod-prod-mid',
      productName: 'Producer - Mid',
      unitOfMeasure: 'day',
      costRate: 14000,
      clientRate: 19000,
      marginPct: 26.3,
      currency: 'PHP',
      state: 'active',
    },
    {
      id: 'RC-006',
      name: 'Editor - Senior - PH',
      role: 'Editor',
      discipline: 'post',
      seniorityLevel: 'senior',
      market: 'PH',
      vendorId: 'vendor-5',
      vendorName: 'Post House Manila',
      productId: 'prod-edit-sr',
      productName: 'Editor - Senior',
      unitOfMeasure: 'day',
      costRate: 15000,
      clientRate: 21000,
      marginPct: 28.6,
      currency: 'PHP',
      state: 'active',
    },
  ]);

  // Mock data - Quotes
  const [quotes, setQuotes] = useState<ProjectQuote[]>([
    {
      id: 'Q-001',
      quoteCode: 'Q-2025-001',
      clientName: 'Acme Corporation',
      brandName: 'Brand X',
      campaignType: 'TVC + Digital Campaign',
      markets: ['PH'],
      deliverables: ['30s TVC', 'Cutdowns', 'Social Assets'],
      durationWeeks: 8,
      status: 'draft',
      lines: [
        {
          id: 'line-1',
          rateCardId: 'RC-003',
          role: 'Creative Director',
          discipline: 'creative',
          seniorityLevel: 'director',
          unitOfMeasure: 'day',
          quantity: 10,
          clientRate: 38000,
          costRate: 28000,
          marginPct: 26.3,
          currency: 'PHP',
          vendorName: 'Creative Collective PH',
        },
        {
          id: 'line-2',
          rateCardId: 'RC-001',
          role: 'Art Director',
          discipline: 'creative',
          seniorityLevel: 'senior',
          unitOfMeasure: 'day',
          quantity: 15,
          clientRate: 25000,
          costRate: 18000,
          marginPct: 28,
          currency: 'PHP',
          vendorName: 'Creative Collective PH',
        },
      ],
      totalClientAmount: 755000,
      totalCostAmount: 550000,
      totalMarginPct: 27.2,
      createdAt: new Date('2025-12-01'),
      createdBy: 'am@company.com',
    },
  ]);

  const COLORS = {
    primary: '#0EA5E9',
    bg: '#F8FAFC',
    accent: '#8B5CF6',
  };

  const statusColors: Record<string, string> = {
    draft: '#6B7280',
    submitted: '#3B82F6',
    approved: '#10B981',
    rejected: '#EF4444',
    sent: '#8B5CF6',
  };

  const handleLogin = (role: 'am' | 'fd') => {
    const users = {
      am: {
        id: 'am1',
        name: 'Account Manager',
        email: 'am@company.com',
        role: 'am' as const,
        department: 'Account Management',
      },
      fd: {
        id: 'fd1',
        name: 'Finance Director',
        email: 'fd@company.com',
        role: 'fd' as const,
        department: 'Finance',
      },
    };
    setUser(users[role]);
  };

  const handleSaveQuote = (quoteData: Partial<ProjectQuote>) => {
    const newQuote: ProjectQuote = {
      id: `Q-${String(quotes.length + 1).padStart(3, '0')}`,
      quoteCode: `Q-2025-${String(quotes.length + 1).padStart(3, '0')}`,
      clientName: quoteData.clientName || '',
      brandName: quoteData.brandName || '',
      campaignType: quoteData.campaignType || '',
      markets: quoteData.markets || [],
      deliverables: quoteData.deliverables || [],
      durationWeeks: quoteData.durationWeeks || 8,
      status: 'draft',
      lines: quoteData.lines || [],
      totalClientAmount: quoteData.totalClientAmount || 0,
      totalCostAmount: quoteData.totalCostAmount,
      totalMarginPct: quoteData.totalMarginPct,
      createdAt: new Date(),
      createdBy: user?.email || '',
    };

    setQuotes([newQuote, ...quotes]);
    setShowQuoteBuilder(false);
    setQuoteLinesBuffer([]);
    setActiveTab('quotes');
  };

  const handleApplyRateAdvisorRecommendations = (recommendations: RateAdvisorResponse) => {
    const newLines: QuoteLine[] = recommendations.recommendedItems.map((item, idx) => ({
      id: `advisor-line-${Date.now()}-${idx}`,
      role: item.roleLabel,
      discipline: item.discipline,
      seniorityLevel: 'senior',
      unitOfMeasure: item.unit as 'day' | 'hour' | 'project',
      quantity: item.quantity,
      clientRate: item.clientRate,
      costRate: item.costRate,
      marginPct: item.marginPct,
      currency: item.currency,
    }));

    setQuoteLinesBuffer(newLines);
    setShowRateAdvisor(false);
    setShowQuoteBuilder(true);
  };

  const handleApproveQuote = (quoteId: string) => {
    if (user?.role !== 'fd') return;
    setQuotes(
      quotes.map((q) =>
        q.id === quoteId
          ? { ...q, status: 'approved' as const, fdApprovedBy: user.name, fdApprovedAt: new Date() }
          : q
      )
    );
    setSelectedQuote(null);
  };

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.bg }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: COLORS.primary }}>
              Procure
            </CardTitle>
            <CardDescription>SAP SRM-style vendor rate governance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">Demo Login:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleLogin('am')} style={{ backgroundColor: COLORS.primary }}>
                Account Manager
              </Button>
              <Button onClick={() => handleLogin('fd')} style={{ backgroundColor: COLORS.accent }}>
                Finance Director
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quote detail view
  if (selectedQuote) {
    const canApprove = user.role === 'fd' && selectedQuote.status === 'draft';

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-5xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setSelectedQuote(null)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedQuote.clientName}</CardTitle>
                  <CardDescription>
                    {selectedQuote.quoteCode} • {selectedQuote.campaignType}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColors[selectedQuote.status]}20`,
                    color: statusColors[selectedQuote.status],
                  }}
                >
                  {selectedQuote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Brand:</span>
                  <div>{selectedQuote.brandName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Markets:</span>
                  <div>{selectedQuote.markets.join(', ')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <div>{selectedQuote.durationWeeks} weeks</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div>{selectedQuote.createdAt.toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedQuote.lines.map((line) => (
                  <div key={line.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{line.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {line.discipline} • {line.seniorityLevel}
                        </div>
                      </div>
                      {user.role === 'fd' && line.marginPct !== undefined && (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor:
                              line.marginPct > 30 ? '#10B98120' : line.marginPct > 15 ? '#F59E0B20' : '#EF444420',
                            color: line.marginPct > 30 ? '#10B981' : line.marginPct > 15 ? '#F59E0B' : '#EF4444',
                          }}
                        >
                          {line.marginPct.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span> {line.quantity} {line.unitOfMeasure}s
                      </div>
                      <div>
                        <span className="text-muted-foreground">Client Rate:</span> ₱
                        {line.clientRate.toLocaleString()}
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Total:</span> ₱
                        {(line.quantity * line.clientRate).toLocaleString()}
                      </div>
                    </div>
                    {user.role === 'fd' && line.costRate && (
                      <div className="grid grid-cols-3 gap-2 text-sm mt-2 pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          {line.vendorName && <>Vendor: {line.vendorName}</>}
                        </div>
                        <div className="text-orange-600">
                          Cost Rate: ₱{line.costRate.toLocaleString()}
                        </div>
                        <div className="text-right text-orange-600">
                          Cost Total: ₱{(line.quantity * line.costRate).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Total Client Amount:</span>
                <span className="text-blue-700">₱{selectedQuote.totalClientAmount.toLocaleString()}</span>
              </div>
              {user.role === 'fd' && selectedQuote.totalCostAmount !== undefined && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Cost:</span>
                    <span className="text-orange-600">₱{selectedQuote.totalCostAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span>Overall Margin:</span>
                    <span
                      className="text-xl"
                      style={{
                        color:
                          (selectedQuote.totalMarginPct || 0) > 30
                            ? '#10B981'
                            : (selectedQuote.totalMarginPct || 0) > 15
                            ? '#F59E0B'
                            : '#EF4444',
                      }}
                    >
                      {selectedQuote.totalMarginPct?.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {canApprove && (
            <Button className="w-full" onClick={() => handleApproveQuote(selectedQuote.id)} style={{ backgroundColor: '#10B981' }}>
              Approve Quote (FD)
            </Button>
          )}

          {selectedQuote.fdApprovedBy && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <p className="text-green-800">
                <strong>Approved by {selectedQuote.fdApprovedBy}</strong> on{' '}
                {selectedQuote.fdApprovedAt?.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rate Advisor wizard
  if (showRateAdvisor) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl" style={{ color: COLORS.primary }}>
            AI Rate Advisor
          </h2>
          <RateAdvisorWizard
            userRole={user.role}
            onApplyRecommendations={handleApplyRateAdvisorRecommendations}
            onCancel={() => setShowRateAdvisor(false)}
          />
        </div>
      </div>
    );
  }

  // Quote builder
  if (showQuoteBuilder) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-5xl mx-auto space-y-4">
          <h2 className="text-2xl" style={{ color: COLORS.primary }}>
            New Project Quote
          </h2>
          <ProjectQuoteBuilder
            userRole={user.role}
            availableRateCards={rateCards}
            onSave={handleSaveQuote}
            onCancel={() => {
              setShowQuoteBuilder(false);
              setQuoteLinesBuffer([]);
            }}
            onAskRateAdvisor={() => {
              setShowQuoteBuilder(false);
              setShowRateAdvisor(true);
            }}
          />
        </div>
      </div>
    );
  }

  // Main dashboard
  const draftCount = quotes.filter((q) => q.status === 'draft').length;
  const approvedCount = quotes.filter((q) => q.status === 'approved').length;
  const totalValue = quotes.reduce((sum, q) => sum + q.totalClientAmount, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl" style={{ color: COLORS.primary }}>
                Procure
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.name} • {user.role === 'am' ? 'Account Manager' : 'Finance Director'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setUser(null)}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="rates">Rate Cards</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-xl" style={{ color: COLORS.primary }}>
              Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#6B7280' }}>
                    {draftCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Draft Quotes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#10B981' }}>
                    {approvedCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: COLORS.primary }}>
                    ₱{(totalValue / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Value</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => setShowQuoteBuilder(true)} style={{ backgroundColor: COLORS.primary }}>
                    + New Project Quote
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setShowRateAdvisor(true)}>
                    🤖 Ask Rate Advisor
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quotes.slice(0, 3).map((quote) => (
                      <div key={quote.id} className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => setSelectedQuote(quote)}>
                        <div>
                          <div className="text-sm font-medium">{quote.clientName}</div>
                          <div className="text-xs text-muted-foreground">{quote.quoteCode}</div>
                        </div>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${statusColors[quote.status]}20`,
                            color: statusColors[quote.status],
                          }}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: COLORS.primary }}>
                Project Quotes
              </h2>
              <Button size="sm" onClick={() => setShowQuoteBuilder(true)} style={{ backgroundColor: COLORS.primary }}>
                + New Quote
              </Button>
            </div>

            <div className="space-y-3">
              {quotes.map((quote) => (
                <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedQuote(quote)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{quote.clientName}</CardTitle>
                        <CardDescription className="text-xs">
                          {quote.quoteCode} • {quote.campaignType}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[quote.status]}20`,
                          color: statusColors[quote.status],
                        }}
                      >
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Value</div>
                        <div className="text-lg" style={{ color: COLORS.primary }}>
                          ₱{quote.totalClientAmount.toLocaleString()}
                        </div>
                      </div>
                      {user.role === 'fd' && quote.totalMarginPct !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Margin</div>
                          <div
                            className="text-lg"
                            style={{
                              color: quote.totalMarginPct > 30 ? '#10B981' : quote.totalMarginPct > 15 ? '#F59E0B' : '#EF4444',
                            }}
                          >
                            {quote.totalMarginPct.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rate Cards Tab */}
          <TabsContent value="rates">
            <RateCardManager rateCards={rateCards} userRole={user.role} onSelect={(card) => console.log('Selected:', card)} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
