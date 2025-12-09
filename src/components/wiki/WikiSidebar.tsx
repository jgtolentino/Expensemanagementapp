import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Star, Pin } from 'lucide-react';
import { WikiPageTreeNode, WikiSpace } from '../../lib/data/wiki-data';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface WikiSidebarProps {
  space: WikiSpace;
  pageTree: WikiPageTreeNode[];
  activePage

Id?: string;
  onPageSelect: (page: WikiPageTreeNode) => void;
  pinnedPages?: WikiPageTreeNode[];
}

export default function WikiSidebar({
  space,
  pageTree,
  activePageId,
  onPageSelect,
  pinnedPages = [],
}: WikiSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['PAGE-001'])); // Expand first page by default

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderTreeNode = (node: WikiPageTreeNode) => {
    const isActive = node.id === activePageId;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = node.level * 12;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group ${
            isActive
              ? 'bg-cyan-50 text-cyan-700 font-medium'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => onPageSelect(node)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0.5 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Page Icon */}
          <FileText className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />

          {/* Page Title */}
          <span className="flex-1 text-sm truncate">{node.title}</span>

          {/* Status Badge */}
          {node.status === 'draft' && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
              Draft
            </Badge>
          )}

          {/* Starred Icon */}
          {node.starred && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Space Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${space.color}20` }}
          >
            {space.iconEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{space.name}</div>
            <div className="text-xs text-slate-500">
              {space.pageCount} pages
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Pages */}
      {pinnedPages.length > 0 && (
        <div className="border-b border-slate-200">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <Pin className="h-3 w-3" />
            Pinned
          </div>
          <div className="pb-2">
            {pinnedPages.map((page) => (
              <div
                key={page.id}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  page.id === activePageId
                    ? 'bg-cyan-50 text-cyan-700 font-medium'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
                onClick={() => onPageSelect(page)}
              >
                <Pin className="h-3.5 w-3.5 text-slate-400" />
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-sm truncate">{page.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Pages
          </div>
          {pageTree.length > 0 ? (
            <div>
              {pageTree.map((node) => renderTreeNode(node))}
            </div>
          ) : (
            <div className="px-3 py-8 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No pages yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500">
          Last updated {new Date(space.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
