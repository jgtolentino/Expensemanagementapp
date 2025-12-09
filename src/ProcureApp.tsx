import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { ShoppingCart, Package, FileText, TrendingUp, Search, Filter, Star } from 'lucide-react';

export default function ProcureApp() {
  const [activeView, setActiveView] = useState<'catalog' | 'requisitions' | 'suppliers' | 'analytics'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const catalogItems = [
    { id: 'CAT-001', name: 'Professional Photography Services', supplier: 'Creative Studios PH', rate: 8500, unit: 'per day', category: 'Creative Services', rating: 4.8 },
    { id: 'CAT-002', name: 'Video Production (Corporate)', supplier: 'FilmWorks Manila', rate: 45000, unit: 'per project', category: 'Creative Services', rating: 4.9 },
    { id: 'CAT-003', name: 'Graphic Design (Senior)', supplier: 'Design Hub', rate: 3500, unit: 'per hour', category: 'Creative Services', rating: 4.7 },
    { id: 'CAT-004', name: 'Event Management Services', supplier: 'EventCo', rate: 125000, unit: 'per event', category: 'Events', rating: 4.6 },
    { id: 'CAT-005', name: 'Digital Printing (Large Format)', supplier: 'PrintMax', rate: 850, unit: 'per sqm', category: 'Production', rating: 4.5 },
    { id: 'CAT-006', name: 'Social Media Management', supplier: 'SocialBuzz', rate: 65000, unit: 'per month', category: 'Digital Marketing', rating: 4.8 },
  ];

  const requisitions = [
    { id: 'PR-2024-001', title: 'Q4 Campaign Photography', supplier: 'Creative Studios PH', amount: 68000, status: 'approved', date: '2024-12-01' },
    { id: 'PR-2024-002', title: 'Brand Video Production', supplier: 'FilmWorks Manila', amount: 180000, status: 'pending_approval', date: '2024-12-05' },
    { id: 'PR-2024-003', title: 'Event Collaterals Printing', supplier: 'PrintMax', amount: 24500, status: 'in_review', date: '2024-12-06' },
    { id: 'PR-2024-004', title: 'Social Media Package (3 months)', supplier: 'SocialBuzz', amount: 195000, status: 'draft', date: '2024-12-07' },
  ];

  const suppliers = [
    { id: 'SUP-001', name: 'Creative Studios PH', category: 'Creative Services', rating: 4.8, contracts: 24, spend: 1250000 },
    { id: 'SUP-002', name: 'FilmWorks Manila', category: 'Creative Services', rating: 4.9, contracts: 18, spend: 890000 },
    { id: 'SUP-003', name: 'Design Hub', category: 'Creative Services', rating: 4.7, contracts: 32, spend: 678000 },
    { id: 'SUP-004', name: 'EventCo', category: 'Events', rating: 4.6, contracts: 12, spend: 1450000 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      pending_approval: 'secondary',
      in_review: 'outline',
      draft: 'outline',
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: '#10B981',
      pending_approval: '#F59E0B',
      in_review: '#3B82F6',
      draft: '#6B7280',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DC2626', color: 'white' }}>
                🛒
              </div>
              <div>
                <h1 className="text-2xl" style={{ color: '#DC2626' }}>Procure</h1>
                <p className="text-sm text-slate-500">SAP Ariba-style Procurement & Internal Shop</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" style={{ backgroundColor: '#DC2626' }}>
                New Requisition
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('catalog')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'catalog'
                  ? 'border-[#DC2626] text-[#DC2626]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Catalog
            </button>
            <button
              onClick={() => setActiveView('requisitions')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'requisitions'
                  ? 'border-[#DC2626] text-[#DC2626]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Requisitions
            </button>
            <button
              onClick={() => setActiveView('suppliers')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'suppliers'
                  ? 'border-[#DC2626] text-[#DC2626]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Suppliers
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'analytics'
                  ? 'border-[#DC2626] text-[#DC2626]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Spend Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeView === 'catalog' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search catalog (services, suppliers, categories)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </div>
                    </div>
                    <CardDescription>{item.supplier}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl" style={{ color: '#DC2626' }}>
                          ₱{item.rate.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500">{item.unit}</span>
                      </div>
                      <Button className="w-full" size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'requisitions' && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requisitions</CardTitle>
              <CardDescription>Track your procurement requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requisitions.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{req.title}</h3>
                          <Badge variant={getStatusBadge(req.status) as any}>
                            <span style={{ color: getStatusColor(req.status) }}>●</span>
                            <span className="ml-1">{req.status.replace(/_/g, ' ')}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>PR #{req.id}</span>
                          <span>•</span>
                          <span>{req.supplier}</span>
                          <span>•</span>
                          <span>{new Date(req.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl mb-2">₱{req.amount.toLocaleString()}</div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'suppliers' && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>Approved supplier directory and rate cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{supplier.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <Badge variant="outline">{supplier.category}</Badge>
                          <span>{supplier.contracts} contracts</span>
                          <span>•</span>
                          <span>Total spend: ₱{(supplier.spend / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Rate Card</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Spend Analytics</CardTitle>
              <CardDescription>Procurement insights and spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Spend analytics dashboard</p>
                <p className="text-sm">Category breakdown, supplier performance, savings opportunities</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
