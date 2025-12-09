import { useState, useEffect } from 'react';
import { WikiPage, WikiSpace, WikiTag, getPageBreadcrumbs, getTagById } from '../../lib/data/wiki-data';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Calendar, 
  User, 
  Eye, 
  Edit, 
  Star, 
  Clock,
  Tag as TagIcon,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface WikiPageViewProps {
  page: WikiPage;
  space: WikiSpace;
  onEdit?: () => void;
  onToggleStar?: () => void;
}

// Simple markdown-to-HTML converter (basic implementation)
// In production, use a library like 'marked' or 'react-markdown'
function renderMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Checkboxes
  html = html.replace(/- \[ \]/g, '<input type="checkbox" disabled />');
  html = html.replace(/- \[x\]/gi, '<input type="checkbox" disabled checked />');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Tables (basic)
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
    return `<tr>${cells}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

  return html;
}

// Extract table of contents from markdown
function extractTOC(markdown: string): { level: number; title: string; id: string }[] {
  const headings: { level: number; title: string; id: string }[] = [];
  const lines = markdown.split('\n');

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
      const id = title.toLowerCase().replace(/[^\w]+/g, '-');
      headings.push({ level, title, id });
    }
  });

  return headings;
}

export default function WikiPageView({ page, space, onEdit, onToggleStar }: WikiPageViewProps) {
  const [showTOC, setShowTOC] = useState(true);
  const toc = extractTOC(page.contentMarkdown);
  const htmlContent = renderMarkdown(page.contentMarkdown);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <div
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
            style={{ color: space.color }}
          >
            <span>{space.iconEmoji}</span>
            <span className="font-medium">{space.name}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">{page.title}</span>
        </div>

        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl mb-2">{page.title}</h1>
            {page.excerpt && (
              <p className="text-lg text-slate-600">{page.excerpt}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStar}
              className={page.starred ? 'text-yellow-600 border-yellow-300' : ''}
            >
              <Star className={`h-4 w-4 mr-2 ${page.starred ? 'fill-yellow-400' : ''}`} />
              {page.starred ? 'Starred' : 'Star'}
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Updated by {page.updatedBy}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDate(page.updatedAt)} at {formatTime(page.updatedAt)}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{page.viewCount || 0} views</span>
          </div>
          {page.status !== 'published' && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant={page.status === 'draft' ? 'secondary' : 'outline'}>
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
              </Badge>
            </>
          )}
        </div>

        {/* Tags */}
        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
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
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag.label}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Table of Contents */}
          {toc.length > 0 && showTOC && (
            <Card className="mb-8 bg-slate-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-slate-600" />
                  <h2 className="text-lg font-semibold">Table of Contents</h2>
                </div>
                <nav className="space-y-1.5">
                  {toc.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.id}`}
                      className="block text-sm text-slate-700 hover:text-cyan-600 transition-colors"
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          )}

          {/* Rendered Content */}
          <div
            className="wiki-content prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Page Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                <p>
                  Created by {page.createdBy} on {formatDate(page.createdAt)}
                </p>
                <p className="mt-1">
                  Last updated by {page.updatedBy} on {formatDate(page.updatedAt)}
                </p>
              </div>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
