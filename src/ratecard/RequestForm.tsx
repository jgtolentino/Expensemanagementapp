import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, X } from "lucide-react";
import { RequestItem, RoleTier } from "../types";
import { api } from "../lib/api";

interface RequestFormProps {
  onSubmit: (data: {
    name: string;
    project_code?: string;
    client_name?: string;
    items: Array<{ description: string; qty: number; rate: number }>;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function RequestForm({ onSubmit, onCancel }: RequestFormProps) {
  const [name, setName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<RequestItem[]>([
    { description: "", qty: 1, rate: 0, subtotal: 0 },
  ]);
  const [roleTiers, setRoleTiers] = useState<RoleTier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getRoles().then(setRoleTiers);
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, rate: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate subtotal
    if (field === "qty" || field === "rate") {
      updated[index].subtotal = updated[index].qty * updated[index].rate;
    }
    
    setItems(updated);
  };

  const selectRoleTier = (index: number, tierId: string) => {
    const tier = roleTiers.find(t => t.id.toString() === tierId);
    if (tier) {
      updateItem(index, "description", tier.name);
      updateItem(index, "rate", tier.hourly_rate);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.12;
  const grandTotal = subtotal + tax;

  const handleSubmit = () => {
    if (!name || items.some(i => !i.description || i.qty <= 0)) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      name,
      project_code: projectCode || undefined,
      client_name: clientName || undefined,
      items: items.map(i => ({
        description: i.description,
        qty: i.qty,
        rate: i.rate,
      })),
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Quote Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Q4 Mobile App Development"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project Code</Label>
            <Input
              id="project"
              placeholder="PROJ-2025-001"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input
              id="client"
              placeholder="Client Company"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Line Items *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              style={{ borderColor: "#386641", color: "#386641" }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Role/Description</Label>
                    <Select
                      value=""
                      onValueChange={(value) => selectRoleTier(index, value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Quick select role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roleTiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id.toString()}>
                            {tier.name} (₱{tier.hourly_rate.toLocaleString()}/hr)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or enter custom description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="mt-5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Qty (hrs)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rate (₱)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={item.rate}
                      onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subtotal</Label>
                    <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm">
                      ₱{item.subtotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes for this quote..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Totals Summary */}
      <Card style={{ backgroundColor: "#F2F7F2", borderColor: "#386641" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quote Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12%):</span>
            <span>₱{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#386641" }}>
            <span style={{ color: "#D4AC0D" }}>Grand Total:</span>
            <span style={{ color: "#D4AC0D" }}>
              ₱{grandTotal.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2 z-10">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          style={{ backgroundColor: "#386641" }}
        >
          Create Quote
        </Button>
      </div>
    </div>
  );
}
