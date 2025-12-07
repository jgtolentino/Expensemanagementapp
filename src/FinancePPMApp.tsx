import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { 
  FolderKanban, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Settings, 
  Sparkles,
  Plus,
  Search
} from 'lucide-react';
import { Input } from './components/ui/input';

export default function FinancePPMApp() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen bg-[#F2F7F2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: '#D4AC0D', color: 'white' }}
              >
                🧠
              </div>
              <div>
                <h1 className="text-xl" style={{ color: '#D4AC0D' }}>
                  Finance PPM
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered project portfolio workspace
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search projects, docs..." 
                  className="pl-9 w-64"
                />
              </div>
              <Button size="sm" style={{ backgroundColor: '#D4AC0D' }}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Workspace Section */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Workspace
              </p>
              <nav className="space-y-1">
                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'projects'
                      ? 'bg-yellow-50 text-[#D4AC0D]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('projects')}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Projects</span>
                  <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded">12</span>
                </button>

                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'knowledge'
                      ? 'bg-yellow-50 text-[#D4AC0D]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('knowledge')}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Knowledge Base</span>
                </button>

                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-yellow-50 text-[#D4AC0D]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Assistant</span>
                </button>

                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'team'
                      ? 'bg-yellow-50 text-[#D4AC0D]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('team')}
                >
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </button>
              </nav>
            </div>

            {/* Recent Projects */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Recent
              </p>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  📊 Q4 Budget Review
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  🎯 Brand Refresh 2025
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  💼 Client Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* Projects View */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl">All Projects</h2>
                    <p className="text-gray-600 text-sm">Manage your project portfolio</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Sort
                    </Button>
                  </div>
                </div>

                {/* Project Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-2xl">📊</div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2">Q4 Budget Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Financial planning and budget allocation for Q4
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Due: Dec 15</span>
                          <span>₱2.5M budget</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ backgroundColor: '#D4AC0D', width: '65%' }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">65%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-2xl">🎯</div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          Planning
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2">Brand Refresh 2025</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Complete brand identity update for new year
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Due: Jan 31</span>
                          <span>₱5M budget</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ backgroundColor: '#D4AC0D', width: '20%' }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">20%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300">
                    <CardContent className="flex items-center justify-center h-full py-12">
                      <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Create New Project</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Message */}
                <Card className="border-2 border-dashed" style={{ borderColor: '#D4AC0D' }}>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: '#FEF9E7' }}
                      >
                        ✨
                      </div>
                      <h3 className="text-lg mb-2" style={{ color: '#D4AC0D' }}>
                        Finance PPM Ready
                      </h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto">
                        Notion-style workspace with AI RAG assistant for project financials, 
                        knowledge management, and intelligent insights.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Knowledge Base View */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl">Knowledge Base</h2>
                  <p className="text-gray-600 text-sm">Team documentation and best practices</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        📚 Financial Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Company financial policies, approval workflows, and compliance guidelines
                      </p>
                      <div className="text-xs text-gray-500">Last updated: Nov 28, 2025</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        🎓 Project Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Standard templates for project briefs, budgets, and reports
                      </p>
                      <div className="text-xs text-gray-500">Last updated: Dec 1, 2025</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* AI Assistant View */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" style={{ color: '#D4AC0D' }} />
                    AI Assistant
                  </h2>
                  <p className="text-gray-600 text-sm">Ask questions about projects, budgets, and policies</p>
                </div>

                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl"
                        style={{ backgroundColor: '#FEF9E7' }}
                      >
                        🤖
                      </div>
                      <div>
                        <h3 className="text-lg mb-2">AI Assistant Ready</h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                          Powered by RAG (Retrieval Augmented Generation) with access to your 
                          knowledge base and live project data.
                        </p>
                      </div>

                      <div className="max-w-md mx-auto space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider text-left">
                          Try asking:
                        </p>
                        <Button variant="outline" className="w-full justify-start">
                          "What's the status of Q4 projects?"
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          "Show me budget variance this month"
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          "What are our expense policies?"
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Team View */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl">Team Members</h2>
                  <p className="text-gray-600 text-sm">Manage access and permissions</p>
                </div>

                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-gray-500">
                      Team management interface coming soon
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
