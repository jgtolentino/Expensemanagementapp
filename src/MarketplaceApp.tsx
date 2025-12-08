import { useState } from 'react';
import { MCPMarketplace } from './components/marketplace';
import { MCPProduct, MCPProvider } from './components/marketplace/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import {
  CheckCircle2,
  ExternalLink,
  Settings,
  Star,
  Download,
  Zap,
  Code,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { CATEGORY_LABELS } from './components/marketplace/types';

export default function MarketplaceApp() {
  const [selectedProduct, setSelectedProduct] = useState<MCPProduct | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MCPProvider | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [productToInstall, setProductToInstall] = useState<MCPProduct | null>(null);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');

  const handleInstallProduct = (product: MCPProduct) => {
    setProductToInstall(product);
    setInstallDialogOpen(true);
    setInstallStatus('idle');
  };

  const handleConfirmInstall = async () => {
    if (!productToInstall) return;

    setInstallStatus('installing');

    // Simulate installation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setInstallStatus('success');

    // Close dialog after success
    setTimeout(() => {
      setInstallDialogOpen(false);
      setProductToInstall(null);
      setInstallStatus('idle');
    }, 1500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getCapabilityIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <Code className="w-4 h-4" />;
      case 'resource':
        return <FileText className="w-4 h-4" />;
      case 'prompt':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MCPMarketplace
        onInstallProduct={handleInstallProduct}
        onViewProductDetails={setSelectedProduct}
        onViewProviderDetails={setSelectedProvider}
      />

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {selectedProduct.providerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
                      {selectedProduct.isNew && (
                        <Badge className="bg-deakin-teal text-white">New</Badge>
                      )}
                      {selectedProduct.isFree && (
                        <Badge variant="secondary" className="bg-semantic-successSoft text-semantic-success">
                          Free
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="mt-1">
                      by {selectedProduct.providerName}
                    </DialogDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {selectedProduct.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-deakin-gold fill-deakin-gold" />
                          <span>{selectedProduct.rating}</span>
                          {selectedProduct.reviewCount && (
                            <span>({formatNumber(selectedProduct.reviewCount)} reviews)</span>
                          )}
                        </div>
                      )}
                      {selectedProduct.installCount && (
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{formatNumber(selectedProduct.installCount)} installs</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[50vh] pr-4">
                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{selectedProduct.description}</p>
                      {selectedProduct.longDescription && (
                        <p className="text-gray-600 mt-2">{selectedProduct.longDescription}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.categories.map((cat) => (
                          <Badge key={cat} variant="outline">
                            {CATEGORY_LABELS[cat]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="capabilities" className="mt-4">
                    <div className="space-y-3">
                      {selectedProduct.capabilities.map((cap) => (
                        <div
                          key={cap.id}
                          className="p-3 rounded-lg border border-gray-200 hover:border-deakin-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getCapabilityIcon(cap.type)}
                            <span className="font-medium text-gray-900">{cap.name}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {cap.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{cap.description}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-4">
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedProduct.pricing.type === 'free' && 'Free'}
                        {selectedProduct.pricing.type === 'freemium' && 'Freemium'}
                        {selectedProduct.pricing.type === 'paid' &&
                          `$${selectedProduct.pricing.startingPrice}/${selectedProduct.pricing.billingPeriod === 'monthly' ? 'month' : 'year'}`}
                        {selectedProduct.pricing.type === 'contact-sales' && 'Contact Sales'}
                      </div>
                      <p className="text-gray-600">
                        {selectedProduct.pricing.type === 'free' &&
                          'This product is completely free to use.'}
                        {selectedProduct.pricing.type === 'freemium' &&
                          'Free tier available with premium features.'}
                        {selectedProduct.pricing.type === 'paid' &&
                          'Paid subscription required.'}
                        {selectedProduct.pricing.type === 'contact-sales' &&
                          'Contact the provider for pricing information.'}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <DialogFooter className="mt-4">
                {selectedProduct.documentationUrl && (
                  <Button variant="outline" asChild>
                    <a href={selectedProduct.documentationUrl} target="_blank" rel="noopener">
                      Documentation
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedProduct(null);
                    handleInstallProduct(selectedProduct);
                  }}
                  className="bg-deakin-primary hover:bg-deakin-primary/90 text-white"
                >
                  {selectedProduct.pricing.type === 'contact-sales' ? 'Contact Sales' : 'Install Now'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Provider Details Dialog */}
      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent className="max-w-md">
          {selectedProvider && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-bold text-lg">
                    {selectedProvider.logoInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle>{selectedProvider.name}</DialogTitle>
                      {selectedProvider.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-deakin-primary" />
                      )}
                    </div>
                    {selectedProvider.isPartnerConnect && (
                      <Badge variant="secondary" className="mt-1">
                        Partner Connect
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4">
                <p className="text-gray-600">{selectedProvider.description}</p>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.categories.map((cat) => (
                      <Badge key={cat} variant="outline">
                        {CATEGORY_LABELS[cat]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                {selectedProvider.website && (
                  <Button variant="outline" asChild>
                    <a href={selectedProvider.website} target="_blank" rel="noopener">
                      Visit Website
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedProvider(null)}
                  className="bg-deakin-primary hover:bg-deakin-primary/90 text-white"
                >
                  View Products
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Installation Dialog */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="max-w-md">
          {productToInstall && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {installStatus === 'success' ? 'Installation Complete' : `Install ${productToInstall.name}`}
                </DialogTitle>
                <DialogDescription>
                  {installStatus === 'idle' &&
                    'This will add the MCP server to your agent configuration.'}
                  {installStatus === 'installing' && 'Installing MCP server...'}
                  {installStatus === 'success' &&
                    'The MCP server has been successfully installed and configured.'}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {installStatus === 'idle' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-deakin-primary to-deakin-purple flex items-center justify-center text-white font-semibold text-sm">
                          {productToInstall.providerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{productToInstall.name}</div>
                          <div className="text-sm text-gray-500">
                            {productToInstall.capabilities.length} capabilities
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      By installing, you agree to the provider's terms of service and privacy policy.
                    </p>
                  </div>
                )}

                {installStatus === 'installing' && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-deakin-primary"></div>
                  </div>
                )}

                {installStatus === 'success' && (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-semantic-successSoft flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-semantic-success" />
                    </div>
                    <p className="text-center text-gray-600">
                      You can now use {productToInstall.name} capabilities in your AI agents.
                    </p>
                  </div>
                )}
              </div>

              {installStatus === 'idle' && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmInstall}
                    className="bg-deakin-primary hover:bg-deakin-primary/90 text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
