import { Menu, SlidersHorizontal, Bell, User } from 'lucide-react'

interface TopBarProps {
  onToggleSidebar: () => void
  onToggleFilters: () => void
}

export default function TopBar({ onToggleSidebar, onToggleFilters }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Logo + Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Scout Dashboard</h1>
            <p className="text-xs text-gray-500">Sari-Sari Retail Analytics</p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Filter Toggle */}
        <button
          onClick={onToggleFilters}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="User menu"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-gray-900">Demo User</p>
            <p className="text-xs text-gray-500">Analyst</p>
          </div>
        </button>
      </div>
    </header>
  )
}