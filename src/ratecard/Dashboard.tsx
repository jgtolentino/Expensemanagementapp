import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Request, UserRole } from "../types";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface DashboardProps {
  requests: Request[];
  userRole: UserRole;
}

export function Dashboard({ requests, userRole }: DashboardProps) {
  const draft = requests.filter((r) => r.state === "draft");
  const submitted = requests.filter((r) => r.state === "submitted");
  const approved = requests.filter((r) => r.state === "approved");
  const rejected = requests.filter((r) => r.state === "rejected");
  const fdReview = requests.filter((r) => r.state === "fd_review");

  const totalValue = requests
    .filter((r) => r.state === "approved")
    .reduce((sum, r) => {
      const totals = JSON.parse(r.totals_json || "{}");
      return sum + (totals.grand_total || 0);
    }, 0);

  const stats = [
    {
      title: "Draft Quotes",
      value: draft.length,
      icon: FileText,
      color: "#6B7280",
      show: userRole === "AM",
    },
    {
      title: "Pending Approval",
      value: submitted.length + fdReview.length,
      icon: Clock,
      color: "#F59E0B",
      show: true,
    },
    {
      title: "Approved",
      value: approved.length,
      icon: CheckCircle,
      color: "#10B981",
      show: true,
    },
    {
      title: "Rejected",
      value: rejected.length,
      icon: XCircle,
      color: "#EF4444",
      show: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2" style={{ color: "#386641" }}>
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          {userRole === "AM" ? "Account Manager" : "Finance Director"} Overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats
          .filter((stat) => stat.show)
          .map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {userRole === "FD" && approved.length > 0 && (
        <Card style={{ backgroundColor: "#F2F7F2", borderColor: "#D4AC0D" }}>
          <CardHeader>
            <CardTitle className="text-sm">Approved Quotes Value</CardTitle>
            <CardDescription>Total value of all approved quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl" style={{ color: "#D4AC0D" }}>
              ₱{totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Quotes:</span>
            <span>{requests.length}</span>
          </div>
          {userRole === "AM" && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Awaiting Your Action:</span>
                <span>{draft.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span>{submitted.length + fdReview.length}</span>
              </div>
            </>
          )}
          {userRole === "FD" && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Awaiting Review:</span>
                <span>{submitted.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Review:</span>
                <span>{fdReview.length}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approved:</span>
            <span>{approved.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
