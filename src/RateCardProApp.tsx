import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Textarea } from "./components/ui/textarea";
import { Alert, AlertDescription } from "./components/ui/alert";
import FeatureShowcase from "./components/FeatureShowcase";

// Simple types
type UserRole = "AM" | "FD";
type QuoteStatus = "draft" | "submitted" | "approved" | "rejected";

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface LineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

interface Quote {
  id: string;
  name: string;
  client: string;
  status: QuoteStatus;
  items: LineItem[];
  createdBy: string;
  createdAt: Date;
}

export default function RateCardProApp() {
  const [user, setUser] = useState<User | null>(null);
  const [showShowcase, setShowShowcase] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "Q001",
      name: "Mobile App Development",
      client: "TechCorp Inc.",
      status: "submitted",
      items: [
        { id: "1", description: "Senior Developer", hours: 40, rate: 6500 },
        { id: "2", description: "UX Designer", hours: 20, rate: 5500 },
      ],
      createdBy: "am@example.com",
      createdAt: new Date("2025-10-15"),
    },
    {
      id: "Q002",
      name: "Website Redesign",
      client: "RetailMax",
      status: "approved",
      items: [
        { id: "3", description: "Tech Lead", hours: 30, rate: 8500 },
      ],
      createdBy: "am@example.com",
      createdAt: new Date("2025-10-10"),
    },
  ]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // New quote form state
  const [newQuoteName, setNewQuoteName] = useState("");
  const [newQuoteClient, setNewQuoteClient] = useState("");
  const [newItems, setNewItems] = useState<LineItem[]>([
    { id: "temp1", description: "", hours: 1, rate: 0 },
  ]);

  const COLORS = {
    primary: "#386641",
    bg: "#F2F7F2",
    accent: "#D4AC0D",
  };

  const statusColors: Record<QuoteStatus, string> = {
    draft: "#6B7280",
    submitted: "#3B82F6",
    approved: "#10B981",
    rejected: "#EF4444",
  };

  // Login handlers
  const handleLogin = (role: UserRole) => {
    const users = {
      AM: { email: "am@example.com", name: "Account Manager", role: "AM" as UserRole },
      FD: { email: "fd@example.com", name: "Finance Director", role: "FD" as UserRole },
    };
    setUser(users[role]);
  };

  // Quote handlers
  const calculateTotal = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.hours * item.rate, 0);
    const tax = subtotal * 0.12;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreateQuote = () => {
    if (!newQuoteName || !user) return;

    const newQuote: Quote = {
      id: `Q${String(quotes.length + 1).padStart(3, "0")}`,
      name: newQuoteName,
      client: newQuoteClient,
      status: "draft",
      items: newItems.filter((item) => item.description),
      createdBy: user.email,
      createdAt: new Date(),
    };

    setQuotes([newQuote, ...quotes]);
    setShowCreateForm(false);
    setNewQuoteName("");
    setNewQuoteClient("");
    setNewItems([{ id: "temp1", description: "", hours: 1, rate: 0 }]);
    setActiveTab("quotes");
  };

  const handleSubmitQuote = (quoteId: string) => {
    setQuotes(
      quotes.map((q) => (q.id === quoteId ? { ...q, status: "submitted" as QuoteStatus } : q))
    );
    setSelectedQuote(null);
  };

  const handleApproveQuote = (quoteId: string) => {
    setQuotes(
      quotes.map((q) => (q.id === quoteId ? { ...q, status: "approved" as QuoteStatus } : q))
    );
    setSelectedQuote(null);
  };

  const handleRejectQuote = (quoteId: string) => {
    setQuotes(
      quotes.map((q) => (q.id === quoteId ? { ...q, status: "rejected" as QuoteStatus } : q))
    );
    setSelectedQuote(null);
  };

  const addLineItem = () => {
    setNewItems([
      ...newItems,
      { id: `temp${newItems.length + 1}`, description: "", hours: 1, rate: 0 },
    ]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  const removeLineItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  // Filter quotes by role
  const filteredQuotes =
    user?.role === "AM"
      ? quotes.filter((q) => q.createdBy === user.email)
      : quotes.filter((q) => q.status !== "draft");

  // Login Screen
  if (!user) {
    // Show feature showcase if requested
    if (showShowcase) {
      return (
        <div>
          <Button
            className="fixed top-4 right-4 z-20"
            variant="outline"
            onClick={() => setShowShowcase(false)}
          >
            × Close
          </Button>
          <FeatureShowcase />
        </div>
      );
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: COLORS.bg }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: COLORS.primary }}>
              Rate Card Pro
            </CardTitle>
            <CardDescription>Mobile-first quote management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">Demo Login:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleLogin("AM")}
                style={{ backgroundColor: COLORS.primary }}
              >
                Account Manager
              </Button>
              <Button
                onClick={() => handleLogin("FD")}
                style={{ backgroundColor: COLORS.accent }}
              >
                Finance Director
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowShowcase(true)}
            >
              View Features
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quote Detail View
  if (selectedQuote) {
    const totals = calculateTotal(selectedQuote.items);
    const canSubmit = user.role === "AM" && selectedQuote.status === "draft";
    const canApprove = user.role === "FD" && selectedQuote.status === "submitted";

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setSelectedQuote(null)}>
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedQuote.name}</CardTitle>
                  <CardDescription>Quote #{selectedQuote.id}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColors[selectedQuote.status]}20`,
                    color: statusColors[selectedQuote.status],
                  }}
                >
                  {selectedQuote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span>{selectedQuote.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span>{selectedQuote.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{selectedQuote.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedQuote.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.hours} hrs × ₱{item.rate.toLocaleString()}/hr
                      </div>
                    </div>
                    <div>₱{(item.hours * item.rate).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: COLORS.bg, borderColor: COLORS.primary }}>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (12%):</span>
                <span>₱{totals.tax.toLocaleString()}</span>
              </div>
              <div
                className="flex justify-between text-lg pt-2 border-t"
                style={{ color: COLORS.accent, borderColor: COLORS.primary }}
              >
                <span>Total:</span>
                <span>₱{totals.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {canSubmit && (
            <Button
              className="w-full"
              onClick={() => handleSubmitQuote(selectedQuote.id)}
              style={{ backgroundColor: COLORS.primary }}
            >
              Submit for Approval
            </Button>
          )}

          {canApprove && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleRejectQuote(selectedQuote.id)}
                className="border-red-500 text-red-500"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApproveQuote(selectedQuote.id)}
                style={{ backgroundColor: "#10B981" }}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create Quote Form
  if (showCreateForm) {
    const totals = calculateTotal(newItems.filter((i) => i.description));

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            ← Cancel
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create New Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quote Name *</Label>
                <Input
                  placeholder="e.g., Mobile App Development"
                  value={newQuoteName}
                  onChange={(e) => setNewQuoteName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  placeholder="Client company"
                  value={newQuoteClient}
                  onChange={(e) => setNewQuoteClient(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addLineItem}
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  >
                    + Add
                  </Button>
                </div>

                {newItems.map((item, idx) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="e.g., Senior Developer"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Hours</Label>
                          <Input
                            type="number"
                            value={item.hours}
                            onChange={(e) => updateLineItem(idx, "hours", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rate (₱)</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(idx, "rate", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Total</Label>
                          <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm">
                            ₱{(item.hours * item.rate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {newItems.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLineItem(idx)}
                          className="w-full text-red-500"
                        >
                          Remove
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: COLORS.bg, borderColor: COLORS.primary }}>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (12%):</span>
                <span>₱{totals.tax.toLocaleString()}</span>
              </div>
              <div
                className="flex justify-between text-lg pt-2 border-t"
                style={{ color: COLORS.accent }}
              >
                <span>Total:</span>
                <span>₱{totals.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={handleCreateQuote}
            disabled={!newQuoteName}
            style={{ backgroundColor: COLORS.primary }}
          >
            Create Quote
          </Button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  const draftCount = filteredQuotes.filter((q) => q.status === "draft").length;
  const submittedCount = filteredQuotes.filter((q) => q.status === "submitted").length;
  const approvedCount = filteredQuotes.filter((q) => q.status === "approved").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl" style={{ color: COLORS.primary }}>
                Rate Card Pro
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.name} • {user.role === "AM" ? "Account Manager" : "Finance Director"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setUser(null)}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-xl" style={{ color: COLORS.primary }}>
              Dashboard
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: "#6B7280" }}>
                    {draftCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Draft</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: "#3B82F6" }}>
                    {submittedCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl" style={{ color: "#10B981" }}>
                    {approvedCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Approved</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredQuotes.slice(0, 5).map((quote) => (
                    <div key={quote.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{quote.name}</div>
                        <div className="text-xs text-muted-foreground">{quote.client}</div>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${statusColors[quote.status]}20`,
                          color: statusColors[quote.status],
                        }}
                      >
                        {quote.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: COLORS.primary }}>
                {user.role === "AM" ? "My Quotes" : "All Quotes"}
              </h2>
              {user.role === "AM" && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  style={{ backgroundColor: COLORS.primary }}
                >
                  + New Quote
                </Button>
              )}
            </div>

            {filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No quotes found</p>
                  <p className="text-sm">Create your first quote to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredQuotes.map((quote) => {
                  const totals = calculateTotal(quote.items);
                  return (
                    <Card
                      key={quote.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{quote.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {quote.client} • {quote.createdAt.toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${statusColors[quote.status]}20`,
                              color: statusColors[quote.status],
                            }}
                          >
                            {quote.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="text-lg" style={{ color: COLORS.accent }}>
                              ₱{totals.total.toLocaleString()}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button (Mobile) */}
      {user.role === "AM" && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
          onClick={() => setShowCreateForm(true)}
          style={{ backgroundColor: COLORS.accent }}
        >
          +
        </Button>
      )}
    </div>
  );
}
