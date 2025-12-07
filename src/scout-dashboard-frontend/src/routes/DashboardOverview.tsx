import { useQuery } from '@tanstack/react-query'
import { invokeScoutFunction } from '@/lib/supabase'
import KpiCard from '@/components/charts/KpiCard'
import { TrendingUp, ShoppingCart, Users, Store } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface DashboardData {
  overview: {
    total_baskets: number
    total_revenue: number
    unique_customers: number
    active_stores: number
    avg_basket_value: number
    avg_items_per_basket: number
    avg_duration_seconds: number
  }
  trends: {
    revenue_growth_pct: number
    basket_growth_pct: number
    customer_growth_pct: number
  }
  top_categories: Array<{
    category: string
    revenue: number
    share_pct: number
  }>
  top_regions: Array<{
    region: string
    revenue: number
    basket_count: number
  }>
  top_products: Array<{
    product_name: string
    brand_name: string
    revenue: number
    units_sold: number
  }>
}

export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data, error } = await invokeScoutFunction<DashboardData>('scout-dashboard', {
        method: 'GET',
      })
      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">
          Error loading dashboard: {error?.message || 'Unknown error'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Sari-sari store performance at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(data.overview.total_revenue)}
          change={data.trends.revenue_growth_pct}
          icon={TrendingUp}
          trend="up"
        />
        <KpiCard
          title="Total Baskets"
          value={formatNumber(data.overview.total_baskets)}
          change={data.trends.basket_growth_pct}
          icon={ShoppingCart}
          trend="up"
        />
        <KpiCard
          title="Unique Customers"
          value={formatNumber(data.overview.unique_customers)}
          change={data.trends.customer_growth_pct}
          icon={Users}
          trend="up"
        />
        <KpiCard
          title="Active Stores"
          value={formatNumber(data.overview.active_stores)}
          icon={Store}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Avg Basket Value</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(data.overview.avg_basket_value)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Avg Items per Basket</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data.overview.avg_items_per_basket.toFixed(1)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Avg Duration</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(data.overview.avg_duration_seconds / 60)} min
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Categories</h2>
        <div className="space-y-3">
          {data.top_categories.slice(0, 5).map((category) => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {category.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {category.share_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.share_pct}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-sm font-semibold text-gray-900">
                {formatCurrency(category.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Regions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Regions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                  Region
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                  Revenue
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                  Baskets
                </th>
              </tr>
            </thead>
            <tbody>
              {data.top_regions.slice(0, 5).map((region) => (
                <tr key={region.region} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {region.region}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {formatCurrency(region.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {formatNumber(region.basket_count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                  Brand
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                  Revenue
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                  Units Sold
                </th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.slice(0, 5).map((product) => (
                <tr key={product.product_name} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {product.product_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {product.brand_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {formatNumber(product.units_sold)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}