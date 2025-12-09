import { useState } from 'react';
import { WikiPage, WikiActivity, getPageActivity, getTagById } from '../../lib/data/wiki-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sparkles,
  Tag as TagIcon,
  Clock,
  Users,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface WikiRightPanelProps {
  page: WikiPage;
}

export default function WikiRightPanel({ page }: WikiRightPanelProps) {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const activities = getPageActivity(page.id);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setAiAnswer(
        `This is a placeholder AI response. In production, this would analyze the page "${page.title}" and provide an intelligent answer to your question: "${aiQuestion}"`
      );
      setAiLoading(false);
    }, 1500);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* AI Assistant */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm">AI Assistant</CardTitle>
                <CardDescription className="text-xs">Ask about this page</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Ask a question about this page..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              rows={3}
              className="resize-none text-sm bg-white"
            />
            <Button
              onClick={handleAskAI}
              disabled={!aiQuestion.trim() || aiLoading}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>

            {aiAnswer && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">{aiAnswer}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-purple-600 bg-white px-3 py-2 rounded-lg">
              <AlertCircle className="h-3 w-3" />
              <span>AI responses are experimental</span>
            </div>
          </CardContent>
        </Card>

        {/* Page Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Page Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Tags */}
            {page.tags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {page.tags.map((tagId) => {
                    const tag = getTagById(tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          borderColor: `${tag.color}40`,
                          color: tag.color,
                        }}
                      >
                        {tag.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Created */}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">Created</div>
              <div className="text-xs text-slate-700">
                {new Date(page.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-xs text-slate-500">by {page.createdBy}</div>
            </div>

            <Separator />

            {/* Last Updated */}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">Last Updated</div>
              <div className="text-xs text-slate-700">
                {new Date(page.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-xs text-slate-500">by {page.updatedBy}</div>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">Status</div>
              <Badge
                variant={page.status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {page.status === 'published' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="h-3 w-3 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900">
                        {activity.actorName}
                      </div>
                      <div className="text-xs text-slate-600">
                        {activity.action} this page
                      </div>
                      {activity.summary && (
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {activity.summary}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Pages - Placeholder */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Related Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-500 text-center py-4">
              No related pages found
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Add Comment
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Users className="h-3.5 w-3.5 mr-2" />
              Share Page
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Clock className="h-3.5 w-3.5 mr-2" />
              View History
            </Button>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
