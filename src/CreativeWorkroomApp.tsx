import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Palette, FolderOpen, CheckCircle2, MessageSquare, Image, Video, FileText, Clock } from 'lucide-react';

export default function CreativeWorkroomApp() {
  const [activeView, setActiveView] = useState<'projects' | 'briefs' | 'assets' | 'approvals'>('projects');

  // Mock data
  const creativeProjects = [
    { 
      id: 'CRE-001', 
      name: 'Summer Campaign 2025', 
      client: 'BrandCo', 
      status: 'in_progress', 
      phase: 'Concept Development',
      assets: 24,
      approvals: 3,
      team: ['Designer', 'Copywriter', 'Art Director'],
      deadline: '2025-01-15'
    },
    { 
      id: 'CRE-002', 
      name: 'Product Launch Video', 
      client: 'TechStart Inc', 
      status: 'review', 
      phase: 'Post-Production',
      assets: 12,
      approvals: 1,
      team: ['Video Editor', 'Motion Designer'],
      deadline: '2024-12-20'
    },
    { 
      id: 'CRE-003', 
      name: 'Brand Identity Refresh', 
      client: 'RetailHub', 
      status: 'concept', 
      phase: 'Initial Concepts',
      assets: 8,
      approvals: 0,
      team: ['Brand Designer', 'Strategist'],
      deadline: '2025-02-01'
    },
  ];

  const briefs = [
    { 
      id: 'BRF-001', 
      title: 'Social Media Campaign Brief', 
      client: 'BrandCo',
      type: 'Social Media',
      status: 'active',
      objective: 'Increase brand awareness among Gen Z audience',
      deadline: '2025-01-10'
    },
    { 
      id: 'BRF-002', 
      title: 'Product Launch Creative Brief', 
      client: 'TechStart Inc',
      type: 'Video Production',
      status: 'active',
      objective: 'Create compelling product launch video',
      deadline: '2024-12-18'
    },
  ];

  const assetLibrary = [
    { id: 'ASS-001', name: 'Summer_Hero_v3.psd', type: 'Image', size: '45.2 MB', modified: '2 hours ago', project: 'Summer Campaign 2025' },
    { id: 'ASS-002', name: 'Brand_Guidelines_2025.pdf', type: 'Document', size: '12.8 MB', modified: '1 day ago', project: 'Brand Identity Refresh' },
    { id: 'ASS-003', name: 'Launch_Video_Final_v2.mp4', type: 'Video', size: '324 MB', modified: '3 hours ago', project: 'Product Launch Video' },
    { id: 'ASS-004', name: 'Social_Post_Template.ai', type: 'Image', size: '8.4 MB', modified: '5 hours ago', project: 'Summer Campaign 2025' },
  ];

  const approvalQueue = [
    { id: 'APR-001', asset: 'Summer Campaign Concept A', project: 'Summer Campaign 2025', submitter: 'John Designer', status: 'pending', submitted: '2 hours ago' },
    { id: 'APR-002', asset: 'Brand Logo Variations', project: 'Brand Identity Refresh', submitter: 'Sarah Brand', status: 'pending', submitted: '4 hours ago' },
    { id: 'APR-003', asset: 'Product Video Rough Cut', project: 'Product Launch Video', submitter: 'Mike Editor', status: 'approved', submitted: '1 day ago' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      in_progress: 'default',
      review: 'secondary',
      concept: 'outline',
      active: 'default',
      pending: 'secondary',
      approved: 'outline',
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      in_progress: '#EC4899',
      review: '#F59E0B',
      concept: '#6B7280',
      active: '#10B981',
      pending: '#F59E0B',
      approved: '#10B981',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Image': return <Image className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'Document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                🎨
              </div>
              <div>
                <h1 className="text-2xl" style={{ color: '#EC4899' }}>Creative Workroom</h1>
                <p className="text-sm text-slate-500">Creative Project Collaboration Workspace</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                This Week
              </Button>
              <Button size="sm" style={{ backgroundColor: '#EC4899' }}>
                New Project
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
              onClick={() => setActiveView('projects')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'projects'
                  ? 'border-[#EC4899] text-[#EC4899]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Projects
            </button>
            <button
              onClick={() => setActiveView('briefs')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'briefs'
                  ? 'border-[#EC4899] text-[#EC4899]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Briefs
            </button>
            <button
              onClick={() => setActiveView('assets')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'assets'
                  ? 'border-[#EC4899] text-[#EC4899]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Asset Library
            </button>
            <button
              onClick={() => setActiveView('approvals')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeView === 'approvals'
                  ? 'border-[#EC4899] text-[#EC4899]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Approvals
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeView === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {creativeProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={getStatusBadge(project.status) as any}>
                        <span style={{ color: getStatusColor(project.status) }}>●</span>
                        <span className="ml-1">{project.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <CardDescription>{project.client}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-slate-600">Phase:</span>
                        <span className="ml-2 font-medium">{project.phase}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{project.assets} assets</span>
                        <span>•</span>
                        <span>{project.approvals} pending</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {project.team.map((role, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>

                      <Button className="w-full mt-2" size="sm" variant="outline">
                        Open Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'briefs' && (
          <div className="space-y-4">
            {briefs.map((brief) => (
              <Card key={brief.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{brief.title}</CardTitle>
                        <Badge variant={getStatusBadge(brief.status) as any}>
                          {brief.status}
                        </Badge>
                      </div>
                      <CardDescription>{brief.client} • {brief.type}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">View Brief</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-600">Objective:</span>
                      <p className="text-sm mt-1">{brief.objective}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {new Date(brief.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeView === 'assets' && (
          <Card>
            <CardHeader>
              <CardTitle>Asset Library</CardTitle>
              <CardDescription>All creative assets and files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assetLibrary.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-slate-600">
                          {asset.project} • {asset.size} • Modified {asset.modified}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Preview</Button>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'approvals' && (
          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>Review and approve creative work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalQueue.map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{approval.asset}</h3>
                          <Badge variant={getStatusBadge(approval.status) as any}>
                            <span style={{ color: getStatusColor(approval.status) }}>●</span>
                            <span className="ml-1">{approval.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {approval.project} • Submitted by {approval.submitter} • {approval.submitted}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {approval.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" style={{ color: '#DC2626', borderColor: '#DC2626' }}>
                              Request Changes
                            </Button>
                            <Button size="sm" style={{ backgroundColor: '#10B981' }}>
                              Approve
                            </Button>
                          </>
                        )}
                        {approval.status === 'approved' && (
                          <Button variant="outline" size="sm">View</Button>
                        )}
                      </div>
                    </div>
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
