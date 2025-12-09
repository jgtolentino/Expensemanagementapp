import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Search, 
  FileText, 
  Loader2,
  X,
  Command,
} from 'lucide-react';
import { WikiPage, searchPages } from '../../lib/data/wiki-data';

interface WikiSearchBarProps {
  onPageSelect: (page: WikiPage) => void;
  placeholder?: string;
}

export default function WikiSearchBar({ onPageSelect, placeholder = 'Search pages...' }: WikiSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiPage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      const searchResults = searchPages(query);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectPage(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelectPage = (page: WikiPage) => {
    onPageSelect(page);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-slate-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
          {query && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center gap-1 rounded border border-slate-200 bg-slate-50 font-mono text-xs text-slate-500">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-xl max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
            {results.map((page, index) => (
              <div
                key={page.id}
                onClick={() => handleSelectPage(page)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-cyan-50 border border-cyan-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    index === selectedIndex ? 'text-cyan-600' : 'text-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">
                      {highlightMatch(page.title, query)}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {highlightMatch(page.excerpt, query)}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {page.spaceId}
                      </Badge>
                      {page.status !== 'published' && (
                        <Badge
                          variant={page.status === 'draft' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {page.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-xl p-6 z-50">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-900 mb-1">No pages found</p>
            <p className="text-xs text-slate-500">
              Try searching with different keywords
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
