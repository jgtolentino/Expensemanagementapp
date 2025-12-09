import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  status: 'active' | 'planned' | 'beta';
  category: string;
}

interface AppFeaturesProps {
  appName: string;
  appColor: string;
  features: Feature[];
  quickActions?: Array<{
    label: string;
    description: string;
    icon: string;
  }>;
}

export default function AppFeatures({ appName, appColor, features, quickActions }: AppFeaturesProps) {
  const statusColors = {
    active: '#10B981',
    beta: '#F59E0B',
    planned: '#6B7280',
  };

  const statusLabels = {
    active: 'Active',
    beta: 'Beta',
    planned: 'Planned',
  };

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2" style={{ color: appColor }}>
          {appName} Features
        </h2>
        <p className="text-muted-foreground">
          Explore the key capabilities and features available in this application
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{action.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Categories */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {categoryFeatures.filter((f) => f.status === 'active').length} of{' '}
              {categoryFeatures.length} features active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="mt-0.5">
                    {feature.status === 'active' ? (
                      <CheckCircle2
                        className="h-5 w-5"
                        style={{ color: statusColors[feature.status] }}
                      />
                    ) : (
                      <Circle
                        className="h-5 w-5"
                        style={{ color: statusColors[feature.status] }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feature.name}</span>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[feature.status]}20`,
                          color: statusColors[feature.status],
                        }}
                      >
                        {statusLabels[feature.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Feature Summary */}
      <Card style={{ borderColor: appColor, backgroundColor: `${appColor}10` }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl" style={{ color: statusColors.active }}>
                {features.filter((f) => f.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Active Features</p>
            </div>
            <div>
              <div className="text-2xl" style={{ color: statusColors.beta }}>
                {features.filter((f) => f.status === 'beta').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Beta Features</p>
            </div>
            <div>
              <div className="text-2xl" style={{ color: statusColors.planned }}>
                {features.filter((f) => f.status === 'planned').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Planned Features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
