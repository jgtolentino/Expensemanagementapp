import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import RateCardProApp from './RateCardProApp';
import TEApp from './TEApp';
import GearApp from './GearApp';
import FinancePPMApp from './FinancePPMApp';
import ProcureApp from './ProcureApp';
import CreativeWorkroomApp from './CreativeWorkroomApp';
import WikiDocsApp from './WikiDocsApp';
import BIApp from './BIApp';
import LoginScreen from './components/LoginScreen';
import UserMenu from './components/UserMenu';
import { AuthProvider, useAuth } from './lib/auth-context';

type AppSelection = 'launcher' | 'ratecard' | 'te' | 'gear' | 'financeppm' | 'procure' | 'creative' | 'wiki' | 'bi';

function AppContent() {
  const [selectedApp, setSelectedApp] = useState<AppSelection>('launcher');
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (selectedApp === 'ratecard') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <RateCardProApp />
      </div>
    );
  }

  if (selectedApp === 'te') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <TEApp />
      </div>
    );
  }

  if (selectedApp === 'gear') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <GearApp />
      </div>
    );
  }

  if (selectedApp === 'financeppm') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <FinancePPMApp />
      </div>
    );
  }

  if (selectedApp === 'procure') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <ProcureApp />
      </div>
    );
  }

  if (selectedApp === 'creative') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <CreativeWorkroomApp />
      </div>
    );
  }

  if (selectedApp === 'wiki') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <WikiDocsApp />
      </div>
    );
  }

  if (selectedApp === 'bi') {
    return (
      <div>
        <Button
          className="fixed top-4 left-4 z-20 bg-white"
          variant="outline"
          onClick={() => setSelectedApp('launcher')}
        >
          ← All Apps
        </Button>
        <div className="fixed top-4 right-4 z-20">
          <UserMenu />
        </div>
        <BIApp />
      </div>
    );
  }

  // App Launcher
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-20">
        <UserMenu />
      </div>
      
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl text-slate-800 mb-2">TBWA Agency Databank</h1>
          <p className="text-slate-600">Select an application to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rate Card Pro */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#386641]"
            onClick={() => setSelectedApp('ratecard')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#386641', color: 'white' }}>
                📊
              </div>
              <CardTitle className="text-2xl" style={{ color: '#386641' }}>
                Rate Card Pro
              </CardTitle>
              <CardDescription>Quote & proposal management system</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Dual-role workflow (AM/FD)</li>
                <li>✓ Quote creation & approval</li>
                <li>✓ Line item management</li>
                <li>✓ Dashboard analytics</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#386641' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Travel & Expense */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#0070F2]"
            onClick={() => setSelectedApp('te')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#0070F2', color: 'white' }}>
                ✈️
              </div>
              <CardTitle className="text-2xl" style={{ color: '#0070F2' }}>
                Travel & Expense
              </CardTitle>
              <CardDescription>SAP Concur-style expense management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Expense report creation</li>
                <li>✓ Cash advance requests</li>
                <li>✓ Settlement workflows</li>
                <li>✓ SAP-style analytics</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#0070F2' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Gearroom */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#7C3AED]"
            onClick={() => setSelectedApp('gear')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#7C3AED', color: 'white' }}>
                📦
              </div>
              <CardTitle className="text-2xl" style={{ color: '#7C3AED' }}>
                Gearroom
              </CardTitle>
              <CardDescription>Cheqroom-style equipment management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Equipment catalog & tracking</li>
                <li>✓ Check-out/check-in workflows</li>
                <li>✓ Maintenance tracking</li>
                <li>✓ Utilization analytics</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#7C3AED' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Finance PPM */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#D97706]"
            onClick={() => setSelectedApp('financeppm')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#D97706', color: 'white' }}>
                💼
              </div>
              <CardTitle className="text-2xl" style={{ color: '#D97706' }}>
                Finance PPM
              </CardTitle>
              <CardDescription>Finance Clarity project portfolio workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Portfolio management</li>
                <li>✓ Resource planning & timesheets</li>
                <li>✓ Financial plans & contracts</li>
                <li>✓ Risk tracking & dashboards</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#D97706' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Procure */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#DC2626]"
            onClick={() => setSelectedApp('procure')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#DC2626', color: 'white' }}>
                🛒
              </div>
              <CardTitle className="text-2xl" style={{ color: '#DC2626' }}>
                Procure
              </CardTitle>
              <CardDescription>SAP Ariba-style procurement & internal shop</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Supplier catalog & rate cards</li>
                <li>✓ Purchase requisitions</li>
                <li>✓ Approval workflows</li>
                <li>✓ Spend analytics</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#DC2626' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Creative Workroom */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#EC4899]"
            onClick={() => setSelectedApp('creative')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                🎨
              </div>
              <CardTitle className="text-2xl" style={{ color: '#EC4899' }}>
                Creative Workroom
              </CardTitle>
              <CardDescription>Creative project collaboration workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Brief & concept management</li>
                <li>✓ Asset library & versioning</li>
                <li>✓ Review & approval workflows</li>
                <li>✓ Campaign tracking</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#EC4899' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* Wiki/Docs */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#0891B2]"
            onClick={() => setSelectedApp('wiki')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#0891B2', color: 'white' }}>
                📚
              </div>
              <CardTitle className="text-2xl" style={{ color: '#0891B2' }}>
                Wiki & Docs
              </CardTitle>
              <CardDescription>Confluence/Notion-style knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Workspace & page hierarchy</li>
                <li>✓ Rich text editing & templates</li>
                <li>✓ Search & tagging</li>
                <li>✓ Collaboration & comments</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#0891B2' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>

          {/* BI */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-[#FF9900]"
            onClick={() => setSelectedApp('bi')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ backgroundColor: '#FF9900', color: 'white' }}>
                📈
              </div>
              <CardTitle className="text-2xl" style={{ color: '#FF9900' }}>
                BI
              </CardTitle>
              <CardDescription>Business Intelligence dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Data visualization</li>
                <li>✓ Key performance indicators</li>
                <li>✓ Reporting & analytics</li>
                <li>✓ Custom dashboards</li>
              </ul>
              <Button className="w-full mt-4" style={{ backgroundColor: '#FF9900' }}>
                Launch App →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Coming soon: Scout (Strategic Intelligence)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}