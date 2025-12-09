import { ReactNode } from 'react';

interface WikiLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  showRightPanel?: boolean;
}

export default function WikiLayout({
  sidebar,
  header,
  main,
  rightPanel,
  showRightPanel = false,
}: WikiLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-30">
        {header}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 xl:w-80 bg-white border-r border-slate-200 overflow-hidden flex-shrink-0">
          {sidebar}
        </aside>

        {/* Center content */}
        <main className="flex-1 overflow-y-auto">
          {main}
        </main>

        {/* Right Panel (optional) */}
        {showRightPanel && rightPanel && (
          <aside className="hidden xl:flex xl:flex-col w-80 bg-white border-l border-slate-200 overflow-hidden flex-shrink-0">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
