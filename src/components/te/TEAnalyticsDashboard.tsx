import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface AnalyticsTile {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface AdvanceAging {
  bucket: string;
  count: number;
  amount: number;
  color: string;
}

export function TEAnalyticsDashboard() {
  // Mock data - in production, this would come from API calling analytics views
  const tiles: AnalyticsTile[] = [
    {
      label: 'Total T&E Spend (YTD)',
      value: '₱1,247,350',
      change: '+12%',
      trend: 'up',
      color: '#0070F2',
    },
    {
      label: 'Outstanding Cash Advances',
      value: '₱156,000',
      change: '-8%',
      trend: 'down',
      color: '#D4AC0D',
    },
    {
      label: 'Pending Approvals',
      value: '23',
      color: '#FF6B35',
    },
    {
      label: 'Avg. Processing Time',
      value: '2.4 days',
      change: '-0.3d',
      trend: 'down',
      color: '#10B981',
    },
  ];

  const categorySpend: CategorySpend[] = [
    { category: 'Transportation', amount: 450000, percentage: 36, color: '#0070F2' },
    { category: 'Accommodation', amount: 375000, percentage: 30, color: '#7C3AED' },
    { category: 'Meals', amount: 250000, percentage: 20, color: '#10B981' },
    { category: 'Entertainment', amount: 125000, percentage: 10, color: '#F59E0B' },
    { category: 'Other', amount: 47350, percentage: 4, color: '#6B7280' },
  ];

  const advanceAging: AdvanceAging[] = [
    { bucket: '0-30 days', count: 12, amount: 85000, color: '#10B981' },
    { bucket: '31-60 days', count: 5, amount: 42000, color: '#F59E0B' },
    { bucket: '61-90 days', count: 2, amount: 18000, color: '#FF6B35' },
    { bucket: '90+ days', count: 1, amount: 11000, color: '#EF4444' },
  ];

  const maxCategoryAmount = Math.max(...categorySpend.map((c) => c.amount));

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">{tile.label}</div>
              <div className="text-2xl" style={{ color: tile.color }}>
                {tile.value}
              </div>
              {tile.change && (
                <div
                  className="text-xs mt-1"
                  style={{
                    color: tile.trend === 'up' ? '#10B981' : tile.trend === 'down' ? '#EF4444' : '#6B7280',
                  }}
                >
                  {tile.change} vs last period
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category (YTD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySpend.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-muted-foreground">
                    ₱{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${(cat.amount / maxCategoryAmount) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cash Advance Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Advance Aging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {advanceAging.map((bucket) => (
              <div
                key={bucket.bucket}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: `${bucket.color}10` }}
              >
                <div>
                  <div className="font-medium">{bucket.bucket}</div>
                  <div className="text-sm text-muted-foreground">{bucket.count} advances</div>
                </div>
                <div className="text-right">
                  <div className="text-lg" style={{ color: bucket.color }}>
                    ₱{bucket.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly T&E Spend Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {[
              { month: 'Jan', amount: 95000 },
              { month: 'Feb', amount: 110000 },
              { month: 'Mar', amount: 105000 },
              { month: 'Apr', amount: 125000 },
              { month: 'May', amount: 118000 },
              { month: 'Jun', amount: 132000 },
              { month: 'Jul', amount: 140000 },
              { month: 'Aug', amount: 138000 },
              { month: 'Sep', amount: 145000 },
              { month: 'Oct', amount: 152000 },
              { month: 'Nov', amount: 148000 },
              { month: 'Dec', amount: 139350 },
            ].map((data, idx) => {
              const maxAmount = 152000;
              const heightPercent = (data.amount / maxAmount) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ₱{data.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Spenders */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spenders (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Maria Santos', department: 'Sales', amount: 28500, reports: 4 },
              { name: 'Juan dela Cruz', department: 'Marketing', amount: 24200, reports: 3 },
              { name: 'Lisa Chen', department: 'Sales', amount: 19800, reports: 2 },
              { name: 'Miguel Reyes', department: 'Operations', amount: 17300, reports: 3 },
              { name: 'Sarah Johnson', department: 'Business Dev', amount: 15900, reports: 2 },
            ].map((emp, idx) => (
              <div key={emp.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: idx === 0 ? '#0070F2' : '#6B7280' }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {emp.department} • {emp.reports} reports
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₱{emp.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
