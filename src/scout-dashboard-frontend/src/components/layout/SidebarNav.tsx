import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  MapPin,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

interface SidebarNavProps {
  isOpen: boolean
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transaction-trends', icon: TrendingUp, label: 'Transaction Trends' },
  { path: '/product-analytics', icon: Package, label: 'Product Analytics' },
  { path: '/consumer-analytics', icon: Users, label: 'Consumer Analytics' },
  { path: '/geo-intelligence', icon: MapPin, label: 'Geo Intelligence' },
  { path: '/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { path: '/ai-assistant', icon: MessageSquare, label: 'Ask Suqi' },
]

export default function SidebarNav({ isOpen }: SidebarNavProps) {
  if (!isOpen) return null

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}