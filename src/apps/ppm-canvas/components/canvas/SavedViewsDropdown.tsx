/**
 * IPAI PPM Clarity - Saved Views Dropdown Component
 * Allows users to switch between saved canvas views
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, Users, Check } from 'lucide-react';
import type { CanvasView } from '../../types/canvas';

interface SavedViewsDropdownProps {
  views: CanvasView[];
  activeView: CanvasView | null;
  onSelectView: (viewId: number) => void;
}

export function SavedViewsDropdown({
  views,
  activeView,
  onSelectView,
}: SavedViewsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Separate own views and shared views
  const myViews = views.filter(v => v.is_owner);
  const sharedViews = views.filter(v => !v.is_owner && v.is_shared);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
      >
        <span className="text-gray-700">
          {activeView?.name || 'Select View'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* My Views */}
          {myViews.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                My Views
              </div>
              {myViews.map((view) => (
                <ViewItem
                  key={view.id}
                  view={view}
                  isActive={activeView?.id === view.id}
                  onClick={() => {
                    onSelectView(view.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {myViews.length > 0 && sharedViews.length > 0 && (
            <div className="border-t border-gray-200" />
          )}

          {/* Shared Views */}
          {sharedViews.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3" />
                Shared Views
              </div>
              {sharedViews.map((view) => (
                <ViewItem
                  key={view.id}
                  view={view}
                  isActive={activeView?.id === view.id}
                  onClick={() => {
                    onSelectView(view.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {views.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No saved views yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ViewItemProps {
  view: CanvasView;
  isActive: boolean;
  onClick: () => void;
}

function ViewItem({ view, isActive, onClick }: ViewItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-2 py-2 rounded text-sm text-left
        ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}
      `}
    >
      {isActive && <Check className="w-4 h-4 text-blue-600" />}
      {!isActive && <div className="w-4" />}

      <span className={`flex-1 ${view.is_default ? 'font-medium' : ''}`}>
        {view.name}
      </span>

      <div className="flex items-center gap-1">
        {view.is_favorite && (
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        )}
        {view.is_default && (
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            Default
          </span>
        )}
      </div>
    </button>
  );
}

export default SavedViewsDropdown;
