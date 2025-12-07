import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface UtilizationData {
  category: string;
  totalItems: number;
  checkedOut: number;
  utilizationPercent: number;
  color: string;
}

interface MaintenanceAlert {
  itemName: string;
  itemCode: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  reportedDate: string;
}

export function GearAnalyticsDashboard() {
  // Mock data - in production, this would come from API
  const kpiData = [
    { label: 'Total Equipment', value: '247', change: '+12', trend: 'up', color: '#7C3AED' },
    { label: 'Currently Checked Out', value: '89', change: '36%', color: '#F59E0B' },
    { label: 'In Maintenance', value: '14', change: '-3', trend: 'down', color: '#EF4444' },
    { label: 'Portfolio Value', value: '₱2.4M', change: '+8%', trend: 'up', color: '#10B981' },
  ];

  const utilizationData: UtilizationData[] = [
    { category: 'Cameras', totalItems: 45, checkedOut: 32, utilizationPercent: 71, color: '#7C3AED' },
    { category: 'Lighting', totalItems: 62, checkedOut: 38, utilizationPercent: 61, color: '#3B82F6' },
    { category: 'Audio', totalItems: 38, checkedOut: 19, utilizationPercent: 50, color: '#10B981' },
    { category: 'Computers', totalItems: 52, checkedOut: 45, utilizationPercent: 87, color: '#F59E0B' },
    { category: 'Accessories', totalItems: 50, checkedOut: 15, utilizationPercent: 30, color: '#6B7280' },
  ];

  const maintenanceAlerts: MaintenanceAlert[] = [
    { itemName: 'Canon EOS R5', itemCode: 'CAM-045', issueType: 'Sensor cleaning', severity: 'medium', reportedDate: '2025-12-05' },
    { itemName: 'MacBook Pro 16"', itemCode: 'COMP-012', issueType: 'Battery replacement', severity: 'high', reportedDate: '2025-12-04' },
    { itemName: 'Sony A7 III', itemCode: 'CAM-023', issueType: 'Firmware update', severity: 'low', reportedDate: '2025-12-03' },
  ];

  const topUsers = [
    { name: 'Sarah Johnson', department: 'Creative', checkouts: 24, items: 'Cameras, Lighting' },
    { name: 'Miguel Reyes', department: 'Production', checkouts: 19, items: 'Audio, Cameras' },
    { name: 'Lisa Chen', department: 'Events', checkouts: 16, items: 'Lighting, Audio' },
    { name: 'Juan Santos', department: 'Video', checkouts: 14, items: 'Cameras, Computers' },
  ];

  const maxUtilization = Math.max(...utilizationData.map((d) => d.utilizationPercent));

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-2xl" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              {kpi.change && (
                <div
                  className="text-xs mt-1"
                  style={{
                    color: kpi.trend === 'up' ? '#10B981' : kpi.trend === 'down' ? '#EF4444' : '#6B7280',
                  }}
                >
                  {kpi.change} vs last month
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {utilizationData.map((data) => (
              <div key={data.category} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{data.category}</span>
                  <span className="text-muted-foreground">
                    {data.checkedOut}/{data.totalItems} ({data.utilizationPercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${(data.utilizationPercent / maxUtilization) * 100}%`,
                      backgroundColor: data.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceAlerts.map((alert, idx) => {
              const severityColors = {
                low: { bg: '#10B98120', text: '#10B981' },
                medium: { bg: '#F59E0B20', text: '#F59E0B' },
                high: { bg: '#EF444420', text: '#EF4444' },
              };
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: severityColors[alert.severity].bg }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{alert.itemName}</div>
                      <div className="text-sm text-muted-foreground">{alert.itemCode}</div>
                      <div className="text-sm mt-1">{alert.issueType}</div>
                    </div>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: severityColors[alert.severity].bg,
                        color: severityColors[alert.severity].text,
                      }}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{alert.reportedDate}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Checkout Activity (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {[
              { month: 'Jul', checkouts: 142 },
              { month: 'Aug', checkouts: 156 },
              { month: 'Sep', checkouts: 138 },
              { month: 'Oct', checkouts: 167 },
              { month: 'Nov', checkouts: 189 },
              { month: 'Dec', checkouts: 178 },
            ].map((data, idx) => {
              const maxCheckouts = 189;
              const heightPercent = (data.checkouts / maxCheckouts) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer relative group"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {data.checkouts} checkouts
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Users & Underutilized Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Users (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((user, idx) => (
                <div key={user.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: idx === 0 ? '#7C3AED' : '#6B7280' }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.department} • {user.items}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.checkouts}</div>
                    <div className="text-xs text-muted-foreground">checkouts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Underutilized Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Rode Wireless Go II', code: 'AUD-089', lastCheckout: '45 days ago', utilization: '12%' },
                { name: 'Godox SL-60W', code: 'LGT-034', lastCheckout: '38 days ago', utilization: '18%' },
                { name: 'DJI Ronin SC', code: 'ACC-102', lastCheckout: '29 days ago', utilization: '22%' },
                { name: 'Blackmagic Pocket 4K', code: 'CAM-067', lastCheckout: '24 days ago', utilization: '28%' },
              ].map((item) => (
                <div key={item.code} className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.code}</div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                      {item.utilization}
                    </Badge>
                  </div>
                  <div className="text-xs text-yellow-700 mt-2">Last checkout: {item.lastCheckout}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
