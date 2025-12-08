import { MCPProvider } from './types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ProviderCardProps {
  provider: MCPProvider;
  onClick?: (provider: MCPProvider) => void;
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-level-2 hover:border-deakin-primary/30 bg-white border-gray-200"
      onClick={() => onClick?.(provider)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {provider.logoInitials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{provider.name}</h3>
            {provider.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-deakin-primary shrink-0" />
            )}
          </div>
          {provider.isPartnerConnect && (
            <Badge variant="secondary" className="mt-1 text-xs bg-gray-100 text-gray-600">
              Partner Connect
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProviderAvatarProps {
  provider: MCPProvider;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (provider: MCPProvider) => void;
}

export function ProviderAvatar({ provider, size = 'md', onClick }: ProviderAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={() => onClick?.(provider)}
    >
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-semibold shadow-level-1 group-hover:shadow-level-2 transition-shadow`}
      >
        {provider.logoInitials}
      </div>
      <span className="text-xs text-gray-600 text-center truncate max-w-[80px] group-hover:text-deakin-primary transition-colors">
        {provider.name}
      </span>
    </div>
  );
}
