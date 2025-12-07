import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export interface CashAdvance {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'disbursed' | 'settled' | 'cancelled';
  requestedAmount: number;
  approvedAmount?: number;
  currency: string;
  purpose: string;
  neededDate: string;
  tripId?: string;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  settledAmount?: number;
  outstandingAmount?: number;
}

interface CashAdvanceFormProps {
  advance?: CashAdvance;
  onSave: (advance: Partial<CashAdvance>) => void;
  onCancel: () => void;
}

export function CashAdvanceForm({ advance, onSave, onCancel }: CashAdvanceFormProps) {
  const [purpose, setPurpose] = useState(advance?.purpose || '');
  const [requestedAmount, setRequestedAmount] = useState(advance?.requestedAmount || 0);
  const [neededDate, setNeededDate] = useState(advance?.neededDate || '');

  const handleSave = () => {
    onSave({
      purpose,
      requestedAmount,
      neededDate,
      currency: 'PHP',
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cash Advance Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Purpose *</Label>
            <Textarea
              placeholder="e.g., Travel expenses for Manila client visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount Requested (PHP) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Needed By</Label>
              <Input
                type="date"
                value={neededDate}
                onChange={(e) => setNeededDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="text-yellow-800">
              <strong>Note:</strong> Cash advances must be settled within 30 days of disbursement by submitting
              an expense report with receipts.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!purpose || requestedAmount <= 0}
          className="flex-1"
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
}
