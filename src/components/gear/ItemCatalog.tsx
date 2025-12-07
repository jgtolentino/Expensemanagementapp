import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';

export interface GearItem {
  id: string;
  name: string;
  itemCode: string;
  category: string;
  status: 'available' | 'checked_out' | 'in_maintenance' | 'reserved' | 'retired';
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  serialNumber?: string;
  imageUrl?: string;
  description?: string;
  checkedOutTo?: string;
  dueDate?: string;
}

interface ItemCatalogProps {
  items: GearItem[];
  onItemClick: (item: GearItem) => void;
  onCheckout?: (item: GearItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  checked_out: '#F59E0B',
  in_maintenance: '#EF4444',
  reserved: '#3B82F6',
  retired: '#6B7280',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  checked_out: 'Checked Out',
  in_maintenance: 'Maintenance',
  reserved: 'Reserved',
  retired: 'Retired',
};

export function ItemCatalog({ items, onItemClick, onCheckout }: ItemCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map((item) => item.category)));
  const statuses = Array.from(new Set(items.map((item) => item.status)));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={categoryFilter === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(null)}
              >
                All Categories
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={statusFilter === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter(null)}
              >
                All Status
              </Badge>
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    backgroundColor: statusFilter === status ? STATUS_COLORS[status] : undefined,
                  }}
                >
                  {STATUS_LABELS[status]}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onItemClick(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${STATUS_COLORS[item.status]}20`,
                    color: STATUS_COLORS[item.status],
                  }}
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{item.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{item.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span>₱{item.currentValue.toLocaleString()}</span>
                </div>
                {item.checkedOutTo && (
                  <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
                    <div className="text-orange-800">
                      Checked out to: {item.checkedOutTo}
                    </div>
                    {item.dueDate && (
                      <div className="text-xs text-orange-600 mt-1">Due: {item.dueDate}</div>
                    )}
                  </div>
                )}
                {item.status === 'available' && onCheckout && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckout(item);
                    }}
                  >
                    Check Out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No items found matching your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
