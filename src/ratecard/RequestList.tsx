import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ChevronRight, FileText } from "lucide-react";
import { Request, RequestState } from "../types";

interface RequestListProps {
  requests: Request[];
  onSelectRequest: (request: Request) => void;
}

const stateColors: Record<RequestState, string> = {
  draft: "#6B7280",
  submitted: "#3B82F6",
  fd_review: "#8B5CF6",
  approved: "#10B981",
  rejected: "#EF4444",
};

const stateLabels: Record<RequestState, string> = {
  draft: "Draft",
  submitted: "Submitted",
  fd_review: "FD Review",
  approved: "Approved",
  rejected: "Rejected",
};

export function RequestList({ requests, onSelectRequest }: RequestListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No quotes found</p>
          <p className="text-sm">Create your first quote to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const totals = JSON.parse(request.totals_json || "{}");
        
        return (
          <Card 
            key={request.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectRequest(request)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{request.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {request.project_code && (
                      <span className="mr-3">📋 {request.project_code}</span>
                    )}
                    {request.client_name && (
                      <span>👤 {request.client_name}</span>
                    )}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${stateColors[request.state]}20`,
                    color: stateColors[request.state],
                    borderColor: stateColors[request.state],
                  }}
                  className="border shrink-0"
                >
                  {stateLabels[request.state]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Grand Total</div>
                  <div className="text-lg" style={{ color: "#D4AC0D" }}>
                    ₱{totals.grand_total?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(request.updated_at)}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-1">
                    View <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
