import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface RateCard {
  id: string;
  name: string;
  role: string;
  discipline: 'strategy' | 'creative' | 'production' | 'post' | 'digital' | 'social' | 'media' | 'other';
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'director' | 'executive';
  market: string;
  vendorId?: string;
  vendorName?: string;
  productId: string;
  productName: string;
  unitOfMeasure: 'day' | 'hour' | 'project';
  costRate: number;
  clientRate: number;
  marginPct: number;
  currency: string;
  state: 'draft' | 'active' | 'archived';
  notes?: string;
}

interface RateCardManagerProps {
  rateCards: RateCard[];
  userRole: 'am' | 'fd';
  onEdit?: (card: RateCard) => void;
  onSelect?: (card: RateCard) => void;
}

const DISCIPLINE_COLORS: Record<string, string> = {
  strategy: '#3B82F6',
  creative: '#8B5CF6',
  production: '#F59E0B',
  post: '#10B981',
  digital: '#06B6D4',
  social: '#EC4899',
  media: '#6366F1',
  other: '#6B7280',
};

const DISCIPLINE_LABELS: Record<string, string> = {
  strategy: 'Strategy',
  creative: 'Creative',
  production: 'Production',
  post: 'Post-Production',
  digital: 'Digital',
  social: 'Social',
  media: 'Media',
  other: 'Other',
};

export function RateCardManager({ rateCards, userRole, onEdit, onSelect }: RateCardManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string | null>(null);
  const [seniorityFilter, setSeniorityFilter] = useState<string | null>(null);

  const disciplines = Array.from(new Set(rateCards.map((rc) => rc.discipline)));
  const seniorities = Array.from(new Set(rateCards.map((rc) => rc.seniorityLevel)));

  const filteredCards = rateCards.filter((card) => {
    const matchesSearch =
      searchQuery === '' ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline = !disciplineFilter || card.discipline === disciplineFilter;
    const matchesSeniority = !seniorityFilter || card.seniorityLevel === seniorityFilter;
    return matchesSearch && matchesDiscipline && matchesSeniority;
  });

  const isFD = userRole === 'fd';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Input
              placeholder="Search by role or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2">
              <Label className="text-xs">Discipline</Label>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={disciplineFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setDisciplineFilter(null)}
                >
                  All
                </Badge>
                {disciplines.map((disc) => (
                  <Badge
                    key={disc}
                    variant={disciplineFilter === disc ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setDisciplineFilter(disc)}
                    style={{
                      backgroundColor: disciplineFilter === disc ? DISCIPLINE_COLORS[disc] : undefined,
                    }}
                  >
                    {DISCIPLINE_LABELS[disc]}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Seniority</Label>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={seniorityFilter === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSeniorityFilter(null)}
                >
                  All
                </Badge>
                {seniorities.map((sen) => (
                  <Badge
                    key={sen}
                    variant={seniorityFilter === sen ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSeniorityFilter(sen)}
                  >
                    {sen.charAt(0).toUpperCase() + sen.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelect && onSelect(card)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{card.role}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {card.seniorityLevel} • {card.market}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${DISCIPLINE_COLORS[card.discipline]}20`,
                    color: DISCIPLINE_COLORS[card.discipline],
                  }}
                >
                  {DISCIPLINE_LABELS[card.discipline]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit:</span>
                  <span className="capitalize">{card.unitOfMeasure}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client Rate:</span>
                  <span className="font-medium">
                    {card.currency} {card.clientRate.toLocaleString()}
                  </span>
                </div>

                {/* FD-only fields */}
                {isFD && (
                  <>
                    <div className="pt-2 border-t space-y-2">
                      {card.vendorName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vendor:</span>
                          <span className="text-xs">{card.vendorName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost Rate:</span>
                        <span className="text-orange-600">
                          {card.currency} {card.costRate.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Margin:</span>
                        <span
                          className="font-medium"
                          style={{
                            color: card.marginPct > 30 ? '#10B981' : card.marginPct > 15 ? '#F59E0B' : '#EF4444',
                          }}
                        >
                          {card.marginPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {onSelect && (
                <Button size="sm" className="w-full" onClick={() => onSelect(card)}>
                  {isFD ? 'View Details' : 'Use in Quote'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No rate cards found matching your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
