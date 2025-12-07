import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";

export interface TravelDestination {
  city: string;
  country: string;
  durationDays: number;
}

export interface TravelRequest {
  id: string;
  name: string;
  employee: string;
  travelType: "domestic" | "international" | "local";
  purpose: string;
  departureDate: Date;
  returnDate: Date;
  destinations: TravelDestination[];
  estimatedBudget: number;
  advancePayment: number;
  status: "draft" | "submitted" | "manager_approved" | "hr_approved" | "approved" | "ongoing" | "completed" | "cancelled";
  project?: string;
  customer?: string;
  riskLevel?: "low" | "medium" | "high";
  visaRequired?: boolean;
}

interface TravelRequestFormProps {
  onSubmit: (request: Omit<TravelRequest, "id">) => void;
  onCancel: () => void;
  initialData?: TravelRequest;
}

export function TravelRequestForm({ onSubmit, onCancel, initialData }: TravelRequestFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [travelType, setTravelType] = useState<string>(initialData?.travelType || "");
  const [purpose, setPurpose] = useState(initialData?.purpose || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    initialData?.departureDate || undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialData?.returnDate || undefined
  );
  const [destinations, setDestinations] = useState<TravelDestination[]>(
    initialData?.destinations || [{ city: "", country: "", durationDays: 1 }]
  );
  const [estimatedBudget, setEstimatedBudget] = useState(
    initialData?.estimatedBudget?.toString() || ""
  );
  const [advancePayment, setAdvancePayment] = useState(
    initialData?.advancePayment?.toString() || ""
  );
  const [project, setProject] = useState(initialData?.project || "");
  const [customer, setCustomer] = useState(initialData?.customer || "");
  const [riskLevel, setRiskLevel] = useState<string>(initialData?.riskLevel || "");
  const [visaRequired, setVisaRequired] = useState(initialData?.visaRequired || false);

  const addDestination = () => {
    setDestinations([...destinations, { city: "", country: "", durationDays: 1 }]);
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const updateDestination = (index: number, field: keyof TravelDestination, value: any) => {
    const updated = [...destinations];
    updated[index] = { ...updated[index], [field]: value };
    setDestinations(updated);
  };

  const handleSubmit = (status: "draft" | "submitted") => {
    if (!name || !travelType || !purpose || !departureDate || !returnDate) return;

    onSubmit({
      name,
      employee: "Current User",
      travelType: travelType as any,
      purpose,
      departureDate,
      returnDate,
      destinations: destinations.filter((d) => d.city && d.country),
      estimatedBudget: parseFloat(estimatedBudget) || 0,
      advancePayment: parseFloat(advancePayment) || 0,
      status,
      project: project || undefined,
      customer: customer || undefined,
      riskLevel: riskLevel as any || undefined,
      visaRequired: visaRequired || undefined,
    });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Request Title *</Label>
          <Input
            id="name"
            placeholder="e.g., Q4 Sales Conference - Las Vegas"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Travel Type *</Label>
            <Select value={travelType} onValueChange={setTravelType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {travelType === "international" && (
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Travel Purpose *</Label>
          <Textarea
            id="purpose"
            placeholder="Describe the business purpose of this travel..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Departure Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Return Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Destinations *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addDestination}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {destinations.map((dest, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                placeholder="City"
                value={dest.city}
                onChange={(e) => updateDestination(index, "city", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Country"
                value={dest.country}
                onChange={(e) => updateDestination(index, "country", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Days"
                value={dest.durationDays}
                onChange={(e) => updateDestination(index, "durationDays", parseInt(e.target.value))}
                className="w-20"
              />
              {destinations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDestination(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project/Initiative</Label>
            <Input
              id="project"
              placeholder="Project name (optional)"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer/Client</Label>
            <Input
              id="customer"
              placeholder="Customer name (optional)"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">Advance Payment ($)</Label>
            <Input
              id="advance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={advancePayment}
              onChange={(e) => setAdvancePayment(e.target.value)}
            />
          </div>
        </div>

        {travelType === "international" && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visa"
              checked={visaRequired}
              onChange={(e) => setVisaRequired(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="visa" className="cursor-pointer">
              Visa Required
            </Label>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSubmit("draft")}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit("submitted")}>Submit Request</Button>
      </div>
    </div>
  );
}
