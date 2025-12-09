import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Book, FileText, FolderOpen, Search, Plus, Star, Clock, Users, Tag } from 'lucide-react';

export default function WikiDocsApp() {
  const [activeView, setActiveView] = useState<'home' | 'pages' | 'recent' | 'starred'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const workspaces = [
    { id: 'WS-001', name: 'Company Wiki', icon: '📚', pages: 124, members: 45, color: '#0891B2' },
    { id: 'WS-002', name: 'Project Documentation', icon: '📁', pages: 89, members: 23, color: '#7C3AED' },
    { id: 'WS-003', name: 'Marketing Playbook', icon: '📢', pages: 56, members: 18, color: '#EC4899' },
    { id: 'WS-004', name: 'Engineering Docs', icon: '⚙️', pages: 142, members: 32, color: '#059669' },
  ];

  const recentPages = [
    { 
      id: 'PAGE-001', 
      title: 'Q4 2024 Campaign Strategy', 
      workspace: 'Marketing Playbook',
      author: 'Sarah Johnson',
      modified: '2 hours ago',
      tags: ['Strategy', 'Q4', 'Campaign'],
      starred: true
    },
    { 
      id: 'PAGE-002', 
      title: 'API Integration Guide', 
      workspace: 'Engineering Docs',
      author: 'Mike Chen',
      modified: '5 hours ago',
      tags: ['API', 'Integration', 'Technical'],
      starred: false
    },
    { 
      id: 'PAGE-003', 
      title: 'Brand Guidelines 2025', 
      workspace: 'Marketing Playbook',
      author: 'Emma Davis',
      modified: '1 day ago',
      tags: ['Brand', 'Guidelines', 'Design'],
      starred: true
    },
    { 
      id: 'PAGE-004', 
      title: 'Onboarding Checklist', 
      workspace: 'Company Wiki',
      author: 'HR Team',
      modified: '2 days ago',
      tags: ['HR', 'Onboarding', 'Process'],
      starred: false
    },
  ];

  const popularTemplates = [
    { id: 'TPL-001', name: 'Meeting Notes', icon: '📝', uses: 234 },
    { id: 'TPL-002', name: 'Project Brief', icon: '📋', uses: 189 },
    { id: 'TPL-003', name: 'Weekly Report', icon: '📊', uses: 156 },
    { id: 'TPL-004', name: 'Product Spec', icon: '📄', uses: 142 },
  ];

  const allPages = [
    { id: 'PAGE-001', title: 'Q4 2024 Campaign Strategy', workspace: 'Marketing Playbook', modified: '2 hours ago', starred: true },
    { id: 'PAGE-002', title: 'API Integration Guide', workspace: 'Engineering Docs', modified: '5 hours ago', starred: false },
    { id: 'PAGE-003', title: 'Brand Guidelines 2025', workspace: 'Marketing Playbook', modified: '1 day ago', starred: true },
    { id: 'PAGE-004', title: 'Onboarding Checklist', workspace: 'Company Wiki', modified: '2 days ago', starred: false },
    { id: 'PAGE-005', title: 'Security Best Practices', workspace: 'Engineering Docs', modified: '3 days ago', starred: false },
    { id: 'PAGE-006', title: 'Client Communication Guidelines', workspace: 'Company Wiki', modified: '4 days ago', starred: true },
    { id: 'PAGE-007', title: 'Social Media Calendar Template', workspace: 'Marketing Playbook', modified: '5 days ago', starred: false },
    { id: 'PAGE-008', title: 'Database Schema Documentation', workspace: 'Engineering Docs', modified: '1 week ago', starred: false },
  ];

  const starredPages = allPages.filter(page => page.starred);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0891B2', color: 'white' }}>
                📚
              </div>
              <div>
                <h1 className="text-2xl" style={{ color: '#0891B2' }}>Wiki & Docs</h1>
                <p className="text-sm text-slate-500">Confluence/Notion-style Knowledge Base</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search pages, workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  size={40}
                />
              </div>
              <Button size="sm" style={{ backgroundColor: '#0891B2' }}>
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('home')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'home'
                  ? 'border-[#0891B2] text-[#0891B2]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Book className="w-4 h-4 inline mr-2" />
              Home
            </button>
            <button
              onClick={() => setActiveView('pages')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'pages'
                  ? 'border-[#0891B2] text-[#0891B2]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              All Pages
            </button>
            <button
              onClick={() => setActiveView('recent')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'recent'
                  ? 'border-[#0891B2] text-[#0891B2]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Recent
            </button>
            <button
              onClick={() => setActiveView('starred')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'starred'
                  ? 'border-[#0891B2] text-[#0891B2]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Starred
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeView === 'home' && (
          <div className="space-y-8">
            {/* Workspaces */}
            <div>
              <h2 className="text-xl mb-4">Workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {workspaces.map((workspace) => (
                  <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: workspace.color + '20' }}>
                        {workspace.icon}
                      </div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {workspace.pages}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {workspace.members}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <h2 className="text-xl mb-4">Popular Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="text-3xl mb-3">{template.icon}</div>
                      <h3 className="font-medium mb-2">{template.name}</h3>
                      <p className="text-sm text-slate-600">{template.uses} uses</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Pages */}
            <div>
              <h2 className="text-xl mb-4">Recently Updated</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {recentPages.slice(0, 5).map((page) => (
                      <div key={page.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{page.title}</h3>
                            {page.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{page.workspace}</span>
                            <span>•</span>
                            <span>Modified {page.modified}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Open</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'pages' && (
          <Card>
            <CardHeader>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>Browse all knowledge base pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{page.title}</span>
                          {page.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="text-sm text-slate-600">
                          {page.workspace} • {page.modified}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Open</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'recent' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Pages you've viewed or edited recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPages.map((page) => (
                  <div key={page.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{page.title}</h3>
                          {page.starred && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-4 h-4" />
                            {page.workspace}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {page.author}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {page.modified}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {page.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Open</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'starred' && (
          <Card>
            <CardHeader>
              <CardTitle>Starred Pages</CardTitle>
              <CardDescription>Pages you've marked as favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {starredPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1">
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-slate-600">
                          {page.workspace} • {page.modified}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Open</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
