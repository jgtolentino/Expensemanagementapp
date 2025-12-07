import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ItemCatalog, GearItem } from './components/gear/ItemCatalog';
import { CheckoutForm, Checkout } from './components/gear/CheckoutForm';
import { GearAnalyticsDashboard } from './components/gear/GearAnalyticsDashboard';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'custodian' | 'admin';
  department: string;
};

export default function GearApp() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Mock data
  const [items, setItems] = useState<GearItem[]>([
    {
      id: 'GEAR-001',
      name: 'Canon EOS R5',
      itemCode: 'CAM-045',
      category: 'Cameras',
      status: 'available',
      location: 'Main Studio',
      purchaseDate: '2024-03-15',
      purchasePrice: 185000,
      currentValue: 165000,
      serialNumber: 'CR5-2024-0045',
      description: 'Full-frame mirrorless camera, 45MP',
    },
    {
      id: 'GEAR-002',
      name: 'Sony A7 III',
      itemCode: 'CAM-023',
      category: 'Cameras',
      status: 'checked_out',
      location: 'Main Studio',
      purchaseDate: '2023-08-10',
      purchasePrice: 95000,
      currentValue: 75000,
      checkedOutTo: 'Sarah Johnson',
      dueDate: '2025-12-15',
    },
    {
      id: 'GEAR-003',
      name: 'MacBook Pro 16"',
      itemCode: 'COMP-012',
      category: 'Computers',
      status: 'checked_out',
      location: 'Edit Suite',
      purchaseDate: '2024-01-20',
      purchasePrice: 145000,
      currentValue: 125000,
      checkedOutTo: 'Miguel Reyes',
      dueDate: '2025-12-10',
    },
    {
      id: 'GEAR-004',
      name: 'Godox SL-60W',
      itemCode: 'LGT-034',
      category: 'Lighting',
      status: 'available',
      location: 'Lighting Room',
      purchaseDate: '2023-11-05',
      purchasePrice: 12500,
      currentValue: 10000,
    },
    {
      id: 'GEAR-005',
      name: 'Rode Wireless Go II',
      itemCode: 'AUD-089',
      category: 'Audio',
      status: 'available',
      location: 'Audio Rack',
      purchaseDate: '2024-05-12',
      purchasePrice: 15000,
      currentValue: 13500,
    },
    {
      id: 'GEAR-006',
      name: 'DJI Ronin SC',
      itemCode: 'ACC-102',
      category: 'Accessories',
      status: 'in_maintenance',
      location: 'Maintenance',
      purchaseDate: '2023-06-18',
      purchasePrice: 22000,
      currentValue: 16000,
    },
    {
      id: 'GEAR-007',
      name: 'Blackmagic Pocket 4K',
      itemCode: 'CAM-067',
      category: 'Cameras',
      status: 'available',
      location: 'Main Studio',
      purchaseDate: '2023-09-22',
      purchasePrice: 65000,
      currentValue: 52000,
    },
    {
      id: 'GEAR-008',
      name: 'Aputure 120d II',
      itemCode: 'LGT-018',
      category: 'Lighting',
      status: 'reserved',
      location: 'Lighting Room',
      purchaseDate: '2024-02-14',
      purchasePrice: 28000,
      currentValue: 25000,
      checkedOutTo: 'Lisa Chen (Reserved)',
      dueDate: '2025-12-20',
    },
  ]);

  const [checkouts, setCheckouts] = useState<Checkout[]>([
    {
      id: 'CHK-001',
      itemId: 'GEAR-002',
      itemName: 'Sony A7 III',
      checkedOutTo: 'Sarah Johnson',
      checkedOutBy: 'Admin User',
      checkoutDate: '2025-12-01',
      dueDate: '2025-12-15',
      status: 'active',
      purpose: 'Client photoshoot - Corporate portraits',
    },
    {
      id: 'CHK-002',
      itemId: 'GEAR-003',
      itemName: 'MacBook Pro 16"',
      checkedOutTo: 'Miguel Reyes',
      checkedOutBy: 'Admin User',
      checkoutDate: '2025-11-28',
      dueDate: '2025-12-10',
      status: 'active',
      purpose: 'Video editing - Campaign footage',
      depositAmount: 5000,
      depositStatus: 'held',
    },
  ]);

  const COLORS = {
    primary: '#7C3AED',
    bg: '#F9FAFB',
    accent: '#F59E0B',
  };

  const statusColors: Record<string, string> = {
    available: '#10B981',
    checked_out: '#F59E0B',
    in_maintenance: '#EF4444',
    reserved: '#3B82F6',
    retired: '#6B7280',
    active: '#F59E0B',
    returned: '#10B981',
    overdue: '#EF4444',
  };

  const handleLogin = (role: 'user' | 'custodian' | 'admin') => {
    const users = {
      user: {
        id: 'user1',
        name: 'Regular User',
        email: 'user@company.com',
        role: 'user' as const,
        department: 'Creative',
      },
      custodian: {
        id: 'cust1',
        name: 'Equipment Custodian',
        email: 'custodian@company.com',
        role: 'custodian' as const,
        department: 'Operations',
      },
      admin: {
        id: 'admin1',
        name: 'Gear Admin',
        email: 'admin@company.com',
        role: 'admin' as const,
        department: 'IT',
      },
    };
    setUser(users[role]);
  };

  const handleCheckout = (item: GearItem) => {
    setSelectedItem(item);
    setShowCheckoutForm(true);
  };

  const handleSaveCheckout = (checkoutData: Partial<Checkout>) => {
    if (!selectedItem || !user) return;

    const newCheckout: Checkout = {
      id: `CHK-${String(checkouts.length + 1).padStart(3, '0')}`,
      itemId: checkoutData.itemId || selectedItem.id,
      itemName: checkoutData.itemName || selectedItem.name,
      checkedOutTo: checkoutData.checkedOutTo || '',
      checkedOutBy: user.name,
      checkoutDate: checkoutData.checkoutDate || new Date().toISOString().split('T')[0],
      dueDate: checkoutData.dueDate || '',
      status: 'active',
      purpose: checkoutData.purpose || '',
      notes: checkoutData.notes,
      depositAmount: checkoutData.depositAmount,
      depositStatus: checkoutData.depositStatus,
    };

    setCheckouts([newCheckout, ...checkouts]);

    // Update item status
    setItems(
      items.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: 'checked_out' as const,
              checkedOutTo: newCheckout.checkedOutTo,
              dueDate: newCheckout.dueDate,
            }
          : item
      )
    );

    setShowCheckoutForm(false);
    setSelectedItem(null);
    setActiveTab('checkouts');
  };

  const handleReturnItem = (checkoutId: string) => {
    const checkout = checkouts.find((c) => c.id === checkoutId);
    if (!checkout) return;

    // Update checkout status
    setCheckouts(
      checkouts.map((c) =>
        c.id === checkoutId
          ? { ...c, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );

    // Update item status
    setItems(
      items.map((item) =>
        item.id === checkout.itemId
          ? { ...item, status: 'available' as const, checkedOutTo: undefined, dueDate: undefined }
          : item
      )
    );
  };

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.bg }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: COLORS.primary }}>
              Gearroom
            </CardTitle>
            <CardDescription>Cheqroom-style equipment management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">Demo Login:</p>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => handleLogin('user')} style={{ backgroundColor: COLORS.primary }}>
                Regular User
              </Button>
              <Button onClick={() => handleLogin('custodian')} variant="outline">
                Equipment Custodian
              </Button>
              <Button onClick={() => handleLogin('admin')} variant="outline">
                Administrator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Item detail view
  if (selectedItem && !showCheckoutForm) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setSelectedItem(null)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedItem.name}</CardTitle>
                  <CardDescription>{selectedItem.itemCode}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColors[selectedItem.status]}20`,
                    color: statusColors[selectedItem.status],
                  }}
                >
                  {selectedItem.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <div className="font-medium">{selectedItem.category}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <div className="font-medium">{selectedItem.location}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <div>{selectedItem.purchaseDate}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Value:</span>
                  <div>₱{selectedItem.currentValue.toLocaleString()}</div>
                </div>
                {selectedItem.serialNumber && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <div className="font-mono text-sm">{selectedItem.serialNumber}</div>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div className="pt-4 border-t">
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <p className="mt-1">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.checkedOutTo && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-orange-900">
                    <strong>Checked out to:</strong> {selectedItem.checkedOutTo}
                  </div>
                  {selectedItem.dueDate && (
                    <div className="text-orange-700 text-sm mt-1">Due: {selectedItem.dueDate}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedItem.status === 'available' && (user.role === 'custodian' || user.role === 'admin') && (
            <Button className="w-full" onClick={() => setShowCheckoutForm(true)} style={{ backgroundColor: COLORS.primary }}>
              Check Out This Item
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Checkout form view
  if (showCheckoutForm && selectedItem) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl" style={{ color: COLORS.primary }}>
            Check Out Equipment
          </h2>
          <CheckoutForm
            item={selectedItem}
            currentUser={user.name}
            onSave={handleSaveCheckout}
            onCancel={() => {
              setShowCheckoutForm(false);
              setSelectedItem(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Main dashboard
  const availableCount = items.filter((i) => i.status === 'available').length;
  const checkedOutCount = items.filter((i) => i.status === 'checked_out').length;
  const maintenanceCount = items.filter((i) => i.status === 'in_maintenance').length;
  const activeCheckouts = checkouts.filter((c) => c.status === 'active');

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl" style={{ color: COLORS.primary }}>
                Gearroom
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.name} • {user.role === 'admin' ? 'Administrator' : user.role === 'custodian' ? 'Custodian' : 'User'}
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="catalog">Equipment</TabsTrigger>
            <TabsTrigger value="checkouts">Checkouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-xl" style={{ color: COLORS.primary }}>
              Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#10B981' }}>
                    {availableCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#F59E0B' }}>
                    {checkedOutCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Checked Out</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: '#EF4444' }}>
                    {maintenanceCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">In Maintenance</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => setActiveTab('catalog')} style={{ backgroundColor: COLORS.primary }}>
                    Browse Equipment
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('checkouts')}>
                    View Active Checkouts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeCheckouts.slice(0, 3).map((checkout) => (
                      <div key={checkout.id} className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{checkout.itemName}</div>
                          <div className="text-xs text-muted-foreground">{checkout.checkedOutTo}</div>
                        </div>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${statusColors[checkout.status]}20`,
                            color: statusColors[checkout.status],
                          }}
                        >
                          {checkout.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Equipment Catalog Tab */}
          <TabsContent value="catalog">
            <ItemCatalog
              items={items}
              onItemClick={setSelectedItem}
              onCheckout={user.role !== 'user' ? handleCheckout : undefined}
            />
          </TabsContent>

          {/* Checkouts Tab */}
          <TabsContent value="checkouts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: COLORS.primary }}>
                Active Checkouts
              </h2>
            </div>

            <div className="space-y-3">
              {activeCheckouts.map((checkout) => (
                <Card key={checkout.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{checkout.itemName}</CardTitle>
                        <CardDescription className="text-xs">
                          {checkout.id} • Checked out {checkout.checkoutDate}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[checkout.status]}20`,
                          color: statusColors[checkout.status],
                        }}
                      >
                        {checkout.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Checked out to:</span>
                        <div className="font-medium">{checkout.checkedOutTo}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due date:</span>
                        <div className="font-medium">{checkout.dueDate}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Purpose:</span>
                      <p className="text-sm mt-1">{checkout.purpose}</p>
                    </div>
                    {checkout.depositAmount && (
                      <div className="p-2 bg-yellow-50 rounded text-sm">
                        <span className="text-yellow-800">
                          Deposit: ₱{checkout.depositAmount.toLocaleString()} ({checkout.depositStatus})
                        </span>
                      </div>
                    )}
                    {(user.role === 'custodian' || user.role === 'admin') && checkout.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleReturnItem(checkout.id)}
                        style={{ backgroundColor: '#10B981' }}
                      >
                        Mark as Returned
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <GearAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
