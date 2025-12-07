import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  receipt?: string;
  employee: string;
  paymentMethod?: "cash" | "company_card" | "personal_card";
  currency?: string;
  travelRequestId?: string;
  isMileage?: boolean;
  startOdometer?: number;
  endOdometer?: number;
  distance?: number;
  vehicle?: string;
  policyViolation?: string;
  billable?: boolean;
}

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
  onCancel: () => void;
  initialData?: Expense;
  travelRequestId?: string;
}

const categories = [
  { value: "flight", label: "Flight" },
  { value: "hotel", label: "Hotel/Accommodation" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "transport", label: "Local Transportation" },
  { value: "fuel", label: "Fuel/Mileage" },
  { value: "parking", label: "Parking" },
  { value: "toll", label: "Toll" },
  { value: "visa", label: "Visa/Immigration" },
  { value: "insurance", label: "Travel Insurance" },
  { value: "conference", label: "Conference/Training" },
  { value: "entertainment", label: "Client Entertainment" },
  { value: "communication", label: "Phone/Internet" },
  { value: "office", label: "Office Supplies" },
  { value: "other", label: "Other" },
];

export function ExpenseForm({ onSubmit, onCancel, initialData, travelRequestId }: ExpenseFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [amount, setAmount] = useState(initialData?.amount.toString() || "");
  const [date, setDate] = useState<Date | undefined>(initialData?.date || new Date());
  const [description, setDescription] = useState(initialData?.description || "");
  const [receipt, setReceipt] = useState(initialData?.receipt || "");
  const [paymentMethod, setPaymentMethod] = useState<string>(initialData?.paymentMethod || "cash");
  const [currency, setCurrency] = useState(initialData?.currency || "USD");
  const [billable, setBillable] = useState(initialData?.billable || false);

  const handleSubmit = (status: "draft" | "submitted") => {
    if (!title || !category || !amount || !date) return;

    onSubmit({
      title,
      category,
      amount: parseFloat(amount),
      date,
      description,
      status,
      receipt,
      employee: "Current User",
      paymentMethod: paymentMethod as any,
      currency,
      travelRequestId,
      billable,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Expense Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Team Lunch, Hotel in Paris"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add notes about this expense..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt">Receipt (URL)</Label>
          <div className="flex gap-2">
            <Input
              id="receipt"
              placeholder="https://..."
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="personal_card">Personal Credit Card</SelectItem>
                <SelectItem value="company_card">Company Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="billable"
            checked={billable}
            onChange={(e) => setBillable(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="billable" className="cursor-pointer">
            Billable to Client
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSubmit("draft")}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit("submitted")}>
          Submit Expense
        </Button>
      </div>
    </div>
  );
}
