import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export interface ExpenseLine {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  receiptUrl?: string;
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ExpenseReport {
  id: string;
  reportCode: string;
  employeeId: string;
  employeeName: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  purpose: string;
  periodStart: string;
  periodEnd: string;
  lines: ExpenseLine[];
  totalAmount: number;
  appliedCashAdvance?: number;
  netReimbursable: number;
  createdAt: Date;
  submittedAt?: Date;
}

interface ExpenseReportFormProps {
  report?: ExpenseReport;
  onSave: (report: Partial<ExpenseReport>) => void;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  'Meals',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Supplies',
  'Other',
];

export function ExpenseReportForm({ report, onSave, onCancel }: ExpenseReportFormProps) {
  const [purpose, setPurpose] = useState(report?.purpose || '');
  const [periodStart, setPeriodStart] = useState(report?.periodStart || '');
  const [periodEnd, setPeriodEnd] = useState(report?.periodEnd || '');
  const [lines, setLines] = useState<ExpenseLine[]>(report?.lines || []);

  const addLine = () => {
    const newLine: ExpenseLine = {
      id: `line-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      merchant: '',
      category: 'Meals',
      amount: 0,
      currency: 'PHP',
      description: '',
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (index: number, field: keyof ExpenseLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0);
    onSave({
      purpose,
      periodStart,
      periodEnd,
      lines,
      totalAmount,
      netReimbursable: totalAmount,
    });
  };

  const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Purpose *</Label>
            <Input
              placeholder="e.g., Q4 Client Meetings"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Lines</CardTitle>
            <Button size="sm" variant="outline" onClick={addLine}>
              + Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No expenses yet. Click &quot;Add Line&quot; to start.
            </p>
          ) : (
            lines.map((line, idx) => (
              <Card key={line.id} className="border-l-4" style={{ borderLeftColor: '#0070F2' }}>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={line.date}
                        onChange={(e) => updateLine(idx, 'date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        value={line.category}
                        onChange={(e) => updateLine(idx, 'category', e.target.value)}
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Merchant</Label>
                    <Input
                      placeholder="e.g., Starbucks"
                      value={line.merchant}
                      onChange={(e) => updateLine(idx, 'merchant', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        value={line.amount}
                        onChange={(e) => updateLine(idx, 'amount', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Currency</Label>
                      <Input value={line.currency} disabled />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      placeholder="Brief description..."
                      value={line.description}
                      onChange={(e) => updateLine(idx, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {line.ocrStatus && (
                    <Badge variant="secondary" className="text-xs">
                      OCR: {line.ocrStatus}
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-red-500"
                    onClick={() => removeLine(idx)}
                  >
                    Remove Line
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between">
            <span>Total Expenses:</span>
            <span className="text-xl">₱{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Applied Cash Advance:</span>
            <span>₱0.00</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-300">
            <span>Net Reimbursable:</span>
            <span className="text-xl text-blue-700">₱{totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!purpose || lines.length === 0} className="flex-1">
          Save Report
        </Button>
      </div>
    </div>
  );
}
