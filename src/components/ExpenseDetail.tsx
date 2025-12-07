import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { CheckCircle, XCircle, Calendar, User, FileText, DollarSign, Tag } from "lucide-react";
import { Expense } from "./ExpenseForm";
import { format } from "date-fns";

interface ExpenseDetailProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const categoryLabels: Record<string, string> = {
  meals: "Meals & Entertainment",
  transportation: "Transportation",
  accommodation: "Accommodation",
  office: "Office Supplies",
  communication: "Communication",
  travel: "Travel",
  training: "Training & Development",
  other: "Other",
};

export function ExpenseDetail({
  expense,
  open,
  onClose,
  onApprove,
  onReject,
}: ExpenseDetailProps) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{expense.title}</span>
            <Badge variant="secondary" className={statusColors[expense.status]}>
              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start gap-4">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="text-2xl">${expense.amount.toFixed(2)}</div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div>{format(expense.date, "MMMM d, yyyy")}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Employee</div>
                  <div>{expense.employee}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div>{categoryLabels[expense.category] || expense.category}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Receipt</div>
                  <div>
                    {expense.receipt ? (
                      <a
                        href={expense.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No receipt</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {expense.description && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-sm">{expense.description}</p>
                </div>
              </>
            )}
          </div>

          {expense.status === "submitted" && onApprove && onReject && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  onReject(expense.id);
                  onClose();
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  onApprove(expense.id);
                  onClose();
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
