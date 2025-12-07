import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Navigation } from "lucide-react";
import { format } from "date-fns";

interface MileageExpenseFormProps {
  onSubmit: (expense: any) => void;
  onCancel: () => void;
  travelRequestId?: string;
}

export function MileageExpenseForm({ onSubmit, onCancel, travelRequestId }: MileageExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startOdometer, setStartOdometer] = useState("");
  const [endOdometer, setEndOdometer] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [description, setDescription] = useState("");
  
  const MILEAGE_RATE = 0.67; // USD per km (IRS standard rate)

  const distance = endOdometer && startOdometer 
    ? parseFloat(endOdometer) - parseFloat(startOdometer) 
    : 0;
  
  const totalAmount = distance * MILEAGE_RATE;

  const handleSubmit = () => {
    if (!title || !date || !startOdometer || !endOdometer) return;

    onSubmit({
      title,
      category: "fuel",
      amount: totalAmount,
      date,
      description: `${description}\n\nMileage: ${distance.toFixed(1)} km @ $${MILEAGE_RATE}/km\nOdometer: ${startOdometer} - ${endOdometer}`,
      status: "submitted",
      employee: "Current User",
      paymentMethod: "company_card",
      isMileage: true,
      startOdometer: parseFloat(startOdometer),
      endOdometer: parseFloat(endOdometer),
      distance,
      vehicle,
      travelRequestId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Trip Description *</Label>
          <Input
            id="title"
            placeholder="e.g., Client Visit - Downtown Office"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start Odometer (km) *</Label>
            <Input
              id="start"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">End Odometer (km) *</Label>
            <Input
              id="end"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle</Label>
          <Input
            id="vehicle"
            placeholder="e.g., Company Car #123 or Personal Vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Additional Notes</Label>
          <Textarea
            id="description"
            placeholder="Route taken, purpose of trip, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {distance > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span>Mileage Calculation</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span>{distance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span>${MILEAGE_RATE}/km</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total Reimbursement:</span>
                <span className="text-lg">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!title || !date || !startOdometer || !endOdometer}>
          Submit Mileage Expense
        </Button>
      </div>
    </div>
  );
}
