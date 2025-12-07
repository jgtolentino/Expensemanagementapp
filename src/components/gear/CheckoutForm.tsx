import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { GearItem } from './ItemCatalog';

export interface Checkout {
  id: string;
  itemId: string;
  itemName: string;
  checkedOutTo: string;
  checkedOutBy: string;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
  purpose: string;
  notes?: string;
  depositAmount?: number;
  depositStatus?: 'held' | 'returned' | 'forfeited';
}

interface CheckoutFormProps {
  item: GearItem;
  currentUser: string;
  onSave: (checkout: Partial<Checkout>) => void;
  onCancel: () => void;
}

export function CheckoutForm({ item, currentUser, onSave, onCancel }: CheckoutFormProps) {
  const [checkedOutTo, setCheckedOutTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  // Set default due date to 7 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);

  const handleSubmit = () => {
    onSave({
      itemId: item.id,
      itemName: item.name,
      checkedOutTo,
      checkedOutBy: currentUser,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate,
      purpose,
      notes,
      depositAmount: requireDeposit ? depositAmount : undefined,
      depositStatus: requireDeposit ? 'held' : undefined,
      status: 'active',
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Check Out Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900">{item.name}</div>
            <div className="text-sm text-blue-700">{item.itemCode}</div>
            <div className="text-xs text-blue-600 mt-1">
              {item.category} • {item.location}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Checked Out To *</Label>
            <Input
              placeholder="Employee name or project"
              value={checkedOutTo}
              onChange={(e) => setCheckedOutTo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Checkout Date</Label>
              <Input type="date" value={new Date().toISOString().split('T')[0]} disabled />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Purpose *</Label>
            <Textarea
              placeholder="e.g., Product photoshoot, Client presentation"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any special instructions or conditions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="require-deposit"
                checked={requireDeposit}
                onChange={(e) => setRequireDeposit(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="require-deposit" className="cursor-pointer">
                Require Security Deposit
              </Label>
            </div>

            {requireDeposit && (
              <div className="space-y-2">
                <Label>Deposit Amount (PHP)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Deposit will be held until item is returned in good condition
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="text-yellow-800">
              <strong>Reminder:</strong> User is responsible for the item until it is checked back
              in. Any damage or loss may result in replacement charges.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!checkedOutTo || !dueDate || !purpose}
          className="flex-1"
          style={{ backgroundColor: '#7C3AED' }}
        >
          Complete Checkout
        </Button>
      </div>
    </div>
  );
}
