import { MCPProduct, CATEGORY_LABELS } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, Download, Zap, CheckCircle2, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: MCPProduct;
  onInstall?: (product: MCPProduct) => void;
  onViewDetails?: (product: MCPProduct) => void;
}

export function ProductCard({ product, onInstall, onViewDetails }: ProductCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getPricingLabel = () => {
    switch (product.pricing.type) {
      case 'free':
        return 'Free';
      case 'freemium':
        return 'Freemium';
      case 'paid':
        return `From $${product.pricing.startingPrice}/${product.pricing.billingPeriod === 'monthly' ? 'mo' : 'yr'}`;
      case 'contact-sales':
        return 'Contact Sales';
    }
  };

  return (
    <Card className="group hover:shadow-level-2 hover:border-deakin-primary/30 transition-all duration-200 bg-white border-gray-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Provider Logo */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {product.providerName.slice(0, 2).toUpperCase()}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 justify-end">
            {product.isNew && (
              <Badge className="bg-deakin-teal text-white text-xs">New</Badge>
            )}
            {product.isFree && (
              <Badge variant="secondary" className="bg-semantic-successSoft text-semantic-success text-xs">
                Free
              </Badge>
            )}
            {product.isInstantlyAvailable && !product.isFree && (
              <Badge variant="secondary" className="bg-semantic-infoSoft text-semantic-info text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-3">
          <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-deakin-primary transition-colors">
            {product.name}
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">{product.providerName}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </CardDescription>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.categories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs text-gray-500 border-gray-200">
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>

        {/* Capabilities Preview */}
        <div className="text-xs text-gray-500 mb-3">
          <span className="font-medium">{product.capabilities.length} capabilities:</span>{' '}
          {product.capabilities.slice(0, 2).map((c) => c.name).join(', ')}
          {product.capabilities.length > 2 && `, +${product.capabilities.length - 2} more`}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-deakin-gold fill-deakin-gold" />
              <span>{product.rating}</span>
              {product.reviewCount && (
                <span className="text-gray-400">({formatNumber(product.reviewCount)})</span>
              )}
            </div>
          )}
          {product.installCount && (
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>{formatNumber(product.installCount)} installs</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">{getPricingLabel()}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(product);
              }}
              className="text-gray-600 hover:text-deakin-primary"
            >
              Details
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onInstall?.(product);
              }}
              className="bg-deakin-primary hover:bg-deakin-primary/90 text-white"
            >
              {product.pricing.type === 'contact-sales' ? 'Contact' : 'Install'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductListItemProps {
  product: MCPProduct;
  onInstall?: (product: MCPProduct) => void;
  onViewDetails?: (product: MCPProduct) => void;
}

export function ProductListItem({ product, onInstall, onViewDetails }: ProductListItemProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-deakin-primary/30 hover:shadow-level-1 transition-all cursor-pointer bg-white"
      onClick={() => onViewDetails?.(product)}
    >
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-semibold text-xs shrink-0">
        {product.providerName.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
          {product.isNew && (
            <Badge className="bg-deakin-teal text-white text-xs">New</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{product.description}</p>
      </div>

      {/* Install */}
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onInstall?.(product);
        }}
        className="bg-deakin-primary hover:bg-deakin-primary/90 text-white shrink-0"
      >
        Install
      </Button>
    </div>
  );
}
