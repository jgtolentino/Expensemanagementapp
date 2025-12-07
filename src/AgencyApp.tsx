import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Clock, 
  BarChart3, 
  Sparkles,
  Home
} from 'lucide-react';

export default function AgencyApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#F2F7F2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: '#EC4899', color: 'white' }}
              >
                🎨
              </div>
              <div>
                <h1 className="text-xl" style={{ color: '#EC4899' }}>
                  Agency Creative Workroom
                </h1>
                <p className="text-sm text-gray-500">
                  Marketing workspace powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">TBWA Agency Databank</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'dashboard' ? '#EC4899' : 'transparent',
                  color: activeTab === 'dashboard' ? '#EC4899' : undefined
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="clients"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'clients' ? '#EC4899' : 'transparent',
                  color: activeTab === 'clients' ? '#EC4899' : undefined
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'campaigns' ? '#EC4899' : 'transparent',
                  color: activeTab === 'campaigns' ? '#EC4899' : undefined
                }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger 
                value="artifacts"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'artifacts' ? '#EC4899' : 'transparent',
                  color: activeTab === 'artifacts' ? '#EC4899' : undefined
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Artifacts
              </TabsTrigger>
              <TabsTrigger 
                value="rates"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'rates' ? '#EC4899' : 'transparent',
                  color: activeTab === 'rates' ? '#EC4899' : undefined
                }}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Rates & Budgets
              </TabsTrigger>
              <TabsTrigger 
                value="timesheets"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'timesheets' ? '#EC4899' : 'transparent',
                  color: activeTab === 'timesheets' ? '#EC4899' : undefined
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Timesheets
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3"
                style={{ 
                  borderColor: activeTab === 'analytics' ? '#EC4899' : 'transparent',
                  color: activeTab === 'analytics' ? '#EC4899' : undefined
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Active Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl" style={{ color: '#EC4899' }}>32</div>
                  <p className="text-xs text-gray-500 mt-1">+3 this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl" style={{ color: '#EC4899' }}>18</div>
                  <p className="text-xs text-gray-500 mt-1">5 active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Revenue YTD</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl" style={{ color: '#EC4899' }}>₱85M</div>
                  <p className="text-xs text-gray-500 mt-1">+12% vs last year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl" style={{ color: '#EC4899' }}>78%</div>
                  <p className="text-xs text-gray-500 mt-1">team average</p>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Message */}
            <Card className="border-2 border-dashed" style={{ borderColor: '#EC4899' }}>
              <CardContent className="py-12">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: '#FDF2F8' }}
                  >
                    🎨
                  </div>
                  <h3 className="text-xl mb-2" style={{ color: '#EC4899' }}>
                    Agency Creative Workroom
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete marketing agency workspace with campaigns, creative artifacts, 
                    timesheets, capacity planning, and AI-powered assistance.
                  </p>
                  
                  <div className="space-y-3 max-w-md mx-auto text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                        ✓
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Database Ready:</strong> 15 tables, 6 views, 50+ indexes deployed
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                        ✓
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Integration Ready:</strong> Links to Procure, Finance PPM, T&E, Gearroom
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                        ⏳
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Next:</strong> Seed demo data (30 clients, 150 campaigns, 800 artifacts)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}>
                        ○
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          <strong>Coming Soon:</strong> Full UI implementation with 8 routes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      size="lg"
                      style={{ backgroundColor: '#EC4899' }}
                      className="hover:opacity-90"
                    >
                      View Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4" style={{ borderColor: '#EC4899', borderWidth: '2px' }}>
              <CardHeader style={{ backgroundColor: '#FDF2F8' }}>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#EC4899' }}>
                  <Sparkles className="w-5 h-5" />
                  <span>AI Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                      style={{ backgroundColor: '#FDF2F8' }}
                    >
                      🤖
                    </div>
                    <p className="text-sm text-gray-600">
                      AI assistant ready to help with campaigns, budgets, and creative work
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Quick Actions</p>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      📊 Summarize this month
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      💰 Suggest campaign rates
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      📝 Draft a brief
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Powered by RAG with knowledge base + live financial data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}