import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down'
}

export default function KpiCard({ title, value, change, icon: Icon, trend }: KpiCardProps) {
  const hasChange = change !== undefined

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {hasChange && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercentage(change)}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}