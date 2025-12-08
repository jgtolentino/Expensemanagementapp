import { useState, useMemo } from 'react';
import { Search, Command, Sparkles, Filter, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { MCPProduct, MCPProvider, MCPCategory } from './types';
import { FEATURED_PROVIDERS, MCP_PRODUCTS, FILTER_TABS } from './data';
import { ProviderAvatar, ProviderCard } from './ProviderCard';
import { ProductCard, ProductListItem } from './ProductCard';

interface MCPMarketplaceProps {
  onInstallProduct?: (product: MCPProduct) => void;
  onViewProductDetails?: (product: MCPProduct) => void;
  onViewProviderDetails?: (provider: MCPProvider) => void;
}

export function MCPMarketplace({
  onInstallProduct,
  onViewProductDetails,
  onViewProviderDetails,
}: MCPMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('popular');
  const [showAllProviders, setShowAllProviders] = useState(false);

  // Filter products based on search and active filter
  const filteredProducts = useMemo(() => {
    let products = [...MCP_PRODUCTS];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.providerName.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Apply category/type filter
    switch (activeFilter) {
      case 'popular':
        products = products.sort((a, b) => (b.installCount || 0) - (a.installCount || 0));
        break;
      case 'free':
        products = products.filter((p) => p.isFree && p.isInstantlyAvailable);
        break;
      case 'new':
        products = products.filter((p) => p.isNew);
        break;
      case 'financial':
        products = products.filter((p) => p.categories.includes('financial'));
        break;
      case 'media':
        products = products.filter((p) => p.categories.includes('media'));
        break;
      case 'health':
        products = products.filter((p) => p.categories.includes('health'));
        break;
      case 'retail':
        products = products.filter((p) => p.categories.includes('retail'));
        break;
      case 'transportation':
        products = products.filter((p) => p.categories.includes('transportation'));
        break;
      case 'from-ipai':
        products = products.filter((p) => p.providerId === 'internal');
        break;
    }

    return products;
  }, [searchQuery, activeFilter]);

  const displayedProviders = showAllProviders
    ? FEATURED_PROVIDERS
    : FEATURED_PROVIDERS.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-deakin-primary to-deakin-purple text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search data, notebooks, recents, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-12 bg-white text-gray-900 border-0 rounded-lg shadow-level-2"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 text-sm">
                <Command className="w-4 h-4" />
                <span>+ P</span>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 text-white border-0">
              Powered by Delta Sharing
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">MCP Marketplace</h1>
          <p className="text-lg text-white/90 mb-6 max-w-2xl">
            Supercharge your AI Agents with MCP Servers on Marketplace. Discover and connect
            to MCP tools and resources to accelerate AI development and empower your data science teams.
          </p>

          {/* Featured Provider Avatars */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {FEATURED_PROVIDERS.slice(0, 6).map((provider) => (
              <ProviderAvatar
                key={provider.id}
                provider={provider}
                size="md"
                onClick={onViewProviderDetails}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filter Tabs */}
          <aside className="w-64 shrink-0">
            <Card className="bg-white border-gray-200 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeFilter === tab.id
                          ? 'bg-deakin-primary/10 text-deakin-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Featured Providers Sidebar */}
            <Card className="bg-white border-gray-200 mt-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Featured providers
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllProviders(!showAllProviders)}
                    className="text-xs text-deakin-primary hover:text-deakin-primary/80"
                  >
                    {showAllProviders ? 'Show less' : 'View all'}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {displayedProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onClick={onViewProviderDetails}
                  />
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : FILTER_TABS.find((t) => t.id === activeFilter)?.label || 'All Products'}
              </h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {filteredProducts.length} products
              </Badge>
            </div>

            {/* Staff Picks Section */}
            {activeFilter === 'popular' && !searchQuery && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-deakin-gold" />
                  Staff picks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MCP_PRODUCTS.filter((p) => p.rating && p.rating >= 4.7)
                    .slice(0, 3)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onInstall={onInstallProduct}
                        onViewDetails={onViewProductDetails}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onInstall={onInstallProduct}
                  onViewDetails={onViewProductDetails}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('popular');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Feedback Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Didn't find what you're looking for?{' '}
                <Button variant="link" className="text-deakin-primary p-0 h-auto">
                  Let us know
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MCPMarketplace;
