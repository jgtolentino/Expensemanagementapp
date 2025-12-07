import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Plus, LogOut, LayoutDashboard, FileText } from "lucide-react";
import { LoginScreen } from "./ratecard/LoginScreen";
import { Dashboard } from "./ratecard/Dashboard";
import { RequestForm } from "./ratecard/RequestForm";
import { RequestList } from "./ratecard/RequestList";
import { RequestDetail } from "./ratecard/RequestDetail";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { User, Request, RequestDetails } from "./types";
import { api } from "./lib/api";

export default function RateCardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestDetails | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Load requests when user logs in
  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await api.getRequests(user.role, user.email);
      setRequests(data);
    } catch (error: any) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setRequests([]);
    setSelectedRequest(null);
    setShowCreateForm(false);
    setActiveTab("dashboard");
    toast.success("Logged out successfully");
  };

  const handleCreateRequest = async (data: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newRequest = await api.createRequest(data, user.email);
      setRequests([newRequest, ...requests]);
      setShowCreateForm(false);
      setActiveTab("quotes");
      toast.success("Quote created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (request: Request) => {
    setLoading(true);
    try {
      const details = await api.getRequest(request.id);
      setSelectedRequest(details);
    } catch (error: any) {
      toast.error("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (id: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updated = await api.submitRequest(id, user.email);
      setRequests(requests.map((r) => (r.id === id ? updated : r)));
      if (selectedRequest) {
        selectedRequest.request = updated;
      }
      toast.success("Quote submitted for approval");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quote");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id: number, note: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updated = await api.approveRequest(id, note, user.email);
      setRequests(requests.map((r) => (r.id === id ? updated : r)));
      if (selectedRequest) {
        selectedRequest.request = updated;
      }
      toast.success("Quote approved successfully");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve quote");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (id: number, note: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updated = await api.rejectRequest(id, note, user.email);
      setRequests(requests.map((r) => (r.id === id ? updated : r)));
      if (selectedRequest) {
        selectedRequest.request = updated;
      }
      toast.error("Quote rejected");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject quote");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (id: number, note: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updated = await api.reviewRequest(id, note, user.email);
      setRequests(requests.map((r) => (r.id === id ? updated : r)));
      if (selectedRequest) {
        selectedRequest.request = updated;
      }
      toast.success("Quote moved to review");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to review quote");
    } finally {
      setLoading(false);
    }
  };

  // Not logged in
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show request detail view
  if (selectedRequest) {
    return (
      <div 
        className="min-h-screen p-4"
        style={{ backgroundColor: "#F2F7F2" }}
      >
        <Toaster />
        <div className="max-w-4xl mx-auto">
          <RequestDetail
            details={selectedRequest}
            userRole={user.role}
            userEmail={user.email}
            onBack={() => setSelectedRequest(null)}
            onSubmit={handleSubmitRequest}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onReview={handleReviewRequest}
          />
        </div>
      </div>
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <div 
        className="min-h-screen p-4"
        style={{ backgroundColor: "#F2F7F2" }}
      >
        <Toaster />
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h2 className="text-2xl" style={{ color: "#386641" }}>
              Create New Quote
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to create a new rate card quote
            </p>
          </div>
          <RequestForm
            onSubmit={handleCreateRequest}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "#F2F7F2" }}
    >
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl" style={{ color: "#386641" }}>
                Rate Card Pro
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {user.name} • {user.role === "AM" ? "Account Manager" : "Finance Director"}
              </p>
            </div>
            <div className="flex gap-2">
              {user.role === "AM" && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  style={{ backgroundColor: "#386641" }}
                  className="hidden sm:flex"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Quote
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="quotes">
              <FileText className="h-4 w-4 mr-2" />
              Quotes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard requests={requests} userRole={user.role} />
          </TabsContent>

          <TabsContent value="quotes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl" style={{ color: "#386641" }}>
                  {user.role === "AM" ? "My Quotes" : "All Quotes"}
                </h2>
                {user.role === "AM" && (
                  <Button
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                    style={{ backgroundColor: "#386641" }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading quotes...
                </div>
              ) : (
                <RequestList
                  requests={requests}
                  onSelectRequest={handleSelectRequest}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button (Mobile) */}
      {user.role === "AM" && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
          onClick={() => setShowCreateForm(true)}
          style={{ backgroundColor: "#D4AC0D" }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
