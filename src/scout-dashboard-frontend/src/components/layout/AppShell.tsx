import { ReactNode, useState } from 'react'
import TopBar from './TopBar'
import SidebarNav from './SidebarNav'
import RightFilterPanel from './RightFilterPanel'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <TopBar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleFilters={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <SidebarNav isOpen={isSidebarOpen} />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            isSidebarOpen ? 'ml-64' : 'ml-0',
            isFilterPanelOpen ? 'mr-80' : 'mr-0'
          )}
        >
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Right Filter Panel */}
        <RightFilterPanel isOpen={isFilterPanelOpen} />
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}
