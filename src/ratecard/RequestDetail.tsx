import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ArrowLeft, CheckCircle, XCircle, FileText, Send, Download } from "lucide-react";
import { RequestDetails, RequestState, UserRole } from "../types";

interface RequestDetailProps {
  details: RequestDetails;
  userRole: UserRole;
  userEmail: string;
  onBack: () => void;
  onSubmit?: (id: number) => void;
  onApprove?: (id: number, note: string) => void;
  onReject?: (id: number, note: string) => void;
  onReview?: (id: number, note: string) => void;
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

export function RequestDetail({
  details,
  userRole,
  userEmail,
  onBack,
  onSubmit,
  onApprove,
  onReject,
  onReview,
}: RequestDetailProps) {
  const { request, items, events } = details;
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totals = JSON.parse(request.totals_json || "{}");
  const isOwner = request.am_email === userEmail;
  const canSubmit = userRole === "AM" && isOwner && request.state === "draft";
  const canApprove = userRole === "FD" && ["submitted", "fd_review"].includes(request.state);

  const handleAction = async (action: "submit" | "approve" | "reject" | "review") => {
    setLoading(true);
    try {
      if (action === "submit" && onSubmit) {
        await onSubmit(request.id);
      } else if (action === "approve" && onApprove) {
        await onApprove(request.id, note);
      } else if (action === "reject" && onReject) {
        await onReject(request.id, note);
      } else if (action === "review" && onReview) {
        await onReview(request.id, note);
      }
      setNote("");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    window.open(`/api/pdf/${request.id}`, "_blank");
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl" style={{ color: "#386641" }}>
            {request.name}
          </h2>
          <p className="text-sm text-muted-foreground">Quote #{request.id}</p>
        </div>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: `${stateColors[request.state]}20`,
            color: stateColors[request.state],
            borderColor: stateColors[request.state],
          }}
          className="border"
        >
          {stateLabels[request.state]}
        </Badge>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {request.project_code && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Code:</span>
              <span>{request.project_code}</span>
            </div>
          )}
          {request.client_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span>{request.client_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Manager:</span>
            <span>{request.am_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(request.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{formatDate(request.updated_at)}</span>
          </div>
          {request.notes && (
            <>
              <Separator className="my-2" />
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{request.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">₱{item.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₱{item.subtotal.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card style={{ backgroundColor: "#F2F7F2", borderColor: "#386641" }}>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₱{totals.subtotal?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12%):</span>
            <span>₱{totals.tax?.toLocaleString() || "0"}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg" style={{ color: "#D4AC0D" }}>
            <span>Grand Total:</span>
            <span>₱{totals.grand_total?.toLocaleString() || "0"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex gap-3 text-sm">
                <div className="text-muted-foreground">
                  {formatShortDate(event.at)}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{event.actor_email}</span>
                  <span className="text-muted-foreground"> {event.action}</span>
                  {event.note && (
                    <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {(canSubmit || canApprove) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {canApprove && (
              <div className="space-y-2">
                <Label htmlFor="note">Review Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note for this action..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              {canSubmit && (
                <Button
                  onClick={() => handleAction("submit")}
                  disabled={loading}
                  className="flex-1"
                  style={{ backgroundColor: "#386641" }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}

              {canApprove && (
                <>
                  {request.state === "submitted" && onReview && (
                    <Button
                      variant="outline"
                      onClick={() => handleAction("review")}
                      disabled={loading}
                      style={{ borderColor: "#8B5CF6", color: "#8B5CF6" }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleAction("reject")}
                    disabled={loading}
                    className="text-red-600 border-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction("approve")}
                    disabled={loading}
                    style={{ backgroundColor: "#10B981" }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download PDF for approved */}
      {request.state === "approved" && (
        <Alert style={{ backgroundColor: "#10B98120", borderColor: "#10B981" }}>
          <CheckCircle className="h-4 w-4" style={{ color: "#10B981" }} />
          <AlertDescription className="flex items-center justify-between">
            <span>This quote has been approved</span>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadPDF}
              style={{ borderColor: "#10B981", color: "#10B981" }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
