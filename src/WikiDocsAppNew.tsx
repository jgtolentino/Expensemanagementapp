import { useState, useEffect } from 'react';
import WikiLayout from './components/wiki/WikiLayout';
import WikiSidebar from './components/wiki/WikiSidebar';
import WikiPageView from './components/wiki/WikiPageView';
import WikiRightPanel from './components/wiki/WikiRightPanel';
import WikiSearchBar from './components/wiki/WikiSearchBar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import {
  Book,
  Plus,
  FileText,
  Star,
  Clock,
  Users,
  Tag as TagIcon,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import {
  wikiSpaces,
  wikiPages,
  buildPageTree,
  getPageBySlug,
  getSpaceByKey,
  getRecentPages,
  getStarredPages,
  type WikiSpace,
  type WikiPage,
  type WikiPageTreeNode,
} from './lib/data/wiki-data';

type View = 'hub' | 'page';

export default function WikiDocsApp() {
  const [currentView, setCurrentView] = useState<View>('hub');
  const [selectedSpace, setSelectedSpace] = useState<WikiSpace>(wikiSpaces[0]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [pageTree, setPageTree] = useState<WikiPageTreeNode[]>([]);

  // Build page tree when space changes
  useEffect(() => {
    const tree = buildPageTree(wikiPages, selectedSpace.id);
    setPageTree(tree);
  }, [selectedSpace]);

  // Handle space change
  const handleSpaceChange = (spaceKey: string) => {
    const space = getSpaceByKey(spaceKey);
    if (space) {
      setSelectedSpace(space);
      setSelectedPage(null);
      setCurrentView('hub');
    }
  };

  // Handle page selection
  const handlePageSelect = (page: WikiPageTreeNode | WikiPage) => {
    setSelectedPage(page as WikiPage);
    setCurrentView('page');
  };

  // Handle back to hub
  const handleBackToHub = () => {
    setSelectedPage(null);
    setCurrentView('hub');
  };

  // Get recent and starred pages
  const recentPages = getRecentPages(5);
  const starredPages = getStarredPages();

  // Header component
  const header = (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title and Space Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: '#0891B220' }}
            >
              📚
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Wiki & Docs</h1>
              <p className="text-xs text-slate-500">Knowledge Base</p>
            </div>
          </div>

          {/* Space Selector */}
          <Select value={selectedSpace.key} onValueChange={handleSpaceChange}>
            <SelectTrigger className="w-64">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{selectedSpace.iconEmoji}</span>
                  <span className="font-medium">{selectedSpace.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {wikiSpaces.map((space) => (
                <SelectItem key={space.id} value={space.key}>
                  <div className="flex items-center gap-2">
                    <span>{space.iconEmoji}</span>
                    <span>{space.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {space.pageCount}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <WikiSearchBar onPageSelect={handlePageSelect} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>
    </div>
  );

  // Sidebar component
  const sidebar = (
    <WikiSidebar
      space={selectedSpace}
      pageTree={pageTree}
      activePageId={selectedPage?.id}
      onPageSelect={handlePageSelect}
      pinnedPages={starredPages.filter((p) => p.spaceId === selectedSpace.id).slice(0, 3)}
    />
  );

  // Main content - Hub View
  const hubView = (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Space Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${selectedSpace.color}20` }}
          >
            {selectedSpace.iconEmoji}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl mb-2">{selectedSpace.name}</h1>
            <p className="text-lg text-slate-600 mb-4">{selectedSpace.description}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {selectedSpace.pageCount} {selectedSpace.pageCount === 1 ? 'page' : 'pages'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{selectedSpace.memberCount} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Updated {new Date(selectedSpace.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
              <Plus className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="font-semibold mb-1">Create New Page</h3>
            <p className="text-sm text-slate-600">Start writing documentation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">AI Assistant</h3>
            <p className="text-sm text-slate-600">Get help with content</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-1">Browse All</h3>
            <p className="text-sm text-slate-600">View all pages</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pages */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            Recently Updated
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {recentPages
            .filter((p) => p.spaceId === selectedSpace.id)
            .slice(0, 5)
            .map((page) => (
              <Card
                key={page.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handlePageSelect(page)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{page.title}</h3>
                          {page.starred && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                          {page.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Updated by {page.updatedBy}</span>
                          <span>•</span>
                          <span>
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Starred Pages */}
      {starredPages.filter((p) => p.spaceId === selectedSpace.id).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Starred Pages
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {starredPages
              .filter((p) => p.spaceId === selectedSpace.id)
              .map((page) => (
                <Card
                  key={page.id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handlePageSelect(page)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">{page.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {page.excerpt}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Main content - Page View
  const pageView = selectedPage ? (
    <WikiPageView
      page={selectedPage}
      space={selectedSpace}
      onEdit={() => {
        console.log('Edit page:', selectedPage.id);
        // TODO: Implement edit mode
      }}
      onToggleStar={() => {
        console.log('Toggle star:', selectedPage.id);
        // TODO: Implement star toggle
      }}
    />
  ) : null;

  // Right panel
  const rightPanel = selectedPage ? <WikiRightPanel page={selectedPage} /> : null;

  return (
    <WikiLayout
      header={header}
      sidebar={sidebar}
      main={currentView === 'hub' ? hubView : pageView || hubView}
      rightPanel={rightPanel}
      showRightPanel={currentView === 'page' && showRightPanel}
    />
  );
}